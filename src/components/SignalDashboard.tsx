"use client";

import { useState } from "react";
import {
  copy,
  decisionDisplayText,
  providerCadence,
  providerFallback,
  providerName,
  type Language,
} from "@/lib/i18n";
import type { SnapshotResponse } from "@/lib/types";
import { providerMatrix } from "@/lib/providerMatrix";
import { Disclaimer } from "./Disclaimer";
import { IndicatorCard } from "./IndicatorCard";

export function SignalDashboard({ initialSnapshot }: { initialSnapshot: SnapshotResponse }) {
  const [language, setLanguage] = useState<Language>("en");
  const t = copy[language];
  const score = initialSnapshot.decision.score;
  const markerPosition = score === null ? 50 : score;

  return (
    <main className="dashboard-shell">
      <div className="top-bar">
        <fieldset className="language-selector" aria-label={t.language}>
          <legend>{t.language}</legend>
          <label>
            <input
              type="radio"
              name="language"
              value="en"
              checked={language === "en"}
              onChange={() => setLanguage("en")}
            />
            <span>{t.english}</span>
          </label>
          <label>
            <input
              type="radio"
              name="language"
              value="ko"
              checked={language === "ko"}
              onChange={() => setLanguage("ko")}
            />
            <span>{t.korean}</span>
          </label>
        </fieldset>
      </div>

      <section className="hero-panel">
        <div className="hero-panel__content">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{decisionDisplayText(initialSnapshot.decision, language)}</h1>
          <Disclaimer language={language} />
          <div className="hero-metrics" aria-label="Composite signal summary">
            <div>
              <span>{t.composite}</span>
              <strong>{initialSnapshot.decision.score ?? "N/A"}</strong>
            </div>
            <div>
              <span>{t.confidence}</span>
              <strong>{initialSnapshot.decision.confidence}%</strong>
            </div>
            <div>
              <span>{t.cache}</span>
              <strong>{initialSnapshot.cache.status}</strong>
            </div>
          </div>
        </div>
        <div className="score-panel" aria-label="Current composite signal">
          <div className="score-panel__header">
            <span>{t.currentScore}</span>
            <strong>{score ?? "N/A"}</strong>
          </div>
          <div className="score-scale" aria-hidden="true">
            <span className="score-scale__marker" style={{ left: `${markerPosition}%` }} />
          </div>
          <div className="score-labels">
            <span>{t.extremeFear}</span>
            <span>{t.neutral}</span>
            <span>{t.extremeGreed}</span>
          </div>
          <p>{t.noHistory}</p>
        </div>
      </section>

      <section className="section-grid" aria-label={t.indicators}>
        {initialSnapshot.indicators.map((indicator) => (
          <IndicatorCard indicator={indicator} key={indicator.id} language={language} />
        ))}
      </section>

      <section className="capability-section">
        <div className="section-heading">
          <h2>{t.sourceHealthMatrix}</h2>
          <p>{t.sourceHealthDescription}</p>
        </div>
        <div className="capability-grid">
          {providerMatrix.map((provider) => (
            <article className="capability-card" key={provider.id}>
              <h3>{providerName(provider, language)}</h3>
              <p>{providerCadence(provider, language)}</p>
              <dl>
                <div>
                  <dt>{t.required}</dt>
                  <dd>{provider.requiredForValidSnapshot ? t.yes : t.no}</dd>
                </div>
                <div>
                  <dt>{t.fallback}</dt>
                  <dd>{providerFallback(provider, language)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
