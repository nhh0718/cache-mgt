import { useI18n } from "../hooks/use-i18n"
import { type Theme, useTheme } from "../hooks/use-theme"

/** Compact theme toggle button cycling light → dark → system */
export function ThemeToggle() {
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()

  const nextTheme: Record<Theme, Theme> = {
    light: "dark",
    dark: "system",
    system: "light"
  }

  const icons: Record<Theme, React.ReactNode> = {
    light: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    dark: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    system: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  }

  const labels: Record<Theme, string> = {
    light: t("theme_light"),
    dark: t("theme_dark"),
    system: t("theme_system")
  }

  return (
    <button
      onClick={() => setTheme(nextTheme[theme])}
      title={labels[theme]}
      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600
        dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
    >
      {icons[theme]}
    </button>
  )
}
