# Google Chrome Web Store Review — Pre-written Answers

## 1. Single Purpose Description

> **What does your extension do? Describe a single purpose.**

Cookie Manager provides a comprehensive interface for users to view, search, edit, create, delete, import, export, and organize browser cookies. Its single purpose is cookie management — helping developers and power users manage HTTP cookies across all websites.

---

## 2. Permission Justifications

### 2.1 "cookies" permission

> **Why does your extension need the "cookies" permission?**

The cookies permission is the core of this extension. Cookie Manager needs this permission to:
- Read all cookies for display in the cookie list (chrome.cookies.getAll)
- Create new cookies (chrome.cookies.set)
- Delete cookies (chrome.cookies.remove)
- Monitor cookie changes in real-time (chrome.cookies.onChanged)

Without this permission, the extension cannot perform any of its intended functionality.

### 2.2 "storage" permission

> **Why does your extension need the "storage" permission?**

The storage permission is used to persist user preferences locally on the device using chrome.storage.local:
- Theme preference (light/dark/system)
- Language preference (English/Vietnamese)
- Saved cookie profiles (named sets of cookies that users can save and restore)

No data is transmitted externally. Storage is used purely for local persistence between sessions.

### 2.3 "tabs" permission

> **Why does your extension need the "tabs" permission?**

The tabs permission is used to:
- Detect the URL of the currently active tab so the extension can filter and display only cookies relevant to the website the user is visiting
- Listen for tab switches (chrome.tabs.onActivated) and navigation events (chrome.tabs.onUpdated) so the Side Panel view automatically updates when the user switches tabs

The extension only reads the active tab's URL. It does not access tab content, modify pages, or inject scripts.

### 2.4 "sidePanel" permission

> **Why does your extension need the "sidePanel" permission?**

The sidePanel permission enables the Chrome Side Panel view, which allows users to manage cookies in a persistent panel alongside their browsing without blocking the page. This provides a more convenient workflow than the popup, which closes when users interact with the page.

### 2.5 host_permissions: "<all_urls>"

> **Why does your extension need access to all URLs?**

The Chrome Cookies API (chrome.cookies.getAll) requires host permissions to return cookies for a given domain. Since Cookie Manager is designed to manage cookies for ANY website the user visits — not just a predefined list — it requires the `<all_urls>` host permission.

**Important clarifications:**
- This permission does NOT allow the extension to read page content or inject scripts
- This permission is ONLY used with the chrome.cookies API to read/write cookies
- No content scripts are used. No web requests are intercepted.
- The extension does not access, modify, or read any web page content
- The Chrome Cookies API documentation explicitly states that host permissions are required to access cookies for specific domains

**Alternative considered:** We could request individual domain permissions, but this would break the core use case — users need to manage cookies for any website, not a predetermined set.

---

## 3. Remote Code

> **Does your extension use remote code?**

**No.** This extension does not load, execute, or reference any remote code. All JavaScript is bundled locally at build time using Plasmo (Vite + React). There are:
- No remote script tags
- No eval() calls
- No dynamic code loading (import() from remote URLs)
- No WebAssembly loaded from remote sources
- No CDN references

---

## 4. Data Usage / Privacy

> **Does your extension collect or transmit user data?**

**No.** This extension:
- Does NOT collect any personal data
- Does NOT transmit any data to external servers
- Does NOT use analytics (no Google Analytics, no Mixpanel, no telemetry)
- Does NOT include any third-party SDKs or tracking libraries
- Does NOT make any network requests whatsoever

All data (cookie profiles, user settings) is stored locally using chrome.storage.local and never leaves the user's device.

> **Does your extension use cookies or other local storage?**

The extension uses chrome.storage.local to persist:
- User theme preference (light/dark/system) — approximately 20 bytes
- User language preference (en/vi) — approximately 5 bytes
- Saved cookie profiles — variable size, user-generated

The extension reads browser cookies via the chrome.cookies API for display purposes. It does not create any tracking cookies of its own.

---

## 5. Content Security Policy

> **Does your extension have a custom CSP?**

No. This extension uses the default Manifest V3 Content Security Policy. No relaxations are needed because all code is bundled locally.

---

## 6. Externally Connectable

> **Does your extension communicate with external websites or extensions?**

No. The extension does not use `externally_connectable` in its manifest. It does not communicate with any external websites, services, or other extensions.

---

## 7. Active Tab vs Host Permissions

> **Can you use activeTab instead of host_permissions?**

No. The `activeTab` permission only grants temporary access to the current tab when the user explicitly invokes the extension (clicks the icon). However:

1. **chrome.cookies.getAll requires host permissions** — The Cookies API needs explicit host permissions to return cookies for specific domains. `activeTab` does not grant cookie access.
2. **Full Page view shows all cookies across all domains** — This requires broad cookie access, not just the active tab.
3. **Side Panel needs persistent access** — The side panel stays open across tab switches and needs to refresh cookies for each new tab without requiring user re-activation.

---

## 8. Content Scripts

> **Does your extension use content scripts?**

**No.** This extension does not inject any content scripts into web pages. It operates entirely through:
- A popup (browser action)
- A side panel
- Extension pages (full page manager, privacy policy)
- A background service worker

---

## 9. Web Accessible Resources

> **Does your extension expose any resources to web pages?**

No. There are no `web_accessible_resources` defined in the manifest. No extension resources are accessible to web pages.

---

## 10. Background Service Worker

> **What does your background service worker do?**

The background service worker (background/index.ts) has three responsibilities:
1. **Side Panel configuration** — Sets up the side panel behavior on extension load
2. **Message handling** — Listens for messages from the popup to open the side panel via chrome.sidePanel.open()
3. **Cookie change logging** — Listens to chrome.cookies.onChanged for the real-time cookie monitor feature

The service worker is minimal (~30 lines) and does not make any network requests or process user data.

---

## 11. Localization

> **What languages does your extension support?**

- Vietnamese (vi) — default locale
- English (en)

The extension uses a custom i18n system (not chrome.i18n) to allow runtime language switching. Users can toggle between languages via a button in the UI without changing their Chrome browser language.

---

## 12. Known Similar Extensions

> **How is your extension different from existing cookie managers?**

Cookie Manager differentiates through:
1. **Three integrated views** (popup, side panel, full page) — most alternatives only offer a popup
2. **Side Panel support** — persistent cookie view alongside browsing, a Manifest V3 feature
3. **Cookie Profiles** — save and restore named cookie sets for testing
4. **Real-time monitor** — live feed of cookie changes
5. **Multiple export formats** — JSON, Netscape/Mozilla, HTTP Header
6. **Bilingual** — native Vietnamese and English support
7. **Modern stack** — Built with Manifest V3, React, TypeScript

---

## Notes for Reviewer

- Privacy policy is accessible at: `chrome-extension://[ID]/tabs/privacy-policy.html`
- The extension is open source: https://github.com/nhh0718/cache-mgt
- Minimum Chrome version: 116 (Side Panel API support)
- No monetization, no ads, no premium features
