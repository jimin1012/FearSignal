# FearSignal

FearSignal is a Vercel-ready Next.js dashboard that combines VIX, CNN Fear & Greed, and put/call ratio data into a transparent market-sentiment signal.

The app is informational only. It is not financial advice and does not recommend buying or selling securities.

## Stack

- Next.js 16
- TypeScript
- React
- Recharts
- Vitest
- Vercel deployment target

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Data Sources

- VIX: Cboe VIX historical data
- Put/Call: Cboe Daily Market Statistics
- Fear & Greed: CNN Fear & Greed endpoint when available

CNN is treated as optional enrichment because the endpoint is undocumented. If it fails, the app returns a degraded snapshot with lower confidence instead of failing the entire page.

## Vercel Deployment

No paid API keys or environment variables are required for the MVP.

1. Push this repository to GitHub.
2. Import `jimin1012/FearSignal` in Vercel.
3. Use the default Next.js framework settings.
4. Build command: `npm run build`
5. Install command: `npm install`

The API route `/api/snapshot` sets server-side cache headers and returns source health, cache metadata, and confidence so users can see whether data is fresh, stale, degraded, or unavailable.
