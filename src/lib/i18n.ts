import type { DecisionSnapshot, IndicatorSnapshot } from "./types";
import type { ProviderCapability } from "./providerMatrix";

export type Language = "en" | "ko";

export const copy = {
  en: {
    language: "Language",
    english: "English",
    korean: "Korean",
    eyebrow: "FearSignal Market Sentiment",
    composite: "Composite",
    fearGreedIndex: "Fear & Greed Index",
    components: "Components",
    confidence: "Confidence",
    cache: "Cache",
    currentScore: "Current score",
    extremeFear: "Extreme fear",
    neutral: "Neutral",
    extremeGreed: "Extreme greed",
    noHistory:
      "FearSignal does not show historical charts until real persisted history is available. This prevents demo-like or synthetic data from being mistaken for market history.",
    indicators: "Indicators",
    raw: "Raw",
    asOf: "As of",
    unknown: "Unknown",
    source: "Source",
    sourceHealthMatrix: "Source Health Matrix",
    sourceHealthDescription:
      "Seven component indicators are collected in the background. The main signal shows the calculated Fear & Greed index plus VIX confirmation.",
    required: "Required",
    fallback: "Fallback",
    yes: "Yes",
    no: "No",
    confidenceSuffix: "confidence",
    disclaimer:
      "This is an informational market-sentiment signal, not financial advice or a recommendation to buy or sell.",
  },
  ko: {
    language: "언어",
    english: "영어",
    korean: "한국어",
    eyebrow: "FearSignal 시장 심리",
    composite: "종합",
    fearGreedIndex: "공포와 탐욕 지수",
    components: "구성 지표",
    confidence: "신뢰도",
    cache: "캐시",
    currentScore: "현재 점수",
    extremeFear: "극단적 공포",
    neutral: "중립",
    extremeGreed: "극단적 탐욕",
    noHistory:
      "실제 저장된 과거 데이터가 준비되기 전까지 FearSignal은 과거 차트를 표시하지 않습니다. 데모성 데이터가 실제 시장 이력처럼 보이는 것을 막기 위한 처리입니다.",
    indicators: "지표",
    raw: "원본값",
    asOf: "기준 시각",
    unknown: "알 수 없음",
    source: "출처",
    sourceHealthMatrix: "데이터 출처 상태",
    sourceHealthDescription:
      "7개 구성 지표는 백그라운드에서 수집하고, 메인 화면에는 계산된 공포와 탐욕 지수와 VIX 확인값을 함께 보여줍니다.",
    required: "필수 여부",
    fallback: "대체 방식",
    yes: "예",
    no: "아니요",
    confidenceSuffix: "신뢰도",
    disclaimer:
      "이 화면은 시장 심리 지표 기반 참고 정보이며, 매수 또는 매도를 권유하는 금융 투자 조언이 아닙니다.",
  },
} satisfies Record<Language, Record<string, string>>;

const statusText = {
  en: {
    healthy: "healthy",
    degraded: "degraded",
    stale: "stale",
    unavailable: "unavailable",
    fresh: "fresh",
    delayed: "delayed",
    unknown: "unknown",
  },
  ko: {
    healthy: "정상",
    degraded: "저하",
    stale: "오래됨",
    unavailable: "사용 불가",
    fresh: "최신",
    delayed: "지연",
    unknown: "불명",
  },
} as const;

const indicatorLabels = {
  en: {
    composite: "Composite Signal",
    market_momentum: "Market Momentum",
    stock_strength: "Stock Price Strength",
    stock_breadth: "Stock Price Breadth",
    put_call: "Put/Call Ratio",
    vix: "VIX Volatility",
    safe_haven: "Safe Haven Demand",
    junk_bond: "Junk Bond Demand",
    fear_greed: "Calculated Fear & Greed",
  },
  ko: {
    composite: "종합 신호",
    market_momentum: "시장 모멘텀",
    stock_strength: "주가 강도",
    stock_breadth: "시장 폭",
    put_call: "풋/콜 비율",
    vix: "VIX 변동성",
    safe_haven: "안전자산 수요",
    junk_bond: "하이일드 채권 수요",
    fear_greed: "직접 계산한 공포와 탐욕",
  },
} as const;

export function translateStatus(value: string, language: Language): string {
  return statusText[language][value as keyof (typeof statusText)[Language]] ?? value;
}

export function translateIndicatorLabel(indicator: IndicatorSnapshot, language: Language): string {
  return indicatorLabels[language][indicator.id] ?? indicator.label;
}

export function decisionDisplayText(decision: DecisionSnapshot, language: Language): string {
  if (language === "en") return decision.displayText;

  switch (decision.displayText) {
    case "Extreme fear: staged-buy opportunity":
      return "극단적 공포: 분할 매수 기회";
    case "Extreme fear: buy opportunity watch":
      return "극단적 공포: 매수 기회 관심";
    case "Fear with elevated VIX: staged-buy watch":
      return "공포와 높은 VIX: 분할 매수 관심";
    case "Fear zone: buy-interest watch":
      return "공포 구간: 매수 관심";
    case "Neutral: wait for a clearer setup":
      return "중립: 더 명확한 구간 대기";
    case "Greed with calm VIX: risk-reduction watch":
      return "탐욕과 낮은 VIX: 리스크 축소 관심";
    case "Greed zone: avoid chasing":
      return "탐욕 구간: 추격 매수 주의";
    case "Extreme greed: consider staged risk reduction":
      return "극단적 탐욕: 분할 매도/리스크 축소 고려";
    case "Extreme greed: avoid new chasing buys":
      return "극단적 탐욕: 신규 추격 매수 회피";
    default:
      return "데이터 부족";
  }
}

export function indicatorReason(indicator: IndicatorSnapshot, language: Language): string {
  if (language === "en") return indicator.reason;

  if (indicator.status === "unavailable") {
    return `${translateIndicatorLabel(indicator, language)} 데이터를 현재 사용할 수 없습니다.`;
  }

  const raw = indicator.rawValue ?? "N/A";
  const score = indicator.normalizedScore ?? "N/A";
  const confidence = indicator.confidence;

  switch (indicator.id) {
    case "composite":
      return `사용 가능한 지표를 종합해 ${score}점으로 계산했습니다. 신뢰도는 ${confidence}%입니다.`;
    case "market_momentum":
      return `S&P 500이 125거래일 평균 대비 어느 위치에 있는지 계산한 점수입니다. 원본값은 ${raw}%입니다.`;
    case "stock_strength":
      return "SPY, QQQ, IWM, RSP가 각자의 52주 범위에서 어디에 있는지 평균낸 대체 지표입니다.";
    case "stock_breadth":
      return `동일가중 S&P 500(RSP)이 시가총액가중 S&P 500(SPY)보다 강한지 보는 대체 지표입니다. 원본값은 ${raw}%입니다.`;
    case "put_call":
      return `옵션 시장의 방어적 심리를 반영합니다. 풋/콜 원본값은 ${raw}입니다.`;
    case "vix":
      return `VIX 변동성을 최근 범위 안에서 0-100 점수로 정규화했습니다. 원본값은 ${raw}입니다.`;
    case "safe_haven":
      return `주식(SPY) 수익률이 중기 국채(IEF) 수익률보다 강한지 비교합니다. 원본값은 ${raw}%입니다.`;
    case "junk_bond":
      return `하이일드 스프레드가 낮을수록 위험 선호가 강하다고 계산합니다. 원본값은 ${raw}%입니다.`;
    case "fear_greed":
      return `CNN에는 요청하지 않고 사용 가능한 7개 구성요소를 평균해 직접 계산한 점수입니다. 현재 점수는 ${score}입니다.`;
    default:
      return indicator.reason;
  }
}

export function errorText(indicator: IndicatorSnapshot, language: Language): string | undefined {
  if (!indicator.errorReason) return undefined;
  const message = friendlyErrorReason(indicator.errorReason, language);
  if (language === "en") return message;
  return `데이터 수집 상태: ${message}`;
}

function friendlyErrorReason(reason: string, language: Language): string {
  if (/HTTP 403|HTTP 418|HTTP 429/i.test(reason)) {
    return language === "ko"
      ? "외부 데이터 제공자가 자동 요청을 제한했습니다. 현재 가능한 지표만 사용합니다."
      : "The external data provider limited automated access. FearSignal is using the available indicators.";
  }

  if (/abort|timeout/i.test(reason)) {
    return language === "ko"
      ? "외부 데이터 요청 시간이 초과되었습니다. 현재 가능한 지표만 사용합니다."
      : "The external data request timed out. FearSignal is using the available indicators.";
  }

  return reason;
}

export function providerName(provider: ProviderCapability, language: Language): string {
  if (language === "en") return provider.sourceName;

  const names: Record<string, string> = {
    market_momentum: "FRED S&P 500",
    stock_strength: "Yahoo Finance ETF 52주 강도 대체 지표",
    stock_breadth: "Yahoo Finance 동일가중 시장 폭 대체 지표",
    put_call: "Cboe 일별 옵션 시장 통계",
    vix: "Cboe VIX 과거 데이터",
    safe_haven: "Yahoo Finance SPY/IEF 차트 데이터",
    junk_bond: "FRED 하이일드 스프레드",
    fear_greed: "직접 계산한 공포와 탐욕",
  };

  return names[provider.id] ?? provider.sourceName;
}

export function providerCadence(provider: ProviderCapability, language: Language): string {
  if (language === "en") return provider.updateCadence;

  const cadences: Record<string, string> = {
    market_momentum: "FRED S&P 500 일별 관측치 기준",
    stock_strength: "Yahoo Finance ETF 일별 차트 기준",
    stock_breadth: "Yahoo Finance SPY/RSP 일별 차트 기준",
    put_call: "Cboe 일별 시장 통계 기준",
    vix: "미국 시장 마감 후 일별 갱신",
    safe_haven: "Yahoo Finance ETF 일별 차트 기준",
    junk_bond: "FRED 일별 하이일드 스프레드 기준",
    fear_greed: "사용 가능한 실데이터 지표를 기반으로 계산",
  };

  return cadences[provider.id] ?? provider.updateCadence;
}

export function providerFallback(provider: ProviderCapability, language: Language): string {
  if (language === "en") return provider.fallbackBehavior;

  const fallbacks: Record<string, string> = {
    market_momentum: "데이터가 없으면 해당 구성요소를 제외하고 신뢰도를 낮춥니다.",
    stock_strength: "유료 52주 신고가/신저가 데이터가 없으므로 ETF 52주 위치 대체 지표를 사용합니다.",
    stock_breadth: "상승/하락 거래량 원자료가 없으므로 RSP 대 SPY 상대성과 대체 지표를 사용합니다.",
    put_call: "비율을 파싱할 수 없으면 값을 만들지 않고 사용 불가로 표시합니다.",
    vix: "실제 데이터가 없으면 값을 만들지 않고 사용 불가로 표시합니다.",
    safe_haven: "SPY 또는 IEF 데이터가 없으면 해당 구성요소를 제외합니다.",
    junk_bond: "FRED 스프레드 데이터가 없으면 해당 구성요소를 제외합니다.",
    fear_greed: "CNN에는 요청하지 않고, 사용 가능한 구성요소만 평균해 직접 계산합니다.",
  };

  return fallbacks[provider.id] ?? provider.fallbackBehavior;
}
