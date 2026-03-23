---
title: "Phase 3 — Background Service Worker"
status: pending
effort: 4h
depends_on: [phase-02]
---

## Context Links
- [Plan Overview](./plan.md)
- [Chrome Extension APIs](../reports/researcher-260323-0810-chrome-extension-apis.md)
- [Phase 2 — Shared Foundation](./phase-02-shared-foundation.md)

## Overview
- **Priority:** P1 — Required for real-time monitoring and cross-view coordination
- **Status:** Pending
- **Description:** Implement background service worker that listens to cookie changes, acts as message broker between views, manages badge counts, and handles profile restore operations.

## Key Insights
- MV3 service workers are event-driven and terminate after ~30s of inactivity
- Cannot rely on in-memory state persisting — use chrome.storage for anything important
- `chrome.cookies.onChanged` fires for ALL cookie changes (not just our extension's)
- `changeInfo.cause`: `explicit` (user/extension), `overwrite`, `expired`, `evicted`
- Message passing: `chrome.runtime.sendMessage` for popup/sidepanel → background
- Badge text via `chrome.action.setBadgeText()` to show unread change count

## Requirements

### Functional
- Listen to `chrome.cookies.onChanged` and broadcast changes to all open views
- Maintain change event log in chrome.storage.session (survives sw restart within session)
- Update action badge with count of recent changes (resettable)
- Handle messages: GET_COOKIES, SET_COOKIE, REMOVE_COOKIE, GET_PROFILES, APPLY_PROFILE, EXPORT_COOKIES, CLEAR_MONITOR
- Open side panel on action icon click (configurable via settings)

### Non-Functional
- Service worker must handle restarts gracefully (no in-memory state assumptions)
- Message responses within 100ms for CRUD operations
- Error responses include descriptive messages

## Architecture

```
chrome.cookies.onChanged
    ↓
Background Service Worker
    ├── Cookie Change Handler → store event → update badge → broadcast to views
    ├── Message Router → dispatch to handlers
    │   ├── CookieCRUD handler → chrome.cookies API
    │   ├── ProfileHandler → chrome.storage.local
    │   └── MonitorHandler → chrome.storage.session
    └── Badge Manager → chrome.action.setBadgeText
```

## Related Code Files

### Files to Create
- `src/background/index.ts` — Main entry, event registration
- `src/background/cookie-change-handler.ts` — onChanged listener logic
- `src/background/message-router.ts` — Message dispatcher
- `src/background/handlers/cookie-crud-handler.ts` — CRUD message handlers
- `src/background/handlers/profile-handler.ts` — Profile apply/restore
- `src/background/handlers/monitor-handler.ts` — Monitor event management
- `src/background/badge-manager.ts` — Badge text/color management

### Files to Import From
- `src/shared/types/message.types.ts`
- `src/shared/types/cookie.types.ts`
- `src/shared/utils/chrome-api.ts`
- `src/shared/utils/cookie-helpers.ts`

## Implementation Steps

### 1. Create Main Entry (`src/background/index.ts`)
- Import and register all event listeners on module load (top-level, not in callbacks)
- Register `chrome.cookies.onChanged` listener
- Register `chrome.runtime.onMessage` listener
- Register `chrome.runtime.onInstalled` for first-run setup
- Register `chrome.action.onClicked` if popup disabled (to open side panel)
- Log startup for debugging

### 2. Implement Cookie Change Handler (`cookie-change-handler.ts`)
- Receive `changeInfo: { removed: boolean, cookie: Cookie, cause: string }`
- Transform to `CookieChangeEvent` type (from shared types)
- Determine event type: `removed && cause === 'overwrite'` → modified, `removed` → removed, else → added
- Store event in chrome.storage.session (append to array, cap at maxEvents)
- Call badge manager to increment count
- Broadcast event to all extension views via `chrome.runtime.sendMessage`
- Wrap broadcast in try-catch (fails silently if no listeners)

### 3. Implement Message Router (`message-router.ts`)
- Switch on `message.type` (discriminated union from `ExtensionMessage`)
- Route to appropriate handler
- All handlers return `Promise<response>`, router sends via `sendResponse`
- Return `true` from `onMessage` listener (async response)
- Catch errors, return `{ error: string }` response

Message types:
| Type | Handler | Description |
|------|---------|-------------|
| `GET_COOKIES` | cookieCrud | Fetch cookies by filter |
| `SET_COOKIE` | cookieCrud | Create/update cookie |
| `REMOVE_COOKIE` | cookieCrud | Delete cookie |
| `REMOVE_COOKIES_BULK` | cookieCrud | Delete multiple cookies |
| `APPLY_PROFILE` | profile | Restore cookie profile |
| `GET_MONITOR_EVENTS` | monitor | Fetch stored events |
| `CLEAR_MONITOR` | monitor | Clear event log + badge |
| `OPEN_SIDEPANEL` | direct | chrome.sidePanel.open() |
| `OPEN_FULLPAGE` | direct | chrome.tabs.create() |

### 4. Implement Cookie CRUD Handler (`handlers/cookie-crud-handler.ts`)
- `handleGetCookies(filter?)` — call `chrome.cookies.getAll(filter)`, transform results
- `handleSetCookie(details)` — validate required fields, call `chrome.cookies.set()`, return result
- `handleRemoveCookie(url, name)` — call `chrome.cookies.remove()`, return success/failure
- `handleBulkRemove(cookies[])` — Promise.allSettled for each removal, return summary
- All use typed wrappers from `chrome-api.ts`

### 5. Implement Profile Handler (`handlers/profile-handler.ts`)
- `handleApplyProfile(profileId)`:
  1. Load profile from chrome.storage.local
  2. For each cookie in profile: call `chrome.cookies.set()`
  3. Use `Promise.allSettled` — report partial failures
  4. Return `{ applied: number, failed: number, errors: string[] }`
- Note: applying a profile does NOT delete existing cookies first (additive). Document option to clear domain cookies first as future enhancement.

### 6. Implement Monitor Handler (`handlers/monitor-handler.ts`)
- `handleGetEvents()` — read from chrome.storage.session, return array
- `handleClearEvents()` — clear chrome.storage.session events, reset badge
- Events stored under key `monitor_events` in session storage

### 7. Implement Badge Manager (`badge-manager.ts`)
- `incrementBadge()` — read current count from session storage, increment, set badge text
- `resetBadge()` — set badge text to empty string
- `setBadgeColor(color)` — default green for adds, red for removes, yellow for changes
- Badge shows total unseen changes; resets when user opens popup/sidepanel

### 8. Handle Runtime Events
- `chrome.runtime.onInstalled` — initialize default settings in chrome.storage.local if not present
- `chrome.action.onClicked` — open side panel (if popup is not set as default action)

## Todo List
- [ ] Create main entry with event registration
- [ ] Implement cookie change handler
- [ ] Implement message router with type dispatch
- [ ] Implement cookie CRUD handler
- [ ] Implement profile apply handler
- [ ] Implement monitor event handler
- [ ] Implement badge manager
- [ ] Handle onInstalled for default settings
- [ ] Handle action click for side panel
- [ ] Test service worker restart recovery
- [ ] Test message flow: view → background → response

## Success Criteria
- Cookie changes in browser trigger events visible in extension views
- Badge count increments on cookie changes, resets on view open
- CRUD operations via messages work for any domain's cookies
- Service worker restarts do not lose pending monitor events
- Profile apply successfully sets cookies and reports results
- Error responses include meaningful messages

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SW termination mid-operation | Medium | Medium | Keep operations atomic, use storage not memory |
| Broadcast fails (no listeners) | High | Low | Wrap in try-catch, events persist in storage |
| High-frequency cookie changes overwhelm | Low | Medium | Debounce badge updates, cap event array |
| Profile apply partial failure | Medium | Medium | Use Promise.allSettled, report per-cookie status |

## Security Considerations
- Validate all incoming messages — reject unknown types
- Don't expose raw chrome.cookies API to content scripts (only extension views)
- Log cookie operations for debugging but never log cookie values to console in production
- Profile restore could overwrite existing cookies — require explicit user action (not automated)

## Next Steps
- Phase 4-6: Views send messages to background for all cookie operations
- Views listen for broadcast events for real-time updates
