import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const whitelistPath = path.join(
  __dirname,
  "official_link_whitelist_asean.json"
);
const OFFICIAL_LINKS = JSON.parse(fs.readFileSync(whitelistPath, "utf-8"));
const KNOWN_ISO2 = new Set(
  (OFFICIAL_LINKS?.meta?.countries || []).map((item) =>
    String(item || "").toUpperCase()
  )
);

const app = express();
const PORT = Number(process.env.PORT || 3001);
const cache = new Map();
const now = () => new Date().toISOString();

function cacheGet(key, force = false) {
  if (force) return null;
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}
function cacheSet(key, value, ttlMs) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function pickIso2(req) {
  const c = String(req.query.country || req.query.iso2 || "")
    .toUpperCase()
    .trim();
  const aliasMap = {
    VNM: "VN",
    KHM: "KH",
    LAO: "LA",
    MEX: "MX",
    KEN: "KE",
    CHL: "CL",
    FJI: "FJ",
    BRA: "BR",
    GHA: "GH",
    SEN: "SN",
  };
  const normalized = aliasMap[c] || c;
  if (KNOWN_ISO2.has(normalized)) return normalized;
  return "VN";
}
function iso2ToWbIso2(iso2) {
  return String(iso2 || "VN").toLowerCase();
}
function asArrayEntries(obj = {}, group = "") {
  return Object.entries(obj || {}).map(([key, value]) => ({
    key,
    url: typeof value === "string" ? value : value?.url || "",
    label: typeof value === "object" && value?.label ? value.label : key,
    group,
  }));
}
async function fetchJson(url, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "climate-tech-platform/1.2" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}
async function wbCountryMeta(iso2) {
  const url = `https://api.worldbank.org/v2/country/${iso2ToWbIso2(
    iso2
  )}?format=json`;
  const data = await fetchJson(url);
  const item =
    Array.isArray(data) && Array.isArray(data[1]) ? data[1][0] : null;
  if (!item) return null;
  return {
    id: item.id,
    iso2Code: item.iso2Code,
    name: item.name,
    region: item.region?.value || "",
    incomeLevel: item.incomeLevel?.value || "",
    capitalCity: item.capitalCity || "",
    longitude: item.longitude || null,
    latitude: item.latitude || null,
    sourceUrl: url,
  };
}
async function wbIndicatorLatest(iso2, indicator) {
  const url = `https://api.worldbank.org/v2/country/${iso2ToWbIso2(
    iso2
  )}/indicator/${encodeURIComponent(indicator)}?format=json&per_page=70`;
  const data = await fetchJson(url);
  const rows = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
  const latest = rows.find((row) => row && row.value != null);
  if (!latest) return null;
  return {
    indicator: latest.indicator?.value || indicator,
    indicatorCode: indicator,
    year: latest.date,
    value: latest.value,
    sourceUrl: url,
  };
}
async function wbDocsSearch(query, iso2) {
  const url = `https://search.worldbank.org/api/v3/wds?format=json&qterm=${encodeURIComponent(
    query
  )}&fl=docdt,country,display_title,doc_url`;
  const data = await fetchJson(url);
  const docs = data?.documents ? Object.values(data.documents) : [];
  return docs
    .filter((doc) => {
      const country = String(doc?.country || "").toLowerCase();
      return !iso2 || country.includes(iso2ToWbIso2(iso2));
    })
    .slice(0, 8)
    .map((doc) => ({
      title: doc.display_title || "World Bank document",
      date: doc.docdt || "",
      url: doc.doc_url,
      source: "World Bank Documents & Reports",
      type: "document",
    }));
}
function getCountryLinks(iso2) {
  return OFFICIAL_LINKS?.[iso2] || {};
}
function buildCuratedDocuments(iso2) {
  const links = getCountryLinks(iso2);
  const groups = [
    ...asArrayEntries(links.country, "country"),
    ...asArrayEntries(links.documents, "documents"),
    ...asArrayEntries(links.projects, "projects"),
    ...asArrayEntries(links.data, "data"),
  ];
  return groups
    .filter((item) => item.url)
    .map((item) => ({
      title:
        item.group === "projects"
          ? `공개 프로젝트 근거 · ${item.label}`
          : item.group === "documents"
          ? `공식 문서 · ${item.label}`
          : item.group === "data"
          ? `국가 지표 · ${item.label}`
          : `공식 국가 포털 · ${item.label}`,
      url: item.url,
      source:
        item.group === "projects"
          ? "Official project page"
          : item.group === "documents"
          ? "Official document"
          : item.group === "data"
          ? "Official data page"
          : "Official portal",
      type: item.group,
    }));
}
function buildPartnerRegistry(iso2, region = "") {
  const links = getCountryLinks(iso2);
  const regionLower = String(region || "").toLowerCase();
  const partnerRows = asArrayEntries(links.partners, "partners").map(
    ({ key, url }) => ({
      name: key,
      type: "partner",
      url,
    })
  );
  const provinceRows = asArrayEntries(links.provinces, "provinces")
    .filter(
      ({ key }) =>
        !regionLower ||
        key.toLowerCase().includes(regionLower.split(" ")[0] || "")
    )
    .map(({ key, url }) => ({
      name: key,
      type: "province-portal",
      url,
    }));
  return [...partnerRows, ...provinceRows];
}
function buildBenchmarkLibrary() {
  const global = OFFICIAL_LINKS?.global || {};
  return [
    {
      key: "wb-cckp",
      label: "World Bank Climate Change Knowledge Portal",
      href: global.worldBankClimateKnowledgePortal || null,
      type: "country-profile-data-hub",
      resources: [
        global.worldBankClimateKnowledgePortalExplore,
        global.worldBankClimateKnowledgePortalCountryProfiles,
        global.worldBankClimateKnowledgePortalDownload,
      ].filter(Boolean),
    },
    {
      key: "wb-data360",
      label: "World Bank Data360",
      href: global.worldBankData360 || null,
      type: "one-stop-shop-data-hub",
      resources: [global.worldBankData360].filter(Boolean),
    },
    {
      key: "nd-gain",
      label: "ND-GAIN Country Index",
      href: global.ndGainCountryIndex || null,
      type: "readiness-risk-index",
      resources: [global.ndGainCountryIndex].filter(Boolean),
    },
    {
      key: "thinkhazard",
      label: "ThinkHazard!",
      href: global.thinkHazard || null,
      type: "location-risk-screening",
      resources: [global.thinkHazard, global.thinkHazardFaq].filter(Boolean),
    },
    {
      key: "climate-watch",
      label: "Climate Watch",
      href: global.climateWatchCompareTargets || global.climateWatch || null,
      type: "country-compare-download",
      resources: [
        global.climateWatchCompareTargets,
        global.climateWatchCustomCompare,
      ].filter(Boolean),
    },
    {
      key: "gcf-odl",
      label: "GCF Open Data Library",
      href: global.gcfDataPortal || null,
      type: "country-project-readiness",
      resources: [
        global.gcfCountriesDatabase,
        global.gcfProjectsDatabase,
        global.gcfReadinessDatabase,
      ].filter(Boolean),
    },
    {
      key: "tt-clear",
      label: "UNFCCC TT:CLEAR",
      href: global.ttClear || null,
      type: "technology-document-hub",
      resources: [global.ttClearAbout, global.ttClearNegotiations].filter(
        Boolean
      ),
    },
    {
      key: "global-solar-atlas",
      label: "Global Solar Atlas",
      href: global.globalSolarAtlas || null,
      type: "map-layer-download",
      resources: [global.globalSolarAtlas].filter(Boolean),
    },
    {
      key: "global-wind-atlas",
      label: "Global Wind Atlas",
      href: global.globalWindAtlas || null,
      type: "map-layer-download",
      resources: [global.globalWindAtlas].filter(Boolean),
    },
    {
      key: "irena-global-atlas",
      label: "IRENA Global Atlas",
      href: global.irenaGlobalAtlas || null,
      type: "renewable-resource-map",
      resources: [
        global.irenaGlobalAtlas,
        global.irenaGlobalAtlasOverview,
      ].filter(Boolean),
    },
  ].filter((item) => item.href);
}
async function fetchNasaPower(lat, lon) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon)))
    return null;
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,T2M&community=RE&longitude=${encodeURIComponent(
    lon
  )}&latitude=${encodeURIComponent(lat)}&format=JSON`;
  const json = await fetchJson(url, 15000);
  const params = json?.properties?.parameter || {};
  return {
    ghiAnn: params?.ALLSKY_SFC_SW_DWN?.ANN ?? null,
    t2mAnn: params?.T2M?.ANN ?? null,
    sourceUrl: url,
  };
}

app.use((_, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.get("/api/pipeline/v1/summary", async (req, res) => {
  const iso2 = pickIso2(req);
  const force = String(req.query.force || "0") === "1";
  const key = `summary:${iso2}`;
  const cached = cacheGet(key, force);
  if (cached) return res.json(cached);
  try {
    const [meta, population, gdpPc, electricityAccess] = await Promise.all([
      wbCountryMeta(iso2),
      wbIndicatorLatest(iso2, "SP.POP.TOTL"),
      wbIndicatorLatest(iso2, "NY.GDP.PCAP.CD"),
      wbIndicatorLatest(iso2, "EG.ELC.ACCS.ZS"),
    ]);
    const out = {
      fetchedAt: now(),
      country: iso2,
      worldBank: {
        meta,
        indicators: {
          population,
          gdpPerCapitaCurrentUSD: gdpPc,
          electricityAccess,
        },
      },
      verifiedPortals: getCountryLinks(iso2).country || {},
    };
    cacheSet(key, out, 6 * 60 * 60 * 1000);
    res.json(out);
  } catch (error) {
    res.status(200).json({
      fetchedAt: now(),
      country: iso2,
      error: String(error?.message || error),
      verifiedPortals: getCountryLinks(iso2).country || {},
    });
  }
});

app.get("/api/live/v1/country-dashboard", async (req, res) => {
  const iso2 = pickIso2(req);
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  const force = String(req.query.force || "0") === "1";
  const key = `live:${iso2}:${Number.isFinite(lat) ? lat.toFixed(3) : "na"}:${
    Number.isFinite(lon) ? lon.toFixed(3) : "na"
  }`;
  const cached = cacheGet(key, force);
  if (cached) return res.json(cached);
  const links = getCountryLinks(iso2);
  try {
    const [
      meta,
      population,
      gdp,
      electricityAccess,
      renewableEnergy,
      co2Emissions,
      urbanization,
      nasaPower,
    ] = await Promise.allSettled([
      wbCountryMeta(iso2),
      wbIndicatorLatest(iso2, "SP.POP.TOTL"),
      wbIndicatorLatest(iso2, "NY.GDP.MKTP.CD"),
      wbIndicatorLatest(iso2, "EG.ELC.ACCS.ZS"),
      wbIndicatorLatest(iso2, "EG.FEC.RNEW.ZS"),
      wbIndicatorLatest(iso2, "EN.ATM.CO2E.KT"),
      wbIndicatorLatest(iso2, "SP.URB.TOTL.IN.ZS"),
      fetchNasaPower(lat, lon),
    ]);
    const out = {
      fetchedAt: now(),
      sourceMode: "same-origin-live",
      cachePolicy: force ? "force-refresh" : "6h memory-cache",
      worldBank: {
        meta: meta.status === "fulfilled" ? meta.value : null,
        gdp: gdp.status === "fulfilled" ? gdp.value : null,
        population: population.status === "fulfilled" ? population.value : null,
        electricityAccess:
          electricityAccess.status === "fulfilled"
            ? electricityAccess.value
            : null,
        renewableEnergy:
          renewableEnergy.status === "fulfilled" ? renewableEnergy.value : null,
        co2Emissions:
          co2Emissions.status === "fulfilled" ? co2Emissions.value : null,
        urbanization:
          urbanization.status === "fulfilled" ? urbanization.value : null,
      },
      nasaPower: nasaPower.status === "fulfilled" ? nasaPower.value : null,
      reverseGeo: null,
      officialLinks: {
        country: links.country || {},
        documents: links.documents || {},
        projects: links.projects || {},
        data: links.data || {},
      },
      coverage: {
        hasWorldBankMeta: meta.status === "fulfilled" && !!meta.value,
        hasNasaPower: nasaPower.status === "fulfilled" && !!nasaPower.value,
      },
    };
    cacheSet(key, out, 6 * 60 * 60 * 1000);
    res.json(out);
  } catch (error) {
    res.status(200).json({
      fetchedAt: now(),
      sourceMode: "fallback",
      cachePolicy: "verified-links-only",
      worldBank: {
        meta: null,
        gdp: null,
        population: null,
        electricityAccess: null,
        renewableEnergy: null,
        co2Emissions: null,
        urbanization: null,
      },
      nasaPower: null,
      reverseGeo: null,
      officialLinks: {
        country: links.country || {},
        documents: links.documents || {},
        projects: links.projects || {},
        data: links.data || {},
      },
      coverage: {
        hasWorldBankMeta: false,
        hasNasaPower: false,
      },
      isFallback: true,
      error: String(error?.message || error),
    });
  }
});

app.get("/api/pipeline/v1/projects", async (req, res) => {
  const iso2 = pickIso2(req);
  const region = String(req.query.region || "");
  const theme = String(req.query.theme || "");
  const force = String(req.query.force || "0") === "1";
  const key = `projects:${iso2}:${region}:${theme}`;
  const cached = cacheGet(key, force);
  if (cached) return res.json(cached);

  try {
    const wbDocs = await wbDocsSearch(
      [theme, region, iso2].filter(Boolean).join(" ") || "climate adaptation",
      iso2
    );
    const curated = buildCuratedDocuments(iso2)
      .filter(
        (item) =>
          item.type === "projects" ||
          item.type === "documents" ||
          item.type === "country"
      )
      .slice(0, 8)
      .map((item) => ({
        source: item.source,
        type: item.type,
        title: item.title,
        stage: item.type === "projects" ? "Portfolio" : "Reference",
        amountUSD: null,
        link: item.url,
        portalLink: item.url,
        themeTags: [theme].filter(Boolean),
        evidence: [item.source],
      }));

    const docsAsProjects = wbDocs.map((doc) => ({
      source: doc.source,
      type: "Document signal",
      title: doc.title,
      stage: "Knowledge/Preparation",
      amountUSD: null,
      link: doc.url,
      portalLink: getCountryLinks(iso2)?.country?.worldBankData || null,
      themeTags: [theme].filter(Boolean),
      evidence: [doc.source],
      lastUpdated: doc.date || "",
    }));

    const projects = [...docsAsProjects, ...curated];
    const out = {
      fetchedAt: now(),
      summary: {
        country: iso2,
        region,
        theme,
        total: projects.length,
        note: projects.length
          ? "공식 API 문서 신호와 검증된 국가별 링크를 함께 제공합니다."
          : "조회 결과가 적어 검증된 국가별 링크 중심으로 표시합니다.",
      },
      projects,
      verifiedPortals: getCountryLinks(iso2).country || {},
      dataQuality: {
        note: "World Bank는 공식 API 기반, 나머지는 검증된 국가별 공식 포털 또는 문서 링크 기반으로 제공합니다.",
      },
    };
    cacheSet(key, out, 60 * 60 * 1000);
    res.json(out);
  } catch (error) {
    res.status(200).json({
      fetchedAt: now(),
      summary: { country: iso2, region, theme, total: 0 },
      projects: buildCuratedDocuments(iso2)
        .slice(0, 8)
        .map((item) => ({
          source: item.source,
          type: item.type,
          title: item.title,
          stage: "Fallback",
          amountUSD: null,
          link: item.url,
          portalLink: item.url,
          themeTags: [theme].filter(Boolean),
          evidence: ["Verified official link"],
        })),
      error: String(error?.message || error),
      isFallback: true,
      verifiedPortals: getCountryLinks(iso2).country || {},
    });
  }
});

app.get("/api/country/v1/profile", async (req, res) => {
  const iso2 = pickIso2(req);
  const force = String(req.query.force || "0") === "1";
  const key = `profile:${iso2}`;
  const cached = cacheGet(key, force);
  if (cached) return res.json(cached);
  try {
    const [meta, population, gdpPc] = await Promise.all([
      wbCountryMeta(iso2),
      wbIndicatorLatest(iso2, "SP.POP.TOTL"),
      wbIndicatorLatest(iso2, "NY.GDP.PCAP.CD"),
    ]);
    const out = {
      fetchedAt: now(),
      country: iso2,
      profile: {
        meta,
        population,
        gdpPerCapitaCurrentUSD: gdpPc,
        verifiedPortals: getCountryLinks(iso2).country || {},
        officialDocumentLinks: getCountryLinks(iso2).documents || {},
        officialProjectLinks: getCountryLinks(iso2).projects || {},
        officialDataLinks: getCountryLinks(iso2).data || {},
        benchmarkLibrary: buildBenchmarkLibrary(),
      },
    };
    cacheSet(key, out, 6 * 60 * 60 * 1000);
    res.json(out);
  } catch (error) {
    res.status(200).json({
      fetchedAt: now(),
      country: iso2,
      error: String(error?.message || error),
      profile: {
        verifiedPortals: getCountryLinks(iso2).country || {},
        officialDocumentLinks: getCountryLinks(iso2).documents || {},
        officialProjectLinks: getCountryLinks(iso2).projects || {},
        officialDataLinks: getCountryLinks(iso2).data || {},
        benchmarkLibrary: buildBenchmarkLibrary(),
      },
    });
  }
});

app.get("/api/sources/v1/documents", async (req, res) => {
  const iso2 = pickIso2(req);
  const force = String(req.query.force || "0") === "1";
  const key = `documents:${iso2}`;
  const cached = cacheGet(key, force);
  if (cached) return res.json(cached);
  try {
    const docs = [
      ...buildCuratedDocuments(iso2),
      ...(await wbDocsSearch(`${iso2} climate`, iso2)),
    ];
    const unique = [];
    const seen = new Set();
    for (const item of docs) {
      const url = String(item.url || "");
      if (!url || seen.has(url)) continue;
      seen.add(url);
      unique.push(item);
    }
    const out = {
      fetchedAt: now(),
      country: iso2,
      total: unique.length,
      documents: unique,
    };
    cacheSet(key, out, 3 * 60 * 60 * 1000);
    res.json(out);
  } catch (error) {
    res.status(200).json({
      fetchedAt: now(),
      country: iso2,
      error: String(error?.message || error),
      total: buildCuratedDocuments(iso2).length,
      documents: buildCuratedDocuments(iso2),
      isFallback: true,
    });
  }
});

app.get("/api/partners/v1/registry", (req, res) => {
  const iso2 = pickIso2(req);
  const region = String(req.query.region || "");
  const partners = buildPartnerRegistry(iso2, region);
  res.json({
    fetchedAt: now(),
    country: iso2,
    region,
    total: partners.length,
    partners,
    isFallback: true,
    note: "현재는 검증된 국가별 공식 포털 기반 파트너 레지스트리입니다. 기관 메타데이터 확장은 후속 단계에서 추가할 수 있습니다.",
  });
});

app.get("/api/benchmarks/v1/platforms", (_, res) => {
  res.json({
    fetchedAt: now(),
    total: buildBenchmarkLibrary().length,
    benchmarks: buildBenchmarkLibrary(),
  });
});

app.get("/health", (_, res) => res.json({ ok: true, at: now() }));

app.listen(PORT, () => {
  console.log(`[proxy] listening on http://127.0.0.1:${PORT}`);
});
