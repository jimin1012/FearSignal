import type { DecisionSnapshot, IndicatorSnapshot, ProviderResult } from "./types";
import type { ProviderCapability } from "./providerMatrix";

export type Language = "en" | "ko";

export const copy = {
  en: {
    language: "Language",
    english: "English",
    korean: "Korean",
    eyebrow: "FearSignal Market Sentiment",
    composite: "Composite",
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
      "Every source is treated as fallible. Degraded data lowers confidence instead of hiding risk.",
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
    confidence: "신뢰도",
    cache: "캐시",
    currentScore: "현재 점수",
    extremeFear: "극단적 공포",
    neutral: "중립",
    extremeGreed: "극단적 탐욕",
    noHistory:
      "실제 저장된 히스토리가 준비되기 전까지 FearSignal은 과거 차트를 표시하지 않습니다. 데모 또는 합성 데이터가 실제 시장 이력으로 오해되는 것을 막기 위한 처리입니다.",
    indicators: "지표",
    raw: "원본값",
    asOf: "기준 시각",
    unknown: "알 수 없음",
    source: "출처",
    sourceHealthMatrix: "데이터 출처 상태",
    sourceHealthDescription:
      "모든 데이터 출처는 실패할 수 있다고 가정합니다. 출처 상태가 나쁘면 위험을 숨기지 않고 신뢰도를 낮춥니다.",
    required: "필수 여부",
    fallback: "대응 방식",
    yes: "예",
    no: "아니오",
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
    vix: "VIX Volatility",
    cnn_fear_greed: "CNN Fear & Greed",
    put_call: "Put/Call Ratio",
  },
  ko: {
    composite: "종합 신호",
    vix: "VIX 변동성",
    cnn_fear_greed: "CNN 공포와 탐욕 지수",
    put_call: "풋/콜 비율",
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

  if (decision.label === "insufficient_data" || decision.score === null) {
    return "데이터 부족";
  }

  if (decision.score <= 24) return "공포 과열: 분할 매수 관심 구간";
  if (decision.score <= 44) return "공포 구간: 매수 관심";
  if (decision.score <= 55) return "중립: 관망 구간";
  if (decision.score <= 74) return "탐욕 구간: 추격 매수 주의";
  return "극단적 탐욕: 분할 매도/리스크 축소 관심 구간";
}

export function indicatorReason(indicator: IndicatorSnapshot, language: Language): string {
  if (language === "en") return indicator.reason;

  if (indicator.status === "unavailable") {
    return `${translateIndicatorLabel(indicator, language)} 데이터를 현재 사용할 수 없습니다.`;
  }

  if (indicator.id === "composite") {
    return `사용 가능한 지표를 종합해 ${indicator.normalizedScore ?? "N/A"}점으로 계산했습니다. 신뢰도는 ${indicator.confidence}%입니다.`;
  }

  if (indicator.id === "vix") {
    return `VIX 원본값은 ${indicator.rawValue ?? "N/A"}이며, 최근 변동성 수준을 0-100 점수로 정규화했습니다.`;
  }

  if (indicator.id === "cnn_fear_greed") {
    return indicator.status === "degraded"
      ? "CNN 지표를 직접 가져오지 못해 사용 가능한 내부 지표 기반 보조 점수로 표시합니다."
      : `CNN 공포와 탐욕 지수 원본 점수는 ${indicator.rawValue ?? "N/A"}입니다.`;
  }

  return `풋/콜 원본값은 ${indicator.rawValue ?? "N/A"}이며, 옵션 시장의 방어적 심리를 반영합니다.`;
}

export function errorText(indicator: IndicatorSnapshot, language: Language): string | undefined {
  if (!indicator.errorReason) return undefined;
  if (language === "en") return indicator.errorReason;
  return `데이터 수집 상태: ${indicator.errorReason}`;
}

export function providerName(provider: ProviderCapability, language: Language): string {
  if (language === "en") return provider.sourceName;

  const names: Record<string, string> = {
    vix: "Cboe VIX 과거 데이터",
    put_call: "Cboe 일별 시장 통계",
    cnn_fear_greed: "CNN 공포와 탐욕",
  };

  return names[provider.id] ?? provider.sourceName;
}

export function providerCadence(provider: ProviderCapability, language: Language): string {
  if (language === "en") return provider.updateCadence;

  const cadences: Record<string, string> = {
    vix: "미국 시장 마감 후 일별 갱신",
    put_call: "Cboe 일별 시장 통계 기준",
    cnn_fear_greed: "문서화되지 않은 엔드포인트 기준, 장중 또는 일별 갱신 가능",
  };

  return cadences[provider.id] ?? provider.updateCadence;
}

export function providerFallback(provider: ProviderCapability, language: Language): string {
  if (language === "en") return provider.fallbackBehavior;

  const fallbacks: Record<string, string> = {
    vix: "캐시된 실제 데이터가 있으면 사용하고, 없으면 VIX를 사용 불가로 표시합니다.",
    put_call: "실시간 비율을 파싱할 수 없으면 값을 만들지 않고 사용 불가로 표시합니다.",
    cnn_fear_greed: "CNN은 보조 지표로 취급하며, 실패 시 신뢰도를 낮추고 대체 계산을 사용합니다.",
  };

  return fallbacks[provider.id] ?? provider.fallbackBehavior;
}
