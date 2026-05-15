import { fetchTextWithTimeout } from "../fetch";
import type { MultiSeriesData, ProviderResult, SeriesData } from "../../types";

export const FRED_SP500_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500";
export const FRED_HIGH_YIELD_SPREAD_URL =
  "https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLH0A0HYM2";
export const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";

type CsvRow = Record<string, string>;

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(csv: string): CsvRow[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV is empty");

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

export function parseFredSeriesCsv(csv: string, valueColumn: string): SeriesData {
  const rows = parseCsv(csv);
  const history = rows
    .map((row) => ({
      date: row.observation_date ?? row.DATE ?? row.date,
      close: Number(row[valueColumn]),
    }))
    .filter((item) => item.date && Number.isFinite(item.close));

  if (history.length === 0) throw new Error(`FRED CSV has no valid ${valueColumn} rows`);

  return {
    current: history[history.length - 1].close,
    history,
  };
}

export function parseStooqDailyCsv(csv: string): SeriesData {
  const rows = parseCsv(csv);
  const history = rows
    .map((row) => ({
      date: row.Date ?? row.DATE ?? row.date,
      close: Number(row.Close ?? row.CLOSE ?? row.close),
    }))
    .filter((item) => item.date && Number.isFinite(item.close));

  if (history.length === 0) throw new Error("Stooq CSV has no valid close rows");

  return {
    current: history[history.length - 1].close,
    history,
  };
}

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
    error?: { description?: string };
  };
};

export function parseYahooChartJson(json: string): SeriesData {
  const parsed = JSON.parse(json) as YahooChartResponse;
  const result = parsed.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];

  const history = timestamps
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      close: Number(closes[index]),
    }))
    .filter((item) => item.date && Number.isFinite(item.close));

  if (history.length === 0) {
    throw new Error(parsed.chart?.error?.description ?? "Yahoo chart response has no valid close rows");
  }

  return {
    current: history[history.length - 1].close,
    history,
  };
}

async function fetchFredSeries(
  url: string,
  valueColumn: string,
  source: string,
): Promise<ProviderResult<SeriesData>> {
  try {
    const csv = await fetchTextWithTimeout(url);
    const data = parseFredSeriesCsv(csv, valueColumn);
    return {
      ok: true,
      data,
      source,
      sourceUrl: url,
      asOf: data.history[data.history.length - 1]?.date ?? null,
      staleness: "delayed",
    };
  } catch (error) {
    return {
      ok: false,
      source,
      sourceUrl: url,
      errorReason: error instanceof Error ? error.message : `${source} unavailable`,
      asOf: null,
      staleness: "unknown",
    };
  }
}

async function fetchYahooSeries(symbol: string): Promise<SeriesData> {
  const url = `${YAHOO_CHART_URL}${encodeURIComponent(symbol)}?range=2y&interval=1d`;
  const json = await fetchTextWithTimeout(url);
  return parseYahooChartJson(json);
}

export async function getMarketMomentumData(): Promise<ProviderResult<SeriesData>> {
  return fetchFredSeries(FRED_SP500_URL, "SP500", "FRED S&P 500");
}

export async function getJunkBondDemandData(): Promise<ProviderResult<SeriesData>> {
  return fetchFredSeries(
    FRED_HIGH_YIELD_SPREAD_URL,
    "BAMLH0A0HYM2",
    "FRED ICE BofA US High Yield OAS",
  );
}

export async function getSafeHavenDemandData(): Promise<ProviderResult<MultiSeriesData>> {
  const source = "Yahoo Finance SPY and IEF chart data";
  try {
    const [stocks, bonds] = await Promise.all([fetchYahooSeries("SPY"), fetchYahooSeries("IEF")]);
    return {
      ok: true,
      data: { series: [{ symbol: "SPY", ...stocks }, { symbol: "IEF", ...bonds }] },
      source,
      sourceUrl: "https://finance.yahoo.com/",
      asOf: stocks.history[stocks.history.length - 1]?.date ?? null,
      staleness: "delayed",
    };
  } catch (error) {
    return {
      ok: false,
      source,
      sourceUrl: "https://finance.yahoo.com/",
      errorReason: error instanceof Error ? error.message : "Safe-haven proxy unavailable",
      asOf: null,
      staleness: "unknown",
    };
  }
}

export async function getStockStrengthData(): Promise<ProviderResult<MultiSeriesData>> {
  const source = "Yahoo Finance ETF 52-week strength proxy";
  try {
    const symbols = ["SPY", "QQQ", "IWM", "RSP"];
    const series = await Promise.all(symbols.map(fetchYahooSeries));
    return {
      ok: true,
      data: {
        series: series.map((item, index) => ({
          symbol: symbols[index],
          ...item,
        })),
      },
      source,
      sourceUrl: "https://finance.yahoo.com/",
      asOf: series[0].history[series[0].history.length - 1]?.date ?? null,
      staleness: "delayed",
    };
  } catch (error) {
    return {
      ok: false,
      source,
      sourceUrl: "https://finance.yahoo.com/",
      errorReason: error instanceof Error ? error.message : "52-week strength proxy unavailable",
      asOf: null,
      staleness: "unknown",
    };
  }
}

export async function getStockBreadthData(): Promise<ProviderResult<MultiSeriesData>> {
  const source = "Yahoo Finance equal-weight breadth proxy";
  try {
    const [capWeighted, equalWeighted] = await Promise.all([
      fetchYahooSeries("SPY"),
      fetchYahooSeries("RSP"),
    ]);
    return {
      ok: true,
      data: {
        series: [
          { symbol: "SPY", ...capWeighted },
          { symbol: "RSP", ...equalWeighted },
        ],
      },
      source,
      sourceUrl: "https://finance.yahoo.com/",
      asOf: capWeighted.history[capWeighted.history.length - 1]?.date ?? null,
      staleness: "delayed",
    };
  } catch (error) {
    return {
      ok: false,
      source,
      sourceUrl: "https://finance.yahoo.com/",
      errorReason: error instanceof Error ? error.message : "Breadth proxy unavailable",
      asOf: null,
      staleness: "unknown",
    };
  }
}
