import { fetchTextWithTimeout } from "../fetch";
import type { ProviderResult, PutCallData, VixData } from "../../types";

export const VIX_SOURCE_URL =
  "https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv";

export const PUT_CALL_SOURCE_URL = "https://www.cboe.com/markets/us/options/market-statistics/daily";

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (const char of line) {
    if (char === '"') {
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

export function parseVixCsv(csv: string): VixData {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("VIX CSV is empty");

  const headers = parseCsvLine(lines[0]).map((header) => header.toUpperCase());
  const dateIndex = headers.findIndex((header) => header === "DATE");
  const closeIndex = headers.findIndex((header) => header === "CLOSE" || header === "VIX CLOSE");

  if (dateIndex < 0 || closeIndex < 0) {
    throw new Error("VIX CSV missing DATE or CLOSE column");
  }

  const history = lines
    .slice(1)
    .map((line) => {
      const cells = parseCsvLine(line);
      return {
        date: cells[dateIndex],
        close: Number(cells[closeIndex]),
      };
    })
    .filter((item) => item.date && Number.isFinite(item.close));

  if (history.length === 0) throw new Error("VIX CSV has no valid rows");

  return {
    current: history[history.length - 1].close,
    history,
  };
}

function findRatio(text: string, label: string): number | undefined {
  const normalized = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`${normalized}[^0-9]{0,80}([0-9]+\\.[0-9]+)`, "i"),
    new RegExp(`([0-9]+\\.[0-9]+)[^A-Z0-9]{0,80}${normalized}`, "i"),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = Number(match[1]);
      if (Number.isFinite(value)) return value;
    }
  }

  return undefined;
}

export function parsePutCallHtml(html: string): Omit<PutCallData, "history"> {
  const total = findRatio(html, "TOTAL PUT/CALL RATIO");
  if (!Number.isFinite(total)) throw new Error("Missing total put/call ratio");

  return {
    total: total as number,
    equity: findRatio(html, "EQUITY PUT/CALL RATIO"),
    index: findRatio(html, "INDEX PUT/CALL RATIO"),
    spx: findRatio(html, "SPX + SPXW PUT/CALL RATIO"),
  };
}

export async function getVixData(): Promise<ProviderResult<VixData>> {
  try {
    const csv = await fetchTextWithTimeout(VIX_SOURCE_URL);
    const data = parseVixCsv(csv);
    return {
      ok: true,
      data,
      source: "Cboe VIX Historical Data",
      sourceUrl: VIX_SOURCE_URL,
      asOf: data.history[data.history.length - 1]?.date ?? null,
      staleness: "delayed",
    };
  } catch (error) {
    return {
      ok: false,
      source: "Cboe VIX Historical Data",
      sourceUrl: VIX_SOURCE_URL,
      errorReason: error instanceof Error ? error.message : "VIX data unavailable",
      asOf: null,
      staleness: "unknown",
    };
  }
}

export async function getPutCallData(): Promise<ProviderResult<PutCallData>> {
  try {
    const html = await fetchTextWithTimeout(PUT_CALL_SOURCE_URL);
    const parsed = parsePutCallHtml(html);
    return {
      ok: true,
      data: {
        ...parsed,
        history: [],
      },
      source: "Cboe Daily Market Statistics",
      sourceUrl: PUT_CALL_SOURCE_URL,
      asOf: new Date().toISOString(),
      staleness: "delayed",
    };
  } catch (error) {
    return {
      ok: false,
      source: "Cboe Daily Market Statistics",
      sourceUrl: PUT_CALL_SOURCE_URL,
      errorReason: error instanceof Error ? error.message : "Put/call ratio unavailable",
      asOf: null,
      staleness: "unknown",
    };
  }
}
