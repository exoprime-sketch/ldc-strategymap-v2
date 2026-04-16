import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const WEB_PORT = Number(process.env.PORT || 10000);
const INTERNAL_API_PORT = Number(process.env.INTERNAL_API_PORT || 3001);
const DIST_DIR = path.join(__dirname, "dist");
const INDEX_FILE = path.join(DIST_DIR, "index.html");

let apiReady = false;
let apiBootError = null;

const apiProcess = spawn(process.execPath, ["server_pipeline_proxy_final.js"], {
  cwd: __dirname,
  env: {
    ...process.env,
    PORT: String(INTERNAL_API_PORT),
  },
  stdio: "inherit",
});

apiProcess.on("error", (error) => {
  apiBootError = error;
  apiReady = false;
  console.error("[prod] failed to start internal api server:", error);
});

apiProcess.on("exit", (code, signal) => {
  apiReady = false;
  console.error(
    `[prod] internal api server exited (code=${code ?? "null"}, signal=${
      signal ?? "null"
    })`
  );
});

async function waitForApiReady({ retries = 40, delayMs = 500 } = {}) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const response = await fetch(
        `http://127.0.0.1:${INTERNAL_API_PORT}/health`
      );
      if (response.ok) {
        apiReady = true;
        apiBootError = null;
        console.log(
          `[prod] internal api ready at http://127.0.0.1:${INTERNAL_API_PORT}`
        );
        return true;
      }
    } catch (_) {
      // keep retrying
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  apiReady = false;
  return false;
}

function copyResponseHeaders(sourceResponse, targetResponse) {
  sourceResponse.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === "content-encoding" ||
      lower === "transfer-encoding" ||
      lower === "connection"
    ) {
      return;
    }
    targetResponse.setHeader(key, value);
  });
}

async function proxyToInternalApi(req, res) {
  if (!apiReady) {
    const recovered = await waitForApiReady({ retries: 3, delayMs: 300 });
    if (!recovered) {
      return res.status(503).json({
        ok: false,
        message: "내부 API 서버가 아직 준비되지 않았습니다.",
      });
    }
  }

  const targetUrl = `http://127.0.0.1:${INTERNAL_API_PORT}${req.originalUrl}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        accept: req.headers.accept || "*/*",
      },
    });

    copyResponseHeaders(upstream, res);
    res.status(upstream.status);

    const contentType = upstream.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await upstream.json();
      return res.json(json);
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.send(buffer);
  } catch (error) {
    apiReady = false;
    return res.status(502).json({
      ok: false,
      message: "내부 API 프록시 처리 중 오류가 발생했습니다.",
      error: String(error?.message || error),
    });
  }
}

app.disable("x-powered-by");

app.use("/api", proxyToInternalApi);

app.get("/health", async (_req, res) => {
  try {
    const upstream = await fetch(
      `http://127.0.0.1:${INTERNAL_API_PORT}/health`
    );
    if (!upstream.ok) {
      apiReady = false;
      return res.status(503).json({
        ok: false,
        web: "up",
        api: "down",
      });
    }

    const json = await upstream.json();
    apiReady = true;

    return res.json({
      ok: true,
      web: "up",
      api: "up",
      internal: json,
    });
  } catch (error) {
    apiReady = false;
    return res.status(503).json({
      ok: false,
      web: "up",
      api: "down",
      error: String(error?.message || error),
    });
  }
});

app.use(
  express.static(DIST_DIR, {
    index: false,
    maxAge: "1h",
  })
);

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ ok: false, message: "Not found" });
  }
  return res.sendFile(INDEX_FILE);
});

const server = app.listen(WEB_PORT, async () => {
  console.log(`[prod] web server listening on http://0.0.0.0:${WEB_PORT}`);
  await waitForApiReady();
});

function shutdown(signal) {
  console.log(`[prod] received ${signal}, shutting down...`);

  server.close(() => {
    if (apiProcess && !apiProcess.killed) {
      apiProcess.kill("SIGTERM");
    }
    process.exit(0);
  });

  setTimeout(() => {
    if (apiProcess && !apiProcess.killed) {
      apiProcess.kill("SIGKILL");
    }
    process.exit(1);
  }, 8000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
