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

export function compositeScore(indicators: {
  vix: IndicatorInput;
  putCall: IndicatorInput;
  cnnFearGreed: IndicatorInput;
}): {
  score: number | null;
  confidence: number;
  reason: string;
} {
  const weighted = [
    { ...indicators.cnnFearGreed, weight: indicators.cnnFearGreed.status === "healthy" ? 0.45 : 0.5 },
    { ...indicators.vix, weight: indicators.cnnFearGreed.status === "healthy" ? 0.3 : 0.25 },
    { ...indicators.putCall, weight: 0.25 },
  ].filter((item) => item.normalizedScore !== null && item.confidence > 0);

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
