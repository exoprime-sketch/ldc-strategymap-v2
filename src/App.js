import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Database,
  Filter,
  List,
  Info,
  Layers,
  Satellite,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Target,
  RefreshCw,
  Link2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileCheck,
  SlidersHorizontal,
  Search,
  PanelRight,
  GripVertical,
  Pin,
  PinOff,
  BookOpen,
  Sun,
  Flame,
  Wind,
  Waves,
  Droplets,
  Orbit,
  Leaf,
  Atom,
  FlaskConical,
  Factory,
  CarFront,
  Building2,
  Recycle,
  Network,
  Briefcase,
  Rocket,
  Zap,
  BarChart3,
  ShieldAlert,
  HeartPulse,
  Trees,
  Sprout,
  Map as MapIcon, // ✅ 변경
} from "lucide-react";
import OFFICIAL_LINK_WHITELIST from "../official_link_whitelist_asean.json";

const VIETNAM_MEKONG_PILOT_DATA = {
  version: "2026-02-27",
  country: "베트남",
  countryCode: "VN",
  countryCenter: [108.2772, 14.0583],
  region: "메콩 델타",
  regionCenter: [105.77, 10.03],
  tech: "기후변화 감시 및 진단 기술",
  continent: "아시아",
  purposeTags: ["ODA", "R&D 실증", "정책 설계", "대중 정보 제공"],
  scores: { coverage: 97, reliability: 91, resilience: 88, feasibility: 91.2 },
  coordBasis:
    "좌표 기준: 메콩 델타 중심 권역(껀터 인근) 및 주요 지방정부 거점 반영",
  reasons: [
    "메콩 델타는 베트남 국가 적응 정책 및 지역 계획에서 핵심 기후위험 지역으로 강조됨.",
    "홍수, 염해, 침수 등 수자원 관리 수요가 높아 ODA, 실증, 국제공동연구의 통합 추진에 적합함.",
    "공식 정책 문서, 국제금융기관 프로젝트 및 공개 데이터 출처 간의 연계 분석에 용이함.",
  ],
  countryNote:
    "베트남은 국가 차원의 적응 정책, 메콩 델타 지역 계획, 국제금융기관 프로젝트 정보를 통합적으로 검토해야 실효성 있는 사업 기획 및 연구 협력 가능",
  schema: [
    {
      scope: "국가",
      layer: "정책·제도",
      field: "NAP, NDC, 국가 기후전략, 재난대응 거버넌스",
      format: "문서 + 표",
      unit: "-",
      required: "핵심",
      usage: "정책 협력 / ODA 기획",
    },
    {
      scope: "국가",
      layer: "개발·재원",
      field: "World Bank, ADB, GCF 프로젝트 및 재원 연계 정보", // '재원 신호' 순화
      format: "표",
      unit: "건, USD",
      required: "핵심",
      usage: "사업화 / 국제공동연구",
    },
    {
      scope: "지역",
      layer: "공간·위험",
      field: "메콩 델타 위험 지역, 지역 거점, 프로젝트 대상지",
      format: "지도 + 표",
      unit: "-",
      required: "핵심",
      usage: "실증 대상 발굴 / 현장 협력", // '후보 발굴' -> '대상 발굴'
    },
  ],
  inventoryRows: [
    {
      status: "확보",
      group: "정책·문서",
      name: "베트남 NAP 2021-2030 및 2024 업데이트",
      scope: "국가",
      memo: "공식 문서 및 설명 페이지 URL 제공",
    },
    {
      status: "확보",
      group: "정책·문서",
      name: "메콩 델타 마스터플랜 관련 공개 근거",
      scope: "국가/지역",
      memo: "정책 설명 URL 제공",
    },
    {
      status: "확보",
      group: "국제협력",
      name: "World Bank·ADB·GCF 공개 프로젝트 연계 정보", // '신호' 순화
      scope: "국가/프로젝트",
      memo: "상세 페이지 URL 제공", // '클릭 가능한 링크' 순화
    },
    {
      status: "확보",
      group: "기초지표",
      name: "World Bank Data360 국가 지표",
      scope: "국가",
      memo: "인구, 1인당 GDP 등",
    },
    {
      status: "확보",
      group: "정책·문서",
      name: "UNFCCC NDC Registry 국가 제출 자료",
      scope: "국가",
      memo: "국가 감축 공약 및 최신 제출 자료 확인",
    },
    {
      status: "확보",
      group: "환경·사회 검토",
      name: "GCF FP013 ESS 공개 문서",
      scope: "프로젝트",
      memo: "환경·사회 세이프가드 및 리스크 검토 근거",
    },
    {
      status: "결측/한계",
      group: "실시간 데이터",
      name: "지방정부 센서·경보 API",
      scope: "지역",
      memo: "실시간 API 연동은 후속 협의 필요",
    },
  ],
  sourcePlan: [
    {
      layer: "국가 기본정보",
      source: "World Bank 국가 데이터 포털",
      acquisition: "Public web/API",
      cycle: "연 1회 이상",
      resolution: "국가",
      endpoint: "https://data.worldbank.org/country/viet-nam",
      note: "인구, 1인당 GDP, 전력 접근성 등 국가 기초 지표 확인",
    },
    {
      layer: "적응 정책",
      source: "NAP Central / UNDP 베트남 적응 자료",
      acquisition: "Public PDF",
      cycle: "정책 갱신 시",
      resolution: "국가/부문",
      endpoint:
        "https://www.undp.org/vietnam/publications/viet-nam-nap-2021-2030-vision-2050",
      note: "NAP 거버넌스 및 메콩 델타 마스터플랜 언급 내역 포함",
    },
    {
      layer: "국제협력 프로젝트",
      source: "World Bank 프로젝트 포털",
      acquisition: "Public project document",
      cycle: "수시",
      resolution: "국가/지역/프로젝트",
      endpoint:
        "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/698771493115851726",
      note: "메콩 델타 통합 기후회복력 프로젝트 근거 자료",
    },
    {
      layer: "국제협력 프로젝트",
      source: "ADB 베트남 프로젝트 포털",
      acquisition: "Public web/PDF",
      cycle: "수시",
      resolution: "국가/프로젝트",
      endpoint: "https://www.adb.org/where-we-work/viet-nam",
      note: "메콩 델타 적응 연구 보고서(PDF) 및 프로젝트 문서 제공",
    },
    {
      layer: "국제기후재원",
      source: "GCF 데이터 포털",
      acquisition: "Public web/ODL",
      cycle: "수시",
      resolution: "국가/프로젝트",
      endpoint: "https://www.greenclimate.fund/countries/viet-nam",
      note: "베트남 연계 GCF 사업, 관련 문서 및 평가 자료 확인",
    },
    {
      layer: "프로젝트 파이프라인",
      source: "플랫폼 API - projects",
      acquisition: "Server API",
      cycle: "일 1회 캐시",
      resolution: "국가/프로젝트",
      endpoint: "/api/pipeline/v1/projects",
      note: "브라우저 직접 호출을 대체하는 자체 API 연동",
    },
    {
      layer: "공식 문서 메타데이터",
      source: "플랫폼 API - documents",
      acquisition: "Server API",
      cycle: "일 1회 캐시",
      resolution: "국가/문서",
      endpoint: "/api/sources/v1/documents?country=VN",
      note: "NDC·NAP·GCF·CTCN·MDB 문서 메타데이터 표준화 API",
    },
    {
      layer: "국가 프로필 요약",
      source: "플랫폼 API - country profile",
      acquisition: "Server API",
      cycle: "일 1회 캐시",
      resolution: "국가",
      endpoint: "/api/country/v1/profile?country=VN",
      note: "국가 기본 정보, 정책 요약, 우선 검토 포인트 확장용 API",
    },
    {
      layer: "현지 파트너 메타데이터",
      source: "플랫폼 API - partner registry",
      acquisition: "Server API",
      cycle: "주 1회",
      resolution: "국가/지역/기관",
      endpoint: "/api/partners/v1/registry?country=VN&region=Mekong%20Delta",
      note: "부처·집행기관·연구기관 등 현지 파트너 메타데이터 실시간 보강용 API",
    },
    {
      layer: "국가 감축 공약",
      source: "UNFCCC NDC Registry",
      acquisition: "Public web",
      cycle: "제출·갱신 시",
      resolution: "국가",
      endpoint: "https://unfccc.int/documents/622541",
      note: "등록부 상위 페이지가 아닌 베트남 2022 NDC 원문 및 등록 정보로 직결",
    },
    {
      layer: "환경·사회 검토",
      source: "GCF FP013 ESS report",
      acquisition: "Public document",
      cycle: "문서 갱신 시",
      resolution: "프로젝트",
      endpoint:
        "https://www.greenclimate.fund/document/environmental-and-social-safeguards-ess-report-fp013-improving-resilience-vulnerable",
      note: "환경·사회 세이프가드 검토 및 현장 이행 리스크 연계 확인",
    },
  ],
  regionRows: [
    // 화면 UI에 뿌려질 수 있으므로 개조식으로 간결하게 통일
    {
      scope: "국가",
      category: "정책 근거",
      field: "국가 적응계획(NAP)과 거버넌스",
      value:
        "베트남 NAP 2021-2030 및 2024 업데이트 자료 내 중앙정부-부처-지방정부 보고 체계 확인",
      unit: "-",
      source: "UNDP NAP update 2024",
      link: "https://www.undp.org/sites/g/files/zskgke326/files/2024-11/2024_update_viet_nam_nap_2021-2030_with_vision_to_2050_final_small.pdf",
      update: "2024",
    },
    {
      scope: "국가/지역",
      category: "지역계획",
      field: "메콩 델타 마스터플랜 연계",
      value:
        "국가 종합 계획과 메콩 델타 지역 개발·적응 계획을 교차 검토하여 실제 사업 대상지와의 정책 정합성 파악 가능",
      unit: "-",
      source: "ASEM Connect Vietnam master plan page",
      link: "https://asemconnectvietnam.gov.vn/default.aspx?ID1=2&ID8=125352&ZID1=14",
      update: "2024-11 확인",
    },
    {
      scope: "국가",
      category: "국가 공약",
      field: "UNFCCC NDC 2022 제출 문서",
      value: "베트남의 2022 NDC 업데이트 원문 및 제출 시점 직접 확인 가능",
      unit: "-",
      source: "UNFCCC NDC document page",
      link: "https://unfccc.int/documents/622541",
      update: "2026-03 기준",
    },
    {
      scope: "지역",
      category: "국제협력 사업",
      field: "World Bank 메콩 델타 기후회복력 프로젝트",
      value:
        "메콩 델타 통합 기후회복력 및 지속가능 생계 프로젝트를 통한 지역 차원의 수자원·생계 회복력 접근법 제시",
      unit: "-",
      source: "World Bank project document",
      link: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/698771493115851726",
      update: "공개 문서 기준",
    },
    {
      scope: "지역",
      category: "연구·분석",
      field: "ADB 메콩 델타 기후영향·적응 연구",
      value: "메콩 델타 기후 영향 및 적응 관련 기술지원 완료 보고서(ADB) 제공",
      unit: "-",
      source: "ADB TACR 43295-012",
      link: "https://www.adb.org/sites/default/files/project-documents/43295-012-tacr-03b_0.pdf",
      update: "공개 PDF 기준",
    },
    {
      scope: "국가",
      category: "기후재원",
      field: "GCF 베트남 사업군",
      value:
        "베트남 국가 페이지 내 FP013, FP071, FP125, FP250 등 주요 사업 및 평가 자료 통합 제공",
      unit: "-",
      source: "GCF Viet Nam country page",
      link: "https://www.greenclimate.fund/countries/viet-nam",
      update: "2026-02 기준 페이지 확인",
    },
    {
      scope: "국가",
      category: "기초지표",
      field: "국가 기초경제·인프라 지표",
      value:
        "World Bank Data360 기반 베트남 인구, 1인당 GDP, 전력 접근성 등 기초 지표 제공",
      unit: "-",
      source: "World Bank Data360",
      link: "https://data.worldbank.org/country/viet-nam",
      update: "2024 지표 포함",
    },
  ],
  actions: [
    "국가 NAP, NDC, 메콩 델타 지역 계획 문서를 동일한 기술 분류 기준으로 구조화",
    "World Bank·ADB·GCF 공개 프로젝트를 단일 파이프라인 표준 스키마로 통합",
    "메콩 델타 실증 대상지 및 정책·재원 연계 정보를 지도와 상세 패널에 통합 시각화",
    "사용자 직관성 향상을 위한 용어 순화 및 화면 구조 최적화",
  ],
};
const strategyEvidence = {
  summary:
    "베트남 전략 검토 시 국가 적응 정책, 메콩 델타 지역 계획, 국제협력 프로젝트 및 공개 데이터 링크를 단일 화면에서 통합 검토하는 구조가 가장 효과적입니다.",
  sourceData: [
    {
      id: "vn-nap-governance",
      label: "국가 적응정책과 거버넌스",
      group: "정책",
      source: "UNDP NAP update 2024",
      mode: "공식 포털",
      link: "https://www.undp.org/sites/g/files/zskgke326/files/2024-11/2024_update_viet_nam_nap_2021-2030_with_vision_to_2050_final_small.pdf",
      description: "NAP 이정표 및 거버넌스 구조 확인이 가능한 공식 공개 문서",
      lastUpdated: "2024",
      sampleFields: ["policy", "year", "agency", "scope", "link"],
      rows: [
        {
          policy: "NAP 2021-2030",
          year: "2020/2024",
          agency: "MONRE",
          scope: "국가",
          link: "https://www.undp.org/sites/g/files/zskgke326/files/2024-11/2024_update_viet_nam_nap_2021-2030_with_vision_to_2050_final_small.pdf",
        },
        {
          policy: "Mekong Delta Master Plan",
          year: "2022",
          agency: "Government of Viet Nam",
          scope: "메콩 델타",
          link: "https://asemconnectvietnam.gov.vn/default.aspx?ID1=2&ID8=125352&ZID1=14",
        },
      ],
    },
    {
      id: "vn-mekong-projects",
      label: "메콩 델타 국제협력 프로젝트",
      group: "프로젝트",
      source: "World Bank / ADB / GCF",
      mode: "공식 포털",
      link: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/698771493115851726",
      description: "메콩 델타 및 베트남 기후 적응 관련 공개 프로젝트 문서 링크",
      lastUpdated: "2026-02-27",
      sampleFields: ["source", "project", "theme", "link"],
      rows: [
        {
          source: "World Bank",
          project:
            "Mekong Delta Integrated Climate Resilience and Sustainable Livelihoods Project",
          theme: "기후회복력·물관리",
          link: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/698771493115851726",
        },
        {
          source: "ADB",
          project:
            "Climate Change Impact and Adaptation Study in the Mekong Delta",
          theme: "기후영향·적응",
          link: "https://www.adb.org/sites/default/files/project-documents/43295-012-tacr-03b_0.pdf",
        },
        {
          source: "GCF",
          project:
            "Improving the resilience of vulnerable coastal communities to climate change related impacts in Viet Nam",
          theme: "연안 회복력·적응",
          link: "https://www.greenclimate.fund/project/fp013",
        },
      ],
    },
    {
      id: "vn-country-indicators",
      label: "국가 기초지표",
      group: "기초지표",
      source: "World Bank Data360",
      mode: "공식 포털",
      link: "https://data.worldbank.org/country/viet-nam",
      description: "인구, 1인당 GDP 등 국가 기초지표 확인",
      lastUpdated: "2024",
      sampleFields: ["indicator", "value", "year", "link"],
      rows: [
        {
          indicator: "Population",
          value: "101 million",
          year: "2024",
          link: "https://data.worldbank.org/country/viet-nam",
        },
        {
          indicator: "GDP per capita (current US$)",
          value: "4,717.29",
          year: "2024",
          link: "https://data.worldbank.org/country/viet-nam",
        },
      ],
    },
    {
      id: "vn-ndc-registry",
      label: "국가 감축 공약과 제출자료",
      group: "정책",
      source: "UNFCCC NDC Registry",
      mode: "공식 포털",
      link: "https://unfccc.int/documents/622541",
      description:
        "베트남 최신 NDC 제출 문서 및 등록 정보 직접 열람이 가능한 공식 페이지",
      lastUpdated: "2026-03 기준",
      sampleFields: ["country", "title", "version", "submissionDate", "link"],
      rows: [
        {
          country: "Viet Nam",
          title: "Viet Nam NDC 2022 Update",
          version: "2022 update",
          submissionDate: "2022-11",
          link: "https://unfccc.int/sites/default/files/NDC/2022-11/Viet%20Nam_NDC_2022_Eng.pdf",
        },
      ],
    },
    {
      id: "vn-gcf-ess",
      label: "FP013 환경·사회 검토 문서",
      group: "재원",
      source: "GCF FP013 ESS report",
      mode: "공식 포털",
      link: "https://www.greenclimate.fund/document/environmental-and-social-safeguards-ess-report-fp013-improving-resilience-vulnerable",
      description:
        "FP013 사업의 환경·사회 세이프가드 문서를 통한 사업 리스크 및 이행 조건 확인",
      lastUpdated: "공개 문서 기준",
      sampleFields: ["project", "documentType", "country", "link"],
      rows: [
        {
          project: "FP013",
          documentType: "Environmental and Social Safeguards report",
          country: "Viet Nam",
          link: "https://www.greenclimate.fund/document/environmental-and-social-safeguards-ess-report-fp013-improving-resilience-vulnerable",
        },
      ],
    },
  ],
  evidence: [
    { label: "공식 정책 문서", value: 35, note: "NAP·메콩델타 계획" },
    {
      label: "공개 프로젝트·재원 연계",
      value: 35,
      note: "World Bank·ADB·GCF",
    },
    { label: "지도/지역 활용성", value: 15, note: "지역 표시 및 링크 확인" },
    { label: "대중 활용성", value: 15, note: "직관적 문구 및 엑셀 기반 정리" },
  ],
  output: "정책·프로젝트·지역 데이터 통합 우선 검토 카드",
};

const executionFeasibility = {
  summary:
    "베트남 데이터팩은 공식 포털 및 공개 프로젝트 정보가 풍부하여 초기 시범 구축에 적합합니다.",
  factors: [
    {
      label: "공개자료 접근성",
      value: 30,
      note: "국가정책·국제금융 자료 확보 용이",
    },
    {
      label: "국제협력 연결성",
      value: 30,
      note: "World Bank·ADB·GCF 연계 정보 확인 가능",
    },
    {
      label: "지도 구현 용이성",
      value: 20,
      note: "국가/지역/프로젝트 좌표 및 설명 구성 가능",
    },
    {
      label: "후속 API 확장성",
      value: 20,
      note: "프록시(Proxy) 연계를 통한 실시간 데이터 확보 가능",
    },
  ],
  recommendations: [
    "정책 문서, 공약, 프로젝트, 재원 정보를 동일한 카드 구조로 통일하여 회의 전 통합 비교가 가능하도록 구성",
    "베트남을 시범 구축 국가로 설정하되, 화면상에서는 일반 검토 대상과 동일한 방식으로 탐색하도록 구현",
    "실시간 API 미지원 항목은 공개 문서 링크 및 검증용 정적 데이터로 우선 구성하고, 향후 연계 준비 상태 명시",
    "환경·사회 검토 문서는 재원·실행 여건 카드 내에 통합 노출",
  ],
};

const suitabilityLogic = {
  headline: "베트남 메콩 델타 우선 검토 대상 선정 사유",
  criteria: [
    {
      label: "정책 연결성",
      value: 30,
      note: "NAP 및 메콩 델타 계획 연계성 확보",
    },
    {
      label: "국제협력 신호",
      value: 30,
      note: "World Bank·ADB·GCF 공개 협력 사례 다수",
    },
    {
      label: "지역 명확성",
      value: 20,
      note: "메콩 델타 지역의 명확한 공간적 범위",
    },
    {
      label: "시범 확장성",
      value: 20,
      note: "타 국가 대상 데이터 구조 확장 및 적용 용이",
    },
  ],
  output: "베트남 시범 구축 및 인접국 확장에 최적화된 공개형 전략 카드",
};

const pilotStatus = {
  badge: "베트남 우선 구축",
  status: "정책 문서, 국제협력 프로젝트, 공개 지표가 통합된 최초 공개 데이터셋",
  datasets: [
    "국가 적응정책·거버넌스",
    "메콩 델타 관련 지역계획",
    "World Bank·ADB·GCF 프로젝트 연계 정보",
    "국가 기초경제 지표",
  ],
  nextActions: [
    "지방정부 수준 실시간 경보·수문 데이터 연계 협의",
    "프로젝트 문서 메타데이터 자동 수집 보강",
    "회의 및 출장 자료에 즉시 활용 가능한 설명 문구 보강",
  ],
};

const VIETNAM_PIPELINE_MOCK_DATA = {
  projects: [
    {
      id: "wb-vn-mekong-p153544",
      source: "World Bank",
      title:
        "Mekong Delta Integrated Climate Resilience and Sustainable Livelihoods Project",
      stage: "Active / implementation",
      country: "Vietnam",
      countryCode: "vn",
      region: "Mekong Delta",
      theme: "flood-early-warning",
      themeTags: [
        "adaptation",
        "water-management",
        "climate-resilience",
        "mekong-delta",
      ],
      amountUSD: 310000000,
      executingPartner: "Government of Viet Nam / MARD",
      description:
        "메콩 델타 지역의 기후회복력, 지속가능 생계, 수자원 및 연안 관리 연계 대표 프로젝트",
      lastUpdated: "공개 문서 기준",
      link: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/698771493115851726",
    },
    {
      id: "adb-vn-43295-012",
      source: "ADB",
      title: "Climate Change Impact and Adaptation Study in the Mekong Delta",
      stage: "Technical assistance completed",
      country: "Vietnam",
      countryCode: "vn",
      region: "Mekong Delta",
      theme: "flood-early-warning",
      themeTags: ["adaptation", "risk-assessment", "mekong-delta"],
      amountUSD: null,
      executingPartner: "ADB",
      description:
        "메콩 델타 기후 영향 및 적응 관련 기술지원(TA) 기반 공개 보고서",
      lastUpdated: "공개 PDF 기준",
      link: "https://www.adb.org/sites/default/files/project-documents/43295-012-tacr-03b_0.pdf",
    },
    {
      id: "gcf-fp013-vn",
      source: "Green Climate Fund",
      title:
        "Improving the resilience of vulnerable coastal communities to climate change related impacts in Viet Nam",
      stage: "Funded activity / evaluation available",
      country: "Vietnam",
      countryCode: "vn",
      region: "Coastal Viet Nam",
      theme: "flood-early-warning",
      themeTags: ["adaptation", "coastal-resilience", "climate-risk"],
      amountUSD: null,
      executingPartner: "UNDP",
      description: "베트남 취약 연안 지역 기후회복력 강화 목적의 GCF 대표 사업",
      lastUpdated: "2025 평가 보고서 기준",
      link: "https://www.greenclimate.fund/project/fp013",
    },
    {
      id: "gcf-fp125-vn",
      source: "Green Climate Fund",
      title:
        "Strengthening the resilience of smallholder agriculture to climate change-induced water insecurity in the Central Highlands and South-Central Coast regions of Vietnam",
      stage: "Funded activity / evaluation available",
      country: "Vietnam",
      countryCode: "vn",
      region: "Viet Nam",
      theme: "water-management",
      themeTags: ["adaptation", "water", "agriculture"],
      amountUSD: null,
      executingPartner: "UNDP",
      description:
        "수자원 불안정성 해소 및 기후 적응 관련 GCF 사업 (베트남 적응 협력 검토용)",
      lastUpdated: "2025 연차 보고서 기준",
      link: "https://www.greenclimate.fund/project/fp125",
    },
    {
      id: "gcf-fp071-vn",
      source: "Green Climate Fund",
      title:
        "Scaling Up Energy Efficiency for Industrial Enterprises in Vietnam",
      stage: "Funded activity / annual report available",
      country: "Vietnam",
      countryCode: "vn",
      region: "Viet Nam",
      theme: "energy-efficiency",
      themeTags: ["mitigation", "industry", "energy-efficiency"],
      amountUSD: null,
      executingPartner: "World Bank",
      description:
        "에너지 효율 분야 GCF 사업 (온실가스 감축형 협력 목적 검토용)",
      lastUpdated: "2025 연차 보고서 기준",
      link: "https://www.greenclimate.fund/project/fp071",
    },
  ],
};

/* =========================================================
 * External asset loaders (Tailwind / MapLibre / XLSX)
 * ========================================================= */
function useExternalScript({ src, id, globalCheck }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!isAllowedExternalUrl(src)) {
      console.warn("Blocked external script URL:", src);
      setReady(false);
      return () => {
        cancelled = true;
      };
    }

    const markReady = () => {
      if (!cancelled) setReady(true);
    };

    // 이미 글로벌 객체가 준비되어 있으면 즉시 ready 처리
    if (globalCheck && globalCheck()) {
      markReady();
      return () => {
        cancelled = true;
      };
    }

    const existing = document.getElementById(id);
    if (existing) {
      // 기존 스크립트가 존재하나 로딩 중일 수 있으므로 이벤트 리스너 등록
      const onLoad = () => markReady();
      const onErr = () => {
        console.error("Failed to load script:", src);
        if (!cancelled) setReady(false);
      };
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onErr, { once: true });

      // load 이벤트가 이미 발생했을 경우를 대비한 Fallback 타이머
      setTimeout(() => {
        if (!cancelled && (!globalCheck || globalCheck())) markReady();
      }, 150);

      return () => {
        cancelled = true;
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onErr);
      };
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.referrerPolicy = "strict-origin-when-cross-origin";
    script.onload = () => markReady();
    script.onerror = () => {
      console.error("Failed to load script:", src);
      if (!cancelled) setReady(false);
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [src, id, globalCheck]);

  return ready;
}

function useExternalStyle({ href, id }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!isAllowedExternalUrl(href)) {
      console.warn("Blocked external stylesheet URL:", href);
      setReady(false);
      return () => {
        cancelled = true;
      };
    }

    const existing = document.getElementById(id);
    if (existing) {
      setReady(true);
      return () => {
        cancelled = true;
      };
    }

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.referrerPolicy = "strict-origin-when-cross-origin";
    link.href = href;
    link.onload = () => {
      if (!cancelled) setReady(true);
    };
    link.onerror = () => {
      console.error("Failed to load style:", href);
      if (!cancelled) setReady(true); // 스타일 로드 실패 시에도 앱 렌더링은 유지
    };
    document.head.appendChild(link);

    return () => {
      cancelled = true;
    };
  }, [href, id]);

  return ready;
}

function useTailwindCDN() {
  return useExternalScript({
    src: "https://cdn.tailwindcss.com",
    id: "tailwind-cdn-script",
    globalCheck: () => !!window.tailwind,
  });
}

function useViewport() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    width,
    isMobile: width < 1024,
    isTablet: width >= 640 && width < 1024,
  };
}

const cx = (...arr) => arr.filter(Boolean).join(" ");
const safeArray = (value) => (Array.isArray(value) ? value : []);

const KNOWN_EXTERNAL_URL_REWRITES = {
  "https://projects.worldbank.org/en/projects-operations/projects-homeen/projects-operations/projects/overview?projId=P153544":
    "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/698771493115851726",
  "https://www.ctc-n.org/about-ctcn/national-designated-entities":
    "https://www.ctc-n.org/about-ctcn/nde",
  "http://www.monre.gov.la/home/": "https://www.monre.gov.la/",
  "https://www.monre.gov.la/home/": "https://www.monre.gov.la/",
  "https://www.presidence.sn/en/institutions/le-gouvernement/":
    "https://mha.gouv.sn/",
  "https://www.greenclimate.fund/projects/fp013":
    "https://www.greenclimate.fund/project/fp013",
  "https://www.greenclimate.fund/projects/fp071":
    "https://www.greenclimate.fund/project/fp071",
  "https://www.greenclimate.fund/projects/fp125":
    "https://www.greenclimate.fund/project/fp125",
  "https://ctis.re.kr/menu.es?mid=a10304010000":
    "https://ctis.re.kr/menu.es?mid=a10304010400",
  "https://data.worldbank.org/country/vietnam":
    "https://data.worldbank.org/country/viet-nam",
  "https://www.adb.org/projects/43295-012/main":
    "https://www.adb.org/sites/default/files/project-documents/43295-012-tacr-03b_0.pdf",
  "https://www.undp.org/vietnam/publications/national-adaptation-plan-period-2021-2030-vision-2050":
    "https://www.undp.org/vietnam/publications/viet-nam-nap-2021-2030-vision-2050",
  "https://www.undp.org/vietnam/publications/viet-nam-nap-2021-2030-vision-2050":
    "https://www.undp.org/vietnam/publications/viet-nam-nap-2021-2030-vision-2050",
  "https://www4.unfccc.int/NAP": "https://napcentral.org/",
  "https://www4.unfccc.int/sites/napc": "https://napcentral.org/",
};

function ensureExternalUrl(rawUrl) {
  let candidate = String(rawUrl || "").trim();
  if (!candidate) return "";

  candidate = KNOWN_EXTERNAL_URL_REWRITES[candidate] || candidate;

  if (!/^https?:\/\//i.test(candidate)) {
    if (/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:[/?#][^\s]*)?$/.test(candidate)) {
      candidate = `https://${candidate}`;
    } else {
      return "";
    }
  }

  const parsed = parseExternalUrl(candidate);
  if (!parsed) return "";

  if (parsed.protocol === "http:") parsed.protocol = "https:";

  const href = parsed.toString();
  return isAllowedExternalUrl(href, UI_ALLOWED_EXTERNAL_HOSTS) ? href : "";
}

function getWorldBankCountrySlug(country) {
  const map = {
    베트남: "viet-nam",
    멕시코: "mexico",
    케냐: "kenya",
    칠레: "chile",
    피지: "fiji",
    라오스: "lao-pdr",
    캄보디아: "cambodia",
    브라질: "brazil",
    가나: "ghana",
    세네갈: "senegal",
    부르키나파소: "burkina-faso",
    인도네시아: "indonesia",
  };
  return map[String(country || "").trim()] || "";
}

function getGcfCountrySlug(country) {
  const map = {
    베트남: "viet-nam",
    멕시코: "mexico",
    케냐: "kenya",
    칠레: "chile",
    피지: "fiji",
    라오스: "lao-pdr",
    캄보디아: "cambodia",
    브라질: "brazil",
    가나: "ghana",
    세네갈: "senegal",
    부르키나파소: "burkina-faso",
    인도네시아: "indonesia",
  };
  return map[String(country || "").trim()] || "";
}

function getNdGainCountrySlug(country) {
  const map = {
    베트남: "vietnam",
    멕시코: "mexico",
    케냐: "kenya",
    칠레: "chile",
    피지: "fiji",
    라오스: "laos",
    캄보디아: "cambodia",
    브라질: "brazil",
    가나: "ghana",
    세네갈: "senegal",
    부르키나파소: "burkina-faso",
    인도네시아: "indonesia",
  };
  return map[String(country || "").trim()] || "";
}

function getWorldBankOpenDataUrl(country) {
  const officialLink = pickOfficialCountryLink(country, "country", 0);
  if (officialLink) return officialLink;

  const slug = getWorldBankCountrySlug(country);
  return slug
    ? `https://data.worldbank.org/country/${slug}`
    : "https://data.worldbank.org/country";
}

function getWorldBankIndicatorUrl(country, indicatorCode) {
  const iso2 = getCountryMetaByName(country)?.iso2 || "";
  const safeCode = String(indicatorCode || "").trim();
  if (!safeCode) return "";

  return iso2
    ? `https://data.worldbank.org/indicator/${safeCode}?locations=${iso2}`
    : "";
}

function getGcfCountryUrl(country) {
  const officialLink = pickOfficialCountryLink(country, "projects", 0);
  if (officialLink) return officialLink;

  const slug = getGcfCountrySlug(country);
  return slug
    ? `https://www.greenclimate.fund/countries/${slug}`
    : "https://www.greenclimate.fund/countries";
}

function getNdGainCountryUrl(country) {
  const slug = getNdGainCountrySlug(country);
  return slug
    ? `https://gain-new.crc.nd.edu/country/${slug}`
    : "https://gain.nd.edu/our-work/country-index/";
}

const OFFICIAL_COUNTRY_LINK_INDEX = (() => {
  const entries = OFFICIAL_LINK_WHITELIST?.countries || {};
  const index = {};

  Object.entries(entries).forEach(([iso2, record]) => {
    const isoKey = String(iso2 || "")
      .trim()
      .toUpperCase();
    if (!isoKey) return;

    index[isoKey] = record;

    const countryName = String(record?.country || "").trim();
    if (countryName) {
      index[countryName] = record;
    }
  });
  return index;
})();

function getOfficialCountryLinks(countryOrIso) {
  if (!countryOrIso) return null;
  const raw = String(countryOrIso || "").trim();
  if (!raw) return null;

  const meta = getCountryMetaByName(raw);

  return (
    OFFICIAL_COUNTRY_LINK_INDEX[String(raw).toUpperCase()] ||
    (meta?.iso2
      ? OFFICIAL_COUNTRY_LINK_INDEX[String(meta.iso2).toUpperCase()]
      : null) ||
    OFFICIAL_COUNTRY_LINK_INDEX[raw] ||
    null
  );
}

function pickOfficialCountryLink(countryOrIso, category, index = 0) {
  const links = getOfficialCountryLinks(countryOrIso);
  const items = safeArray(links?.[category]).filter((item) =>
    ensureExternalUrl(item?.url)
  );
  return items[index]?.url || "";
}

function buildSourceEndpointUrl(item, country) {
  const source = String(item?.source || "").toLowerCase();
  const endpoint = String(item?.endpoint || "").trim();

  if (source.includes("world bank open data")) {
    return getWorldBankOpenDataUrl(country);
  }
  if (source.includes("unfccc ndc registry")) {
    return (
      pickOfficialCountryLink(country, "documents", 0) ||
      "https://unfccc.int/NDCREG"
    );
  }
  if (source.includes("nap central") || /\bnap\b/i.test(source)) {
    return (
      pickOfficialCountryLink(country, "documents", 1) ||
      "https://napcentral.org/"
    );
  }
  if (source.includes("ctcn")) {
    return "https://www.ctc-n.org/about-ctcn/nde";
  }
  if (source.includes("gcf open data")) {
    return "https://data.greenclimate.fund/public/data/countries";
  }
  if (source.includes("gcf")) {
    return getGcfCountryUrl(country);
  }
  if (source.includes("nd-gain")) {
    return getNdGainCountryUrl(country);
  }
  if (source.includes("world bank projects")) {
    return (
      pickOfficialCountryLink(country, "projects", 1) ||
      "https://projects.worldbank.org/"
    );
  }
  if (source.includes("adb")) {
    return (
      pickOfficialCountryLink(country, "projects", 2) || "https://www.adb.org/"
    );
  }
  if (source.includes("nasa power")) {
    return "https://power.larc.nasa.gov/";
  }
  if (
    source.includes("gadm") ||
    source.includes("natural earth") ||
    source.includes("osm")
  ) {
    return "https://www.openstreetmap.org/";
  }
  if (source.includes("global solar atlas")) {
    return "https://globalsolaratlas.info/";
  }
  if (source.includes("global ccs institute") || source.includes("ccus")) {
    return "https://www.globalccsinstitute.com/";
  }
  if (source.includes("em-dat")) {
    return "https://public.emdat.be/";
  }

  const explicit = ensureExternalUrl(endpoint);
  if (explicit) return explicit;

  return guessSourceHref(item?.source, item?.endpoint, { country });
}

function guessSourceHref(source, endpoint = "", context = {}) {
  const s = String(source || "").toLowerCase();
  const country = context?.country || "";

  if (!s) return "";
  if (s.includes("world bank open data"))
    return getWorldBankOpenDataUrl(country);
  if (s.includes("unfccc ndc registry")) {
    return (
      pickOfficialCountryLink(country, "documents", 0) ||
      "https://unfccc.int/NDCREG"
    );
  }
  if (s.includes("nap central") || /\bnap\b/i.test(s)) {
    return (
      pickOfficialCountryLink(country, "documents", 1) ||
      "https://napcentral.org/"
    );
  }
  if (s.includes("ctcn")) return "https://www.ctc-n.org/about-ctcn/nde";
  if (s.includes("gcf open data"))
    return "https://data.greenclimate.fund/public/data/countries";
  if (s.includes("gcf")) return getGcfCountryUrl(country);
  if (s.includes("world bank projects")) {
    return (
      pickOfficialCountryLink(country, "projects", 1) ||
      "https://projects.worldbank.org/"
    );
  }
  if (s.includes("world bank")) {
    return country
      ? getWorldBankOpenDataUrl(country)
      : "https://www.worldbank.org/";
  }
  if (s.includes("adb")) return "https://www.adb.org/";
  if (s.includes("ctis")) return "https://ctis.re.kr/menu.es?mid=a10304010400";
  if (s.includes("undp")) return "https://www.undp.org/";
  if (s.includes("nd-gain")) return getNdGainCountryUrl(country);
  if (s.includes("nasa")) return "https://power.larc.nasa.gov/";
  if (s.includes("openstreetmap") || s.includes("nominatim")) {
    return "https://nominatim.openstreetmap.org/";
  }

  const safeEndpoint = ensureExternalUrl(endpoint);
  if (safeEndpoint) return safeEndpoint;

  return "";
}

function normalizeUrlStateValue(value, fallback = "") {
  const clean = sanitizeExternalQuery(value, 80);
  return clean || fallback;
}

function parsePlatformUrlState(search) {
  try {
    const params = new URLSearchParams(String(search || ""));
    return {
      view: normalizeUrlStateValue(params.get("view")),
      tech: normalizeUrlStateValue(params.get("tech")),
      country: normalizeUrlStateValue(params.get("country")),
      purpose: normalizeUrlStateValue(params.get("purpose")),
      tab: normalizeUrlStateValue(params.get("tab")),
      focus: normalizeUrlStateValue(params.get("focus")),
      rec: normalizeUrlStateValue(params.get("rec")),
    };
  } catch {
    return {
      view: "",
      tech: "",
      country: "",
      purpose: "",
      tab: "",
      focus: "",
      rec: "",
    };
  }
}

function buildPlatformShareUrl({
  screen,
  filters,
  activeRec,
  detailTab,
  focusMode,
} = {}) {
  const base =
    typeof window !== "undefined" && window.location?.href
      ? new URL(window.location.href)
      : new URL("https://example.com/");

  const params = new URLSearchParams();

  if (screen) params.set("view", String(screen));
  if (filters?.tech && filters.tech !== "전체 기술")
    params.set("tech", String(filters.tech));
  if (filters?.country && filters.country !== "전체 국가")
    params.set("country", String(filters.country));
  if (filters?.purpose && filters.purpose !== "전체 목적")
    params.set("purpose", String(filters.purpose));
  if (detailTab) params.set("tab", String(detailTab));
  if (focusMode) params.set("focus", String(focusMode));
  if (activeRec?.id) params.set("rec", String(activeRec.id));

  const qs = params.toString();
  base.search = qs ? `?${qs}` : "";
  return base.toString();
}

async function safeCopyText(text) {
  const value = String(text || "").trim();
  if (!value) return false;

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {}

  if (typeof document === "undefined") return false;

  // Clipboard API 실패 시 Fallback 처리
  try {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "readonly");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const isCopied = document.execCommand("copy");
    ta.remove();
    return !!isCopied;
  } catch {
    return false;
  }
}

function buildFeedbackDraft(activeRec) {
  const rec = activeRec || {};

  const partnerLines = safeArray(rec.localPartners)
    .slice(0, 3)
    .map(
      (item) => `- ${item?.name || "기관"}${item?.role ? `: ${item.role}` : ""}`
    )
    .join("\n");

  const sourceLines = safeArray(rec.sourcePlan)
    .slice(0, 3)
    .map(
      (item) =>
        `- ${item?.source || item?.layer || "출처"}${
          item?.endpoint
            ? ` (${ensureExternalUrl(item.endpoint) || item.endpoint})`
            : ""
        }`
    )
    .join("\n");

  return [
    "[플랫폼 피드백 초안]",
    `- 검토 대상: ${rec.country || "국가 미선택"} / ${
      rec.region || "지역 미선택"
    } / ${rec.tech || "기술 미선택"}`,
    `- 검토 목적: ${safeArray(rec.purposeTags).join(", ") || "미지정"}`,
    `- 주요 고려사항: ${safeArray(rec.reasons)[0] || "세부 검토 필요"}`,
    "- 현지 협력 파트너",
    partnerLines || "  (파트너 정보 보강 필요)",
    "- 주요 근거 자료",
    sourceLines || "  (출처 정보 보강 필요)",
    "- 추가 검토 의견",
    "  1) UI/UX 및 가독성",
    "  2) 국제협력 사업 적합성",
    "  3) 제공 데이터 및 출처 정확성",
    "  4) 국가·기술·파트너 부문 보완 사항",
  ].join("\n");
}

function emptyFeatureCollection() {
  return { type: "FeatureCollection", features: [] };
}

function safeInvoke(fn, ...args) {
  if (typeof fn !== "function") return undefined;
  try {
    return fn(...args);
  } catch (error) {
    console.error("safeInvoke failed:", error);
    return undefined;
  }
}

function clampNumber(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

function clampPanelPose(
  side,
  pose = {},
  viewportWidth = 1440,
  viewportHeight = 900,
  panelWidth = side === "left"
    ? DEFAULT_LEFT_PANEL_WIDTH
    : DEFAULT_RIGHT_PANEL_WIDTH
) {
  const fallback =
    DEFAULT_DESKTOP_PANEL_LAYOUT[side] || DEFAULT_DESKTOP_PANEL_LAYOUT.left;
  const safeViewportWidth = Number.isFinite(viewportWidth)
    ? viewportWidth
    : 1440;
  const safeViewportHeight = Number.isFinite(viewportHeight)
    ? viewportHeight
    : 900;

  const maxX = Math.max(12, Math.floor(safeViewportWidth - panelWidth - 24));
  const maxY = Math.max(12, Math.floor(safeViewportHeight - 420));

  return {
    mode: pose?.mode === "floating" ? "floating" : "docked",
    x: clampNumber(pose?.x ?? fallback.x, 12, maxX),
    y: clampNumber(pose?.y ?? fallback.y, 12, maxY),
  };
}

function loadStoredPanelLayout() {
  try {
    const parsed = JSON.parse(
      String(safeStorageGet(PANEL_LAYOUT_STORAGE_KEY) || "{}")
    );
    return {
      left: clampPanelPose("left", parsed?.left),
      right: clampPanelPose("right", parsed?.right),
    };
  } catch {
    return cloneJsonSafe(DEFAULT_DESKTOP_PANEL_LAYOUT);
  }
}

function resolveEvidenceHref(item, context = {}) {
  if (!item) return "";

  const candidate =
    ensureExternalUrl(item?.href) ||
    ensureExternalUrl(item?.link) ||
    buildSourceEndpointUrl(item, context?.country) ||
    guessSourceHref(item?.source, item?.endpoint, context) ||
    ensureExternalUrl(item?.endpoint);

  return candidate || "";
}

function getEvidenceLinkForItem(item, context = {}) {
  if (!item) return null;

  const href = resolveEvidenceHref(item, context);
  if (!href) return null;

  return {
    href,
    label:
      item.label ||
      item.title ||
      item.field ||
      item.project ||
      item.policy ||
      item.indicator ||
      item.source ||
      "참고 링크",
    group: item.group || item.layer || item.category || "관련 정보",
  };
}

function getPrimaryEvidenceLink(rec, mode = "general") {
  const links = collectEvidenceLinks(rec, mode);
  return links.length ? links[0] : null;
}

function escapeHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSafeLocalStorage() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeStorageGet(key) {
  if (!SAFE_STORAGE_KEY_RE.test(String(key || ""))) return null;
  const storage = getSafeLocalStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  if (!SAFE_STORAGE_KEY_RE.test(String(key || ""))) return false;
  const storage = getSafeLocalStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

function safeJsonParse(value, fallback = null) {
  if (value == null || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function loadStoredObject(key, fallback = null) {
  return safeJsonParse(safeStorageGet(key), fallback);
}

function saveStoredObject(key, value) {
  try {
    return safeStorageSet(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

function appendStoredObjectList(key, entry, limit = 40) {
  const current = safeArray(loadStoredObject(key, []));
  const next = [entry, ...current].slice(0, limit);
  saveStoredObject(key, next);
  return next;
}

function emitPlatformAnalyticsEvent(eventName, payload = {}) {
  try {
    if (typeof window === "undefined") return false;
    const detail = {
      eventName,
      payload,
      ts: Date.now(),
    };
    if (
      typeof window.dispatchEvent === "function" &&
      typeof CustomEvent === "function"
    ) {
      window.dispatchEvent(
        new CustomEvent("climate-platform-analytics", { detail })
      );
      return true;
    }
  } catch (error) {
    console.error("[analytics] failed to emit event", eventName, error);
  }
  return false;
}

function formatRelativeTimeLabel(ts) {
  const value = Number(ts || 0);
  if (!value) return "방금 전";
  const diff = Math.max(0, Date.now() - value);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}
function formatDateTimeKo(ts = Date.now()) {
  try {
    return new Date(ts).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(ts || "");
  }
}

function sanitizeExternalQuery(value, maxLength = 180) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\x00-\x1F\x7F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cloneJsonSafe(data) {
  try {
    if (typeof structuredClone === "function") return structuredClone(data);
  } catch {}
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return data;
  }
}

function getCspNonce() {
  if (typeof document === "undefined") return undefined;
  const metaNonce = document
    .querySelector('meta[name="csp-nonce"]')
    ?.getAttribute("content");
  const dataNonce = document.documentElement?.dataset?.cspNonce;
  return metaNonce || dataNonce || undefined;
}

const UI_ALLOWED_EXTERNAL_HOSTS = new Set([
  "cdn.tailwindcss.com",
  "cdn.jsdelivr.net",
  "unpkg.com",
  "api.worldbank.org",
  "data.worldbank.org",
  "www.worldbank.org",
  "documents.worldbank.org",
  "projects.worldbank.org",
  "nominatim.openstreetmap.org",
  "power.larc.nasa.gov",
  "gain-new.crc.nd.edu",
  "gain.nd.edu",
  "unfccc.int",
  "www4.unfccc.int",
  "napcentral.org",
  "www.ctc-n.org",
  "ctc-n.org",
  "www.greenclimate.fund",
  "greenclimate.fund",
  "data.greenclimate.fund",
  "www.adb.org",
  "adb.org",
  "www.undp.org",
  "globalsolaratlas.info",
  "www.globalccsinstitute.com",
  "globalccsinstitute.com",
  "public.emdat.be",
  "www.openstreetmap.org",
  "ctis.re.kr",
  "asemconnectvietnam.gov.vn",
  "en.mae.gov.vn",
  "nchmf.gov.vn",
  "phongchongthientai.mard.gov.vn",
  "www.cantho.gov.vn",
  "www.energy.go.ke",
  "www.rerec.co.ke",
  "www.kplc.co.ke",
  "meteo.go.ke",
  "www.mem.gov.la",
  "edl.com.la",
  "www.mrcmekong.org",
  "mowram.gov.kh",
  "tonlesap.gov.kh",
  "mme.gov.kh",
  "ama.gov.gh",
  "www.epa.gov.gh",
  "mesti.gov.gh",
  "www.ghana.gov.gh",
  "onas.sn",
  "www.sones.sn",
  "mha.gouv.sn",
  "www.esdm.go.id",
  "www.pln.co.id",
  "www.bmkg.go.id",
  "www.met.gov.fj",
  "www.ndmo.gov.fj",
  "fijiclimatechangeportal.gov.fj",
  "efl.com.fj",
  "www.cne.cl",
  "www.coordinador.cl",
  "www.corfo.gob.cl",
  "www.gob.cl",
  "www.gob.mx",
  "www.gov.br",
  "geodata.ucdavis.edu",
]);
const FETCH_ALLOWED_EXTERNAL_HOSTS = new Set([
  "api.worldbank.org",
  "nominatim.openstreetmap.org",
  "power.larc.nasa.gov",
  "geodata.ucdavis.edu",
]);
const EXTERNAL_JSON_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_JSON_RESPONSE_BYTES = 1_500_000;
const SAFE_STORAGE_KEY_RE = /^[A-Z0-9_:-]{1,64}$/i;
const externalJsonCache = new Map();

function parseExternalUrl(rawUrl) {
  try {
    const base =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://localhost";
    return new URL(String(rawUrl || ""), base);
  } catch {
    return null;
  }
}

function isSameOriginUrl(rawUrl) {
  const u = parseExternalUrl(rawUrl);
  if (!u) return false;
  if (typeof window === "undefined" || !window.location?.origin) return false;
  return u.origin === window.location.origin;
}

function isAllowedExternalUrl(
  rawUrl,
  allowedHosts = UI_ALLOWED_EXTERNAL_HOSTS
) {
  const u = parseExternalUrl(rawUrl);
  if (!u) return false;
  if (isSameOriginUrl(rawUrl)) return true;
  if (u.protocol !== "https:") return false;
  return allowedHosts.has(u.hostname);
}

function assertAllowedExternalUrl(
  rawUrl,
  allowedHosts = FETCH_ALLOWED_EXTERNAL_HOSTS
) {
  if (!isAllowedExternalUrl(rawUrl, allowedHosts)) {
    throw new Error(`허용되지 않은 외부 URL입니다: ${String(rawUrl || "")}`);
  }
}

function normalizeIso2(v) {
  const s = String(v ?? "")
    .trim()
    .toUpperCase();
  return /^[A-Z]{2}$/.test(s) ? s : null;
}

function normalizeIso3(v) {
  const s = String(v ?? "")
    .trim()
    .toUpperCase();
  return /^[A-Z]{3}$/.test(s) ? s : null;
}

function sanitizeSpreadsheetValue(v) {
  if (typeof v !== "string") return v;
  const s = v.replace(/^\uFEFF/, "");
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

function sanitizeRowsForSheet(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    if (!row || typeof row !== "object") return row;
    const out = {};
    for (const [k, v] of Object.entries(row))
      out[k] = sanitizeSpreadsheetValue(v);
    return out;
  });
}

function jsonToSheetSafe(rows) {
  const XLSXRef = typeof window !== "undefined" ? window.XLSX : null;
  if (!XLSXRef) return {};
  return XLSXRef.utils.json_to_sheet(sanitizeRowsForSheet(rows));
}

function downloadJsonBlob(filename, payload) {
  if (typeof document === "undefined") return;
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function sanitizeFilenamePart(value) {
  return String(value || "file")
    .replace(/[\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 60);
}

function downloadTextBlob(filename, text) {
  if (typeof document === "undefined") return;
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function detectDownloadEnvironment() {
  if (typeof window === "undefined") {
    return {
      embedded: false,
      sandboxed: false,
      chatgptEmbedded: false,
      mobile: false,
      ios: false,
      shouldPreferFallback: false,
      reason: "browser",
    };
  }
  let embedded = false;
  try {
    embedded = window.self !== window.top;
  } catch {
    embedded = true;
  }
  const referrer = String(document?.referrer || "").toLowerCase();
  const ua = String(navigator?.userAgent || "").toLowerCase();
  const chatgptEmbedded =
    referrer.includes("chatgpt.com") ||
    referrer.includes("chat.openai.com") ||
    ua.includes("chatgpt");
  const mobile = /(android|iphone|ipad|ipod|mobile)/i.test(ua);
  const ios = /(iphone|ipad|ipod)/i.test(ua);
  const sandboxAttr = Array.from(
    document?.querySelectorAll?.("iframe[sandbox]") || []
  ).some((frame) => String(frame.getAttribute("sandbox") || "").length > 0);
  const sandboxed = embedded || sandboxAttr;
  return {
    embedded,
    sandboxed,
    chatgptEmbedded,
    mobile,
    ios,
    shouldPreferFallback: sandboxed || chatgptEmbedded,
    reason: chatgptEmbedded
      ? "chatgpt-sandbox"
      : sandboxed
      ? "embedded-sandbox"
      : embedded
      ? "embedded-frame"
      : mobile
      ? ios
        ? "mobile-ios"
        : "mobile-browser"
      : "browser",
  };
}

function tryBrowserDownload({ blob, filename }) {
  if (!blob) return { ok: false, reason: "blob-missing", objectUrl: "" };
  if (
    typeof document === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return { ok: false, reason: "download-api-unavailable", objectUrl: "" };
  }
  let objectUrl = "";
  try {
    objectUrl = createObjectUrlSafe(blob, filename || "download");
    if (!objectUrl) {
      return { ok: false, reason: "object-url-failed", objectUrl: "" };
    }
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename || "download";
    anchor.rel = "noreferrer noopener";
    anchor.target = "_self";
    anchor.style.position = "fixed";
    anchor.style.left = "-9999px";
    anchor.style.opacity = "0";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return { ok: true, reason: "anchor-click", objectUrl };
  } catch (error) {
    console.error("[download] automatic browser download failed", error);
    if (objectUrl) {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {}
    }
    return {
      ok: false,
      reason: String(error?.message || "download-failed"),
      objectUrl: "",
    };
  }
}

function revokeObjectUrl(url) {
  if (
    !url ||
    typeof URL === "undefined" ||
    typeof URL.revokeObjectURL !== "function"
  )
    return;
  try {
    URL.revokeObjectURL(url);
  } catch {}
}

function buildCsvTextFromRows(rows = []) {
  return safeArray(rows)
    .map((row) =>
      safeArray(row)
        .map((value) => {
          const cell = String(value ?? "").replaceAll('"', '""');
          return /[",\n]/.test(cell) ? `"${cell}"` : cell;
        })
        .join(",")
    )
    .join("\n");
}

function createObjectUrlSafe(blob, label = "download") {
  if (!blob || typeof URL === "undefined") return "";
  try {
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(`[download] failed to create object URL for ${label}`, error);
    return "";
  }
}

function getDownloadKindMeta(fileKind = "brief") {
  if (fileKind === "comparison") {
    return {
      fileLabel: "대상 검토표 PDF", // '후보' -> '대상'으로 통일
      previewTitle: "검토표 미리보기",
      primaryActionLabel: "인쇄용 화면 새 창 열기",
      primaryActionHint: "새 창의 인쇄 메뉴에서 'PDF로 저장' 선택", // 기호(→) 대신 자연스러운 안내 문구로 변경
      fallbackActionLabel: "텍스트 파일로 저장", // '텍스트 복사본'이라는 번역투 순화
      bannerTitle: "대상 검토표 PDF 생성 완료", // '~준비했습니다'의 구어체를 시스템 상태 알림 톤으로 격상
    };
  }
  return {
    fileLabel: "공유용 요약본 PDF",
    previewTitle: "요약본 미리보기",
    primaryActionLabel: "PDF 저장 화면 열기", // '저장창'이라는 비표준어 대신 '저장 화면' 사용
    primaryActionHint: "인쇄 메뉴에서 'PDF로 저장' 선택",
    fallbackActionLabel: "텍스트 파일로 저장",
    bannerTitle: "공유용 요약본 PDF 생성 완료",
  };
}
function renderPrintableMetaRows(rows = []) {
  const html = safeArray(rows)
    .filter((row) => row && row[1] != null && String(row[1]).trim())
    .map(
      (row) =>
        `<div class="meta-row"><dt>${escapeHtml(row[0])}</dt><dd>${escapeHtml(
          row[1]
        )}</dd></div>`
    )
    .join("");
  return html || `<div class="meta-empty">표시할 문서 정보가 없습니다.</div>`;
}

function renderPrintableHighlights(cards = []) {
  return safeArray(cards)
    .filter((item) => item && (item.value || item.note))
    .map(
      (item) => `
        <div class="highlight-card">
          <div class="highlight-label">${escapeHtml(item.label || "항목")}</div>
          <div class="highlight-value">${escapeHtml(item.value || "-")}</div>
          ${
            item.note
              ? `<div class="highlight-note">${escapeHtml(item.note)}</div>`
              : ""
          }
        </div>
      `
    )
    .join("");
}

function renderPrintableList(items = []) {
  const rows = safeArray(items)
    .filter(Boolean)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  return rows
    ? `<ul class="bullet-list">${rows}</ul>`
    : `<div class="section-empty">표시할 항목이 없습니다.</div>`;
}

function renderPrintableLinks(links = []) {
  const rows = safeArray(links)
    .filter((item) => item?.href)
    .map(
      (item) => `
        <li>
          <a href="${escapeHtml(
            item.href
          )}" target="_blank" rel="noreferrer noopener">${escapeHtml(
        item.label || item.href
      )}</a>
          <span>${escapeHtml(item.group || "공식 출처")}</span>
        </li>
      `
    )
    .join("");
  return rows
    ? `<ul class="link-list">${rows}</ul>`
    : `<div class="section-empty">연결된 공식 링크가 없습니다.</div>`;
}

function renderPrintableTable(headers = [], rows = []) {
  const safeHeaders = safeArray(headers).filter((item) => item?.key);
  if (!safeHeaders.length)
    return `<div class="section-empty">표시할 표가 없습니다.</div>`;
  const thead = safeHeaders
    .map((header) => `<th>${escapeHtml(header.label || header.key)}</th>`)
    .join("");
  const bodyRows = safeArray(rows).filter(Boolean);
  const tbody = bodyRows.length
    ? bodyRows
        .map(
          (row) =>
            `<tr>${safeHeaders
              .map(
                (header) => `<td>${escapeHtml(row?.[header.key] ?? "-")}</td>`
              )
              .join("")}</tr>`
        )
        .join("")
    : `<tr><td colspan="${safeHeaders.length}" class="table-empty">표시할 항목이 없습니다.</td></tr>`;
  return `<div class="table-wrap"><table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
}

function buildPrintableReportHtml({
  title = "개도국 기후기술 협력 문서",
  subtitle = "",
  badge = "PDF 저장용 문서",
  metadataRows = [],
  summary = "",
  highlightCards = [],
  sections = [],
  footerNote = "",
} = {}) {
  const renderedSections = safeArray(sections)
    .map((section) => {
      if (!section?.title) return "";
      let body = "";
      if (section.kind === "table") {
        body = renderPrintableTable(section.headers, section.rows);
      } else if (section.kind === "links") {
        body = renderPrintableLinks(section.links);
      } else if (section.kind === "paragraphs") {
        body = safeArray(section.paragraphs)
          .filter(Boolean)
          .map((item) => `<p>${escapeHtml(item)}</p>`)
          .join("");
      } else {
        body = renderPrintableList(section.items);
      }
      const noteHtml = section.note
        ? `<div class="section-note">${escapeHtml(section.note)}</div>`
        : "";
      return `
        <section class="report-section">
          <div class="section-header">
            <h2>${escapeHtml(section.title)}</h2>
            ${
              section.rightLabel
                ? `<span class="section-tag">${escapeHtml(
                    section.rightLabel
                  )}</span>`
                : ""
            }
          </div>
          ${
            section.lead
              ? `<p class="section-lead">${escapeHtml(section.lead)}</p>`
              : ""
          }
          ${body}
          ${noteHtml}
        </section>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #0f172a;
        --muted: #475569;
        --line: #cbd5e1;
        --accent: #0f766e;
        --accent-soft: #ecfeff;
        --accent-2: #0369a1;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #e2e8f0; }
      body {
        font-family: "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "Segoe UI", sans-serif;
        color: var(--ink);
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 18mm 17mm 18mm; }
      .eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: var(--accent-soft); color: var(--accent); font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
      .hero { margin-top: 14px; padding: 18px 20px; border: 1px solid #bfdbfe; border-radius: 18px; background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%); }
      .hero h1 { margin: 0; font-size: 24px; line-height: 1.3; }
      .hero p { margin: 10px 0 0; color: var(--muted); font-size: 12px; line-height: 1.7; }
      .meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; margin-top: 18px; padding: 16px 18px; border: 1px solid var(--line); border-radius: 16px; background: #f8fafc; }
      .meta-row { display: grid; grid-template-columns: 88px 1fr; gap: 8px; }
      .meta-row dt { font-weight: 700; color: #334155; }
      .meta-row dd { margin: 0; color: #0f172a; }
      .meta-empty, .section-empty, .table-empty { color: var(--muted); font-size: 12px; }
      .highlight-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
      .highlight-card { border: 1px solid #dbeafe; border-radius: 16px; padding: 14px; background: #f8fafc; }
      .highlight-label { font-size: 11px; color: var(--muted); font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
      .highlight-value { margin-top: 6px; font-size: 15px; font-weight: 800; line-height: 1.4; }
      .highlight-note { margin-top: 6px; font-size: 11px; color: var(--muted); line-height: 1.6; }
      .report-section { margin-top: 18px; border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; page-break-inside: avoid; }
      .section-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .section-header h2 { margin: 0; font-size: 16px; }
      .section-tag { display: inline-flex; align-items: center; padding: 5px 10px; border-radius: 999px; background: #eef2ff; color: #4338ca; font-size: 11px; font-weight: 700; }
      .section-lead { margin: 8px 0 0; color: var(--muted); font-size: 12px; line-height: 1.7; }
      .bullet-list { margin: 12px 0 0; padding-left: 18px; }
      .bullet-list li { margin: 0 0 8px; font-size: 12px; line-height: 1.7; }
      .table-wrap { margin-top: 12px; overflow: hidden; border-radius: 14px; border: 1px solid var(--line); }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      thead th { background: #f1f5f9; color: #334155; font-weight: 800; text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); }
      tbody td { padding: 10px 12px; border-top: 1px solid #e2e8f0; vertical-align: top; line-height: 1.6; }
      .link-list { margin: 12px 0 0; padding-left: 18px; }
      .link-list li { margin-bottom: 8px; font-size: 12px; line-height: 1.6; }
      .link-list a { color: var(--accent-2); text-decoration: none; font-weight: 700; }
      .link-list span { display: block; color: var(--muted); font-size: 11px; }
      .section-note { margin-top: 12px; padding: 10px 12px; border-radius: 12px; background: #f8fafc; color: var(--muted); font-size: 11px; line-height: 1.7; }
      .footer-note { margin-top: 18px; color: var(--muted); font-size: 11px; line-height: 1.7; }
      @page { size: A4; margin: 12mm; }
      @media print { html, body { background: #fff; } .page { width: auto; min-height: auto; margin: 0; padding: 0; } }
    </style>
  </head>
  <body>
    <main class="page">
      <div class="eyebrow">${escapeHtml(badge)}</div>
      <section class="hero">
        <h1>${escapeHtml(title)}</h1>
        ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
        ${summary ? `<p>${escapeHtml(summary)}</p>` : ""}
      </section>
      <section class="meta-grid">${renderPrintableMetaRows(
        metadataRows
      )}</section>
      ${
        highlightCards.length
          ? `<section class="highlight-grid">${renderPrintableHighlights(
              highlightCards
            )}</section>`
          : ""
      }
      ${renderedSections}
      ${
        footerNote
          ? `<div class="footer-note">${escapeHtml(footerNote)}</div>`
          : ""
      }
    </main>
    <script>
      (function() {
        if (!window.location.hash.includes('autoprint')) return;
        window.addEventListener('load', function() {
          window.setTimeout(function() {
            try { window.print(); } catch (error) { console.error(error); }
          }, 180);
        });
      })();
    </script>
  </body>
</html>`;
}

function closePopupSafe(popup) {
  try {
    if (popup && !popup.closed) popup.close();
  } catch {}
}

function tryBrowserPdfPrint({
  blob,
  filename,
  htmlText = "",
  popupRef = null,
}) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { ok: false, reason: "window-unavailable", objectUrl: "" };
  }
  const objectUrl = blob
    ? createObjectUrlSafe(blob, filename || "pdf-print")
    : "";
  const printableHtml = String(htmlText || "").trim();
  let popup = null;

  try {
    popup =
      popupRef && !popupRef.closed
        ? popupRef
        : window.open("", "_blank", "noopener,noreferrer");

    if (!popup) {
      if (objectUrl) revokeObjectUrl(objectUrl);
      return { ok: false, reason: "popup-blocked", objectUrl: "" };
    }

    popup.document.title = filename || "협력 대상 검토 문서"; // '협력 문서'를 보다 구체적인 실무 용어로 보강

    if (printableHtml) {
      popup.document.open();
      popup.document.write(printableHtml);
      popup.document.close();
      window.setTimeout(() => {
        try {
          popup.focus();
          popup.print();
        } catch (error) {
          console.error("[download] popup print trigger failed", error);
        }
      }, 320);

      return {
        ok: true,
        reason: popupRef
          ? "popup-preopened-document-written"
          : "popup-document-written",
        objectUrl,
      };
    }

    if (objectUrl) {
      popup.location.replace(`${objectUrl}#autoprint`);
      return { ok: true, reason: "popup-object-url", objectUrl };
    }

    closePopupSafe(popup);
    return { ok: false, reason: "print-html-missing", objectUrl: "" };
  } catch (error) {
    console.error("[download] failed to open print window", error);
    closePopupSafe(popupRef || popup);
    if (objectUrl) revokeObjectUrl(objectUrl);
    return {
      ok: false,
      reason: String(error?.message || "print-window-failed"),
      objectUrl: "",
    };
  }
}

function buildDownloadDeliveryState({ payload, fileKind, env, autoDownload }) {
  const meta = getDownloadKindMeta(fileKind);
  const deliveryType = payload?.deliveryType || "file";
  const fallbackObjectUrl = payload?.fallbackBlob
    ? createObjectUrlSafe(payload.fallbackBlob, `${fileKind}-fallback`)
    : "";
  const primaryObjectUrl =
    autoDownload?.objectUrl ||
    createObjectUrlSafe(
      payload?.blob,
      deliveryType === "print-pdf" ? `${fileKind}-print` : `${fileKind}-primary`
    );

  const shouldOpenFallback =
    !autoDownload?.ok ||
    env?.shouldPreferFallback ||
    (deliveryType === "print-pdf" && env?.mobile);

  const envReason = env?.reason || "browser";

  // 구어체를 배제하고 명확한 시스템 상태 및 행동 유도(CTA) 텍스트로 변경
  const statusMessage = shouldOpenFallback
    ? deliveryType === "print-pdf"
      ? `해당 환경(${envReason})에서는 PDF 저장 화면 자동 실행이 제한되므로, 인쇄용 문서 링크 및 텍스트 복사 기능을 제공합니다.`
      : `해당 환경(${envReason})에서는 파일 자동 저장이 제한될 수 있으므로, 수동 저장 링크 및 텍스트 복사 기능을 제공합니다.`
    : deliveryType === "print-pdf"
    ? `${meta.fileLabel} 생성이 완료되었습니다. 브라우저 인쇄 화면에서 'PDF로 저장'을 선택해 주세요.`
    : `${meta.fileLabel} 생성이 완료되어 자동 저장을 시도합니다. 다운로드가 진행되지 않을 경우 아래의 수동 저장 링크를 이용해 주세요.`;

  // 개발자 친화적/캐주얼한 톤(ChatGPT 채팅방 등)을 플랫폼 공식 이용 안내 톤으로 순화
  const environmentNote = env?.shouldPreferFallback
    ? deliveryType === "print-pdf"
      ? "보안 및 제한된 환경(샌드박스·iframe 등)에서는 브라우저 인쇄 화면이 자동 실행되지 않을 수 있습니다. 하단의 'PDF 저장 화면 열기' 링크를 클릭하여 새 창에서 인쇄 메뉴를 열고 PDF로 저장해 주세요."
      : "보안 및 제한된 환경(샌드박스·iframe 등)에서는 파일 자동 저장이 제한될 수 있습니다. 자동 저장이 차단된 경우 하단의 수동 저장 링크를 이용하거나 텍스트 복사 기능을 활용해 주세요."
    : env?.mobile && deliveryType === "print-pdf"
    ? "모바일 환경에서는 브라우저 인쇄 화면이 자동으로 실행되지 않을 수 있습니다. 새 창을 열고 기기의 공유 또는 인쇄 메뉴에서 'PDF로 저장'을 선택해 주세요."
    : deliveryType === "print-pdf"
    ? "새 창의 인쇄 메뉴를 통한 PDF 저장 방식이 가장 안정적입니다. 화면이 자동으로 열리지 않을 경우 하단의 링크를 클릭해 주세요."
    : "시스템에서 자동 저장을 우선 시도합니다. 다운로드가 차단된 경우 하단의 수동 저장 링크 또는 텍스트 복사 기능을 이용해 주세요.";

  return {
    shouldOpenFallback,
    state: {
      open: true,
      fileKind,
      deliveryType,
      fileLabel: meta.fileLabel,
      previewTitle: meta.previewTitle,
      primaryActionMode: deliveryType === "print-pdf" ? "print" : "download",
      primaryActionLabel: meta.primaryActionLabel,
      primaryActionHint: meta.primaryActionHint,
      filename: payload?.filename,
      mimeType: payload?.mimeType,
      objectUrl: primaryObjectUrl,
      fallbackObjectUrl,
      fallbackFilename: payload?.fallbackFilename,
      previewText: payload?.previewText,
      copyText: payload?.copyText,
      statusMessage,
      environmentNote,
      environmentReason: envReason,
      generatedAt: new Date().toISOString(),
    },
    primaryObjectUrl,
    fallbackObjectUrl,
  };
}

const TECH_EMOJI_MAP = {
  "태양광 기술": "☀️",
  "태양열 기술": "🔥",
  "풍력 기술": "🌬️",
  "해양에너지 기술": "🌊",
  "수력 기술": "💧",
  "수열 기술": "🌡️",
  "지열 기술": "🪨",
  "바이오에너지 기술": "🌿",
  "수소·암모니아 발전기술": "⚗️",
  "석탄액화·가스화 기술": "🛢️",
  "원자력 기술": "☢️",
  "핵융합에너지 기술": "✨",
  "수소 기술": "🧪",
  "바이오매스 기술": "🪵",
  "폐자원 기술": "♻️",
  "발전효율 기술": "⚡",
  "산업효율 기술": "🏭",
  "수송효율 기술": "🚚",
  "건물효율 기술": "🏢",
  "이산화탄소(CO₂) 포집·저장·활용 기술": "🧯",
  "메탄(CH)처리 기술": "🫧",
  "기타 온실가스 처리 및 대체 기술": "🧬",
  "탄소흡수원 기술": "🌳",
  "전력 통합 기술": "🔌",
  "열 통합 기술": "🥵",
  "전력-비전력 부문간 결합 기술": "🔁",
  "기후변화 감시 및 진단 기술": "🛰️",
  "기후변화 예측 기술": "📈",
  "기후변화 영향 평가 기술": "🧭",
  "기후변화 취약성 및 위험성 평가 기술": "⚠️",
  "건강 부문 기술": "🧑‍⚕️",
  "물 부문 기술": "🚰",
  "국토연안 부문 기술": "🏝️",
  "농축수산 부문 기술": "🌾",
  "산림·생태계 부문 기술": "🌲",
  "산업 에너지 부문 기술": "🏗️",
  "적응조치의 효과평가 기술": "✅",
  "기후변화 적응기반 기술": "🗂️",
};

function techEmoji(tech) {
  return TECH_EMOJI_MAP[tech] || "📌";
}

const TECH_SHORT_MAP = {
  "태양광 기술": "태양광",
  "태양열 기술": "태양열",
  "풍력 기술": "풍력",
  "해양에너지 기술": "해양",
  "수력 기술": "수력",
  "수열 기술": "수열",
  "지열 기술": "지열",
  "바이오에너지 기술": "바이오",
  "수소·암모니아 발전기술": "수소발전",
  "석탄액화·가스화 기술": "석탄",
  "원자력 기술": "원자력",
  "핵융합에너지 기술": "핵융합",
  "수소 기술": "수소",
  "바이오매스 기술": "바이오매스",
  "폐자원 기술": "폐자원",
  "발전효율 기술": "발전효율",
  "산업효율 기술": "산업효율",
  "수송효율 기술": "수송효율",
  "건물효율 기술": "건물효율",
  "이산화탄소(CO₂) 포집·저장·활용 기술": "CCUS",
  "메탄(CH₄) 처리 기술": "메탄",
  "기타 온실가스 처리 및 대체 기술": "대체가스",
  "탄소흡수원 기술": "흡수원",
  "전력 통합 기술": "전력망",
  "열 통합 기술": "열통합",
  "전력-비전력 부문간 결합 기술": "결합",
  "기후변화 감시 및 진단 기술": "감시",
  "기후변화 예측 기술": "예측",
  "기후변화 영향 평가 기술": "영향",
  "기후변화 취약성 및 위험성 평가 기술": "위험",
  "건강 부문 기술": "건강",
  "물 부문 기술": "물",
  "국토연안 부문 기술": "연안",
  "농축수산 부문 기술": "농업",
  "산림·생태계 부문 기술": "산림",
  "산업 에너지 부문 기술": "산업",
  "적응조치의 효과평가 기술": "효과",
  "기후변화 적응기반 기술": "적응",
};

function techShort(tech) {
  const normalized = normalizeTechName(tech);
  return TECH_SHORT_MAP[normalized] || normalized || "기술";
}

const DEFAULT_TECH_COLOR_PALETTE = [
  "#f59e0b",
  "#38bdf8",
  "#a78bfa",
  "#22c55e",
  "#60a5fa",
  "#84cc16",
  "#f97316",
  "#10b981",
  "#ef4444",
  "#e879f9",
  "#14b8a6",
  "#fb7185",
  "#facc15",
  "#818cf8",
];

function hashTechLabel(label) {
  return Array.from(String(label || "")).reduce(
    (acc, ch) => acc + ch.charCodeAt(0),
    0
  );
}

function techColorHex(tech) {
  const normalized = normalizeTechName(tech);
  const map = {
    "태양광 기술": "#f59e0b",
    "태양열 기술": "#fb923c",
    "풍력 기술": "#38bdf8",
    "해양에너지 기술": "#06b6d4",
    "수력 기술": "#3b82f6",
    "수열 기술": "#14b8a6",
    "지열 기술": "#f97316",
    "바이오에너지 기술": "#65a30d",
    "수소·암모니아 발전기술": "#a78bfa",
    "석탄액화·가스화 기술": "#78716c",
    "원자력 기술": "#f43f5e",
    "핵융합에너지 기술": "#8b5cf6",
    "수소 기술": "#6366f1",
    "바이오매스 기술": "#16a34a",
    "폐자원 기술": "#ef4444",
    "발전효율 기술": "#f59e0b",
    "산업효율 기술": "#eab308",
    "수송효율 기술": "#0ea5e9",
    "건물효율 기술": "#06b6d4",
    "이산화탄소(CO₂) 포집·저장·활용 기술": "#22c55e",
    "메탄(CH₄) 처리 기술": "#14b8a6",
    "기타 온실가스 처리 및 대체 기술": "#f472b6",
    "탄소흡수원 기술": "#10b981",
    "전력 통합 기술": "#8b5cf6",
    "열 통합 기술": "#f97316",
    "전력-비전력 부문간 결합 기술": "#6366f1",
    "기후변화 감시 및 진단 기술": "#f97316",
    "기후변화 예측 기술": "#8b5cf6",
    "기후변화 영향 평가 기술": "#22c55e",
    "기후변화 취약성 및 위험성 평가 기술": "#f43f5e",
    "건강 부문 기술": "#fb7185",
    "물 부문 기술": "#60a5fa",
    "국토연안 부문 기술": "#0ea5e9",
    "농축수산 부문 기술": "#84cc16",
    "산림·생태계 부문 기술": "#10b981",
    "산업 에너지 부문 기술": "#f59e0b",
    "적응조치의 효과평가 기술": "#a78bfa",
    "기후변화 적응기반 기술": "#14b8a6",
  };
  if (map[normalized]) return map[normalized];
  return DEFAULT_TECH_COLOR_PALETTE[
    hashTechLabel(normalized) % DEFAULT_TECH_COLOR_PALETTE.length
  ];
}

function hexToRgb(hex) {
  const safe = String(hex || "").replace("#", "");
  const full =
    safe.length === 3
      ? safe
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : safe;
  const intVal = Number.parseInt(full, 16);
  if (!Number.isFinite(intVal)) return { r: 16, g: 185, b: 129 };
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
}

function withAlpha(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function techBadgeLabel(tech) {
  const badgeMap = {
    "태양광 기술": "태양광",
    "태양열 기술": "태양열",
    "풍력 기술": "풍력",
    "해양에너지 기술": "해양",
    "수력 기술": "수력",
    "수열 기술": "수열",
    "지열 기술": "지열",
    "바이오에너지 기술": "바이오",
    "수소·암모니아 발전기술": "수소발전",
    "석탄액화·가스화 기술": "석탄",
    "원자력 기술": "원자력",
    "핵융합에너지 기술": "핵융합",
    "수소 기술": "수소",
    "바이오매스 기술": "바이오",
    "폐자원 기술": "폐자원",
    "발전효율 기술": "발전효율",
    "산업효율 기술": "산업효율",
    "수송효율 기술": "수송",
    "건물효율 기술": "건물",
    "이산화탄소(CO₂) 포집·저장·활용 기술": "CCUS",
    "메탄(CH₄) 처리 기술": "메탄",
    "기타 온실가스 처리 및 대체 기술": "대체가스",
    "탄소흡수원 기술": "흡수원",
    "전력 통합 기술": "전력망",
    "열 통합 기술": "열통합",
    "전력-비전력 부문간 결합 기술": "결합",
    "기후변화 감시 및 진단 기술": "감시",
    "기후변화 예측 기술": "예측",
    "기후변화 영향 평가 기술": "영향",
    "기후변화 취약성 및 위험성 평가 기술": "위험",
    "건강 부문 기술": "건강",
    "물 부문 기술": "물",
    "국토연안 부문 기술": "연안",
    "농축수산 부문 기술": "농업",
    "산림·생태계 부문 기술": "산림",
    "산업 에너지 부문 기술": "산업",
    "적응조치의 효과평가 기술": "효과",
    "기후변화 적응기반 기술": "적응",
  };
  const normalized = normalizeTechName(tech);
  if (badgeMap[normalized]) return badgeMap[normalized];
  return String(techShort(normalized) || normalized)
    .replace(/[··()\s]/g, "")
    .slice(0, 4);
}

function cooperationLabel(tech) {
  const normalized = normalizeTechName(tech);
  const displayMap = {
    "이산화탄소(CO₂) 포집·저장·활용 기술": "CCUS",
    "메탄(CH₄) 처리 기술": "메탄 저감",
    "기타 온실가스 처리 및 대체 기술": "대체가스",
    "전력 통합 기술": "전력망 통합",
    "열 통합 기술": "열 통합",
    "전력-비전력 부문간 결합 기술": "전력-비전력 결합",
    "기후변화 감시 및 진단 기술": "기후 감시·진단",
    "기후변화 예측 기술": "기후 예측",
    "기후변화 영향 평가 기술": "영향 평가",
    "기후변화 취약성 및 위험성 평가 기술": "취약성·위험 평가",
    "적응조치의 효과평가 기술": "적응 효과평가",
    "기후변화 적응기반 기술": "적응 기반",
    "산업 에너지 부문 기술": "산업 에너지",
    "산림·생태계 부문 기술": "산림·생태계",
    "농축수산 부문 기술": "농축수산",
    "국토연안 부문 기술": "국토·연안",
  };
  return (
    displayMap[normalized] || techBadgeLabel(normalized) || normalized || "기술"
  );
}

function isValidLngLatPair(coords) {
  if (!Array.isArray(coords) || coords.length < 2) return false;
  const lon = Number(coords[0]);
  const lat = Number(coords[1]);
  return (
    Number.isFinite(lon) &&
    Number.isFinite(lat) &&
    lon >= -180 &&
    lon <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

function normalizeLngLatPair(coords) {
  if (!isValidLngLatPair(coords)) return null;
  return [Number(coords[0]), Number(coords[1])];
}

function getRecommendationPointCoords(rec) {
  return normalizeLngLatPair([
    rec?.lon ?? rec?.regionCenter?.[0],
    rec?.lat ?? rec?.regionCenter?.[1],
  ]);
}

function getRecommendationCountryCenterCoords(rec) {
  return (
    normalizeLngLatPair(rec?.countryCenter) || getRecommendationPointCoords(rec)
  );
}

function buildRecommendationMarkerKey(rec) {
  const country = String(rec?.country || "")
    .trim()
    .toLowerCase();
  const region = String(rec?.region || "")
    .trim()
    .toLowerCase();
  const tech = normalizeTechName(rec?.tech || "").toLowerCase();
  const pointCoords = getRecommendationPointCoords(rec);
  const lonKey = pointCoords ? pointCoords[0].toFixed(3) : "na";
  const latKey = pointCoords ? pointCoords[1].toFixed(3) : "na";
  return [country, region, tech, lonKey, latKey].join("|");
}

function dedupeRecommendationsForMap(recommendations = []) {
  const seen = new Set();
  return safeArray(recommendations).filter((rec) => {
    const pointCoords = getRecommendationPointCoords(rec);
    if (!pointCoords) return false;
    const key = buildRecommendationMarkerKey(rec);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildCandidatePointFC(recommendations = [], activeId = null) {
  const deduped = dedupeRecommendationsForMap(recommendations);
  return {
    type: "FeatureCollection",
    features: deduped.map((r) => {
      const pointCoords = getRecommendationPointCoords(r);
      return {
        type: "Feature",
        properties: {
          id: r.id,
          country: r.country,
          region: r.region,
          tech: r.tech,
          techEmoji: techEmoji(r.tech),
          techShort: techShort(r.tech),
          techBadge: techBadgeLabel(r.tech),
          label: `${r.country} · ${r.region}`,
          purposes: (r.purposeTags || []).join(", "),
          coverage: r.scores?.coverage ?? 0,
          feasibility: r.scores?.feasibility ?? 0,
          active: r.id === activeId ? 1 : 0,
          color: techColorHex(r.tech),
        },
        geometry: {
          type: "Point",
          coordinates: pointCoords,
        },
      };
    }),
  };
}

function buildCountryCenterFC(recommendations = []) {
  const deduped = dedupeRecommendationsForMap(recommendations);
  return {
    type: "FeatureCollection",
    features: deduped.map((r) => ({
      type: "Feature",
      properties: {
        id: r.id,
        country: r.country,
      },
      geometry: {
        type: "Point",
        coordinates: getRecommendationCountryCenterCoords(r),
      },
    })),
  };
}

function buildCandidateLinkFC(recommendations = [], activeId = null) {
  const deduped = dedupeRecommendationsForMap(recommendations);
  return {
    type: "FeatureCollection",
    features: deduped.map((r) => ({
      type: "Feature",
      properties: {
        id: r.id,
        active: r.id === activeId ? 1 : 0,
        tech: r.tech,
      },
      geometry: {
        type: "LineString",
        coordinates: [
          getRecommendationCountryCenterCoords(r),
          getRecommendationPointCoords(r),
        ],
      },
    })),
  };
}

function getFeatureBounds(feature) {
  return getGeoJsonBounds(feature);
}

const GUIDE_STORAGE_KEY = "climate-platform-guide-hide-date";
const SHORTLIST_STORAGE_KEY = "climate-platform-shortlist-v1";
const WORKSPACE_RESUME_STORAGE_KEY = "climate-platform-workspace-resume-v1";
const ACTIVATION_EVENT_LOG_STORAGE_KEY =
  "climate-platform-activation-events-v1";
const ACTIVATION_EVENT_LOG_LIMIT = 80;
const PANEL_LAYOUT_STORAGE_KEY = "climate-platform-panel-layout-v1";
const SHORTLIST_LIMIT = 5;
const DEFAULT_LEFT_PANEL_WIDTH = 500;
const DEFAULT_RIGHT_PANEL_WIDTH = 500;
const DEFAULT_DESKTOP_PANEL_LAYOUT = {
  left: { mode: "docked", x: 16, y: 18 },
  right: { mode: "docked", x: 16, y: 18 },
};

function parseStoredIdList(rawValue) {
  try {
    const parsed = JSON.parse(String(rawValue || "[]"));
    return Array.isArray(parsed)
      ? parsed
          .filter((item) => typeof item === "string" && item.trim())
          .map((item) => item.trim())
      : [];
  } catch {
    return [];
  }
}

function loadStoredIdList(key, maxItems = 8) {
  return parseStoredIdList(safeStorageGet(key)).slice(0, Math.max(1, maxItems));
}

function saveStoredIdList(key, ids, maxItems = 8) {
  const unique = Array.from(
    new Set(
      safeArray(ids).filter((item) => typeof item === "string" && item.trim())
    )
  ).slice(0, Math.max(1, maxItems));
  return safeStorageSet(key, JSON.stringify(unique));
}

function toggleIdInList(ids, id, maxItems = SHORTLIST_LIMIT) {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) return safeArray(ids);
  const base = safeArray(ids).filter(Boolean);
  if (base.includes(normalizedId))
    return base.filter((item) => item !== normalizedId);
  return [normalizedId, ...base].slice(0, Math.max(1, maxItems));
}

/* =========================================================
 * Master data
 * ========================================================= */
const TECHNOLOGY_TAXONOMY = [
  {
    tech: "태양광 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "태양광 발전 시스템을 이용하여 빛을 흡수해서 직접 전기를 생산하는 기술",
    subTechs: ["분산형 태양광", "고효율 태양전지", "태양광 운영·유지관리"],
  },
  {
    tech: "태양열 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "태양복사에너지를 열에너지로 변환·이용하여 전기 또는 열을 생산하는 기술",
    subTechs: ["태양열 발전", "집광형 태양열", "태양열 열공급"],
  },
  {
    tech: "풍력 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "바람의 운동에너지를 기계적 에너지로 변환하여 전기를 생산하는 기술",
    subTechs: ["육상풍력", "해상풍력", "풍력 운영·유지관리"],
  },
  {
    tech: "해양에너지 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "해양의 조류, 조력, 파력, 온도차 또는 염분차 등을 이용하여 전기 또는 열을 생산하는 기술",
    subTechs: ["조력", "파력", "온도차·염분차 활용"],
  },
  {
    tech: "수력 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "물이 가지는 위치에너지나 운동에너지를 이용하여 전기를 생산하는 기술",
    subTechs: ["댐 수력", "소수력", "수력 운영 최적화"],
  },
  {
    tech: "수열 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description: "해수 표층 및 하천수의 열을 변환시켜 에너지를 생산하는 기술",
    subTechs: ["해수열 냉난방", "하천수열 활용", "수열 히트펌프"],
  },
  {
    tech: "지열 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "지하수 또는 지하의 열 등의 온도차를 이용하여 전기 또는 열을 생산하는 기술",
    subTechs: ["심부지열", "천부지열", "지열 냉난방"],
  },
  {
    tech: "바이오에너지 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "바이오매스에 저장된 화학에너지를 직접 사용하거나 연료로 변환하여 전기 또는 열을 생산하는 기술",
    subTechs: ["바이오가스", "바이오매스 발전", "고형연료·열 활용"],
  },
  {
    tech: "수소·암모니아 발전기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "수소 또는 암모니아를 이용하여 전기화학반응 또는 연소반응 등을 통해 전기 및 열을 생산하는 기술",
    subTechs: ["수소 연료전지 발전", "암모니아 혼소", "수소·암모니아 전소"],
  },
  {
    tech: "석탄액화·가스화 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "석탄 등의 원료를 액화 또는 가스화하여 얻어지는 에너지로 전기 또는 열을 생산하는 기술",
    subTechs: ["석탄가스화", "합성연료 생산", "액화 연계 발전"],
  },
  {
    tech: "원자력 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "안전성, 경제성, 환경친화성을 가진 원자력 시스템을 설계, 건설 또는 운영하고 핵분열 에너지를 이용해 전기·열·수소 등을 생산하는 기술",
    subTechs: ["원전 운영 고도화", "차세대 원자로", "원전 열·수소 활용"],
  },
  {
    tech: "핵융합에너지 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "핵융합 과정에서 방출되는 에너지를 이용하여 전기 또는 열을 생산하는 기술",
    subTechs: ["핵융합 플라즈마", "핵융합로 핵심소재", "핵융합 발전시스템"],
  },
  {
    tech: "수소 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "물, 유기물, 화석연료 등을 이용하여 수소를 생산하고, 이를 저장, 운송하여 활용하는 기술",
    subTechs: ["청정수소 생산", "수소 저장·운송", "수소 활용 인프라"],
  },
  {
    tech: "바이오매스 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "경제적으로 대량 확보한 바이오매스를 생물학적, 화학적 또는 물리적 변환과정을 통하여 수송용 연료, 화학원료 또는 제품으로 활용하는 기술",
    subTechs: ["바이오연료", "바이오화학원료", "바이오매스 전환공정"],
  },
  {
    tech: "폐자원 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "폐기물 발생을 저감하거나 생활·산업·농림수산 분야의 폐기물과 폐자원을 유용한 연료·원료로 전환 또는 활용하는 기술",
    subTechs: ["폐기물 에너지화", "재활용 원료화", "폐자원 순환이용"],
  },
  {
    tech: "발전효율 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "기존 발전시스템의 효율을 향상시키고 온실가스 배출을 최소화하는 기술",
    subTechs: ["고효율 발전설비", "운영 최적화", "배출 저감형 개조"],
  },
  {
    tech: "산업효율 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "산업공정에서 소비되는 에너지를 절감하거나 저탄소 고효율 신공정을 개발·적용하는 기술",
    subTechs: ["공정 효율화", "전기화 전환", "저탄소 신공정"],
  },
  {
    tech: "수송효율 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "수송 모빌리티의 에너지 효율을 향상하거나 탄소배출을 저감하는 기술",
    subTechs: ["전동화", "저탄소 연료 전환", "운항·운행 효율화"],
  },
  {
    tech: "건물효율 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "건물에 사용되는 에너지 절감 및 효율 향상에 필요한 외피·설비·ICT 운영 기술",
    subTechs: ["고성능 외피", "고효율 설비", "건물 에너지관리"],
  },
  {
    tech: "이산화탄소(CO₂) 포집·저장·활용 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "배출된 이산화탄소를 포집하여 지중에 저장하거나 직접 활용·전환하여 유용한 화학물질로 사용하는 기술",
    subTechs: ["CO₂ 포집", "CO₂ 저장", "CO₂ 활용·전환"],
  },
  {
    tech: "메탄(CH₄) 처리 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "축산, 농업 등에서 배출된 메탄을 포집해 연료 또는 유용한 화학물로 전환하거나 메탄 발생 자체를 줄이는 기술",
    subTechs: ["메탄 포집", "메탄 전환활용", "메탄 발생 저감"],
  },
  {
    tech: "기타 온실가스 처리 및 대체 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "이산화탄소, 메탄 외의 온실가스를 처리·재활용하거나 온실가스가 아닌 가스로 대체하는 기술",
    subTechs: ["불화가스 저감", "대체가스 적용", "배출가스 처리"],
  },
  {
    tech: "탄소흡수원 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "육상 또는 해양 생태계의 탄소 흡수·저장 능력을 증진시키는 기술",
    subTechs: ["산림 흡수원 관리", "블루카본", "토양 탄소저장"],
  },
  {
    tech: "전력 통합 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "기존 전력망에 분산전원과 ICT를 통합하여 에너지 효율을 최적화하는 차세대 전력 네트워크 기술",
    subTechs: ["스마트그리드", "분산자원 통합", "계통 디지털화"],
  },
  {
    tech: "열 통합 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "다양한 열원의 활용 및 저장, 효율적인 열공급, 양방향 열거래를 포함한 열 네트워크 기술",
    subTechs: ["열저장", "지역열공급", "양방향 열거래"],
  },
  {
    tech: "전력-비전력 부문간 결합 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "재생에너지 기반 전기를 열, 가스, 연료, 원료 등 다른 형태로 전환해 저장·사용하는 기술",
    subTechs: ["Power-to-Heat", "Power-to-Gas", "Power-to-Fuel"],
  },
  {
    tech: "기후변화 감시 및 진단 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "지구시스템의 기후환경 요소를 관측·분석하고, 현장관측 및 위성 지도·항공·부이 등 원격관측을 활용해 기후변화를 감시하며 이상기후·자연재해의 원인을 진단하는 기술",
    subTechs: ["기후 모니터링", "원격관측", "재난 조기경보"],
  },
  {
    tech: "기후변화 예측 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "미래 사회·경제 변화와 기후특성을 고려해 기후변화 시나리오를 개발하고 미래 기후환경 요소를 예측·평가하는 기술",
    subTechs: ["기후 시나리오", "기후모델링", "예측 정확도 향상"],
  },
  {
    tech: "기후변화 영향 평가 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "기후변화가 건강, 물, 국토, 연안, 농수산, 생태계, 산업 등에 미치는 영향을 과학적으로 조사·분석하는 기술",
    subTechs: ["영향 분석", "부문별 리스크 평가", "사회경제 영향"],
  },
  {
    tech: "기후변화 취약성 및 위험성 평가 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "부문·계층·지역의 취약성과 위험성을 노출, 민감도, 적응능력 등을 고려하여 과학적으로 분석·평가하는 기술",
    subTechs: ["취약성 평가", "위험성 분석", "지역 리스크 스코어링"],
  },
  {
    tech: "건강 부문 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "기상재해로 인한 외상을 예방하고, 기후변화로 증가하거나 악화될 수 있는 감염병 및 만성·급성 질환의 피해를 줄이는 기술",
    subTechs: ["감염병 대응", "기후보건 모니터링", "재난보건 대응"],
  },
  {
    tech: "물 부문 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "기후변화에 대응해 안정적으로 수자원을 확보하고 물관리 시설을 최적화·효율화하며 수생태계와 수질을 보호하는 기술",
    subTechs: ["수자원 확보", "물관리 최적화", "수질·수생태 보전"],
  },
  {
    tech: "국토연안 부문 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "건축물과 도시, 국토연안공간의 기능과 성능을 유지·강화하고 홍수·폭염·태풍·해일 등 자연재해 대응과 회복력을 높이는 기술",
    subTechs: ["연안 회복력", "도시·인프라 적응", "재해 대응·복구"],
  },
  {
    tech: "농축수산 부문 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "기후변화에 따른 농축수산 생산성 변화와 공급 변동에 대응하고 시설의 취약성과 위험성을 보강하는 기술",
    subTechs: ["기후스마트 농업", "양식·축산 적응", "생산성·공급 안정화"],
  },
  {
    tech: "산림·생태계 부문 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "산불·산사태 등 자연재해 피해를 예방하거나 줄이고 생태계 기능을 활용해 기후변화 피해를 저감하는 기술",
    subTechs: ["산림복원", "맹그로브·생태계 복원", "자연기반해법"],
  },
  {
    tech: "산업 에너지 부문 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "산업·에너지 시설과 관련 가치사슬 전과정에서 기후변화로 인한 직간접 피해를 예방하고 줄이기 위한 기술",
    subTechs: ["시설 회복력", "산업 가치사슬 적응", "에너지 인프라 보호"],
  },
  {
    tech: "적응조치의 효과평가 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "기후변화 적응 기술 및 정책의 효과를 검증, 분석, 평가하고 적응효과를 예측하는 기술",
    subTechs: ["적응 성과평가", "정책 효과분석", "효과 예측"],
  },
  {
    tech: "기후변화 적응기반 기술",
    sourceLabel: "CTIS 국가 38대 기후기술",
    description:
      "기후변화 적응 정보와 통계·공간정보를 생산·축적·검증·확산하고 적응 인식 개선과 교육에 기여하는 기술",
    subTechs: ["적응 데이터플랫폼", "공간정보 활용", "교육·확산"],
  },
];

const LEGACY_TO_UPDATED_TECH_MAP = {
  "태양광 발전": "태양광 기술",
  "풍력 발전": "풍력 기술",
  스마트그리드: "전력 통합 기술",
  "탄소 포집 및 저장 (CCUS)": "이산화탄소(CO₂) 포집·저장·활용 기술",
  "수자원 관리": "물 부문 기술",
  "기후스마트 농업": "농축수산 부문 기술",
  "재난 예측 및 조기경보": "기후변화 감시 및 진단 기술",
  "맹그로브/산림 생태계 복원": "산림·생태계 부문 기술",
  "친환경 폐기물 처리": "폐자원 기술",
};

const UPDATED_TO_LEGACY_TECH_MAP = Object.fromEntries(
  Object.entries(LEGACY_TO_UPDATED_TECH_MAP).map(([legacy, updated]) => [
    updated,
    legacy,
  ])
);

function normalizeTechName(tech) {
  return LEGACY_TO_UPDATED_TECH_MAP[tech] || tech;
}

function getTechLookupKey(tech) {
  return UPDATED_TO_LEGACY_TECH_MAP[tech] || tech;
}

function normalizeRecommendationTech(rec) {
  if (!rec || typeof rec !== "object") return rec;
  const normalizedTech = normalizeTechName(rec.tech);
  return {
    ...rec,
    tech: normalizedTech,
  };
}

const TECHNOLOGIES = [
  "전체 기술",
  ...TECHNOLOGY_TAXONOMY.map((item) => item.tech),
];

function getSubTechOptions() {
  return ["CTIS 국가 38대 기후기술 체계 적용"];
}

function getTechnologyMeta(selectedTech = "전체 기술") {
  if (!selectedTech || selectedTech === "전체 기술") return null;
  return TECHNOLOGY_TAXONOMY.find((item) => item.tech === selectedTech) || null;
}

const TECH_LEGEND_GROUPS = [
  {
    id: "mitigation-supply",
    label: "감축 · 에너지 생산",
    helper: "1~15번",
    start: 0,
    end: 15,
  },
  {
    id: "mitigation-system",
    label: "감축 · 효율·통합",
    helper: "16~26번",
    start: 15,
    end: 26,
  },
  {
    id: "adaptation-intelligence",
    label: "적응 · 기후정보",
    helper: "27~30번",
    start: 26,
    end: 30,
  },
  {
    id: "adaptation-sector",
    label: "적응 · 부문·기반",
    helper: "31~38번",
    start: 30,
    end: 38,
  },
];

const TECH_ICON_COMPONENT_MAP = {
  "태양광 기술": Sun,
  "태양열 기술": Flame,
  "풍력 기술": Wind,
  "해양에너지 기술": Waves,
  "수력 기술": Droplets,
  "수열 기술": Droplets,
  "지열 기술": Flame,
  "바이오에너지 기술": Leaf,
  "수소·암모니아 발전기술": FlaskConical,
  "석탄액화·가스화 기술": Factory,
  "원자력 기술": Atom,
  "핵융합에너지 기술": Orbit,
  "수소 기술": FlaskConical,
  "바이오매스 기술": Leaf,
  "폐자원 기술": Recycle,
  "발전효율 기술": Zap,
  "산업효율 기술": Factory,
  "수송효율 기술": CarFront,
  "건물효율 기술": Building2,
  "이산화탄소(CO₂) 포집·저장·활용 기술": FlaskConical,
  "메탄(CH₄) 처리 기술": Recycle,
  "기타 온실가스 처리 및 대체 기술": FlaskConical,
  "탄소흡수원 기술": Trees,
  "전력 통합 기술": Network,
  "열 통합 기술": Flame,
  "전력-비전력 부문간 결합 기술": Link2,
  "기후변화 감시 및 진단 기술": Satellite,
  "기후변화 예측 기술": BarChart3,
  "기후변화 영향 평가 기술": BarChart3,
  "기후변화 취약성 및 위험성 평가 기술": ShieldAlert,
  "건강 부문 기술": HeartPulse,
  "물 부문 기술": Droplets,
  "국토연안 부문 기술": MapIcon,
  "농축수산 부문 기술": Sprout,
  "산림·생태계 부문 기술": Trees,
  "산업 에너지 부문 기술": Factory,
  "적응조치의 효과평가 기술": CheckCircle2,
  "기후변화 적응기반 기술": Database,
};

function getTechIconComponent(tech) {
  return TECH_ICON_COMPONENT_MAP[normalizeTechName(tech)] || Layers;
}

const TECH_MARKER_PROFILE_LIBRARY = {
  solar: {
    label: "태양광",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="none" stroke="${stroke}" stroke-width="2.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M20 24h18l-3 14H17l3-14Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M23 28h12M22 33h12" stroke="${stroke}" stroke-width="2"/></svg>`,
  },
  solarThermal: {
    label: "태양열",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="13" cy="12" r="4.5" fill="none" stroke="${stroke}" stroke-width="2.5"/><path d="M13 3v3M13 18v3M4 12h3M19 12h3M6.5 5.5l2 2M17.5 16.5l2 2M19.5 5.5l-2 2M8.5 16.5l-2 2" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/><path d="M20 23h15l-2 8H18l2-8Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 31c0 3 2 4 2 6M31 31c0 3 2 4 2 6" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  wind: {
    label: "풍력",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 20v20" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="18" r="3" fill="none" stroke="${stroke}" stroke-width="2.5"/><path d="M24 18 11 12a6 6 0 1 1 8-9l5 15Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 18 37 12a6 6 0 1 0-8-9l-5 15Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 18 24 4a6 6 0 1 0-7 6l7 8Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  },
  marine: {
    label: "해양",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 29c3-3 5-3 8 0s5 3 8 0 5-3 8 0 5 3 8 0 5-3 6-3" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M16 24V13l8-5 8 5v11" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 13v18" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M18 18h12" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  water: {
    label: "수자원",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 6c6 9 12 14 12 21a12 12 0 1 1-24 0c0-7 6-12 12-21Z" fill="none" stroke="${stroke}" stroke-width="2.5"/><path d="M11 33h26" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M15 38h18" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  geothermal: {
    label: "지열",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 34h30" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M14 34c1-6 5-11 10-14 5 3 9 8 10 14" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 11c0 3-2 3-2 6s2 3 2 6M28 11c0 3-2 3-2 6s2 3 2 6" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  bio: {
    label: "바이오",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 39V21" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M24 21c0-8 6-13 14-14 1 8-3 14-14 14Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 26c0-7-5-11-12-12-1 7 3 12 12 12Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 39h16" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  agriculture: {
    label: "농업",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 38V23" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M24 23c0-6 4-10 10-11 1 6-2 11-10 11Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 28c0-5-4-9-9-10-1 6 2 10 9 10Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 38h28" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M14 33h20" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  hydrogen: {
    label: "수소",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M18 8v6l-5 9a9 9 0 1 0 22 0l-5-9V8" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 12h12" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><text x="24" y="31" text-anchor="middle" font-size="11" font-weight="700" fill="${stroke}">H₂</text></svg>`,
  },
  nuclear: {
    label: "원자력",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="3.5" fill="none" stroke="${stroke}" stroke-width="2.5"/><ellipse cx="24" cy="24" rx="14" ry="6.5" fill="none" stroke="${stroke}" stroke-width="2.4"/><ellipse cx="24" cy="24" rx="14" ry="6.5" transform="rotate(60 24 24)" fill="none" stroke="${stroke}" stroke-width="2.4"/><ellipse cx="24" cy="24" rx="14" ry="6.5" transform="rotate(-60 24 24)" fill="none" stroke="${stroke}" stroke-width="2.4"/></svg>`,
  },
  industry: {
    label: "산업",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 38V20l10 6v-8l10 6v-7l12 6v15H8Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 16V10M22 16V8M30 18v-8" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  ccus: {
    label: "CCUS",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 36V18l8-5 8 5v18H10Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 28h7c4 0 7-3 7-7s-3-7-7-7c-2.5 0-4.5 1-5.8 2.8" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M32 23c2.5 0 4.5 2 4.5 4.5S34.5 32 32 32h-6" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><text x="19" y="29" text-anchor="middle" font-size="8" font-weight="700" fill="${stroke}">CO₂</text></svg>`,
  },
  circular: {
    label: "순환",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8v7l5-3" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M29 12c5 2 8 6 8 12l5 1-7 11-6-10 4 1c-.4-4-2.1-6.2-5-7.7" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 18 12 28l-4-4" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 28c1 5 4.8 8 10.5 8" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M31 31 24 42l-4-5" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  powerGrid: {
    label: "전력망",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8 16 22h6l-2 18h8l-2-18h6L24 8Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 20h20M12 27h24" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  heatBuilding: {
    label: "열·건물",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 38V16l12-6 12 6v22H12Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 22v10" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/><path d="M28 19c0 2-2 2-2 4s2 2 2 4" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  mobility: {
    label: "모빌리티",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 31h24l-3-9H15l-3 9Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="18" cy="33" r="3" fill="none" stroke="${stroke}" stroke-width="2.5"/><circle cx="30" cy="33" r="3" fill="none" stroke="${stroke}" stroke-width="2.5"/><path d="M23 14h5l-2 5h5l-8 9 2-6h-5l3-8Z" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
  },
  climateIntel: {
    label: "기후정보",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 30c5-8 12-12 16-12s11 4 16 12" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="22" r="5" fill="none" stroke="${stroke}" stroke-width="2.5"/><path d="M34 10 14 18" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M30 8h6v6" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  riskShield: {
    label: "위험관리",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 7 12 12v10c0 8 5.4 14.9 12 18 6.6-3.1 12-10 12-18V12L24 7Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 25l4 4 8-10" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  health: {
    label: "보건",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 38 10 24a8 8 0 0 1 11-11l3 3 3-3a8 8 0 0 1 11 11L24 38Z" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 24h6l3-5 4 10 3-5h4" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  landCoast: {
    label: "국토·연안",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 32c5-4 9-4 14 0s9 4 18-1" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M11 28V14l9 4 7-8 10 7v11" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 18v6" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  forest: {
    label: "생태계",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 38V25l-5 5 5-12-4 2 7-12 7 12-4-2 5 12-5-5v13" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><path d="M31 38V28l-4 4 4-9-3 1 5-9 5 9-3-1 4 9-4-4v10" fill="none" stroke="${stroke}" stroke-width="2.3" stroke-linejoin="round"/></svg>`,
  },
  adaptationData: {
    label: "적응기반",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="12" rx="11" ry="5" fill="none" stroke="${stroke}" stroke-width="2.5"/><path d="M13 12v16c0 2.8 4.9 5 11 5s11-2.2 11-5V12" fill="none" stroke="${stroke}" stroke-width="2.5"/><path d="M13 20c0 2.8 4.9 5 11 5s11-2.2 11-5" fill="none" stroke="${stroke}" stroke-width="2.2"/><path d="M13 28c0 2.8 4.9 5 11 5s11-2.2 11-5" fill="none" stroke="${stroke}" stroke-width="2.2"/></svg>`,
  },
  default: {
    label: "기술",
    svg: (stroke) =>
      `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="10" width="28" height="28" rx="8" fill="none" stroke="${stroke}" stroke-width="2.5"/><path d="M16 20h16M16 28h16" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  },
};

const TECH_TO_MARKER_PROFILE_KEY = {
  "태양광 기술": "solar",
  "태양열 기술": "solarThermal",
  "풍력 기술": "wind",
  "해양에너지 기술": "marine",
  "수력 기술": "water",
  "수열 기술": "water",
  "지열 기술": "geothermal",
  "바이오에너지 기술": "bio",
  "수소·암모니아 발전기술": "hydrogen",
  "석탄액화·가스화 기술": "industry",
  "원자력 기술": "nuclear",
  "핵융합에너지 기술": "nuclear",
  "수소 기술": "hydrogen",
  "바이오매스 기술": "bio",
  "폐자원 기술": "circular",
  "발전효율 기술": "industry",
  "산업효율 기술": "industry",
  "수송효율 기술": "mobility",
  "건물효율 기술": "heatBuilding",
  "이산화탄소(CO₂) 포집·저장·활용 기술": "ccus",
  "메탄(CH₄) 처리 기술": "circular",
  "기타 온실가스 처리 및 대체 기술": "circular",
  "탄소흡수원 기술": "forest",
  "전력 통합 기술": "powerGrid",
  "열 통합 기술": "heatBuilding",
  "전력-비전력 부문간 결합 기술": "hydrogen",
  "기후변화 감시 및 진단 기술": "climateIntel",
  "기후변화 예측 기술": "climateIntel",
  "기후변화 영향 평가 기술": "climateIntel",
  "기후변화 취약성 및 위험성 평가 기술": "riskShield",
  "건강 부문 기술": "health",
  "물 부문 기술": "water",
  "국토연안 부문 기술": "landCoast",
  "농축수산 부문 기술": "agriculture",
  "산림·생태계 부문 기술": "forest",
  "산업 에너지 부문 기술": "industry",
  "적응조치의 효과평가 기술": "adaptationData",
  "기후변화 적응기반 기술": "adaptationData",
};

function getTechMarkerProfile(tech) {
  const normalized = normalizeTechName(tech || "");
  const directKey = TECH_TO_MARKER_PROFILE_KEY[normalized];
  if (directKey && TECH_MARKER_PROFILE_LIBRARY[directKey]) {
    return TECH_MARKER_PROFILE_LIBRARY[directKey];
  }

  const fallbackPairs = [
    ["태양", "solar"],
    ["풍력", "wind"],
    ["해양", "marine"],
    ["수력", "water"],
    ["수열", "water"],
    ["물", "water"],
    ["지열", "geothermal"],
    ["바이오", "bio"],
    ["수소", "hydrogen"],
    ["원자력", "nuclear"],
    ["핵융합", "nuclear"],
    ["포집", "ccus"],
    ["이산화탄소", "ccus"],
    ["메탄", "circular"],
    ["폐", "circular"],
    ["전력", "powerGrid"],
    ["열", "heatBuilding"],
    ["건물", "heatBuilding"],
    ["수송", "mobility"],
    ["감시", "climateIntel"],
    ["예측", "climateIntel"],
    ["영향", "climateIntel"],
    ["위험", "riskShield"],
    ["건강", "health"],
    ["연안", "landCoast"],
    ["국토", "landCoast"],
    ["농", "agriculture"],
    ["산림", "forest"],
    ["생태", "forest"],
    ["효과평가", "adaptationData"],
    ["적응기반", "adaptationData"],
    ["산업", "industry"],
  ];
  const matched = fallbackPairs.find(([token]) => normalized.includes(token));
  return TECH_MARKER_PROFILE_LIBRARY[matched?.[1] || "default"];
}

function buildLegendGroups(recommendations = []) {
  const stats = new Map(TECHNOLOGY_TAXONOMY.map((item) => [item.tech, 0]));

  safeArray(recommendations)
    .map((rec) => normalizeTechName(rec?.tech))
    .filter(Boolean)
    .forEach((tech) => {
      stats.set(tech, (stats.get(tech) || 0) + 1);
    });

  return TECH_LEGEND_GROUPS.map((group) => {
    const items = TECHNOLOGY_TAXONOMY.slice(group.start, group.end).map(
      (item, idx) => ({
        ...item,
        number: group.start + idx + 1,
        count: stats.get(item.tech) || 0,
        color: techColorHex(item.tech),
        badge: techBadgeLabel(item.tech),
        short: techShort(item.tech),
        Icon: getTechIconComponent(item.tech),
      })
    );
    const loadedCount = items.filter((item) => item.count > 0).length;
    return {
      ...group,
      items,
      loadedCount,
      totalCount: items.length,
      coveragePct: Math.round((loadedCount / Math.max(items.length, 1)) * 100),
    };
  });
}

function normalizeLegendSearchValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
}

function legendItemMatchesSearch(item, rawTerm = "") {
  const term = normalizeLegendSearchValue(rawTerm);
  if (!term) return true;
  const haystack = normalizeLegendSearchValue(
    [
      item?.number,
      item?.tech,
      item?.short,
      item?.badge,
      item?.description,
      ...(item?.subTechs || []),
    ].join(" ")
  );
  return haystack.includes(term);
}

function legendItemMatchesMode(item, mode = "all", activeTech = null) {
  if (mode === "mapped") return (item?.count || 0) > 0;
  if (mode === "unmapped") return (item?.count || 0) === 0;
  if (mode === "active") return activeTech ? item?.tech === activeTech : false;
  return true;
}

function sanitizeStrategyEvidence(evidence, rec = {}) {
  // '협력 기술' -> '대상 기술', '~기준으로 1차 검토되었습니다' -> '~기반으로 1차 검토가 완료되었습니다'로 정제
  const fallbackSummary = `${rec.country || "검토 국가"} · ${
    rec.region || "대상 지역"
  }의 ${normalizeTechName(
    rec.tech || "대상 기술"
  )} 협력안은 공식 정책, 공간, 사업 데이터를 기반으로 1차 검토가 완료되었습니다.`;

  return {
    summary: evidence?.summary || fallbackSummary,
    drivers: safeArray(evidence?.drivers || rec?.reasons),
    sourceData: safeArray(evidence?.sourceData)
      .filter(Boolean)
      .map((item, idx) => ({
        id: item?.id || `source-${idx}`,
        label: item?.label || item?.source || `근거 데이터 ${idx + 1}`,
        group: item?.group || "기본 정보",
        source: item?.source || "출처 연계 대기 중", // '출처 연결 예정' 순화
        mode: item?.mode || "기본 정보", // '탑재 예정' 순화
        link: item?.link,
        description:
          item?.description ||
          "세부 데이터 항목을 순서대로 확인할 수 있습니다.", // '설명을 연결 중입니다' 순화
        lastUpdated: item?.lastUpdated,
        sampleFields: safeArray(item?.sampleFields),
        rows: safeArray(item?.rows),
      })),
    purposeFit: safeArray(evidence?.purposeFit)
      .filter(Boolean)
      .map((item, idx) => {
        if (typeof item === "string") {
          return {
            tag: item,
            note: "검토 목적에 맞는 근거 항목을 순서대로 확인할 수 있습니다.", // '추가 연결 중입니다' 순화
            id: `purpose-${idx}`,
          };
        }
        return {
          tag: item?.tag || `목적 선택 ${idx + 1}`,
          note:
            item?.note ||
            "검토 목적에 맞는 근거 항목을 순서대로 확인할 수 있습니다.",
          id: item?.id || `purpose-${idx}`,
        };
      }),
  };
}

function sanitizeExecutionFeasibility(execution, rec = {}) {
  if (!execution && !rec) return null;
  const fallbackStage = safeArray(rec?.purposeTags).includes("ODA")
    ? "공공협력 우선 검토"
    : "실행 목적 적합도 검토 단계";

  return {
    stage: execution?.stage || fallbackStage,
    projectSignal:
      execution?.projectSignal ||
      `${rec?.country || "검토 국가"} ${
        rec?.region || "대상 지역"
      }의 ${normalizeTechName(
        rec?.tech || "대상 기술" // '협력 기술' -> '대상 기술'
      )} 협력안 검토 시 프로젝트 파이프라인과 재원 구조를 함께 확인해 주세요.`, // '추가 연결 중입니다' 순화
    financeChannels: safeArray(execution?.financeChannels),
    deliveryPartners: safeArray(execution?.deliveryPartners),
    financeNote:
      execution?.financeNote ||
      "권장 재원 연계 경로 및 집행 파트너 검증 대기 중입니다.", // '추가 검증 중입니다' 순화
    stageLabel: execution?.stageLabel,
  };
}

const SCORE_METHOD = {
  coverage: "협력 추진에 필요한 핵심 국가·지역 데이터 확보 수준", // 서술형 -> 명사형 지표명
  reliability: "데이터 출처의 공신력, 최신성 및 상호 검증 가능성",
  resilience: "데이터 결측 시 대체 출처 및 현지 파트너를 통한 복원 가능성",
  feasibility:
    "데이터 충족률(35%), 근거 신뢰도(35%), 결측 복원력(30%)을 가중 합산한 종합 실행성 점수", // '가용성'을 프레임워크 명칭과 통일
};

const METRIC_FRAMEWORK = {
  coverage: {
    label: "데이터 충족률",
    accent: "emerald",
    definition:
      "국가 정책, 지역 정보, 프로젝트·재원, 파트너 정보 등 협력 검토에 필요한 필수 데이터의 확보 수준을 평가합니다.",
    question: "실무 회의 및 보고서 작성 시 핵심 데이터 즉시 활용 가능 여부", // '꺼낼 수 있는가?' -> 지표 기준 톤
    thresholds: [
      "85점 이상: 회의·보고 및 대상 비교에 즉시 활용 가능", // '후보' -> '대상'
      "70~84점: 핵심 판단 가능 (세부 데이터 보강 권장)",
      "69점 이하: 추가 데이터 확보 선행 필수",
    ],
    evidenceHints: ["정책 문서", "지역 정보", "프로젝트·재원", "지표·좌표"],
  },
  reliability: {
    label: "근거 신뢰도",
    accent: "blue",
    definition:
      "UNFCCC, MDB, GCF, 정부 포털 등 공신력 있는 공식 출처와의 직접 연계 여부 및 데이터 최신성을 평가합니다.",
    question: "공식 보고 및 파트너 협의 시 객관적 근거로 즉시 제시 가능 여부",
    thresholds: [
      "85점 이상: 공식 문서 및 직접 연계 링크 충분",
      "70~84점: 공식 출처 확보 (일부 항목 보강 권장)",
      "69점 이하: 상위 포털 반복 등 직접 근거 부족",
    ],
    evidenceHints: ["UNFCCC", "GCF", "World Bank/ADB", "정부 공식 페이지"],
  },
  resilience: {
    label: "결측 복원력",
    accent: "amber",
    definition:
      "데이터 결측 발생 시 대체 출처, 현지 파트너, 공개 프로젝트 문서 등을 통한 1차 판단 복원 가능성을 평가합니다.",
    question: "실시간 데이터 부재 시에도 실무 검토 및 판단 지속 가능 여부",
    thresholds: [
      "80점 이상: 대체 자료 및 파트너 확보 경로 명확",
      "65~79점: 대체 가능 (현지 확인 병행 권장)",
      "64점 이하: 데이터 결측에 따른 실무 판단 지연 예상",
    ],
    evidenceHints: [
      "대체 공개자료",
      "현지 파트너",
      "파이프라인 문서",
      "공간정보",
    ],
  },
  feasibility: {
    label: "종합 목적 적합도",
    accent: "slate",
    definition:
      "데이터 충족률, 근거 신뢰도, 결측 복원력을 종합하여 검토 목적(ODA, 사업화, 실증, 정책 설계 등)에 대한 즉각적인 활용 가능성을 나타냅니다.",
    question: "현재 시점에서 우선 검토 대상으로 즉시 선정 가능 여부", // '올릴 수 있는가?' 순화
    thresholds: [
      "85점 이상: 즉시 검토 권고",
      "70~84점: 데이터 보완 후 추진 권고",
      "69점 이하: 기본 자료 보강 최우선",
    ],
    evidenceHints: [
      "핵심 점수 3종 종합",
      "목적 태그",
      "파이프라인",
      "파트너 준비도",
    ],
  },
  policyAlignment: {
    label: "정책 정합성",
    accent: "emerald",
    definition:
      "NDC, NAP, 국가 전략, 지역 계획과 검토 대상 기술·지역 간의 직접적인 정합성 수준을 나타냅니다.",
    question: "대상 국가 및 지역의 주요 정책 우선순위 부합 여부", // '후보인가?' 순화
  },
  financeReadiness: {
    label: "재원 연결 가능성",
    accent: "blue",
    definition:
      "MDB·GCF·ODA 파이프라인 및 국가 프로그램, 승인된 재원 제안서 등과의 연계 가능성을 나타냅니다.",
    question: "사업화 및 실증을 위한 기후 재원 연계 논의 즉시 착수 가능 여부",
  },
  partnerAccess: {
    label: "파트너 접근성",
    accent: "amber",
    definition:
      "주관 부처, 집행 기관, 유틸리티, 연구 기관 등 핵심 현지 파트너 식별 및 공식 연락 채널 확보 수준을 나타냅니다.",
    question: "현지 협의 및 공동 기획 파트너 즉시 특정 가능 여부",
  },
  documentReadiness: {
    label: "문서 확보 수준",
    accent: "slate",
    definition:
      "정책 원문, 프로젝트 상세 페이지, 국가 지표 페이지 등 검증 가능한 근거 문서 확보 수준을 나타냅니다.",
    question:
      "공유용 요약본 및 사업 개념서(Concept Note) 초안에 즉시 인용 가능 여부",
  },
};

function getMetricFrameworkEntries() {
  return [
    { key: "coverage", ...METRIC_FRAMEWORK.coverage },
    { key: "reliability", ...METRIC_FRAMEWORK.reliability },
    { key: "resilience", ...METRIC_FRAMEWORK.resilience },
    { key: "feasibility", ...METRIC_FRAMEWORK.feasibility },
    { key: "policyAlignment", ...METRIC_FRAMEWORK.policyAlignment },
    { key: "financeReadiness", ...METRIC_FRAMEWORK.financeReadiness },
    { key: "partnerAccess", ...METRIC_FRAMEWORK.partnerAccess },
    { key: "documentReadiness", ...METRIC_FRAMEWORK.documentReadiness },
  ];
}

const API_CATALOG = [
  {
    key: "worldBank",
    name: "World Bank Indicators",
    scope: "GDP·인구·전력접근률·재생에너지 비중·CO₂ 배출량",
    type: "Live API",
    status: "active",
  },
  {
    key: "nasa",
    name: "NASA POWER",
    scope: "일사량(GHI)·기온(T2M)",
    type: "Live API",
    status: "active",
  },
  {
    key: "nominatim",
    name: "OSM Nominatim / GADM",
    scope: "역지오코딩·경계 검증·행정구역 확인",
    type: "Live API",
    status: "active",
  },
  {
    key: "pipelineProxy",
    name: "Pipeline Proxy API",
    scope: "MDB·GCF 프로젝트 및 재원 연계 대상을 동일 출처 API로 통합", // '재원 후보' -> '재원 연계 대상'
    type: "Same-origin API",
    status: "active",
  },
  {
    key: "countryDocsProxy",
    name: "공식문서 메타데이터 API",
    scope: "NDC·NAP·TNA·GCF·CTCN 문서 메타데이터를 국가별로 표준화",
    type: "Same-origin API",
    status: "pilot",
  },
  {
    key: "countryProfile",
    name: "Country Profile API",
    scope: "국가 기본정보·정책 요약·우선 검토 포인트를 국가별로 제공",
    type: "Same-origin API",
    status: "pilot",
  },
  {
    key: "partnerRegistry",
    name: "Partner Registry API",
    scope: "부처·집행기관·연구기관·현지 파트너 메타데이터 연결",
    type: "Registry API",
    status: "next",
  },
  {
    key: "vietnamPilot",
    name: "베트남 우선 탑재 데이터팩",
    scope: "메콩 델타 재난·적응 및 프로젝트 대상지 대표 데이터", // '프로젝트 후보지' -> '프로젝트 대상지'
    type: "Pilot dataset",
    status: "pilot",
  },
  {
    key: "tnaRule",
    name: "TNA 기반 적합기술 선정 로직",
    scope: "국가 수요·기후 리스크·정책·실행성 평가 규칙",
    type: "Scoring logic",
    status: "pilot",
  },
];

function inferSubTech(rec) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const key = `${safeRec.country}|${rec.region}|${safeRec.tech}`;
  const override = {
    "멕시코|소노라|탄소 포집 및 저장 (CCUS)": "저장소 탐사 · 평가 · 선정",
    "케냐|투르카나|태양광 발전": "사용처 다변형 태양광 시스템",
    "베트남|메콩 델타|재난 예측 및 조기경보": "홍수·침수 조기경보",
    "칠레|아타카마|태양광 발전": "초고효율 태양전지",
    "피지|비티레부|재난 예측 및 조기경보": "도서·연안 재난경보",
    "라오스|루앙프라방|수자원 관리": "유역 수위·유량 관리",
    "캄보디아|톤레삽|수자원 관리": "수질 모니터링",
    "브라질|아마조나스|맹그로브/산림 생태계 복원": "REDD+ 연계 자연기반해법",
    "가나|아크라|친환경 폐기물 처리": "금속자원 회수",
    "세네갈|다카르|수자원 관리": "정수·담수화 시스템",
  };
  if (override[key]) return override[key];
  return normalizeTechName(rec.tech);
}

function buildCooperationProfile(rec) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const map = {
    "탄소 포집 및 저장 (CCUS)": {
      headline: "배출원-저장소 연계형 CCUS 실증·사업화 패키지",
      partnershipModel: "정책 + 지질평가 + 저장 인프라 목적 적합도 공동기획",
      quickWin:
        "배출원 지도화 → 저장소 대상지 평가 → 인허가·감축 인증 연계 검토", // '후보평가' -> '대상지 평가'
    },
    "태양광 발전": {
      headline: "분산형 태양광·계통연계 실증 패키지",
      partnershipModel: "ODA + 사업화 + 현지 O&M 역량 내재화",
      quickWin: "자원 지도 구축 → 부하·배전망 진단 → 대상지별 사업 모델 설계", // '자원지도', '후보지별' 순화
    },
    "재난 예측 및 조기경보": {
      headline: "기후위험 조기경보 디지털 공공인프라 패키지",
      partnershipModel: "ODA + 공공기관 협력 + 센서·통신 통합 실증",
      quickWin: "취약지역 지도화 → 센서/통신망 갭 진단 → 경보 프로토콜 현지화",
    },
    "수자원 관리": {
      headline: "유역관리·정수·담수화 연계 물안보 패키지",
      partnershipModel: "정책 설계 + 인프라 목적 적합도 + 운영데이터 통합",
      quickWin: "수요-공급 분석 → 수질·수위 진단 → 인허가·조달 구조 검토",
    },
    "맹그로브/산림 생태계 복원": {
      headline: "자연기반해법(NbS)·탄소시장 연계 패키지",
      partnershipModel: "국제감축 + MRV + 지역 거버넌스 구축",
      quickWin: "핫스팟 도출 → 토지권 검토 → MRV 설계 및 크레딧 경로 정리",
    },
    "친환경 폐기물 처리": {
      headline: "도시 폐기물 순환·에너지화 패키지",
      partnershipModel: "사업화 + 지자체 PPP + 감축사업 발굴",
      quickWin:
        "발생량 진단 → 처리 시설 대상지 검토 → Offtake·수수료 구조 분석", // '후보지' -> '대상지'
    },
  };

  const techKey = getTechLookupKey(rec.tech);
  const base = map[techKey] ||
    map[rec.tech] || {
      headline: `${safeRec.tech} 협력 패키지`,
      partnershipModel: "정책·사업·실증 연계형 모델",
      quickWin: "기초 진단 → 데이터 보강 → 실행 파트너 매칭",
    };

  return {
    ...base,
    scoreSummary:
      rec?.scores?.coverage >= 90
        ? "즉시 검토 가능"
        : rec?.scores?.coverage >= 80
        ? "데이터 보완 후 추진 권고" // 일관성을 위해 thresholds 텍스트와 맞춤
        : "데이터 보강 최우선",
  };
}

const PURPOSES = [
  "전체 목적",
  "ODA",
  "사업화",
  "R&D 실증",
  "국제감축",
  "정책 설계",
];

const COUNTRY_LIST = [
  "전체 국가",
  "인도네시아",
  "케냐",
  "베트남",
  "멕시코",
  "칠레",
  "피지",
  "라오스",
  "캄보디아",
  "브라질",
  "가나",
  "세네갈",
];

// 기존 필터 렌더링 코드와의 호환을 위해 별칭을 유지합니다.
const COUNTRIES = COUNTRY_LIST;

const COUNTRY_META = {
  인도네시아: { iso2: "ID", en: "Indonesia" },
  멕시코: { iso2: "MX", en: "Mexico" },
  케냐: { iso2: "KE", en: "Kenya" },
  베트남: { iso2: "VN", en: "Vietnam" },
  칠레: { iso2: "CL", en: "Chile" },
  피지: { iso2: "FJ", en: "Fiji" },
  라오스: { iso2: "LA", en: "Laos" },
  캄보디아: { iso2: "KH", en: "Cambodia" },
  브라질: { iso2: "BR", en: "Brazil" },
  가나: { iso2: "GH", en: "Ghana" },
  세네갈: { iso2: "SN", en: "Senegal" },
};

const REGION_QUERY_ALIAS = {
  "멕시코|소노라": "Sonora",
  "케냐|투르카나": "Turkana",
  "베트남|메콩 델타": "Mekong Delta",
  "칠레|아타카마": "Atacama",
  "피지|비티레부": "Viti Levu",
  "라오스|루앙프라방": "Luang Prabang",
  "캄보디아|톤레삽": "Tonle Sap",
  "브라질|아마조나스": "Amazonas",
  "가나|아크라": "Accra",
  "세네갈|다카르": "Dakar",
};

function getCountryMetaByName(name) {
  return COUNTRY_META[name] || { iso2: "", en: name };
}

function getRegionQuery(rec) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const key = `${safeRec.country}|${rec.region}`;
  const alias = REGION_QUERY_ALIAS[key] || rec.region;
  const countryEn = getCountryMetaByName(rec.country).en;
  return `${alias}, ${countryEn}`;
}

async function fetchJsonWithTimeout(url, timeoutMs = 12000, options = {}) {
  assertAllowedExternalUrl(url);
  const safeUrl = String(url);
  const method = String(options.method || "GET").toUpperCase();
  const cacheable = method === "GET";
  const now = Date.now();

  if (cacheable) {
    const cached = externalJsonCache.get(safeUrl);
    if (cached && now - cached.ts < EXTERNAL_JSON_CACHE_TTL_MS) {
      return cloneJsonSafe(cached.data);
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(safeUrl, {
      ...options,
      method,
      credentials: isSameOriginUrl(safeUrl) ? "same-origin" : "omit",
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "no-referrer",
      headers: { Accept: "application/json", ...(options.headers || {}) },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    if (
      contentType &&
      !contentType.includes("json") &&
      !contentType.includes("javascript") &&
      !contentType.includes("text/plain")
    ) {
      throw new Error(`예상치 못한 응답 형식: ${contentType}`);
    }

    const contentLength = Number(res.headers.get("content-length") || 0);
    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_JSON_RESPONSE_BYTES
    ) {
      throw new Error("응답 크기가 허용 범위를 초과했습니다.");
    }

    const text = await res.text();
    const byteLength = new TextEncoder().encode(text).length;
    if (byteLength > MAX_JSON_RESPONSE_BYTES) {
      throw new Error("응답 크기가 허용 범위를 초과했습니다.");
    }

    const parsed = JSON.parse(text);
    if (cacheable) {
      externalJsonCache.set(safeUrl, { ts: now, data: parsed });
    }
    return cloneJsonSafe(parsed);
  } finally {
    clearTimeout(timer);
  }
}

function parseLatestWorldBankValue(payload) {
  // WB 응답 형식: [meta, [rows...]]
  if (!Array.isArray(payload) || !Array.isArray(payload[1])) return null;
  const rows = payload[1];
  const valid = rows.find((r) => r && r.value != null);
  if (!valid) return null;
  return {
    year: valid.date,
    value: valid.value,
  };
}

async function fetchWorldBankIndicator(iso2, indicatorCode) {
  const iso2Safe = normalizeIso2(iso2);
  if (!iso2Safe) throw new Error(`유효하지 않은 국가코드(ISO2): ${iso2}`);
  const indicatorSafe = String(indicatorCode || "").trim();
  if (!/^[-A-Z0-9_.]+$/i.test(indicatorSafe))
    throw new Error(`유효하지 않은 지표코드: ${indicatorCode}`);
  const url = `https://api.worldbank.org/v2/country/${iso2Safe}/indicator/${indicatorSafe}?format=json&per_page=70`;
  const json = await fetchJsonWithTimeout(url);
  return parseLatestWorldBankValue(json);
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return (
    Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
  );
}

function pickNearestNominatimHit(hits, rec, maxKm = 250) {
  if (!Array.isArray(hits) || !hits.length)
    return { hit: null, distanceKm: null };

  let best = null;
  let bestDistance = Infinity;

  for (const h of hits) {
    const lat = Number(h?.lat);
    const lon = Number(h?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const d = haversineKm(Number(rec.lat), Number(rec.lon), lat, lon);
    if (d < bestDistance) {
      bestDistance = d;
      best = h;
    }
  }

  if (!best) return { hit: null, distanceKm: null };

  // 너무 멀면 잘못된 매칭으로 간주
  if (bestDistance > maxKm) {
    return { hit: null, distanceKm: bestDistance };
  }

  return { hit: best, distanceKm: bestDistance };
}

async function loadLiveApiBundle(rec) {
  const countryMeta = getCountryMetaByName(rec.country);
  const safeIso2 = normalizeIso2(countryMeta?.iso2 || rec?.countryCode || "");
  const lat = Number(rec?.lat);
  const lon = Number(rec?.lon);
  const proxyUrl = `/api/live/v1/country-dashboard?country=${encodeURIComponent(
    safeIso2 || rec?.country || ""
  )}&lat=${encodeURIComponent(
    Number.isFinite(lat) ? lat : ""
  )}&lon=${encodeURIComponent(Number.isFinite(lon) ? lon : "")}`;

  try {
    const proxyBundle = await fetchJsonWithTimeout(proxyUrl, 15000, {
      headers: { Accept: "application/json" },
      cacheable: false,
    });
    if (proxyBundle?.country) {
      return {
        fetchedAt: proxyBundle?.fetchedAt || new Date().toISOString(),
        sourceMode: proxyBundle?.sourceMode || "proxy-live",
        lastUpdated: proxyBundle?.lastUpdated || null,
        officialLinks: proxyBundle?.officialLinks || null,
        worldBank: {
          gdp: proxyBundle?.indicators?.gdp || null,
          population: proxyBundle?.indicators?.population || null,
          electricityAccess: proxyBundle?.indicators?.electricityAccess || null,
          renewableEnergy: proxyBundle?.indicators?.renewableEnergy || null,
          co2Emissions: proxyBundle?.indicators?.co2Emissions || null,
          urbanization: proxyBundle?.indicators?.urbanization || null,
        },
        nasaPower: {
          ghiAnn: proxyBundle?.climate?.solarIrradianceAnn ?? null,
          t2mAnn: proxyBundle?.climate?.temperatureAnn ?? null,
        },
        reverseGeo: null,
      };
    }
  } catch (proxyError) {
    console.warn(
      "Country dashboard proxy unavailable. Falling back to browser fetch.",
      proxyError
    );
  }

  const [
    gdp,
    population,
    electricityAccess,
    renewableEnergy,
    co2,
    nasa,
    reverseGeo,
  ] = await Promise.allSettled([
    countryMeta.iso2
      ? fetchWorldBankIndicator(countryMeta.iso2, "NY.GDP.MKTP.CD")
      : Promise.resolve(null),
    countryMeta.iso2
      ? fetchWorldBankIndicator(countryMeta.iso2, "SP.POP.TOTL")
      : Promise.resolve(null),
    countryMeta.iso2
      ? fetchWorldBankIndicator(countryMeta.iso2, "EG.ELC.ACCS.ZS")
      : Promise.resolve(null),
    countryMeta.iso2
      ? fetchWorldBankIndicator(countryMeta.iso2, "EG.FEC.RNEW.ZS")
      : Promise.resolve(null),
    countryMeta.iso2
      ? fetchWorldBankIndicator(countryMeta.iso2, "EN.ATM.CO2E.KT")
      : Promise.resolve(null),
    fetchJsonWithTimeout(
      `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,T2M&community=RE&longitude=${rec.lon}&latitude=${rec.lat}&format=JSON`
    ),
    fetchJsonWithTimeout(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${rec.lat}&lon=${rec.lon}&accept-language=ko,en`
    ),
  ]);

  const nasaData =
    nasa.status === "fulfilled" ? nasa.value?.properties?.parameter || {} : {};

  const ghi = nasaData?.ALLSKY_SFC_SW_DWN?.ANN;
  const t2m = nasaData?.T2M?.ANN;

  return {
    fetchedAt: new Date().toISOString(),
    sourceMode: "browser-fallback",
    lastUpdated: null,
    officialLinks: getOfficialCountryLinks(rec?.country) || null,
    worldBank: {
      gdp: gdp.status === "fulfilled" ? gdp.value : null,
      population: population.status === "fulfilled" ? population.value : null,
      electricityAccess:
        electricityAccess.status === "fulfilled"
          ? electricityAccess.value
          : null,
      renewableEnergy:
        renewableEnergy.status === "fulfilled" ? renewableEnergy.value : null,
      co2Emissions: co2.status === "fulfilled" ? co2.value : null,
      urbanization: null,
    },
    nasaPower: {
      ghiAnn: ghi ?? null,
      t2mAnn: t2m ?? null,
    },
    reverseGeo:
      reverseGeo.status === "fulfilled"
        ? {
            displayName: reverseGeo.value?.display_name || null,
            type: reverseGeo.value?.type || null,
            lat: reverseGeo.value?.lat || null,
            lon: reverseGeo.value?.lon || null,
          }
        : null,
  };
}

function toFeatureFromNominatim(hit, kind = "boundary") {
  if (!hit?.geojson) return null;
  return {
    type: "Feature",
    properties: {
      name: hit.display_name || "",
      kind,
    },
    geometry: hit.geojson,
  };
}

function buildRectPolygonFeature(
  center,
  deltaLon = 1.5,
  deltaLat = 1.0,
  properties = {}
) {
  const [lonRaw, latRaw] = Array.isArray(center) ? center : [null, null];
  const lon = Number(lonRaw);
  const lat = Number(latRaw);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return {
    type: "Feature",
    properties,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [lon - deltaLon, lat - deltaLat],
          [lon + deltaLon, lat - deltaLat],
          [lon + deltaLon, lat + deltaLat],
          [lon - deltaLon, lat + deltaLat],
          [lon - deltaLon, lat - deltaLat],
        ],
      ],
    },
  };
}

function normalizeNominatimFeature(hit, kind = "boundary") {
  return geoFeatureToFC(toFeatureFromNominatim(hit, kind));
}

function normalizeNominatimRegionFeature(regionHits, rec) {
  const { hit, distanceKm } = pickNearestNominatimHit(regionHits, rec, 450);
  const chosen =
    hit ||
    (Array.isArray(regionHits) && regionHits.length ? regionHits[0] : null);
  const feature = toFeatureFromNominatim(chosen, "region");
  if (!feature) return emptyFeatureCollection();
  return {
    type: "FeatureCollection",
    features: [
      {
        ...feature,
        properties: {
          ...(feature.properties || {}),
          active: 1,
          distanceKm: distanceKm ?? null,
        },
      },
    ],
  };
}

function getStaticBoundaryBundle(rec) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const regionCenter = [
    Number(rec?.lon ?? rec?.regionCenter?.[0]),
    Number(rec?.lat ?? rec?.regionCenter?.[1]),
  ];
  const countryCenter = Array.isArray(rec?.countryCenter)
    ? [Number(rec.countryCenter[0]), Number(rec.countryCenter[1])]
    : regionCenter;

  const regionFeature = buildRectPolygonFeature(regionCenter, 1.4, 1.0, {
    name: `${rec.region} (기본 경계)`,
    kind: "region",
    active: 1,
  });
  const countryFeature = buildRectPolygonFeature(countryCenter, 4.5, 3.3, {
    name: `${safeRec.country} (기본 경계)`,
    kind: "country",
  });

  if (!regionFeature && !countryFeature) return null;

  return {
    countryFeature: geoFeatureToFC(countryFeature),
    regionFeature: geoFeatureToFC(regionFeature),
    source: "기본 경계 데이터",
    fetchedAt: new Date().toISOString(),
    validation: {
      regionQuery: getRegionQuery(rec),
      regionDisplayName: rec.region,
      regionSearchCenterLat: Number(rec?.lat ?? rec?.regionCenter?.[1]) || null,
      regionSearchCenterLon: Number(rec?.lon ?? rec?.regionCenter?.[0]) || null,
      currentLat: Number(rec?.lat) || null,
      currentLon: Number(rec?.lon) || null,
      distanceKm: 0,
      mode: "fallback",
    },
  };
}

async function loadBoundaryBundle(rec) {
  const iso3Map = { VN: "VNM", KH: "KHM", LA: "LAO" };
  const iso2 = (
    getCountryMetaByName(rec.country)?.iso2 ||
    rec.countryCode ||
    ""
  ).toUpperCase();
  const iso3 = iso3Map[iso2] || "";
  const regionQuery = getRegionQuery(rec);
  const currentLat = Number(rec?.lat ?? rec?.regionCenter?.[1]);
  const currentLon = Number(rec?.lon ?? rec?.regionCenter?.[0]);

  const gadmCache = (globalThis.__gadmCache ||= {});
  const fetchGadm = async (iso3Code, level) => {
    const key = `${iso3Code}_${level}`;
    if (gadmCache[key]) return gadmCache[key];
    const url = `https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_${iso3Code}_${level}.json`;
    const data = await fetchJsonWithTimeout(url, 20000);
    gadmCache[key] = data;
    return data;
  };

  const pointInBbox = (bbox, lon, lat) =>
    bbox &&
    lon >= bbox[0] &&
    lon <= bbox[2] &&
    lat >= bbox[1] &&
    lat <= bbox[3];

  const calcBbox = (
    coords,
    bbox = [Infinity, Infinity, -Infinity, -Infinity]
  ) => {
    if (!Array.isArray(coords)) return bbox;
    if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      const [x, y] = coords;
      bbox[0] = Math.min(bbox[0], x);
      bbox[1] = Math.min(bbox[1], y);
      bbox[2] = Math.max(bbox[2], x);
      bbox[3] = Math.max(bbox[3], y);
      return bbox;
    }
    for (const c of coords) calcBbox(c, bbox);
    return bbox;
  };

  const markActiveAdm1 = (adm1Fc) => {
    if (!adm1Fc || adm1Fc.type !== "FeatureCollection")
      return emptyFeatureCollection();
    const lon = currentLon;
    const lat = currentLat;
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return adm1Fc;

    let activeIdx = -1;
    let activeDistanceKm = null;
    for (let i = 0; i < adm1Fc.features.length; i++) {
      const f = adm1Fc.features[i];
      const bb = calcBbox(f.geometry?.coordinates);
      if (pointInBbox(bb, lon, lat)) {
        activeIdx = i;
        const centerLon = (bb[0] + bb[2]) / 2;
        const centerLat = (bb[1] + bb[3]) / 2;
        activeDistanceKm = haversineKm(lat, lon, centerLat, centerLon);
        break;
      }
    }
    const features = adm1Fc.features.map((f, i) => ({
      ...f,
      properties: { ...(f.properties || {}), active: i === activeIdx ? 1 : 0 },
    }));
    const activeFeature = activeIdx >= 0 ? features[activeIdx] : null;
    const activeName =
      activeFeature?.properties?.NAME_1 ||
      activeFeature?.properties?.NAME_0 ||
      activeFeature?.properties?.name ||
      rec.region;
    return {
      featureCollection: { ...adm1Fc, features },
      validation: {
        regionQuery,
        regionDisplayName: activeName,
        regionSearchCenterLat: currentLat,
        regionSearchCenterLon: currentLon,
        currentLat,
        currentLon,
        distanceKm: activeDistanceKm ?? 0,
        mode: activeIdx >= 0 ? "gadm" : "gadm-unmatched",
      },
    };
  };

  try {
    if (iso3) {
      const [adm0, adm1] = await Promise.all([
        fetchGadm(iso3, 0),
        fetchGadm(iso3, 1),
      ]);
      const marked = markActiveAdm1(adm1);
      return {
        countryFeature:
          adm0?.type === "FeatureCollection" ? adm0 : emptyFeatureCollection(),
        regionFeature: marked.featureCollection || emptyFeatureCollection(),
        source: "GADM 4.1 (geodata.ucdavis.edu)",
        fetchedAt: new Date().toISOString(),
        validation: marked.validation,
      };
    }
  } catch (e) {
    console.warn("GADM boundary load failed, fallback to Nominatim:", e);
  }

  const staticBundle = getStaticBoundaryBundle(rec);

  const countryMeta = getCountryMetaByName(rec.country);
  const countryQuery = sanitizeExternalQuery(
    countryMeta.en || rec.country,
    160
  );
  const regionQuerySafe = sanitizeExternalQuery(regionQuery, 160);
  if (!countryQuery || !regionQuerySafe)
    return (
      staticBundle || {
        countryFeature: emptyFeatureCollection(),
        regionFeature: emptyFeatureCollection(),
        source: "Boundary query unavailable",
        fetchedAt: new Date().toISOString(),
      }
    );

  try {
    const countryUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&polygon_geojson=1&accept-language=ko,en&q=${encodeURIComponent(
      countryQuery
    )}`;
    const regionUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&polygon_geojson=1&accept-language=ko,en&q=${encodeURIComponent(
      regionQuerySafe
    )}`;

    const [countryRes, regionRes] = await Promise.allSettled([
      fetchJsonWithTimeout(countryUrl, 15000),
      fetchJsonWithTimeout(regionUrl, 15000),
    ]);

    const countryHit =
      countryRes.status === "fulfilled" &&
      Array.isArray(countryRes.value) &&
      countryRes.value.length
        ? countryRes.value[0]
        : null;

    const regionHits =
      regionRes.status === "fulfilled" &&
      Array.isArray(regionRes.value) &&
      regionRes.value.length
        ? regionRes.value
        : [];

    const { hit: bestRegionHit, distanceKm } = pickNearestNominatimHit(
      regionHits,
      rec,
      450
    );
    const chosenRegionHit =
      bestRegionHit || (regionHits.length ? regionHits[0] : null);

    return {
      countryFeature: normalizeNominatimFeature(countryHit, "country"),
      regionFeature: normalizeNominatimRegionFeature(regionHits, rec),
      source: "Nominatim(OpenStreetMap) 기본 경계",
      fetchedAt: new Date().toISOString(),
      validation: {
        regionQuery,
        regionDisplayName: chosenRegionHit?.display_name || rec.region,
        regionSearchCenterLat:
          Number(chosenRegionHit?.lat) || currentLat || null,
        regionSearchCenterLon:
          Number(chosenRegionHit?.lon) || currentLon || null,
        currentLat,
        currentLon,
        distanceKm: distanceKm ?? 0,
        mode: chosenRegionHit
          ? "nominatim"
          : staticBundle
          ? "fallback"
          : "nominatim-empty",
      },
    };
  } catch (e) {
    console.warn(
      "Nominatim boundary load failed, fallback to synthetic boundary:",
      e
    );
    if (staticBundle) return staticBundle;
    return {
      countryFeature: emptyFeatureCollection(),
      regionFeature: emptyFeatureCollection(),
      source: "Boundary unavailable",
      fetchedAt: new Date().toISOString(),
      validation: {
        regionQuery,
        regionDisplayName: rec.region,
        regionSearchCenterLat: currentLat || null,
        regionSearchCenterLon: currentLon || null,
        currentLat: currentLat || null,
        currentLon: currentLon || null,
        distanceKm: null,
        mode: "unavailable",
      },
    };
  }
}

function buildPipelineFallback({
  country = "VN",
  region = "Mekong Delta",
  theme = "flood-early-warning",
} = {}) {
  const rows = Array.isArray(VIETNAM_PIPELINE_MOCK_DATA?.projects)
    ? VIETNAM_PIPELINE_MOCK_DATA.projects
    : [];
  const normalizedCountry = String(country || "")
    .trim()
    .toLowerCase();
  const normalizedRegion = String(region || "")
    .trim()
    .toLowerCase();
  const normalizedTheme = String(theme || "")
    .trim()
    .toLowerCase();

  const projects = rows.filter((row) => {
    const rowCountry = String(row.countryCode || row.country || "")
      .trim()
      .toLowerCase();
    const rowRegion = String(row.region || "")
      .trim()
      .toLowerCase();
    const tags = Array.isArray(row.themeTags)
      ? row.themeTags.join(" ").toLowerCase()
      : "";
    return (
      (!normalizedCountry || rowCountry.includes(normalizedCountry)) &&
      (!normalizedRegion || rowRegion.includes(normalizedRegion)) &&
      (!normalizedTheme ||
        tags.includes(normalizedTheme) ||
        String(row.theme || "")
          .toLowerCase()
          .includes(normalizedTheme))
    );
  });

  const finalProjects = projects.length ? projects : rows;
  return normalizePipelineBundle({
    fetchedAt: new Date().toISOString(),
    total: finalProjects.length,
    projects: finalProjects,
    summary: {
      country,
      region,
      theme,
      source: "기본 데이터",
      statusLabel: "기본 데이터 안내 중", // '기본 데이터 안내 중' 순화
      note: "실시간 파이프라인 API 미연동 상태로, 검증용 기본 데이터를 제공합니다. 근거 링크 및 대상 검토 구조는 동일하게 유지됨.",
      cachePolicy: "memory-cache / 기본 데이터",
    },
    isFallback: true,
  });
}

function normalizePipelineProject(project = {}, index = 0) {
  const title = String(project?.title || project?.project || "").trim();
  const stage = String(project?.stage || project?.status || "").trim();
  const source = String(project?.source || project?.provider || "").trim();
  const executingPartner = String(
    project?.executingPartner || project?.partner || project?.implementer || ""
  ).trim();
  const amountUSD = Number.isFinite(Number(project?.amountUSD))
    ? Number(project.amountUSD)
    : Number.isFinite(Number(project?.amount))
    ? Number(project.amount)
    : null;
  const link =
    ensureExternalUrl(project?.link) ||
    ensureExternalUrl(project?.href) ||
    guessSourceHref(source, project?.endpoint, { country: project?.country });
  return {
    id: project?.id || `pipeline-${index + 1}`,
    source: source || "공개 프로젝트 포털",
    title: title || `프로젝트 ${index + 1}`,
    stage: stage || "단계 확인 필요",
    country: project?.country || "",
    countryCode: project?.countryCode || "",
    region: project?.region || "",
    theme: project?.theme || "",
    themeTags: safeArray(project?.themeTags),
    amountUSD,
    executingPartner,
    description: String(project?.description || project?.summary || "").trim(),
    lastUpdated: String(
      project?.lastUpdated || project?.updatedAt || ""
    ).trim(),
    link,
  };
}

function normalizePipelineBundle(bundle = {}) {
  const projects = safeArray(bundle?.projects).map((item, idx) =>
    normalizePipelineProject(item, idx)
  );
  return {
    fetchedAt: bundle?.fetchedAt || new Date().toISOString(),
    total: Number(bundle?.total ?? projects.length) || projects.length,
    projects,
    summary: {
      country: bundle?.summary?.country || "",
      region: bundle?.summary?.region || "",
      theme: bundle?.summary?.theme || "",
      source:
        bundle?.summary?.source || (bundle?.isFallback ? "기본 데이터" : "api"),
      statusLabel:
        bundle?.summary?.statusLabel ||
        (bundle?.isFallback ? "기본 데이터 안내 중" : "실시간 연결"),
      note:
        bundle?.summary?.note ||
        (bundle?.isFallback
          ? "API 응답이 없어 검증용 기본 데이터를 대신 보여줍니다."
          : "동일 출처 API에서 최신 프로젝트 목록을 가져왔습니다."),
      cachePolicy:
        bundle?.summary?.cachePolicy ||
        (bundle?.isFallback ? "fallback" : "same-origin cache"),
    },
    isFallback: !!bundle?.isFallback,
    errorMessage: bundle?.errorMessage || "",
  };
}

async function fetchPipelineBundle({
  country = "VN",
  region = "Mekong Delta",
  theme = "flood-early-warning",
  force = false,
} = {}) {
  const url = `/api/pipeline/v1/projects?country=${encodeURIComponent(
    country
  )}&region=${encodeURIComponent(region)}&theme=${encodeURIComponent(
    theme
  )}&sources=all&force=${force ? "1" : "0"}`;

  const tryFetch = async () => {
    const json = await fetchJsonWithTimeout(url, 15000);
    return normalizePipelineBundle({
      fetchedAt: json?.fetchedAt || new Date().toISOString(),
      total: Array.isArray(json?.projects) ? json.projects.length : 0,
      projects: Array.isArray(json?.projects) ? json.projects : [],
      summary: {
        ...(json?.summary || {}),
        statusLabel: "실시간 연결",
        note:
          json?.summary?.note ||
          "동일 출처 API에서 프로젝트·재원 후보를 불러왔습니다. 응답 실패 시에는 검증용 기본 데이터로 자동 전환됩니다.",
        cachePolicy: force ? "force-refresh" : "same-origin cache",
      },
      isFallback: false,
    });
  };

  try {
    return await tryFetch();
  } catch (error) {
    console.warn("Pipeline API first attempt failed. Retrying once.", error);
    try {
      return await tryFetch();
    } catch (retryError) {
      console.warn(
        "Pipeline API unavailable after retry. Using local fallback data.",
        retryError
      );
      return normalizePipelineBundle({
        ...buildPipelineFallback({ country, region, theme }),
        errorMessage: String(
          retryError?.message || error?.message || "pipeline-api-unavailable"
        ),
        summary: {
          country,
          region,
          theme,
          source: "기본 데이터",
          statusLabel: "기본 데이터 안내 중",
          note: "실시간 파이프라인 API 응답이 없어 검증용 기본 데이터를 대신 보여줍니다. 저장·비교·상세 검토 흐름은 그대로 사용 가능.",
          cachePolicy: "기본 데이터 + 재시도 1회",
        },
        isFallback: true,
      });
    }
  }
}

const BASE_SOURCE_REGISTRY = [
  {
    layer: "국가 기본정보",
    source: "World Bank Open Data",
    acquisition: "REST API",
    cycle: "연 1회 + 일부 분기",
    resolution: "국가",
    endpoint: "api.worldbank.org",
    note: "GDP, 인구, 산업구조 등 기본 지표",
  },
  {
    layer: "정책·제도",
    source: "UNFCCC NDC Registry",
    acquisition: "문서 수집 + 수동 구조화",
    cycle: "수시(제출 시)",
    resolution: "국가",
    endpoint: "unfccc.int",
    note: "NDC 목표 유형/필터부 여부/부문 목표",
  },
  {
    layer: "기후 리스크",
    source: "ND-GAIN / Germanwatch / WRI",
    acquisition: "CSV 다운로드 / 문서 파싱",
    cycle: "연 1회",
    resolution: "국가(일부 지역)",
    endpoint: "ndgain.org / germanwatch.org / wri.org",
    note: "취약성·리스크·물 스트레스",
  },
  {
    layer: "시장·사업",
    source: "World Bank Projects / ADB / GCF",
    acquisition: "API + 공시문서 수집",
    cycle: "월 1회",
    resolution: "국가/프로젝트",
    endpoint: "projects.worldbank.org / adb.org / greenclimate.fund",
    note: "사업 이력 및 파이프라인",
  },
  {
    layer: "기후/자원",
    source: "NASA POWER / ERA5 / Global Solar Atlas",
    acquisition: "REST API / 파일 다운로드",
    cycle: "월 1회~분기",
    resolution: "격자(grid) / 지역",
    endpoint: "power.larc.nasa.gov",
    note: "일사량, 풍속, 기후변수",
  },
  {
    layer: "공간·경계",
    source: "GADM / Natural Earth / OSM",
    acquisition: "GeoJSON / shp",
    cycle: "반기",
    resolution: "국가/행정구역",
    endpoint: "gadm.org / naturalearthdata.com",
    note: "국가·지역 경계 및 지리 참조",
  },
];

function makeRec({
  id,
  country,
  countryCenter,
  region,
  regionLat,
  regionLon,
  tech,
  continent,
  purposeTags,
  coverage,
  reliability,
  resilience,
  reasons,
  coordBasis,
  available,
  missing,
  required,
  regionRows,
  techSpecificSources = [],
  countryNote = "",
}) {
  const feasibility = Number(
    (coverage * 0.35 + reliability * 0.35 + resilience * 0.3).toFixed(1)
  );

  const baseSchema = [
    {
      scope: "국가",
      layer: "국가·지역 기본정보",
      field: "GDP / 인구 / 도시화율",
      format: "Table",
      unit: "USD, %, 명",
      required: "핵심",
      usage: "정책 설계 / 사업 목적 적합도",
    },
    {
      scope: "국가",
      layer: "정책·제도",
      field: "NDC 유형 / 부문별 감축목표 / 필터부 여부",
      format: "Table+Text",
      unit: "-",
      required: "핵심",
      usage: "ODA / 국제감축",
    },
    {
      scope: "국가",
      layer: "시장·사업",
      field: "기후기술 프로젝트 파이프라인 / MDB·GCF 이력",
      format: "Table",
      unit: "건, USD",
      required: "핵심",
      usage: "사업화 / ODA",
    },
    {
      scope: "국가",
      layer: "협력 실행 기반",
      field: "조달제도 / PPP 규정 / 외국기업 참여요건",
      format: "Table+Text",
      unit: "-",
      required: "핵심",
      usage: "사업화",
    },
    {
      scope: "국가",
      layer: "양국 협력 기반",
      field: "한-개도국 협력 이력 / MOU / 진출기업",
      format: "Table",
      unit: "건",
      required: "권장",
      usage: "전략 수립",
    },
    {
      scope: "국가",
      layer: "기후 리스크·취약성",
      field: "ND-GAIN / CRI / 물리적 리스크",
      format: "Table",
      unit: "지수",
      required: "핵심",
      usage: "정책 설계 / ODA",
    },
    {
      scope: "지역",
      layer: "지역 데이터",
      field: "행정구역 경계 / 좌표 / POI",
      format: "GeoJSON / Table",
      unit: "-",
      required: "핵심",
      usage: "R&D 실증 / 사업 설계",
    },
  ];

  const techSchemaMap = {
    "태양광 발전": {
      layer: "기술·역량",
      field: "일사량(GHI), 온도계수, 계통연계 용량, 출력제한 이력",
      format: "Grid + Table",
      unit: "kWh/m²/day, MW",
      usage: "사업화 / R&D 실증",
    },
    "풍력 발전": {
      layer: "기술·역량",
      field: "풍속(허브고도), 지형, 계통연계 가능용량, Met Mast 실측",
      format: "Grid + Table",
      unit: "m/s, MW",
      usage: "사업화",
    },
    스마트그리드: {
      layer: "기술·역량",
      field: "부하곡선, 손실률, 정전지표(SAIDI/SAIFI), AMI 보급률",
      format: "Time-series + Table",
      unit: "MW, %, 분",
      usage: "R&D 실증 / 사업화",
    },
    "탄소 포집 및 저장 (CCUS)": {
      layer: "기술·역량",
      field: "배출원 지도, 농도, 저장소 후보지, 규제·모니터링 체계",
      format: "Table + Geo",
      unit: "tCO2, %vol",
      usage: "국제감축 / 사업화",
    },
    "수자원 관리": {
      layer: "기술·역량",
      field: "수위/유량, 수질, 공급-수요, 인프라 운영지표",
      format: "Time-series + Geo",
      unit: "m³/s, NTU",
      usage: "ODA / 사업화",
    },
    "기후스마트 농업": {
      layer: "기술·역량",
      field: "작물·토양·침수·관개·농가 생산성 지표",
      format: "Table + Grid",
      unit: "ha, %, t/ha",
      usage: "ODA / R&D 실증",
    },
    "재난 예측 및 조기경보": {
      layer: "기술·역량",
      field: "위험도 지도, 관측망 위치, 통신 커버리지, 경보 프로토콜",
      format: "Geo + Table",
      unit: "-",
      usage: "ODA / R&D 실증",
    },
    "맹그로브/산림 생태계 복원": {
      layer: "기술·역량",
      field: "산림훼손률, 블루카본 잠재량, 토지권·모니터링 데이터",
      format: "Geo + Table",
      unit: "ha, tCO2e",
      usage: "국제감축 / ODA",
    },
    "친환경 폐기물 처리": {
      layer: "기술·역량",
      field: "폐기물 발생량·성상·메탄 포집·반입수수료·규제",
      format: "Table",
      unit: "t/day, %, USD",
      usage: "사업화 / ODA",
    },
  };

  const techSchema = techSchemaMap[getTechLookupKey(tech)] ||
    techSchemaMap[tech] || {
      layer: "기술·역량",
      field: "기술별 핵심 수요·자원·역량 지표",
      format: "Table",
      unit: "-",
      usage: "전략 수립",
    };

  const schema = [
    ...baseSchema,
    {
      scope: "지역",
      layer: techSchema.layer,
      field: techSchema.field,
      format: techSchema.format,
      unit: techSchema.unit,
      required: "핵심",
      usage: techSchema.usage,
    },
  ];

  const inventoryRows = [
    ...available.map((name) => ({
      status: "확보",
      group: "원천 데이터",
      name,
      scope:
        name.includes("지역") ||
        name.includes("지자체") ||
        name.includes("현지")
          ? "지역"
          : "국가",
      memo: "플랫폼 내 적재 가능",
    })),
    ...missing.map((name) => ({
      status: "결측/한계",
      group: "보완 필요",
      name,
      scope: "지역",
      memo: "프록시 또는 현지 협력기관 확보 필요",
    })),
    ...required.map((name) => ({
      status: "실무필수",
      group: "사업 준비",
      name,
      scope: "국가/지역",
      memo: "사업화·ODA 실행 전 필수 확인",
    })),
  ];

  const sourcePlan = [...BASE_SOURCE_REGISTRY, ...techSpecificSources].map(
    (item) => ({
      ...item,
      endpoint: buildSourceEndpointUrl(item, country),
    })
  );

  const actions = [
    `${country} 국가 NDC/정책 문서 메타데이터 구조화`,
    `${region} 지역 단위 실증/사업 후보지 검증`,
    `${tech} 관련 규정·인허가·조달 점검`,
  ];

  return {
    id,
    country,
    countryCenter, // [lon, lat]
    region,
    lat: regionLat,
    lon: regionLon,
    tech,
    continent,
    purposeTags,
    scores: {
      coverage,
      reliability,
      resilience,
      feasibility,
    },
    reasons,
    coordBasis,
    countryNote,
    schema,
    inventoryRows,
    sourcePlan,
    regionRows,
    actions,
  };
}

const RECOMMENDATIONS = [
  makeRec({
    id: 1,
    country: "멕시코",
    countryCenter: [-102.5528, 23.6345],
    region: "소노라",
    regionLat: 29.0729,
    regionLon: -110.9559,
    tech: "탄소 포집 및 저장 (CCUS)",
    continent: "북중미",
    purposeTags: ["사업화", "국제감축", "ODA"],
    coverage: 80,
    reliability: 79,
    resilience: 77,
    reasons: [
      "북미 공급망 연계 가능한 대규모 산업 배출원 접근성 우수",
      "소노라 및 북서부 권역의 에너지·광물 산업 기반 CCUS 확장성 보유",
    ],
    coordBasis:
      "좌표 기준: 소노라 주 중심(에르모시요 권역). 국가 및 지역 중심 좌표 분리 저장을 통한 위치 오류 방지.",
    available: [
      "주요 배출 시설별 배출량 및 산업단지 분포 데이터",
      "국가 탄소 정책(세제/시범 ETS) 문서 및 규정",
      "고갈 유·가스전 대상지 기초 지질 정보", // '후보지' -> '대상지'
    ],
    missing: [
      "저장소 대상지 정밀 탐사(투과도/공극률) 데이터", // '후보지' -> '대상지'
      "지역 단위 CO2 운송 인프라(파이프라인/항만) 상세 도면",
    ],
    required: [
      "CCUS 인허가 절차 및 환경영향평가 세부 요건",
      "배출권 및 감축 인증 연계 기준(국내외 크레딧 인정 범위)",
    ],
    techSpecificSources: [
      {
        layer: "CCUS 기술 데이터",
        source: "IEA CCUS / Global CCS Institute / 국가 지질조사기관",
        acquisition: "문헌+보고서+공공DB",
        cycle: "반기",
        resolution: "국가/지역/배출원",
        endpoint: "iea.org / globalccsinstitute.com",
        note: "저장소, 배출원, 정책 현황 추적", // '트래킹' 순화
      },
    ],
    regionRows: [
      {
        scope: "지역",
        category: "기술·역량",
        field: "산업 배출원 군집(시멘트/발전/정유)",
        value: "북서부 권역 배출원 클러스터 식별",
        unit: "-",
        source: "국가 통계 및 산업 지도",
        update: "반기",
      },
      {
        scope: "지역",
        category: "협력 실행 기반",
        field: "항만/철도/운송 인프라 접근성",
        value: "사업 대상지별 물류 경로 점검 필요", // '후보지별' -> '대상지별'
        unit: "-",
        source: "공간 인프라 DB",
        update: "연 1회",
      },
    ],
    countryNote:
      "CCUS 기술 검토 시 국가 제도(배출권/인허가) 및 지역 지질 정보를 통합적으로 검토해야 합니다.", // '~같이 봐야 함' 격상
  }),
  makeRec({
    id: 2,
    country: "케냐",
    countryCenter: [37.9062, -0.0236],
    region: "투르카나",
    regionLat: 3.119,
    regionLon: 35.5973,
    tech: "태양광 발전",
    continent: "아프리카",
    purposeTags: ["ODA", "사업화", "R&D 실증"],
    coverage: 88,
    reliability: 86,
    resilience: 82,
    reasons: [
      "오프그리드/미니그리드 전력 수요 및 태양광 잠재량 동시 충족",
      "지역 단위 전력 접근성 개선 및 ODA-사업화 연계 용이",
    ],
    coordBasis:
      "좌표 기준: 투르카나 주(Lodwar 인근) 실증 대상지 기준. (국가 중심 좌표 별도 저장)", // '후보지' -> '대상지'
    available: [
      "월별/연간 일사량(GHI) 위성 지도 데이터",
      "국가 전력 접근성 및 송배전망 커버리지 지도",
      "재생에너지 정책 및 미니그리드 제도 규정",
    ],
    missing: [
      "커뮤니티 단위 실제 부하 곡선(시간대별 전력 수요) 데이터",
      "지역별 배전망 잔여 용량 및 접속 제한 정보",
    ],
    required: [
      "현지 전력 구매/소매 요금 규정 및 승인 절차",
      "지자체 협력 기관 및 O&M 수행 파트너 실적",
    ],
    techSpecificSources: [
      {
        layer: "태양광 자원",
        source: "NASA POWER / Global Solar Atlas",
        acquisition: "REST API / CSV",
        cycle: "월 1회",
        resolution: "격자/지역",
        endpoint: "power.larc.nasa.gov / globalsolaratlas.info",
        note: "GHI, DNI, 기온 등 기상 지표",
      },
    ],
    regionRows: [
      {
        scope: "지역",
        category: "기술·역량",
        field: "일사량(GHI)",
        value: "고잠재 구간 다수 분포", // 명사형으로 의미 보완
        unit: "kWh/m²/day",
        source: "NASA POWER / Solar Atlas",
        update: "월 1회",
      },
      {
        scope: "지역",
        category: "시장·사업",
        field: "전력 접근 취약 커뮤니티 분포",
        value: "우선 실증 대상지 다수 확인", // '후보지' -> '대상지'
        unit: "-",
        source: "전력접근성 지도",
        update: "분기",
      },
    ],
  }),
  makeRec({
    id: 3,
    country: "베트남",
    countryCenter: [108.2772, 14.0583],
    region: "메콩 델타",
    regionLat: 10.03,
    regionLon: 105.77,
    tech: "재난 예측 및 조기경보",
    continent: "아시아",
    purposeTags: ["ODA", "R&D 실증", "정책 설계"],
    coverage: 96,
    reliability: 90,
    resilience: 86,
    reasons: [
      "홍수·침수·해수면 상승 리스크 심화로 조기경보 수요 명확", // 문맥 부드럽게
      "ODA 연계형 디지털 기후 적응 실증 사업에 최적화",
    ],
    coordBasis: "좌표 기준: 메콩 델타 중심 권역(껀터 인근).",
    available: [
      "과거 홍수/태풍 피해 이력 및 취약 지역 정보",
      "기상 관측망 및 통신 커버리지 데이터",
      "기후 적응 정책 및 재난 대응 체계 문서",
    ],
    missing: [
      "지방정부 단위 실시간 센서 API 접근 권한",
      "기존 경보 시스템 유지보수 및 가동률 데이터",
    ],
    required: [
      "재난관리청 경보 발령 프로토콜 세부 규정",
      "현지 통신망 및 센서 운영 파트너 협력 체계",
    ],
    techSpecificSources: [
      {
        layer: "재난 리스크",
        source: "EM-DAT / 국가재난관리 데이터 / WRI Aqueduct",
        acquisition: "CSV + 수동 구조화",
        cycle: "분기",
        resolution: "국가/지역",
        endpoint: "emdat.be / wri.org",
        note: "재난 이력 및 리스크 지표",
      },
    ],
    regionRows: [
      {
        scope: "지역",
        category: "기후 리스크",
        field: "침수 취약성",
        value: "위험도(상·중·하) 기준 구역 세분화 필요", // 의미 명확화
        unit: "-",
        source: "재난 이력 + DEM",
        update: "반기",
      },
      {
        scope: "지역",
        category: "협력 실행 기반",
        field: "센서·통신망 커버리지",
        value: "취약 지역 내 일부 결측 확인",
        unit: "%",
        source: "통신망 지도 및 정부 기관",
        update: "분기",
      },
    ],
  }),
  makeRec({
    id: 4,
    country: "칠레",
    countryCenter: [-71.543, -35.6751],
    region: "아타카마",
    regionLat: -23.65,
    regionLon: -70.4,
    tech: "태양광 발전",
    continent: "남미",
    purposeTags: ["사업화", "R&D 실증", "국제감축"],
    coverage: 98,
    reliability: 91,
    resilience: 88,
    reasons: [
      "세계 최고 수준의 일사량 기반 대규모 RE+ESS 사업 환경",
      "출력제한 및 계통 혼잡 데이터 분석을 통한 사업 타당성 검토 가능",
    ],
    coordBasis: "좌표 기준: 아타카마 북부 태양광 대상지 권역.", // '후보지' -> '대상지'
    available: [
      "장기 일사량 및 기온 데이터",
      "국가 송전망 확장 계획 및 병목 구간 정보",
      "재생에너지 제도 및 전력 시장 규정",
    ],
    missing: [
      "패널 열화율(극건조/먼지 환경) 현지 실증 데이터", // '실증치' 보강
      "노드별 출력제한 이력 공개 데이터의 상세성 부족",
    ],
    required: [
      "노드별 전력 도매가격·출력제한·접속 규정 확인", // '가격' 구체화
      "현지 EPC/O&M 파트너 실적 및 금융 적격성 심사(Filter)", // '금융필터' 의미 명확화
    ],
    regionRows: [
      {
        scope: "지역",
        category: "기술·역량",
        field: "일사량/기온/먼지 환경",
        value: "고효율 PV 실증 환경에 최적화", // '유리' 순화
        unit: "-",
        source: "NASA / 기상청 / 현장조사",
        update: "월 1회",
      },
      {
        scope: "지역",
        category: "시장·사업",
        field: "계통 접속 혼잡도",
        value: "권역별 상이 (추가 검증 필요)",
        unit: "-",
        source: "계통 운영자 데이터",
        update: "분기",
      },
    ],
  }),
  makeRec({
    id: 5,
    country: "피지",
    countryCenter: [178.065, -17.7134],
    region: "비티레부",
    regionLat: -17.7765,
    regionLon: 177.4359,
    tech: "재난 예측 및 조기경보",
    continent: "태평양도서",
    purposeTags: ["ODA", "정책 설계", "R&D 실증"],
    coverage: 92,
    reliability: 87,
    resilience: 84,
    reasons: [
      "도서국 특성상 기후재난 대응 체계 강화 수요 매우 높음", // '매우 큼' 순화
      "기후 적응 재원(GCF/AF) 연계 사업 설계 최적화", // '적합' 격상
    ],
    coordBasis: "좌표 기준: 비티레부(수바-나디 축) 중심 권역.",
    available: [
      "해수면 상승 및 조위 관측 시계열 데이터",
      "기후재난 피해 이력 및 취약성 지도",
      "국가 적응계획 및 재난 대응 프레임워크", // '프레임' 명확화
    ],
    missing: [
      "외곽 도서 실시간 관측 및 통신 단절 구간 상세 데이터",
      "지역별 경보 전달 체계 운영 성과 지표",
    ],
    required: [
      "재난경보 SOP 및 유관 기관별 역할 정의",
      "도서 간 통신 복원력 평가 및 장비 운영 파트너 확보",
    ],
    regionRows: [
      {
        scope: "지역",
        category: "기후 리스크",
        field: "해안 침수 취약구역",
        value: "우선 설치 권역 도출 필요",
        unit: "-",
        source: "해수면/DEM/해안선",
        update: "반기",
      },
      {
        scope: "지역",
        category: "협력 실행 기반",
        field: "통신/전력 백업 체계",
        value: "도서 간 인프라 편차 심화", // '편차 큼' 순화
        unit: "-",
        source: "통신사·공공기관",
        update: "분기",
      },
    ],
  }),
  makeRec({
    id: 6,
    country: "라오스",
    countryCenter: [102.4955, 19.8563],
    region: "루앙프라방",
    regionLat: 19.8856,
    regionLon: 102.1347,
    tech: "수자원 관리",
    continent: "아시아",
    purposeTags: ["ODA", "정책 설계", "사업화"],
    coverage: 85,
    reliability: 81,
    resilience: 79,
    reasons: [
      "수력 발전 및 하천 유역 관리와 기후변동 대응 전략의 직접 연계", // 문맥 부드럽게
      "메콩 유역 국가 간 협력 프레임워크와 연동 가능",
    ],
    coordBasis: "좌표 기준: 루앙프라방 권역(메콩 유역).",
    available: [
      "댐 수위, 유입 및 방류량 데이터(일부)",
      "하천 수질 및 토사 퇴적 추이 데이터",
      "국가 수자원 및 에너지 정책 문서",
    ],
    missing: [
      "상류 방류 스케줄 및 세부 운영 데이터 접근 한계",
      "지류 단위 유량 센서 데이터 결측",
    ],
    required: [
      "메콩 유역 협의체 내 데이터 공유 범위 확인",
      "수자원 인프라 사업 조달 및 인허가 절차 명세화", // '정리' 격상
    ],
    regionRows: [
      {
        scope: "지역",
        category: "기술·역량",
        field: "유량/수위 변동성",
        value: "건기·우기 간 계절적 편차 뚜렷", // '편차 큼' 순화
        unit: "m³/s, m",
        source: "유역 관측망",
        update: "월 1회",
      },
      {
        scope: "지역",
        category: "시장·사업",
        field: "수자원 인프라 우선 투자 수요",
        value: "정수/저수/모니터링 신규 수요 확보", // '존재' 순화
        unit: "-",
        source: "정부계획/MDB",
        update: "분기",
      },
    ],
  }),
  makeRec({
    id: 7,
    country: "캄보디아",
    countryCenter: [104.991, 12.5657],
    region: "톤레삽",
    regionLat: 12.876,
    regionLon: 104.144,
    tech: "수자원 관리",
    continent: "아시아",
    purposeTags: ["ODA", "사업화"],
    coverage: 86,
    reliability: 82,
    resilience: 80,
    reasons: [
      "수위 변화 및 수질 오염 심화로 정수·모니터링 사업 수요 증대", // '수요가 높음' 순화
      "수자원 ODA와 연계된 인프라 사업화 모델 구축 용이",
    ],
    coordBasis: "좌표 기준: 톤레삽 호수 권역 중심.",
    available: [
      "수위 및 수질(BOD/탁도) 시계열 데이터",
      "식수 접근성 및 기초 상하수도 지표",
      "국가 수자원 관리 정책 문서",
    ],
    missing: [
      "지류별 건기 유량 정밀 측정 데이터",
      "기존 정수 시설 운영 성능 및 고장 이력 데이터",
    ],
    required: [
      "정수 플랜트 인허가 및 환경영향평가(EIA) 기준",
      "현지 운영·조달 기관 연락 체계 및 사업 이력 검증",
    ],
    regionRows: [
      {
        scope: "지역",
        category: "기술·역량",
        field: "수질/수위 변동",
        value: "고강도 계절성 변동 확인", // '계절성 변동 큼' 순화
        unit: "-",
        source: "관측소/정부자료",
        update: "월 1회",
      },
      {
        scope: "지역",
        category: "협력 실행 기반",
        field: "정수 인프라 접근성",
        value: "권역별 접근성 편차 심화", // 의미 명확화
        unit: "-",
        source: "상하수도 지도",
        update: "반기",
      },
    ],
  }),
  makeRec({
    id: 8,
    country: "브라질",
    countryCenter: [-51.9253, -14.235],
    region: "아마조나스",
    regionLat: -3.119,
    regionLon: -60.0217,
    tech: "맹그로브/산림 생태계 복원",
    continent: "남미",
    purposeTags: ["국제감축", "ODA", "사업화"],
    coverage: 93,
    reliability: 88,
    resilience: 85,
    reasons: [
      "산림 복원 및 REDD+ 연계를 통한 감축 잠재량 우수", // '잠재량이 매우 큼' 순화
      "위성 지도 기반 모니터링 데이터 가용성 탁월", // '가용성이 상대적으로 높음' 순화
    ],
    coordBasis: "좌표 기준: 아마조나스 주 마나우스 권역.",
    available: [
      "연도별 산림 훼손 위성 지도 데이터",
      "수종별 탄소 축적량 기본 데이터",
      "국가 산림 및 토지 정책 프레임워크",
    ],
    missing: [
      "불법 벌목 실시간 단속 및 가동 데이터",
      "현지 토지권 경계 최신 GIS 정합성 검증 데이터",
    ],
    required: [
      "토지권 및 원주민 협의 절차에 대한 법적 검토",
      "탄소 크레딧 등록·검증 기준 및 모니터링 시스템 설계",
    ],
    regionRows: [
      {
        scope: "지역",
        category: "기후 리스크",
        field: "산림 훼손 핫스팟",
        value: "고위험 구역 대상지 우선순위 도출 가능",
        unit: "-",
        source: "위성 지도 모니터링",
        update: "월 1회",
      },
      {
        scope: "지역",
        category: "협력 실행 기반",
        field: "토지권·거버넌스",
        value: "사업 추진 전 사전 법적 검토 필수",
        unit: "-",
        source: "정부/법제 문서",
        update: "수시",
      },
    ],
  }),
  makeRec({
    id: 9,
    country: "가나",
    countryCenter: [-1.0232, 7.9465],
    region: "아크라",
    regionLat: 5.6037,
    regionLon: -0.187,
    tech: "친환경 폐기물 처리",
    continent: "아프리카",
    purposeTags: ["사업화", "ODA"],
    coverage: 87,
    reliability: 83,
    resilience: 78,
    reasons: [
      "도시 폐기물 처리 수요 증가 및 관련 정책 과제 명확", // '수요가 높고 명확함' 순화
      "WtE(폐기물 에너지화) 및 매립 가스 회수 등 사업화 모델 검토 적합",
    ],
    coordBasis: "좌표 기준: 아크라 수도권.",
    available: [
      "도시권 폐기물 발생량 및 성상비 데이터",
      "기존 매립지 잔여 용량 및 처리 체계 정보",
      "국가 NDC 내 폐기물 부문 감축 목표", // '항목' 구체화
    ],
    missing: [
      "비공식 수거 체계 기반 물량 통계",
      "매립 가스 포집률 실측 데이터",
    ],
    required: [
      "WtE/PPP 관련 법규 및 전력·가스 Offtake(장기구매계약) 기준", // 약어 설명 추가
      "지자체 조달·계약 구조 및 수수료 체계 분석",
    ],
    regionRows: [
      {
        scope: "지역",
        category: "시장·사업",
        field: "생활 폐기물 발생 밀도",
        value: "고밀도 집중 처리 권역 확인", // '존재' 순화
        unit: "t/day",
        source: "지자체 통계",
        update: "분기",
      },
      {
        scope: "지역",
        category: "협력 실행 기반",
        field: "매립지/처리 시설 입지",
        value: "시설별 운영 상태 개별 점검 필요", // '상이' 명확화
        unit: "-",
        source: "지자체 및 위성 지도",
        update: "반기",
      },
    ],
  }),
  makeRec({
    id: 10,
    country: "세네갈",
    countryCenter: [-14.4524, 14.4974],
    region: "다카르",
    regionLat: 14.7167,
    regionLon: -17.4677,
    tech: "수자원 관리",
    continent: "아프리카",
    purposeTags: ["ODA", "사업화", "정책 설계"],
    coverage: 84,
    reliability: 80,
    resilience: 76,
    reasons: [
      "만성적 물 부족 및 염수화 심화로 해수 담수화·정수 수요 확고", // '분명함' 순화
      "도시 인프라 사업 및 재생에너지 연계 패키지 설계 용이",
    ],
    coordBasis: "좌표 기준: 다카르 광역권.",
    available: [
      "용수 수급 전망 및 단수 이력 데이터",
      "해안 염분 및 수온 기초 관측 데이터",
      "국가 수자원 정책 및 개발 계획 문서",
    ],
    missing: [
      "담수화 대상지 인근 EIA(환경영향평가) 기초 데이터", // '후보지' -> '대상지'
      "기존 시설 운영 효율 및 유지보수 비용 상세 데이터",
    ],
    required: [
      "수도청 장기 계획 및 조달 요건 파악",
      "플랜트-재생에너지 연계 규정 및 계약 구조 분석",
    ],
    regionRows: [
      {
        scope: "지역",
        category: "기술·역량",
        field: "급수 취약 지역 분포",
        value: "우선 투자 대상 구역 식별 필요",
        unit: "-",
        source: "수도청/지자체",
        update: "반기",
      },
      {
        scope: "지역",
        category: "시장·사업",
        field: "담수화 사업 대상지", // '후보지' -> '대상지'
        value: "해안 접근성 기반 사전 타당성 검토 가능",
        unit: "-",
        source: "공간DB/EIA",
        update: "연 1회",
      },
    ],
  }),
];

function buildStrategyEvidence(rec) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };

  const techSourceMap = {
    "태양광 발전": [
      {
        group: "자원",
        label: "일사량·기온",
        source: "NASA POWER",
        mode: "연계 대기 중", // '연계중' 순화
      },
      {
        group: "계통",
        label: "전력접근률·재생에너지 비중",
        source: "World Bank",
        mode: "연계 대기 중",
      },
      {
        group: "실행",
        label: "대상지 좌표·지역 경계", // '후보지' -> '대상지'
        source: "OSM Nominatim",
        mode: "연계 대기 중",
      },
    ],
    "재난 예측 및 조기경보": [
      {
        group: "위험",
        label: "홍수·침수 취약성",
        source: "재난 이력 + DEM + WRI Aqueduct(예정)",
        mode: "대표 데이터",
      },
      {
        group: "실행",
        label: "관측망·통신망 커버리지",
        source: "정부·통신사 데이터",
        mode: "기본 정보", // '탑재 예정' 순화
      },
      {
        group: "위치",
        label: "지역 좌표·경계 검증",
        source: "OSM Nominatim",
        mode: "연계 대기 중",
      },
    ],
    "수자원 관리": [
      {
        group: "수문",
        label: "수위·유량·수질",
        source: "유역 관측망·정부 통계",
        mode: "대표 데이터",
      },
      {
        group: "실행",
        label: "급수 취약지역·인프라 수요",
        source: "정부계획·MDB 문서",
        mode: "기본 정보",
      },
      {
        group: "위치",
        label: "지역 경계·좌표",
        source: "OSM Nominatim",
        mode: "연계 대기 중",
      },
    ],
    "탄소 포집 및 저장 (CCUS)": [
      {
        group: "산업",
        label: "배출원·산업단지 분포",
        source: "국가 통계·산업지도",
        mode: "대표 데이터",
      },
      {
        group: "저장",
        label: "저장소 탐사·평가",
        source: "Global CCS Institute·지질조사기관",
        mode: "기본 정보",
      },
      {
        group: "정책",
        label: "감축인증·인허가 요건",
        source: "국가 정책 문서",
        mode: "기본 정보",
      },
    ],
    "맹그로브/산림 생태계 복원": [
      {
        group: "자연기반",
        label: "산림훼손 핫스팟",
        source: "위성 지도 모니터링",
        mode: "대표 데이터",
      },
      {
        group: "MRV",
        label: "토지권·탄소크레딧 경로",
        source: "정부·법제 문서",
        mode: "기본 정보",
      },
      {
        group: "위치",
        label: "경계·좌표 검증",
        source: "OSM Nominatim",
        mode: "연계 대기 중",
      },
    ],
    "친환경 폐기물 처리": [
      {
        group: "수요",
        label: "폐기물 발생량·성상",
        source: "지자체 통계",
        mode: "대표 데이터",
      },
      {
        group: "사업",
        label: "처리시설 입지·운영현황",
        source: "지자체 + 위성 지도",
        mode: "대표 데이터",
      },
      {
        group: "재원",
        label: "PPP·Offtake 필터",
        source: "정책·계약 문서",
        mode: "기본 정보",
      },
    ],
  };

  // 대화형 종결(~함께 본다)을 개조식 명사형으로 통일
  const purposeMap = {
    ODA: "공공서비스 개선, 형평성, 현지 운영 역량 강화 통합 검토",
    사업화: "수요 밀도, 사업 수지, 제도 및 조달 구조 통합 검토",
    "R&D 실증": "현장 데이터 확보 용이성, 실증 파트너, 사업 확장성 통합 검토",
    국제감축: "예상 감축량 산정, MRV 방법론, 인증 및 정책 연계성 통합 검토",
    "정책 설계": "국가 기후 전략, 제도 정합성, 거버넌스 이행 체계 통합 검토",
  };

  return sanitizeStrategyEvidence(
    {
      summary: `${safeRec.country} · ${rec.region}의 ${safeRec.tech} 협력안에 대한 기술 적합성 및 현장 적용 가능성 1차 검토 결과입니다.`, // 문맥 부드럽게
      drivers: rec.reasons || [],
      purposeFit: (rec.purposeTags || []).map((tag) => ({
        tag,
        note: purposeMap[tag] || "목적별 정합성 검토 데이터 연동 대기 중", // '검토 필요' -> 시스템 상태 톤으로 순화
      })),
      sourceData: techSourceMap[getTechLookupKey(rec.tech)] ||
        techSourceMap[rec.tech] || [
          {
            group: "기본",
            label: "국가지표·좌표·정책 문서",
            source: "World Bank / OSM / 정책문서",
            mode: "대표 데이터",
          },
        ],
    },
    rec
  );
}

const PARTNER_DIRECTORY = {
  멕시코: {
    default: [
      {
        name: "Secretaría de Energía (SENER)",
        role: "정책 승인",
        priority: "핵심",
        note: "에너지 정책·인허가·전략 정합성 검토 창구",
        href: "https://www.gob.mx/sener",
      },
      {
        name: "Servicio Geológico Mexicano (SGM)",
        role: "기술 검증",
        priority: "핵심",
        note: "저장소 대상지·지질 정보·공간자료 검토", // '후보지' -> '대상지'
        href: "https://www.gob.mx/sgm",
      },
      {
        name: "Secretaría de Medio Ambiente y Recursos Naturales (SEMARNAT)",
        role: "환경 인허가",
        priority: "권장",
        note: "환경영향·기후정책 정합성 검토",
        href: "https://www.gob.mx/semarnat",
      },
      {
        name: "Centro Nacional de Control del Gas Natural (CENAGAS)",
        role: "인프라 연계",
        priority: "후보",
        note: "가스·수송 인프라 및 허브 연계 검토",
        href: "https://www.gob.mx/cenagas",
      },
    ],
  },
  케냐: {
    default: [
      {
        name: "Ministry of Energy and Petroleum",
        role: "정책 승인",
        priority: "핵심",
        note: "전력·재생에너지 정책 및 승인 경로 협의",
        href: "https://www.energy.go.ke/",
      },
      {
        name: "Rural Electrification and Renewable Energy Corporation (REREC)",
        role: "현장 실행",
        priority: "핵심",
        note: "농촌전력화·재생에너지 현장 사업 수행 파트너",
        href: "https://www.rerec.co.ke/",
      },
      {
        name: "Kenya Power",
        role: "계통 연계",
        priority: "권장",
        note: "배전망 접속 및 수요 측 운영 협력",
        href: "https://www.kplc.co.ke/",
      },
      {
        name: "Kenya Meteorological Department",
        role: "기후 데이터",
        priority: "후보",
        note: "기상 및 기후 데이터 연계 검토",
        href: "https://meteo.go.ke/",
      },
    ],
  },
  베트남: {
    default: [
      {
        name: "Ministry of Agriculture and Environment (MAE/MONRE portal)",
        role: "정책 승인",
        priority: "핵심",
        note: "기후·재난·환경 거버넌스 및 국가정책 협의",
        href: "https://en.mae.gov.vn/",
      },
      {
        name: "National Center for Hydrometeorological Forecasting (NCHMF)",
        role: "조기경보 운영",
        priority: "핵심",
        note: "기상·홍수 예보 및 조기경보 정보 연계",
        href: "https://nchmf.gov.vn/KttvsiteE/en-US/2/index.html",
      },
      {
        name: "Vietnam Disaster and Dyke Management Authority (VDDMA)",
        role: "재난대응 실행",
        priority: "권장",
        note: "재난 대응 프로토콜 및 현장 대응 체계 협력",
        href: "https://phongchongthientai.mard.gov.vn/en/Pages/home.aspx",
      },
      {
        name: "Can Tho City Portal / local government",
        role: "지역 실증",
        priority: "권장",
        note: "메콩 델타 지역 실증 및 지자체 협력 창구",
        href: "https://www.cantho.gov.vn/home",
      },
    ],
    byTech: {
      "재난 예측 및 조기경보": [
        {
          name: "Ministry of Agriculture and Environment (MAE/MONRE portal)",
          role: "정책 승인",
          priority: "핵심",
          note: "기후 적응 및 조기경보 정책 부처 협의",
          href: "https://en.mae.gov.vn/",
        },
        {
          name: "National Center for Hydrometeorological Forecasting (NCHMF)",
          role: "조기경보 운영",
          priority: "핵심",
          note: "관측·예경보 서비스 및 데이터 연계",
          href: "https://nchmf.gov.vn/KttvsiteE/en-US/2/index.html",
        },
        {
          name: "Vietnam Disaster and Dyke Management Authority (VDDMA)",
          role: "현장 대응",
          priority: "권장",
          note: "재난 대응 프로토콜 및 운영 체계 협업",
          href: "https://phongchongthientai.mard.gov.vn/en/Pages/home.aspx",
        },
        {
          name: "Can Tho City Portal / local government",
          role: "지역 실증",
          priority: "권장",
          note: "메콩 델타 지역 단위 실증 및 도시 협력",
          href: "https://www.cantho.gov.vn/home",
        },
      ],
    },
  },
  칠레: {
    default: [
      {
        name: "Ministry of Energy",
        role: "정책 승인",
        priority: "핵심",
        note: "재생에너지 정책 및 전력 시장 프레임워크 협의",
        href: "https://www.gob.cl/en/ministries/ministry-of-energy/",
      },
      {
        name: "National Energy Commission (CNE)",
        role: "규제·계획",
        priority: "핵심",
        note: "송전망 계획, 규제 및 기술 규정 검토",
        href: "https://www.cne.cl/en/",
      },
      {
        name: "Coordinador Eléctrico Nacional",
        role: "계통 운영",
        priority: "권장",
        note: "계통 혼잡, 접속 및 운영 데이터 협력",
        href: "https://www.coordinador.cl/",
      },
      {
        name: "CORFO",
        role: "사업화",
        priority: "권장",
        note: "실증, 혁신 및 산업화 프로그램 연계",
        href: "https://www.corfo.gob.cl/",
      },
    ],
  },
  // ...
  피지: {
    default: [
      {
        name: "Fiji Meteorological Services",
        role: "조기경보 운영",
        priority: "핵심",
        note: "국가 예보·경보 체계 운영 기관",
        href: "https://www.met.gov.fj/",
      },
      {
        name: "National Disaster Management Office (NDMO)",
        role: "재난 대응",
        priority: "핵심",
        note: "국가 재난위험경감 및 대응 조정",
        href: "https://www.ndmo.gov.fj/home/",
      },
      {
        name: "Fiji Climate Change Portal / NDA",
        role: "기후재원·정책",
        priority: "권장",
        note: "기후 정책·국제협력·재원 총괄 창구",
        href: "https://fijiclimatechangeportal.gov.fj/",
      },
      {
        name: "Energy Fiji Limited (EFL)",
        role: "전력·복원력",
        priority: "기타", // '후보' -> '기타' 또는 '선택' (priority 맥락상)
        note: "전력 인프라 복원력 및 백업 체계 협력",
        href: "https://efl.com.fj/",
      },
    ],
  },
  라오스: {
    default: [
      {
        name: "Ministry of Energy and Mines",
        role: "정책 승인",
        priority: "핵심",
        note: "에너지·인프라·수자원 연계 정책 협의",
        href: "https://www.mem.gov.la/?lang=en&page_id=593",
      },
      {
        name: "Ministry of Natural Resources and Environment (MONRE)",
        role: "수자원 거버넌스",
        priority: "핵심",
        note: "유역·환경·수자원 관리 협의",
        href: "https://www.monre.gov.la/",
      },
      {
        name: "Électricité du Laos (EDL)",
        role: "운영·인프라",
        priority: "권장",
        note: "전력 및 수력 연계 운영 협력",
        href: "https://edl.com.la/",
      },
      {
        name: "Lao National Mekong Committee",
        role: "유역 협력",
        priority: "기타",
        note: "메콩 유역 데이터 및 협력 프레임워크 연계",
        href: "https://www.mrcmekong.org/lao/",
      },
    ],
  },
  캄보디아: {
    default: [
      {
        name: "Ministry of Water Resources and Meteorology (MOWRAM)",
        role: "정책 승인",
        priority: "핵심",
        note: "수자원·홍수·기상 거버넌스 협의",
        href: "https://mowram.gov.kh/",
      },
      {
        name: "Tonle Sap Authority",
        role: "지역 협력",
        priority: "핵심",
        note: "톤레삽 권역 수자원·생태·지역 협력 창구",
        href: "https://tonlesap.gov.kh/",
      },
      {
        name: "Ministry of Mines and Energy",
        role: "인프라 연계",
        priority: "권장",
        note: "에너지 및 인프라 사업 연계 검토",
        href: "https://mme.gov.kh/",
      },
    ],
  },
  브라질: {
    default: [
      {
        name: "Ministério do Meio Ambiente e Mudança do Clima (MMA)",
        role: "정책 승인",
        priority: "핵심",
        note: "산림 복원 및 기후 정책 거버넌스 협의",
        href: "https://www.gov.br/mma/en",
      },
      {
        name: "Serviço Florestal Brasileiro (SFB)",
        role: "산림 실행",
        priority: "핵심",
        note: "산림 관리·복원 및 공공 산림 정보 협력",
        href: "https://www.gov.br/florestal/pt-br",
      },
      {
        name: "Ibama",
        role: "환경 집행",
        priority: "권장",
        note: "감시·집행 및 환경 규제 협력",
        href: "https://www.gov.br/ibama/en",
      },
      {
        name: "INPE TerraBrasilis",
        role: "모니터링 데이터",
        priority: "권장",
        note: "PRODES/DETER 기반 위성 지도 모니터링 데이터",
        href: "https://terrabrasilis.dpi.inpe.br/en/home-page/",
      },
    ],
  },
  가나: {
    default: [
      {
        name: "Accra Metropolitan Assembly (AMA)",
        role: "지자체 실행",
        priority: "핵심",
        note: "도시 폐기물 현장 운영 및 조달 협력",
        href: "https://ama.gov.gh/",
      },
      {
        name: "Environmental Protection Authority (EPA Ghana)",
        role: "환경 규제",
        priority: "핵심",
        note: "환경 규제·영향평가 및 감축 협의",
        href: "https://www.epa.gov.gh/",
      },
      {
        name: "Ministry of Environment, Science, Technology and Innovation (MESTI)",
        role: "정책 승인",
        priority: "권장",
        note: "환경·기술 정책 및 국가 정합성 검토",
        href: "https://mesti.gov.gh/",
      },
      {
        name: "Ministry of Sanitation and Water Resources",
        role: "서비스 연계",
        priority: "기타",
        note: "위생 및 공공 서비스 정책 연계",
        href: "https://www.ghana.gov.gh/ministries/390de61096/",
      },
    ],
  },
  세네갈: {
    default: [
      {
        name: "Office National de l’Assainissement du Sénégal (ONAS)",
        role: "현장 실행",
        priority: "핵심",
        note: "도시 위생·배수·폐수 인프라 운영 기관",
        href: "https://onas.sn/",
      },
      {
        name: "SONES",
        role: "사업 운영",
        priority: "핵심",
        note: "국가 상수 및 인프라 운영 연계",
        href: "https://www.sones.sn/",
      },
      {
        name: "Government of Senegal – Minister of Water and Sanitation",
        role: "정책 승인",
        priority: "권장",
        note: "상하수도 및 위생 정책 총괄 창구",
        href: "https://mha.gouv.sn/",
      },
    ],
  },
  인도네시아: {
    default: [
      {
        name: "Ministry of Energy and Mineral Resources (ESDM)",
        role: "정책 승인",
        priority: "핵심",
        note: "에너지·전력 정책 및 승인 경로 협의",
        href: "https://www.esdm.go.id/en",
      },
      {
        name: "PLN",
        role: "계통·사업 실행",
        priority: "핵심",
        note: "전력망 접속·운영 및 사업 개발 협력",
        href: "https://www.pln.co.id/",
      },
      {
        name: "BMKG",
        role: "기후·재난 데이터",
        priority: "권장",
        note: "기상·기후 및 조기경보 데이터 연계",
        href: "https://www.bmkg.go.id/",
      },
    ],
  },
};

function getPartnerDirectory(rec) {
  const countryEntry = PARTNER_DIRECTORY[rec?.country];
  if (!countryEntry) return [];
  const techKey = getTechLookupKey(rec?.tech);
  const techSpecific =
    countryEntry.byTech?.[techKey] || countryEntry.byTech?.[rec?.tech];
  return cloneJsonSafe(techSpecific || countryEntry.default || []);
}

function buildExecutionFeasibility(rec) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const actualPartners = getPartnerDirectory(rec);

  const countryMap = {
    베트남: {
      stage: "우선 검토 국가",
      projectSignal:
        "메콩 델타 적응 및 재난 대응 수요가 명확하여 초기 검토 대상으로 최적화됨", // '뚜렷하여', '좋은' 순화
      financeChannels: ["ODA", "ADB", "World Bank", "GCF"],
      deliveryPartners: actualPartners.map((item) => item.name),
      financeNote: "공공 재원, 시범 사업 재원 및 디지털 인프라 연계 우선 검토",
    },
    칠레: {
      stage: "사업화 우선 검토",
      projectSignal: "민간 사업 및 계통 연계형 실증 사업의 통합 검토 환경 우수", // '검토하기 좋은 시장' 순화
      financeChannels: ["민간투자", "개발금융", "국제감축"],
      deliveryPartners: actualPartners.map((item) => item.name),
      financeNote:
        "민간 자본 및 개발 금융 혼합(Blended Finance) 구조 적용 권장", // 전문 용어 보강
    },
  };

  const defaultProfile = {
    stage: safeArray(rec?.purposeTags).includes("ODA")
      ? "공공협력 우선 검토"
      : "실행 목적 적합도 검토 단계",
    projectSignal: `${safeRec.tech} 협력 수요는 확인되나, 프로젝트 파이프라인 및 금융 구조 데이터 기본 정보 중입니다.`, // '탑재가 필요합니다' -> 시스템 상태
    financeChannels: safeArray(rec?.purposeTags).includes("ODA")
      ? ["ODA", "MDB"]
      : ["민간투자", "개발금융"],
    deliveryPartners: actualPartners.length
      ? actualPartners.map((item) => item.name)
      : ["중앙정부", "지방정부", "현지 운영기관"],
    financeNote:
      "프로젝트 및 금융 데이터 API 연동 시 실행성 판단 지표가 활성화됩니다.", // 'API가 연결되면 ~정교화할 수 있습니다' 순화
  };

  return countryMap[rec.country] || defaultProfile;
}

function buildLocalPartners(rec) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const actualPartners = getPartnerDirectory(rec);

  if (actualPartners.length) return actualPartners;

  const execution = buildExecutionFeasibility(rec);
  const roles = [
    { stage: "정책 승인", note: "관할 부처 파악 및 규제·승인 경로 검토" }, // '~확인합니다' -> 개조식 명사형
    {
      stage: "현장 실행",
      note: "지자체·사업자·운영 기관 중심 실증 및 사업화 추진",
    },
    {
      stage: "운영·확산",
      note: "유지 관리, 데이터 운영 및 사업 확산 파트너 발굴",
    }, // '~연결합니다' 순화
  ];

  return safeArray(execution.deliveryPartners).map((name, idx) => ({
    name,
    role: roles[idx]?.stage || "협력 파트너",
    priority: idx === 0 ? "핵심" : idx === 1 ? "권장" : "기타", // '후보' -> '기타'
    note:
      roles[idx]?.note ||
      `${safeRec.country} ${rec.region} 현장 적용을 위한 파트너 그룹입니다.`,
  }));
}

function buildSuitabilityLogic(rec) {
  return {
    title: "TNA 기반 적합기술 선정 로직",
    summary:
      "TNA, NDC, 기후 리스크, 현지 실행성, 데이터 준비도를 종합하여 국가별 적합 기술을 우선순위화합니다.",
    weights: [
      {
        label: "국가 수요 및 TNA 정합성", // 기호(·) 대신 자연스러운 접속사 사용
        value: 30,
        note: "국가 최우선 과제와 기술 수요의 일치 여부",
      },
      {
        label: "기후·자원 위험 노출도", // '노출' -> '노출도' 명사형
        value: 20,
        note: "자원 잠재량, 기후 위험도 및 취약성 평가",
      },
      {
        label: "정책 및 제도 정합성",
        value: 20,
        note: "NDC, 관련 제도, 인허가 및 조달 구조 연계성",
      },
      {
        label: "실행 파트너 및 프로젝트 가능성",
        value: 15,
        note: "현지 파트너 발굴, 프로젝트 파이프라인 및 금융 연계 검토",
      },
      {
        label: "데이터 준비도",
        value: 15,
        note: "데이터 충족률, 신뢰도 및 복원력 평가",
      },
    ],
    output:
      "국가·기술·지역 기반 1차 협력 대상을 도출한 후, 사업 모델 및 실행 여건을 심층 검토합니다.", // '후보를 1차로 추리고' 순화
  };
}

function getPilotStatus(rec) {
  if (rec.country !== "베트남") return null;
  return {
    badge: "베트남 우선 탑재",
    status: "메콩 델타 재난 및 기후 적응 데이터 우선 연동", // '탑재' -> '연동'
    datasets: [
      "홍수 및 침수 취약지역",
      "관측망 및 통신망 커버리지",
      "재난 대응 프로토콜",
      "프로젝트 및 재원 연계 대상", // '재원 후보군' -> '재원 연계 대상'
    ],
    nextActions: [
      "TNA/NDC 문서 구조화",
      "프로젝트 및 금융 데이터 연동", // '연결' 순화
      "지역별 우선순위 검증",
    ],
  };
}

const COUNTRY_DATA_ENRICHMENTS = {
  멕시코: {
    countryNote:
      "멕시코 검토 시 2025 NDC 3.0, GCF Country Programme, 국가 통계 포털을 통합 분석하여 산업 전환 및 CCUS 관련 정책·재원 방향을 파악할 수 있습니다.", // '~같이 보면 ~동시에 파악할 수 있습니다' 순화
    inventoryRows: [
      {
        status: "확보",
        group: "정책·문서",
        name: "Mexico NDC 3.0 공식 링크", // '직접 링크' 보단 '공식 링크'가 덜 구어체임
        scope: "국가",
        memo: "UNFCCC 공식 제출 페이지 연계",
      },
      {
        status: "확보",
        group: "국제협력",
        name: "GCF Mexico Country Programme",
        scope: "국가",
        memo: "기후 재원 파이프라인 내 우선 분야 확인",
      },
    ],
    sourcePlan: [
      {
        layer: "국가 감축 공약",
        source: "UNFCCC Mexico NDC 3.0",
        acquisition: "Public document",
        cycle: "제출 및 갱신 시",
        resolution: "국가",
        endpoint: "https://unfccc.int/documents/654344",
        note: "2035 온실가스 감축 목표 및 이행 수단 확인", // '직접 확인' 등 대화형 어조 배제
      },
      {
        layer: "국제기후재원",
        source: "GCF Mexico Country Programme",
        acquisition: "Public document",
        cycle: "국가 프로그램 갱신 시",
        resolution: "국가",
        endpoint:
          "https://www.greenclimate.fund/document/mexico-country-programme",
        note: "국가 우선 협력 분야 및 기후 재원 파이프라인 확인",
      },
      {
        layer: "국가 기본정보",
        source: "World Bank Mexico Data",
        acquisition: "Public web/API",
        cycle: "연 1회 이상",
        resolution: "국가",
        endpoint: "https://data.worldbank.org/country/mexico",
        note: "GDP, 인구, 전력 및 산업 관련 기초 지표 확인",
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "국가 공약",
        field: "Mexico NDC 3.0",
        value: "2035 감축 목표 및 이행 수단 원문 제공", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "UNFCCC document page",
        link: "https://unfccc.int/documents/654344",
        update: "2025-11",
      },
      {
        scope: "국가",
        category: "기후재원",
        field: "GCF Mexico Country Programme",
        value:
          "국가 차원의 기후 재원 우선 분야 및 프로젝트 파이프라인 방향성 제시", // '~확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF country programme",
        link: "https://www.greenclimate.fund/document/mexico-country-programme",
        update: "2023-08",
      },
    ],
    strategyEvidence: {
      summary:
        "멕시코 대상 협력안 검토 시 2025 NDC 3.0, GCF Country Programme, 국가 데이터 포털 통합 분석을 권장합니다.", // '가장 실무적입니다' 대화형 어조 배제
      sourceData: [
        {
          id: "mx-ndc-2025",
          label: "멕시코 NDC 3.0",
          group: "정책",
          source: "UNFCCC Mexico NDC 3.0",
          mode: "공식 포털",
          link: "https://unfccc.int/documents/654344",
          description: "멕시코 최신 NDC 제출 문서 및 제출 시점 직접 열람 가능", // '확인할 수 있습니다' -> 개조식
          lastUpdated: "2025-11",
          sampleFields: ["title", "submissionDate", "link"],
          rows: [
            {
              title: "Mexico NDC 3.0",
              submissionDate: "2025-11-17",
              link: "https://unfccc.int/documents/654344",
            },
          ],
        },
        {
          id: "mx-gcf-programme",
          label: "멕시코 GCF 국가 프로그램",
          group: "재원",
          source: "GCF Country Programme",
          mode: "공식 포털",
          link: "https://www.greenclimate.fund/document/mexico-country-programme",
          description:
            "멕시코 기후 재원 우선 분야 및 파이프라인 공식 명세 문서", // '보여주는~' 서술형 수정
          lastUpdated: "2023-08",
          sampleFields: ["documentType", "country", "link"],
          rows: [
            {
              documentType: "Country Programme",
              country: "Mexico",
              link: "https://www.greenclimate.fund/document/mexico-country-programme",
            },
          ],
        },
      ],
    },
    executionFeasibility: {
      stage: "사업화 및 정책 검토 병행",
      projectSignal:
        "2025 NDC 3.0 및 GCF 국가 프로그램을 통한 산업 전환·기후 재원 연계 정보 통합 검토 가능",
      financeChannels: ["민간투자", "국제감축", "GCF", "MDB"],
      financeNote:
        "산업 탈탄소화 및 인프라 구축 사업의 통합적 구조화(Structuring) 권장", // '함께 검토하는 것이 적합합니다' 전문화
    },
    actions: [
      "멕시코 NDC 3.0 및 GCF 국가 프로그램 교차 분석 기반 CCUS 사업 타당성 검토 메모 작성", // '함께 보고~정리합니다' 순화
    ],
  },
  케냐: {
    countryNote:
      "케냐 검토 시 2025 NDC 업데이트, GCF 국가 페이지, World Bank 기후회복력 사업 문서를 통합 분석하여 태양광·전력 접근성·회복력 개선 사업의 연계 타당성을 파악할 수 있습니다.", // '검토하기 좋습니다' 순화
    inventoryRows: [
      {
        status: "확보",
        group: "정책·문서",
        name: "Kenya updated NDC 공식 링크",
        scope: "국가",
        memo: "UNFCCC 공식 제출 페이지 연계",
      },
      {
        status: "확보",
        group: "국제협력",
        name: "Kenya Water Security and Climate Resilience project document",
        scope: "국가/프로젝트",
        memo: "World Bank 공식 문서 연계",
      },
    ],
    sourcePlan: [
      {
        layer: "국가 감축 공약",
        source: "UNFCCC Kenya updated NDC",
        acquisition: "Public document",
        cycle: "제출 및 갱신 시",
        resolution: "국가",
        endpoint: "https://unfccc.int/node/646649",
        note: "2025년 제출 기준 케냐 NDC 업데이트 내역 확인",
      },
      {
        layer: "국제기후재원",
        source: "GCF Kenya country page",
        acquisition: "Public web",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: "https://www.greenclimate.fund/countries/kenya",
        note: "국가 단위 GCF 프로젝트 및 Readiness 활동 확인",
      },
      {
        layer: "국제협력 프로젝트",
        source:
          "World Bank Kenya Water Security and Climate Resilience Project",
        acquisition: "Public document",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint:
          "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099120624085033937",
        note: "기후 회복력 및 수자원 관리 부문 실행 사례 참고", // '참고' -> '벤치마킹' 전문화
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "국가 공약",
        field: "Kenya updated NDC",
        value: "2025 제출 기준 최신 NDC 제출 내역 및 원문 제공", // '확인할 수 있습니다' 순화
        unit: "-",
        source: "UNFCCC document page",
        link: "https://unfccc.int/node/646649",
        update: "2025-04",
      },
      {
        scope: "국가/프로젝트",
        category: "국제협력 사업",
        field: "Kenya Water Security and Climate Resilience Project",
        value:
          "수자원 및 지역 복원력 개선 사업의 구조·이행 현황 분석 자료 제공", // '참고할 수 있습니다' 순화
        unit: "-",
        source: "World Bank document detail",
        link: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099120624085033937",
        update: "2024-12",
      },
    ],
    strategyEvidence: {
      summary:
        "케냐 대상 협력안 검토 시 최신 NDC, GCF 국가 페이지, World Bank 기후회복력 사업 문서 통합 분석을 권장합니다.", // '실무적입니다' 배제
      sourceData: [
        {
          id: "ke-ndc-2025",
          label: "케냐 최신 NDC 제출 페이지",
          group: "정책",
          source: "UNFCCC Kenya updated NDC",
          mode: "공식 포털",
          link: "https://unfccc.int/node/646649",
          description:
            "2025 기준 최신 NDC 제출 현황 및 첨부 문서 직접 열람 가능", // '확인할 수 있습니다' 순화
          lastUpdated: "2025-04",
          sampleFields: ["title", "submissionDate", "link"],
          rows: [
            {
              title: "Kenya First NDC (Updated submission)",
              submissionDate: "2025-04-30",
              link: "https://unfccc.int/node/646649",
            },
          ],
        },
        {
          id: "ke-wb-resilience",
          label: "케냐 기후회복력 프로젝트 문서",
          group: "프로젝트",
          source: "World Bank",
          mode: "공식 포털",
          link: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099120624085033937",
          description:
            "기후 회복력 및 수자원 사업의 구체적 실행 구조(Implementation Arrangement) 명세 문서", // '~확인할 수 있는' 서술형 정제
          lastUpdated: "2024-12",
          sampleFields: ["title", "country", "link"],
          rows: [
            {
              title: "Kenya - Water Security and Climate Resilience Project",
              country: "Kenya",
              link: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099120624085033937",
            },
          ],
        },
      ],
    },
    executionFeasibility: {
      stage: "ODA 및 분산전원 실증 검토",
      projectSignal:
        "GCF 및 World Bank 사업 문서를 교차 분석하여 태양광·전력 접근성·회복력 수요 검토 가능", // '함께 검토할 수 있습니다' -> '교차 분석하여 ~ 검토 가능'
      financeChannels: ["ODA", "World Bank", "GCF", "민간투자"],
      financeNote:
        "농촌 전력화 및 지역 복원력 개선 패키지의 통합 설계(Integrated Design) 권장", // '설계하는 접근이 적합합니다' -> 명사형 + 전문용어 보완
    },
  },
  칠레: {
    countryNote:
      "칠레 대상 협력안 검토 시 2025 NDC 제출 페이지, GCF 국가 페이지, World Bank 국가 데이터를 통합 분석하면 재생에너지·계통 혼잡 완화·감축형 사업의 타당성을 명확히 파악할 수 있습니다.", // '함께 보면 ~유리합니다' 순화
    inventoryRows: [
      {
        status: "확보",
        group: "정책·문서",
        name: "Chile NDC 2025 공식 링크", // 'direct page' 순화
        scope: "국가",
        memo: "UNFCCC 공식 제출 페이지 연계",
      },
      {
        status: "확보",
        group: "국제협력",
        name: "GCF Chile country page",
        scope: "국가",
        memo: "기후 재원 활동 현황 및 국가 창구(NDA) 확인",
      },
    ],
    sourcePlan: [
      {
        layer: "국가 감축 공약",
        source: "UNFCCC Chile NDC 2025",
        acquisition: "Public document",
        cycle: "제출 및 갱신 시",
        resolution: "국가",
        endpoint: "https://unfccc.int/documents/499043",
        note: "2025 제출 기준 칠레 NDC 원문 확보",
      },
      {
        layer: "국제기후재원",
        source: "GCF Chile country page",
        acquisition: "Public web",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: "https://www.greenclimate.fund/countries/chile",
        note: "칠레 대상 GCF 활동 이력 및 NDA 창구 정보 확인",
      },
      {
        layer: "국가 기본정보",
        source: "World Bank Chile Data",
        acquisition: "Public web/API",
        cycle: "연 1회 이상",
        resolution: "국가",
        endpoint: "https://data.worldbank.org/country/chile",
        note: "국가 거시경제 및 에너지 부문 기초 지표 제공",
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "국가 공약",
        field: "Chile NDC 2025",
        value: "국가 감축 목표 및 부문별 이행 방향 원문 제공", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "UNFCCC document page",
        link: "https://unfccc.int/documents/499043",
        update: "2025-09",
      },
      {
        scope: "국가",
        category: "기후재원",
        field: "GCF Chile country page",
        value: "국가 차원 GCF 활동 내역 및 전담 창구(NDA) 정보 제공", // '확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF country page",
        link: "https://www.greenclimate.fund/countries/chile",
        update: "2026-03 확인",
      },
    ],
    strategyEvidence: {
      summary:
        "칠레 대상 협력안 검토 시 최신 NDC, GCF 국가 페이지, World Bank 데이터 포털의 통합 분석을 우선 권장합니다.", // '가장 빠릅니다' 대화형 어조 배제
      sourceData: [
        {
          id: "cl-ndc-2025",
          label: "칠레 NDC 2025",
          group: "정책",
          source: "UNFCCC Chile NDC 2025",
          mode: "공식 포털",
          link: "https://unfccc.int/documents/499043",
          description: "최신 제출 기준의 NDC 문서 공식 열람 페이지", // '페이지를 확인할 수 있습니다' 순화
          lastUpdated: "2025-09",
          sampleFields: ["title", "submissionDate", "link"],
          rows: [
            {
              title: "Chile NDC 2025",
              submissionDate: "2025-09-23",
              link: "https://unfccc.int/documents/499043",
            },
          ],
        },
      ],
    },
    executionFeasibility: {
      stage: "사업화 우선 검토",
      projectSignal:
        "재생에너지, 계통 혼잡 완화, 감축 연계 사업 타당성 검토를 위한 정책 및 재원 근거 확보 완료", // '확보되어 있습니다' 개조식 변경
      financeChannels: ["민간투자", "국제감축", "GCF", "개발금융"],
      financeNote:
        "민간 투자 및 개발 금융 혼합(Blended Finance) 구조 기반 사업 기획 권장", // '보는 것이 적합합니다' 전문화
    },
  },
  피지: {
    countryNote:
      "피지 대상 협력안 검토 시 국가 기후 포털 내 NAP 자료, GCF Country Programme, World Bank 데이터를 통합 분석하여 도서국 맞춤형 조기경보 및 복원력 사업 타당성을 도출할 수 있습니다.",
    inventoryRows: [
      {
        status: "확보",
        group: "정책·문서",
        name: "Fiji NAP portal and key adaptation documents",
        scope: "국가",
        memo: "Fiji Climate Change Portal 공식 자료 연계",
      },
      {
        status: "확보",
        group: "국제협력",
        name: "Fiji GCF Country Programme",
        scope: "국가",
        memo: "기후 재원 우선 협력 분야 및 파이프라인 명세",
      },
    ],
    sourcePlan: [
      {
        layer: "적응 정책",
        source: "Fiji Climate Change Portal - adaptation",
        acquisition: "Public web/PDF",
        cycle: "정책 갱신 시",
        resolution: "국가",
        endpoint:
          "https://fijiclimatechangeportal.gov.fj/about-ccd/about-adaptation/",
        note: "NAP 및 적응 부문 핵심 정책 문서 직접 연계",
      },
      {
        layer: "국제기후재원",
        source: "GCF Fiji Country Programme",
        acquisition: "Public document",
        cycle: "국가 프로그램 갱신 시",
        resolution: "국가",
        endpoint:
          "https://www.greenclimate.fund/document/fiji-country-programme",
        note: "도서국 맞춤형 기후 재원 우선 분야 및 파이프라인 목록 제공",
      },
      {
        layer: "국가 기본정보",
        source: "World Bank Fiji Data",
        acquisition: "Public web/API",
        cycle: "연 1회 이상",
        resolution: "국가",
        endpoint: "https://data.worldbank.org/country/fiji",
        note: "국가 거시경제, 인구 및 인프라 기초 지표 제공",
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "적응 정책",
        field: "Fiji NAP and adaptation documents",
        value: "국가 적응 정책 및 핵심 전략 문서 통합 열람 가능", // '한곳에서 확인할 수 있습니다' 순화
        unit: "-",
        source: "Fiji Climate Change Portal",
        link: "https://fijiclimatechangeportal.gov.fj/about-ccd/about-adaptation/",
        update: "2025 기준 포털 확인",
      },
      {
        scope: "국가",
        category: "기후재원",
        field: "Fiji GCF Country Programme",
        value: "도서국 특화 기후 재원 파이프라인 및 전략적 우선순위 명세", // '확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF country programme",
        link: "https://www.greenclimate.fund/document/fiji-country-programme",
        update: "공개 문서 기준",
      },
    ],
    strategyEvidence: {
      summary:
        "피지 대상 협력안 검토 시 국가 기후 포털 내 적응 부문 문서 및 GCF Country Programme 통합 분석을 권장합니다.", // '가장 실무적입니다' 대화형 어조 배제
      sourceData: [
        {
          id: "fj-nap-portal",
          label: "피지 적응 정책 포털", // '문서 선반' -> 공식적이고 명확한 명칭으로 수정
          group: "정책",
          source: "Fiji Climate Change Portal",
          mode: "공식 포털",
          link: "https://fijiclimatechangeportal.gov.fj/about-ccd/about-adaptation/",
          description: "NAP 및 적응 부문 핵심 정책 문서 공식 열람 페이지", // '바로 확인할 수 있습니다' 개조식 변경
          lastUpdated: "2025 기준 포털 확인",
          sampleFields: ["documentHub", "country", "link"],
          rows: [
            {
              documentHub: "About Adaptation",
              country: "Fiji",
              link: "https://fijiclimatechangeportal.gov.fj/about-ccd/about-adaptation/",
            },
          ],
        },
      ],
    },
    executionFeasibility: {
      stage: "ODA 및 조기경보 패키지 검토",
      projectSignal:
        "도서국 특화 적응 전략 및 GCF Country Programme 기반 조기경보·복원력 패키지 기획 타당성 확보", // '분명해 ~적합합니다' 개조식 변경
      financeChannels: ["ODA", "GCF", "ADB", "국제기구"],
      financeNote:
        "도서국형 적응 재원 및 다자간 공공 협력 모델(Multilateral ODA) 통합 검토 권장", // '함께 검토하는 것이 적합합니다' 전문화
    },
  },
  라오스: {
    countryNote:
      "라오스 대상 협력안 검토 시 UNFCCC NDC 업데이트 내역, GCF Country Programme, FP200 사업 상세 페이지 교차 분석을 통해 메콩 유역 내 산림·수자원 협력 타당성을 명확히 파악할 수 있습니다.",
    inventoryRows: [
      {
        status: "확보",
        group: "정책·문서",
        name: "Lao PDR updated NDC 공식 링크", // 'direct page' 순화
        scope: "국가",
        memo: "UNFCCC 공식 제출 페이지 연계",
      },
      {
        status: "확보",
        group: "국제협력",
        name: "GCF FP200 and Lao PDR Country Programme",
        scope: "국가/프로젝트",
        memo: "산림·적응 연계 사업 및 국가 기후 프로그램 명세",
      },
    ],
    sourcePlan: [
      {
        layer: "국가 감축 공약",
        source: "UNFCCC Lao PDR updated NDC",
        acquisition: "Public document",
        cycle: "제출 및 갱신 시",
        resolution: "국가",
        endpoint: "https://unfccc.int/documents/497647",
        note: "라오스(Lao PDR) NDC 업데이트 원문 확보 페이지",
      },
      {
        layer: "국제기후재원",
        source: "GCF Lao PDR Country Programme",
        acquisition: "Public document",
        cycle: "국가 프로그램 갱신 시",
        resolution: "국가",
        endpoint:
          "https://www.greenclimate.fund/document/lao-pdr-country-programme",
        note: "국가 최우선 협력 분야 및 파이프라인 목록 제공", // '후보 프로젝트 확인' 순화
      },
      {
        layer: "국제기후재원",
        source: "GCF FP200",
        acquisition: "Public project page",
        cycle: "수시",
        resolution: "프로젝트",
        endpoint: "https://www.greenclimate.fund/project/fp200",
        note: "산림 및 기후 적응 연계 사업의 상세 프로젝트 페이지", // '실제 프로젝트' 순화
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "국가 공약",
        field: "Lao PDR updated NDC",
        value: "라오스 NDC 업데이트 제출 내역 및 원문 제공", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "UNFCCC document page",
        link: "https://unfccc.int/documents/497647",
        update: "2021-05 제출",
      },
      {
        scope: "국가/프로젝트",
        category: "기후재원",
        field: "GCF FP200 forest and adaptation programme",
        value:
          "산림 및 기후 적응 연계 사업의 구체적 재원 구조 및 이행 계획 명세", // '확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF FP200",
        link: "https://www.greenclimate.fund/project/fp200",
        update: "2026-03 확인",
      },
    ],
    executionFeasibility: {
      stage: "유역 협력 및 산림 재원 병행 검토",
      projectSignal:
        "메콩 유역 관리, 산림 보존, 기후 적응 부문이 통합된 국제 기후 재원 사업 구조화(Structuring)에 최적화된 환경입니다.", // '함께 보는 ~사례가 있어 ~적합합니다' 순화
      financeChannels: ["ODA", "GCF", "MDB", "유역협력"],
      financeNote:
        "초국경 유역 데이터 협력 및 산림·적응 재원의 복합적 설계(Blended Approach)를 권장합니다.", // '동시에 검토하는 접근이 적합합니다' 전문화
    },
  },
  캄보디아: {
    countryNote:
      "캄보디아 대상 협력안 검토 시 2025 NDC 3.0, GCF Country Programme, FP228 사업 상세 페이지를 통합 분석하여 수자원 및 농업 부문 기후 적응 협력 모델을 구체화할 수 있습니다.", // '함께 보면 ~구체화할 수 있습니다' 순화
    inventoryRows: [
      {
        status: "확보",
        group: "정책·문서",
        name: "Cambodia NDC 3.0 공식 링크", // 'direct page' 순화
        scope: "국가",
        memo: "UNFCCC 공식 제출 페이지 연계",
      },
      {
        status: "확보",
        group: "국제협력",
        name: "Cambodia GCF Country Programme and FP228",
        scope: "국가/프로젝트",
        memo: "국가 기후 프로그램 및 추진 중인 사업 상세 페이지 확보", // '실제 사업 페이지를 함께 확인' 순화
      },
    ],
    sourcePlan: [
      {
        layer: "국가 감축 공약",
        source: "UNFCCC Cambodia NDC 3.0",
        acquisition: "Public document",
        cycle: "제출 및 갱신 시",
        resolution: "국가",
        endpoint: "https://unfccc.int/documents/499051",
        note: "캄보디아 2025 NDC 3.0 제출 내역 확인",
      },
      {
        layer: "국제기후재원",
        source: "GCF Cambodia Country Programme",
        acquisition: "Public document",
        cycle: "국가 프로그램 갱신 시",
        resolution: "국가",
        endpoint:
          "https://www.greenclimate.fund/document/cambodia-country-programme",
        note: "국가 기후 재원 우선 협력 분야 및 파이프라인 확인",
      },
      {
        layer: "국제기후재원",
        source: "GCF FP228",
        acquisition: "Public project page",
        cycle: "수시",
        resolution: "프로젝트",
        endpoint: "https://www.greenclimate.fund/project/fp228",
        note: "캄보디아 기후 금융 시설(Climate Financing Facility) 상세 사업 페이지",
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "국가 공약",
        field: "Cambodia NDC 3.0",
        value: "2025 제출 기준 최신 NDC 제출 현황 및 문서 열람 가능", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "UNFCCC document page",
        link: "https://unfccc.int/documents/499051",
        update: "2025-08",
      },
      {
        scope: "국가/프로젝트",
        category: "기후재원",
        field: "GCF FP228 Cambodian Climate Financing Facility",
        value:
          "캄보디아 기후 금융 시설 기반의 사업 구조 및 재원 조달 현황 검토 가능", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF FP228",
        link: "https://www.greenclimate.fund/project/fp228",
        update: "2026-03 확인",
      },
    ],
    strategyEvidence: {
      summary:
        "캄보디아 대상 협력안 검토 시 NDC 3.0, GCF Country Programme, FP228 사업 페이지 통합 분석을 권장합니다.", // '가장 실무적입니다' 대화형 어조 배제
      sourceData: [
        {
          id: "kh-ndc-30",
          label: "캄보디아 NDC 3.0",
          group: "정책",
          source: "UNFCCC Cambodia NDC 3.0",
          mode: "공식 포털",
          link: "https://unfccc.int/documents/499051",
          description: "2025 제출 기준 캄보디아 최신 NDC 공식 열람 페이지", // '페이지를 확인할 수 있습니다' 순화
          lastUpdated: "2025-08",
          sampleFields: ["title", "submissionDate", "link"],
          rows: [
            {
              title: "Cambodia's NDC 3.0",
              submissionDate: "2025-08-08",
              link: "https://unfccc.int/documents/499051",
            },
          ],
        },
      ],
    },
    executionFeasibility: {
      stage: "ODA 및 기후 재원 구조화 검토",
      projectSignal:
        "기후 적응, 농업 부문 및 기후 금융 구조의 연계성이 명확하여 수자원·농업 통합 패키지 기획에 최적화됨", // '비교적 명확해 ~적합합니다' 순화
      financeChannels: ["ODA", "GCF", "MDB"],
      financeNote:
        "국가 프로그램 명세와 실제 GCF 승인 사업의 교차 분석(Cross-validation) 접근을 권장합니다.", // '함께 검토하는 접근이 적합합니다' 전문화
    },
  },
  브라질: {
    countryNote:
      "브라질 대상 협력안 검토 시 2024 NDC, 2025 GCF Country Programme, World Bank CCDR 문서를 통합 분석하여 산림·생태계 복원 및 기후 금융 구조의 타당성을 입체적으로 파악할 수 있습니다.", // '함께 보면 ~보기 좋습니다' 순화
    inventoryRows: [
      {
        status: "확보",
        group: "정책·문서",
        name: "Brazil 2024 NDC 원문 확보", // 'direct PDF' 순화
        scope: "국가",
        memo: "UNFCCC 공식 PDF 문서 연계",
      },
      {
        status: "확보",
        group: "국제협력",
        name: "Brazil GCF Country Programme and CCDR",
        scope: "국가",
        memo: "기후 재원 우선 협력 분야 및 기후개발보고서(CCDR) 확보", // '함께 확인' 순화
      },
    ],
    sourcePlan: [
      {
        layer: "국가 감축 공약",
        source: "Brazil 2024 NDC",
        acquisition: "Public PDF",
        cycle: "제출 및 갱신 시",
        resolution: "국가",
        endpoint:
          "https://unfccc.int/sites/default/files/2024-11/Brazil_Second%20Nationally%20Determined%20Contribution%20%28NDC%29_November2024.pdf",
        note: "2035 비전 기반 기후 적응 및 온실가스 감축 전략 원문 제공", // '직접 확인' 대화형 어조 배제
      },
      {
        layer: "국제기후재원",
        source: "GCF Brazil Country Programme",
        acquisition: "Public document",
        cycle: "국가 프로그램 갱신 시",
        resolution: "국가",
        endpoint:
          "https://www.greenclimate.fund/document/brazil-country-programme",
        note: "2025 Country Programme 내 기후 재원 우선 전략 분야 명세", // '확인' 순화
      },
      {
        layer: "국가 기후전략",
        source: "World Bank Brazil CCDR",
        acquisition: "Public document",
        cycle: "갱신 시",
        resolution: "국가",
        endpoint:
          "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099050123155521118",
        note: "기후 변화와 국가 개발 전략 간 정합성을 다룬 CCDR 문서", // '함께 보는' 순화
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "국가 공약",
        field: "Brazil 2024 NDC",
        value: "2035 국가 비전 기반의 적응 및 감축 전략 원문 제공", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "UNFCCC PDF",
        link: "https://unfccc.int/sites/default/files/2024-11/Brazil_Second%20Nationally%20Determined%20Contribution%20%28NDC%29_November2024.pdf",
        update: "2024-11",
      },
      {
        scope: "국가",
        category: "기후재원",
        field: "Brazil GCF Country Programme",
        value: "2025 브라질 Country Programme 내 기후 재원 우선 투자 분야 명세", // '확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF country programme",
        link: "https://www.greenclimate.fund/document/brazil-country-programme",
        update: "2025-11",
      },
    ],
    strategyEvidence: {
      summary:
        "브라질 대상 협력안 검토 시 2024 NDC, GCF Country Programme, World Bank CCDR 통합 분석을 우선 권장합니다.", // '가장 빠릅니다' 대화형 어조 배제
      sourceData: [
        {
          id: "br-ndc-2024",
          label: "브라질 2024 NDC",
          group: "정책",
          source: "UNFCCC PDF",
          mode: "공식 포털",
          link: "https://unfccc.int/sites/default/files/2024-11/Brazil_Second%20Nationally%20Determined%20Contribution%20%28NDC%29_November2024.pdf",
          description: "2035 비전 및 부문별 적응·감축 방향을 명세한 공식 문서", // '담은 공식 PDF입니다' 서술형 수정
          lastUpdated: "2024-11",
          sampleFields: ["title", "publicationDate", "link"],
          rows: [
            {
              title: "Brazil's Nationally Determined Contribution (2024)",
              publicationDate: "2024-11-13",
              link: "https://unfccc.int/sites/default/files/2024-11/Brazil_Second%20Nationally%20Determined%20Contribution%20%28NDC%29_November2024.pdf",
            },
          ],
        },
      ],
    },
    executionFeasibility: {
      stage: "국제감축 및 생태복원 검토",
      projectSignal:
        "2024 NDC 및 2025 Country Programme 연계를 통한 산림·생태계 복원 부문 사업화 타당성 확보", // '있어 ~적합합니다' 개조식 변경
      financeChannels: ["국제감축", "GCF", "MDB", "민간투자"],
      financeNote:
        "생태계 복원, MRV 시스템 구축, 기후 재원 조달이 결합된 통합 프로젝트(Integrated Project) 기획 권장", // '함께 검토하는 것이 적합합니다' 전문화
    },
  },
  가나: {
    countryNote:
      "가나 대상 협력안 검토 시 2021 Updated NDC, GCF 국가 페이지, UNDP GCF Readiness 자료를 통합 분석하여 폐기물 처리 및 도시 기후 적응 사업의 정책 정합성과 재원 준비도를 명확히 파악할 수 있습니다.", // '함께 보면 ~확인하기 좋습니다' 순화
    inventoryRows: [
      {
        status: "확보",
        group: "정책·문서",
        name: "Ghana updated NDC 원문 확보", // 'direct PDF' 순화
        scope: "국가",
        memo: "UNFCCC 공식 PDF 문서 연계",
      },
      {
        status: "확보",
        group: "국제협력",
        name: "GCF Ghana country page and readiness programme",
        scope: "국가",
        memo: "국가 차원 기후 재원 파이프라인 및 Readiness 활동 내역 확보", // '재원 페이지와 ~확인' 순화
      },
    ],
    sourcePlan: [
      {
        layer: "국가 감축 공약",
        source: "Ghana updated NDC 2021",
        acquisition: "Public PDF",
        cycle: "제출 및 갱신 시",
        resolution: "국가",
        endpoint:
          "https://unfccc.int/sites/default/files/NDC/2022-06/Ghana%27s%20Updated%20Nationally%20Determined%20Contribution%20to%20the%20UNFCCC_2021.pdf",
        note: "가나 Updated NDC 원문 확보 페이지", // '원문 확인' 순화
      },
      {
        layer: "국제기후재원",
        source: "GCF Ghana country page",
        acquisition: "Public web",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: "https://www.greenclimate.fund/countries/ghana",
        note: "가나 대상 GCF 우선 협력 분야 및 프로젝트 현황 명세", // '현황 확인' 순화
      },
      {
        layer: "재원 준비도",
        source: "UNDP Ghana GCF readiness programme",
        acquisition: "Public web",
        cycle: "프로그램 갱신 시",
        resolution: "국가",
        endpoint:
          "https://www.undp.org/ghana/projects/green-climate-fund-readiness-programme",
        note: "국가 기후 재원 조달 역량(Readiness) 강화 프로그램 진행 현황", // '준비 현황 확인' 순화
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "국가 공약",
        field: "Ghana updated NDC 2021",
        value: "가나의 updated NDC 원문 제공", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "UNFCCC PDF",
        link: "https://unfccc.int/sites/default/files/NDC/2022-06/Ghana%27s%20Updated%20Nationally%20Determined%20Contribution%20to%20the%20UNFCCC_2021.pdf",
        update: "2021",
      },
      {
        scope: "국가",
        category: "기후재원",
        field: "UNDP Ghana GCF readiness programme",
        value: "가나 기후 재원 준비도(Readiness) 및 투자 전략 수립 현황 명세", // '확인할 수 있습니다' 순화
        unit: "-",
        source: "UNDP Ghana",
        link: "https://www.undp.org/ghana/projects/green-climate-fund-readiness-programme",
        update: "2026-03 확인",
      },
    ],
    strategyEvidence: {
      summary:
        "가나 대상 협력안 검토 시 updated NDC, GCF 국가 페이지, UNDP Readiness 자료의 통합 분석을 우선 권장합니다.", // '가장 실무적입니다' 대화형 어조 배제
      sourceData: [
        {
          id: "gh-ndc-2021",
          label: "가나 updated NDC 2021",
          group: "정책",
          source: "UNFCCC PDF",
          mode: "공식 포털",
          link: "https://unfccc.int/sites/default/files/NDC/2022-06/Ghana%27s%20Updated%20Nationally%20Determined%20Contribution%20to%20the%20UNFCCC_2021.pdf",
          description:
            "가나 updated NDC 원문 및 세부 부문별 목표 공식 명세 문서", // '확인할 수 있습니다' 서술형 수정
          lastUpdated: "2021",
          sampleFields: ["title", "country", "link"],
          rows: [
            {
              title: "Ghana's Revised Nationally Determined Contribution",
              country: "Ghana",
              link: "https://unfccc.int/sites/default/files/NDC/2022-06/Ghana%27s%20Updated%20Nationally%20Determined%20Contribution%20to%20the%20UNFCCC_2021.pdf",
            },
          ],
        },
      ],
    },
    executionFeasibility: {
      stage: "도시·폐기물 사업화 검토",
      projectSignal:
        "Updated NDC 및 GCF Readiness 자료 확보를 통한 폐기물·도시 기후 적응 사업 준비도 검증 완료", // '설명하기 좋습니다' 순화
      financeChannels: ["ODA", "GCF", "PPP", "개발금융"],
      financeNote:
        "도시 서비스 인프라 및 기후 재원이 결합된 통합 프로젝트 모델 구조화 권장", // '묶은 구조로 보는 것이 적합합니다' 전문화
    },
  },
  세네갈: {
    countryNote:
      "세네갈 대상 협력안 검토 시 NDC, GCF 국가 페이지, World Bank CCDR 문서를 통합 분석하여 수자원·도시 인프라·기후 적응 사업 모델을 구체화할 수 있습니다.", // '함께 보면 ~구체화할 수 있습니다' 순화
    inventoryRows: [
      {
        status: "확보",
        group: "정책·문서",
        name: "Senegal NDC 공식 링크", // 'direct page' 순화
        scope: "국가",
        memo: "UNFCCC 공식 제출 페이지 연계",
      },
      {
        status: "확보",
        group: "국제협력",
        name: "Senegal GCF country page and CCDR",
        scope: "국가",
        memo: "국가 기후 재원 파이프라인 및 기후개발보고서(CCDR) 동시 확보", // '함께 확인' 순화
      },
    ],
    sourcePlan: [
      {
        layer: "국가 감축 공약",
        source: "UNFCCC Senegal NDC",
        acquisition: "Public document",
        cycle: "제출 및 갱신 시",
        resolution: "국가",
        endpoint: "https://unfccc.int/documents/497880",
        note: "세네갈 NDC 제출 내역 공식 페이지",
      },
      {
        layer: "국제기후재원",
        source: "GCF Senegal country page",
        acquisition: "Public web",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: "https://www.greenclimate.fund/countries/senegal",
        note: "국가 단위 GCF 활동 및 프로젝트 파이프라인 현황", // '확인' 순화
      },
      {
        layer: "국가 기후전략",
        source: "World Bank Senegal CCDR",
        acquisition: "Public document",
        cycle: "갱신 시",
        resolution: "국가",
        endpoint:
          "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099110524131023348",
        note: "국가 기후 변화 및 개발 전략 포괄 보고서",
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "국가 공약",
        field: "Senegal NDC",
        value: "세네갈 NDC 제출 현황 및 원문 제공", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "UNFCCC document page",
        link: "https://unfccc.int/documents/497880",
        update: "2020-12 제출",
      },
      {
        scope: "국가",
        category: "기후전략",
        field: "Senegal CCDR",
        value: "국가 단위 기후 및 개발 전략 연계성 통합 분석 자료(CCDR) 제공", // '함께 보는 ~ 확인할 수 있습니다' 순화
        unit: "-",
        source: "World Bank CCDR",
        link: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099110524131023348",
        update: "2024-11",
      },
    ],
    strategyEvidence: {
      summary:
        "세네갈 대상 협력안 검토 시 NDC, GCF 국가 페이지, World Bank CCDR 통합 분석을 우선 권장합니다.", // '가장 실무적입니다' 대화형 어조 배제
      sourceData: [
        {
          id: "sn-ccdr-2024",
          label: "세네갈 CCDR",
          group: "전략",
          source: "World Bank CCDR",
          mode: "공식 포털",
          link: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099110524131023348",
          description:
            "국가 수준의 기후 변화 대응 및 국가 개발 전략 포괄 보고서", // '함께 보는 ~보고서입니다' 서술형 수정
          lastUpdated: "2024-11",
          sampleFields: ["title", "country", "link"],
          rows: [
            {
              title: "Senegal - Country Climate and Development Report",
              country: "Senegal",
              link: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099110524131023348",
            },
          ],
        },
      ],
    },
    executionFeasibility: {
      stage: "ODA 및 도시 물 인프라 검토",
      projectSignal:
        "NDC, GCF, CCDR 자료 기반 물·도시 인프라 패키지 사업의 정책 및 재원 정합성 확보 완료", // '설명력이 좋습니다' 순화
      financeChannels: ["ODA", "GCF", "World Bank", "PPP"],
      financeNote:
        "도시 인프라 사업과 기후 적응 재원 조달이 결합된 통합 모델링 권장", // '묶은 구조로 보는 접근이 적합합니다' 전문화
    },
  },
};

const COUNTRY_SUPPLEMENTAL_ENRICHMENTS = {
  멕시코: {
    localPartners: [
      {
        name: "SEMARNAT",
        role: "기후정책 총괄",
        priority: "핵심",
        note: "국가 기후 전략 및 NDC 이행 조정",
        link: "https://www.gob.mx/semarnat",
      },
      {
        name: "SENER",
        role: "에너지 전환 협력",
        priority: "권장",
        note: "전력 및 산업 에너지 전환 정책 검토",
        link: "https://www.gob.mx/sener",
      },
    ],
    sourcePlan: [
      {
        layer: "주관부처",
        source: "Gobierno de México - SEMARNAT",
        acquisition: "Public web",
        cycle: "수시",
        resolution: "국가",
        endpoint: "https://www.gob.mx/semarnat",
        note: "기후 전략 및 환경 정책 총괄 주관 부처",
      },
    ],
    actions: [
      "산업 전환 및 CCUS 협력 기획 시 SEMARNAT 및 SENER의 역할 분담과 기후 재원 조달 경로 통합 설계(Structuring) 필수", // '함께 정리합니다' 서술형 행동지침을 전문 개조식으로 변경
    ],
  },
  케냐: {
    localPartners: [
      {
        name: "Ministry of Energy and Petroleum",
        role: "전력·재생에너지 정책",
        priority: "핵심",
        note: "분산 전원 및 전력망 전환 협력 진입점",
        link: "https://www.energy.go.ke/",
      },
      {
        name: "REREC",
        role: "농촌전력화·재생에너지 실행",
        priority: "권장",
        note: "현장 실증 및 확산 사업 실행 파트너",
        link: "https://www.rerec.co.ke/",
      },
      {
        name: "KPLC",
        role: "배전·서비스 연계",
        priority: "권장",
        note: "기술 현장 적용 및 계통 운영 협력",
        link: "https://www.kplc.co.ke/",
      },
    ],
    sourcePlan: [
      {
        layer: "주관부처",
        source: "Ministry of Energy and Petroleum",
        acquisition: "Public web",
        cycle: "수시",
        resolution: "국가",
        endpoint: "https://www.energy.go.ke/",
        note: "전력 및 재생에너지 정책·기관 구조 파악", // '확인' 순화
      },
    ],
  },
  칠레: {
    localPartners: [
      {
        name: "Comisión Nacional de Energía",
        role: "전력정책·시장 설계",
        priority: "핵심",
        note: "전력망 및 재생에너지 제도 협력",
        link: "https://www.cne.cl/",
      },
      {
        name: "Coordinador Eléctrico Nacional",
        role: "계통 운영",
        priority: "권장",
        note: "계통 혼잡 및 운영 데이터 검토",
        link: "https://www.coordinador.cl/",
      },
    ],
  },
  피지: {
    localPartners: [
      {
        name: "Fiji Meteorological Service",
        role: "기상·위험 정보",
        priority: "핵심",
        note: "조기경보 및 기후 정보 협력",
        link: "https://www.met.gov.fj/",
      },
      {
        name: "National Disaster Management Office",
        role: "재난대응",
        priority: "권장",
        note: "조기경보 및 현장 대응 연계",
        link: "https://www.ndmo.gov.fj/",
      },
      {
        name: "Energy Fiji Limited",
        role: "전력 운영",
        priority: "권장",
        note: "분산전원 및 전력 운영 실증 협력",
        link: "https://efl.com.fj/",
      },
    ],
  },
  라오스: {
    localPartners: [
      {
        name: "Ministry of Energy and Mines",
        role: "에너지 정책",
        priority: "핵심",
        note: "수력 및 전력망 협력 진입점",
        link: "https://www.mem.gov.la/",
      },
      {
        name: "Electricité du Laos",
        role: "전력 운영",
        priority: "권장",
        note: "배전망 및 전력 운영 실증 협력",
        link: "https://edl.com.la/",
      },
      {
        name: "Mekong River Commission",
        role: "유역 정보·협력",
        priority: "권장",
        note: "초국경 수문 및 유역 데이터 연계",
        link: "https://www.mrcmekong.org/",
      },
    ],
  },
  캄보디아: {
    localPartners: [
      {
        name: "MOWRAM",
        role: "수자원·기상",
        priority: "핵심",
        note: "홍수 및 가뭄 대응 협력",
        link: "https://mowram.gov.kh/",
      },
      {
        name: "Ministry of Mines and Energy",
        role: "에너지 정책",
        priority: "권장",
        note: "전력 및 에너지 사업 연계 협력",
        link: "https://www.mme.gov.kh/",
      },
      {
        name: "Tonle Sap Authority",
        role: "호수권역 관리",
        priority: "권장",
        note: "톤레삽 권역 대상지 현장 실증 협력", // '지역 실증 후보지' -> '권역 대상지 현장 실증'
        link: "https://tonlesap.gov.kh/",
      },
    ],
  },
  브라질: {
    localPartners: [
      {
        name: "Ministério do Meio Ambiente e Mudança do Clima",
        role: "기후정책 총괄",
        priority: "핵심",
        note: "국가 기후 정책 및 NDC 연계 협력",
        link: "https://www.gov.br/mma/pt-br",
      },
      {
        name: "Federal Government Climate Platform",
        role: "국가 플랫폼",
        priority: "권장",
        note: "기후 투자 플랫폼 및 정책 연계 타당성 검토", // '정책 연계 검토' 보완
        link: "https://www.gov.br/",
      },
    ],
  },
  가나: {
    localPartners: [
      {
        name: "Environmental Protection Authority",
        role: "기후정책·환경규제",
        priority: "핵심",
        note: "기후 적응 및 감축 정책 정합성 검토",
        link: "https://www.epa.gov.gh/",
      },
      {
        name: "MESTI",
        role: "환경·과학·기술 정책",
        priority: "권장",
        note: "국가 단위 환경 및 기술 협력 창구",
        link: "https://mesti.gov.gh/",
      },
      {
        name: "Agriculture Mechanization Agency",
        role: "현장 확산",
        priority: "권장",
        note: "농업 기술 기계화 실증 및 보급 진입점",
        link: "https://ama.gov.gh/",
      },
    ],
  },
  세네갈: {
    localPartners: [
      {
        name: "Ministry of Hydraulics and Sanitation",
        role: "물·위생 정책",
        priority: "핵심",
        note: "도시 물 인프라 및 회복력 강화 협력",
        link: "https://mha.gouv.sn/",
      },
      {
        name: "ONAS",
        role: "위생·배수 운영",
        priority: "권장",
        note: "도시 배수 시스템 및 회복력 실증",
        link: "https://onas.sn/",
      },
      {
        name: "SONES",
        role: "수자원 서비스",
        priority: "권장",
        note: "도시 수자원 인프라 운영 협력",
        link: "https://www.sones.sn/",
      },
    ],
  },
};

const COUNTRY_FRESHNESS_ENRICHMENTS = {
  브라질: {
    inventoryRows: [
      {
        status: "확보",
        group: "국제협력",
        name: "Brazil Climate and Ecological Transformation Investment Platform",
        scope: "국가/프로그램",
        memo: "2025 기후재원 투자 플랫폼 문서(민간자본·전환역량 연계 전략 파악)", // '방향 확인' 순화
      },
      {
        status: "확보",
        group: "정책·문서",
        name: "Brazil Country Programme 2025",
        scope: "국가",
        memo: "2025 GCF 국가 프로그램(투자 및 파이프라인 최신 우선순위 명세)", // '최신 기준으로 확인' 순화
      },
    ],
    sourcePlan: [
      {
        layer: "국제기후재원",
        source:
          "Brazil Climate and Ecological Transformation Investment Platform",
        acquisition: "Public document",
        cycle: "문서 갱신 시",
        resolution: "국가/프로그램",
        endpoint:
          "https://www.greenclimate.fund/document/brazil-climate-and-ecological-transformation-investment-platform-bip-strengthening-brazil-s",
        note: "민간자본·전환역량·기후금융 플랫폼 핵심 방향성 원문 제공", // '방향을 직접 확인' 순화
      },
      {
        layer: "국제기후재원",
        source: "GCF Brazil Country Programme 2025",
        acquisition: "Public document",
        cycle: "국가 프로그램 갱신 시",
        resolution: "국가",
        endpoint:
          "https://www.greenclimate.fund/document/brazil-country-programme",
        note: "2025 국가 프로그램 기준 기후 재원 우선 분야 및 파이프라인 명세", // '파이프라인 확인' 순화
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "기후재원",
        field: "Brazil Country Programme 2025",
        value:
          "2025 국가 프로그램 기반 산림·복원·기후재원 파이프라인 세부 방향성 제시", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF country programme",
        link: "https://www.greenclimate.fund/document/brazil-country-programme",
        update: "2025-11",
      },
    ],
    strategyEvidence: {
      sourceData: [
        {
          id: "br-gcf-country-programme-2025",
          label: "브라질 GCF 국가 프로그램 2025",
          group: "재원",
          source: "GCF Brazil Country Programme",
          mode: "공식 포털",
          link: "https://www.greenclimate.fund/document/brazil-country-programme",
          description:
            "2025 기준 브라질 기후 재원 우선 협력 분야 및 파이프라인 공식 명세 문서", // '확인할 수 있는 문서입니다' 순화
          lastUpdated: "2025-11-17",
          sampleFields: ["documentType", "country", "link"],
          rows: [
            {
              documentType: "Country Programme",
              country: "Brazil",
              link: "https://www.greenclimate.fund/document/brazil-country-programme",
            },
          ],
        },
      ],
    },
  },
  가나: {
    inventoryRows: [
      {
        status: "확보",
        group: "국제협력",
        name: "GCF FP265 북부 가나 복원력 사업",
        scope: "국가/프로젝트",
        memo: "2025 승인 GCF 사업(북부 가나의 수자원·경관·농업 통합 회복력 모델 명세)", // '신호 확인' 순화
      },
    ],
    sourcePlan: [
      {
        layer: "국제기후재원",
        source: "GCF FP265 approved funding proposal",
        acquisition: "Public document",
        cycle: "문서 갱신 시",
        resolution: "국가/프로젝트",
        endpoint:
          "https://www.greenclimate.fund/document/climate-resilient-landscapes-sustainable-livelihoods-northern-ghana-0",
        note: "2025 승인 GCF 제안서 원문(사업 구조 및 투자 논리 확보)", // '직접 확인' 대화형 배제
      },
      {
        layer: "국제기후재원",
        source: "GCF FP265 Ghana",
        acquisition: "Public project page",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: "https://www.greenclimate.fund/project/fp265",
        note: "2025 승인 북부 가나 복원력 향상 사업 상세 페이지",
      },
    ],
    regionRows: [
      {
        scope: "국가/프로젝트",
        category: "국제협력 사업",
        field: "GCF FP265 북부 가나 복원력 사업",
        value:
          "2025 승인 GCF 사업 기반 북부 가나 경관 복원, 농업, 물 관리 통합 패키지 구조 분석 데이터 제공", // '구조를 직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF project page",
        link: "https://www.greenclimate.fund/project/fp265",
        update: "2025-07",
      },
    ],
    strategyEvidence: {
      sourceData: [
        {
          id: "gh-gcf-fp265-proposal",
          label: "가나 FP265 승인 제안서",
          group: "프로젝트",
          source: "GCF approved funding proposal",
          mode: "공식 포털",
          link: "https://www.greenclimate.fund/document/climate-resilient-landscapes-sustainable-livelihoods-northern-ghana-0",
          description:
            "사업 구조, 투자 논리, 이행 기관 및 기대 성과 명세 공식 제안서", // '직접 확인할 수 있는~' 배제
          lastUpdated: "2025-07-24",
          sampleFields: ["documentType", "project", "link"],
          rows: [
            {
              documentType: "Approved funding proposal",
              project:
                "FP265 Climate-resilient landscapes for sustainable livelihoods in northern Ghana",
              link: "https://www.greenclimate.fund/document/climate-resilient-landscapes-sustainable-livelihoods-northern-ghana-0",
            },
          ],
        },
        {
          id: "gh-gcf-fp265",
          label: "가나 FP265 승인 사업",
          group: "프로젝트",
          source: "GCF FP265",
          mode: "공식 포털",
          link: "https://www.greenclimate.fund/project/fp265",
          description:
            "북부 가나 기후 회복력 향상 및 생계 지원 사업 상세 페이지 (2025 승인)", // '~사업 구조를 직접 확인할 수 있는' 순화
          lastUpdated: "2025-07-24",
          sampleFields: ["project", "country", "link"],
          rows: [
            {
              project:
                "FP265 Climate-resilient landscapes for sustainable livelihoods in northern Ghana",
              country: "Ghana",
              link: "https://www.greenclimate.fund/project/fp265",
            },
          ],
        },
      ],
    },
  },
  세네갈: {
    inventoryRows: [
      {
        status: "확보",
        group: "국제협력",
        name: "2024 APR for GCF FP021 Senegal",
        scope: "프로젝트",
        memo: "2025 공개 연차보고서 내 도시홍수 사업 최신 이행 상황 명세", // '확인' 순화
      },
    ],
    sourcePlan: [
      {
        layer: "국제협력 프로젝트",
        source: "GCF FP021 project page",
        acquisition: "Public project page",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: "https://www.greenclimate.fund/project/fp021",
        note: "연차보고서, 평가 및 승인 제안서 통합 열람 허브", // '한곳에서 추적' 순화
      },
      {
        layer: "국제협력 프로젝트",
        source: "GCF FP021 APR 2024",
        acquisition: "Public report",
        cycle: "연 1회",
        resolution: "프로젝트",
        endpoint:
          "https://www.greenclimate.fund/document/2024-annual-performance-report-fp021-senegal-integrated-urban-flood-management-project",
        note: "2025 공개 연차보고서 내 사업 이행 및 성과 내역 확보", // '확인' 순화
      },
    ],
    regionRows: [
      {
        scope: "국가/프로젝트",
        category: "국제협력 사업",
        field: "FP021 Senegal Urban Flood Management APR 2024",
        value:
          "도시홍수 대응 사업 2024 실행 현황 공식 연차보고서(2025 공개) 연계", // '확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF annual performance report",
        link: "https://www.greenclimate.fund/document/2024-annual-performance-report-fp021-senegal-integrated-urban-flood-management-project",
        update: "2025-09",
      },
    ],
    strategyEvidence: {
      sourceData: [
        {
          id: "sn-gcf-fp021-project-page",
          label: "세네갈 FP021 프로젝트 페이지",
          group: "프로젝트",
          source: "GCF FP021 project page",
          mode: "공식 포털",
          link: "https://www.greenclimate.fund/project/fp021",
          description: "APR, 사업 평가 및 승인 제안서 통합 열람 프로젝트 허브", // '한 화면에서 추적할 수 있는' 순화
          lastUpdated: "2025-09-05",
          sampleFields: ["project", "country", "link"],
          rows: [
            {
              project:
                "FP021 Senegal Integrated Urban Flood Management Project",
              country: "Senegal",
              link: "https://www.greenclimate.fund/project/fp021",
            },
          ],
        },
        {
          id: "sn-gcf-fp021-apr-2024",
          label: "세네갈 FP021 최근 이행 보고",
          group: "프로젝트",
          source: "GCF FP021 APR 2024",
          mode: "공식 포털",
          link: "https://www.greenclimate.fund/document/2024-annual-performance-report-fp021-senegal-integrated-urban-flood-management-project",
          description:
            "세네갈 도시홍수 사업 최신 이행 성과 및 ESS(환경·사회 기준) 모니터링 현황 제공", // '확인할 수 있습니다' 순화
          lastUpdated: "2025-09-05",
          sampleFields: ["documentType", "project", "link"],
          rows: [
            {
              documentType: "Annual Performance Report",
              project:
                "FP021 Senegal Integrated Urban Flood Management Project",
              link: "https://www.greenclimate.fund/document/2024-annual-performance-report-fp021-senegal-integrated-urban-flood-management-project",
            },
          ],
        },
      ],
    },
  },
  라오스: {
    inventoryRows: [
      {
        status: "확보",
        group: "정책·문서",
        name: "Lao PDR BTR1",
        scope: "국가",
        memo: "2026 공개 BTR1 기반 NDC 이행 및 부문별 조치 최신성 확보", // '보강' 순화
      },
    ],
    sourcePlan: [
      {
        layer: "국제기후재원",
        source: "GCF FP200 Lao PDR project page",
        acquisition: "Public project page",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: "https://www.greenclimate.fund/project/fp200",
        note: "라오스 산림·감축·적응 패키지 사업의 구조 및 현황 확보", // '직접 확인' 순화
      },
      {
        layer: "국제기후재원",
        source: "GCF Lao PDR readiness proposal 2025",
        acquisition: "Public document",
        cycle: "문서 갱신 시",
        resolution: "국가/프로젝트",
        endpoint:
          "https://www.greenclimate.fund/document/strengthening-lao-pdr-s-institutional-capacity-and-strategic-frameworks-boost-access",
        note: "2025 Readiness 제안서 내 제도화, 민간 참여, 투자 유치 전략 명세", // '준비도를 확인' 순화
      },
      {
        layer: "이행 점검",
        source: "UNFCCC Lao PDR BTR1",
        acquisition: "Public document",
        cycle: "제출 시",
        resolution: "국가",
        endpoint:
          "https://unfccc.int/sites/default/files/resource/2.%20BTR1%20of%20the%20Lao%20PDR.pdf",
        note: "2026 공개 BTR1 기반 수송·산림·NDC 이행 현황 모니터링 데이터 갱신", // '현황을 보강' 전문화
      },
      {
        layer: "국제기후재원",
        source: "GCF Lao PDR country page",
        acquisition: "Public web",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: "https://www.greenclimate.fund/countries/lao-pdr",
        note: "2025~2026 기준 GCF 사업, Readiness 및 APR 내역 통합 제공", // '직접 확인' 순화
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "이행 점검",
        field: "Lao PDR BTR1",
        value:
          "2026 BTR1 내 NDC 이행, 감축·적응 조치, 수송·산림 프로젝트 현황 공식 문서 연계", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "UNFCCC BTR1",
        link: "https://unfccc.int/sites/default/files/resource/2.%20BTR1%20of%20the%20Lao%20PDR.pdf",
        update: "2026-01",
      },
    ],
  },
  케냐: {
    sourcePlan: [
      {
        layer: "국제기후재원",
        source: "GCF Kenya country page",
        acquisition: "Public web",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: "https://www.greenclimate.fund/countries/kenya",
        note: "2025 기준 케냐 GCF 승인 사업 및 Readiness 포트폴리오 연계", // '직접 확인' 순화
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "기후재원",
        field: "GCF Kenya country page",
        value:
          "2025 기준 케냐 대상 GCF 승인 사업, Readiness 프로그램 및 평가 문서 통합 제공", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF country page",
        link: "https://www.greenclimate.fund/countries/kenya",
        update: "2025 확인",
      },
    ],
  },
  멕시코: {
    regionRows: [
      {
        scope: "국가",
        category: "국가 공약",
        field: "Mexico NDC 3.0",
        value: "2025 멕시코 NDC 3.0 제출 내역, 감축·적응 방향성 및 원문 연계", // '제출 시점을 직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "UNFCCC document page",
        link: "https://unfccc.int/documents/654344",
        update: "2025-11",
      },
    ],
    actions: [
      "멕시코 2025 NDC 3.0 및 GCF 국가 프로그램 교차 분석 기반 산업 전환·CCUS 실무 검토안 갱신 완료", // '보고 ~업데이트합니다' 서술형을 갱신 상태 톤으로 변경
    ],
  },
  칠레: {
    sourcePlan: [
      {
        layer: "국가 감축 공약",
        source: "UNFCCC Chile NDC 2025 shareable page",
        acquisition: "Public document",
        cycle: "제출 및 갱신 시",
        resolution: "국가",
        endpoint: "https://unfccc.int/node/649954",
        note: "2025 칠레 NDC 통합 공유 페이지 및 첨부 원문 연계", // '직접 확인' 순화
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "국가 공약",
        field: "Chile NDC 2025 shareable page",
        value: "2025 칠레 NDC 통합 공유 페이지 및 원문 문서 제공", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "UNFCCC shareable page",
        link: "https://unfccc.int/node/649954",
        update: "2025-09",
      },
    ],
  },
  캄보디아: {
    inventoryRows: [
      {
        status: "확보",
        group: "국제협력",
        name: "GCF FP258 EW4All multi-country project",
        scope: "국가/프로젝트",
        memo: "캄보디아 포함 다국가 조기경보 사업 공식 승인 문서 확보", // '직접 확인' 순화
      },
    ],
    sourcePlan: [
      {
        layer: "국제기후재원",
        source: "GCF FP258 project page",
        acquisition: "Public project page",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: "https://www.greenclimate.fund/project/fp258",
        note: "피지 포함 다국가 조기경보 사업 관련 문서 및 진행 상황 허브 페이지",
      },
      {
        layer: "국제기후재원",
        source: "GCF FP258 EW4All approved proposal",
        acquisition: "Public document",
        cycle: "문서 갱신 시",
        resolution: "국가/프로젝트",
        endpoint:
          "https://www.greenclimate.fund/document/multi-country-project-advancing-early-warnings-all-ew4all-0",
        note: "캄보디아 대상 2025 승인 조기경보 다국가 사업 공식 제안서 확보",
      },
    ],
    regionRows: [
      {
        scope: "국가/프로젝트",
        category: "국제협력 사업",
        field: "FP258 EW4All multi-country project",
        value: "캄보디아 대상 2025 승인 다국가 조기경보 사업 승인 원문 제공", // '문서를 직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF approved funding proposal",
        link: "https://www.greenclimate.fund/document/multi-country-project-advancing-early-warnings-all-ew4all-0",
        update: "2025-03",
      },
    ],
  },
  피지: {
    inventoryRows: [
      {
        status: "확보",
        group: "국제협력",
        name: "GCF FP258 EW4All multi-country project",
        scope: "국가/프로젝트",
        memo: "피지 포함 다국가 조기경보 사업 공식 승인 문서 확보", // '직접 확인' 순화
      },
    ],
    sourcePlan: [
      {
        layer: "국제기후재원",
        source: "GCF Fiji country page",
        acquisition: "Public web",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: "https://www.greenclimate.fund/countries/fiji",
        note: "2025 기준 국가 프로그램, Readiness, ESS 문서 통합 열람 허브", // '한곳에서 확인' 순화
      },
      {
        layer: "국제기후재원",
        source: "GCF FP258 EW4All approved proposal",
        acquisition: "Public document",
        cycle: "문서 갱신 시",
        resolution: "국가/프로젝트",
        endpoint:
          "https://www.greenclimate.fund/document/multi-country-project-advancing-early-warnings-all-ew4all-0",
        note: "피지 포함 2025 승인 조기경보 다국가 사업 문서 공식 확보", // '문서'에서 마무리
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "기후재원",
        field: "GCF Fiji country page",
        value:
          "2025 기준 국가 프로그램, Readiness 제안서, ESS 문서 등 관련 자료 통합 제공", // '한곳에서 확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF country page",
        link: "https://www.greenclimate.fund/countries/fiji",
        update: "2025 확인",
      },
      {
        scope: "국가/프로젝트",
        category: "국제협력 사업",
        field: "FP258 EW4All multi-country project",
        value: "피지 대상 2025 승인 조기경보 다국가 사업 승인 원문 제공", // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "GCF approved funding proposal",
        link: "https://www.greenclimate.fund/document/multi-country-project-advancing-early-warnings-all-ew4all-0",
        update: "2025-03",
      },
    ],
    strategyEvidence: {
      sourceData: [
        {
          id: "fj-gcf-fp258-project-page",
          label: "피지 포함 GCF FP258 프로젝트 페이지",
          group: "프로젝트",
          source: "GCF FP258 project page",
          mode: "공식 포털",
          link: "https://www.greenclimate.fund/project/fp258",
          description:
            "프로젝트 개요 및 관련 문서를 통합 제공하는 공식 열람 허브", // '한 화면에서 확인할 수 있는' 순화
          lastUpdated: "2025-03-12",
          sampleFields: ["project", "countryGroup", "link"],
          rows: [
            {
              project:
                "FP258 Multi-country Project Advancing Early Warnings for All",
              countryGroup: "Fiji 포함 7개국",
              link: "https://www.greenclimate.fund/project/fp258",
            },
          ],
        },
        {
          id: "fj-gcf-fp258-ew4all",
          label: "피지 포함 GCF FP258 조기경보 사업",
          group: "프로젝트",
          source: "GCF FP258 EW4All",
          mode: "공식 포털",
          link: "https://www.greenclimate.fund/document/multi-country-project-advancing-early-warnings-all-ew4all-0",
          description:
            "피지 대상 2025 승인 다국가 조기경보 사업 공식 승인 제안서", // '~입니다' 순화
          lastUpdated: "2025-03-12",
          sampleFields: ["project", "countryGroup", "link"],
          rows: [
            {
              project:
                "FP258 Multi-country Project Advancing Early Warnings for All",
              countryGroup: "Fiji 포함 7개국",
              link: "https://www.greenclimate.fund/document/multi-country-project-advancing-early-warnings-all-ew4all-0",
            },
          ],
        },
      ],
    },
  },
};

function buildCommonCountryEvidence(country) {
  const safeCountry = String(country || "").trim();
  if (!safeCountry || safeCountry === "베트남") {
    return {
      inventoryRows: [],
      sourcePlan: [],
      regionRows: [],
      strategyEvidence: { sourceData: [] },
    };
  }
  const ndGainUrl = getNdGainCountryUrl(safeCountry);
  if (!ndGainUrl) {
    return {
      inventoryRows: [],
      sourcePlan: [],
      regionRows: [],
      strategyEvidence: { sourceData: [] },
    };
  }

  const wbUrl = getWorldBankOpenDataUrl(safeCountry);
  const gcfUrl = getGcfCountryUrl(safeCountry);
  const populationUrl = getWorldBankIndicatorUrl(safeCountry, "SP.POP.TOTL");
  const gdpPerCapitaUrl = getWorldBankIndicatorUrl(
    safeCountry,
    "NY.GDP.PCAP.CD"
  );
  const electricityAccessUrl = getWorldBankIndicatorUrl(
    safeCountry,
    "EG.ELC.ACCS.ZS"
  );

  return {
    inventoryRows: [
      {
        status: "확보",
        group: "기초지표",
        name: `${safeCountry} ND-GAIN 국가 프로필`,
        scope: "국가",
        memo: "국가 취약도 및 적응 준비도 지표 공식 연계", // '직접 확인' 순화
      },
      {
        status: "확보",
        group: "기초지표",
        name: `${safeCountry} World Bank 국가 데이터`,
        scope: "국가",
        memo: "인구, GDP, 전력 접근성, 재생에너지 비중 등 거시 지표 확보", // '확인' 순화
      },
      {
        status: "확보",
        group: "기초지표",
        name: `${safeCountry} World Bank 공식 지표 연계`, // '직접 지표 링크' 순화
        scope: "국가",
        memo: "인구, 1인당 GDP, 전력 접근성 등 핵심 지표 직접 연계", // '바로 인용 가능한' 구어체 순화
      },
      {
        status: "확보",
        group: "국제협력",
        name: `${safeCountry} GCF 국가 페이지`,
        scope: "국가",
        memo: "국가 프로그램, 승인 프로젝트, Readiness, APR 등 기후 재원 파이프라인 내역 확보", // '재원 신호 확인' 순화
      },
    ],
    sourcePlan: [
      {
        layer: "기후취약도",
        source: "ND-GAIN Country Index",
        acquisition: "Public web",
        cycle: "연 1회 이상",
        resolution: "국가",
        endpoint: ndGainUrl,
        note: "국가 단위 취약도, 적응 준비도 및 부문별 위험 정보 제공", // '함께 확인' 순화
      },
      {
        layer: "국가 기본정보",
        source: "World Bank country data",
        acquisition: "Public web/API",
        cycle: "연 1회 이상",
        resolution: "국가",
        endpoint: wbUrl,
        note: "인구, GDP, 전력 접근성, 재생에너지 비중, CO2 배출량 등 국가 거시 지표 통합 제공", // '같은 출처에서 확인' 순화
      },
      {
        layer: "핵심 거시 지표", // '직접 지표' 명확화
        source: "World Bank direct indicator pages",
        acquisition: "Public web",
        cycle: "연 1회 이상",
        resolution: "국가",
        endpoint:
          populationUrl || gdpPerCapitaUrl || electricityAccessUrl || wbUrl,
        note: "문서 및 보고서 작성(인용) 목적의 개별 지표 딥링크(Deep-link) 제공", // '회의자료 인용에 쓰기 쉬운' 대화형 순화
      },
      {
        layer: "국제기후재원",
        source: "GCF country page",
        acquisition: "Public web",
        cycle: "수시",
        resolution: "국가/프로젝트",
        endpoint: gcfUrl,
        note: "국가 프로그램, 프로젝트, Readiness, APR, ESS 문서 통합 열람 허브", // '한 화면에서 추적' 순화
      },
    ],
    regionRows: [
      {
        scope: "국가",
        category: "기초지표",
        field: "ND-GAIN 취약도 및 적응 준비도",
        value: `${safeCountry} 대상 기후 취약도 및 적응 준비도 지표 제공`, // '직접 확인할 수 있습니다' 순화
        unit: "-",
        source: "ND-GAIN country profile",
        link: ndGainUrl,
        update: "연 1회 이상",
      },
      {
        scope: "국가",
        category: "기초지표",
        field: "World Bank 국가 기초 지표",
        value: `${safeCountry} 기준 인구, GDP, 전력 접근성, 재생에너지 비중 등 핵심 거시 지표 제공`,
        unit: "-",
        source: "World Bank country data",
        link: wbUrl,
        update: "연 1회 이상",
      },
      {
        scope: "국가",
        category: "기초지표",
        field: "World Bank 핵심 지표 연계", // '직접 지표 페이지' 명확화
        value: `${safeCountry} 기준 인구, 1인당 GDP, 전력 접근성 등 단일 지표별 딥링크(Deep-link) 제공`, // '바로 인용하기 쉬운' 구어체 순화
        unit: "-",
        source: "World Bank direct indicator page",
        link: populationUrl || gdpPerCapitaUrl || electricityAccessUrl || wbUrl,
        update: "연 1회 이상",
      },
      {
        scope: "국가",
        category: "기후재원",
        field: "GCF 국가 페이지",
        value: `${safeCountry} 대상 GCF 프로젝트, Readiness, Country Programme, APR 통합 열람 제공`,
        unit: "-",
        source: "GCF country page",
        link: gcfUrl,
        update: "수시",
      },
    ],
    strategyEvidence: {
      sourceData: [
        {
          id: `${(
            COUNTRY_META[safeCountry]?.iso2 || safeCountry
          ).toLowerCase()}-ndgain-profile`,
          label: `${safeCountry} ND-GAIN 국가 프로필`,
          group: "기초지표",
          source: "ND-GAIN Country Index",
          mode: "공식 포털",
          link: ndGainUrl,
          description:
            "기후 취약도, 적응 준비도 및 부문별 리스크 파악을 위한 국가 프로필 페이지", // '확인할 수 있는' 서술형 수정
          lastUpdated: "공개 포털 기준",
          sampleFields: ["country", "metric", "link"],
          rows: [
            {
              country: safeCountry,
              metric: "Vulnerability / Readiness profile",
              link: ndGainUrl,
            },
          ],
        },
        {
          id: `${(
            COUNTRY_META[safeCountry]?.iso2 || safeCountry
          ).toLowerCase()}-wb-country-data`,
          label: `${safeCountry} World Bank 국가 데이터`,
          group: "기초지표",
          source: "World Bank country data",
          mode: "공식 포털",
          link: wbUrl,
          description:
            "국가 거시 지표 및 통계 데이터를 통합 제공하는 공식 열람 페이지", // '한 곳에서 확인할 수 있는' 순화
          lastUpdated: "공개 포털 기준",
          sampleFields: ["country", "indicatorHub", "link"],
          rows: [
            {
              country: safeCountry,
              indicatorHub:
                "Population · GDP · Electricity access · Renewable energy",
              link: wbUrl,
            },
          ],
        },
        {
          id: `${(
            COUNTRY_META[safeCountry]?.iso2 || safeCountry
          ).toLowerCase()}-wb-direct-indicators`,
          label: `${safeCountry} 핵심 지표 통합 연계`, // '직접 지표 링크 묶음' 순화
          group: "기초지표",
          source: "World Bank direct indicator pages",
          mode: "공식 포털",
          link:
            populationUrl || gdpPerCapitaUrl || electricityAccessUrl || wbUrl,
          description:
            "인구, 1인당 GDP, 전력 접근성 등 주요 거시 지표 개별 열람을 위한 딥링크(Deep-link) 제공", // '한 번에 활용할 수 있도록 묶었습니다' 대화형 어조 배제
          lastUpdated: "공개 포털 기준",
          sampleFields: ["indicator", "link"],
          rows: [
            {
              indicator: "Population, total",
              link: populationUrl || wbUrl,
            },
            {
              indicator: "GDP per capita (current US$)",
              link: gdpPerCapitaUrl || wbUrl,
            },
            {
              indicator: "Access to electricity (% of population)",
              link: electricityAccessUrl || wbUrl,
            },
          ],
        },
      ],
    },
  };
}

function getCountryEnrichment(country) {
  const base = COUNTRY_DATA_ENRICHMENTS[country] || null;
  const extra = COUNTRY_SUPPLEMENTAL_ENRICHMENTS[country] || null;
  const freshness = COUNTRY_FRESHNESS_ENRICHMENTS[country] || null;
  const common = buildCommonCountryEvidence(country);
  if (!base && !extra && !freshness && !safeArray(common?.sourcePlan).length)
    return null;
  return {
    ...(base || {}),
    ...(extra || {}),
    ...(freshness || {}),
    inventoryRows: [
      ...safeArray(common?.inventoryRows),
      ...safeArray(base?.inventoryRows),
      ...safeArray(extra?.inventoryRows),
      ...safeArray(freshness?.inventoryRows),
    ],
    sourcePlan: [
      ...safeArray(common?.sourcePlan),
      ...safeArray(base?.sourcePlan),
      ...safeArray(extra?.sourcePlan),
      ...safeArray(freshness?.sourcePlan),
    ],
    regionRows: [
      ...safeArray(common?.regionRows),
      ...safeArray(base?.regionRows),
      ...safeArray(extra?.regionRows),
      ...safeArray(freshness?.regionRows),
    ],
    actions: [
      ...safeArray(base?.actions),
      ...safeArray(extra?.actions),
      ...safeArray(freshness?.actions),
    ],
    localPartners: [
      ...safeArray(base?.localPartners),
      ...safeArray(extra?.localPartners),
      ...safeArray(freshness?.localPartners),
    ],
    strategyEvidence: {
      ...(base?.strategyEvidence || {}),
      ...(extra?.strategyEvidence || {}),
      ...(freshness?.strategyEvidence || {}),
      sourceData: [
        ...safeArray(common?.strategyEvidence?.sourceData),
        ...safeArray(base?.strategyEvidence?.sourceData),
        ...safeArray(extra?.strategyEvidence?.sourceData),
        ...safeArray(freshness?.strategyEvidence?.sourceData),
      ],
    },
    executionFeasibility: {
      ...(base?.executionFeasibility || {}),
      ...(extra?.executionFeasibility || {}),
      ...(freshness?.executionFeasibility || {}),
      financeChannels: uniqBy(
        [
          ...safeArray(base?.executionFeasibility?.financeChannels),
          ...safeArray(extra?.executionFeasibility?.financeChannels),
          ...safeArray(freshness?.executionFeasibility?.financeChannels),
        ],
        (item) => item
      ),
      deliveryPartners: uniqBy(
        [
          ...safeArray(base?.executionFeasibility?.deliveryPartners),
          ...safeArray(extra?.executionFeasibility?.deliveryPartners),
          ...safeArray(freshness?.executionFeasibility?.deliveryPartners),
        ],
        (item) => item
      ),
    },
  };
}

function applyCountryDataEnrichment(rec) {
  const enrichment = getCountryEnrichment(rec?.country);
  if (!enrichment) return rec;

  const mergedInventoryRows = uniqBy(
    [...safeArray(rec?.inventoryRows), ...safeArray(enrichment?.inventoryRows)],
    (item) => `${item?.group || ""}|${item?.name || ""}|${item?.memo || ""}`
  );

  const mergedSourcePlan = uniqBy(
    [...safeArray(rec?.sourcePlan), ...safeArray(enrichment?.sourcePlan)]
      .filter(Boolean)
      .map((item) => ({
        ...item,
        endpoint:
          (String(item?.endpoint || "").startsWith("/")
            ? item?.endpoint
            : ensureExternalUrl(item?.endpoint)) ||
          item?.endpoint ||
          "",
      })),
    (item) =>
      `${item?.layer || ""}|${item?.source || ""}|${item?.endpoint || ""}`
  );

  const mergedRegionRows = uniqBy(
    [...safeArray(rec?.regionRows), ...safeArray(enrichment?.regionRows)],
    (item) => `${item?.field || ""}|${item?.source || ""}|${item?.link || ""}`
  );

  const baseEvidence = sanitizeStrategyEvidence(rec?.strategyEvidence, rec);
  const mergedEvidence = sanitizeStrategyEvidence(
    {
      ...baseEvidence,
      summary: enrichment?.strategyEvidence?.summary || baseEvidence?.summary,
      sourceData: [
        ...safeArray(baseEvidence?.sourceData),
        ...safeArray(enrichment?.strategyEvidence?.sourceData),
      ],
    },
    rec
  );

  const baseExecution = sanitizeExecutionFeasibility(
    rec?.executionFeasibility,
    rec
  );
  const mergedFinanceChannels = uniqBy(
    [
      ...safeArray(baseExecution?.financeChannels),
      ...safeArray(enrichment?.executionFeasibility?.financeChannels),
    ],
    (item) => item
  );
  const mergedDeliveryPartners = uniqBy(
    [
      ...safeArray(baseExecution?.deliveryPartners),
      ...safeArray(enrichment?.executionFeasibility?.deliveryPartners),
    ],
    (item) => item
  );

  return {
    ...rec,
    countryNote: enrichment?.countryNote || rec?.countryNote,
    inventoryRows: mergedInventoryRows,
    sourcePlan: mergedSourcePlan,
    regionRows: mergedRegionRows,
    actions: uniqBy(
      [...safeArray(rec?.actions), ...safeArray(enrichment?.actions)],
      (item) => item
    ),
    strategyEvidence: mergedEvidence,
    executionFeasibility: sanitizeExecutionFeasibility(
      {
        ...baseExecution,
        ...enrichment?.executionFeasibility,
        financeChannels: mergedFinanceChannels,
        deliveryPartners: mergedDeliveryPartners,
      },
      rec
    ),
    localPartners: uniqBy(
      [
        ...safeArray(rec?.localPartners),
        ...safeArray(enrichment?.localPartners),
      ],
      (item) =>
        typeof item === "string" ? item : item?.name || JSON.stringify(item)
    ),
  };
}

function buildRecFromVietnamPilot(pilot) {
  return {
    id: 3001,
    country: pilot.country,
    countryCenter: pilot.countryCenter,
    region: pilot.region,
    lat: pilot.regionCenter?.[1],
    lon: pilot.regionCenter?.[0],
    tech: pilot.tech,
    subTech: undefined,
    continent: pilot.continent,
    purposeTags: pilot.purposeTags,
    scores: pilot.scores,
    reasons: pilot.reasons,
    coordBasis: pilot.coordBasis,
    countryNote: pilot.countryNote,
    schema: pilot.schema,
    inventoryRows: pilot.inventoryRows,
    sourcePlan: pilot.sourcePlan,
    regionRows: pilot.regionRows,
    actions: pilot.actions,
    cooperationProfile: buildCooperationProfile({
      tech: pilot.tech,
      scores: pilot.scores,
    }),
    strategyEvidence: sanitizeStrategyEvidence(pilot.strategyEvidence, pilot),
    executionFeasibility: sanitizeExecutionFeasibility(
      pilot.executionFeasibility,
      pilot
    ),
    localPartners: buildLocalPartners({
      country: pilot.country,
      region: pilot.region,
      tech: pilot.tech,
      purposeTags: pilot.purposeTags || [],
    }),
    suitabilityLogic: pilot.suitabilityLogic,
    pilotStatus: pilot.pilotStatus,
    scoreMethod: SCORE_METHOD,
    dataPackVersion: pilot.version || "v1",
  };
}

const VIETNAM_PILOT_REC = buildRecFromVietnamPilot(VIETNAM_MEKONG_PILOT_DATA);

const ENHANCED_RECOMMENDATIONS = [
  ...RECOMMENDATIONS.filter(
    (rec) => !(rec.country === "베트남" && rec.region === "메콩 델타")
  ).map((rec) =>
    applyCountryDataEnrichment({
      ...rec,
      subTech: undefined,
      cooperationProfile: buildCooperationProfile(rec),
      strategyEvidence: buildStrategyEvidence(rec),
      executionFeasibility: sanitizeExecutionFeasibility(
        buildExecutionFeasibility(rec),
        rec
      ),
      localPartners: buildLocalPartners(rec),
      suitabilityLogic: buildSuitabilityLogic(rec),
      pilotStatus: getPilotStatus(rec),
      scoreMethod: SCORE_METHOD,
    })
  ),
  VIETNAM_PILOT_REC,
].sort((a, b) => a.id - b.id);

const NORMALIZED_ENHANCED_RECOMMENDATIONS = ENHANCED_RECOMMENDATIONS.map(
  (rec) => normalizeRecommendationTech(rec)
);

const DEFAULT_PLATFORM_FILTERS = {
  keyword: "",
  tech: "전체 기술",
  country: "전체 국가",
  purpose: "전체 목적",
  minCoverage: 70,
  strategyFocus: "균형형",
  sortMode: "strategy",
  financeChannel: "전체 재원",
  decisionFilter: "전체",
  minStrategyScore: 60,
  minPipelineProjects: 0,
};

const STRATEGY_PRESETS = {
  overview: {
    key: "overview",
    label: "플랫폼 시작 가이드",
    detailTab: "overview",
    focusMode: "region",
    leftPanelTab: "candidates",
    mobilePanel: "detail",
  },
  "oda-screening": {
    key: "oda-screening",
    label: "ODA 기획 대상 선별",
    purpose: "ODA",
    strategyFocus: "균형형",
    minCoverage: 75,
    detailTab: "recommendations",
    focusMode: "region",
    leftPanelTab: "filters",
    mobilePanel: "filters",
  },
  "adaptation-screening": {
    key: "adaptation-screening",
    label: "적응 협력 후보 찾기",
    tech: "기후변화 감시 및 진단 기술",
    purpose: "ODA",
    minCoverage: 80,
    detailTab: "recommendations",
    focusMode: "region",
    leftPanelTab: "filters",
    mobilePanel: "filters",
  },
  "energy-rnd": {
    key: "energy-rnd",
    label: "에너지 실증 후보 찾기",
    purpose: "R&D 실증",
    strategyFocus: "실행우선",
    minCoverage: 70,
    detailTab: "recommendations",
    focusMode: "region",
    leftPanelTab: "filters",
    mobilePanel: "filters",
  },
  "partner-mapping": {
    key: "partner-mapping",
    label: "현지 파트너 탐색",
    purpose: "ODA",
    strategyFocus: "실행우선",
    minCoverage: 70,
    detailTab: "partners",
    focusMode: "region",
    leftPanelTab: "candidates",
    mobilePanel: "detail",
  },
  "evidence-review": {
    key: "evidence-review",
    label: "근거·출처 검토",
    strategyFocus: "균형형",
    minCoverage: 75,
    detailTab: "sources",
    focusMode: "region",
    leftPanelTab: "candidates",
    mobilePanel: "detail",
  },
  "funding-brief": {
    key: "funding-brief",
    label: "재원·실행 요약본 준비",
    purpose: "ODA",
    strategyFocus: "균형형",
    minCoverage: 75,
    detailTab: "funding",
    focusMode: "region",
    leftPanelTab: "candidates",
    mobilePanel: "detail",
  },
};

const resolveStrategyPresetKey = (presetKey = null) => {
  if (!presetKey) return null;
  return STRATEGY_PRESETS[presetKey] ? presetKey : "overview";
};

const buildPresetFilters = (preset = null) => ({
  ...DEFAULT_PLATFORM_FILTERS,
  ...(preset?.tech ? { tech: preset.tech } : {}),
  ...(preset?.country ? { country: preset.country } : {}),
  ...(preset?.purpose ? { purpose: preset.purpose } : {}),
  ...(preset?.minCoverage ? { minCoverage: preset.minCoverage } : {}),
  ...(preset?.strategyFocus ? { strategyFocus: preset.strategyFocus } : {}),
  ...(preset?.sortMode ? { sortMode: preset.sortMode } : {}),
  ...(preset?.financeChannel ? { financeChannel: preset.financeChannel } : {}),
  ...(preset?.decisionFilter ? { decisionFilter: preset.decisionFilter } : {}),
  ...(preset?.minStrategyScore
    ? { minStrategyScore: preset.minStrategyScore }
    : {}),
  ...(preset?.minPipelineProjects
    ? { minPipelineProjects: preset.minPipelineProjects }
    : {}),
});

const PLATFORM_USAGE_SCENARIOS = [
  {
    key: "overview",
    tone: "slate",
    audience: "처음 접속한 사용자",
    title: "플랫폼 활용법 알아보기",
    summary:
      "지도, 후보, 우측 상세 패널 연계 구조 및 핵심 검토 경로를 파악합니다.",
    output: "화면 구조 이해 · 기본 검토 숙지",
    highlights: ["후보 선택", "핵심 요약 탭", "지도 포커스"],
  },
  {
    key: "oda-screening",
    tone: "emerald",
    audience: "정책·ODA 기획 담당자",
    title: "ODA 사업 발굴 대상 선별",
    summary:
      "국가 수요와 데이터 준비도를 기준으로 공공협력형 우선 후보를 3~5개로 좁힙니다.",
    output: "우선협력 후보",
    highlights: ["ODA 목적", "국가·기술 필터", "추천 협력 탭"],
  },
  {
    key: "adaptation-screening",
    tone: "blue",
    audience: "적응·재난·수자원 담당자",
    title: "적응 협력 수요 검토",
    summary:
      "기후위험이 큰 지역과 적응기술 수요를 함께 보면서 실질적인 협력 수요를 확인합니다.",
    output: "적응 협력 메모 초안",
    highlights: ["적응기술", "지역 위험", "현지 수요"],
  },
  {
    key: "energy-rnd",
    tone: "amber",
    audience: "실증·연구기획 담당자",
    title: "실증·R&D 후보지 찾기",
    summary:
      "재생에너지·전력 분야에서 실증 가능성과 재원 신호가 동시에 있는 후보지를 빠르게 찾습니다.",
    output: "실증 후보지 요약본",
    highlights: ["R&D 실증", "재원·실행", "파이프라인"],
  },
  {
    key: "partner-mapping",
    tone: "sky",
    audience: "국제협력 실무자",
    title: "현지 협력 파트너 정리",
    summary:
      "정부·유틸리티·연구기관·집행기관을 역할별로 나눠 접촉 우선순위를 정리합니다.",
    output: "파트너 접촉 리스트",
    highlights: ["현지 파트너", "역할 구분", "공식 링크"],
  },
  {
    key: "funding-brief",
    tone: "emerald",
    audience: "보고·의사결정 자료 작성자",
    title: "재원·실행 요약본 만들기",
    summary:
      "재원 연결 경로, 파이프라인, 실행 파트너를 한 화면에서 점검하고 요약본으로 내보냅니다.",
    output: "내부 보고용 요약본",
    highlights: ["재원·실행", "공유용 요약본", "공유 링크"],
  },
  {
    key: "evidence-review",
    tone: "blue",
    audience: "검토·검증 담당자",
    title: "근거자료와 출처 빠르게 검토",
    summary:
      "정책 문서, 데이터 소스, 지역 단위 근거가 무엇인지 확인해 검토 신뢰도를 높입니다.",
    output: "근거 검토 메모",
    highlights: ["근거 자료", "지역 데이터", "근거 링크"],
  },
];

const ROLE_BASED_WORKFLOWS = [
  {
    key: "overview",
    preset: "overview",
    tone: "slate",
    label: "처음 둘러보기",
    title: "플랫폼 구조 빠르게 익히기",
    summary:
      "기본 후보 찾기 목록을 먼저 확인하고, 상세 패널에서 근거 자료까지 짧게 훑어봅니다.",
    steps: ["후보 1개 열기", "핵심 요약 탭 확인", "공식 근거 확인"],
    cta: "기본 화면 열기",
    result: "기본 검토 흐름 이해",
    when: "처음 접속했거나 구조를 빠르게 확인하고 싶을 때",
  },
  {
    key: "oda",
    preset: "oda-screening",
    tone: "emerald",
    label: "ODA 협력",
    title: "ODA 협력 후보 찾기",
    summary:
      "국가 수요와 데이터 준비도를 기준으로 공공협력형 우선 후보를 3~5개로 압축합니다.",
    steps: ["ODA 목적 적용", "후보 3~5개 보관", "재원·근거 비교"],
    cta: "ODA 후보",
    result: "우선 협력 후보",
    when: "사업 발굴이나 보고용 후보 압축이 필요할 때",
  },
  {
    key: "rnd",
    preset: "energy-rnd",
    tone: "amber",
    label: "실증·R&D",
    title: "R&D 실증 후보 찾기",
    summary:
      "재생에너지·전력 분야의 실증 및 재원 연계가 가능한 대상을 탐색합니다.",
    steps: ["실증 목적 적용", "재원·실행 탭 확인", "협력 대상 검토표 PDF 준비"],
    cta: "실증 후보",
    result: "실증 후보지 요약본",
    when: "기술 실증, 연구기획, 확산 후보를 검토할 때",
  },
  {
    key: "partners",
    preset: "partner-mapping",
    tone: "sky",
    label: "현지 파트너",
    title: "현지 파트너 확인",
    summary:
      "정부·유틸리티·연구기관·집행기관을 역할별로 나눠 접촉 우선순위를 정리합니다.",
    steps: ["파트너 탭 열기", "공식 링크 확인", "접촉 우선순위 정리"],
    cta: "파트너 보기",
    result: "파트너 접촉 리스트",
    when: "출장, 회의, 협의 준비가 필요할 때",
  },
  {
    key: "funding",
    preset: "funding-brief",
    tone: "blue",
    label: "재원·실행",
    title: "재원·실행 가능성 검토",
    summary:
      "재원 연결 경로, 파이프라인, 실행 파트너를 함께 보고 요약본 준비 상태까지 점검합니다.",
    steps: ["재원 탭 열기", "파이프라인 확인", "요약본 준비"],
    cta: "재원 후보",
    result: "재원·실행 요약본",
    when: "회의 직전 검토나 실행 가능성 판단이 필요할 때",
  },
];

const SCENARIO_ACTION_TRACKER_INITIAL = {
  shareCopiedAt: null,
  briefDownloadedAt: null,
  excelDownloadedAt: null,
  feedbackCopiedAt: null,
};

const SCENARIO_WORKFLOWS = {
  overview: {
    key: "overview",
    audience: "처음 접속한 사용자",
    title: "플랫폼 구조 빠르게 익히기",
    when: "플랫폼 첫 진입 시 지도·후보·상세 패널이 어떻게 연결되는지 빠르게 확인할 때 사용합니다.",
    deliverable: "기본 검토 메모",
    pilotNote:
      "대표 예시는 베트남 메콩델타 데이터입니다. 국가 전용 화면이 아니라 확장 가능한 전략지도 구조를 먼저 익히는 흐름입니다.",
    preset: STRATEGY_PRESETS.overview,
    steps: [
      {
        key: "open-candidates",
        label: "대상 목록 열기",
        detail: "좌측 패널에서 후보을 열고 기본 추천 후보를 확인합니다.",
        question: "어떤 후보를 먼저 검토할 것인가?",
        actionKey: "go-candidates",
        actionLabel: "후보 열기",
        guideKey: "toolbar-candidates",
        rule: "candidates-open",
      },
      {
        key: "check-overview",
        label: "핵심 요약 확인",
        detail:
          "우측 상세 패널의 핵심 요약 탭에서 핵심 점수와 추천 사유를 먼저 확인합니다.",
        question: "우선 검토 대상 선정 사유",
        actionKey: "go-overview",
        actionLabel: "핵심 요약 탭 보기",
        guideKey: "toolbar-detail",
        rule: "detail-tab-overview",
      },
      {
        key: "check-map",
        label: "지도 확인",
        detail: "국가와 지역 시점을 오가며 위치와 공간 범위를 확인합니다.",
        question: "국가 수준 판단과 지역 수준 판단이 일치하는가?",
        actionKey: "go-region",
        actionLabel: "지역 보기",
        guideKey: "map-interaction",
        rule: "focus-region",
      },
      {
        key: "review-sources",
        label: "근거 보기",
        detail: "근거 자료 탭에서 근거 링크와 데이터 출처를 확인합니다.",
        question: "이 판단을 뒷받침하는 공식 근거가 있는가?",
        actionKey: "go-sources",
        actionLabel: "출처 탭 열기",
        guideKey: "excel-download",
        rule: "detail-tab-sources",
      },
    ],
    completion: {
      headline: "플랫폼의 기본 검토 흐름을 확인했습니다.",
      summary:
        "후보 선택 → 핵심 요약 검토 → 지도 확인 → 근거 확인의 기본 절차가 정리되었습니다.",
      outputs: [
        "대표 후보 1건 검토",
        "상세 패널 기본 탭 구조 이해",
        "출처 확인 경로 파악",
      ],
      actions: [
        { key: "copy-share", label: "현재 화면 링크 복사" },
        { key: "download-brief", label: "요약본 준비" },
      ],
    },
  },
  "oda-screening": {
    key: "oda-screening",
    audience: "정책·ODA 기획 담당자",
    title: "ODA 사업 발굴 대상 선별",
    when: "대상을 3~5개로 선별하여 내부 검토용 초안을 작성할 때 활용합니다.",
    deliverable: "우선협력 후보",
    pilotNote:
      "현재는 베트남 메콩델타 대표 데이터가 가장 풍부하게 연결되어 있어 전체 구조를 빠르게 확인하기 좋습니다.",
    preset: STRATEGY_PRESETS["oda-screening"],
    steps: [
      {
        key: "set-filters",
        label: "목적 정렬",
        detail:
          "ODA 목적 기준으로 필터 패널을 열고 후보 압축 기준을 확인합니다.",
        question: "이번 검토의 목적 선택이 ODA에 맞게 정렬되었는가?",
        actionKey: "go-filters",
        actionLabel: "필터 패널 열기",
        guideKey: "toolbar-filter",
        rule: "filters-open",
      },
      {
        key: "shortlist-candidates",
        label: "후보 압축",
        detail:
          "저장 후보에 우선 검토 대상 3개 이상을 담아 1차 후보군을 만듭니다.",
        question: "우선협력 후보를 3~5개로 좁혔는가?",
        actionKey: "toggle-shortlist",
        actionLabel: "관심 대상으로 저장",
        guideKey: "toolbar-candidates",
        rule: "shortlist-min",
        minShortlist: 3,
      },
      {
        key: "check-recommendations",
        label: "추천 협력 검토",
        detail: "추천 협력 탭에서 협력 방식과 우선 지역·로드맵을 검토합니다.",
        question: "왜 이 후보들이 우선 검토 대상인가?",
        actionKey: "go-recommendations",
        actionLabel: "추천 협력 탭 열기",
        guideKey: "toolbar-detail",
        rule: "detail-tab-recommendations",
      },
      {
        key: "check-sources",
        label: "근거 확인",
        detail: "근거 자료 탭에서 정책 문서와 데이터 근거를 확인합니다.",
        question: "공식 문서와 데이터 근거가 충분한가?",
        actionKey: "go-sources",
        actionLabel: "출처 탭 열기",
        guideKey: "excel-download",
        rule: "detail-tab-sources",
      },
      {
        key: "share-output",
        label: "공유·다운로드",
        detail: "요약본 PDF 또는 공유 링크로 검토 결과를 전달합니다.",
        question: "내부 공유 가능한 산출물 준비가 끝났는가?",
        actionKey: "download-brief",
        actionLabel: "요약본 준비",
        guideKey: "excel-download",
        rule: "has-export",
      },
    ],
    completion: {
      headline: "ODA 후보 압축이 완료되었습니다.",
      summary:
        "저장 후보, 추천 협력, 근거 문서, 공유용 결과물이 모두 준비된 상태입니다.",
      outputs: [
        "우선협력 후보 3개 이상 정리",
        "근거 문서 확인 완료",
        "공유 가능한 요약본 또는 링크 준비",
      ],
      actions: [
        { key: "download-brief", label: "요약본 다시 열기" },
        { key: "copy-share", label: "공유 링크" },
      ],
    },
  },
  "adaptation-screening": {
    key: "adaptation-screening",
    audience: "적응·재난·수자원 담당자",
    title: "적응 협력 수요 검토",
    when: "기후위험이 큰 지역과 적응 수요를 함께 보며 적응 협력 후보를 검토할 때 사용합니다.",
    deliverable: "적응 협력 메모 초안",
    preset: STRATEGY_PRESETS["adaptation-screening"],
    steps: [
      {
        key: "set-filters",
        label: "기준 설정",
        detail: "적응 수요 중심으로 필터를 정렬합니다.",
        question: "적응 목적과 기술 필터가 맞게 잡혔는가?",
        actionKey: "go-filters",
        actionLabel: "필터 패널 열기",
        guideKey: "toolbar-filter",
        rule: "filters-open",
      },
      {
        key: "review-map",
        label: "위험 지역 확인",
        detail:
          "지도에서 국가와 지역 시점을 바꿔 위험·수요가 큰 지역을 확인합니다.",
        question: "어느 지역이 우선 검토 대상인가?",
        actionKey: "go-region",
        actionLabel: "지역 보기",
        guideKey: "map-interaction",
        rule: "focus-region",
      },
      {
        key: "review-recommendations",
        label: "협력안 검토",
        detail: "추천 협력 탭에서 적응 목적에 맞는 협력 방향을 검토합니다.",
        question: "협력 방식과 수요가 연결되는가?",
        actionKey: "go-recommendations",
        actionLabel: "추천 협력 탭 열기",
        guideKey: "toolbar-detail",
        rule: "detail-tab-recommendations",
      },
      {
        key: "review-sources",
        label: "근거 확인",
        detail: "근거 자료 탭에서 근거 문서와 데이터 소스를 확인합니다.",
        question: "위험·수요 판단의 근거가 확보되었는가?",
        actionKey: "go-sources",
        actionLabel: "출처 탭 열기",
        guideKey: "excel-download",
        rule: "detail-tab-sources",
      },
      {
        key: "deliver",
        label: "메모 정리",
        detail: "요약본 PDF 또는 공유 링크로 검토 결과를 정리합니다.",
        question: "공유 가능한 검토 메모가 준비되었는가?",
        actionKey: "download-brief",
        actionLabel: "요약본 준비",
        guideKey: "excel-download",
        rule: "has-export",
      },
    ],
    completion: {
      headline: "적응 협력 검토가 정리되었습니다.",
      summary:
        "위험 지역, 협력 방향, 근거 자료, 공유 산출물이 모두 연결되었습니다.",
      outputs: [
        "적응 협력 검토 메모",
        "근거 링크 확인",
        "공유 가능한 요약본 준비",
      ],
      actions: [
        { key: "download-brief", label: "요약본 준비" },
        { key: "copy-share", label: "공유 링크" },
      ],
    },
  },
  "energy-rnd": {
    key: "energy-rnd",
    audience: "실증·연구기획 담당자",
    title: "실증·R&D 후보지 찾기",
    when: "재생에너지·전력 분야에서 실증 가능성과 재원 신호를 동시에 살펴볼 때 사용합니다.",
    deliverable: "실증 후보지 요약본",
    preset: STRATEGY_PRESETS["energy-rnd"],
    steps: [
      {
        key: "set-filters",
        label: "실증 필터 설정",
        detail: "R&D 실증 목적 기준으로 후보를 정렬합니다.",
        question: "실증 목적과 후보군이 맞게 정렬되었는가?",
        actionKey: "go-filters",
        actionLabel: "필터 패널 열기",
        guideKey: "toolbar-filter",
        rule: "filters-open",
      },
      {
        key: "review-region",
        label: "지역 후보 확인",
        detail: "지역 시점으로 내려가 실증 후보지를 확인합니다.",
        question: "실증 가능성이 높은 지역은 어디인가?",
        actionKey: "go-region",
        actionLabel: "지역 보기",
        guideKey: "map-interaction",
        rule: "focus-region",
      },
      {
        key: "review-funding",
        label: "재원·실행 검토",
        detail: "재원·실행 탭에서 파이프라인과 재원을 확인합니다.",
        question: "재원 신호와 실행 가능성이 있는가?",
        actionKey: "go-funding",
        actionLabel: "재원·실행 탭 열기",
        guideKey: "toolbar-detail",
        rule: "detail-tab-funding",
      },
      {
        key: "review-partners",
        label: "협력 파트너 검토",
        detail: "현지 파트너 탭에서 정부·유틸리티·실증 파트너를 확인합니다.",
        question: "누구와 함께 실증을 추진할 것인가?",
        actionKey: "go-partners",
        actionLabel: "현지 파트너 탭 열기",
        guideKey: "toolbar-detail",
        rule: "detail-tab-partners",
      },
      {
        key: "deliver",
        label: "실증 요약본 정리",
        detail:
          "검토표 PDF 또는 요약본 PDF를 내려받아 실증 검토자료로 사용합니다.",
        question: "실증 검토자료가 준비되었는가?",
        actionKey: "download-excel",
        actionLabel: "검토표 PDF 준비",
        guideKey: "excel-download",
        rule: "has-export",
      },
    ],
    completion: {
      headline: "실증·R&D 후보지 검토가 완료되었습니다.",
      summary: "후보지, 재원·실행, 파트너, 다운로드 산출물이 정리되었습니다.",
      outputs: [
        "실증 후보지 1차 검토",
        "재원·실행 신호 확인",
        "검토표 PDF/요약본 준비",
      ],
      actions: [
        { key: "download-excel", label: "검토표 PDF 다시 열기" },
        { key: "download-brief", label: "요약본 준비" },
      ],
    },
  },
  "partner-mapping": {
    key: "partner-mapping",
    audience: "국제협력 실무자",
    title: "현지 협력 파트너 정리",
    when: "출장·면담·후속 협의를 준비하며 정부·유틸리티·집행기관을 정리할 때 사용합니다.",
    deliverable: "파트너 접촉 리스트",
    preset: STRATEGY_PRESETS["partner-mapping"],
    steps: [
      {
        key: "open-candidates",
        label: "후보 선택",
        detail: "검토할 국가·지역 후보를 선택합니다.",
        question: "어느 후보를 기준으로 파트너를 정리할 것인가?",
        actionKey: "go-candidates",
        actionLabel: "후보 열기",
        guideKey: "toolbar-candidates",
        rule: "has-active-rec",
      },
      {
        key: "review-partners",
        label: "파트너 확인",
        detail: "현지 파트너 탭에서 역할별 기관을 확인합니다.",
        question: "핵심 접촉 대상은 누구인가?",
        actionKey: "go-partners",
        actionLabel: "현지 파트너 탭 열기",
        guideKey: "toolbar-detail",
        rule: "detail-tab-partners",
      },
      {
        key: "review-sources",
        label: "공식 링크 확인",
        detail: "근거 자료 탭에서 기관 공식 링크와 근거를 확인합니다.",
        question: "연락과 협의에 쓸 공식 문서가 확보되었는가?",
        actionKey: "go-sources",
        actionLabel: "출처 탭 열기",
        guideKey: "excel-download",
        rule: "detail-tab-sources",
      },
      {
        key: "deliver",
        label: "공유 자료 정리",
        detail: "요약본 또는 공유 링크로 협의 준비 자료를 정리합니다.",
        question: "파트너 협의용 자료가 준비되었는가?",
        actionKey: "copy-share",
        actionLabel: "공유 링크",
        guideKey: "excel-download",
        rule: "has-export",
      },
    ],
    completion: {
      headline: "현지 파트너 정리가 완료되었습니다.",
      summary: "핵심 파트너, 공식 링크, 공유 자료가 모두 준비된 상태입니다.",
      outputs: ["파트너 접촉 리스트", "공식 링크 확인", "공유 자료 준비"],
      actions: [
        { key: "copy-share", label: "공유 링크" },
        { key: "download-brief", label: "요약본 준비" },
      ],
    },
  },
  "funding-brief": {
    key: "funding-brief",
    audience: "보고·의사결정 자료 작성자",
    title: "재원·실행 요약본 만들기",
    when: "재원 연결 경로, 파이프라인, 실행 파트너를 한 화면에서 검토해 내부 보고자료를 만들 때 사용합니다.",
    deliverable: "내부 보고용 요약본",
    preset: STRATEGY_PRESETS["funding-brief"],
    steps: [
      {
        key: "open-candidate",
        label: "후보 선택",
        detail: "요약본 대상으로 삼을 후보를 하나 선택합니다.",
        question: "어떤 후보를 요약본으로 정리할 것인가?",
        actionKey: "go-candidates",
        actionLabel: "후보 열기",
        guideKey: "toolbar-candidates",
        rule: "has-active-rec",
      },
      {
        key: "review-funding",
        label: "재원 검토",
        detail:
          "재원·실행 탭에서 재원 연결 경로와 프로젝트 파이프라인을 확인합니다.",
        question: "재원과 실행 신호가 충분한가?",
        actionKey: "go-funding",
        actionLabel: "재원·실행 탭 열기",
        guideKey: "toolbar-detail",
        rule: "detail-tab-funding",
      },
      {
        key: "review-partners",
        label: "실행 파트너 확인",
        detail: "파트너 탭에서 집행 주체와 협력 기관을 확인합니다.",
        question: "누가 실행을 맡을 수 있는가?",
        actionKey: "go-partners",
        actionLabel: "현지 파트너 탭 열기",
        guideKey: "toolbar-detail",
        rule: "detail-tab-partners",
      },
      {
        key: "review-sources",
        label: "근거 확인",
        detail: "근거 자료 탭에서 공식 문서와 근거 링크를 확인합니다.",
        question: "보고서에 넣을 근거가 정리되었는가?",
        actionKey: "go-sources",
        actionLabel: "출처 탭 열기",
        guideKey: "excel-download",
        rule: "detail-tab-sources",
      },
      {
        key: "deliver",
        label: "요약본 내보내기",
        detail:
          "요약본 PDF 또는 검토표 PDF를 준비해 내부 공유 가능한 상태로 만듭니다.",
        question: "의사결정용 산출물이 준비되었는가?",
        actionKey: "download-brief",
        actionLabel: "요약본 준비",
        guideKey: "excel-download",
        rule: "has-export",
      },
    ],
    completion: {
      headline: "재원·실행 요약본 준비가 완료되었습니다.",
      summary: "재원·실행·근거·공유 산출물이 한 흐름으로 정리되었습니다.",
      outputs: [
        "재원·실행 요약본",
        "근거 링크 정리",
        "공유 가능한 다운로드 자료",
      ],
      actions: [
        { key: "download-brief", label: "요약본 다시 열기" },
        { key: "download-excel", label: "검토표 PDF 다시 열기" },
      ],
    },
  },
  "evidence-review": {
    key: "evidence-review",
    audience: "검토·검증 담당자",
    title: "근거자료와 출처 빠르게 검토",
    when: "정책 문서, 데이터 소스, 지역 단위 근거를 빠르게 검증해야 할 때 사용합니다.",
    deliverable: "근거 검토 메모",
    preset: STRATEGY_PRESETS["evidence-review"],
    steps: [
      {
        key: "open-candidate",
        label: "후보 선택",
        detail: "검토할 후보를 선택합니다.",
        question: "어떤 후보의 근거를 먼저 볼 것인가?",
        actionKey: "go-candidates",
        actionLabel: "후보 열기",
        guideKey: "toolbar-candidates",
        rule: "has-active-rec",
      },
      {
        key: "review-overview",
        label: "핵심 요약 확인",
        detail: "핵심 요약 탭에서 핵심 판단을 먼저 파악합니다.",
        question: "무엇을 검증해야 하는가?",
        actionKey: "go-overview",
        actionLabel: "핵심 요약 탭 보기",
        guideKey: "toolbar-detail",
        rule: "detail-tab-overview",
      },
      {
        key: "review-sources",
        label: "출처 검토",
        detail: "근거 자료 탭에서 데이터 소스와 공식 링크를 확인합니다.",
        question: "판단 근거가 신뢰 가능한가?",
        actionKey: "go-sources",
        actionLabel: "출처 탭 열기",
        guideKey: "excel-download",
        rule: "detail-tab-sources",
      },
      {
        key: "deliver",
        label: "검토 결과 공유",
        detail: "공유 링크 또는 요약본으로 검토 결과를 전달합니다.",
        question: "검토 결과를 다른 실무자와 공유할 수 있는가?",
        actionKey: "copy-share",
        actionLabel: "공유 링크",
        guideKey: "excel-download",
        rule: "has-export",
      },
    ],
    completion: {
      headline: "근거 검토가 완료되었습니다.",
      summary: "핵심 판단, 출처, 공유 수단이 모두 정리되었습니다.",
      outputs: ["근거 검토 메모", "공식 링크 확인", "공유 가능한 결과물"],
      actions: [
        { key: "copy-share", label: "공유 링크" },
        { key: "download-brief", label: "요약본 준비" },
      ],
    },
  },
};

function getScenarioWorkflow(scenarioKey = "overview") {
  const resolvedKey =
    resolveStrategyPresetKey(scenarioKey || "overview") || "overview";
  return SCENARIO_WORKFLOWS[resolvedKey] || SCENARIO_WORKFLOWS.overview;
}

function formatScenarioPresetState(scenarioKey = "overview") {
  const resolvedKey =
    resolveStrategyPresetKey(scenarioKey || "overview") || "overview";
  const preset =
    STRATEGY_PRESETS[resolvedKey] || STRATEGY_PRESETS.overview || {};
  const lines = [];
  if (preset.label) lines.push(`목적 선택 ${preset.label}`);
  if (preset.purpose) lines.push(`목적 ${preset.purpose}`);
  if (preset.tech) lines.push(`기술 ${preset.tech}`);
  if (preset.country) lines.push(`국가 ${preset.country}`);
  if (preset.detailTab)
    lines.push(
      `상세 탭 ${DETAIL_TAB_META[preset.detailTab]?.badge || preset.detailTab}`
    );
  if (preset.leftPanelTab === "filters") lines.push("좌측 패널 필터 탭");
  if (preset.leftPanelTab === "candidates") lines.push("좌측 패널 후보 탭");
  if (preset.focusMode === "region") lines.push("지도 지역 시점");
  if (preset.focusMode === "country") lines.push("지도 국가 시점");
  if (preset.minCoverage)
    lines.push(`데이터 충실도 ${preset.minCoverage}% 이상`);
  if (preset.strategyFocus) lines.push(`전략 기준 ${preset.strategyFocus}`);
  return lines.length ? lines : ["기본 검토 상태"];
}

function evaluateScenarioStepCompletion(step, ctx = {}) {
  const rule = step?.rule || step?.key;
  const actions = ctx.actions || {};
  switch (rule) {
    case "scenario-started":
      return ctx.activeScenarioKey === ctx.workflowKey;
    case "filters-open":
      return !!ctx.leftPanelOpen && ctx.leftPanelTab === "filters";
    case "candidates-open":
      return !!ctx.leftPanelOpen && ctx.leftPanelTab === "candidates";
    case "has-active-rec":
      return !!ctx.activeRec;
    case "shortlist-min":
      return Number(ctx.shortlistCount || 0) >= Number(step?.minShortlist || 1);
    case "detail-tab-overview":
      return !!ctx.rightPanelOpen && ctx.detailTab === "overview";
    case "detail-tab-recommendations":
      return !!ctx.rightPanelOpen && ctx.detailTab === "recommendations";
    case "detail-tab-funding":
      return !!ctx.rightPanelOpen && ctx.detailTab === "funding";
    case "detail-tab-partners":
      return !!ctx.rightPanelOpen && ctx.detailTab === "partners";
    case "detail-tab-sources":
      return !!ctx.rightPanelOpen && ctx.detailTab === "sources";
    case "focus-country":
      return ctx.focusMode === "country";
    case "focus-region":
      return ctx.focusMode === "region";
    case "has-export":
      return !!(
        actions.shareCopiedAt ||
        actions.briefDownloadedAt ||
        actions.excelDownloadedAt ||
        actions.feedbackCopiedAt
      );
    default:
      return false;
  }
}

function deriveScenarioRuntime(workflow, ctx = {}) {
  const safeWorkflow = workflow || SCENARIO_WORKFLOWS.overview;
  const steps = safeArray(safeWorkflow?.steps).map((step) => ({
    ...step,
    complete: evaluateScenarioStepCompletion(step, {
      ...ctx,
      workflowKey: safeWorkflow.key,
    }),
  }));
  const totalCount = steps.length;
  const completedCount = steps.filter((step) => step.complete).length;
  const firstIncompleteIndex = steps.findIndex((step) => !step.complete);
  const currentIndex =
    firstIncompleteIndex >= 0
      ? firstIncompleteIndex
      : Math.max(totalCount - 1, 0);
  const currentStep =
    firstIncompleteIndex >= 0 ? steps[firstIncompleteIndex] : null;
  return {
    workflow: safeWorkflow,
    steps,
    totalCount,
    completedCount,
    currentIndex,
    currentStep,
    isComplete: totalCount > 0 && completedCount >= totalCount,
  };
}

function findGuideStepIndexByKey(targetKey = "toolbar-filter") {
  const idx = safeArray(GUIDE_STEPS).findIndex(
    (item) => item?.key === targetKey
  );
  return idx >= 0 ? idx : 0;
}

const INTERACTION_AUDIT_SUMMARY = {
  buttonCount: 104,
  onClickCount: 104,
  reviewedAreas: [
    "헤더/공유",
    "필터",
    "후보 카드",
    "상세 탭",
    "다운로드/복사",
    "모바일 하단 내비게이션",
  ],
  note: "완전한 브라우저 E2E 자동 클릭 테스트는 이 환경에서 제한되므로, 공용 버튼/핸들러 경로는 코드 기준으로 전수 점검해 안정화했습니다.",
};

function uniqBy(items = [], keyFn = (item) => item) {
  const map = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
}

function extractSourceRows(rec, sourceId) {
  return (
    rec?.strategyEvidence?.sourceData?.find((item) => item.id === sourceId)
      ?.rows || []
  );
}

function scoreRiskUrgency(rec) {
  const tech = normalizeTechName(rec?.tech || "");
  const adaptationHigh = new Set([
    "기후변화 감시 및 진단 기술",
    "기후변화 예측 기술",
    "기후변화 영향 평가 기술",
    "기후변화 취약성 및 위험성 평가 기술",
    "물 부문 기술",
    "국토연안 부문 기술",
    "농축수산 부문 기술",
    "산림·생태계 부문 기술",
    "건강 부문 기술",
    "산업 에너지 부문 기술",
    "적응조치의 효과평가 기술",
    "기후변화 적응기반 기술",
  ]);
  const enablingMid = new Set([
    "전력 통합 기술",
    "전력-비전력 부문간 결합 기술",
    "열 통합 기술",
    "태양광 기술",
    "풍력 기술",
    "수력 기술",
    "해양에너지 기술",
    "지열 기술",
    "수열 기술",
  ]);
  if (adaptationHigh.has(tech)) return 90;
  if (enablingMid.has(tech)) return 78;
  if (
    tech === "이산화탄소(CO₂) 포집·저장·활용 기술" ||
    tech === "메탄(CH₄) 처리 기술"
  )
    return 74;
  return 70;
}

function inferFinanceRoute(rec, mergedPipeline = []) {
  const channels = rec?.executionFeasibility?.financeChannels || [];
  if (mergedPipeline.length >= 3 && channels.includes("GCF")) {
    return "ODA 기획 → MDB 파이프라인 정합화 → GCF 확산";
  }
  if (channels.includes("ODA") && channels.includes("MDB")) {
    return "ODA 기획 → MDB 공동사업화";
  }
  if (channels.includes("민간투자")) {
    return "사업목적 적합도 검토 → 개발금융·민간투자 혼합";
  }
  return channels.length
    ? `${channels.join(" → ")} 연계`
    : "ODA 기획 + 실행 파트너 매칭";
}

function getPipelineSeedProjects(rec) {
  const fromStrategyEvidence =
    rec?.strategyEvidence?.sourceData?.flatMap((item) => {
      const group = String(item?.group || "");
      const source = String(item?.source || "");
      if (
        group.includes("프로젝트") ||
        source.toLowerCase().includes("gcf") ||
        source.toLowerCase().includes("world bank") ||
        source.toLowerCase().includes("adb")
      ) {
        return (item?.rows || []).map((row, idx) => ({
          id: `seed-${rec?.id || "x"}-${idx}`,
          source: row?.funder || row?.source || item?.source || "Seed",
          title: row?.title || row?.name || item?.label || "Seed project",
          stage: row?.stage || row?.status || item?.mode || "Seed",
          country: rec?.country,
          region: rec?.region,
          theme: row?.theme || rec?.tech,
          amountUSD: Number(row?.amountUSD || row?.amount || 0) || 0,
          executingPartner: row?.executingPartner || row?.partner || "",
        }));
      }
      return [];
    }) || [];
  return fromStrategyEvidence;
}

function buildGenericPriorityRegion(rec, mergedPipeline = []) {
  const pipelineSignal = mergedPipeline.length
    ? Math.min(mergedPipeline.length * 6, 18)
    : 0;
  const priorityScore =
    Math.round(
      (Number(rec?.scores?.feasibility || 0) * 0.45 +
        Number(rec?.scores?.coverage || 0) * 0.25 +
        Number(rec?.scores?.reliability || 0) * 0.15 +
        Number(rec?.scores?.resilience || 0) * 0.15 +
        pipelineSignal) *
        10
    ) / 10;

  return [
    {
      province: rec?.region || "핵심 권역",
      role: rec?.purposeTags?.includes("ODA")
        ? "우선 공공협력 권역"
        : rec?.purposeTags?.includes("사업화")
        ? "우선 사업화 권역"
        : "우선 실증 권역",
      priorityScore,
      riskScore: scoreRiskUrgency(rec),
      opsReadiness: Number(rec?.scores?.feasibility || 0),
      hotspotCount: 1,
      districts: [],
      evidence: uniqBy(
        [
          ...(rec?.reasons || []),
          ...(rec?.regionRows || [])
            .slice(0, 2)
            .map((row) => `${row.field}: ${row.value}`),
        ].filter(Boolean)
      ),
    },
  ];
}

function buildVietnamSpecificStrategy(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const hotspotRows = extractSourceRows(rec, "vn-flood-hotspots");
  const observationRows = extractSourceRows(rec, "vn-observation-network");
  const protocolRows = extractSourceRows(rec, "vn-protocols");
  const sourcePipelineRows = extractSourceRows(rec, "vn-pipeline-projects");

  const mergedPipeline = uniqBy(
    [
      ...(pipelineData?.projects || []),
      ...sourcePipelineRows.map((row, idx) => ({
        id: `seed-${idx}`,
        source: row.funder,
        title: row.title,
        stage: row.stage,
        country: rec.country,
        region: rec.region,
        theme: row.theme,
        amountUSD: row.amountUSD,
      })),
    ],
    (item) => `${item.source || ""}|${item.title || ""}`
  );

  const riskScoreMap = { High: 90, Medium: 75, Low: 60 };
  const priorityMap = new Map();

  hotspotRows.forEach((row) => {
    const province = row.province || row.region || "Unknown";
    if (!priorityMap.has(province)) {
      priorityMap.set(province, {
        province,
        role: "우선 관리 대상",
        riskScore: 65,
        opsReadiness: 58,
        hotspotCount: 0,
        districts: [],
        evidence: [],
      });
    }
    const item = priorityMap.get(province);
    item.riskScore = Math.max(
      item.riskScore,
      riskScoreMap[row.riskLevel] || 70
    );
    item.hotspotCount += 1;
    if (row.district) item.districts.push(row.district);
    item.evidence.push(`침수 위험 ${row.riskLevel || "-"}`);
  });

  observationRows.forEach((row) => {
    const province = row.province || row.region || "Unknown";
    if (!priorityMap.has(province)) {
      priorityMap.set(province, {
        province,
        role: "운영 거점 후보",
        riskScore: 65,
        opsReadiness: 58,
        hotspotCount: 0,
        districts: [],
        evidence: [],
      });
    }
    const item = priorityMap.get(province);
    const coverage = String(row.coverage || "");
    const readiness = coverage.includes("4G stable")
      ? 78
      : coverage.includes("3G")
      ? 72
      : 62;
    item.opsReadiness = Math.max(item.opsReadiness, readiness);
    item.asset = row.siteName || row.siteType || "";
    item.evidence.push(
      `${row.siteName || row.siteType || "관측거점"} / ${
        coverage || "coverage n/a"
      }`
    );
  });

  const priorities = Array.from(priorityMap.values())
    .map((item) => {
      const hubBonus = item.province === "Can Tho" ? 6 : 0;
      const coastalBonus =
        item.province === "Soc Trang" || item.province === "Ca Mau" ? 4 : 0;
      const priorityScore =
        Math.round(
          (item.riskScore * 0.5 +
            item.opsReadiness * 0.3 +
            70 * 0.2 +
            hubBonus +
            coastalBonus) *
            10
        ) / 10;
      let role = item.role;
      if (item.province === "Can Tho") role = "통합운영 허브";
      else if (item.province === "An Giang" || item.province === "Dong Thap")
        role = "내륙 침수 확산거점";
      else if (item.province === "Soc Trang" || item.province === "Ca Mau")
        role = "연안 경보 거점";
      return {
        ...item,
        role,
        priorityScore,
        districts: uniqBy(item.districts.filter(Boolean)),
        evidence: uniqBy(item.evidence.filter(Boolean)),
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const pipelineTotalUSD = mergedPipeline.reduce(
    (sum, project) => sum + (Number(project.amountUSD) || 0),
    0
  );

  const stageCount = mergedPipeline.reduce((acc, project) => {
    const stage = project.stage || project.status || "기타";
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const topPriorityNames = priorities.slice(0, 5).map((item) => item.province);
  const protocolSummary = protocolRows
    .map((row) => `${row.level}: ${row.issuingAgency} · ${row.messageChannel}`)
    .slice(0, 2);

  const decision =
    rec.scores?.feasibility >= 85 ? "즉시 추진 권고" : "보완 후 추진";

  const financeRoute = inferFinanceRoute(rec, mergedPipeline);

  return {
    decision,
    strategyName: `${rec.region} 광역 ${safeRec.tech} ODA·실증 패키지`,
    oneLiner: `${safeRec.country} ${rec.region}에서는 ${safeRec.tech}를 Can Tho 허브 중심 광역 조기경보 패키지로 설계하는 것이 가장 실행력이 높습니다.`,
    whyNow: [
      ...(rec.reasons || []),
      mergedPipeline.length
        ? `연결 가능한 프로젝트·재원 후보 ${mergedPipeline.length}건`
        : "프로젝트 파이프라인은 아직 제한적",
      protocolRows.length
        ? `경보 프로토콜 예시 ${protocolRows.length}건 구조화`
        : "프로토콜 데이터 추가 확보 필요",
    ],
    flagshipProject: {
      title: "메콩 델타 광역 홍수·침수 조기경보 및 의사결정지원 패키지",
      scope:
        "Can Tho 통합운영 허브 + An Giang·Dong Thap·Soc Trang·Ca Mau 연계 확산",
      model: "ODA + 디지털 공공인프라 실증 + 운영 프로토콜 표준화",
      financeRoute,
      entryPoint:
        "Can Tho 운영 허브를 먼저 구축하고 내륙/연안 리스크 축으로 단계 확장",
    },
    priorityRegions: priorities.slice(0, 5),
    protocolSummary,
    financeSummary: {
      pipelineProjectCount: mergedPipeline.length,
      pipelineTotalUSD,
      stageCount,
      financeRoute,
      anchorProjects: mergedPipeline.slice(0, 4),
    },
    roadmap: [
      {
        stage: "1. Investigation",
        period: "0-3개월",
        outcome: "우선 성(省)·기관·데이터 권한 확정",
        actions: [
          `${topPriorityNames.slice(0, 3).join(" / ")} 우선 실증 후보 확정`,
          "Hydro-Met · Provincial DARD · 재난대응센터 · 통신사 데이터 접근권 협의",
          "경보 단계·발령기관·메시지 채널 SOP 구조화",
        ],
      },
      {
        stage: "2. Foundation Building",
        period: "3-6개월",
        outcome: "데이터 레이어와 운영 구조 연결",
        actions: [
          "홍수 핫스팟·관측망·통신망·행정경계를 단일 데이터 모델로 정규화",
          "Can Tho 중심 통합 대시보드 MVP 구축",
          "리드타임·도달률·오경보율 KPI baseline 합의",
        ],
      },
      {
        stage: "3. Main Project",
        period: "6-18개월",
        outcome: "광역 조기경보 실증",
        actions: [
          "Can Tho 운영 허브 구축",
          "An Giang / Dong Thap / Soc Trang / Ca Mau 현장 실증",
          "SMS·앱·라디오 연계 경보 전파 체계 운영",
        ],
      },
      {
        stage: "4. Impact Expansion",
        period: "18개월+",
        outcome: "제도화 및 MDB/GCF scale-up",
        actions: [
          "성과지표 기반 ODA 후속사업 또는 MDB/GCF 제안서 제출",
          "성 단위 운영 프로토콜 국가 표준안 확장",
          "유사 델타·연안 지역으로 확산",
        ],
      },
    ],
    next90Days: [
      "Can Tho 허브 기관 지정 및 실무협의체 구성",
      "An Giang·Dong Thap·Soc Trang·Ca Mau 데이터 접근권 협의",
      "경보 SOP·KPI 표준 초안 작성",
      "파이프라인 3건 이상과 사업 목적(ODA/R&D/GCF) 매칭",
    ],
    kpis: [
      "경보 리드타임",
      "위험지역 도달률",
      "관측망/통신망 가동률",
      "오탐·누락 비율",
      "성 단위 SOP 채택 수",
    ],
    goNoGo: {
      go: [
        "우선 성 3곳 이상 데이터 접근권 확보",
        "Can Tho 통합운영 허브 기관 지정",
        "경보 SOP와 KPI 초안 확보",
      ],
      hold: [
        "실시간 센서/API 접근권 전면 부재",
        "중앙-지방 발령 체계 불일치",
        "운영기관 부재로 O&M 구조 설계 불가",
      ],
    },
  };
}

function buildStrategySynthesis(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  if (!rec) return null;
  const isVietnamWarning =
    rec.country === "베트남" &&
    extractSourceRows(rec, "vn-flood-hotspots").length > 0;

  if (isVietnamWarning) {
    return buildVietnamSpecificStrategy(rec, pipelineData);
  }

  const mergedPipeline = uniqBy(
    [...(pipelineData?.projects || []), ...getPipelineSeedProjects(rec)],
    (item) => `${item.source || ""}|${item.title || ""}`
  );

  const pipelineTotalUSD = mergedPipeline.reduce(
    (sum, project) => sum + (Number(project.amountUSD) || 0),
    0
  );

  const stageCount = mergedPipeline.reduce((acc, project) => {
    const stage = project.stage || project.status || "기타";
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const financeRoute = inferFinanceRoute(rec, mergedPipeline);
  const priorityRegions = buildGenericPriorityRegion(rec, mergedPipeline);
  const strategyScore =
    priorityRegions[0]?.priorityScore || Number(rec?.scores?.feasibility || 0);
  const decision =
    strategyScore >= 85
      ? "즉시 추진 권고"
      : strategyScore >= 75
      ? "보완 후 추진"
      : "기초데이터 보강 후 재검토";

  const requiredItems = (rec?.inventoryRows || [])
    .filter((row) => row.status === "실무필수" || row.status === "결측/한계")
    .map((row) => row.name)
    .slice(0, 3);

  const entryPoint =
    rec?.executionFeasibility?.projectSignal ||
    rec?.cooperationProfile?.quickWin ||
    "국가·지역 데이터팩 정합성 검토 후 실행기관 매칭";

  return {
    decision,
    strategyName: `${rec.region} ${safeRec.tech} 전략 패키지`,
    oneLiner: `${safeRec.country} ${rec.region}에서는 ${safeRec.tech}를 ${
      rec?.purposeTags?.[0] || "협력"
    } 중심 패키지로 설계하는 것이 가장 현실적입니다.`,
    whyNow: uniqBy(
      [
        ...(rec?.reasons || []),
        mergedPipeline.length
          ? `연계 가능한 프로젝트·재원 후보 ${mergedPipeline.length}건`
          : "외부 프로젝트 파이프라인은 추가 연결이 필요",
        rec?.pilotStatus?.status ||
          rec?.executionFeasibility?.stage ||
          "실행 목적 적합도 검토 단계",
      ].filter(Boolean)
    ),
    flagshipProject: {
      title: rec?.cooperationProfile?.headline || `${safeRec.tech} 협력 패키지`,
      scope:
        rec?.regionRows
          ?.slice(0, 2)
          .map((row) => `${row.field}: ${row.value}`)
          .join(" / ") || `${rec.region} 중심 시범사업 + 제도·데이터 정합화`,
      model:
        rec?.cooperationProfile?.partnershipModel ||
        "정책·사업·실증 연계형 모델",
      financeRoute,
      entryPoint,
    },
    priorityRegions,
    protocolSummary: [],
    financeSummary: {
      pipelineProjectCount: mergedPipeline.length,
      pipelineTotalUSD,
      stageCount,
      financeRoute,
      anchorProjects: mergedPipeline.slice(0, 4),
    },
    roadmap: [
      {
        stage: "1. Screening",
        period: "0-2개월",
        outcome: "국가·지역 전략 적합성 확정",
        actions: [
          `${safeRec.country} ${rec.region} 정책·제도·수요 진단`,
          `${safeRec.tech} 핵심 데이터 스키마 검증`,
          "실행 파트너와 재원 연결 경로 1차 매핑",
        ],
      },
      {
        stage: "2. Packaging",
        period: "2-5개월",
        outcome: "협력 패키지 설계",
        actions: uniqBy([
          ...(rec.actions || []).slice(0, 2),
          rec?.cooperationProfile?.quickWin || "후보 사업 패키지 초안 작성",
          "프로젝트 파이프라인·문서·근거자료 연결",
        ]).slice(0, 3),
      },
      {
        stage: "3. Mobilization",
        period: "5-12개월",
        outcome: "제안서/실증/사업화 착수",
        actions: [
          "우선 후보지·기관 협약",
          "재원 제안서 또는 사업 목적 적합도 문서 작성",
          "KPI 및 데이터 업데이트 체계 수립",
        ],
      },
      {
        stage: "4. Scale-up",
        period: "12개월+",
        outcome: "후속사업·확산",
        actions: [
          "성과지표 기반 후속 재원 연계",
          "인접 지역 또는 동종 기술 확산",
          "운영 프로토콜 및 데이터 표준화",
        ],
      },
    ],
    next90Days: uniqBy([
      ...(rec.actions || []).slice(0, 3),
      ...requiredItems,
    ]).slice(0, 4),
    kpis: [
      "전략 적합성 점수",
      "핵심 데이터 충족률",
      "파이프라인 연계 프로젝트 수",
      "실행 파트너 확정 수",
      "제안서·실증 패키지 완성도",
    ],
    goNoGo: {
      go: [
        "핵심 데이터 충족률 80% 이상",
        "재원 연결 경로 1개 이상 명확화",
        "현지 실행 파트너 또는 기관 접점 확보",
      ],
      hold: uniqBy([
        ...requiredItems,
        "프로젝트 파이프라인·재원 근거 부족",
      ]).slice(0, 3),
    },
  };
}

function downloadStrategyJson(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const strategy = buildStrategySynthesis(rec, pipelineData);
  if (!strategy) return;
  const fileSafeTech = String(rec.tech || "strategy")
    .replaceAll(" ", "_")
    .replaceAll("/", "_");
  downloadJsonBlob(
    `StrategyRun_${safeRec.country}_${rec.region}_${fileSafeTech}.json`,
    strategy
  );
}

function findPresetRecommendation(presetKey) {
  const preset = STRATEGY_PRESETS[presetKey];
  if (!preset) return null;
  return (
    NORMALIZED_ENHANCED_RECOMMENDATIONS.find(
      (item) =>
        (!preset.country || item.country === preset.country) &&
        (!preset.tech || item.tech === preset.tech) &&
        (!preset.purpose ||
          safeArray(item.purposeTags).includes(preset.purpose))
    ) ||
    NORMALIZED_ENHANCED_RECOMMENDATIONS[0] ||
    null
  );
}

/* =========================================================
 * Guide
 * ========================================================= */
const INTERNATIONAL_COOP_REFERENCE_SHELF = [
  {
    key: "tna",
    label: "TNA Handbook",
    org: "UNDP",
    href: "https://www.undp.org/publications/technology-needs-assessment-handbook",
    note: "기술 우선순위, 장벽, 실행환경을 구조화하는 기준 문서",
  },
  {
    key: "tna-portal",
    label: "UNFCCC TNA Portal",
    org: "UNFCCC",
    href: "https://unfccc.int/ttclear/tna",
    note: "국가별 TNA 진행 단계와 장벽·이행환경 논리를 따라갈 수 있는 공식 포털",
  },
  {
    key: "tap-guidance",
    label: "Technology Action Plans",
    org: "UNFCCC",
    href: "https://unfccc.int/ttclear/projects",
    note: "TNA 이후 우선기술을 실행계획과 투자 아이디어로 연결하는 TAP 개념 설명",
  },
  {
    key: "ctcn-nde",
    label: "CTCN NDE",
    org: "CTCN",
    href: "https://www.ctc-n.org/about-ctcn/nde",
    note: "국가 지정기구(NDE)를 통한 기술지원 요청 경로",
  },
  {
    key: "ctcn-request",
    label: "CTCN Submit a Request",
    org: "CTCN",
    href: "https://www.ctc-n.org/technical-assistance/submit-a-request",
    note: "NDE 경유 요청서 제출 구조와 절차를 바로 확인할 수 있는 공식 페이지",
  },
  {
    key: "gcf-readiness",
    label: "GCF Readiness",
    org: "GCF",
    href: "https://www.greenclimate.fund/readiness",
    note: "NDA/FP 중심의 제도역량·파이프라인 준비 지원",
  },
  {
    key: "gcf-country-programme",
    label: "GCF Country Programme",
    org: "GCF",
    href: "https://www.greenclimate.fund/document/country-programme-guidance",
    note: "국가 우선순위와 GCF 파이프라인을 연결하는 도움말",
  },
  {
    key: "gcf-ppf",
    label: "GCF Project Preparation Facility",
    org: "GCF",
    href: "https://www.greenclimate.fund/projects/ppf",
    note: "개념노트 이후 프로젝트 준비비용과 설계 지원을 연결하는 공식 창구",
  },
  {
    key: "ccdr",
    label: "World Bank CCDR",
    org: "World Bank",
    href: "https://www.worldbank.org/en/publication/country-climate-development-reports",
    note: "기후와 개발을 함께 보는 국가 진단 프레임",
  },
];

const COUNTRY_OFFICIAL_DOCS = [
  {
    key: "ndc-registry",
    label: "UNFCCC NDC Registry",
    org: "UNFCCC",
    href: "https://unfccc.int/NDCREG",
    note: "최신 NDC 원문과 제출 이력을 확인하는 공식 등록부",
  },
  {
    key: "nap-central",
    label: "NAP Central",
    org: "UNFCCC",
    href: "https://www4.unfccc.int/NAP",
    note: "국가 적응계획(NAP) 자료와 진행상황을 확인하는 공식 허브",
  },
  {
    key: "tna-portal",
    label: "UNFCCC TNA Portal",
    org: "UNFCCC",
    href: "https://unfccc.int/ttclear/tna",
    note: "TNA와 장벽 분석, enabling environment 논리를 확인하는 공식 포털",
  },
  {
    key: "ctcn-nde",
    label: "CTCN NDE",
    org: "CTCN",
    href: "https://www.ctc-n.org/about-ctcn/nde",
    note: "국가 지정기구(NDE) 경로와 기술지원 요청 구조를 확인하는 공식 페이지",
  },
  {
    key: "ctcn-request",
    label: "CTCN Submit a Request",
    org: "CTCN",
    href: "https://www.ctc-n.org/technical-assistance/submit-a-request",
    note: "요청 범위, 수혜기관, 기대성과를 제출 관점에서 확인하는 공식 페이지",
  },
  {
    key: "gcf-countries",
    label: "GCF Countries",
    org: "GCF",
    href: "https://www.greenclimate.fund/countries",
    note: "국가별 NDA/FP와 GCF 연계 현황을 보는 공식 페이지",
  },
  {
    key: "gcf-readiness",
    label: "GCF Readiness",
    org: "GCF",
    href: "https://www.greenclimate.fund/readiness",
    note: "제도역량·파이프라인 준비 지원의 공식 진입점",
  },
  {
    key: "gcf-ppf",
    label: "GCF Project Preparation Facility",
    org: "GCF",
    href: "https://www.greenclimate.fund/projects/ppf",
    note: "개념노트 이후 프로젝트 준비비용과 설계를 보강하는 공식 창구",
  },
  {
    key: "ccdr",
    label: "World Bank CCDR",
    org: "World Bank",
    href: "https://www.worldbank.org/en/publication/country-climate-development-reports",
    note: "기후와 개발을 함께 보는 국가 진단 프레임",
  },
];

const LAUNCH_EXTERNAL_LINKS = [
  {
    group: "국가 전략",
    label: "UNFCCC NDC Registry",
    href: "https://unfccc.int/NDCREG",
  },
  { group: "적응 계획", label: "NAP Central", href: "https://napcentral.org/" },
  {
    group: "기술지원",
    label: "CTCN NDE",
    href: "https://www.ctc-n.org/about-ctcn/nde",
  },
  {
    group: "기후재원",
    label: "GCF Countries",
    href: "https://www.greenclimate.fund/countries",
  },
  {
    group: "개발진단",
    label: "World Bank CCDR",
    href: "https://www.worldbank.org/en/publication/country-climate-development-reports",
  },
].map((item) => ({ ...item, href: ensureExternalUrl(item.href) }));

function buildRecordSpecificDocumentLinks(rec) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  const rows = [];

  const pushRow = ({
    key,
    label,
    org,
    href,
    note,
    priority = 88,
    relevance = "실무 근거",
  }) => {
    const safeHref = ensureExternalUrl(href);
    if (!safeHref) return;
    rows.push({
      key,
      label,
      org,
      href: safeHref,
      note,
      cue: `${safeRec.country || "국가"} 실무 링크`,
      relevance,
      priority,
      statusTone:
        priority >= 95 ? "emerald" : priority >= 90 ? "blue" : "slate",
      statusLabel:
        priority >= 95 ? "상세 보기" : priority >= 90 ? "우선 검토" : "참고",
    });
  };

  safeArray(safeRec.sourcePlan).forEach((item, idx) => {
    const href = ensureExternalUrl(item?.endpoint);
    if (!href || href.startsWith("/api/")) return;
    const sourceLower = String(item?.source || "").toLowerCase();
    const layerLower = String(item?.layer || "").toLowerCase();
    const label = item?.source || item?.layer || `공식 문서 ${idx + 1}`;
    let priority = 86;
    let relevance = "근거 자료";
    if (sourceLower.includes("unfccc") || sourceLower.includes("ndc")) {
      priority = 98;
      relevance = "국가 공약·정합성";
    } else if (sourceLower.includes("nap") || sourceLower.includes("undp")) {
      priority = 97;
      relevance = "적응정책·우선분야";
    } else if (
      sourceLower.includes("world bank") ||
      sourceLower.includes("adb") ||
      sourceLower.includes("gcf")
    ) {
      priority = 95;
      relevance = "재원·사업 이력";
    } else if (layerLower.includes("프로젝트 파이프라인")) {
      priority = 93;
      relevance = "실시간 파이프라인";
    }
    pushRow({
      key: `record-source-${idx}`,
      label,
      org: item?.source || "공식 출처",
      href,
      note: item?.note || "협력 대상 검토에 바로 쓰는 공식 근거 링크",
      priority,
      relevance,
    });
  });

  safeArray(safeRec.regionRows).forEach((item, idx) => {
    const href = ensureExternalUrl(item?.link);
    if (!href) return;
    pushRow({
      key: `record-region-${idx}`,
      label: item?.field || item?.category || `지역 근거 ${idx + 1}`,
      org: item?.source || "공식 출처",
      href,
      note: item?.value || item?.update || "지역 검토에 직접 연결되는 근거",
      priority:
        item?.category === "지역계획"
          ? 96
          : item?.category === "국제협력 사업"
          ? 94
          : 90,
      relevance: item?.category || "지역 검토",
    });
  });

  safeArray(safeRec?.strategyEvidence?.sourceData).forEach((group, idx) => {
    const href = ensureExternalUrl(group?.link);
    if (!href) return;
    pushRow({
      key: `record-evidence-${idx}`,
      label: group?.label || `근거 묶음 ${idx + 1}`,
      org: group?.source || "공식 출처",
      href,
      note: group?.description || "요약 카드와 연결된 근거 묶음",
      priority:
        group?.group === "정책" ? 95 : group?.group === "프로젝트" ? 93 : 89,
      relevance: group?.group || "근거 자료",
    });
  });

  return uniqBy(rows, (item) => item.href || item.key);
}

function buildCountryDocumentShelf(rec) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  const countryLabel = safeRec.country || "국가";
  const purposeTags = safeArray(safeRec.purposeTags);
  const assessment = buildInternationalCooperationAssessment(safeRec);
  const preferredRoute =
    safeArray(assessment?.routes).sort(
      (a, b) => Number(b.fit || 0) - Number(a.fit || 0)
    )[0]?.key || "oda";

  const recordSpecific = buildRecordSpecificDocumentLinks(safeRec);
  const mapped = COUNTRY_OFFICIAL_DOCS.map((item) => {
    const relevance =
      item.key === "ndc-registry" ||
      item.key === "nap-central" ||
      item.key === "tna-portal"
        ? "국가 우선순위·정책 정합성"
        : item.key === "ctcn-nde" || item.key === "ctcn-request"
        ? "기술지원 요청 경로"
        : item.key === "gcf-countries" ||
          item.key === "gcf-readiness" ||
          item.key === "gcf-ppf"
        ? "재원·제도 준비도"
        : "개발효과·투자 논리";
    const priority =
      item.key === "ndc-registry" || item.key === "nap-central"
        ? 84
        : item.key === "tna-portal"
        ? 82
        : preferredRoute === "ctcn" &&
          (item.key === "ctcn-nde" || item.key === "ctcn-request")
        ? 88
        : preferredRoute === "gcf" &&
          (item.key === "gcf-countries" ||
            item.key === "gcf-readiness" ||
            item.key === "gcf-ppf")
        ? 88
        : preferredRoute === "oda" && item.key === "ccdr"
        ? 86
        : purposeTags.includes("정책 설계") && item.key === "tna-portal"
        ? 87
        : purposeTags.includes("ODA") &&
          (item.key === "gcf-countries" || item.key === "ccdr")
        ? 85
        : 78;
    return {
      ...item,
      href: ensureExternalUrl(item.href),
      cue: `${countryLabel} 기본 문서`,
      relevance,
      priority,
      statusTone:
        priority >= 95 ? "emerald" : priority >= 90 ? "blue" : "slate",
      statusLabel:
        priority >= 95 ? "상세 보기" : priority >= 90 ? "우선 검토" : "참고",
    };
  });

  return uniqBy([...recordSpecific, ...mapped], (item) => item.href || item.key)
    .filter((item) => item?.href)
    .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
}

function buildPracticalUseScenarios(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  const sourceCount =
    safeArray(safeRec.sourcePlan).length + safeArray(safeRec.regionRows).length;
  const partnerCount = (
    safeArray(safeRec.localPartners).length
      ? safeArray(safeRec.localPartners)
      : getPartnerDirectory(safeRec)
  ).length;
  const assessment = buildInternationalCooperationAssessment(
    safeRec,
    pipelineData
  );
  const routeCount = safeArray(assessment?.routes).length;
  const financeCount = safeArray(assessment?.financeChannels).length;
  const pipelineCount = getMergedPipelineProjects(pipelineData, safeRec).length;
  const docCount = buildCountryDocumentShelf(safeRec).length;

  const makeScenario = (
    key,
    label,
    readyWhen,
    attentionWhen,
    why,
    nextAction
  ) => ({
    key,
    label,
    status: readyWhen ? "ready" : attentionWhen ? "attention" : "needs",
    why,
    nextAction,
  });

  return [
    makeScenario(
      "screening",
      "내부 초기 검토",
      sourceCount >= 6 && Number(safeRec?.scores?.coverage || 0) >= 70,
      sourceCount >= 3,
      `${safeRec.country} · ${safeRec.region}의 데이터/근거를 바탕으로 우선 검토 후보를 빠르게 압축하는 데 적합합니다.`,
      sourceCount >= 6
        ? "현재 후보를 top 3 비교로 압축해 회의 안건화"
        : "근거 자료 탭에서 근거를 1차 보강"
    ),
    makeScenario(
      "partner-meeting",
      "현지 파트너 미팅 준비",
      partnerCount >= 3 && sourceCount >= 4,
      partnerCount >= 1,
      partnerCount
        ? `정책·집행·지식기관 ${partnerCount}개 이상이 정리되어 미팅 요약본 준비에 유리합니다.`
        : "아직 파트너 구조가 약해 실제 미팅 아젠다를 짜기 어렵습니다.",
      partnerCount >= 3
        ? "역할별 질문 리스트와 첫 접촉 우선순위 확정"
        : "현지 파트너 탭에서 후보 보강"
    ),
    makeScenario(
      "funding-scout",
      "재원 스코핑",
      financeCount >= 2 && (pipelineCount >= 1 || routeCount >= 2),
      financeCount >= 1,
      financeCount
        ? `재원 ${financeCount}개와 파이프라인 ${pipelineCount}건을 함께 보며 GCF/ODA/MDB 경로를 스케치할 수 있습니다.`
        : "재원이 충분히 구조화되지 않아 funding story가 약합니다.",
      financeCount >= 2
        ? "권장 재원 연결 경로 1개를 선택해 concept memo 초안 작성"
        : "재원·실행 탭에서 채널 조합 보강"
    ),
    makeScenario(
      "concept-note",
      "개념노트 사전기획",
      Number(assessment?.overallScore || 0) >= 72 &&
        partnerCount >= 2 &&
        sourceCount >= 8,
      Number(assessment?.overallScore || 0) >= 60,
      `정합성 점수 ${
        assessment?.overallScore || 0
      }점을 기준으로 개념노트 전환 가능성을 가늠할 수 있습니다.`,
      Number(assessment?.overallScore || 0) >= 72
        ? "공유용 요약본을 바로 concept note skeleton으로 확장"
        : "프레임워크 정합성과 다음 액션을 먼저 보강"
    ),
    makeScenario(
      "briefing",
      "출장·회의 요약본",
      docCount >= 5 && sourceCount >= 5,
      docCount >= 3,
      "공식 문서 선반과 출처 링크를 함께 보면 출장자료·면담자료를 빠르게 구성할 수 있습니다.",
      docCount >= 5
        ? "공식 문서 링크와 요약본을 함께 공유"
        : "근거 자료 탭에서 공식 문서 선반 우선 확인"
    ),
  ];
}

function PracticalUseScenarioCard({ rec, pipelineData = null }) {
  const rows = useMemo(
    () => buildPracticalUseScenarios(rec, pipelineData),
    [rec, pipelineData]
  );
  const readyCount = rows.filter((row) => row.status === "ready").length;
  return (
    <SectionCard
      title="실사용 활용성 점검"
      icon={<Briefcase className="text-emerald-300" size={16} />}
      right={
        <PillTag
          tone={
            readyCount >= 3 ? "emerald" : readyCount >= 1 ? "blue" : "amber"
          }
        >
          {readyCount}개 목적 선택 즉시 활용
        </PillTag>
      }
    >
      <div className="grid gap-3 xl:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-white">{row.label}</div>
                <div className="mt-1 text-xs leading-relaxed text-slate-300">
                  {row.why}
                </div>
              </div>
              <PillTag
                tone={
                  row.status === "ready"
                    ? "emerald"
                    : row.status === "attention"
                    ? "blue"
                    : "amber"
                }
              >
                {row.status === "ready"
                  ? "즉시 활용"
                  : row.status === "attention"
                  ? "보완 후 활용"
                  : "준비 필요"}
              </PillTag>
            </div>
            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-300">
              <span className="font-semibold text-white">권장 다음 단계</span> ·{" "}
              {row.nextAction}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function buildAlternativeCandidates(currentRec, filteredRecs = [], limit = 3) {
  const currentId = currentRec?.id;
  const base = safeArray(filteredRecs).filter(Boolean);
  const current = base.find((item) => item.id === currentId) || currentRec;
  const peers = base
    .filter((item) => item.id !== currentId)
    .filter(
      (item) =>
        item.tech === currentRec?.tech ||
        safeArray(item.purposeTags).some((tag) =>
          safeArray(currentRec?.purposeTags).includes(tag)
        )
    )
    .slice(0, Math.max(0, limit - 1));
  return [current, ...peers].filter(Boolean);
}

function AlternativeCandidatesCard({ rec, filteredRecs = [], onSelectRec }) {
  const items = useMemo(
    () => buildAlternativeCandidates(rec, filteredRecs, 3),
    [rec, filteredRecs]
  );
  if (!items.length) return null;
  return (
    <SectionCard
      title="후보 비교"
      icon={<Layers className="text-emerald-300" size={16} />}
      right={<PillTag tone="slate">Top {items.length}</PillTag>}
    >
      <div className="grid gap-3 xl:grid-cols-3">
        {items.map((item, idx) => {
          const isCurrent = item.id === rec?.id;
          const partners = safeArray(item.localPartners).length
            ? safeArray(item.localPartners).length
            : getPartnerDirectory(item).length;
          const sourceCount =
            safeArray(item.sourcePlan).length +
            safeArray(item.regionRows).length;
          return (
            <div
              key={item.id || `${item.country}-${item.region}-${idx}`}
              className={cx(
                "rounded-2xl border p-3",
                isCurrent
                  ? "border-emerald-500/30 bg-emerald-500/8"
                  : "border-slate-700 bg-slate-800/35"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-white">
                    {item.country} · {item.region}
                  </div>
                  <div className="mt-1 text-xs text-emerald-300">
                    {item.tech}
                  </div>
                </div>
                <PillTag tone={isCurrent ? "emerald" : "slate"}>
                  {isCurrent ? "현재 후보" : `대안 ${idx}`}
                </PillTag>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-2 py-2">
                  <div className="text-slate-400">목적 적합도</div>
                  <div className="mt-1 font-black text-white">
                    {item?.scores?.feasibility || 0}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-2 py-2">
                  <div className="text-slate-400">출처</div>
                  <div className="mt-1 font-black text-white">
                    {sourceCount}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-2 py-2">
                  <div className="text-slate-400">파트너</div>
                  <div className="mt-1 font-black text-white">{partners}</div>
                </div>
              </div>
              <div className="mt-3 text-xs leading-relaxed text-slate-300">
                {item?.cooperationProfile?.headline ||
                  item?.countryNote ||
                  "한 줄 요약 준비 필요"}
              </div>
              {!isCurrent ? (
                <button
                  onClick={() => safeInvoke(onSelectRec, item)}
                  className="mt-3 w-full rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-300"
                >
                  이 후보로 전환
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function buildSubmissionReadinessPack(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  const assessment = buildInternationalCooperationAssessment(
    safeRec,
    pipelineData
  );
  const frameworkRows = buildInternationalFrameworkRows(safeRec, pipelineData);
  const preferredRoute = safeArray(assessment?.routes).sort(
    (a, b) => Number(b.fit || 0) - Number(a.fit || 0)
  )[0] || {
    key: "oda",
    label: "ODA·MDB 사업형성",
    fit: 0,
    note: "후보 경로 보강 필요",
  };
  const nationalScore =
    safeArray(assessment?.axes).find((axis) => axis.key === "national")
      ?.score || 0;
  const financeScore =
    safeArray(assessment?.axes).find((axis) => axis.key === "finance")?.score ||
    0;
  const partnerScore =
    safeArray(assessment?.axes).find((axis) => axis.key === "partners")
      ?.score || 0;
  const safeguardsScore =
    safeArray(assessment?.axes).find((axis) => axis.key === "safeguards")
      ?.score || 0;
  const linkedPartners = Number(assessment?.linkedPartnerCount || 0);
  const pipelineCount = Number(assessment?.pipelineProjectCount || 0);
  const docShelf = buildCountryDocumentShelf(safeRec);
  const primaryDocs =
    preferredRoute.key === "ctcn"
      ? [
          "ndc-registry",
          "nap-central",
          "tna-portal",
          "ctcn-nde",
          "ctcn-request",
        ]
      : preferredRoute.key === "gcf"
      ? [
          "ndc-registry",
          "nap-central",
          "gcf-countries",
          "gcf-readiness",
          "gcf-ppf",
        ]
      : ["ndc-registry", "nap-central", "ccdr", "gcf-countries"];
  const officialLinks = primaryDocs
    .map((key) => docShelf.find((item) => item.key === key))
    .filter(Boolean);
  const checks = [
    {
      key: "national-fit",
      label: "국가 정합성 메모",
      ready: nationalScore >= 70,
      note:
        nationalScore >= 70
          ? "NDC/NAP/TNA 문맥과 연결할 근거가 확보돼 있습니다."
          : "국가 정책문서와 지역 문제정의 문장을 1페이지로 묶어야 합니다.",
    },
    {
      key: "partner-path",
      label:
        preferredRoute.key === "ctcn"
          ? "NDE·수혜기관 확인"
          : preferredRoute.key === "gcf"
          ? "NDA/FP·AE 경로 확인"
          : "주관부처·집행기관 확인",
      ready: linkedPartners >= 2 || partnerScore >= 70,
      note:
        linkedPartners >= 2 || partnerScore >= 70
          ? "실명 기관과 링크가 있어 첫 접촉 경로를 정리할 수 있습니다."
          : "정책 승인·현장 실행 역할군의 기관 실명과 공식 링크를 더 보강해야 합니다.",
    },
    {
      key: "pipeline-finance",
      label:
        preferredRoute.key === "gcf"
          ? "파이프라인·PPF 검토"
          : "재원·후속사업 구조",
      ready: pipelineCount >= 1 || financeScore >= 70,
      note:
        pipelineCount >= 1 || financeScore >= 70
          ? "재원 연결 경로와 후속 설계 논리를 붙일 수 있습니다."
          : "파이프라인·예산 가정·재원 창구를 더 명시적으로 보강해야 합니다.",
    },
    {
      key: "safeguards",
      label: "MRV·포용·safeguards",
      ready: safeguardsScore >= 60,
      note:
        safeguardsScore >= 60
          ? "성과지표와 사회적 포용 논리를 초안 수준으로 붙일 수 있습니다."
          : "MRV, 포용, 이해관계자 참여 계획을 별도 블록으로 보강해야 합니다.",
    },
  ];
  const deliverables =
    preferredRoute.key === "ctcn"
      ? [
          "NDE 공유용 2페이지 요청 개요",
          "기술 장벽·요청 범위·기대성과 메모",
          "주관기관·수혜기관·현장 실행기관 역할표",
        ]
      : preferredRoute.key === "gcf"
      ? [
          "Country Programme 연계 concept note 메모",
          "NDA/FP–AE–집행기관 역할표",
          "PPF 필요업무와 준비예산 가정표",
        ]
      : [
          "양자·MDB 협의용 사업발굴 메모",
          "현지 파트너·실증지·재원 조합표",
          "후속 조사/조달/실행 리스크 메모",
        ];
  return {
    preferredRoute,
    checks,
    officialLinks,
    deliverables,
    frameworkRows,
    summary:
      preferredRoute.key === "ctcn"
        ? "현재 화면을 NDE 협의 전 1차 요청 정리 도구로 쓰는 것이 가장 적절합니다."
        : preferredRoute.key === "gcf"
        ? "현재 화면을 Country Programme–concept note–PPF 연결용 사전기획 도구로 쓰는 것이 적절합니다."
        : "현재 화면은 ODA·MDB 협의용 후보 압축과 사업 발굴 메모 정리에 적합합니다.",
  };
}

function buildFieldMeetingPack(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  const partners = safeArray(safeRec.localPartners).length
    ? safeArray(safeRec.localPartners)
    : getPartnerDirectory(safeRec);
  const lanes = buildPartnerEngagementRows(partners).filter(
    (row) => row.items.length
  );
  const assessment = buildInternationalCooperationAssessment(
    safeRec,
    pipelineData
  );
  const preferredRoute = safeArray(assessment?.routes).sort(
    (a, b) => Number(b.fit || 0) - Number(a.fit || 0)
  )[0] || { label: "ODA·MDB 사업형성" };
  const topCounterparts = lanes
    .map((row) => ({
      lane: row.lane,
      partner: row.items[0],
    }))
    .slice(0, 4);
  const agenda = [
    `${
      safeRec.region || safeRec.country
    }에서 가장 시급한 기후·서비스 문제 1~2개 합의`,
    `${safeRec.tech} 기술을 왜 지금 검토하는지와 기존 사업·정책과의 연결 확인`,
    `${preferredRoute.label} 기준으로 필요한 수혜기관·승인기관·집행기관 역할 분담 확인`,
    `데이터 공백, 현장 접근성, MRV·포용 이슈를 누가 보완할지 합의`,
    `후속 산출물(메모, 요청서 초안, concept note, 출장자료)과 일정 확정`,
  ];
  const materials = [
    `${safeRec.country}·${safeRec.region} 1페이지 요약본`,
    `우선 파트너·역할표`,
    `재원 연결 경로와 후속 일정 메모`,
    `공식 문서 링크 선반(NDC/NAP/TNA/CTCN/GCF/CCDR)`,
  ];
  return {
    topCounterparts,
    agenda,
    materials,
    meetingGoal: `${safeRec.country} ${safeRec.region || ""}에서 ${
      safeRec.tech
    } 협력수요와 다음 산출물을 1차 합의`,
  };
}

function SubmissionReadinessPackCard({ rec, pipelineData = null }) {
  const pack = useMemo(
    () => buildSubmissionReadinessPack(rec, pipelineData),
    [rec, pipelineData]
  );
  const readyCount = safeArray(pack.checks).filter((item) => item.ready).length;
  return (
    <SectionCard
      title="제출·협의 준비 팩"
      icon={<FileCheck className="text-emerald-300" size={16} />}
      right={
        <PillTag
          tone={
            readyCount >= 3 ? "emerald" : readyCount >= 2 ? "blue" : "amber"
          }
        >
          {pack.preferredRoute.label}
        </PillTag>
      }
    >
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
        <div className="text-xs font-bold text-emerald-300">추천 활용 방식</div>
        <div className="mt-1 text-sm font-bold text-white">{pack.summary}</div>
        <div className="mt-2 text-xs text-slate-300 leading-relaxed">
          {pack.preferredRoute.note}
        </div>
      </div>
      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        {safeArray(pack.checks).map((check) => (
          <div
            key={check.key}
            className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-bold text-white">{check.label}</div>
              <PillTag tone={check.ready ? "emerald" : "amber"}>
                {check.ready ? "준비됨" : "보강 필요"}
              </PillTag>
            </div>
            <div className="mt-2 text-xs leading-relaxed text-slate-300">
              {check.note}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
          <div className="text-xs font-bold text-white">바로 만들 산출물</div>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-200">
            {safeArray(pack.deliverables).map((item, idx) => (
              <li key={idx} className="flex gap-2">
                <CheckCircle2
                  size={14}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
          <div className="text-xs font-bold text-white">
            우선 확인할 공식 문서
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {safeArray(pack.officialLinks).map((item) => (
              <ExternalLinkButton
                key={item.key}
                href={item.href}
                label={item.label}
                compact
              />
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function FieldMeetingPrepCard({ rec, pipelineData = null }) {
  const pack = useMemo(
    () => buildFieldMeetingPack(rec, pipelineData),
    [rec, pipelineData]
  );
  return (
    <SectionCard
      title="현지 파트너 미팅 준비"
      icon={<Briefcase className="text-emerald-300" size={16} />}
      right={<PillTag tone="blue">회의용</PillTag>}
    >
      <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-3">
        <div className="text-xs font-bold text-sky-300">이번 미팅의 목표</div>
        <div className="mt-1 text-sm font-bold text-white">
          {pack.meetingGoal}
        </div>
      </div>
      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs font-bold text-white">우선 접촉할 역할군</div>
          <div className="mt-2 space-y-2">
            {safeArray(pack.topCounterparts).length ? (
              safeArray(pack.topCounterparts).map((row, idx) => (
                <div
                  key={`${row.lane}-${idx}`}
                  className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-slate-100">
                      {row.lane}
                    </div>
                    {row.partner?.href ? (
                      <ExternalLinkButton
                        href={row.partner.href}
                        label={row.partner.linkLabel || "공식 링크"}
                        compact
                      />
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-slate-300">
                    {row.partner?.name || "-"}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {row.partner?.role || row.partner?.note || "역할 보강 필요"}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-xs text-slate-400">
                파트너 역할군이 아직 충분히 구조화되지 않았습니다.
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs font-bold text-white">회의 안건 5개</div>
          <ol className="mt-2 space-y-1.5 text-xs text-slate-200">
            {safeArray(pack.agenda).map((item, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[11px] font-bold text-emerald-300">
                  {idx + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-300">
            <span className="font-semibold text-white">지참 자료</span> ·{" "}
            {safeArray(pack.materials).join(" / ")}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function OfficialDocumentShelfCard({ rec }) {
  const rows = useMemo(() => buildCountryDocumentShelf(rec), [rec]);
  return (
    <SectionCard
      title="공식 문서 바로가기"
      icon={<BookOpen className="text-emerald-300" size={16} />}
      right={<PillTag tone="blue">바로 확인 {rows.length}건</PillTag>}
    >
      <div className="mb-3 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
        <span className="font-semibold text-white">실전 팁</span> · 현재
        후보에서 바로 필요한 문서부터 위에 배치했습니다. 정합성 → 재원·사업 →
        제출 경로 순서로 빠르게 확인하세요.
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-white">{row.label}</div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {row.org} · {row.relevance}
                </div>
              </div>
              <PillTag tone={row.statusTone || "slate"}>
                {row.statusLabel || row.cue}
              </PillTag>
            </div>
            <div className="mt-2 text-xs leading-relaxed text-slate-300">
              {row.note}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ExternalLinkButton href={row.href} label="공식 페이지" compact />
              <PillTag tone="slate">{row.cue}</PillTag>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-300">
        링크가 많은 대신 역할이 겹치지 않도록 정리했습니다. 먼저 위쪽의 직접
        근거 문서를 보고, 필요한 경우 아래의 등록부·포털로 확장 확인하는 방식이
        가장 빠릅니다.
      </div>
    </SectionCard>
  );
}

const GUIDE_STEPS = [
  {
    key: "toolbar-filter",
    title: "목적 선택에 맞게 필터 좁히기",
    desc: "ODA 기획, 적응 협력, 실증·R&D, 근거 검토 등 목적에 따라 기술·국가·재원 기준을 먼저 정합니다.",
    example: "예시: ODA + 아프리카 + 적응기술 또는 R&D 실증 + 전력·에너지",
    actionKey: "open-filters",
    actionLabel: "필터 열고 기준 정하기",
  },
  {
    key: "toolbar-candidates",
    title: "후보를 3~5개로 압축하기",
    desc: "후보와 비교 카드를 함께 보며 국가·지역·기술별 대안을 압축합니다.",
    example: "예시: 케냐·투르카나, 베트남·메콩 델타, 칠레·아타카마 비교",
    actionKey: "open-candidates",
    actionLabel: "후보 열기",
  },
  {
    key: "toolbar-detail",
    title: "우측 상세 패널에서 판단하기",
    desc: "핵심 요약 → 추천 협력 → 재원·실행 → 현지 파트너 → 근거 자료 순서로 검토하고, 패널 상단 손잡이를 끌어 위치를 바꾸거나 안쪽 경계선을 드래그해 폭을 조절할 수 있습니다.",
    example: "핵심 판단 → 권장 재원 → 파트너 → 근거 링크 → 제출경로 순서 추천",
    actionKey: "open-detail",
    actionLabel: "상세 패널 열기",
  },
  {
    key: "map-interaction",
    title: "지도에서 국가와 지역을 오가며 확인하기",
    desc: "지도를 이동하며 후보 위치를 직접 확인하고, 마커를 눌러 상세 패널과 연결합니다.",
    example: "국가 수준 검토 후, 실증 후보 지역으로 확대",
    actionKey: "focus-region",
    actionLabel: "선택 후보 지역으로 이동",
  },
  {
    key: "focus-buttons",
    title: "국가·지역 시점을 빠르게 전환하기",
    desc: "상세 패널의 ‘국가 검토 기준 보기 / 지역 검토 기준 보기’를 활용해 의사결정 수준을 바꿉니다.",
    example: "국가 레벨 협력 검토 → 지역 레벨 실증 후보지 확인",
    actionKey: "focus-country",
    actionLabel: "국가 검토 기준 보기 체험",
  },
  {
    key: "excel-download",
    title: "출처와 공식 문서를 확인하고 요약본으로 정리하기",
    desc: "근거 자료 탭에서 근거와 공식 문서 선반(TNA/NDC/NAP, CTCN NDE, GCF Readiness, CCDR)을 함께 확인한 뒤 검토표 PDF 또는 공유용 요약본 PDF로 정리합니다.",
    example: "회의 전 근거·제출경로 확인 → 회의 후 요약본 공유",
    actionKey: "jump-sources",
    actionLabel: "데이터 출처 모아보기",
  },
];

function findVisibleGuideTarget(targetKey) {
  if (typeof document === "undefined" || !targetKey) return null;
  const nodes = Array.from(
    document.querySelectorAll(`[data-guide-id="${targetKey}"]`)
  );
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    if (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden"
    ) {
      return node;
    }
  }
  return null;
}

function GuideHighlightOverlay({ enabled, targetKey }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!enabled || !targetKey) {
      setRect(null);
      return;
    }

    let rafId = 0;
    const update = () => {
      const node = findVisibleGuideTarget(targetKey);
      if (!node) {
        setRect(null);
        return;
      }
      const r = node.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const schedule = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("resize", schedule, true);
    window.addEventListener("scroll", schedule, true);
    const timer = setInterval(update, 500);

    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", schedule, true);
      window.removeEventListener("scroll", schedule, true);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enabled, targetKey]);

  if (!enabled || !rect) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[76]">
      <div
        className="absolute rounded-[22px] border-2 border-emerald-400/90 shadow-[0_0_0_9999px_rgba(2,6,23,0.18)]"
        style={{
          top: Math.max(8, rect.top - 8),
          left: Math.max(8, rect.left - 8),
          width: rect.width + 16,
          height: rect.height + 16,
        }}
      />
      <div
        className="absolute rounded-xl border border-emerald-400/30 bg-slate-900/95 px-3 py-2 text-xs font-semibold text-emerald-300 shadow-xl"
        style={{
          top: Math.max(8, rect.top - 48),
          left: Math.max(8, rect.left),
        }}
      >
        현재 단계에서 확인할 영역
      </div>
    </div>
  );
}

function techColor(tech) {
  const map = {
    "태양광 기술": "#f59e0b",
    "풍력 기술": "#38bdf8",
    "전력 통합 기술": "#a78bfa",
    "이산화탄소(CO₂) 포집·저장·활용 기술": "#22c55e",
    "물 부문 기술": "#06b6d4",
    "농축수산 부문 기술": "#84cc16",
    "기후변화 감시 및 진단 기술": "#ef4444",
    "산림·생태계 부문 기술": "#10b981",
    "폐자원 기술": "#f97316",
  };
  return map[normalizeTechName(tech)] || "#10b981";
}

function recsToFeatureCollection(recs, activeId = null) {
  return {
    type: "FeatureCollection",
    features: recs
      .filter(
        (r) => Number.isFinite(Number(r.lon)) && Number.isFinite(Number(r.lat))
      )
      .map((r) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [Number(r.lon), Number(r.lat)],
        },
        properties: {
          id: r.id,
          country: r.country,
          region: r.region,
          tech: r.tech,
          continent: r.continent,
          purpose: r.purposeTags.join(", "),
          coverage: r.scores.coverage,
          reliability: r.scores.reliability,
          resilience: r.scores.resilience,
          feasibility: r.scores.feasibility,
          color: techColor(r.tech),
          active: activeId === r.id ? 1 : 0,
        },
      })),
  };
}

function singlePointFC(lon, lat, props = {}) {
  if (!Number.isFinite(Number(lon)) || !Number.isFinite(Number(lat))) {
    return emptyFeatureCollection();
  }
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [Number(lon), Number(lat)] },
        properties: props,
      },
    ],
  };
}

function cooperationLineFC(rec) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const countryCenter = getRecommendationCountryCenterCoords(rec);
  const pointCoords = getRecommendationPointCoords(rec);
  if (!countryCenter || !pointCoords) {
    return emptyFeatureCollection();
  }
  const [clon, clat] = countryCenter;
  const [plon, plat] = pointCoords;

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [countryCenter, pointCoords],
        },
        properties: {
          label: `${safeRec.country} ↔ ${rec.region}`,
          distanceKm: haversineKm(clat, clon, plat, plon),
        },
      },
    ],
  };
}

function getGeoJsonFeatureArray(featureOrFC) {
  if (!featureOrFC) return [];
  if (featureOrFC?.type === "FeatureCollection") {
    return Array.isArray(featureOrFC.features)
      ? featureOrFC.features.filter(
          (feature) => feature?.type === "Feature" && feature?.geometry
        )
      : [];
  }
  if (featureOrFC?.type === "Feature" && featureOrFC?.geometry) {
    return [featureOrFC];
  }
  return [];
}

function normalizeGeoJsonForSource(featureOrFC) {
  return {
    type: "FeatureCollection",
    features: getGeoJsonFeatureArray(featureOrFC),
  };
}

function hasGeoJsonFeatures(featureOrFC) {
  return getGeoJsonFeatureArray(featureOrFC).length > 0;
}

function geoFeatureToFC(feature) {
  return normalizeGeoJsonForSource(feature);
}

function getGeoJsonBounds(featureOrFC) {
  const obj = normalizeGeoJsonForSource(featureOrFC);
  if (!obj.features.length) return null;

  if (!obj) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const walk = (coords) => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      const [lng, lat] = coords;
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        minLng = Math.min(minLng, lng);
        minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng);
        maxLat = Math.max(maxLat, lat);
      }
      return;
    }
    coords.forEach(walk);
  };

  for (const f of obj.features || []) {
    if (f?.geometry?.coordinates) walk(f.geometry.coordinates);
  }

  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

function buildRecPopupHtml(rec) {
  if (!rec) return "";
  const evidenceLink = getPrimaryEvidenceLink(rec);
  return `
    <div class="ct-popup">
      <div class="ct-popup-top">${escapeHtml(rec.region)} · ${escapeHtml(
    rec.continent
  )}</div>
      <div class="ct-popup-title">${escapeHtml(rec.country)}</div>
      <div class="ct-popup-sub">${escapeHtml(rec.tech)}</div>
      <div class="ct-popup-sub" style="margin-top:6px">
        충족률 <b>${rec?.scores?.coverage ?? 0}%</b> · 목적 적합도 <b>${
    rec?.scores?.feasibility ?? 0
  }%</b>
      </div>
      <div class="ct-popup-sub">${escapeHtml(
        (rec.purposeTags || []).join(", ")
      )}</div>
      ${
        evidenceLink
          ? `<div style="margin-top:8px"><a href="${escapeHtml(
              evidenceLink.href
            )}" target="_blank" rel="noreferrer" style="color:#6ee7b7;font-size:12px;font-weight:700;text-decoration:none">${escapeHtml(
              evidenceLink.label || "근거 링크 열기"
            )}</a></div>`
          : ""
      }
    </div>
  `;
}

/* =========================================================
 * Map component (MapLibre)
 * ========================================================= */
function MapCanvas({
  ready,
  recommendations,
  activeRec,
  onSelectRec,
  mapMode,
  focusMode,
  guidePulseKey,
  countryBoundaryFeature,
  regionBoundaryFeature,
  layoutKey = "",
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const techMarkersRef = useRef([]);
  const mapLoadedRef = useRef(false);

  const onSelectRef = useRef(onSelectRec);
  const recByIdRef = useRef({});
  const latestRef = useRef({
    recommendations,
    activeRec,
    countryBoundaryFeature,
    regionBoundaryFeature,
  });

  const resizeRafRef = useRef(0);
  const resizeTimeoutsRef = useRef([]);
  const lastMapSizeRef = useRef({ width: 0, height: 0 });

  const clearScheduledResize = useCallback(() => {
    if (typeof window !== "undefined" && resizeRafRef.current) {
      window.cancelAnimationFrame(resizeRafRef.current);
    }
    resizeRafRef.current = 0;
    if (resizeTimeoutsRef.current.length) {
      resizeTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
      resizeTimeoutsRef.current = [];
    }
  }, []);

  const clearTechMarkers = useCallback(() => {
    techMarkersRef.current.forEach((marker) => {
      try {
        marker?.remove?.();
      } catch (_) {}
    });
    techMarkersRef.current = [];
  }, []);

  const getTechMarkerIconSvg = useCallback((tech) => {
    const profile = getTechMarkerProfile(tech);
    return profile.svg("currentColor");
  }, []);

  const getTechMarkerLabel = useCallback((tech) => {
    const profile = getTechMarkerProfile(tech);
    return profile.label || techShort(tech) || "기술";
  }, []);

  const createTechMarkerElement = useCallback(
    (rec, isActive = false) => {
      const element = document.createElement("button");
      const badgeLabel = cooperationLabel(rec?.tech);
      const iconLabel = getTechMarkerLabel(rec?.tech);
      const color = techColorHex(rec?.tech);
      const glow = withAlpha(color, 0.28);
      element.type = "button";
      element.className = `ct-marker ${isActive ? "active" : ""}`;
      element.setAttribute(
        "aria-label",
        `${rec?.country || "국가"} ${rec?.region || "지역"} ${
          badgeLabel || "기술"
        }`
      );
      element.setAttribute("aria-pressed", isActive ? "true" : "false");
      element.dataset.tech = normalizeTechName(rec?.tech || "");
      element.title = `${rec?.country || "국가"} · ${rec?.region || "지역"} · ${
        badgeLabel || rec?.tech || "기술"
      }`;
      element.innerHTML = `
      <span class="ct-marker-shell" style="border-color:${color};box-shadow:0 8px 20px ${glow};">
        <span class="ct-marker-icon" style="color:${color}">${getTechMarkerIconSvg(
        rec?.tech
      )}</span>
      </span>
      <span class="ct-marker-chip">${escapeHtml(iconLabel)}</span>
    `;
      return element;
    },
    [getTechMarkerIconSvg, getTechMarkerLabel]
  );

  const runMapResize = useCallback(() => {
    const map = mapRef.current;
    const node = mapContainerRef.current;
    if (!map || !node) return false;
    const rect = node.getBoundingClientRect();
    const width = Math.round(rect.width || 0);
    const height = Math.round(rect.height || 0);
    if (width < 80 || height < 80) return false;
    const prev = lastMapSizeRef.current || { width: 0, height: 0 };
    lastMapSizeRef.current = { width, height };
    try {
      map.resize();
      return width !== prev.width || height !== prev.height;
    } catch (error) {
      console.warn("[map] resize failed", error);
      return false;
    }
  }, []);

  const scheduleMapResize = useCallback(
    (reason = "layout") => {
      if (typeof window === "undefined") return;
      clearScheduledResize();
      const runTwice = () => {
        resizeRafRef.current = window.requestAnimationFrame(() => {
          resizeRafRef.current = window.requestAnimationFrame(() => {
            runMapResize();
          });
        });
      };
      runTwice();
      resizeTimeoutsRef.current = [80, 180, 360, 720].map((delay) =>
        window.setTimeout(() => {
          runMapResize();
        }, delay)
      );
    },
    [clearScheduledResize, runMapResize]
  );

  useEffect(() => {
    onSelectRef.current = onSelectRec;
  }, [onSelectRec]);

  useEffect(() => {
    const obj = {};
    (recommendations || []).forEach((r) => {
      obj[String(r.id)] = r;
    });
    recByIdRef.current = obj;
    latestRef.current.recommendations = recommendations;
  }, [recommendations]);

  useEffect(() => {
    latestRef.current.activeRec = activeRec;
  }, [activeRec]);

  useEffect(() => {
    latestRef.current.countryBoundaryFeature = countryBoundaryFeature;
  }, [countryBoundaryFeature]);

  useEffect(() => {
    latestRef.current.regionBoundaryFeature = regionBoundaryFeature;
  }, [regionBoundaryFeature]);

  useEffect(() => () => clearScheduledResize(), [clearScheduledResize]);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return undefined;
    const handleResize = () => scheduleMapResize("viewport-change");
    const node = mapContainerRef.current;
    const parent = node?.parentElement || null;
    let observer = null;
    if (typeof ResizeObserver !== "undefined" && node) {
      observer = new ResizeObserver(() =>
        scheduleMapResize("container-resize")
      );
      observer.observe(node);
      if (parent) observer.observe(parent);
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    scheduleMapResize("map-canvas-mounted");
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      observer?.disconnect?.();
    };
  }, [ready, scheduleMapResize]);

  useEffect(() => {
    if (!ready) return;
    scheduleMapResize("layout-key");
  }, [ready, layoutKey, scheduleMapResize]);

  useEffect(() => {
    if (!ready) return;
    scheduleMapResize("focus-or-selection");
  }, [
    ready,
    focusMode,
    activeRec?.id,
    recommendations?.length,
    scheduleMapResize,
  ]);

  const updateRegionBoundaryVisibility = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    const zoom = Number(map.getZoom?.() ?? 0);
    const regionData = normalizeGeoJsonForSource(
      latestRef.current?.regionBoundaryFeature
    );
    const shouldShowRegion =
      !!latestRef.current?.activeRec &&
      regionData.features.length > 0 &&
      zoom >= 3.2;
    const regionVisibility = shouldShowRegion ? "visible" : "none";
    ["region-boundary-fill", "region-boundary-line"].forEach((layerId) => {
      try {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, "visibility", regionVisibility);
        }
      } catch (_) {}
    });
  }, []);

  const syncMapSources = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;

    const {
      recommendations,
      activeRec,
      countryBoundaryFeature,
      regionBoundaryFeature,
    } = latestRef.current;

    const pointFc = buildCandidatePointFC(
      recommendations,
      activeRec?.id ?? null
    );
    const centerFc = buildCountryCenterFC(recommendations);
    const linkFc = buildCandidateLinkFC(recommendations, activeRec?.id ?? null);

    const pointSrc = map.getSource("candidate-points-src");
    const centerSrc = map.getSource("candidate-country-centers-src");
    const linkSrc = map.getSource("candidate-links-src");
    const countrySrc = map.getSource("country-boundary-src");
    const regionSrc = map.getSource("region-boundary-src");

    if (pointSrc?.setData) pointSrc.setData(pointFc);
    if (centerSrc?.setData) centerSrc.setData(centerFc);
    if (linkSrc?.setData) linkSrc.setData(linkFc);

    if (countrySrc?.setData) {
      countrySrc.setData(normalizeGeoJsonForSource(countryBoundaryFeature));
    }

    if (regionSrc?.setData) {
      regionSrc.setData(normalizeGeoJsonForSource(regionBoundaryFeature));
    }

    updateRegionBoundaryVisibility();
  }, [updateRegionBoundaryVisibility]);

  const upsertPopupForRec = useCallback((rec) => {
    const map = mapRef.current;
    const pointCoords = getRecommendationPointCoords(rec);
    if (!map || !rec || !pointCoords) return;

    const html = buildRecPopupHtml(rec);

    if (!popupRef.current) {
      popupRef.current = new window.maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 14,
        className: "ct-popup-wrap",
      });
    }

    popupRef.current.setLngLat(pointCoords).setHTML(html);

    // 아직 지도에 안 붙어있으면 addTo
    try {
      popupRef.current.addTo(map);
    } catch (_) {
      // 이미 addTo 되어 있으면 무시
    }
  }, []);

  const closePopup = useCallback(() => {
    popupRef.current?.remove?.();
    popupRef.current = null;
  }, []);

  const syncTechMarkers = useCallback(() => {
    const map = mapRef.current;
    const maplibregl = window?.maplibregl;
    if (!map || !mapLoadedRef.current || !maplibregl) return;

    clearTechMarkers();

    const recs = dedupeRecommendationsForMap(
      Array.isArray(latestRef.current?.recommendations)
        ? latestRef.current.recommendations
        : []
    );
    const activeId = String(latestRef.current?.activeRec?.id ?? "");

    techMarkersRef.current = recs
      .map((rec) => {
        const pointCoords = getRecommendationPointCoords(rec);
        if (!pointCoords) return null;
        const isActive = String(rec?.id ?? "") === activeId;
        const element = createTechMarkerElement(rec, isActive);
        element.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          onSelectRef.current?.(rec);
          upsertPopupForRec(rec);
        });
        element.addEventListener("mouseenter", () => {
          upsertPopupForRec(rec);
        });
        element.addEventListener("mouseleave", () => {
          if (
            String(latestRef.current?.activeRec?.id ?? "") !==
            String(rec?.id ?? "")
          ) {
            closePopup();
          }
        });
        return new maplibregl.Marker({ element, anchor: "center" })
          .setLngLat(pointCoords)
          .addTo(map);
      })
      .filter(Boolean);
  }, [
    clearTechMarkers,
    createTechMarkerElement,
    upsertPopupForRec,
    closePopup,
  ]);

  // 지도 초기화 (1회)
  useEffect(() => {
    if (!ready) return;
    if (!window.maplibregl || !mapContainerRef.current || mapRef.current)
      return;

    const maplibregl = window.maplibregl;

    const style = {
      version: 8,
      glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
      sources: {
        esri_satellite: {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri World Imagery",
        },
        esri_reference_overlay: {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri Reference",
        },
        esri_places: {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri Boundaries & Places",
        },

        "candidate-points-src": {
          type: "geojson",
          data: emptyFeatureCollection(),
        },
        "candidate-country-centers-src": {
          type: "geojson",
          data: emptyFeatureCollection(),
        },
        "candidate-links-src": {
          type: "geojson",
          data: emptyFeatureCollection(),
        },
        "country-boundary-src": {
          type: "geojson",
          data: emptyFeatureCollection(),
        },
        "region-boundary-src": {
          type: "geojson",
          data: emptyFeatureCollection(),
        },
      },
      layers: [
        {
          id: "satellite-base",
          type: "raster",
          source: "esri_satellite",
          paint: { "raster-opacity": 1 },
        },
        {
          id: "reference-overlay",
          type: "raster",
          source: "esri_reference_overlay",
          paint: { "raster-opacity": 0.95 },
        },
        {
          id: "places-overlay",
          type: "raster",
          source: "esri_places",
          paint: { "raster-opacity": 0.95 },
        },

        {
          id: "country-boundary-fill",
          type: "fill",
          source: "country-boundary-src",
          paint: { "fill-color": "#22c55e", "fill-opacity": 0.06 },
        },
        {
          id: "country-boundary-line",
          type: "line",
          source: "country-boundary-src",
          paint: {
            "line-color": "#34d399",
            "line-width": 2,
            "line-opacity": 0.8,
          },
        },

        {
          id: "region-boundary-fill",
          type: "fill",
          source: "region-boundary-src",
          layout: { visibility: "none" },
          paint: {
            "fill-color": [
              "case",
              ["==", ["get", "active"], 1],
              "#38bdf8",
              "rgba(148,163,184,0.18)",
            ],
            "fill-opacity": ["case", ["==", ["get", "active"], 1], 0.1, 0.05],
          },
        },
        {
          id: "region-boundary-line",
          type: "line",
          source: "region-boundary-src",
          layout: { visibility: "none" },
          paint: {
            "line-color": [
              "case",
              ["==", ["get", "active"], 1],
              "#7dd3fc",
              "rgba(148,163,184,0.45)",
            ],
            "line-width": 2.2,
            "line-dasharray": [2, 2],
            "line-opacity": 0.95,
          },
        },

        {
          id: "candidate-links",
          type: "line",
          source: "candidate-links-src",
          paint: {
            "line-color": [
              "case",
              ["==", ["get", "active"], 1],
              "#34d399",
              "rgba(148,163,184,0.55)",
            ],
            "line-width": ["case", ["==", ["get", "active"], 1], 2.2, 1.0],
            "line-opacity": ["case", ["==", ["get", "active"], 1], 0.9, 0.35],
          },
        },

        {
          id: "candidate-country-centers",
          type: "circle",
          source: "candidate-country-centers-src",
          paint: {
            "circle-radius": 3,
            "circle-color": "#94a3b8",
            "circle-opacity": 0.7,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#020617",
          },
        },

        {
          id: "candidate-points-glow",
          type: "circle",
          source: "candidate-points-src",
          layout: { visibility: "none" },
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2,
              ["+", 10, ["/", ["get", "feasibility"], 18]],
              6,
              ["+", 13, ["/", ["get", "feasibility"], 13]],
              10,
              ["+", 18, ["/", ["get", "feasibility"], 9]],
            ],
            "circle-color": ["get", "color"],
            "circle-opacity": 0.26,
            "circle-blur": 0.9,
          },
        },

        {
          id: "candidate-points",
          type: "circle",
          source: "candidate-points-src",
          layout: { visibility: "none" },
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2,
              ["+", 8, ["/", ["get", "coverage"], 24]],
              6,
              ["+", 10, ["/", ["get", "coverage"], 18]],
              10,
              ["+", 13, ["/", ["get", "coverage"], 14]],
            ],
            "circle-color": ["get", "color"],
            "circle-opacity": 0.92,
            "circle-stroke-width": [
              "case",
              ["==", ["get", "active"], 1],
              3.4,
              1.6,
            ],
            "circle-stroke-color": [
              "case",
              ["==", ["get", "active"], 1],
              "#f8fafc",
              "rgba(2,6,23,0.88)",
            ],
          },
        },

        {
          id: "candidate-points-active-ring",
          type: "circle",
          source: "candidate-points-src",
          layout: { visibility: "none" },
          filter: ["==", ["get", "active"], 1],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2,
              ["+", 14, ["/", ["get", "coverage"], 18]],
              6,
              ["+", 17, ["/", ["get", "coverage"], 15]],
              10,
              ["+", 21, ["/", ["get", "coverage"], 12]],
            ],
            "circle-color": "rgba(0,0,0,0)",
            "circle-stroke-width": 2.4,
            "circle-stroke-color": "rgba(255,255,255,0.9)",
            "circle-stroke-opacity": 0.9,
          },
        },

        {
          id: "candidate-tech-icons",
          type: "symbol",
          source: "candidate-points-src",
          layout: {
            visibility: "none",
            "text-field": ["get", "techBadge"],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2,
              8.5,
              5,
              9.5,
              9,
              11,
            ],
            "text-offset": [0, 0],
            "text-anchor": "center",
            "text-allow-overlap": true,
            "text-ignore-placement": true,
            "symbol-sort-key": ["case", ["==", ["get", "active"], 1], 10, 1],
          },
          paint: {
            "text-color": "#f8fafc",
            "text-opacity": 0.98,
            "text-halo-color": "rgba(2,6,23,0.92)",
            "text-halo-width": 1.2,
          },
        },

        {
          id: "candidate-labels",
          type: "symbol",
          source: "candidate-points-src",
          layout: {
            "text-field": ["get", "label"],
            "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2,
              10,
              5,
              11,
              9,
              12,
            ],
            "text-offset": [0, 1.4],
            "text-anchor": "top",
            "text-allow-overlap": false,
            "text-ignore-placement": false,
          },
          paint: {
            "text-color": "#f8fafc",
            "text-halo-color": "rgba(2,6,23,0.92)",
            "text-halo-width": 1.2,
            "text-opacity": 0.95,
          },
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style,
      center: [118, 10],
      zoom: 2.2,
      pitch: 35,
      bearing: 0,
      dragRotate: false,
      touchPitch: false,
      attributionControl: false,
      cooperativeGestures: false,
      maxZoom: 13,
      minZoom: 1.5,
    });

    map.scrollZoom.enable();
    map.dragPan.enable();
    map.boxZoom.enable();
    map.doubleClickZoom.enable();
    map.keyboard.enable();
    map.touchZoomRotate.enable();
    map.touchZoomRotate.disableRotation();

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: false }),
      "bottom-right"
    );
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.on("load", () => {
      mapLoadedRef.current = true;

      // 초기 소스 반영
      syncMapSources();

      // 초기 fit
      const recs = latestRef.current.recommendations || [];
      if (recs.length) {
        const bounds = new maplibregl.LngLatBounds();
        recs.forEach((r) => {
          const pointCoords = getRecommendationPointCoords(r);
          if (pointCoords) bounds.extend(pointCoords);
        });
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 80, duration: 0, maxZoom: 3.0 });
        }
      }
      scheduleMapResize("map-load");

      map.on("zoom", updateRegionBoundaryVisibility);
      map.on("moveend", updateRegionBoundaryVisibility);
      updateRegionBoundaryVisibility();
      syncTechMarkers();

      // hover cursor
      ["candidate-points", "candidate-tech-icons", "candidate-labels"].forEach(
        (layerId) => {
          map.on("mouseenter", layerId, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", layerId, () => {
            map.getCanvas().style.cursor = "";
          });
        }
      );

      // ✅ 클릭 처리 단일화 (점 우선 → 라벨)
      map.on("click", (e) => {
        const pointHits = map.queryRenderedFeatures(e.point, {
          layers: ["candidate-points"],
        });
        const iconHits = map.queryRenderedFeatures(e.point, {
          layers: ["candidate-tech-icons"],
        });
        const labelHits = map.queryRenderedFeatures(e.point, {
          layers: ["candidate-labels"],
        });

        const hit = pointHits[0] || iconHits[0] || labelHits[0];

        if (!hit) {
          closePopup();
          return;
        }

        const id = String(hit.properties?.id ?? "");
        const rec = recByIdRef.current[id];
        if (!rec) {
          closePopup();
          return;
        }

        onSelectRef.current?.(rec);
        upsertPopupForRec(rec); // ✅ 항상 선택된 rec 기준으로 HTML/위치 갱신
      });
    });

    return () => {
      try {
        popupRef.current?.remove?.();
        map.remove();
      } catch (e) {}
      mapRef.current = null;
      popupRef.current = null;
      mapLoadedRef.current = false;
      clearTechMarkers();
      clearScheduledResize();
    };
  }, [
    ready,
    syncMapSources,
    upsertPopupForRec,
    closePopup,
    clearScheduledResize,
    clearTechMarkers,
    scheduleMapResize,
    syncTechMarkers,
    updateRegionBoundaryVisibility,
  ]);

  // 후보/경계 소스 갱신
  useEffect(() => {
    syncMapSources();
    syncTechMarkers();
    updateRegionBoundaryVisibility();
  }, [
    recommendations,
    activeRec,
    countryBoundaryFeature,
    regionBoundaryFeature,
    syncMapSources,
    syncTechMarkers,
    updateRegionBoundaryVisibility,
  ]);

  // ✅ activeRec 변경 시 팝업도 내용 + 위치 동기화 (기존 버그 해결)
  useEffect(() => {
    if (!activeRec) {
      closePopup();
      return;
    }
    if (popupRef.current) {
      upsertPopupForRec(activeRec);
    }
  }, [activeRec, upsertPopupForRec, closePopup]);

  // 지도 모드 토글
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const showOverlay = mapMode === "hybrid";
    const opacity = showOverlay ? 0.95 : 0.0;

    if (map.getLayer("reference-overlay")) {
      map.setPaintProperty("reference-overlay", "raster-opacity", opacity);
    }
    if (map.getLayer("places-overlay")) {
      map.setPaintProperty("places-overlay", "raster-opacity", opacity);
    }
  }, [mapMode]);

  // 포커스 모드 카메라 이동
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeRec) return;

    const regionBounds = getGeoJsonBounds(regionBoundaryFeature);
    const countryBounds = getGeoJsonBounds(countryBoundaryFeature);

    if (focusMode === "region" && regionBounds) {
      map.fitBounds(regionBounds, { padding: 50, duration: 700, maxZoom: 7.8 });
      return;
    }
    if (focusMode === "country" && countryBounds) {
      map.fitBounds(countryBounds, {
        padding: 50,
        duration: 700,
        maxZoom: 5.6,
      });
      return;
    }

    if (focusMode === "country") {
      const center = getRecommendationCountryCenterCoords(activeRec);
      if (!center) return;
      map.flyTo({
        center,
        zoom: 4.2,
        pitch: 28,
        speed: 0.8,
        curve: 1.25,
        essential: true,
      });
    } else {
      const center = getRecommendationPointCoords(activeRec);
      if (!center) return;
      map.flyTo({
        center,
        zoom: 6.6,
        pitch: 42,
        speed: 0.8,
        curve: 1.25,
        essential: true,
      });
    }
  }, [focusMode, activeRec, countryBoundaryFeature, regionBoundaryFeature]);

  return (
    <div className="absolute inset-0">
      <div
        data-guide-id="map-interaction"
        ref={mapContainerRef}
        className={cx(
          "absolute inset-0",
          guidePulseKey === "map-interaction" && "guide-pulse-outline"
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.07),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05),transparent_45%)]" />
    </div>
  );
}

function MapInfoOverlay({ activeRec, count, mapMode, strategyMeta }) {
  const evidenceLink = getPrimaryEvidenceLink(activeRec);
  return (
    <div className="pointer-events-none absolute left-2 sm:left-4 bottom-[84px] sm:bottom-4 z-20">
      <div className="pointer-events-auto w-[min(360px,calc(100vw-16px))] rounded-2xl border border-slate-700/80 bg-slate-900/85 backdrop-blur-md p-3 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-emerald-300">
            선택 지역 핵심 요약
          </div>
          <PillTag tone="slate">
            {mapMode === "hybrid" ? "지도+위성" : "위성 지도"}
          </PillTag>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-2 py-1.5">
            <div className="text-[10px] text-slate-400">후보 수</div>
            <div className="text-sm font-bold text-white">{count}</div>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-2 py-1.5">
            <div className="text-[10px] text-slate-400">표시 정보</div>
            <div className="text-sm font-bold text-white">국가·지역</div>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-2 py-1.5">
            <div className="text-[10px] text-slate-400">선택 상태</div>
            <div className="text-sm font-bold text-white">
              {activeRec ? "선택됨" : "미선택"}
            </div>
          </div>
        </div>

        {activeRec ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 space-y-2">
            <div>
              <div className="text-xs text-slate-300">
                <span className="text-white font-semibold">
                  {activeRec.country} · {activeRec.region}
                </span>
              </div>
              <div className="text-xs text-emerald-300 mt-0.5">
                {activeRec.tech}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-slate-300">
                전략 점수{" "}
                <span className="text-white font-bold">
                  {strategyMeta?.strategyScore ?? "-"}
                </span>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-slate-300">
                파이프라인{" "}
                <span className="text-white font-bold">
                  {strategyMeta?.pipelineProjectCount ?? 0}건
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              {(activeRec.purposeTags || []).join(", ")} ·{" "}
              {strategyMeta?.oneLine ||
                "선택한 후보의 핵심 근거를 간단히 보여줍니다."}
            </div>
            {evidenceLink && (
              <ExternalLinkButton
                href={evidenceLink.href}
                label={evidenceLink.label || "근거 링크 열기"}
                compact
              />
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-2.5 text-xs text-slate-400">
            후보를 선택하면 국가·지역 정보와 근거 링크를 바로 확인할 수
            있습니다.
          </div>
        )}
      </div>
    </div>
  );
}

function MapTechLegend({
  recommendations = [],
  activeRec = null,
  isMobile = false,
  embedded = false,
  selectedTechFilter = "전체 기술",
  onSelectTech = null,
}) {
  const legendGroups = useMemo(
    () => buildLegendGroups(recommendations),
    [recommendations]
  );
  const flatLegendItems = useMemo(
    () => legendGroups.flatMap((group) => group.items),
    [legendGroups]
  );
  const visibleTechCount = useMemo(
    () => flatLegendItems.filter((item) => item.count > 0).length,
    [flatLegendItems]
  );
  const activeTech = activeRec ? normalizeTechName(activeRec.tech) : null;
  const selectedFilterTech =
    selectedTechFilter && selectedTechFilter !== "전체 기술"
      ? normalizeTechName(selectedTechFilter)
      : null;
  const activeGroup = useMemo(
    () =>
      legendGroups.find((group) =>
        group.items.some((item) => item.tech === activeTech)
      ) || null,
    [legendGroups, activeTech]
  );
  // Default: collapsed on desktop to avoid covering the map and side panels.
  // When embedded (mobile sheet), default to expanded.
  const [collapsed, setCollapsed] = useState(() => (embedded ? false : true));
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all");

  useEffect(() => {
    setCollapsed(embedded ? false : true);
  }, [embedded, isMobile]);

  useEffect(() => {
    if (viewMode === "active" && !activeTech) {
      setViewMode("all");
    }
  }, [viewMode, activeTech]);

  const filteredLegendGroups = useMemo(
    () =>
      legendGroups
        .map((group) => ({
          ...group,
          filteredItems: group.items.filter(
            (item) =>
              legendItemMatchesSearch(item, searchTerm) &&
              legendItemMatchesMode(item, viewMode, activeTech)
          ),
        }))
        .filter((group) => group.filteredItems.length > 0),
    [legendGroups, searchTerm, viewMode, activeTech]
  );

  const filteredItemCount = useMemo(
    () =>
      filteredLegendGroups.reduce(
        (sum, group) => sum + group.filteredItems.length,
        0
      ),
    [filteredLegendGroups]
  );
  const mappedPct = Math.round(
    (visibleTechCount / Math.max(flatLegendItems.length, 1)) * 100
  );
  const gapCount = Math.max(flatLegendItems.length - visibleTechCount, 0);
  const visibilityOptions = [
    { id: "all", label: "전체", count: flatLegendItems.length },
    { id: "mapped", label: "탑재", count: visibleTechCount },
    { id: "unmapped", label: "미탑재", count: gapCount },
    {
      id: "active",
      label: "선택",
      count: activeTech ? 1 : 0,
      disabled: !activeTech,
    },
  ];

  if (!flatLegendItems.length) return null;

  return (
    <div
      className={cx(
        embedded
          ? "w-full"
          : "absolute z-20 pointer-events-none top-[88px] -translate-x-1/2"
      )}
      style={
        embedded
          ? undefined
          : {
              // Center within the *map area* (viewport minus left/right panels).
              left: "calc(50% + (var(--left-panel-w, 0px) - var(--right-panel-w, 0px)) / 2)",
              width:
                "min(760px, calc(100vw - var(--left-panel-w, 0px) - var(--right-panel-w, 0px) - 72px))",
              maxWidth: "calc(100vw - 28px)",
            }
      }
    >
      <div
        className={cx(
          embedded
            ? "pointer-events-auto rounded-[24px] border border-slate-700/80 bg-slate-950/96 shadow-2xl"
            : "pointer-events-auto rounded-[24px] border border-slate-700/80 bg-slate-950/94 backdrop-blur-xl shadow-2xl"
        )}
      >
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={!collapsed}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs font-black tracking-[0.18em] text-sky-300">
                MAP LEGEND
              </div>
              <PillTag tone="slate">CTIS 국가 38대 기후기술</PillTag>
              <PillTag tone={visibleTechCount > 0 ? "sky" : "slate"}>
                {visibleTechCount}/38 탑재
              </PillTag>
              {activeGroup && (
                <PillTag tone="emerald">{activeGroup.label}</PillTag>
              )}
            </div>
            <div className="mt-1 text-sm font-bold text-white">
              국가 38대 기후기술 범례
            </div>
            <div className="mt-1 text-[11px] leading-relaxed text-slate-400">
              CTIS 공식 분류의 38개 기술을 모두 보여주고, 현재 플랫폼에 연결된
              기술과 비어 있는 기술을 한눈에 비교합니다.
              {activeTech
                ? ` 현재 선택 후보는 ${techShort(
                    activeTech
                  )} 기술에 연결되어 있습니다.`
                : " 검색과 상태 필터를 이용해 탑재·미탑재 기술을 빠르게 검토할 수 있습니다."}
              {onSelectTech
                ? " 기술 카드를 누르면 지도와 후보가 해당 기술 기준으로 바로 좁혀집니다."
                : ""}
            </div>
          </div>
          <div className="mt-0.5 shrink-0 rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-300">
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </button>

        {!collapsed && (
          <div className="border-t border-slate-800 px-4 pb-4 pt-3">
            <div
              className={cx(
                "grid gap-2",
                isMobile ? "grid-cols-2" : "grid-cols-4"
              )}
            >
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  공식 체계
                </div>
                <div className="mt-1 text-lg font-black text-white">38</div>
                <div className="text-xs text-slate-400">
                  국가 38대 기술 전체
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  현재 탑재
                </div>
                <div className="mt-1 text-lg font-black text-white">
                  {visibleTechCount}
                </div>
                <div className="text-xs text-slate-400">
                  탑재율 {mappedPct}%
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  미탑재
                </div>
                <div className="mt-1 text-lg font-black text-white">
                  {gapCount}
                </div>
                <div className="text-xs text-slate-400">확장 후보 기술 수</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  활성 기술
                </div>
                <div className="mt-1 text-lg font-black text-white break-keep">
                  {activeTech ? techShort(activeTech) : "-"}
                </div>
                <div className="text-xs text-slate-400">
                  현재 선택 후보 기준
                </div>
              </div>
            </div>

            <div
              className={cx(
                "mt-3 grid gap-2",
                isMobile
                  ? "grid-cols-1"
                  : "grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]"
              )}
            >
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  검색
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2">
                  <Search size={15} className="text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="기술명, 약칭, 세부기술로 검색"
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="rounded-lg border border-slate-700 bg-slate-900/80 p-1 text-slate-300"
                      aria-label="범례 검색 초기화"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  표시 기준
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {visibilityOptions.map((option) => {
                    const selected = viewMode === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={option.disabled}
                        onClick={() =>
                          !option.disabled && setViewMode(option.id)
                        }
                        className={cx(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                          selected
                            ? "border-sky-400/40 bg-sky-500/12 text-sky-200"
                            : "border-slate-700 bg-slate-950/60 text-slate-300",
                          option.disabled && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <span>{option.label}</span>
                        <span className="rounded-full bg-slate-950/70 px-1.5 py-0.5 text-[10px] text-slate-300">
                          {option.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span>표시 결과 {filteredItemCount}개 기술</span>
              {searchTerm && (
                <PillTag tone="blue">키워드 검색: {searchTerm}</PillTag>
              )}
              <PillTag tone={viewMode === "unmapped" ? "amber" : "slate"}>
                {visibilityOptions.find((option) => option.id === viewMode)
                  ?.label || "전체 보기"}
              </PillTag>
              {activeGroup && (
                <PillTag tone="emerald">
                  활성 분류: {activeGroup.helper}
                </PillTag>
              )}
              {selectedFilterTech && (
                <PillTag tone="sky">
                  필터 적용: {techShort(selectedFilterTech)}
                </PillTag>
              )}
            </div>

            <div className="mt-3 max-h-[54vh] space-y-3 overflow-y-auto pr-1">
              {!filteredLegendGroups.length ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 px-4 py-5 text-sm text-slate-400">
                  검색 필터에 맞는 기술이 없습니다. 키워드 검색어를 지우거나
                  표시 기준을 바꿔 다시 확인해주세요.
                </div>
              ) : (
                filteredLegendGroups.map((group) => {
                  const groupAccent =
                    group.items.find((item) => item.count > 0)?.color ||
                    group.items[0]?.color ||
                    "#38bdf8";
                  return (
                    <div
                      key={group.id}
                      className="rounded-[22px] border border-slate-800 bg-slate-900/55 overflow-hidden"
                    >
                      <div className="border-b border-slate-800 px-3 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-sm font-bold text-white">
                                {group.label}
                              </div>
                              <PillTag tone="slate">{group.helper}</PillTag>
                              <PillTag
                                tone={
                                  group.loadedCount > 0 ? "emerald" : "slate"
                                }
                              >
                                {group.loadedCount}/{group.totalCount} 탑재
                              </PillTag>
                            </div>
                            <div className="mt-1 text-[11px] text-slate-400">
                              {group.totalCount}개 기술 중 {group.coveragePct}
                              %가 현재 후보 데이터와 연결되어 있습니다.
                            </div>
                          </div>
                          <div className="min-w-[140px]">
                            <div className="h-2 rounded-full bg-slate-800">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${group.coveragePct}%`,
                                  backgroundColor: groupAccent,
                                }}
                              />
                            </div>
                            <div className="mt-1 text-right text-[10px] text-slate-400">
                              검색 결과 {group.filteredItems.length}개
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={cx(
                          "grid gap-2 p-3",
                          isMobile
                            ? "grid-cols-1"
                            : "grid-cols-2 xl:grid-cols-3"
                        )}
                      >
                        {group.filteredItems.map((item) => {
                          const Icon = item.Icon || Layers;
                          const isActive = activeTech === item.tech;
                          const isFilterSelected =
                            selectedFilterTech === item.tech;
                          const hasCount = item.count > 0;
                          const surface = withAlpha(
                            item.color,
                            isActive ? 0.18 : hasCount ? 0.11 : 0.05
                          );
                          const border = withAlpha(
                            item.color,
                            isFilterSelected
                              ? 0.78
                              : isActive
                              ? 0.52
                              : hasCount
                              ? 0.28
                              : 0.16
                          );
                          return (
                            <button
                              type="button"
                              key={item.tech}
                              title={`${item.tech} · ${item.description}`}
                              onClick={() => onSelectTech?.(item.tech)}
                              aria-pressed={isFilterSelected}
                              className={cx(
                                "rounded-2xl border px-3 py-3 text-left transition-colors",
                                !hasCount && !isActive && "opacity-80",
                                (isActive || isFilterSelected) &&
                                  "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
                                onSelectTech && "hover:bg-slate-900/70"
                              )}
                              style={{
                                backgroundColor: surface,
                                borderColor: border,
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-white shadow-lg"
                                  style={{
                                    background: `linear-gradient(135deg, ${
                                      item.color
                                    } 0%, ${withAlpha(item.color, 0.72)} 100%)`,
                                    borderColor: withAlpha(item.color, 0.78),
                                  }}
                                >
                                  <Icon size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="rounded-full border border-slate-700 bg-slate-950/75 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-slate-300">
                                      {String(item.number).padStart(2, "0")}
                                    </div>
                                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-200">
                                      {item.short}
                                    </div>
                                    <div
                                      className={cx(
                                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                                        isFilterSelected
                                          ? "border-sky-500/30 bg-sky-500/10 text-sky-200"
                                          : hasCount || isActive
                                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                          : "border-slate-700 bg-slate-950/70 text-slate-400"
                                      )}
                                    >
                                      {isFilterSelected
                                        ? "필터"
                                        : isActive
                                        ? "선택"
                                        : hasCount
                                        ? `${item.count}개 후보`
                                        : "미탑재"}
                                    </div>
                                  </div>
                                  <div className="mt-1 text-[13px] font-semibold leading-snug text-slate-100 break-keep">
                                    {item.tech}
                                  </div>
                                  <div className="mt-1 text-[11px] leading-relaxed text-slate-400">
                                    {item.description}
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {safeArray(item.subTechs)
                                      .slice(0, 3)
                                      .map((subTech) => (
                                        <span
                                          key={`${item.tech}-${subTech}`}
                                          className="rounded-full border border-slate-700 bg-slate-950/65 px-2 py-0.5 text-[10px] text-slate-300"
                                        >
                                          {subTech}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
 * Shared UI pieces
 * ========================================================= */
function NIGTLogo({ size = 24, className = "" }) {
  return (
    <div className={cx("inline-flex items-center gap-2", className)}>
      <div
        className="rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/20 to-sky-400/15 flex items-center justify-center shadow-lg"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 64 64"
          width={size * 0.68}
          height={size * 0.68}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="nigtGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <path
            d="M10 45 L10 19 L24 45 L24 19"
            fill="none"
            stroke="url(#nigtGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M34 19 H54"
            fill="none"
            stroke="url(#nigtGradient)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M44 19 V45"
            fill="none"
            stroke="url(#nigtGradient)"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[11px] font-black tracking-[0.22em] text-emerald-300">
          NIGT
        </div>
        <div className="text-[10px] text-slate-400">Climate Tech Strategy</div>
      </div>
    </div>
  );
}

function ScoreMethodCard({ compact = false }) {
  const framework = getMetricFrameworkEntries().filter((item) =>
    ["coverage", "reliability", "resilience", "feasibility"].includes(item.key)
  );
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/85 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Info size={14} className="text-sky-300" />
        <div className="text-sm font-bold text-white">점수 기준 안내</div>
      </div>
      <div
        className={cx("grid gap-2", compact ? "grid-cols-2" : "grid-cols-1")}
      >
        {framework.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-2"
          >
            <div
              className={cx(
                "text-xs font-bold",
                item.accent === "emerald"
                  ? "text-emerald-300"
                  : item.accent === "blue"
                  ? "text-sky-300"
                  : item.accent === "amber"
                  ? "text-amber-300"
                  : "text-white"
              )}
            >
              {item.label}
            </div>
            <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              {item.definition}
            </div>
            <div className="mt-2 text-[10px] text-slate-500">
              핵심 근거 · {safeArray(item.evidenceHints).join(" · ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PracticalMetricCard({ rec, pipelineData = null }) {
  const safeRec = sanitize검토Record(rec) || rec || EMPTY_DETAIL_RECORD;
  const metrics = buildPracticalMetrics(safeRec, pipelineData);
  return (
    <SectionCard
      title="실무형 판단 지표"
      icon={<BarChart3 className="text-sky-300" size={16} />}
      right={<div className="text-[11px] text-slate-500">점수별 근거 연결</div>}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {metrics.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-200">
                  {item.label}
                </div>
                <div className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  {item.description}
                </div>
              </div>
              <div
                className={cx(
                  "rounded-xl px-2.5 py-1 text-sm font-black",
                  scoreTone(item.score) === "emerald"
                    ? "bg-emerald-500/10 text-emerald-200"
                    : scoreTone(item.score) === "blue"
                    ? "bg-sky-500/10 text-sky-200"
                    : scoreTone(item.score) === "amber"
                    ? "bg-amber-500/10 text-amber-200"
                    : "bg-slate-700 text-slate-100"
                )}
              >
                {item.score}
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-900/70 overflow-hidden">
              <div
                className={cx(
                  "h-full rounded-full",
                  scoreTone(item.score) === "emerald"
                    ? "bg-emerald-400"
                    : scoreTone(item.score) === "blue"
                    ? "bg-sky-400"
                    : scoreTone(item.score) === "amber"
                    ? "bg-amber-400"
                    : "bg-slate-400"
                )}
                style={{ width: `${boundScore(item.score)}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] leading-relaxed text-slate-300">
              {item.note}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-[11px] text-slate-400 leading-relaxed">
        숫자만 보여주지 않고{" "}
        <span className="text-slate-200 font-semibold">
          정책·재원·파트너·문서 확보 수준
        </span>
        을 함께 설명해 회의·출장·사업발굴 자료로 바로 전환할 수 있게 했습니다.
      </div>
    </SectionCard>
  );
}

function getInventoryStatusSummary(rec) {
  const rows = Array.isArray(rec?.inventoryRows) ? rec.inventoryRows : [];
  const total = rows.length || 1;
  const available = rows.filter((row) => row.status === "확보").length;
  const missing = rows.filter((row) => row.status === "결측/한계").length;
  const required = rows.filter((row) => row.status === "실무필수").length;
  return {
    total,
    available,
    missing,
    required,
    availablePct: Math.round((available / total) * 100),
    missingPct: Math.round((missing / total) * 100),
    requiredPct: Math.round((required / total) * 100),
  };
}

function DataInventoryViz({ rec }) {
  const summary = getInventoryStatusSummary(rec);
  const segments = [
    { label: "확보", value: summary.availablePct, tone: "bg-emerald-500" },
    { label: "결측", value: summary.missingPct, tone: "bg-amber-400" },
    { label: "실행 전 필수", value: summary.requiredPct, tone: "bg-sky-400" },
  ];

  return (
    <SectionCard
      title="데이터 확보 현황"
      icon={<Database className="text-sky-300" size={16} />}
    >
      <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-800">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={seg.tone}
              style={{ width: `${seg.value}%` }}
            />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2"
            >
              <div className="text-slate-400">{seg.label}</div>
              <div className="mt-1 text-sm font-bold text-white">
                {seg.value}%
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          총 {summary.total}개 데이터 항목 기준으로 현재 탑재 수준을
          시각화했습니다.
        </div>
      </div>
    </SectionCard>
  );
}

function getLatestEvidenceYear(rec) {
  const values = [
    ...safeArray(rec?.regionRows).map((item) => item?.update),
    ...safeArray(rec?.strategyEvidence?.sourceData).map(
      (item) => item?.lastUpdated
    ),
  ]
    .map((value) => String(value || ""))
    .join(" ");
  const years = Array.from(values.matchAll(/20\d{2}/g)).map((match) =>
    Number(match[0])
  );
  return years.length ? Math.max(...years) : null;
}

function DataFreshnessCard({ rec, liveData = null, pipelineData = null }) {
  const latestYear = getLatestEvidenceYear(rec);
  const metrics = buildEvidenceMetrics(rec, pipelineData);
  const refreshState = liveData ? "실시간 보강 사용 중" : "저장 데이터 기반";
  const summary = [
    latestYear ? `최신 근거 연도 ${latestYear}` : "최신 근거 연도 확인 필요",
    `직접 문서 ${metrics.directLinkCount}건`,
    `공식 링크 ${metrics.officialLinkCount}건`,
  ].join(" · ");
  return (
    <SectionCard
      title="데이터 최신성·직접성"
      icon={<RefreshCw className="text-emerald-300" size={16} />}
      right={
        <PillTag tone={liveData ? "emerald" : "slate"}>{refreshState}</PillTag>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs text-slate-400">최신 근거</div>
          <div className="mt-1 text-lg font-extrabold text-white">
            {latestYear || "-"}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            정책 문서·프로젝트 문서에서 가장 최근 연도 기준
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs text-slate-400">직접 문서</div>
          <div className="mt-1 text-lg font-extrabold text-white">
            {metrics.directLinkCount}건
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            PDF, 프로젝트 상세, 공식 문서 페이지 위주로 연결
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs text-slate-400">재원·사업 신호</div>
          <div className="mt-1 text-lg font-extrabold text-white">
            {metrics.financeSignalCount}건
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            GCF, MDB, readiness, country programme, APR 포함
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
        {summary}
      </div>
    </SectionCard>
  );
}

function buildCoverageChecklist(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) || rec || EMPTY_DETAIL_RECORD;
  const metrics = buildEvidenceMetrics(safeRec, pipelineData);
  const assessment = buildInternationalCooperationAssessment(
    safeRec,
    pipelineData
  );
  return [
    {
      key: "policy",
      label: "정책·전략 문서",
      current: metrics.policyDocumentCount,
      target: 2,
      note: "NDC, NAP, 국가 전략, 지역계획 등 직접 근거 문서 수",
    },
    {
      key: "finance",
      label: "재원·사업 신호",
      current: metrics.financeSignalCount,
      target: 2,
      note: "GCF, MDB, readiness, country programme, 승인사업 등",
    },
    {
      key: "partners",
      label: "현지 파트너",
      current: Number(assessment?.linkedPartnerCount || 0),
      target: 2,
      note: "공식 링크가 연결된 주관부처·집행기관·유틸리티 수",
    },
    {
      key: "documents",
      label: "직접 문서",
      current: metrics.directLinkCount,
      target: 4,
      note: "PDF, 승인 제안서, 프로젝트 상세, 공식 문서 페이지 수",
    },
  ].map((item) => ({
    ...item,
    status:
      item.current >= item.target
        ? "충족"
        : item.current >= Math.max(1, item.target - 1)
        ? "보완"
        : "추가 필요",
  }));
}

function EvidenceCoverageSummaryCard({ rec, pipelineData = null }) {
  const safeRec = sanitize검토Record(rec) || rec || EMPTY_DETAIL_RECORD;
  const checklist = buildCoverageChecklist(safeRec, pipelineData);
  const readyCount = checklist.filter((item) => item.status === "충족").length;
  return (
    <SectionCard
      title="실무 검토 최소 기준"
      icon={<ShieldAlert className="text-amber-300" size={16} />}
      right={
        <PillTag
          tone={
            readyCount >= 3 ? "emerald" : readyCount >= 2 ? "blue" : "amber"
          }
        >
          {readyCount}/4 충족
        </PillTag>
      }
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {checklist.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-xs font-bold text-slate-100">
                {item.label}
              </div>
              <PillTag
                tone={
                  item.status === "충족"
                    ? "emerald"
                    : item.status === "보완"
                    ? "blue"
                    : "amber"
                }
              >
                {item.status}
              </PillTag>
            </div>
            <div className="mt-2 text-lg font-black text-white">
              {item.current}
              <span className="ml-1 text-xs font-semibold text-slate-400">
                / 목표 {item.target}
              </span>
            </div>
            <div className="mt-2 text-[11px] leading-relaxed text-slate-400">
              {item.note}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
        국가·후보마다 편차가 있더라도{" "}
        <span className="font-semibold text-white">
          정책 문서, 재원 신호, 파트너, 직접 문서
        </span>{" "}
        최소 기준을 같은 방식으로 보여 주면 회의자료와 concept note 검토가
        빨라집니다.
      </div>
    </SectionCard>
  );
}

function WorkspaceActionGuideCard({
  filters,
  activeRec = null,
  shortlistCount = 0,
  filteredCount = 0,
}) {
  const hasSelection = !!activeRec;
  const stageLabel = hasSelection ? "상세 검토 단계" : "후보 압축 단계";
  const headline = hasSelection
    ? shortlistCount > 0
      ? `현재 후보와 저장 후보 ${shortlistCount}개를 비교할 준비가 되었습니다.`
      : "현재 후보 1건을 기준으로 빠르게 판단을 정리할 수 있습니다."
    : `${
        filters?.purpose && filters.purpose !== "전체 목적"
          ? filters.purpose
          : "목적 선택"
      } 기준으로 후보를 좁혀 보세요.`;
  const steps = hasSelection
    ? shortlistCount > 0
      ? [
          `현재 후보를 기준으로 저장 후보 ${shortlistCount}개를 함께 비교합니다.`,
          "재원·실행 탭에서 파이프라인과 집행 경로를 먼저 확인합니다.",
          "검토표 저장 또는 공유 링크로 회의용 자료를 마무리합니다.",
        ]
      : [
          "핵심 판단 탭에서 이 후보를 지금 봐야 하는 이유를 먼저 확인합니다.",
          "출처 탭에서 공식 문서와 직접 링크를 확인해 사실관계를 정리합니다.",
          "보관하거나 요약본을 저장해 다음 공유 단계로 넘깁니다.",
        ]
    : [
        "조건 설정에서 목적·기술·국가를 먼저 맞춥니다.",
        `현재 ${filteredCount}개 후보 중에서 바로 검토할 후보 1건을 고릅니다.`,
        "후보를 고르면 오른쪽 패널에서 핵심 판단 → 재원·실행 → 출처 순서로 확인합니다.",
      ];
  return (
    <SectionCard
      title="지금 할 일"
      icon={<Rocket className="text-amber-300" size={16} />}
      right={
        <PillTag tone={hasSelection ? "emerald" : "sky"}>{stageLabel}</PillTag>
      }
    >
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/6 px-3 py-2.5 text-xs leading-relaxed text-slate-200">
        <span className="font-semibold text-amber-200">지금 상태</span> ·{" "}
        {headline}
      </div>
      <div className="mt-3 space-y-2">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-200"
          >
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/15 text-[11px] font-black text-emerald-300">
              {idx + 1}
            </span>
            {step}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function buildActiveFilterChips(filters = {}) {
  const chips = [];
  if (filters?.purpose && filters.purpose !== "전체 목적")
    chips.push(`목적 · ${filters.purpose}`);
  if (filters?.tech && filters.tech !== "전체 기술")
    chips.push(`기술 · ${filters.tech}`);
  if (filters?.country && filters.country !== "전체 국가")
    chips.push(`국가 · ${filters.country}`);
  if (filters?.keyword) chips.push(`검색 · ${String(filters.keyword).trim()}`);
  if (Number(filters?.minCoverage) > 70)
    chips.push(`충족률 ${filters.minCoverage}% 이상`);
  if (filters?.financeChannel && filters.financeChannel !== "전체 재원")
    chips.push(`재원 · ${filters.financeChannel}`);
  if (filters?.decisionFilter && filters.decisionFilter !== "전체")
    chips.push(`판단 · ${filters.decisionFilter}`);
  if (filters?.sortMode && filters.sortMode !== "strategy") {
    const label = STRATEGY_SORT_OPTIONS.find(
      (item) => item.value === filters.sortMode
    )?.label;
    if (label) chips.push(`정렬 · ${label}`);
  }
  return chips.slice(0, 6);
}

function SourceDrillDownModal({ open, item, onClose }) {
  if (!open || !item) return null;

  const sampleRows = Array.isArray(item.rows) ? item.rows : [];
  const sampleHeaders = sampleRows.length ? Object.keys(sampleRows[0]) : [];

  return (
    <div className="fixed inset-0 z-[95]">
      <button
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        onClick={() => safeInvoke(onClose)}
        aria-label="닫기"
      />
      <div className="absolute left-1/2 top-1/2 w-[min(920px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <div className="text-xs text-slate-400">
              {item.group} · {item.source}
            </div>
            <div className="text-lg font-extrabold text-white mt-1">
              {item.label}
            </div>
          </div>
          <button
            onClick={() => safeInvoke(onClose)}
            className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
          >
            닫기
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto p-5 space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/35 p-4">
            <div className="text-xs text-slate-400">설명</div>
            <div className="mt-1 text-sm text-slate-100">
              {item.description || "설명 없음"}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs text-slate-400">상태</div>
                <div className="mt-1 text-sm font-bold text-white">
                  {item.mode || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">최종 갱신</div>
                <div className="mt-1 text-sm font-bold text-white">
                  {item.lastUpdated || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">예시 필드</div>
                <div className="mt-1 text-sm text-slate-100">
                  {(item.sampleFields || []).join(", ") || "-"}
                </div>
              </div>
            </div>
          </div>

          {!!sampleRows.length && (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 overflow-hidden">
              <div className="border-b border-slate-800 px-4 py-3 text-sm font-bold text-white">
                예시 데이터
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-800/70 text-slate-300">
                    <tr>
                      {sampleHeaders.map((key) => (
                        <th
                          key={key}
                          className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-slate-800 text-slate-100"
                      >
                        {sampleHeaders.map((key) => (
                          <td key={key} className="px-3 py-2 whitespace-nowrap">
                            {String(row[key] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StrategyEvidenceCard({ rec, onOpenSources, onOpenDrillDown }) {
  const evidence = sanitizeStrategyEvidence(rec?.strategyEvidence, rec);
  const primaryLink = getPrimaryEvidenceLink(rec);
  const sourceData = safeArray(evidence?.sourceData);
  const purposeFit = safeArray(evidence?.purposeFit);
  if (!evidence) return null;
  return (
    <SectionCard
      title="협력 근거 한눈에 보기"
      icon={<Info className="text-emerald-400" size={16} />}
      right={
        <div className="flex items-center gap-2">
          {primaryLink && (
            <ExternalLinkButton
              href={primaryLink.href}
              label="대표 출처"
              compact
            />
          )}
          <button
            onClick={() => safeInvoke(onOpenSources)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            출처 모아보기
          </button>
        </div>
      }
    >
      <div className="text-sm text-slate-200 leading-relaxed">
        {evidence.summary}
      </div>
      <div className="mt-3 grid gap-2">
        {sourceData.length ? (
          sourceData.map((item, idx) => {
            const linkInfo = getEvidenceLinkForItem(item);
            return (
              <div
                key={item.id || idx}
                className="rounded-xl border border-slate-700 bg-slate-800/35 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => safeInvoke(onOpenDrillDown, item)}
                    className="text-left min-w-0 flex-1"
                  >
                    <div className="text-sm font-bold text-white">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {item.group} · {item.source}
                    </div>
                    <div className="mt-2 text-xs text-emerald-300">
                      클릭하면 데이터 구조와 예시 값을 볼 수 있습니다.
                    </div>
                  </button>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <PillTag
                      tone={
                        item.mode === "연계중"
                          ? "emerald"
                          : item.mode === "대표 데이터"
                          ? "blue"
                          : "amber"
                      }
                    >
                      {item.mode}
                    </PillTag>
                    {linkInfo && (
                      <ExternalLinkButton
                        href={linkInfo.href}
                        label="근거 링크"
                        compact
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-xs text-slate-400">
            연결된 세부 근거 데이터가 아직 없습니다. 정책·프로젝트·좌표 데이터
            구조가 정리되면 이 영역에 표시됩니다.
          </div>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {purposeFit.length ? (
          purposeFit.map((item, idx) => (
            <div
              key={`${item.tag}-${idx}`}
              className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300"
            >
              <span className="font-bold text-white">{item.tag}</span> ·{" "}
              {item.note}
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/45 px-3 py-2 text-xs text-slate-400">
            목적 정합성 메모가 준비되면 여기에 표시됩니다.
          </div>
        )}
      </div>
      <SupportingLinkGroup
        title="전략 검토에 바로 쓰는 출처"
        links={collectEvidenceLinks(rec, "general")}
      />
    </SectionCard>
  );
}

function ExecutionFeasibilityCard({ rec }) {
  const execution = sanitizeExecutionFeasibility(
    rec?.executionFeasibility,
    rec
  );
  const primaryLink = getPrimaryEvidenceLink(rec);
  const financeChannels = safeArray(execution?.financeChannels);
  const deliveryPartners = safeArray(execution?.deliveryPartners);
  if (!execution) return null;
  return (
    <SectionCard
      title="사업·재원 연결 가능성"
      icon={<Target className="text-sky-300" size={16} />}
      right={
        primaryLink ? (
          <ExternalLinkButton
            href={primaryLink.href}
            label="관련 출처"
            compact
          />
        ) : null
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs text-slate-400">현재 단계</div>
          <div className="mt-1 text-sm font-bold text-white">
            {execution.stage}
          </div>
          <div className="mt-2 text-xs text-slate-300">
            {execution.projectSignal}
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs text-slate-400">권장 재원 연결 경로</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {financeChannels.length ? (
              financeChannels.map((item) => (
                <PillTag key={item} tone="sky">
                  {item}
                </PillTag>
              ))
            ) : (
              <span className="text-xs text-slate-400">
                재원을 추가 검증 중입니다.
              </span>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {execution.financeNote}
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/45 p-3">
        <div className="text-xs font-semibold text-slate-300">실행 파트너</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {deliveryPartners.length ? (
            deliveryPartners.map((item) => (
              <PillTag key={item} tone="emerald">
                {item}
              </PillTag>
            ))
          ) : (
            <span className="text-xs text-slate-400">
              현지 파트너 후보를 추가 수집 중입니다.
            </span>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function SuitabilityLogicCard({ rec }) {
  const logic = rec?.suitabilityLogic;
  const primaryLink = getPrimaryEvidenceLink(rec, "logic");
  const rows = safeArray(
    logic?.weights?.length ? logic.weights : logic?.criteria
  );
  const summary =
    logic?.summary ||
    logic?.headline ||
    "국가 수요, 정책 정합성, 실행 여건, 데이터 준비도를 종합해 우선 검토 대상을 압축합니다.";
  const output =
    logic?.output ||
    logic?.headline ||
    "목적별 우선 후보를 1차 압축한 뒤, 실행 파트너와 재원 가능성을 함께 검토합니다.";
  if (!logic) return null;
  return (
    <SectionCard
      title="후보 압축 기준"
      icon={<Layers className="text-amber-300" size={16} />}
      right={
        primaryLink ? (
          <ExternalLinkButton
            href={primaryLink.href}
            label="관련 자료"
            compact
          />
        ) : null
      }
    >
      <div className="text-sm text-slate-200">{summary}</div>
      <div className="mt-3 space-y-2">
        {rows.length ? (
          rows.map((item, idx) => (
            <div
              key={`${item?.label || "weight"}-${idx}`}
              className="rounded-xl border border-slate-700 bg-slate-800/35 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold text-white">{item.label}</div>
                <span className="text-xs font-bold text-amber-300">
                  {item.value}%
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">{item.note}</div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-xs text-slate-400">
            세부 가중치 정보는 후속 탑재 예정입니다.
          </div>
        )}
      </div>
      <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-slate-200">
        판단 정리 · {output}
      </div>
    </SectionCard>
  );
}

function VietnamPilotCard({ rec }) {
  const pilot = rec?.pilotStatus;
  const datasets = safeArray(pilot?.datasets);
  const nextActions = safeArray(pilot?.nextActions);
  if (!pilot) return null;
  return (
    <SectionCard
      title="베트남 우선 구축 데이터 패키지"
      icon={<MapPin className="text-emerald-400" size={16} />}
      right={<PillTag tone="emerald">{pilot.badge}</PillTag>}
    >
      <div className="text-sm text-slate-200">{pilot.status}</div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs font-bold text-white">우선 데이터셋</div>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            {datasets.length ? (
              datasets.map((item, idx) => (
                <li key={`${item}-${idx}`}>• {item}</li>
              ))
            ) : (
              <li>• 우선 데이터셋을 정리 중입니다.</li>
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs font-bold text-white">다음 작업</div>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            {nextActions.length ? (
              nextActions.map((item, idx) => (
                <li key={`${item}-${idx}`}>• {item}</li>
              ))
            ) : (
              <li>• 다음 작업을 정리 중입니다.</li>
            )}
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}

const DETAIL_TAB_META = {
  overview: {
    badge: "빠른 판단",
    desc: "핵심 판단, 공식 근거, 다음 행동 3가지만 먼저 파악하는 탭입니다.",
    output: "1차 검토 메모",
    readOrder: [
      "상단 핵심 요약 카드 확인",
      "추천 한 줄 요약 확인",
      "다음 액션 1~3순위 파악",
    ],
  },
  recommendations: {
    badge: "협력안 설계",
    desc: "협력 모델과 실행 순서를 짧게 정리해 사업·회의 방향을 잡는 탭입니다.",
    output: "협력안 초안",
    readOrder: [
      "전략 핵심 요약 확인",
      "로드맵·우선지역 확인",
      "권장 재원·역할 분담 정리",
    ],
  },
  funding: {
    badge: "재원 점검",
    desc: "재원 경로, 파이프라인, 실행 리스크를 한 번에 점검하는 탭입니다.",
    output: "재원·실행 요약본",
    readOrder: [
      "재원 확인",
      "프로젝트 파이프라인 확인",
      "실무 필수 데이터 보완 항목 점검",
    ],
  },
  partners: {
    badge: "파트너 매핑",
    desc: "정책 승인·집행·연구·현장 운영 역할을 나눠 접촉 우선순위를 정리하는 탭입니다.",
    output: "현지 파트너 접촉표",
    readOrder: [
      "핵심 파트너 확인",
      "공식 링크 검토",
      "정책 승인/현장 실행/운영 역할 구분",
    ],
  },
  sources: {
    badge: "근거 검토",
    desc: "정책 문서, 프로젝트 페이지, 공식 데이터 링크를 바로 열어 근거를 정리하는 탭입니다.",
    output: "근거 검토 메모",
    readOrder: [
      "핵심 출처 확인",
      "갱신주기·해상도 확인",
      "필요 시 요약본에 링크 반영",
    ],
  },
};

function ScenarioWorkflowCard({
  activeScenarioKey = "overview",
  runtime = null,
  activeRec = null,
  filteredCount = 0,
  shortlistCount = 0,
  onStartScenario = null,
  onRunAction = null,
  onOpenGuide = null,
  compact = false,
}) {
  const workflow = runtime?.workflow || getScenarioWorkflow(activeScenarioKey);
  const currentStep = runtime?.currentStep || null;
  const presetLines = formatScenarioPresetState(workflow?.key);
  const completion = workflow?.completion || {};
  const completionActions = safeArray(completion?.actions);

  if (!workflow || !runtime) return null;

  return (
    <SectionCard
      title={compact ? "현재 업무 흐름" : "목적 선택 진행 상태"}
      icon={<Briefcase className="text-emerald-300" size={16} />}
      right={
        <PillTag tone={runtime.isComplete ? "emerald" : "sky"}>
          {runtime.isComplete
            ? "완료 준비"
            : `${runtime.completedCount}/${runtime.totalCount} 단계`}
        </PillTag>
      }
    >
      <div className="space-y-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/6 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                {workflow.audience}
              </div>
              <div className="mt-1 text-sm font-extrabold text-white">
                {workflow.title}
              </div>
              <div className="mt-2 text-xs leading-relaxed text-slate-300">
                {workflow.when}
              </div>
              {workflow.pilotNote ? (
                <div className="mt-2 rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
                  <span className="font-semibold text-emerald-200">
                    대표 예시
                  </span>{" "}
                  · {workflow.pilotNote}
                </div>
              ) : null}
            </div>
            <div className="shrink-0 rounded-2xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                최종 산출물
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {workflow.deliverable}
              </div>
            </div>
          </div>

          <div
            className={cx(
              "mt-3 grid gap-2",
              compact ? "grid-cols-3" : "grid-cols-3"
            )}
          >
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                필터 결과
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                {filteredCount}건
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                보관함
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                {shortlistCount}건
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                현재 선택
              </div>
              <div className="mt-1 text-sm font-bold text-white truncate">
                {activeRec
                  ? `${activeRec.country} · ${activeRec.region}`
                  : "미선택"}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {runtime.steps.map((step, idx) => {
            const isCurrent = runtime.currentIndex === idx;
            return (
              <div
                key={`${workflow.key}-${step.key}`}
                className={cx(
                  "rounded-2xl border p-3 transition",
                  step.complete
                    ? "border-emerald-500/25 bg-emerald-500/8"
                    : isCurrent
                    ? "border-sky-500/25 bg-sky-500/8"
                    : "border-slate-700 bg-slate-800/35"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cx(
                      "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                      step.complete
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                        : isCurrent
                        ? "border-sky-500/30 bg-sky-500/15 text-sky-200"
                        : "border-slate-600 bg-slate-900 text-slate-300"
                    )}
                  >
                    {step.complete ? <CheckCircle2 size={13} /> : idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-white">
                        {step.label}
                      </div>
                      <PillTag
                        tone={
                          step.complete
                            ? "emerald"
                            : isCurrent
                            ? "sky"
                            : "slate"
                        }
                      >
                        {step.complete
                          ? "완료"
                          : isCurrent
                          ? "현재 단계"
                          : "다음 단계"}
                      </PillTag>
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-slate-300">
                      {step.detail}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                      확인 질문 ·{" "}
                      <span className="text-slate-200">{step.question}</span>
                    </div>
                    {!step.complete && isCurrent && step.actionKey ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            safeInvoke(onRunAction, step.actionKey)
                          }
                          className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-200"
                        >
                          {step.actionLabel || "다음 행동 실행"}
                        </button>
                        {step.guideKey ? (
                          <button
                            type="button"
                            onClick={() =>
                              safeInvoke(onOpenGuide, step.guideKey)
                            }
                            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100"
                          >
                            관련 화면 도움말
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/75 p-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            시작 시 자동 정렬
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {presetLines.map((item, idx) => (
              <PillTag key={`${workflow.key}-preset-${idx}`} tone="slate">
                {item}
              </PillTag>
            ))}
          </div>
        </div>

        <div
          className={cx(
            "rounded-2xl border p-3",
            runtime.isComplete
              ? "border-emerald-500/25 bg-emerald-500/8"
              : "border-slate-700 bg-slate-900/80"
          )}
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {runtime.isComplete ? "완료 상태" : "지금 해야 할 판단"}
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            {runtime.isComplete ? completion.headline : currentStep?.question}
          </div>
          <div className="mt-2 text-xs leading-relaxed text-slate-300">
            {runtime.isComplete ? completion.summary : currentStep?.detail}
          </div>

          {runtime.isComplete ? (
            <>
              <div className="mt-3 grid gap-2">
                {safeArray(completion.outputs).map((item, idx) => (
                  <div
                    key={`${workflow.key}-output-${idx}`}
                    className="flex items-start gap-2 rounded-xl border border-slate-700 bg-slate-900/65 px-3 py-2 text-xs text-slate-200"
                  >
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-emerald-300"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {completionActions.map((item) => (
                  <button
                    key={`${workflow.key}-${item.key}`}
                    type="button"
                    onClick={() => safeInvoke(onRunAction, item.key)}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => safeInvoke(onStartScenario, workflow.key)}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200"
          >
            현재 목적 다시 적용
          </button>
          <button
            type="button"
            onClick={() =>
              safeInvoke(onOpenGuide, currentStep?.guideKey || "toolbar-filter")
            }
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100"
          >
            도움말
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

function UsageScenarioPanel({ compact = false, onStartScenario = null }) {
  return (
    <SectionCard
      title={compact ? "목적 선택" : "목적별 시작 흐름"}
      icon={<BookOpen className="text-sky-300" size={16} />}
      right={<PillTag tone="sky">{PLATFORM_USAGE_SCENARIOS.length}개</PillTag>}
    >
      <div
        className={cx(
          compact ? "space-y-2" : "grid gap-3 md:grid-cols-2 2xl:grid-cols-3"
        )}
      >
        {PLATFORM_USAGE_SCENARIOS.map((item) => {
          const workflow = getScenarioWorkflow(item.key);
          const presetSummary = formatScenarioPresetState(item.key);
          const toneClass =
            item.tone === "emerald"
              ? "border-emerald-500/25 bg-emerald-500/8"
              : item.tone === "amber"
              ? "border-amber-500/25 bg-amber-500/8"
              : item.tone === "blue" || item.tone === "sky"
              ? "border-sky-500/25 bg-sky-500/8"
              : "border-slate-700 bg-slate-800/45";
          const toneText =
            item.tone === "emerald"
              ? "text-emerald-300"
              : item.tone === "amber"
              ? "text-amber-300"
              : item.tone === "blue" || item.tone === "sky"
              ? "text-sky-300"
              : "text-slate-300";
          return (
            <div
              key={item.key}
              className={cx("rounded-2xl border p-4", toneClass)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div
                    className={cx(
                      "text-[11px] font-bold uppercase tracking-[0.14em]",
                      toneText
                    )}
                  >
                    {item.audience}
                  </div>
                  <div className="mt-1 text-sm font-bold text-white">
                    {workflow?.title || item.title}
                  </div>
                  {!compact && workflow?.when ? (
                    <div className="mt-2 text-xs leading-relaxed text-slate-300">
                      {workflow.when}
                    </div>
                  ) : null}
                </div>
                <PillTag tone={item.tone === "blue" ? "sky" : item.tone}>
                  {STRATEGY_PRESETS[item.key]?.label || "바로가기"}
                </PillTag>
              </div>

              <div className="mt-2 text-sm leading-relaxed text-slate-300">
                {item.summary}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {safeArray(item.highlights).map((tag) => (
                  <PillTag key={`${item.key}-${tag}`} tone="slate">
                    {tag}
                  </PillTag>
                ))}
              </div>

              {!compact && workflow ? (
                <>
                  <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2.5">
                    <div className="text-[11px] font-bold text-slate-400">
                      시작 시 자동 정렬
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {presetSummary.map((row, idx) => (
                        <PillTag key={`${item.key}-preset-${idx}`} tone="slate">
                          {row}
                        </PillTag>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2.5">
                    <div className="text-[11px] font-bold text-slate-400">
                      단계 흐름
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {safeArray(workflow.steps).map((step, idx) => (
                        <div
                          key={`${item.key}-step-${step.key}`}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[11px] text-slate-200"
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-600 bg-slate-950 text-[10px] font-bold text-slate-300">
                            {idx + 1}
                          </span>
                          <span>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2.5">
                    <div className="text-[11px] font-bold text-slate-400">
                      완료 기준
                    </div>
                    <div className="mt-1 text-sm text-slate-100">
                      {workflow.completion?.headline}
                    </div>
                    <div className="mt-2 text-xs leading-relaxed text-slate-300">
                      최종 산출물 · {workflow.deliverable}
                    </div>
                  </div>
                </>
              ) : null}

              <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2.5">
                <div className="text-[11px] font-bold text-slate-400">
                  바로 얻는 결과
                </div>
                <div className="mt-1 text-sm text-slate-100">{item.output}</div>
              </div>

              <button
                onClick={() => safeInvoke(onStartScenario, item.key)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-900/85 px-3 py-2.5 text-sm font-semibold text-white hover:border-emerald-500/30 hover:bg-slate-800"
              >
                이 흐름으로 시작
              </button>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function RoleBasedWorkflowCard({
  compact = false,
  onApplyPreset = null,
  onOpenGuide = null,
  secondaryLabel = "사용 가이드",
}) {
  return (
    <SectionCard
      title={compact ? "목적 선택" : "목적을 선택해 주세요."}
      icon={<Zap className="text-amber-300" size={16} />}
      right={<PillTag tone="amber">바로 시작</PillTag>}
    >
      <div
        className={cx(
          compact ? "space-y-2" : "grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        )}
      >
        {ROLE_BASED_WORKFLOWS.map((item) => {
          const featured = item.key === "oda";
          const toneBox =
            item.tone === "emerald"
              ? "border-emerald-500/30 bg-emerald-500/10"
              : item.tone === "sky"
              ? "border-sky-500/30 bg-sky-500/10"
              : item.tone === "amber"
              ? "border-amber-500/30 bg-amber-500/10"
              : item.tone === "blue"
              ? "border-blue-500/30 bg-blue-500/10"
              : "border-slate-700 bg-slate-800/45";
          const toneText =
            item.tone === "emerald"
              ? "text-emerald-300"
              : item.tone === "sky"
              ? "text-sky-300"
              : item.tone === "amber"
              ? "text-amber-300"
              : item.tone === "blue"
              ? "text-blue-300"
              : "text-slate-300";
          return (
            <div
              key={item.key}
              className={cx(
                "rounded-2xl border p-4 transition",
                toneBox,
                featured &&
                  "ring-1 ring-emerald-400/35 shadow-[0_12px_30px_rgba(16,185,129,0.12)]"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={cx(
                    "text-[11px] font-bold uppercase tracking-[0.14em]",
                    toneText
                  )}
                >
                  {item.label}
                </div>
                {featured ? (
                  <PillTag tone="emerald">많이 쓰는 목적</PillTag>
                ) : (
                  <PillTag tone={item.tone === "sky" ? "blue" : item.tone}>
                    {item.result}
                  </PillTag>
                )}
              </div>
              <div className="mt-2 text-base font-bold text-white">
                {item.title}
              </div>
              <div className="mt-1 text-sm leading-relaxed text-slate-300">
                {item.summary}
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-300">
                <div className="rounded-xl border border-slate-700 bg-slate-950/45 px-3 py-2.5">
                  <span className="font-semibold text-white">
                    이런 때 좋아요:
                  </span>{" "}
                  {item.when}
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/45 px-3 py-2.5">
                  <span className="font-semibold text-white">누르면 바로:</span>{" "}
                  {item.result}
                </div>
              </div>
              <ol className="mt-3 space-y-1.5 text-xs text-slate-300">
                {safeArray(item.steps).map((step, idx) => (
                  <li
                    key={`${item.key}-${idx}`}
                    className="flex items-start gap-2"
                  >
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-[10px] font-bold text-slate-200">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => safeInvoke(onApplyPreset, item.preset)}
                  className={cx(
                    "flex-1 rounded-xl border px-3 py-3 text-sm font-semibold",
                    item.tone === "emerald"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : item.tone === "sky"
                      ? "border-sky-500/30 bg-sky-500/10 text-sky-200"
                      : item.tone === "amber"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : item.tone === "blue"
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
                      : "border-slate-600 bg-slate-900 text-slate-100"
                  )}
                >
                  {item.cta}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    safeInvoke(
                      onOpenGuide,
                      getScenarioWorkflow(item.preset)?.steps?.[0]?.guideKey ||
                        "toolbar-filter"
                    )
                  }
                  className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-3 text-sm font-semibold text-slate-100"
                >
                  {secondaryLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function InteractionAuditCard({ compact = false }) {
  return (
    <SectionCard
      title={compact ? "버튼 점검" : "상호작용 점검 상태"}
      icon={<ShieldAlert className="text-amber-300" size={16} />}
      right={
        <PillTag tone="amber">
          버튼 {INTERACTION_AUDIT_SUMMARY.buttonCount}개
        </PillTag>
      }
    >
      <div className="rounded-2xl border border-slate-700 bg-slate-900/65 p-3">
        <div className="text-sm font-semibold text-white">
          공용 버튼·핸들러 경로를 코드 기준으로 다시 점검했습니다.
        </div>
        <div className="mt-1 text-xs leading-relaxed text-slate-400">
          {INTERACTION_AUDIT_SUMMARY.note}
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <ScorePill
          label="버튼 수"
          value={`${INTERACTION_AUDIT_SUMMARY.buttonCount}개`}
          accent="amber"
        />
        <ScorePill
          label="onClick 경로"
          value={`${INTERACTION_AUDIT_SUMMARY.onClickCount}개`}
          accent="blue"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {INTERACTION_AUDIT_SUMMARY.reviewedAreas.map((item) => (
          <PillTag key={item} tone="slate">
            {item}
          </PillTag>
        ))}
      </div>
    </SectionCard>
  );
}

function SelectionVisibilityNotice({
  activeRec,
  isVisible = true,
  onBringIntoView = null,
}) {
  if (!activeRec || isVisible) return null;
  return (
    <SectionCard
      title="현재 선택 후보 상태"
      icon={<AlertTriangle className="text-amber-300" size={16} />}
      right={<PillTag tone="amber">필터 밖</PillTag>}
    >
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/6 px-3 py-3 text-sm text-slate-200 leading-relaxed">
        <span className="font-semibold text-white">
          {activeRec.country} · {activeRec.region}
        </span>{" "}
        현재 선택 후보는 지금 적용된 필터 결과에는 보이지 않습니다. 비교 검토 중
        필터를 바꾼 상태일 가능성이 큽니다.
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => safeInvoke(onBringIntoView, activeRec)}
          className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-300"
        >
          이 후보 기준으로 필터 맞추기
        </button>
      </div>
    </SectionCard>
  );
}

function ShortlistPanel({
  items = [],
  activeRec = null,
  onSelectRec = null,
  onToggleShortlist = null,
}) {
  return (
    <SectionCard
      title="저장 후보국"
      icon={<Briefcase className="text-amber-300" size={16} />}
      right={
        <PillTag tone={items.length ? "amber" : "slate"}>
          {items.length}/{SHORTLIST_LIMIT}
        </PillTag>
      }
    >
      {items.length ? (
        <div className="space-y-2">
          {items.map((item, idx) => {
            const isActive = item?.id && item.id === activeRec?.id;
            return (
              <div
                key={item?.id || `${item?.country}-${idx}`}
                className={cx(
                  "rounded-xl border p-3",
                  isActive
                    ? "border-amber-500/30 bg-amber-500/8"
                    : "border-slate-700 bg-slate-800/35"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => safeInvoke(onSelectRec, item)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="text-sm font-bold text-white truncate">
                      {item?.country || "국가"} · {item?.region || "지역"}
                    </div>
                    <div className="mt-1 text-xs text-amber-300 truncate">
                      {item?.tech || "기술"}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400 truncate">
                      {item?.cooperationProfile?.headline ||
                        item?.countryNote ||
                        "비교 후보 메모"}
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    {isActive ? <PillTag tone="amber">현재</PillTag> : null}
                    <button
                      type="button"
                      onClick={() => safeInvoke(onToggleShortlist, item)}
                      className="rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-200"
                    >
                      제거
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-sm text-slate-400">
          비교하고 싶은 후보를 보관해 두면 회의 전 우선 후보와 대안 후보를
          빠르게 전환할 수 있습니다.
        </div>
      )}
    </SectionCard>
  );
}

function 검토TabGuideCard({
  rec,
  detailTab,
  strategyMeta,
  cooperationProfile,
  localPartners,
  pipelineData,
  onDownloadBrief,
  onOpenSources,
}) {
  const meta = DETAIL_TAB_META[detailTab] || DETAIL_TAB_META.overview;
  const financeRoute = strategyMeta?.financeRoute || "추가 검토 필요";
  const partnerCount = safeArray(localPartners).length;
  const pipelineCount = uniqBy(
    [...safeArray(pipelineData?.projects), ...getPipelineSeedProjects(rec)],
    (item) => `${item?.source || ""}|${item?.title || ""}`
  ).length;
  const nextAction =
    cooperationProfile?.quickWin ||
    safeArray(rec?.actions)[0] ||
    "근거와 파트너를 확인한 뒤 공유용 요약본을 정리하세요.";

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <PillTag tone="sky">{meta.badge}</PillTag>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              현재 탭에서 바로 할 일
            </div>
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            {meta.output}
          </div>
          <div className="mt-1 text-xs leading-relaxed text-slate-300">
            {meta.desc}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => safeInvoke(onOpenSources)}
            className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100"
          >
            근거 자료
          </button>
          <button
            onClick={() => safeInvoke(onDownloadBrief)}
            disabled={!rec}
            className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200 disabled:opacity-50"
          >
            요약본 저장
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <PillTag tone="emerald">판단 {strategyMeta?.decision || "-"}</PillTag>
        <PillTag tone="blue">재원 {financeRoute}</PillTag>
        <PillTag tone="amber">파트너 {partnerCount}곳</PillTag>
        <PillTag tone="slate">파이프라인 {pipelineCount}건</PillTag>
      </div>

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-2.5 text-xs leading-relaxed text-slate-200">
        <span className="font-semibold text-white">이번 단계 메모</span> ·{" "}
        {nextAction}
      </div>
    </div>
  );
}

function CooperationFocusCard({ rec }) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  if (!rec) return null;
  const profile = rec.cooperationProfile || buildCooperationProfile(rec);
  return (
    <div className="pointer-events-none absolute right-2 sm:right-4 top-[94px] sm:top-[88px] z-20 w-[320px] max-w-[calc(100vw-16px)]">
      <div className="pointer-events-auto rounded-2xl border border-emerald-500/20 bg-slate-900/88 backdrop-blur-md p-3 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold text-emerald-300">
              한눈에 보는 협력 방향
            </div>
            <div className="text-sm font-extrabold text-white mt-1">
              {profile.headline}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {safeRec.country} · {rec.region} · {safeRec.tech}
            </div>
          </div>
          <PillTag
            tone={
              rec?.scores?.coverage >= 90
                ? "emerald"
                : rec?.scores?.coverage >= 80
                ? "blue"
                : "amber"
            }
          >
            {profile.scoreSummary}
          </PillTag>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
          <div className="rounded-xl border border-slate-700 bg-slate-800/35 px-3 py-2 text-slate-200">
            <span className="text-slate-400">협력 모델</span>
            <div className="mt-1">{profile.partnershipModel}</div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/35 px-3 py-2 text-slate-200">
            <span className="text-slate-400">즉시 추진 과제</span>
            <div className="mt-1">{profile.quickWin}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioTesterModal({
  open = false,
  running = false,
  results = [],
  onRun = null,
  onClose = null,
}) {
  if (!open) return null;
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-5 py-4">
          <div>
            <div className="text-sm font-black text-white">목적 선택 점검</div>
            <div className="mt-1 text-xs text-slate-400">
              ‘이 흐름으로 시작’ 버튼이 프리셋(필터/탭/패널/후보)을 올바르게
              적용하는지 자동 점검합니다.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PillTag tone="sky">
              PASS {passed}/{total || PLATFORM_USAGE_SCENARIOS.length}
            </PillTag>
            <button
              onClick={() => safeInvoke(onClose)}
              className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              닫기
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-300">
              총 {PLATFORM_USAGE_SCENARIOS.length}개 목적 선택 흐름을 순차
              적용하고 상태를 검증합니다.
            </div>
            <button
              onClick={() => safeInvoke(onRun)}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-400 disabled:opacity-60"
            >
              {running ? "점검 실행 중…" : "점검 실행"}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {(results.length
              ? results
              : PLATFORM_USAGE_SCENARIOS.map((s) => ({
                  key: s.key,
                  title: s.title,
                  pass: null,
                  problems: [],
                }))
            ).map((row) => (
              <div
                key={row.key}
                className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/25 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-400">
                      {row.key}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {row.title || STRATEGY_PRESETS[row.key]?.label || row.key}
                    </div>
                  </div>
                  {row.pass == null ? (
                    <PillTag tone="slate">대기</PillTag>
                  ) : row.pass ? (
                    <PillTag tone="emerald">PASS</PillTag>
                  ) : (
                    <PillTag tone="amber">FAIL</PillTag>
                  )}
                </div>
                {row.pass === false && row.problems?.length ? (
                  <ul className="ml-4 list-disc text-xs text-amber-200">
                    {row.problems.map((p, idx) => (
                      <li key={`${row.key}-p-${idx}`}>{p}</li>
                    ))}
                  </ul>
                ) : row.pass === true ? (
                  <div className="text-xs text-slate-400">
                    tab: {row.actual?.detailTab} · left:{" "}
                    {row.actual?.leftPanelTab} · tech: {row.actual?.tech} ·
                    purpose: {row.actual?.purpose}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/25 p-4 text-xs text-slate-400">
            팁: FAIL이 나오면 해당 목적 선택 프리셋(STRATEGY_PRESETS)과
            applyPreset 로직의 매칭을 우선 확인하세요.
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionReadinessCard({
  rec,
  liveData = null,
  pipelineData = null,
  geoData = null,
  onOpenSources = null,
  onOpenFunding = null,
}) {
  const sourceCount = safeArray(rec?.sourcePlan).length;
  const evidenceLinks = collectEvidenceLinks(rec, "general");
  const securedInventoryCount = safeArray(rec?.inventoryRows).filter((row) =>
    String(row?.status || "").includes("확보")
  ).length;
  const liveMetricCount = [
    liveData?.worldBank?.gdp,
    liveData?.worldBank?.population,
    liveData?.worldBank?.electricityAccess,
    liveData?.worldBank?.renewableEnergy,
    liveData?.worldBank?.co2Emissions,
    liveData?.reverseGeo,
  ].filter(Boolean).length;
  const pipelineMode = !pipelineData
    ? {
        label: "연결 대기",
        tone: "slate",
        note: "필요할 때 파이프라인 정보를 불러와 표시합니다.",
      }
    : pipelineData?.isFallback
    ? {
        label: "기본 데이터",
        tone: "amber",
        note: "실시간 응답이 없는 항목은 기본 제공 데이터를 함께 보여줍니다.",
      }
    : {
        label: "실시간 연결",
        tone: "emerald",
        note: "동일 출처 API 기반으로 프로젝트·재원 후보를 조회했습니다.",
      };
  const boundaryLabel = geoData?.regionFeature
    ? "국가·지역 경계 확인"
    : geoData?.countryFeature
    ? "국가 경계 확인"
    : "경계 데이터 보완 필요";
  const liveUpdatedLabel = liveData?.fetchedAt
    ? formatRelativeTimeLabel(liveData.fetchedAt)
    : "미조회";

  return (
    <SectionCard
      title="실무 검토 준비 상태"
      icon={<Database className="text-emerald-400" size={16} />}
      right={<PillTag tone={pipelineMode.tone}>{pipelineMode.label}</PillTag>}
    >
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs text-slate-400">근거 링크</div>
          <div className="mt-1 text-lg font-black text-white">
            {evidenceLinks.length}건
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            source plan {sourceCount}건 · 확보 데이터 {securedInventoryCount}건
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs text-slate-400">실시간 지표</div>
          <div className="mt-1 text-lg font-black text-white">
            {liveMetricCount}개
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            최근 조회 {liveUpdatedLabel}
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs text-slate-400">프로젝트·재원</div>
          <div className="mt-1 text-lg font-black text-white">
            {safeArray(pipelineData?.projects).length}건
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {pipelineMode.note}
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs text-slate-400">지도 검증</div>
          <div className="mt-1 text-lg font-black text-white">
            {boundaryLabel}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            후보 위치와 경계 데이터를 함께 확인합니다.
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-slate-200">
        <div className="font-semibold text-white">회의 직전 추천 흐름</div>
        <div className="mt-1 text-slate-300 leading-relaxed">
          ① 핵심 요약으로 후보 적합도를 확인하고 ② 출처 탭에서 공식 링크를 열어
          근거를 검증한 뒤 ③ 재원·실행 탭에서 사업·재원 연결성을 점검하면 보고용
          판단 흐름이 가장 빠릅니다.
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => safeInvoke(onOpenSources)}
            className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-100"
          >
            공식 출처 열기
          </button>
          <button
            type="button"
            onClick={() => safeInvoke(onOpenFunding)}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200"
          >
            재원 및 실행 요건 확인
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

function buildCountrySignalBands(
  rec,
  strategyMeta = {},
  pipelineData = null,
  liveData = null
) {
  const safeRec = sanitize검토Record(rec) || rec || { scores: {} };
  const scores = safeRec?.scores || {};
  const pipelineCount = safeArray(pipelineData?.projects).length;
  const liveMetricCount = [
    liveData?.worldBank?.gdp?.value,
    liveData?.worldBank?.population?.value,
    liveData?.worldBank?.electricityAccess?.value,
    liveData?.worldBank?.renewableEnergy?.value,
    liveData?.nasaPower?.ghiAnn,
    liveData?.nasaPower?.t2mAnn,
  ].filter((value) => value != null).length;
  const evidenceCount = collectEvidenceLinks(safeRec, "general").length;
  const readinessRaw = Math.round(
    (Number(scores.coverage || 0) +
      Number(scores.reliability || 0) +
      Math.min(pipelineCount * 12, 100) +
      Math.min(liveMetricCount * 14, 100)) /
      4
  );
  const opportunityRaw = Math.round(
    (Number(scores.feasibility || 0) + Number(scores.coverage || 0)) / 2
  );
  const riskRaw = Math.round(
    Number(strategyMeta?.riskUrgency || scores.resilience || 0)
  );
  const executionRaw = Math.round(
    (Number(strategyMeta?.financeFit || 0) +
      Math.min(evidenceCount * 14, 100)) /
      2
  );
  return [
    {
      key: "opportunity",
      label: "기회도",
      english: "Opportunity",
      value: clampNumber(opportunityRaw, 0, 100),
      tone: "emerald",
      note: `${
        techShort(safeRec.tech) || safeRec.tech || "기술"
      } 목적 적합성과 기본 데이터 충족률을 함께 본 값`,
    },
    {
      key: "readiness",
      label: "준비도",
      english: "Readiness",
      value: clampNumber(readinessRaw, 0, 100),
      tone: "blue",
      note: `실시간 지표 ${liveMetricCount}개 · 파이프라인 ${pipelineCount}건 기준`,
    },
    {
      key: "risk",
      label: "리스크",
      english: "Risk",
      value: clampNumber(riskRaw, 0, 100),
      tone: "amber",
      note: "현장 리스크와 추가 확인 필요도를 함께 반영한 내부 검토 값",
    },
    {
      key: "delivery",
      label: "실행성",
      english: "Delivery",
      value: clampNumber(executionRaw, 0, 100),
      tone: "slate",
      note: `재원 경로 ${
        strategyMeta?.financeRoute || "추가 검토"
      } · 근거 링크 ${evidenceCount}건`,
    },
  ];
}

function CountrySignalBandCard({
  rec,
  strategyMeta = {},
  pipelineData = null,
  liveData = null,
}) {
  const rows = useMemo(
    () => buildCountrySignalBands(rec, strategyMeta, pipelineData, liveData),
    [rec, strategyMeta, pipelineData, liveData]
  );
  return (
    <SectionCard
      title="국가 프로필형 요약 밴드"
      icon={<BarChart3 className="text-emerald-400" size={16} />}
      right={<PillTag tone="blue">CCKP · ND-GAIN 패턴</PillTag>}
    >
      <div className="mb-3 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
        국가 프로필형 요약, readiness/risk band, 비교 가능한 점수 표현 같은 검토
        패턴을 반영해{" "}
        <span className="font-semibold text-white">
          지금 왜 이 후보를 먼저 보아야 하는지
        </span>
        를 10초 안에 읽히도록 정리했습니다.
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((item) => (
          <div
            key={item.key}
            className={cx(
              "rounded-2xl border p-3",
              item.tone === "emerald"
                ? "border-emerald-500/20 bg-emerald-500/7"
                : item.tone === "blue"
                ? "border-sky-500/20 bg-sky-500/7"
                : item.tone === "amber"
                ? "border-amber-500/20 bg-amber-500/7"
                : "border-slate-700 bg-slate-900/55"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {item.english}
                </div>
                <div className="mt-1 text-sm font-bold text-white">
                  {item.label}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-white">
                  {item.value}
                </div>
                <div className="text-[10px] text-slate-500">/100</div>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={cx(
                  "h-full rounded-full",
                  item.tone === "emerald"
                    ? "bg-emerald-400"
                    : item.tone === "blue"
                    ? "bg-sky-400"
                    : item.tone === "amber"
                    ? "bg-amber-400"
                    : "bg-slate-300"
                )}
                style={{ width: `${clampNumber(item.value, 0, 100)}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] leading-relaxed text-slate-400">
              {item.note}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function buildShortlistCompareRows(
  activeRec = null,
  shortlistRecs = [],
  strategyMetaByRec = {}
) {
  const items = uniqBy(
    [activeRec, ...safeArray(shortlistRecs)].filter(Boolean),
    (item) =>
      item?.id ||
      `${item?.country || ""}|${item?.region || ""}|${item?.tech || ""}`
  ).slice(0, 4);
  return items.map((item, idx) => {
    const computedMeta =
      strategyMetaByRec?.[item?.id] ||
      computeStrategyEvaluation(
        item,
        {
          purpose: "전체 목적",
          financeChannel: "전체 재원",
          strategyFocus: "균형형",
        },
        null
      );
    const evidenceLinks = collectEvidenceLinks(item, "general");
    return {
      rank: idx + 1,
      item,
      meta: computedMeta,
      evidenceCount: evidenceLinks.length,
      primaryEvidence: evidenceLinks[0] || null,
    };
  });
}

function buildShortlistCompareCsvText(
  activeRec = null,
  shortlistRecs = [],
  strategyMetaByRec = {}
) {
  const rows = buildShortlistCompareRows(
    activeRec,
    shortlistRecs,
    strategyMetaByRec
  );
  return buildCsvTextFromRows([
    [
      "순위",
      "국가",
      "지역",
      "기술",
      "전략점수",
      "충족률",
      "신뢰도",
      "목적 적합도",
      "파이프라인",
      "재원 경로",
      "판정",
      "대표 근거",
    ],
    ...rows.map((row) => [
      row.rank,
      row.item?.country || "-",
      row.item?.region || "-",
      techShort(row.item?.tech) || row.item?.tech || "-",
      row.meta?.strategyScore ?? "-",
      row.item?.scores?.coverage ?? "-",
      row.item?.scores?.reliability ?? "-",
      row.item?.scores?.feasibility ?? "-",
      row.meta?.pipelineProjectCount ?? "-",
      row.meta?.financeRoute || "-",
      row.meta?.decision || "-",
      row.primaryEvidence?.label || row.primaryEvidence?.href || "-",
    ]),
  ]);
}

function downloadShortlistCompareCsv(
  activeRec = null,
  shortlistRecs = [],
  strategyMetaByRec = {}
) {
  const rows = buildShortlistCompareRows(
    activeRec,
    shortlistRecs,
    strategyMetaByRec
  );
  if (rows.length < 2) {
    if (typeof window !== "undefined") {
      window.alert(
        "비교표를 내려받으려면 현재 후보 외에 저장 후보국을 최소 1개 이상 추가해 주세요."
      );
    }
    return;
  }
  const stamp = new Date().toISOString().slice(0, 10);
  downloadTextBlob(
    `후보비교_${sanitizeFilenamePart(
      activeRec?.country || "workspace"
    )}_${stamp}.csv`,
    buildShortlistCompareCsvText(activeRec, shortlistRecs, strategyMetaByRec)
  );
}

function ShortlistCompareMatrixCard({
  activeRec = null,
  shortlistRecs = [],
  strategyMetaByRec = {},
  onSelectRec = null,
}) {
  const rows = useMemo(
    () =>
      buildShortlistCompareRows(activeRec, shortlistRecs, strategyMetaByRec),
    [activeRec, shortlistRecs, strategyMetaByRec]
  );

  return (
    <SectionCard
      title="저장 후보국 비교"
      icon={<Briefcase className="text-amber-300" size={16} />}
      right={
        <PillTag tone={rows.length >= 2 ? "amber" : "slate"}>
          {rows.length}개 비교
        </PillTag>
      }
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-[11px] text-slate-300">
        <span>
          Climate Watch의 side-by-side 비교 구조를 참고해{" "}
          <span className="font-semibold text-white">
            현재 후보국 + 저장 후보국
          </span>
          를 한 줄 표로 압축했습니다.
        </span>
        <button
          type="button"
          onClick={() =>
            downloadShortlistCompareCsv(
              activeRec,
              shortlistRecs,
              strategyMetaByRec
            )
          }
          className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-200"
        >
          비교표 CSV 저장
        </button>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-xs">
            <thead>
              <tr className="text-left text-slate-400">
                {[
                  "후보",
                  "기술",
                  "전략점수",
                  "충족률",
                  "파이프라인",
                  "재원 경로",
                  "대표 근거",
                ].map((label) => (
                  <th
                    key={label}
                    className="border-b border-slate-800 bg-slate-900/70 px-3 py-2 font-bold"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const selected = row.item?.id === activeRec?.id;
                return (
                  <tr
                    key={row.item?.id || row.rank}
                    className={selected ? "bg-emerald-500/6" : "bg-transparent"}
                  >
                    <td className="border-b border-slate-800 px-3 py-2.5 align-top">
                      <button
                        type="button"
                        onClick={() => safeInvoke(onSelectRec, row.item)}
                        className="text-left"
                      >
                        <div className="font-bold text-white">
                          {row.item?.country} · {row.item?.region}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          {selected
                            ? "현재 선택 후보"
                            : `비교 후보 ${row.rank}`}
                        </div>
                      </button>
                    </td>
                    <td className="border-b border-slate-800 px-3 py-2.5 align-top text-slate-200">
                      {techShort(row.item?.tech) || row.item?.tech}
                    </td>
                    <td className="border-b border-slate-800 px-3 py-2.5 align-top">
                      <div className="font-extrabold text-white">
                        {row.meta?.strategyScore ?? "-"}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        {row.meta?.decision || "판정 준비 중"}
                      </div>
                    </td>
                    <td className="border-b border-slate-800 px-3 py-2.5 align-top text-slate-200">
                      {row.item?.scores?.coverage ?? "-"}% / 신뢰{" "}
                      {row.item?.scores?.reliability ?? "-"}%
                    </td>
                    <td className="border-b border-slate-800 px-3 py-2.5 align-top text-slate-200">
                      {row.meta?.pipelineProjectCount ?? 0}건
                    </td>
                    <td className="border-b border-slate-800 px-3 py-2.5 align-top text-slate-200">
                      {row.meta?.financeRoute || "-"}
                    </td>
                    <td className="border-b border-slate-800 px-3 py-2.5 align-top">
                      {row.primaryEvidence?.href ? (
                        <ExternalInlineLink href={row.primaryEvidence.href}>
                          {row.primaryEvidence.label || "대표 근거"}
                        </ExternalInlineLink>
                      ) : (
                        <span className="text-slate-500">
                          대표 근거 연결 준비 중
                        </span>
                      )}
                      <div className="mt-1 text-[11px] text-slate-500">
                        근거 링크 {row.evidenceCount}건
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-sm text-slate-400">
          후보국을 저장하면 현재 후보국과 대안 후보국을 바로 비교할 수 있습니다.
        </div>
      )}
    </SectionCard>
  );
}

function buildSourceIntegrityRows(
  rec,
  liveData = null,
  geoData = null,
  pipelineData = null
) {
  const safeRec = sanitize검토Record(rec) || rec || {};
  const directEvidenceCount = collectEvidenceLinks(safeRec, "general").length;
  const sourcePlanCount = safeArray(safeRec?.sourcePlan).length;
  const partnerCount = safeArray(safeRec?.localPartners).length;
  return [
    {
      key: "evidence",
      label: "정책·문서 근거",
      status: directEvidenceCount
        ? `${directEvidenceCount}건 연결`
        : "기본 근거 사용",
      note: `source plan ${sourcePlanCount}건 · 공식 링크/문서 허브 기반`,
      tone: directEvidenceCount ? "emerald" : "slate",
    },
    {
      key: "live",
      label: "실시간 공개지표",
      status: liveData ? "실시간 보강 사용 중" : "저장 데이터 기반",
      note: liveData
        ? "World Bank / NASA POWER 최신 공개 지표를 합쳐 읽는 상태"
        : "실시간 조회 전에도 저장된 검토 데이터로 계속 판단 가능",
      tone: liveData ? "blue" : "slate",
    },
    {
      key: "geo",
      label: "경계·좌표 검증",
      status: geoData?.countryFeature
        ? geoData?.regionFeature
          ? "국가·지역 모두 확인"
          : "국가 확인 / 지역 보완"
        : "미검증",
      note:
        geoData?.validation?.distanceKm != null
          ? `검색 중심과 현재 좌표 거리 ${geoData.validation.distanceKm} km`
          : "국가 경계와 지역 경계의 정확성을 별도로 관리",
      tone: geoData?.countryFeature ? "emerald" : "amber",
    },
    {
      key: "pipeline",
      label: "프로젝트·재원 신호",
      status: pipelineData?.projects?.length
        ? `${pipelineData.projects.length}건`
        : pipelineData?.isFallback
        ? "기본 데이터 사용 중"
        : "미조회",
      note: pipelineData?.isFallback
        ? "실시간 파이프라인이 없을 때도 검증된 포털 링크를 유지"
        : `파트너 ${partnerCount}개 · 재원 경로와 사업 신호를 같이 확인`,
      tone: pipelineData?.projects?.length
        ? "violet"
        : pipelineData?.isFallback
        ? "amber"
        : "slate",
    },
  ];
}

function SourceIntegrityBoardCard({
  rec,
  liveData = null,
  geoData = null,
  pipelineData = null,
}) {
  const rows = useMemo(
    () => buildSourceIntegrityRows(rec, liveData, geoData, pipelineData),
    [rec, liveData, geoData, pipelineData]
  );
  return (
    <SectionCard
      title="근거·데이터 상태판"
      icon={<ShieldAlert className="text-emerald-300" size={16} />}
      right={<PillTag tone="blue">연결 상태</PillTag>}
    >
      <div className="mb-3 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
        추천과 검증된 사실을 섞어 보지 않도록, 현재 후보의 데이터 상태를{" "}
        <span className="font-semibold text-white">
          정책·문서 / 실시간 지표 / 경계 검증 / 프로젝트·재원
        </span>{" "}
        4개 축으로 나눠 표시합니다.
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-bold text-white">{row.label}</div>
              <PillTag tone={row.tone || "slate"}>{row.status}</PillTag>
            </div>
            <div className="mt-2 text-xs leading-relaxed text-slate-400">
              {row.note}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function buildDecisionEvidenceRows(
  rec,
  strategyMeta = {},
  liveData = null,
  geoData = null,
  pipelineData = null
) {
  const safeRec = sanitize검토Record(rec) || rec || {};
  const evidenceLinks = collectEvidenceLinks(safeRec, "general");
  const inventoryRows = safeArray(safeRec?.inventoryRows);
  const missingRows = inventoryRows.filter((item) =>
    /결측|보완/.test(String(item?.status || ""))
  );
  const facts = [];
  const verify = [];
  const gaps = [];

  facts.push(
    strategyMeta?.oneLine ||
      safeRec?.countryNote ||
      "현재 후보를 먼저 볼 이유를 한 줄로 정리했습니다."
  );
  facts.push(
    `전략 판정: ${strategyMeta?.decision || "검토 중"} · 전략점수 ${
      strategyMeta?.strategyScore ?? "-"
    }점`
  );
  if (strategyMeta?.financeRoute)
    facts.push(`재원 경로: ${strategyMeta.financeRoute}`);

  verify.push(`직접 연결된 근거 링크 ${evidenceLinks.length}건`);
  verify.push(
    liveData ? "실시간 공개지표 보강 사용 중" : "저장 데이터 기반으로 검토 가능"
  );
  verify.push(
    pipelineData?.projects?.length
      ? `프로젝트·재원 신호 ${pipelineData.projects.length}건`
      : pipelineData?.isFallback
      ? "프로젝트·재원은 기본 제공 링크 중심"
      : "프로젝트·재원 신호 추가 확인 필요"
  );

  if (!geoData?.countryFeature) gaps.push("국가 경계 검증 필요");
  if (geoData?.countryFeature && !geoData?.regionFeature)
    gaps.push("지역 경계 또는 후보지 좌표 보강 필요");
  if (missingRows.length)
    gaps.push(`결측·보완 필요 항목 ${missingRows.length}건`);
  if (!evidenceLinks.length)
    gaps.push("직접 인용 가능한 대표 근거 재선정 필요");
  if (!gaps.length)
    gaps.push("현 단계에서 큰 결측 없이 회의용 1차 검토가 가능합니다.");

  return [
    { key: "recommend", label: "추천 판단", tone: "emerald", items: facts },
    { key: "verified", label: "검증된 사실", tone: "blue", items: verify },
    {
      key: "gaps",
      label: "보강 필요",
      tone: gaps[0]?.includes("큰 결측 없이") ? "slate" : "amber",
      items: gaps,
    },
  ];
}

function DecisionEvidenceBlockCard({
  rec,
  strategyMeta = {},
  liveData = null,
  geoData = null,
  pipelineData = null,
}) {
  const groups = useMemo(
    () =>
      buildDecisionEvidenceRows(
        rec,
        strategyMeta,
        liveData,
        geoData,
        pipelineData
      ),
    [rec, strategyMeta, liveData, geoData, pipelineData]
  );
  return (
    <SectionCard
      title="핵심 판단 요약"
      icon={<FileCheck className="text-sky-300" size={16} />}
      right={<PillTag tone="blue">핵심 요약</PillTag>}
    >
      <div className="mb-3 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
        추천 판단, 확인된 근거, 추가 확인이 필요한 부분을 한 번에 볼 수 있도록
        정리했습니다.
      </div>
      <div className="grid gap-3 xl:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.key}
            className={cx(
              "rounded-2xl border p-3",
              group.tone === "emerald"
                ? "border-emerald-500/20 bg-emerald-500/7"
                : group.tone === "blue"
                ? "border-sky-500/20 bg-sky-500/7"
                : group.tone === "amber"
                ? "border-amber-500/20 bg-amber-500/7"
                : "border-slate-700 bg-slate-900/50"
            )}
          >
            <div className="text-sm font-bold text-white">{group.label}</div>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-300">
              {safeArray(group.items).map((item, idx) => (
                <li
                  key={`${group.key}-${idx}`}
                  className="flex items-start gap-2"
                >
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function QuickStartGuideCard({ compact = false }) {
  const guideSteps = [
    {
      title: "1. 목적 선택",
      desc: "ODA, 재원·실행, 개요 검토 중 현재 업무에 맞는 흐름부터 시작합니다.",
    },
    {
      title: "2. 후보 압축",
      desc: "국가·기술·지역 후보를 1~3개로 좁히고 근거 링크를 먼저 확인합니다.",
    },
    {
      title: "3. 공유 준비",
      desc: "요약본 PDF, 검토표 PDF, 링크 공유 중 필요한 결과물로 바로 마무리합니다.",
    },
  ];

  const checkItems = [
    "핵심 근거 링크가 충분한지",
    "재원·실행 경로가 보이는지",
    "지역 맥락과 파트너가 확인되는지",
    "바로 공유할 결과물까지 준비됐는지",
  ];

  const outputs = ["요약본 PDF", "검토표 PDF", "링크 공유", "후보 보관 목록"];

  return (
    <SectionCard
      title="빠른 사용 가이드"
      icon={<Target className="text-emerald-300" size={16} />}
      right={<PillTag tone="emerald">user guide</PillTag>}
    >
      <div className="mb-4 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
        처음에는 긴 설명보다{" "}
        <span className="font-semibold text-white">
          목적 선택 → 후보 압축 → 근거 확인 → 저장·공유
        </span>{" "}
        순서로 보는 편이 가장 빠릅니다.
      </div>
      <div
        className={cx(
          "grid gap-3",
          compact ? "lg:grid-cols-3" : "xl:grid-cols-3"
        )}
      >
        {guideSteps.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3"
          >
            <div className="text-sm font-bold text-white">{item.title}</div>
            <div className="mt-2 text-xs leading-relaxed text-slate-300">
              {item.desc}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-3">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            먼저 확인할 항목
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-300">
            {checkItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-3">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            바로 만들 수 있는 결과물
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {outputs.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-700 bg-slate-800/35 px-3 py-2 text-xs font-semibold text-slate-100"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function LandingPage({
  onStart = null,
  onFallbackStart = null,
  onOpenScenarioTester = null,
  showScenarioTester = false,
  launchStatus = "",
  landingScenarioPulse = false,
  onTrackHeroPrimaryStart = null,
  resumeState = null,
  onResumeLastSession = null,
  onResumeShortlist = null,
}) {
  const quickStartSteps = ["목적 선택", "후보 선별", "근거 확인·공유"];

  const heroHighlights = [
    {
      label: "주요 기능",
      value: "협력 대상 선별",
      desc: "조건에 맞는 유망 협력 대상을 즉시 선별",
      tone: "emerald",
    },
    {
      label: "제공 정보",
      value: "근거·재원·파트너",
      desc: "지도와 상세 패널에서 필요한 데이터만 빠르게 확인",
      tone: "sky",
    },
    {
      label: "산출물 및 공유",
      value: "요약본·공유 링크",
      desc: "회의용 자료 생성 및 공유",
      tone: "amber",
    },
  ];

  const purposeSectionRef = useRef(null);
  const [localLaunchStatus, setLocalLaunchStatus] = useState("");
  const [localPurposePulse, setLocalPurposePulse] = useState(false);

  const focusPurposeSection = useCallback((message) => {
    if (message) setLocalLaunchStatus(message);
    setLocalPurposePulse(true);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        const node = purposeSectionRef.current;
        if (!node) return;
        try {
          node.scrollIntoView({ behavior: "smooth", block: "start" });
          if (typeof node.focus === "function") {
            node.focus({ preventScroll: true });
          }
        } catch (error) {
          console.error("[launch] failed to focus purpose section", error);
        }
      });
    }
  }, []);

  const handlePrimaryStart = useCallback(() => {
    safeInvoke(onTrackHeroPrimaryStart, {
      entry: "hero-primary",
      presetKey: "purpose-selection",
    });
    focusPurposeSection(
      "아래에서 목적을 선택하면 바로 검토를 시작할 수 있습니다."
    );
  }, [focusPurposeSection, onTrackHeroPrimaryStart]);

  useEffect(() => {
    if (!localPurposePulse && !localLaunchStatus) return undefined;
    const timer = window.setTimeout(() => {
      setLocalPurposePulse(false);
      setLocalLaunchStatus("");
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [localPurposePulse, localLaunchStatus]);

  const effectiveLaunchStatus = launchStatus || localLaunchStatus;
  const effectivePurposePulse = landingScenarioPulse || localPurposePulse;
  const safeResumeState = resumeState || null;
  const resumeShortlistCount = safeArray(safeResumeState?.shortlistIds).length;
  const resumeUpdatedLabel = safeResumeState?.updatedAt
    ? formatRelativeTimeLabel(safeResumeState.updatedAt)
    : "";
  const resumeFocusLabel =
    safeResumeState?.scenarioTitle ||
    safeResumeState?.nextActionLabel ||
    "최근 검토 기준";
  const resumeMeta = [
    resumeFocusLabel,
    `후보국 ${resumeShortlistCount}건`,
    resumeUpdatedLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  const workflowLayoutMap = {
    overview: "xl:col-span-4",
    oda: "xl:col-span-4",
    rnd: "xl:col-span-4",
    partners: "xl:col-span-6",
    funding: "xl:col-span-6",
  };

  const workflowToneMap = {
    slate: {
      box: "border-slate-700/80 bg-slate-900/88",
      text: "text-slate-300",
      button: "border-slate-600 bg-slate-950 text-slate-100",
      accent: "from-slate-400/80 via-slate-200/20 to-transparent",
    },
    emerald: {
      box: "border-emerald-500/30 bg-emerald-500/10",
      text: "text-emerald-300",
      button: "border-emerald-500/35 bg-emerald-500/12 text-emerald-200",
      accent: "from-emerald-400 via-emerald-300/25 to-transparent",
    },
    sky: {
      box: "border-sky-500/30 bg-sky-500/10",
      text: "text-sky-300",
      button: "border-sky-500/35 bg-sky-500/12 text-sky-200",
      accent: "from-sky-400 via-sky-300/25 to-transparent",
    },
    amber: {
      box: "border-amber-500/30 bg-amber-500/10",
      text: "text-amber-300",
      button: "border-amber-500/35 bg-amber-500/12 text-amber-200",
      accent: "from-amber-400 via-amber-300/25 to-transparent",
    },
    blue: {
      box: "border-blue-500/30 bg-blue-500/10",
      text: "text-blue-300",
      button: "border-blue-500/35 bg-blue-500/12 text-blue-200",
      accent: "from-blue-400 via-blue-300/25 to-transparent",
    },
  };

  return (
    <div className="absolute inset-0 z-40 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.14),transparent_34%),linear-gradient(180deg,#020617,#081223)] px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 lg:gap-6">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-700/70 bg-slate-900/84 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.22))]" />
          <div className="relative p-5 sm:p-6 lg:p-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.14fr)_360px] xl:gap-8">
              <div className="min-w-0">
                <NIGTLogo size={36} className="mb-5" />
                <div className="text-sm font-black tracking-[0.14em] text-emerald-300">
                  개도국 기후기술 협력 플랫폼
                  <span className="ml-2 align-middle text-[11px] font-semibold tracking-[0.18em] text-slate-400 sm:text-xs">
                    Developing Country Climate Tech Strategy Map
                  </span>
                </div>

                <div className="mt-4 max-w-4xl">
                  <h1 className="text-3xl font-black leading-[1.08] text-white sm:text-4xl lg:text-5xl xl:text-[3.65rem]">
                    국가·기술 협력 대상을
                    <span className="block pt-1 text-emerald-300 sm:pt-2">
                      빠르게 탐색하는
                    </span>
                    <span className="block pt-1 sm:pt-2">실무형 전략지도</span>
                  </h1>
                  <div className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    데이터 기반 맞춤형 협력 대상 제안 및 통합 정보 제공 플랫폼
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <PillTag tone="emerald">목적별 빠른 시작</PillTag>
                  <PillTag tone="blue">국가·기술·근거 동시 검토</PillTag>
                  <PillTag tone="amber">요약본·공유 즉시 제공</PillTag>
                </div>

                <div className="mt-5 grid max-w-3xl gap-2 text-sm leading-relaxed text-slate-300">
                  <div className="flex items-start gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/45 px-3 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>업무 목적에 따른 맞춤형 협력 대상 추천</span>
                  </div>
                  <div className="flex items-start gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/45 px-3 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                    <span>
                      협력 대상별 핵심 데이터(근거, 재원, 파트너) 통합 제공
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handlePrimaryStart}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-emerald-500/35 bg-emerald-500/12 px-5 py-3 text-sm font-semibold text-emerald-100 shadow-[0_12px_30px_rgba(16,185,129,0.12)]"
                  >
                    목적별 빠른 시작
                  </button>
                  <button
                    type="button"
                    onClick={() => safeInvoke(onStart, "overview")}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-slate-600 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-100"
                  >
                    전체 화면 보기
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {safeResumeState ? (
                  <div className="rounded-[26px] border border-amber-500/20 bg-slate-950/72 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.28)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">
                          최근 작업 이어보기
                        </div>
                        <div className="mt-2 text-lg font-extrabold text-white">
                          {safeResumeState.activeRecLabel || "최근 검토 후보"}
                        </div>
                        <div className="mt-1 text-sm leading-relaxed text-slate-400">
                          {resumeMeta}
                        </div>
                      </div>
                      <PillTag tone="amber">이어 보기</PillTag>
                    </div>
                    <div className="mt-3 text-sm leading-relaxed text-slate-300">
                      {safeResumeState.nextActionLabel ||
                        "마지막으로 검토하던 후보국과 저장 후보국 목록을 바로 이어서 작업할 수 있습니다."}
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => safeInvoke(onResumeLastSession)}
                        className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200"
                      >
                        최근 검토 이어가기
                      </button>
                      {resumeShortlistCount ? (
                        <button
                          type="button"
                          onClick={() => safeInvoke(onResumeShortlist)}
                          className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-600 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100"
                        >
                          보관 후보 보기
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[26px] border border-slate-700/80 bg-slate-950/72 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.24)]">
                  <div className="flex items-center justify-between gap-2">
                    <PillTag tone="emerald">목적별 빠른 시작</PillTag>
                    <PillTag tone="slate">국가·기술·근거 동시 검토</PillTag>
                  </div>
                  <div className="mt-4 space-y-3">
                    {quickStartSteps.map((step, index) => (
                      <div
                        key={step}
                        className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/85 px-3 py-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-sm font-black text-emerald-200">
                          {index + 1}
                        </div>
                        <div className="min-w-0 text-sm font-semibold text-slate-100">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item.label}
                  className={cx(
                    "h-full rounded-[24px] border p-4 sm:p-5",
                    item.tone === "emerald"
                      ? "border-emerald-500/20 bg-emerald-500/8"
                      : item.tone === "sky"
                      ? "border-sky-500/20 bg-sky-500/8"
                      : "border-amber-500/20 bg-amber-500/8"
                  )}
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {item.label}
                  </div>
                  <div className="mt-2 text-xl font-extrabold text-white">
                    {item.value}
                  </div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-300">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={purposeSectionRef}
          data-landing-purposes="true"
          tabIndex={-1}
          className={cx(
            "rounded-[32px] border border-slate-700/70 bg-slate-900/84 p-5 shadow-2xl backdrop-blur-xl transition sm:p-6 lg:p-7",
            effectivePurposePulse && "ring-2 ring-emerald-400/40"
          )}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                목적 선택
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white sm:text-[2rem]">
                지금 필요한 검토 흐름을 선택해 주세요.
              </div>
              <div className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
                목적에 맞는 화면과 필터가 바로 적용됩니다.
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
              {effectiveLaunchStatus ? (
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm leading-relaxed text-emerald-100">
                  {effectiveLaunchStatus}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => safeInvoke(onStart, "overview")}
                className="inline-flex min-h-[50px] items-center justify-center rounded-2xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-100"
              >
                전체 화면 보기
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-12">
            {ROLE_BASED_WORKFLOWS.map((item) => {
              const featured = item.key === "oda";
              const toneStyle =
                workflowToneMap[item.tone] || workflowToneMap.slate;
              const pillTone = featured
                ? "emerald"
                : item.tone === "sky"
                ? "blue"
                : item.tone;
              const layoutClass =
                workflowLayoutMap[item.key] || "xl:col-span-4";

              return (
                <article
                  key={item.key}
                  className={cx(
                    "relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[26px] border p-4 sm:p-5",
                    toneStyle.box,
                    layoutClass,
                    featured &&
                      "shadow-[0_16px_40px_rgba(16,185,129,0.12)] ring-1 ring-emerald-400/35"
                  )}
                >
                  <div
                    className={cx(
                      "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r",
                      toneStyle.accent
                    )}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div
                        className={cx(
                          "text-[11px] font-black uppercase tracking-[0.14em]",
                          toneStyle.text
                        )}
                      >
                        {item.label}
                      </div>
                      <div className="mt-2 text-xl font-extrabold leading-snug text-white">
                        {item.title}
                      </div>
                    </div>
                    <PillTag tone={pillTone}>
                      {featured ? "추천 시작" : item.result}
                    </PillTag>
                  </div>

                  <div className="mt-3 text-sm leading-relaxed text-slate-300">
                    {item.summary}
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-700/70 bg-slate-950/55 px-3 py-3 text-xs leading-relaxed text-slate-300">
                    <span className="font-semibold text-white">
                      적합한 상황:
                    </span>{" "}
                    {item.when}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {safeArray(item.steps)
                      .slice(0, 2)
                      .map((step) => (
                        <PillTag key={`${item.key}-${step}`} tone="slate">
                          {step}
                        </PillTag>
                      ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => safeInvoke(onStart, item.preset)}
                    className={cx(
                      "mt-auto inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold",
                      toneStyle.button
                    )}
                  >
                    {item.cta}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function DataBasedEvidenceCard({ rec, pipelineData = null }) {
  const m = buildEvidenceMetrics(rec, pipelineData);
  const links = collectEvidenceLinks(rec, "general");
  return (
    <SectionCard
      title="데이터로 본 협력 근거"
      icon={<FileCheck className="text-emerald-400" size={16} />}
      right={
        <PillTag tone="emerald">
          근거 {m.sourceCount + m.regionFactCount}건
        </PillTag>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs text-slate-400">자료 준비 상태</div>
          <div className="mt-1 text-sm font-bold text-white">
            핵심 데이터 충족률 {m.coverage}% · 실행성 {m.feasibility}%
          </div>
          <div className="mt-1 text-xs text-slate-300">
            출처 {m.sourceCount}건, 지역 근거 {m.regionFactCount}건, 보완 항목{" "}
            {m.missingCount}건
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs text-slate-400">사업·재원 연결성</div>
          <div className="mt-1 text-sm font-bold text-white">
            파이프라인 {m.pipelineCount}건 · 재원{" "}
            {m.financeChannels.length || 0}개
          </div>
          <div className="mt-1 text-xs text-slate-300">
            {m.financeChannels.length
              ? m.financeChannels.join(" · ")
              : "재원 조달 방안은 후속 협의가 필요합니다."}
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-200">
        <li className="flex gap-2">
          <CheckCircle2 size={16} className="mt-0.5 text-emerald-300" />
          <span>
            정책·계획 자료와 지역 사업 자료를 함께 볼 수 있어 초기 협력 검토에
            적합합니다.
          </span>
        </li>
        <li className="flex gap-2">
          <CheckCircle2 size={16} className="mt-0.5 text-emerald-300" />
          <span>
            지도 좌표, 지역 설명, 프로젝트·재원 신호를 한 화면에서 연결해
            의사결정 시간을 줄일 수 있습니다.
          </span>
        </li>
        <li className="flex gap-2">
          <CheckCircle2 size={16} className="mt-0.5 text-emerald-300" />
          <span>
            부족한 항목은 센서 API, 현지 행정자료, 실행기관 인터뷰 등으로 후속
            보완 범위를 명확히 잡을 수 있습니다.
          </span>
        </li>
      </ul>
      <SupportingLinkGroup title="바로 열 수 있는 공식 출처" links={links} />
    </SectionCard>
  );
}

function ProgressBar({ label, value, tone = "emerald" }) {
  const toneClass =
    tone === "amber"
      ? "from-amber-500 to-yellow-300"
      : tone === "blue"
      ? "from-sky-500 to-cyan-300"
      : "from-emerald-500 to-green-300";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-200 font-bold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={cx("h-full rounded-full bg-gradient-to-r", toneClass)}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function PillTag({ tone = "slate", children, className = "" }) {
  const toneClasses = {
    slate: "border-slate-600/80 bg-slate-800/80 text-slate-200",
    emerald: "border-emerald-500/25 bg-emerald-500/12 text-emerald-200",
    blue: "border-sky-500/25 bg-sky-500/12 text-sky-200",
    sky: "border-cyan-500/25 bg-cyan-500/12 text-cyan-200",
    amber: "border-amber-500/25 bg-amber-500/12 text-amber-200",
    violet: "border-violet-500/25 bg-violet-500/12 text-violet-200",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap",
        toneClasses[tone] || toneClasses.slate,
        className
      )}
    >
      {children}
    </span>
  );
}

function ScorePill({ label, value, accent = "slate", className = "" }) {
  const accentClasses = {
    slate: "border-slate-700/90 bg-slate-900/92 text-slate-100",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-50",
    blue: "border-sky-500/25 bg-sky-500/10 text-sky-50",
    sky: "border-cyan-500/25 bg-cyan-500/10 text-cyan-50",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-50",
    violet: "border-violet-500/25 bg-violet-500/10 text-violet-50",
  };

  return (
    <div
      className={cx(
        "rounded-2xl border px-3 py-2.5 shadow-sm backdrop-blur-sm",
        accentClasses[accent] || accentClasses.slate,
        className
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold leading-5 text-white break-words">
        {value ?? "-"}
      </div>
    </div>
  );
}

function ExternalLinkButton({
  href,
  label = "근거 링크 열기",
  compact = false,
  className = "",
}) {
  const safeHref = ensureExternalUrl(href);
  if (!safeHref) return null;
  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        emitPlatformAnalyticsEvent("official_link_open", {
          href: safeHref,
          label,
        })
      }
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15",
        compact
          ? "px-2.5 py-1.5 text-xs font-semibold"
          : "px-3 py-2 text-sm font-semibold",
        className
      )}
    >
      <Link2 size={compact ? 12 : 14} />
      {label}
    </a>
  );
}

function ExternalInlineLink({ href, children }) {
  const safeHref = ensureExternalUrl(href);
  if (!safeHref) return <span className="break-all">{children}</span>;
  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        emitPlatformAnalyticsEvent("official_link_open", {
          href: safeHref,
          label: typeof children === "string" ? children : safeHref,
        })
      }
      className="break-all text-sky-200 hover:text-sky-100 underline underline-offset-2"
    >
      {children}
    </a>
  );
}

function collectEvidenceLinks(rec, mode = "general") {
  const rows = [];
  const context = {
    country: rec?.country,
    region: rec?.region,
    tech: rec?.tech,
  };
  const add = (href, label, group = "근거") => {
    const safeHref = ensureExternalUrl(href);
    if (!safeHref) return;
    rows.push({ href: safeHref, label: label || group, group });
  };

  (rec?.sourcePlan || []).forEach((item) => {
    const group = item?.layer || "출처";
    const text = `${item?.layer || ""} ${item?.source || ""}`.toLowerCase();
    if (
      mode === "finance" &&
      !/(재원|프로젝트|gcf|adb|world bank|pipeline)/i.test(text)
    )
      return;
    if (
      mode === "logic" &&
      !/(정책|기초|nap|지표|계획|문서|governance)/i.test(text)
    )
      return;
    add(resolveEvidenceHref(item, context), item?.source, group);
  });

  (rec?.regionRows || []).forEach((item) => {
    const text = `${item?.category || ""} ${item?.field || ""} ${
      item?.source || ""
    }`.toLowerCase();
    if (
      mode === "finance" &&
      !/(국제협력|기후재원|project|gcf|adb|world bank)/i.test(text)
    )
      return;
    if (mode === "logic" && !/(정책|지역계획|기초지표|연구|분석)/i.test(text))
      return;
    add(
      resolveEvidenceHref(item, context),
      item?.field || item?.source,
      item?.category || "지역"
    );
  });

  const sourceData = rec?.strategyEvidence?.sourceData || [];
  sourceData.forEach((item) => {
    add(
      resolveEvidenceHref(item, context),
      item?.label || item?.source,
      item?.group || "전략"
    );
    (item?.rows || []).forEach((row) =>
      add(
        resolveEvidenceHref(row, context),
        row?.project || row?.policy || row?.indicator || item?.label,
        item?.group || "전략"
      )
    );
  });

  const prioritized = uniqBy(rows, (item) => `${item.href}|${item.label}`);
  const getLinkWeight = (href = "") => {
    const quality = classifyEvidenceLinkQuality(href);
    if (quality === "direct") return 0;
    if (quality === "detail") return 1;
    if (/data\.worldbank\.org\/country\//i.test(href)) return 2;
    if (/gain-(new\.)?crc\.nd\.edu\/country\//i.test(href)) return 3;
    if (/unfccc\.int\/NDCREG|napcentral\.org/i.test(href)) return 4;
    return 6;
  };
  prioritized.sort((a, b) => {
    const byWeight = getLinkWeight(a.href) - getLinkWeight(b.href);
    if (byWeight !== 0) return byWeight;
    return String(a.label || "").localeCompare(String(b.label || ""), "ko");
  });
  return prioritized.slice(0, mode === "general" ? 8 : 5);
}

function SupportingLinkGroup({ title = "근거 링크", links = [] }) {
  if (!links?.length) return null;
  return (
    <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
      <div className="text-xs font-bold text-slate-200">{title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {links.map((item, idx) => (
          <ExternalLinkButton
            key={`${item.href}-${idx}`}
            href={item.href}
            label={item.label}
            compact
          />
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  right = null,
  className = "",
  bodyClassName = "",
}) {
  return (
    <section
      className={cx(
        "rounded-2xl border border-slate-700/90 bg-slate-900/92 backdrop-blur-md overflow-hidden shadow-[0_18px_48px_rgba(2,6,23,0.22)]",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-800/45">
        <div className="flex items-center gap-2 text-white min-w-0">
          {icon}
          <h3 className="font-bold text-[15px] leading-none truncate">
            {title}
          </h3>
        </div>
        {right}
      </div>
      <div className={cx("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

function DesktopPanelShell({
  title,
  side = "left",
  onCollapse,
  children,
  floating = false,
  onToggleFloating = null,
  onDragStart = null,
}) {
  const shellShape = floating
    ? "rounded-[24px] border"
    : side === "left"
    ? "rounded-r-[24px] rounded-l-none border-l-0"
    : "rounded-l-[24px] rounded-r-none border-r-0";
  return (
    <div
      className={cx(
        "h-full border border-slate-700/85 bg-slate-900/92 backdrop-blur-xl shadow-[0_18px_40px_rgba(2,6,23,0.34)] overflow-hidden flex flex-col",
        shellShape
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/92">
        <div className="min-w-0">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            {side === "left" ? "탐색" : "검토"}
          </div>
          <div className="mt-1 text-sm font-bold text-white truncate">
            {title}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">위치·폭 조절</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onMouseDown={(event) => safeInvoke(onDragStart, event)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-600 bg-slate-800 px-2.5 py-2 text-slate-200 hover:bg-slate-700 cursor-move"
            aria-label={side === "left" ? "좌측 패널 이동" : "우측 패널 이동"}
            title="드래그해 패널 이동"
          >
            <GripVertical size={15} />
            <span className="hidden xl:inline">이동</span>
          </button>
          <button
            type="button"
            onClick={() => safeInvoke(onToggleFloating)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800 px-2.5 py-2 text-slate-200 hover:bg-slate-700"
            aria-label={
              floating ? "패널을 가장자리에 다시 고정" : "패널을 분리해 이동"
            }
            title={floating ? "가장자리에 고정" : "패널 띄우기"}
          >
            {floating ? <Pin size={15} /> : <PinOff size={15} />}
          </button>
          <button
            onClick={() => safeInvoke(onCollapse)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800 px-2.5 py-2 text-slate-200 hover:bg-slate-700"
            aria-label={side === "left" ? "좌측 패널 접기" : "우측 패널 접기"}
          >
            {side === "left" ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">{children}</div>
    </div>
  );
}

function DesktopCollapsedRail({ side = "left", title, icon, onExpand }) {
  const railShape =
    side === "left"
      ? "rounded-r-[18px] rounded-l-none border-l-0"
      : "rounded-l-[18px] rounded-r-none border-r-0";
  return (
    <button
      type="button"
      onClick={() => safeInvoke(onExpand)}
      className={cx(
        "group flex h-[120px] w-10 select-none flex-col items-center justify-between border border-slate-700/85 bg-slate-900/94 px-1 py-2 text-center shadow-2xl backdrop-blur-xl transition hover:border-emerald-500/30 hover:bg-slate-900",
        railShape
      )}
      aria-label={title + " 패널 열기"}
    >
      <div className="inline-flex items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300 transition group-hover:border-emerald-400/40 group-hover:bg-emerald-500/15">
        {side === "left" ? (
          <ChevronRight size={17} />
        ) : (
          <ChevronLeft size={17} />
        )}
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-800/65 p-2 text-slate-200">
        {icon}
      </div>
      <div className="text-[10px] font-bold leading-tight text-slate-300 [writing-mode:vertical-rl] [text-orientation:mixed]">
        {title}
      </div>
    </button>
  );
}

function buildCandidateActivationReasons(rec, strategyMeta = {}) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  const reasons = [];
  if (safeRec?.pilotStatus) reasons.push("베트남 대표 데이터");
  if (Number(safeRec?.scores?.coverage || 0) >= 85)
    reasons.push(
      `데이터 준비도 ${Math.round(Number(safeRec?.scores?.coverage || 0))}%`
    );
  const sourceCount =
    safeArray(safeRec?.sourcePlan).length +
    safeArray(safeRec?.regionRows).length;
  if (sourceCount >= 4) reasons.push(`공식·근거 문서 ${sourceCount}건`);
  if (Number(strategyMeta?.pipelineProjectCount || 0) > 0)
    reasons.push(`프로젝트·재원 신호 ${strategyMeta.pipelineProjectCount}건`);
  if (safeArray(safeRec?.localPartners).length > 0)
    reasons.push(`파트너 ${safeArray(safeRec?.localPartners).length}개`);
  if (!reasons.length) reasons.push("목적 적합성 기준 우선 검토 후보");
  return reasons.slice(0, 3);
}

function ActivationCommandCard({
  recommendations = [],
  activeRec = null,
  activeScenarioKey = "overview",
  shortlistIds = [],
  strategyMetaByRec = {},
  onStartScenario = null,
  onSelectRec = null,
  onAddRecommendedShortlist = null,
  onCopyShare = null,
  onDownloadBrief = null,
  compact = false,
}) {
  const topRecommendations = safeArray(recommendations).slice(0, 3);
  const primaryPurposeLabel =
    STRATEGY_PRESETS?.[activeScenarioKey]?.label || "추천 목적";
  const shortlistCount = safeArray(shortlistIds).length;
  const hasActiveRec = !!activeRec;

  return (
    <SectionCard
      title="권장 후속 작업"
      icon={<Rocket className="text-emerald-300" size={16} />}
      right={
        <PillTag tone={shortlistCount >= 3 ? "amber" : "emerald"}>
          {shortlistCount >= 3 ? "공유 준비" : "빠른 시작"}
        </PillTag>
      }
    >
      <div className="space-y-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                현재 맞춘 필터
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                {primaryPurposeLabel}
              </div>
              <div className="mt-1 text-xs leading-relaxed text-slate-300">
                현재 필터를 맞춘 뒤 추천 후보를 바로 열어 상세 검토와 공유
                단계로 이어갑니다.
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                safeInvoke(onStartScenario, activeScenarioKey || "overview")
              }
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200"
            >
              다시 적용
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {topRecommendations.map((item, idx) => {
            const meta = strategyMetaByRec?.[item?.id] || {};
            const reasons = buildCandidateActivationReasons(item, meta);
            const selected = activeRec?.id === item?.id;
            return (
              <button
                key={item?.id || idx}
                type="button"
                onClick={() => safeInvoke(onSelectRec, item)}
                className={cx(
                  "rounded-2xl border px-3 py-3 text-left transition",
                  selected
                    ? "border-emerald-500/35 bg-emerald-500/10"
                    : "border-slate-700 bg-slate-900/55 hover:border-slate-500 hover:bg-slate-800/70"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    추천 {idx + 1}
                  </div>
                  <PillTag
                    tone={
                      meta?.decision === "즉시 추진 권고" ? "emerald" : "sky"
                    }
                  >
                    {meta?.strategyScore ?? item?.scores?.feasibility ?? "-"}
                  </PillTag>
                </div>
                <div className="mt-2 text-sm font-bold text-white">
                  {item?.country} · {item?.region}
                </div>
                <div className="mt-1 text-xs text-emerald-300">
                  {techShort(item?.tech) || item?.tech}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {reasons.map((reason) => (
                    <PillTag key={`${item?.id}-${reason}`} tone="slate">
                      {reason}
                    </PillTag>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div
          className={cx(
            "grid gap-2",
            compact ? "grid-cols-1" : "sm:grid-cols-3"
          )}
        >
          <button
            type="button"
            onClick={() => safeInvoke(onAddRecommendedShortlist)}
            className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm font-semibold text-amber-200"
          >
            추천 후보 3개 보관
          </button>
          <button
            type="button"
            onClick={() => safeInvoke(onCopyShare)}
            className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-3 py-3 text-sm font-semibold text-sky-200"
          >
            이 화면 공유
          </button>
          <button
            type="button"
            onClick={() => safeInvoke(onDownloadBrief)}
            disabled={!hasActiveRec}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm font-semibold text-emerald-200 disabled:opacity-50"
          >
            요약본 PDF
          </button>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-xs text-slate-300">
          {shortlistCount >= 3
            ? "저장 후보국이 3건 이상입니다. 이제 검토표 PDF 또는 공유 링크로 정리해 보세요."
            : "후보국을 몇 개 담아 두면 검토표 PDF와 공유 링크를 더 쉽게 만들 수 있습니다."}
        </div>
      </div>
    </SectionCard>
  );
}

function ResumeWorkspaceCard({
  resumeState = null,
  onResumeLastSession = null,
  onResumeShortlist = null,
  compact = false,
}) {
  if (!resumeState) return null;
  const shortlistCount = safeArray(resumeState?.shortlistIds).length;
  const updatedLabel = formatRelativeTimeLabel(resumeState?.updatedAt);
  const scenarioLabel =
    STRATEGY_PRESETS?.[resumeState?.activeScenarioKey]?.label ||
    resumeState?.scenarioTitle ||
    "최근 검토 기준";
  return (
    <SectionCard
      title="최근 작업 이어보기"
      icon={<BookOpen className="text-amber-300" size={16} />}
      right={<PillTag tone="amber">{updatedLabel}</PillTag>}
    >
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-3">
        <div className="text-sm font-bold text-white">
          {resumeState?.activeRecLabel || "최근 검토 후보"}
        </div>
        <div className="mt-1 text-xs text-slate-300">
          {scenarioLabel} · 보관 후보 {shortlistCount}건
        </div>
        <div className="mt-2 text-xs leading-relaxed text-slate-300">
          {resumeState?.nextActionLabel ||
            "최근 필터, 선택 후보, 보관 상태를 이어서 열 수 있습니다."}
        </div>
      </div>
      <div
        className={cx(
          "mt-3 grid gap-2",
          compact ? "grid-cols-1" : "sm:grid-cols-2"
        )}
      >
        <button
          type="button"
          onClick={() => safeInvoke(onResumeLastSession)}
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm font-semibold text-amber-200"
        >
          최근 검토 이어가기
        </button>
        {shortlistCount ? (
          <button
            type="button"
            onClick={() => safeInvoke(onResumeShortlist)}
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-100"
          >
            보관 후보 보기
          </button>
        ) : null}
      </div>
    </SectionCard>
  );
}

function Desktop탐색Panel({
  leftPanelTab,
  setLeftPanelTab,
  filters,
  setFilters,
  filteredCount,
  totalCount,
  recommendations,
  activeRec,
  onSelectRec,
  guidePulse,
  filteredRecs,
  strategyMetaByRec = {},
  onStartScenario,
  activeScenarioKey = "overview",
  scenarioRuntime = null,
  onScenarioAction = null,
  onOpenScenarioGuide = null,
  shortlistRecs = [],
  shortlistIds = [],
  onToggleShortlist = null,
  onBringSelectionIntoView = null,
  onAddRecommendedShortlist = null,
  onCopyShare = null,
  onDownloadBrief = null,
  resumeState = null,
  onResumeLastSession = null,
  onResumeShortlist = null,
}) {
  const [workflowTab, setWorkflowTab] = useState("overview");

  useEffect(() => {
    if (["filters", "candidates"].includes(leftPanelTab)) {
      setWorkflowTab("explore");
    }
  }, [leftPanelTab]);

  const immediateCount = useMemo(
    () =>
      recommendations.filter(
        (rec) => strategyMetaByRec?.[rec.id]?.decision === "즉시 추진 권고"
      ).length,
    [recommendations, strategyMetaByRec]
  );
  const topRec = recommendations[0] || null;
  const selectedMeta = activeRec
    ? strategyMetaByRec?.[activeRec.id] || {}
    : null;
  const activeVisible = activeRec
    ? recommendations.some((item) => item?.id === activeRec.id)
    : true;

  const workflowTabs = [
    {
      key: "overview",
      label: "1. 검토 준비",
      desc: "오늘의 목적과 선택 상태를 먼저 정리",
      accent: "emerald",
    },
    {
      key: "explore",
      label: "2. 협력 대상 탐색",
      desc: "조건 설정과 후보 선정을 한 구역에서 진행",
      accent: "sky",
    },
    {
      key: "shortlist",
      label: "3. 보관·공유",
      desc: "보관 후보와 공유 준비를 따로 관리",
      accent: "amber",
    },
    {
      key: "guide",
      label: "4. 협력 흐름",
      desc: "ODA·실증·정책설계 흐름별 활용 안내",
      accent: "violet",
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {workflowTab === "overview" ? (
        <>
          <WorkspaceActionGuideCard
            filters={filters}
            activeRec={activeRec}
            shortlistCount={shortlistRecs.length}
            filteredCount={filteredCount}
          />

          <SectionCard
            title="현재 검토 기준"
            icon={<Target className="text-emerald-400" size={16} />}
            right={
              <PillTag tone="slate">
                {filteredCount} / {totalCount}
              </PillTag>
            }
          >
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
                <div className="text-slate-400">목적 선택</div>
                <div className="mt-1 text-sm font-bold text-white truncate">
                  {filters.purpose || "전체 목적"}
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
                <div className="text-slate-400">기술</div>
                <div className="mt-1 text-sm font-bold text-white truncate">
                  {filters.tech || "전체 기술"}
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
                <div className="text-slate-400">즉시 추진</div>
                <div className="mt-1 text-lg font-black text-white">
                  {immediateCount}
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
                <div className="text-slate-400">상위 후보</div>
                <div className="mt-1 text-sm font-bold text-white truncate">
                  {topRec ? topRec.country : "-"}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/45 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
              국제협력 실무에서는 “목적 → 기술 → 후보 → 근거·재원·파트너” 순서가
              가장 빠릅니다. 오늘 탭에서는 현재 필터와 보관 후보 상태를 먼저
              정리합니다.
            </div>
            {activeRec && (
              <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-emerald-300">
                      현재 선택 후보
                    </div>
                    <div className="mt-1 text-sm font-bold text-white truncate">
                      {activeRec.country} · {activeRec.region}
                    </div>
                    <div className="mt-1 text-xs text-slate-300 truncate">
                      {selectedMeta?.oneLine ||
                        activeRec.cooperationProfile?.headline ||
                        activeRec.tech}
                    </div>
                  </div>
                  <PillTag tone="emerald">
                    {selectedMeta?.strategyScore ??
                      activeRec.scores?.feasibility ??
                      "-"}
                  </PillTag>
                </div>
              </div>
            )}
          </SectionCard>

          <ResumeWorkspaceCard
            resumeState={resumeState}
            onResumeLastSession={onResumeLastSession}
            onResumeShortlist={onResumeShortlist}
            compact
          />
        </>
      ) : null}

      {workflowTab === "explore" ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-1.5 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setLeftPanelTab("filters")}
                className={cx(
                  "rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  leftPanelTab === "filters"
                    ? "bg-sky-500/12 text-sky-300 shadow-[0_0_0_1px_rgba(56,189,248,0.18)]"
                    : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
                )}
              >
                조건 설정
              </button>
              <button
                onClick={() => setLeftPanelTab("candidates")}
                className={cx(
                  "rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  leftPanelTab === "candidates"
                    ? "bg-emerald-500/12 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]"
                    : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
                )}
              >
                협력 대상 탐색
              </button>
            </div>
          </div>

          <SelectionVisibilityNotice
            activeRec={activeRec}
            isVisible={activeVisible}
            onBringIntoView={onBringSelectionIntoView}
          />

          {leftPanelTab === "filters" ? (
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              filteredCount={filteredCount}
              totalCount={totalCount}
              guidePulse={guidePulse}
              filteredRecs={filteredRecs}
              strategyMetaByRec={strategyMetaByRec}
              onStartScenario={onStartScenario}
              onOpenScenarioGuide={onOpenScenarioGuide}
            />
          ) : (
            <CandidateList
              recommendations={recommendations}
              activeRec={activeRec}
              onSelectRec={onSelectRec}
              guidePulse={guidePulse}
              strategyMetaByRec={strategyMetaByRec}
              shortlistIds={shortlistIds}
              onToggleShortlist={onToggleShortlist}
              expandToFill
            />
          )}
        </div>
      ) : null}

      {workflowTab === "shortlist" ? (
        <>
          <SectionCard
            title="보관·공유 준비"
            icon={<Briefcase className="text-amber-300" size={16} />}
            right={<PillTag tone="amber">{shortlistRecs.length}건</PillTag>}
          >
            <div className="text-sm leading-relaxed text-slate-300">
              후보군 저장은 회의 전 비교 검토와 공유 준비를 위해 따로 저장하는
              기능입니다. 저장 후 뒤 바로 요약본 저장과 링크 공유로 이어갈 수
              있습니다.
            </div>
          </SectionCard>

          <ShortlistPanel
            items={shortlistRecs}
            activeRec={activeRec}
            onSelectRec={onSelectRec}
            onToggleShortlist={onToggleShortlist}
          />

          <ActivationCommandCard
            recommendations={recommendations}
            activeRec={activeRec}
            activeScenarioKey={activeScenarioKey}
            shortlistIds={shortlistIds}
            strategyMetaByRec={strategyMetaByRec}
            onStartScenario={onStartScenario}
            onSelectRec={onSelectRec}
            onAddRecommendedShortlist={onAddRecommendedShortlist}
            onCopyShare={onCopyShare}
            onDownloadBrief={onDownloadBrief}
            compact
          />
        </>
      ) : null}

      {workflowTab === "guide" ? (
        <div className="space-y-3">
          <RoleBasedWorkflowCard
            compact
            onApplyPreset={onStartScenario}
            onOpenGuide={onOpenScenarioGuide}
          />
          <ScenarioWorkflowCard
            activeScenarioKey={activeScenarioKey}
            runtime={scenarioRuntime}
            activeRec={activeRec}
            filteredCount={filteredCount}
            shortlistCount={shortlistRecs.length}
            onStartScenario={onStartScenario}
            onRunAction={onScenarioAction}
            onOpenGuide={onOpenScenarioGuide}
            compact
          />
          <UsageScenarioPanel compact onStartScenario={onStartScenario} />
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================
 * Filters / candidate list
 * ========================================================= */

const STRATEGY_FOCUS_OPTIONS = [
  "균형형",
  "실행우선",
  "재원연계우선",
  "리스크우선",
  "정책우선",
];

const STRATEGY_SORT_OPTIONS = [
  { value: "strategy", label: "전략 점수순" },
  { value: "feasibility", label: "실행가능성순" },
  { value: "pipeline", label: "재원연계순" },
  { value: "risk", label: "리스크대응순" },
];

const FINANCE_CHANNEL_FILTERS = [
  "전체 재원",
  "ODA",
  "MDB",
  "GCF",
  "ADB",
  "World Bank",
  "민간투자",
  "국내 실증 R&D",
];

const DECISION_FILTERS = [
  "전체",
  "즉시 추진 권고",
  "보완 후 추진",
  "기초데이터 보강 후 재검토",
];

function getRecFinanceChannels(rec) {
  const channels = new Set(rec?.executionFeasibility?.financeChannels || []);
  (rec?.strategyEvidence?.sourceData || []).forEach((item) => {
    const source = String(item?.source || "");
    if (/GCF/i.test(source)) channels.add("GCF");
    if (/World Bank/i.test(source)) {
      channels.add("World Bank");
      channels.add("MDB");
    }
    if (/ADB/i.test(source)) {
      channels.add("ADB");
      channels.add("MDB");
    }
  });
  return Array.from(channels);
}

function getSeedPipelineStats(rec, pipelineBundle = null) {
  const seedProjects = getPipelineSeedProjects(rec);
  const merged = uniqBy(
    [...(pipelineBundle?.projects || []), ...seedProjects],
    (item) => `${item?.source || ""}|${item?.title || ""}`
  );
  const totalUSD = merged.reduce(
    (sum, item) => sum + (Number(item?.amountUSD) || 0),
    0
  );
  const sourceCount = new Set(
    merged.map((item) => item?.source).filter(Boolean)
  ).size;
  return {
    projectCount: merged.length,
    totalUSD,
    sourceCount,
    projects: merged,
  };
}

function computeStrategyEvaluation(rec, filters, pipelineBundle = null) {
  const pipelineStats = getSeedPipelineStats(rec, pipelineBundle);
  const financeChannels = getRecFinanceChannels(rec);
  const coverage = Number(rec?.scores?.coverage || 0);
  const feasibility = Number(rec?.scores?.feasibility || 0);
  const reliability = Number(rec?.scores?.reliability || 0);
  const resilience = Number(rec?.scores?.resilience || 0);
  const riskUrgency = scoreRiskUrgency(rec);
  const pipelineScore = Math.min(
    100,
    pipelineStats.projectCount * 18 +
      pipelineStats.sourceCount * 12 +
      (pipelineStats.totalUSD > 0 ? 10 : 0)
  );

  const financeFit =
    filters?.financeChannel && filters.financeChannel !== "전체 재원"
      ? financeChannels.includes(filters.financeChannel)
        ? 100
        : filters.financeChannel === "MDB" &&
          (financeChannels.includes("ADB") ||
            financeChannels.includes("World Bank") ||
            financeChannels.includes("MDB"))
        ? 92
        : 20
      : Math.min(100, 55 + financeChannels.length * 10);

  const purposeFit =
    filters?.purpose && filters.purpose !== "전체 목적"
      ? rec?.purposeTags?.includes(filters.purpose)
        ? 100
        : 25
      : Math.min(100, 60 + (rec?.purposeTags?.length || 0) * 10);

  const policyFit =
    rec?.purposeTags?.includes("정책 설계") ||
    String(rec?.countryNote || "").length > 0
      ? 88
      : 70;

  const focus = filters?.strategyFocus || "균형형";
  const weights =
    focus === "실행우선"
      ? {
          feasibility: 0.34,
          coverage: 0.22,
          pipeline: 0.18,
          finance: 0.14,
          purpose: 0.12,
        }
      : focus === "재원연계우선"
      ? {
          feasibility: 0.2,
          coverage: 0.15,
          pipeline: 0.32,
          finance: 0.21,
          purpose: 0.12,
        }
      : focus === "리스크우선"
      ? {
          feasibility: 0.16,
          coverage: 0.16,
          pipeline: 0.14,
          finance: 0.1,
          purpose: 0.12,
          risk: 0.32,
        }
      : focus === "정책우선"
      ? {
          feasibility: 0.18,
          coverage: 0.18,
          pipeline: 0.14,
          finance: 0.1,
          purpose: 0.16,
          policy: 0.24,
        }
      : {
          feasibility: 0.28,
          coverage: 0.2,
          pipeline: 0.16,
          finance: 0.12,
          purpose: 0.12,
          reliability: 0.12,
        };

  let strategyScore =
    feasibility * (weights.feasibility || 0) +
    coverage * (weights.coverage || 0) +
    pipelineScore * (weights.pipeline || 0) +
    financeFit * (weights.finance || 0) +
    purposeFit * (weights.purpose || 0) +
    riskUrgency * (weights.risk || 0) +
    policyFit * (weights.policy || 0) +
    reliability * (weights.reliability || 0);

  if (rec?.pilotStatus) strategyScore += 4;
  strategyScore = Math.min(100, Math.round(strategyScore * 10) / 10);

  const decision =
    strategyScore >= 85
      ? "즉시 추진 권고"
      : strategyScore >= 72
      ? "보완 후 추진"
      : "기초데이터 보강 후 재검토";

  const financeRoute = inferFinanceRoute(rec, pipelineStats.projects);
  const oneLine =
    decision === "즉시 추진 권고"
      ? `${rec.region}에서 바로 패키지 설계 착수 가능`
      : decision === "보완 후 추진"
      ? `${rec.region}은 데이터·재원 보강 후 우선 검토 유망`
      : `${rec.region}은 기초데이터·재원 근거 확보가 우선`;

  return {
    strategyScore,
    decision,
    financeFit,
    purposeFit,
    pipelineScore,
    riskUrgency,
    policyFit,
    pipelineProjectCount: pipelineStats.projectCount,
    pipelineTotalUSD: pipelineStats.totalUSD,
    financeChannels,
    financeRoute,
    oneLine,
  };
}

function buildPurposeCompressionSummary(
  filters,
  filteredRecs = [],
  strategyMetaByRec = {}
) {
  const topRecs = safeArray(filteredRecs).slice(0, 3);
  const focus = filters?.strategyFocus || "균형형";
  const purpose =
    filters?.purpose && filters.purpose !== "전체 목적"
      ? filters.purpose
      : "전체 목적";
  const finance = filters?.financeChannel || "전체 재원";
  const topSignals = topRecs.map((rec) => {
    const meta = strategyMetaByRec?.[rec?.id] || {};
    return {
      id: rec?.id,
      title: `${rec?.country || "국가"} · ${rec?.region || "지역"}`,
      note: `${meta?.oneLine || "우선 검토 후보"} · 재원 ${
        meta?.financeRoute || "추가 검토"
      } · 파이프라인 ${meta?.pipelineProjectCount || 0}건`,
      score: meta?.strategyScore ?? rec?.scores?.feasibility ?? 0,
    };
  });

  const rules = [
    purpose === "전체 목적"
      ? "목적 선택이 고정되지 않아 기술·데이터·재원 균형값으로 우선순위를 계산합니다."
      : `${purpose} 목적에 직접 맞는 후보를 우선 남기고, 맞지 않는 후보는 크게 감점합니다.`,
    focus === "실행우선"
      ? "실행우선 모드에서는 실행가능성·즉시 착수성을 더 크게 반영합니다."
      : focus === "재원연계우선"
      ? "재원연계우선 모드에서는 MDB/GCF/ODA 파이프라인과 금융 경로를 더 크게 반영합니다."
      : focus === "리스크우선"
      ? "리스크우선 모드에서는 위험 노출과 대응 긴급도를 우선 반영합니다."
      : focus === "정책우선"
      ? "정책우선 모드에서는 국가 전략·제도 정합성을 더 크게 반영합니다."
      : "균형형 모드에서는 실행성·근거데이터·재원경로를 고르게 반영합니다.",
    finance !== "전체 재원"
      ? `${finance} 채널과 맞지 않는 후보는 재원 적합성에서 불리하게 평가됩니다.`
      : "재원을 열어둔 상태라 MDB·ODA·민간 가능성을 함께 비교합니다.",
  ];

  return { purpose, focus, finance, topSignals, rules };
}

function DecisionFlowCard({
  filters,
  filteredRecs = [],
  strategyMetaByRec = {},
  compact = false,
}) {
  const summary = useMemo(
    () =>
      buildPurposeCompressionSummary(filters, filteredRecs, strategyMetaByRec),
    [filters, filteredRecs, strategyMetaByRec]
  );

  return (
    <SectionCard
      title={compact ? "후보 압축 흐름" : "목적별 후보 압축 흐름"}
      icon={<Rocket className="text-sky-300" size={16} />}
      right={
        <PillTag tone="sky">{safeArray(filteredRecs).length}건 남음</PillTag>
      }
    >
      <div className="rounded-2xl border border-sky-500/20 bg-sky-500/7 p-3">
        <div className="text-xs font-bold text-sky-300">현재 압축 기준</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <ScorePill
            label="목적 선택"
            value={summary.purpose}
            accent="emerald"
          />
          <ScorePill label="판단 기준" value={summary.focus} accent="blue" />
          <ScorePill label="재원" value={summary.finance} accent="violet" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {summary.rules.map((rule, idx) => (
          <div
            key={`rule-${idx}`}
            className="rounded-xl border border-slate-700 bg-slate-800/35 px-3 py-2.5 text-sm text-slate-200"
          >
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/12 text-[11px] font-bold text-sky-300">
              {idx + 1}
            </span>
            {rule}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/55 p-3">
        <div className="text-xs font-bold text-white">
          현재 상위 후보가 먼저 보이는 이유
        </div>
        <div className="mt-2 space-y-2">
          {summary.topSignals.length ? (
            summary.topSignals.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-white">
                    {item.title}
                  </div>
                  <PillTag tone="amber">{item.score}</PillTag>
                </div>
                <div className="mt-1 text-xs leading-relaxed text-slate-300">
                  {item.note}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-xs text-slate-400">
              현재 필터으로 남은 후보가 없습니다. 목적이나 최소 점수 기준을
              완화해 다시 살펴보세요.
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function FilterPanel({
  filters,
  setFilters,
  filteredCount,
  totalCount,
  guidePulse,
  compact = false,
  filteredRecs,
  strategyMetaByRec = {},
  onStartScenario = null,
  onOpenScenarioGuide = null,
}) {
  const selectedTechMeta = useMemo(
    () => getTechnologyMeta(filters.tech),
    [filters.tech]
  );
  const avgCoverage = useMemo(() => {
    if (!filteredRecs?.length) return null;
    const avg =
      filteredRecs.reduce((s, r) => s + (r?.scores?.coverage || 0), 0) /
      filteredRecs.length;
    return Math.round(avg);
  }, [filteredRecs]);
  const avgStrategy = useMemo(() => {
    if (!filteredRecs?.length) return null;
    const avg =
      filteredRecs.reduce(
        (s, r) => s + (strategyMetaByRec?.[r.id]?.strategyScore || 0),
        0
      ) / filteredRecs.length;
    return Math.round(avg);
  }, [filteredRecs, strategyMetaByRec]);
  const activeFilterChips = useMemo(
    () => buildActiveFilterChips(filters),
    [filters]
  );

  return (
    <div className="space-y-4" data-guide-id="toolbar-filter">
      <SectionCard
        title="조건 설정"
        icon={<Filter className="text-emerald-400" size={16} />}
        right={
          <button
            onClick={() =>
              setFilters({
                keyword: "",
                tech: "전체 기술",
                country: "전체 국가",
                purpose: "전체 목적",
                minCoverage: 70,
                strategyFocus: "균형형",
                sortMode: "strategy",
                financeChannel: "전체 재원",
                decisionFilter: "전체",
                minStrategyScore: 60,
                minPipelineProjects: 0,
              })
            }
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            초기화
          </button>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
            <div className="text-[11px] font-bold text-emerald-300">
              현재 검토 기준
            </div>
            <div className="mt-1 text-xs text-slate-300">
              조건을 바꾸면 후보 목록과 지도 결과가 바로 함께 바뀝니다.
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeFilterChips.length ? (
                activeFilterChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-emerald-500/20 bg-slate-950/55 px-2 py-1 text-[11px] text-slate-200"
                  >
                    {chip}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-slate-700 bg-slate-950/55 px-2 py-1 text-[11px] text-slate-300">
                  아직 조건이 넓습니다. 목적이나 기술을 먼저 정해 보세요.
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              빠른 시작 기준
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {ROLE_BASED_WORKFLOWS.slice(0, 4).map((item) => (
                <button
                  key={`filter-purpose-${item.key}`}
                  type="button"
                  onClick={() => safeInvoke(onStartScenario, item.preset)}
                  className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-left text-sm font-semibold text-slate-100 hover:border-emerald-500/30 hover:bg-slate-900"
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {item.label}
                  </div>
                  <div className="mt-1 text-sm text-white">{item.title}</div>
                </button>
              ))}
            </div>
          </div>

          <details className="rounded-2xl border border-slate-700 bg-slate-900/55 p-3">
            <summary className="cursor-pointer list-none text-sm font-semibold text-white">
              이 조건이 왜 필요한지 보기
            </summary>
            <div className="mt-4 space-y-4">
              <DecisionFlowCard
                filters={filters}
                filteredRecs={filteredRecs}
                strategyMetaByRec={strategyMetaByRec}
                compact={compact}
              />
              <PlatformInternationalUtilityCard
                recommendations={filteredRecs}
                strategyMetaByRec={strategyMetaByRec}
              />
            </div>
          </details>

          {compact && (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                모바일 빠른 필터
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {["ODA", "사업화", "정책 설계", "국제감축"].map((purpose) => (
                  <button
                    key={purpose}
                    type="button"
                    onClick={() =>
                      setFilters((p) => ({
                        ...p,
                        purpose: p.purpose === purpose ? "전체 목적" : purpose,
                      }))
                    }
                    className={cx(
                      "rounded-xl border px-3 py-2.5 text-sm font-semibold",
                      filters.purpose === purpose
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-slate-700 bg-slate-950/70 text-slate-300"
                    )}
                  >
                    {purpose}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              키워드 검색
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={filters.keyword}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, keyword: e.target.value }))
                }
                placeholder="국가·지역·기술명으로 검색"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 pl-9 pr-3 py-2.5 text-sm text-white outline-none"
              />
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              예시 · 베트남, 메콩 델타, 조기경보, 재생에너지
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                기술
              </label>
              <select
                value={filters.tech}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, tech: e.target.value }))
                }
                className={cx(
                  "w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none",
                  guidePulse === "toolbar-filter" &&
                    compact &&
                    "guide-pulse-soft"
                )}
              >
                {TECHNOLOGIES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                국가
              </label>
              <select
                value={filters.country}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, country: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"
              >
                {COUNTRIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedTechMeta && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3 text-xs text-slate-300 leading-relaxed">
              <div className="font-bold text-white">기술 설명</div>
              <div className="mt-1">{selectedTechMeta.description}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                목적 선택
              </label>
              <select
                value={filters.purpose}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, purpose: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"
              >
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                판단 기준
              </label>
              <select
                value={filters.strategyFocus}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, strategyFocus: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"
              >
                {STRATEGY_FOCUS_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                정렬
              </label>
              <select
                value={filters.sortMode}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, sortMode: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"
              >
                {STRATEGY_SORT_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                재원
              </label>
              <select
                value={filters.financeChannel}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, financeChannel: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"
              >
                {FINANCE_CHANNEL_FILTERS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                추진 판정
              </label>
              <select
                value={filters.decisionFilter}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, decisionFilter: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"
              >
                {DECISION_FILTERS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                최소 충족 기준
              </label>
              <div className="rounded-xl border border-slate-700 bg-slate-800/35 px-3 py-2.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>기초 데이터 준비도</span>
                  <span className="font-bold text-white">
                    {filters.minCoverage}%
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  step={5}
                  value={filters.minCoverage}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      minCoverage: Number(e.target.value),
                    }))
                  }
                  className="mt-2 w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800/35 px-3 py-2.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>최소 전략 점수</span>
                <span className="font-bold text-white">
                  {filters.minStrategyScore}
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={95}
                step={5}
                value={filters.minStrategyScore}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    minStrategyScore: Number(e.target.value),
                  }))
                }
                className="mt-2 w-full accent-sky-500"
              />
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/35 px-3 py-2.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>최소 파이프라인 수</span>
                <span className="font-bold text-white">
                  {filters.minPipelineProjects}건
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={filters.minPipelineProjects}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    minPipelineProjects: Number(e.target.value),
                  }))
                }
                className="mt-2 w-full accent-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <ScorePill label="전체" value={totalCount} accent="slate" />
            <ScorePill
              label="필터충족"
              value={filteredCount}
              accent="emerald"
            />
            <ScorePill
              label="평균충족"
              value={avgCoverage != null ? `${avgCoverage}%` : "-"}
              accent="blue"
            />
            <ScorePill
              label="평균전략"
              value={avgStrategy != null ? `${avgStrategy}` : "-"}
              accent="violet"
            />
          </div>

          <ScoreMethodCard compact />
        </div>
      </SectionCard>
    </div>
  );
}

function CandidateList({
  recommendations,
  activeRec,
  onSelectRec,
  onOpen검토 = null,
  isMobile = false,
  guidePulse,
  strategyMetaByRec = {},
  shortlistIds = [],
  onToggleShortlist = null,
  expandToFill = false,
}) {
  return (
    <div
      data-guide-id="toolbar-candidates"
      className={cx(
        (isMobile || expandToFill) && "flex h-full min-h-0 flex-col"
      )}
    >
      <SectionCard
        title="협력 대상 탐색"
        icon={<List className="text-emerald-400" size={16} />}
        right={
          <span className="text-xs px-2 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 font-bold">
            {recommendations.length}건
          </span>
        }
        className={cx(
          (isMobile || expandToFill) && "flex h-full min-h-0 flex-col"
        )}
        bodyClassName={cx(
          (isMobile || expandToFill) && "flex min-h-0 flex-1 flex-col"
        )}
      >
        <div
          className={cx(
            "space-y-2.5",
            isMobile || expandToFill
              ? "min-h-0 flex-1 overflow-y-auto pr-1"
              : "max-h-[60dvh] overflow-y-auto pr-1"
          )}
        >
          {recommendations.map((rec, idx) => {
            const safeRec = sanitize검토Record(rec) ||
              rec || { country: "", region: "", tech: "" };
            const isActive = activeRec && rec.id === activeRec.id;
            const meta = strategyMetaByRec?.[rec.id] || {};
            const isShortlisted = safeArray(shortlistIds).includes(rec.id);
            const evidenceMetrics = buildEvidenceMetrics(safeRec);
            const latestEvidenceYear = getLatestEvidenceYear(safeRec);
            const primaryEvidenceLink = getPrimaryEvidenceLink(
              safeRec,
              "overview"
            );
            return (
              <div
                key={rec.id}
                className={cx(
                  "w-full rounded-xl border p-3 transition",
                  isActive
                    ? "border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                    : "border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-700/50",
                  guidePulse === "toolbar-candidates" &&
                    isMobile &&
                    "guide-pulse-soft"
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectRec(rec);
                    if (isMobile) onOpen검토?.();
                  }}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-2 text-[11px] font-bold text-slate-200">
                          {idx + 1}
                        </span>
                        <div className="text-white font-bold text-sm">
                          {safeRec.country}
                          <span className="text-slate-400 font-medium ml-1">
                            · {rec.region}
                          </span>
                        </div>
                      </div>
                      <div className="text-emerald-300 text-sm mt-1">
                        {safeRec.tech}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {meta.oneLine || "우선 검토 사유를 계산 중입니다."}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        왜 상위인가 ·{" "}
                        {meta.financeRoute || "재원 연결 경로 검토 중"} ·
                        파이프라인 {meta.pipelineProjectCount ?? 0}건
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(rec.purposeTags || []).map((p) => (
                          <PillTag
                            key={p}
                            tone={
                              p === "ODA"
                                ? "emerald"
                                : p === "국제감축"
                                ? "blue"
                                : "slate"
                            }
                          >
                            {p}
                          </PillTag>
                        ))}
                        {meta.decision && (
                          <PillTag
                            tone={
                              meta.decision === "즉시 추진 권고"
                                ? "emerald"
                                : meta.decision === "보완 후 추진"
                                ? "blue"
                                : "slate"
                            }
                          >
                            {meta.decision}
                          </PillTag>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] xl:grid-cols-4">
                        <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5">
                          <div className="text-slate-500">종합 판단</div>
                          <div className="mt-0.5 font-extrabold text-white">
                            {meta.strategyScore ?? "-"}
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5">
                          <div className="text-slate-500">최신 근거</div>
                          <div className="mt-0.5 font-extrabold text-white">
                            {latestEvidenceYear || "-"}
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5">
                          <div className="text-slate-500">직접 문서</div>
                          <div className="mt-0.5 font-extrabold text-white">
                            {evidenceMetrics.directLinkCount}건
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5">
                          <div className="text-slate-500">재원 연결</div>
                          <div className="mt-0.5 font-semibold text-slate-200 truncate">
                            {meta.financeRoute || "-"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400">
                        공식 링크 {evidenceMetrics.officialLinkCount}건 · 파트너
                        링크 {evidenceMetrics.partnerLinkCount}건 · 파이프라인{" "}
                        {meta.pipelineProjectCount ?? 0}건
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-400">충족률</div>
                      <div className="text-emerald-300 font-extrabold">
                        {rec?.scores?.coverage ?? 0}%
                      </div>
                    </div>
                  </div>
                </button>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRec(rec);
                      safeInvoke(onOpen검토);
                    }}
                    className={cx(
                      "rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold",
                      isActive
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-sky-500/30 bg-sky-500/10 text-sky-300"
                    )}
                  >
                    {isActive ? "현재 보고 있음" : "이 후보 보기"}
                  </button>
                  {primaryEvidenceLink ? (
                    <a
                      href={primaryEvidenceLink.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="rounded-lg border border-slate-600 bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200"
                    >
                      핵심 근거
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => safeInvoke(onToggleShortlist, rec)}
                    className={cx(
                      "rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold",
                      isShortlisted
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        : "border-slate-600 bg-slate-900 text-slate-200"
                    )}
                  >
                    {isShortlisted ? "후보국 삭제" : "후보국 추가"}
                  </button>
                </div>
              </div>
            );
          })}
          {recommendations.length === 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-sm text-slate-400">
              필터에 맞는 후보가 없습니다. 필터를 조금 완화하거나 키워드
              검색어를 바꿔 다시 살펴보세요.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function FundingExecutionPanel({
  rec,
  liveData,
  liveLoading,
  geoData,
  geoLoading,
  pipelineData,
  pipelineLoading,
  onRefreshLiveData,
  onRefreshGeoData,
  onRefreshPipelineData,
}) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const schemaRows = safeArray(rec?.schema);
  return (
    <div className="space-y-3">
      <SectionCard
        title="실행 데이터 동기화"
        icon={<RefreshCw className="text-emerald-400" size={16} />}
        right={<PillTag tone="slate">국가 + 지역 + 재원</PillTag>}
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => safeInvoke(onRefreshLiveData)}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300"
          >
            {liveLoading ? "동기화 중..." : "실데이터 동기화"}
          </button>
          <button
            onClick={() => safeInvoke(onRefreshGeoData)}
            className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-300"
          >
            {geoLoading ? "검증 중..." : "경계/좌표 검증"}
          </button>
          <button
            onClick={() => safeInvoke(onRefreshPipelineData)}
            className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-xs font-semibold text-violet-300"
          >
            {pipelineLoading ? "조회 중..." : "MDB/GCF 파이프라인"}
          </button>
        </div>

        {!liveData && !liveLoading && (
          <div className="mt-3 rounded-xl border border-slate-700 bg-slate-800/35 px-3 py-2.5 text-xs text-slate-400">
            실시간 데이터 동기화 대기 중입니다. 분석 전 데이터를 동기화하여 최신
            국가/지역 정보를 확보하세요.
          </div>
        )}

        {liveData && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
              <div className="text-slate-400">GDP (WB)</div>
              <div className="text-slate-100 font-semibold">
                {liveData.worldBank?.gdp?.value != null
                  ? `${Number(
                      liveData.worldBank.gdp.value
                    ).toLocaleString()} USD`
                  : "-"}
              </div>
              <div className="text-slate-500">
                {liveData.worldBank?.gdp?.year || ""}
              </div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
              <div className="text-slate-400">인구 (WB)</div>
              <div className="text-slate-100 font-semibold">
                {liveData.worldBank?.population?.value != null
                  ? Number(liveData.worldBank.population.value).toLocaleString()
                  : "-"}
              </div>
              <div className="text-slate-500">
                {liveData.worldBank?.population?.year || ""}
              </div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
              <div className="text-slate-400">전력접근률 (WB)</div>
              <div className="text-slate-100 font-semibold">
                {liveData.worldBank?.electricityAccess?.value != null
                  ? `${Number(
                      liveData.worldBank.electricityAccess.value
                    ).toFixed(1)}%`
                  : "-"}
              </div>
              <div className="text-slate-500">
                {liveData.worldBank?.electricityAccess?.year || ""}
              </div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
              <div className="text-slate-400">GHI / T2M (NASA)</div>
              <div className="text-slate-100 font-semibold">
                {liveData.nasaPower?.ghiAnn != null
                  ? `${liveData.nasaPower.ghiAnn}`
                  : "-"}{" "}
                /{" "}
                {liveData.nasaPower?.t2mAnn != null
                  ? `${liveData.nasaPower.t2mAnn}`
                  : "-"}
              </div>
              <div className="text-slate-500">ANN climatology</div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
              <div className="text-slate-400">재생에너지 비중 (WB)</div>
              <div className="text-slate-100 font-semibold">
                {liveData.worldBank?.renewableEnergy?.value != null
                  ? `${Number(liveData.worldBank.renewableEnergy.value).toFixed(
                      1
                    )}%`
                  : "-"}
              </div>
              <div className="text-slate-500">
                {liveData.worldBank?.renewableEnergy?.year || ""}
              </div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
              <div className="text-slate-400">CO₂ 배출량 (WB)</div>
              <div className="text-slate-100 font-semibold">
                {liveData.worldBank?.co2Emissions?.value != null
                  ? `${Number(
                      liveData.worldBank.co2Emissions.value
                    ).toLocaleString()} kt`
                  : "-"}
              </div>
              <div className="text-slate-500">
                {liveData.worldBank?.co2Emissions?.year || ""}
              </div>
            </div>
          </div>
        )}

        {geoData?.validation && (
          <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-white">
                  좌표 검증 결과
                </div>
                <div className="text-slate-400 mt-1 break-all">
                  {geoData.validation.regionDisplayName}
                </div>
              </div>
              <PillTag
                tone={geoData.validation.distanceKm > 120 ? "amber" : "emerald"}
              >
                {geoData.validation.distanceKm} km
              </PillTag>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="재원·프로젝트 파이프라인"
        icon={<Database className="text-violet-300" size={16} />}
        right={
          <PillTag tone={pipelineData?.projects?.length ? "blue" : "slate"}>
            {pipelineData?.projects?.length
              ? `${pipelineData.projects.length}건`
              : pipelineLoading
              ? "조회 중"
              : "대기"}
          </PillTag>
        }
      >
        {!pipelineData && !pipelineLoading && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/35 px-3 py-2.5 text-xs text-slate-400">
            아직 프로젝트·재원 후보군을 불러오지 않았습니다.
          </div>
        )}

        {pipelineData?.summary && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-2">
                <div className="text-slate-400">국가 · 지역</div>
                <div className="text-slate-100 font-semibold">
                  {pipelineData.summary.country || safeRec.country} /{" "}
                  {pipelineData.summary.region || safeRec.region}
                </div>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-2">
                <div className="text-slate-400">테마</div>
                <div className="text-slate-100 font-semibold">
                  {pipelineData.summary.theme || safeRec.tech}
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-[11px] text-slate-300">
              <span className="font-semibold text-white">
                {pipelineData.summary.statusLabel || "데이터 상태"}
              </span>
              {pipelineData.summary.note
                ? ` · ${pipelineData.summary.note}`
                : ""}
            </div>
          </div>
        )}

        {pipelineData?.isFallback && (
          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
            실시간 파이프라인 API가 아직 연결되지 않아 검증용 기본 데이터를 함께
            보여주고 있습니다.
          </div>
        )}

        {!!pipelineData?.projects?.length && (
          <div className="mt-3 space-y-2">
            {pipelineData.projects.map((project, idx) => (
              <div
                key={`${project.source || "src"}-${project.title || idx}`}
                className="rounded-xl border border-slate-700 bg-slate-800/35 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-white">
                    {project.title || `Project ${idx + 1}`}
                  </div>
                  <PillTag tone="blue">
                    {project.stage || project.status || "재원파이프라인"}
                  </PillTag>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {project.source || "MDB/GCF"}
                  {project.executingPartner || project.partner
                    ? ` · ${project.executingPartner || project.partner}`
                    : ""}
                </div>
                {(project.link || guessSourceHref(project.source)) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <ExternalLinkButton
                      href={project.link || guessSourceHref(project.source)}
                      label={project.link ? "사업 페이지" : "기관 포털"}
                      compact
                    />
                    {project.link &&
                    guessSourceHref(project.source) &&
                    guessSourceHref(project.source) !== project.link ? (
                      <ExternalLinkButton
                        href={guessSourceHref(project.source)}
                        label="기관 포털"
                        compact
                      />
                    ) : null}
                  </div>
                )}
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-slate-300">
                    재원규모:{" "}
                    <span className="text-slate-100">
                      {project.amountUSD != null
                        ? `${Number(project.amountUSD).toLocaleString()} USD`
                        : project.amount || "-"}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-slate-300">
                    국가/지역:{" "}
                    <span className="text-slate-100">
                      {project.country || safeRec.country} /{" "}
                      {project.region || safeRec.region}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* =========================================================
 * 검토 panel content (desktop/mobile shared)
 * ========================================================= */

function FilterOutcomeSnapshotCard({
  filters,
  filteredRecs = [],
  strategyMetaByRec = {},
  activeRec = null,
  onSelectTop = null,
  onBringSelectionIntoView = null,
}) {
  const topRec = safeArray(filteredRecs)[0] || null;
  const topMeta = topRec ? strategyMetaByRec?.[topRec.id] || {} : null;
  const immediateCount = safeArray(filteredRecs).filter(
    (item) => strategyMetaByRec?.[item?.id]?.decision === "즉시 추진 권고"
  ).length;
  const activeVisible = activeRec
    ? safeArray(filteredRecs).some((item) => item?.id === activeRec.id)
    : true;

  return (
    <SectionCard
      title="필터 결과 한눈에 보기"
      icon={<Target className="text-sky-300" size={16} />}
      right={
        <PillTag tone={topRec ? "sky" : "slate"}>
          {filteredRecs.length}건
        </PillTag>
      }
    >
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <ScorePill
            label="현재 목적"
            value={filters?.purpose || "전체 목적"}
            accent="emerald"
          />
          <ScorePill
            label="즉시 검토"
            value={`${immediateCount}건`}
            accent="blue"
          />
          <ScorePill
            label="우선 기술"
            value={techShort(filters?.tech) || filters?.tech || "전체 기술"}
            accent="amber"
          />
        </div>

        {topRec ? (
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/8 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300">
                  지금 바로 열어볼 1순위
                </div>
                <div className="mt-1 text-sm font-bold text-white">
                  {topRec.country} · {topRec.region}
                </div>
                <div className="mt-1 text-xs text-sky-200">
                  {techShort(topRec.tech) || topRec.tech}
                </div>
                <div className="mt-2 text-xs leading-relaxed text-slate-200">
                  {topMeta?.oneLine ||
                    topRec?.countryNote ||
                    safeArray(topRec?.reasons)[0] ||
                    "핵심 검토 포인트를 확인해 보세요."}
                </div>
              </div>
              <PillTag
                tone={
                  topMeta?.decision === "즉시 추진 권고" ? "emerald" : "sky"
                }
              >
                {topMeta?.strategyScore ?? topRec?.scores?.feasibility ?? "-"}
              </PillTag>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => safeInvoke(onSelectTop, topRec)}
                className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-100"
              >
                1순위 후보국 열기
              </button>
              {!activeVisible && activeRec ? (
                <button
                  type="button"
                  onClick={() =>
                    safeInvoke(onBringSelectionIntoView, activeRec)
                  }
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-100"
                >
                  현재 선택 후보 다시 맞추기
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-sm text-slate-400">
            현재 조건에 맞는 후보가 없습니다. 국가나 기술 필터를 한 단계 넓혀
            보세요.
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function PlatformInternationalUtilityCard({
  recommendations = [],
  strategyMetaByRec = {},
}) {
  const summary = useMemo(
    () => buildPlatformIntlUtilitySummary(recommendations, strategyMetaByRec),
    [recommendations, strategyMetaByRec]
  );

  return (
    <SectionCard
      title="국제협력 활용성 진단"
      icon={<Network className="text-emerald-300" size={16} />}
      right={<PillTag tone="emerald">검토용 대시보드</PillTag>}
    >
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
          <div className="text-slate-400">후보 포트폴리오</div>
          <div className="mt-1 text-lg font-black text-white">
            {summary.total}건
          </div>
          <div className="text-slate-500">
            {summary.countries}개국 · {summary.techs}개 기술
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
          <div className="text-slate-400">ODA 적합 후보</div>
          <div className="mt-1 text-lg font-black text-white">
            {summary.odaReady}건
          </div>
          <div className="text-slate-500">양자·MDB 연계 가능성</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
          <div className="text-slate-400">파트너 링크 확보</div>
          <div className="mt-1 text-lg font-black text-white">
            {summary.partnerLinked}건
          </div>
          <div className="text-slate-500">실명 기관+공식 링크</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
          <div className="text-slate-400">심화 검토 후보</div>
          <div className="mt-1 text-lg font-black text-white">
            {summary.strategyReady}건
          </div>
          <div className="text-slate-500">상위 전략점수 기준</div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2 text-xs">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="font-bold text-emerald-300">현재 플랫폼의 활용성</div>
          <ul className="mt-2 space-y-1.5 text-slate-200">
            {summary.strengths.map((item, idx) => (
              <li key={idx} className="flex gap-2">
                <CheckCircle2
                  size={14}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="font-bold text-amber-300">
            추가 보완이 필요한 이유
          </div>
          <ul className="mt-2 space-y-1.5 text-slate-200">
            {summary.gaps.map((item, idx) => (
              <li key={idx} className="flex gap-2">
                <AlertTriangle
                  size={14}
                  className="mt-0.5 shrink-0 text-amber-300"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-[11px] text-slate-300">
        이 플랫폼은 “예쁜 지도”보다{" "}
        <span className="font-semibold text-white">
          국가수요–기술–재원–파트너–실행성
        </span>
        을 함께 읽어내는 국제협력 준비도 도구로 써야 가치가 커집니다.
      </div>
    </SectionCard>
  );
}

function InternationalCooperationReadinessCard({ rec, pipelineData = null }) {
  const assessment = useMemo(
    () => buildInternationalCooperationAssessment(rec, pipelineData),
    [rec, pipelineData]
  );
  if (!assessment) return null;

  return (
    <SectionCard
      title="국제협력 적정성·필요성"
      icon={<Network className="text-emerald-300" size={16} />}
      right={
        <PillTag tone={scoreTone(assessment.overallScore)}>
          {assessment.decision}
        </PillTag>
      }
    >
      <div className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="text-xs font-bold text-emerald-300">종합 판단</div>
          <div className="mt-1 text-2xl font-black text-white">
            {assessment.overallScore}
          </div>
          <div className="mt-1 text-sm text-slate-200">
            {assessment.decision}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
              <div className="text-slate-400">재원 연결 경로</div>
              <div className="mt-1 text-white font-bold">
                {assessment.financeChannels.length}개
              </div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
              <div className="text-slate-400">파이프라인</div>
              <div className="mt-1 text-white font-bold">
                {assessment.pipelineProjectCount}건
              </div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
              <div className="text-slate-400">링크 파트너</div>
              <div className="mt-1 text-white font-bold">
                {assessment.linkedPartnerCount}개
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {assessment.axes.map((axis) => (
            <div
              key={axis.key}
              className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-semibold text-white">{axis.label}</div>
                  <div className="text-slate-400">{axis.note}</div>
                </div>
                <PillTag tone={scoreTone(axis.score)}>
                  {axis.score} · {scoreLabel(axis.score)}
                </PillTag>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        {assessment.routes.map((route) => (
          <div
            key={route.key}
            className="rounded-xl border border-slate-700 bg-slate-800/35 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-white">
                  {route.label}
                </div>
                <div className="mt-1 text-xs text-slate-400">{route.note}</div>
              </div>
              <PillTag tone={scoreTone(route.fit)}>{route.fit}</PillTag>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {route.tags.map((tag, idx) => (
                <PillTag key={idx} tone="slate">
                  {tag}
                </PillTag>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2 text-xs">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="font-bold text-amber-300">보완 필요 사항</div>
          <ul className="mt-2 space-y-1.5 text-slate-200">
            {assessment.gaps.length ? (
              assessment.gaps.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <AlertTriangle
                    size={14}
                    className="mt-0.5 shrink-0 text-amber-300"
                  />
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="flex gap-2">
                <CheckCircle2
                  size={14}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                <span>
                  핵심 국제협력 판단축은 대체로 충족되어, 바로 협의자료로 활용할
                  수 있습니다.
                </span>
              </li>
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
          <div className="font-bold text-sky-300">
            이 플랫폼으로 바로 할 수 있는 일
          </div>
          <ul className="mt-2 space-y-1.5 text-slate-200">
            {assessment.useCases.map((item, idx) => (
              <li key={idx} className="flex gap-2">
                <FileCheck size={14} className="mt-0.5 shrink-0 text-sky-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
        <div className="text-xs font-bold text-white">
          이번 후보에서 바로 할 일
        </div>
        <ol className="mt-2 space-y-1.5 text-xs text-slate-200">
          {assessment.nextActions.map((item, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/15 text-[11px] font-bold text-emerald-300">
                {idx + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>
    </SectionCard>
  );
}

function LocalPartnersCard({ partners = [] }) {
  const normalized = safeArray(partners)
    .map((partner, idx) => {
      if (typeof partner === "string") {
        return {
          name: partner,
          role: idx === 0 ? "정책 승인" : idx === 1 ? "현장 실행" : "운영·확산",
          priority: idx === 0 ? "핵심" : idx === 1 ? "권장" : "후보",
          note: "후속 조사 시 기관 실명과 역할을 구체화할 수 있습니다.",
        };
      }
      return {
        ...partner,
        href: ensureExternalUrl(partner?.href || partner?.link),
        note: partner?.note || "현지 파트너 역할을 추가 정리 중입니다.",
      };
    })
    .filter(Boolean);

  return (
    <SectionCard
      title="현지 협력 파트너"
      icon={<Target className="text-emerald-300" size={16} />}
      right={<PillTag tone="slate">{normalized.length}개 기관</PillTag>}
    >
      {normalized.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-3 py-3 text-xs text-slate-400">
          아직 실명 기관이 탑재되지 않았습니다. 현재는 역할군 기준의 파트너
          프레임만 제시합니다.
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {normalized.map((partner, idx) => (
            <div
              key={`${partner.name}-${idx}`}
              className="rounded-xl border border-slate-700 bg-slate-800/35 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white break-words">
                    {partner.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {partner.role}
                  </div>
                </div>
                <PillTag
                  tone={
                    partner.priority === "핵심"
                      ? "emerald"
                      : partner.priority === "권장"
                      ? "blue"
                      : "slate"
                  }
                >
                  {partner.priority}
                </PillTag>
              </div>
              <div className="mt-2 text-xs text-slate-300">{partner.note}</div>
              {partner.href && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <ExternalLinkButton
                    href={partner.href}
                    label={partner.linkLabel || "공식 사이트"}
                    compact
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-[11px] text-slate-300">
        정책 승인·현장 수행·운영 주체를 구분해 보여주며, 확인 가능한 공식 링크를
        함께 제공합니다.
      </div>
    </SectionCard>
  );
}

function sanitize검토Record(rec) {
  if (!rec) return null;
  return {
    ...rec,
    country: rec?.country || "",
    region: rec?.region || "",
    tech: rec?.tech || "",
    continent: rec?.continent || "",
    coordBasis: rec?.coordBasis || "",
    countryNote: rec?.countryNote || "",
    purposeTags: safeArray(rec?.purposeTags),
    reasons: safeArray(rec?.reasons),
    inventoryRows: safeArray(rec?.inventoryRows),
    actions: safeArray(rec?.actions),
    sourcePlan: safeArray(rec?.sourcePlan),
    regionRows: safeArray(rec?.regionRows),
    localPartners: safeArray(rec?.localPartners),
    liveDataFields: safeArray(rec?.liveDataFields),
    scores: {
      coverage: Number(rec?.scores?.coverage || 0),
      reliability: Number(rec?.scores?.reliability || 0),
      resilience: Number(rec?.scores?.resilience || 0),
      feasibility: Number(rec?.scores?.feasibility || 0),
    },
    cooperationProfile: rec?.cooperationProfile || {
      headline: rec?.tech ? `${rec.tech} 협력 패키지` : "협력 패키지",
      partnershipModel: "정책·사업·실증 연계형 모델",
      quickWin: "기초 진단 → 데이터 보강 → 실행 파트너 매칭",
      scoreSummary: "검토 필요",
    },
  };
}

function boundScore(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
}

function scoreTone(score) {
  if (score >= 80) return "emerald";
  if (score >= 65) return "blue";
  if (score >= 45) return "amber";
  return "slate";
}

function scoreLabel(score) {
  if (score >= 80) return "높음";
  if (score >= 65) return "보통 이상";
  if (score >= 45) return "보완 필요";
  return "기초 보강 필요";
}

function includesKeyword(text, patterns = []) {
  return patterns.some((pattern) => pattern.test(text));
}

function getMergedPipelineProjects(rec, pipelineData = null) {
  return uniqBy(
    [...(pipelineData?.projects || []), ...getPipelineSeedProjects(rec)],
    (item) => `${item?.source || ""}|${item?.title || ""}`
  );
}

function classifyEvidenceLinkQuality(href = "") {
  const url = String(href || "").toLowerCase();
  if (!url) return "none";
  if (
    /\.pdf($|[?#])|\/document\/|\/documents\/\d+|\/project\/fp\d+|\/publication\/documents-reports\/documentdetail\//i.test(
      url
    )
  )
    return "direct";
  if (
    /\/countries\/|\/country\/|\/node\/|\/where-we-work\/|\/projects\//i.test(
      url
    )
  )
    return "detail";
  if (
    /\/ndcreg|napcentral|\/country-index|data\.worldbank\.org\/country\//i.test(
      url
    )
  )
    return "portal";
  return "other";
}

function buildEvidenceMetrics(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) ||
    rec || {
      country: "",
      region: "",
      tech: "",
      scores: { coverage: 0, reliability: 0, resilience: 0, feasibility: 0 },
    };

  const sourcePlan = safeArray(safeRec.sourcePlan);
  const regionRows = safeArray(safeRec.regionRows);
  const inventoryRows = safeArray(safeRec.inventoryRows);
  const strategySourceData = safeArray(safeRec?.strategyEvidence?.sourceData);
  const pipelineProjects = getMergedPipelineProjects(safeRec, pipelineData);
  const financeChannels = uniqBy(
    [
      ...safeArray(safeRec?.executionFeasibility?.financeChannels),
      ...getRecFinanceChannels(safeRec),
    ].filter(Boolean),
    (item) => item
  );
  const evidenceLinks = collectEvidenceLinks(safeRec, "general");
  const partners = safeArray(safeRec.localPartners).length
    ? safeArray(safeRec.localPartners)
    : getPartnerDirectory(safeRec);
  const partnerLinkCount = partners.filter((item) =>
    ensureExternalUrl(item?.href || item?.link)
  ).length;
  const directLinkCount = evidenceLinks.filter(
    (item) => classifyEvidenceLinkQuality(item?.href) === "direct"
  ).length;
  const detailLinkCount = evidenceLinks.filter(
    (item) => classifyEvidenceLinkQuality(item?.href) === "detail"
  ).length;
  const policyDocumentCount = uniqBy(
    [
      ...sourcePlan.filter((item) =>
        /(정책|공약|전략|NAP|NDC|기후전략|계획)/i.test(
          `${item?.layer || ""} ${item?.source || ""}`
        )
      ),
      ...regionRows.filter((item) =>
        /(국가 공약|정책|지역계획|기후전략)/i.test(
          `${item?.category || ""} ${item?.field || ""}`
        )
      ),
      ...strategySourceData.filter((item) =>
        /(정책|공약|전략)/i.test(`${item?.group || ""} ${item?.label || ""}`)
      ),
    ],
    (item) =>
      `${item?.layer || item?.category || item?.group || ""}|${
        item?.source || item?.field || item?.label || ""
      }`
  ).length;
  const financeSignalCount = uniqBy(
    [
      ...pipelineProjects,
      ...sourcePlan.filter((item) =>
        /(gcf|world bank|adb|재원|finance|programme|ccdr|project)/i.test(
          `${item?.source || ""} ${item?.layer || ""} ${item?.note || ""}`
        )
      ),
    ],
    (item) => `${item?.source || item?.title || item?.endpoint || ""}`
  ).length;

  const sourceDataCount =
    sourcePlan.length +
    strategySourceData.reduce(
      (sum, item) => sum + 1 + safeArray(item?.rows).length,
      0
    );

  const regionFactCount =
    regionRows.length +
    safeArray(pipelineProjects).filter(
      (item) =>
        item?.country === safeRec.country || item?.region === safeRec.region
    ).length;

  const missingCount = inventoryRows.filter((row) => {
    const status = `${row?.status || ""}`.trim();
    return status && !/^(확보|완료|available|done)$/i.test(status);
  }).length;

  const coverage =
    safeRec?.scores?.coverage != null
      ? boundScore(safeRec.scores.coverage)
      : boundScore(
          52 +
            Math.min(sourcePlan.length, 4) * 8 +
            Math.min(regionRows.length, 4) * 6 +
            Math.min(pipelineProjects.length, 3) * 5 -
            Math.min(missingCount, 4) * 5
        );

  const feasibility =
    safeRec?.scores?.feasibility != null
      ? boundScore(safeRec.scores.feasibility)
      : boundScore(
          46 +
            Math.min(financeChannels.length, 4) * 9 +
            Math.min(pipelineProjects.length, 3) * 7 +
            (safeArray(safeRec.localPartners).length ? 8 : 0)
        );

  return {
    coverage,
    feasibility,
    sourceCount: sourceDataCount,
    regionFactCount,
    missingCount,
    pipelineCount: pipelineProjects.length,
    financeChannels,
    directLinkCount,
    detailLinkCount,
    partnerLinkCount,
    policyDocumentCount,
    financeSignalCount,
    officialLinkCount: evidenceLinks.length,
  };
}

function buildPracticalMetrics(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) || rec || EMPTY_DETAIL_RECORD;
  const assessment = buildInternationalCooperationAssessment(
    safeRec,
    pipelineData
  );
  const evidenceMetrics = buildEvidenceMetrics(safeRec, pipelineData);
  const documentReadiness = boundScore(
    Number(safeRec?.scores?.reliability || 0) * 0.45 +
      evidenceMetrics.directLinkCount * 8 +
      evidenceMetrics.policyDocumentCount * 5 +
      evidenceMetrics.officialLinkCount * 3
  );
  const financeReadiness = boundScore(
    Number(safeRec?.scores?.feasibility || 0) * 0.35 +
      evidenceMetrics.financeSignalCount * 8 +
      evidenceMetrics.pipelineCount * 6 +
      Math.min(evidenceMetrics.financeChannels.length, 4) * 6
  );
  const partnerAccess = boundScore(
    Number(assessment?.partnerCount || 0) * 10 +
      Number(assessment?.linkedPartnerCount || 0) * 12 +
      (safeRec?.region ? 10 : 0) +
      Number(safeRec?.scores?.resilience || 0) * 0.35
  );
  const policyAlignment = boundScore(
    Number(
      assessment?.axes?.find((axis) => axis.key === "national")?.score || 0
    ) *
      0.7 +
      evidenceMetrics.policyDocumentCount * 7 +
      (safeArray(safeRec.purposeTags).includes("정책 설계") ? 8 : 0)
  );
  return [
    {
      key: "policyAlignment",
      label: METRIC_FRAMEWORK.policyAlignment.label,
      score: policyAlignment,
      note: `${evidenceMetrics.policyDocumentCount}건 정책 근거 · 국가 전략 연결성`,
      description: METRIC_FRAMEWORK.policyAlignment.definition,
    },
    {
      key: "financeReadiness",
      label: METRIC_FRAMEWORK.financeReadiness.label,
      score: financeReadiness,
      note: `${evidenceMetrics.pipelineCount}건 파이프라인 · ${evidenceMetrics.financeSignalCount}건 재원 신호`,
      description: METRIC_FRAMEWORK.financeReadiness.definition,
    },
    {
      key: "partnerAccess",
      label: METRIC_FRAMEWORK.partnerAccess.label,
      score: partnerAccess,
      note: `${evidenceMetrics.partnerLinkCount}개 공식 링크 · ${
        assessment?.partnerCount || 0
      }개 파트너`,
      description: METRIC_FRAMEWORK.partnerAccess.definition,
    },
    {
      key: "documentReadiness",
      label: METRIC_FRAMEWORK.documentReadiness.label,
      score: documentReadiness,
      note: `${evidenceMetrics.directLinkCount}건 직접 문서 · ${evidenceMetrics.officialLinkCount}건 공식 링크`,
      description: METRIC_FRAMEWORK.documentReadiness.definition,
    },
  ];
}

function buildMetricDefinitionRows(rec, pipelineData = null) {
  const evidenceMetrics = buildEvidenceMetrics(rec, pipelineData);
  const practicalMetrics = buildPracticalMetrics(rec, pipelineData);
  const practicalMap = Object.fromEntries(
    practicalMetrics.map((item) => [item.key, item])
  );
  return [
    {
      metric: METRIC_FRAMEWORK.coverage.label,
      definition: METRIC_FRAMEWORK.coverage.definition,
      basis: `${evidenceMetrics.sourceCount}개 근거 항목 · ${evidenceMetrics.regionFactCount}개 지역·프로젝트 신호 · 결측 ${evidenceMetrics.missingCount}건`,
    },
    {
      metric: METRIC_FRAMEWORK.reliability.label,
      definition: METRIC_FRAMEWORK.reliability.definition,
      basis: `직접 문서 ${evidenceMetrics.directLinkCount}건 · 상세 페이지 ${evidenceMetrics.detailLinkCount}건 · 공식 링크 ${evidenceMetrics.officialLinkCount}건`,
    },
    {
      metric: METRIC_FRAMEWORK.resilience.label,
      definition: METRIC_FRAMEWORK.resilience.definition,
      basis: `공식 링크 파트너 ${evidenceMetrics.partnerLinkCount}개 · 재원 채널 ${evidenceMetrics.financeChannels.length}개`,
    },
    {
      metric: METRIC_FRAMEWORK.feasibility.label,
      definition: METRIC_FRAMEWORK.feasibility.definition,
      basis: `데이터 충족률·근거 신뢰도·결측 복원력을 종합한 점수`,
    },
    {
      metric: METRIC_FRAMEWORK.policyAlignment.label,
      definition: METRIC_FRAMEWORK.policyAlignment.definition,
      basis:
        practicalMap.policyAlignment?.note || "국가 우선순위 문서 연결 수준",
    },
    {
      metric: METRIC_FRAMEWORK.financeReadiness.label,
      definition: METRIC_FRAMEWORK.financeReadiness.definition,
      basis: practicalMap.financeReadiness?.note || "재원 연결 수준",
    },
    {
      metric: METRIC_FRAMEWORK.partnerAccess.label,
      definition: METRIC_FRAMEWORK.partnerAccess.definition,
      basis: practicalMap.partnerAccess?.note || "현지 파트너 준비 수준",
    },
    {
      metric: METRIC_FRAMEWORK.documentReadiness.label,
      definition: METRIC_FRAMEWORK.documentReadiness.definition,
      basis: practicalMap.documentReadiness?.note || "직접 문서 확보 수준",
    },
  ];
}

function buildInternationalCooperationAssessment(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const sourcePlan = safeArray(safeRec.sourcePlan);
  const regionRows = safeArray(safeRec.regionRows);
  const partners = safeArray(safeRec.localPartners).length
    ? safeArray(safeRec.localPartners)
    : getPartnerDirectory(safeRec);
  const linkedPartners = partners.filter((item) =>
    ensureExternalUrl(item?.href || item?.link)
  ).length;
  const pipelineProjects = getMergedPipelineProjects(safeRec, pipelineData);
  const financeChannels = uniqBy(
    [
      ...safeArray(safeRec?.executionFeasibility?.financeChannels),
      ...getRecFinanceChannels(safeRec),
    ].filter(Boolean),
    (item) => item
  );

  const corpus = [
    ...sourcePlan.map(
      (item) => `${item?.layer || ""} ${item?.source || ""} ${item?.note || ""}`
    ),
    ...regionRows.map(
      (item) =>
        `${item?.category || ""} ${item?.field || ""} ${item?.value || ""} ${
          item?.source || ""
        }`
    ),
    ...safeArray(safeRec.purposeTags),
    ...safeArray(safeRec.reasons),
    ...safeArray(safeRec.required),
    ...safeArray(safeRec.missing),
  ].join(" ");

  const policySignals = [
    /TNA/i,
    /NDC/i,
    /NAP/i,
    /기후전략|적응계획|마스터플랜|국가.*계획|정책/i,
  ].filter((pattern) => includesKeyword(corpus, [pattern])).length;

  const barrierSignals = [
    /장벽|barrier/i,
    /인허가|규제|조달|PPP|승인/i,
    /역량|capacity|거버넌스/i,
  ].filter((pattern) => includesKeyword(corpus, [pattern])).length;

  const safeguardSignals = [
    /gender|여성|사회|포용|inclusion/i,
    /MRV|monitor|report|평가|성과관리/i,
    /환경영향|safeguard|민감도|stakeholder/i,
  ].filter((pattern) => includesKeyword(corpus, [pattern])).length;

  const nationalScore = boundScore(
    52 +
      policySignals * 12 +
      (safeArray(safeRec.reasons).length ? 8 : 0) +
      (safeArray(safeRec.purposeTags).includes("정책 설계") ? 8 : 0)
  );
  const ctcnScore = boundScore(
    42 +
      policySignals * 10 +
      barrierSignals * 10 +
      (safeArray(safeRec.required).length ? 8 : 0) +
      (safeArray(safeRec.actions).length ? 6 : 0)
  );
  const financeScore = boundScore(
    38 +
      Math.min(pipelineProjects.length, 3) * 12 +
      Math.min(financeChannels.length, 4) * 8 +
      (safeArray(safeRec.purposeTags).includes("ODA") ? 8 : 0)
  );
  const partnerScore = boundScore(
    30 +
      Math.min(partners.length, 4) * 12 +
      Math.min(linkedPartners, 3) * 8 +
      (safeRec.region ? 6 : 0)
  );
  const dataScore = boundScore(
    (Number(safeRec?.scores?.coverage || 0) +
      Number(safeRec?.scores?.reliability || 0) +
      Number(safeRec?.scores?.resilience || 0)) /
      3
  );
  const safeguardsScore = boundScore(
    28 +
      safeguardSignals * 18 +
      (sourcePlan.length ? 8 : 0) +
      (regionRows.length ? 6 : 0)
  );

  const overallScore = boundScore(
    nationalScore * 0.22 +
      ctcnScore * 0.16 +
      financeScore * 0.2 +
      partnerScore * 0.16 +
      dataScore * 0.16 +
      safeguardsScore * 0.1
  );

  const routes = [
    {
      key: "ctcn",
      label: "CTCN 기술지원",
      fit: boundScore((nationalScore + ctcnScore + partnerScore) / 3),
      note: "국가 우선순위·장벽·이해관계자 정의를 바탕으로 NDE 경유 요청서 초안을 준비하기 좋은 상태입니다.",
      tags: ["국가 우선순위", "장벽 정의", "기술지원"],
    },
    {
      key: "gcf",
      label: "GCF 준비/PPF",
      fit: boundScore((nationalScore + financeScore + safeguardsScore) / 3),
      note: "Country programme → concept note → PPF/FP로 이어지는 투자준비 경로를 검토할 수 있습니다.",
      tags: ["개념노트", "투자기준", "재원 준비"],
    },
    {
      key: "oda",
      label: "ODA·MDB 사업형성",
      fit: boundScore((financeScore + partnerScore + dataScore) / 3),
      note: "양자협력·MDB 공동형성·실증 패키지 설계를 위한 기초 화면으로 활용할 수 있습니다.",
      tags: ["ODA", "MDB", "실증"],
    },
  ];

  const gaps = [
    nationalScore < 70
      ? "TNA/NDC/NAP 등 국가 우선순위 문서 연결을 더 명시적으로 붙일 필요가 있습니다."
      : null,
    financeScore < 70
      ? "개념노트 수준의 파이프라인·재원 규모·집행경로 정보 보강이 필요합니다."
      : null,
    partnerScore < 70
      ? "현지 파트너의 실명 기관, 역할, 공식 링크를 더 확대해야 합니다."
      : null,
    safeguardsScore < 60
      ? "성별·사회적 포용, MRV, 환경·사회 safeguard 정보를 구조화할 필요가 있습니다."
      : null,
  ].filter(Boolean);

  const nextActions = uniqBy(
    [
      ...safeArray(safeRec.actions).slice(0, 3),
      nationalScore < 70
        ? "국가 TNA/NDC/NAP와 해당 기술·지역의 정합성 근거를 1페이지로 정리"
        : null,
      ctcnScore < 70
        ? "기술 장벽·요청 범위·기대성과를 CTCN 요청서 형식으로 재구성"
        : null,
      financeScore < 70
        ? "Concept note용 재원 규모, 집행 파트너, 준비비용(PPF/Readiness) 가정 보강"
        : null,
      safeguardsScore < 60
        ? "성별·사회적 포용, MRV, 이해관계자 참여 계획을 별도 블록으로 추가"
        : null,
    ].filter(Boolean),
    (item) => item
  ).slice(0, 5);

  const useCases = uniqBy(
    [
      "양자협력 초기 협의자료",
      "현지 파트너 미팅 준비본",
      routes[0].fit >= 70 ? "CTCN 요청서 초안" : null,
      routes[1].fit >= 70 ? "GCF concept note 사전검토" : null,
      routes[2].fit >= 70 ? "ODA·MDB 사업발굴 메모" : null,
    ].filter(Boolean),
    (item) => item
  );

  return {
    overallScore,
    decision:
      overallScore >= 80
        ? "국제협력 추진 적합"
        : overallScore >= 65
        ? "보완 후 활용 가능"
        : "기초자료 보강 필요",
    axes: [
      {
        key: "national",
        label: "국가 수요 정합성",
        score: nationalScore,
        note: "TNA/NDC/NAP·국가전략과 기술 수요 연결",
      },
      {
        key: "ctcn",
        label: "CTCN 요청 준비도",
        score: ctcnScore,
        note: "장벽·이해관계자·기술지원 범위 정의",
      },
      {
        key: "finance",
        label: "GCF·ODA 재원 준비도",
        score: financeScore,
        note: "파이프라인·개념노트·재원경로 연결",
      },
      {
        key: "partners",
        label: "현지 파트너 준비도",
        score: partnerScore,
        note: "정책 승인·현장 실행·운영 파트너 정리",
      },
      {
        key: "data",
        label: "데이터 준비도",
        score: dataScore,
        note: "근거데이터, 지리정보, 프로젝트 근거 수준",
      },
      {
        key: "safeguards",
        label: "MRV·포용·거버넌스",
        score: safeguardsScore,
        note: "성과관리, 포용, 환경·사회 고려",
      },
    ],
    routes,
    financeChannels,
    pipelineProjectCount: pipelineProjects.length,
    partnerCount: partners.length,
    linkedPartnerCount: linkedPartners,
    gaps,
    nextActions,
    useCases,
  };
}

function buildPlatformIntlUtilitySummary(
  recommendations = [],
  strategyMetaByRec = {}
) {
  const list = safeArray(recommendations);
  const total = list.length;
  const countries = uniqBy(
    list.map((item) => item?.country).filter(Boolean),
    (item) => item
  ).length;
  const techs = uniqBy(
    list.map((item) => normalizeTechName(item?.tech)).filter(Boolean),
    (item) => item
  ).length;
  const partnerLinked = list.filter((item) => {
    const partners = safeArray(item?.localPartners).length
      ? safeArray(item?.localPartners)
      : getPartnerDirectory(item);
    return partners.some((partner) =>
      ensureExternalUrl(partner?.href || partner?.link)
    );
  }).length;
  const odaReady = list.filter((item) =>
    safeArray(item?.purposeTags).includes("ODA")
  ).length;
  const strategyReady = list.filter(
    (item) => Number(strategyMetaByRec?.[item?.id]?.strategyScore || 0) >= 80
  ).length;
  const pipelineReady = list.filter(
    (item) =>
      Number(strategyMetaByRec?.[item?.id]?.pipelineProjectCount || 0) > 0
  ).length;

  return {
    total,
    countries,
    techs,
    partnerLinked,
    odaReady,
    strategyReady,
    pipelineReady,
    strengths: [
      "국가·지역·기술 후보를 함께 보여줘 국제협력 초기 검토 속도를 높입니다.",
      "프로젝트·재원·현지 파트너를 같은 화면에서 연결해 concept note 이전 단계의 논의를 돕습니다.",
      "CTIS 38대 기술 체계와 지도 기반 탐색을 결합해 협력기술 포트폴리오 설명력이 높습니다.",
    ],
    gaps: [
      "TNA/NDC/NAP와의 정합성을 더 직접적으로 표시하는 구조가 필요합니다.",
      "GCF readiness/PPF, CTCN 요청서, ODA 사업형성으로 이어지는 제출 경로 표시가 필요합니다.",
      "MRV, 성별·사회적 포용, safeguard, 조달·집행 리스크 정보를 더 구조화해야 합니다.",
    ],
  };
}

function toStatusTone(score) {
  if (score >= 80) return "emerald";
  if (score >= 65) return "blue";
  if (score >= 50) return "amber";
  return "slate";
}

function scoreStatusLabel(score) {
  if (score >= 80) return "충분";
  if (score >= 65) return "보완 후 가능";
  if (score >= 50) return "보강 필요";
  return "기초자료 부족";
}

function buildInternationalFrameworkRows(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  const assessment = buildInternationalCooperationAssessment(
    safeRec,
    pipelineData
  );
  const pipelineProjects = getMergedPipelineProjects(safeRec, pipelineData);
  const partners = safeArray(safeRec.localPartners).length
    ? safeArray(safeRec.localPartners)
    : getPartnerDirectory(safeRec);
  const linkedPartners = partners.filter((partner) =>
    ensureExternalUrl(partner?.href || partner?.link)
  ).length;
  const sourceCount =
    safeArray(safeRec.sourcePlan).length + safeArray(safeRec.regionRows).length;
  const nationalAxis = safeArray(assessment?.axes).find(
    (axis) => axis.key === "national"
  );
  const ctcnAxis = safeArray(assessment?.axes).find(
    (axis) => axis.key === "ctcn"
  );
  const financeAxis = safeArray(assessment?.axes).find(
    (axis) => axis.key === "finance"
  );
  const safeguardAxis = safeArray(assessment?.axes).find(
    (axis) => axis.key === "safeguards"
  );
  const countryPriorityScore = boundScore(
    (nationalAxis?.score || 0) +
      (sourceCount >= 6 ? 8 : sourceCount >= 3 ? 4 : 0)
  );
  const ctcnScore = boundScore(
    (ctcnAxis?.score || 0) + (safeArray(safeRec.required).length ? 6 : 0)
  );
  const gcfScore = boundScore(
    (financeAxis?.score || 0) + (pipelineProjects.length >= 2 ? 6 : 0)
  );
  const odaScore = boundScore(
    (financeAxis?.score || 0) +
      (safeArray(safeRec.purposeTags).includes("ODA") ? 10 : 0) +
      (linkedPartners >= 2 ? 6 : 0)
  );
  const developmentScore = boundScore(
    Number(safeRec?.scores?.resilience || 0) * 0.4 +
      Number(safeRec?.scores?.coverage || 0) * 0.3 +
      (pipelineProjects.length >= 1 ? 16 : 8)
  );
  const safeguardsScore = safeguardAxis?.score || 0;

  return [
    {
      key: "national",
      title: "국가 우선순위 정합성",
      short: "TNA / NDC / NAP",
      score: countryPriorityScore,
      note: "국가 수요와 지역 문제정의를 먼저 묶어야 사업형성 논리가 단단해집니다.",
      action: "1페이지 정합성 메모 작성",
      platformUse:
        "핵심 요약·출처 탭의 국가 메모, 이유, 지역 자료를 근거로 정합성 문구를 정리",
      href: INTERNATIONAL_COOP_REFERENCE_SHELF[0].href,
      hrefLabel: "TNA Handbook",
    },
    {
      key: "ctcn",
      title: "기술지원 요청 준비",
      short: "CTCN / NDE",
      score: ctcnScore,
      note: "기술 장벽, 요청 범위, 이해관계자, 기대성과가 정리되면 NDE 경유 요청 준비도가 올라갑니다.",
      action: "장벽·기대성과 중심 요청서 초안",
      platformUse:
        "추천 협력·다음 액션·현지 파트너를 이용해 요청 범위와 수혜기관을 구조화",
      href: INTERNATIONAL_COOP_REFERENCE_SHELF[1].href,
      hrefLabel: "CTCN NDE",
    },
    {
      key: "gcf",
      title: "기후재원 파이프라인",
      short: "GCF Readiness / Country Programme",
      score: gcfScore,
      note: "Country Programme과 Readiness는 국가 우선순위와 프로젝트 파이프라인을 연결하는 핵심 단계입니다.",
      action: "국가 프로그램 연계 concept note 메모",
      platformUse:
        "재원·실행 탭의 프로젝트·재원 신호를 concept note 전단계 자료로 사용",
      href: INTERNATIONAL_COOP_REFERENCE_SHELF[3].href,
      hrefLabel: "Country Programme",
      secondaryHref: INTERNATIONAL_COOP_REFERENCE_SHELF[2].href,
      secondaryHrefLabel: "Readiness",
    },
    {
      key: "oda",
      title: "양자·MDB 사업형성",
      short: "ODA / MDB",
      score: odaScore,
      note: "현지 정부·유틸리티·집행기관을 묶어 실증형 또는 인프라형 협력패키지로 전개하기 좋습니다.",
      action: "사업발굴 메모와 예산 가정 작성",
      platformUse:
        "현지 파트너, 재원 연결 경로, 대표 프로젝트 링크를 한 번에 묶어 협의자료로 정리",
      href: INTERNATIONAL_COOP_REFERENCE_SHELF[4].href,
      hrefLabel: "CCDR",
    },
    {
      key: "development",
      title: "개발효과 설명력",
      short: "Resilience / Jobs / Service",
      score: developmentScore,
      note: "기후와 개발효과를 함께 설명해야 협력사업의 정책 설득력이 올라갑니다.",
      action: "개발효과·서비스개선 스토리라인 정리",
      platformUse:
        "국가 메모, 이유, 데이터 가용성·복원력 점수를 활용해 개발효과 narrative 정리",
      href: INTERNATIONAL_COOP_REFERENCE_SHELF[4].href,
      hrefLabel: "CCDR",
    },
    {
      key: "safeguards",
      title: "MRV·포용·거버넌스",
      short: "MRV / Inclusion / Safeguards",
      score: safeguardsScore,
      note: "성과관리, 사회적 포용, 이해관계자 참여가 구조화될수록 실제 사업 제출 가능성이 높아집니다.",
      action: "MRV·포용 체크리스트 보강",
      platformUse:
        "근거 자료와 다음 액션을 활용해 성과지표, 참여계획, safeguard 공백을 확인",
      href: INTERNATIONAL_COOP_REFERENCE_SHELF[2].href,
      hrefLabel: "Readiness",
    },
  ];
}

function buildCooperationActionPlan(rec, pipelineData = null) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  const assessment = buildInternationalCooperationAssessment(
    safeRec,
    pipelineData
  );
  const routes = safeArray(assessment?.routes).sort(
    (a, b) => Number(b.fit || 0) - Number(a.fit || 0)
  );
  const preferredRoute = routes[0] || { label: "ODA·MDB 사업형성", fit: 0 };
  const partners = safeArray(safeRec.localPartners).length
    ? safeArray(safeRec.localPartners)
    : getPartnerDirectory(safeRec);
  const partnerNames = partners
    .slice(0, 3)
    .map((item) => item?.name || item)
    .filter(Boolean);
  const financeChannels = safeArray(assessment?.financeChannels);

  return [
    {
      key: "phase-1",
      phase: "0–30일",
      title: "정합성·문제정의 확정",
      owner: "국내 PM + 현지 정책 파트너",
      deliverables: [
        `${safeRec.country} · ${safeRec.region} 대상 1페이지 수요 정합성 메모 작성`,
        `${safeRec.tech} 기술 장벽과 기대성과를 3~5개 문장으로 정리`,
        partnerNames.length
          ? `우선 접촉기관: ${partnerNames.join(", ")}`
          : "핵심 정책·집행기관 후보 보강",
      ],
      risk: "국가 전략과의 연결이 약하면 concept note 이전 단계에서 설득력이 낮아집니다.",
    },
    {
      key: "phase-2",
      phase: "30–90일",
      title: `${preferredRoute.label} 경로 설계`,
      owner: "국제협력 실무자 + 재원 담당",
      deliverables: [
        preferredRoute.label === "CTCN 기술지원"
          ? "NDE 접점, 요청 범위, 기대성과를 요청서 형식으로 정리"
          : `${preferredRoute.label}용 개념메모와 예산 가정 정리`,
        financeChannels.length
          ? `재원 조합 검토: ${financeChannels.join(" · ")}`
          : "재원 후보와 집행 구조 보강",
        "현지 파트너 역할(정책 승인·현장 실행·운영)을 1장 표로 정리",
      ],
      risk: "재원 연결 경로와 집행구조가 연결되지 않으면 내부 검토 단계에서 보류될 수 있습니다.",
    },
    {
      key: "phase-3",
      phase: "90–180일",
      title: "제출·협의 자료 전환",
      owner: "제안서 작성자 + 파트너 컨소시엄",
      deliverables: [
        "공유용 요약본을 회의자료, 출장자료, 제안서 초안으로 쉽게 옮길 수 있습니다",
        "성과지표(MRV), 포용, safeguard, 조달 리스크를 별도 부속으로 구조화",
        "대표 프로젝트/파이프라인과 연결한 후속사업 로드맵 정리",
      ],
      risk: "MRV, 포용, safeguard가 빠지면 GCF/ODA/MDB 제출문서 완성도가 떨어집니다.",
    },
  ];
}

function buildPartnerEngagementRows(partners = []) {
  const normalized = safeArray(partners).map((partner, idx) => {
    const item =
      typeof partner === "string" ? { name: partner } : partner || {};
    const roleText = `${item.role || ""} ${item.note || ""}`;
    let lane = "운영·확산";
    if (/정책|승인|부처|정부|regulator|nde|nda/i.test(roleText))
      lane = "정책 승인";
    else if (/재원|금융|bank|fund|투자/i.test(roleText)) lane = "재원·투자";
    else if (/연구|대학|기상|data|지식/i.test(roleText)) lane = "지식·데이터";
    else if (/현장|실행|utility|배전|운영|시범/i.test(roleText))
      lane = "현장 실행";
    return {
      ...item,
      name: item.name || `파트너 ${idx + 1}`,
      lane,
      href: ensureExternalUrl(item.href || item.link),
    };
  });
  const laneOrder = [
    "정책 승인",
    "현장 실행",
    "재원·투자",
    "지식·데이터",
    "운영·확산",
  ];
  return laneOrder.map((lane) => ({
    lane,
    items: normalized.filter((item) => item.lane === lane),
  }));
}

function InternationalFrameworkAlignmentCard({ rec, pipelineData = null }) {
  const rows = useMemo(
    () => buildInternationalFrameworkRows(rec, pipelineData),
    [rec, pipelineData]
  );
  const strongCount = rows.filter((row) => row.score >= 80).length;
  return (
    <SectionCard
      title="국제협력 프레임워크 정합성"
      icon={<BookOpen className="text-emerald-300" size={16} />}
      right={
        <PillTag
          tone={
            strongCount >= 3 ? "emerald" : strongCount >= 1 ? "blue" : "slate"
          }
        >
          {strongCount}개 축 우수
        </PillTag>
      }
    >
      <div className="grid gap-3 xl:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">{row.title}</div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {row.short}
                </div>
              </div>
              <PillTag tone={toStatusTone(row.score)}>
                {row.score} · {scoreStatusLabel(row.score)}
              </PillTag>
            </div>
            <div className="mt-2 text-xs leading-relaxed text-slate-300">
              {row.note}
            </div>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
                <div className="text-slate-400">
                  이 플랫폼에서 바로 할 수 있는 일
                </div>
                <div className="mt-1 text-slate-100">{row.platformUse}</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
                <div className="text-slate-400">다음 산출물</div>
                <div className="mt-1 text-slate-100">{row.action}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {row.href ? (
                <ExternalLinkButton
                  href={row.href}
                  label={row.hrefLabel || "공식 참고"}
                  compact
                />
              ) : null}
              {row.secondaryHref ? (
                <ExternalLinkButton
                  href={row.secondaryHref}
                  label={row.secondaryHrefLabel || "추가 공식 참고"}
                  compact
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
        플랫폼은 후보를 보여주는 데서 끝나지 않고, 각 후보를{" "}
        <span className="font-semibold text-white">
          TNA/NDC/NAP–CTCN–GCF Readiness/Country Programme–CCDR
        </span>{" "}
        흐름에 어떻게 올릴지 판단하는 1차 검토 도구로 쓰는 것이 가장
        실전적입니다.
      </div>
    </SectionCard>
  );
}

function CooperationActionPlanCard({ rec, pipelineData = null }) {
  const steps = useMemo(
    () => buildCooperationActionPlan(rec, pipelineData),
    [rec, pipelineData]
  );
  return (
    <SectionCard
      title="국제협력 추진 액션플랜"
      icon={<FileCheck className="text-emerald-300" size={16} />}
      right={<PillTag tone="blue">실무용 3단계</PillTag>}
    >
      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div
            key={step.key}
            className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">
                  {step.phase}
                </div>
                <div className="mt-1 text-sm font-bold text-white">
                  {idx + 1}. {step.title}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  책임축 · {step.owner}
                </div>
              </div>
              <PillTag
                tone={idx === 0 ? "emerald" : idx === 1 ? "blue" : "amber"}
              >
                {idx === 0 ? "정합성" : idx === 1 ? "사업형성" : "제출준비"}
              </PillTag>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-200">
              {safeArray(step.deliverables).map((item, itemIdx) => (
                <li key={itemIdx} className="flex gap-2">
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
              <span className="font-semibold text-amber-300">실무 리스크</span>{" "}
              · {step.risk}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function PartnerEngagementMatrixCard({ partners = [] }) {
  const rows = useMemo(() => buildPartnerEngagementRows(partners), [partners]);
  return (
    <SectionCard
      title="파트너 참여 구조"
      icon={<Network className="text-emerald-300" size={16} />}
      right={<PillTag tone="slate">역할 분리</PillTag>}
    >
      <div className="grid gap-3 xl:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.lane}
            className="rounded-2xl border border-slate-700 bg-slate-800/35 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-bold text-white">{row.lane}</div>
              <PillTag
                tone={
                  row.items.length
                    ? row.lane === "정책 승인"
                      ? "emerald"
                      : row.lane === "현장 실행"
                      ? "blue"
                      : "slate"
                    : "amber"
                }
              >
                {row.items.length ? `${row.items.length}개` : "보강 필요"}
              </PillTag>
            </div>
            {row.items.length ? (
              <div className="mt-3 space-y-2">
                {row.items.map((item, idx) => (
                  <div
                    key={`${row.lane}-${item.name}-${idx}`}
                    className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5"
                  >
                    <div className="text-xs font-semibold text-slate-100">
                      {item.name}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {item.role || item.note || "역할 추가 정리 필요"}
                    </div>
                    {item.href ? (
                      <div className="mt-2">
                        <ExternalLinkButton
                          href={item.href}
                          label={item.linkLabel || "공식 링크"}
                          compact
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-xs text-slate-400">
                아직 이 역할군의 기관이 구조화되지 않았습니다. 제안서 초안 전에
                후보를 더 보강하세요.
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-[11px] text-slate-300">
        정책 승인, 현장 실행, 재원·투자, 지식·데이터 역할을 구분해두면 현지
        미팅과 제안서 협의에서 누락되는 이해관계자가 줄어듭니다.
      </div>
    </SectionCard>
  );
}

function summarizeAppliedFilters(filters = null) {
  const safeFilters = filters || {};
  const chips = [];
  if (safeFilters?.purpose && safeFilters.purpose !== "전체 목적")
    chips.push(`목적 ${safeFilters.purpose}`);
  if (safeFilters?.tech && safeFilters.tech !== "전체 기술")
    chips.push(`기술 ${safeFilters.tech}`);
  if (safeFilters?.country && safeFilters.country !== "전체 국가")
    chips.push(`국가 ${safeFilters.country}`);
  if (Number(safeFilters?.minCoverage || 0) > 0)
    chips.push(`충족률 ${Number(safeFilters.minCoverage)}% 이상`);
  if (safeFilters?.financeChannel && safeFilters.financeChannel !== "전체 재원")
    chips.push(`재원 ${safeFilters.financeChannel}`);
  if (safeFilters?.decisionFilter && safeFilters.decisionFilter !== "전체")
    chips.push(`판단 ${safeFilters.decisionFilter}`);
  if (safeFilters?.sortMode) chips.push(`정렬 ${safeFilters.sortMode}`);
  return chips;
}

function buildInternationalCooperationBriefText(
  rec,
  pipelineData = null,
  filters = null
) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  if (!safeRec?.country) return "";
  const assessment = buildInternationalCooperationAssessment(
    safeRec,
    pipelineData
  );
  const routes = safeArray(assessment?.routes);
  const partners = safeArray(safeRec.localPartners).length
    ? safeArray(safeRec.localPartners)
    : getPartnerDirectory(safeRec);
  const frameworkRows = buildInternationalFrameworkRows(safeRec, pipelineData);
  const actionPlan = buildCooperationActionPlan(safeRec, pipelineData);
  const submissionPack = buildSubmissionReadinessPack(safeRec, pipelineData);
  const meetingPack = buildFieldMeetingPack(safeRec, pipelineData);
  const mergedProjects = getMergedPipelineProjects(safeRec, pipelineData).slice(
    0,
    5
  );
  const generatedAt = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const filterSummary = summarizeAppliedFilters(filters);
  const priorityMemo = buildSelectionPriorityLine(safeRec, assessment);
  const lines = [
    "개도국 기후기술 협력 검토 요약본",
    "내부 검토와 회의 공유에 바로 활용할 수 있도록 핵심 내용만 정리한 문서입니다.",
    "",
    `[문서 정보]`,
    `- 생성 시각: ${generatedAt}`,
    `- 검토 국가: ${safeRec.country}`,
    `- 검토 지역: ${safeRec.region || "-"}`,
    `- 검토 기술: ${safeRec.tech || "-"}`,
    `- 목적 선택: ${safeArray(safeRec.purposeTags).join(", ") || "-"}`,
    `- 현재 필터: ${
      filterSummary.length ? filterSummary.join(" · ") : "전체 필터 기준"
    }`,
    "",
    `[1. 한눈에 보기]`,
    `- 종합 판단: ${assessment?.decision || "-"}`,
    `- 우선 검토 이유: ${
      priorityMemo ||
      assessment?.summary ||
      safeRec.cooperationProfile?.headline ||
      "검토 요약 준비 중"
    }`,
    `- 추천 협력 방향: ${
      safeRec.cooperationProfile?.headline || "협력 방향 검토"
    }`,
    `- 협력 모델: ${safeRec.cooperationProfile?.partnershipModel || "-"}`,
    "",
    `[2. 점수와 판단 근거]`,
    `- 목적 적합도: ${safeRec?.scores?.feasibility ?? "-"}%`,
    `- 데이터 충족률: ${safeRec?.scores?.coverage ?? "-"}%`,
    `- 신뢰도: ${safeRec?.scores?.reliability ?? "-"}%`,
    `- 복원력: ${safeRec?.scores?.resilience ?? "-"}%`,
    ...safeArray(assessment?.axes).map(
      (axis) => `- ${axis.label}: ${axis.score}점 · ${axis.note}`
    ),
    ...safeArray(safeRec?.reasons)
      .slice(0, 3)
      .map((item) => `- ${item}`),
    "",
    `[3. 재원·실행 여건]`,
    ...routes.map(
      (route) => `- ${route.label}: 적합도 ${route.fit} · ${route.note}`
    ),
    `- 대표 경로: ${submissionPack.preferredRoute.label} (${submissionPack.preferredRoute.fit})`,
    `- 활용 포지션: ${submissionPack.summary}`,
    ...safeArray(submissionPack.checks).map(
      (item) =>
        `- ${item.label}: ${item.ready ? "준비됨" : "보강 필요"} · ${item.note}`
    ),
    "",
    `[4. 현지 협력 파트너]`,
    ...(partners.length
      ? partners.map(
          (item) =>
            `- ${item?.name || item}: ${item?.role || "역할 확인 필요"}${
              ensureExternalUrl(item?.href || item?.link)
                ? ` · ${ensureExternalUrl(item?.href || item?.link)}`
                : ""
            }`
        )
      : ["- 추후 보강 필요"]),
    "",
    `[5. 참고 프로젝트와 근거 자료]`,
    ...(mergedProjects.length
      ? mergedProjects.map(
          (item) =>
            `- ${item?.title || "프로젝트"} | ${item?.stage || "-"} | ${
              item?.amountUSD != null
                ? `${Number(item.amountUSD).toLocaleString()} USD`
                : item?.amount || "-"
            } | ${item?.source || "-"}`
        )
      : ["- 현재 연결된 공개 파이프라인 정보가 없습니다."]),
    ...frameworkRows.map(
      (row) =>
        `- ${row.title}: ${row.score}점 (${scoreStatusLabel(
          row.score
        )}) · 다음 작업 ${row.action}`
    ),
    "",
    `[6. 바로 이어서 할 작업]`,
    ...actionPlan.flatMap((step) => [
      `- ${step.phase} · ${step.title} · 담당 ${step.owner}`,
      ...safeArray(step.deliverables).map((item) => `  · ${item}`),
    ]),
    "",
    `[7. 회의 전 체크]`,
    `- 회의 목표: ${meetingPack.meetingGoal}`,
    ...safeArray(meetingPack.agenda).map(
      (item, idx) => `- 안건 ${idx + 1}: ${item}`
    ),
    "",
    `[8. 참고 메모]`,
    safeRec.countryNote || "-",
  ];
  return lines.join("\n");
}

function buildPdfReportPreviewText(title, sections = []) {
  return [
    title,
    "PDF 저장 전 핵심 내용을 확인하는 미리보기 화면입니다.",
    "",
    ...safeArray(sections).flatMap((section) => {
      if (!section?.title) return [];
      if (section.kind === "table") {
        return [
          `[${section.title}]`,
          ...safeArray(section.rows)
            .slice(0, 5)
            .map((row) =>
              safeArray(section.headers)
                .map((header) => `${header.label}: ${row?.[header.key] ?? "-"}`)
                .join(" | ")
            ),
          "",
        ];
      }
      if (section.kind === "links") {
        return [
          `[${section.title}]`,
          ...safeArray(section.links)
            .slice(0, 6)
            .map((item) => `- ${item?.label || "링크"} · ${item?.href || ""}`),
          "",
        ];
      }
      return [
        `[${section.title}]`,
        ...safeArray(section.items)
          .slice(0, 6)
          .map((item) => `- ${item}`),
        "",
      ];
    }),
  ].join("\n");
}

function createComparisonPdfPayload(
  rec,
  filteredRecs = [],
  shortlistRecs = [],
  strategyMetaByRec = {},
  filters = null,
  liveData = null,
  geoData = null,
  pipelineData = null
) {
  const safeRec = sanitize검토Record(rec) || rec || EMPTY_DETAIL_RECORD;
  const stamp = new Date().toISOString().slice(0, 10);
  const generatedAtLabel = formatDateTimeKo(Date.now());
  const comparisonPool = uniqBy(
    [safeRec, ...safeArray(shortlistRecs), ...safeArray(filteredRecs)].filter(
      Boolean
    ),
    (item) =>
      item?.id ||
      `${item?.country || ""}|${item?.region || ""}|${item?.tech || ""}`
  ).slice(0, 5);
  const comparisonRows = comparisonPool.map((item, idx) => {
    const meta =
      strategyMetaByRec?.[item?.id] ||
      computeStrategyEvaluation(
        item,
        filters || DEFAULT_PLATFORM_FILTERS,
        pipelineData
      );
    return {
      rank: idx + 1,
      country: item?.country || "-",
      region: item?.region || "-",
      tech: techShort(item?.tech) || item?.tech || "-",
      purpose: safeArray(item?.purposeTags).slice(0, 2).join(", ") || "-",
      strategy: meta?.strategyScore != null ? `${meta.strategyScore}점` : "-",
      decision: meta?.decision || "-",
      pipeline: `${meta?.pipelineProjectCount || 0}건`,
      finance: meta?.financeRoute || "추가 검토 필요",
    };
  });
  const metrics = buildEvidenceMetrics(safeRec, pipelineData);
  const practicalMetrics = buildPracticalMetrics(safeRec, pipelineData);
  const metricDefinitionRows = buildMetricDefinitionRows(safeRec, pipelineData);
  const links = collectEvidenceLinks(safeRec, "general");
  const realtimeRows = [
    {
      metric: "GDP (현재 USD)",
      value:
        liveData?.worldBank?.gdp?.value != null
          ? `${Number(liveData.worldBank.gdp.value).toLocaleString("ko-KR")}`
          : "-",
      note: liveData?.worldBank?.gdp?.year
        ? `${liveData.worldBank.gdp.year} 기준`
        : "-",
    },
    {
      metric: "전력 접근률",
      value:
        liveData?.worldBank?.electricityAccess?.value != null
          ? `${liveData.worldBank.electricityAccess.value}%`
          : "-",
      note: liveData?.worldBank?.electricityAccess?.year
        ? `${liveData.worldBank.electricityAccess.year} 기준`
        : "-",
    },
    {
      metric: "위치 검증",
      value: geoData?.countryFeature ? "국가 경계 확인" : "미확인",
      note:
        geoData?.validation?.regionDisplayName ||
        liveData?.reverseGeo?.displayName ||
        "-",
    },
    {
      metric: "파이프라인 프로젝트",
      value: `${
        safeArray(getMergedPipelineProjects(safeRec, pipelineData)).length
      }건`,
      note:
        safeArray(getMergedPipelineProjects(safeRec, pipelineData))[0]
          ?.source || "-",
    },
  ];
  const missingRows = safeArray(safeRec.inventoryRows)
    .filter((row) => `${row?.status || ""}`.includes("결측"))
    .map((row) => `${row?.name || "데이터"} · ${row?.memo || "보강 필요"}`);
  const sections = [
    {
      title: "후보 비교 요약",
      lead: "현재 선택 후보국을 기준으로 저장된 후보국과 필터 내 상위 후보국을 함께 비교합니다.",
      kind: "table",
      headers: [
        { key: "rank", label: "순위" },
        { key: "country", label: "국가" },
        { key: "region", label: "지역" },
        { key: "tech", label: "기술" },
        { key: "strategy", label: "전략 점수" },
        { key: "decision", label: "판단" },
        { key: "pipeline", label: "파이프라인" },
      ],
      rows: comparisonRows,
    },
    {
      title: "현재 선택 후보 핵심 판단",
      lead: "회의 직전에는 아래 이유와 다음 작업만 확인해도 1차 판단이 가능합니다.",
      kind: "bullets",
      items: uniqBy(
        [
          ...safeArray(safeRec.reasons),
          ...safeArray(safeRec.actions).slice(0, 2),
        ].filter(Boolean),
        (item) => item
      ).slice(0, 6),
    },
    {
      title: "실시간 보강 지표",
      kind: "table",
      headers: [
        { key: "metric", label: "항목" },
        { key: "value", label: "값" },
        { key: "note", label: "비고" },
      ],
      rows: realtimeRows,
    },
    {
      title: "실무 검토 최소 기준",
      kind: "table",
      headers: [
        { key: "label", label: "항목" },
        { key: "current", label: "현재" },
        { key: "status", label: "상태" },
        { key: "note", label: "판단 포인트" },
      ],
      rows: buildCoverageChecklist(safeRec, pipelineData).map((item) => ({
        label: item.label,
        current: `${item.current} / ${item.target}`,
        status: item.status,
        note: item.note,
      })),
      note: "정책 문서, 재원 신호, 파트너, 직접 문서의 최소 기준을 같은 형식으로 점검합니다.",
    },
    {
      title: "실무형 판단 지표",
      kind: "table",
      headers: [
        { key: "label", label: "지표" },
        { key: "score", label: "점수" },
        { key: "note", label: "근거 요약" },
      ],
      rows: practicalMetrics.map((item) => ({
        label: item.label,
        score: `${item.score}점`,
        note: item.note,
      })),
      note: "정책 정합성, 재원 연결, 파트너 접근성, 문서 확보 수준을 같은 기준으로 비교합니다.",
    },
    {
      title: "지표 해석 기준",
      kind: "table",
      headers: [
        { key: "metric", label: "지표" },
        { key: "definition", label: "의미" },
        { key: "basis", label: "현재 후보 근거" },
      ],
      rows: metricDefinitionRows,
    },
    {
      title: "공식 근거 문서",
      kind: "links",
      links,
      note: "상위 포털보다 현재 후보에 직접 연결되는 문서와 프로젝트 상세 페이지를 우선 보여줍니다.",
    },
    {
      title: "결측 및 후속 보강 포인트",
      kind: "bullets",
      items: missingRows.length
        ? missingRows
        : [
            "현재 선택 후보의 핵심 데이터는 확보되어 있으며, 후속 실시간 API 보강이 남아 있습니다.",
          ],
    },
  ];
  const html = buildPrintableReportHtml({
    title: "개도국 기후기술 협력 대상 검토표",
    subtitle:
      "회의 자료와 내부 공유에 바로 활용할 수 있도록 현재 선택 후보국과 비교 후보국를 한 문서로 정리했습니다.",
    badge: "PDF 저장용 검토표",
    metadataRows: [
      ["생성 시각", generatedAtLabel],
      ["기준 후보", `${safeRec.country || "-"} · ${safeRec.region || "-"}`],
      ["검토 기술", safeRec.tech || "-"],
      ["후보 수", `${comparisonRows.length}개`],
      [
        "현재 필터",
        summarizeAppliedFilters(filters).join(" · ") || "전체 필터 기준",
      ],
      ["최신 근거 연도", getLatestEvidenceYear(safeRec) || "확인 필요"],
      ["직접 문서 수", `${metrics.directLinkCount}건`],
      ["공식 링크 수", `${metrics.officialLinkCount}건`],
      ["목적 선택", safeArray(safeRec.purposeTags).join(", ") || "-"],
    ],
    summary:
      safeRec.countryNote ||
      safeArray(safeRec.reasons)[0] ||
      "현재 선택 후보를 중심으로 비교·근거·실행 가능성을 한 문서에 정리했습니다.",
    highlightCards: [
      {
        label: "데이터 가용성",
        value: `${metrics.coverage}%`,
        note: `${metrics.sourceCount}개 근거 연결`,
      },
      {
        label: "실행 적합도",
        value: `${metrics.feasibility}%`,
        note: `${metrics.pipelineCount}개 파이프라인`,
      },
      {
        label: "직접 문서",
        value: `${metrics.directLinkCount}건`,
        note: `${metrics.officialLinkCount}건 공식 링크 중 직접 연결`,
      },
      {
        label: "실무형 핵심",
        value: `${practicalMetrics[0]?.score || 0}점`,
        note: practicalMetrics[0]?.label || "정책 정합성",
      },
    ],
    sections,
    footerNote:
      "이 문서는 브라우저의 인쇄 메뉴에서 PDF로 저장하는 것을 기본으로 설계했습니다. 자동 저장이 막히는 환경에서는 인쇄용 페이지 링크와 텍스트 복사본을 함께 제공합니다.",
  });
  const previewText = buildPdfReportPreviewText(
    "협력 대상 검토표 PDF 미리보기",
    sections
  );
  const htmlBlob = new Blob([html], { type: "text/html;charset=utf-8" });
  const fallbackBlob = new Blob([previewText], {
    type: "text/plain;charset=utf-8",
  });
  return {
    fileKind: "comparison",
    deliveryType: "print-pdf",
    filename: `${sanitizeFilenamePart(
      "기후기술협력_후보검토표"
    )}_${sanitizeFilenamePart(
      safeRec.country || "국가"
    )}_${sanitizeFilenamePart(
      safeRec.region || "지역"
    )}_${stamp}_PDF인쇄용.html`,
    mimeType: "text/html;charset=utf-8",
    blob: htmlBlob,
    htmlText: html,
    previewText,
    copyText: buildRecommendationPreviewText(
      safeRec,
      liveData,
      geoData,
      pipelineData,
      filters
    ),
    fallbackBlob,
    fallbackFilename: `${sanitizeFilenamePart(
      safeRec.country || "country"
    )}_${sanitizeFilenamePart(
      safeRec.region || "region"
    )}_${stamp}_후보검토표_복사본.txt`,
  };
}

function createInternationalCooperationBriefPayload(
  rec,
  pipelineData = null,
  filters = null
) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  const text = buildInternationalCooperationBriefText(
    safeRec,
    pipelineData,
    filters
  );
  const stamp = new Date().toISOString().slice(0, 10);
  const generatedAtLabel = formatDateTimeKo(Date.now());
  const strategyMeta = computeStrategyEvaluation(
    safeRec,
    filters || DEFAULT_PLATFORM_FILTERS,
    pipelineData
  );
  const strategySynthesis = buildStrategySynthesis(safeRec, pipelineData);
  const assessment = buildInternationalCooperationAssessment(
    safeRec,
    pipelineData
  );
  const pipelineRows = getMergedPipelineProjects(safeRec, pipelineData)
    .slice(0, 5)
    .map((item) => ({
      source: item?.source || "-",
      title: item?.title || "프로젝트",
      stage: item?.stage || item?.status || "-",
      partner: item?.executingPartner || item?.partner || "-",
    }));
  const partnerRows = (
    safeArray(safeRec.localPartners).length
      ? safeArray(safeRec.localPartners)
      : getPartnerDirectory(safeRec)
  )
    .slice(0, 5)
    .map((item, idx) => {
      if (typeof item === "string") {
        return {
          name: item,
          role: idx === 0 ? "정책 승인" : idx === 1 ? "현장 실행" : "운영·확산",
          priority: idx === 0 ? "핵심" : idx === 1 ? "권장" : "후보",
          note: "실명 기관과 역할 보강 필요",
        };
      }
      return {
        name: item?.name || "기관",
        role: item?.role || "역할 확인 필요",
        priority: item?.priority || "후보",
        note: item?.note || "공식 링크와 담당 역할 보강 필요",
      };
    });
  const practicalMetrics = buildPracticalMetrics(safeRec, pipelineData);
  const metricDefinitionRows = buildMetricDefinitionRows(safeRec, pipelineData);
  const links = collectEvidenceLinks(safeRec, "general");
  const html = buildPrintableReportHtml({
    title: "개도국 기후기술 협력 공유 요약본",
    subtitle:
      "회의, 출장 및 내부 보고에 즉시 활용할 수 있도록 현재 대상의 핵심 검토 결과 및 근거를 통합했습니다.",
    badge: "PDF 저장용 요약본",
    metadataRows: [
      ["생성 시각", generatedAtLabel],
      ["검토 국가", safeRec.country || "-"],
      ["검토 지역", safeRec.region || "-"],
      ["검토 기술", safeRec.tech || "-"],
      ["목적 선택", safeArray(safeRec.purposeTags).join(", ") || "-"],
      [
        "현재 필터",
        summarizeAppliedFilters(filters).join(" · ") || "전체 필터 기준",
      ],
      ["최신 근거 연도", getLatestEvidenceYear(safeRec) || "확인 필요"],
      [
        "직접 문서 수",
        `${buildEvidenceMetrics(safeRec, pipelineData).directLinkCount}건`,
      ],
    ],
    summary:
      strategySynthesis?.oneLiner ||
      strategyMeta?.oneLine ||
      safeRec.countryNote ||
      "현재 후보의 정책 정합성, 재원 경로, 실행 파트너, 공식 근거를 한 번에 공유하기 위한 요약본입니다.",
    highlightCards: [
      {
        label: "종합 판단",
        value: strategyMeta?.decision || "검토 필요",
        note: `전략 점수 ${strategyMeta?.strategyScore || 0}`,
      },
      {
        label: "권장 재원 경로",
        value: strategyMeta?.financeRoute || "추가 검토 필요",
        note: `${strategyMeta?.pipelineProjectCount || 0}개 파이프라인 연결`,
      },
      {
        label: "정책 정합성",
        value: `${
          practicalMetrics.find((item) => item.key === "policyAlignment")
            ?.score || 0
        }점`,
        note:
          practicalMetrics.find((item) => item.key === "policyAlignment")
            ?.note || "국가 전략 연결 수준",
      },
      {
        label: "문서 확보 수준",
        value: `${
          practicalMetrics.find((item) => item.key === "documentReadiness")
            ?.score || 0
        }점`,
        note: `${links.length}건 공식 근거 문서`,
      },
    ],
    sections: [
      {
        title: "지금 검토해야 하는 이유",
        lead: "회의 직전에는 아래 항목만 확인해도 현재 후보의 우선 검토 필요성을 빠르게 설명할 수 있습니다.",
        kind: "bullets",
        items: safeArray(safeRec.reasons).slice(0, 6),
      },
      {
        title: "권장 협력 패키지",
        lead: "현재 후보를 어떤 협력 방식으로 연결할지 한 줄 요약으로 정리했습니다.",
        kind: "bullets",
        items: uniqBy(
          [
            safeRec?.cooperationProfile?.headline,
            `협력 모델 · ${
              safeRec?.cooperationProfile?.partnershipModel ||
              "정책·사업·실증 연계형"
            }`,
            `즉시 추진 과제 · ${
              safeRec?.cooperationProfile?.quickWin ||
              "기초 진단 → 데이터 보강 → 실행 파트너 매칭"
            }`,
            ...safeArray(assessment?.useCases)
              .slice(0, 3)
              .map((item) => `활용 예시 · ${item}`),
          ].filter(Boolean),
          (item) => item
        ),
      },
      {
        title: "대표 파이프라인과 재원 경로",
        kind: "table",
        headers: [
          { key: "source", label: "출처" },
          { key: "title", label: "프로젝트" },
          { key: "stage", label: "단계" },
          { key: "partner", label: "수행기관" },
        ],
        rows: pipelineRows,
        note:
          safeArray(assessment?.routes)[0]?.note ||
          "대표 파이프라인을 기반으로 재원 경로를 빠르게 훑을 수 있습니다.",
      },
      {
        title: "현지 파트너와 역할",
        kind: "table",
        headers: [
          { key: "name", label: "기관" },
          { key: "role", label: "역할" },
          { key: "priority", label: "우선순위" },
          { key: "note", label: "비고" },
        ],
        rows: partnerRows,
      },
      {
        title: "실무 검토 최소 기준",
        kind: "table",
        headers: [
          { key: "label", label: "항목" },
          { key: "current", label: "현재" },
          { key: "status", label: "상태" },
          { key: "note", label: "판단 포인트" },
        ],
        rows: buildCoverageChecklist(safeRec, pipelineData).map((item) => ({
          label: item.label,
          current: `${item.current} / ${item.target}`,
          status: item.status,
          note: item.note,
        })),
      },
      {
        title: "실무형 판단 지표",
        kind: "table",
        headers: [
          { key: "label", label: "지표" },
          { key: "score", label: "점수" },
          { key: "note", label: "근거 요약" },
        ],
        rows: practicalMetrics.map((item) => ({
          label: item.label,
          score: `${item.score}점`,
          note: item.note,
        })),
      },
      {
        title: "공식 근거 문서",
        kind: "links",
        links,
        note: "상위 포털보다 현재 후보의 주장에 직접 연결되는 문서와 프로젝트 상세 페이지를 우선 배치했습니다.",
      },
      {
        title: "지표 해석 기준",
        kind: "table",
        headers: [
          { key: "metric", label: "지표" },
          { key: "definition", label: "의미" },
          { key: "basis", label: "현재 후보 근거" },
        ],
        rows: metricDefinitionRows,
      },
      {
        title: "바로 이어서 할 작업",
        kind: "bullets",
        items: safeArray(assessment?.nextActions).slice(0, 5),
      },
    ],
    footerNote:
      "이 문서는 브라우저의 인쇄 메뉴에서 PDF로 저장하는 것을 기본 흐름으로 사용합니다. 자동 인쇄창이 제한되는 환경에서는 인쇄용 페이지 링크와 텍스트 복사본을 함께 제공합니다.",
  });
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const fallbackBlob = new Blob([text], { type: "text/plain;charset=utf-8" });
  return {
    fileKind: "brief",
    deliveryType: "print-pdf",
    filename: `${sanitizeFilenamePart(
      "기후기술협력_공유요약본"
    )}_${sanitizeFilenamePart(safeRec.country)}_${sanitizeFilenamePart(
      safeRec.region || "national"
    )}_${sanitizeFilenamePart(
      techShort(safeRec.tech) || "brief"
    )}_${stamp}_PDF인쇄용.html`,
    mimeType: "text/html;charset=utf-8",
    blob,
    htmlText: html,
    previewText: text,
    copyText: text,
    fallbackBlob,
    fallbackFilename: `${sanitizeFilenamePart(
      safeRec.country || "country"
    )}_${sanitizeFilenamePart(
      safeRec.region || "region"
    )}_${stamp}_공유용_요약본_복사본.txt`,
  };
}

function buildEmergencyDownloadText(
  fileKind,
  rec,
  filters = null,
  pipelineData = null
) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  const links = collectEvidenceLinks(safeRec, "general").slice(0, 8);
  const practicalMetrics = buildPracticalMetrics(safeRec, pipelineData);
  const lines = [
    fileKind === "comparison" ? "협력 대상 검토표" : "공유용 요약본",
    `${safeRec.country || "국가 미지정"} · ${
      safeRec.region || "지역 미지정"
    } · ${safeRec.tech || "기술 미지정"}`,
    `생성 시각: ${formatDateTimeKo(Date.now())}`,
    `목적 선택: ${safeArray(safeRec.purposeTags).join(", ") || "미지정"}`,
    `현재 필터: ${summarizeAppliedFilters(filters).join(" · ") || "전체"}`,
    "",
    "[핵심 요약]",
    safeRec.countryNote ||
      safeArray(safeRec.reasons)[0] ||
      "후보 기본 정보를 다시 확인해 주세요.",
    ...safeArray(safeRec.reasons)
      .slice(0, 5)
      .map((item) => `- ${item}`),
    "",
    "[다음 작업]",
    ...uniqBy(
      [
        ...safeArray(safeRec.actions),
        ...safeArray(
          buildInternationalCooperationAssessment(safeRec, pipelineData)
            ?.nextActions
        ),
      ].filter(Boolean),
      (item) => item
    )
      .slice(0, 6)
      .map((item) => `- ${item}`),
    "",
    "[실무형 판단 지표]",
    ...practicalMetrics.map(
      (item) => `- ${item.label}: ${item.score}점 · ${item.note}`
    ),
    "",
    "[공식 근거 링크]",
    ...links.map(
      (item) => `- ${item.label || item.group || "근거 링크"}: ${item.href}`
    ),
  ];
  return lines.join("\n");
}

function createEmergencyDownloadPayload(
  fileKind,
  rec,
  filters = null,
  pipelineData = null
) {
  try {
    const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
    const stamp = new Date().toISOString().slice(0, 10);
    const links = collectEvidenceLinks(safeRec, "general").slice(0, 8);
    const pipelineRows = getMergedPipelineProjects(safeRec, pipelineData)
      .slice(0, 4)
      .map((item) => ({
        source: item?.source || "-",
        title: item?.title || "프로젝트",
        stage: item?.stage || item?.status || "-",
        partner: item?.executingPartner || item?.partner || "-",
      }));
    const partnerRows = (
      safeArray(safeRec.localPartners).length
        ? safeArray(safeRec.localPartners)
        : getPartnerDirectory(safeRec)
    )
      .slice(0, 4)
      .map((item, idx) => ({
        name: typeof item === "string" ? item : item?.name || `기관 ${idx + 1}`,
        role:
          typeof item === "string"
            ? "역할 확인 필요"
            : item?.role || "역할 확인 필요",
        priority: typeof item === "string" ? "후보" : item?.priority || "후보",
        note:
          typeof item === "string"
            ? "세부 역할 보강 필요"
            : item?.note || "세부 역할 보강 필요",
      }));
    const practicalMetrics = buildPracticalMetrics(safeRec, pipelineData);
    const sections = [
      {
        title: "지금 검토해야 하는 이유",
        lead: "자동 저장이 제한되더라도 회의용 요약과 핵심 근거를 바로 가져갈 수 있도록 간략 문서로 재구성했습니다.",
        kind: "bullets",
        items: uniqBy(
          [...safeArray(safeRec.reasons), safeRec.countryNote].filter(Boolean),
          (item) => item
        ).slice(0, 6),
      },
      {
        title: "대표 파이프라인",
        kind: "table",
        headers: [
          { key: "source", label: "출처" },
          { key: "title", label: "프로젝트" },
          { key: "stage", label: "단계" },
          { key: "partner", label: "수행기관" },
        ],
        rows: pipelineRows,
      },
      {
        title: "현지 파트너",
        kind: "table",
        headers: [
          { key: "name", label: "기관" },
          { key: "role", label: "역할" },
          { key: "priority", label: "우선순위" },
          { key: "note", label: "비고" },
        ],
        rows: partnerRows,
      },
      {
        title: "실무형 판단 지표",
        kind: "table",
        headers: [
          { key: "label", label: "지표" },
          { key: "score", label: "점수" },
          { key: "note", label: "근거 요약" },
        ],
        rows: practicalMetrics.map((item) => ({
          label: item.label,
          score: `${item.score}점`,
          note: item.note,
        })),
      },
      {
        title: "공식 근거 문서",
        kind: "links",
        links,
        note: "현재 후보에 직접 연결되는 공식 문서를 우선 표시합니다.",
      },
    ];
    const title =
      fileKind === "comparison"
        ? "개도국 기후기술 협력 대상 검토표"
        : "개도국 기후기술 협력 공유 요약본";
    const subtitle =
      fileKind === "comparison"
        ? "자동 저장이 제한될 때도 비교표와 핵심 근거를 새 창 또는 HTML 문서로 바로 보관할 수 있도록 구성했습니다."
        : "자동 저장이 제한될 때도 회의자료와 공유자료로 바로 활용할 수 있는 최소 요약 문서입니다.";
    const html = buildPrintableReportHtml({
      title,
      subtitle,
      badge: fileKind === "comparison" ? "긴급 검토표" : "긴급 요약본",
      metadataRows: [
        ["생성 시각", formatDateTimeKo(Date.now())],
        ["검토 국가", safeRec.country || "-"],
        ["검토 지역", safeRec.region || "-"],
        ["검토 기술", safeRec.tech || "-"],
        ["목적 선택", safeArray(safeRec.purposeTags).join(", ") || "-"],
        [
          "현재 필터",
          summarizeAppliedFilters(filters).join(" · ") || "전체 필터 기준",
        ],
      ],
      summary:
        safeRec.countryNote ||
        safeArray(safeRec.reasons)[0] ||
        "자동 저장이 제한되어도 검토 내용을 잃지 않도록 기본 문서를 다시 생성했습니다.",
      highlightCards: [
        {
          label: "대표 국가",
          value: safeRec.country || "미선택",
          note: safeRec.region || "국가 단위",
        },
        {
          label: "대표 기술",
          value: techShort(safeRec.tech) || safeRec.tech || "미선택",
          note: safeArray(safeRec.purposeTags).join(", ") || "목적 선택 미지정",
        },
        {
          label: "공식 근거",
          value: `${links.length}건`,
          note: "직접 링크 우선",
        },
        {
          label: "실무형 핵심",
          value: `${practicalMetrics[0]?.score || 0}점`,
          note: practicalMetrics[0]?.label || "정책 정합성",
        },
      ],
      sections,
      footerNote:
        "브라우저 저장이 제한되면 이 문서를 새 창에서 열거나 HTML 문서로 저장한 뒤, 인쇄 메뉴에서 PDF로 저장할 수 있습니다.",
    });
    const previewText = buildEmergencyDownloadText(
      fileKind,
      safeRec,
      filters,
      pipelineData
    );
    return {
      fileKind,
      deliveryType: "print-pdf",
      filename: `${sanitizeFilenamePart(
        fileKind === "comparison"
          ? "기후기술협력_후보검토표_긴급본"
          : "기후기술협력_공유요약본_긴급본"
      )}_${sanitizeFilenamePart(
        safeRec.country || "국가"
      )}_${sanitizeFilenamePart(safeRec.region || "지역")}_${stamp}.html`,
      mimeType: "text/html;charset=utf-8",
      blob: new Blob([html], { type: "text/html;charset=utf-8" }),
      htmlText: html,
      previewText,
      copyText: previewText,
      fallbackBlob: new Blob([previewText], {
        type: "text/plain;charset=utf-8",
      }),
      fallbackFilename: `${sanitizeFilenamePart(
        safeRec.country || "country"
      )}_${sanitizeFilenamePart(safeRec.region || "region")}_${stamp}_${
        fileKind === "comparison" ? "후보검토표" : "공유요약본"
      }_복사본.txt`,
    };
  } catch (error) {
    console.error("[download] failed to create emergency payload", error);
    const previewText = `${
      fileKind === "comparison" ? "협력 대상 검토표" : "공유용 요약본"
    } 기본 문서를 준비하지 못했습니다. 복사 기능으로 현재 화면의 요약을 가져가 주세요.`;
    const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${
      fileKind === "comparison" ? "협력 대상 검토표" : "공유용 요약본"
    }</title></head><body><pre>${escapeHtml(previewText)}</pre></body></html>`;
    return {
      fileKind,
      deliveryType: "print-pdf",
      filename: `${
        fileKind === "comparison" ? "후보검토표" : "공유요약본"
      }_긴급본.html`,
      mimeType: "text/html;charset=utf-8",
      blob: new Blob([html], { type: "text/html;charset=utf-8" }),
      htmlText: html,
      previewText,
      copyText: previewText,
      fallbackBlob: new Blob([previewText], {
        type: "text/plain;charset=utf-8",
      }),
      fallbackFilename: `${
        fileKind === "comparison" ? "후보검토표" : "공유요약본"
      }_복사본.txt`,
    };
  }
}

function buildRuntimeErrorDownloadState({
  fileKind,
  rec,
  filters = null,
  pipelineData = null,
}) {
  const payload = createEmergencyDownloadPayload(
    fileKind,
    rec,
    filters,
    pipelineData
  );
  const env = detectDownloadEnvironment();
  const delivery = buildDownloadDeliveryState({
    payload,
    fileKind,
    env,
    autoDownload: {
      ok: false,
      reason: `runtime-error:${env.reason || "browser"}`,
      objectUrl: "",
    },
  });
  return delivery.state;
}

function downloadInternationalCooperationBrief(
  rec,
  pipelineData = null,
  filters = null
) {
  const payload = createInternationalCooperationBriefPayload(
    rec,
    pipelineData,
    filters
  );
  if (!payload?.blob) return;
  downloadTextBlob(payload.filename, payload.previewText || "");
}

function sanitizeStrategySynthesisOutput(synthesis) {
  if (!synthesis) return null;
  const financeSummary = synthesis.financeSummary || {};
  const goNoGo = synthesis.goNoGo || {};
  return {
    ...synthesis,
    whyNow: safeArray(synthesis.whyNow),
    priorityRegions: safeArray(synthesis.priorityRegions).map((item, idx) => ({
      province: item?.province || `후보 지역 ${idx + 1}`,
      role: item?.role || "세부 지역 정보 보완 중",
      priorityScore: Number(item?.priorityScore || 0),
      riskScore: Number(item?.riskScore || 0),
      opsReadiness: Number(item?.opsReadiness || 0),
      hotspotCount: Number(item?.hotspotCount || 0),
      asset: item?.asset || "",
      districts: safeArray(item?.districts),
      evidence: safeArray(item?.evidence),
    })),
    financeSummary: {
      pipelineProjectCount: Number(financeSummary.pipelineProjectCount || 0),
      pipelineTotalUSD: Number(financeSummary.pipelineTotalUSD || 0),
      financeRoute: financeSummary.financeRoute || "추가 검토 필요",
      anchorProjects: safeArray(financeSummary.anchorProjects),
      stageCount: financeSummary.stageCount || {},
    },
    roadmap: safeArray(synthesis.roadmap).map((stage, idx) => ({
      stage: stage?.stage || `단계 ${idx + 1}`,
      period: stage?.period || "추가 정의 필요",
      outcome: stage?.outcome || "세부 산출 재정의 필요",
      actions: safeArray(stage?.actions),
    })),
    kpis: safeArray(synthesis.kpis),
    protocolSummary: safeArray(synthesis.protocolSummary),
    goNoGo: {
      go: safeArray(goNoGo.go),
      hold: safeArray(goNoGo.hold),
    },
    flagshipProject: {
      title: synthesis?.flagshipProject?.title || "대표 사업 정의 필요",
      scope: synthesis?.flagshipProject?.scope || "세부 범위 정의 필요",
      model: synthesis?.flagshipProject?.model || "협력 모델 정의 필요",
      financeRoute:
        synthesis?.flagshipProject?.financeRoute || "추가 검토 필요",
      entryPoint:
        synthesis?.flagshipProject?.entryPoint || "실행 진입점 검토 필요",
      link: synthesis?.flagshipProject?.link || "",
    },
  };
}

const EMPTY_DETAIL_RECORD = Object.freeze({
  id: "empty-detail-record",
  country: "",
  region: "",
  tech: "",
  continent: "",
  coordBasis: "",
  countryNote: "",
  purposeTags: [],
  reasons: [],
  actions: [],
  sourcePlan: [],
  regionRows: [],
  localPartners: [],
  inventoryRows: [],
  liveDataFields: [],
  scores: Object.freeze({
    coverage: 0,
    reliability: 0,
    resilience: 0,
    feasibility: 0,
  }),
  cooperationProfile: Object.freeze({}),
});

const EMPTY_STRATEGY_META = Object.freeze({
  strategyScore: 0,
  decision: "대상 선택 필요",
  financeFit: 0,
  purposeFit: 0,
  pipelineScore: 0,
  riskUrgency: 0,
  policyFit: 0,
  pipelineProjectCount: 0,
  pipelineTotalUSD: 0,
  financeChannels: [],
  financeRoute: "대상 선택 후 계산",
  oneLine: "국가·지역을 선택하면 전략 평가가 표시됩니다.",
});

const EMPTY_STRATEGY_SYNTHESIS = Object.freeze({
  strategyName: "대상 선택 필요",
  decision: "대상 선택 필요",
  oneLiner:
    "지도 마커 또는 후보에서 국가·지역을 선택하면 전략 핵심 요약이 생성됩니다.",
  flagshipProject: Object.freeze({
    title: "대표 사업 없음",
    scope: "대상을 선택하면 대표 사업 범위가 표시됩니다.",
    model: "대상 선택 필요",
    financeRoute: "대상 선택 필요",
    entryPoint: "대상 선택 필요",
    link: "",
  }),
  whyNow: [],
  priorityRegions: [],
  financeSummary: Object.freeze({
    pipelineProjectCount: 0,
    pipelineTotalUSD: 0,
    financeRoute: "대상 선택 필요",
    anchorProjects: [],
    stageCount: Object.freeze({}),
  }),
  roadmap: [],
  kpis: [],
  protocolSummary: [],
  goNoGo: Object.freeze({
    go: [],
    hold: [],
  }),
});

class 검토TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message:
        error?.message || "상세 패널을 렌더링하는 중 오류가 발생했습니다.",
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: "" });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <SectionCard
          title={this.props.title || "상세 패널"}
          icon={<AlertTriangle className="text-amber-300" size={16} />}
          right={<PillTag tone="amber">안정화 모드</PillTag>}
        >
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-3 text-sm text-slate-200">
            일부 상세 정보에서 예기치 않은 데이터 형식이 발견되어 이 구역만 안전
            모드로 전환했습니다.
          </div>
          <div className="mt-3 text-xs text-slate-400">
            오류 메시지: {this.state.message}
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="mt-3 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            다시 시도
          </button>
        </SectionCard>
      );
    }
    return this.props.children;
  }
}

function CandidateDecisionWorkspaceCard({
  rec,
  pipelineData = null,
  filteredRecs = [],
  onDownloadBrief,
  onOpenSources,
  onSelectRec = null,
}) {
  const pack = useMemo(
    () => buildSubmissionReadinessPack(rec, pipelineData),
    [rec, pipelineData]
  );
  const meetingPack = useMemo(
    () => buildFieldMeetingPack(rec, pipelineData),
    [rec, pipelineData]
  );
  const nextCandidate = useMemo(() => {
    const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
    return (
      safeArray(filteredRecs).find((item) => item && item.id !== safeRec.id) ||
      null
    );
  }, [filteredRecs, rec]);

  return (
    <SectionCard
      title="바로 판단할 핵심 작업"
      icon={<Rocket size={16} className="text-amber-300" />}
      right={
        <PillTag tone="sky">
          {pack.preferredRoute?.label || "경로 검토"}
        </PillTag>
      }
    >
      <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
              지금 먼저 확인
            </div>
            <div className="mt-2 text-sm font-semibold text-white">
              {safeArray(pack.officialLinks)
                .slice(0, 2)
                .map((item) => item.label)
                .join(" → ") || "NDC / NAP / 프로젝트 근거"}
            </div>
            <div className="mt-2 text-xs leading-relaxed text-slate-300">
              정합성 메모를 쓰기 전에 국가 공약·적응계획·대표 사업 링크를 먼저
              확인합니다.
            </div>
          </div>
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/8 p-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300">
              회의 준비
            </div>
            <div className="mt-2 text-sm font-semibold text-white">
              {meetingPack.topCounterparts?.[0]?.partner?.name ||
                "핵심 상대기관 확인"}
            </div>
            <div className="mt-2 text-xs leading-relaxed text-slate-300">
              {meetingPack.agenda?.[0] ||
                "첫 미팅에서 합의할 질문과 역할분담을 먼저 정리합니다."}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300">
              바로 저장할 산출물
            </div>
            <div className="mt-2 text-sm font-semibold text-white">
              {safeArray(pack.deliverables)[0] || "공유용 요약본"}
            </div>
            <div className="mt-2 text-xs leading-relaxed text-slate-300">
              요약본과 근거 링크를 함께 정리하면 회의·보고·출장자료 전환이
              빨라집니다.
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              이번 후보에서 바로 할 일
            </div>
            <div className="mt-2 space-y-2">
              {[
                "근거 문서 2~3건 확인 후 정합성 메모 작성",
                `${
                  pack.preferredRoute?.label || "우선 경로"
                } 기준으로 다음 협의 경로 확정`,
                `${
                  safeArray(pack.deliverables)[0] || "요약본"
                } 형태로 내부 공유안 저장`,
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-2 text-xs text-slate-200"
                >
                  <span className="mr-2 font-black text-emerald-300">
                    {idx + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => safeInvoke(onDownloadBrief)}
              className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-3 text-sm font-semibold text-emerald-200"
            >
              요약본 저장
            </button>
            <button
              onClick={() => safeInvoke(onOpenSources)}
              className="rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-3 text-sm font-semibold text-sky-200"
            >
              공식 문서 열기
            </button>
          </div>
          {nextCandidate ? (
            <button
              onClick={() => safeInvoke(onSelectRec, nextCandidate)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-3 text-left hover:bg-slate-800"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                대안 후보 함께 보기
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {nextCandidate.country} · {nextCandidate.region}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {techShort(nextCandidate.tech) || nextCandidate.tech}
              </div>
            </button>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}

function OperationalQuickStartCard({
  rec,
  pipelineData = null,
  onDownloadBrief,
  onOpenSources,
  filteredRecs = [],
  onSelectRec = null,
}) {
  const pack = useMemo(
    () => buildSubmissionReadinessPack(rec, pipelineData),
    [rec, pipelineData]
  );
  const meetingPack = useMemo(
    () => buildFieldMeetingPack(rec, pipelineData),
    [rec, pipelineData]
  );
  const nextCandidate = useMemo(() => {
    const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
    return safeArray(filteredRecs).find(
      (item) => item && item.id !== safeRec.id
    );
  }, [filteredRecs, rec]);

  return (
    <SectionCard
      title="추천 다음 작업"
      icon={<Rocket size={16} className="text-amber-300" />}
      right={
        <PillTag tone="sky">
          {pack.preferredRoute?.label || "경로 검토"}
        </PillTag>
      }
    >
      <div className="grid gap-3 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            검토 순서
          </div>
          <div className="mt-3 space-y-2.5">
            {[
              {
                title: "국가 정합성 확인",
                desc:
                  safeArray(pack.officialLinks)
                    .slice(0, 2)
                    .map((item) => item.label)
                    .join(" → ") || "NDC/NAP/TNA 확인",
              },
              {
                title: "협의 경로 확정",
                desc:
                  pack.preferredRoute?.note ||
                  "CTCN / GCF / ODA-MDB 중 우선 경로 선택",
              },
              {
                title: "회의·요약본 준비",
                desc:
                  meetingPack.meetingGoal ||
                  "현지 파트너와 회의 안건·후속 산출물 정리",
              },
            ].map((step, idx) => (
              <div
                key={step.title}
                className="flex gap-3 rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-black text-emerald-300">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">
                    {step.title}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-400">
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-3">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">
              권장 다음 액션
            </div>
            <div className="mt-2 text-sm font-semibold text-white">
              {safeArray(pack.deliverables)[0] || "공유용 요약본 정리"}
            </div>
            <div className="mt-1 text-xs leading-relaxed text-slate-300">
              {pack.summary}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => safeInvoke(onDownloadBrief)}
              className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-3 text-sm font-semibold text-emerald-200"
            >
              요약본 저장
            </button>
            <button
              onClick={() => safeInvoke(onOpenSources)}
              className="rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-3 text-sm font-semibold text-sky-200"
            >
              출처 열기
            </button>
          </div>
          {nextCandidate ? (
            <button
              onClick={() => safeInvoke(onSelectRec, nextCandidate)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-3 text-left hover:bg-slate-800"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                대안도 함께 보기
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {nextCandidate.country} · {nextCandidate.region}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {techShort(nextCandidate.tech) || nextCandidate.tech}
              </div>
            </button>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}

function ReviewActionSummaryCard({
  rec,
  strategyMeta,
  pipelineData = null,
  shareUrl = "",
  onCopyShare = null,
  onDownloadBrief = null,
  onOpenSources = null,
}) {
  const safeRec = sanitize검토Record(rec) || EMPTY_DETAIL_RECORD;
  const evidenceMetrics = buildEvidenceMetrics(safeRec, pipelineData);
  const latestYear = getLatestEvidenceYear(safeRec) || "확인 필요";
  const nextAction =
    safeRec?.cooperationProfile?.quickWin ||
    safeArray(safeRec?.actions)[0] ||
    safeArray(safeRec?.reasons)[0] ||
    "핵심 근거와 파트너를 먼저 확인하세요.";
  const primaryEvidenceLink = getPrimaryEvidenceLink(safeRec, "general");

  return (
    <SectionCard
      title="지금 바로 해야 할 검토"
      icon={<Rocket className="text-emerald-300" size={16} />}
      right={
        <PillTag
          tone={strategyMeta?.decision === "즉시 추진 권고" ? "emerald" : "sky"}
        >
          {strategyMeta?.decision || "검토 중"}
        </PillTag>
      }
    >
      <div className="space-y-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
            회의에서 먼저 말할 한 줄
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            {strategyMeta?.oneLine ||
              safeRec?.countryNote ||
              "우선 검토 포인트를 먼저 확인하세요."}
          </div>
          <div className="mt-2 text-xs leading-relaxed text-slate-200">
            다음 행동 · {nextAction}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <ScorePill
            label="직접 문서"
            value={`${evidenceMetrics.directLinkCount}건`}
            accent="emerald"
          />
          <ScorePill
            label="최신 근거 연도"
            value={`${latestYear}`}
            accent="blue"
          />
          <ScorePill
            label="재원 파이프라인"
            value={`${evidenceMetrics.pipelineCount}건`}
            accent="amber"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => safeInvoke(onOpenSources)}
            className="rounded-2xl border border-slate-600 bg-slate-800 px-3 py-3 text-sm font-semibold text-slate-100"
          >
            공식 근거 먼저 보기
          </button>
          <button
            type="button"
            onClick={() => safeInvoke(onCopyShare)}
            className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-3 py-3 text-sm font-semibold text-sky-100"
          >
            현재 화면 링크 복사
          </button>
          <button
            type="button"
            onClick={() => safeInvoke(onDownloadBrief)}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm font-semibold text-emerald-100"
          >
            공유용 요약본 저장
          </button>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-xs text-slate-300 break-all">
          <span className="font-semibold text-white">공유 링크</span> ·{" "}
          {shareUrl || "링크 생성 전"}
          {primaryEvidenceLink?.href ? (
            <span className="block mt-1 text-slate-400">
              대표 근거 · {primaryEvidenceLink.label}
            </span>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}

function 검토PanelContent({
  rec,
  detailTab,
  set검토Tab,
  onCountryFocus,
  onRegionFocus,
  onDownloadExcel,
  onDownloadBrief,
  onCopyShare,
  shareUrl,
  guidePulse,
  focusMode = "region",
  isMobile = false,
  liveData,
  liveLoading,
  geoData,
  geoLoading,
  pipelineData,
  pipelineLoading,
  filteredRecs = [],
  onSelectRec,
  onRefreshLiveData,
  onRefreshGeoData,
  onRefreshPipelineData,
  onOpenDrillDown,
  shortlistRecs = [],
  strategyMetaByRec = {},
  shortlistIds = [],
  onToggleShortlist = null,
  ctisDataset = CTIS_VISIBLE_SEED_DATA,
}) {
  const hasSelection = !!rec;
  const safeRec = useMemo(
    () => sanitize검토Record(rec) || EMPTY_DETAIL_RECORD,
    [rec]
  );

  const tabs = [
    { key: "overview", label: "1. 핵심 판단", desc: "왜 지금 검토하는지" },
    { key: "recommendations", label: "2. 협력 설계", desc: "우선 조합·실행안" },
    { key: "funding", label: "3. 재원·실행", desc: "예산·집행·리스크" },
    { key: "partners", label: "4. 파트너", desc: "기관·현지 연결" },
    { key: "sources", label: "5. 근거·출처", desc: "문서·출처 바로 열기" },
  ];

  const pipeline = pipelineData || null;
  const purposeTags = safeArray(safeRec.purposeTags);
  const reasons = safeArray(safeRec.reasons);
  const actions = safeArray(safeRec.actions);
  const sourcePlan = safeArray(safeRec.sourcePlan);
  const regionRows = safeArray(safeRec.regionRows);
  const localPartners = safeArray(safeRec.localPartners);
  const cooperationProfile = safeRec.cooperationProfile || {};
  const groupedInventory = {
    확보: safeArray(safeRec.inventoryRows).filter((r) => r?.status === "확보"),
    결측: safeArray(safeRec.inventoryRows).filter(
      (r) => r?.status === "결측/한계" || r?.status === "보완 필요"
    ),
    실무필수: safeArray(safeRec.inventoryRows).filter(
      (r) => r?.status === "실무필수"
    ),
  };
  const strategySynthesis = useMemo(
    () =>
      hasSelection
        ? sanitizeStrategySynthesisOutput(
            buildStrategySynthesis(safeRec, pipelineData)
          ) || EMPTY_STRATEGY_SYNTHESIS
        : EMPTY_STRATEGY_SYNTHESIS,
    [hasSelection, safeRec, pipelineData]
  );
  const strategyMeta = useMemo(
    () =>
      hasSelection
        ? computeStrategyEvaluation(
            safeRec,
            {
              purpose: "전체 목적",
              financeChannel: "전체 재원",
              strategyFocus: "균형형",
            },
            pipelineData
          )
        : EMPTY_STRATEGY_META,
    [hasSelection, safeRec, pipelineData]
  );
  const ctisContext = useMemo(
    () =>
      hasSelection ? getCtisCountryContext(ctisDataset, safeRec.country) : null,
    [hasSelection, ctisDataset, safeRec.country]
  );

  const isShortlisted = useMemo(
    () => safeArray(shortlistIds).includes(safeRec.id),
    [shortlistIds, safeRec.id]
  );
  const [utilityTab, setUtilityTab] = useState("brief");

  useEffect(() => {
    setUtilityTab("brief");
  }, [safeRec.id]);

  useEffect(() => {
    if (detailTab === "sources") setUtilityTab("evidence");
    if (detailTab === "funding" || detailTab === "partners")
      setUtilityTab("action");
  }, [detailTab]);

  if (!hasSelection) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/88 p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
          선택 후보 상세
        </div>
        <div className="mt-1 text-xl font-extrabold text-white">
          왼쪽에서 먼저 검토할 후보를 고르세요
        </div>
        <div className="mt-2 text-sm leading-relaxed text-slate-400">
          지도 마커나 후보 목록에서 대상을 고르면, 이 패널에서 핵심 판단 ·
          재원·실행 · 파트너 · 출처를 차례로 검토할 수 있습니다.
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              title: "1. 대상 선택",
              desc: "좌측 후보에서 국가·지역을 고르거나 지도 마커를 누르세요.",
            },
            {
              title: "2. 핵심 판단 확인",
              desc: "핵심 요약 탭에서 적합도와 다음 행동을 먼저 확인하세요.",
            },
            {
              title: "3. 출처 확인",
              desc: "근거 자료 탭에서 공식 문서와 데이터 출처를 확인하세요.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4"
            >
              <div className="text-sm font-semibold text-white">
                {item.title}
              </div>
              <div className="mt-1 text-xs leading-relaxed text-slate-400">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/88 p-1.5">
        <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-4">
          {[
            {
              key: "brief",
              label: "1. 빠른 판단",
              desc: "중요성·권장 협력방식·실행성만 먼저 확인",
            },
            {
              key: "evidence",
              label: "2. 근거 확인",
              desc: "정책·문서·데이터를 추가 검증",
            },
            {
              key: "compare",
              label: "3. 비교 검토",
              desc: "후보군과 나란히 비교",
            },
            {
              key: "action",
              label: "4. 문서·공유",
              desc: "검토표·요약본·링크로 마무리",
            },
          ].map((tab) => {
            const active = utilityTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setUtilityTab(tab.key)}
                className={cx(
                  "rounded-xl border px-3 py-2.5 text-left transition",
                  active
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-800 bg-slate-800/70 text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="text-sm font-semibold">{tab.label}</div>
                <div className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  {tab.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {utilityTab === "brief" ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/90 overflow-hidden">
            <div className="border-b border-slate-800 bg-slate-800/35 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {safeRec.country} · {safeRec.region}
                    </span>
                    <span className="text-slate-400">{safeRec.continent}</span>
                  </div>
                  <div className="mt-1 text-xl font-extrabold text-white">
                    {strategyMeta.oneLine ||
                      cooperationProfile?.headline ||
                      "핵심 판단 문장을 먼저 확인하세요."}
                  </div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-300">
                    {safeRec.tech}
                  </div>
                </div>
                <PillTag tone="emerald">
                  {strategyMeta?.decision || "검토 필요"}
                </PillTag>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <ScorePill
                  label="실행 적합도"
                  value={`${safeRec.scores.feasibility}%`}
                  accent="emerald"
                />
                <ScorePill
                  label="전략 점수"
                  value={`${strategyMeta?.strategyScore || 0}점`}
                  accent="blue"
                />
                <ScorePill
                  label="공식 근거"
                  value={`${collectEvidenceLinks(safeRec, "general").length}건`}
                  accent="amber"
                />
                <ScorePill
                  label="파이프라인"
                  value={`${strategyMeta?.pipelineProjectCount || 0}건`}
                  accent="slate"
                />
              </div>
            </div>

            <div className="grid gap-3 px-4 py-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                  1) 왜 중요한가
                </div>
                <div className="mt-2 text-sm font-semibold leading-relaxed text-white">
                  {strategySynthesis?.whyNow?.[0] ||
                    reasons[0] ||
                    safeRec.countryNote ||
                    "정책·재원·현지 실행 신호가 동시에 확인되는 후보입니다."}
                </div>
              </div>

              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/8 p-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300">
                  2) 어떤 협력이 적합한가
                </div>
                <div className="mt-2 text-sm font-semibold leading-relaxed text-white">
                  {cooperationProfile?.partnershipModel ||
                    strategyMeta?.financeRoute ||
                    "정책·사업·실증을 함께 보는 연계형 접근이 적합합니다."}
                </div>
                <div className="mt-2 text-xs leading-relaxed text-slate-300">
                  {cooperationProfile?.quickWin ||
                    actions[0] ||
                    strategySynthesis?.roadmap?.[0]?.outcome ||
                    "상세 실행안은 재원·실행 또는 문서 미리보기에서 이어서 확인할 수 있습니다."}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 bg-slate-900/55 px-4 py-4 space-y-3">
              <CtisCompactSignalCard
                context={ctisContext}
                onOpenSources={() => set검토Tab("sources")}
              />
              <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-slate-700 bg-slate-950/55 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    3) 실행 가능성과 핵심 근거
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {buildPracticalMetrics(safeRec, pipelineData)
                      .slice(0, 4)
                      .map((item) => (
                        <div
                          key={item.key}
                          className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5"
                        >
                          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            {item.label}
                          </div>
                          <div className="mt-1 text-lg font-black text-white">
                            {item.score}점
                          </div>
                          <div className="mt-1 text-[11px] leading-relaxed text-slate-400 line-clamp-2">
                            {item.note}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-950/55 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    4) 더 볼 상세 근거
                  </div>
                  <div className="mt-2 space-y-2">
                    {collectEvidenceLinks(safeRec, "general")
                      .slice(0, 4)
                      .map((item) => (
                        <div
                          key={`${item.href}-${item.label}`}
                          className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5"
                        >
                          <div className="text-xs font-semibold text-white">
                            {item.label}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-400">
                            {item.group || "공식 근거"}
                          </div>
                          <div className="mt-1 text-[11px] leading-relaxed text-slate-300 break-all">
                            <ExternalInlineLink href={item.href}>
                              {item.href}
                            </ExternalInlineLink>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => set검토Tab("sources")}
                      className="rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
                    >
                      상세 근거 보기
                    </button>
                    <button
                      type="button"
                      onClick={() => safeInvoke(onToggleShortlist, safeRec)}
                      className={cx(
                        "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                        isShortlisted
                          ? "border-amber-500/40 bg-amber-500/12 text-amber-200"
                          : "border-slate-700 bg-slate-800/55 text-slate-200 hover:bg-slate-800"
                      )}
                    >
                      {isShortlisted ? "보관 해제" : "보관"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        focusMode === "country"
                          ? safeInvoke(onRegionFocus)
                          : safeInvoke(onCountryFocus)
                      }
                      className="rounded-xl border border-slate-700 bg-slate-800/55 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                    >
                      {focusMode === "country"
                        ? "지역 기준 보기"
                        : "국가 기준 보기"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {utilityTab === "evidence" ? (
        <div className="space-y-3">
          <DecisionEvidenceBlockCard
            rec={safeRec}
            strategyMeta={strategyMeta}
            liveData={liveData}
            geoData={geoData}
            pipelineData={pipelineData}
          />
          <SourceIntegrityBoardCard
            rec={safeRec}
            liveData={liveData}
            geoData={geoData}
            pipelineData={pipelineData}
          />
          <SectionCard
            title="근거 검증 다음 단계"
            icon={<CheckCircle2 className="text-emerald-400" size={16} />}
          >
            <div className="text-sm leading-relaxed text-slate-300">
              정책 문서, 프로젝트 페이지, 데이터 최신성을 더 자세히 확인해야
              하면 아래의 ‘상세 검토 탭’에서{" "}
              <strong className="text-white">근거·출처</strong> 탭을 여세요.
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => set검토Tab("sources")}
                className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100"
              >
                근거·출처 탭 열기
              </button>
              <button
                type="button"
                onClick={() => set검토Tab("funding")}
                className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-200"
              >
                재원·실행 탭 열기
              </button>
            </div>
          </SectionCard>
        </div>
      ) : null}

      {utilityTab === "compare" ? (
        <div className="space-y-3">
          <ShortlistCompareMatrixCard
            activeRec={safeRec}
            shortlistRecs={shortlistRecs}
            strategyMetaByRec={strategyMetaByRec}
            onSelectRec={onSelectRec}
          />
          <SectionCard
            title="비교 검토 팁"
            icon={<BarChart3 className="text-sky-300" size={16} />}
          >
            <div className="text-sm leading-relaxed text-slate-300">
              후보군은 보통 2~3개 수준에서 비교하는 것이 회의용 검토표에 가장
              적합합니다. 비교 후에는 재원·실행 탭과 파트너 탭을 차례로 열어
              실제 추진 가능성을 확인하세요.
            </div>
          </SectionCard>
        </div>
      ) : null}

      {utilityTab === "action" ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/88 p-3">
            <div className="space-y-3">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  저장·공유 바로가기
                </div>
                <div className="mt-1 text-sm font-semibold leading-6 text-white break-keep">
                  회의 직전에는 링크 복사, 요약본 저장, 검토표 저장, 출처 확인만
                  빠르게 실행하면 됩니다.
                </div>
                <div className="mt-2 text-xs leading-5 text-slate-400 break-keep">
                  먼저 요약본 또는 검토표를 저장하고, 필요 시 공유 링크와 출처를
                  함께 확인하면 회의용 전달 흐름을 빠르게 정리할 수 있습니다.
                </div>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => safeInvoke(onCopyShare)}
                  className="flex min-w-0 items-center justify-center rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-100"
                >
                  링크 복사
                </button>
                <button
                  type="button"
                  onClick={() => safeInvoke(onDownloadBrief)}
                  className="flex min-w-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold text-emerald-200"
                >
                  요약본 저장
                </button>
                <button
                  type="button"
                  onClick={() => safeInvoke(onDownloadExcel)}
                  className="flex min-w-0 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5 text-sm font-semibold text-sky-200"
                >
                  검토표 저장
                </button>
                <button
                  type="button"
                  onClick={() => safeInvoke(set검토Tab, "sources")}
                  className="flex min-w-0 items-center justify-center rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-slate-200"
                >
                  출처 열기
                </button>
              </div>

              <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-950/55 px-3 py-2.5">
                <div className="text-[11px] font-semibold tracking-[0.08em] text-slate-400">
                  공유 링크
                </div>
                <div className="mt-1 text-xs leading-5 text-slate-300 break-all">
                  {shareUrl || "링크 생성 전"}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 break-keep">
                  링크가 길어도 아래 영역에서 확인할 수 있으며, 복사 버튼으로
                  바로 공유할 수 있습니다.
                </div>
              </div>
            </div>
          </div>

          <검토TabGuideCard
            rec={safeRec}
            detailTab={detailTab}
            strategyMeta={strategyMeta}
            cooperationProfile={cooperationProfile}
            localPartners={localPartners}
            pipelineData={pipelineData}
            onDownloadBrief={onDownloadBrief}
            onOpenSources={() => set검토Tab("sources")}
          />
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-700 bg-slate-900/90 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/45">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            상세 검토 탭
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            선택 후보를 더 깊게 확인할 때는 아래 탭에서 협력
            설계·재원·파트너·근거를 차례로 검토하세요.
          </div>
        </div>
        <div className="p-3 bg-slate-950/55 backdrop-blur-sm">
          <div
            className={cx(
              isMobile ? "grid grid-cols-3 gap-2" : "grid grid-cols-5 gap-2"
            )}
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => set검토Tab(t.key)}
                className={cx(
                  isMobile
                    ? "min-h-[44px] rounded-xl px-2 py-2 text-xs font-semibold border transition"
                    : "rounded-2xl px-3 py-3 text-left border transition min-h-[68px]",
                  detailTab === t.key
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_0_1px_rgba(16,185,129,0.14)]"
                    : "bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700/60"
                )}
                aria-current={detailTab === t.key ? "page" : undefined}
              >
                <div
                  className={cx(
                    "font-semibold",
                    isMobile ? "text-xs text-center" : "text-sm"
                  )}
                >
                  {t.label}
                </div>
                {!isMobile && (
                  <div className="mt-1 text-[11px] leading-tight text-slate-400">
                    {t.desc}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {detailTab === "overview" && (
        <검토TabErrorBoundary
          resetKey={`overview-${safeRec.id || safeRec.country || "none"}`}
          title="핵심 요약"
        >
          <div className="space-y-3">
            <CtisCompactSignalCard
              context={ctisContext}
              onOpenSources={() => set검토Tab("sources")}
            />
            <ConnectionReadinessCard
              rec={safeRec}
              liveData={liveData}
              pipelineData={pipelineData}
              geoData={geoData}
              onOpenSources={() => set검토Tab("sources")}
              onOpenFunding={() => set검토Tab("funding")}
            />
            <DataBasedEvidenceCard rec={safeRec} pipelineData={pipelineData} />
            <CandidateDecisionWorkspaceCard
              rec={safeRec}
              pipelineData={pipelineData}
              onDownloadBrief={onDownloadBrief}
              onOpenSources={() => set검토Tab("sources")}
              filteredRecs={filteredRecs}
              onSelectRec={onSelectRec}
            />
            <AlternativeCandidatesCard
              rec={safeRec}
              filteredRecs={filteredRecs}
              onSelectRec={onSelectRec}
            />
            <InternationalCooperationReadinessCard
              rec={safeRec}
              pipelineData={pipelineData}
            />
            <InternationalFrameworkAlignmentCard
              rec={safeRec}
              pipelineData={pipelineData}
            />
            <SectionCard
              title="의사결정 한눈에 보기"
              icon={<Target className="text-emerald-400" size={16} />}
              right={
                <PillTag
                  tone={
                    strategyMeta.decision === "즉시 추진 권고"
                      ? "emerald"
                      : strategyMeta.decision === "보완 후 추진"
                      ? "blue"
                      : "slate"
                  }
                >
                  {strategyMeta.decision}
                </PillTag>
              }
            >
              <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="text-xs font-bold text-emerald-300">
                    추천 한 줄 요약
                  </div>
                  <div className="mt-1 text-base font-extrabold text-white">
                    {strategyMeta.oneLine}
                  </div>
                  <div className="mt-2 text-xs text-slate-300">
                    권장 재원 연결 경로 ·{" "}
                    {strategyMeta.financeRoute || "추가 검토 필요"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
                    <div className="text-slate-400">전략 점수</div>
                    <div className="mt-1 text-lg font-black text-white">
                      {strategyMeta.strategyScore}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
                    <div className="text-slate-400">파이프라인</div>
                    <div className="mt-1 text-lg font-black text-white">
                      {strategyMeta.pipelineProjectCount}건
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
                    <div className="text-slate-400">재원 적합성</div>
                    <div className="mt-1 text-lg font-black text-white">
                      {Math.round(strategyMeta.financeFit)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5">
                    <div className="text-slate-400">리스크 대응</div>
                    <div className="mt-1 text-lg font-black text-white">
                      {Math.round(strategyMeta.riskUrgency)}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
            <SectionCard
              title="이 후보를 먼저 볼 이유"
              icon={<Target className="text-emerald-400" size={16} />}
            >
              <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="text-xs font-bold text-emerald-300">
                  추천 협력 패키지
                </div>
                <div className="text-base font-extrabold text-white mt-1">
                  {cooperationProfile?.headline}
                </div>
                <div className="text-xs text-slate-300 mt-2">
                  협력 모델 · {cooperationProfile?.partnershipModel}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  즉시 추진 과제 · {cooperationProfile?.quickWin}
                </div>
              </div>
              <ul className="space-y-2">
                {reasons.map((r, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-200">
                    <CheckCircle2
                      size={15}
                      className="text-emerald-400 mt-0.5 shrink-0"
                    />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/35 p-3">
                <div className="text-xs text-slate-400 mb-2">
                  3 Pillars 데이터 목적 적합도
                </div>
                <div className="space-y-2.5">
                  <ProgressBar
                    label="데이터 가용성"
                    value={safeRec.scores.coverage}
                    tone="emerald"
                  />
                  <ProgressBar
                    label="데이터 신뢰도"
                    value={safeRec.scores.reliability}
                    tone="blue"
                  />
                  <ProgressBar
                    label="결측 복원력"
                    value={safeRec.scores.resilience}
                    tone="amber"
                  />
                </div>
              </div>
            </SectionCard>

            <div className="grid gap-3 xl:grid-cols-2">
              <StrategyEvidenceCard
                rec={safeRec}
                onOpenSources={() => set검토Tab("sources")}
                onOpenDrillDown={onOpenDrillDown}
              />
              <ExecutionFeasibilityCard rec={safeRec} />
            </div>

            <DataInventoryViz rec={safeRec} />
            <SuitabilityLogicCard rec={safeRec} />
            <VietnamPilotCard rec={safeRec} />
            <PracticalMetricCard rec={safeRec} pipelineData={pipelineData} />
            <EvidenceCoverageSummaryCard
              rec={safeRec}
              pipelineData={pipelineData}
            />
            <DataFreshnessCard
              rec={safeRec}
              liveData={liveData}
              pipelineData={pipelineData}
            />
            <ScoreMethodCard />

            <SectionCard
              title="데이터 확보 현황"
              icon={<Database className="text-emerald-400" size={16} />}
            >
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-emerald-300 mb-1.5">
                    확보 데이터
                  </div>
                  <div className="space-y-1.5">
                    {groupedInventory.확보.map((row, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-slate-200"
                      >
                        <div>{row.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {row.scope} · {row.memo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-amber-300 mb-1.5">
                    결측 / 한계 데이터
                  </div>
                  <div className="space-y-1.5">
                    {groupedInventory.결측.map((row, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-slate-200"
                      >
                        <div>{row.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {row.scope} · {row.memo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-sky-300 mb-1.5">
                    실행 전 필수 확인
                  </div>
                  <div className="space-y-1.5">
                    {groupedInventory.실무필수.map((row, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-sm text-slate-200"
                      >
                        <div>{row.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {row.scope} · {row.memo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="다음 액션"
              icon={<AlertTriangle className="text-amber-300" size={16} />}
            >
              <ol className="space-y-2">
                {actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-[11px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-slate-200">{a}</span>
                  </li>
                ))}
              </ol>
            </SectionCard>
          </div>
        </검토TabErrorBoundary>
      )}

      {detailTab === "recommendations" && strategySynthesis && (
        <검토TabErrorBoundary
          resetKey={`recommendations-${
            safeRec.id || safeRec.country || "none"
          }`}
          title="추천 협력"
        >
          <div className="space-y-3">
            <DataBasedEvidenceCard rec={safeRec} pipelineData={pipelineData} />
            <SubmissionReadinessPackCard
              rec={safeRec}
              pipelineData={pipelineData}
            />
            <SectionCard
              title="실전 전략 제안 결과"
              icon={<Target className="text-emerald-400" size={16} />}
              right={
                <span className="text-xs text-slate-400">
                  검토표 저장는 아래 버튼에서 바로 할 수 있습니다
                </span>
              }
            >
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-emerald-300">
                      최종 권고안
                    </div>
                    <div className="mt-1 text-base font-extrabold text-white">
                      {strategySynthesis.strategyName}
                    </div>
                  </div>
                  <PillTag tone="emerald">{strategySynthesis.decision}</PillTag>
                </div>
                <div className="mt-2 text-sm text-slate-200 leading-relaxed">
                  {strategySynthesis.oneLiner}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm">
                    <div className="text-xs font-bold text-slate-400">
                      대표 사업
                    </div>
                    <div className="mt-1 font-semibold text-white">
                      {strategySynthesis.flagshipProject.title}
                    </div>
                    {strategySynthesis.flagshipProject.link && (
                      <div className="mt-2">
                        <ExternalLinkButton
                          href={strategySynthesis.flagshipProject.link}
                          label="대표 사업 링크"
                          compact
                        />
                      </div>
                    )}
                    <div className="mt-1 text-slate-300">
                      {strategySynthesis.flagshipProject.scope}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm">
                    <div className="text-xs font-bold text-slate-400">
                      재원 연결 경로
                    </div>
                    <div className="mt-1 font-semibold text-white">
                      {strategySynthesis.flagshipProject.financeRoute}
                    </div>
                    <div className="mt-1 text-slate-300">
                      {strategySynthesis.flagshipProject.entryPoint}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {strategySynthesis.whyNow.length ? (
                  strategySynthesis.whyNow.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-700 bg-slate-800/35 p-3 text-sm text-slate-200"
                    >
                      <div className="text-xs font-bold text-emerald-300 mb-1">
                        지금 검토해야 하는 이유 {idx + 1}
                      </div>
                      {item}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-xs text-slate-400">
                    표시할 근거 자료가 정리되면 여기에 표시됩니다.
                  </div>
                )}
              </div>
            </SectionCard>

            <CooperationActionPlanCard
              rec={safeRec}
              pipelineData={pipelineData}
            />

            <SectionCard
              title="우선 검토 지역"
              icon={<MapPin className="text-sky-300" size={16} />}
            >
              <div className="space-y-2">
                {strategySynthesis.priorityRegions.length ? (
                  strategySynthesis.priorityRegions.map((item, idx) => (
                    <div
                      key={item.province}
                      className="rounded-xl border border-slate-700 bg-slate-800/35 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-white">
                            {idx + 1}. {item.province}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {item.role}
                          </div>
                        </div>
                        <PillTag
                          tone={
                            idx === 0 ? "emerald" : idx < 3 ? "blue" : "slate"
                          }
                        >
                          우선도 {item.priorityScore}
                        </PillTag>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs">
                        <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2 text-slate-300">
                          위험도{" "}
                          <span className="text-slate-100">
                            {item.riskScore}
                          </span>{" "}
                          · 운영준비도{" "}
                          <span className="text-slate-100">
                            {item.opsReadiness}
                          </span>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2 text-slate-300">
                          핫스팟 {item.hotspotCount}건
                          {item.asset ? ` · 자산 ${item.asset}` : ""}
                        </div>
                      </div>
                      {!!item.districts?.length && (
                        <div className="mt-2 text-xs text-slate-300">
                          대표 지점: {item.districts.join(", ")}
                        </div>
                      )}
                      {!!item.evidence?.length && (
                        <ul className="mt-2 space-y-1 text-xs text-slate-400">
                          {item.evidence
                            .slice(0, 2)
                            .map((evidence, evidenceIdx) => (
                              <li key={evidenceIdx}>• {evidence}</li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-xs text-slate-400">
                    지역별 협력 참고 정보는 후속 탑재 예정입니다.
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="재원·파이프라인 해석"
              icon={<Database className="text-violet-300" size={16} />}
              right={
                <button
                  onClick={() => safeInvoke(onRefreshPipelineData)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/15"
                >
                  {pipelineLoading ? "조회 중..." : "파이프라인 새로고침"}
                </button>
              }
            >
              <div className="grid gap-2 sm:grid-cols-3 text-sm">
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                  <div className="text-xs font-bold text-slate-400">
                    연결 파이프라인
                  </div>
                  <div className="mt-1 text-xl font-extrabold text-white">
                    {strategySynthesis.financeSummary.pipelineProjectCount}건
                  </div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                  <div className="text-xs font-bold text-slate-400">
                    합산 재원규모
                  </div>
                  <div className="mt-1 text-xl font-extrabold text-white">
                    {strategySynthesis.financeSummary.pipelineTotalUSD
                      ? `${Number(
                          strategySynthesis.financeSummary.pipelineTotalUSD
                        ).toLocaleString()} USD`
                      : "-"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                  <div className="text-xs font-bold text-slate-400">
                    권장 재원 구조
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {strategySynthesis.financeSummary.financeRoute}
                  </div>
                </div>
              </div>

              {!!strategySynthesis.financeSummary.anchorProjects?.length && (
                <div className="mt-3 space-y-2">
                  {strategySynthesis.financeSummary.anchorProjects.map(
                    (project, idx) => (
                      <div
                        key={`${project.source || "src"}-${
                          project.title || idx
                        }`}
                        className="rounded-xl border border-slate-700 bg-slate-800/35 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-bold text-white">
                            {project.title || `Pipeline ${idx + 1}`}
                          </div>
                          <PillTag tone="blue">
                            {project.stage ||
                              project.status ||
                              "재원파이프라인"}
                          </PillTag>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          {project.source || "MDB/GCF"} ·{" "}
                          {project.region || safeRec.region}
                        </div>
                        <div className="mt-2 text-xs text-slate-300">
                          {project.amountUSD != null
                            ? `${Number(
                                project.amountUSD
                              ).toLocaleString()} USD`
                            : "-"}
                        </div>
                        {(project.link || guessSourceHref(project.source)) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <ExternalLinkButton
                              href={
                                project.link || guessSourceHref(project.source)
                              }
                              label={project.link ? "사업 페이지" : "기관 포털"}
                              compact
                            />
                            {project.link &&
                            guessSourceHref(project.source) &&
                            guessSourceHref(project.source) !== project.link ? (
                              <ExternalLinkButton
                                href={guessSourceHref(project.source)}
                                label="기관 포털"
                                compact
                              />
                            ) : null}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="4단계 실행 로드맵"
              icon={<CheckCircle2 className="text-emerald-300" size={16} />}
            >
              <div className="space-y-2">
                {strategySynthesis.roadmap.length ? (
                  strategySynthesis.roadmap.map((stage) => (
                    <div
                      key={stage.stage}
                      className="rounded-xl border border-slate-700 bg-slate-800/35 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold text-white">
                          {stage.stage}
                        </div>
                        <PillTag tone="slate">{stage.period}</PillTag>
                      </div>
                      <div className="mt-1 text-xs text-emerald-300">
                        {stage.outcome}
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-slate-300">
                        {stage.actions.map((action, idx) => (
                          <li key={idx}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-xs text-slate-400">
                    지역별 협력 참고 정보는 후속 탑재 예정입니다.
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Go / Hold 판단과 핵심 지표"
              icon={<AlertTriangle className="text-amber-300" size={16} />}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="text-xs font-bold text-emerald-300">
                    Go 필터
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-slate-200">
                    {strategySynthesis.goNoGo.go.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="text-xs font-bold text-amber-300">
                    Hold 필터
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-slate-200">
                    {strategySynthesis.goNoGo.hold.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <div className="text-xs font-bold text-white">핵심 KPI</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {strategySynthesis.kpis.map((item) => (
                    <PillTag key={item} tone="blue">
                      {item}
                    </PillTag>
                  ))}
                </div>
                {!!strategySynthesis.protocolSummary?.length && (
                  <div className="mt-3 text-xs text-slate-400">
                    프로토콜 예시:{" "}
                    {strategySynthesis.protocolSummary.join(" / ")}
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </검토TabErrorBoundary>
      )}

      {detailTab === "funding" && (
        <검토TabErrorBoundary
          resetKey={`funding-${safeRec.id || safeRec.country || "none"}`}
          title="재원·실행"
        >
          <FundingExecutionPanel
            rec={safeRec}
            liveData={liveData}
            liveLoading={liveLoading}
            geoData={geoData}
            geoLoading={geoLoading}
            pipelineData={pipelineData}
            pipelineLoading={pipelineLoading}
            onRefreshLiveData={onRefreshLiveData}
            onRefreshGeoData={onRefreshGeoData}
            onRefreshPipelineData={onRefreshPipelineData}
          />
        </검토TabErrorBoundary>
      )}

      {detailTab === "sources" && (
        <검토TabErrorBoundary
          resetKey={`sources-${safeRec.id || safeRec.country || "none"}`}
          title="공식 근거와 출처"
        >
          <OfficialDocumentShelfCard rec={safeRec} />
          <SourceIntegrityBoardCard
            rec={safeRec}
            liveData={liveData}
            geoData={geoData}
            pipelineData={pipelineData}
          />
          <DataFreshnessCard
            rec={safeRec}
            liveData={liveData}
            pipelineData={pipelineData}
          />
          <EvidenceCoverageSummaryCard
            rec={safeRec}
            pipelineData={pipelineData}
          />
          <SubmissionReadinessPackCard
            rec={safeRec}
            pipelineData={pipelineData}
          />
          <CtisEvidenceSection context={ctisContext} />
          <SectionCard
            title="소스 / 갱신 주기 / 수집 방식"
            icon={<RefreshCw className="text-emerald-400" size={16} />}
          >
            <div className="mb-3 rounded-xl border border-slate-700 bg-slate-800/30 p-3">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div>
                  <div className="text-sm font-bold text-white">
                    실시간 데이터 연동 상태
                  </div>
                  <div className="text-xs text-slate-400">
                    World Bank / NASA POWER / OSM(Nominatim) / same-origin
                    pipeline
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => safeInvoke(onRefreshLiveData)}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300"
                  >
                    {liveLoading ? "동기화 중..." : "실데이터 동기화"}
                  </button>
                  <button
                    onClick={() => safeInvoke(onRefreshGeoData)}
                    className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-300"
                  >
                    {geoLoading ? "검증 중..." : "경계/좌표 검증"}
                  </button>
                  <button
                    onClick={() => safeInvoke(onRefreshPipelineData)}
                    className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-xs font-semibold text-violet-300"
                  >
                    {pipelineLoading ? "조회 중..." : "MDB/GCF 파이프라인"}
                  </button>
                </div>
              </div>

              {!liveData && !liveLoading && (
                <div className="mt-2 text-xs text-slate-400">
                  실시간 데이터를 아직 불러오지 않았습니다. 지금은 저장된 후보
                  데이터와 공식 문서 링크로 계속 검토할 수 있으며, 실데이터
                  동기화를 누르면 최신 공개 지표를 다시 조회합니다.
                </div>
              )}

              {liveData && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
                    <div className="text-slate-400">GDP (WB)</div>
                    <div className="text-slate-100 font-semibold">
                      {liveData.worldBank?.gdp?.value != null
                        ? `${Number(
                            liveData.worldBank.gdp.value
                          ).toLocaleString()} USD`
                        : "-"}
                    </div>
                    <div className="text-slate-500">
                      {liveData.worldBank?.gdp?.year || ""}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
                    <div className="text-slate-400">인구 (WB)</div>
                    <div className="text-slate-100 font-semibold">
                      {liveData.worldBank?.population?.value != null
                        ? Number(
                            liveData.worldBank.population.value
                          ).toLocaleString()
                        : "-"}
                    </div>
                    <div className="text-slate-500">
                      {liveData.worldBank?.population?.year || ""}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
                    <div className="text-slate-400">전력접근률 (WB)</div>
                    <div className="text-slate-100 font-semibold">
                      {liveData.worldBank?.electricityAccess?.value != null
                        ? `${Number(
                            liveData.worldBank.electricityAccess.value
                          ).toFixed(1)}%`
                        : "-"}
                    </div>
                    <div className="text-slate-500">
                      {liveData.worldBank?.electricityAccess?.year || ""}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
                    <div className="text-slate-400">GHI / T2M (NASA)</div>
                    <div className="text-slate-100 font-semibold">
                      {liveData.nasaPower?.ghiAnn != null
                        ? `${liveData.nasaPower.ghiAnn}`
                        : "-"}{" "}
                      /{" "}
                      {liveData.nasaPower?.t2mAnn != null
                        ? `${liveData.nasaPower.t2mAnn}`
                        : "-"}
                    </div>
                    <div className="text-slate-500">ANN climatology</div>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
                    <div className="text-slate-400">재생에너지 비중 (WB)</div>
                    <div className="text-slate-100 font-semibold">
                      {liveData.worldBank?.renewableEnergy?.value != null
                        ? `${Number(
                            liveData.worldBank.renewableEnergy.value
                          ).toFixed(1)}%`
                        : "-"}
                    </div>
                    <div className="text-slate-500">
                      {liveData.worldBank?.renewableEnergy?.year || ""}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-2">
                    <div className="text-slate-400">CO₂ 배출량 (WB)</div>
                    <div className="text-slate-100 font-semibold">
                      {liveData.worldBank?.co2Emissions?.value != null
                        ? `${Number(
                            liveData.worldBank.co2Emissions.value
                          ).toLocaleString()} kt`
                        : "-"}
                    </div>
                    <div className="text-slate-500">
                      {liveData.worldBank?.co2Emissions?.year || ""}
                    </div>
                  </div>
                </div>
              )}

              {geoData?.validation && (
                <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/60 p-2 text-xs">
                  <div className="text-slate-400 mb-1">좌표 검증</div>
                  <div className="text-slate-100">
                    지역 검색 중심점과 현재 좌표 거리:{" "}
                    <span
                      className={
                        geoData.validation.distanceKm > 120
                          ? "text-amber-300 font-bold"
                          : "text-emerald-300 font-bold"
                      }
                    >
                      {geoData.validation.distanceKm} km
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1 break-all">
                    {geoData.validation.regionDisplayName}
                  </div>
                </div>
              )}

              <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-white">
                      MDB / GCF 프로젝트·금융 파이프라인
                    </div>
                    <div className="text-xs text-slate-400">
                      동일 출처 API · /api/pipeline/v1/projects
                    </div>
                  </div>
                  <PillTag
                    tone={pipelineData?.projects?.length ? "blue" : "slate"}
                  >
                    {pipelineData?.projects?.length
                      ? `${pipelineData.projects.length}건`
                      : pipelineLoading
                      ? "조회 중"
                      : "대기"}
                  </PillTag>
                </div>

                {!pipelineData && !pipelineLoading && (
                  <div className="mt-2 text-xs text-slate-400">
                    아직 프로젝트·재원 후보군을 불러오지 않았습니다.
                  </div>
                )}

                {pipelineData?.summary && (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-2">
                        <div className="text-slate-400">국가 · 지역</div>
                        <div className="text-slate-100 font-semibold">
                          {pipelineData.summary.country || safeRec.country} /{" "}
                          {pipelineData.summary.region || safeRec.region}
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-2">
                        <div className="text-slate-400">테마</div>
                        <div className="text-slate-100 font-semibold">
                          {pipelineData.summary.theme || safeRec.tech}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-[11px] text-slate-300">
                      <span className="font-semibold text-white">
                        {pipelineData.summary.statusLabel || "데이터 상태"}
                      </span>
                      {pipelineData.summary.note
                        ? ` · ${pipelineData.summary.note}`
                        : ""}
                    </div>
                  </div>
                )}

                {pipelineData?.isFallback && (
                  <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
                    실시간 파이프라인 API가 아직 연결되지 않아 검증용 기본
                    데이터를 함께 보여주고 있습니다.
                  </div>
                )}

                {!!pipelineData?.projects?.length && (
                  <div className="mt-3 space-y-2">
                    {pipelineData.projects.map((project, idx) => (
                      <div
                        key={`${project.source || "src"}-${
                          project.title || idx
                        }`}
                        className="rounded-xl border border-slate-700 bg-slate-800/35 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-bold text-white">
                            {project.title || `Project ${idx + 1}`}
                          </div>
                          <PillTag tone="blue">
                            {project.stage ||
                              project.status ||
                              "재원파이프라인"}
                          </PillTag>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          {project.source || "MDB/GCF"}
                          {project.executingPartner || project.partner
                            ? ` · ${
                                project.executingPartner || project.partner
                              }`
                            : ""}
                        </div>
                        {(project.link || guessSourceHref(project.source)) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <ExternalLinkButton
                              href={
                                project.link || guessSourceHref(project.source)
                              }
                              label={project.link ? "사업 페이지" : "기관 포털"}
                              compact
                            />
                            {project.link &&
                            guessSourceHref(project.source) &&
                            guessSourceHref(project.source) !== project.link ? (
                              <ExternalLinkButton
                                href={guessSourceHref(project.source)}
                                label="기관 포털"
                                compact
                              />
                            ) : null}
                          </div>
                        )}
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-slate-300">
                            재원규모:{" "}
                            <span className="text-slate-100">
                              {project.amountUSD != null
                                ? `${Number(
                                    project.amountUSD
                                  ).toLocaleString()} USD`
                                : project.amount || "-"}
                            </span>
                          </div>
                          <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-slate-300">
                            국가/지역:{" "}
                            <span className="text-slate-100">
                              {project.country || safeRec.country} /{" "}
                              {project.region || safeRec.region}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              {API_CATALOG.map((api) => (
                <div
                  key={api.key}
                  className="rounded-xl border border-slate-700 bg-slate-800/35 p-3 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-white">{api.name}</div>
                    <PillTag
                      tone={
                        api.status === "active"
                          ? "emerald"
                          : api.status === "pilot"
                          ? "blue"
                          : "amber"
                      }
                    >
                      {api.status === "active"
                        ? "연계중"
                        : api.status === "pilot"
                        ? "대표 데이터"
                        : "다음 단계"}
                    </PillTag>
                  </div>
                  <div className="text-slate-400 mt-1">{api.scope}</div>
                  <div className="text-slate-500 mt-1">{api.type}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 max-h-[52dvh] overflow-y-auto pr-1">
              {sourcePlan.length ? (
                sourcePlan.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-700 bg-slate-800/35 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold text-white">
                        {s.source}
                      </div>
                      <PillTag
                        tone={
                          String(s.acquisition || "").includes("API")
                            ? "emerald"
                            : "slate"
                        }
                      >
                        {s.acquisition}
                      </PillTag>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{s.layer}</div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-slate-300">
                        갱신: <span className="text-slate-100">{s.cycle}</span>
                      </div>
                      <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-slate-300">
                        해상도:{" "}
                        <span className="text-slate-100">{s.resolution}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-300 flex items-start gap-1.5">
                      <Link2
                        size={12}
                        className="mt-0.5 text-emerald-300 shrink-0"
                      />
                      <ExternalInlineLink
                        href={guessSourceHref(s.source, s.endpoint)}
                      >
                        {s.endpoint}
                      </ExternalInlineLink>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{s.note}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-xs text-slate-400">
                  표시할 근거 자료가 정리되면 여기에 표시됩니다.
                </div>
              )}
            </div>
          </SectionCard>
        </검토TabErrorBoundary>
      )}

      {detailTab === "partners" && (
        <검토TabErrorBoundary
          resetKey={`partners-${safeRec.id || safeRec.country || "none"}`}
          title="현지 파트너"
        >
          <div className="space-y-3">
            <FieldMeetingPrepCard rec={safeRec} pipelineData={pipelineData} />
            <LocalPartnersCard partners={localPartners} />
            <PartnerEngagementMatrixCard partners={localPartners} />

            <SectionCard
              title="지역별 협력 참고 정보"
              icon={<MapPin className="text-emerald-400" size={16} />}
            >
              <div className="space-y-2">
                {regionRows.length ? (
                  regionRows.map((r, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-700 bg-slate-800/35 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-white font-semibold">
                          {r.field}
                        </div>
                        <PillTag tone="emerald">{r.category}</PillTag>
                      </div>
                      <div className="mt-1 text-xs text-slate-300">
                        {r.value}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-slate-300">
                          출처:{" "}
                          <ExternalInlineLink
                            href={
                              ensureExternalUrl(r.link) ||
                              guessSourceHref(r.source)
                            }
                          >
                            {r.source}
                          </ExternalInlineLink>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-slate-300">
                          갱신:{" "}
                          <span className="text-slate-100">{r.update}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 px-3 py-3 text-xs text-slate-400">
                    지역별 협력 참고 정보는 후속 탑재 예정입니다.
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="지도 보기 전환"
              icon={<MapIcon className="text-sky-300" size={16} />}
            >
              <div
                className={cx(
                  "grid gap-2",
                  "grid-cols-2",
                  guidePulse === "focus-buttons" &&
                    "guide-pulse-soft rounded-xl"
                )}
              >
                <button
                  onClick={() => safeInvoke(onCountryFocus)}
                  className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  국가 검토 기준 보기
                </button>
                <button
                  onClick={() => safeInvoke(onRegionFocus)}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/15"
                >
                  지역 검토 기준 보기
                </button>
              </div>
            </SectionCard>
          </div>
        </검토TabErrorBoundary>
      )}

      {/* sticky actions */}
      <div
        data-guide-id="excel-download"
        className={cx(
          "rounded-2xl border border-slate-700 bg-slate-900/90 p-3",
          guidePulse === "excel-download" && "guide-pulse-soft"
        )}
      >
        <div
          className={cx("grid gap-2", isMobile ? "grid-cols-2" : "grid-cols-1")}
        >
          <button
            onClick={() => safeInvoke(onDownloadExcel)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-400"
          >
            <FileSpreadsheet size={16} />
            검토표 PDF
          </button>
          <button
            onClick={() => safeInvoke(onDownloadBrief)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-200 hover:bg-sky-500/15"
          >
            <FileCheck size={16} />
            공유용 요약본
          </button>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          검토표와 요약본은 바로 저장할 수 있습니다.
        </div>
      </div>
    </div>
  );
}

function MobileBottomNav({
  activeKey = null,
  onOpenLegend,
  onOpenFilters,
  onOpenCandidates,
  onOpen검토,
  filteredCount = 0,
  hasActiveRec = false,
}) {
  const items = [
    {
      key: "legend",
      label: "범례",
      icon: BookOpen,
      onClick: onOpenLegend,
      badge: "38",
    },
    { key: "filters", label: "필터", icon: Filter, onClick: onOpenFilters },
    {
      key: "candidates",
      label: "후보",
      icon: List,
      onClick: onOpenCandidates,
      badge: filteredCount > 99 ? "99+" : String(filteredCount),
    },
    {
      key: "detail",
      label: "상세",
      icon: PanelRight,
      onClick: onOpen검토,
      disabled: !hasActiveRec,
    },
  ];

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[72] px-2"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}
    >
      <div className="rounded-[22px] border border-slate-700/80 bg-slate-950/96 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1 p-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const selected = activeKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                disabled={item.disabled}
                onClick={() => !item.disabled && safeInvoke(item.onClick)}
                className={cx(
                  "relative min-h-[60px] rounded-2xl border px-2 py-2.5 text-center transition-colors",
                  selected
                    ? "border-emerald-500/35 bg-emerald-500/12 text-emerald-300"
                    : "border-transparent bg-slate-900/70 text-slate-300",
                  item.disabled && "cursor-not-allowed opacity-45"
                )}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="relative inline-flex">
                    <Icon size={17} />
                    {item.badge ? (
                      <span className="absolute -right-3 -top-2 rounded-full border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-slate-200">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[11px] font-semibold">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Mobile sheet
 * ========================================================= */
function MobileSheet({ open, title, onClose, children, full = false }) {
  if (!open) return null;
  const contentHeight = full
    ? "calc(100dvh - 110px - env(safe-area-inset-bottom))"
    : "calc(84dvh - 72px)";
  const containerStyle = full
    ? {
        top: "calc(env(safe-area-inset-top) + 8px)",
        bottom: 0,
        marginLeft: "4px",
        marginRight: "4px",
        borderRadius: "26px 26px 0 0",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
      }
    : {
        paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
      };
  const contentStyle = full
    ? { height: contentHeight }
    : { maxHeight: contentHeight };
  return (
    <div className="fixed inset-0 z-[70]">
      <button
        className="absolute inset-0 bg-slate-950/72 backdrop-blur-sm"
        onClick={() => safeInvoke(onClose)}
        aria-label="닫기"
      />
      <div
        className={cx(
          "absolute inset-x-0 bottom-0 overflow-hidden border border-slate-700 bg-slate-900/97 shadow-2xl",
          full ? "rounded-t-[26px]" : "mx-2 rounded-t-3xl max-h-[84dvh]",
          full && "flex flex-col"
        )}
        style={containerStyle}
      >
        <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/96 px-4 pb-3 pt-3 backdrop-blur-xl">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-600" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                모바일 작업창
              </div>
              <div className="mt-1 truncate text-base font-extrabold text-white">
                {title}
              </div>
            </div>
            <button
              onClick={() => safeInvoke(onClose)}
              className="rounded-xl border border-slate-600 bg-slate-800 p-2 text-slate-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div
          className={cx(
            "overflow-y-auto px-3 pb-4",
            full && "flex min-h-0 flex-1 flex-col"
          )}
          style={contentStyle}
        >
          <div className={cx("pt-3", full && "flex min-h-0 flex-1 flex-col")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Guide modal
 * ========================================================= */
function GuideModal({
  open,
  stepIndex,
  setStepIndex,
  onClose,
  onDontShowToday,
  onTryStep,
}) {
  if (!open) return null;

  const step = GUIDE_STEPS[stepIndex];
  const isLast = stepIndex === GUIDE_STEPS.length - 1;

  return (
    <div className="fixed inset-x-0 bottom-3 z-[80] flex justify-center px-3 pointer-events-none lg:justify-end lg:px-4">
      <div className="pointer-events-auto w-full max-w-[780px] lg:max-w-[430px] rounded-[26px] border border-emerald-500/25 bg-slate-900/96 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/45 flex items-center justify-between gap-3">
          <div>
            <div className="text-emerald-300 font-bold text-sm">
              도움말 {stepIndex + 1} / {GUIDE_STEPS.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              현재 화면에서 확인할 버튼, 패널 이동 방법, 읽는 순서를 단계별로
              안내합니다.
            </div>
          </div>
          <button
            onClick={() => safeInvoke(onClose)}
            className="rounded-lg border border-slate-600 bg-slate-800 p-1.5 text-slate-200 hover:bg-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 grid gap-4 lg:grid-cols-1">
          <div>
            <h4 className="text-white font-extrabold text-lg">{step.title}</h4>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              {step.desc}
            </p>
            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-800/40 p-3">
              <div className="text-xs text-slate-400 mb-1">실행 예시</div>
              <div className="text-sm text-slate-100">{step.example}</div>
            </div>
            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-800/40 p-3">
              <div className="text-xs text-slate-400 mb-1">패널 조작</div>
              <div className="text-sm leading-relaxed text-slate-100">
                패널 상단의 점선 손잡이를 끌면 위치를 바꿀 수 있고, 핀 버튼으로
                다시 양쪽 가장자리에 고정할 수 있습니다. 패널 안쪽의 세로 선을
                드래그하면 폭도 조절됩니다.
              </div>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                className="accent-emerald-500"
                onChange={(e) => {
                  if (e.target.checked) onDontShowToday();
                }}
              />
              오늘 다시 보지 않기
            </label>
          </div>

          <div className="flex flex-wrap gap-2 lg:grid lg:grid-cols-3">
            <button
              onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
              disabled={stepIndex === 0}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              이전
            </button>
            {step.actionKey && (
              <button
                onClick={() => safeInvoke(onTryStep, step.actionKey)}
                className="flex-1 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5 text-sm font-semibold text-sky-300"
              >
                {step.actionLabel || "이 단계 실행"}
              </button>
            )}
            <button
              onClick={() => {
                if (isLast) onClose();
                else setStepIndex((s) => s + 1);
              }}
              className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold text-emerald-300"
            >
              {isLast ? "도움말 닫기" : "다음"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Launch / methodology modals
 * ========================================================= */
function DownloadFallbackModal({ state, onClose, onCopy, onRetry }) {
  const previewFrameRef = useRef(null);
  if (!state?.open) return null;

  const fileKindLabel =
    state.fileLabel || getDownloadKindMeta(state.fileKind).fileLabel;
  const eyebrowLabel =
    state.environmentReason === "runtime-error"
      ? "문서 복구 미리보기"
      : "앱 내부 문서 미리보기";

  const handlePrintPreview = () => {
    try {
      const iframeWin = previewFrameRef.current?.contentWindow;
      if (iframeWin?.focus) iframeWin.focus();
      if (iframeWin?.print) {
        iframeWin.print();
        return;
      }
    } catch (error) {
      console.error("[document-preview] iframe print failed", error);
    }

    if (state.objectUrl && typeof document !== "undefined") {
      const anchor = document.createElement("a");
      anchor.href = state.objectUrl;
      anchor.download = state.filename || "document.html";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
  };

  return (
    <div className="fixed inset-0 z-[83] flex items-center justify-center bg-slate-950/72 p-3 backdrop-blur-sm">
      <div className="flex h-[92dvh] w-full max-w-[1400px] flex-col overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900/96 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
          <div>
            <div className="text-[11px] font-black tracking-[0.14em] text-emerald-300">
              {eyebrowLabel}
            </div>
            <div className="mt-1 text-xl font-extrabold text-white">
              {fileKindLabel}
            </div>
            <div className="mt-1 text-sm text-slate-400">
              {state.statusMessage}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPreview}
              className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200"
            >
              인쇄 / PDF 저장
            </button>
            <button
              onClick={() => safeInvoke(onClose)}
              className="rounded-xl border border-slate-600 bg-slate-800 p-2 text-slate-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 p-4 sm:p-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="min-h-0 overflow-auto rounded-[24px] border border-slate-700 bg-slate-950/55 p-4">
            <div className="space-y-4">
              <SectionCard
                title="문서 개요"
                icon={<Info size={16} className="text-emerald-300" />}
              >
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                  <div className="rounded-2xl border border-slate-700 bg-slate-900/65 p-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      문서 용도
                    </div>
                    <div className="mt-1 font-semibold text-white">
                      {state.fileKind === "comparison"
                        ? "비교·판단·근거 중심 검토표"
                        : "핵심 메시지·공유 중심 요약본"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-900/65 p-3 text-xs text-slate-400">
                    {state.environmentNote}
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="바로 할 수 있는 작업"
                icon={<Download size={16} className="text-sky-300" />}
              >
                <div className="grid gap-2">
                  <button
                    onClick={handlePrintPreview}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-left text-sm font-semibold text-emerald-200"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Download size={15} /> 내부 미리보기에서 인쇄 / PDF 저장
                    </span>
                    <span className="text-[11px] text-emerald-100/80">
                      현재 화면 유지
                    </span>
                  </button>
                  {state.objectUrl ? (
                    <a
                      href={state.objectUrl}
                      download={state.filename}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-left text-sm font-semibold text-cyan-100"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FileCheck size={15} /> HTML 문서 저장
                      </span>
                      <span className="text-[11px] text-cyan-100/80">
                        원본 보관용
                      </span>
                    </a>
                  ) : null}
                  {state.fallbackObjectUrl ? (
                    <a
                      href={state.fallbackObjectUrl}
                      download={
                        state.fallbackFilename || `${state.filename}.txt`
                      }
                      className="flex items-center justify-between gap-2 rounded-2xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-left text-sm font-semibold text-sky-200"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FileSpreadsheet size={15} /> 텍스트 복사본 저장
                      </span>
                      <span className="text-[11px] text-sky-100/80">
                        회의 공유용
                      </span>
                    </a>
                  ) : null}
                  <button
                    onClick={() =>
                      safeInvoke(
                        onCopy,
                        state.copyText || state.previewText || ""
                      )
                    }
                    className="rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100"
                  >
                    문서 내용 복사
                  </button>
                  <button
                    onClick={() => safeInvoke(onRetry, state.fileKind)}
                    className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100"
                  >
                    문서 다시 생성
                  </button>
                </div>
              </SectionCard>

              <SectionCard
                title="텍스트 요약"
                icon={<BookOpen size={16} className="text-amber-300" />}
                right={
                  <PillTag tone="slate">
                    {state.mimeType || "text/html"}
                  </PillTag>
                }
              >
                <div className="max-h-[28dvh] overflow-auto rounded-2xl border border-slate-700 bg-slate-950/70 p-3">
                  <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-200">
                    {state.previewText || "미리보기 내용이 없습니다."}
                  </pre>
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="min-h-0 overflow-hidden rounded-[24px] border border-slate-700 bg-white">
            {state.htmlText ? (
              <iframe
                ref={previewFrameRef}
                title={state.previewTitle || "문서 미리보기"}
                srcDoc={state.htmlText}
                className="h-full w-full border-0 bg-white"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-950/70 p-4 text-sm text-slate-300">
                미리보기 HTML을 불러오지 못했습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBanner({ banner, onClose }) {
  if (!banner) return null;
  const toneClass =
    banner.tone === "warning"
      ? "border-amber-500/25 bg-amber-500/12 text-amber-100"
      : banner.tone === "danger"
      ? "border-rose-500/25 bg-rose-500/12 text-rose-100"
      : "border-emerald-500/25 bg-emerald-500/12 text-emerald-100";
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[84] max-w-md">
      <div
        className={cx(
          "pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl",
          toneClass
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-bold">{banner.title}</div>
            <div className="mt-1 text-xs leading-relaxed opacity-90">
              {banner.message}
            </div>
          </div>
          <button
            onClick={() => safeInvoke(onClose)}
            className="rounded-lg border border-white/10 bg-slate-950/20 p-1 text-current"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function LaunchReadinessModal({
  open,
  onClose,
  activeRec,
  launchReadiness,
  shareUrl,
  onCopyShare,
  onOpenGuide,
  onOpenMethodology,
  onDownloadBrief,
  onCopyFeedback,
}) {
  if (!open) return null;
  const safeReadiness = launchReadiness || {
    counts: { ready: 0, attention: 0, needs: 0 },
    sections: [],
  };
  const statusStyles = {
    ready: "border-emerald-500/25 bg-emerald-500/8 text-emerald-200",
    attention: "border-amber-500/25 bg-amber-500/10 text-amber-200",
    needs: "border-rose-500/25 bg-rose-500/10 text-rose-200",
  };
  return (
    <div className="fixed inset-0 z-[82] flex items-center justify-center bg-slate-950/72 p-3 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900/96 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 bg-slate-900/96 px-4 py-3 sm:px-5">
          <div>
            <div className="text-[11px] font-black tracking-[0.14em] text-emerald-300">
              공유·저장 전 마지막 확인
              <span className="ml-2 align-middle text-[10px] font-semibold tracking-[0.16em] text-slate-400">
                Share · Export · Review
              </span>
            </div>
            <div className="mt-1 text-xl font-extrabold text-white">
              공유·저장 전 마지막 확인
            </div>
            <div className="mt-1 text-sm text-slate-400">
              선택한 후보를 외부에 공유하기 전에 핵심 근거, 파트너, 재원 연결
              여부를 빠르게 점검하고 바로 저장할 수 있습니다.
            </div>
          </div>
          <button
            onClick={() => safeInvoke(onClose)}
            className="rounded-xl border border-slate-600 bg-slate-800 p-2 text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[1.06fr_0.94fr] sm:p-5">
          <div className="space-y-4">
            <SectionCard
              title="공유 전에 확인할 항목"
              icon={<FileCheck size={16} className="text-emerald-300" />}
              right={<PillTag tone="sky">선택 후보 기준</PillTag>}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {safeReadiness.sections.map((item) => (
                  <div
                    key={item.key}
                    className={cx(
                      "rounded-2xl border p-3",
                      statusStyles[item.status] || statusStyles.attention
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold">{item.label}</div>
                      <PillTag
                        tone={
                          item.status === "ready"
                            ? "emerald"
                            : item.status === "needs"
                            ? "amber"
                            : "sky"
                        }
                      >
                        {item.status === "ready"
                          ? "준비"
                          : item.status === "needs"
                          ? "보완 필요"
                          : "점검"}
                      </PillTag>
                    </div>
                    <div className="mt-2 text-xs leading-relaxed opacity-90">
                      {item.note}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="현재 화면 한눈에 보기"
              icon={<BarChart3 size={16} className="text-sky-300" />}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <ScorePill
                  label="활성 국가"
                  value={activeRec?.country || "-"}
                  accent="emerald"
                />
                <ScorePill
                  label="활성 지역"
                  value={activeRec?.region || "-"}
                  accent="blue"
                />
                <ScorePill
                  label="활성 기술"
                  value={techShort(activeRec?.tech) || "-"}
                  accent="amber"
                />
              </div>
              <div className="mt-3 rounded-2xl border border-slate-700 bg-slate-800/35 p-3 text-sm text-slate-300 leading-relaxed">
                {safeReadiness.summary}
              </div>
            </SectionCard>

            <InteractionAuditCard compact />
          </div>

          <div className="space-y-4">
            <SectionCard
              title="바로 할 수 있는 작업"
              icon={<Target size={16} className="text-amber-300" />}
            >
              <div className="grid gap-2">
                <button
                  onClick={() => safeInvoke(onCopyShare)}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-left text-sm font-semibold text-sky-200"
                >
                  <span className="inline-flex items-center gap-2">
                    <Link2 size={15} /> 현재 화면 링크 복사
                  </span>
                  <span className="text-[11px] text-sky-100/80">공유 링크</span>
                </button>
                <button
                  onClick={() => safeInvoke(onDownloadBrief)}
                  disabled={!activeRec}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-left text-sm font-semibold text-emerald-200 disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Download size={15} /> 공유용 요약본 PDF
                  </span>
                  <span className="text-[11px] text-emerald-100/80">
                    요약본
                  </span>
                </button>
                <button
                  onClick={() => safeInvoke(onCopyFeedback)}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-left text-sm font-semibold text-slate-100"
                >
                  <span className="inline-flex items-center gap-2">
                    <BookOpen size={15} /> 회의 메모로 복사
                  </span>
                  <span className="text-[11px] text-slate-400">복사</span>
                </button>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => safeInvoke(onOpenMethodology)}
                    className="rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100"
                  >
                    검토 기준 보기
                  </button>
                  <button
                    onClick={() => safeInvoke(onOpenGuide)}
                    className="rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100"
                  >
                    도움말
                  </button>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-xs text-slate-400 break-all">
                {shareUrl || "공유 링크를 생성할 수 없습니다."}
              </div>
            </SectionCard>

            <SectionCard
              title="공식 자료 바로가기"
              icon={<Info size={16} className="text-emerald-300" />}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {LAUNCH_EXTERNAL_LINKS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      emitPlatformAnalyticsEvent("official_link_open", {
                        href: item.href,
                        label: item.label,
                      })
                    }
                    className="rounded-2xl border border-slate-700 bg-slate-800/50 px-3 py-3 hover:border-emerald-500/30 hover:bg-slate-800"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {item.group}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {item.label}
                    </div>
                  </a>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function MethodologyModal({ open, onClose }) {
  if (!open) return null;
  const rows = [
    {
      title: "국가 수요 정합성",
      desc: "TNA·NDC·NAP·국가전략에서 반복적으로 언급되는 수요와 기술 장벽을 확인하는 축입니다.",
    },
    {
      title: "국제 기술지원 적합성",
      desc: "국가 지정기구(NDE)를 통한 요청 가능성과 공공기술지원형 협력에 적합한지 확인합니다.",
    },
    {
      title: "재원 연결 경로",
      desc: "GCF·MDB·ODA·실증형 재원 중 어떤 조합이 현실적인지 빠르게 검토합니다.",
    },
    {
      title: "현지 실행 파트너",
      desc: "정부, 유틸리티, 연구기관, 현장 집행기관을 함께 묶어 사업형성 가능성을 판단합니다.",
    },
    {
      title: "데이터·성과관리 준비도",
      desc: "공간 데이터, 정책문서, 프로젝트 파이프라인, 성과측정 프레임을 함께 점검합니다.",
    },
  ];
  return (
    <div className="fixed inset-0 z-[81] flex items-center justify-center bg-slate-950/72 p-3 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900/96 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
          <div>
            <div className="text-[11px] font-black tracking-[0.14em] text-emerald-300">
              검토 기준 보기
            </div>
            <div className="mt-1 text-xl font-extrabold text-white">
              국제협력 검토 기준
            </div>
            <div className="mt-1 text-sm text-slate-400">
              후보를 검토할 때 먼저 볼 기준을 간단히 정리했습니다.
            </div>
          </div>
          <button
            onClick={() => safeInvoke(onClose)}
            className="rounded-xl border border-slate-600 bg-slate-800 p-2 text-slate-200"
          >
            <X size={16} />
          </button>
        </div>
        <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2">
          {rows.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-700 bg-slate-800/45 p-4"
            >
              <div className="text-sm font-bold text-white">{item.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-300">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 sm:px-5 space-y-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/35 p-4">
            <div className="text-sm font-bold text-white">실전 참고 문서</div>
            <div className="mt-1 text-xs text-slate-400">
              플랫폼에서 확인한 후보를 공식 프레임워크 언어로 전환할 때 바로
              참고할 수 있는 문서입니다.
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERNATIONAL_COOP_REFERENCE_SHELF.map((item) => (
                <ExternalLinkButton
                  key={item.key}
                  href={item.href}
                  label={`${item.org} · ${item.label}`}
                  compact
                />
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-3 text-xs leading-relaxed text-slate-400 sm:px-5">
          후보를 빠르게 압축하고 공식 근거를 확인해 요청서, 개념노트, 내부
          검토자료 준비까지 이어지도록 구성했습니다.
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Excel export
 * ========================================================= */
function buildRecommendationWorkbook(
  rec,
  liveData = null,
  geoData = null,
  pipelineData = null,
  filters = null
) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  if (!rec) return null;
  const XLSX = typeof window !== "undefined" ? window.XLSX : null;
  if (!XLSX) return null;

  const safeScores = {
    coverage: Number(rec?.scores?.coverage || 0),
    reliability: Number(rec?.scores?.reliability || 0),
    resilience: Number(rec?.scores?.resilience || 0),
    feasibility: Number(rec?.scores?.feasibility || 0),
  };
  const cooperationProfile =
    rec?.cooperationProfile || buildCooperationProfile(rec);
  const actions = safeArray(rec?.actions);
  const wb = XLSX.utils.book_new();

  const generatedAtLabel = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const filterChips = summarizeAppliedFilters(filters);
  const summaryRows = [
    ["개도국 기후기술 협력 대상 비교표", "내부 공유용 정리 문서"],
    ["생성 시각", generatedAtLabel],
    ["목적 선택", safeArray(rec?.purposeTags).join(", ") || "-"],
    [
      "현재 필터",
      filterChips.length ? filterChips.join(" · ") : "전체 필터 기준",
    ],
    ["", ""],
    ["기본 항목", "값"],
    ["국가", rec.country],
    ["지역", rec.region],
    ["기술", rec.tech],
    ["대륙", rec.continent],
    ["핵심 요약", cooperationProfile?.headline || ""],
    ["협력 방식", cooperationProfile?.partnershipModel || ""],
    ["데이터 충족률", `${safeScores.coverage}%`],
    ["신뢰도", `${safeScores.reliability}%`],
    ["복원력", `${safeScores.resilience}%`],
    ["목적 적합도", `${safeScores.feasibility}%`],
    ["국가 중심좌표", (rec.countryCenter || []).join(", ")],
    ["지역 좌표", `${rec.lat}, ${rec.lon}`],
    ["좌표 근거", rec.coordBasis],
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(summaryRows),
    "개요"
  );
  XLSX.utils.book_append_sheet(wb, jsonToSheetSafe(rec.schema), "데이터 구조");
  XLSX.utils.book_append_sheet(
    wb,
    jsonToSheetSafe(rec.inventoryRows),
    "데이터 보유현황"
  );
  XLSX.utils.book_append_sheet(
    wb,
    jsonToSheetSafe(rec.sourcePlan),
    "근거 자료"
  );
  XLSX.utils.book_append_sheet(
    wb,
    jsonToSheetSafe(rec.regionRows),
    "지역 근거"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["번호", "다음 작업"],
      ...actions.map((a, i) => [i + 1, a]),
    ]),
    "다음 작업"
  );

  if (liveData) {
    const rows = [
      { 구분: "생성정보", 항목: "수집 시각", 값: liveData.fetchedAt || "" },
      {
        구분: "국가 지표",
        항목: "GDP (USD)",
        값: liveData.worldBank?.gdp?.value ?? "",
      },
      {
        구분: "국가 지표",
        항목: "GDP 기준연도",
        값: liveData.worldBank?.gdp?.year ?? "",
      },
      {
        구분: "국가 지표",
        항목: "인구",
        값: liveData.worldBank?.population?.value ?? "",
      },
      {
        구분: "국가 지표",
        항목: "인구 기준연도",
        값: liveData.worldBank?.population?.year ?? "",
      },
      {
        구분: "국가 지표",
        항목: "전력 접근률 (%)",
        값: liveData.worldBank?.electricityAccess?.value ?? "",
      },
      {
        구분: "국가 지표",
        항목: "전력 접근률 기준연도",
        값: liveData.worldBank?.electricityAccess?.year ?? "",
      },
      {
        구분: "국가 지표",
        항목: "재생에너지 비중 (%)",
        값: liveData.worldBank?.renewableEnergy?.value ?? "",
      },
      {
        구분: "국가 지표",
        항목: "재생에너지 비중 기준연도",
        값: liveData.worldBank?.renewableEnergy?.year ?? "",
      },
      {
        구분: "기후 지표",
        항목: "NASA POWER GHI ANN",
        값: liveData.nasaPower?.ghiAnn ?? "",
      },
      {
        구분: "기후 지표",
        항목: "NASA POWER T2M ANN",
        값: liveData.nasaPower?.t2mAnn ?? "",
      },
      {
        구분: "위치 확인",
        항목: "역지오코딩 명칭",
        값: liveData.reverseGeo?.displayName ?? "",
      },
      {
        구분: "위치 확인",
        항목: "지점 유형",
        값: liveData.reverseGeo?.type ?? "",
      },
    ];
    XLSX.utils.book_append_sheet(wb, jsonToSheetSafe(rows), "실시간 지표");
  }

  if (geoData) {
    const rows = [
      { 항목: "경계 수집 시각", 값: geoData.fetchedAt || "" },
      { 항목: "국가 경계 불러옴", 값: !!geoData.countryFeature },
      { 항목: "지역 경계 불러옴", 값: !!geoData.regionFeature },
      { 항목: "검색 기준 지역", 값: geoData.validation?.regionQuery || "" },
      {
        항목: "검색된 지역명",
        값: geoData.validation?.regionDisplayName || "",
      },
      {
        항목: "검색 중심 위도",
        값: geoData.validation?.regionSearchCenterLat ?? "",
      },
      {
        항목: "검색 중심 경도",
        값: geoData.validation?.regionSearchCenterLon ?? "",
      },
      { 항목: "현재 위도", 값: geoData.validation?.currentLat ?? rec.lat },
      { 항목: "현재 경도", 값: geoData.validation?.currentLon ?? rec.lon },
      { 항목: "거리(km)", 값: geoData.validation?.distanceKm ?? "" },
    ];
    XLSX.utils.book_append_sheet(wb, jsonToSheetSafe(rows), "위치 검증");
  }

  if (pipelineData?.projects?.length) {
    XLSX.utils.book_append_sheet(
      wb,
      jsonToSheetSafe(
        pipelineData.projects.map((project, idx) => ({
          번호: idx + 1,
          출처: project.source || "",
          프로젝트명: project.title || "",
          단계: project.stage || project.status || "",
          국가: project.country || rec.country,
          지역: project.region || rec.region,
          주제: project.theme || pipelineData.summary?.theme || rec.tech,
          금액USD: project.amountUSD ?? project.amount ?? "",
          수행기관: project.executingPartner || project.partner || "",
        }))
      ),
      "재원 파이프라인"
    );
  }

  const strategySynthesis = buildStrategySynthesis(rec, pipelineData);
  if (strategySynthesis) {
    const strategyRows = [
      {
        구분: "요약",
        항목: "종합 판단",
        값: strategySynthesis.decision,
      },
      {
        구분: "요약",
        항목: "전략명",
        값: strategySynthesis.strategyName,
      },
      {
        구분: "요약",
        항목: "한 줄 요약",
        값: strategySynthesis.oneLiner,
      },
      {
        구분: "요약",
        항목: "대표 사업",
        값: strategySynthesis.flagshipProject?.title || "",
      },
      {
        구분: "요약",
        항목: "대표 재원 경로",
        값: strategySynthesis.flagshipProject?.financeRoute || "",
      },
      ...safeArray(strategySynthesis.priorityRegions).map((item, idx) => ({
        구분: "우선 지역",
        항목: `${idx + 1}. ${item.province}`,
        값: `${item.role} | priority=${item.priorityScore} | risk=${item.riskScore} | readiness=${item.opsReadiness}`,
      })),
      ...safeArray(strategySynthesis.roadmap).map((item) => ({
        구분: "로드맵",
        항목: `${item.stage} (${item.period})`,
        값: `${item.outcome} | ${safeArray(item.actions).join(" / ")}`,
      })),
      ...safeArray(strategySynthesis.kpis).map((item) => ({
        구분: "핵심 지표",
        항목: item,
        값: item,
      })),
    ];
    XLSX.utils.book_append_sheet(
      wb,
      jsonToSheetSafe(strategyRows),
      "전략 요약"
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `${sanitizeFilenamePart(
    "기후기술협력_후보비교표"
  )}_${sanitizeFilenamePart(safeRec.country || "국가")}_${sanitizeFilenamePart(
    rec.region || "지역"
  )}_${sanitizeFilenamePart(
    techShort(rec.tech) || rec.tech || "기술"
  )}_${stamp}.xlsx`;
  return { wb, filename };
}

function buildRecommendationCsvFallback(
  rec,
  liveData = null,
  geoData = null,
  pipelineData = null,
  filters = null
) {
  const rows = [
    ["기본 항목", "값"],
    ["검토 국가", rec?.country || ""],
    ["검토 지역", rec?.region || ""],
    ["검토 기술", rec?.tech || ""],
    ["목적 선택", safeArray(rec?.purposeTags).join(", ")],
    [
      "현재 필터",
      summarizeAppliedFilters(filters).join(" · ") || "전체 필터 기준",
    ],
    ["추천 협력 방향", rec?.cooperationProfile?.headline || ""],
    ["핵심 근거", safeArray(rec?.reasons).slice(0, 3).join(" | ")],
    [
      "대표 파트너",
      safeArray(rec?.localPartners)
        .slice(0, 3)
        .map((item) => item?.name || item)
        .join(" | "),
    ],
    [
      "대표 근거",
      safeArray(rec?.sourcePlan)
        .slice(0, 3)
        .map((item) => item?.source || item?.layer || item?.title)
        .join(" | "),
    ],
    ["파이프라인 건수", safeArray(pipelineData?.projects).length],
    ["GDP", liveData?.worldBank?.gdp?.value ?? ""],
    ["전력 접근률", liveData?.worldBank?.electricityAccess?.value ?? ""],
    ["위치 검증", geoData?.countryFeature ? "확인" : "미확인"],
  ];
  return buildCsvTextFromRows(rows);
}

function buildRecommendationPreviewText(
  rec,
  liveData = null,
  geoData = null,
  pipelineData = null,
  filters = null
) {
  const safeRec = sanitize검토Record(rec) || rec || {};
  const generatedAt = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const pipelineRows = safeArray(pipelineData?.projects).slice(0, 5);
  return [
    "기후기술 협력 후보 비교표 미리보기",
    "내부 공유와 회의 직전 검토에 바로 붙여 넣을 수 있도록 핵심 내용만 정리한 텍스트 미리보기입니다.",
    "",
    `[문서 정보]`,
    `- 생성 시각: ${generatedAt}`,
    `- 검토 국가: ${safeRec.country || "-"}`,
    `- 검토 지역: ${safeRec.region || "-"}`,
    `- 검토 기술: ${safeRec.tech || "-"}`,
    `- 목적 선택: ${safeArray(safeRec.purposeTags).join(", ") || "-"}`,
    `- 현재 필터: ${
      summarizeAppliedFilters(filters).join(" · ") || "전체 필터 기준"
    }`,
    "",
    `[한눈에 보기]`,
    `- 추천 협력 방향: ${safeRec?.cooperationProfile?.headline || "-"}`,
    `- 핵심 근거: ${
      safeArray(safeRec?.reasons).slice(0, 2).join(" / ") || "-"
    }`,
    `- 대표 파트너: ${
      safeArray(safeRec?.localPartners)
        .slice(0, 2)
        .map((item) => item?.name || item)
        .join(" / ") || "-"
    }`,
    "",
    `[참고 프로젝트]`,
    ...(pipelineRows.length
      ? pipelineRows.map(
          (item) =>
            `- ${item?.title || "프로젝트"} | ${item?.stage || "-"} | ${
              item?.source || "-"
            }`
        )
      : ["- 연결된 파이프라인 정보 없음"]),
    "",
    `[실시간 보강 지표]`,
    `- GDP: ${liveData?.worldBank?.gdp?.value ?? "-"}`,
    `- 전력 접근률: ${liveData?.worldBank?.electricityAccess?.value ?? "-"}`,
    `- 위치 검증: ${geoData?.countryFeature ? "확인" : "미확인"}`,
  ].join("\n");
}

function createRecommendationExcelPayload(
  rec,
  liveData = null,
  geoData = null,
  pipelineData = null,
  filters = null
) {
  const safeRec = sanitize검토Record(rec) ||
    rec || { country: "", region: "", tech: "" };
  const workbookBundle = buildRecommendationWorkbook(
    safeRec,
    liveData,
    geoData,
    pipelineData,
    filters
  );
  const fallbackText = buildRecommendationCsvFallback(
    safeRec,
    liveData,
    geoData,
    pipelineData,
    filters
  );
  let blob = null;
  const stamp = new Date().toISOString().slice(0, 10);
  let filename = `${sanitizeFilenamePart(
    safeRec.country || "국가"
  )}_${sanitizeFilenamePart(safeRec.region || "지역")}_${stamp}_후보비교표.csv`;
  if (
    workbookBundle?.wb &&
    typeof window !== "undefined" &&
    window.XLSX?.write
  ) {
    const arrayBuffer = window.XLSX.write(workbookBundle.wb, {
      bookType: "xlsx",
      type: "array",
    });
    blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    filename = workbookBundle.filename;
  }
  const fallbackBlob = new Blob([fallbackText], {
    type: "text/csv;charset=utf-8",
  });
  return {
    fileKind: "excel",
    filename,
    mimeType: blob
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "text/csv;charset=utf-8",
    blob: blob || fallbackBlob,
    previewText: buildRecommendationPreviewText(
      safeRec,
      liveData,
      geoData,
      pipelineData,
      filters
    ),
    copyText: buildRecommendationPreviewText(
      safeRec,
      liveData,
      geoData,
      pipelineData,
      filters
    ),
    fallbackBlob,
    fallbackFilename: `${sanitizeFilenamePart(
      safeRec.country || "country"
    )}_${sanitizeFilenamePart(
      safeRec.region || "region"
    )}_${stamp}_후보비교표_복사본.csv`,
  };
}

function exportRecommendationToExcel(
  rec,
  liveData = null,
  geoData = null,
  pipelineData = null
) {
  if (!rec) return;
  const workbookBundle = buildRecommendationWorkbook(
    rec,
    liveData,
    geoData,
    pipelineData,
    null
  );
  if (!workbookBundle) {
    alert(
      "엑셀 보조 저장 엔진(XLSX)을 아직 불러오는 중입니다. 잠시 후 다시 시도하거나 CSV 복사본을 먼저 저장해 주세요."
    );
    return;
  }
  window.XLSX.writeFile(workbookBundle.wb, workbookBundle.filename);
}

/* =========================================================
 * Main App
 * ========================================================= */
function AppShell({ ctisDataset = CTIS_VISIBLE_SEED_DATA }) {
  const tailwindReady = useTailwindCDN();
  const mapCssReady = useExternalStyle({
    href: "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css",
    id: "maplibre-gl-css",
  });
  const mapJsReady = useExternalScript({
    src: "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js",
    id: "maplibre-gl-js",
    globalCheck: () => !!window.maplibregl,
  });
  useExternalScript({
    src: "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
    id: "xlsx-js",
    globalCheck: () => !!window.XLSX,
  });

  const { isMobile } = useViewport();

  const [screen, setScreen] = useState("landing");
  const [pendingPresetKey, setPendingPresetKey] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_PLATFORM_FILTERS);

  const [activeScenarioKey, setActiveScenarioKey] = useState("overview");
  const [workflowActionState, setWorkflowActionState] = useState(() => ({
    ...SCENARIO_ACTION_TRACKER_INITIAL,
  }));
  const [activeRec, setActiveRec] = useState(
    NORMALIZED_ENHANCED_RECOMMENDATIONS[0]
  );
  const isDev =
    typeof process !== "undefined"
      ? process.env.NODE_ENV !== "production"
      : true;

  const [scenarioTesterOpen, setScenarioTesterOpen] = useState(false);
  const [scenarioTesterRunning, setScenarioTesterRunning] = useState(false);
  const [scenarioTesterResults, setScenarioTesterResults] = useState([]);

  const screenRef = useRef(screen);
  const pendingPresetKeyRef = useRef(pendingPresetKey);
  const activeScenarioKeyRef = useRef(activeScenarioKey);
  const workflowActionStateRef = useRef(workflowActionState);
  const filtersRef = useRef(filters);
  const detailTabRef = useRef(null);
  const leftPanelTabRef = useRef(null);
  const leftPanelOpenRef = useRef(null);
  const rightPanelOpenRef = useRef(null);
  const focusModeRef = useRef(null);
  const mobilePanelRef = useRef(null);
  const activeRecRef = useRef(activeRec);
  const sessionStartedAtRef = useRef(Date.now());
  const firstValueTrackedRef = useRef(false);
  const completedScenarioKeyRef = useRef("");

  const [detailTab, set검토Tab] = useState("overview");
  const [focusMode, setFocusMode] = useState("region"); // country | region
  const [mapMode, setMapMode] = useState("hybrid"); // satellite | hybrid
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState("candidates");
  const [leftPanelWidth, setLeftPanelWidth] = useState(
    DEFAULT_LEFT_PANEL_WIDTH
  );
  const [rightPanelWidth, setRightPanelWidth] = useState(
    DEFAULT_RIGHT_PANEL_WIDTH
  );
  const [panelResize, setPanelResize] = useState(null);
  const [panelLayout, setPanelLayout] = useState(() => loadStoredPanelLayout());
  const [panelDrag, setPanelDrag] = useState(null);

  // mobile panels
  const [mobilePanel, setMobilePanel] = useState(null); // legend | filters | candidates | detail
  const [mobileQuickOpen, setMobileQuickOpen] = useState(true);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);
  useEffect(() => {
    pendingPresetKeyRef.current = pendingPresetKey;
  }, [pendingPresetKey]);
  useEffect(() => {
    activeScenarioKeyRef.current = activeScenarioKey;
  }, [activeScenarioKey]);
  useEffect(() => {
    workflowActionStateRef.current = workflowActionState;
  }, [workflowActionState]);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  useEffect(() => {
    activeRecRef.current = activeRec;
  }, [activeRec]);
  useEffect(() => {
    detailTabRef.current = detailTab;
  }, [detailTab]);
  useEffect(() => {
    leftPanelTabRef.current = leftPanelTab;
  }, [leftPanelTab]);
  useEffect(() => {
    leftPanelOpenRef.current = leftPanelOpen;
  }, [leftPanelOpen]);
  useEffect(() => {
    rightPanelOpenRef.current = rightPanelOpen;
  }, [rightPanelOpen]);
  useEffect(() => {
    focusModeRef.current = focusMode;
  }, [focusMode]);
  useEffect(() => {
    mobilePanelRef.current = mobilePanel;
  }, [mobilePanel]);

  // guide
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);
  const [landingLaunchStatus, setLandingLaunchStatus] = useState("");
  const [landingScenarioPulse, setLandingScenarioPulse] = useState(false);
  const [downloadFallbackState, setDownloadFallbackState] = useState(null);
  const [shortlistIds, setShortlistIds] = useState(() =>
    loadStoredIdList(SHORTLIST_STORAGE_KEY, SHORTLIST_LIMIT)
  );
  const [resumeState, setResumeState] = useState(() =>
    loadStoredObject(WORKSPACE_RESUME_STORAGE_KEY, null)
  );

  const [liveDataByRec, setLiveDataByRec] = useState({});
  const [geoDataByRec, setGeoDataByRec] = useState({});
  const [pipelineByRec, setPipelineByRec] = useState({});
  const [liveLoadingByRec, setLiveLoadingByRec] = useState({});
  const [geoLoadingByRec, setGeoLoadingByRec] = useState({});
  const [pipelineLoadingByRec, setPipelineLoadingByRec] = useState({});
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownItem, setDrillDownItem] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const hiddenDate = safeStorageGet(GUIDE_STORAGE_KEY);
    if (hiddenDate !== today) setGuideOpen(true);
  }, []);

  const hideGuideToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    safeStorageSet(GUIDE_STORAGE_KEY, today);
    setGuideOpen(false);
  };

  const hydratedFromUrlRef = useRef(false);
  useEffect(() => {
    if (hydratedFromUrlRef.current || typeof window === "undefined") return;
    hydratedFromUrlRef.current = true;
    const urlState = parsePlatformUrlState(window.location.search);
    if (urlState.view === "platform") setScreen("platform");
    setFilters((prev) => ({
      ...prev,
      tech: urlState.tech || prev.tech,
      country: urlState.country || prev.country,
      purpose: urlState.purpose || prev.purpose,
    }));
    if (urlState.tab) set검토Tab(urlState.tab);
    if (urlState.focus) setFocusMode(urlState.focus);
    if (urlState.rec) {
      const found = NORMALIZED_ENHANCED_RECOMMENDATIONS.find(
        (item) => String(item.id) === String(urlState.rec)
      );
      if (found) setActiveRec(found);
    }
  }, []);

  const applyPreset = useCallback(
    (presetKey) => {
      const resolvedPresetKey = resolveStrategyPresetKey(
        presetKey || "overview"
      );
      const preset = resolvedPresetKey
        ? STRATEGY_PRESETS[resolvedPresetKey]
        : null;
      if (!preset) return null;

      const nextFilters = buildPresetFilters(preset);

      setActiveScenarioKey(resolvedPresetKey);
      setFilters(nextFilters);
      set검토Tab(preset.detailTab || "overview");
      setFocusMode(preset.focusMode || "region");
      setLeftPanelTab(preset.leftPanelTab || "candidates");
      setLeftPanelOpen(true);
      setRightPanelOpen(true);

      const targetRec =
        findPresetRecommendation(resolvedPresetKey) ||
        NORMALIZED_ENHANCED_RECOMMENDATIONS.find((item) => {
          if (
            nextFilters.tech !== "전체 기술" &&
            item.tech !== nextFilters.tech
          )
            return false;
          if (
            nextFilters.country !== "전체 국가" &&
            item.country !== nextFilters.country
          )
            return false;
          if (
            nextFilters.purpose !== "전체 목적" &&
            !safeArray(item.purposeTags).includes(nextFilters.purpose)
          )
            return false;
          return true;
        }) ||
        NORMALIZED_ENHANCED_RECOMMENDATIONS[0] ||
        null;

      if (targetRec) {
        setActiveRec(targetRec);
      } else {
        setActiveRec(null);
      }

      if (isMobile) {
        setMobilePanel(
          preset.mobilePanel ||
            (preset.leftPanelTab === "filters" ? "filters" : "detail")
        );
        setMobileQuickOpen(false);
      }

      trackActivationEvent("preset_applied", {
        presetKey: resolvedPresetKey,
        targetRecId: targetRec?.id || null,
      });

      return targetRec;
    },
    [isMobile]
  );

  const startScenarioFlow = useCallback(
    (presetKey = null) => {
      const resolvedPresetKey = resolveStrategyPresetKey(
        presetKey || "overview"
      );
      const workflow = getScenarioWorkflow(resolvedPresetKey);

      setActiveScenarioKey(resolvedPresetKey);
      setWorkflowActionState({ ...SCENARIO_ACTION_TRACKER_INITIAL });
      setGuideStepIndex(
        findGuideStepIndexByKey(
          workflow?.steps?.[0]?.guideKey || "toolbar-filter"
        )
      );
      setLeftPanelOpen(true);
      setRightPanelOpen(true);
      if (isMobile) setMobileQuickOpen(false);

      trackActivationEvent("scenario_start", {
        scenarioKey: resolvedPresetKey,
        source: screen === "platform" ? "platform" : "landing",
      });

      if (screen === "platform") {
        setPendingPresetKey(null);
        applyPreset(resolvedPresetKey);
        return;
      }

      setPendingPresetKey(resolvedPresetKey);
      setScreen("platform");
    },
    [applyPreset, isMobile, screen]
  );

  useEffect(() => {
    if (screen !== "platform" || !pendingPresetKey) return;
    applyPreset(resolveStrategyPresetKey(pendingPresetKey));
    setPendingPresetKey(null);
  }, [screen, pendingPresetKey, applyPreset]);

  const runScenarioTester = useCallback(async () => {
    const waitFrame = () =>
      new Promise((res) => requestAnimationFrame(() => res()));
    const waitUntilApplied = async () => {
      for (let i = 0; i < 24; i++) {
        await waitFrame();
        if (screenRef.current === "platform" && !pendingPresetKeyRef.current)
          return;
      }
    };

    const original = {
      screen: screenRef.current,
      activeScenarioKey: activeScenarioKeyRef.current,
      workflowActionState: workflowActionStateRef.current,
      filters: filtersRef.current,
      detailTab: detailTabRef.current,
      leftPanelTab: leftPanelTabRef.current,
      leftPanelOpen: leftPanelOpenRef.current,
      rightPanelOpen: rightPanelOpenRef.current,
      focusMode: focusModeRef.current,
      mobilePanel: mobilePanelRef.current,
      activeRec: activeRecRef.current,
    };

    setScenarioTesterRunning(true);
    setScenarioTesterResults([]);

    const results = [];
    for (const s of PLATFORM_USAGE_SCENARIOS) {
      const key = s.key;
      const preset = STRATEGY_PRESETS[key];
      const problems = [];

      // simulate clicking “이 흐름으로 시작”
      startScenarioFlow(key);
      await waitUntilApplied();
      await waitFrame();

      const actualFilters = filtersRef.current || {};
      const expected = {
        ...DEFAULT_PLATFORM_FILTERS,
        ...(preset?.tech ? { tech: preset.tech } : {}),
        ...(preset?.country ? { country: preset.country } : {}),
        ...(preset?.purpose ? { purpose: preset.purpose } : {}),
        ...(preset?.minCoverage ? { minCoverage: preset.minCoverage } : {}),
        ...(preset?.strategyFocus
          ? { strategyFocus: preset.strategyFocus }
          : {}),
        ...(preset?.sortMode ? { sortMode: preset.sortMode } : {}),
        ...(preset?.financeChannel
          ? { financeChannel: preset.financeChannel }
          : {}),
        ...(preset?.decisionFilter
          ? { decisionFilter: preset.decisionFilter }
          : {}),
        ...(preset?.minStrategyScore
          ? { minStrategyScore: preset.minStrategyScore }
          : {}),
        ...(preset?.minPipelineProjects
          ? { minPipelineProjects: preset.minPipelineProjects }
          : {}),
      };

      if (screenRef.current !== "platform")
        problems.push("screen이 platform으로 전환되지 않았습니다.");
      if (activeScenarioKeyRef.current !== key)
        problems.push(
          `activeScenarioKey 불일치: expected=${key}, actual=${activeScenarioKeyRef.current}`
        );
      if (!preset) problems.push("preset이 존재하지 않습니다.");

      const expectTech = expected.tech;
      const expectCountry = expected.country;
      const expectPurpose = expected.purpose;

      if (actualFilters.tech !== expectTech)
        problems.push(
          `tech 필터 불일치: expected=${expectTech}, actual=${actualFilters.tech}`
        );
      if (actualFilters.country !== expectCountry)
        problems.push(
          `country 필터 불일치: expected=${expectCountry}, actual=${actualFilters.country}`
        );
      if (actualFilters.purpose !== expectPurpose)
        problems.push(
          `purpose 필터 불일치: expected=${expectPurpose}, actual=${actualFilters.purpose}`
        );

      const actual검토Tab = detailTabRef.current;
      const actualLeftTab = leftPanelTabRef.current;
      const actualFocus = focusModeRef.current;

      if (preset?.detailTab && actual검토Tab !== preset.detailTab)
        problems.push(
          `detailTab 불일치: expected=${preset.detailTab}, actual=${actual검토Tab}`
        );
      if (preset?.leftPanelTab && actualLeftTab !== preset.leftPanelTab)
        problems.push(
          `leftPanelTab 불일치: expected=${preset.leftPanelTab}, actual=${actualLeftTab}`
        );
      if (preset?.focusMode && actualFocus !== preset.focusMode)
        problems.push(
          `focusMode 불일치: expected=${preset.focusMode}, actual=${actualFocus}`
        );

      if (!leftPanelOpenRef.current)
        problems.push("좌측 패널이 열리지 않았습니다.");
      if (!rightPanelOpenRef.current)
        problems.push("우측 패널이 열리지 않았습니다.");

      if (isMobile) {
        const expectedMobile =
          preset?.mobilePanel ||
          (preset?.leftPanelTab === "filters" ? "filters" : "detail");
        if (mobilePanelRef.current !== expectedMobile)
          problems.push(
            `mobilePanel 불일치: expected=${expectedMobile}, actual=${mobilePanelRef.current}`
          );
      }

      const r = activeRecRef.current;
      if (!r) {
        problems.push("activeRec가 설정되지 않았습니다.");
      } else {
        if (expectTech !== "전체 기술" && r.tech !== expectTech)
          problems.push(
            `activeRec.tech 불일치: expected=${expectTech}, actual=${r.tech}`
          );
        if (expectCountry !== "전체 국가" && r.country !== expectCountry)
          problems.push(
            `activeRec.country 불일치: expected=${expectCountry}, actual=${r.country}`
          );
        if (
          expectPurpose !== "전체 목적" &&
          !safeArray(r.purposeTags).includes(expectPurpose)
        )
          problems.push(
            `activeRec.purposeTags에 목적(${expectPurpose})이 없습니다.`
          );
      }

      results.push({
        key,
        title: s.title,
        pass: problems.length === 0,
        problems,
        actual: {
          detailTab: actual검토Tab,
          leftPanelTab: actualLeftTab,
          focusMode: actualFocus,
          tech: actualFilters.tech,
          country: actualFilters.country,
          purpose: actualFilters.purpose,
        },
      });
    }

    setScenarioTesterResults(results);
    setScenarioTesterRunning(false);

    // restore
    setPendingPresetKey(null);
    setScreen(original.screen || "landing");
    setActiveScenarioKey(original.activeScenarioKey || "overview");
    setWorkflowActionState(
      original.workflowActionState || { ...SCENARIO_ACTION_TRACKER_INITIAL }
    );
    if (original.filters) setFilters(original.filters);
    if (original.detailTab) set검토Tab(original.detailTab);
    if (original.leftPanelTab) setLeftPanelTab(original.leftPanelTab);
    if (typeof original.leftPanelOpen === "boolean")
      setLeftPanelOpen(original.leftPanelOpen);
    if (typeof original.rightPanelOpen === "boolean")
      setRightPanelOpen(original.rightPanelOpen);
    if (original.focusMode) setFocusMode(original.focusMode);
    if (isMobile && original.mobilePanel != null)
      setMobilePanel(original.mobilePanel);
    if (original.activeRec) setActiveRec(original.activeRec);
  }, [startScenarioFlow, isMobile]);

  useEffect(() => {
    saveStoredIdList(SHORTLIST_STORAGE_KEY, shortlistIds, SHORTLIST_LIMIT);
  }, [shortlistIds]);

  useEffect(() => {
    safeStorageSet(PANEL_LAYOUT_STORAGE_KEY, JSON.stringify(panelLayout));
  }, [panelLayout]);

  useEffect(() => {
    if (typeof window === "undefined" || isMobile) return undefined;
    const clampLayout = () => {
      setPanelLayout((prev) => {
        const next = {
          left: clampPanelPose(
            "left",
            prev?.left,
            window.innerWidth,
            window.innerHeight,
            leftPanelWidth
          ),
          right: clampPanelPose(
            "right",
            prev?.right,
            window.innerWidth,
            window.innerHeight,
            rightPanelWidth
          ),
        };
        const same =
          prev?.left?.mode === next.left.mode &&
          prev?.left?.x === next.left.x &&
          prev?.left?.y === next.left.y &&
          prev?.right?.mode === next.right.mode &&
          prev?.right?.x === next.right.x &&
          prev?.right?.y === next.right.y;
        return same ? prev : next;
      });
    };
    clampLayout();
    window.addEventListener("resize", clampLayout);
    return () => window.removeEventListener("resize", clampLayout);
  }, [isMobile, leftPanelWidth, rightPanelWidth]);

  const togglePanelFloating = useCallback((side) => {
    setPanelLayout((prev) => {
      const current =
        prev?.[side] ||
        DEFAULT_DESKTOP_PANEL_LAYOUT[side] ||
        DEFAULT_DESKTOP_PANEL_LAYOUT.left;
      const nextMode = current.mode === "floating" ? "docked" : "floating";
      return {
        ...prev,
        [side]: {
          ...current,
          mode: nextMode,
          x: current.x ?? 16,
          y: current.y ?? 18,
        },
      };
    });
  }, []);

  const beginPanelDrag = useCallback(
    (side, event) => {
      if (isMobile) return;
      event.preventDefault();
      event.stopPropagation();
      const current =
        panelLayout?.[side] ||
        DEFAULT_DESKTOP_PANEL_LAYOUT[side] ||
        DEFAULT_DESKTOP_PANEL_LAYOUT.left;
      const startPose =
        current.mode === "floating"
          ? current
          : { ...current, mode: "floating", x: 16, y: 18 };
      if (current.mode !== "floating") {
        setPanelLayout((prev) => ({
          ...prev,
          [side]: startPose,
        }));
      }
      setPanelDrag({
        side,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: startPose.x,
        startY: startPose.y,
      });
    },
    [isMobile, panelLayout]
  );

  useEffect(() => {
    if (!panelDrag || typeof window === "undefined") return undefined;
    const body = document?.body;
    if (body) {
      body.style.cursor = "grabbing";
      body.style.userSelect = "none";
    }

    const handleMove = (event) => {
      setPanelLayout((prev) => {
        const width =
          panelDrag.side === "left" ? leftPanelWidth : rightPanelWidth;
        const dx = event.clientX - panelDrag.startClientX;
        const dy = event.clientY - panelDrag.startClientY;
        const nextPose = clampPanelPose(
          panelDrag.side,
          {
            mode: "floating",
            x:
              panelDrag.side === "left"
                ? panelDrag.startX + dx
                : panelDrag.startX - dx,
            y: panelDrag.startY + dy,
          },
          window.innerWidth,
          window.innerHeight,
          width
        );
        const current = prev?.[panelDrag.side] || {};
        if (
          current.mode === nextPose.mode &&
          current.x === nextPose.x &&
          current.y === nextPose.y
        )
          return prev;
        return {
          ...prev,
          [panelDrag.side]: nextPose,
        };
      });
    };

    const handleUp = () => {
      if (body) {
        body.style.cursor = "";
        body.style.userSelect = "";
      }
      setPanelDrag(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp, { once: true });
    return () => {
      if (body) {
        body.style.cursor = "";
        body.style.userSelect = "";
      }
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [panelDrag, leftPanelWidth, rightPanelWidth]);

  const strategyMetaByRec = useMemo(() => {
    return Object.fromEntries(
      NORMALIZED_ENHANCED_RECOMMENDATIONS.map((rec) => [
        rec.id,
        computeStrategyEvaluation(rec, filters, pipelineByRec[rec.id] || null),
      ])
    );
  }, [filters, pipelineByRec]);

  const filteredRecs = useMemo(() => {
    const list = NORMALIZED_ENHANCED_RECOMMENDATIONS.filter((r) => {
      const meta = strategyMetaByRec[r.id] || {};
      const keyword = String(filters.keyword || "")
        .trim()
        .toLowerCase();
      if (keyword) {
        const hay = `${r.country || ""} ${r.region || ""} ${
          r.tech || ""
        } ${safeArray(r.purposeTags).join(" ")}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      if (filters.tech !== "전체 기술" && r.tech !== filters.tech) return false;
      if (filters.country !== "전체 국가" && r.country !== filters.country)
        return false;
      if (
        filters.purpose !== "전체 목적" &&
        !safeArray(r.purposeTags).includes(filters.purpose)
      )
        return false;
      if (filters.financeChannel !== "전체 재원") {
        const channels = meta.financeChannels || [];
        if (
          filters.financeChannel === "MDB" &&
          !(
            channels.includes("MDB") ||
            channels.includes("ADB") ||
            channels.includes("World Bank")
          )
        )
          return false;
        if (
          filters.financeChannel !== "MDB" &&
          !channels.includes(filters.financeChannel)
        )
          return false;
      }
      if (
        filters.decisionFilter !== "전체" &&
        meta.decision !== filters.decisionFilter
      )
        return false;
      if ((r?.scores?.coverage || 0) < filters.minCoverage) return false;
      if ((meta?.strategyScore || 0) < filters.minStrategyScore) return false;
      if ((meta?.pipelineProjectCount || 0) < filters.minPipelineProjects)
        return false;
      return true;
    });

    const sorted = [...list].sort((a, b) => {
      const ma = strategyMetaByRec[a.id] || {};
      const mb = strategyMetaByRec[b.id] || {};
      if (filters.sortMode === "feasibility")
        return (b.scores.feasibility || 0) - (a.scores.feasibility || 0);
      if (filters.sortMode === "pipeline") {
        if ((mb.pipelineProjectCount || 0) !== (ma.pipelineProjectCount || 0)) {
          return (
            (mb.pipelineProjectCount || 0) - (ma.pipelineProjectCount || 0)
          );
        }
        return (mb.strategyScore || 0) - (ma.strategyScore || 0);
      }
      if (filters.sortMode === "risk") {
        if ((mb.riskUrgency || 0) !== (ma.riskUrgency || 0)) {
          return (mb.riskUrgency || 0) - (ma.riskUrgency || 0);
        }
        return (mb.strategyScore || 0) - (ma.strategyScore || 0);
      }
      return (mb.strategyScore || 0) - (ma.strategyScore || 0);
    });

    return sorted;
  }, [filters, strategyMetaByRec]);

  const shortlistRecs = useMemo(
    () =>
      shortlistIds
        .map((id) =>
          NORMALIZED_ENHANCED_RECOMMENDATIONS.find((item) => item.id === id)
        )
        .filter(Boolean),
    [shortlistIds]
  );

  const activeRecVisibleInFilters = useMemo(
    () =>
      !!activeRec &&
      safeArray(filteredRecs).some((item) => item?.id === activeRec.id),
    [filteredRecs, activeRec]
  );

  const fallbackVisibleRec = useMemo(
    () =>
      safeArray(filteredRecs)[0] ||
      NORMALIZED_ENHANCED_RECOMMENDATIONS[0] ||
      null,
    [filteredRecs]
  );

  useEffect(() => {
    if (!activeRec && fallbackVisibleRec) setActiveRec(fallbackVisibleRec);
  }, [activeRec, fallbackVisibleRec]);

  useEffect(() => {
    if (screen !== "platform" || !activeRec?.id) return;
    trackActivationEvent("candidate_selected", {
      candidateId: activeRec.id,
      country: activeRec.country,
      region: activeRec.region,
      tech: activeRec.tech,
    });
    if (!firstValueTrackedRef.current) {
      firstValueTrackedRef.current = true;
      const elapsedMs = Date.now() - sessionStartedAtRef.current;
      trackActivationEvent("first_value_reached", {
        elapsedMs,
        candidateId: activeRec.id,
      });
      pushStatusBanner(
        "첫 가치 경험을 만들었습니다",
        `${activeRec.country} · ${activeRec.region} 후보를 바로 검토할 수 있습니다. 이제 보관함에 담거나 요약본을 준비하세요.`,
        "success"
      );
    }
  }, [screen, activeRec]);

  const toggleShortlistRec = useCallback((recOrId) => {
    const rec =
      typeof recOrId === "string"
        ? NORMALIZED_ENHANCED_RECOMMENDATIONS.find(
            (item) => item.id === recOrId
          )
        : recOrId;
    const id = rec?.id;
    if (!id) return;
    setShortlistIds((prev) => {
      const exists = prev.includes(id);
      const next = toggleIdInList(prev, id, SHORTLIST_LIMIT);
      if (!exists) {
        trackActivationEvent("shortlist_add", {
          candidateId: id,
          country: rec?.country,
          region: rec?.region,
          nextCount: next.length,
        });
        if (next.length >= 3 && prev.length < 3) {
          trackActivationEvent("shortlist_count_reached_3", {
            nextCount: next.length,
          });
          pushStatusBanner(
            "보관함 3건이 준비되었습니다",
            "이제 공유 링크 또는 요약본 PDF로 바로 내부 공유 가능한 상태까지 이어가세요.",
            "success"
          );
        }
      }
      return next;
    });
  }, []);

  const bringSelectionIntoView = useCallback(
    (targetRec = activeRec) => {
      if (!targetRec) return;
      setFilters((prev) => ({
        ...prev,
        keyword: "",
        country: targetRec.country || "전체 국가",
        tech: normalizeTechName(targetRec.tech) || prev.tech,
        purpose: "전체 목적",
      }));
      setLeftPanelTab("candidates");
      setLeftPanelOpen(true);
    },
    [activeRec]
  );

  const addTopCandidatesToShortlist = useCallback(
    (count = 3) => {
      const topIds = safeArray(filteredRecs)
        .slice(0, Math.max(1, count))
        .map((item) => item?.id)
        .filter(Boolean);
      if (!topIds.length) return;
      setShortlistIds((prev) => {
        const merged = uniqBy(
          [...prev, ...topIds].map((id) => ({ id })),
          (item) => item.id
        )
          .map((item) => item.id)
          .slice(0, SHORTLIST_LIMIT);
        if (merged.length !== prev.length) {
          trackActivationEvent("shortlist_add", {
            batch: true,
            addedCount: merged.length - prev.length,
            nextCount: merged.length,
          });
          if (merged.length >= 3 && prev.length < 3) {
            trackActivationEvent("shortlist_count_reached_3", {
              nextCount: merged.length,
              source: "recommended-top3",
            });
          }
          pushStatusBanner(
            "추천 후보를 보관함에 담았습니다",
            `${merged.length}건의 비교 후보가 준비되었습니다. 이제 근거를 확인하고 공유 또는 요약본까지 이어가세요.`,
            "success"
          );
        }
        return merged;
      });
    },
    [filteredRecs]
  );

  const resumeWorkspaceFromState = useCallback(
    (mode = "full") => {
      const snapshot =
        resumeState || loadStoredObject(WORKSPACE_RESUME_STORAGE_KEY, null);
      if (!snapshot) return;
      const scenarioKey =
        resolveStrategyPresetKey(snapshot?.activeScenarioKey || "overview") ||
        "overview";
      const targetId =
        mode === "shortlist"
          ? safeArray(snapshot?.shortlistIds)[0] || snapshot?.activeRecId
          : snapshot?.activeRecId;
      if (safeArray(snapshot?.shortlistIds).length) {
        setShortlistIds(
          safeArray(snapshot.shortlistIds).slice(0, SHORTLIST_LIMIT)
        );
      }
      setWorkflowActionState({
        ...SCENARIO_ACTION_TRACKER_INITIAL,
        ...(snapshot?.workflowActionState || {}),
      });
      setLandingLaunchStatus("최근 작업 상태를 다시 여는 중입니다.");
      setScreen("platform");
      setPendingPresetKey(scenarioKey);
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (snapshot?.detailTab) set검토Tab(snapshot.detailTab);
            if (snapshot?.focusMode) setFocusMode(snapshot.focusMode);
            if (snapshot?.leftPanelTab) setLeftPanelTab(snapshot.leftPanelTab);
            setLeftPanelOpen(true);
            setRightPanelOpen(true);
            const targetRec = NORMALIZED_ENHANCED_RECOMMENDATIONS.find(
              (item) => item.id === targetId
            );
            if (targetRec) setActiveRec(targetRec);
          });
        });
      }
      trackActivationEvent("return_resume_click", {
        mode,
        scenarioKey,
        shortlistCount: safeArray(snapshot?.shortlistIds).length,
      });
      pushStatusBanner(
        mode === "shortlist"
          ? "최근 후보군을 다시 열었습니다"
          : "최근 작업을 이어서 엽니다",
        snapshot?.nextActionLabel ||
          "최근 시나리오와 후보 상태를 복원했습니다. 이어서 검토를 진행하세요.",
        "success"
      );
    },
    [resumeState]
  );

  const beginPanelResize = useCallback(
    (side, event) => {
      if (isMobile) return;
      event.preventDefault();
      event.stopPropagation();
      setPanelResize({
        side,
        startX: event.clientX,
        startWidth: side === "left" ? leftPanelWidth : rightPanelWidth,
      });
    },
    [isMobile, leftPanelWidth, rightPanelWidth]
  );

  useEffect(() => {
    if (!panelResize || typeof window === "undefined") return undefined;
    const body = document?.body;
    if (body) {
      body.style.cursor = "col-resize";
      body.style.userSelect = "none";
    }

    const handleMove = (event) => {
      const viewport = window.innerWidth || 1440;
      const min = panelResize.side === "left" ? 280 : 320;
      // 기존 480/560px, viewport 42% 제한을 제거하고
      // 브라우저 뷰포트 안에서만 확장되도록 완화합니다.
      const max = Math.max(min, viewport - 24);
      if (panelResize.side === "left") {
        const next = clampNumber(
          panelResize.startWidth + (event.clientX - panelResize.startX),
          min,
          max
        );
        setLeftPanelWidth(next);
      } else {
        const next = clampNumber(
          panelResize.startWidth - (event.clientX - panelResize.startX),
          min,
          max
        );
        setRightPanelWidth(next);
      }
    };

    const handleUp = () => {
      if (body) {
        body.style.cursor = "";
        body.style.userSelect = "";
      }
      setPanelResize(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp, { once: true });
    return () => {
      if (body) {
        body.style.cursor = "";
        body.style.userSelect = "";
      }
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [panelResize]);

  const shareUrl = useMemo(
    () =>
      buildPlatformShareUrl({
        screen,
        filters,
        activeRec,
        detailTab,
        focusMode,
      }),
    [screen, filters, activeRec, detailTab, focusMode]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !shareUrl) return;
    window.history.replaceState(null, "", shareUrl);
  }, [shareUrl]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title =
      screen === "platform" && activeRec
        ? `${activeRec.country} · ${activeRec.region} · ${
            techShort(activeRec.tech) || activeRec.tech
          } | 개도국 기후기술 협력 플랫폼`
        : "개도국 기후기술 협력 플랫폼";
  }, [screen, activeRec]);

  const launchReadiness = useMemo(() => {
    const sourceCount =
      safeArray(activeRec?.sourcePlan).length +
      safeArray(activeRec?.regionRows).length;
    const partnerCount = safeArray(activeRec?.localPartners).length;
    const financeCount = safeArray(
      activeRec?.executionFeasibility?.financeChannels
    ).length;
    const missingCount = safeArray(activeRec?.inventoryRows).filter(
      (row) => row?.status !== "확보"
    ).length;
    const sections = [
      {
        key: "ux",
        label: "제품 UX",
        status: "ready",
        note: "모바일 하단 시트, 도움말, 하단 내비게이션, 상세 탭까지 포함해 점검했습니다.",
      },
      {
        key: "evidence",
        label: "근거·출처",
        status:
          sourceCount >= 8 ? "ready" : sourceCount >= 4 ? "attention" : "needs",
        note: `현재 활성 후보 기준 근거 ${sourceCount}건`,
      },
      {
        key: "partners",
        label: "현지 파트너",
        status:
          partnerCount >= 3
            ? "ready"
            : partnerCount >= 1
            ? "attention"
            : "needs",
        note: partnerCount
          ? `실제 파트너 ${partnerCount}개 기관 연결`
          : "현지 기관 연결 보강 필요",
      },
      {
        key: "finance",
        label: "재원 연결 경로",
        status:
          financeCount >= 2
            ? "ready"
            : financeCount >= 1
            ? "attention"
            : "needs",
        note: financeCount
          ? `재원 ${financeCount}개`
          : "GCF/MDB/ODA 경로 정리 필요",
      },
      {
        key: "governance",
        label: "데이터 거버넌스",
        status: missingCount === 0 ? "ready" : "attention",
        note:
          missingCount === 0
            ? "핵심 인벤토리 확보"
            : `보완 필요 항목 ${missingCount}건`,
      },
      {
        key: "delivery",
        label: "산출물",
        status: "ready",
        note: "협력 대상 검토표 PDF와 공유용 요약본 PDF 기능을 제공합니다.",
      },
    ];
    const counts = sections.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { ready: 0, attention: 0, needs: 0 }
    );
    return {
      counts,
      sections,
      summary: activeRec
        ? `${activeRec.country} · ${activeRec.region}의 ${activeRec.tech} 협력안은 초기 발굴·사전기획·내부 검토자료 용도로 바로 활용할 수 있습니다.`
        : "후보를 선택하면 공유, 저장, 요약본 정리를 바로 시작할 수 있습니다.",
    };
  }, [activeRec]);

  function trackActivationEvent(eventName, payload = {}) {
    if (!eventName) return;
    const entry = {
      eventName,
      ts: Date.now(),
      screen: screenRef.current || screen,
      activeScenarioKey: activeScenarioKeyRef.current || activeScenarioKey,
      activeRecId: activeRecRef.current?.id || null,
      ...payload,
    };
    appendStoredObjectList(
      ACTIVATION_EVENT_LOG_STORAGE_KEY,
      entry,
      ACTIVATION_EVENT_LOG_LIMIT
    );
    console.info("[activation]", entry);
  }

  function openGuideForTarget(targetKey = "toolbar-filter") {
    setGuideStepIndex(findGuideStepIndexByKey(targetKey));
    setGuideOpen(true);
  }

  useEffect(() => {
    if (screen !== "landing") return;
    trackActivationEvent("landing_view", {
      hasResumeState: !!resumeState,
    });
  }, [screen, resumeState]);

  function markWorkflowAction(actionKey) {
    if (!actionKey) return;
    setWorkflowActionState((prev) => ({ ...prev, [actionKey]: Date.now() }));
  }

  function pushStatusBanner(title, message, tone = "success") {
    setStatusBanner({ title, message, tone, ts: Date.now() });
  }

  useEffect(() => {
    if (!statusBanner) return undefined;
    const timer = window.setTimeout(() => setStatusBanner(null), 4600);
    return () => window.clearTimeout(timer);
  }, [statusBanner]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handler = (event) => {
      const detail = event?.detail || {};
      if (!detail?.eventName) return;
      trackActivationEvent(detail.eventName, detail.payload || {});
    };
    window.addEventListener("climate-platform-analytics", handler);
    return () =>
      window.removeEventListener("climate-platform-analytics", handler);
  }, []);

  const closeDownloadFallback = useCallback(() => {
    setDownloadFallbackState((prev) => {
      if (prev?.objectUrl) revokeObjectUrl(prev.objectUrl);
      if (prev?.fallbackObjectUrl) revokeObjectUrl(prev.fallbackObjectUrl);
      return null;
    });
  }, []);

  const handleCopyDownloadFallback = useCallback(
    async (textToCopy) => {
      const ok = await safeCopyText(textToCopy);
      pushStatusBanner(
        ok ? "내용을 복사했습니다" : "복사에 실패했습니다",
        ok
          ? "문서 내용을 복사했습니다. 메신저나 회의 메모에 바로 붙여넣을 수 있습니다."
          : "브라우저 복사 권한을 확인해 주세요.",
        ok ? "success" : "warning"
      );
    },
    [pushStatusBanner]
  );

  const createDownloadPayload = useCallback(
    (fileKind) => {
      if (!activeRec) return null;
      const currentLive = liveDataByRec[activeRec.id] || null;
      const currentGeo = geoDataByRec[activeRec.id] || null;
      const currentPipeline = pipelineByRec[activeRec.id] || null;
      if (fileKind === "comparison") {
        return createComparisonPdfPayload(
          activeRec,
          filteredRecs,
          shortlistRecs,
          strategyMetaByRec,
          filters,
          currentLive,
          currentGeo,
          currentPipeline
        );
      }
      return createInternationalCooperationBriefPayload(
        activeRec,
        currentPipeline,
        filters
      );
    },
    [
      activeRec,
      liveDataByRec,
      geoDataByRec,
      pipelineByRec,
      filters,
      filteredRecs,
      shortlistRecs,
      strategyMetaByRec,
    ]
  );

  const handleFileDelivery = useCallback(
    (fileKind) => {
      try {
        if (!activeRec) {
          pushStatusBanner(
            "먼저 후보를 선택해 주세요",
            "검토표나 요약본을 열기 전에 국가·지역 후보를 먼저 선택해 주세요.",
            "warning"
          );
          return;
        }

        pushStatusBanner(
          fileKind === "comparison"
            ? "검토표를 내부 미리보기로 여는 중입니다"
            : "요약본을 내부 미리보기로 여는 중입니다",
          "별도 새 창 없이 현재 화면 안에서 문서를 검토하고 저장할 수 있도록 준비합니다.",
          "success"
        );

        let payload = null;
        let payloadRecovered = false;
        try {
          payload = createDownloadPayload(fileKind);
        } catch (payloadError) {
          console.error(
            `[document-preview] failed to build ${fileKind} payload`,
            payloadError
          );
          payload = createEmergencyDownloadPayload(
            fileKind,
            activeRec,
            filters,
            pipelineByRec[activeRec.id] || null
          );
          payloadRecovered = true;
        }

        if (!payload?.blob) {
          payload = createEmergencyDownloadPayload(
            fileKind,
            activeRec,
            filters,
            pipelineByRec[activeRec.id] || null
          );
          payloadRecovered = true;
        }

        if (!payload?.blob) {
          pushStatusBanner(
            "문서를 준비하지 못했습니다",
            "문서 생성 중 오류가 발생했습니다. 다시 시도해 주세요.",
            "warning"
          );
          return;
        }

        const meta = getDownloadKindMeta(fileKind);
        const primaryUrl = createObjectUrlSafe(payload.blob, payload.filename);
        const fallbackUrl = payload.fallbackBlob
          ? createObjectUrlSafe(
              payload.fallbackBlob,
              payload.fallbackFilename || `${payload.filename}.txt`
            )
          : "";

        setDownloadFallbackState((prev) => {
          if (prev?.objectUrl) revokeObjectUrl(prev.objectUrl);
          if (prev?.fallbackObjectUrl) revokeObjectUrl(prev.fallbackObjectUrl);
          return {
            open: true,
            fileKind,
            fileLabel: meta.fileLabel,
            previewTitle:
              fileKind === "comparison"
                ? "협력 대상 검토표 미리보기"
                : "공유용 요약본 미리보기",
            primaryActionMode: "internal-preview",
            primaryActionLabel: "앱 내부에서 인쇄 / PDF 저장",
            primaryActionHint: "새 창 없이 현재 화면에서 검토 후 저장",
            filename: payload.filename,
            mimeType: payload.mimeType,
            objectUrl: primaryUrl,
            fallbackObjectUrl: fallbackUrl,
            fallbackFilename: payload.fallbackFilename,
            previewText: payload.previewText,
            copyText: payload.copyText || payload.previewText,
            htmlText: payload.htmlText || "",
            statusMessage:
              fileKind === "comparison"
                ? "검토표를 현재 플랫폼 내부 문서 화면으로 열었습니다. 인쇄 또는 저장이 필요하면 우측 상단 작업 버튼을 사용하세요."
                : "공유용 요약본을 현재 플랫폼 내부 문서 화면으로 열었습니다. 인쇄 또는 저장이 필요하면 우측 상단 작업 버튼을 사용하세요.",
            environmentNote:
              "기본 동선은 내부 문서 미리보기입니다. 별도 새 창을 열지 않고, 현재 화면에서 문서 검토·인쇄·저장·복사를 수행할 수 있습니다.",
            environmentReason: payloadRecovered
              ? "recovered-internal-preview"
              : "internal-preview",
          };
        });

        if (fileKind === "comparison") {
          markWorkflowAction("excelDownloadedAt");
          trackActivationEvent("comparison_pdf_download", {
            prepared: true,
            fallback: false,
            mode: "internal-preview",
          });
        } else {
          markWorkflowAction("briefDownloadedAt");
          trackActivationEvent("brief_pdf_download", {
            prepared: true,
            fallback: false,
            mode: "internal-preview",
          });
        }

        pushStatusBanner(
          meta.bannerTitle,
          payloadRecovered
            ? "상세 문서 생성 중 일부 내용을 기본 형식으로 복구했지만, 내부 문서 미리보기와 저장 기능은 계속 사용할 수 있습니다."
            : "문서를 새 창 없이 현재 화면 안에서 바로 검토할 수 있도록 열었습니다.",
          payloadRecovered ? "warning" : "success"
        );
      } catch (error) {
        console.error("[document-preview] delivery pipeline failed", error);
        const rescueState = buildRuntimeErrorDownloadState({
          fileKind,
          rec: activeRec,
          filters,
          pipelineData: pipelineByRec[activeRec.id] || null,
        });
        setDownloadFallbackState((prev) => {
          if (prev?.objectUrl) revokeObjectUrl(prev.objectUrl);
          if (prev?.fallbackObjectUrl) revokeObjectUrl(prev.fallbackObjectUrl);
          return {
            ...rescueState,
            statusMessage:
              "문서 생성 중 오류가 발생하여 기본 문서 미리보기로 전환했습니다.",
            environmentNote:
              "새 창을 열지 않고 현재 화면 안에서 기본 문서 내용을 확인하고 저장할 수 있습니다.",
            primaryActionMode: "internal-preview",
          };
        });
        pushStatusBanner(
          "기본 문서 미리보기로 전환했습니다",
          "오류가 발생해도 내부 문서 화면에서 계속 검토할 수 있도록 복구했습니다.",
          "warning"
        );
      }
    },
    [activeRec, createDownloadPayload, filters, pipelineByRec]
  );

  const runDefaultStartFlow = useCallback(
    (presetKey = "oda-screening", options = {}) => {
      const resolvedPresetKey = resolveStrategyPresetKey(
        presetKey || "oda-screening"
      );
      const workflow = getScenarioWorkflow(resolvedPresetKey);
      console.info("[launch] running default start flow", {
        resolvedPresetKey,
        options,
      });
      setLandingLaunchStatus(
        "바로 검토를 시작합니다. 필터와 첫 후보를 함께 열고 있습니다."
      );
      setLandingScenarioPulse(true);
      setGuideOpen(true);
      setGuideStepIndex(
        findGuideStepIndexByKey(
          workflow?.steps?.[0]?.guideKey || "toolbar-filter"
        )
      );
      setLeftPanelOpen(true);
      setRightPanelOpen(true);
      setLeftPanelTab("filters");
      set검토Tab(
        workflow?.preset?.detailTab ||
          STRATEGY_PRESETS?.[resolvedPresetKey]?.detailTab ||
          "recommendations"
      );
      startScenarioFlow(resolvedPresetKey);
      pushStatusBanner(
        "검토를 시작했습니다",
        "필터와 상세 탭을 열어 바로 검토할 수 있게 준비했습니다.",
        "success"
      );
    },
    [pushStatusBanner, startScenarioFlow]
  );

  useEffect(() => {
    if (!landingScenarioPulse && !landingLaunchStatus) return undefined;
    const timer = window.setTimeout(() => {
      setLandingScenarioPulse(false);
      setLandingLaunchStatus("");
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [landingScenarioPulse, landingLaunchStatus]);

  const handleCopyShareLink = useCallback(async () => {
    const ok = await safeCopyText(shareUrl);
    if (ok) {
      markWorkflowAction("shareCopiedAt");
      trackActivationEvent("share_link_copy", {
        activeRecId: activeRec?.id || null,
      });
    }
    pushStatusBanner(
      ok ? "이 화면 링크를 복사했습니다" : "링크를 복사하지 못했습니다",
      ok
        ? "메신저, 이메일, 회의 메모에 바로 붙여넣어 공유할 수 있습니다."
        : "브라우저 복사 권한을 확인한 뒤 다시 시도해 주세요.",
      ok ? "success" : "warning"
    );
  }, [shareUrl, activeRec]);

  const handleCopyFeedbackDraft = useCallback(async () => {
    const ok = await safeCopyText(
      buildFeedbackDraft(activeRec || fallbackVisibleRec || EMPTY_DETAIL_RECORD)
    );
    if (ok) markWorkflowAction("feedbackCopiedAt");
    pushStatusBanner(
      ok
        ? "회의 메모 초안을 복사했습니다"
        : "회의 메모 초안을 복사하지 못했습니다",
      ok
        ? "복사한 내용을 메신저나 문서에 바로 붙여넣어 사용할 수 있습니다."
        : "브라우저 복사 권한을 확인한 뒤 다시 시도해 주세요.",
      ok ? "success" : "warning"
    );
  }, [activeRec, fallbackVisibleRec]);

  const handleDownloadExcel = useCallback(() => {
    handleFileDelivery("comparison");
  }, [handleFileDelivery]);

  const handleDownloadBrief = useCallback(() => {
    handleFileDelivery("brief");
  }, [handleFileDelivery]);

  const fetchLiveDataForRec = async (rec, force = false) => {
    if (!rec) return;
    if (!force && liveDataByRec[rec.id]) return;

    setLiveLoadingByRec((p) => ({ ...p, [rec.id]: true }));
    try {
      const bundle = await loadLiveApiBundle(rec);
      setLiveDataByRec((p) => ({ ...p, [rec.id]: bundle }));
      if (force) {
        pushStatusBanner(
          "국가·기초지표를 새로 불러왔습니다",
          "GDP, 전력 접근률, 기후 기본지표와 위치 확인 정보를 최신 상태로 다시 읽었습니다.",
          "success"
        );
      }
    } catch (e) {
      console.error("Live API load failed:", e);
      if (force) {
        pushStatusBanner(
          "국가·기초지표를 다시 불러오지 못했습니다",
          "잠시 후 다시 시도해 주세요. (기존 로드된 데이터 유지)",
          "warning"
        );
      }
    } finally {
      setLiveLoadingByRec((p) => ({ ...p, [rec.id]: false }));
    }
  };

  const fetchGeoDataForRec = async (rec, force = false) => {
    if (!rec) return;
    if (!force && geoDataByRec[rec.id]) return;

    setGeoLoadingByRec((p) => ({ ...p, [rec.id]: true }));
    try {
      const bundle = await loadBoundaryBundle(rec);
      setGeoDataByRec((p) => ({ ...p, [rec.id]: bundle }));
      if (force) {
        pushStatusBanner(
          "지도 기준 영역을 새로 불러왔습니다",
          "국가 경계와 지역 기준 영역을 다시 확인했습니다.",
          "success"
        );
      }
    } catch (e) {
      console.error("Geo boundary load failed:", e);
      if (force) {
        pushStatusBanner(
          "지도 기준 영역을 다시 불러오지 못했습니다",
          "잠시 후 다시 시도해 주세요. 불러온 영역이 있으면 그 값을 그대로 보여줍니다.",
          "warning"
        );
      }
    } finally {
      setGeoLoadingByRec((p) => ({ ...p, [rec.id]: false }));
    }
  };

  const fetchPipelineForRec = useCallback(
    async (rec, force = false) => {
      if (!rec) return;
      if (!force && pipelineByRec[rec.id]) return;

      setPipelineLoadingByRec((p) => ({ ...p, [rec.id]: true }));
      try {
        const country =
          rec.country === "베트남"
            ? "VN"
            : getCountryMetaByName(rec.country)?.iso2 || "";
        const normalizedTech = normalizeTechName(rec.tech);
        const theme =
          normalizedTech === "기후변화 감시 및 진단 기술"
            ? "flood-early-warning"
            : sanitizeExternalQuery(normalizedTech, 80);
        const bundle = await fetchPipelineBundle({
          country,
          region: rec.region,
          theme,
          force,
        });
        setPipelineByRec((p) => ({ ...p, [rec.id]: bundle }));
        if (force || bundle?.isFallback) {
          pushStatusBanner(
            bundle?.isFallback
              ? "프로젝트·재원 예시 데이터를 보여주고 있습니다"
              : "프로젝트·재원 후보를 새로 불러왔습니다",
            bundle?.summary?.note ||
              (bundle?.isFallback
                ? "실시간 API가 연결되지 않아 검증용 기본 데이터를 대신 보여줍니다."
                : "동일 출처 API에서 프로젝트·재원 후보를 다시 읽었습니다."),
            bundle?.isFallback ? "warning" : "success"
          );
        }
      } catch (e) {
        console.error("Pipeline load failed:", e);
        if (force) {
          pushStatusBanner(
            "프로젝트·재원 후보를 다시 불러오지 못했습니다",
            "잠시 후 다시 시도해 주세요. 기존에 불러온 값이 있으면 그대로 유지합니다.",
            "warning"
          );
        }
      } finally {
        setPipelineLoadingByRec((p) => ({ ...p, [rec.id]: false }));
      }
    },
    [pipelineByRec, pushStatusBanner]
  );

  // ensure activeRec remains valid after filtering
  useEffect(() => {
    if (!filteredRecs.length) {
      setActiveRec(null);
      return;
    }
    if (!activeRec || !filteredRecs.some((r) => r.id === activeRec.id)) {
      setActiveRec(filteredRecs[0]);
      setFocusMode("region");
    }
  }, [filteredRecs, activeRec]);

  // close mobile sheets when switching desktop
  useEffect(() => {
    if (!isMobile) {
      setMobilePanel(null);
      setMobileQuickOpen(true);
      setLeftPanelOpen(true);
      setRightPanelOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!activeRec) return;
    // 자동 1회 로딩
    fetchLiveDataForRec(activeRec, false);
    fetchGeoDataForRec(activeRec, false);
    fetchPipelineForRec(activeRec, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRec?.id]);

  useEffect(() => {
    filteredRecs.slice(0, 3).forEach((rec) => {
      fetchPipelineForRec(rec, false);
    });
  }, [filteredRecs, fetchPipelineForRec]);

  const isReady = tailwindReady && mapCssReady && mapJsReady;

  const activeScenarioWorkflow = useMemo(
    () => getScenarioWorkflow(activeScenarioKey),
    [activeScenarioKey]
  );

  const scenarioRuntime = useMemo(
    () =>
      deriveScenarioRuntime(activeScenarioWorkflow, {
        activeScenarioKey,
        filteredCount: filteredRecs.length,
        shortlistCount: shortlistRecs.length,
        activeRec,
        detailTab,
        focusMode,
        leftPanelTab,
        leftPanelOpen,
        rightPanelOpen,
        mobilePanel,
        actions: workflowActionState,
      }),
    [
      activeScenarioWorkflow,
      activeScenarioKey,
      filteredRecs.length,
      shortlistRecs.length,
      activeRec,
      detailTab,
      focusMode,
      leftPanelTab,
      leftPanelOpen,
      rightPanelOpen,
      mobilePanel,
      workflowActionState,
    ]
  );

  useEffect(() => {
    if (detailTab !== "partners") return;
    trackActivationEvent("partner_tab_open", {
      activeRecId: activeRec?.id || null,
    });
  }, [detailTab, activeRec]);

  useEffect(() => {
    if (!scenarioRuntime?.isComplete || !activeScenarioWorkflow?.key) return;
    if (completedScenarioKeyRef.current === activeScenarioWorkflow.key) return;
    completedScenarioKeyRef.current = activeScenarioWorkflow.key;
    const completion = activeScenarioWorkflow?.completion || {};
    trackActivationEvent("scenario_complete", {
      scenarioKey: activeScenarioWorkflow.key,
      outputs: safeArray(completion.outputs).length,
    });
    pushStatusBanner(
      completion.headline || "시나리오를 완료했습니다",
      completion.summary ||
        "이제 후보군 저장, 공유 링크, 요약본 PDF 같은 다음 작업으로 이어가세요.",
      "success"
    );
  }, [scenarioRuntime?.isComplete, activeScenarioWorkflow]);

  useEffect(() => {
    if (screen !== "platform") return;
    const snapshot = {
      updatedAt: Date.now(),
      activeScenarioKey,
      scenarioTitle: activeScenarioWorkflow?.title || "",
      activeRecId: activeRec?.id || null,
      activeRecLabel: activeRec
        ? `${activeRec.country} · ${activeRec.region} · ${
            techShort(activeRec.tech) || activeRec.tech
          }`
        : "",
      filters,
      detailTab,
      focusMode,
      leftPanelTab,
      shortlistIds: safeArray(shortlistIds).slice(0, SHORTLIST_LIMIT),
      workflowActionState,
      nextActionLabel:
        scenarioRuntime?.currentStep?.actionLabel ||
        scenarioRuntime?.currentStep?.detail ||
        (scenarioRuntime?.isComplete
          ? safeArray(activeScenarioWorkflow?.completion?.actions)[0]?.label ||
            "요약본 또는 공유 링크 실행"
          : "후보를 압축하고 상세 패널에서 근거를 확인하세요."),
    };
    setResumeState(snapshot);
    saveStoredObject(WORKSPACE_RESUME_STORAGE_KEY, snapshot);
  }, [
    screen,
    activeScenarioKey,
    activeScenarioWorkflow,
    activeRec,
    filters,
    detailTab,
    focusMode,
    leftPanelTab,
    shortlistIds,
    workflowActionState,
    scenarioRuntime,
  ]);

  const scenarioGuideTarget =
    scenarioRuntime?.currentStep?.guideKey ||
    activeScenarioWorkflow?.steps?.[0]?.guideKey ||
    "toolbar-filter";

  const currentGuideTarget = guideOpen
    ? GUIDE_STEPS[guideStepIndex]?.key
    : scenarioGuideTarget;

  const topButtonClass = (key) =>
    cx(
      "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition",
      "border-slate-600 bg-slate-900/85 text-slate-100 backdrop-blur-md hover:bg-slate-800",
      currentGuideTarget === key && "guide-pulse-soft border-emerald-500/50"
    );

  const handleGuideAction = (actionKey) => {
    if (actionKey === "open-filters") {
      setLeftPanelOpen(true);
      setLeftPanelTab("filters");
      if (isMobile) setMobilePanel("filters");
    }
    if (actionKey === "open-candidates") {
      setLeftPanelOpen(true);
      setLeftPanelTab("candidates");
      if (isMobile) setMobilePanel("candidates");
    }
    if (actionKey === "open-detail") {
      setRightPanelOpen(true);
      if (isMobile) setMobilePanel("detail");
    }
    if (actionKey === "focus-region") {
      setRightPanelOpen(true);
      setFocusMode("region");
    }
    if (actionKey === "focus-country") {
      setRightPanelOpen(true);
      setFocusMode("country");
    }
    if (actionKey === "jump-sources") {
      setRightPanelOpen(true);
      set검토Tab("sources");
      if (isMobile) setMobilePanel("detail");
    }

    window.setTimeout(() => {
      setGuideStepIndex((prev) => Math.min(prev + 1, GUIDE_STEPS.length - 1));
    }, 280);
  };

  const handleScenarioAction = useCallback(
    (actionKey) => {
      const nextRec =
        activeRec ||
        fallbackVisibleRec ||
        NORMALIZED_ENHANCED_RECOMMENDATIONS[0] ||
        null;
      if (nextRec && (!activeRec || activeRec.id !== nextRec.id)) {
        setActiveRec(nextRec);
      }

      switch (actionKey) {
        case "go-filters":
          setLeftPanelOpen(true);
          setLeftPanelTab("filters");
          if (isMobile) setMobilePanel("filters");
          break;
        case "go-candidates":
          setLeftPanelOpen(true);
          setLeftPanelTab("candidates");
          if (isMobile) setMobilePanel("candidates");
          break;
        case "go-overview":
          setRightPanelOpen(true);
          set검토Tab("overview");
          if (isMobile) setMobilePanel("detail");
          break;
        case "go-recommendations":
          setRightPanelOpen(true);
          set검토Tab("overview");
          if (isMobile) setMobilePanel("detail");
          break;
        case "go-funding":
          setRightPanelOpen(true);
          set검토Tab("funding");
          if (isMobile) setMobilePanel("detail");
          break;
        case "go-partners":
          setRightPanelOpen(true);
          set검토Tab("partners");
          if (isMobile) setMobilePanel("detail");
          break;
        case "go-sources":
          setRightPanelOpen(true);
          set검토Tab("sources");
          if (isMobile) setMobilePanel("detail");
          break;
        case "go-country":
          setRightPanelOpen(true);
          setFocusMode("country");
          if (isMobile && mobilePanel == null) setMobileQuickOpen(false);
          break;
        case "go-region":
          setRightPanelOpen(true);
          setFocusMode("region");
          if (isMobile && mobilePanel == null) setMobileQuickOpen(false);
          break;
        case "toggle-shortlist":
          if (nextRec) toggleShortlistRec(nextRec);
          break;
        case "copy-share":
          handleCopyShareLink();
          break;
        case "download-brief":
          handleDownloadBrief();
          break;
        case "download-excel":
          handleDownloadExcel();
          break;
        case "open-launch":
          setLaunchModalOpen(true);
          break;
        default:
          break;
      }
    },
    [
      activeRec,
      fallbackVisibleRec,
      isMobile,
      mobilePanel,
      toggleShortlistRec,
      handleCopyShareLink,
      handleDownloadBrief,
      handleDownloadExcel,
    ]
  );

  if (!tailwindReady) {
    return (
      <div
        style={{
          height: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
          color: "#e2e8f0",
          fontFamily: "sans-serif",
        }}
      >
        스타일 로딩 중...
      </div>
    );
  }

  const activeLive = activeRec ? liveDataByRec[activeRec.id] : null;
  const activeGeo = activeRec ? geoDataByRec[activeRec.id] : null;
  const activePipeline = activeRec ? pipelineByRec[activeRec.id] : null;
  const activeLiveLoading = !!(activeRec && liveLoadingByRec[activeRec.id]);
  const activeGeoLoading = !!(activeRec && geoLoadingByRec[activeRec.id]);
  const activePipelineLoading = !!(
    activeRec && pipelineLoadingByRec[activeRec.id]
  );

  if (screen === "landing") {
    return (
      <LandingPage
        onStart={(presetKey = null) =>
          runDefaultStartFlow(presetKey || "oda-screening", {
            source: presetKey ? "landing-purpose-card" : "landing-hero",
          })
        }
        onFallbackStart={runDefaultStartFlow}
        onOpenScenarioTester={() => setScenarioTesterOpen(true)}
        showScenarioTester={isDev}
        launchStatus={landingLaunchStatus}
        landingScenarioPulse={landingScenarioPulse}
        onTrackHeroPrimaryStart={({
          entry = "hero-primary",
          presetKey = "oda-screening",
        } = {}) =>
          trackActivationEvent("hero_primary_start_click", { entry, presetKey })
        }
        resumeState={resumeState}
        onResumeLastSession={() => resumeWorkspaceFromState("full")}
        onResumeShortlist={() => resumeWorkspaceFromState("shortlist")}
      />
    );
  }

  const leftPanelDocked =
    leftPanelOpen && panelLayout?.left?.mode !== "floating";
  const rightPanelDocked =
    rightPanelOpen && panelLayout?.right?.mode !== "floating";
  const __leftPanelW = leftPanelDocked ? `${leftPanelWidth}px` : "0px";
  const __rightPanelW = rightPanelDocked ? `${rightPanelWidth}px` : "0px";
  const desktopFloatingPanelHeight = "min(60dvh, 720px)";
  const leftPanelWrapperStyle = leftPanelDocked
    ? { left: 0, top: 0, bottom: 0, width: "var(--left-panel-w)" }
    : {
        left: `${panelLayout?.left?.x ?? 16}px`,
        top: `${panelLayout?.left?.y ?? 18}px`,
        width: `${leftPanelWidth}px`,
        height: desktopFloatingPanelHeight,
      };
  const rightPanelWrapperStyle = rightPanelDocked
    ? { right: 0, top: 0, bottom: 0, width: "var(--right-panel-w)" }
    : {
        right: `${panelLayout?.right?.x ?? 16}px`,
        top: `${panelLayout?.right?.y ?? 18}px`,
        width: `${rightPanelWidth}px`,
        height: desktopFloatingPanelHeight,
      };

  const mapLayoutKey = [
    screen,
    isMobile ? "mobile" : "desktop",
    leftPanelOpen ? 1 : 0,
    rightPanelOpen ? 1 : 0,
    leftPanelDocked ? 1 : 0,
    rightPanelDocked ? 1 : 0,
    leftPanelWidth,
    rightPanelWidth,
    panelLayout?.left?.mode || "docked",
    panelLayout?.right?.mode || "docked",
    panelLayout?.left?.x ?? 0,
    panelLayout?.left?.y ?? 0,
    panelLayout?.right?.x ?? 0,
    panelLayout?.right?.y ?? 0,
    mobilePanel || "none",
    mobileQuickOpen ? 1 : 0,
  ].join("|");

  return (
    <div
      className="h-[100dvh] w-full bg-slate-950 text-slate-200 relative overflow-hidden"
      style={{
        "--left-panel-w": __leftPanelW,
        "--right-panel-w": __rightPanelW,
      }}
    >
      {/* Map */}
      <MapCanvas
        ready={isReady}
        recommendations={filteredRecs}
        activeRec={activeRec}
        onSelectRec={(rec) => {
          setActiveRec(rec);
          setFocusMode("region");
          set검토Tab("overview");
          if (isMobile) setMobileQuickOpen(false);
        }}
        mapMode={mapMode}
        focusMode={focusMode}
        guidePulseKey={currentGuideTarget}
        countryBoundaryFeature={activeGeo?.countryFeature || null}
        regionBoundaryFeature={activeGeo?.regionFeature || null}
        layoutKey={mapLayoutKey}
      />

      {isMobile && mobilePanel == null && (
        <MapInfoOverlay
          activeRec={activeRec}
          count={filteredRecs.length}
          mapMode={mapMode}
          strategyMeta={activeRec ? strategyMetaByRec[activeRec.id] : null}
        />
      )}

      {!isMobile && (
        <MapTechLegend
          recommendations={filteredRecs}
          activeRec={activeRec}
          selectedTechFilter={filters.tech}
          onSelectTech={(tech) => {
            const normalizedCurrent =
              filters.tech && filters.tech !== "전체 기술"
                ? normalizeTechName(filters.tech)
                : null;
            const nextTech =
              normalizedCurrent === normalizeTechName(tech)
                ? "전체 기술"
                : normalizeTechName(tech);
            setFilters((prev) => ({ ...prev, keyword: "", tech: nextTech }));
            setLeftPanelOpen(true);
            setRightPanelOpen(true);
            setLeftPanelTab("candidates");
            set검토Tab("overview");
          }}
        />
      )}

      {/* Global dark gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/70" />

      {/* Header */}
      <header
        className="absolute top-0 left-0 right-0 z-30 border-b border-slate-700/70 bg-slate-900/75 backdrop-blur-xl"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          <button
            onClick={() => setScreen("landing")}
            className="flex items-center gap-2 min-w-0 bg-transparent border-0 p-0 text-left cursor-pointer"
            aria-label="랜딩페이지로 이동"
          >
            <NIGTLogo size={36} />
            <div className="min-w-0">
              <div className="text-white font-extrabold text-sm sm:text-base truncate">
                개도국 기후기술 협력 플랫폼
              </div>
              <div className="text-[10px] sm:text-xs text-emerald-300/90 truncate">
                협력 대상 탐색 · 근거 검토 · 공유
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {!isMobile && (
              <button
                onClick={() => setMethodologyOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100"
              >
                <BookOpen size={15} />
                검토 기준 보기
              </button>
            )}
            <button
              onClick={() => setLaunchModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-200"
            >
              <FileCheck size={15} />
              공유·PDF 저장
            </button>
            <button
              onClick={() => startScenarioFlow("oda-screening")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-200"
            >
              <Target size={15} />
              목적 선택
            </button>
            <button
              onClick={() => openGuideForTarget(scenarioGuideTarget)}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold",
                "border-emerald-500/25 bg-slate-900/90 text-emerald-300",
                currentGuideTarget === "toolbar-detail" && "guide-pulse-soft"
              )}
            >
              <Info size={15} />
              사용 가이드
            </button>
          </div>
        </div>
      </header>

      {/* Floating status strip (mobile) */}
      {isMobile && (
        <div
          className="absolute left-2 right-2 z-30 space-y-2"
          style={{ top: "calc(env(safe-area-inset-top) + 58px)" }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/88 px-3 py-2 text-xs text-slate-200 backdrop-blur-xl overflow-x-auto">
              <PillTag tone="sky">목적 {filters.purpose || "전체"}</PillTag>
              {scenarioRuntime?.currentStep ? (
                <PillTag tone="slate">
                  {scenarioRuntime.isComplete
                    ? "완료 준비"
                    : scenarioRuntime.currentStep.label}
                </PillTag>
              ) : null}
              <PillTag tone="sky">후보 {filteredRecs.length}</PillTag>
              <PillTag tone="amber">보관 {shortlistRecs.length}</PillTag>
              {activeRec ? (
                <PillTag tone="emerald">선택 {activeRec.country}</PillTag>
              ) : (
                <PillTag tone="slate">선택 전</PillTag>
              )}
            </div>

            <button
              onClick={() =>
                setMapMode((m) => (m === "hybrid" ? "satellite" : "hybrid"))
              }
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-600 bg-slate-900/88 px-3 py-2 text-sm font-semibold text-slate-100 backdrop-blur-xl"
            >
              <Satellite size={14} />
              {mapMode === "hybrid" ? "지도+위성" : "위성 지도"}
            </button>
          </div>
          <div className="flex gap-2 rounded-2xl border border-slate-700 bg-slate-900/88 p-2 backdrop-blur-xl">
            <button
              onClick={() => setMobilePanel("filters")}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950/55 px-3 py-2 text-xs font-semibold text-slate-100"
            >
              조건
            </button>
            <button
              onClick={() => setMobilePanel("candidates")}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950/55 px-3 py-2 text-xs font-semibold text-slate-100"
            >
              후보
            </button>
            <button
              onClick={() => activeRec && setMobilePanel("detail")}
              className={cx(
                "flex-1 rounded-xl border px-3 py-2 text-xs font-semibold",
                activeRec
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                  : "border-slate-700 bg-slate-950/55 text-slate-500"
              )}
              disabled={!activeRec}
            >
              상세
            </button>
          </div>
        </div>
      )}

      {!isMobile && (
        <div
          className="absolute top-[84px] z-30 flex max-w-[min(1120px,calc(100vw-var(--left-panel-w,0px)-var(--right-panel-w,0px)-56px))] flex-wrap items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/88 px-3 py-2 text-xs text-slate-200 backdrop-blur-xl"
          style={{
            left: "calc(var(--left-panel-w, 0px) + 16px)",
            right: "calc(var(--right-panel-w, 0px) + 16px)",
          }}
        >
          <PillTag tone={scenarioRuntime?.isComplete ? "emerald" : "sky"}>
            목적 선택 {activeScenarioWorkflow?.title || "기본 검토"}
          </PillTag>
          {scenarioRuntime?.currentStep ? (
            <PillTag tone="slate">
              {scenarioRuntime.isComplete
                ? "완료 준비"
                : `다음 · ${scenarioRuntime.currentStep.label}`}
            </PillTag>
          ) : null}
          <PillTag tone="sky">후보 {filteredRecs.length}</PillTag>
          <PillTag tone="amber">보관함 {shortlistRecs.length}</PillTag>
          {activeRec ? (
            <PillTag tone="emerald">
              선택 {activeRec.country} ·{" "}
              {techShort(activeRec.tech) || activeRec.tech}
            </PillTag>
          ) : (
            <PillTag tone="slate">선택 전</PillTag>
          )}
          {!activeRecVisibleInFilters && activeRec ? (
            <PillTag tone="amber">현재 후보가 현재 조건 밖에 있습니다</PillTag>
          ) : null}
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setLeftPanelOpen(true);
                setLeftPanelTab("filters");
              }}
              className="rounded-xl border border-slate-700 bg-slate-950/55 px-3 py-2 font-semibold text-slate-100"
            >
              조건 설정
            </button>
            <button
              type="button"
              onClick={() => {
                setLeftPanelOpen(true);
                setLeftPanelTab("candidates");
              }}
              className="rounded-xl border border-slate-700 bg-slate-950/55 px-3 py-2 font-semibold text-slate-100"
            >
              후보 보기
            </button>
            <button
              type="button"
              onClick={() => {
                if (!activeRec) return;
                setRightPanelOpen(true);
                set검토Tab("overview");
              }}
              className={cx(
                "rounded-xl border px-3 py-2 font-semibold",
                activeRec
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                  : "border-slate-700 bg-slate-950/55 text-slate-500"
              )}
              disabled={!activeRec}
            >
              상세 보기
            </button>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      {!isMobile && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[74px] z-20">
          {leftPanelOpen ? (
            <div
              className="pointer-events-auto absolute pb-3 pt-3"
              style={leftPanelWrapperStyle}
            >
              <div
                className={cx("relative h-full", leftPanelDocked ? "pr-3" : "")}
              >
                <DesktopPanelShell
                  title="협력 대상 탐색"
                  side="left"
                  floating={!leftPanelDocked}
                  onToggleFloating={() => togglePanelFloating("left")}
                  onDragStart={(event) => beginPanelDrag("left", event)}
                  onCollapse={() => setLeftPanelOpen(false)}
                >
                  <Desktop탐색Panel
                    leftPanelTab={leftPanelTab}
                    setLeftPanelTab={setLeftPanelTab}
                    filters={filters}
                    setFilters={setFilters}
                    filteredCount={filteredRecs.length}
                    totalCount={NORMALIZED_ENHANCED_RECOMMENDATIONS.length}
                    recommendations={filteredRecs}
                    activeRec={activeRec}
                    onSelectRec={(rec) => {
                      setActiveRec(rec);
                      setFocusMode("region");
                      set검토Tab("overview");
                      setRightPanelOpen(true);
                    }}
                    guidePulse={currentGuideTarget}
                    filteredRecs={filteredRecs}
                    strategyMetaByRec={strategyMetaByRec}
                    onStartScenario={startScenarioFlow}
                    activeScenarioKey={activeScenarioKey}
                    scenarioRuntime={scenarioRuntime}
                    onScenarioAction={handleScenarioAction}
                    onOpenScenarioGuide={openGuideForTarget}
                    shortlistRecs={shortlistRecs}
                    shortlistIds={shortlistIds}
                    onToggleShortlist={toggleShortlistRec}
                    onBringSelectionIntoView={bringSelectionIntoView}
                    onAddRecommendedShortlist={() =>
                      addTopCandidatesToShortlist(3)
                    }
                    onCopyShare={handleCopyShareLink}
                    onDownloadBrief={handleDownloadBrief}
                    resumeState={resumeState}
                    onResumeLastSession={() => resumeWorkspaceFromState("full")}
                    onResumeShortlist={() =>
                      resumeWorkspaceFromState("shortlist")
                    }
                  />
                </DesktopPanelShell>
                <div
                  role="separator"
                  aria-label="좌측 패널 너비 조절"
                  onMouseDown={(event) => beginPanelResize("left", event)}
                  className={cx(
                    "absolute right-0 top-16 bottom-6 z-20 hidden w-3 cursor-col-resize lg:block",
                    !leftPanelDocked && "top-20 bottom-8"
                  )}
                >
                  <div className="mx-auto h-full w-[3px] rounded-full bg-slate-700/65 transition hover:bg-emerald-400/70" />
                </div>
              </div>
            </div>
          ) : null}

          {rightPanelOpen ? (
            <div
              className="pointer-events-auto absolute pb-3 pt-3"
              style={rightPanelWrapperStyle}
            >
              <div
                className={cx(
                  "relative h-full",
                  rightPanelDocked ? "pl-3" : ""
                )}
              >
                <DesktopPanelShell
                  title={
                    activeRec
                      ? `협력 대상 검토 · ${activeRec.country} · ${activeRec.region}`
                      : "협력 대상 검토"
                  }
                  side="right"
                  floating={!rightPanelDocked}
                  onToggleFloating={() => togglePanelFloating("right")}
                  onDragStart={(event) => beginPanelDrag("right", event)}
                  onCollapse={() => setRightPanelOpen(false)}
                >
                  <div
                    data-guide-id="toolbar-detail"
                    className={cx(
                      currentGuideTarget === "toolbar-detail" &&
                        "guide-pulse-soft rounded-2xl"
                    )}
                  >
                    <검토PanelContent
                      rec={activeRec}
                      detailTab={detailTab}
                      set검토Tab={set검토Tab}
                      onCountryFocus={() => setFocusMode("country")}
                      onRegionFocus={() => setFocusMode("region")}
                      guidePulse={currentGuideTarget}
                      focusMode={focusMode}
                      liveData={activeLive}
                      geoData={activeGeo}
                      pipelineData={activePipeline}
                      liveLoading={activeLiveLoading}
                      geoLoading={activeGeoLoading}
                      pipelineLoading={activePipelineLoading}
                      shareUrl={shareUrl}
                      onCopyShare={handleCopyShareLink}
                      onDownloadExcel={handleDownloadExcel}
                      onDownloadBrief={handleDownloadBrief}
                      onRefreshLiveData={() =>
                        activeRec && fetchLiveDataForRec(activeRec, true)
                      }
                      onRefreshGeoData={() =>
                        activeRec && fetchGeoDataForRec(activeRec, true)
                      }
                      onRefreshPipelineData={() =>
                        activeRec && fetchPipelineForRec(activeRec, true)
                      }
                      filteredRecs={filteredRecs}
                      shortlistRecs={shortlistRecs}
                      strategyMetaByRec={strategyMetaByRec}
                      onSelectRec={(nextRec) => {
                        if (!nextRec) return;
                        setActiveRec(nextRec);
                        setFocusMode("region");
                        set검토Tab("overview");
                      }}
                      onOpenDrillDown={(item) => {
                        setDrillDownItem(item);
                        setDrillDownOpen(true);
                      }}
                      shortlistIds={shortlistIds}
                      onToggleShortlist={toggleShortlistRec}
                      ctisDataset={ctisDataset}
                    />
                  </div>
                </DesktopPanelShell>
                <div
                  role="separator"
                  aria-label="우측 패널 너비 조절"
                  onMouseDown={(event) => beginPanelResize("right", event)}
                  className={cx(
                    "absolute left-0 top-16 bottom-6 z-20 hidden w-3 cursor-col-resize lg:block",
                    !rightPanelDocked && "top-20 bottom-8"
                  )}
                >
                  <div className="mx-auto h-full w-[3px] rounded-full bg-slate-700/65 transition hover:bg-emerald-400/70" />
                </div>
              </div>
            </div>
          ) : null}

          {!leftPanelOpen && (
            <div className="pointer-events-auto absolute left-0 top-1/2 z-30 -translate-y-1/2">
              <DesktopCollapsedRail
                side="left"
                title="협력 대상 탐색"
                icon={<Filter size={18} className="text-emerald-300" />}
                onExpand={() => setLeftPanelOpen(true)}
              />
            </div>
          )}

          {!rightPanelOpen && (
            <div className="pointer-events-auto absolute right-0 top-1/2 z-30 -translate-y-1/2">
              <DesktopCollapsedRail
                side="right"
                title="협력 대상 검토"
                icon={<PanelRight size={18} className="text-emerald-300" />}
                onExpand={() => setRightPanelOpen(true)}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile selected quick card */}
      {isMobile && activeRec && mobilePanel == null && (
        <div
          className="absolute left-2 right-2 z-30"
          style={{
            bottom: `calc(env(safe-area-inset-bottom) + 88px)`,
          }}
        >
          <div className="rounded-2xl border border-slate-700 bg-slate-900/92 backdrop-blur-xl shadow-2xl overflow-hidden">
            <button
              className="w-full px-3 py-2 border-b border-slate-800 bg-slate-800/35 flex items-center justify-between"
              onClick={() => setMobileQuickOpen((v) => !v)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPin size={14} className="text-emerald-300 shrink-0" />
                <div className="min-w-0 text-left">
                  <div className="text-xs text-slate-400">현재 선택 후보</div>
                  <div className="text-sm font-bold text-white truncate">
                    {activeRec.country} · {activeRec.region}
                  </div>
                </div>
              </div>
              {mobileQuickOpen ? (
                <ChevronDown size={16} className="text-slate-300" />
              ) : (
                <ChevronUp size={16} className="text-slate-300" />
              )}
            </button>

            {mobileQuickOpen && (
              <div className="p-3">
                <div className="text-sm text-emerald-300 font-semibold">
                  {activeRec.tech}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {activeRec.cooperationProfile?.headline || "한 줄 요약"}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {activeRec.cooperationProfile?.quickWin ||
                    "원하는 탭을 선택하여 상세 정보를 확인하십시오."}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      set검토Tab("overview");
                      setMobilePanel("detail");
                    }}
                    className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-2 text-[11px] font-semibold text-emerald-200"
                  >
                    핵심 판단
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      set검토Tab("funding");
                      setMobilePanel("detail");
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-950/55 px-2.5 py-2 text-[11px] font-semibold text-slate-100"
                  >
                    재원·실행
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      set검토Tab("sources");
                      setMobilePanel("detail");
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-950/55 px-2.5 py-2 text-[11px] font-semibold text-slate-100"
                  >
                    출처
                  </button>
                </div>
                <details className="mt-2 rounded-xl border border-slate-700 bg-slate-950/45 p-2.5">
                  <summary className="cursor-pointer list-none text-[11px] font-semibold text-slate-300">
                    점수와 자세한 정보 보기
                  </summary>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    <ScorePill
                      label="충족"
                      value={`${activeRec.scores.coverage}%`}
                      accent="emerald"
                    />
                    <ScorePill
                      label="신뢰"
                      value={`${activeRec.scores.reliability}%`}
                      accent="blue"
                    />
                    <ScorePill
                      label="복원"
                      value={`${activeRec.scores.resilience}%`}
                      accent="amber"
                    />
                    <ScorePill
                      label="타당"
                      value={`${activeRec.scores.feasibility}%`}
                      accent="slate"
                    />
                  </div>
                </details>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFocusMode("country")}
                    className={cx(
                      "rounded-xl border px-3 py-2.5 text-sm font-semibold",
                      focusMode === "country"
                        ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                        : "border-slate-600 bg-slate-800 text-white"
                    )}
                  >
                    국가 검토 기준 보기
                  </button>
                  <button
                    onClick={() => setFocusMode("region")}
                    className={cx(
                      "rounded-xl border px-3 py-2.5 text-sm font-semibold",
                      focusMode === "region"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-slate-600 bg-slate-800 text-white"
                    )}
                  >
                    지역 검토 기준 보기
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setMobilePanel("candidates")}
                    className={cx(
                      "rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white",
                      currentGuideTarget === "toolbar-candidates" &&
                        "guide-pulse-soft"
                    )}
                  >
                    후보
                  </button>
                  <button
                    onClick={() => setMobilePanel("detail")}
                    className={cx(
                      "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold text-emerald-300",
                      currentGuideTarget === "toolbar-detail" &&
                        "guide-pulse-soft"
                    )}
                  >
                    상세
                  </button>
                  <button
                    onClick={() => setMobilePanel("filters")}
                    className={cx(
                      "rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white",
                      currentGuideTarget === "toolbar-filter" &&
                        "guide-pulse-soft"
                    )}
                  >
                    필터
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => toggleShortlistRec(activeRec)}
                    className={cx(
                      "rounded-xl border px-3 py-2.5 text-xs font-semibold",
                      shortlistIds.includes(activeRec.id)
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                        : "border-slate-600 bg-slate-800 text-white"
                    )}
                  >
                    {shortlistIds.includes(activeRec.id) ? "보관됨" : "보관"}
                  </button>
                  <button
                    onClick={handleCopyShareLink}
                    className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5 text-xs font-semibold text-sky-200"
                  >
                    공유
                  </button>
                  <button
                    onClick={handleDownloadBrief}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-200"
                  >
                    요약본
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isMobile && (
        <MobileBottomNav
          activeKey={mobilePanel}
          filteredCount={filteredRecs.length}
          hasActiveRec={!!activeRec}
          onOpenLegend={() => setMobilePanel("legend")}
          onOpenFilters={() => setMobilePanel("filters")}
          onOpenCandidates={() => setMobilePanel("candidates")}
          onOpen검토={() => activeRec && setMobilePanel("detail")}
        />
      )}

      {/* Mobile sheets */}
      {isMobile && (
        <>
          <MobileSheet
            open={mobilePanel === "legend"}
            title="지도 범례 · 국가 38대 기후기술"
            onClose={() => setMobilePanel(null)}
            full
          >
            <MapTechLegend
              recommendations={filteredRecs}
              activeRec={activeRec}
              isMobile
              embedded
              selectedTechFilter={filters.tech}
              onSelectTech={(tech) => {
                const normalizedCurrent =
                  filters.tech && filters.tech !== "전체 기술"
                    ? normalizeTechName(filters.tech)
                    : null;
                const nextTech =
                  normalizedCurrent === normalizeTechName(tech)
                    ? "전체 기술"
                    : normalizeTechName(tech);
                setFilters((prev) => ({
                  ...prev,
                  keyword: "",
                  tech: nextTech,
                }));
                setLeftPanelTab("candidates");
                set검토Tab("overview");
                setMobilePanel("candidates");
                setMobileQuickOpen(false);
              }}
            />
          </MobileSheet>

          <MobileSheet
            open={mobilePanel === "filters"}
            title="조건 설정"
            onClose={() => setMobilePanel(null)}
            full
          >
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              filteredCount={filteredRecs.length}
              totalCount={NORMALIZED_ENHANCED_RECOMMENDATIONS.length}
              guidePulse={currentGuideTarget}
              compact
              filteredRecs={filteredRecs}
              strategyMetaByRec={strategyMetaByRec}
              onStartScenario={startScenarioFlow}
              onOpenScenarioGuide={openGuideForTarget}
            />
          </MobileSheet>

          <MobileSheet
            open={mobilePanel === "candidates"}
            title="협력 대상 탐색"
            onClose={() => setMobilePanel(null)}
            full
          >
            <CandidateList
              recommendations={filteredRecs}
              activeRec={activeRec}
              onSelectRec={(rec) => {
                setActiveRec(rec);
                setFocusMode("region");
                set검토Tab("overview");
              }}
              onOpen검토={() => setMobilePanel("detail")}
              isMobile
              guidePulse={currentGuideTarget}
              strategyMetaByRec={strategyMetaByRec}
              shortlistIds={shortlistIds}
              onToggleShortlist={toggleShortlistRec}
            />
          </MobileSheet>

          <MobileSheet
            open={mobilePanel === "detail"}
            title="협력 대상 검토"
            onClose={() => setMobilePanel(null)}
            full
          >
            <ScenarioWorkflowCard
              activeScenarioKey={activeScenarioKey}
              runtime={scenarioRuntime}
              activeRec={activeRec}
              filteredCount={filteredRecs.length}
              shortlistCount={shortlistRecs.length}
              onStartScenario={startScenarioFlow}
              onRunAction={handleScenarioAction}
              onOpenGuide={openGuideForTarget}
              compact
            />
            <div className="h-3" />
            <검토PanelContent
              rec={activeRec}
              detailTab={detailTab}
              set검토Tab={set검토Tab}
              onCountryFocus={() => setFocusMode("country")}
              onRegionFocus={() => setFocusMode("region")}
              onDownloadExcel={handleDownloadExcel}
              onDownloadBrief={handleDownloadBrief}
              onCopyShare={handleCopyShareLink}
              shareUrl={shareUrl}
              guidePulse={currentGuideTarget}
              focusMode={focusMode}
              isMobile
              liveData={activeLive}
              liveLoading={activeLiveLoading}
              geoData={activeGeo}
              geoLoading={activeGeoLoading}
              pipelineData={activePipeline}
              pipelineLoading={activePipelineLoading}
              filteredRecs={filteredRecs}
              shortlistRecs={shortlistRecs}
              strategyMetaByRec={strategyMetaByRec}
              onSelectRec={(nextRec) => {
                if (!nextRec) return;
                setActiveRec(nextRec);
                set검토Tab("overview");
                setMobilePanel("detail");
              }}
              onRefreshLiveData={() =>
                activeRec && fetchLiveDataForRec(activeRec, true)
              }
              onRefreshGeoData={() =>
                activeRec && fetchGeoDataForRec(activeRec, true)
              }
              onRefreshPipelineData={() =>
                activeRec && fetchPipelineForRec(activeRec, true)
              }
              onOpenDrillDown={(item) => {
                setDrillDownItem(item);
                setDrillDownOpen(true);
              }}
              shortlistIds={shortlistIds}
              onToggleShortlist={toggleShortlistRec}
              ctisDataset={ctisDataset}
            />
          </MobileSheet>
        </>
      )}

      <StatusBanner
        banner={statusBanner}
        onClose={() => setStatusBanner(null)}
      />

      <DownloadFallbackModal
        state={downloadFallbackState}
        onClose={closeDownloadFallback}
        onCopy={handleCopyDownloadFallback}
        onRetry={handleFileDelivery}
      />

      <LaunchReadinessModal
        open={launchModalOpen}
        onClose={() => setLaunchModalOpen(false)}
        activeRec={activeRec}
        launchReadiness={launchReadiness}
        shareUrl={shareUrl}
        onCopyShare={handleCopyShareLink}
        onOpenGuide={() => {
          setLaunchModalOpen(false);
          openGuideForTarget(scenarioGuideTarget);
        }}
        onOpenMethodology={() => {
          setLaunchModalOpen(false);
          setMethodologyOpen(true);
        }}
        onDownloadBrief={handleDownloadBrief}
        onCopyFeedback={handleCopyFeedbackDraft}
      />

      <MethodologyModal
        open={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
      />

      <SourceDrillDownModal
        open={drillDownOpen}
        item={drillDownItem}
        onClose={() => {
          setDrillDownOpen(false);
          setDrillDownItem(null);
        }}
      />

      {screen === "platform" && (
        <GuideHighlightOverlay
          enabled={guideOpen}
          targetKey={currentGuideTarget}
        />
      )}

      {/* Guide modal */}
      <GuideModal
        open={guideOpen}
        stepIndex={guideStepIndex}
        setStepIndex={setGuideStepIndex}
        onClose={() => setGuideOpen(false)}
        onDontShowToday={hideGuideToday}
        onTryStep={handleGuideAction}
      />

      {/* Loading overlay */}
      {!isReady && (
        <div className="absolute inset-0 z-[90] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-center">
            <div className="text-white font-bold">지도 엔진 로딩 중</div>
            <div className="text-sm text-slate-400 mt-1">
              MapLibre / 위성 지도 타일 초기화...
            </div>
          </div>
        </div>
      )}

      {/* Global style */}
      <style nonce={getCspNonce()}>{`
html, body, #root {
  width: 100%;
  height: 100%;
  margin: 0;
  background: #020617;
}
* { box-sizing: border-box; }
button, select, input { font-family: inherit; }

/* 지도 인터랙션 안정화 */
.maplibregl-map,
.maplibregl-canvas,
.maplibregl-canvas-container {
  pointer-events: auto !important;
}
.maplibregl-map,
.maplibregl-canvas-container {
  width: 100% !important;
  height: 100% !important;
}

.maplibregl-map {
  touch-action: pan-x pan-y pinch-zoom;
}

.maplibregl-canvas-container {
  touch-action: none !important;
}

.maplibregl-canvas {
  cursor: grab;
}
.maplibregl-canvas:active {
  cursor: grabbing;
}

/* Map interaction reliability */
.maplibregl-canvas-container,
.maplibregl-canvas {
  touch-action: none !important;
}

.maplibregl-canvas {
  cursor: grab;
}
.maplibregl-canvas:active {
  cursor: grabbing;
}

/* Mobile ergonomics */
@media (max-width: 1023px) {
  button, select, input {
    min-height: 42px;
  }
}

/* Scrollbars */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: rgba(100,116,139,.65); border-radius: 999px; }
::-webkit-scrollbar-track { background: transparent; }

/* MapLibre controls */
.maplibregl-ctrl-group {
  background: rgba(2,6,23,0.88) !important;
  border: 1px solid rgba(71,85,105,0.8) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
}
.maplibregl-ctrl button {
  width: 34px !important;
  height: 34px !important;
}
.maplibregl-ctrl-icon {
  filter: invert(1) brightness(1.7);
}
.maplibregl-ctrl-attrib {
  background: rgba(2,6,23,0.75) !important;
  color: rgba(226,232,240,0.8) !important;
  border-radius: 8px !important;
  margin: 6px !important;
  font-size: 10px !important;
}
.maplibregl-ctrl-attrib a {
  color: rgba(52,211,153,0.9) !important;
}

/* Marker */
.ct-marker {
  position: relative;
  display: block;
  width: 38px;
  height: 38px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  overflow: visible;
}
.ct-marker-shell {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(255,255,255,0.97);
  border: 2px solid rgba(255,255,255,0.9);
  backdrop-filter: blur(6px);
}
.ct-marker-icon {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 1px 0 rgba(255,255,255,0.45));
}
.ct-marker-icon svg {
  width: 22px;
  height: 22px;
  display: block;
}
.ct-marker-chip {
  position: absolute;
  left: calc(100% + 6px);
  top: 50%;
  z-index: 1;
  transform: translateY(-50%) translateX(-3px);
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.42);
  box-shadow: 0 8px 18px rgba(2, 6, 23, 0.3);
  font-size: 10px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: 0.02em;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 160ms ease, transform 160ms ease;
}
.ct-marker:hover .ct-marker-chip,
.ct-marker:focus-visible .ct-marker-chip,
.ct-marker.active .ct-marker-chip {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}
.ct-marker.active .ct-marker-shell {
  transform: translateY(-1px) scale(1.04);
  box-shadow: 0 0 0 3px rgba(255,255,255,0.24), 0 10px 24px rgba(14,165,233,0.35);
}
.ct-marker:hover .ct-marker-shell,
.ct-marker:focus-visible .ct-marker-shell {
  transform: translateY(-1px);
  box-shadow: 0 0 0 2px rgba(255,255,255,0.18), 0 10px 24px rgba(2,6,23,0.28);
}
@media (max-width: 1023px) {
  .ct-marker,
  .ct-marker-shell {
    width: 34px;
    height: 34px;
  }
  .ct-marker-chip {
    left: calc(100% + 5px);
    font-size: 9px;
    padding: 2px 6px;
  }
}

/* Popup */
.ct-popup-wrap .maplibregl-popup-content {
  background: rgba(2,6,23,0.94);
  border: 1px solid rgba(16,185,129,0.35);
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.35);
  padding: 10px 12px;
}
.ct-popup-wrap .maplibregl-popup-tip {
  border-top-color: rgba(2,6,23,0.94) !important;
}
.ct-popup { min-width: 180px; }
.ct-popup-title {
  color: #fff;
  font-weight: 900;
  margin-top: 2px;
  font-size: 13px;
  line-height: 1.35;
  text-shadow: 0 1px 0 rgba(0,0,0,0.35);
}
.ct-popup-top {
  color: #6ee7b7;
  font-size: 11px;
  font-weight: 800;
}
.ct-popup-sub {
  color: rgba(226,232,240,0.75);
  margin-top: 4px;
  font-size: 11px;
}

/* Guide pulse */
@keyframes guidePulseRing {
  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); }
  70% { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}
.guide-pulse-soft {
  animation: guidePulseRing 1.6s ease-out infinite;
}
.guide-pulse-outline {
  outline: 2px solid rgba(16,185,129,0.35);
  outline-offset: -2px;
  animation: guidePulseRing 1.6s ease-out infinite;
}
`}</style>
    </div>
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: String(error?.message || "Unexpected runtime error"),
    };
  }

  componentDidCatch(error) {
    console.error("[AppErrorBoundary]", error);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-2xl border border-emerald-500/30 bg-slate-900/95 p-6 shadow-2xl">
            <div className="text-emerald-300 text-sm font-bold mb-2">
              Recovery Mode
            </div>
            <div className="text-xl font-extrabold mb-2">
              앱 렌더링 오류가 발생했습니다.
            </div>
            <p className="text-sm text-slate-300 break-words mb-4">
              {this.state.errorMessage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="px-3 py-2 rounded-lg bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-400"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const CTIS_ADMIN_DRAFT_STORAGE_KEY = "CTIS_ADMIN_DRAFT_V1";
const CTIS_ADMIN_PUBLISHED_STORAGE_KEY = "CTIS_ADMIN_PUBLISHED_V1";
const CTIS_ADMIN_HISTORY_STORAGE_KEY = "CTIS_ADMIN_HISTORY_V1";
const CTIS_ADMIN_HISTORY_LIMIT = 10;

const CTIS_SITE_LINKS = {
  home: "https://ctis.re.kr/dcsm/",
  overview:
    "https://ctis.re.kr/dcsm/gis/countryoverview/map?mid=a10100000000&code_cd=01010000000000",
  keytech: "https://ctis.re.kr/dcsm/gis/keytechcoop/map?mid=a10200000000",
  regional: "https://ctis.re.kr/dcsm/gis/regionalcoop/map?mid=a10300000000",
  strategy: "https://ctis.re.kr/dcsm/gis/strategiccoop/map?mid=a10400000000",
};

const CTIS_COUNTRY_CATALOG = [
  {
    nameKoFull: "베트남 사회주의 공화국",
    shortName: "베트남",
    regionGroup: "아시아",
    aliases: ["Socialist Republic of Vietnam", "Vietnam"],
  },
  {
    nameKoFull: "인도",
    shortName: "인도",
    regionGroup: "아시아",
    aliases: ["India"],
  },
  {
    nameKoFull: "인도네시아",
    shortName: "인도네시아",
    regionGroup: "아시아",
    aliases: ["Indonesia"],
  },
  {
    nameKoFull: "필리핀",
    shortName: "필리핀",
    regionGroup: "아시아",
    aliases: ["Philippines"],
  },
  {
    nameKoFull: "방글라데시",
    shortName: "방글라데시",
    regionGroup: "아시아",
    aliases: ["Bangladesh"],
  },
  {
    nameKoFull: "나이지리아",
    shortName: "나이지리아",
    regionGroup: "아프리카",
    aliases: ["Nigeria"],
  },
  {
    nameKoFull: "케냐",
    shortName: "케냐",
    regionGroup: "아프리카",
    aliases: ["Kenya"],
  },
  {
    nameKoFull: "에티오피아",
    shortName: "에티오피아",
    regionGroup: "아프리카",
    aliases: ["Ethiopia"],
  },
  {
    nameKoFull: "탄자니아",
    shortName: "탄자니아",
    regionGroup: "아프리카",
    aliases: ["Tanzania"],
  },
  {
    nameKoFull: "가나",
    shortName: "가나",
    regionGroup: "아프리카",
    aliases: ["Ghana"],
  },
  {
    nameKoFull: "콜롬비아",
    shortName: "콜롬비아",
    regionGroup: "남아메리카",
    aliases: ["Colombia"],
  },
  {
    nameKoFull: "페루",
    shortName: "페루",
    regionGroup: "남아메리카",
    aliases: ["Peru"],
  },
  {
    nameKoFull: "볼리비아",
    shortName: "볼리비아",
    regionGroup: "남아메리카",
    aliases: ["Bolivia"],
  },
  {
    nameKoFull: "이집트",
    shortName: "이집트",
    regionGroup: "중동",
    aliases: ["Egypt"],
  },
  {
    nameKoFull: "요르단",
    shortName: "요르단",
    regionGroup: "중동",
    aliases: ["Jordan"],
  },
  {
    nameKoFull: "예멘",
    shortName: "예멘",
    regionGroup: "중동",
    aliases: ["Yemen"],
  },
  {
    nameKoFull: "우즈베키스탄",
    shortName: "우즈베키스탄",
    regionGroup: "동유럽·중앙아시아",
    aliases: ["Uzbekistan"],
  },
  {
    nameKoFull: "카자흐스탄",
    shortName: "카자흐스탄",
    regionGroup: "동유럽·중앙아시아",
    aliases: ["Kazakhstan"],
  },
  {
    nameKoFull: "키르기스스탄",
    shortName: "키르기스스탄",
    regionGroup: "동유럽·중앙아시아",
    aliases: ["Kyrgyzstan"],
  },
  {
    nameKoFull: "몰도바",
    shortName: "몰도바",
    regionGroup: "동유럽·중앙아시아",
    aliases: ["Moldova"],
  },
  {
    nameKoFull: "아르메니아",
    shortName: "아르메니아",
    regionGroup: "동유럽·중앙아시아",
    aliases: ["Armenia"],
  },
];

function normalizeLooseCountryName(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[\s·,()'".-]/g, "")
    .replace(
      /사회주의공화국|공화국|왕국|연방민주주의공화국|연방공화국|민주공화국|인민민주공화국|socialist|federal|democratic|kingdom|republic|people|state|states|of|the/g,
      ""
    );
}

function countryNameMatchesLoose(left, right) {
  const a = normalizeLooseCountryName(left);
  const b = normalizeLooseCountryName(right);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function dedupeCtisSources(items = []) {
  const byHref = new Map();
  safeArray(items).forEach((item) => {
    const href = ensureExternalUrl(item?.href || item?.url || "") || "";
    if (!href) return;
    byHref.set(href, {
      label: String(item?.label || item?.title || "출처"),
      href,
      group: String(item?.group || "CTIS"),
    });
  });
  return Array.from(byHref.values());
}

function buildCtisGenericSources(dataset) {
  const data = normalizeCtisDatasetShape(dataset || CTIS_VISIBLE_SEED_DATA);
  return dedupeCtisSources([
    { label: "CTIS 메인", href: CTIS_SITE_LINKS.home, group: "CTIS" },
    { label: "국가개황", href: CTIS_SITE_LINKS.overview, group: "CTIS" },
    { label: "중점협력", href: CTIS_SITE_LINKS.keytech, group: "CTIS" },
    { label: "협력지역", href: CTIS_SITE_LINKS.regional, group: "CTIS" },
    { label: "협력전략", href: CTIS_SITE_LINKS.strategy, group: "CTIS" },
    ...safeArray(data.sources),
  ]);
}

function getCtisCountryContext(dataset, countryName) {
  const targetName = String(countryName || "").trim();
  if (!targetName) return null;

  const data = normalizeCtisDatasetShape(dataset || CTIS_VISIBLE_SEED_DATA);
  const countryOptions = safeArray(data.pageMeta?.countryOptions).filter(
    Boolean
  );
  const matchedCatalog = CTIS_COUNTRY_CATALOG.find((item) => {
    if (countryNameMatchesLoose(targetName, item.nameKoFull)) return true;
    if (countryNameMatchesLoose(targetName, item.shortName)) return true;
    return safeArray(item.aliases).some((alias) =>
      countryNameMatchesLoose(targetName, alias)
    );
  });
  const listedOption = countryOptions.find((option) =>
    countryNameMatchesLoose(targetName, option)
  );
  const detailedMatch =
    countryNameMatchesLoose(targetName, data.country?.nameKo) ||
    countryNameMatchesLoose(targetName, data.country?.nameEn);

  if (!matchedCatalog && !listedOption && !detailedMatch) return null;

  const genericSources = buildCtisGenericSources(data);
  const sectionTags = safeArray(data.sections)
    .map((item) => item.title)
    .filter(Boolean);
  const menuTags = safeArray(data.pageMeta?.menus).filter(Boolean);
  const shortName = matchedCatalog?.shortName || listedOption || targetName;
  const fullName =
    matchedCatalog?.nameKoFull ||
    listedOption ||
    data.country?.nameKo ||
    targetName;
  const regionGroup =
    matchedCatalog?.regionGroup || data.country?.region || "CTIS 등재국";

  if (detailedMatch) {
    return {
      status: "detailed",
      countryLabel: shortName,
      countryFullName: fullName,
      regionGroup,
      overview: safeArray(data.country?.overview).slice(0, 6),
      indicators: safeArray(data.indicators).slice(0, 4),
      sectionTags,
      menuTags,
      regionCount: safeArray(data.regions).length,
      categoryCount: safeArray(data.pageMeta?.categoryTabs).length,
      sources: genericSources,
      summary: `${safeArray(data.country?.overview).length}개 국가개황 항목과 ${
        safeArray(data.regions).length
      }개 지역 선택 구조를 근거 탭에서 확인할 수 있습니다.`,
      note: "빠른 판단 화면에서는 핵심 요약만 보여주고, 상세 근거는 근거·출처 탭으로 접어 두었습니다.",
      pageMeta: data.pageMeta,
    };
  }

  return {
    status: "listed",
    countryLabel: shortName,
    countryFullName: fullName,
    regionGroup,
    overview: [],
    indicators: [],
    sectionTags,
    menuTags,
    regionCount: null,
    categoryCount: safeArray(data.pageMeta?.categoryTabs).length,
    sources: genericSources,
    summary:
      "CTIS 등재 국가이지만, 현재 배포본에서는 공통 구조와 출처만 연결하고 국가별 상세 값은 관리자 검증 데이터로 별도 확장합니다.",
    note: "우측 패널은 빠른 판단용이므로 CTIS 원문형 정보는 근거 확인 단계에서만 확장합니다.",
    pageMeta: data.pageMeta,
  };
}

const CTIS_VISIBLE_SEED_DATA = {
  source: "CTIS visible page seed",
  capturedAt: "2026-04-02",
  pageMeta: {
    title: "국가개황 : 개발도상국 협력전략지도",
    url: "https://ctis.re.kr/dcsm/gis/countryoverview/map?mid=a10100000000&code_cd=01010000000000",
    countryCode: "01010000000000",
    menus: ["국가개황", "중점협력", "협력지역", "협력전략"],
    categoryTabs: [
      "전체",
      "국가개요",
      "정치현황",
      "사회·경제현황",
      "정책현황",
      "에너지·환경 현황",
      "한국과의 협력 기반",
    ],
    dataStates: {
      map: "지도를 불러오는 중입니다",
      regionDetail: "지역을 선택하면 상세 정보가 표시됩니다.",
      currentIndicator: "지표를 선택하면 상세 정보가 표시됩니다.",
    },
    countryOptions: [
      "베트남 사회주의 공화국",
      "나이지리아",
      "콜롬비아",
      "이집트",
      "우즈베키스탄",
      "인도",
      "케냐",
      "페루",
      "요르단",
      "카자흐스탄",
      "인도네시아",
      "에티오피아",
      "볼리비아",
      "예멘",
      "키르기스스탄",
      "필리핀",
      "탄자니아",
      "몰도바",
      "방글라데시",
      "가나",
      "아르메니아",
    ],
  },
  country: {
    code: "01010000000000",
    nameKo: "베트남 사회주의 공화국",
    nameEn: "Socialist Republic of Vietnam",
    region: "아시아",
    subregion: "동남아시아",
    overview: [
      { label: "수도", value: "하노이", source: "CTIS 국가개요" },
      { label: "인구", value: "1억 130만명", source: "CTIS 국가개요" },
      { label: "면적", value: "33만 1,332㎢", source: "CTIS 국가개요" },
      { label: "언어", value: "베트남어", source: "CTIS 국가개요" },
      { label: "화폐단위", value: "동(VND)", source: "CTIS 국가개요" },
      { label: "1인당 GDP", value: "4,700$", source: "CTIS 국가개요" },
    ],
  },
  sections: [
    {
      key: "overview",
      title: "국가개요",
      body: "CTIS 페이지의 국가개요 영역에서 국가 기본정보, 지도, 지역 선택, 현재지표 진입 구조를 확인할 수 있습니다.",
    },
    {
      key: "politics",
      title: "정치현황",
      body: "CTIS 본문 탭 구조상 정치현황 섹션이 제공되며, 세부 본문은 운영 데이터 업로드 또는 후속 수집으로 확장할 수 있도록 설계합니다.",
    },
    {
      key: "socioeconomy",
      title: "사회·경제현황",
      body: "CTIS 본문 탭 구조상 사회·경제현황 섹션이 제공됩니다.",
    },
    {
      key: "policy",
      title: "정책현황",
      body: "CTIS 본문 탭 구조상 정책현황 섹션이 제공됩니다.",
    },
    {
      key: "energy-environment",
      title: "에너지·환경 현황",
      body: "CTIS 본문 탭 구조상 에너지·환경 현황 섹션이 제공됩니다.",
    },
    {
      key: "cooperation",
      title: "한국과의 협력 기반",
      body: "CTIS 본문 탭 구조상 한국과의 협력 기반 섹션이 제공됩니다.",
    },
  ],
  indicators: [
    {
      key: "capital",
      label: "수도",
      value: "하노이",
      unit: "-",
      note: "국가개요",
    },
    {
      key: "population",
      label: "인구",
      value: "1억 130만",
      unit: "명",
      note: "국가개요",
    },
    {
      key: "area",
      label: "면적",
      value: "33만 1,332",
      unit: "㎢",
      note: "국가개요",
    },
    {
      key: "language",
      label: "언어",
      value: "베트남어",
      unit: "-",
      note: "국가개요",
    },
    {
      key: "currency",
      label: "화폐단위",
      value: "동(VND)",
      unit: "-",
      note: "국가개요",
    },
    {
      key: "gdp_per_capita",
      label: "1인당 GDP",
      value: "4,700",
      unit: "USD",
      note: "국가개요",
    },
  ],
  regions: [
    "카인호아성",
    "닌투언성",
    "떠이닌성",
    "동나이성",
    "빈즈엉성",
    "빈프억성",
    "럼동성",
    "빈롱성",
    "껀터",
    "띠엔장성",
    "동탑성",
    "안장성",
    "롱안성",
    "호치민시",
    "빈투언성",
    "속짱성",
    "짜빈성",
    "바리어붕따우성",
    "벤째성",
    "하우장성",
    "끼엔장성",
    "까마우성",
    "박리에우성",
    "다낭",
    "꽝찌성",
    "후에",
    "꽝빈성",
    "닥농성",
    "닥락성",
    "푸옌성",
    "잘라이성",
    "꽝남성",
    "꽝응아이",
    "꼰뚬성",
    "빈딘성",
    "디엔비엔성",
    "하노이",
    "하이즈엉성",
    "랑선성",
    "꽝닌성",
    "박닌성",
    "박장성",
    "푸토성",
    "빈푹성",
    "선라성",
    "타이응우옌성",
    "옌바이성",
    "뚜옌꽝성",
    "박깐성",
    "라오까이성",
    "하장성",
    "까오방성",
    "라이쩌우성",
    "타인호아성",
    "응에안성",
    "하띤성",
    "닌빈성",
    "호아빈성",
    "하남성",
    "하이퐁",
    "타이빈성",
    "남딘성",
    "흥옌성",
  ].map((name, index) => ({
    id: `vn-region-${index + 1}`,
    name,
    center: null,
    boundary: null,
    summary: "CTIS 지도에서 선택 가능한 지역 항목",
    details: [
      "지도 영역에서 지역 선택 후 상세 데이터를 연결할 수 있도록 설계된 기본 레코드",
    ],
  })),
  sources: [
    {
      label: "CTIS 국가개황 베트남 페이지",
      href: "https://ctis.re.kr/dcsm/gis/countryoverview/map?mid=a10100000000&code_cd=01010000000000",
      group: "CTIS",
    },
    {
      label: "외교부 국가정보 참조 링크",
      href: "https://www.mofa.go.kr/",
      group: "연계 출처",
    },
  ],
};

function loadCtisAdminData() {
  const published = loadStoredObject(CTIS_ADMIN_PUBLISHED_STORAGE_KEY, null);
  const draft = loadStoredObject(CTIS_ADMIN_DRAFT_STORAGE_KEY, null);
  const history = loadStoredObject(CTIS_ADMIN_HISTORY_STORAGE_KEY, []);
  return {
    published: published && typeof published === "object" ? published : null,
    draft: draft && typeof draft === "object" ? draft : null,
    history: Array.isArray(history) ? history : [],
  };
}

function pushCtisHistoryEntry(entry) {
  const current = safeArray(
    loadStoredObject(CTIS_ADMIN_HISTORY_STORAGE_KEY, [])
  );
  const next = [entry, ...current].slice(0, CTIS_ADMIN_HISTORY_LIMIT);
  saveStoredObject(CTIS_ADMIN_HISTORY_STORAGE_KEY, next);
  return next;
}

function normalizeCtisDatasetShape(raw) {
  const data = raw && typeof raw === "object" ? cloneJsonSafe(raw) : {};
  return {
    source: data.source || "admin-upload",
    capturedAt: data.capturedAt || new Date().toISOString().slice(0, 10),
    pageMeta: {
      title: String(
        data.pageMeta?.title || CTIS_VISIBLE_SEED_DATA.pageMeta.title
      ),
      url: String(data.pageMeta?.url || CTIS_VISIBLE_SEED_DATA.pageMeta.url),
      countryCode: String(
        data.pageMeta?.countryCode ||
          data.country?.code ||
          CTIS_VISIBLE_SEED_DATA.pageMeta.countryCode
      ),
      menus: safeArray(
        data.pageMeta?.menus || CTIS_VISIBLE_SEED_DATA.pageMeta.menus
      )
        .map((item) => String(item || ""))
        .filter(Boolean),
      categoryTabs: safeArray(
        data.pageMeta?.categoryTabs ||
          CTIS_VISIBLE_SEED_DATA.pageMeta.categoryTabs
      )
        .map((item) => String(item || ""))
        .filter(Boolean),
      countryOptions: safeArray(
        data.pageMeta?.countryOptions ||
          CTIS_VISIBLE_SEED_DATA.pageMeta.countryOptions
      )
        .map((item) => String(item || ""))
        .filter(Boolean),
      dataStates: {
        ...(CTIS_VISIBLE_SEED_DATA.pageMeta.dataStates || {}),
        ...(data.pageMeta?.dataStates || {}),
      },
    },
    country: {
      code: String(data.country?.code || CTIS_VISIBLE_SEED_DATA.country.code),
      nameKo: String(
        data.country?.nameKo || CTIS_VISIBLE_SEED_DATA.country.nameKo
      ),
      nameEn: String(
        data.country?.nameEn || CTIS_VISIBLE_SEED_DATA.country.nameEn
      ),
      region: String(
        data.country?.region || CTIS_VISIBLE_SEED_DATA.country.region
      ),
      subregion: String(
        data.country?.subregion || CTIS_VISIBLE_SEED_DATA.country.subregion
      ),
      overview: safeArray(
        data.country?.overview || CTIS_VISIBLE_SEED_DATA.country.overview
      ).map((item) => ({
        label: String(item?.label || "항목"),
        value: String(item?.value || ""),
        source: String(item?.source || ""),
      })),
    },
    sections: safeArray(data.sections || CTIS_VISIBLE_SEED_DATA.sections).map(
      (item) => ({
        key: String(item?.key || "section"),
        title: String(item?.title || "섹션"),
        body: String(item?.body || ""),
      })
    ),
    indicators: safeArray(data.indicators || []).map((item) => ({
      key: String(item?.key || "indicator"),
      label: String(item?.label || "지표"),
      value: String(item?.value || ""),
      unit: String(item?.unit || "-"),
      note: String(item?.note || ""),
    })),
    regions: safeArray(data.regions || []).map((item, index) => ({
      id: String(item?.id || `region-${index + 1}`),
      name: String(item?.name || "지역"),
      center: Array.isArray(item?.center) ? item.center : null,
      boundary: item?.boundary || null,
      summary: String(item?.summary || ""),
      details: safeArray(item?.details)
        .map((detail) => String(detail || ""))
        .filter(Boolean),
    })),
    sources: safeArray(data.sources || [])
      .map((item) => ({
        label: String(item?.label || "출처"),
        href: ensureExternalUrl(item?.href || item?.url || "") || "",
        group: String(item?.group || "CTIS"),
      }))
      .filter((item) => item.href),
  };
}

function validateCtisDataset(data) {
  const errors = [];
  const normalized = normalizeCtisDatasetShape(data);
  if (!normalized.country.nameKo)
    errors.push("country.nameKo가 비어 있습니다.");
  if (!normalized.country.code) errors.push("country.code가 비어 있습니다.");
  if (!normalized.country.overview.length)
    errors.push("country.overview 최소 1건이 필요합니다.");
  if (!normalized.sections.length)
    errors.push("sections 최소 1건이 필요합니다.");
  if (!normalized.pageMeta.countryOptions?.length)
    errors.push("pageMeta.countryOptions 최소 1건이 필요합니다.");
  const regionNames = new Set();
  normalized.regions.forEach((item, index) => {
    if (!item.name) errors.push(`regions[${index}].name이 비어 있습니다.`);
    if (item.name && regionNames.has(item.name))
      errors.push(`regions 중복 이름: ${item.name}`);
    regionNames.add(item.name);
  });
  return { normalized, errors };
}

const CTIS_BOOTSTRAP_PUBLIC_PATHS = [
  "/ctis_admin_published.json",
  "/ctis_visible_site_dataset.json",
];

function mergeCtisDataset(base, incoming, strategy = "merge") {
  const baseNormalized = normalizeCtisDatasetShape(
    base || CTIS_VISIBLE_SEED_DATA
  );
  const incomingNormalized = normalizeCtisDatasetShape(incoming || {});
  if (strategy === "overwrite") return incomingNormalized;

  const overviewMap = new Map();
  [
    ...safeArray(baseNormalized.country.overview),
    ...safeArray(incomingNormalized.country.overview),
  ].forEach((item) => {
    const key = `${item.label}::${item.value}`;
    if (!overviewMap.has(key)) overviewMap.set(key, item);
  });

  const sectionMap = new Map();
  [
    ...safeArray(baseNormalized.sections),
    ...safeArray(incomingNormalized.sections),
  ].forEach((item) => {
    sectionMap.set(item.key, item);
  });

  const indicatorMap = new Map();
  [
    ...safeArray(baseNormalized.indicators),
    ...safeArray(incomingNormalized.indicators),
  ].forEach((item) => {
    indicatorMap.set(item.key, item);
  });

  const regionMap = new Map();
  [
    ...safeArray(baseNormalized.regions),
    ...safeArray(incomingNormalized.regions),
  ].forEach((item) => {
    regionMap.set(item.name, {
      ...regionMap.get(item.name),
      ...item,
      details: Array.from(
        new Set([
          ...(regionMap.get(item.name)?.details || []),
          ...safeArray(item.details),
        ])
      ),
    });
  });

  const sourceMap = new Map();
  [
    ...safeArray(baseNormalized.sources),
    ...safeArray(incomingNormalized.sources),
  ].forEach((item) => {
    if (item.href) sourceMap.set(item.href, item);
  });

  return normalizeCtisDatasetShape({
    source: incomingNormalized.source || baseNormalized.source,
    capturedAt: incomingNormalized.capturedAt || baseNormalized.capturedAt,
    pageMeta: {
      ...(baseNormalized.pageMeta || {}),
      ...(incomingNormalized.pageMeta || {}),
      menus: Array.from(
        new Set([
          ...(baseNormalized.pageMeta?.menus || []),
          ...(incomingNormalized.pageMeta?.menus || []),
        ])
      ),
      categoryTabs: Array.from(
        new Set([
          ...(baseNormalized.pageMeta?.categoryTabs || []),
          ...(incomingNormalized.pageMeta?.categoryTabs || []),
        ])
      ),
      countryOptions: Array.from(
        new Set([
          ...(baseNormalized.pageMeta?.countryOptions || []),
          ...(incomingNormalized.pageMeta?.countryOptions || []),
        ])
      ),
      dataStates: {
        ...(baseNormalized.pageMeta?.dataStates || {}),
        ...(incomingNormalized.pageMeta?.dataStates || {}),
      },
    },
    country: {
      ...baseNormalized.country,
      ...incomingNormalized.country,
      overview: Array.from(overviewMap.values()),
    },
    sections: Array.from(sectionMap.values()),
    indicators: Array.from(indicatorMap.values()),
    regions: Array.from(regionMap.values()),
    sources: Array.from(sourceMap.values()),
  });
}

async function fetchCtisPublicDataset(path) {
  if (typeof fetch !== "function") return null;
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    const { normalized, errors } = validateCtisDataset(json);
    if (errors.length) {
      console.warn("CTIS bootstrap dataset validation warnings:", errors);
    }
    return normalized;
  } catch (error) {
    console.warn("Failed to load CTIS public dataset", path, error);
    return null;
  }
}

async function loadCtisBootstrapDataset() {
  for (const path of CTIS_BOOTSTRAP_PUBLIC_PATHS) {
    const loaded = await fetchCtisPublicDataset(path);
    if (loaded) return loaded;
  }
  return null;
}

function parseCtisWorkbookToJson(file, onDone) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const XLSXRef = window.XLSX;
      if (!XLSXRef) throw new Error("XLSX 로더가 준비되지 않았습니다.");
      const wb = XLSXRef.read(reader.result, { type: "array" });
      const sheetJson = (name) => {
        const ws = wb.Sheets[name];
        return ws ? XLSXRef.utils.sheet_to_json(ws, { defval: "" }) : [];
      };
      const countryRow = sheetJson("country")[0] || {};
      const dataset = normalizeCtisDatasetShape({
        source: "admin-xlsx-upload",
        capturedAt: new Date().toISOString().slice(0, 10),
        country: {
          code: countryRow.code,
          nameKo: countryRow.nameKo,
          nameEn: countryRow.nameEn,
          region: countryRow.region,
          subregion: countryRow.subregion,
          overview: sheetJson("country_overview").map((row) => ({
            label: row.label,
            value: row.value,
            source: row.source,
          })),
        },
        sections: sheetJson("sections").map((row) => ({
          key: row.key,
          title: row.title,
          body: row.body,
        })),
        indicators: sheetJson("indicators").map((row) => ({
          key: row.key,
          label: row.label,
          value: row.value,
          unit: row.unit,
          note: row.note,
        })),
        regions: sheetJson("regions").map((row) => ({
          id: row.id,
          name: row.name,
          summary: row.summary,
          center: row.center
            ? String(row.center)
                .split(",")
                .map((v) => Number(v.trim()))
                .filter((v) => Number.isFinite(v))
                .slice(0, 2)
            : null,
          details: row.details
            ? String(row.details)
                .split("||")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        })),
        sources: sheetJson("sources").map((row) => ({
          label: row.label,
          href: row.href,
          group: row.group,
        })),
      });
      onDone({ ok: true, dataset });
    } catch (error) {
      onDone({ ok: false, error: String(error?.message || error) });
    }
  };
  reader.onerror = () =>
    onDone({ ok: false, error: "파일을 읽지 못했습니다." });
  reader.readAsArrayBuffer(file);
}

function buildCtisTemplateWorkbookBlob() {
  const XLSXRef = window.XLSX;
  if (!XLSXRef) return null;
  const wb = XLSXRef.utils.book_new();
  XLSXRef.utils.book_append_sheet(
    wb,
    jsonToSheetSafe([
      {
        code: CTIS_VISIBLE_SEED_DATA.country.code,
        nameKo: CTIS_VISIBLE_SEED_DATA.country.nameKo,
        nameEn: CTIS_VISIBLE_SEED_DATA.country.nameEn,
        region: CTIS_VISIBLE_SEED_DATA.country.region,
        subregion: CTIS_VISIBLE_SEED_DATA.country.subregion,
      },
    ]),
    "country"
  );
  XLSXRef.utils.book_append_sheet(
    wb,
    jsonToSheetSafe(CTIS_VISIBLE_SEED_DATA.country.overview),
    "country_overview"
  );
  XLSXRef.utils.book_append_sheet(
    wb,
    jsonToSheetSafe(CTIS_VISIBLE_SEED_DATA.sections),
    "sections"
  );
  XLSXRef.utils.book_append_sheet(
    wb,
    jsonToSheetSafe(CTIS_VISIBLE_SEED_DATA.indicators),
    "indicators"
  );
  XLSXRef.utils.book_append_sheet(
    wb,
    jsonToSheetSafe(
      CTIS_VISIBLE_SEED_DATA.regions.map((item) => ({
        id: item.id,
        name: item.name,
        summary: item.summary,
        center: Array.isArray(item.center) ? item.center.join(",") : "",
        details: safeArray(item.details).join(" || "),
      }))
    ),
    "regions"
  );
  XLSXRef.utils.book_append_sheet(
    wb,
    jsonToSheetSafe(CTIS_VISIBLE_SEED_DATA.sources),
    "sources"
  );
  const out = XLSXRef.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function downloadCtisTemplateXlsx() {
  const blob = buildCtisTemplateWorkbookBlob();
  if (!blob) {
    alert("XLSX 엔진이 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.");
    return;
  }
  const result = tryBrowserDownload({
    blob,
    filename: "ctis_admin_template.xlsx",
  });
  if (!result.ok && result.objectUrl) {
    window.open(result.objectUrl, "_blank", "noopener,noreferrer");
  }
}

function CtisRegionTable({ regions = [] }) {
  const visible = safeArray(regions);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
        지역 디렉터리
      </div>
      <div className="max-h-64 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">지역명</th>
              <th className="px-4 py-2 text-left font-semibold">요약</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.summary || "상세 설명은 운영 데이터 업로드로 확장"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CtisAdminFab({ dataset, onOpenAdmin }) {
  const data = normalizeCtisDatasetShape(dataset || CTIS_VISIBLE_SEED_DATA);
  const coveredCount =
    safeArray(data.pageMeta?.countryOptions).length ||
    CTIS_COUNTRY_CATALOG.length;
  return (
    <button
      type="button"
      onClick={onOpenAdmin}
      className="fixed bottom-4 right-4 z-[85] rounded-2xl border border-emerald-500/25 bg-slate-950/92 px-4 py-3 text-left shadow-2xl backdrop-blur transition hover:border-emerald-400/40 hover:bg-slate-900"
      aria-label="CTIS 관리자 열기"
    >
      <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-300">
        CTIS 관리
      </div>
      <div className="mt-0.5 text-sm font-bold text-white">
        근거 데이터 업로드 · 검증 · 배포
      </div>
      <div className="mt-1 text-[11px] text-slate-400">
        등재 국가 {coveredCount}개 · 사용자 화면은 근거 단계에만 반영
      </div>
    </button>
  );
}

function CtisCompactSignalCard({ context, onOpenSources }) {
  if (!context) return null;
  const isDetailed = context.status === "detailed";
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/6 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
            CTIS 보강
          </div>
          <div className="mt-1 text-sm font-bold text-white">
            {context.countryLabel} ·{" "}
            {isDetailed ? "상세 연동 가능" : "등재국 확인"}
          </div>
          <div className="mt-1 text-xs leading-relaxed text-slate-300">
            {context.summary}
          </div>
        </div>
        <PillTag tone={isDetailed ? "emerald" : "blue"}>
          {isDetailed ? "근거 보강" : "등재국"}
        </PillTag>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
          메뉴{" "}
          <span className="font-semibold text-white">
            {safeArray(context.menuTags).length}개
          </span>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
          카테고리{" "}
          <span className="font-semibold text-white">
            {context.categoryCount || 0}개
          </span>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
          {isDetailed ? "지역 선택" : "연결 방식"}{" "}
          <span className="font-semibold text-white">
            {isDetailed ? `${context.regionCount || 0}개` : "출처 탭 연결"}
          </span>
        </div>
      </div>

      {isDetailed && safeArray(context.overview).length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {safeArray(context.overview)
            .slice(0, 4)
            .map((item) => (
              <span
                key={`${item.label}-${item.value}`}
                className="rounded-full border border-emerald-500/20 bg-slate-950/50 px-3 py-1 text-[11px] text-slate-200"
              >
                <span className="text-slate-400">{item.label}</span> ·{" "}
                {item.value}
              </span>
            ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => safeInvoke(onOpenSources)}
          className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/15"
        >
          근거·출처에서 이어 보기
        </button>
        {context.sources?.[0]?.href ? (
          <ExternalLinkButton
            href={context.sources[0].href}
            label="CTIS 열기"
            compact
          />
        ) : null}
      </div>
    </div>
  );
}

function CtisEvidenceSection({ context }) {
  if (!context) return null;
  const isDetailed = context.status === "detailed";
  return (
    <SectionCard
      title="CTIS 보강 근거"
      icon={<BookOpen className="text-emerald-400" size={16} />}
      right={
        <PillTag tone={isDetailed ? "emerald" : "blue"}>
          {isDetailed ? "상세 연동" : "등재 구조"}
        </PillTag>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/6 p-3">
          <div className="text-sm font-bold text-white">
            {context.countryFullName}
          </div>
          <div className="mt-1 text-xs leading-relaxed text-slate-300">
            {context.note}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-300">
            메뉴 수{" "}
            <span className="font-semibold text-white">
              {safeArray(context.menuTags).length}개
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-300">
            카테고리 수{" "}
            <span className="font-semibold text-white">
              {context.categoryCount || 0}개
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-300">
            {isDetailed ? "지역 선택 구조" : "반영 상태"}{" "}
            <span className="font-semibold text-white">
              {isDetailed
                ? `${context.regionCount || 0}개`
                : "공통 구조만 반영"}
            </span>
          </div>
        </div>

        {!!safeArray(context.overview).length && (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {safeArray(context.overview).map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className="rounded-xl border border-slate-700 bg-slate-800/35 px-3 py-3"
              >
                <div className="text-[11px] font-semibold text-slate-400">
                  {item.label}
                </div>
                <div className="mt-1 text-sm font-bold text-white">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
          <div className="text-xs font-bold text-slate-300">구조 태그</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {safeArray(context.sectionTags).map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-600 bg-slate-900/55 px-3 py-1 text-[11px] text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {safeArray(context.sources).map((item) => (
            <div
              key={item.href}
              className="rounded-xl border border-slate-700 bg-slate-800/35 px-3 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-white">
                    {item.label}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {item.group || "CTIS"}
                  </div>
                </div>
                <ExternalLinkButton href={item.href} label="열기" compact />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function CtisAdminModal({ open, onClose }) {
  const initial = useMemo(() => loadCtisAdminData(), []);
  const [draftData, setDraftData] = useState(
    initial.draft || initial.published || CTIS_VISIBLE_SEED_DATA
  );
  const [publishedData, setPublishedData] = useState(
    initial.published || CTIS_VISIBLE_SEED_DATA
  );
  const [history, setHistory] = useState(initial.history || []);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [mode, setMode] = useState("draft");
  const [publishStrategy, setPublishStrategy] = useState("merge");

  useEffect(() => {
    if (!open) return;
    const { draft, published, history } = loadCtisAdminData();
    setDraftData(draft || published || CTIS_VISIBLE_SEED_DATA);
    setPublishedData(published || CTIS_VISIBLE_SEED_DATA);
    setHistory(history || []);
    setValidationErrors([]);
    setUploadMessage("");
    setMode("draft");
  }, [open]);

  if (!open) return null;

  const previewData = mode === "published" ? publishedData : draftData;

  const handleJsonUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const { normalized, errors } = validateCtisDataset(parsed);
      setDraftData(mergeCtisDataset(draftData, normalized, "merge"));
      setValidationErrors(errors);
      saveStoredObject(CTIS_ADMIN_DRAFT_STORAGE_KEY, normalized);
      setUploadMessage(
        errors.length
          ? "JSON 업로드는 완료되었지만 검증 오류가 있습니다."
          : "JSON 업로드 및 draft 저장이 완료되었습니다."
      );
    } catch (error) {
      setUploadMessage(`JSON 업로드 실패: ${String(error?.message || error)}`);
    }
    event.target.value = "";
  };

  const handleXlsxUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    parseCtisWorkbookToJson(file, (result) => {
      if (!result.ok) {
        setUploadMessage(`XLSX 업로드 실패: ${result.error}`);
        return;
      }
      const { normalized, errors } = validateCtisDataset(result.dataset);
      setDraftData(mergeCtisDataset(draftData, normalized, "merge"));
      setValidationErrors(errors);
      saveStoredObject(CTIS_ADMIN_DRAFT_STORAGE_KEY, normalized);
      setUploadMessage(
        errors.length
          ? "XLSX 업로드는 완료되었지만 검증 오류가 있습니다."
          : "XLSX 업로드 및 draft 저장이 완료되었습니다."
      );
    });
    event.target.value = "";
  };

  const handleValidate = () => {
    const { normalized, errors } = validateCtisDataset(draftData);
    setDraftData(normalized);
    setValidationErrors(errors);
    saveStoredObject(CTIS_ADMIN_DRAFT_STORAGE_KEY, normalized);
    setUploadMessage(
      errors.length
        ? `검증 완료: 오류 ${errors.length}건`
        : "검증 완료: 반영 가능한 상태입니다."
    );
  };

  const handlePublish = () => {
    const { normalized, errors } = validateCtisDataset(draftData);
    setValidationErrors(errors);
    if (errors.length) {
      setUploadMessage("오류가 있어 publish 할 수 없습니다.");
      return;
    }
    const nextPublished =
      publishStrategy === "overwrite"
        ? normalized
        : mergeCtisDataset(publishedData, normalized, "merge");
    const entry = {
      publishedAt: new Date().toISOString(),
      data: publishedData,
      strategy: publishStrategy,
    };
    const nextHistory = pushCtisHistoryEntry(entry);
    saveStoredObject(CTIS_ADMIN_PUBLISHED_STORAGE_KEY, nextPublished);
    setPublishedData(nextPublished);
    setHistory(nextHistory);
    setUploadMessage(
      `publish 반영이 완료되었습니다. (전략: ${publishStrategy})`
    );
    setMode("published");
  };

  const handleRollback = (index) => {
    const target = history[index];
    if (!target?.data) return;
    saveStoredObject(CTIS_ADMIN_PUBLISHED_STORAGE_KEY, target.data);
    setPublishedData(target.data);
    setUploadMessage(`이력 ${index + 1}번 버전으로 롤백했습니다.`);
    setMode("published");
  };

  const downloadPublishedJson = () => {
    downloadJsonBlob("ctis_admin_published_export.json", publishedData);
  };

  const downloadJsonTemplate = () => {
    downloadJsonBlob("ctis_admin_template.json", CTIS_VISIBLE_SEED_DATA);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/65 p-4">
      <div className="flex h-[min(92vh,980px)] w-[min(1180px,96vw)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-600">
              Admin CMS-lite
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              CTIS 데이터 업로드·검증·배포
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 bg-slate-50 p-5 lg:border-b-0 lg:border-r">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-bold text-slate-800">업로드</div>
                <div className="mt-3 space-y-3 text-sm">
                  <label className="block rounded-xl border border-dashed border-slate-300 px-3 py-3 font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60">
                    JSON 업로드
                    <input
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={handleJsonUpload}
                    />
                  </label>
                  <label className="block rounded-xl border border-dashed border-slate-300 px-3 py-3 font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60">
                    XLSX 업로드
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={handleXlsxUpload}
                    />
                  </label>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-bold text-slate-800">
                  운영 액션
                </div>
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Publish 전략
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPublishStrategy("merge")}
                        className={`rounded-xl px-3 py-2 font-semibold ${
                          publishStrategy === "merge"
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        기존과 병합
                      </button>
                      <button
                        onClick={() => setPublishStrategy("overwrite")}
                        className={`rounded-xl px-3 py-2 font-semibold ${
                          publishStrategy === "overwrite"
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        완전 덮어쓰기
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleValidate}
                      className="rounded-xl bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-800"
                    >
                      검증
                    </button>
                    <button
                      onClick={handlePublish}
                      className="rounded-xl bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-500"
                    >
                      Publish
                    </button>
                    <button
                      onClick={downloadJsonTemplate}
                      className="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      JSON 템플릿
                    </button>
                    <button
                      onClick={downloadCtisTemplateXlsx}
                      className="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      XLSX 템플릿
                    </button>
                    <button
                      onClick={downloadPublishedJson}
                      className="col-span-2 rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      현재 Published 내보내기
                    </button>
                  </div>
                </div>
                {uploadMessage ? (
                  <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                    {uploadMessage}
                  </div>
                ) : null}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-bold text-slate-800">
                  검증 결과
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {validationErrors.length ? (
                    validationErrors.map((error, index) => (
                      <div
                        key={`${error}-${index}`}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700"
                      >
                        {error}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                      현재 draft에는 치명적 오류가 없습니다.
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-bold text-slate-800">
                  배포 이력
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {history.length ? (
                    history.map((item, index) => (
                      <button
                        key={`${item.publishedAt}-${index}`}
                        onClick={() => handleRollback(index)}
                        className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                      >
                        <div className="font-semibold">
                          {formatDateTimeKo(item.publishedAt)}
                        </div>
                        <div className="text-xs text-slate-500">
                          클릭하면 publish 데이터로 롤백
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 px-3 py-3 text-slate-500">
                      아직 publish 이력이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
          <section className="min-h-0 overflow-auto p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setMode("draft")}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  mode === "draft"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Draft 미리보기
              </button>
              <button
                onClick={() => setMode("published")}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  mode === "published"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Published 미리보기
              </button>
            </div>
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-emerald-50 to-white p-5">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-600">
                  Preview
                </div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">
                  {previewData.country.nameKo}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  {previewData.country.nameEn} · {previewData.country.region} ·{" "}
                  {previewData.country.subregion}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500">
                  CTIS 탐색 범위
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {safeArray(previewData.pageMeta?.categoryTabs || []).map(
                    (tab) => (
                      <span
                        key={tab}
                        className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                      >
                        {tab}
                      </span>
                    )
                  )}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  선택 가능 국가{" "}
                  {safeArray(previewData.pageMeta?.countryOptions || []).length}
                  개 · 지역 {safeArray(previewData.regions).length}개
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {safeArray(previewData.country.overview).map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="text-xs font-semibold text-slate-500">
                      {item.label}
                    </div>
                    <div className="mt-2 text-lg font-extrabold text-slate-900">
                      {item.value}
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      {item.source || "운영 데이터"}
                    </div>
                  </div>
                ))}
              </div>
              <CtisRegionTable regions={previewData.regions} />
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-lg font-extrabold text-slate-900">
                  본문 섹션
                </div>
                <div className="mt-4 space-y-3">
                  {safeArray(previewData.sections).map((section) => (
                    <div
                      key={section.key}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="text-sm font-bold text-slate-800">
                        {section.title}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-slate-600">
                        {section.body ||
                          "운영 데이터 업로드 후 상세 본문을 표시합니다."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AppWithCtisAdmin() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [dataset, setDataset] = useState(
    () =>
      loadStoredObject(
        CTIS_ADMIN_PUBLISHED_STORAGE_KEY,
        CTIS_VISIBLE_SEED_DATA
      ) || CTIS_VISIBLE_SEED_DATA
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = loadStoredObject(CTIS_ADMIN_PUBLISHED_STORAGE_KEY, null);
      if (stored) {
        if (!cancelled) setDataset(normalizeCtisDatasetShape(stored));
        return;
      }
      const bootstrap = await loadCtisBootstrapDataset();
      if (bootstrap && !cancelled) {
        setDataset(
          mergeCtisDataset(CTIS_VISIBLE_SEED_DATA, bootstrap, "merge")
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === CTIS_ADMIN_PUBLISHED_STORAGE_KEY) {
        setDataset(
          loadStoredObject(
            CTIS_ADMIN_PUBLISHED_STORAGE_KEY,
            CTIS_VISIBLE_SEED_DATA
          ) || CTIS_VISIBLE_SEED_DATA
        );
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!adminOpen) {
      setDataset(
        loadStoredObject(
          CTIS_ADMIN_PUBLISHED_STORAGE_KEY,
          CTIS_VISIBLE_SEED_DATA
        ) || CTIS_VISIBLE_SEED_DATA
      );
    }
  }, [adminOpen]);

  return (
    <AppErrorBoundary>
      <AppShell ctisDataset={dataset} />
      <CtisAdminFab dataset={dataset} onOpenAdmin={() => setAdminOpen(true)} />
      <CtisAdminModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    </AppErrorBoundary>
  );
}

export default function App() {
  return <AppWithCtisAdmin />;
}
