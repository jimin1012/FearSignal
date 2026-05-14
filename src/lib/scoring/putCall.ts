import { clamp, percentileRank, trailingValues } from "./math";
import type { PutCallData } from "../types";

export type PutCallScore = {
  rawValue: number;
  normalizedScore: number;
  reason: string;
};

export function scorePutCall(data: PutCallData): PutCallScore {
  const history252 = trailingValues(data.history, (item) => item.total, 252);
  const trailing5 = trailingValues(data.history, (item) => item.total, 4);
  const fiveDayAverage =
    [...trailing5, data.total].reduce((sum, value) => sum + value, 0) /
    Math.max(1, trailing5.length + 1);
  const hasHistory = history252.length >= 30;
  const percentile = hasHistory ? percentileRank(fiveDayAverage, history252) : null;
  const score = hasHistory
    ? clamp(100 - (percentile as number))
    : clamp(100 - ((fiveDayAverage - 0.65) / (1.45 - 0.65)) * 100);
  const overheat =
    percentile !== null && percentile >= 95
      ? " Put/call is extremely elevated, so this is also a contrarian watch zone."
      : "";
  const method = hasHistory
    ? `5-day average near the ${Math.round(percentile as number)}th percentile`
    : "current-ratio heuristic because historical put/call samples are unavailable";

  return {
    rawValue: data.total,
    normalizedScore: Math.round(score),
    reason: `Total put/call ${data.total.toFixed(2)} uses ${method}.${overheat}`,
  };
}
