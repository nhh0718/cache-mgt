import "../style.css"

import { CookieIcon } from "../shared/components/cookie-icon"
import { useTheme } from "../shared/hooks/use-theme"

function PrivacyPolicy() {
  useTheme()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <CookieIcon size={32} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cookie Manager — Privacy Policy
          </h1>
        </div>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <p className="text-gray-500 dark:text-gray-400">
            Last updated: March 23, 2026
          </p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Overview
            </h2>
            <p>
              Cookie Manager is a browser extension that helps you view, edit, search,
              import, export, and manage HTTP cookies in your Chrome browser. We are
              committed to protecting your privacy and being transparent about our practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Data Collection
            </h2>
            <p><strong>We do NOT collect, transmit, or store any of your data on external servers.</strong></p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>No personal information is collected</li>
              <li>No browsing history is tracked</li>
              <li>No cookie data is sent to any remote server</li>
              <li>No analytics or telemetry data is gathered</li>
              <li>No third-party tracking scripts are included</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Data Storage
            </h2>
            <p>
              All data (saved cookie profiles, user preferences, theme settings, and language
              preferences) is stored <strong>locally</strong> on your device using the Chrome
              Storage API (<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">chrome.storage.local</code>).
              This data never leaves your browser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Permissions Explained
            </h2>
            <ul className="space-y-3">
              <li>
                <strong className="text-gray-900 dark:text-white">cookies</strong> — Required to read,
                create, modify, and delete browser cookies. This is the core functionality of the extension.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">storage</strong> — Used to save your
                preferences (theme, language) and cookie profiles locally on your device.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">tabs</strong> — Used to detect the
                current active tab so we can show cookies relevant to the website you are visiting.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">sidePanel</strong> — Enables the side
                panel view for convenient cookie management alongside your browsing.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">host_permissions (&lt;all_urls&gt;)</strong> — Required
                by the Chrome Cookies API to read and manage cookies across all websites. Without this
                permission, the extension cannot access cookies for arbitrary domains. No data from
                these websites is collected or transmitted.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Third-Party Services
            </h2>
            <p>
              This extension does <strong>not</strong> use any third-party services,
              APIs, SDKs, analytics tools, or advertising networks. It operates entirely offline
              within your browser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Open Source
            </h2>
            <p>
              The complete source code of this extension is available for review at{" "}
              <a href="https://github.com/nhh0718/cache-mgt" target="_blank" rel="noopener noreferrer"
                className="text-cookie-600 underline hover:text-cookie-700 dark:text-cookie-400">
                github.com/nhh0718/cache-mgt
              </a>. You can inspect every line of code to verify our privacy claims.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Changes to This Policy
            </h2>
            <p>
              If we make changes to this privacy policy, we will update the &quot;Last updated&quot;
              date above. Continued use of the extension after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Contact
            </h2>
            <p>
              If you have questions about this privacy policy, please open an issue on our{" "}
              <a href="https://github.com/nhh0718/cache-mgt/issues" target="_blank" rel="noopener noreferrer"
                className="text-cookie-600 underline hover:text-cookie-700 dark:text-cookie-400">
                GitHub repository
              </a>.
            </p>
          </section>
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400">
          Cookie Manager v0.1.0
        </footer>
      </div>
    </div>
  )
}

export default PrivacyPolicy
