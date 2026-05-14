import { fetchJsonWithTimeout } from "../fetch";
import type { CnnFearGreedData, ProviderResult } from "../../types";

export const CNN_FEAR_GREED_URL = "https://production.dataviz.cnn.io/index/fearandgreed/graphdata";

type CnnFearGreedResponse = {
  fear_and_greed?: {
    score?: number;
    rating?: string;
    previous_close?: number;
  };
};

export function parseCnnFearGreed(payload: unknown): CnnFearGreedData {
  const data = payload as CnnFearGreedResponse;
  const score = data.fear_and_greed?.score;
  const rating = data.fear_and_greed?.rating;

  if (!Number.isFinite(score) || typeof rating !== "string") {
    throw new Error("CNN Fear & Greed response is missing score or rating");
  }

  return {
    score: Math.round(score as number),
    rating,
    previousClose: data.fear_and_greed?.previous_close,
  };
}

export async function getCnnFearGreed(): Promise<ProviderResult<CnnFearGreedData>> {
  try {
    const payload = await fetchJsonWithTimeout<unknown>(CNN_FEAR_GREED_URL);
    const data = parseCnnFearGreed(payload);
    return {
      ok: true,
      data,
      source: "CNN Fear & Greed",
      sourceUrl: CNN_FEAR_GREED_URL,
      asOf: new Date().toISOString(),
      staleness: "fresh",
    };
  } catch (error) {
    return {
      ok: false,
      source: "CNN Fear & Greed",
      sourceUrl: CNN_FEAR_GREED_URL,
      errorReason: error instanceof Error ? error.message : "CNN Fear & Greed unavailable",
      asOf: null,
      staleness: "unknown",
    };
  }
}
