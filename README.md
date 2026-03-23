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
| Sao chép (value, name, full string) | ✅ | ✅ | ✅ |
| Chọn nhiều & xóa hàng loạt | ✅ | ✅ | ✅ |
| Nhập / Xuất (JSON, Netscape, Header) | — | — | ✅ |
| Hồ sơ Cookie (lưu & khôi phục) | — | — | ✅ |
| Giám sát cookie thời gian thực | — | ✅ | ✅ |
| Giao diện Sáng / Tối / Hệ thống | ✅ | ✅ | ✅ |
| Tiếng Việt / English | ✅ | ✅ | ✅ |

---

## 📥 Hướng dẫn cài đặt (Tiếng Việt)

### Cách 1: Cài nhanh (không cần code)

1. **Tải source code** từ GitHub:
   - Vào 👉 [https://github.com/nhh0718/cache-mgt](https://github.com/nhh0718/cache-mgt)
   - Nhấn nút **Code** (màu xanh) → chọn **Download ZIP**
   - Giải nén file ZIP ra một thư mục

2. **Cài Node.js** (nếu chưa có):
   - Tải tại 👉 [https://nodejs.org](https://nodejs.org) → chọn bản **LTS**
   - Cài xong, mở **Command Prompt** (hoặc Terminal), gõ kiểm tra:
     ```
     node --version
     ```

3. **Cài pnpm** (trình quản lý package):
   - Mở Command Prompt, gõ:
     ```
     npm install -g pnpm
     ```

4. **Build extension**:
   - Mở Command Prompt, di chuyển vào thư mục đã giải nén:
     ```
     cd đường-dẫn-tới-thư-mục/cache-mgt-main
     ```
   - Cài dependencies và build:
     ```
     pnpm install
     pnpm build
     ```
   - Đợi đến khi thấy `DONE` là xong ✅

5. **Cài vào Chrome**:
   - Mở Chrome, gõ vào thanh địa chỉ: `chrome://extensions/`
   - Bật **Chế độ nhà phát triển** (Developer mode) — công tắc ở góc **trên bên phải**
   - Nhấn nút **Tải tiện ích đã giải nén** (Load unpacked)
   - Chọn thư mục `build/chrome-mv3-prod` bên trong thư mục dự án
   - Xong! 🎉 Extension sẽ xuất hiện trên thanh công cụ Chrome

> 💡 **Mẹo**: Nhấn vào biểu tượng ghim (📌) trên thanh extension để ghim Cookie Manager cho dễ truy cập.

### Cách 2: Clone bằng Git (dành cho developer)

```bash
git clone https://github.com/nhh0718/cache-mgt.git
cd cache-mgt
pnpm install
pnpm build
```

Sau đó mở `chrome://extensions/` → bật **Developer mode** → **Load unpacked** → chọn thư mục `build/chrome-mv3-prod`.

---

## 📥 Installation (English)

### Option 1: Quick Install (no coding required)

1. Go to [https://github.com/nhh0718/cache-mgt](https://github.com/nhh0718/cache-mgt) → click **Code** → **Download ZIP** → extract
2. Install [Node.js LTS](https://nodejs.org) if you don't have it
3. Install pnpm: `npm install -g pnpm`
4. Open terminal in the extracted folder, run:
   ```bash
   pnpm install
   pnpm build
   ```
5. Open `chrome://extensions/` → enable **Developer mode** (top right) → click **Load unpacked** → select the `build/chrome-mv3-prod` folder

### Option 2: Clone with Git

```bash
git clone https://github.com/nhh0718/cache-mgt.git
cd cache-mgt
pnpm install
pnpm build
```

Then: `chrome://extensions/` → **Developer mode** ON → **Load unpacked** → select `build/chrome-mv3-prod`

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

## Development

```bash
pnpm dev        # Chạy dev server (HMR)
pnpm build      # Build production
pnpm package    # Build + tạo .zip cho Chrome Web Store
```

## Localization

Hỗ trợ Tiếng Việt (`vi`, mặc định) và English (`en`).

Chuyển ngôn ngữ ngay trong giao diện — không cần đổi ngôn ngữ trình duyệt.

## License

MIT — [LICENSE](LICENSE)

## Author

**HTN** — [github.com/nhh0718](https://github.com/nhh0718)
