import type { Lesson } from '../../types';
import { cols, diagram, interview, note, seq, tbl, tip } from '../helpers';

export const lessons: Lesson[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'latency',
    mod: 'nen-tang',
    title: 'Những con số latency cần nhớ',
    pages: [307, 210],
    min: 10,
    level: 'co-ban',
    widget: 'latency',
    lede: 'Mọi quyết định thiết kế đều dựa trên câu hỏi "thao tác này tốn bao lâu". Chỉ cần thuộc bậc độ lớn của vài con số, bạn đã loại được phần lớn phương án sai ngay từ đầu.',
    body: `
<h2>Vì sao phải nhớ bậc độ lớn</h2>
<p>Khi so sánh hai phương án, câu hỏi đầu tiên thường là chi phí thời gian của từng bước. Đọc RAM hay đọc đĩa, gọi service trong cùng datacenter hay gọi sang lục địa khác, các lựa chọn này chênh nhau hàng nghìn đến hàng triệu lần. Bạn không cần nhớ chính xác từng nano giây, chỉ cần nhớ <b>bậc độ lớn</b> (order of magnitude) để biết phương án nào khả thi.</p>
<p>Sách tổng hợp các con số dưới đây từ bảng latency nổi tiếng của Jeff Dean và một số benchmark trực tuyến. Phần cứng hiện đại nhanh hơn ở vài chỗ, nhưng tỉ lệ giữa các tầng gần như không đổi. Hai dòng đánh dấu (*) là con số phổ biến được bổ sung thêm để bảng đầy đủ hơn.</p>
${tbl(['Thao tác', 'Latency', 'Ví dụ thực tế'], [
  ['Đọc L1 / L2 cache', '<code>1 ns</code> / <code>10 ns</code>', 'Nằm ngay trên chip CPU, hiếm khi cần quan tâm trừ khi viết code sát phần cứng'],
  ['Đọc RAM', '<code>100 ns</code>', 'Redis lưu dữ liệu trong RAM nên đọc một key mất cỡ 100 ns (chưa tính mạng)'],
  ['Gửi 1 KB qua mạng 1 Gbps', '<code>10 µs</code>', 'Lấy một giá trị 1 KB từ Memcached qua mạng nội bộ'],
  ['Đọc ngẫu nhiên từ SSD', '<code>100 µs</code>', 'RocksDB là K/V store trên đĩa, đọc trên SSD cỡ 100 µs'],
  ['Round trip trong cùng datacenter (*)', '<code>500 µs</code>', 'Một lần gọi RPC giữa hai service cạnh nhau'],
  ['Insert vào database', '<code>1 ms</code>', 'Postgres commit: ghi dữ liệu, cập nhật index, flush log'],
  ['Seek trên ổ HDD (*)', '<code>10 ms</code>', 'Lý do database đời cũ cố gắng đọc tuần tự'],
  ['Gói tin California → Hà Lan → California', '<code>100 ms</code>', 'Cuộc gọi Zoom xuyên lục địa'],
  ['Chu kỳ retry / refresh', '<code>1-10 s</code>', 'Hệ thống monitoring thường refresh mỗi 5-10 giây'],
])}
<p>Đơn vị: 1 ns = 10<sup>-9</sup> giây; 1 µs = 1.000 ns; 1 ms = 1.000 µs = 1.000.000 ns. Hình dưới xếp các con số thành một chuỗi để thấy rõ mỗi bước nhảy lớn cỡ nào.</p>
${diagram({
  w: 720, h: 240,
  nodes: [
    { id: 'l1', label: 'L1 / L2 cache', sub: '1-10 ns', x: 120, y: 60, w: 130, kind: 'cache' },
    { id: 'ram', label: 'RAM', sub: '100 ns', x: 360, y: 60, w: 130, kind: 'cache' },
    { id: 'net', label: 'Mạng 1 KB', sub: '10 µs', x: 600, y: 60, w: 130 },
    { id: 'ssd', label: 'SSD', sub: '100 µs', x: 600, y: 180, w: 130, kind: 'store' },
    { id: 'db', label: 'DB insert', sub: '1 ms', x: 360, y: 180, w: 130, kind: 'store' },
    { id: 'wan', label: 'Xuyên lục địa', sub: '100 ms', x: 120, y: 180, w: 130, kind: 'warn' },
  ],
  edges: [
    { from: 'l1', to: 'ram', label: '×100' },
    { from: 'ram', to: 'net', label: '×100' },
    { from: 'net', to: 'ssd', label: '×10' },
    { from: 'ssd', to: 'db', label: '×10' },
    { from: 'db', to: 'wan', label: '×100', kind: 'warn' },
  ],
  caption: 'Hình: Thang latency. Từ RAM tới một vòng mạng xuyên lục địa là khoảng một triệu lần.',
})}

<h2>Phóng to theo thang thời gian của con người</h2>
<p>Nano giây quá nhỏ để cảm nhận. Một mẹo dễ nhớ là giả sử 1 ns kéo dài 1 giây, rồi quy đổi mọi thứ còn lại theo cùng tỉ lệ.</p>
${tbl(['Thao tác', 'Latency thật', 'Nếu 1 ns = 1 giây'], [
  ['Đọc L1 cache', '1 ns', '1 giây, một cái chớp mắt'],
  ['Đọc RAM', '100 ns', 'gần 2 phút'],
  ['Gửi 1 KB qua mạng', '10 µs', 'gần 3 giờ'],
  ['Đọc SSD', '100 µs', 'hơn một ngày'],
  ['Insert database', '1 ms', 'khoảng 11,5 ngày'],
  ['Vòng mạng xuyên lục địa', '100 ms', 'hơn 3 năm'],
])}
<p>Nhìn theo cách này, một câu query database "chỉ 1 ms" thực ra là một chuyến đi rất xa so với đọc RAM. Đó là lý do gần như mọi kỹ thuật tăng tốc trong sách đều xoay quanh cùng một ý: đưa dữ liệu về gần nơi cần dùng, hoặc bớt số lần phải đi xa.</p>

<h2>Latency là tiền</h2>
<p>Sách nhắc lại một phát hiện của Amazon khoảng mười năm trước: cứ thêm 100 ms latency thì doanh số giảm khoảng 1%. Với hệ thống hướng người dùng ở quy mô lớn, độ trễ cao là thất thoát doanh thu trực tiếp. Sách đưa ra 6 chiến lược giảm latency, và hình dưới cho thấy mỗi chiến lược tác động vào đoạn nào trên đường đi của một request.</p>
${diagram({
  w: 720, h: 280,
  nodes: [
    { id: 'u', label: 'Người dùng', x: 80, y: 140, w: 110, kind: 'client' },
    { id: 'cdn', label: 'CDN', sub: 'file tĩnh', x: 270, y: 50, kind: 'cache' },
    { id: 'lb', label: 'Load balancer', x: 270, y: 200, w: 130, kind: 'lb' },
    { id: 's', label: 'Service', x: 460, y: 200 },
    { id: 'q', label: 'Queue', sub: 'việc nặng', x: 460, y: 80, kind: 'queue' },
    { id: 'c', label: 'Cache', sub: 'Redis', x: 640, y: 120, kind: 'cache' },
    { id: 'd', label: 'Database', sub: 'có index', x: 640, y: 225, kind: 'store' },
  ],
  edges: [
    { from: 'u', to: 'cdn', label: '4' },
    { from: 'u', to: 'lb', label: '3' },
    { from: 'lb', to: 'u', label: '6', dashed: true, curve: 40 },
    { from: 'lb', to: 's' },
    { from: 's', to: 'q', label: '5' },
    { from: 's', to: 'c', label: '2' },
    { from: 's', to: 'd', label: '1' },
  ],
  caption: 'Hình: Sáu chiến lược giảm latency trên đường đi của một request, đánh số theo danh sách bên dưới.',
})}
<ol>
<li><b>Database index:</b> biến một lần quét toàn bảng thành vài lần đọc trên cây B-tree. Đây thường là cải thiện rẻ nhất.</li>
<li><b>Caching:</b> trả kết quả từ RAM (cỡ 100 ns tới dưới 1 ms qua mạng) thay vì chạm database.</li>
<li><b>Load balancing:</b> chia đều tải để không server nào quá tải và xếp hàng request.</li>
<li><b>CDN:</b> đặt file tĩnh ở máy chủ gần người dùng, cắt bớt vòng mạng 100 ms xuyên lục địa.</li>
<li><b>Xử lý bất đồng bộ:</b> đẩy việc nặng (gửi email, resize ảnh) vào queue, trả response ngay.</li>
<li><b>Nén dữ liệu:</b> gzip hoặc Brotli làm payload nhỏ đi, tốn ít thời gian truyền hơn.</li>
</ol>
${tip('<b>Thực tế.</b> Theo sách, mức thất thoát 1% doanh số của Amazon tương đương khoảng 5,7 tỷ USD theo quy mô hiện nay. Vì vậy các công ty lớn đặt ngân sách latency cho từng trang, ví dụ p99 dưới 200 ms, và mỗi team phải chứng minh tính năng mới không làm vượt ngân sách đó.')}

<h2>Áp dụng khi ước lượng</h2>
${cols([
  { title: 'Gọi tuần tự', body: '<p>Trang sản phẩm gọi lần lượt 5 service, mỗi service 20 ms. Tổng latency khoảng 100 ms, chưa kể thời gian xếp hàng.</p>' },
  { title: 'Gọi song song', body: '<p>Gọi cùng lúc 5 service độc lập. Tổng latency bằng service chậm nhất, khoảng 20-30 ms. Đổi lại code phức tạp hơn và cần timeout cho từng lời gọi.</p>' },
])}
<p>Một phép nhẩm khác: nếu mỗi lần insert mất 1 ms và chỉ có một luồng ghi tuần tự, database chỉ đạt khoảng 1.000 insert mỗi giây. Muốn cao hơn thì phải ghi theo batch, ghi song song hoặc đổi kiến trúc.</p>
${note('<b>Sai lầm thường gặp.</b> Nói "Redis đọc mất 100 ns" rồi quên rằng Redis thường nằm ở máy khác. Mỗi lần gọi phải cộng thêm một vòng mạng trong datacenter, cỡ vài trăm µs. Gọi Redis 100 lần trong một vòng lặp (lỗi N+1) có thể tốn hàng chục ms; hãy dùng <code>MGET</code> hoặc pipeline.')}
${interview([
  'Đọc 1 MB từ RAM, từ SSD và qua mạng xuyên lục địa: hãy xếp thứ tự và ước lượng chênh lệch giữa chúng.',
  'Trang chủ của bạn có p99 là 800 ms. Bạn sẽ đo và giảm latency theo những bước nào?',
  'Vì sao một vòng lặp gọi cache 200 lần có thể chậm hơn một câu query database được index tốt?',
])}`,
    keys: [
      'RAM ~100 ns, mạng 1 KB ~10 µs, SSD ~100 µs, DB insert ~1 ms, xuyên lục địa ~100 ms.',
      'Mỗi tầng chênh nhau 10 đến 100 lần; từ RAM tới mạng xuyên lục địa là khoảng một triệu lần.',
      'Amazon: mỗi 100 ms latency làm mất khoảng 1% doanh số.',
      'Sáu cách giảm latency: index, cache, load balancing, CDN, xử lý bất đồng bộ, nén dữ liệu.',
    ],
    quiz: [
      { q: 'Đọc một key từ Redis (in-memory, không tính mạng) mất khoảng bao lâu?', o: ['100 ns', '100 µs', '1 ms', '100 ms'], a: 0, why: 'Redis giữ dữ liệu trong RAM, mà đọc RAM khoảng 100 ns. Trên thực tế phải cộng thêm latency mạng nếu Redis ở máy khác.' },
      { q: 'Thao tác nào chậm nhất?', o: ['Đọc SSD', 'Insert vào Postgres', 'Gửi gói tin California → Hà Lan → California', 'Gửi 1 KB qua mạng 1 Gbps'], a: 2, why: 'Vòng mạng xuyên lục địa khoảng 100 ms, chậm hơn insert database (~1 ms) khoảng 100 lần.' },
      { q: 'Chiến lược nào giảm latency bằng cách đặt nội dung gần người dùng về mặt địa lý?', o: ['Database index', 'CDN', 'Xử lý bất đồng bộ', 'Nén dữ liệu'], a: 1, why: 'CDN đặt bản sao file tĩnh ở các máy chủ edge gần người dùng, cắt bỏ vòng mạng dài tới server gốc.' },
      { q: 'Một service gọi tuần tự 4 dependency, mỗi cái 25 ms. Gọi song song thì latency tổng gần nhất với giá trị nào?', o: ['25 ms', '50 ms', '100 ms', '4 ms'], a: 0, why: 'Khi gọi song song, tổng latency bằng lời gọi chậm nhất, ở đây khoảng 25 ms.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'uoc-luong',
    mod: 'nen-tang',
    title: 'Ước lượng nhanh (back-of-the-envelope)',
    pages: [307],
    min: 11,
    level: 'trung-binh',
    lede: 'Trước khi vẽ kiến trúc, bạn cần biết hệ thống phải chịu bao nhiêu request, lưu bao nhiêu dữ liệu và tốn bao nhiêu băng thông. Vài phép nhân trên mặt sau phong bì là đủ để trả lời.',
    body: `
<h2>Ước lượng để làm gì</h2>
<p><b>Back-of-the-envelope estimation</b> là kiểu tính nhẩm nhanh dựa trên giả định hợp lý, đủ để biết hệ thống cần một server hay một nghìn server. Mục tiêu là đúng bậc độ lớn; sai lệch vài chục phần trăm vẫn chấp nhận được. Trong phỏng vấn, người hỏi quan tâm cách bạn đặt giả định và lập luận hơn là kết quả.</p>
<p>Ba nhóm số liệu bạn cần nắm: lũy thừa của 2 (đơn vị dữ liệu), latency (đã học ở bài trước) và tính sẵn sàng (số "9"). Phần còn lại chỉ là nhân chia.</p>

<h2>Bộ số liệu nền</h2>
${cols([
  { title: 'Lũy thừa của 2', body: `${tbl(['Lũy thừa', 'Xấp xỉ', 'Đơn vị'], [
    ['2<sup>10</sup>', '1 nghìn', 'KB'],
    ['2<sup>20</sup>', '1 triệu', 'MB'],
    ['2<sup>30</sup>', '1 tỷ', 'GB'],
    ['2<sup>40</sup>', '1 nghìn tỷ', 'TB'],
    ['2<sup>50</sup>', '1 triệu tỷ', 'PB'],
  ])}` },
  { title: 'Hằng số hay dùng', body: '<ul><li>1 ngày = 86.400 giây, làm tròn thành 10<sup>5</sup>.</li><li>1 triệu request/ngày ≈ 12 QPS.</li><li>1 tỷ request/ngày ≈ 12.000 QPS.</li><li>Peak thường bằng 2-3 lần trung bình.</li><li>1 byte = 8 bit; băng thông mạng tính bằng bit/s.</li></ul>' },
])}
<p>Với tính sẵn sàng, mỗi số 9 thêm vào giảm thời gian ngừng hoạt động được phép đi 10 lần. Bảng dưới là các mức hay gặp trong SLA của dịch vụ cloud.</p>
${tbl(['Availability', 'Downtime / ngày', 'Downtime / năm'], [
  ['99% (2 nines)', '14,4 phút', '3,65 ngày'],
  ['99,9% (3 nines)', '1,44 phút', '8,77 giờ'],
  ['99,99% (4 nines)', '8,64 giây', '52,6 phút'],
  ['99,999% (5 nines)', '864 ms', '5,26 phút'],
])}

<h2>Quy trình ước lượng</h2>
<p>Hầu hết bài ước lượng đi theo cùng một chuỗi. Bắt đầu từ số người dùng, suy ra số request mỗi giây, rồi tới dung lượng lưu trữ và băng thông, cuối cùng là số máy cần có.</p>
${diagram({
  w: 720, h: 230,
  nodes: [
    { id: 'a', label: 'Giả định', sub: 'MAU, % hoạt động', x: 110, y: 60, w: 140 },
    { id: 'b', label: 'DAU', sub: 'người/ngày', x: 360, y: 60, w: 140 },
    { id: 'c', label: 'QPS trung bình', sub: 'DAU × hành động', x: 610, y: 60, w: 150 },
    { id: 'd', label: 'Peak QPS', sub: '× 2 đến 3', x: 610, y: 170, w: 150, kind: 'warn' },
    { id: 'e', label: 'Storage', sub: 'byte × số bản ghi', x: 360, y: 170, w: 140, kind: 'store' },
    { id: 'f', label: 'Số server', sub: 'peak / sức 1 máy', x: 110, y: 170, w: 140, kind: 'good' },
  ],
  edges: [
    { from: 'a', to: 'b', label: '1' },
    { from: 'b', to: 'c', label: '2' },
    { from: 'c', to: 'd', label: '3' },
    { from: 'd', to: 'e', label: '4' },
    { from: 'e', to: 'f', label: '5' },
  ],
  caption: 'Hình: Chuỗi ước lượng điển hình, từ giả định về người dùng tới số server cần chuẩn bị.',
})}

<h2>Ví dụ: một dịch vụ giống Twitter</h2>
<p>Đặt giả định rõ ràng trước, rồi tính từng bước. Các con số dưới đây chỉ là giả định cho bài tập, không dựa trên số liệu thật của Twitter.</p>
<ul>
<li>300 triệu người dùng hằng tháng (MAU), 50% vào mỗi ngày → <b>150 triệu DAU</b>.</li>
<li>Mỗi người đăng trung bình 2 tweet mỗi ngày; 10% tweet có kèm ảnh hoặc video.</li>
<li>Mỗi người mở timeline 10 lần mỗi ngày.</li>
<li>Kích thước: tweet text cỡ 300 byte (id, nội dung, metadata); media trung bình 1 MB.</li>
</ul>
${tbl(['Đại lượng', 'Phép tính', 'Kết quả'], [
  ['QPS ghi tweet', '150 triệu × 2 / 10<sup>5</sup> giây', '≈ 3.000 (chính xác hơn là ~3.500)'],
  ['Peak QPS ghi', '3.500 × 2', '≈ 7.000'],
  ['QPS đọc timeline', '150 triệu × 10 / 86.400', '≈ 17.000; peak ≈ 35.000'],
  ['Storage text / ngày', '300 triệu tweet × 300 byte', '≈ 90 GB'],
  ['Storage media / ngày', '300 triệu × 10% × 1 MB', '≈ 30 TB'],
  ['Storage media / 5 năm', '30 TB × 365 × 5', '≈ 55 PB'],
  ['Băng thông upload media', '30 TB / 86.400 giây', '≈ 350 MB/s ≈ 2,8 Gbps'],
])}
${diagram({
  w: 720, h: 260,
  nodes: [
    { id: 'u', label: '150 triệu DAU', x: 90, y: 130, w: 130, kind: 'client' },
    { id: 'w', label: 'Write API', sub: 'peak 7.000 QPS', x: 300, y: 60, w: 140 },
    { id: 'r', label: 'Timeline API', sub: 'peak 35.000 QPS', x: 300, y: 200, w: 140 },
    { id: 'db', label: 'Tweet DB', sub: '~90 GB/ngày', x: 520, y: 60, w: 130, kind: 'store' },
    { id: 'obj', label: 'Object storage', sub: '~30 TB/ngày', x: 650, y: 140, w: 120, kind: 'store' },
    { id: 'c', label: 'Timeline cache', sub: 'đỡ phần lớn đọc', x: 520, y: 215, w: 130, kind: 'cache' },
  ],
  edges: [
    { from: 'u', to: 'w', label: 'đăng tweet' },
    { from: 'u', to: 'r', label: 'xem timeline' },
    { from: 'w', to: 'db' },
    { from: 'w', to: 'obj', label: 'media', curve: 30 },
    { from: 'r', to: 'c' },
  ],
  caption: 'Hình: Kết quả ước lượng gắn lên kiến trúc. Đọc gấp khoảng 5 lần ghi nên cần cache cho timeline; media chiếm gần hết dung lượng.',
})}
<p>Từ bảng trên rút ra ba kết luận thiết kế. Thứ nhất, media chiếm gần như toàn bộ dung lượng, nên phải tách sang object storage kèm CDN. Thứ hai, lượng đọc lớn hơn ghi nhiều lần, nên timeline cần cache. Thứ ba, nếu một server ứng dụng xử lý được khoảng 1.000 QPS, phần đọc ở giờ cao điểm cần cỡ 35-40 máy, cộng thêm dự phòng.</p>
<h2>Sức chịu tải của một máy</h2>
<p>Để đổi QPS thành số server, bạn cần một con số tham chiếu cho sức chịu của từng loại thành phần. Các mức dưới đây chỉ là bậc độ lớn hay dùng khi tính nhẩm; con số thật phụ thuộc nhiều vào phần cứng, kích thước request và độ phức tạp của logic, nên luôn nói rõ đây là giả định.</p>
${tbl(['Thành phần', 'Bậc độ lớn thường giả định'], [
  ['App server stateless, logic đơn giản', 'vài trăm đến vài nghìn QPS'],
  ['Redis một node', 'khoảng 100.000 thao tác/giây'],
  ['Database quan hệ một node', 'vài nghìn đến chục nghìn query đơn giản/giây'],
  ['Một luồng ghi tuần tự, 1 ms mỗi lần', 'khoảng 1.000 ghi/giây'],
])}
${tip('<b>Mẹo tính nhanh.</b> Làm tròn mạnh tay: 86.400 thành 10<sup>5</sup>, 3.472 thành 3.500. Viết rõ đơn vị ở mỗi dòng (QPS, GB/ngày, Gbps). Khi người phỏng vấn đổi giả định, bạn chỉ cần sửa một dòng và tính lại theo cùng chuỗi.')}
${note('<b>Sai lầm thường gặp.</b> Quên tính peak, nhầm bit với byte khi tính băng thông (350 MB/s là 2,8 Gbps, không phải 350 Mbps), và quên nhân hệ số replication. Database lưu 3 bản sao thì 55 PB dữ liệu thực tế cần khoảng 165 PB đĩa.')}
${interview([
  'Ước lượng QPS và dung lượng lưu trữ trong 5 năm cho một dịch vụ rút gọn URL với 100 triệu link mới mỗi tháng.',
  'Hệ thống của bạn có SLA 99,95%. Mỗi tháng bạn được phép ngừng hoạt động bao lâu?',
  'Vì sao peak QPS quan trọng hơn QPS trung bình khi chọn số server?',
])}`,
    keys: [
      '1 ngày ≈ 10^5 giây; 1 triệu request/ngày ≈ 12 QPS.',
      '2^10 ≈ nghìn (KB), 2^20 ≈ triệu (MB), 2^30 ≈ tỷ (GB), 2^40 ≈ nghìn tỷ (TB).',
      '99,99% ≈ 52,6 phút downtime mỗi năm; mỗi số 9 thêm vào giảm downtime 10 lần.',
      'Luôn tính peak (2-3 lần trung bình), hệ số replication, và phân biệt bit với byte.',
    ],
    quiz: [
      { q: 'Một dịch vụ nhận 50 triệu request mỗi ngày. QPS trung bình gần nhất với giá trị nào?', o: ['50', '600', '6.000', '50.000'], a: 1, why: '50 triệu / 86.400 giây ≈ 580, tức khoảng 600 QPS.' },
      { q: 'Upload 30 TB mỗi ngày tương đương băng thông khoảng bao nhiêu?', o: ['35 Mbps', '350 Mbps', '2,8 Gbps', '28 Gbps'], a: 2, why: '30 TB / 86.400 s ≈ 350 MB/s; nhân 8 để đổi sang bit được khoảng 2,8 Gbps.' },
      { q: 'Availability 99,9% cho phép downtime khoảng bao lâu mỗi năm?', o: ['52 phút', '8,8 giờ', '3,65 ngày', '5 phút'], a: 1, why: '0,1% của 8.760 giờ là khoảng 8,76 giờ.' },
      { q: 'Vì sao trong ví dụ Twitter cần tách media sang object storage?', o: ['Vì media cần index', 'Vì media chiếm gần hết dung lượng và cần phân phối qua CDN', 'Vì database không lưu được nhị phân', 'Vì media được ghi nhiều hơn text'], a: 1, why: 'Media khoảng 30 TB/ngày so với 90 GB text. Object storage rẻ hơn, bền hơn và kết hợp tốt với CDN.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'sang-sang',
    mod: 'nen-tang',
    title: 'Sẵn sàng cao, throughput và chịu lỗi',
    pages: [114, 329],
    min: 12,
    level: 'trung-binh',
    widget: 'nines',
    lede: 'Đề bài system design gần như luôn yêu cầu ba thứ: high availability, high throughput và high scalability. Mỗi yêu cầu có bộ giải pháp riêng, và tất cả đều dựa trên một ý: chấp nhận rằng thành phần nào cũng có thể hỏng.',
    body: `
<h2>High availability: đo bằng số 9</h2>
<p><b>Availability</b> là tỉ lệ thời gian hệ thống phục vụ được người dùng. Mục tiêu thường được nói bằng "số 9": 3 nines là 99,9%, 4 nines là 99,99%. Sách lấy ví dụ 4 nines nghĩa là mỗi ngày hệ thống chỉ được ngừng khoảng 8,64 giây.</p>
<p>Cách duy nhất để đạt mức này là thiết kế <b>dư thừa</b> (redundancy). Một thành phần đơn lẻ, dù tốt đến đâu, vẫn phải restart khi deploy, vẫn có lúc hỏng phần cứng. Phép tính dưới cho thấy vì sao dự phòng song song hiệu quả:</p>
${cols([
  { title: 'Nối tiếp', body: '<p>Request đi qua A rồi B, cả hai phải sống. Availability tổng = A × B. Hai thành phần 99,9% nối tiếp chỉ còn 99,8%.</p>' },
  { title: 'Song song', body: '<p>Chỉ cần một trong hai sống. Availability tổng = 1 - (1 - A)². Hai bản 99,9% chạy song song đạt 99,9999%.</p>' },
])}

<h2>Bốn mô hình dự phòng</h2>
<p>Sách liệt kê bốn cách tổ chức thành phần dự phòng. Hai mô hình đầu áp dụng cho service xử lý luồng dữ liệu, hai mô hình sau áp dụng cho cluster lưu trữ.</p>
${diagram({
  w: 720, h: 310,
  groups: [
    { x: 20, y: 30, w: 330, h: 265, label: 'Hot-hot' },
    { x: 370, y: 30, w: 330, h: 265, label: 'Hot-warm' },
  ],
  nodes: [
    { id: 'u1', label: 'Upstream', x: 185, y: 80 },
    { id: 'a1', label: 'Instance A', sub: 'hot', x: 100, y: 165, w: 110, kind: 'good' },
    { id: 'b1', label: 'Instance B', sub: 'hot', x: 270, y: 165, w: 110, kind: 'good' },
    { id: 'd1', label: 'Downstream', sub: 'phải dedupe', x: 185, y: 250, w: 130 },
    { id: 'u2', label: 'Upstream', x: 535, y: 80 },
    { id: 'a2', label: 'Instance A', sub: 'hot', x: 450, y: 165, w: 110, kind: 'good' },
    { id: 'b2', label: 'Instance B', sub: 'warm', x: 620, y: 165, w: 110 },
    { id: 'd2', label: 'Downstream', x: 535, y: 250, w: 130 },
  ],
  edges: [
    { from: 'u1', to: 'a1' },
    { from: 'u1', to: 'b1' },
    { from: 'a1', to: 'd1' },
    { from: 'b1', to: 'd1' },
    { from: 'u2', to: 'a2' },
    { from: 'u2', to: 'b2' },
    { from: 'a2', to: 'd2' },
    { from: 'b2', to: 'd2', dashed: true, kind: 'muted' },
  ],
  caption: 'Hình: Hot-hot gửi output từ cả hai bên nên downstream nhận trùng. Hot-warm chỉ bên hot gửi; bên warm (nét đứt) chỉ gửi khi bên hot sập.',
})}
${tbl(['Mô hình', 'Cách hoạt động', 'Đánh đổi'], [
  ['Hot-hot', 'Hai instance cùng nhận input và cùng gửi output xuống downstream. Một bên sập, bên kia vẫn chạy ngay.', 'Failover tức thì, nhưng downstream phải loại bỏ bản trùng (dedupe).'],
  ['Hot-warm', 'Hai instance cùng nhận input, chỉ bên hot gửi output. Hot sập thì warm bắt đầu gửi.', 'Không trùng output, nhưng có khoảng trễ ngắn khi chuyển đổi.'],
  ['Single-leader', 'Một leader nhận ghi từ upstream rồi replicate sang các replica.', 'Đơn giản, phổ biến ở database; leader là điểm nghẽn ghi và cần bầu lại khi chết.'],
  ['Leaderless', 'Không có leader, ghi vào nhiều node và replicate cho nhau.', 'Dữ liệu đọc đúng khi W + R > N; phải xử lý xung đột phiên bản.'],
])}
<p>Quy tắc <b>W + R &gt; N</b> của cluster leaderless (Dynamo, Cassandra) đáng nhớ kỹ. N là số bản sao, W là số node phải xác nhận một lần ghi, R là số node được hỏi khi đọc. Khi W + R lớn hơn N, tập node đọc và tập node ghi luôn giao nhau ít nhất một node, nên lần đọc chắc chắn thấy giá trị mới nhất.</p>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'w', label: 'Client ghi', sub: 'W = 2', x: 110, y: 70, w: 130, kind: 'client' },
    { id: 'r', label: 'Client đọc', sub: 'R = 2', x: 110, y: 220, w: 130, kind: 'client' },
    { id: 'n1', label: 'Node 1', sub: 'v2', x: 370, y: 55, w: 130, kind: 'store' },
    { id: 'n2', label: 'Node 2', sub: 'v2', x: 370, y: 145, w: 130, kind: 'good' },
    { id: 'n3', label: 'Node 3', sub: 'v1 (cũ)', x: 370, y: 235, w: 130, kind: 'store' },
    { id: 'k', label: 'W + R = 4 > N = 3', sub: 'luôn giao nhau', x: 610, y: 145, w: 170, kind: 'good' },
  ],
  edges: [
    { from: 'w', to: 'n1', label: 'ghi v2' },
    { from: 'w', to: 'n2', label: 'ghi v2' },
    { from: 'r', to: 'n2', label: 'đọc', kind: 'good' },
    { from: 'r', to: 'n3', label: 'đọc' },
    { from: 'n2', to: 'k', dashed: true, kind: 'muted' },
  ],
  caption: 'Hình: Leaderless với N = 3. Lần đọc chạm Node 2 (đã có v2), nên client lấy phiên bản mới nhất dù Node 3 còn cũ.',
})}

<h2>High throughput và high scalability</h2>
<p><b>Throughput</b> là lượng việc xử lý được trong một đơn vị thời gian, đo bằng <b>QPS</b> (query per second) hoặc <b>TPS</b> (transaction per second). Sách gợi ý ba hướng: thêm cache để request không phải chạm I/O chậm như database hay đĩa; tăng số thread cho tác vụ nặng tính toán; và dùng xử lý bất đồng bộ để cô lập các thành phần nặng. Thêm thread quá nhiều lại làm hiệu năng giảm vì chi phí chuyển ngữ cảnh, nên trước hết phải tìm đúng điểm nghẽn.</p>
<p><b>Scalability</b> là khả năng mở rộng nhanh khi tải tăng: scale ngang bằng cách thêm máy, hoặc mở rộng thêm chức năng. Sách khuyên theo dõi response time để quyết định khi nào cần scale: response time bắt đầu tăng là dấu hiệu tài nguyên sắp cạn.</p>

<h2>6 nguyên tắc thiết kế chịu lỗi</h2>
${tbl(['Nguyên tắc', 'Ý nghĩa', 'Ví dụ'], [
  ['Replication', 'Nhiều bản sao dữ liệu hoặc service ở các node, vị trí khác nhau', 'Database có replica ở 3 availability zone'],
  ['Redundancy', 'Có thành phần thừa sẵn sàng thay thế', 'Hai load balancer chạy cặp active-standby'],
  ['Load balancing', 'Chia tải để không server nào thành điểm lỗi duy nhất', 'LB loại server không qua health check'],
  ['Failover', 'Tự động chuyển sang hệ thống dự phòng khi hệ thống chính hỏng', 'Replica được thăng cấp thành primary'],
  ['Graceful degradation', 'Giảm bớt chức năng thay vì sập toàn bộ', 'Tắt gợi ý cá nhân hóa, vẫn cho xem và mua hàng'],
  ['Monitoring và alerting', 'Theo dõi liên tục, cảnh báo khi có bất thường', 'Alert khi tỉ lệ lỗi 5xx vượt 1% trong 5 phút'],
])}
${tip('<b>Thực tế.</b> Graceful degradation rất phổ biến ở các trang thương mại điện tử: khi service gợi ý sản phẩm quá tải, trang chủ hiển thị danh sách "bán chạy" tính sẵn từ trước thay vì báo lỗi. Người dùng gần như không nhận ra, còn doanh thu từ luồng mua hàng chính không bị ảnh hưởng.')}
${note('<b>Sai lầm thường gặp.</b> Đặt mọi replica trong cùng một rack hoặc cùng một zone. Khi mất điện hoặc mất mạng ở zone đó, tất cả bản sao chết cùng lúc và dư thừa trở nên vô nghĩa. Dự phòng chỉ có giá trị khi các bản sao hỏng độc lập với nhau.')}
${interview([
  'Hệ thống gồm LB, app server và database, mỗi thành phần 99,9%. Availability tổng là bao nhiêu, và bạn nâng lên 99,99% bằng cách nào?',
  'So sánh hot-hot và hot-warm. Khi nào bạn chấp nhận dedupe ở downstream để đổi lấy failover tức thì?',
  'Với N = 5, hãy chọn W và R cho hệ thống ưu tiên ghi nhanh nhưng vẫn đọc được dữ liệu mới nhất.',
])}`,
    keys: [
      '4 nines (99,99%) ≈ 8,64 giây downtime mỗi ngày; muốn đạt phải có dư thừa.',
      'Nối tiếp làm availability giảm (A × B); song song làm availability tăng.',
      'Hot-hot cần downstream dedupe; hot-warm có độ trễ khi chuyển; leaderless cần W + R > N.',
      'Sáu nguyên tắc chịu lỗi: replication, redundancy, load balancing, failover, graceful degradation, monitoring.',
    ],
    quiz: [
      { q: 'Với mô hình hot-hot, phía downstream cần làm gì?', o: ['Không cần làm gì', 'Loại bỏ output trùng lặp', 'Chọn leader mới', 'Tăng số thread'], a: 1, why: 'Cả hai instance đều gửi output, nên downstream nhận mỗi kết quả hai lần và phải dedupe.' },
      { q: 'Cluster leaderless có 5 node. Ghi vào 3 node thì phải đọc từ ít nhất bao nhiêu node để chắc chắn thấy dữ liệu mới?', o: ['1', '2', '3', '5'], a: 2, why: 'Cần W + R > N, tức 3 + R > 5, nên R ≥ 3.' },
      { q: 'Hai thành phần 99,9% đặt nối tiếp. Availability tổng khoảng bao nhiêu?', o: ['99,9999%', '99,9%', '99,8%', '99%'], a: 2, why: '0,999 × 0,999 ≈ 0,998, tức 99,8%. Nối tiếp luôn làm availability giảm.' },
      { q: '"Graceful degradation" nghĩa là gì?', o: ['Tự động restart server', 'Tiếp tục chạy với chức năng giảm bớt khi một phần hỏng', 'Giảm dần số replica', 'Chuyển sang server dự phòng'], a: 1, why: 'Ví dụ: tắt gợi ý cá nhân hóa khi service gợi ý lỗi, nhưng người dùng vẫn mua hàng được.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'scale-co-ban',
    mod: 'nen-tang',
    title: 'Từ một server đến hàng triệu người dùng',
    pages: [258, 305, 267],
    min: 12,
    level: 'co-ban',
    lede: 'Hệ thống lớn nào cũng bắt đầu từ một server. Hiểu nó lớn lên qua từng bước, và mỗi bước giải quyết nút thắt nào, giúp bạn dựng kiến trúc trong phỏng vấn một cách có lý do.',
    body: `
<h2>Giai đoạn 1: mọi thứ trên một máy</h2>
<p>Phiên bản đầu tiên thường chạy web server, code ứng dụng và database trên cùng một máy. Người dùng hỏi DNS để lấy IP, rồi gửi request thẳng tới máy đó. Cách này rẻ và dễ vận hành, nhưng máy chết là cả hệ thống chết, và web với database tranh nhau CPU, RAM.</p>
<p>Bước tách đầu tiên là đưa database ra máy riêng. Từ đây tầng web và tầng dữ liệu có thể scale độc lập, và bạn chọn được phần cứng phù hợp cho từng loại: web cần CPU, database cần RAM và đĩa nhanh.</p>
${diagram({
  w: 720, h: 250,
  groups: [
    { x: 20, y: 30, w: 300, h: 205, label: 'Giai đoạn 1: một máy' },
    { x: 340, y: 30, w: 360, h: 205, label: 'Giai đoạn 2: tách database' },
  ],
  nodes: [
    { id: 'u1', label: 'Người dùng', x: 170, y: 85, w: 120, kind: 'client' },
    { id: 's1', label: 'Web + App + DB', sub: 'một server', x: 170, y: 185, w: 170, kind: 'warn' },
    { id: 'u2', label: 'Người dùng', x: 430, y: 85, w: 120, kind: 'client' },
    { id: 'w2', label: 'Web + App', x: 430, y: 185, w: 120 },
    { id: 'd2', label: 'Database', sub: 'máy riêng', x: 610, y: 185, w: 120, kind: 'store' },
  ],
  edges: [
    { from: 'u1', to: 's1' },
    { from: 'u2', to: 'w2' },
    { from: 'w2', to: 'd2' },
  ],
  caption: 'Hình: Hai giai đoạn đầu. Tách database ra máy riêng để mỗi tầng scale theo nhu cầu của nó.',
})}

<h2>Scale dọc hay scale ngang</h2>
${tbl(['', 'Scale dọc (vertical)', 'Scale ngang (horizontal)'], [
  ['Cách làm', 'Thêm CPU, RAM, đĩa cho máy hiện có', 'Thêm máy vào pool, chia tải giữa các máy'],
  ['Ưu điểm', 'Đơn giản, không đổi code', 'Gần như không giới hạn; một máy chết không làm sập hệ thống'],
  ['Nhược điểm', 'Có trần phần cứng; vẫn là điểm lỗi duy nhất; máy lớn rất đắt', 'Cần load balancer; ứng dụng phải stateless; dữ liệu khó chia hơn'],
  ['Hợp với', 'Giai đoạn đầu, database chưa cần shard', 'Tầng web/app khi lưu lượng lớn'],
])}

<h2>Giai đoạn 3: tầng web stateless sau load balancer</h2>
<p>Để scale ngang, mọi web server phải tương đương nhau: request nào đến máy nào cũng xử lý được. Muốn vậy server không được giữ trạng thái người dùng (session, giỏ hàng) trong RAM của riêng nó. Trạng thái được chuyển ra một kho chung như Redis hoặc database, gọi là <b>stateless tier</b>. Khi đó load balancer chia request tùy ý, và thêm hay bớt máy không làm ai bị đăng xuất.</p>
<p>Cùng lúc, database được bổ sung replica để chia tải đọc và làm dự phòng. File tĩnh (ảnh, CSS, JS) được đưa lên CDN để người dùng tải từ máy gần nhất.</p>
${diagram({
  w: 720, h: 320,
  nodes: [
    { id: 'u', label: 'Người dùng', x: 80, y: 160, w: 110, kind: 'client' },
    { id: 'dns', label: 'DNS', x: 80, y: 55, w: 100, kind: 'external' },
    { id: 'cdn', label: 'CDN', sub: 'ảnh, JS, CSS', x: 80, y: 270, w: 110, kind: 'cache' },
    { id: 'lb', label: 'Load balancer', x: 260, y: 160, w: 130, kind: 'lb' },
    { id: 'w1', label: 'Web 1', sub: 'stateless', x: 440, y: 100, w: 120 },
    { id: 'w2', label: 'Web 2', sub: 'stateless', x: 440, y: 220, w: 120 },
    { id: 'c', label: 'Redis', sub: 'session + cache', x: 630, y: 50, w: 130, kind: 'cache' },
    { id: 'p', label: 'DB primary', x: 630, y: 160, w: 120, kind: 'store' },
    { id: 'r', label: 'DB replica', x: 630, y: 270, w: 120, kind: 'store' },
  ],
  edges: [
    { from: 'u', to: 'dns', label: '1' },
    { from: 'u', to: 'lb', label: '2' },
    { from: 'u', to: 'cdn', label: '3' },
    { from: 'lb', to: 'w1' },
    { from: 'lb', to: 'w2' },
    { from: 'w1', to: 'c' },
    { from: 'w1', to: 'p', label: 'ghi' },
    { from: 'w2', to: 'r', label: 'đọc' },
    { from: 'p', to: 'r', label: 'replicate', dashed: true },
  ],
  caption: 'Hình: Giai đoạn 3. (1) Tra DNS; (2) request động qua load balancer tới web stateless; (3) file tĩnh tải từ CDN. Session nằm ở Redis, đọc chia sang replica.',
})}

<h2>10 thành phần của một web application production</h2>
<p>Sách tổng hợp kiến trúc tham chiếu cho một ứng dụng web chạy thật. Ngoài những gì đã có ở giai đoạn 3, hệ thống production cần thêm công cụ deploy, xử lý nền, tìm kiếm và quan sát.</p>
${tbl(['#', 'Thành phần', 'Vai trò', 'Công cụ ví dụ'], [
  ['1', 'CI/CD pipeline', 'Build, test và deploy code lên server', 'Jenkins, GitHub Actions'],
  ['2', 'Trình duyệt + DNS', 'Request bắt đầu từ trình duyệt, DNS phân giải ra địa chỉ server', 'Route 53, Cloudflare'],
  ['3', 'Load balancer / reverse proxy', 'Chia đều request cho các web server', 'Nginx, HAProxy'],
  ['4', 'CDN', 'Phục vụ nội dung tĩnh gần người dùng', 'Cloudflare, CloudFront'],
  ['5', 'Web app gọi backend qua API', 'Tách giao diện với logic nghiệp vụ', 'REST, gRPC'],
  ['6', 'Database và distributed cache', 'Lưu và phục vụ dữ liệu', 'Postgres, Redis'],
  ['7', 'Job queue + worker', 'Chạy tác vụ nặng, chạy lâu ở nền', 'RabbitMQ, Sidekiq'],
  ['8', 'Full-text search', 'Tìm kiếm văn bản', 'Elasticsearch, Apache Solr'],
  ['9', 'Monitoring', 'Lưu log, metric để phân tích', 'Sentry, Prometheus, Grafana'],
  ['10', 'Alerting', 'Báo cho developer khi có sự cố', 'Slack, PagerDuty'],
])}

<h2>Khi chuyển sang microservices: 9 thành phần</h2>
<p>Khi đội ngũ và sản phẩm lớn dần, monolith có thể được tách thành nhiều service nhỏ, mỗi service phụ trách một miền nghiệp vụ và có database riêng. Sách liệt kê 9 thành phần cốt lõi của một ứng dụng microservice production. Hình dưới vẽ 7 thành phần đầu; metric (Prometheus, Grafana) và log tập trung (Logstash, Elasticsearch, Kibana) bao quanh tất cả.</p>
${diagram({
  w: 720, h: 310,
  nodes: [
    { id: 'u', label: 'Client', x: 80, y: 155, w: 100, kind: 'client' },
    { id: 'gw', label: 'API Gateway', sub: 'routing, LB', x: 250, y: 155, w: 130, kind: 'lb' },
    { id: 'auth', label: 'Auth server', sub: 'Keycloak, Okta', x: 250, y: 50, w: 130, kind: 'external' },
    { id: 'reg', label: 'Service registry', sub: 'Consul, Eureka', x: 250, y: 265, w: 140 },
    { id: 'a', label: 'Order service', sub: 'Spring Boot', x: 450, y: 95, w: 130 },
    { id: 'b', label: 'Email service', sub: 'NestJS', x: 450, y: 215, w: 130 },
    { id: 'c', label: 'Redis', sub: 'distributed cache', x: 640, y: 45, w: 130, kind: 'cache' },
    { id: 'k', label: 'Kafka', sub: 'async', x: 640, y: 155, w: 120, kind: 'queue' },
    { id: 'd', label: 'PostgreSQL', sub: 'DB riêng', x: 640, y: 265, w: 120, kind: 'store' },
  ],
  edges: [
    { from: 'u', to: 'gw' },
    { from: 'gw', to: 'auth', label: 'xác thực' },
    { from: 'gw', to: 'reg', label: 'tìm service' },
    { from: 'gw', to: 'a' },
    { from: 'a', to: 'c' },
    { from: 'a', to: 'k', label: 'event' },
    { from: 'k', to: 'b' },
    { from: 'b', to: 'd' },
  ],
  caption: 'Hình: Kiến trúc microservice. Gateway hỏi auth server và registry, service giao tiếp bất đồng bộ qua Kafka, mỗi service có kho dữ liệu riêng.',
})}
<p>Sách cũng mô tả một kiến trúc microservice điển hình theo cùng tinh thần: client tìm nội dung tĩnh ở CDN trước, request động đi qua load balancer tới API gateway; gateway làm việc với identity provider và service discovery; một thành phần quản lý theo dõi sức khỏe các service.</p>
${tip('<b>Thực tế.</b> Không hệ thống nào nhảy thẳng từ giai đoạn 1 lên 9 thành phần microservice. Thứ tự thường gặp là: tách database, thêm cache, đưa tầng web về stateless sau load balancer, thêm replica và CDN, rồi mới tới queue, search và tách service. Mỗi bước chỉ làm khi số liệu đo được cho thấy nút thắt đã dịch chuyển tới đó.')}
${note('<b>Sai lầm thường gặp.</b> Giữ session trong RAM của web server rồi bật "sticky session" ở load balancer để chữa cháy. Khi máy đó chết hoặc bị thu hồi lúc autoscale, người dùng mất phiên đăng nhập và giỏ hàng. Hãy đưa trạng thái ra Redis hoặc dùng token tự chứa (JWT) để web tier thật sự stateless.')}
${interview([
  'Ứng dụng của bạn đang chạy trên một server và bắt đầu chậm. Hãy mô tả các bước scale tiếp theo theo thứ tự ưu tiên.',
  'Vì sao tầng web cần stateless trước khi scale ngang? Trạng thái người dùng nên đặt ở đâu?',
  'Kể tên các thành phần bạn sẽ thêm khi chuyển từ monolith sang microservices, và vai trò của API gateway, service registry.',
])}`,
    keys: [
      'Bắt đầu từ một máy, tách database trước, rồi thêm cache, load balancer, replica và CDN.',
      'Scale ngang cần tầng web stateless: session để ở Redis hoặc trong token.',
      'Web app production có 10 thành phần: CI/CD, DNS, LB, CDN, API, DB và cache, job queue, search, monitoring, alerting.',
      'Microservice production thêm API gateway, service registry, auth server, messaging bất đồng bộ, metric và log tập trung.',
    ],
    quiz: [
      { q: 'Nhược điểm lớn nhất của scale dọc là gì?', o: ['Phải sửa code nhiều', 'Có trần phần cứng và vẫn là điểm lỗi duy nhất', 'Cần load balancer', 'Không dùng được database'], a: 1, why: 'Một máy dù lớn đến đâu cũng có giới hạn, và máy đó chết thì cả hệ thống chết.' },
      { q: 'Điều kiện quan trọng nhất để tầng web scale ngang dễ dàng là gì?', o: ['Dùng NoSQL', 'Web server stateless', 'Dùng CDN', 'Có nhiều CPU'], a: 1, why: 'Khi server không giữ trạng thái riêng, load balancer gửi request tới máy nào cũng được và có thể thêm bớt máy tùy ý.' },
      { q: 'Trong kiến trúc microservice, thành phần nào giúp gateway biết địa chỉ các instance của một service?', o: ['Service registry', 'CDN', 'Job queue', 'Full-text search'], a: 0, why: 'Service registry (Consul, Eureka, Zookeeper) lưu danh sách instance đang sống để gateway tìm tới.' },
      { q: 'Tác vụ resize ảnh mất 5 giây nên đặt ở đâu trong 10 thành phần của web app?', o: ['Load balancer', 'CDN', 'Job queue và worker', 'DNS'], a: 2, why: 'Tác vụ nặng, chạy lâu nên đẩy vào job queue để worker xử lý nền, request chính trả về ngay.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'trade-off',
    mod: 'nen-tang',
    title: '10 trade-off không thể bỏ qua',
    pages: [331, 194, 116],
    min: 11,
    level: 'trung-binh',
    lede: 'Sách nói thẳng: không hiểu trade-off thì chưa hiểu system design. Không có thiết kế đúng hay sai tuyệt đối, chỉ có thiết kế phù hợp hoặc không phù hợp với yêu cầu.',
    body: `
<h2>Mọi lựa chọn đều có giá</h2>
<p>Mỗi quyết định kiến trúc là một sự <b>đánh đổi</b> (trade-off): bạn được thứ này thì mất thứ khác. Cache làm đọc nhanh hơn nhưng dữ liệu có thể cũ. Microservices cho phép các team deploy độc lập nhưng thêm độ trễ mạng và độ phức tạp vận hành. Người phỏng vấn ít quan tâm bạn chọn gì, họ muốn nghe bạn biết mình đang trả giá gì.</p>
<p>Sách tóm gọn năm trục đánh đổi lớn nhất. Hầu hết quyết định cụ thể đều rơi vào một trong các trục này.</p>
${tbl(['Trục đánh đổi', 'Ví dụ cụ thể'], [
  ['Chi phí vs hiệu năng', 'Chạy thêm replica và cache tốn tiền, đổi lại latency thấp hơn'],
  ['Độ tin cậy vs khả năng mở rộng', 'Ghi đồng bộ vào 3 bản sao an toàn hơn nhưng giới hạn throughput ghi'],
  ['Hiệu năng vs nhất quán', 'Đọc từ replica nhanh nhưng có thể thấy dữ liệu cũ vài giây'],
  ['Bảo mật vs linh hoạt', 'Mạng nội bộ kiểm soát chặt hơn thì việc tích hợp với đối tác chậm hơn'],
  ['Tốc độ phát triển vs chất lượng', 'Ra tính năng nhanh để thử thị trường, chấp nhận nợ kỹ thuật'],
])}

<h2>10 trade-off kinh điển</h2>
${tbl(['Trade-off', 'Bên trái', 'Bên phải', 'Gợi ý chọn'], [
  ['Scale dọc vs ngang', 'Thêm CPU, RAM cho server hiện có', 'Thêm server vào pool', 'Dọc khi còn nhỏ; ngang khi cần chịu lỗi và tải lớn'],
  ['SQL vs NoSQL', 'Bảng, hàng, cột, schema chặt, có transaction', 'Schema linh hoạt, dễ scale ngang', 'SQL cho dữ liệu quan hệ, tiền bạc; NoSQL cho dữ liệu lớn, cấu trúc thay đổi'],
  ['Batch vs stream', 'Gom dữ liệu xử lý một lần (tính cước hằng ngày)', 'Xử lý ngay khi dữ liệu tới (phát hiện gian lận)', 'Theo yêu cầu độ tươi của kết quả'],
  ['Normalize vs denormalize', 'Mỗi thông tin chỉ lưu một nơi', 'Gộp bảng để query nhanh', 'Normalize cho ghi nhiều; denormalize cho đọc nhiều'],
  ['Consistency vs availability', 'Luôn đọc được dữ liệu mới nhất', 'Hệ thống luôn phản hồi dù một phần lỗi', 'Thanh toán chọn nhất quán; feed mạng xã hội chọn sẵn sàng'],
  ['Strong vs eventual consistency', 'Cập nhật hiển thị ngay', 'Cập nhật lan tới các node sau một khoảng trễ', 'Eventual cho bộ đếm like, lượt xem'],
  ['REST vs GraphQL', 'Nhiều endpoint, đơn giản, dễ cache', 'Một endpoint, client chọn đúng field cần', 'GraphQL khi client đa dạng; chi phí thiết kế cao hơn'],
  ['Stateful vs stateless', 'Server nhớ tương tác trước đó', 'Server không nhớ gì giữa các request', 'Stateless cho tầng web; stateful cho database, game server'],
  ['Read-through vs write-through cache', 'Cache tự nạp từ DB khi miss', 'Ghi vào cache và storage cùng lúc', 'Write-through khi cần cache luôn mới; read-through khi đọc nhiều'],
  ['Sync vs async', 'Làm lần lượt, chờ kết quả', 'Chạy nền, không chờ', 'Async cho việc chậm và không cần kết quả ngay'],
])}
<p>Trade-off cuối cùng là một trong những quyết định hay gặp nhất. Hình dưới cho thấy đặt hàng theo kiểu bất đồng bộ: người dùng nhận phản hồi ngay, email xác nhận được gửi sau.</p>
${seq({
  actors: [
    { id: 'c', label: 'Client', kind: 'client' },
    { id: 'o', label: 'Order service' },
    { id: 'e', label: 'Email worker' },
    { id: 'q', label: 'Queue', kind: 'queue' },
  ],
  msgs: [
    { from: 'c', to: 'o', label: 'POST /orders' },
    { from: 'o', to: 'o', label: 'ghi đơn vào DB' },
    { from: 'o', to: 'q', label: 'publish OrderCreated' },
    { from: 'o', to: 'c', label: '201 Created', dashed: true, kind: 'good' },
    { note: 'Client không phải chờ gửi email' },
    { from: 'q', to: 'e', label: 'consume event' },
    { from: 'e', to: 'e', label: 'gửi email (có retry)' },
  ],
  caption: 'Hình: Xử lý bất đồng bộ. Đổi lại response nhanh, hệ thống phải chấp nhận email đến trễ và phải xử lý retry, message trùng.',
})}

<h2>Câu chuyện Stack Overflow</h2>
<p>Sách đặt câu hỏi: bạn sẽ thiết kế Stack Overflow thế nào? Câu trả lời "chuẩn phỏng vấn" thường gồm microservices, mỗi service một database, dùng cache dày đặc, shard dữ liệu, giao tiếp qua message queue, event sourcing với CQRS, kèm phần trình bày về CAP và eventual consistency.</p>
${diagram({
  w: 720, h: 310,
  groups: [
    { x: 20, y: 30, w: 330, h: 265, label: 'Đáp án "phỏng vấn"' },
    { x: 370, y: 30, w: 330, h: 265, label: 'Thực tế Stack Overflow' },
  ],
  nodes: [
    { id: 'g', label: 'API Gateway', x: 185, y: 80, w: 130, kind: 'lb' },
    { id: 'a', label: 'Service A', sub: 'CQRS', x: 100, y: 165, w: 110 },
    { id: 'b', label: 'Service B', sub: 'event sourcing', x: 270, y: 165, w: 110 },
    { id: 'k', label: 'Message queue', x: 100, y: 250, w: 120, kind: 'queue' },
    { id: 's', label: 'Shard 1..N', x: 270, y: 250, w: 110, kind: 'store' },
    { id: 'lb', label: 'Load balancer', x: 535, y: 80, w: 130, kind: 'lb' },
    { id: 'm', label: '9 web server', sub: 'monolith, on-premise', x: 535, y: 165, w: 170, kind: 'good' },
    { id: 'd', label: 'Database', sub: 'SQL Server', x: 535, y: 255, w: 130, kind: 'store' },
  ],
  edges: [
    { from: 'g', to: 'a' },
    { from: 'g', to: 'b' },
    { from: 'a', to: 'k' },
    { from: 'k', to: 'b', dashed: true },
    { from: 'b', to: 's' },
    { from: 'lb', to: 'm' },
    { from: 'm', to: 'd' },
  ],
  caption: 'Hình: Kiến trúc mà người phỏng vấn hay chờ đợi (trái) so với cách Stack Overflow thực sự vận hành (phải).',
})}
<p>Thực tế, theo sách, Stack Overflow phục vụ toàn bộ lưu lượng chỉ với 9 web server on-premise, chạy một monolith, trên máy chủ riêng thay vì cloud. Kiến trúc này đơn giản, dễ debug, ít độ trễ mạng giữa các thành phần, và đủ sức cho một trong những trang web đông khách nhất thế giới. Bài học: kiến trúc tốt là kiến trúc giải quyết đúng bài toán với chi phí phù hợp, dù trên giấy trông có vẻ kém ấn tượng.</p>
${tip('<b>Thực tế.</b> Stack Overflow đầu tư vào phần cứng mạnh, code tối ưu và cache tốt thay vì chia nhỏ hệ thống. Đổi lại họ chấp nhận rủi ro tập trung và phải tự vận hành datacenter. Đó cũng là một trade-off, chỉ là trade-off phù hợp với đội ngũ và lưu lượng của họ.')}
${note('<b>Sai lầm thường gặp.</b> Liệt kê công nghệ mà không nói lý do. Thay vì "dùng Kafka", hãy nói "dùng Kafka để tách ghi đơn hàng khỏi gửi email; đổi lại phải xử lý message trùng nên consumer cần idempotent". Mỗi lựa chọn nên kèm một câu "được gì, mất gì".')}
${interview([
  'Bạn chọn strong hay eventual consistency cho số dư ví điện tử, và cho số lượt xem video? Giải thích.',
  'Khi nào bạn khuyên một startup giữ monolith thay vì tách microservices?',
  'Cho ví dụ một tình huống denormalize dữ liệu là lựa chọn đúng, và cái giá phải trả.',
])}`,
    keys: [
      'Mọi lựa chọn đều có giá; hãy luôn nói rõ được gì và mất gì.',
      'Năm trục lớn: chi phí vs hiệu năng, tin cậy vs mở rộng, hiệu năng vs nhất quán, bảo mật vs linh hoạt, tốc độ vs chất lượng.',
      'Stateless dễ scale ngang; async cho response nhanh nhưng phải xử lý retry và message trùng.',
      'Stack Overflow chạy monolith trên 9 web server on-premise: kiến trúc đơn giản vẫn có thể là lựa chọn đúng.',
    ],
    quiz: [
      { q: 'Phát hiện gian lận thẻ tín dụng phù hợp với kiểu xử lý nào?', o: ['Batch', 'Stream'], a: 1, why: 'Gian lận phải được phát hiện ngay khi giao dịch xảy ra, nên cần stream processing.' },
      { q: 'Denormalization chủ yếu nhằm mục đích gì?', o: ['Tiết kiệm dung lượng', 'Tránh dữ liệu trùng lặp', 'Giảm join để đọc nhanh hơn', 'Tăng tính nhất quán'], a: 2, why: 'Denormalize chấp nhận lưu trùng dữ liệu để đổi lấy tốc độ đọc.' },
      { q: 'Theo sách, Stack Overflow phục vụ lưu lượng bằng kiến trúc nào?', o: ['Microservices trên Kubernetes', 'Serverless trên cloud', 'Monolith trên 9 web server on-premise', 'Event sourcing với CQRS'], a: 2, why: 'Stack Overflow chạy monolith trên máy chủ riêng, trái với đáp án "phỏng vấn" thường gặp.' },
      { q: 'Write-through cache khác read-through cache ở điểm nào?', o: ['Write-through chỉ nạp khi miss', 'Write-through ghi vào cache và storage cùng lúc', 'Write-through không dùng database', 'Không có khác biệt'], a: 1, why: 'Write-through cập nhật cache ngay khi ghi; read-through chỉ nạp dữ liệu vào cache khi đọc bị miss.' },
    ],
  },
];
