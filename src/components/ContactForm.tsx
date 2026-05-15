import { copy, type Language } from "@/lib/i18n";

export function ContactForm({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="section-heading">
        <h2 id="contact-title">{t.contactTitle}</h2>
        <p>{t.contactDescription}</p>
      </div>
      <form
        className="contact-form"
        action="https://formspree.io/f/xlgldljw"
        method="POST"
      >
        <input type="hidden" name="_subject" value="FearSignal contact" />
        <label>
          {t.contactName}
          <input type="text" name="name" placeholder={t.contactNamePlaceholder} required />
        </label>
        <label>
          {t.contactEmail}
          <input type="email" name="email" placeholder={t.contactEmailPlaceholder} required />
        </label>
        <label>
          {t.contactMessage}
          <textarea name="message" rows={4} placeholder={t.contactMessagePlaceholder} required />
        </label>
        <button className="contact-submit" type="submit">
          {t.contactSubmit}
        </button>
      </form>
    </section>
  );
}
