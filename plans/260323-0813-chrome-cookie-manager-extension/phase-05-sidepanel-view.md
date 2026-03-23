---
title: "Phase 5 — Side Panel View"
status: pending
effort: 5h
depends_on: [phase-02, phase-03]
---

## Context Links
- [Plan Overview](./plan.md)
- [Phase 2 — Shared Foundation](./phase-02-shared-foundation.md)
- [Phase 3 — Background Service Worker](./phase-03-background-service-worker.md)

## Overview
- **Priority:** P1 — Persistent view with real-time monitoring
- **Status:** Pending
- **Description:** Side panel view with wider layout (~360px), persistent across tab navigation. Two tabs: Cookie List (with full CRUD) and Real-time Monitor (live cookie change feed). Auto-refreshes cookie list when switching browser tabs.

## Key Insights
- Side panel stays open while user browses — ideal for monitoring
- Width is browser-controlled (~360px min), not configurable
- Side panel survives tab switches — use `chrome.tabs.onActivated` to refresh context
- Real-time monitor is the killer feature here — show live feed of cookie changes
- Unlike popup, side panel does NOT close when clicking elsewhere

## Requirements

### Functional
- **Cookie Tab:** Same cookie list as popup but wider layout with more detail visible
- **Monitor Tab:** Real-time feed of cookie changes with timestamps
  - Each event shows: cookie name, domain, change type (add/modify/remove), cause, timestamp
  - Color-coded: green (added), yellow (modified), red (removed)
  - Filterable by domain, change type
  - Clear button to reset feed
  - Pause/resume monitoring toggle
- Auto-refresh cookie list when user switches browser tabs
- All CRUD operations available (add, edit, delete)
- Domain selector dropdown (current tab domain + recently seen domains)

### Non-Functional
- Monitor feed handles 100+ events without lag
- Tab switch refresh < 100ms
- Smooth animations for new events appearing

## Architecture

```
sidepanel.tsx
├── SidePanelApp
│   ├── layout-shell (header with domain selector)
│   ├── tab-bar (Cookies | Monitor)
│   ├── [Cookies Tab]
│   │   ├── search-bar
│   │   ├── filter-chips
│   │   ├── cookie-list (wider rows with more detail)
│   │   └── cookie-form (inline or modal)
│   └── [Monitor Tab]
│       ├── monitor-controls (filter, pause, clear)
│       ├── monitor-feed (scrollable event list)
│       └── monitor-event-row (individual event)
```

## Related Code Files

### Files to Create
- `src/sidepanel.tsx` — Entry point
- `src/sidepanel/sidepanel-app.tsx` — Main component with tab routing
- `src/sidepanel/sidepanel-tab-bar.tsx` — Cookies / Monitor tab switcher
- `src/sidepanel/monitor-feed.tsx` — Real-time event list
- `src/sidepanel/monitor-event-row.tsx` — Single event display
- `src/sidepanel/monitor-controls.tsx` — Filter/pause/clear controls
- `src/sidepanel/domain-selector.tsx` — Domain dropdown

### Files to Import From (shared)
- All shared components (cookie-list, cookie-row, search-bar, etc.)
- `src/shared/stores/monitor-store.ts`
- `src/shared/hooks/use-cookies.ts`
- `src/shared/hooks/use-current-tab.ts`

## Implementation Steps

### 1. Create Side Panel Entry (`src/sidepanel.tsx`)
- Import `style.css`
- Render `<SidePanelApp />`
- Full height layout (100vh)

### 2. Implement SidePanelApp (`sidepanel-app.tsx`)
- State: `activeTab: 'cookies' | 'monitor'`
- On mount: fetch current tab info, load cookies
- Set up `chrome.tabs.onActivated` listener to refresh on tab switch
- Set up `chrome.runtime.onMessage` listener for cookie change broadcasts
- When cookie change received and monitor tab active: add to monitor store
- Compose: header → tab bar → active tab content

### 3. Implement Domain Selector (`domain-selector.tsx`)
- Dropdown showing: current tab domain (highlighted), "All Domains", recently accessed domains
- On change: re-fetch cookies for selected domain
- Recent domains: derived from current cookie list (unique domains, sorted by count)

### 4. Implement Tab Bar (`sidepanel-tab-bar.tsx`)
- Two tabs: "Cookies" and "Monitor"
- Monitor tab shows badge with unread event count
- Switching to monitor tab clears unread count

### 5. Integrate Cookie Tab
- Reuse shared components: search-bar, filter-chips, cookie-list, cookie-form, modal
- Wider layout allows: name + domain + value preview + expiry in single row
- Inline edit mode: click field to edit directly in row (no modal needed for simple edits)
- Bulk select checkboxes for multi-delete

### 6. Implement Monitor Feed (`monitor-feed.tsx`)
- Subscribe to monitor store events
- Render events in reverse chronological order (newest at top)
- Auto-scroll to top on new event (if scrolled to top)
- Each event rendered via `monitor-event-row`
- Show "No events yet" empty state

### 7. Implement Monitor Event Row (`monitor-event-row.tsx`)
- Display: timestamp (HH:MM:SS.ms), event type icon/color, cookie name, domain
- Expandable: full cookie details on click
- Color coding:
  - Green background-tint: added
  - Yellow background-tint: modified (overwrite)
  - Red background-tint: removed
- Show cause: explicit, overwrite, expired, evicted

### 8. Implement Monitor Controls (`monitor-controls.tsx`)
- Filter dropdown: All, Added, Modified, Removed
- Domain filter: All, specific domain
- Pause/Resume toggle button (pauses adding new events to display, not to storage)
- Clear All button (clears events from store and display)
- Export events button (copy as JSON to clipboard)

### 9. Handle Tab Switch Refresh
```typescript
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  // Update current tab in store
  // Re-fetch cookies if on Cookies tab
});
```
Also handle `chrome.tabs.onUpdated` for URL changes within same tab.

### 10. Handle Real-time Updates
- Listen for broadcast messages from background service worker
- On COOKIE_CHANGED message:
  - Add event to monitor store
  - If on cookies tab and change affects current domain: refresh cookie list
  - Update tab bar badge count

### 11. Style & Polish
- Full height layout with flex
- Scrollable content areas
- Transition animations for new monitor events (slide-in)
- Sticky header and tab bar
- Responsive within 360px+ width

## Todo List
- [ ] Create sidepanel entry point
- [ ] Implement SidePanelApp with tab routing
- [ ] Implement domain selector dropdown
- [ ] Implement tab bar with badge
- [ ] Integrate cookie tab (reuse shared components)
- [ ] Add inline edit capability for cookie rows
- [ ] Add bulk select/delete for cookies
- [ ] Implement monitor feed component
- [ ] Implement monitor event row with color coding
- [ ] Implement monitor controls (filter, pause, clear, export)
- [ ] Handle tab switch refresh
- [ ] Handle real-time cookie change broadcasts
- [ ] Style for side panel width
- [ ] Test with rapid cookie changes (monitoring)
- [ ] Test tab switching refresh behavior

## Success Criteria
- Side panel opens and persists across tab switches
- Cookie list refreshes automatically when switching tabs
- Monitor shows live cookie changes with < 500ms latency
- Filter/pause/clear controls work correctly
- Bulk delete works for selected cookies
- Domain selector filters cookie view
- Monitor badge shows accurate unread count

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| High-frequency changes flood monitor | Medium | Medium | Batch events, cap display at 200, auto-prune old |
| Side panel width too narrow for content | Low | Medium | Test on minimum width, use truncation + tooltips |
| Tab switch causes flash of old data | Medium | Low | Show loading state during refresh |

## Security Considerations
- Monitor displays cookie values — same show/hide toggle as popup
- Exported monitor events may contain sensitive cookie values — warn user
- Side panel shares extension context — no additional security concerns

## Next Steps
- Phase 6: Full page view with all advanced features
