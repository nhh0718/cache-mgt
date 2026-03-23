---
title: CRXJS Vite Plugin Research - Chrome Extension MV3 Development
date: 2026-03-23
status: knowledge-cutoff-based
---

## Executive Summary

CRXJS vite-plugin remains functional for Manifest V3 Chrome extensions but faces maintenance challenges. Actively maintained alternatives (Plasmo, WXT) offer better DX and are recommended for new projects.

## Current State

### CRXJS (@crxjs/vite-plugin)
- **Latest stable:** v0.14.x (as of Feb 2025)
- **Maintenance:** Ongoing but slower release cycle; smaller community
- **Compatibility:** MV3 support present, React + TypeScript compatible
- **Status:** Production-ready but not aggressively developed

### Key Issues Known (Feb 2025)
- HMR: Works but can be flaky on extension reload; sometimes requires manual refresh
- Multi-entry config: Supports popup, sidepanel, content scripts, but setup is verbose
- Breaking changes: None major since v0.13, but dependency updates may cause friction
- DevTools integration: Limited compared to standard Vite projects

### Manifest V3 Compatibility
CRXJS explicitly targets MV2→MV3 migration:
- Automatic manifest transformation from config
- Service worker (not background page) support
- Host permissions and content script handling correct
- But: Some edge cases with dynamic content scripts remain

## Multi-Entry Configuration

Typical setup with popup + sidepanel + fullpage:
```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react(), crxPlugin()],
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        sidepanel: 'src/sidepanel/index.html',
        fullpage: 'src/fullpage/index.html',
        background: 'src/background.ts',
        content: 'src/content.ts'
      }
    }
  }
})
```
Configuration is boilerplate-heavy; Plasmo abstracts this better.

## Alternatives

### Plasmo (Recommended for new projects)
- **Status:** Actively maintained, growing ecosystem
- **DX:** Superior — convention-over-config, built-in MV3 best practices
- **HMR:** Native, reliable
- **Multi-entry:** File-structure based (automatic discovery)
- **Learning curve:** Higher upfront, but pays off
- **Community:** Larger, better docs

### WXT (Emerging)
- **Status:** Newer, rapidly evolving
- **Focus:** Framework-agnostic, minimalist
- **MV3:** First-class support
- **Multi-entry:** Auto-detected from directory structure
- **Stability:** Not yet stable for production

### vite-plugin-web-extension
- **Status:** Maintained but niche
- **Use case:** Minimal wrapper over standard Vite
- **Trade-off:** Less convenience, more manual config

## Recommendations

### For New Projects
**Use Plasmo** if:
- Building from scratch
- Want opinionated, modern setup
- Prioritize DX and HMR reliability
- Can invest learning curve

**Use CRXJS** if:
- Existing ecosystem/templates preferred
- Need minimal overhead
- Happy with verbose config
- Want lighter dependency footprint

### For Existing Projects
- **Stay with CRXJS** if stable; no urgency to migrate
- **Monitor Plasmo** for 2026 maturity gains
- **Avoid** WXT for production (not yet stable)

## Breaking Changes & Migration Notes

### V0.13 → V0.14
- Vite peer dependency tightened; upgrade Vite to ^4.5 or ^5.0
- Manifest schema validation stricter
- Action script loading changed slightly

### No major deprecations announced (as of Feb 2025)

## Critical Findings

1. **CRXJS is not deprecated** but development pace slow; viable for production
2. **HMR remains imperfect** — expect occasional manual reloads during dev
3. **Plasmo is gaining traction** — may become de facto standard by 2027
4. **MV3 support solid** in both CRXJS and Plasmo; choose on DX, not compatibility

## Unresolved Questions

- Does CRXJS team plan aggressive 2026 updates or maintenance-only mode?
- Plasmo's roadmap for state management integration?
- WXT timeline to v1.0 and production readiness?
