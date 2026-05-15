import { copy, type Language } from "@/lib/i18n";

export function ReferenceGuide({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <section className="reference-guide" aria-labelledby="reference-guide-title">
      <div className="section-heading">
        <h2 id="reference-guide-title">{t.referenceTitle}</h2>
        <p>{t.referenceDescription}</p>
      </div>
      <div className="reference-grid">
        <article className="reference-card">
          <h3>{t.buyReferenceTitle}</h3>
          <h4>{t.fearGreedReferenceLabel}</h4>
          <ul>
            {t.buyFearGreedRules.split("|").map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h4>{t.vixReferenceLabel}</h4>
          <ul>
            {t.buyVixRules.split("|").map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="reference-card">
          <h3>{t.sellReferenceTitle}</h3>
          <h4>{t.fearGreedReferenceLabel}</h4>
          <ul>
            {t.sellFearGreedRules.split("|").map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h4>{t.vixReferenceLabel}</h4>
          <ul>
            {t.sellVixRules.split("|").map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
