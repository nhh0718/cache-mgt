---
title: "Phase 6 — Full Page View"
status: pending
effort: 6h
depends_on: [phase-02, phase-03]
---

## Context Links
- [Plan Overview](./plan.md)
- [Phase 2 — Shared Foundation](./phase-02-shared-foundation.md)
- [Phase 3 — Background Service Worker](./phase-03-background-service-worker.md)

## Overview
- **Priority:** P1 — Advanced management hub
- **Status:** Pending
- **Description:** Full-page tab view with all features: multi-domain cookie management, import/export, cookie profiles, bulk operations, settings, and real-time monitoring. Opened via `chrome-extension://ID/tabs/fullpage.html`.

## Key Insights
- Full page has no width constraints — use responsive 2-column or 3-column layout
- This is the "power user" view — all features exposed
- Import/export needs file picker (import) and download trigger (export)
- Profile management is primary here — save/restore/rename/delete sessions
- Bulk operations: select all by domain, delete selected, export selected

## Requirements

### Functional
- **All-Domain Cookie Manager:** Table view with sortable columns, pagination, bulk select
- **Import/Export:**
  - Export: JSON, Netscape, HTTP Header formats. Export all or selected cookies
  - Import: File upload (JSON, Netscape) or paste text. Preview before applying
  - Copy single cookie as cURL-compatible string
- **Cookie Profiles:**
  - Save current domain's cookies as named profile
  - List all profiles with domain, cookie count, created date
  - Restore profile (additive — sets cookies, doesn't clear existing)
  - Delete profile with confirmation
  - Rename profile inline
- **Bulk Operations:**
  - Select all / deselect all
  - Select by domain
  - Delete selected
  - Export selected
- **Settings Page:**
  - Language: English / Vietnamese
  - Monitoring: enable/disable
  - Notifications: enable/disable badge
  - Default view preference
- **Real-time Monitor:** Same as sidepanel but full-width with more detail

### Non-Functional
- Table handles 1000+ cookies with virtual scrolling
- Import preview renders within 1s for files up to 1MB
- Settings persist across sessions

## Architecture

```
tabs/fullpage.tsx
├── FullPageApp
│   ├── sidebar-nav (Cookies, Import/Export, Profiles, Monitor, Settings)
│   ├── [Cookies Page]
│   │   ├── toolbar (search, filters, bulk actions, sort)
│   │   ├── cookie-table (sortable columns, checkboxes, pagination)
│   │   └── cookie-detail-panel (selected cookie details + edit)
│   ├── [Import/Export Page]
│   │   ├── export-section (format selector, scope selector, download/copy)
│   │   └── import-section (file upload, text paste, preview, apply)
│   ├── [Profiles Page]
│   │   ├── profile-list (cards with actions)
│   │   ├── save-profile-form
│   │   └── profile-detail (cookie list within profile)
│   ├── [Monitor Page]
│   │   └── (reuse sidepanel monitor components, full-width)
│   └── [Settings Page]
│       └── settings-form
```

## Related Code Files

### Files to Create
- `src/tabs/fullpage.tsx` — Entry point
- `src/fullpage/fullpage-app.tsx` — Main app with sidebar routing
- `src/fullpage/sidebar-nav.tsx` — Navigation sidebar
- `src/fullpage/pages/cookies-page.tsx` — Cookie management page
- `src/fullpage/pages/cookie-table.tsx` — Table component with sorting/pagination
- `src/fullpage/pages/cookie-detail-panel.tsx` — Detail view for selected cookie
- `src/fullpage/pages/import-export-page.tsx` — Import/export hub
- `src/fullpage/pages/export-section.tsx` — Export controls
- `src/fullpage/pages/import-section.tsx` — Import controls with preview
- `src/fullpage/pages/import-preview-table.tsx` — Preview imported cookies
- `src/fullpage/pages/profiles-page.tsx` — Profile management
- `src/fullpage/pages/profile-card.tsx` — Single profile display
- `src/fullpage/pages/save-profile-form.tsx` — Save new profile form
- `src/fullpage/pages/monitor-page.tsx` — Full-width monitor (wraps shared)
- `src/fullpage/pages/settings-page.tsx` — Settings form

### Files to Import From (shared)
- All shared components, hooks, stores, utils
- Cookie parsers (JSON, Netscape, Header)
- Profile store, settings store, monitor store

## Implementation Steps

### 1. Create Full Page Entry (`src/tabs/fullpage.tsx`)
- Import `style.css`
- Render `<FullPageApp />`
- Set `<html>` to full viewport

### 2. Implement FullPageApp + Sidebar Nav
- State: `activePage: 'cookies' | 'import-export' | 'profiles' | 'monitor' | 'settings'`
- Sidebar: icon + label for each page, active indicator
- Main content area: render active page component
- Sidebar collapsible to icons-only for more content width

### 3. Implement Cookies Page (`cookies-page.tsx`)

**Toolbar:**
- Search bar (full-text)
- Domain filter dropdown (populated from current cookies)
- Attribute filter chips (secure, httpOnly, session, expired)
- Sort dropdown (name, domain, expiry, path)
- Bulk action buttons: Delete Selected, Export Selected
- Select All / Deselect All checkbox

**Cookie Table (`cookie-table.tsx`):**
- Columns: checkbox, name, value (truncated), domain, path, expires, secure, httpOnly, sameSite
- Sortable column headers (click to sort asc/desc)
- Row click selects for detail panel
- Checkbox for bulk selection
- Pagination: 50 cookies per page, page controls at bottom
- Virtual scrolling for performance with large datasets

**Detail Panel (`cookie-detail-panel.tsx`):**
- Shows when a cookie row is clicked
- All cookie fields editable
- Save / Cancel / Delete buttons
- Copy as JSON, Netscape, or cURL
- Slide-in from right side

### 4. Implement Import/Export Page

**Export Section (`export-section.tsx`):**
- Format selector: JSON, Netscape (cookies.txt), HTTP Set-Cookie Headers
- Scope selector: All Cookies, Current Domain, Selected Cookies
- Preview of first 5 cookies in selected format
- Actions: Download as File, Copy to Clipboard
- Download filename: `cookies-{domain}-{date}.{ext}`

**Import Section (`import-section.tsx`):**
- Two input methods: File Upload (drag-and-drop zone) or Paste Text
- Auto-detect format (JSON vs Netscape) from content
- Preview table showing parsed cookies before applying
- Import options: "Add only" (skip existing), "Overwrite" (replace matching), "Replace all" (clear + import)
- Apply button with confirmation
- Show import results: X added, Y updated, Z failed

**Import Preview Table (`import-preview-table.tsx`):**
- Table of parsed cookies with validation status
- Highlight invalid entries (missing required fields)
- Allow deselecting individual cookies before import
- Show warnings (e.g., expired cookies, mismatched domains)

### 5. Implement Profiles Page

**Profile List (`profiles-page.tsx`):**
- Grid of profile cards
- "Save Current Profile" button at top
- Empty state: "No profiles saved yet"

**Profile Card (`profile-card.tsx`):**
- Display: name, domain, cookie count, created date, last used
- Actions: Restore, Rename, Delete, View Details
- Restore: sends APPLY_PROFILE to background, shows result toast
- Delete: confirmation dialog
- Rename: inline edit

**Save Profile Form (`save-profile-form.tsx`):**
- Name input (required)
- Domain selector: save cookies for specific domain or all domains
- Preview: count of cookies to be saved
- Save button → creates profile in profile store

**Profile Detail (expandable):**
- Click "View Details" on card → expand to show cookie list within profile
- Read-only table of cookies in the profile

### 6. Implement Monitor Page (`monitor-page.tsx`)
- Reuse `monitor-feed`, `monitor-event-row`, `monitor-controls` from sidepanel
- Full-width layout: show more columns (full value, path, all flags)
- Add: export events as CSV
- Add: event statistics (total adds/modifies/removes, top changing domains)

### 7. Implement Settings Page (`settings-page.tsx`)
- **Language:** Dropdown: English, Vietnamese. Changes locale, reloads UI strings
- **Monitoring:** Toggle on/off. When off, background stops broadcasting changes
- **Notifications:** Toggle badge count on/off
- **Default View:** Radio: Popup, Side Panel, Full Page (which opens on extension icon click)
- All settings auto-save to settings store (persisted via chrome.storage)

### 8. Style & Polish
- Responsive layout: sidebar + main content
- Dark/light mode from settings
- Consistent spacing, typography via Tailwind
- Transition animations for page switches, panel slides
- Print-friendly styles for cookie table

## Todo List
- [ ] Create full page entry point
- [ ] Implement FullPageApp with sidebar routing
- [ ] Implement sidebar navigation
- [ ] Implement cookies page with toolbar
- [ ] Implement cookie table with sorting/pagination
- [ ] Implement cookie detail panel with edit
- [ ] Implement export section (3 formats)
- [ ] Implement import section with file upload
- [ ] Implement import preview table
- [ ] Implement import apply with options
- [ ] Implement profiles page
- [ ] Implement profile card with actions
- [ ] Implement save profile form
- [ ] Implement profile detail view
- [ ] Implement monitor page (full-width reuse)
- [ ] Implement settings page
- [ ] Add bulk operations (select all, delete selected, export selected)
- [ ] Style responsive layout
- [ ] Test with 1000+ cookies
- [ ] Test import/export round-trip for all formats

## Success Criteria
- All 5 pages render and navigate correctly
- Cookie table sorts, paginates, and handles 1000+ cookies
- Export produces valid files in all 3 formats
- Import parses files correctly with preview before applying
- Profiles save, restore, rename, delete correctly
- Settings persist and apply immediately
- Bulk operations work on selected cookies
- Monitor shows full-width real-time feed

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Large cookie set causes slow render | Medium | Medium | Virtual scrolling, pagination (50/page) |
| Import malformed file crashes parser | Medium | High | Try-catch in parsers, show error with line number |
| Profile restore conflicts with existing cookies | Medium | Medium | Offer "clear first" option, show conflicts |
| Page routing state lost on reload | Low | Low | Persist active page in URL hash or session storage |

## Security Considerations
- Import could inject malicious cookie values — sanitize display, validate fields
- File upload: only accept .json, .txt extensions; validate content before parsing
- Export downloads may contain sensitive session tokens — warn user
- Settings page: no sensitive data, just preferences

## Next Steps
- Phase 7: Testing and polish across all views
