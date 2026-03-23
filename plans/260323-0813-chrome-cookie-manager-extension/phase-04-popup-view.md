---
title: "Phase 4 — Popup View"
status: pending
effort: 4h
depends_on: [phase-02, phase-03]
---

## Context Links
- [Plan Overview](./plan.md)
- [Phase 2 — Shared Foundation](./phase-02-shared-foundation.md)
- [Phase 3 — Background Service Worker](./phase-03-background-service-worker.md)

## Overview
- **Priority:** P1 — Primary user entry point
- **Status:** Pending
- **Description:** Compact popup view (400x500px) showing cookies for the current tab's domain. Quick search, filter, CRUD actions, and navigation to side panel / full page.

## Key Insights
- Popup closes when clicking outside — state must be in Zustand/storage, not local React state
- Keep UI minimal: current domain cookies only by default, expandable to all domains
- Popup re-mounts from scratch each time it opens — fetch cookies on mount
- 400px width is comfortable; 500-600px height before scroll
- Quick actions: copy cookie value, delete, edit inline

## Requirements

### Functional
- Show cookies for current tab's domain on open
- Search bar filters cookies by name/value/domain in real-time
- Toggle to show all domains vs current domain only
- Click cookie row to expand details (value, path, expiry, flags)
- Edit cookie inline (name, value, expiry)
- Delete single cookie with confirmation
- Add new cookie button → opens cookie form
- Copy single cookie value to clipboard
- Badge shows change count (from background)
- Footer links: "Open Side Panel", "Open Full Page"

### Non-Functional
- Initial render < 200ms
- Smooth scroll for 100+ cookies
- Responsive within 400px width constraint

## Architecture

```
popup.tsx
├── PopupApp
│   ├── layout-shell (header: domain + all-domains toggle)
│   ├── search-bar
│   ├── filter-chips (compact: secure, httpOnly, session only)
│   ├── cookie-list
│   │   └── cookie-row (expandable, inline edit, delete, copy)
│   ├── add-cookie FAB button
│   ├── cookie-form (in modal, for add/edit)
│   └── footer-nav (sidepanel link, fullpage link)
```

## Related Code Files

### Files to Create
- `src/popup.tsx` — Entry point, wraps PopupApp
- `src/popup/popup-app.tsx` — Main popup component
- `src/popup/popup-header.tsx` — Domain display + toggle
- `src/popup/popup-footer.tsx` — Navigation links

### Files to Import From (shared)
- `src/shared/components/cookie-list.tsx`
- `src/shared/components/cookie-row.tsx`
- `src/shared/components/search-bar.tsx`
- `src/shared/components/filter-chips.tsx`
- `src/shared/components/cookie-form.tsx`
- `src/shared/components/modal.tsx`
- `src/shared/components/toast.tsx`
- `src/shared/hooks/use-cookies.ts`
- `src/shared/hooks/use-current-tab.ts`
- `src/shared/hooks/use-i18n.ts`

## Implementation Steps

### 1. Create Popup Entry (`src/popup.tsx`)
- Import `style.css` for Tailwind
- Render `<PopupApp />` wrapped in any necessary providers
- Set body/html width to 400px, min-height 400px, max-height 600px via Tailwind

### 2. Implement PopupApp (`src/popup/popup-app.tsx`)
- On mount: call `useCurrentTab()` to get current domain
- On mount: call `useCookies().fetchCookies(domain)` to load cookies
- State: `showAllDomains: boolean` (default false)
- State: `editingCookie: CookieData | null` (for modal)
- State: `showAddForm: boolean`
- Compose: header → search → filters → list → footer
- Listen for storage changes to refresh cookie list

### 3. Implement Popup Header (`popup-header.tsx`)
- Show current domain name (from useCurrentTab)
- Toggle switch: "Current Domain" / "All Domains"
- When toggled: re-fetch cookies with/without domain filter
- Cookie count badge next to domain

### 4. Integrate Search + Filters
- Render `<SearchBar />` from shared — dispatches to cookie store filter
- Render `<FilterChips />` from shared — compact mode (fewer chips for popup width)
- Filters apply immediately to displayed cookie list

### 5. Integrate Cookie List
- Render `<CookieList />` from shared
- Props: filtered cookies from store, onEdit callback, onDelete callback, onCopy callback
- Cookie rows: compact mode for popup (show name + domain + expiry)
- Click to expand: show value, path, flags
- Actions per row: copy value, edit (opens modal), delete (with confirm toast)

### 6. Implement Add/Edit Modal
- Floating action button "+" at bottom-right for add
- Click edit on row → set editingCookie → open modal with `<CookieForm />`
- CookieForm pre-filled for edit, empty for add
- On save: call `useCookies().addCookie()` or `updateCookie()` via background message
- On success: close modal, show success toast
- On error: show error in form

### 7. Implement Delete Flow
- Click delete → show confirmation toast ("Delete cookie X?" with Undo)
- If confirmed (timeout 3s): send REMOVE_COOKIE message to background
- Show result toast

### 8. Implement Copy Action
- Click copy icon on row → `navigator.clipboard.writeText(cookie.value)`
- Show brief "Copied!" toast

### 9. Implement Footer Navigation (`popup-footer.tsx`)
- "Open Side Panel" — sends `OPEN_SIDEPANEL` message to background
- "Open Full Page" — sends `OPEN_FULLPAGE` message to background (opens new tab)
- Styled as subtle links at bottom

### 10. Style & Polish
- Tailwind: dark/light theme support via settings store
- Compact spacing for popup constraints
- Scrollable cookie list with max-height
- Loading skeleton while fetching cookies
- Empty state: "No cookies for this domain"

## Todo List
- [ ] Create popup entry point with sizing
- [ ] Implement PopupApp with data fetching
- [ ] Implement popup header with domain toggle
- [ ] Integrate search bar
- [ ] Integrate filter chips (compact mode)
- [ ] Integrate cookie list with expand/collapse
- [ ] Implement add cookie flow (FAB + modal)
- [ ] Implement edit cookie flow (row → modal)
- [ ] Implement delete with confirmation
- [ ] Implement copy to clipboard
- [ ] Implement footer with sidepanel/fullpage links
- [ ] Style for 400x500 constraints
- [ ] Add loading and empty states
- [ ] Test with 100+ cookies on a domain

## Success Criteria
- Popup opens in < 200ms, shows current domain cookies
- Search filters in real-time as user types
- Add/edit/delete operations persist and reflect immediately
- Copy to clipboard works for cookie values
- Toggle between current domain and all domains
- Navigation to side panel and full page works
- No layout overflow at 400px width

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Popup closes mid-edit | Medium | Medium | Save form state to session storage |
| Slow render with many cookies | Low | Medium | Virtual scrolling if > 200 cookies |
| Clipboard API blocked | Low | Low | Fallback to textarea copy method |

## Security Considerations
- Cookie values displayed in UI — add "show/hide value" toggle for sensitive cookies
- Copy action copies raw value — user responsibility
- Popup runs in extension context — no CSP issues with chrome API access

## Next Steps
- Phase 5: Side Panel with wider layout and real-time monitor
