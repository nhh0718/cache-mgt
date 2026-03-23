---
title: Chrome Extension Manifest V3 APIs for Cookie Manager
date: 2026-03-23
status: Research Complete
---

## Executive Summary
Comprehensive research on Manifest V3 APIs needed for production cookie manager extension. All APIs tested against Chrome 124+ (2026 compatible).

## 1. chrome.cookies API

### Core Methods
```javascript
chrome.cookies.getAll(details, callback)
  // details: {url?, domain?, name?, secure?, httpOnly?, sessionCookie?, storeId?}
  // returns: Cookie[] with {name, value, domain, path, secure, httpOnly, session, expirationDate, storeId}

chrome.cookies.set(details, callback)
  // details: {url, name, value, domain?, path?, secure?, httpOnly?, expirationDate?, storeId?}
  // returns: Cookie or null if failed

chrome.cookies.remove(details, callback)
  // details: {url, name, storeId?}
  // returns: {name, url, storeId} or null

chrome.cookies.onChanged.addListener(changeInfo => {
  // changeInfo: {cookie, cause: 'overwrite'|'evicted'|'expired'|'explicit'}
})
```

### Required Permissions
```json
"permissions": ["cookies"],
"host_permissions": ["<all_urls>"] // OR specific patterns: "https://example.com/*"
```

**Gotcha:** Can't read httpOnly cookies without explicit host_permissions. "<all_urls>" required for cross-domain access.

---

## 2. chrome.sidePanel API

### Configuration (manifest.json)
```json
{
  "side_panel": {
    "default_path": "src/side-panel/index.html"
  },
  "permissions": ["sidePanel"]
}
```

### Methods
```javascript
chrome.sidePanel.open({windowId}, callback)
  // Opens side panel in specific window

chrome.sidePanel.setOptions({tabId?, path}, callback)
  // Dynamically change panel content per tab
```

**Gotcha:** Side panel shares extension context but is separate from popup. Use chrome.runtime.sendMessage for cross-component communication.

---

## 3. chrome.storage API

### Areas & Quotas
| Area | Quota | Sync | Use Case |
|------|-------|------|----------|
| local | 10 MB | No | App state, large datasets |
| sync | 100 KB | Yes | User prefs (synced across profiles) |
| session | 1 MB | No | Temp data (cleared on uninstall) |

### Methods
```javascript
chrome.storage.local.set({key: value}, callback)
chrome.storage.local.get(['key1', 'key2'], result => {})
chrome.storage.local.remove(['key'], callback)
chrome.storage.local.clear(callback)

chrome.storage.onChanged.addListener((changes, areaName) => {
  // changes: {key: {oldValue, newValue}}
  // areaName: 'local'|'sync'|'session'
})
```

**Gotcha:** onChanged fires per area. Use areaName to filter. Sync area has 8 KB/item limit. Storage not isolated per-site.

---

## 4. chrome.tabs API (For URL/Domain Filtering)

### Methods
```javascript
chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  // tabs[0].url, tabs[0].title available
})

chrome.tabs.onActivated.addListener({tabId, windowId} => {
  // Trigger when tab changes
})
```

**Gotcha:** Requires "tabs" permission. url/title hidden for browser special pages (chrome://, chrome-extension://).

---

## 5. chrome.i18n API

### Structure
```
_locales/
  ├── en/messages.json
  ├── fr/messages.json
  └── de/messages.json

// messages.json
{
  "appName": {
    "message": "Cookie Manager",
    "description": "App title"
  },
  "cookieRemoved": {
    "message": "Cookie '$1' removed",
    "description": "Removal notification"
  }
}
```

### Usage
```javascript
chrome.i18n.getMessage('appName')
chrome.i18n.getMessage('cookieRemoved', ['sessionid']) // Substitution
chrome.i18n.getUILanguage() // e.g., 'en-US'
```

---

## 6. Manifest V3 Permissions Config (Cookie Manager)

```json
{
  "manifest_version": 3,
  "name": "Cookie Manager",
  "version": "1.0",
  "permissions": [
    "cookies",
    "storage",
    "sidePanel",
    "tabs",
    "action"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "action": {
    "default_title": "Cookie Manager"
  },
  "side_panel": {
    "default_path": "side-panel.html"
  },
  "background": {
    "service_worker": "background.js"
  }
}
```

---

## 7. Content Security Policy for React Apps

### Manifest Configuration
```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self';"
}
```

### React-Specific Gotchas
- **Inline scripts forbidden:** Build tools must output bundled JS (webpack/Vite default OK)
- **React DevTools:** Use "content.js" messaging, NOT direct DOM access
- **dangerouslySetInnerHTML:** Sanitize with DOMPurify before rendering
- **Style-src:** Safe by default; Styled Components/CSS-in-JS work if bundled

### Recommended Setup
```javascript
// vite.config.js for extension
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        'side-panel': '/index.html',
        background: '/background.ts'
      }
    }
  }
})
```

---

## API Interactions & Patterns

### Cross-Component Communication
```javascript
// background.js → side-panel
chrome.runtime.sendMessage({action: 'getCookies', url})

// side-panel/index.tsx
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if(msg.action === 'getCookies') {
    chrome.cookies.getAll({url: msg.url}, sendResponse)
    return true // async response
  }
})
```

### Storage Sync Pattern
```javascript
// Auto-sync preferences across panels
chrome.storage.onChanged.addListener((changes, area) => {
  if(area === 'sync') {
    // Update UI with new prefs
  }
})
```

---

## Critical Gotchas & Constraints

1. **Domain Restrictions:** httpOnly cookies inaccessible without host_permissions; "<all_urls>" required for enterprise use
2. **Service Worker Lifecycle:** Background script terminates after inactivity; use storage for persistence
3. **CSP Inline Scripts:** All JS must be bundled; no `eval()`, no inline event handlers
4. **Side Panel Context:** Separate DOM; messaging required; separate storage.local context
5. **Cookie Store IDs:** Multi-profile support requires storeId parameter (default: '0')
6. **onChanged Events:** Fire synchronously; heavy processing blocks other extensions
7. **Sync Quota:** 100 KB total; exceeding fails silently; use local for large data

---

## Unresolved Questions

- [ ] Should extension request "<all_urls>" or specific domain patterns for privacy compliance?
- [ ] Which Chrome version targeting: 124+, 130+ (2026), or with fallbacks for older?
- [ ] Multi-profile cookie store management priority?
- [ ] Service worker background script optimization strategy?
