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

function scoreColor(score: number | null): string {
  if (score === null) return "rgba(255,255,255,0.35)";
  if (score <= 25) return "#fa7faa";
  if (score <= 45) return "#f5c842";
  if (score <= 55) return "rgba(255,255,255,0.55)";
  if (score <= 75) return "#d4f06a";
  return "#c2ef4e";
}

function scoreGlow(score: number | null): string {
  if (score === null) return "none";
  if (score <= 25) return "0 0 60px rgba(250,127,170,0.4)";
  if (score <= 45) return "0 0 60px rgba(245,200,66,0.35)";
  if (score <= 55) return "none";
  if (score <= 75) return "0 0 60px rgba(194,239,78,0.25)";
  return "0 0 60px rgba(194,239,78,0.45)";
}

function metricBorderColor(score: number | null): string {
  if (score === null) return "var(--muted)";
  if (score <= 25) return "#fa7faa";
  if (score <= 45) return "#f5c842";
  if (score <= 55) return "rgba(255,255,255,0.3)";
  if (score <= 75) return "#d4f06a";
  return "#c2ef4e";
}

export function SignalDashboard({ initialSnapshot }: { initialSnapshot: SnapshotResponse }) {
  const [language, setLanguage] = useState<Language>("en");
  const t = copy[language];
  const fearGreedIndicator =
    initialSnapshot.indicators.find((indicator) => indicator.id === "fear_greed") ??
    initialSnapshot.indicators[0];
  const vixIndicator = initialSnapshot.indicators.find((indicator) => indicator.id === "vix");
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
            <div style={{ borderLeftColor: metricBorderColor(score) }}>
              <span>{t.fearGreedIndex}</span>
              <strong style={{ color: scoreColor(score) }}>{initialSnapshot.decision.score ?? "N/A"}</strong>
            </div>
            <div>
              <span>VIX</span>
              <strong>{vixIndicator?.rawValue ?? "N/A"}</strong>
            </div>
            <div>
              <span>{t.confidence}</span>
              <strong>{initialSnapshot.decision.confidence}%</strong>
            </div>
          </div>
        </div>
        <div className="score-panel" aria-label="Current Fear and Greed index">
          <div className="score-panel__header">
            <span>{t.currentScore}</span>
            <strong style={{ color: scoreColor(score), textShadow: scoreGlow(score) }}>
              {score ?? "N/A"}
            </strong>
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

      <section className="index-section" aria-label={t.fearGreedIndex}>
        <IndicatorCard indicator={fearGreedIndicator} language={language} />
        {vixIndicator ? <IndicatorCard indicator={vixIndicator} language={language} /> : null}
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
