import { getPutCallData, getVixData } from "./data/providers/cboe";
import {
  getJunkBondDemandData,
  getMarketMomentumData,
  getSafeHavenDemandData,
  getStockBreadthData,
  getStockStrengthData,
} from "./data/providers/marketData";
import { getCachedSnapshot, setCachedSnapshot, SNAPSHOT_TTL_SECONDS } from "./cache";
import { decisionFromFearGreedAndVix } from "./scoring/composite";
import { scoreFearGreedFallback } from "./scoring/fearGreedFallback";
import {
  scoreJunkBondDemand,
  scoreMarketMomentum,
  scoreSafeHavenDemand,
  scoreStockBreadth,
  scoreStockStrength,
  type MarketScore,
} from "./scoring/marketIndicators";
import { scorePutCall } from "./scoring/putCall";
import { scoreVix } from "./scoring/vix";
import type { IndicatorSnapshot, ProviderResult, SnapshotResponse } from "./types";

export async function buildSnapshot(useCache = true): Promise<SnapshotResponse> {
  if (useCache) {
    const cached = getCachedSnapshot();
    if (cached) return cached;
  }

  const [
    marketMomentumResult,
    stockStrengthResult,
    stockBreadthResult,
    putCallResult,
    vixResult,
    safeHavenResult,
    junkBondResult,
  ] = await Promise.all([
    getMarketMomentumData(),
    getStockStrengthData(),
    getStockBreadthData(),
    getPutCallData(),
    getVixData(),
    getSafeHavenDemandData(),
    getJunkBondDemandData(),
  ]);

  const marketMomentumIndicator = scoredIndicator(
    "market_momentum",
    "Market Momentum",
    marketMomentumResult,
    scoreMarketMomentum,
    84,
  );

  const stockStrengthIndicator = scoredIndicator(
    "stock_strength",
    "Stock Price Strength",
    stockStrengthResult,
    scoreStockStrength,
    62,
  );

  const stockBreadthIndicator = scoredIndicator(
    "stock_breadth",
    "Stock Price Breadth",
    stockBreadthResult,
    scoreStockBreadth,
    58,
  );

  const vixIndicator: IndicatorSnapshot = vixResult.ok
    ? (() => {
        const score = scoreVix(vixResult.data);
        return {
          id: "vix",
          label: "VIX Volatility",
          rawValue: score.rawValue,
          normalizedScore: score.normalizedScore,
          asOf: vixResult.asOf,
          source: vixResult.source,
          sourceUrl: vixResult.sourceUrl,
          staleness: vixResult.staleness,
          confidence: vixResult.staleness === "stale" ? 55 : 82,
          status: vixResult.staleness === "stale" ? "stale" : "healthy",
          reason: score.reason,
        };
      })()
    : unavailableIndicator("vix", "VIX Volatility", vixResult.source, vixResult.sourceUrl, vixResult.errorReason);

  const putCallIndicator: IndicatorSnapshot = putCallResult.ok
    ? (() => {
        const score = scorePutCall(putCallResult.data);
        return {
          id: "put_call",
          label: "Put/Call Ratio",
          rawValue: score.rawValue,
          normalizedScore: score.normalizedScore,
          asOf: putCallResult.asOf,
          source: putCallResult.source,
          sourceUrl: putCallResult.sourceUrl,
          staleness: putCallResult.staleness,
          confidence: putCallResult.data.history.length >= 30 ? 75 : 58,
          status: putCallResult.staleness === "stale" ? "stale" : "healthy",
          reason: score.reason,
        };
      })()
    : unavailableIndicator(
        "put_call",
        "Put/Call Ratio",
        putCallResult.source,
        putCallResult.sourceUrl,
        putCallResult.errorReason,
      );

  const safeHavenIndicator = scoredIndicator(
    "safe_haven",
    "Safe Haven Demand",
    safeHavenResult,
    scoreSafeHavenDemand,
    60,
  );

  const junkBondIndicator = scoredIndicator(
    "junk_bond",
    "Junk Bond Demand",
    junkBondResult,
    scoreJunkBondDemand,
    78,
  );

  const calculatedFearGreed = scoreFearGreedFallback([
    { label: "Market Momentum", score: marketMomentumIndicator.normalizedScore },
    { label: "Stock Price Strength", score: stockStrengthIndicator.normalizedScore },
    { label: "Stock Price Breadth", score: stockBreadthIndicator.normalizedScore },
    { label: "Put/Call", score: putCallIndicator.normalizedScore },
    { label: "VIX", score: vixIndicator.normalizedScore },
    { label: "Safe Haven Demand", score: safeHavenIndicator.normalizedScore },
    { label: "Junk Bond Demand", score: junkBondIndicator.normalizedScore },
  ]);

  const fearGreedIndicator: IndicatorSnapshot = {
    id: "fear_greed",
    label: "Calculated Fear & Greed",
    rawValue: calculatedFearGreed.normalizedScore,
    normalizedScore: calculatedFearGreed.normalizedScore,
    asOf: new Date().toISOString(),
    source: "FearSignal calculated model",
    sourceUrl: "",
    staleness: "fresh",
    confidence: calculatedFearGreed.confidence,
    status: calculatedFearGreed.normalizedScore === null ? "unavailable" : "healthy",
    reason: calculatedFearGreed.reason,
  };

  const decision = decisionFromFearGreedAndVix(
    calculatedFearGreed.normalizedScore,
    calculatedFearGreed.confidence,
    vixIndicator.rawValue,
  );

  return setCachedSnapshot({
    generatedAt: new Date().toISOString(),
    cache: {
      status: "miss",
      ttlSeconds: SNAPSHOT_TTL_SECONDS,
      nextRefreshAt: null,
    },
    decision,
    indicators: [
      fearGreedIndicator,
      marketMomentumIndicator,
      stockStrengthIndicator,
      stockBreadthIndicator,
      putCallIndicator,
      vixIndicator,
      safeHavenIndicator,
      junkBondIndicator,
    ],
  });
}

function scoredIndicator<T>(
  id: IndicatorSnapshot["id"],
  label: string,
  result: ProviderResult<T>,
  scoreData: (data: T) => MarketScore,
  healthyConfidence: number,
): IndicatorSnapshot {
  if (!result.ok) {
    return unavailableIndicator(id, label, result.source, result.sourceUrl, result.errorReason);
  }

  const score = scoreData(result.data);
  return {
    id,
    label,
    rawValue: score.rawValue,
    normalizedScore: score.normalizedScore,
    asOf: result.asOf,
    source: result.source,
    sourceUrl: result.sourceUrl,
    staleness: result.staleness,
    confidence: result.staleness === "stale" ? 50 : healthyConfidence,
    status: result.staleness === "stale" ? "stale" : "healthy",
    reason: score.reason,
  };
}

function unavailableIndicator(
  id: IndicatorSnapshot["id"],
  label: string,
  source: string,
  sourceUrl: string,
  errorReason: string,
): IndicatorSnapshot {
  return {
    id,
    label,
    rawValue: null,
    normalizedScore: null,
    asOf: null,
    source,
    sourceUrl,
    staleness: "unknown",
    confidence: 0,
    status: "unavailable",
    errorReason,
    reason: `${label} is unavailable.`,
  };
}
