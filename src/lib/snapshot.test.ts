import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProviderResult, PutCallData, VixData } from "./types";

vi.mock("./data/providers/cboe", () => ({
  getVixData: vi.fn(),
  getPutCallData: vi.fn(),
}));

vi.mock("./data/providers/cnnFearGreed", () => ({
  getCnnFearGreed: vi.fn(),
}));

const cboe = await import("./data/providers/cboe");
const cnn = await import("./data/providers/cnnFearGreed");
const snapshot = await import("./snapshot");

describe("buildSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns insufficient data when all providers fail", async () => {
    vi.mocked(cboe.getVixData).mockResolvedValue(failed("Cboe VIX Historical Data"));
    vi.mocked(cboe.getPutCallData).mockResolvedValue(failed("Cboe Daily Market Statistics"));
    vi.mocked(cnn.getCnnFearGreed).mockResolvedValue(failed("CNN Fear & Greed"));

    const result = await snapshot.buildSnapshot(false);

    expect(result.decision.label).toBe("insufficient_data");
    expect(result.decision.disclaimer).toMatch(/not financial advice/i);
    expect(result.indicators).toHaveLength(4);
    expect(result.indicators.filter((indicator) => indicator.status === "unavailable")).toHaveLength(3);
    expect(result.indicators.find((indicator) => indicator.id === "cnn_fear_greed")?.status).toBe("degraded");
  });

  it("returns a degraded but valid snapshot when CNN fails", async () => {
    vi.mocked(cboe.getVixData).mockResolvedValue({
      ok: true,
      data: {
        current: 18,
        history: Array.from({ length: 252 }, (_, index) => ({ date: `2024-${index}`, close: 12 + index / 20 })),
      } satisfies VixData,
      source: "Cboe VIX Historical Data",
      sourceUrl: "https://example.com/vix.csv",
      asOf: "2026-05-13",
      staleness: "delayed",
    });
    vi.mocked(cboe.getPutCallData).mockResolvedValue({
      ok: true,
      data: {
        total: 0.9,
        history: Array.from({ length: 252 }, (_, index) => ({ date: `2024-${index}`, total: 0.7 + index / 1000 })),
      } satisfies PutCallData,
      source: "Cboe Daily Market Statistics",
      sourceUrl: "https://example.com/put-call",
      asOf: "2026-05-13",
      staleness: "delayed",
    });
    vi.mocked(cnn.getCnnFearGreed).mockResolvedValue(failed("CNN Fear & Greed"));

    const result = await snapshot.buildSnapshot(false);

    expect(result.decision.label).not.toBe("insufficient_data");
    expect(result.indicators.find((indicator) => indicator.id === "cnn_fear_greed")?.status).toBe("degraded");
    expect(result.cache.ttlSeconds).toBe(900);
  });
});

function failed(source: string): ProviderResult<never> {
  return {
    ok: false,
    source,
    sourceUrl: "https://example.com",
    errorReason: `${source} failed`,
    asOf: null,
    staleness: "unknown",
  };
}
