export async function fetchTextWithTimeout(url: string, timeoutMs = 6000): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "FearSignal/0.1 (+https://github.com/jimin1012/FearSignal)",
        accept: "text/html,text/csv,application/json;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}
