import type { SnapshotResponse } from "@/lib/types";
import { providerMatrix } from "@/lib/providerMatrix";
import { Disclaimer } from "./Disclaimer";
import { IndicatorCard } from "./IndicatorCard";

export function SignalDashboard({ initialSnapshot }: { initialSnapshot: SnapshotResponse }) {
  const score = initialSnapshot.decision.score;
  const markerPosition = score === null ? 50 : score;

  return (
    <main className="dashboard-shell">
      <section className="hero-panel">
        <div className="hero-panel__content">
          <p className="eyebrow">FearSignal Market Sentiment</p>
          <h1>{initialSnapshot.decision.displayText}</h1>
          <Disclaimer />
          <div className="hero-metrics" aria-label="Composite signal summary">
            <div>
              <span>Composite</span>
              <strong>{initialSnapshot.decision.score ?? "N/A"}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong>{initialSnapshot.decision.confidence}%</strong>
            </div>
            <div>
              <span>Cache</span>
              <strong>{initialSnapshot.cache.status}</strong>
            </div>
          </div>
        </div>
        <div className="score-panel" aria-label="Current composite signal">
          <div className="score-panel__header">
            <span>Current score</span>
            <strong>{score ?? "N/A"}</strong>
          </div>
          <div className="score-scale" aria-hidden="true">
            <span className="score-scale__marker" style={{ left: `${markerPosition}%` }} />
          </div>
          <div className="score-labels">
            <span>Extreme fear</span>
            <span>Neutral</span>
            <span>Extreme greed</span>
          </div>
          <p>
            FearSignal does not show historical charts until real persisted history is available.
            This prevents demo-like or synthetic data from being mistaken for market history.
          </p>
        </div>
      </section>

      <section className="section-grid" aria-label="Indicators">
        {initialSnapshot.indicators.map((indicator) => (
          <IndicatorCard indicator={indicator} key={indicator.id} />
        ))}
      </section>

      <section className="capability-section">
        <div className="section-heading">
          <h2>Source Health Matrix</h2>
          <p>Every source is treated as fallible. Degraded data lowers confidence instead of hiding risk.</p>
        </div>
        <div className="capability-grid">
          {providerMatrix.map((provider) => (
            <article className="capability-card" key={provider.id}>
              <h3>{provider.sourceName}</h3>
              <p>{provider.updateCadence}</p>
              <dl>
                <div>
                  <dt>Required</dt>
                  <dd>{provider.requiredForValidSnapshot ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt>Fallback</dt>
                  <dd>{provider.fallbackBehavior}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
