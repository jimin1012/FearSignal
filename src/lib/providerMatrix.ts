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
    id: "market_momentum",
    sourceName: "FRED S&P 500",
    sourceUrl: "https://fred.stlouisfed.org/series/SP500",
    updateCadence: "Daily FRED observation",
    requiredFields: ["observation_date", "SP500"],
    knownFailureModes: ["FRED CSV unavailable", "Observation delayed", "Missing daily close"],
    fallbackBehavior: "Exclude this component and lower calculated confidence.",
    requiredForValidSnapshot: false,
  },
  {
    id: "stock_strength",
    sourceName: "Yahoo Finance ETF 52-week strength proxy",
    sourceUrl: "https://finance.yahoo.com/",
    updateCadence: "Daily ETF chart data",
    requiredFields: ["SPY close", "QQQ close", "IWM close", "RSP close"],
    knownFailureModes: ["Yahoo chart endpoint unavailable", "Symbol format changed", "Delayed close"],
    fallbackBehavior:
      "Use an ETF 52-week range proxy until paid exchange 52-week high/low data is available.",
    requiredForValidSnapshot: false,
  },
  {
    id: "stock_breadth",
    sourceName: "Yahoo Finance equal-weight breadth proxy",
    sourceUrl: "https://finance.yahoo.com/",
    updateCadence: "Daily ETF chart data",
    requiredFields: ["SPY close", "RSP close"],
    knownFailureModes: ["Yahoo chart endpoint unavailable", "Delayed close", "Proxy differs from advance/decline volume"],
    fallbackBehavior:
      "Use RSP versus SPY relative performance until reliable advance/decline volume data is available.",
    requiredForValidSnapshot: false,
  },
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
    id: "safe_haven",
    sourceName: "Yahoo Finance SPY and IEF chart data",
    sourceUrl: "https://finance.yahoo.com/",
    updateCadence: "Daily ETF chart data",
    requiredFields: ["SPY close", "IEF close"],
    knownFailureModes: ["Yahoo chart endpoint unavailable", "Delayed close"],
    fallbackBehavior: "Exclude this component and lower calculated confidence.",
    requiredForValidSnapshot: false,
  },
  {
    id: "junk_bond",
    sourceName: "FRED ICE BofA US High Yield OAS",
    sourceUrl: "https://fred.stlouisfed.org/series/BAMLH0A0HYM2",
    updateCadence: "Daily FRED observation",
    requiredFields: ["observation_date", "BAMLH0A0HYM2"],
    knownFailureModes: ["FRED CSV unavailable", "ICE/FRED redistribution limits", "Observation delayed"],
    fallbackBehavior: "Exclude this component and lower calculated confidence.",
    requiredForValidSnapshot: false,
  },
  {
    id: "fear_greed",
    sourceName: "FearSignal Calculated Fear & Greed",
    sourceUrl: "",
    updateCadence: "Calculated from available live indicators",
    requiredFields: ["Available normalized component scores"],
    knownFailureModes: ["Underlying providers unavailable", "Too few components available"],
    fallbackBehavior: "Do not call CNN; calculate from available indicators and lower confidence when components are missing.",
    requiredForValidSnapshot: false,
  },
];
