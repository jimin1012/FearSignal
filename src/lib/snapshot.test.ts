import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MultiSeriesData, ProviderResult, PutCallData, SeriesData, VixData } from "./types";

vi.mock("./data/providers/cboe", () => ({
  getVixData: vi.fn(),
  getPutCallData: vi.fn(),
}));

vi.mock("./data/providers/marketData", () => ({
  getMarketMomentumData: vi.fn(),
  getStockStrengthData: vi.fn(),
  getStockBreadthData: vi.fn(),
  getSafeHavenDemandData: vi.fn(),
  getJunkBondDemandData: vi.fn(),
}));

const cboe = await import("./data/providers/cboe");
const marketData = await import("./data/providers/marketData");
const snapshot = await import("./snapshot");

describe("buildSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns insufficient data when all providers fail", async () => {
    vi.mocked(cboe.getVixData).mockResolvedValue(failed("Cboe VIX Historical Data"));
    vi.mocked(cboe.getPutCallData).mockResolvedValue(failed("Cboe Daily Market Statistics"));
    vi.mocked(marketData.getMarketMomentumData).mockResolvedValue(failed("FRED S&P 500"));
    vi.mocked(marketData.getStockStrengthData).mockResolvedValue(failed("Stooq ETF 52-week strength proxy"));
    vi.mocked(marketData.getStockBreadthData).mockResolvedValue(failed("Stooq equal-weight breadth proxy"));
    vi.mocked(marketData.getSafeHavenDemandData).mockResolvedValue(failed("Stooq SPY and IEF daily data"));
    vi.mocked(marketData.getJunkBondDemandData).mockResolvedValue(failed("FRED ICE BofA US High Yield OAS"));
    const result = await snapshot.buildSnapshot(false);

    expect(result.decision.label).toBe("insufficient_data");
    expect(result.decision.disclaimer).toMatch(/not financial advice/i);
    expect(result.indicators).toHaveLength(8);
    expect(result.indicators.filter((indicator) => indicator.status === "unavailable")).toHaveLength(8);
    expect(result.indicators.find((indicator) => indicator.id === "fear_greed")?.source).toBe(
      "FearSignal calculated model",
    );
  });

  it("returns a valid calculated Fear & Greed snapshot without calling CNN", async () => {
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
    vi.mocked(marketData.getMarketMomentumData).mockResolvedValue(successSeries("FRED S&P 500"));
    vi.mocked(marketData.getStockStrengthData).mockResolvedValue(successMultiSeries("Stooq ETF 52-week strength proxy"));
    vi.mocked(marketData.getStockBreadthData).mockResolvedValue(successMultiSeries("Stooq equal-weight breadth proxy"));
    vi.mocked(marketData.getSafeHavenDemandData).mockResolvedValue(successMultiSeries("Stooq SPY and IEF daily data"));
    vi.mocked(marketData.getJunkBondDemandData).mockResolvedValue(successSeries("FRED ICE BofA US High Yield OAS"));
    const result = await snapshot.buildSnapshot(false);

    expect(result.decision.label).not.toBe("insufficient_data");
    expect(result.decision.score).not.toBeNull();
    expect(result.indicators[0].id).toBe("fear_greed");
    expect(result.indicators.find((indicator) => indicator.id === "fear_greed")?.status).toBe("healthy");
    expect(result.indicators.find((indicator) => indicator.id === "fear_greed")?.sourceUrl).toBe("");
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

function successSeries(source: string): ProviderResult<SeriesData> {
  const history = Array.from({ length: 252 }, (_, index) => ({
    date: `2025-${index}`,
    close: 100 + index,
  }));

  return {
    ok: true,
    data: {
      current: history[history.length - 1].close,
      history,
    },
    source,
    sourceUrl: "https://example.com",
    asOf: "2026-05-13",
    staleness: "delayed",
  };
}

function successMultiSeries(source: string): ProviderResult<MultiSeriesData> {
  const makeHistory = (offset: number) =>
    Array.from({ length: 252 }, (_, index) => ({
      date: `2025-${index}`,
      close: 100 + offset + index,
    }));

  return {
    ok: true,
    data: {
      series: [
        { symbol: "SPY", current: 351, history: makeHistory(0) },
        { symbol: "RSP", current: 356, history: makeHistory(5) },
        { symbol: "QQQ", current: 361, history: makeHistory(10) },
        { symbol: "IWM", current: 366, history: makeHistory(15) },
        { symbol: "IEF", current: 371, history: makeHistory(20) },
      ],
    },
    source,
    sourceUrl: "https://example.com",
    asOf: "2026-05-13",
    staleness: "delayed",
  };
}
