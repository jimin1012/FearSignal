import type { SnapshotResponse } from "./types";

const TTL_SECONDS = 900;

let memoryCache:
  | {
      expiresAt: number;
      response: SnapshotResponse;
    }
  | undefined;

export function getCachedSnapshot(): SnapshotResponse | null {
  if (!memoryCache) return null;
  if (Date.now() > memoryCache.expiresAt) return null;
  return {
    ...memoryCache.response,
    cache: {
      ...memoryCache.response.cache,
      status: "hit",
      nextRefreshAt: new Date(memoryCache.expiresAt).toISOString(),
    },
  };
}

export function setCachedSnapshot(response: SnapshotResponse): SnapshotResponse {
  const expiresAt = Date.now() + TTL_SECONDS * 1000;
  const cached = {
    ...response,
    cache: {
      status: "miss" as const,
      ttlSeconds: TTL_SECONDS,
      nextRefreshAt: new Date(expiresAt).toISOString(),
    },
  };

  memoryCache = {
    expiresAt,
    response: cached,
  };

  return cached;
}

export const SNAPSHOT_TTL_SECONDS = TTL_SECONDS;
