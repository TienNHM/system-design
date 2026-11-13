# Hướng dẫn soạn bài học

Tài liệu này mô tả chuẩn nội dung cho mọi bài học trong `src/data/modules/<module>.ts`.
**Bài mẫu chuẩn:** `cache-loi` trong `src/data/modules/lb-cache.ts`. Đọc kỹ bài này trước khi viết.

## Nguồn
- Tài liệu tham khảo: *System Design LinkedIn Posts 2024* (ByteByteGo). Bản text trích từ PDF nằm ngoài repo (người soạn được cung cấp đường dẫn riêng).
- Dùng sách làm xương sống: các ý chính, số liệu, danh sách, ví dụ công ty phải khớp với sách.
- Được bổ sung kiến thức chuẩn ngành để giải thích sâu hơn (ví dụ cơ chế, con số phổ biến), nhưng không bịa số liệu về công ty cụ thể.
- **Không sao chép nguyên văn** câu chữ tiếng Anh và **không tái tạo sơ đồ gốc** của ByteByteGo. Viết lại bằng lời của mình, vẽ sơ đồ mới bằng helper.
- Ghi số trang sách liên quan vào `pages` (lấy từ mục lục sách).

## Cấu trúc một bài (`Lesson` trong `src/types.ts`)
```ts
{
  id: 'kebab-case-ascii',        // duy nhất toàn site, chỉ a-z 0-9 -
  mod: '<module id>',
  title: 'Tiêu đề tiếng Việt',
  pages: [20, 11],               // trang trong sách
  min: 10,                       // phút đọc ước tính (≈ 200 từ/phút + thời gian xem hình)
  level: 'co-ban' | 'trung-binh' | 'nang-cao',
  widget?: 'latency' | 'nines' | 'lb' | 'cache' | 'retry' | 'hashring' | 'ratelimit', // chỉ khi được giao
  lede: '1–2 câu mở đầu nêu vì sao chủ đề quan trọng.',
  body: `...HTML...`,
  keys: ['3–5 ý ghi nhớ, mỗi ý một câu'],
  quiz: [{ q, o: [...], a: <chỉ số đúng>, why: 'giải thích' }], // 3–4 câu
}
```

## Yêu cầu nội dung `body`
- **Độ dài:** 700–1.200 từ tiếng Việt (không tính code SVG).
- **Ít nhất 2 hình minh họa** bằng `diagram()` hoặc `seq()`; chủ đề có luồng xử lý nên có 3. Mỗi hình có `caption` bắt đầu bằng `Hình: `.
- Các mục `<h2>` gợi ý (tùy chủ đề, không bắt buộc đủ):
  1. Khái niệm / vấn đề cần giải quyết
  2. Cách hoạt động (kèm sơ đồ)
  3. Các biến thể / so sánh (bảng `tbl()` hoặc `cols()`)
  4. Ví dụ thực tế (`tip()`), ưu tiên ví dụ có trong sách
  5. Sai lầm thường gặp (`note()`)
  6. `interview([...])` với 2–4 câu hỏi phỏng vấn — luôn đặt cuối body
- Dùng `<code>` cho tên lệnh, header, config; `<b>` cho thuật ngữ khi giới thiệu lần đầu.
- Mỗi đoạn `<p>` 2–4 câu. Không dùng emoji.

## Giọng văn
- Tiếng Việt có dấu, rõ ràng, như một kỹ sư giải thích cho đồng nghiệp. Giữ thuật ngữ tiếng Anh phổ biến (cache, load balancer, shard, request…), giải thích khi xuất hiện lần đầu.
- Câu chủ động, ngắn. Tránh văn sáo rỗng ("Trong thế giới công nghệ ngày nay…").
- Không dùng cấu trúc "không phải X mà là Y", không dùng gạch ngang dài để chèn ý.

## Helper (`src/data/helpers.ts`)
Chỉ import những helper thực sự dùng (TypeScript bật `noUnusedLocals`).

| Helper | Dùng cho |
|---|---|
| `diagram({ w, h, nodes, edges, groups, caption })` | Sơ đồ kiến trúc. `w` nên là 720. Node đặt theo **tâm** (x, y). Kích thước mặc định 120×48 (store 120×60). |
| `seq({ actors, msgs, caption })` | Sơ đồ tuần tự (handshake, OAuth, request/response). `msgs` có thể chứa `{ note: '...' }`. Tối đa ~5 actor, ~12 message. |
| `tbl(head, rows)` | Bảng so sánh. |
| `cols([{ title, body }])` | 2–3 cột so sánh song song (body là HTML). |
| `flow([...], cap)` | Chuỗi bước dạng chip (dùng ít, ưu tiên `diagram`). |
| `note(html)` / `tip(html)` | Hộp lưu ý (cam) / ví dụ thực tế (xanh). Mở đầu bằng `<b>Tiêu đề.</b>` |
| `interview([...])` | Danh sách câu hỏi phỏng vấn. |

### Mẹo vẽ `diagram`
- `kind`: `client` (người dùng, app — bo tròn), `service` (mặc định), `store` (database, hình trụ), `cache`, `queue` (có vạch), `lb` (load balancer, gateway, proxy — viền đậm), `external` (bên thứ ba, nét đứt), `warn` (điểm lỗi/nghẽn), `good` (kết quả tốt).
- Label xuống dòng bằng `\n`; tối đa ~16 ký tự mỗi dòng với node rộng 120. Node có label dài thì tăng `w`.
- `sub`: dòng chữ nhỏ dưới label (ví dụ tên công nghệ `'Redis'`). Không dùng `sub` cùng label 2 dòng trên node cao 48 — tăng `h` lên 60.
- Edge label là số (`'1'`, `'2a'`) sẽ vẽ thành vòng tròn đánh số bước — dùng để đánh số luồng rồi giải thích từng bước bằng danh sách `<ol>` bên dưới.
- Edge label chữ nên ngắn (≤ 18 ký tự). `curve: 30` hoặc `-30` để tách hai mũi tên ngược chiều giữa cùng hai node.
- Chừa lề ≥ 70px quanh node ngoài cùng; khoảng cách tâm giữa hai node cạnh nhau ≥ 170px theo chiều ngang, ≥ 85px theo chiều dọc. Dùng hết bề ngang 720.
- `groups`: khung nét đứt có nhãn để gom các node (ví dụ "Region A", "Kubernetes cluster"). Tọa độ là góc trên trái; nhãn nằm ở góc trên trái nên chừa 24px phía trên node đầu tiên.
- Nên giữ ≤ 9 node mỗi hình. Hình phức tạp thì tách làm hai.

## Kiểm tra
```bash
npx tsc -b
```
phải không có lỗi. Không chỉnh file ngoài module được giao.
