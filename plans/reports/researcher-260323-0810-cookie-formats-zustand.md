# Cookie Import/Export Formats & Zustand for Extensions
**Research Report** | 2026-03-23

## Topic 1: Cookie Import/Export Formats

### Netscape/Mozilla Cookie Format (cookies.txt)
**Line Format:** Tab-separated, 7 fields per line
```
domain  flag  path  secure  expiration  name  value
.example.com  TRUE  /  TRUE  1735689600  session_id  abc123def456
```
- **domain**: Cookie domain (leading dot = subdomain match)
- **flag**: TRUE/FALSE (sendToHost behavior, obsolete but required)
- **path**: URL path (/)
- **secure**: TRUE/FALSE (HTTPS only)
- **expiration**: Unix timestamp (0 = session cookie)
- **name**: Cookie name
- **value**: Cookie value (can be empty)

**Parsing:** Tab-split each line, validate 7 fields, ignore comment lines (#)

### JSON Cookie Format
Common structure used by EditThisCookie/Cookie-Editor extensions:
```json
[
  {
    "domain": ".example.com",
    "name": "sessionId",
    "value": "abc123",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "sameSite": "Strict",
    "expirationDate": 1735689600,
    "session": false,
    "storeId": "0"
  }
]
```
**Key fields:** domain, name, value, path, secure, httpOnly, sameSite (Strict/Lax/None), expirationDate, session, storeId

### HTTP Cookie Header Format
**Set-Cookie header** (server → client):
```
Set-Cookie: name=value; Domain=example.com; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=3600; Expires=Wed, 09 Jun 2026 10:18:14 GMT
```
**Cookie header** (client → server): `Cookie: name1=value1; name2=value2`

Serialization: Key-value pairs separated by `; ` (semicolon-space)

### Cookie Fields Summary
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | Identifier |
| value | string | No | Can be empty |
| domain | string | Yes | Target domain |
| path | string | No | Default: / |
| secure | bool | No | HTTPS only |
| httpOnly | bool | No | Block JS access |
| sameSite | enum | No | Strict/Lax/None |
| expirationDate | number | No | Unix timestamp (0=session) |
| session | bool | No | Omits expirationDate |
| storeId | string | No | Chrome store partition |

---

## Topic 2: Zustand for Chrome Extensions

### Latest Zustand Patterns (2025-2026)
1. **Minimal API**: Simple `create()` + hook pattern (no Redux boilerplate)
2. **Immer middleware**: Built-in immutability helpers
3. **Devtools middleware**: Time-travel debugging
4. **persist middleware**: Automatic localStorage/chrome.storage sync

### Multi-View Synchronization Pattern
**Core approach:** Persist store to `chrome.storage.sync` + listen for changes across views

```typescript
// 1. Create store with persist middleware
const useCookieStore = create(
  persist(
    (set) => ({
      cookies: [],
      addCookie: (cookie) => set((s) => ({ cookies: [...s.cookies, cookie] }))
    }),
    {
      name: "cookie-store",
      storage: {
        getItem: (key) => chrome.storage.local.getItem(key).then(r => r?.[key]),
        setItem: (key, value) => chrome.storage.local.setItem({ [key]: value }),
        removeItem: (key) => chrome.storage.local.removeItem(key)
      }
    }
  )
);

// 2. Sync across extension contexts (popup, sidepanel, content script)
chrome.storage.local.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes['cookie-store']) {
    const newState = JSON.parse(changes['cookie-store'].newValue);
    useCookieStore.setState(newState);
  }
});
```

### Middleware Patterns
- **persist**: Auto-save to `chrome.storage` on state change
- **devtools**: Chrome DevTools extension integration
- **immer**: Mutable-style syntax (internally immutable)
- **combine**: Merge multiple stores (avoid for extensions; use single store)

### Chrome Extension Libraries
- **zustand-chrome-sync**: Community package for cross-view sync (less maintained)
- **zustand** + manual chrome.storage handling: Recommended approach (more control)
- **zustand-sync-middleware**: Custom implementation, preferred for extensions

---

## Key Recommendations
1. **Import/Export:** Use JSON format for UI (flexible), Netscape format for compatibility
2. **State Management:** Single Zustand store + chrome.storage.local + onChanged listener
3. **Extension Communication:** Don't rely on zustand alone; handle chrome.storage changes explicitly

## Unresolved Questions
- Does sameSite=None require Secure=true in all scenarios? (Likely yes for modern browsers)
- Should storeId differentiation be user-configurable in UI? (Depends on use case)
