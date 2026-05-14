export type IndicatorStatus = "healthy" | "degraded" | "stale" | "unavailable";

export type Staleness = "fresh" | "delayed" | "stale" | "unknown";

export type IndicatorId = "vix" | "put_call" | "cnn_fear_greed" | "composite";

export type DecisionLabel =
  | "buy_opportunity"
  | "watch"
  | "sell_risk_reduction"
  | "insufficient_data";

export type CacheStatus = "hit" | "miss" | "stale";

export type IndicatorSnapshot = {
  id: IndicatorId;
  label: string;
  rawValue: number | null;
  normalizedScore: number | null;
  asOf: string | null;
  source: string;
  sourceUrl: string;
  staleness: Staleness;
  confidence: number;
  status: IndicatorStatus;
  errorReason?: string;
  reason: string;
};

export type DecisionSnapshot = {
  label: DecisionLabel;
  displayText: string;
  score: number | null;
  confidence: number;
  disclaimer: string;
};

export type SnapshotResponse = {
  generatedAt: string;
  cache: {
    status: CacheStatus;
    ttlSeconds: number;
    nextRefreshAt: string | null;
  };
  decision: DecisionSnapshot;
  indicators: IndicatorSnapshot[];
};

export type ProviderResult<T> =
  | {
      ok: true;
      data: T;
      source: string;
      sourceUrl: string;
      asOf: string | null;
      staleness: Staleness;
    }
  | {
      ok: false;
      source: string;
      sourceUrl: string;
      errorReason: string;
      asOf?: string | null;
      staleness?: Staleness;
    };

export type VixData = {
  current: number;
  history: Array<{ date: string; close: number }>;
};

export type PutCallData = {
  total: number;
  equity?: number;
  index?: number;
  spx?: number;
  history: Array<{ date: string; total: number }>;
};

export type CnnFearGreedData = {
  score: number;
  rating: string;
  previousClose?: number;
};

export type IndicatorInput = {
  rawValue: number | null;
  normalizedScore: number | null;
  confidence: number;
  status: IndicatorStatus;
};
