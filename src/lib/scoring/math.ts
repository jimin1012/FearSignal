export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function average(values: number[]): number | null {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return null;
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

export function percentileRank(value: number, history: number[]): number {
  const finite = history.filter(Number.isFinite).sort((a, b) => a - b);
  if (finite.length === 0 || !Number.isFinite(value)) return 50;
  const lessOrEqual = finite.filter((item) => item <= value).length;
  return clamp((lessOrEqual / finite.length) * 100);
}

export function trailingValues<T>(
  items: T[],
  pick: (item: T) => number,
  count: number,
): number[] {
  return items.slice(Math.max(0, items.length - count)).map(pick).filter(Number.isFinite);
}
