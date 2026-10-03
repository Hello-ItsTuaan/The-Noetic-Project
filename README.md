# Website Ôn Tập

Website học tập kiểu Quizlet dành cho học sinh Việt Nam, chạy local-first trong trình duyệt với IndexedDB và sẵn sàng chuyển sang Supabase trong tương lai.

## 1. Giới thiệu

- Dữ liệu lưu trong browser bằng IndexedDB (Dexie), không cần backend trong giai đoạn đầu.
- Người dùng có thể tạo thư mục, bộ ôn tập và nhập thẻ từ văn bản theo định dạng Quizlet.
- Giao diện tối ưu cho điện thoại, hỗ trợ light/dark và PWA offline.
- Kiến trúc đã tách repository/data layer để dễ chuyển sang Supabase mà không viết lại UI.

## 2. Chạy thử

```bash
npm install
cp .env.example .env.local
npm run dev
```

Build và preview:

```bash
npm run build
npm run preview
```

## 3. Cấu trúc thư mục

```text
.
├── .env.example             # Mẫu biến môi trường
├── .github/workflows/       # Workflow deploy GitHub Actions
├── public/                  # File tĩnh, favicon, asset công khai
├── samples/                 # File mẫu import dạng text/Quizlet
├── src/
│   ├── App.tsx              # UI chính với routing và luồng học tập
│   ├── config/
│   │   ├── constants.ts     # Hằng số nghiệp vụ
│   │   ├── env.ts           # Đọc env qua zod
│   │   └── env.test.ts      # Test validate cấu hình môi trường
│   ├── data/
│   │   ├── StorageAdapter.ts # Interface repository layer
│   │   ├── types.ts         # Kiểu dữ liệu chung
│   │   ├── index.ts         # Factory chọn adapter
│   │   ├── LocalAdapter.contract.test.ts
│   │   └── adapters/
│   │       ├── LocalAdapter.ts   # Dexie implementation
│   │       └── SupabaseAdapter.ts # Stub sẵn cho tương lai
│   ├── locales/
│   │   └── vi.ts            # Tất cả chuỗi giao diện tiếng Việt
│   ├── utils/
│   │   ├── import.ts        # Parse văn bản nhập từ Quizlet
│   │   ├── import.test.ts
│   │   ├── quiz.ts          # Logic sinh câu hỏi và chấm điểm
│   │   └── ...
│   ├── main.tsx
│   ├── index.css
│   └── App.css
├── supabase/
│   └── migrations/
│       └── 0001_init.sql   # SQL tham khảo cho Supabase
├── vite.config.ts
├── package.json
├── tsconfig.*
├── .gitignore
└── README.md
```

## 4. Biến môi trường

| Tên biến | Ý nghĩa | Bắt buộc | Mẫu giá trị |
| --- | --- | --- | --- |
| VITE_APP_NAME | Tên app hiển thị | Không | "Website Ôn Tập" |
| VITE_STORAGE_PROVIDER | local hoặc supabase | Có | "local" |
| VITE_BASE_PATH | Base path khi deploy | Không | "/" hoặc "/website-on-tap/" |
| VITE_SUPABASE_URL | Project URL Supabase | Chỉ khi provider = supabase | "https://xyz.supabase.co" |
| VITE_SUPABASE_ANON_KEY | Public anon key | Chỉ khi provider = supabase | "eyJ..." |

## 5. Định dạng import Quizlet và schema JSON

### Quizlet text format

Mỗi dòng là một thẻ. Dùng dấu tab giữa thuật ngữ và định nghĩa.

```text
Hà Nội	Thủ đô của Việt Nam
Nước	Chất lỏng cần thiết cho sự sống
```

### JSON schema của app

```json
{
  "version": 1,
  "exportedAt": "2026-10-03T00:00:00.000Z",
  "folders": [],
  "studySets": [],
  "items": [],
  "progress": [],
  "attempts": []
}
```

## 6. Deploy lên host tĩnh

### GitHub Pages

1. Tạo workflow của GitHub Actions.
2. Khai báo biến `VITE_*` trong Repository Secrets hoặc Environment Variables.
3. Cài `base` theo `VITE_BASE_PATH` trong `vite.config.ts`.
4. Push lên `main` để build và publish `dist/`.

### Netlify / Vercel

- Thiết lập biến môi trường trong dashboard của host.
- Dùng `npm run build` và upload `dist/` hoặc tích hợp build command.
- Lưu ý: biến `VITE_*` được nướng vào bundle lúc build, không phải lúc runtime.

## 7. Tích hợp Supabase trong tương lai

### a. Chuẩn bị

- Tạo project Supabase mới.
- Lấy Project URL và anon key ở API Settings.
- KHÔNG đưa service_role key vào frontend hay repo.

### b. Điền biến môi trường

```env
VITE_STORAGE_PROVIDER=supabase
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### c. Chạy migration

Dùng file `supabase/migrations/0001_init.sql` trong SQL Editor hoặc Supabase CLI.

### d. Cài thư viện

```bash
npm install @supabase/supabase-js
```

### e. Hiện thực SupabaseAdapter

- Map `folders`, `study_sets`, `items`, `progress`, `attempts` theo `StorageAdapter`.
- Sử dụng UUID từ client và các trường `created_at`, `updated_at`, `deleted_at`.
- Dùng `owner_id = auth.uid()` trong policy RLS.

### f. Xác thực

- Thêm Supabase Auth với email magic link hoặc Google.
- Lưu `ownerId` từ `auth.uid()`.
- Thêm màn hình login và trạng thái phiên.

### g. Chuyển dữ liệu

- Dùng `exportSnapshot()` từ app local.
- Import snapshot vào Supabase sau khi đăng nhập.
- Nên sao lưu file JSON trước khi chuyển.

### h. Đồng bộ và xung đột

- Quy tắc: bản có `updatedAt` mới hơn thắng.
- Xóa mềm bằng `deletedAt`.
- Nếu muốn phát triển tiếp, dùng hàng đợi offline để lưu thay đổi chưa đồng bộ.

### i. Redirect URL cho Auth

- Khi deploy, redirect URL phải khớp domain thật.
- Với HashRouter, cần kiểm tra lại URL redirect chuẩn cho SPA.

### j. Checklist kiểm thử

- Đổi `VITE_STORAGE_PROVIDER=supabase`.
- Kiểm tra `.env.local` / biến deploy đã đúng.
- Chạy migration và kiểm tra RLS.
- Kiểm tra CRUD, snapshot, và auto-restore.
- Quay lại local bằng `VITE_STORAGE_PROVIDER=local`.

## 8. Quy ước dự án

- Không hardcode nội dung học hay câu hỏi trong code.
- Không commit `.env` và khóa bí mật.
- Tất cả chuỗi giao diện nằm trong `src/locales/vi.ts`.
- Hằng số và số nghiệp vụ nằm trong `src/config/constants.ts`.
- Tất cả biến môi trường đọc qua `src/config/env.ts` và `zod`.

## 9. Lộ trình sau

- Đăng nhập + đồng bộ Supabase
- Chia sẻ bộ ôn tập bằng link
- Thêm ảnh và tập tin đính kèm
- Lặp lại ngắt quãng
- Nhập dữ liệu từ ảnh/PDF bằng AI

## 10. Tài liệu mẫu

File mẫu import được đặt trong thư mục `samples/` để thử nghiệm mà không làm app bị hardcode nội dung.
