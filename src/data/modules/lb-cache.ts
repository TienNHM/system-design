import type { Lesson } from '../../types';
import { cols, diagram, interview, note, seq, tbl, tip } from '../helpers';

/*
 * BÀI MẪU: "cache-loi" là chuẩn chất lượng cho mọi bài học khác
 * (độ dài, số sơ đồ, cấu trúc mục, giọng văn).
 */

export const lessons: Lesson[] = [
  {
    id: 'cache-loi',
    mod: 'lb-cache',
    title: '4 sự cố cache kinh điển',
    pages: [20, 11, 348],
    min: 12,
    level: 'trung-binh',
    lede: 'Chủ đề này xuất hiện ba lần trong sách, đủ thấy mức độ quan trọng. Cả bốn sự cố đều dẫn tới cùng một hậu quả: database bị dồn tải đột ngột và có thể sập theo.',
    body: `
<h2>Cache bảo vệ database như thế nào</h2>
<p>Trong mô hình cache-aside phổ biến nhất, service đọc cache trước. Nếu có dữ liệu (cache hit) thì trả về ngay. Nếu không có (cache miss) thì đọc database, ghi kết quả vào cache rồi mới trả về. Với tỉ lệ hit 95%, database chỉ phải chịu 5% lượng đọc.</p>
${diagram({
  w: 720, h: 220,
  nodes: [
    { id: 'u', label: 'Client', x: 70, y: 110, w: 100, kind: 'client' },
    { id: 's', label: 'Service', x: 250, y: 110 },
    { id: 'c', label: 'Cache', sub: 'Redis', x: 470, y: 50, kind: 'cache' },
    { id: 'd', label: 'Database', sub: 'Postgres', x: 470, y: 165, kind: 'store' },
  ],
  edges: [
    { from: 'u', to: 's', label: 'request' },
    { from: 's', to: 'c', label: '1' },
    { from: 's', to: 'd', label: '2' },
    { from: 's', to: 'c', label: '3', curve: -40, dashed: true },
  ],
  caption: 'Hình: Cache-aside. (1) đọc cache; (2) nếu miss thì đọc database; (3) ghi kết quả vào cache cho lần sau.',
})}
<p>Vấn đề là hệ thống thường được dimension theo giả định cache luôn hoạt động. Database có thể chỉ chịu được 5% tải. Khi cache vì lý do nào đó không chặn được request, phần 95% còn lại đổ thẳng xuống database. Bốn sự cố dưới đây là bốn cách điều đó xảy ra.</p>
${diagram({
  w: 720, h: 200,
  nodes: [
    { id: 'u1', label: 'Hàng nghìn\nrequest', x: 80, y: 100, w: 110, h: 56, kind: 'client' },
    { id: 'c', label: 'Cache', sub: 'miss hàng loạt', x: 300, y: 100, kind: 'warn' },
    { id: 'd', label: 'Database', sub: 'CPU 100%', x: 520, y: 100, kind: 'warn' },
    { id: 't', label: 'Timeout\ndây chuyền', x: 660, y: 100, w: 100, h: 56, kind: 'external' },
  ],
  edges: [
    { from: 'u1', to: 'c', kind: 'warn' },
    { from: 'c', to: 'd', label: 'toàn bộ tải', kind: 'warn' },
    { from: 'd', to: 't', kind: 'warn', dashed: true },
  ],
  caption: 'Hình: Khi cache không chặn được request, tải dồn xuống database và lỗi lan ra các service phía trên.',
})}

<h2>1. Thundering herd: nhiều key hết hạn cùng lúc</h2>
<p>Ví dụ: lúc 0 giờ, một job nạp sẵn 1 triệu sản phẩm vào cache với cùng TTL 1 giờ. Đúng 1 giờ sáng, cả triệu key hết hạn cùng một lúc và mọi request đều miss.</p>
${tbl(['Cách xử lý', 'Chi tiết'], [
  ['Thêm jitter vào TTL', 'TTL = 3600s + random(0, 300s). Thời điểm hết hạn tản ra trong 5 phút thay vì dồn vào 1 giây.'],
  ['Ưu tiên dữ liệu cốt lõi', 'Trong lúc cache đang nạp lại, chỉ cho request nghiệp vụ quan trọng (thanh toán, đặt hàng) chạm database; request phụ trả về giá trị mặc định hoặc lỗi tạm thời.'],
])}

<h2>2. Cache penetration: key không tồn tại ở đâu cả</h2>
<p>Request hỏi một key không có trong cache và cũng không có trong database, ví dụ <code>product_id = -1</code>. Vì database không trả về gì nên không có gì để ghi vào cache, và lần sau request lại xuyên thẳng xuống database. Kẻ tấn công có thể lợi dụng điều này bằng cách gửi hàng loạt ID ngẫu nhiên.</p>
${diagram({
  w: 720, h: 230,
  nodes: [
    { id: 'u', label: 'Request\nid=-1', x: 70, y: 115, w: 100, h: 56, kind: 'client' },
    { id: 'b', label: 'Bloom filter', sub: 'có thể tồn tại?', x: 260, y: 115, w: 130, kind: 'lb' },
    { id: 'r', label: 'Trả 404 ngay', x: 260, y: 200, w: 130, kind: 'good' },
    { id: 'c', label: 'Cache', x: 470, y: 60, kind: 'cache' },
    { id: 'd', label: 'Database', x: 470, y: 170, kind: 'store' },
  ],
  edges: [
    { from: 'u', to: 'b' },
    { from: 'b', to: 'r', label: 'không', kind: 'good' },
    { from: 'b', to: 'c', label: 'có' },
    { from: 'c', to: 'd', label: 'miss', dashed: true },
  ],
  caption: 'Hình: Bloom filter chặn request với key chắc chắn không tồn tại trước khi chạm tới cache và database.',
})}
${cols([
  { title: 'Cache giá trị null', body: '<p>Khi database không có key, vẫn ghi <code>key → null</code> vào cache với TTL ngắn (30–60 giây). Đơn giản, nhưng tốn bộ nhớ nếu bị tấn công bằng nhiều key khác nhau.</p>' },
  { title: 'Bloom filter', body: '<p>Cấu trúc dữ liệu vài MB trả lời "key có thể tồn tại không". Trả lời "không" thì chắc chắn đúng; trả lời "có" thì có tỉ lệ sai nhỏ. Chặn được phần lớn request rác.</p>' },
])}

<h2>3. Cache breakdown: một hot key hết hạn</h2>
<p>Giống thundering herd nhưng chỉ với một key rất "nóng", ví dụ trang chủ trong ngày sale hoặc thông tin trận đấu đang diễn ra. Key hết hạn, hàng nghìn request đồng thời cùng miss và cùng chạy một câu query nặng.</p>
${seq({
  actors: [
    { id: 'a', label: 'Request A', kind: 'client' },
    { id: 'b', label: 'Request B', kind: 'client' },
    { id: 'c', label: 'Cache', kind: 'cache' },
    { id: 'd', label: 'Database', kind: 'store' },
  ],
  msgs: [
    { from: 'a', to: 'c', label: 'GET home (miss)' },
    { from: 'a', to: 'c', label: 'SETNX lock:home', kind: 'good' },
    { from: 'b', to: 'c', label: 'GET home (miss)' },
    { from: 'b', to: 'c', label: 'SETNX lock:home → thất bại', kind: 'warn' },
    { note: 'B chờ vài chục ms rồi đọc lại cache' },
    { from: 'a', to: 'd', label: 'query trang chủ' },
    { from: 'a', to: 'c', label: 'SET home, xóa lock', dashed: true },
    { from: 'b', to: 'c', label: 'GET home (hit)', kind: 'good' },
  ],
  caption: 'Hình: Dùng mutex trên cache để chỉ một request được nạp lại hot key, các request khác chờ rồi đọc lại.',
})}
<p>Sách đề xuất cách đơn giản nhất: không đặt TTL cho hot key, vì hot key có thể chiếm tới 80% lượng truy vấn. Khi cần cập nhật, service chủ động ghi đè giá trị mới. Hai cách khác thường dùng là mutex như hình trên, và làm mới bất đồng bộ trước khi key hết hạn.</p>

<h2>4. Cache crash: cả cụm cache sập</h2>
<p>Khi Redis sập, mọi request đổ xuống database. Đây là sự cố nặng nhất vì ảnh hưởng toàn bộ key cùng lúc.</p>
${tbl(['Cách xử lý', 'Chi tiết'], [
  ['Circuit breaker', 'Phát hiện cache lỗi thì "ngắt mạch": tạm thời trả lỗi hoặc dữ liệu mặc định thay vì đẩy mọi request xuống database.'],
  ['Cache cluster', 'Chạy Redis Cluster hoặc Sentinel có replica để một node chết không làm sập cả cache.'],
  ['Local cache tầng 1', 'Mỗi service giữ một cache nhỏ trong RAM cho dữ liệu nóng nhất, đỡ được một phần tải khi cache tập trung lỗi.'],
])}

<h2>Tóm tắt</h2>
${tbl(['Sự cố', 'Nguyên nhân', 'Cách xử lý chính'], [
  ['Thundering herd', 'Nhiều key hết hạn cùng lúc', 'Jitter cho TTL'],
  ['Cache penetration', 'Key không tồn tại ở cả cache và DB', 'Cache null, bloom filter'],
  ['Cache breakdown', 'Một hot key hết hạn', 'Hot key không hết hạn, mutex'],
  ['Cache crash', 'Cache sập', 'Circuit breaker, cluster'],
])}
${note('<b>Sai lầm thường gặp.</b> Chỉ test hệ thống khi cache "ấm". Hãy chạy thử kịch bản cache rỗng (sau deploy, sau khi Redis restart) để biết database chịu được bao nhiêu tải thực sự.')}
${tip('<b>Thực tế.</b> Facebook gọi hiện tượng cache breakdown là "thundering herd" và xử lý bằng cơ chế lease trong Memcache: chỉ client giữ lease mới được nạp lại key, các client khác chờ hoặc nhận giá trị hơi cũ.')}
${interview([
  'Hệ thống của bạn vừa restart Redis và database lập tức quá tải. Bạn xử lý ngay thế nào, và phòng ngừa lần sau ra sao?',
  'Phân biệt cache penetration và cache breakdown. Mỗi loại dùng giải pháp gì?',
  'Bloom filter có thể trả lời sai theo chiều nào? Điều đó ảnh hưởng gì khi dùng để chống cache penetration?',
])}`,
    keys: [
      'Thundering herd: thêm jitter vào TTL.',
      'Penetration: cache giá trị null hoặc dùng bloom filter.',
      'Breakdown: hot key không hết hạn hoặc dùng mutex. Crash: circuit breaker và cache cluster.',
      'Luôn kiểm tra hệ thống chịu được bao nhiêu tải khi cache rỗng.',
    ],
    quiz: [
      { q: 'Kẻ tấn công gửi hàng loạt request với ID không tồn tại. Đây là sự cố gì?', o: ['Thundering herd', 'Cache penetration', 'Cache breakdown', 'Cache crash'], a: 1, why: 'Key không tồn tại ở cả cache và DB nên request luôn xuyên qua cache xuống DB.' },
      { q: 'Cách đơn giản nhất để tránh nhiều key hết hạn cùng lúc là gì?', o: ['Tăng RAM cho cache', 'Cộng thêm thời gian ngẫu nhiên vào TTL', 'Dùng bloom filter', 'Tắt cache'], a: 1, why: 'Jitter làm thời điểm hết hạn của các key tản ra, không dồn vào một lúc.' },
      { q: 'Bloom filter trả lời "không tồn tại". Kết luận nào đúng?', o: ['Key chắc chắn không tồn tại', 'Key có thể vẫn tồn tại', 'Cần hỏi database để chắc chắn', 'Bloom filter đang lỗi'], a: 0, why: 'Bloom filter không bao giờ báo sai theo chiều "không". Nó chỉ có thể báo sai theo chiều "có".' },
    ],
  },
];
