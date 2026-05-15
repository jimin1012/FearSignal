import { clamp } from "./math";
import type { DecisionSnapshot, IndicatorInput, IndicatorSnapshot } from "../types";

export const DISCLAIMER =
  "This is an informational market-sentiment signal, not financial advice or a recommendation to buy or sell.";

export function decisionFromScore(score: number | null, confidence: number): DecisionSnapshot {
  if (score === null || confidence < 20) {
    return {
      label: "insufficient_data",
      displayText: "Insufficient data",
      score,
      confidence,
      disclaimer: DISCLAIMER,
    };
  }

  if (score <= 24) {
    return {
      label: "buy_opportunity",
      displayText: "Extreme fear: staged-buy watch",
      score,
      confidence,
      disclaimer: DISCLAIMER,
    };
  }

  if (score <= 44) {
    return {
      label: "buy_opportunity",
      displayText: "Fear zone: buy-interest watch",
      score,
      confidence,
      disclaimer: DISCLAIMER,
    };
  }

  if (score <= 55) {
    return {
      label: "watch",
      displayText: "Neutral: watch",
      score,
      confidence,
      disclaimer: DISCLAIMER,
    };
  }

  if (score <= 74) {
    return {
      label: "sell_risk_reduction",
      displayText: "Greed zone: avoid chasing",
      score,
      confidence,
      disclaimer: DISCLAIMER,
    };
  }

  return {
    label: "sell_risk_reduction",
    displayText: "Extreme greed: staged risk-reduction watch",
    score,
    confidence,
    disclaimer: DISCLAIMER,
  };
}

export function decisionFromFearGreedAndVix(
  fearGreedScore: number | null,
  confidence: number,
  vixRawValue: number | null,
): DecisionSnapshot {
  if (fearGreedScore === null || confidence < 20) {
    return {
      label: "insufficient_data",
      displayText: "Insufficient data",
      score: fearGreedScore,
      confidence,
      disclaimer: DISCLAIMER,
    };
  }

  const vix = vixRawValue;
  const hasVix = vix !== null && Number.isFinite(vix);
  const signalScore = finalSignalScore(fearGreedScore, vixRawValue);

  if (signalScore === null) {
    return {
      label: "insufficient_data",
      displayText: "Insufficient data",
      score: null,
      confidence: 0,
      disclaimer: DISCLAIMER,
    };
  }

  if (signalScore <= 24) {
    return {
      label: "buy_opportunity",
      displayText:
        hasVix && vix >= 30
          ? "Extreme fear: staged-buy opportunity"
          : "Extreme fear: buy opportunity watch",
      score: signalScore,
      confidence,
      disclaimer: DISCLAIMER,
    };
  }

  if (signalScore <= 44) {
    return {
      label: "buy_opportunity",
      displayText:
        hasVix && vix >= 20
          ? "Fear with elevated VIX: staged-buy watch"
          : "Fear zone: buy-interest watch",
      score: signalScore,
      confidence,
      disclaimer: DISCLAIMER,
    };
  }

  if (signalScore <= 55) {
    return {
      label: "watch",
      displayText: "Neutral: wait for a clearer setup",
      score: signalScore,
      confidence,
      disclaimer: DISCLAIMER,
    };
  }

  if (signalScore <= 74) {
    return {
      label: "sell_risk_reduction",
      displayText:
        hasVix && vix <= 18
          ? "Greed with calm VIX: risk-reduction watch"
          : "Greed zone: avoid chasing",
      score: signalScore,
      confidence,
      disclaimer: DISCLAIMER,
    };
  }

  return {
    label: "sell_risk_reduction",
    displayText:
      hasVix && vix <= 20
        ? "Extreme greed: consider staged risk reduction"
        : "Extreme greed: avoid new chasing buys",
    score: signalScore,
    confidence,
    disclaimer: DISCLAIMER,
  };
}

export function finalSignalScore(
  fearGreedScore: number | null,
  vixRawValue: number | null,
): number | null {
  if (fearGreedScore === null || !Number.isFinite(fearGreedScore)) return null;

  const vixScore = scoreVixRawForSignal(vixRawValue);
  if (vixScore === null) return Math.round(clamp(fearGreedScore));

  return Math.round(clamp(fearGreedScore * 0.65 + vixScore * 0.35));
}

function scoreVixRawForSignal(vixRawValue: number | null): number | null {
  if (vixRawValue === null || !Number.isFinite(vixRawValue)) return null;

  const points = [
    { vix: 10, score: 95 },
    { vix: 12, score: 90 },
    { vix: 15, score: 82 },
    { vix: 20, score: 70 },
    { vix: 25, score: 55 },
    { vix: 30, score: 35 },
    { vix: 40, score: 20 },
    { vix: 50, score: 10 },
  ];

  if (vixRawValue <= points[0].vix) return points[0].score;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (vixRawValue <= current.vix) {
      const ratio = (vixRawValue - previous.vix) / (current.vix - previous.vix);
      return previous.score + (current.score - previous.score) * ratio;
    }
  }

  return 5;
}

export function compositeScore(indicators: {
  vix: IndicatorInput;
  putCall: IndicatorInput;
  fearGreed: IndicatorInput;
  marketMomentum?: IndicatorInput;
  stockStrength?: IndicatorInput;
  stockBreadth?: IndicatorInput;
  safeHaven?: IndicatorInput;
  junkBond?: IndicatorInput;
}): {
  score: number | null;
  confidence: number;
  reason: string;
} {
  const candidates: Array<{ indicator: IndicatorInput | undefined; weight: number }> = [
    { indicator: indicators.fearGreed, weight: 0.4 },
    { indicator: indicators.marketMomentum, weight: 0.1 },
    { indicator: indicators.stockStrength, weight: 0.1 },
    { indicator: indicators.stockBreadth, weight: 0.1 },
    { indicator: indicators.putCall, weight: 0.08 },
    { indicator: indicators.vix, weight: 0.08 },
    { indicator: indicators.safeHaven, weight: 0.07 },
    { indicator: indicators.junkBond, weight: 0.07 },
  ];
  const weighted = candidates
    .filter(
      (item): item is { indicator: IndicatorInput; weight: number } =>
        item.indicator !== undefined &&
        item.indicator.normalizedScore !== null &&
        item.indicator.confidence > 0,
    )
    .map((item) => ({ ...item.indicator, weight: item.weight }));

  if (weighted.length < 2) {
    return {
      score: null,
      confidence: 0,
      reason: "At least two meaningful indicators are required before showing a market signal.",
    };
  }

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  const score =
    weighted.reduce((sum, item) => sum + (item.normalizedScore as number) * item.weight, 0) /
    totalWeight;
  const confidence = weighted.reduce((sum, item) => sum + item.confidence * item.weight, 0) / totalWeight;

  return {
    score: Math.round(clamp(score)),
    confidence: Math.round(clamp(confidence)),
    reason: `Composite uses ${weighted.length} available indicators with confidence-weighted source health.`,
  };
}

export function makeCompositeIndicator(
  composite: ReturnType<typeof compositeScore>,
): IndicatorSnapshot {
  return {
    id: "composite",
    label: "Composite Signal",
    rawValue: composite.score,
    normalizedScore: composite.score,
    asOf: new Date().toISOString(),
    source: "FearSignal model",
    sourceUrl: "",
    staleness: "fresh",
    confidence: composite.confidence,
    status: composite.score === null ? "unavailable" : "healthy",
    reason: composite.reason,
  };
}
