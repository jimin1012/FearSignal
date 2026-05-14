export type MarketQuote = {
  symbol: string;
  value: number;
  asOf: string;
};

export async function getOptionalMarketQuote(_symbol: string): Promise<MarketQuote | null> {
  return null;
}
