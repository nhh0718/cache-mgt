# 🍪 Cookie Manager — Chrome Extension

Comprehensive cookie management extension for Chrome. View, edit, search, import/export, profiles, real-time monitoring — all in one tool.

## Features

| Feature | Popup | Side Panel | Full Page |
|---------|:-----:|:----------:|:---------:|
| View cookies (current tab) | ✅ | ✅ | ✅ |
| View all cookies (all domains) | — | — | ✅ |
| Search & filter | ✅ | ✅ | ✅ |
| Edit / create / delete | ✅ | ✅ | ✅ |
| Copy (value, name, full string) | ✅ | ✅ | ✅ |
| Bulk select & delete | ✅ | ✅ | ✅ |
| Import / Export (JSON, Netscape, Header) | — | — | ✅ |
| Cookie Profiles (save & restore) | — | — | ✅ |
| Real-time cookie monitor | — | ✅ | ✅ |
| Dark / Light / System theme | ✅ | ✅ | ✅ |
| Vietnamese / English | ✅ | ✅ | ✅ |

## Screenshots

> TODO: Add screenshots after first build

## Installation

### From Chrome Web Store

> Coming soon

### From Source (Developer)

```bash
# Clone
git clone https://github.com/nhh0718/cache-mgt.git
cd cache-mgt

# Install dependencies
pnpm install

# Development (with HMR)
pnpm dev

# Production build
pnpm build
```

Then load the extension:
1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `build/chrome-mv3-dev` (dev) or `build/chrome-mv3-prod` (production) folder

## Tech Stack

- **Framework**: [Plasmo](https://docs.plasmo.com/) (Manifest V3)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3
- **State**: Zustand (persisted via chrome.storage.local)
- **Build**: Vite (via Plasmo)

## Architecture

```
src/
├── background/          # Service worker — cookie listener, message broker
├── popup.tsx            # Popup entry — compact cookie list
├── sidepanel.tsx        # Side panel entry — persistent view with monitor
├── tabs/
│   ├── fullpage.tsx     # Full page — all features, tabs, profiles
│   └── privacy-policy.tsx
└── shared/
    ├── components/      # Reusable UI (cookie-list, editor, toast, etc.)
    ├── hooks/           # use-cookies, use-current-tab, use-i18n, use-theme
    ├── stores/          # Zustand store + chrome.storage adapter
    ├── types/           # TypeScript interfaces
    └── utils/           # Cookie parser, filter logic
```

**Design principle**: All 3 views (popup, sidepanel, fullpage) share the same components from `src/shared/`. Each view is a thin layout wrapper.

## Permissions

| Permission | Why |
|-----------|-----|
| `cookies` | Read, create, modify, delete cookies (core feature) |
| `storage` | Persist preferences & profiles locally |
| `tabs` | Detect active tab URL for domain filtering |
| `sidePanel` | Enable side panel view |
| `<all_urls>` | Chrome Cookies API requires host permissions for cross-domain cookie access |

**Privacy**: Zero data collection. No analytics. No network requests. Everything stays on your device. See [Privacy Policy](src/tabs/privacy-policy.tsx).

## Cookie Formats

The extension supports 3 import/export formats:

**JSON** — Standard array of cookie objects
```json
[{"name":"token","value":"abc123","domain":".example.com","path":"/","secure":true}]
```

**Netscape/Mozilla** — Tab-separated, compatible with curl/wget
```
.example.com	TRUE	/	TRUE	1735689600	token	abc123
```

**HTTP Header** — Set-Cookie format
```
token=abc123; Domain=.example.com; Path=/; Secure; HttpOnly
```

## Development

```bash
pnpm dev        # Start dev server with HMR
pnpm build      # Production build
pnpm package    # Build + create .zip for Chrome Web Store
```

## Localization

Supports English (`en`) and Vietnamese (`vi`). Default: Vietnamese.

Users can switch languages at runtime via the language toggle button (no browser restart needed). Translations are in `assets/locales/`.

## License

MIT
