// Nội dung bài học. Mỗi bài tham chiếu trang trong sách "System Design LinkedIn Posts 2024" (ByteByteGo).
import type { Lesson, Module } from '../types';

type FlowNode = string | [string, string];

const flow = (nodes: FlowNode[], cap?: string) =>
  '<div class="flow">' +
  nodes.map(n => {
    const [txt, cls] = Array.isArray(n) ? n : [n, ''];
    return `<span class="node ${cls}">${txt}</span>`;
  }).join('<span class="arr">→</span>') +
  '</div>' + (cap ? `<p class="flow-cap">${cap}</p>` : '');
const tbl = (head: string[], rows: string[][]) =>
  '<div class="tbl-wrap"><table><thead><tr>' + head.map(h => `<th>${h}</th>`).join('') +
  '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') +
  '</tbody></table></div>';
const note = (t: string) => `<div class="note">${t}</div>`;

export const MODULES: Module[] = [
  { id: 'nen-tang', no: 'M1', name: 'Nền tảng', desc: 'Con số latency, tính sẵn sàng và tư duy trade-off.' },
  { id: 'mang-api', no: 'M2', name: 'Mạng & API', desc: 'Từ URL đến server, REST/GraphQL/gRPC và thiết kế API.' },
  { id: 'lb-cache', no: 'M3', name: 'Cân bằng tải & Cache', desc: 'Phân phối request và tăng tốc đọc dữ liệu.' },
  { id: 'du-lieu', no: 'M4', name: 'Dữ liệu', desc: 'ACID, CAP và các cách scale database.' },
  { id: 'bat-dong-bo', no: 'M5', name: 'Bất đồng bộ', desc: 'Kafka, các mẫu messaging và chiến lược retry.' },
  { id: 'bao-mat', no: 'M6', name: 'Bảo mật', desc: 'Session, JWT, OAuth 2.0 và lưu mật khẩu.' },
  { id: 'thuc-chien', no: 'M7', name: 'Thực chiến', desc: 'Vấn đề thường gặp và kiến trúc của Reddit, Netflix.' }
];

export const LESSONS: Lesson[] = [
  /* ---------------- M1 ---------------- */
  {
    id: 'latency', mod: 'nen-tang', title: 'Những con số latency cần nhớ', pages: [307, 210], min: 8, widget: 'latency',
    lede: 'Ước lượng nhanh là kỹ năng đầu tiên của system design. Bạn không cần nhớ chính xác, chỉ cần nhớ bậc độ lớn.',
    body: `
<p>Các con số dưới đây dựa trên bảng latency của Jeff Dean và một số benchmark khác. Chúng không chính xác tuyệt đối nhưng đủ để so sánh các lựa chọn thiết kế.</p>
${tbl(['Thao tác', 'Latency', 'Ví dụ'], [
['Đọc L1 / L2 cache', '<span class="mono">1 ns / 10 ns</span>', 'Nằm ngay trên chip CPU'],
['Đọc RAM', '<span class="mono">100 ns</span>', 'Đọc một key trong Redis'],
['Gửi 1 KB qua mạng 1 Gbps', '<span class="mono">10 µs</span>', 'Lấy dữ liệu từ Memcached qua mạng'],
['Đọc từ SSD', '<span class="mono">100 µs</span>', 'RocksDB đọc trên SSD'],
['Insert vào database', '<span class="mono">1 ms</span>', 'Postgres commit: ghi dữ liệu, index, flush log'],
['Gói tin CA → Hà Lan → CA', '<span class="mono">100 ms</span>', 'Cuộc gọi Zoom xuyên lục địa'],
['Chu kỳ retry / refresh', '<span class="mono">1–10 s</span>', 'Hệ thống monitoring refresh mỗi 5–10 s']
])}
<h2>Vì sao điều này quan trọng</h2>
<p>RAM nhanh hơn SSD khoảng 1.000 lần, và một vòng mạng xuyên lục địa chậm hơn đọc RAM khoảng một triệu lần. Gần như mọi kỹ thuật tăng tốc trong sách đều xoay quanh việc đưa dữ liệu về gần nơi cần dùng: cache trong RAM, CDN gần người dùng, index để giảm số lần đọc đĩa.</p>
${note('<b>Chi phí thực tế.</b> Mười năm trước, Amazon nhận thấy mỗi 100 ms latency làm mất 1% doanh số. Sách liệt kê 6 cách giảm latency: database index, cache, load balancing, CDN, xử lý bất đồng bộ và nén dữ liệu.')}
<p class="mono" style="font-size:13px;color:var(--muted)">1 ns = 10⁻⁹ s · 1 µs = 1.000 ns · 1 ms = 1.000 µs</p>`,
    keys: ['RAM ~100 ns, SSD ~100 µs, DB insert ~1 ms, xuyên lục địa ~100 ms.', 'Mỗi bậc chênh nhau khoảng 1.000 lần, vì vậy cache và CDN có hiệu quả lớn.', 'Latency ảnh hưởng trực tiếp đến doanh thu (Amazon: 100 ms ≈ 1% doanh số).'],
    quiz: [
      { q: 'Đọc một key từ Redis (in-memory) mất khoảng bao lâu?', o: ['100 ns', '100 µs', '1 ms', '100 ms'], a: 0, why: 'Redis lưu trong RAM, mà đọc RAM khoảng 100 ns. Con số trên thực tế cộng thêm latency mạng nếu Redis ở máy khác.' },
      { q: 'Thao tác nào chậm nhất?', o: ['Đọc SSD', 'Insert vào Postgres', 'Gửi gói tin CA → Hà Lan → CA', 'Gửi 1 KB qua mạng 1 Gbps'], a: 2, why: 'Vòng mạng xuyên lục địa khoảng 100 ms, chậm hơn insert database (~1 ms) khoảng 100 lần.' }
    ]
  },
  {
    id: 'sang-sang', mod: 'nen-tang', title: 'Sẵn sàng cao, throughput và chịu lỗi', pages: [114, 329], min: 10, widget: 'nines',
    lede: 'Ba yêu cầu gặp trong hầu hết đề bài: high availability, high throughput và high scalability. Mỗi yêu cầu có bộ giải pháp riêng.',
    body: `
<h2>High availability: thiết kế dư thừa</h2>
<p>Tính sẵn sàng được đo bằng "số 9". Mức 4 nines (99,99%) cho phép hệ thống chỉ ngừng khoảng 8,64 giây mỗi ngày. Cách duy nhất để đạt được là có thành phần dự phòng:</p>
${tbl(['Mô hình', 'Cách hoạt động', 'Lưu ý'], [
['Hot-hot', 'Hai instance cùng nhận input và cùng gửi output xuống downstream', 'Downstream phải loại bỏ bản trùng (dedupe)'],
['Hot-warm', 'Hai instance cùng nhận input, chỉ bên hot gửi output', 'Khi hot sập, warm tiếp quản việc gửi'],
['Single-leader', 'Leader nhận dữ liệu và replicate sang các replica', 'Mô hình phổ biến của database'],
['Leaderless', 'Ghi vào bất kỳ node nào rồi replicate', 'Đọc đúng khi số node ghi + số node đọc > tổng số node (W + R > N)']
])}
<h2>High throughput</h2>
<p>Đo bằng QPS (query per second) hoặc TPS (transaction per second). Các cách tăng throughput:</p>
<ul>
<li>Thêm cache để request trả về mà không chạm tới I/O chậm như database hay đĩa.</li>
<li>Tăng số thread cho tác vụ nặng về tính toán. Quá nhiều thread lại làm giảm hiệu năng, nên phải tìm đúng điểm nghẽn.</li>
<li>Xử lý bất đồng bộ để tách riêng các thành phần nặng.</li>
</ul>
<h2>High scalability</h2>
<p>Hệ thống mở rộng nhanh để chịu thêm tải. Scale ngang là thêm server, scale dọc là thêm CPU/RAM cho server hiện có. Thường dựa vào response time để quyết định khi nào cần scale.</p>
<h2>6 nguyên tắc thiết kế chịu lỗi</h2>
<ol>
<li><b>Replication:</b> nhiều bản sao dữ liệu hoặc service ở các node khác nhau.</li>
<li><b>Redundancy:</b> có thành phần dự phòng sẵn sàng thay thế.</li>
<li><b>Load balancing:</b> chia tải để không server nào trở thành điểm lỗi duy nhất.</li>
<li><b>Failover:</b> tự động chuyển sang hệ thống dự phòng khi hệ thống chính lỗi.</li>
<li><b>Graceful degradation:</b> giảm bớt chức năng thay vì sập toàn bộ.</li>
<li><b>Monitoring và alerting:</b> theo dõi liên tục và cảnh báo khi có bất thường.</li>
</ol>`,
    keys: ['99,99% ≈ 8,64 giây downtime mỗi ngày.', 'Hot-hot cần downstream dedupe; leaderless cần W + R > N.', 'Các thành phần nối tiếp làm availability tổng giảm xuống, nên cần dự phòng song song.'],
    quiz: [
      { q: 'Với mô hình hot-hot, phía downstream cần làm gì?', o: ['Không cần làm gì', 'Loại bỏ output trùng lặp', 'Chọn leader mới', 'Tăng số thread'], a: 1, why: 'Cả hai instance đều gửi output, nên downstream nhận mỗi kết quả hai lần và phải dedupe.' },
      { q: 'Cluster leaderless có 5 node. Ghi vào 3 node thì cần đọc từ ít nhất bao nhiêu node để chắc chắn đọc được dữ liệu mới?', o: ['1', '2', '3', '5'], a: 2, why: 'Cần W + R > N, tức 3 + R > 5, nên R ≥ 3.' },
      { q: '"Graceful degradation" nghĩa là gì?', o: ['Tự động restart server', 'Tiếp tục chạy với chức năng giảm bớt khi một phần hỏng', 'Giảm dần số replica', 'Chuyển sang server dự phòng'], a: 1, why: 'Ví dụ: tắt gợi ý cá nhân hóa khi service gợi ý lỗi, nhưng người dùng vẫn xem phim được.' }
    ]
  },
  {
    id: 'trade-off', mod: 'nen-tang', title: '10 trade-off không thể bỏ qua', pages: [331, 194], min: 7,
    lede: 'Sách nhấn mạnh: không hiểu trade-off thì chưa hiểu system design. Không có lựa chọn tốt nhất, chỉ có lựa chọn phù hợp với yêu cầu.',
    body: `
${tbl(['Trade-off', 'Bên trái', 'Bên phải'], [
['Scale dọc vs Scale ngang', 'Thêm CPU, RAM cho server hiện có', 'Thêm server vào pool'],
['SQL vs NoSQL', 'Bảng, hàng, cột, schema chặt', 'Schema linh hoạt'],
['Batch vs Stream', 'Gom dữ liệu xử lý một lần (tính cước hằng ngày)', 'Xử lý theo thời gian thực (phát hiện gian lận)'],
['Normalize vs Denormalize', 'Mỗi thông tin chỉ lưu một nơi', 'Gộp bảng để query nhanh hơn'],
['Consistency vs Availability', 'Luôn đọc được dữ liệu mới nhất', 'Hệ thống luôn phản hồi dù một phần lỗi'],
['Strong vs Eventual consistency', 'Cập nhật hiển thị ngay lập tức', 'Cập nhật lan tới các node sau một khoảng trễ'],
['REST vs GraphQL', 'Nhiều endpoint, đơn giản, dễ cache', 'Một endpoint, client chọn đúng field cần'],
['Stateful vs Stateless', 'Server nhớ trạng thái giữa các request', 'Mỗi request tự chứa đủ thông tin, dễ scale'],
['Read-through vs Write-through cache', 'Cache tự nạp khi bị miss', 'Ghi vào cache và DB cùng lúc'],
['Sync vs Async', 'Chờ kết quả ngay', 'Đẩy vào queue, xử lý sau']
])}
${note('<b>Cách dùng trong phỏng vấn.</b> Khi chọn một phương án, hãy nói luôn bạn đánh đổi cái gì. Ví dụ: "Dùng eventual consistency cho bộ đếm like vì người dùng chấp nhận số liệu trễ vài giây, đổi lại hệ thống chịu được lượng ghi lớn."')}
<p>Sách cũng có ví dụ thiết kế Stack Overflow. Đáp án "chuẩn phỏng vấn" là microservices, sharding, message queue và CQRS. Thực tế Stack Overflow chạy monolith trên server on-premise và vẫn phục vụ tốt. Kiến trúc phù hợp phụ thuộc vào bối cảnh, không phụ thuộc xu hướng.</p>`,
    keys: ['Mỗi lựa chọn đều có cái giá, hãy nói rõ cái giá đó.', 'Stateless dễ scale ngang hơn stateful.', 'Kiến trúc đơn giản vẫn có thể đúng (ví dụ Stack Overflow chạy monolith).'],
    quiz: [
      { q: 'Phát hiện gian lận thẻ tín dụng phù hợp với kiểu xử lý nào?', o: ['Batch', 'Stream'], a: 1, why: 'Gian lận phải phát hiện ngay khi giao dịch xảy ra, nên cần stream processing.' },
      { q: 'Denormalization chủ yếu nhằm mục đích gì?', o: ['Tiết kiệm dung lượng', 'Tránh dữ liệu trùng lặp', 'Giảm join để đọc nhanh hơn', 'Tăng tính nhất quán'], a: 2, why: 'Denormalize chấp nhận lưu trùng dữ liệu để đổi lấy tốc độ đọc.' }
    ]
  },

  /* ---------------- M2 ---------------- */
  {
    id: 'go-url', mod: 'mang-api', title: 'Điều gì xảy ra khi bạn gõ một URL', pages: [284, 189, 271], min: 8,
    lede: 'Câu hỏi phỏng vấn kinh điển, và là cách tốt để nối các khái niệm mạng lại với nhau.',
    body: `
${flow([['Trình duyệt', 'hl'], 'DNS', 'TCP handshake', 'TLS handshake', 'HTTP request', ['Server', 'hl'], 'HTML/CSS/JS', ['Render', 'hl']])}
<ol>
<li><b>Nhập URL.</b> URL gồm scheme (<code>https://</code>), domain (<code>example.com</code>), path và resource.</li>
<li><b>DNS lookup.</b> Trình duyệt tìm địa chỉ IP theo thứ tự: cache trình duyệt, cache hệ điều hành, router, ISP, rồi tới DNS resolver đệ quy.</li>
<li><b>TCP handshake.</b> Ba bước SYN, SYN-ACK, ACK để mở kết nối với server.</li>
<li><b>TLS handshake</b> (nếu là HTTPS). Hai bên thống nhất thuật toán mã hóa. Khóa bất đối xứng dùng để trao đổi một session key, sau đó dữ liệu được mã hóa bằng khóa đối xứng vì nhanh hơn.</li>
<li><b>Gửi HTTP request</b> và server trả về response kèm status code.</li>
<li><b>Render.</b> Trình duyệt parse HTML thành DOM, CSS thành CSSOM, chạy JavaScript và vẽ trang.</li>
</ol>
<h2>HTTP/2 nhanh hơn HTTP/1 nhờ đâu</h2>
<ul>
<li><b>Binary framing:</b> dữ liệu được chia thành frame nhị phân thay vì văn bản.</li>
<li><b>Multiplexing:</b> nhiều request chạy song song trên một kết nối TCP.</li>
<li><b>Stream prioritization:</b> tài nguyên quan trọng được ưu tiên tải trước.</li>
<li><b>Header compression</b> (HPACK) và <b>server push</b>.</li>
</ul>`,
    keys: ['DNS → TCP → TLS → HTTP → render.', 'TLS dùng khóa bất đối xứng để trao đổi session key, rồi dùng khóa đối xứng để mã hóa dữ liệu.', 'HTTP/2 multiplex nhiều request trên một kết nối.'],
    quiz: [
      { q: 'Trong TLS, vì sao dữ liệu chính được mã hóa bằng khóa đối xứng?', o: ['Vì an toàn hơn khóa bất đối xứng', 'Vì nhanh hơn nhiều', 'Vì không cần trao đổi khóa', 'Vì trình duyệt không hỗ trợ khóa bất đối xứng'], a: 1, why: 'Mã hóa đối xứng nhanh hơn nhiều. Khóa bất đối xứng chỉ dùng lúc đầu để trao đổi session key an toàn.' },
      { q: 'Tính năng nào của HTTP/2 cho phép nhiều request chạy song song trên một kết nối?', o: ['Server push', 'Multiplexing', 'HPACK', 'Keep-alive'], a: 1, why: 'Multiplexing chia các request thành stream độc lập chạy trên cùng một kết nối TCP.' }
    ]
  },
  {
    id: 'api-style', mod: 'mang-api', title: 'REST, GraphQL, gRPC và Webhook', pages: [32, 93, 147, 97, 366], min: 9,
    lede: 'Mỗi kiểu API giải quyết một vấn đề khác nhau. Chọn đúng kiểu quan trọng hơn chọn kiểu "mới nhất".',
    body: `
${tbl(['', 'REST', 'GraphQL', 'gRPC'], [
['Cách gọi', 'Nhiều endpoint theo resource, dùng GET/POST/PUT/DELETE', 'Một endpoint, client gửi query mô tả dữ liệu cần', 'Gọi hàm từ xa như hàm local'],
['Định dạng', 'JSON (thường gặp)', 'JSON', 'Protocol Buffers (nhị phân)'],
['Giao thức', 'HTTP/1.1 hoặc HTTP/2', 'HTTP', 'HTTP/2'],
['Điểm mạnh', 'Đơn giản, dễ cache, phổ biến', 'Tránh lấy thừa hoặc thiếu dữ liệu', 'Nhanh, gọn, có streaming'],
['Điểm yếu', 'Có thể phải gọi nhiều lần hoặc nhận dư dữ liệu', 'Khó cache, query phức tạp tốn tài nguyên server', 'Khó debug, trình duyệt không hỗ trợ trực tiếp'],
['Dùng khi', 'API công khai, CRUD', 'Client đa dạng (web, mobile) cần dữ liệu khác nhau', 'Giao tiếp nội bộ giữa microservices']
])}
<h2>gRPC hoạt động thế nào</h2>
${flow([['Client', 'hl'], 'Client stub', 'Encode Protobuf', 'HTTP/2', 'Decode Protobuf', ['Server', 'hl']])}
<p>Client gọi một hàm trên stub. Stub mã hóa tham số thành Protobuf và gửi qua HTTP/2. Server giải mã, chạy hàm và trả kết quả theo chiều ngược lại. Vì Protobuf là nhị phân nên gói tin nhỏ và encode/decode nhanh hơn JSON.</p>
<h2>Polling hay Webhook</h2>
<p>Khi cần biết một tác vụ bên ngoài (ví dụ thanh toán) đã xong chưa:</p>
<ul>
<li><b>Polling:</b> client hỏi định kỳ "xong chưa?". Đơn giản nhưng tốn tài nguyên và có độ trễ.</li>
<li><b>Webhook:</b> bên kia chủ động gọi URL của bạn khi có kết quả. Hiệu quả hơn nhưng cần bảo mật endpoint, xử lý request trùng, và vẫn cần polling dự phòng phòng khi webhook không tới.</li>
</ul>`,
    keys: ['REST cho API công khai, GraphQL khi client cần dữ liệu linh hoạt, gRPC cho giao tiếp nội bộ.', 'GraphQL không thay thế REST, hai kiểu có thể cùng tồn tại.', 'Webhook đẩy kết quả về, polling thì kéo; thực tế thường kết hợp cả hai.'],
    quiz: [
      { q: 'gRPC dùng định dạng dữ liệu nào?', o: ['XML', 'JSON', 'Protocol Buffers', 'YAML'], a: 2, why: 'gRPC mặc định dùng Protocol Buffers, định dạng nhị phân gọn và nhanh.' },
      { q: 'Ứng dụng có web và mobile, mỗi màn hình cần một tập field khác nhau. Kiểu API nào phù hợp nhất?', o: ['REST', 'GraphQL', 'gRPC', 'SOAP'], a: 1, why: 'GraphQL cho client tự chọn field, tránh over-fetching và under-fetching.' },
      { q: 'Vì sao hệ thống dùng webhook vẫn nên có polling dự phòng?', o: ['Webhook chậm hơn polling', 'Webhook có thể bị lỗi hoặc không tới', 'Polling an toàn hơn', 'Webhook không hỗ trợ HTTPS'], a: 1, why: 'Nếu endpoint của bạn lỗi đúng lúc webhook gửi tới, bạn sẽ mất sự kiện. Polling định kỳ giúp bắt lại.' }
    ]
  },
  {
    id: 'api-design', mod: 'mang-api', title: 'Thiết kế API: hiệu năng, phân trang, idempotency', pages: [224, 282, 277, 238, 333], min: 10,
    lede: 'Một API tốt phải nhanh, trả dữ liệu theo từng phần, và an toàn khi client gọi lại nhiều lần.',
    body: `
<h2>5 cách cải thiện hiệu năng API</h2>
${tbl(['Kỹ thuật', 'Cách làm'], [
['Phân trang kết quả', 'Trả về tập kết quả lớn theo từng phần'],
['Ghi log bất đồng bộ', 'Ghi log vào buffer không khóa rồi trả về ngay, buffer được flush xuống đĩa định kỳ'],
['Cache dữ liệu', 'Kiểm tra cache (ví dụ Redis) trước khi query database'],
['Nén payload', 'Nén request/response bằng gzip để truyền nhanh hơn'],
['Connection pool', 'Dùng lại kết nối database đang mở thay vì mở/đóng mỗi lần']
])}
<h2>Các kiểu phân trang</h2>
<ul>
<li><b>Offset:</b> <code>?offset=40&amp;limit=20</code>. Dễ làm, nhưng chậm khi offset lớn và dễ lặp/sót dữ liệu khi có bản ghi mới chèn vào.</li>
<li><b>Cursor:</b> server trả một con trỏ trỏ tới bản ghi cuối, lần sau gửi kèm con trỏ đó. Ổn định khi dữ liệu thay đổi liên tục.</li>
<li><b>Keyset:</b> lọc theo khóa có thứ tự, ví dụ <code>WHERE id &gt; 1000</code>. Nhanh vì tận dụng index.</li>
<li><b>Page-based</b> (<code>?page=3</code>) và <b>time-based</b> (lọc theo khoảng thời gian).</li>
</ul>
<h2>Idempotency: gọi nhiều lần, kết quả như một lần</h2>
<p>Mạng không ổn định nên client sẽ retry. Nếu thao tác không idempotent, retry có thể trừ tiền hai lần. Sách nêu 6 trường hợp cần idempotency: REST API, thanh toán, đặt hàng, thao tác database, quản lý tài khoản (đăng ký, reset mật khẩu) và xử lý message từ queue.</p>
${tbl(['HTTP method', 'Idempotent?'], [
['GET, HEAD, PUT, DELETE', 'Có'],
['POST', 'Không (mỗi lần gọi có thể tạo bản ghi mới)'],
['PATCH', 'Tùy cách cài đặt']
])}
${note('<b>Kỹ thuật phổ biến.</b> Client gửi kèm một <code>Idempotency-Key</code> duy nhất cho mỗi thao tác. Server lưu key đã xử lý; nếu gặp lại key cũ thì trả về kết quả đã lưu thay vì xử lý lần nữa.')}`,
    keys: ['Phân trang, cache, nén, log bất đồng bộ, connection pool.', 'Cursor/keyset ổn định và nhanh hơn offset với dữ liệu lớn.', 'POST không idempotent; dùng Idempotency-Key cho thanh toán và đặt hàng.'],
    quiz: [
      { q: 'Method nào KHÔNG idempotent theo chuẩn HTTP?', o: ['GET', 'PUT', 'DELETE', 'POST'], a: 3, why: 'Gọi POST hai lần có thể tạo hai bản ghi. PUT ghi đè cùng một giá trị nên gọi bao nhiêu lần cũng như nhau.' },
      { q: 'Feed mạng xã hội có bài mới liên tục. Kiểu phân trang nào tránh lặp bài tốt nhất?', o: ['Offset', 'Cursor', 'Page-based', 'Không phân trang'], a: 1, why: 'Với offset, bài mới chèn vào đầu làm lệch vị trí nên trang sau lặp lại bài cũ. Cursor bám vào bản ghi cụ thể nên không bị lệch.' },
      { q: 'Connection pooling giải quyết vấn đề gì?', o: ['Giảm kích thước payload', 'Chi phí mở/đóng kết nối database mỗi lần', 'Tránh trùng lặp request', 'Phân trang dữ liệu'], a: 1, why: 'Mở kết nối database tốn thời gian. Pool giữ sẵn các kết nối để dùng lại.' }
    ]
  },
  {
    id: 'gateway', mod: 'mang-api', title: 'API Gateway, reverse proxy và load balancer', pages: [138, 309, 324], min: 7,
    lede: 'Ba thành phần đều đứng giữa client và server nên dễ nhầm, nhưng mỗi cái có vai trò riêng.',
    body: `
${flow([['Client', 'hl'], 'API Gateway', 'Load balancer', ['Service A', 'hl'], ['Service B', 'hl']], 'Trong thực tế một sản phẩm như Nginx có thể đóng cả ba vai trò.')}
${tbl(['Thành phần', 'Việc chính', 'Ví dụ'], [
['Reverse proxy', 'Đứng trước server, che giấu server thật, SSL termination, cache, nén', 'Nginx, HAProxy'],
['Load balancer', 'Chia request tới nhiều instance khỏe mạnh', 'AWS ELB, Nginx'],
['API Gateway', 'Cổng vào duy nhất của API: routing, xác thực, rate limit, gộp response', 'Kong, AWS API Gateway, Zuul']
])}
<h2>Chức năng chính của API Gateway</h2>
<ul>
<li><b>Request routing:</b> chuyển request tới đúng service backend.</li>
<li><b>Load balancing:</b> chia request giữa nhiều server.</li>
<li><b>Bảo mật:</b> xác thực, phân quyền, mã hóa.</li>
<li><b>Rate limiting và throttling:</b> giới hạn số request của mỗi client trong một khoảng thời gian.</li>
<li><b>API composition:</b> gộp nhiều lời gọi backend thành một response cho frontend.</li>
<li><b>Caching:</b> lưu tạm response để không phải xử lý lại.</li>
</ul>
<h2>Vì sao Nginx phổ biến</h2>
<p>Nginx dùng kiến trúc event-driven với một master process và vài worker process. Mỗi worker xử lý hàng nghìn kết nối không chặn, nên tốn ít bộ nhớ hơn mô hình mỗi kết nối một thread. Nginx thường được dùng làm web server, reverse proxy, load balancer, SSL termination và cache.</p>`,
    keys: ['Reverse proxy che server, load balancer chia tải, API gateway quản lý API.', 'Gateway lo rate limit, xác thực, routing và gộp response.', 'Nginx nhẹ nhờ mô hình event-driven.'],
    quiz: [
      { q: 'Giới hạn mỗi client tối đa 100 request/phút là việc của thành phần nào?', o: ['Database', 'API Gateway', 'CDN', 'Message queue'], a: 1, why: 'Rate limiting là một chức năng điển hình của API Gateway.' },
      { q: '"API composition" trong gateway nghĩa là gì?', o: ['Tự sinh tài liệu API', 'Gộp nhiều lời gọi backend thành một response', 'Nén response', 'Ghép nhiều phiên bản API'], a: 1, why: 'Frontend chỉ gọi một lần, gateway gọi nhiều service rồi gộp kết quả.' }
    ]
  },

  /* ---------------- M3 ---------------- */
  {
    id: 'load-balancing', mod: 'lb-cache', title: 'Thuật toán cân bằng tải', pages: [41, 34, 212, 317], min: 8, widget: 'lb',
    lede: 'Load balancer quyết định request tiếp theo đi tới server nào. Thuật toán chia làm hai nhóm: tĩnh và động.',
    body: `
<h2>Thuật toán tĩnh (không xét trạng thái server)</h2>
<ol>
<li><b>Round robin:</b> gửi lần lượt tới từng server. Các service thường phải stateless.</li>
<li><b>Sticky round robin:</b> request đầu của một người dùng đi tới server nào thì các request sau cũng đi tới server đó.</li>
<li><b>Weighted round robin:</b> admin đặt trọng số, server có trọng số cao nhận nhiều request hơn.</li>
<li><b>Hash:</b> băm IP hoặc URL của request để chọn server.</li>
</ol>
<h2>Thuật toán động (xét trạng thái hiện tại)</h2>
<ol start="5">
<li><b>Least connections:</b> gửi tới server đang có ít kết nối đồng thời nhất.</li>
<li><b>Least response time:</b> gửi tới server phản hồi nhanh nhất.</li>
</ol>
<h2>Các use case khác của load balancer</h2>
<ul>
<li><b>Xử lý lỗi:</b> tự chuyển traffic khỏi thành phần bị hỏng.</li>
<li><b>Health check:</b> liên tục kiểm tra và chỉ gửi request tới instance khỏe.</li>
<li><b>Routing theo nền tảng:</b> gửi request mobile và desktop tới backend riêng.</li>
<li><b>SSL termination:</b> giải mã HTTPS tại load balancer, giảm tải cho server.</li>
<li><b>Cross-zone:</b> chia traffic qua nhiều vùng sẵn sàng (availability zone).</li>
<li><b>Session persistence:</b> giữ một người dùng trên cùng một server.</li>
</ul>`,
    keys: ['Tĩnh: round robin, sticky, weighted, hash. Động: least connections, least response time.', 'Hash và sticky giữ người dùng trên cùng server, hữu ích khi có session.', 'Load balancer còn lo health check, failover và SSL termination.'],
    quiz: [
      { q: 'Server mạnh gấp đôi các server khác. Thuật toán nào tận dụng tốt nhất?', o: ['Round robin', 'Weighted round robin', 'IP hash', 'Random'], a: 1, why: 'Weighted round robin cho phép đặt trọng số 2 cho server mạnh để nó nhận gấp đôi request.' },
      { q: 'Thuật toán nào thuộc nhóm động?', o: ['Round robin', 'Hash', 'Least connections', 'Weighted round robin'], a: 2, why: 'Least connections phải biết số kết nối hiện tại của mỗi server, tức là dựa vào trạng thái lúc chạy.' }
    ]
  },
  {
    id: 'cache', mod: 'lb-cache', title: 'Cache nằm ở đâu và chiến lược eviction', pages: [75, 198, 275, 153], min: 10, widget: 'cache',
    lede: 'Cache có mặt ở gần như mọi tầng của hệ thống. Khi cache đầy, chiến lược eviction quyết định phần tử nào bị loại.',
    body: `
<h2>Dữ liệu được cache ở đâu</h2>
${flow(['Trình duyệt', 'CDN', 'Load balancer', 'Message broker', 'Service (RAM)', ['Distributed cache', 'hl'], 'Search index', 'Database'])}
<ul>
<li><b>Client:</b> trình duyệt cache HTTP response theo thời gian hết hạn trong header.</li>
<li><b>CDN:</b> cache nội dung tĩnh ở máy chủ gần người dùng.</li>
<li><b>Load balancer:</b> có thể cache response.</li>
<li><b>Message broker:</b> Kafka lưu message trên đĩa để consumer đọc lại theo nhu cầu.</li>
<li><b>Service:</b> CPU cache, RAM và đĩa cục bộ.</li>
<li><b>Distributed cache:</b> Redis giữ key-value trong RAM, dùng chung giữa nhiều service.</li>
<li><b>Full-text search:</b> Elasticsearch đánh index tài liệu để tìm kiếm.</li>
<li><b>Database:</b> buffer pool, materialized view, WAL, transaction log và replication log.</li>
</ul>
<h2>8 chiến lược eviction</h2>
${tbl(['Chiến lược', 'Loại bỏ phần tử nào'], [
['LRU (Least Recently Used)', 'Lâu nhất chưa được dùng'],
['MRU (Most Recently Used)', 'Vừa được dùng gần nhất'],
['SLRU (Segmented LRU)', 'Chia hai vùng: thử việc và bảo vệ; phần tử được truy cập lại sẽ lên vùng bảo vệ'],
['LFU (Least Frequently Used)', 'Ít được truy cập nhất'],
['FIFO', 'Vào sớm nhất, bất kể được dùng nhiều hay ít'],
['TTL', 'Hết thời gian sống (không hẳn là thuật toán eviction)'],
['Two-tiered', 'Tầng 1 trong RAM của service, tầng 2 là distributed cache'],
['RR (Random Replacement)', 'Chọn ngẫu nhiên']
])}
${note('<b>Netflix dùng EVCache</b> (dựa trên Memcached) theo 4 cách: lookaside cache, transient data store cho dữ liệu tạm, primary store cho dữ liệu cá nhân hóa tính sẵn, và cache dữ liệu có lượng truy cập cao như trang chủ.')}`,
    keys: ['Cache ở mọi tầng: client, CDN, LB, broker, service, Redis, search, DB.', 'LRU là lựa chọn mặc định phổ biến; LFU phù hợp khi có dữ liệu "hot" ổn định.', 'TTL giúp dữ liệu cache không cũ quá lâu.'],
    quiz: [
      { q: 'Cache dung lượng 2, đang có [A, B], A vừa được truy cập. Thêm C với LRU thì phần tử nào bị loại?', o: ['A', 'B', 'C', 'Không loại'], a: 1, why: 'B là phần tử lâu nhất chưa được dùng, nên LRU loại B.' },
      { q: 'FIFO khác LRU ở điểm nào?', o: ['FIFO không quan tâm phần tử có được truy cập lại hay không', 'FIFO loại phần tử mới nhất', 'FIFO dùng tần suất truy cập', 'Không khác'], a: 0, why: 'FIFO chỉ xét thứ tự vào. Một phần tử được dùng liên tục vẫn bị loại nếu nó vào sớm nhất.' }
    ]
  },
  {
    id: 'cache-loi', mod: 'lb-cache', title: '4 sự cố cache kinh điển', pages: [20, 11, 348], min: 7,
    lede: 'Chủ đề này xuất hiện ba lần trong sách, đủ thấy mức độ quan trọng. Cả bốn sự cố đều dẫn tới cùng một hậu quả: database bị quá tải.',
    body: `
${tbl(['Sự cố', 'Nguyên nhân', 'Cách xử lý'], [
['Thundering herd', 'Nhiều key hết hạn cùng lúc, request dồn xuống database', 'Cộng thêm thời gian ngẫu nhiên vào TTL; chỉ cho dữ liệu nghiệp vụ cốt lõi chạm DB đến khi cache hồi phục'],
['Cache penetration', 'Key không có trong cả cache lẫn DB, nên lần nào cũng đọc DB', 'Cache giá trị null cho key không tồn tại; dùng bloom filter kiểm tra key trước'],
['Cache breakdown', 'Một hot key hết hạn, rất nhiều request cùng đọc DB', 'Không đặt TTL cho hot key (hot key có thể chiếm tới 80% truy vấn)'],
['Cache crash', 'Cache sập, toàn bộ request đổ xuống DB', 'Circuit breaker; chạy cache dạng cluster để tăng tính sẵn sàng']
])}
${flow([['Cache hết hạn / sập', 'warn'], 'Request miss', ['Database quá tải', 'warn'], 'Latency tăng', 'Timeout dây chuyền'])}
<h2>Bloom filter hoạt động thế nào</h2>
<p>Bloom filter là cấu trúc dữ liệu nhỏ gọn trả lời câu hỏi "key này có thể tồn tại không?". Nếu nó trả lời "không" thì chắc chắn không tồn tại, nên có thể bỏ qua truy vấn database. Nếu nó trả lời "có" thì có một tỉ lệ nhỏ là sai, nhưng vẫn chặn được phần lớn request rác.</p>`,
    keys: ['Thundering herd: thêm jitter vào TTL.', 'Penetration: cache null hoặc dùng bloom filter.', 'Breakdown: hot key không hết hạn. Crash: circuit breaker và cache cluster.'],
    quiz: [
      { q: 'Kẻ tấn công gửi hàng loạt request với ID không tồn tại. Đây là sự cố gì?', o: ['Thundering herd', 'Cache penetration', 'Cache breakdown', 'Cache crash'], a: 1, why: 'Key không tồn tại ở cả cache và DB nên request luôn xuyên qua cache xuống DB.' },
      { q: 'Cách đơn giản nhất để tránh nhiều key hết hạn cùng lúc là gì?', o: ['Tăng RAM cho cache', 'Cộng thêm thời gian ngẫu nhiên vào TTL', 'Dùng bloom filter', 'Tắt cache'], a: 1, why: 'Jitter làm thời điểm hết hạn của các key tản ra, không dồn vào một lúc.' }
    ]
  },

  /* ---------------- M4 ---------------- */
  {
    id: 'acid-cap', mod: 'du-lieu', title: 'ACID, CAP và BASE', pages: [110, 112, 63, 130], min: 8,
    lede: 'Ba bộ chữ viết tắt mô tả ba góc nhìn khác nhau về tính đúng đắn của dữ liệu. Chữ "C" trong ACID và CAP không cùng nghĩa.',
    body: `
<h2>ACID: tính chất của một transaction</h2>
${tbl(['Chữ', 'Ý nghĩa'], [
['<b>A</b>tomicity', 'Tất cả hoặc không gì cả. Lỗi giữa chừng thì rollback toàn bộ.'],
['<b>C</b>onsistency', 'Giữ các ràng buộc của database (invariant). Dữ liệu ghi vào phải hợp lệ theo mọi quy tắc.'],
['<b>I</b>solation', 'Các transaction đồng thời không ảnh hưởng nhau. Mức chặt nhất là serializable, nhưng thực tế thường dùng mức lỏng hơn.'],
['<b>D</b>urability', 'Đã commit thì không mất dù hệ thống lỗi. Trong hệ phân tán nghĩa là đã replicate sang node khác.']
])}
<h2>CAP: hệ phân tán khi mạng bị chia cắt</h2>
<ul>
<li><b>Consistency:</b> mọi lần đọc nhận được bản ghi mới nhất hoặc lỗi.</li>
<li><b>Availability:</b> mọi request đều nhận được phản hồi.</li>
<li><b>Partition tolerance:</b> hệ thống vẫn chạy khi mạng giữa các node bị lỗi.</li>
</ul>
${note('<b>Lưu ý từ sách.</b> CAP bị phê bình là quá hẹp. Lỗi mạng chắc chắn xảy ra trong hệ phân tán nên P là bắt buộc; lựa chọn thực sự là giữa C và A khi có partition. Martin Kleppmann khuyên không nên dán nhãn database là "CP" hay "AP".')}
<h2>BASE: lựa chọn của NoSQL</h2>
<p>ACID quá chặt với nhiều hệ NoSQL. BASE (Basically Available, Soft state, Eventual consistency) ưu tiên availability hơn consistency, chấp nhận dữ liệu sẽ nhất quán sau một khoảng thời gian.</p>
<h2>Bonus: SOLID và KISS</h2>
<p>SOLID gồm SRP (mỗi đơn vị một trách nhiệm), OCP (mở để mở rộng, đóng để sửa), LSP (lớp con thay thế được lớp cha), ISP (tách interface nhỏ theo trách nhiệm), DIP (phụ thuộc vào abstraction). KISS: "Keep it simple, stupid", nguyên tắc do Hải quân Mỹ đưa ra năm 1960.</p>`,
    keys: ['C trong ACID là giữ ràng buộc dữ liệu; C trong CAP là đọc được bản mới nhất.', 'Partition là điều chắc chắn xảy ra, nên thực chất là chọn C hay A khi có sự cố mạng.', 'BASE đánh đổi tính nhất quán tức thời để lấy availability.'],
    quiz: [
      { q: 'Chuyển tiền: trừ tài khoản A xong thì server sập trước khi cộng vào B. Tính chất nào đảm bảo tiền không biến mất?', o: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], a: 0, why: 'Atomicity: transaction chưa hoàn tất thì rollback toàn bộ, nên A không bị trừ tiền.' },
      { q: 'Trong CAP, thành phần nào gần như bắt buộc trong hệ phân tán?', o: ['Consistency', 'Availability', 'Partition tolerance'], a: 2, why: 'Lỗi mạng chắc chắn xảy ra, nên hệ thống phải chịu được partition.' }
    ]
  },
  {
    id: 'scale-db', mod: 'du-lieu', title: 'Scale database và sharding', pages: [245, 208, 341, 347, 290, 325], min: 11,
    lede: 'Khi một database không còn chịu nổi tải, có 7 chiến lược theo thứ tự từ rẻ đến đắt. Sharding là bước cuối và phức tạp nhất.',
    body: `
<h2>7 chiến lược scale database</h2>
${tbl(['#', 'Chiến lược', 'Giải quyết'], [
['1', 'Indexing: tạo index theo đúng pattern truy vấn', 'Query chậm'],
['2', 'Materialized view: tính trước kết quả query phức tạp', 'Báo cáo, tổng hợp'],
['3', 'Denormalization: giảm join', 'Join tốn kém'],
['4', 'Scale dọc: thêm CPU, RAM, ổ cứng', 'Mọi thứ, nhưng có giới hạn'],
['5', 'Caching: đưa dữ liệu hay đọc lên tầng nhanh hơn', 'Tải đọc'],
['6', 'Replication: tạo bản sao trên server khác', 'Scale đọc'],
['7', 'Sharding: chia bảng ra nhiều server', 'Scale cả ghi lẫn đọc']
])}
<h2>4 thuật toán sharding</h2>
<ul>
<li><b>Range-based:</b> chia theo khoảng giá trị (họ A–M, N–Z; hoặc theo tháng). Dễ hiểu nhưng dễ lệch tải (hotspot).</li>
<li><b>Hash-based:</b> băm shard key (ví dụ customer ID) để chọn shard. Phân bố đều hơn, nhưng thêm/bớt shard phải di chuyển nhiều dữ liệu.</li>
<li><b>Consistent hashing:</b> đặt shard và key trên một vòng tròn băm. Thêm/bớt shard chỉ ảnh hưởng một phần nhỏ dữ liệu.</li>
<li><b>Virtual bucket:</b> dữ liệu ánh xạ vào bucket ảo, bucket ảo ánh xạ vào shard vật lý. Hai tầng ánh xạ giúp cân bằng lại mà ít phải di chuyển dữ liệu.</li>
</ul>
<h2>Case study từ sách</h2>
<ul>
<li><b>Figma</b> scale Postgres lên 100 lần: bắt đầu bằng scale dọc và read replica, sau đó tách theo nhóm bảng (vertical partitioning), cuối cùng sharding theo chiều ngang.</li>
<li><b>Discord</b> lưu hàng nghìn tỷ tin nhắn: chuyển từ MongoDB sang Cassandra rồi sang ScyllaDB, thêm tầng data service viết bằng Rust để gộp các request trùng lặp.</li>
</ul>`,
    keys: ['Thử index, cache, replica trước khi nghĩ tới sharding.', 'Replication scale đọc; sharding scale cả ghi.', 'Consistent hashing giảm lượng dữ liệu phải di chuyển khi thêm/bớt shard.'],
    quiz: [
      { q: 'Hệ thống có tải ghi rất lớn vượt khả năng một server. Chiến lược nào giải quyết được?', o: ['Read replica', 'Thêm cache', 'Sharding', 'Materialized view'], a: 2, why: 'Replica và cache chỉ giảm tải đọc. Chỉ sharding chia được tải ghi ra nhiều server.' },
      { q: 'Ưu điểm chính của consistent hashing so với hash thông thường?', o: ['Băm nhanh hơn', 'Ít dữ liệu phải di chuyển khi thêm/bớt shard', 'Không bao giờ có hotspot', 'Không cần shard key'], a: 1, why: 'Với hash mod N, đổi N làm hầu hết key đổi shard. Consistent hashing chỉ di chuyển key thuộc đoạn bị ảnh hưởng.' },
      { q: 'Chia dữ liệu đơn hàng theo tháng là kiểu sharding nào?', o: ['Range-based', 'Hash-based', 'Consistent hashing', 'Virtual bucket'], a: 0, why: 'Chia theo khoảng thời gian là range-based. Nhược điểm: shard của tháng hiện tại chịu gần hết tải ghi.' }
    ]
  },

  /* ---------------- M5 ---------------- */
  {
    id: 'kafka', mod: 'bat-dong-bo', title: 'Kafka: vì sao nhanh và có mất message không', pages: [241, 165, 171, 335, 220], min: 10,
    lede: 'Kafka là xương sống của nhiều hệ thống event-driven. Hai thiết kế làm nên tốc độ của nó là sequential I/O và zero copy.',
    body: `
<h2>1. Sequential I/O</h2>
<p>Kafka ghi message nối tiếp vào cuối log trên đĩa. Ghi tuần tự nhanh hơn rất nhiều so với ghi ngẫu nhiên, kể cả trên ổ cứng cơ, nên Kafka dùng được đĩa giá rẻ mà vẫn đạt throughput cao.</p>
<h2>2. Zero copy</h2>
<p>Không có zero copy, dữ liệu đi qua 4 lần sao chép:</p>
${flow(['Đĩa', 'OS cache', ['Ứng dụng Kafka', 'warn'], 'Socket buffer', 'Card mạng', 'Consumer'])}
<p>Với zero copy, OS cache gửi thẳng tới card mạng bằng lệnh <code>sendfile()</code>, bỏ qua bước sao chép qua ứng dụng:</p>
${flow(['Đĩa', 'OS cache', ['sendfile()', 'hl'], 'Card mạng', 'Consumer'])}
<h2>Kafka có làm mất message không?</h2>
<p>Có thể, nếu cấu hình sai. Rủi ro nằm ở ba chỗ:</p>
${tbl(['Vị trí', 'Rủi ro', 'Cấu hình an toàn'], [
['Producer', 'Gửi xong không chờ xác nhận', '<code>acks=all</code>, bật retry'],
['Broker', 'Message chỉ nằm trong page cache rồi broker sập', 'Replication factor ≥ 3, <code>min.insync.replicas</code> &gt; 1'],
['Consumer', 'Commit offset trước khi xử lý xong', 'Tắt auto commit, commit sau khi xử lý xong']
])}
<h2>5 use case phổ biến</h2>
<ul>
<li>Thu thập và phân tích log.</li>
<li>Stream dữ liệu cho hệ thống gợi ý.</li>
<li>Monitoring và cảnh báo hệ thống.</li>
<li>Change Data Capture (CDC): đẩy thay đổi từ database sang các hệ khác.</li>
<li>Di chuyển hệ thống cũ sang mới mà không dừng dịch vụ.</li>
</ul>`,
    keys: ['Sequential I/O + zero copy (sendfile) = tốc độ của Kafka.', 'Chống mất message: acks=all, replication ≥ 3, commit offset sau khi xử lý.', 'CDC dùng Kafka để đồng bộ thay đổi của database theo thời gian thực.'],
    quiz: [
      { q: 'Zero copy bỏ qua bước nào?', o: ['Đọc từ đĩa', 'Sao chép dữ liệu qua bộ nhớ của ứng dụng Kafka', 'Gửi qua card mạng', 'Ghi vào OS cache'], a: 1, why: 'sendfile() cho phép kernel gửi dữ liệu từ OS cache thẳng ra card mạng mà không qua user space.' },
      { q: 'Consumer commit offset rồi mới xử lý, giữa chừng bị crash. Điều gì xảy ra?', o: ['Message được xử lý hai lần', 'Message bị mất', 'Kafka tự gửi lại', 'Không ảnh hưởng gì'], a: 1, why: 'Offset đã commit nên khi khởi động lại consumer bỏ qua message đó, và message chưa bao giờ được xử lý.' }
    ]
  },
  {
    id: 'messaging', mod: 'bat-dong-bo', title: '6 mẫu messaging trên cloud', pages: [172, 9, 177], min: 8,
    lede: 'Các service giao tiếp với nhau thế nào khi không muốn chờ nhau? Sách giới thiệu 6 mẫu thường gặp.',
    body: `
${tbl(['Mẫu', 'Giải quyết', 'Cách làm'], [
['Asynchronous Request-Reply', 'Tác vụ backend chạy lâu', 'API trả về HTTP 202 Accepted ngay, client kiểm tra trạng thái sau'],
['Publisher-Subscriber', 'Tách người gửi khỏi người nhận', 'Gửi vào topic, nhiều subscriber cùng nhận, người gửi không phải chờ'],
['Claim Check', 'Message quá lớn', 'Lưu payload vào storage, chỉ gửi tham chiếu qua queue'],
['Priority Queue', 'Một số request cần xử lý trước', 'Request ưu tiên cao được nhận và xử lý sớm hơn'],
['Saga', 'Nhất quán dữ liệu giữa nhiều service', 'Chuỗi transaction cục bộ, mỗi bước có hành động bù trừ nếu bước sau lỗi'],
['Competing Consumers', 'Xử lý song song nhiều message', 'Nhiều consumer cùng đọc một queue; không đảm bảo thứ tự']
])}
<h2>Saga thay cho distributed transaction</h2>
${flow(['Tạo đơn', 'Trừ kho', ['Thanh toán lỗi', 'warn'], 'Hoàn kho', 'Hủy đơn'], 'Khi một bước lỗi, các bước đã xong được bù trừ theo chiều ngược lại.')}
<p>Trong microservices, mỗi service có database riêng nên không dùng được một transaction chung. Distributed transaction (two-phase commit) khó scale và làm giảm hiệu năng. Saga chia thành các transaction cục bộ, mỗi bước kèm một hành động bù trừ.</p>
<h2>Event sourcing</h2>
<p>Thay vì lưu trạng thái hiện tại, hệ thống lưu mọi sự kiện đã xảy ra. Event store là nguồn sự thật. Ví dụ trong sách: New York Times lưu mọi bài báo, hình ảnh và byline từ năm 1851 vào event store, sau đó dựng các view khác nhau và đẩy vào Elasticsearch để phục vụ tìm kiếm.</p>`,
    keys: ['202 Accepted cho tác vụ chạy lâu.', 'Claim check: gửi tham chiếu thay vì payload lớn.', 'Saga dùng hành động bù trừ thay cho distributed transaction.'],
    quiz: [
      { q: 'Cần gửi file video 2 GB qua message queue. Nên dùng mẫu nào?', o: ['Priority Queue', 'Claim Check', 'Saga', 'Competing Consumers'], a: 1, why: 'Lưu video vào object storage, chỉ gửi đường dẫn qua queue.' },
      { q: 'Nhược điểm của Competing Consumers là gì?', o: ['Không xử lý song song được', 'Không đảm bảo thứ tự message', 'Cần điều phối phức tạp giữa consumer', 'Chỉ có một consumer'], a: 1, why: 'Nhiều consumer xử lý đồng thời nên message sau có thể xong trước message trước.' }
    ]
  },
  {
    id: 'retry', mod: 'bat-dong-bo', title: 'Chiến lược retry khi gặp lỗi', pages: [243, 277], min: 6, widget: 'retry',
    lede: 'Lỗi tạm thời là chuyện thường trong hệ phân tán. Retry đúng cách giúp hồi phục; retry sai cách tạo ra "bão retry" làm sập hệ thống.',
    body: `
${tbl(['Chiến lược', 'Khoảng chờ', 'Ưu', 'Nhược'], [
['Linear backoff', '1s, 2s, 3s, 4s…', 'Đơn giản, dễ hiểu', 'Dễ gây bão retry khi tải cao'],
['Linear jitter', 'Tuyến tính + ngẫu nhiên', 'Các client không retry cùng lúc', 'Khoảng chờ vẫn tăng chậm'],
['Exponential backoff', '1s, 2s, 4s, 8s… (có giới hạn trên)', 'Giảm tải mạnh, hợp với hệ thống tải cao', 'Có thể chờ lâu không cần thiết'],
['Exponential jitter', 'Lũy thừa + ngẫu nhiên', 'Tản đều retry, giảm va chạm tốt nhất', 'Khó dự đoán thời gian chờ']
])}
${note('<b>Điều kiện tiên quyết.</b> Chỉ retry những thao tác idempotent, hoặc thao tác có Idempotency-Key. Nếu không, retry một lệnh thanh toán có thể trừ tiền hai lần.')}
<p>Nên đặt số lần retry tối đa và thời gian chờ tối đa. Kết hợp với circuit breaker để ngừng gọi một service đang hỏng thay vì liên tục retry vào nó.</p>`,
    keys: ['Exponential backoff + jitter là lựa chọn mặc định tốt.', 'Luôn giới hạn số lần retry và thời gian chờ tối đa.', 'Chỉ retry thao tác idempotent.'],
    quiz: [
      { q: 'Vì sao cần thêm jitter vào backoff?', o: ['Để retry nhanh hơn', 'Để các client không retry cùng lúc', 'Để giảm số lần retry', 'Để đảm bảo thứ tự'], a: 1, why: 'Nếu hàng nghìn client lỗi cùng lúc và chờ cùng một khoảng, chúng sẽ retry cùng lúc và đánh sập server lần nữa.' },
      { q: 'Exponential backoff bắt đầu từ 1s, lần retry thứ 4 chờ bao lâu?', o: ['4s', '8s', '16s', '3s'], a: 1, why: '1s, 2s, 4s, 8s. Lần thứ 4 chờ 8 giây.' }
    ]
  },

  /* ---------------- M6 ---------------- */
  {
    id: 'auth', mod: 'bao-mat', title: 'Session, JWT, OAuth 2.0 và lưu mật khẩu', pages: [229, 87, 102, 312, 261, 292, 269], min: 12,
    lede: 'Xác thực (bạn là ai) và phân quyền (bạn được làm gì) là nền móng bảo mật của mọi hệ thống.',
    body: `
<h2>Session-based và JWT</h2>
${tbl(['', 'Session', 'JWT'], [
['Lưu ở đâu', 'Server lưu session trong session store, client chỉ giữ session ID', 'Toàn bộ thông tin nằm trong token, server không lưu'],
['So sánh với vé máy bay', 'Chỉ cầm mã vé, chi tiết nằm trong hệ thống hãng bay', 'Cầm vé có in đủ thông tin, được ký để không sửa được'],
['Xác thực request', 'Tra session ID trong store', 'Kiểm tra chữ ký của token'],
['Thu hồi', 'Dễ: xóa session', 'Khó: token còn hạn vẫn dùng được, cần blacklist hoặc hạn ngắn'],
['Scale', 'Cần session store dùng chung', 'Stateless, dễ scale ngang']
])}
<p>JWT gồm ba phần ngăn cách bằng dấu chấm: <code>header.payload.signature</code>. Header và payload chỉ được mã hóa Base64, <b>không được mã hóa bảo mật</b>, nên không đặt thông tin nhạy cảm vào payload.</p>
<h2>OAuth 2.0</h2>
<p>OAuth 2.0 cho phép một ứng dụng truy cập tài nguyên của người dùng ở dịch vụ khác mà không cần biết mật khẩu. Ví dụ "Đăng nhập bằng Google".</p>
${flow([['Người dùng', 'hl'], 'Ứng dụng', 'Authorization server', 'Người dùng đồng ý', 'Authorization code', 'Access token', ['Resource server', 'hl']])}
<p>Bốn vai trò: resource owner (người dùng), client (ứng dụng), authorization server (cấp token) và resource server (giữ dữ liệu). Các flow chính: <b>Authorization Code</b> (phổ biến nhất, nên kèm PKCE cho ứng dụng mobile và SPA), <b>Client Credentials</b> (service gọi service), Implicit và Resource Owner Password (đã lỗi thời, không nên dùng).</p>
<h2>Lưu mật khẩu an toàn</h2>
<ol>
<li>Không bao giờ lưu mật khẩu dạng gốc.</li>
<li>Sinh một <b>salt</b> ngẫu nhiên riêng cho mỗi người dùng.</li>
<li>Lưu <code>hash(mật khẩu + salt)</code> và salt vào database.</li>
<li>Khi đăng nhập: lấy salt, tính lại <code>hash(mật khẩu nhập + salt)</code> và so sánh với giá trị đã lưu.</li>
</ol>
${note('<b>Vì sao cần salt.</b> Salt khiến hai người dùng cùng mật khẩu có hash khác nhau, và làm vô hiệu bảng tra hash tính sẵn (rainbow table). Hãy dùng thuật toán hash chậm có chủ đích như bcrypt, scrypt hoặc Argon2.')}`,
    keys: ['Session dễ thu hồi; JWT stateless, dễ scale nhưng khó thu hồi.', 'Payload JWT chỉ là Base64, ai cũng đọc được.', 'OAuth 2.0: dùng Authorization Code + PKCE; lưu mật khẩu bằng hash + salt.'],
    quiz: [
      { q: 'Có nên lưu số CCCD của người dùng trong payload JWT không?', o: ['Có, vì JWT đã được mã hóa', 'Không, vì payload chỉ là Base64 và ai cũng đọc được', 'Có, nếu dùng HTTPS', 'Có, vì có chữ ký'], a: 1, why: 'Chữ ký chỉ chống sửa đổi, không chống đọc. Payload giải mã Base64 là đọc được.' },
      { q: 'Salt trong lưu mật khẩu có tác dụng gì?', o: ['Làm mật khẩu dài hơn khi hiển thị', 'Khiến cùng mật khẩu cho ra hash khác nhau, chống rainbow table', 'Mã hóa để giải mã lại được', 'Tăng tốc độ đăng nhập'], a: 1, why: 'Kẻ tấn công không thể dùng bảng hash tính sẵn vì mỗi người dùng có salt riêng.' },
      { q: 'Service A gọi service B, không có người dùng tham gia. Flow OAuth nào phù hợp?', o: ['Authorization Code', 'Implicit', 'Client Credentials', 'Resource Owner Password'], a: 2, why: 'Client Credentials dành cho giao tiếp máy với máy.' }
    ]
  },

  /* ---------------- M7 ---------------- */
  {
    id: 'van-de', mod: 'thuc-chien', title: '8 vấn đề thường gặp và cách giải', pages: [319, 226, 231], min: 7,
    lede: 'Bảng tra nhanh: gặp triệu chứng nào thì nghĩ ngay tới giải pháp nào. Dùng tốt để ôn trước phỏng vấn.',
    body: `
${tbl(['Vấn đề', 'Giải pháp'], [
['Hệ thống đọc nhiều', 'Cache để đọc nhanh hơn'],
['Lượng ghi lớn', 'Worker bất đồng bộ xử lý ghi; database dựa trên LSM-tree'],
['Single point of failure', 'Dự phòng và failover cho thành phần quan trọng như database'],
['Yêu cầu sẵn sàng cao', 'Load balancer chuyển request tới instance khỏe; replicate database'],
['Latency cao', 'CDN đưa nội dung tới gần người dùng'],
['File lớn', 'Block storage và object storage'],
['Monitoring và alerting', 'Hệ thống log tập trung như ELK stack'],
['Query database chậm', 'Index đúng cách; sharding để scale ngang']
])}
<h2>Chẩn đoán process ngốn tài nguyên trên Linux</h2>
${tbl(['Công cụ', 'Xem gì'], [
['<code>vmstat</code>', 'Process, bộ nhớ, paging, block I/O, CPU'],
['<code>iostat</code>', 'Thống kê CPU và I/O'],
['<code>netstat</code>', 'Thống kê IP, TCP, UDP, ICMP'],
['<code>lsof</code>', 'Các file đang mở'],
['<code>pidstat</code>', 'Tài nguyên dùng theo từng process: CPU, bộ nhớ, I/O, thread']
])}
<p>Các nguyên nhân CPU 100% sách liệt kê: vòng lặp vô hạn, process chạy nền, traffic tăng đột biến, ứng dụng nặng, thiếu bộ nhớ (swap liên tục), quá nhiều process đồng thời, busy waiting, regex phức tạp và mã độc.</p>`,
    keys: ['Đọc nhiều → cache. Ghi nhiều → async + LSM-tree.', 'Latency → CDN. Query chậm → index rồi sharding.', 'vmstat, iostat, pidstat để tìm process ngốn tài nguyên.'],
    quiz: [
      { q: 'Database nào phù hợp với hệ thống ghi rất nhiều?', o: ['Database dựa trên B-tree', 'Database dựa trên LSM-tree', 'Cache in-memory', 'File CSV'], a: 1, why: 'LSM-tree gom ghi vào bộ nhớ rồi ghi tuần tự xuống đĩa, tối ưu cho tải ghi lớn.' },
      { q: 'Người dùng ở châu Âu tải ảnh chậm từ server ở Việt Nam. Giải pháp đầu tiên?', o: ['Sharding', 'CDN', 'Thêm index', 'Message queue'], a: 1, why: 'CDN cache ảnh ở máy chủ gần người dùng châu Âu.' }
    ]
  },
  {
    id: 'case-study', mod: 'thuc-chien', title: 'Kiến trúc Reddit và Netflix', pages: [247, 175, 169, 202, 222], min: 10,
    lede: 'Hai công ty phục vụ hàng trăm triệu người dùng. Kiến trúc của họ cho thấy các khái niệm ở các bài trước được ghép lại thế nào.',
    body: `
<h2>Reddit: hơn 1 tỷ người dùng mỗi tháng</h2>
${flow(['CDN (Fastly)', 'Load balancer', ['GraphQL Federation', 'hl'], 'Microservices (Go)', 'Memcached', 'Postgres / Cassandra'])}
<ul>
<li>Bắt đầu là monolith Python, đang chuyển dần sang microservices viết bằng Go.</li>
<li>Dùng GraphQL cho tầng API; từ 2021 chuyển sang GraphQL Federation, tách GraphQL monolith thành nhiều subgraph.</li>
<li>Postgres cho dữ liệu cốt lõi, có memcached phía trước để giảm tải. Cassandra cho tính năng mới vì khả năng chịu lỗi và sẵn sàng.</li>
<li>Debezium chạy CDC để replicate dữ liệu và giữ cache nhất quán.</li>
<li>Thao tác tốn kém như vote hay đăng link được đẩy vào job queue (RabbitMQ). Kafka chuyển dữ liệu theo thời gian thực cho kiểm duyệt nội dung.</li>
<li>Chạy trên AWS và Kubernetes; triển khai bằng Spinnaker, Drone CI và Terraform.</li>
</ul>
<h2>Netflix: kiến trúc Java qua các thời kỳ</h2>
${flow(['API Gateway (Zuul)', 'BFF (Groovy + RxJava)', ['GraphQL Federation', 'hl']])}
<ol>
<li><b>API Gateway:</b> mỗi màn hình (như danh sách phim LOLOMO) cần dữ liệu từ hàng chục microservice. Gọi trực tiếp từ client quá chậm, nên Netflix dùng Zuul làm gateway để điều phối.</li>
<li><b>Backend for Frontend:</b> TV, mobile và web có nhu cầu khác nhau, nên mỗi loại client có một BFF riêng viết bằng Groovy và RxJava.</li>
<li><b>GraphQL Federation:</b> thay thế BFF; các service backend dùng Spring Boot, nâng cấp lên Java mới (17, rồi 21 với virtual threads).</li>
</ol>
${note('<b>Điểm chung.</b> Cả hai đều bắt đầu đơn giản, tách dần thành service, dùng GraphQL Federation làm tầng API, và dựa nhiều vào cache, queue và CDC. Kiến trúc tiến hóa theo nhu cầu, không được thiết kế xong ngay từ đầu.')}`,
    keys: ['Reddit: monolith Python → microservices Go, GraphQL Federation, CDC bằng Debezium.', 'Netflix: Zuul gateway → BFF → GraphQL Federation.', 'Kiến trúc lớn tiến hóa dần theo nhu cầu.'],
    quiz: [
      { q: 'Reddit dùng công cụ nào để chạy Change Data Capture?', o: ['Kafka Streams', 'Debezium', 'RabbitMQ', 'Spinnaker'], a: 1, why: 'Debezium đọc thay đổi từ database để replicate và giữ cache nhất quán.' },
      { q: 'Vì sao Netflix chuyển từ một API gateway chung sang BFF?', o: ['Gateway quá đắt', 'Mỗi loại client (TV, mobile, web) cần dữ liệu khác nhau', 'Zuul ngừng phát triển', 'Để bỏ microservices'], a: 1, why: 'Một gateway chung khó đáp ứng khác biệt giữa các client, nên mỗi client có backend riêng.' }
    ]
  }
];
