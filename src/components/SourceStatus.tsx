import type { IndicatorStatus, Staleness } from "@/lib/types";
import { copy, translateStatus, type Language } from "@/lib/i18n";

export function SourceStatus({
  status,
  staleness,
  confidence,
  language,
}: {
  status: IndicatorStatus;
  staleness: Staleness;
  confidence: number;
  language: Language;
}) {
  return (
    <div className="source-status" data-status={status}>
      <span>{translateStatus(status, language)}</span>
      <span>{translateStatus(staleness, language)}</span>
      <span>
        {confidence}% {copy[language].confidenceSuffix}
      </span>
    </div>
  );
}
