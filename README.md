# Sổ tay System Design

**Xem trực tuyến:** https://tiennhm.io.vn/system-design/

Trang web tự học System Design bằng tiếng Việt, xây dựng từ tài liệu tham khảo
*System Design LinkedIn Posts 2024* của ByteByteGo (file PDF không được đưa vào repo).

## Nội dung
- **59 bài học** chia thành 10 module: Nền tảng, Mạng & Giao thức, API, Cân bằng tải & Cache, Cơ sở dữ liệu, Bất đồng bộ & Dữ liệu, Kiến trúc phần mềm, DevOps & Cloud, Bảo mật, Thực chiến & Case study
- **160+ sơ đồ minh họa** vẽ bằng SVG (sơ đồ kiến trúc và sơ đồ tuần tự), tự đổi màu theo light/dark. Sơ đồ được vẽ mới, không sao chép hình gốc của ByteByteGo
- Mỗi bài có ví dụ thực tế, sai lầm thường gặp, câu hỏi phỏng vấn, phần ghi nhớ và quiz (230+ câu)
- 7 công cụ tương tác: thang latency, máy tính "số 9", load balancer, cache eviction, retry backoff, consistent hashing, token bucket
- Chế độ ôn tập ngẫu nhiên theo module, tìm kiếm toàn văn không dấu, mục lục ~200 bài gốc
- Tiến độ học lưu trong `localStorage` của trình duyệt

## Công nghệ
Vite 6 · React 18 · TypeScript 5. Không dùng thư viện UI; CSS thuần với design token, hỗ trợ light/dark.

## Chạy local
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # xuất ra dist/
npm run preview   # xem bản build
```

## Cấu trúc
```
src/
  data/        lessons.ts (danh sách module), modules/*.ts (nội dung từng module),
               helpers.ts (vẽ sơ đồ SVG, bảng, hộp ghi chú), toc.ts (mục lục sách)
  components/  TopBar, Sidebar, Quiz
  pages/       Home, LessonPage, Review, TocPage
  widgets/     5 công cụ tương tác
  hooks/       useHashRoute, useProgress
```
Thêm bài học mới: đọc [docs/AUTHORING.md](docs/AUTHORING.md), thêm bài vào file module tương ứng trong `src/data/modules/`,
rồi chạy `npm run stats` để kiểm tra độ dài, số sơ đồ và lỗi bố cục sơ đồ.

## Deploy GitHub Pages
Mỗi lần push lên `main`, workflow `.github/workflows/deploy.yml` tự build và deploy lên GitHub Pages.
Đặt biến repo `PAGES_ENABLED` khác `true` để tạm ngừng deploy.
