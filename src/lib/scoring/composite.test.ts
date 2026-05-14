import { describe, expect, it } from "vitest";
import { compositeScore, decisionFromScore } from "./composite";
import type { IndicatorInput } from "../types";

const healthy = (score: number): IndicatorInput => ({
  rawValue: score,
  normalizedScore: score,
  confidence: 80,
  status: "healthy",
});

describe("decisionFromScore", () => {
  it("locks buy/watch/sell boundaries", () => {
    expect(decisionFromScore(24, 80).label).toBe("buy_opportunity");
    expect(decisionFromScore(45, 80).label).toBe("watch");
    expect(decisionFromScore(56, 80).label).toBe("sell_risk_reduction");
    expect(decisionFromScore(75, 80).label).toBe("sell_risk_reduction");
  });

  it("returns insufficient data for low confidence", () => {
    expect(decisionFromScore(50, 10).label).toBe("insufficient_data");
  });
});

describe("compositeScore", () => {
  it("requires at least two meaningful indicators", () => {
    const result = compositeScore({
      vix: healthy(20),
      putCall: { rawValue: null, normalizedScore: null, confidence: 0, status: "unavailable" },
      cnnFearGreed: { rawValue: null, normalizedScore: null, confidence: 0, status: "unavailable" },
    });

    expect(result.score).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it("calculates a weighted score", () => {
    const result = compositeScore({
      vix: healthy(20),
      putCall: healthy(40),
      cnnFearGreed: healthy(60),
    });

    expect(result.score).toBe(43);
  });
});
