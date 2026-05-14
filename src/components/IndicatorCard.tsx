import type { IndicatorSnapshot } from "@/lib/types";
import { SourceStatus } from "./SourceStatus";

export function IndicatorCard({ indicator }: { indicator: IndicatorSnapshot }) {
  return (
    <article className="indicator-card">
      <div className="indicator-card__top">
        <div>
          <h3>{indicator.label}</h3>
          <p>{indicator.source}</p>
        </div>
        <strong>{indicator.normalizedScore === null ? "N/A" : indicator.normalizedScore}</strong>
      </div>
      <SourceStatus
        status={indicator.status}
        staleness={indicator.staleness}
        confidence={indicator.confidence}
      />
      <dl className="metrics-list">
        <div>
          <dt>Raw</dt>
          <dd>{indicator.rawValue === null ? "N/A" : indicator.rawValue}</dd>
        </div>
        <div>
          <dt>As of</dt>
          <dd>{indicator.asOf ?? "Unknown"}</dd>
        </div>
      </dl>
      <p className="reason">{indicator.reason}</p>
      {indicator.errorReason ? <p className="error-note">{indicator.errorReason}</p> : null}
      {indicator.sourceUrl ? (
        <a className="source-link" href={indicator.sourceUrl} target="_blank" rel="noreferrer">
          Source
        </a>
      ) : null}
    </article>
  );
}
