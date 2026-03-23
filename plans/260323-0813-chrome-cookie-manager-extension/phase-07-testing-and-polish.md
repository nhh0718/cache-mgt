---
title: "Phase 7 — Testing & Polish"
status: pending
effort: 4h
depends_on: [phase-04, phase-05, phase-06]
---

## Context Links
- [Plan Overview](./plan.md)
- All prior phase files

## Overview
- **Priority:** P1 — Quality gate before distribution
- **Status:** Pending
- **Description:** Unit tests for utils/stores, integration tests for views, i18n verification for both locales, Chrome Web Store asset preparation, and final bug fixes.

## Key Insights
- Plasmo supports Vitest out of the box for unit tests
- Chrome API calls need mocking in tests (use `vitest-chrome` or manual mocks)
- Cookie parsers are pure functions — easiest to test thoroughly
- i18n: verify all keys exist in both locales, no missing translations
- Chrome Web Store requires: icons (16, 48, 128), screenshots, description, privacy policy

## Requirements

### Functional
- Unit tests for all cookie parser utils (JSON, Netscape, HTTP header)
- Unit tests for cookie filter/sort/search utils
- Unit tests for Zustand store actions (with mocked chrome.storage)
- Integration tests: popup renders cookies, sidepanel shows monitor, fullpage navigates pages
- i18n: all keys present in en and vi, no untranslated strings in UI
- Store assets: icons at required sizes, 2-3 screenshots, description text

### Non-Functional
- Code coverage > 80% for utils
- All tests pass in CI (no flaky tests)
- Build produces valid .zip for Chrome Web Store upload

## Architecture

```
tests/
├── unit/
│   ├── cookie-parser-json.test.ts
│   ├── cookie-parser-netscape.test.ts
│   ├── cookie-parser-header.test.ts
│   ├── cookie-filter.test.ts
│   ├── cookie-helpers.test.ts
│   ├── cookie-store.test.ts
│   ├── profile-store.test.ts
│   └── settings-store.test.ts
├── integration/
│   ├── popup.test.tsx
│   ├── sidepanel.test.tsx
│   └── fullpage.test.tsx
└── mocks/
    └── chrome.ts                # Chrome API mock
```

## Related Code Files

### Files to Create
- `vitest.config.ts` — Test configuration
- `tests/mocks/chrome.ts` — Chrome API mock object
- All test files listed above
- `assets/icon-16.png`, `icon-48.png`, `icon-128.png`, `icon-512.png`
- `store-assets/screenshot-popup.png`
- `store-assets/screenshot-sidepanel.png`
- `store-assets/screenshot-fullpage.png`
- `store-assets/description.txt`

## Implementation Steps

### 1. Set Up Test Infrastructure
- Install: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- Configure `vitest.config.ts`: jsdom environment, path aliases, setup files
- Create `tests/mocks/chrome.ts`: mock `chrome.cookies`, `chrome.storage`, `chrome.tabs`, `chrome.runtime`, `chrome.i18n`
- Setup file: apply chrome mock globally before each test

### 2. Unit Test Cookie Parsers

**JSON Parser Tests:**
- Parse valid JSON array → correct CookieData[]
- Export CookieData[] → valid JSON string
- Round-trip: export → import → export === original
- Handle empty array
- Reject malformed JSON (throw/return error)
- Handle missing optional fields (defaults applied)

**Netscape Parser Tests:**
- Parse valid cookies.txt → correct CookieData[]
- Export CookieData[] → valid Netscape format
- Round-trip consistency
- Skip comment lines (# prefix)
- Reject lines with wrong field count
- Handle session cookies (expiry = 0)
- Handle domain with/without leading dot

**HTTP Header Parser Tests:**
- Parse Set-Cookie headers → CookieData[]
- Export to Set-Cookie format
- Export to Cookie header format (name=value pairs)
- Handle all attributes: Domain, Path, Secure, HttpOnly, SameSite, Max-Age, Expires
- Handle missing attributes (defaults)

### 3. Unit Test Filter/Helper Utils

**Filter Tests:**
- Filter by domain (exact match, subdomain match)
- Filter by name (partial match)
- Filter by secure/httpOnly/session flags
- Full-text search across name + value + domain
- Combined filters (AND logic)
- Empty filter returns all cookies
- Sort by each field, both directions

**Helper Tests:**
- `buildCookieUrl` produces correct URLs
- `extractDomain` handles various URL formats
- `formatExpiration` returns human-readable dates
- `generateCookieId` is deterministic
- `isExpired` correctly identifies expired cookies

### 4. Unit Test Zustand Stores

**Cookie Store:**
- `setCookies` updates state
- `addCookie` appends to list
- `removeCookie` removes by ID
- `setFilter` updates filter and filtered list recalculates
- `fetchCookies` calls chrome.cookies.getAll (mocked)

**Profile Store:**
- `saveProfile` creates profile with snapshot
- `deleteProfile` removes by ID
- `renameProfile` updates name
- `restoreProfile` calls chrome.cookies.set for each cookie (mocked)

**Settings Store:**
- `updateSettings` merges partial settings
- Default values applied on init

### 5. Integration Tests

**Popup Test:**
- Renders without crashing
- Shows cookie list after mount
- Search input filters displayed cookies
- Add button opens form modal
- Delete button triggers confirmation

**Side Panel Test:**
- Renders with tab bar
- Switching tabs shows correct content
- Monitor tab displays events from store

**Full Page Test:**
- Sidebar navigation works
- Each page renders correct content
- Import/export page renders format options

Note: Integration tests render components with mocked chrome APIs and verify DOM output. Not full E2E tests.

### 6. i18n Verification
- Script to compare en/messages.json and vi/messages.json keys
- Assert: every key in en exists in vi and vice versa
- Assert: no empty message values
- Manual review: spot-check Vietnamese translations make sense

### 7. Prepare Store Assets

**Icons:**
- Create icons at 16x16, 48x48, 128x128 (required by Chrome) and 512x512 (store listing)
- Cookie-themed icon, clean and recognizable at small sizes

**Screenshots:**
- Capture popup view in action (cookie list with search)
- Capture side panel with monitor active
- Capture full page with cookie table
- 1280x800 or 640x400 recommended

**Description:**
- Write Chrome Web Store description highlighting 4 core features
- English version, can translate to Vietnamese later

### 8. Final Build & Validation
```bash
pnpm build
```
- Verify `build/chrome-mv3-prod` directory contents
- Load unpacked in Chrome, test all features manually
- Check for console errors/warnings
- Verify manifest.json has correct permissions, icons, pages
- Create .zip for Chrome Web Store upload

### 9. Bug Fixes & Polish
- Fix any issues found during testing
- Ensure consistent styling across all 3 views
- Verify dark/light mode works everywhere
- Check for memory leaks (monitor feed growing unbounded)
- Verify service worker restarts gracefully

## Todo List
- [ ] Set up Vitest configuration
- [ ] Create Chrome API mocks
- [ ] Write JSON parser tests
- [ ] Write Netscape parser tests
- [ ] Write HTTP header parser tests
- [ ] Write filter/helper util tests
- [ ] Write cookie store tests
- [ ] Write profile store tests
- [ ] Write settings store tests
- [ ] Write popup integration test
- [ ] Write sidepanel integration test
- [ ] Write fullpage integration test
- [ ] Create i18n key comparison script
- [ ] Verify all i18n keys present in both locales
- [ ] Create extension icons (4 sizes)
- [ ] Capture screenshots (3 views)
- [ ] Write store description
- [ ] Run production build
- [ ] Manual smoke test all features
- [ ] Fix discovered bugs
- [ ] Create distributable .zip

## Success Criteria
- All unit tests pass with > 80% coverage on utils
- All integration tests pass
- No missing i18n keys in either locale
- Production build succeeds without errors
- Extension loads cleanly in Chrome (no console errors)
- All 3 views functional in production build
- Icons display correctly at all sizes
- .zip ready for Chrome Web Store submission

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Chrome API mocking incomplete | Medium | Medium | Build mocks incrementally as tests need them |
| Flaky integration tests | Medium | Low | Use deterministic data, avoid timing-dependent assertions |
| Production build differs from dev | Low | High | Test production build manually before finalizing |

## Security Considerations
- Test data should not include real cookie values
- Store listing privacy policy: document that extension accesses all cookies, stores profiles locally only
- No analytics or external network calls

## Next Steps
- Submit to Chrome Web Store (if desired)
- Gather user feedback for v2 features
- Consider: cookie encryption, scheduled profile switching, cookie diff between profiles
