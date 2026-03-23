---
title: "Phase 1 — Project Setup"
status: pending
effort: 3h
---

## Context Links
- [Plan Overview](./plan.md)
- [CRXJS/Plasmo Research](../reports/researcher-260323-0810-crxjs-vite-research.md)
- [Plasmo Docs](https://docs.plasmo.com/)

## Overview
- **Priority:** P1 — Blocker for all subsequent phases
- **Status:** Pending
- **Description:** Initialize Plasmo project, configure TypeScript, Tailwind CSS, Zustand, folder structure, manifest permissions, and placeholder icons.

## Key Insights
- Plasmo uses file-structure conventions: `popup.tsx`, `sidepanel.tsx`, `tabs/fullpage.tsx` auto-discovered
- Tailwind works via standard PostCSS config in Plasmo
- Manifest fields set via `package.json` `manifest` key in Plasmo
- Side panel requires `sidePanel` permission + `side_panel` manifest entry

## Requirements

### Functional
- Plasmo project initializes and builds without errors
- All 3 view entry points render a "Hello" placeholder
- Background service worker loads and logs startup message
- Tailwind utility classes work in all views
- Zustand store initializes with chrome.storage adapter

### Non-Functional
- TypeScript strict mode enabled
- Build time < 10s for dev, < 30s for production
- Extension loads in Chrome without permission errors

## Architecture

```
Cookie/
├── src/
│   ├── background/
│   │   └── index.ts
│   ├── popup.tsx                  # Plasmo auto-discovers
│   ├── sidepanel.tsx              # Plasmo side panel entry
│   ├── tabs/
│   │   └── fullpage.tsx           # Plasmo tabs page
│   ├── shared/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── utils/
│   │   ├── types/
│   │   └── i18n/
│   └── style.css                  # Tailwind base
├── assets/
│   └── icon.png                   # 512x512 base icon
├── package.json                   # Plasmo config + manifest overrides
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── .prettierrc
```

**Note on Plasmo conventions:** Popup, sidepanel, background are discovered by filename at `src/` root or configured paths. Tabs pages go under `src/tabs/`. The `shared/` directory is a custom import path for reusable code.

## Related Code Files

### Files to Create
- `package.json` — Plasmo config, dependencies, manifest overrides
- `tsconfig.json` — Strict TS config
- `tailwind.config.ts` — Tailwind with custom theme
- `postcss.config.js` — PostCSS for Tailwind
- `src/popup.tsx` — Popup entry placeholder
- `src/sidepanel.tsx` — Side panel entry placeholder
- `src/tabs/fullpage.tsx` — Full page entry placeholder
- `src/background/index.ts` — Service worker placeholder
- `src/style.css` — Tailwind directives
- `src/shared/stores/cookie-store.ts` — Zustand store skeleton
- `src/shared/stores/chrome-storage-adapter.ts` — chrome.storage persist adapter
- `assets/icon.png` — Placeholder icon (512x512)
- `.prettierrc` — Code formatting config

## Implementation Steps

### 1. Initialize Plasmo Project
```bash
pnpm create plasmo --with-src
# Project name: cookie-manager
```
If `create plasmo` scaffolds outside current dir, move files into `E:\Code-Fun\Cookie\`.

### 2. Install Dependencies
```bash
pnpm add zustand react react-dom
pnpm add -D tailwindcss postcss autoprefixer @types/chrome typescript
npx tailwindcss init -p
```

### 3. Configure TypeScript (`tsconfig.json`)
- Enable `strict: true`
- Set `paths` alias: `@shared/*` → `src/shared/*`
- Target ES2022 for MV3 compatibility

### 4. Configure Tailwind (`tailwind.config.ts`)
- Content paths: `src/**/*.{tsx,ts,html}`
- Custom colors for extension branding (neutral palette)
- Add `src/style.css` with `@tailwind base/components/utilities`

### 5. Configure Manifest via `package.json`
Add `manifest` field:
```json
{
  "manifest": {
    "permissions": ["cookies", "storage", "tabs", "sidePanel"],
    "host_permissions": ["<all_urls>"],
    "side_panel": { "default_path": "sidepanel.html" },
    "default_locale": "en"
  }
}
```

### 6. Create Entry Points
- `src/popup.tsx` — Render `<div>Cookie Manager Popup</div>` with Tailwind class
- `src/sidepanel.tsx` — Render `<div>Cookie Manager Side Panel</div>`
- `src/tabs/fullpage.tsx` — Render `<div>Cookie Manager Full Page</div>`
- Each imports `src/style.css` for Tailwind

### 7. Create Background Service Worker
- `src/background/index.ts` — Log `"Cookie Manager: service worker started"`
- Register placeholder `chrome.cookies.onChanged` listener

### 8. Create Zustand Store Skeleton
- `src/shared/stores/chrome-storage-adapter.ts` — Implement `StateStorage` interface using `chrome.storage.local`
- `src/shared/stores/cookie-store.ts` — Empty store with `persist` middleware using chrome adapter

### 9. Create i18n Structure
- `src/shared/i18n/_locales/en/messages.json` — `appName`, `appDescription`
- `src/shared/i18n/_locales/vi/messages.json` — Vietnamese translations

### 10. Create Placeholder Icon
- Use `assets/icon.png` — simple 512x512 cookie icon (generate or use placeholder)

### 11. Verify Build
```bash
pnpm dev    # Dev build + HMR
pnpm build  # Production build
```
- Load unpacked extension in Chrome from `build/chrome-mv3-dev`
- Verify popup opens, side panel available, full page at `chrome-extension://ID/tabs/fullpage.html`

## Todo List
- [ ] Initialize Plasmo project
- [ ] Install and configure dependencies
- [ ] Set up TypeScript strict config with path aliases
- [ ] Configure Tailwind CSS + PostCSS
- [ ] Add manifest permissions in package.json
- [ ] Create popup entry point
- [ ] Create side panel entry point
- [ ] Create full page entry point
- [ ] Create background service worker
- [ ] Create Zustand store skeleton with chrome.storage adapter
- [ ] Create i18n locale files (en + vi)
- [ ] Create placeholder icon
- [ ] Verify dev build loads in Chrome
- [ ] Verify production build succeeds

## Success Criteria
- `pnpm dev` succeeds, extension loads in Chrome
- All 3 views render their placeholder content
- Background service worker starts (visible in chrome://extensions)
- Tailwind classes apply styling correctly
- No TypeScript compilation errors
- No permission errors in Chrome console

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Plasmo version breaking changes | Low | High | Pin exact version in package.json |
| Side panel config not auto-detected | Medium | Medium | Manual manifest override in package.json |
| Path aliases not resolving | Medium | Low | Use relative imports as fallback |

## Security Considerations
- `<all_urls>` host permission is broad — document justification (required for cross-domain cookie access)
- No sensitive data stored at this phase
- CSP handled automatically by Plasmo build

## Next Steps
- Phase 2: Build shared types, utils, hooks, and components
