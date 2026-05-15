import { average, clamp, percentileRank, trailingValues } from "./math";
import type { MultiSeriesData, PricePoint, SeriesData } from "../types";

export type MarketScore = {
  rawValue: number;
  normalizedScore: number;
  reason: string;
};

function changePercent(history: PricePoint[], lookback: number): number | null {
  if (history.length <= lookback) return null;
  const current = history[history.length - 1].close;
  const previous = history[history.length - 1 - lookback].close;
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null;
  return (current / previous - 1) * 100;
}

export function scoreMarketMomentum(data: SeriesData): MarketScore {
  const closes = trailingValues(data.history, (item) => item.close, 125);
  const average125 = closes.reduce((sum, value) => sum + value, 0) / Math.max(1, closes.length);
  const distance = average125 > 0 ? (data.current / average125 - 1) * 100 : 0;
  const score = clamp(50 + distance * 5);

  return {
    rawValue: Number(distance.toFixed(2)),
    normalizedScore: Math.round(score),
    reason: `S&P 500 is ${distance.toFixed(2)}% versus its trailing 125-trading-day average.`,
  };
}

export function scoreStockStrength(data: MultiSeriesData): MarketScore {
  const componentScores = data.series
    .map((item) => {
      const closes = trailingValues(item.history, (point) => point.close, 252);
      const low = Math.min(...closes);
      const high = Math.max(...closes);
      if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) return null;
      return clamp(((item.current - low) / (high - low)) * 100);
    })
    .filter((value): value is number => value !== null);
  const score = average(componentScores) ?? 50;

  return {
    rawValue: Math.round(score),
    normalizedScore: Math.round(score),
    reason:
      "Stock strength proxy averages SPY, QQQ, IWM, and RSP positions inside their own 52-week ranges.",
  };
}

export function scoreStockBreadth(data: MultiSeriesData): MarketScore {
  const spy = data.series.find((item) => item.symbol === "SPY");
  const rsp = data.series.find((item) => item.symbol === "RSP");
  const spyReturn = spy ? changePercent(spy.history, 63) : null;
  const rspReturn = rsp ? changePercent(rsp.history, 63) : null;
  const relative = spyReturn !== null && rspReturn !== null ? rspReturn - spyReturn : 0;
  const score = clamp(50 + relative * 6);

  return {
    rawValue: Number(relative.toFixed(2)),
    normalizedScore: Math.round(score),
    reason: `Breadth proxy compares equal-weight S&P 500 performance to cap-weight S&P 500 over 63 trading days; relative return is ${relative.toFixed(2)}%.`,
  };
}

export function scoreSafeHavenDemand(data: MultiSeriesData): MarketScore {
  const stocks = data.series.find((item) => item.symbol === "SPY");
  const bonds = data.series.find((item) => item.symbol === "IEF");
  const stockReturn = stocks ? changePercent(stocks.history, 20) : null;
  const bondReturn = bonds ? changePercent(bonds.history, 20) : null;
  const spread = stockReturn !== null && bondReturn !== null ? stockReturn - bondReturn : 0;
  const score = clamp(50 + spread * 5);

  return {
    rawValue: Number(spread.toFixed(2)),
    normalizedScore: Math.round(score),
    reason: `Safe-haven proxy compares 20-day SPY return versus IEF return; stock-minus-bond spread is ${spread.toFixed(2)}%.`,
  };
}

export function scoreJunkBondDemand(data: SeriesData): MarketScore {
  const history252 = trailingValues(data.history, (item) => item.close, 252);
  const percentile = percentileRank(data.current, history252);
  const score = clamp(100 - percentile);

  return {
    rawValue: data.current,
    normalizedScore: Math.round(score),
    reason: `High-yield spread is ${data.current.toFixed(2)}%, near the ${Math.round(percentile)}th percentile of recent readings.`,
  };
}
