import type { IndicatorStatus, Staleness } from "@/lib/types";

export function SourceStatus({
  status,
  staleness,
  confidence,
}: {
  status: IndicatorStatus;
  staleness: Staleness;
  confidence: number;
}) {
  return (
    <div className="source-status" data-status={status}>
      <span>{status}</span>
      <span>{staleness}</span>
      <span>{confidence}% confidence</span>
    </div>
  );
}
