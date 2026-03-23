import { type Locale, useLocale } from "../hooks/use-i18n"

/** Language toggle button: VI ↔ EN */
export function LocaleToggle() {
  const { locale, setLocale } = useLocale()

  const next: Record<Locale, Locale> = { vi: "en", en: "vi" }

  return (
    <button
      onClick={() => setLocale(next[locale])}
      title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
      className="rounded px-1.5 py-0.5 text-[11px] font-bold tracking-wide
        text-gray-500 hover:bg-gray-100 hover:text-gray-700
        dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
    >
      {locale === "vi" ? "VI" : "EN"}
    </button>
  )
}
