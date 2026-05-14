export type ProviderCapability = {
  id: string;
  sourceName: string;
  sourceUrl: string;
  updateCadence: string;
  requiredFields: string[];
  knownFailureModes: string[];
  fallbackBehavior: string;
  requiredForValidSnapshot: boolean;
};

export const providerMatrix: ProviderCapability[] = [
  {
    id: "vix",
    sourceName: "Cboe VIX Historical Data",
    sourceUrl: "https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv",
    updateCadence: "Daily after market close",
    requiredFields: ["DATE", "CLOSE"],
    knownFailureModes: ["CSV URL unavailable", "Column format changed", "Stale daily close"],
    fallbackBehavior: "Use stale cache if available; otherwise mark VIX unavailable.",
    requiredForValidSnapshot: false,
  },
  {
    id: "put_call",
    sourceName: "Cboe Daily Market Statistics",
    sourceUrl: "https://www.cboe.com/markets/us/options/market-statistics/daily",
    updateCadence: "Daily market statistics page",
    requiredFields: ["TOTAL PUT/CALL RATIO"],
    knownFailureModes: ["HTML changed", "Ratio omitted", "Page blocks server fetch"],
    fallbackBehavior: "Mark unavailable when live ratio cannot be parsed; do not fabricate live values.",
    requiredForValidSnapshot: false,
  },
  {
    id: "cnn_fear_greed",
    sourceName: "CNN Fear & Greed",
    sourceUrl: "https://production.dataviz.cnn.io/index/fearandgreed/graphdata",
    updateCadence: "Intraday or daily, undocumented",
    requiredFields: ["fear_and_greed.score", "fear_and_greed.rating"],
    knownFailureModes: ["Undocumented schema changes", "Endpoint unavailable", "Request blocked"],
    fallbackBehavior: "Treat CNN as optional enrichment and reduce confidence when unavailable.",
    requiredForValidSnapshot: false,
  },
];
