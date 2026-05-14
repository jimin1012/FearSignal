import { average, clamp } from "./math";

export type FallbackComponent = {
  label: string;
  score: number | null;
};

export function scoreFearGreedFallback(components: FallbackComponent[]): {
  normalizedScore: number | null;
  confidence: number;
  reason: string;
} {
  const available = components.filter((component) => component.score !== null);
  const normalizedScore = average(available.map((component) => component.score as number));
  const confidence = clamp((available.length / Math.max(1, components.length)) * 70);

  if (normalizedScore === null) {
    return {
      normalizedScore: null,
      confidence: 0,
      reason: "Fallback Fear & Greed score is unavailable because no component data is available.",
    };
  }

  return {
    normalizedScore: Math.round(normalizedScore),
    confidence: Math.round(confidence),
    reason: `Fallback Fear & Greed uses ${available.length}/${components.length} available components.`,
  };
}
