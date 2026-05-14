import { getPutCallData, getVixData } from "./data/providers/cboe";
import { getCnnFearGreed } from "./data/providers/cnnFearGreed";
import { getCachedSnapshot, setCachedSnapshot, SNAPSHOT_TTL_SECONDS } from "./cache";
import { compositeScore, decisionFromScore, makeCompositeIndicator } from "./scoring/composite";
import { scoreFearGreedFallback } from "./scoring/fearGreedFallback";
import { scorePutCall } from "./scoring/putCall";
import { scoreVix } from "./scoring/vix";
import type { IndicatorSnapshot, SnapshotResponse } from "./types";

export async function buildSnapshot(useCache = true): Promise<SnapshotResponse> {
  if (useCache) {
    const cached = getCachedSnapshot();
    if (cached) return cached;
  }

  const [vixResult, putCallResult, cnnResult] = await Promise.all([
    getVixData(),
    getPutCallData(),
    getCnnFearGreed(),
  ]);

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

  const fallbackFearGreed = scoreFearGreedFallback([
    { label: "VIX", score: vixIndicator.normalizedScore },
    { label: "Put/Call", score: putCallIndicator.normalizedScore },
  ]);

  const cnnIndicator: IndicatorSnapshot = cnnResult.ok
    ? {
        id: "cnn_fear_greed",
        label: "CNN Fear & Greed",
        rawValue: cnnResult.data.score,
        normalizedScore: cnnResult.data.score,
        asOf: cnnResult.asOf,
        source: cnnResult.source,
        sourceUrl: cnnResult.sourceUrl,
        staleness: cnnResult.staleness,
        confidence: 80,
        status: "healthy",
        reason: `CNN rates current market sentiment as ${cnnResult.data.rating}.`,
      }
    : {
        id: "cnn_fear_greed",
        label: "CNN Fear & Greed",
        rawValue: fallbackFearGreed.normalizedScore,
        normalizedScore: fallbackFearGreed.normalizedScore,
        asOf: null,
        source: cnnResult.source,
        sourceUrl: cnnResult.sourceUrl,
        staleness: "unknown",
        confidence: fallbackFearGreed.confidence,
        status: "degraded",
        errorReason: cnnResult.errorReason,
        reason: `CNN endpoint unavailable. ${fallbackFearGreed.reason}`,
      };

  const composite = compositeScore({
    vix: vixIndicator,
    putCall: putCallIndicator,
    cnnFearGreed: cnnIndicator,
  });
  const decision = decisionFromScore(composite.score, composite.confidence);
  const compositeIndicator = makeCompositeIndicator(composite);

  return setCachedSnapshot({
    generatedAt: new Date().toISOString(),
    cache: {
      status: "miss",
      ttlSeconds: SNAPSHOT_TTL_SECONDS,
      nextRefreshAt: null,
    },
    decision,
    indicators: [compositeIndicator, vixIndicator, cnnIndicator, putCallIndicator],
  });
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
