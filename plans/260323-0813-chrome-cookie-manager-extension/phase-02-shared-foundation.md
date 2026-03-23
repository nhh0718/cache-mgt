---
title: "Phase 2 — Shared Foundation"
status: pending
effort: 6h
depends_on: [phase-01]
---

## Context Links
- [Plan Overview](./plan.md)
- [Chrome Extension APIs](../reports/researcher-260323-0810-chrome-extension-apis.md)
- [Cookie Formats & Zustand](../reports/researcher-260323-0810-cookie-formats-zustand.md)

## Overview
- **Priority:** P1 — Foundation for all views
- **Status:** Pending
- **Description:** Build shared TypeScript types, Zustand stores, cookie utility functions (parsing, filtering, serialization), custom hooks, reusable UI components, and i18n setup. All 3 views import from this layer.

## Key Insights
- chrome.cookies.Cookie type is the canonical shape; extend it for UI needs
- Zustand persist middleware needs custom `StateStorage` adapter for chrome.storage.local
- Cross-view sync via `chrome.storage.onChanged` listener that calls `store.setState()`
- Netscape format: 7 tab-separated fields per line; JSON format: array of cookie objects
- HTTP header: `Set-Cookie: name=value; attrs...` for export, `Cookie: n=v; n=v` for request format
- Keep each file < 200 lines; split utils by concern

## Requirements

### Functional
- TypeScript types cover all cookie fields (Chrome API + UI metadata)
- Zustand cookie store: CRUD operations, filter state, search query
- Zustand profile store: named profiles, save/restore/delete
- Zustand settings store: theme, locale, notification prefs
- Cookie parser utils: JSON ↔ Cookie[], Netscape ↔ Cookie[], HTTP header ↔ Cookie[]
- Cookie filter utils: by domain, name, path, secure, httpOnly, session, full-text search
- Custom hooks: `useCookies()`, `useProfiles()`, `useSettings()`, `useCurrentTab()`
- i18n helper wrapping chrome.i18n.getMessage with fallback
- Shared UI components: cookie row, search bar, filter chips, modal, toast

### Non-Functional
- All utils must be pure functions (no side effects) for testability
- Store actions must handle errors gracefully with try-catch
- Components must accept props — no hardcoded data

## Architecture

```
src/shared/
├── types/
│   ├── cookie.types.ts        # Cookie, CookieFilter, CookieSort
│   ├── profile.types.ts       # Profile, ProfileStore
│   ├── settings.types.ts      # Settings, Theme, Locale
│   └── message.types.ts       # Inter-component message types
├── stores/
│   ├── chrome-storage-adapter.ts  # StateStorage for Zustand persist
│   ├── cookie-store.ts           # Cookie list + filters + CRUD
│   ├── profile-store.ts          # Named profiles
│   ├── settings-store.ts         # User preferences
│   └── monitor-store.ts          # Real-time change events
├── utils/
│   ├── cookie-parser-json.ts     # JSON import/export
│   ├── cookie-parser-netscape.ts # Netscape format
│   ├── cookie-parser-header.ts   # HTTP header format
│   ├── cookie-filter.ts          # Filter & search logic
│   ├── cookie-helpers.ts         # Domain extraction, URL building, formatting
│   └── chrome-api.ts             # Typed wrappers around chrome.cookies.*
├── hooks/
│   ├── use-cookies.ts            # Cookie CRUD hook
│   ├── use-profiles.ts           # Profile management hook
│   ├── use-settings.ts           # Settings hook
│   ├── use-current-tab.ts        # Active tab URL/domain
│   └── use-i18n.ts               # i18n helper hook
├── components/
│   ├── cookie-row.tsx            # Single cookie display row
│   ├── cookie-list.tsx           # Virtualized cookie list
│   ├── search-bar.tsx            # Search input with debounce
│   ├── filter-chips.tsx          # Domain/attribute filter chips
│   ├── cookie-form.tsx           # Add/edit cookie form
│   ├── modal.tsx                 # Reusable modal wrapper
│   ├── toast.tsx                 # Notification toast
│   ├── badge.tsx                 # Count badge component
│   └── layout-shell.tsx          # Common layout wrapper
└── i18n/
    ├── _locales/en/messages.json
    ├── _locales/vi/messages.json
    └── get-message.ts            # Typed i18n wrapper
```

## Related Code Files

### Files to Create
All files listed in Architecture section above.

### Dependencies
- `zustand` — state management
- `@types/chrome` — Chrome API types
- React, ReactDOM (from Phase 1)

## Implementation Steps

### 1. Define TypeScript Types

**`cookie.types.ts`**
- `CookieData` — extends chrome.cookies.Cookie with `id` (generated), `url` (computed)
- `CookieFilter` — `{ domain?: string, name?: string, path?: string, secure?: boolean, httpOnly?: boolean, session?: boolean, search?: string }`
- `CookieSortField` — `'name' | 'domain' | 'expirationDate' | 'path'`
- `CookieSortOrder` — `'asc' | 'desc'`

**`profile.types.ts`**
- `CookieProfile` — `{ id: string, name: string, cookies: CookieData[], domain: string, createdAt: number, updatedAt: number }`

**`settings.types.ts`**
- `Settings` — `{ locale: 'en' | 'vi', notificationsEnabled: boolean, monitoringEnabled: boolean, defaultView: 'popup' | 'sidepanel' | 'fullpage' }`

**`message.types.ts`**
- `ExtensionMessage` — discriminated union: `{ type: 'GET_COOKIES' | 'COOKIE_CHANGED' | 'APPLY_PROFILE' | ... , payload: ... }`

### 2. Implement Chrome Storage Adapter

**`chrome-storage-adapter.ts`**
- Implement Zustand `StateStorage` interface:
  - `getItem(key)` → `chrome.storage.local.get(key)` → parse JSON
  - `setItem(key, value)` → `chrome.storage.local.set({[key]: value})`
  - `removeItem(key)` → `chrome.storage.local.remove(key)`
- All methods return Promises (Zustand persist supports async storage)

### 3. Implement Zustand Stores

**`cookie-store.ts`** (state + actions)
- State: `cookies: CookieData[]`, `filter: CookieFilter`, `sortField`, `sortOrder`, `loading: boolean`
- Actions: `setCookies`, `addCookie`, `updateCookie`, `removeCookie`, `setFilter`, `setSort`, `fetchCookies(domain?)`
- `fetchCookies` calls `chrome.cookies.getAll()` and transforms to `CookieData[]`
- Persist to chrome.storage.local via adapter

**`profile-store.ts`**
- State: `profiles: CookieProfile[]`, `activeProfileId: string | null`
- Actions: `saveProfile(name, domain)`, `restoreProfile(id)`, `deleteProfile(id)`, `renameProfile(id, name)`
- `saveProfile` snapshots current cookies for domain, stores in profile
- `restoreProfile` calls `chrome.cookies.set()` for each cookie in profile
- Persist to chrome.storage.local

**`settings-store.ts`**
- State: `Settings` fields
- Actions: `updateSettings(partial)`
- Persist to chrome.storage.local

**`monitor-store.ts`**
- State: `events: CookieChangeEvent[]`, `maxEvents: number` (default 100)
- Actions: `addEvent(event)`, `clearEvents()`, `setMaxEvents(n)`
- `CookieChangeEvent` = `{ cookie: CookieData, cause: string, timestamp: number, type: 'added' | 'modified' | 'removed' }`
- NOT persisted (session-only, stored in memory)

### 4. Implement Cross-View Sync

In each view's root component, add effect:
```typescript
useEffect(() => {
  const listener = (changes, area) => {
    if (area !== 'local') return;
    // For each persisted store key, rehydrate from changes
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}, []);
```
Extract into `use-storage-sync.ts` hook.

### 5. Implement Cookie Parsers

**`cookie-parser-json.ts`**
- `exportToJson(cookies: CookieData[]): string` — JSON.stringify with indent
- `importFromJson(json: string): CookieData[]` — parse, validate fields, generate IDs

**`cookie-parser-netscape.ts`**
- `exportToNetscape(cookies: CookieData[]): string` — 7 tab-separated fields per line, comment header
- `importFromNetscape(text: string): CookieData[]` — split lines, skip comments (#), validate 7 fields

**`cookie-parser-header.ts`**
- `exportToSetCookieHeaders(cookies: CookieData[]): string` — one `Set-Cookie:` line per cookie
- `importFromSetCookieHeaders(text: string): CookieData[]` — parse each line
- `exportToCookieHeader(cookies: CookieData[]): string` — single `Cookie:` line (name=value pairs)

### 6. Implement Cookie Filter & Helpers

**`cookie-filter.ts`**
- `filterCookies(cookies: CookieData[], filter: CookieFilter): CookieData[]`
- `sortCookies(cookies: CookieData[], field, order): CookieData[]`
- `searchCookies(cookies: CookieData[], query: string): CookieData[]` — matches name, value, domain
- All pure functions

**`cookie-helpers.ts`**
- `buildCookieUrl(cookie)` — construct URL from domain + path + secure
- `extractDomain(url: string): string`
- `formatExpiration(timestamp: number): string` — human-readable date
- `generateCookieId(cookie)` — deterministic hash from domain+name+path
- `isExpired(cookie): boolean`

**`chrome-api.ts`**
- Typed async wrappers: `getAllCookies(filter?)`, `setCookie(details)`, `removeCookie(url, name)`
- Each wraps `chrome.cookies.*` in Promise with error handling

### 7. Implement Custom Hooks

**`use-cookies.ts`**
- Wraps cookie store: returns filtered/sorted list + CRUD actions
- Auto-fetches cookies for current tab on mount

**`use-profiles.ts`**
- Wraps profile store: returns profiles list + save/restore/delete

**`use-settings.ts`**
- Wraps settings store

**`use-current-tab.ts`**
- Returns `{ url, domain, tabId }` for active tab
- Listens to `chrome.tabs.onActivated` for updates

**`use-i18n.ts`**
- `t(key: string, substitutions?: string[]): string` — wraps `chrome.i18n.getMessage`

### 8. Implement Shared UI Components

**`cookie-row.tsx`** — Displays cookie name, domain, expiry, secure/httpOnly badges. Edit/delete buttons. Expandable value.

**`cookie-list.tsx`** — Maps over filtered cookies, renders `cookie-row`. Shows empty state. Loading skeleton.

**`search-bar.tsx`** — Controlled input with debounce (300ms). Dispatches to store filter.

**`filter-chips.tsx`** — Toggleable chips: Secure, HttpOnly, Session, Expired. Domain chips from current cookies.

**`cookie-form.tsx`** — Form for add/edit cookie. Fields: name, value, domain, path, secure, httpOnly, sameSite, expirationDate. Validation.

**`modal.tsx`** — Portal-based modal. Close on Escape/overlay click. Title + content + actions.

**`toast.tsx`** — Auto-dismissing notification. Success/error/info variants.

**`badge.tsx`** — Small count badge (for monitoring event count).

**`layout-shell.tsx`** — Common wrapper: header with title + navigation links (popup→sidepanel→fullpage), content area.

### 9. Set Up i18n Files

**`_locales/en/messages.json`** — All UI strings: titles, buttons, labels, errors, confirmations
**`_locales/vi/messages.json`** — Vietnamese translations
**`get-message.ts`** — `getMessage(key, subs?)` with fallback to key name if not found

## Todo List
- [ ] Define TypeScript types (cookie, profile, settings, message)
- [ ] Implement chrome storage adapter
- [ ] Implement cookie store with persist
- [ ] Implement profile store with persist
- [ ] Implement settings store with persist
- [ ] Implement monitor store (in-memory)
- [ ] Implement cross-view storage sync hook
- [ ] Implement JSON cookie parser (import/export)
- [ ] Implement Netscape cookie parser
- [ ] Implement HTTP header cookie parser
- [ ] Implement cookie filter/sort utilities
- [ ] Implement cookie helper functions
- [ ] Implement typed chrome.cookies API wrappers
- [ ] Implement useCookies hook
- [ ] Implement useProfiles hook
- [ ] Implement useSettings hook
- [ ] Implement useCurrentTab hook
- [ ] Implement useI18n hook
- [ ] Build cookie-row component
- [ ] Build cookie-list component
- [ ] Build search-bar component
- [ ] Build filter-chips component
- [ ] Build cookie-form component
- [ ] Build modal component
- [ ] Build toast component
- [ ] Build badge component
- [ ] Build layout-shell component
- [ ] Create en/vi locale files
- [ ] Create i18n getter utility

## Success Criteria
- All types compile with strict TypeScript
- Zustand stores initialize, persist, and sync across 2 open views
- Cookie parsers round-trip: export → import → export produces same output
- Filter/search returns correct subsets
- All components render in isolation (no external state dependency)
- i18n returns correct strings for both locales

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| chrome.storage.local quota exceeded | Low | Medium | Monitor storage usage, compress profiles |
| Zustand persist race condition across views | Medium | Medium | Debounce storage writes, use version field |
| Netscape format edge cases | Low | Low | Validate strictly, skip malformed lines |

## Security Considerations
- Cookie values may contain sensitive data — never log full values in console
- Profile storage encrypts nothing — document that profiles are local-only
- `chrome.cookies.set()` can overwrite httpOnly cookies — add confirmation dialog
- Sanitize imported cookie values (no script injection in UI rendering)

## Next Steps
- Phase 3: Background service worker uses stores + utils
- Phases 4-6: Views compose shared components + hooks
