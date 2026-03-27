# 🍪 Cookie Manager — Chrome Extension

Quản lý cookie toàn diện cho Chrome — xem, sửa, tìm kiếm, nhập/xuất, hồ sơ cookie, giám sát thời gian thực.

Comprehensive cookie management extension for Chrome. View, edit, search, import/export, profiles, real-time monitoring — all in one tool.

## Tính năng / Features

| Tính năng | Popup | Side Panel | Full Page |
|-----------|:-----:|:----------:|:---------:|
| Xem cookie (tab hiện tại) | ✅ | ✅ | ✅ |
| Xem tất cả cookie (mọi domain) | — | — | ✅ |
| Tìm kiếm & lọc | ✅ | ✅ | ✅ |
| Sửa / tạo / xóa cookie | ✅ | ✅ | ✅ |
| Clone cookie sang domain khác | ✅ | ✅ | ✅ |
| Sao chép (value, name, full string) | ✅ | ✅ | ✅ |
| Chọn nhiều & xóa hàng loạt | ✅ | ✅ | ✅ |
| Hỗ trợ ẩn danh (Incognito) | ✅ | ✅ | ✅ |
| Nhập / Xuất (JSON, Netscape, Header) | — | — | ✅ |
| Hồ sơ Cookie (lưu & khôi phục) | — | — | ✅ |
| Giám sát cookie thời gian thực | — | ✅ | ✅ |
| Giao diện Sáng / Tối / Hệ thống | ✅ | ✅ | ✅ |
| Tiếng Việt / English | ✅ | ✅ | ✅ |

---

## 📥 Cài đặt nhanh (Windows)

**Cách 1 — Một lệnh duy nhất** (khuyên dùng):

Mở PowerShell, dán lệnh:
```powershell
irm https://raw.githubusercontent.com/nhh0718/cache-mgt/main/scripts/install.ps1 | iex
```

Sau đó:
1. Mở Chrome → `chrome://extensions/` → bật **Developer mode**
2. Nhấn **Load unpacked** → chọn thư mục `%USERPROFILE%\cookie-manager`

**Cập nhật**: Chạy lại lệnh trên → nhấn nút Reload trên `chrome://extensions/`

**Cách 2 — Tải thủ công**:
- [Tải cookie-manager.zip](https://github.com/nhh0718/cache-mgt/releases/latest/download/cookie-manager.zip) → giải nén → Load unpacked

> 💡 **Mẹo**: Ghim extension lên thanh công cụ bằng biểu tượng 📌

---

## 📥 Installation (Mac/Linux)

**Option 1 — One command** (recommended):

```bash
curl -sL https://raw.githubusercontent.com/nhh0718/cache-mgt/main/scripts/install.sh | bash
```

Then:
1. Open Chrome → `chrome://extensions/` → enable **Developer mode**
2. Click **Load unpacked** → select `~/cookie-manager`

**Update**: Run the command again → click Reload on `chrome://extensions/`

**Option 2 — Manual download**:
- [Download cookie-manager.zip](https://github.com/nhh0718/cache-mgt/releases/latest/download/cookie-manager.zip) → extract → Load unpacked

---

## 🛠 Development (dành cho developer)

```bash
git clone https://github.com/nhh0718/cache-mgt.git
cd cache-mgt
pnpm install
pnpm dev          # Dev server (HMR)
pnpm build        # Production build
pnpm package      # Build + .zip for Chrome Web Store
```

---

## Tech Stack

- **Framework**: [Plasmo](https://docs.plasmo.com/) (Manifest V3)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3
- **State**: Zustand (persisted via chrome.storage.local)
- **Build**: Vite (via Plasmo)

## Architecture

```
src/
├── background/          # Service worker — cookie listener, message broker
├── popup.tsx            # Popup entry — compact cookie list
├── sidepanel.tsx        # Side panel entry — persistent view with monitor
├── tabs/
│   ├── fullpage.tsx     # Full page — all features, tabs, profiles
│   └── privacy-policy.tsx
└── shared/
    ├── components/      # Reusable UI (cookie-list, editor, toast, etc.)
    ├── hooks/           # use-cookies, use-current-tab, use-i18n, use-theme
    ├── stores/          # Zustand store + chrome.storage adapter
    ├── types/           # TypeScript interfaces
    └── utils/           # Cookie parser, filter logic
```

## Permissions

| Permission | Mục đích / Why |
|-----------|----------------|
| `cookies` | Đọc, tạo, sửa, xóa cookie (tính năng chính) |
| `storage` | Lưu cài đặt & hồ sơ trên máy |
| `tabs` | Nhận diện tab đang mở để lọc cookie |
| `sidePanel` | Bật chế độ bảng bên |
| `<all_urls>` | Chrome Cookies API yêu cầu quyền host để truy cập cookie mọi domain |

**Quyền riêng tư**: Không thu thập dữ liệu. Không analytics. Không gửi dữ liệu ra ngoài. Mọi thứ ở trên máy bạn.

## Cookie Formats

Hỗ trợ 3 định dạng nhập/xuất:

**JSON**
```json
[{"name":"token","value":"abc123","domain":".example.com","path":"/","secure":true}]
```

**Netscape/Mozilla** — tương thích curl/wget
```
.example.com	TRUE	/	TRUE	1735689600	token	abc123
```

**HTTP Header** — Set-Cookie format
```
token=abc123; Domain=.example.com; Path=/; Secure; HttpOnly
```

## Localization

Hỗ trợ Tiếng Việt (`vi`, mặc định) và English (`en`).

Chuyển ngôn ngữ ngay trong giao diện — không cần đổi ngôn ngữ trình duyệt.

## License

MIT — [LICENSE](LICENSE)

## Author

**HTN** — [github.com/nhh0718](https://github.com/nhh0718)
