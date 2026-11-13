# Sổ tay System Design

Trang web tự học System Design bằng tiếng Việt, xây dựng từ tài liệu tham khảo
*System Design LinkedIn Posts 2024* của ByteByteGo (file PDF không được đưa vào repo).

## Nội dung
- 18 bài học chia thành 7 module: Nền tảng, Mạng & API, Cân bằng tải & Cache, Dữ liệu, Bất đồng bộ, Bảo mật, Thực chiến
- 5 công cụ tương tác: thang latency, máy tính "số 9", mô phỏng load balancer, mô phỏng cache eviction, biểu đồ retry backoff
- Quiz cuối mỗi bài, chế độ ôn tập ngẫu nhiên theo module, mục lục ~200 bài gốc có tìm kiếm
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
  data/        lessons.ts (nội dung bài học), toc.ts (mục lục sách)
  components/  TopBar, Sidebar, Quiz
  pages/       Home, LessonPage, Review, TocPage
  widgets/     5 công cụ tương tác
  hooks/       useHashRoute, useProgress
```
Thêm bài học mới: thêm một phần tử vào `LESSONS` trong `src/data/lessons.ts`.

## Deploy GitHub Pages
Workflow `.github/workflows/deploy.yml` build trên mọi push. Để deploy:
1. Settings → Pages → Source: **GitHub Actions** (repo private cần gói GitHub Pro trở lên).
2. Settings → Secrets and variables → Actions → Variables: thêm `PAGES_ENABLED` = `true`.
