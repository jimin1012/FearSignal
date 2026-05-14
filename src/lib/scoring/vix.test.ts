import { describe, expect, it } from "vitest";
import { scoreVix } from "./vix";

describe("scoreVix", () => {
  it("scores high VIX as fear", () => {
    const result = scoreVix({
      current: 40,
      history: Array.from({ length: 252 }, (_, index) => ({
        date: `2024-${index}`,
        close: 10 + index / 10,
      })),
    });

    expect(result.normalizedScore).toBeLessThan(25);
  });
});
