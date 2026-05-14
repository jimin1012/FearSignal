import { clamp, percentileRank, trailingValues } from "./math";
import type { VixData } from "../types";

export type VixScore = {
  rawValue: number;
  normalizedScore: number;
  reason: string;
};

export function scoreVix(data: VixData): VixScore {
  const history252 = trailingValues(data.history, (item) => item.close, 252);
  const history50 = trailingValues(data.history, (item) => item.close, 50);
  const percentile = percentileRank(data.current, history252);
  const average50 = history50.reduce((sum, value) => sum + value, 0) / Math.max(1, history50.length);
  const relativeTo50 = average50 > 0 ? data.current / average50 - 1 : 0;
  const adjustment = relativeTo50 > 0.2 ? -10 : relativeTo50 < -0.2 ? 10 : 0;
  const score = clamp(100 - percentile + adjustment);

  return {
    rawValue: data.current,
    normalizedScore: Math.round(score),
    reason: `VIX ${data.current.toFixed(2)} is in the ${Math.round(percentile)}th percentile of recent readings.`,
  };
}
