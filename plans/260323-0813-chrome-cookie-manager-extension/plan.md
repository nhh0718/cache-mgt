---
title: "Cookie Manager — Chrome Extension"
description: "Comprehensive cookie management extension with 3 views, profiles, real-time monitoring, import/export"
status: pending
priority: P1
effort: 32h
branch: main
tags: [chrome-extension, plasmo, react, typescript, cookies]
created: 2026-03-23
---

# Cookie Manager — Chrome Extension

## Overview
Chrome MV3 extension for cookie CRUD, import/export, profiles, and real-time monitoring. Built with Plasmo + React + TypeScript + Tailwind + Zustand. Three views: Popup, Side Panel, Full Page.

## Research Reports
- [CRXJS/Plasmo Research](../reports/researcher-260323-0810-crxjs-vite-research.md)
- [Chrome Extension APIs](../reports/researcher-260323-0810-chrome-extension-apis.md)
- [Cookie Formats & Zustand](../reports/researcher-260323-0810-cookie-formats-zustand.md)

## Phases

| # | Phase | Effort | Status | File |
|---|-------|--------|--------|------|
| 1 | Project Setup | 3h | pending | [phase-01](./phase-01-project-setup.md) |
| 2 | Shared Foundation | 6h | pending | [phase-02](./phase-02-shared-foundation.md) |
| 3 | Background Service Worker | 4h | pending | [phase-03](./phase-03-background-service-worker.md) |
| 4 | Popup View | 4h | pending | [phase-04](./phase-04-popup-view.md) |
| 5 | Side Panel View | 5h | pending | [phase-05](./phase-05-sidepanel-view.md) |
| 6 | Full Page View | 6h | pending | [phase-06](./phase-06-fullpage-view.md) |
| 7 | Testing & Polish | 4h | pending | [phase-07](./phase-07-testing-and-polish.md) |

## Key Dependencies
- Phase 2 depends on Phase 1 (project scaffold)
- Phases 3-6 depend on Phase 2 (shared layer)
- Phases 4, 5, 6 can run in parallel after Phase 3
- Phase 7 depends on all prior phases

## Architecture Summary
```
Background (service worker) ←→ chrome.storage.local ←→ Zustand stores
    ↕ chrome.runtime messages
Popup / SidePanel / FullPage (React views, shared components)
```

## Permissions
`cookies`, `storage`, `tabs`, `sidePanel`, `<all_urls>` host_permissions
