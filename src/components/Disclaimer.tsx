import { copy, type Language } from "@/lib/i18n";

export function Disclaimer({ language }: { language: Language }) {
  return <p className="disclaimer">{copy[language].disclaimer}</p>;
}
