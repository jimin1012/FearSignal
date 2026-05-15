import type { IndicatorSnapshot } from "@/lib/types";
import {
  copy,
  errorText,
  indicatorReason,
  translateIndicatorLabel,
  type Language,
} from "@/lib/i18n";
import { SourceStatus } from "./SourceStatus";

export function IndicatorCard({
  indicator,
  language,
}: {
  indicator: IndicatorSnapshot;
  language: Language;
}) {
  const t = copy[language];

  return (
    <article className="indicator-card">
      <div className="indicator-card__top">
        <div>
          <h3>{translateIndicatorLabel(indicator, language)}</h3>
          <p>{indicator.source}</p>
        </div>
        <strong>{indicator.normalizedScore === null ? "N/A" : indicator.normalizedScore}</strong>
      </div>
      <SourceStatus
        status={indicator.status}
        staleness={indicator.staleness}
        confidence={indicator.confidence}
        language={language}
      />
      <dl className="metrics-list">
        <div>
          <dt>{t.raw}</dt>
          <dd>{indicator.rawValue === null ? "N/A" : indicator.rawValue}</dd>
        </div>
        <div>
          <dt>{t.asOf}</dt>
          <dd>{indicator.asOf ?? t.unknown}</dd>
        </div>
      </dl>
      <p className="reason">{indicatorReason(indicator, language)}</p>
      {errorText(indicator, language) ? <p className="error-note">{errorText(indicator, language)}</p> : null}
      {indicator.sourceUrl ? (
        <a className="source-link" href={indicator.sourceUrl} target="_blank" rel="noreferrer">
          {t.source}
        </a>
      ) : null}
    </article>
  );
}
