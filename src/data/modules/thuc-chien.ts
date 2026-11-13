import type { Lesson } from '../../types';
import { cols, diagram, interview, note, seq, tbl, tip } from '../helpers';

/* ------------------------------------------------------------------ */
/* 1. 8 vấn đề thường gặp                                              */
/* ------------------------------------------------------------------ */
const vanDe: Lesson = {
  id: 'van-de',
  mod: 'thuc-chien',
  title: '8 vấn đề thường gặp và cách giải',
  pages: [319, 47, 95],
  min: 12,
  level: 'co-ban',
  lede: 'Hệ thống lớn hay gặp lại cùng một nhóm triệu chứng: đọc quá nhiều, ghi quá nhiều, một máy chết kéo cả hệ thống xuống. Nhận ra triệu chứng nhanh và biết ngay nhóm giải pháp tương ứng là kỹ năng nền cho mọi buổi phỏng vấn system design.',
  body: `
<h2>Khung tiếp cận một bài phỏng vấn system design</h2>
<p>Đề phỏng vấn thường rất ngắn và cố tình mơ hồ, ví dụ "thiết kế hệ thống thông báo". Người phỏng vấn muốn xem bạn đặt câu hỏi, khoanh vùng bài toán và đánh đổi ra sao. Vì vậy cần một khung cố định để không bị lạc trong 45 phút.</p>
${diagram({
  w: 720, h: 250,
  nodes: [
    { id: 'r', label: '1. Làm rõ\nyêu cầu', x: 110, y: 60, w: 150, h: 56 },
    { id: 'e', label: '2. Ước lượng\nquy mô', x: 360, y: 60, w: 150, h: 56 },
    { id: 'hl', label: '3. Thiết kế\ntổng thể', x: 610, y: 60, w: 150, h: 56, kind: 'lb' },
    { id: 'dd', label: '4. Đào sâu\n2–3 thành phần', x: 610, y: 190, w: 160, h: 56 },
    { id: 'wr', label: '5. Tổng kết\nvà trade-off', x: 360, y: 190, w: 150, h: 56, kind: 'good' },
  ],
  edges: [
    { from: 'r', to: 'e' },
    { from: 'e', to: 'hl' },
    { from: 'hl', to: 'dd', curve: 30 },
    { from: 'dd', to: 'hl', curve: 30, dashed: true },
    { from: 'dd', to: 'wr' },
  ],
  caption: 'Hình: Năm bước trả lời một đề system design. Mũi tên nét đứt: khi đào sâu phát hiện vấn đề, quay lại chỉnh sơ đồ tổng thể.',
})}
${tbl(['Bước', 'Thời gian (buổi 45 phút)', 'Việc cần làm'], [
  ['Làm rõ yêu cầu', '5–8 phút', 'Hỏi tính năng chính (functional) và yêu cầu phi chức năng: số người dùng, latency mong muốn, mức nhất quán, mức sẵn sàng.'],
  ['Ước lượng', '3–5 phút', 'QPS trung bình và lúc cao điểm, dung lượng lưu trữ mỗi năm, băng thông. Ví dụ 10 triệu DAU, mỗi người 10 request/ngày thì khoảng 1.200 QPS trung bình.'],
  ['Thiết kế tổng thể', '10–15 phút', 'Vẽ client, load balancer, service, database, cache, queue. Đánh số luồng chính và đi qua từng bước.'],
  ['Đào sâu', '10–15 phút', 'Chọn 2–3 thành phần khó nhất (schema, sharding, cache, xử lý lỗi) để phân tích kỹ.'],
  ['Tổng kết', '3–5 phút', 'Nêu điểm nghẽn còn lại, cách giám sát, hướng mở rộng khi tải tăng 10 lần.'],
])}

<h2>Tám vấn đề và cách giải</h2>
<p>Sách tóm tắt tám vấn đề hay gặp nhất trong hệ thống production quy mô lớn. Bảng dưới bổ sung thêm dấu hiệu nhận biết và cái giá của mỗi giải pháp, vì người phỏng vấn gần như luôn hỏi tiếp "vậy nhược điểm là gì".</p>
${tbl(['#', 'Vấn đề', 'Dấu hiệu', 'Giải pháp chính', 'Cái giá phải trả'], [
  ['1', 'Đọc nhiều', 'Tỉ lệ đọc/ghi từ 10:1 trở lên, CPU database cao vì SELECT', 'Cache; read replica', 'Dữ liệu có thể cũ, phải lo invalidation'],
  ['2', 'Ghi nhiều', 'Latency ghi tăng, lock tranh chấp', 'Worker bất đồng bộ; database dựa trên LSM-tree', 'Nhất quán sau (eventual), đọc chậm hơn một chút'],
  ['3', 'Single point of failure', 'Một thành phần chết làm cả hệ thống dừng', 'Dự phòng (redundancy) và failover', 'Tốn gấp đôi tài nguyên, failover phải được diễn tập'],
  ['4', 'Yêu cầu sẵn sàng cao', 'SLA 99,9% trở lên', 'Load balancer chỉ gửi tới instance khỏe; replicate database', 'Replication lag, chi phí vận hành'],
  ['5', 'Latency cao', 'Người dùng ở xa data center', 'CDN', 'Chi phí CDN, xóa cache khi nội dung đổi'],
  ['6', 'File lớn', 'Upload video, ảnh, backup', 'Block storage và object storage (S3)', 'Cần quản lý metadata riêng'],
  ['7', 'Giám sát, cảnh báo', 'Lỗi xảy ra mà không ai biết', 'Log tập trung, ví dụ ELK stack', 'Chi phí lưu trữ log'],
  ['8', 'Query database chậm', 'Full table scan, bảng hàng tỉ dòng', 'Index đúng; sharding để scale ngang', 'Index làm ghi chậm hơn; query xuyên shard khó'],
])}

<h3>Đọc nhiều: chặn request trước khi tới database</h3>
<p>Phần lớn ứng dụng web có lượng đọc gấp hàng chục lần lượng ghi. Lớp đầu tiên là cache (Redis, Memcached) giữ dữ liệu nóng trong RAM. Lớp thứ hai là <b>read replica</b>: bản sao của database chỉ phục vụ đọc, nhận thay đổi từ primary qua replication.</p>
${diagram({
  w: 720, h: 300,
  nodes: [
    { id: 'c', label: 'Client', x: 80, y: 140, w: 100, kind: 'client' },
    { id: 'app', label: 'App server', x: 260, y: 140 },
    { id: 'ca', label: 'Cache', sub: 'Redis', x: 470, y: 45, kind: 'cache' },
    { id: 'rep', label: 'Read replica', sub: 'chỉ đọc', x: 470, y: 145, w: 130, kind: 'store' },
    { id: 'pri', label: 'Primary', sub: 'nhận ghi', x: 470, y: 250, kind: 'store' },
  ],
  edges: [
    { from: 'c', to: 'app' },
    { from: 'app', to: 'ca', label: '1' },
    { from: 'app', to: 'rep', label: '2' },
    { from: 'app', to: 'pri', label: '3' },
    { from: 'pri', to: 'rep', label: 'replicate', dashed: true },
  ],
  caption: 'Hình: (1) đọc cache trước; (2) cache miss thì đọc replica; (3) mọi thao tác ghi đi vào primary rồi được replicate sang replica.',
})}

<h3>Ghi nhiều: hấp thụ bằng queue và LSM-tree</h3>
<p>Khi ghi dồn dập (log, click, tin nhắn), API nên ghi vào queue rồi trả lời ngay, để worker xử lý dần theo tốc độ database chịu được. Phía lưu trữ, database dựa trên <b>LSM-tree</b> (Cassandra, RocksDB) gom ghi vào bộ nhớ (memtable), sau đó xả xuống đĩa thành file SSTable theo kiểu ghi tuần tự, nhanh hơn nhiều so với cập nhật ngẫu nhiên trên B-tree.</p>
${diagram({
  w: 720, h: 310,
  nodes: [
    { id: 'c', label: 'Client', x: 80, y: 90, w: 100, kind: 'client' },
    { id: 'api', label: 'API', x: 250, y: 90 },
    { id: 'q', label: 'Queue', sub: 'Kafka', x: 430, y: 90, kind: 'queue' },
    { id: 'wk', label: 'Worker', x: 610, y: 90 },
    { id: 'mem', label: 'Memtable', sub: 'RAM', x: 610, y: 240, kind: 'cache' },
    { id: 'sst', label: 'SSTable', sub: 'ghi tuần tự', x: 400, y: 240, kind: 'store' },
    { id: 'cmp', label: 'SSTable', sub: 'đã compaction', x: 190, y: 240, w: 130, kind: 'store' },
  ],
  edges: [
    { from: 'c', to: 'api', label: '1', curve: 25 },
    { from: 'api', to: 'c', label: '3', curve: 25, dashed: true },
    { from: 'api', to: 'q', label: '2' },
    { from: 'q', to: 'wk', label: '4' },
    { from: 'wk', to: 'mem', label: '5' },
    { from: 'mem', to: 'sst', label: '6' },
    { from: 'sst', to: 'cmp', label: '7' },
  ],
  groups: [{ x: 115, y: 182, w: 590, h: 104, label: 'Database LSM-tree' }],
  caption: 'Hình: (1–3) API ghi vào queue rồi trả 202 ngay; (4–5) worker ghi vào memtable; (6) memtable đầy thì xả xuống SSTable; (7) compaction gộp các SSTable nhỏ.',
})}

<h3>Single point of failure và sẵn sàng cao</h3>
<p>Mọi thành phần chỉ có một bản đều là điểm chết. Cách giải là nhân bản và có cơ chế tự chuyển: load balancer chạy theo cặp active/standby, server ứng dụng có nhiều instance và được health check, database có standby nhận replication để failover.</p>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'c', label: 'Client', x: 80, y: 135, w: 100, kind: 'client' },
    { id: 'lb1', label: 'LB chính', x: 250, y: 80, kind: 'lb' },
    { id: 'lb2', label: 'LB dự phòng', x: 250, y: 200, w: 130, kind: 'lb' },
    { id: 's1', label: 'Server A', x: 440, y: 50, kind: 'good' },
    { id: 's2', label: 'Server B', x: 440, y: 140, kind: 'good' },
    { id: 's3', label: 'Server C', sub: 'health check lỗi', x: 440, y: 235, w: 130, kind: 'warn' },
    { id: 'dbp', label: 'DB primary', x: 630, y: 90, kind: 'store' },
    { id: 'dbs', label: 'DB standby', x: 630, y: 215, kind: 'store' },
  ],
  edges: [
    { from: 'c', to: 'lb1' },
    { from: 'c', to: 'lb2', dashed: true, kind: 'muted' },
    { from: 'lb1', to: 's1' },
    { from: 'lb1', to: 's2' },
    { from: 'lb1', to: 's3', dashed: true, kind: 'warn' },
    { from: 's1', to: 'dbp' },
    { from: 's2', to: 'dbp' },
    { from: 'dbp', to: 'dbs', label: 'replicate', dashed: true },
  ],
  caption: 'Hình: Không còn điểm chết đơn lẻ. LB dự phòng nhận IP khi LB chính lỗi; server C bị loại khỏi pool; DB standby sẵn sàng thay primary.',
})}

<h3>Bốn vấn đề còn lại</h3>
<p><b>Latency cao</b> do khoảng cách vật lý: ánh sáng trong cáp quang đi từ Việt Nam sang Mỹ và quay lại mất cỡ 150–200 ms, không tối ưu code nào bù được. CDN đặt bản sao nội dung tĩnh ở gần người dùng. <b>File lớn</b> không nên nhét vào database quan hệ; lưu file trên object storage, database chỉ giữ metadata và đường dẫn. <b>Giám sát</b> cần log tập trung (Elasticsearch, Logstash, Kibana) để tìm lỗi xuyên nhiều service. <b>Query chậm</b> trước hết sửa bằng index; chỉ khi một máy không còn chứa nổi dữ liệu hay tải ghi mới tính tới sharding.</p>

<h2>Cheat sheet 15 khía cạnh khi thiết kế</h2>
<p>Sách đưa ra 15 khái niệm cốt lõi cần đi qua khi thiết kế một hệ thống. Có thể dùng như checklist: trước khi kết thúc buổi phỏng vấn, lướt qua danh sách để xem mình đã bỏ sót khía cạnh nào.</p>
${tbl(['Nhóm', 'Khía cạnh', 'Câu hỏi tự kiểm tra'], [
  ['Định hình', 'Thu thập yêu cầu, kiến trúc hệ thống', 'Ai dùng, dùng thế nào? Gồm những khối nào, giao tiếp ra sao?'],
  ['Dữ liệu và nghiệp vụ', 'Thiết kế dữ liệu, thiết kế domain', 'Schema, chọn SQL hay NoSQL? Ranh giới giữa các domain ở đâu?'],
  ['Chất lượng vận hành', 'Scalability, reliability, availability, performance', 'Tải tăng 10 lần thì sao? Một máy chết thì sao? Latency p99 bao nhiêu?'],
  ['An toàn và bền vững', 'Security, maintainability, testing', 'Xác thực, mã hóa thế nào? Người mới đọc code có hiểu? Test ở tầng nào?'],
  ['Con người và chi phí', 'Trải nghiệm người dùng, ước tính chi phí', 'Người dùng cảm nhận độ trễ ra sao? Mỗi tháng tốn bao nhiêu tiền hạ tầng?'],
  ['Vòng đời', 'Tài liệu, kế hoạch migration', 'Ai sẽ duy trì? Chuyển từ hệ thống cũ sang mà không downtime bằng cách nào?'],
])}

<h2>Blueprint: các khối xây dựng hay dùng</h2>
<p>Bài "System Design Blueprint" trong sách là một mẫu liệt kê những chủ đề nên chủ động nhắc tới khi thảo luận. Mỗi khối gắn với một câu hỏi thiết kế cụ thể:</p>
${cols([
  { title: 'Đường đi của request', body: '<p><b>Load balancer</b>, <b>API gateway</b>, giao thức (REST, gRPC, WebSocket), <b>CDN</b>. Trả lời câu hỏi: request vào hệ thống bằng cửa nào và được phân phối ra sao.</p>' },
  { title: 'Lưu trữ và xử lý', body: '<p><b>Database</b>, <b>cache</b>, <b>message queue</b>, <b>sinh ID duy nhất</b> (Snowflake, UUID). Trả lời câu hỏi: dữ liệu nằm ở đâu, xử lý đồng bộ hay bất đồng bộ.</p>' },
  { title: 'Thuộc tính hệ thống', body: '<p>Scalability, availability, performance, security, chịu lỗi và khả năng phục hồi. Trả lời câu hỏi: hệ thống hành xử thế nào khi tải tăng hoặc có sự cố.</p>' },
])}
${tip('<b>Thực tế.</b> Sách kể rằng khoảng 10 năm trước Amazon nhận thấy mỗi 100 ms latency tăng thêm làm doanh số giảm 1%, tương đương khoảng 5,7 tỉ USD theo quy mô hiện nay. Vì thế các chiến lược giảm latency như index, cache, CDN, xử lý bất đồng bộ và nén dữ liệu được ưu tiên ở mọi hệ thống hướng tới người dùng.')}
${note('<b>Sai lầm thường gặp.</b> Nhảy ngay vào vẽ Kafka, sharding, microservices khi chưa hỏi quy mô. Một hệ thống 1.000 người dùng mỗi ngày chạy tốt trên một server và một database. Hãy để con số ước lượng dẫn đường cho mức độ phức tạp.')}
${interview([
  'Database của bạn chạy ở 90% CPU, phần lớn là câu SELECT. Bạn xử lý theo thứ tự nào?',
  'Vì sao database dựa trên LSM-tree ghi nhanh hơn B-tree? Đổi lại mất gì?',
  'Liệt kê các single point of failure trong một kiến trúc gồm một load balancer, ba app server và một database. Loại bỏ từng điểm thế nào?',
  'Khi nào bạn chọn sharding thay vì thêm read replica?',
])}`,
  keys: [
    'Trả lời phỏng vấn theo 5 bước: yêu cầu, ước lượng, thiết kế tổng thể, đào sâu, tổng kết.',
    'Đọc nhiều thì cache và read replica; ghi nhiều thì queue, worker và database LSM-tree.',
    'Loại bỏ single point of failure bằng dự phòng và failover cho mọi thành phần quan trọng.',
    'Latency do khoảng cách thì dùng CDN; query chậm thì index trước, sharding sau.',
    'Mỗi giải pháp đều có cái giá; luôn nói rõ trade-off.',
  ],
  quiz: [
    { q: 'Hệ thống có tỉ lệ đọc/ghi 50:1, database quá tải vì SELECT. Giải pháp đầu tiên nên nghĩ tới?', o: ['Sharding database', 'Thêm cache và read replica', 'Chuyển sang LSM-tree', 'Thêm message queue'], a: 1, why: 'Tải chủ yếu là đọc nên chặn bằng cache và chia đọc sang replica là rẻ và hiệu quả nhất. Sharding phức tạp hơn nhiều.' },
    { q: 'Vì sao database dựa trên LSM-tree phù hợp với tải ghi lớn?', o: ['Không cần lưu xuống đĩa', 'Gom ghi trong RAM rồi xả xuống đĩa tuần tự', 'Không có index', 'Tự động sharding'], a: 1, why: 'Ghi tuần tự theo lô nhanh hơn nhiều so với cập nhật ngẫu nhiên các trang B-tree trên đĩa.' },
    { q: 'Người dùng ở châu Âu tải ảnh chậm từ server đặt tại Việt Nam. Giải pháp phù hợp nhất?', o: ['Thêm index', 'CDN', 'Read replica tại Việt Nam', 'Tăng RAM server'], a: 1, why: 'Độ trễ do khoảng cách vật lý; CDN đặt bản sao ảnh tại edge gần người dùng châu Âu.' },
    { q: 'Trong buổi phỏng vấn 45 phút, việc nào nên làm trước khi vẽ kiến trúc?', o: ['Chọn database', 'Làm rõ yêu cầu và ước lượng quy mô', 'Thiết kế schema chi tiết', 'Viết code mẫu'], a: 1, why: 'Không biết quy mô và yêu cầu thì không có cơ sở để chọn kiến trúc, dễ thiết kế thừa hoặc thiếu.' },
  ],
};

/* ------------------------------------------------------------------ */
/* 2. Hệ thống thông báo                                               */
/* ------------------------------------------------------------------ */
const thongBao: Lesson = {
  id: 'thong-bao',
  mod: 'thuc-chien',
  title: 'Thiết kế hệ thống thông báo',
  pages: [18, 99, 77],
  min: 14,
  level: 'trung-binh',
  lede: 'Push, email, SMS, OTP, thông báo trong app: gần như sản phẩm nào cũng cần gửi thông báo. Bài toán nghe đơn giản nhưng đụng tới hàng đợi, bên thứ ba, sở thích người dùng và chống spam cùng một lúc.',
  body: `
<h2>Yêu cầu</h2>
${cols([
  { title: 'Chức năng', body: '<ul><li>Gửi qua nhiều kênh: in-app, push mobile, email, SMS/OTP, mạng xã hội.</li><li>Nhận yêu cầu từng thông báo hoặc theo lô (batch).</li><li>Template định nghĩa sẵn, chèn biến như tên, mã đơn.</li><li>Người dùng chọn kênh ưa thích, tắt từng loại thông báo.</li><li>Hẹn giờ gửi; theo dõi đã gửi, đã mở, đã click.</li></ul>' },
  { title: 'Phi chức năng', body: '<ul><li>Gần thời gian thực: OTP phải tới trong vài giây; marketing có thể trễ vài phút.</li><li>Không mất thông báo quan trọng (at-least-once).</li><li>Không gửi trùng làm phiền người dùng.</li><li>Chịu được khi một nhà cung cấp SMS hay email bị lỗi.</li><li>Scale ngang khi có chiến dịch gửi hàng triệu tin.</li></ul>' },
])}

<h2>Ước lượng nhanh</h2>
<p>Giả sử mỗi ngày gửi 10 triệu push, 5 triệu email và 1 triệu SMS. 10 triệu chia cho 86.400 giây là khoảng 115 push mỗi giây trung bình. Chiến dịch marketing có thể dồn vào vài phút nên cao điểm dễ gấp 10–50 lần, tức vài nghìn tin mỗi giây. Mỗi bản ghi log khoảng 500 byte, 16 triệu tin mỗi ngày tạo ra khoảng 8 GB log, hơn 2,9 TB mỗi năm. Kết luận: cần queue để san tải đỉnh, và kho log phải là loại ghi nhiều, rẻ.</p>

<h2>Kiến trúc tổng thể</h2>
${diagram({
  w: 720, h: 440,
  nodes: [
    { id: 'svc', label: 'Business\nservices', x: 80, y: 165, w: 110, h: 56, kind: 'client' },
    { id: 'gw', label: 'Notification\ngateway', x: 260, y: 165, w: 130, h: 56, kind: 'lb' },
    { id: 'dist', label: 'Distribution\nservice', x: 450, y: 165, w: 130, h: 56 },
    { id: 'tpl', label: 'Template', x: 350, y: 55, kind: 'store' },
    { id: 'pref', label: 'Sở thích kênh', x: 560, y: 55, w: 130, kind: 'store' },
    { id: 'mq', label: 'Router', sub: 'queue/kênh', x: 640, y: 165, w: 110, kind: 'queue' },
    { id: 'ch', label: 'Channel\nservices', x: 640, y: 280, w: 120, h: 56 },
    { id: 'ext', label: 'APNs, FCM,\nSMTP, SMS', x: 640, y: 385, w: 130, h: 56, kind: 'external' },
    { id: 'trk', label: 'Tracking &\nanalytics', x: 400, y: 280, w: 130, h: 56 },
    { id: 'ops', label: 'Đội vận hành', x: 160, y: 280, w: 130, kind: 'client' },
  ],
  edges: [
    { from: 'svc', to: 'gw', label: '1' },
    { from: 'gw', to: 'dist', label: '2' },
    { from: 'dist', to: 'tpl', label: '2a' },
    { from: 'dist', to: 'pref', label: '2b' },
    { from: 'dist', to: 'mq', label: '3' },
    { from: 'mq', to: 'ch', label: '4' },
    { from: 'ch', to: 'ext' },
    { from: 'ch', to: 'trk', label: '5' },
    { from: 'ext', to: 'trk', dashed: true, kind: 'muted' },
    { from: 'trk', to: 'ops', label: '6' },
  ],
  caption: 'Hình: Kiến trúc thông báo đa kênh. Gateway nhận yêu cầu, distribution service dựng nội dung, router (queue) tách theo kênh, channel service gửi ra nhà cung cấp, tracking thu số liệu.',
})}
<ol>
<li><b>Business service gửi yêu cầu</b> (đơn hàng, thanh toán, marketing) tới notification gateway. Gateway hỗ trợ hai chế độ: nhận từng thông báo, hoặc nhận một lô lớn cho chiến dịch.</li>
<li><b>Distribution service</b> kiểm tra hợp lệ, định dạng và lên lịch. Nó lấy mẫu nội dung từ kho template (2a) và đọc kênh người dùng ưa thích từ kho preference (2b).</li>
<li>Thông báo đã dựng xong được đẩy vào <b>router</b>, thường là message queue, mỗi kênh một topic riêng.</li>
<li><b>Channel service</b> của từng kênh lấy tin từ queue và gọi kênh giao nhận nội bộ hoặc bên ngoài: APNs, FCM, máy chủ email, nhà mạng SMS.</li>
<li>Kết quả gửi (thành công, lỗi, bị bounce) cùng callback từ nhà cung cấp được ghi vào <b>tracking và analytics</b>.</li>
<li>Đội vận hành xem báo cáo tỉ lệ giao, mở, click để cải thiện trải nghiệm.</li>
</ol>

<h2>Đào sâu 1: distribution service</h2>
<p>Đây là bộ não của hệ thống. Ngoài việc dựng nội dung, nó phải chặn những thông báo không nên gửi. Thứ tự kiểm tra hợp lý là rẻ trước, đắt sau:</p>
${tbl(['Bước', 'Mục đích', 'Cách làm phổ biến'], [
  ['Validate', 'Loại yêu cầu thiếu trường, sai định dạng số điện thoại, email', 'Schema validation ngay tại gateway'],
  ['Chống trùng', 'Retry từ business service không tạo tin thứ hai', 'Idempotency key, lưu trong Redis với TTL vài giờ'],
  ['Opt-out và preference', 'Tôn trọng lựa chọn của người dùng, tuân thủ pháp luật', 'Đọc từ kho preference, có cache phía trước'],
  ['Giới hạn tần suất', 'Không gửi quá N marketing push mỗi ngày cho một người', 'Rate limit theo user và loại thông báo'],
  ['Hẹn giờ, giờ yên tĩnh', 'Không đánh thức người dùng lúc 2 giờ sáng', 'Lưu vào scheduler, phát hành khi tới giờ theo múi giờ người dùng'],
])}

<h2>Đào sâu 2: router và channel service</h2>
<p>Tách queue theo kênh là quyết định quan trọng nhất. Nếu SMS provider chậm, queue SMS dồn lên nhưng push và email vẫn chạy bình thường. Mỗi channel service scale độc lập theo tốc độ cho phép của nhà cung cấp. Có thể tách thêm queue ưu tiên: OTP và cảnh báo bảo mật đi làn riêng, không phải xếp sau hàng triệu tin marketing.</p>
<p>Khi gửi lỗi, worker retry với exponential backoff. Lỗi vĩnh viễn (token hết hạn, email không tồn tại) không retry mà đánh dấu để dọn dữ liệu. Tin retry quá số lần cho phép chuyển vào dead letter queue để người vận hành xem xét. Với SMS, nên tích hợp hai nhà cung cấp và tự chuyển khi một bên lỗi.</p>

<h2>Đào sâu 3: push tới điện thoại qua FCM</h2>
<p>Server của bạn không kết nối thẳng tới điện thoại. Apple dùng APNs, Google dùng FCM (Firebase Cloud Messaging). FCM là giải pháp đa nền tảng: nó cung cấp một API chung, tự xếp hàng tin khi thiết bị offline và chuyển tiếp qua tầng transport riêng của từng nền tảng.</p>
${seq({
  actors: [
    { id: 'app', label: 'Client app', kind: 'client' },
    { id: 'srv', label: 'App server' },
    { id: 'fcm', label: 'FCM', kind: 'external' },
    { id: 'tr', label: 'Transport\nnền tảng', kind: 'external' },
  ],
  msgs: [
    { from: 'app', to: 'fcm', label: 'Sender ID, API key, App ID' },
    { from: 'fcm', to: 'app', label: 'registration token', dashed: true },
    { from: 'app', to: 'srv', label: 'gửi token' },
    { note: 'Server lưu token kèm timestamp, định kỳ xóa token cũ' },
    { from: 'srv', to: 'fcm', label: 'message + token' },
    { note: 'Thiết bị offline: FCM giữ tin trong storage' },
    { from: 'fcm', to: 'tr', label: 'chuyển theo nền tảng' },
    { from: 'tr', to: 'app', label: 'hiển thị thông báo', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Luồng push qua FCM. Token định danh từng bản cài đặt của app và phải đi kèm mọi tin gửi tới thiết bị đó.',
})}
<p>Registration token còn gọi là instance ID vì nó gắn với một lần cài đặt app. Theo thời gian server tích lũy rất nhiều token, phần lớn đã chết do người dùng gỡ app. Vì vậy cần lưu timestamp và dọn định kỳ. Tin có thể soạn từ console của Firebase hoặc gửi từ server qua Admin SDK hay HTTP. Ngoài gửi tới từng token, FCM cho phép gửi tới <b>topic</b>: mọi thiết bị đã subscribe topic đó đều nhận, hợp với tin dạng "tỉ số trận đấu".</p>

<h2>Khi nào nên gửi: bài học từ Slack</h2>
<p>Sách giới thiệu flowchart Slack dùng để quyết định có gửi một thông báo hay không, như ví dụ về việc một tính năng nhìn đơn giản lại mất nhiều thời gian phát triển. Flowchart gốc có hàng chục nhánh. Hình dưới rút gọn những câu hỏi tiêu biểu.</p>
${diagram({
  w: 720, h: 380,
  nodes: [
    { id: 'm', label: 'Tin nhắn mới', x: 80, y: 60, w: 110, kind: 'client' },
    { id: 'q1', label: 'Kênh bị\nmute?', x: 260, y: 60, w: 120, h: 56 },
    { id: 'q2', label: 'Đang bật\nDND?', x: 440, y: 60, w: 120, h: 56 },
    { id: 'q3', label: 'Có mention\nhoặc từ khóa?', x: 620, y: 60, w: 130, h: 56 },
    { id: 'no', label: 'Không gửi', x: 260, y: 200, w: 130, kind: 'warn' },
    { id: 'q4', label: 'Đang dùng\ndesktop?', x: 620, y: 200, w: 130, h: 56 },
    { id: 'desk', label: 'Chỉ báo\ntrên desktop', x: 400, y: 320, w: 130, h: 56, kind: 'good' },
    { id: 'push', label: 'Push mobile', x: 620, y: 320, w: 130, kind: 'good' },
  ],
  edges: [
    { from: 'm', to: 'q1' },
    { from: 'q1', to: 'q2', label: 'không' },
    { from: 'q2', to: 'q3', label: 'không' },
    { from: 'q1', to: 'no', label: 'có', kind: 'warn' },
    { from: 'q2', to: 'no', label: 'có', kind: 'warn' },
    { from: 'q3', to: 'no', label: 'không', kind: 'warn' },
    { from: 'q3', to: 'q4', label: 'có' },
    { from: 'q4', to: 'desk', label: 'có' },
    { from: 'q4', to: 'push', label: 'không' },
  ],
  caption: 'Hình: Phiên bản rút gọn của logic quyết định gửi thông báo kiểu Slack. Bản thật còn xét thread đã theo dõi, cài đặt riêng từng kênh, ngoại lệ của DND và độ trễ trước khi push.',
})}
<p>Bài học thiết kế: logic này thuộc distribution service, không nên rải trong từng business service. Nó cần đọc rất nhiều trạng thái (mute, DND, preference, trạng thái online) nên các trạng thái đó phải nằm trong cache nhanh. Thiết kế tốt thì người dùng không nhận ra sự phức tạp; họ chỉ thấy thông báo tới đúng lúc.</p>

<h2>Trade-off chính</h2>
${tbl(['Quyết định', 'Lựa chọn A', 'Lựa chọn B'], [
  ['Đảm bảo giao', 'At-least-once: không mất tin, có thể trùng (cần chống trùng)', 'At-most-once: không trùng, có thể mất. Chấp nhận được cho marketing'],
  ['Queue', 'Một queue chung: đơn giản', 'Queue theo kênh và độ ưu tiên: cô lập lỗi, OTP không bị chặn'],
  ['Preference', 'Đọc database mỗi lần: luôn mới', 'Cache: nhanh nhưng có thể trễ vài giây sau khi người dùng đổi cài đặt'],
])}
${tip('<b>Thực tế.</b> Các nền tảng lớn thường gửi push mobile có độ trễ ngắn sau khi tin nhắn tới: nếu người dùng đọc ngay trên desktop trong khoảng đó thì hủy push. Một bước chờ nhỏ giúp giảm đáng kể số thông báo thừa.')}
${note('<b>Sai lầm thường gặp.</b> Cho business service gọi thẳng API của nhà cung cấp SMS hay email. Khi nhà cung cấp chậm, thread của service chính bị treo theo, và mỗi team lại tự viết logic retry, template, opt-out riêng. Hãy đi qua một hệ thống thông báo tập trung có queue.')}
${interview([
  'Thiết kế hệ thống gửi 10 triệu push trong 5 phút cho một chiến dịch khuyến mãi. Điểm nghẽn nằm ở đâu?',
  'Làm sao đảm bảo người dùng không nhận một OTP hai lần khi business service retry?',
  'Nhà cung cấp SMS chính bị lỗi 30 phút. Hệ thống của bạn phản ứng ra sao?',
  'Registration token của FCM có thể hết hạn. Bạn phát hiện và dọn chúng thế nào?',
])}`,
  keys: [
    'Luồng chuẩn: gateway, distribution service, router (queue), channel service, tracking.',
    'Distribution service xử lý template, preference, chống trùng, giới hạn tần suất và hẹn giờ.',
    'Tách queue theo kênh và độ ưu tiên để lỗi ở một kênh không ảnh hưởng kênh khác.',
    'Push mobile đi qua APNs/FCM bằng registration token; server phải lưu và dọn token cũ.',
    'Logic quyết định có gửi hay không (như Slack) phức tạp và cần trạng thái người dùng trong cache.',
  ],
  quiz: [
    { q: 'Vì sao nên tách message queue theo từng kênh (push, email, SMS)?', o: ['Để tiết kiệm bộ nhớ', 'Để kênh chậm hoặc lỗi không làm tắc các kênh khác', 'Vì nhà cung cấp yêu cầu', 'Để giảm số template'], a: 1, why: 'Cô lập lỗi: queue SMS có dồn thì push và email vẫn được xử lý bình thường, mỗi kênh scale riêng.' },
    { q: 'Trong FCM, registration token dùng để làm gì?', o: ['Xác thực người dùng đăng nhập', 'Định danh một bản cài đặt app để FCM biết gửi tin tới đâu', 'Mã hóa nội dung thông báo', 'Đếm số lần mở thông báo'], a: 1, why: 'FCM sinh token cho từng instance của app; server gửi tin kèm token để FCM định tuyến tới đúng thiết bị.' },
    { q: 'Business service retry một yêu cầu gửi OTP do timeout. Cơ chế nào ngăn người dùng nhận hai OTP?', o: ['Tăng timeout', 'Idempotency key kiểm tra ở distribution service', 'Gửi qua email thay vì SMS', 'Dùng at-most-once cho mọi kênh'], a: 1, why: 'Cùng idempotency key thì yêu cầu thứ hai được nhận ra là trùng và bị bỏ qua.' },
    { q: 'Theo sách, kho nào giúp người dùng định nghĩa sẵn định dạng thông báo?', o: ['Channel preference repository', 'Notification template repository', 'Tracking database', 'Message queue'], a: 1, why: 'Template repository chứa mẫu nội dung; preference repository chứa kênh ưa thích của người dùng.' },
  ],
};

/* ------------------------------------------------------------------ */
/* 3. Thanh toán                                                       */
/* ------------------------------------------------------------------ */
const thanhToan: Lesson = {
  id: 'thanh-toan',
  mod: 'thuc-chien',
  title: 'Thanh toán: hệ sinh thái, Visa và quét QR',
  pages: [72, 85, 68, 286],
  min: 14,
  level: 'trung-binh',
  lede: 'Một lần quẹt thẻ 100 USD đi qua ít nhất năm tổ chức khác nhau, và mỗi bên giữ lại một phần nhỏ. Hiểu ai làm gì trong chuỗi này là điều kiện để thiết kế bất kỳ hệ thống nào chạm tới tiền.',
  body: `
<h2>Các bên trong hệ sinh thái thanh toán thẻ</h2>
<p>Sách đặt câu hỏi: giữa rất nhiều công ty thanh toán, PayPal, Stripe, Square thực sự làm gì? Câu trả lời nằm ở vị trí của họ trong chuỗi. Có hai nửa: <b>phía acquiring</b> phục vụ người bán (merchant), và <b>phía issuing</b> phục vụ chủ thẻ. Ở giữa là <b>card network</b> như Visa, Mastercard.</p>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'ch', label: 'Chủ thẻ', x: 80, y: 70, w: 100, kind: 'client' },
    { id: 'mer', label: 'Merchant', x: 260, y: 70 },
    { id: 'gw', label: 'Payment\ngateway', x: 440, y: 70, h: 56, kind: 'lb' },
    { id: 'acq', label: 'Acquiring\nprocessor', x: 630, y: 70, w: 130, h: 56 },
    { id: 'net', label: 'Card network', sub: 'Visa, Mastercard', x: 630, y: 220, w: 140, kind: 'lb' },
    { id: 'issp', label: 'Issuing\nprocessor', x: 390, y: 220, w: 130, h: 56 },
    { id: 'iss', label: 'Ngân hàng\nphát hành', x: 140, y: 220, w: 130, h: 56, kind: 'store' },
  ],
  edges: [
    { from: 'ch', to: 'iss', label: '0', dashed: true },
    { from: 'ch', to: 'mer', label: '1' },
    { from: 'mer', to: 'gw', label: '2' },
    { from: 'gw', to: 'acq', label: '3' },
    { from: 'acq', to: 'net', label: '4' },
    { from: 'net', to: 'issp', label: '5' },
    { from: 'issp', to: 'iss', label: '6' },
  ],
  caption: 'Hình: Đường đi của một giao dịch thẻ. Nửa trên là phía acquiring (người bán), nửa dưới là phía issuing (chủ thẻ).',
})}
<ol start="0">
<li>Chủ thẻ mở tài khoản tại <b>ngân hàng phát hành</b> (issuing bank) và nhận thẻ debit/credit. Merchant đăng ký với một ISO (Independent Sales Organization) hoặc MSP (Member Service Provider); bên này hợp tác với payment processor để mở merchant account.</li>
<li>Chủ thẻ trả tiền tại cửa hàng hoặc nhập thẻ khi mua online.</li>
<li><b>Payment gateway</b> nhận giao dịch và thu thập thông tin thanh toán một cách an toàn.</li>
<li>Gateway chuyển cho <b>acquiring processor</b>. Bên này vận hành tài khoản của merchant trong quá trình quyết toán, vốn không diễn ra theo thời gian thực.</li>
<li>Acquiring processor gửi giao dịch vào <b>card network</b>.</li>
<li>Network định tuyến tới <b>issuing processor</b>, bên thay mặt ngân hàng phát hành nói chuyện với network.</li>
<li>Issuing processor kiểm tra và vận hành tài khoản khách hàng: còn hạn mức không, có dấu hiệu gian lận không.</li>
</ol>
<p>Sách lưu ý các công ty thanh toán thường bắt đầu từ một mảng rồi mở rộng sang các mảng khác. Ví dụ phổ biến: Stripe khởi đầu như gateway cho lập trình viên rồi làm cả processing và phát hành thẻ; Square đi từ đầu đọc thẻ cho cửa hàng nhỏ.</p>

<h2>Vòng đời một giao dịch: authorization tới settlement</h2>
<p>Khi bạn quẹt thẻ, tiền chưa chuyển ngay. Giao dịch đi qua bốn giai đoạn với tốc độ rất khác nhau:</p>
${tbl(['Giai đoạn', 'Diễn ra khi nào', 'Việc gì xảy ra'], [
  ['Authorization', 'Thời gian thực, 1–3 giây', 'Issuer kiểm tra hạn mức, gian lận và <b>giữ</b> (hold) số tiền. Chưa có tiền nào di chuyển.'],
  ['Capture', 'Ngay hoặc sau (khách sạn, giao hàng)', 'Merchant xác nhận muốn lấy số tiền đã giữ, thường gom thành lô cuối ngày.'],
  ['Clearing', 'Theo lô, thường trong ngày', 'Network trao đổi file chi tiết giao dịch giữa acquirer và issuer, tính phí.'],
  ['Settlement', 'T+1 tới T+2', 'Tiền thực sự chuyển: issuer trả acquirer qua network, acquirer trả merchant sau khi trừ phí.'],
])}
${seq({
  actors: [
    { id: 'm', label: 'Merchant', kind: 'client' },
    { id: 'a', label: 'Acquirer' },
    { id: 'v', label: 'Visa', kind: 'lb' },
    { id: 'i', label: 'Issuer', kind: 'store' },
  ],
  msgs: [
    { from: 'm', to: 'a', label: 'auth request $100' },
    { from: 'a', to: 'v', label: 'chuyển tiếp' },
    { from: 'v', to: 'i', label: 'kiểm tra hạn mức' },
    { from: 'i', to: 'v', label: 'approve + mã auth', dashed: true, kind: 'good' },
    { from: 'v', to: 'a', label: 'approve', dashed: true, kind: 'good' },
    { from: 'a', to: 'm', label: 'approve, tiền bị giữ', dashed: true, kind: 'good' },
    { note: 'Cuối ngày: merchant gửi lô capture' },
    { from: 'm', to: 'a', label: 'capture batch' },
    { from: 'a', to: 'v', label: 'clearing file' },
    { from: 'v', to: 'i', label: 'ghi nợ chủ thẻ' },
    { from: 'i', to: 'a', label: 'settlement $98,25', dashed: true },
    { from: 'a', to: 'm', label: 'trả $98', dashed: true },
  ],
  caption: 'Hình: Authorization chạy trong vài giây; capture, clearing và settlement chạy theo lô sau đó. Số tiền nhận được giảm dần vì mỗi bên giữ lại phí.',
})}

<h2>Visa kiếm tiền thế nào</h2>
<p>Sách dùng ví dụ chủ thẻ trả 100 USD. Merchant được lợi từ việc chấp nhận thẻ (bán được nhiều hơn) nên phải trả phí cho các bên cung cấp dịch vụ. Acquiring bank thu của merchant một khoản gọi là <b>merchant discount fee</b>, trong ví dụ là 2 USD.</p>
${tbl(['Khoản', 'Ai nhận', 'Ví dụ trên $100', 'Ghi chú'], [
  ['Merchant discount fee', 'Acquiring bank thu từ merchant', '$2,00', 'Merchant thực nhận khoảng $98'],
  ['Acquiring markup', 'Acquiring bank giữ lại', '$0,25', 'Phần lời của bên phục vụ merchant'],
  ['Interchange fee', 'Issuing bank', '$1,75', 'Do card network quy định, vì mỗi issuer tự đàm phán với từng merchant thì kém hiệu quả'],
  ['Network assessment', 'Visa/Mastercard thu từ các ngân hàng', 'Ví dụ Visa: 0,11% + $0,0195 mỗi lần quẹt', 'Thu hằng tháng từ mỗi ngân hàng'],
  ['Lãi, phí thường niên', 'Issuing bank thu từ chủ thẻ', 'Tùy hợp đồng', 'Chủ thẻ trả cho dịch vụ của issuer'],
])}
<p>Vì sao issuer được phần lớn nhất? Sách nêu ba lý do: issuer trả tiền cho merchant kể cả khi chủ thẻ không trả nợ; issuer trả trước khi chủ thẻ trả; và issuer gánh chi phí vận hành như quản lý tài khoản, sao kê, phát hiện gian lận, quản lý rủi ro, clearing và settlement. Visa không cho vay và không chịu rủi ro tín dụng; doanh thu của Visa đến từ phí mạng trên khối lượng giao dịch khổng lồ.</p>

<h2>Quét QR để trả bằng ví điện tử</h2>
<p>Với ví như PayPal, Venmo, Paytm, sách chia quy trình thành hai phần: merchant sinh và hiển thị mã QR, rồi người mua quét và trả. Ví dụ: tổng hóa đơn 123,45 USD, mã đơn SN129803.</p>
${seq({
  actors: [
    { id: 'w', label: 'Ví (app)', kind: 'client' },
    { id: 'pos', label: 'Quầy thu ngân' },
    { id: 'gw', label: 'PSP gateway', kind: 'lb' },
    { id: 'db', label: 'PSP database', kind: 'store' },
  ],
  msgs: [
    { from: 'pos', to: 'gw', label: 'SN129803, $123.45' },
    { from: 'gw', to: 'db', label: 'lưu đơn, sinh QR URL' },
    { from: 'gw', to: 'pos', label: 'QR URL', dashed: true },
    { note: 'Quầy hiển thị QR. Bảy bước sinh mã xong trong chưa tới 1 giây' },
    { from: 'w', to: 'pos', label: 'quét QR', dashed: true },
    { note: 'Người mua kiểm tra số tiền và bấm Pay' },
    { from: 'w', to: 'gw', label: 'đã trả QR này' },
    { from: 'gw', to: 'db', label: 'đánh dấu đã trả' },
    { from: 'gw', to: 'w', label: 'thành công', dashed: true, kind: 'good' },
    { from: 'gw', to: 'pos', label: 'báo đã thanh toán', kind: 'good' },
  ],
  caption: 'Hình: Scan to pay. QR chỉ chứa URL trỏ tới đơn đã lưu ở PSP (payment service provider), nên số tiền không thể bị sửa phía người mua.',
})}
<p>Điểm thiết kế đáng chú ý: mã QR được sinh động cho từng đơn và chỉ mang một tham chiếu. Mọi trạng thái nằm ở PSP. Thông báo cho merchant (bước cuối) nên có cả hai đường: push qua kết nối đang mở hoặc webhook, và cho phép quầy polling trạng thái phòng khi mất thông báo.</p>

<h2>Idempotency: không bao giờ trừ tiền hai lần</h2>
<p>Mạng có thể rớt đúng lúc phản hồi đang trên đường về. Client không biết giao dịch đã thành công hay chưa nên retry. Nếu server xử lý lại từ đầu, khách bị trừ tiền hai lần. Cách giải chuẩn là <b>idempotency key</b>: client sinh một ID duy nhất cho mỗi ý định thanh toán (ví dụ UUID) và gửi kèm mọi lần retry.</p>
${tbl(['Kỹ thuật', 'Cách làm'], [
  ['Idempotency key', 'Header như <code>Idempotency-Key</code>. Server lưu key cùng kết quả; gặp lại key thì trả kết quả cũ, không xử lý lại.'],
  ['Ràng buộc unique', 'Cột <code>idempotency_key</code> có unique index trong database, hai request đồng thời chỉ một bên ghi được.'],
  ['Máy trạng thái', 'Giao dịch đi theo các trạng thái rõ ràng (created, authorized, captured, refunded); chỉ cho phép chuyển trạng thái hợp lệ.'],
  ['Đối soát', 'Hằng ngày so sổ nội bộ với file settlement của PSP/ngân hàng để phát hiện lệch.'],
])}
${tip('<b>Thực tế ở Việt Nam.</b> VietQR dùng chung chuẩn cho các ngân hàng: mã chứa mã ngân hàng, số tài khoản và có thể kèm số tiền, nội dung. QR tĩnh dán ở quầy thì người mua tự nhập số tiền; QR động sinh theo từng đơn giống mô hình trong sách, giúp đối soát tự động theo mã đơn.')}
${note('<b>Sai lầm thường gặp.</b> Lưu số tiền bằng kiểu <code>float</code>. 0,1 + 0,2 không bằng 0,3 trong số thực dấu phẩy động. Hãy lưu số nguyên theo đơn vị nhỏ nhất (cent, đồng) hoặc dùng kiểu decimal.')}
${interview([
  'Phân biệt authorization, capture, clearing và settlement. Vì sao khách sạn chỉ authorize khi nhận phòng?',
  'Thiết kế API thanh toán sao cho client retry thoải mái mà không trừ tiền hai lần.',
  'Trong luồng quét QR, nếu thông báo "đã thanh toán" tới quầy bị mất thì xử lý thế nào?',
  'Vì sao interchange fee do card network quy định thay vì để từng ngân hàng đàm phán?',
])}`,
  keys: [
    'Phía acquiring phục vụ merchant, phía issuing phục vụ chủ thẻ, card network ở giữa.',
    'Authorization chạy thời gian thực; capture, clearing, settlement chạy theo lô, tiền về sau T+1 hoặc T+2.',
    'Trên $100, merchant trả khoảng $2; issuer nhận interchange $1,75, acquirer giữ $0,25, Visa thu phí mạng.',
    'Scan to pay: QR động chỉ chứa tham chiếu tới đơn đã lưu ở PSP.',
    'Idempotency key và ràng buộc unique ngăn trừ tiền hai lần khi retry.',
  ],
  quiz: [
    { q: 'Trong ví dụ $100 của sách, phần lớn nhất của merchant discount fee thuộc về ai?', o: ['Card network', 'Acquiring bank', 'Issuing bank (interchange fee)', 'Payment gateway'], a: 2, why: 'Issuer nhận $1,75 interchange fee; acquirer giữ $0,25; card network thu assessment riêng từ các ngân hàng.' },
    { q: 'Giai đoạn nào chỉ giữ tiền trong tài khoản chủ thẻ mà chưa chuyển tiền?', o: ['Authorization', 'Clearing', 'Settlement', 'Payout'], a: 0, why: 'Authorization kiểm tra và giữ hạn mức. Tiền chỉ thực sự di chuyển ở settlement.' },
    { q: 'Client gửi lệnh thanh toán, bị timeout và gửi lại. Cơ chế nào ngăn trừ tiền hai lần?', o: ['Tăng timeout', 'Idempotency key gửi kèm mọi lần retry', 'Dùng HTTP GET', 'Mã hóa TLS'], a: 1, why: 'Server nhận ra key đã xử lý và trả kết quả cũ thay vì tạo giao dịch mới.' },
    { q: 'Trong luồng scan to pay của sách, mã QR do ai sinh ra?', o: ['Ví điện tử của người mua', 'PSP, sau khi lưu mã đơn và số tiền', 'Card network', 'Ngân hàng phát hành'], a: 1, why: 'Máy tính thu ngân gửi mã đơn và số tiền tới PSP; PSP lưu lại và sinh QR URL trả về quầy.' },
  ],
};

/* ------------------------------------------------------------------ */
/* 4. Search engine                                                    */
/* ------------------------------------------------------------------ */
const searchEngine: Lesson = {
  id: 'search-engine',
  mod: 'thuc-chien',
  title: 'Công cụ tìm kiếm hoạt động thế nào',
  pages: [70, 355, 233],
  min: 13,
  level: 'trung-binh',
  lede: 'Gõ vài từ và nhận kết quả từ hàng tỉ trang trong chưa tới nửa giây. Bí quyết nằm ở chỗ gần như mọi việc nặng đã được làm trước: thu thập, phân tích và lập chỉ mục từ lâu trước khi bạn bấm Enter.',
  body: `
<h2>Bốn bước của một search engine</h2>
<p>Sách chia hoạt động của search engine thành bốn bước. Ba bước đầu chạy <b>offline</b>, liên tục ở phía sau. Chỉ bước cuối chạy <b>online</b> khi người dùng gõ truy vấn.</p>
${tbl(['Bước', 'Chạy khi nào', 'Việc chính'], [
  ['1. Crawling', 'Liên tục, offline', 'Crawler đi theo link từ trang này sang trang khác, lưu URL vào URL store, phát hiện trang web, ảnh, video, file mới.'],
  ['2. Indexing', 'Sau khi crawl, offline', 'Phân tích nội dung trang: từ khóa, chất lượng site, độ mới. Ghi vào chỉ mục để tra cứu nhanh.'],
  ['3. Ranking', 'Tính trước một phần, hoàn tất lúc truy vấn', 'Xếp thứ tự theo độ liên quan, chất lượng nội dung, tương tác người dùng, tốc độ tải trang; có thể cá nhân hóa theo lịch sử, vị trí, thiết bị.'],
  ['4. Querying', 'Online, mỗi lần tìm', 'Tra chỉ mục, lấy ứng viên, xếp hạng và trả về kết quả liên quan nhất.'],
])}

<h2>Yêu cầu và ước lượng</h2>
<p>Yêu cầu chức năng: tìm theo từ khóa, trả về tiêu đề, URL và đoạn trích (snippet), gợi ý khi gõ. Phi chức năng: latency p99 dưới vài trăm mili giây, dữ liệu đủ mới (tin tức cần vào chỉ mục trong vài phút), chịu lỗi khi một phần cụm hỏng.</p>
<p>Giả sử chỉ mục chứa 10 tỉ trang, mỗi trang sau khi nén còn khoảng 20 KB nội dung văn bản. Riêng nội dung thô đã cỡ 200 TB, chưa tính chỉ mục và bản sao. Nếu có 8 tỉ truy vấn mỗi ngày thì trung bình gần 100.000 truy vấn mỗi giây. Không máy nào chứa nổi chỉ mục này, nên chỉ mục phải được chia thành nhiều <b>shard</b> và mỗi truy vấn được hỏi song song trên tất cả shard.</p>

<h2>Đường ống offline: crawl và index</h2>
${diagram({
  w: 720, h: 270,
  nodes: [
    { id: 'seed', label: 'Seed URL', x: 80, y: 70, w: 100, kind: 'client' },
    { id: 'fr', label: 'URL\nfrontier', x: 260, y: 70, w: 120, h: 56, kind: 'queue' },
    { id: 'cr', label: 'Crawler', sub: 'tôn trọng robots.txt', x: 450, y: 70, w: 150 },
    { id: 'web', label: 'Web', sub: 'hàng tỉ trang', x: 640, y: 70, w: 110, kind: 'external' },
    { id: 'raw', label: 'Kho trang thô', x: 630, y: 205, w: 130, kind: 'store' },
    { id: 'px', label: 'Parser,\nindexer', x: 450, y: 205, h: 56 },
    { id: 'idx', label: 'Inverted index', x: 250, y: 205, w: 140, kind: 'store' },
  ],
  edges: [
    { from: 'seed', to: 'fr', label: '1' },
    { from: 'fr', to: 'cr', label: '2' },
    { from: 'cr', to: 'web', label: '3', both: true },
    { from: 'cr', to: 'raw', label: '4' },
    { from: 'raw', to: 'px', label: '5' },
    { from: 'px', to: 'idx', label: '6' },
    { from: 'px', to: 'fr', label: '7', dashed: true },
  ],
  caption: 'Hình: (1–2) URL frontier quyết định trang nào crawl tiếp; (3–4) crawler tải trang và lưu bản thô; (5–6) parser trích nội dung, cập nhật inverted index; (7) link mới tìm được quay lại frontier.',
})}
<p><b>URL frontier</b> là hàng đợi có ưu tiên: trang tin tức đổi liên tục được crawl lại thường xuyên hơn trang giới thiệu công ty. Frontier cũng đảm bảo <b>lịch sự</b> (politeness): không gửi quá nhiều request tới cùng một domain trong thời gian ngắn, và tôn trọng <code>robots.txt</code>. Trước khi index, hệ thống loại trang trùng nội dung bằng checksum hoặc SimHash, vì một tỉ lệ lớn trang web là bản sao của nhau.</p>

<h2>Inverted index: trái tim của tìm kiếm</h2>
<p>Chỉ mục thông thường đi từ tài liệu tới nội dung. <b>Inverted index</b> đảo ngược chiều đó: với mỗi từ (term), lưu danh sách tài liệu chứa từ đó, gọi là <b>posting list</b>. Khi tìm "cache database", engine lấy posting list của hai từ rồi giao nhau, thay vì quét hàng tỉ trang.</p>
${diagram({
  w: 720, h: 370,
  nodes: [
    { id: 'd1', label: 'D1: đọc cache\nrất nhanh', x: 150, y: 95, w: 180, h: 56, kind: 'client' },
    { id: 'd2', label: 'D2: cache và\ndatabase', x: 150, y: 185, w: 180, h: 56, kind: 'client' },
    { id: 'd3', label: 'D3: đọc từ\ndatabase', x: 150, y: 275, w: 180, h: 56, kind: 'client' },
    { id: 't1', label: 'cache', sub: 'D1, D2', x: 570, y: 50, w: 150, kind: 'store' },
    { id: 't2', label: 'nhanh', sub: 'D1', x: 570, y: 140, w: 150, kind: 'store' },
    { id: 't3', label: 'đọc', sub: 'D1, D3', x: 570, y: 230, w: 150, kind: 'store' },
    { id: 't4', label: 'database', sub: 'D2, D3', x: 570, y: 320, w: 150, kind: 'store' },
  ],
  edges: [
    { from: 'd1', to: 't1', kind: 'muted' },
    { from: 'd1', to: 't2', kind: 'muted' },
    { from: 'd1', to: 't3', kind: 'muted' },
    { from: 'd2', to: 't1', kind: 'muted' },
    { from: 'd2', to: 't4', kind: 'muted' },
    { from: 'd3', to: 't3', kind: 'muted' },
    { from: 'd3', to: 't4', kind: 'muted' },
  ],
  caption: 'Hình: Ba tài liệu được tách từ, bỏ stop word ("rất", "và", "từ") và ghi vào inverted index. Truy vấn "cache database" giao hai posting list và trả về D2.',
})}
<p>Trong thực tế, mỗi mục trong posting list còn lưu số lần xuất hiện và vị trí của từ để hỗ trợ tìm cụm từ chính xác và tính điểm. Posting list được sắp xếp theo ID và nén (delta encoding) để vừa trong RAM hoặc SSD. Quá trình phân tích văn bản gồm tách từ, đưa về chữ thường, bỏ dấu nếu cần và đưa về từ gốc (stemming), nên "Running" và "run" khớp nhau.</p>

<h2>Xếp hạng</h2>
<p>Tìm được tài liệu chứa từ khóa mới là bước một; có thể có hàng triệu kết quả. Xếp hạng thường gồm hai tầng. Tầng đầu dùng công thức rẻ như <b>TF-IDF</b> hoặc <b>BM25</b>: từ xuất hiện nhiều trong tài liệu thì điểm cao, nhưng từ phổ biến ở mọi tài liệu thì ít giá trị. Tầng sau chỉ lấy vài trăm ứng viên tốt nhất và dùng mô hình học máy kết hợp nhiều tín hiệu sách liệt kê: chất lượng nội dung, độ uy tín qua liên kết (ý tưởng PageRank), tương tác người dùng, tốc độ tải, độ mới và tín hiệu cá nhân hóa.</p>

<h2>Phục vụ truy vấn online</h2>
${diagram({
  w: 720, h: 300,
  nodes: [
    { id: 'u', label: 'Người dùng', x: 80, y: 150, w: 110, kind: 'client' },
    { id: 'agg', label: 'Aggregator', sub: 'fan-out / fan-in', x: 270, y: 150, w: 140, kind: 'lb' },
    { id: 'rc', label: 'Result cache', x: 270, y: 45, w: 130, kind: 'cache' },
    { id: 'rr', label: 'Re-ranker', sub: 'ML, cá nhân hóa', x: 270, y: 255, w: 140 },
    { id: 's1', label: 'Index shard 1', x: 560, y: 60, w: 150, kind: 'store' },
    { id: 's2', label: 'Index shard 2', x: 560, y: 150, w: 150, kind: 'store' },
    { id: 's3', label: 'Index shard N', x: 560, y: 240, w: 150, kind: 'store' },
  ],
  edges: [
    { from: 'u', to: 'agg', label: '1', both: true },
    { from: 'agg', to: 'rc', label: '2' },
    { from: 'agg', to: 's1', both: true },
    { from: 'agg', to: 's2', label: '3', both: true },
    { from: 'agg', to: 's3', both: true },
    { from: 'agg', to: 'rr', label: '4' },
  ],
  caption: 'Hình: (1) truy vấn tới aggregator; (2) kiểm tra cache truy vấn phổ biến; (3) hỏi song song mọi shard, mỗi shard trả top-K của nó; (4) trộn và xếp hạng lại rồi trả kết quả.',
})}
<p>Chỉ mục được chia theo tài liệu (document-partitioned): mỗi shard giữ trọn chỉ mục của một phần tài liệu. Mỗi shard trả về top-K cục bộ, aggregator trộn lại thành top-K toàn cục. Vì truy vấn phải chờ shard chậm nhất, latency đuôi (p99) của từng shard quyết định latency chung. Kỹ thuật phổ biến là mỗi shard có nhiều replica và gửi request dự phòng (hedged request) khi một replica phản hồi chậm. Truy vấn phổ biến như "thời tiết" được trả thẳng từ result cache.</p>

<h2>Elasticsearch: search engine bạn tự vận hành</h2>
<p>Elasticsearch xây trên thư viện Lucene, cũng dùng inverted index, tự chia index thành shard và replica trên nhiều node. Tài liệu mới có thể tìm thấy sau khoảng một giây (near real-time). Sách liệt kê sáu trường hợp dùng phổ biến:</p>
${tbl(['Use case', 'Ví dụ'], [
  ['Full-text search', 'Tìm sản phẩm, bài viết với truy vấn phức tạp, phản hồi gần thời gian thực'],
  ['Phân tích thời gian thực', 'Dashboard theo dõi hoạt động người dùng, giao dịch, dữ liệu cảm biến'],
  ['Machine learning', 'Tính năng ML trong X-Pack tự phát hiện bất thường, mẫu và xu hướng'],
  ['Dữ liệu địa lý', 'Chỉ mục geo cho bản đồ, tìm cửa hàng gần nhất'],
  ['Phân tích log và sự kiện', 'ELK stack (Elasticsearch, Logstash, Kibana) gom log từ mọi service'],
  ['SIEM', 'Phân tích sự kiện bảo mật theo thời gian thực'],
])}
${tip('<b>Thực tế.</b> Nhiều trang thương mại điện tử giữ dữ liệu gốc trong PostgreSQL hoặc MySQL và đồng bộ sang Elasticsearch qua CDC hoặc message queue. Database lo tính đúng, Elasticsearch lo tìm nhanh. Chấp nhận kết quả tìm kiếm trễ vài giây so với dữ liệu gốc.')}
${note('<b>Sai lầm thường gặp.</b> Dùng <code>LIKE \'%từ khóa%\'</code> trên database quan hệ cho chức năng tìm kiếm. Câu này không dùng được B-tree index, phải quét toàn bảng, và không có khái niệm độ liên quan. Khi dữ liệu lớn hoặc cần xếp hạng, hãy dùng full-text index hoặc search engine riêng.')}
${interview([
  'Inverted index là gì? Vì sao tìm kiếm trên nó nhanh hơn quét toàn bộ tài liệu?',
  'Thiết kế web crawler crawl 1 tỉ trang mỗi tháng. Làm sao tránh crawl trùng và tránh làm sập website người khác?',
  'Chỉ mục quá lớn cho một máy. Bạn chia shard theo tài liệu hay theo từ? Ưu nhược điểm?',
  'Một shard phản hồi chậm làm cả truy vấn chậm theo. Bạn xử lý thế nào?',
])}`,
  keys: [
    'Search engine gồm crawling, indexing, ranking (offline) và querying (online).',
    'Inverted index ánh xạ từ sang danh sách tài liệu chứa từ đó.',
    'Xếp hạng hai tầng: BM25/TF-IDF lọc nhanh, mô hình học máy xếp lại với nhiều tín hiệu.',
    'Chỉ mục chia shard; truy vấn fan-out tới mọi shard rồi trộn top-K, nên latency đuôi rất quan trọng.',
    'Elasticsearch phổ biến cho full-text search, phân tích log (ELK), dữ liệu địa lý và SIEM.',
  ],
  quiz: [
    { q: 'Inverted index lưu gì?', o: ['Với mỗi tài liệu, danh sách từ trong nó', 'Với mỗi từ, danh sách tài liệu chứa từ đó', 'Bản sao nén của mọi trang', 'Danh sách URL cần crawl'], a: 1, why: 'Đảo ngược chiều tài liệu → từ thành từ → tài liệu (posting list), nhờ đó tra theo từ khóa rất nhanh.' },
    { q: 'Bước nào trong bốn bước của sách chạy online mỗi khi người dùng tìm kiếm?', o: ['Crawling', 'Indexing', 'Querying', 'Cả bốn bước'], a: 2, why: 'Crawling và indexing chạy nền liên tục; querying chạy khi có truy vấn, tra cứu chỉ mục đã dựng sẵn.' },
    { q: 'URL frontier cần đảm bảo "politeness" nghĩa là gì?', o: ['Chỉ crawl trang có HTTPS', 'Không gửi quá nhiều request tới cùng một domain và tôn trọng robots.txt', 'Ưu tiên trang có nhiều quảng cáo', 'Xóa trang trùng lặp'], a: 1, why: 'Crawler phải tránh làm quá tải website khác và tuân thủ quy định chủ site đưa ra.' },
    { q: 'ELK stack gồm những thành phần nào?', o: ['Elasticsearch, Logstash, Kibana', 'Etcd, Linkerd, Kubernetes', 'Elasticsearch, Lucene, Kafka', 'Envoy, Lambda, Kinesis'], a: 0, why: 'ELK là bộ ba phổ biến để thu thập (Logstash), lưu và tìm kiếm (Elasticsearch), hiển thị (Kibana) log.' },
  ],
};

/* ------------------------------------------------------------------ */
/* 5. Live streaming                                                   */
/* ------------------------------------------------------------------ */
const liveStreaming: Lesson = {
  id: 'live-streaming',
  mod: 'thuc-chien',
  title: 'Nền tảng livestream (YouTube Live, Twitch)',
  pages: [80],
  min: 13,
  level: 'trung-binh',
  lede: 'Livestream khó vì ba lý do cùng lúc: video phải tới người xem gần như thời gian thực, xử lý video rất tốn CPU, và lượng dữ liệu gửi qua internet cực lớn. Kiến trúc của mọi nền tảng livestream đều xoay quanh việc cân bằng ba thứ đó.',
  body: `
<h2>Yêu cầu</h2>
${cols([
  { title: 'Chức năng', body: '<ul><li>Streamer phát từ OBS, điện thoại, máy quay.</li><li>Người xem xem trên web, mobile, TV với chất lượng phù hợp mạng của họ.</li><li>Xem lại (replay) sau khi buổi phát kết thúc.</li><li>Chat trực tiếp đi kèm (thường là hệ thống riêng qua WebSocket).</li></ul>' },
  { title: 'Phi chức năng', body: '<ul><li>Độ trễ từ camera tới màn hình người xem (glass-to-glass) vài giây tới vài chục giây tùy sản phẩm.</li><li>Phát mượt, ít giật khi mạng người xem dao động.</li><li>Một kênh có thể có hàng triệu người xem cùng lúc.</li></ul>' },
])}

<h2>Ước lượng nhanh</h2>
<p>Giả sử 10.000 kênh đang phát, mỗi kênh gửi lên 6 Mbps: tổng băng thông vào khoảng 60 Gbps, xử lý được trong vài data center. Phía người xem, 2 triệu người xem trung bình 3 Mbps là 6 Tbps băng thông ra. Không data center nào phục vụ trực tiếp nổi con số này, nên CDN là bắt buộc. Transcoding cũng nặng: mỗi kênh cần mã hóa lại thành 4–5 độ phân giải theo thời gian thực, tức hàng chục nghìn tác vụ encode chạy liên tục.</p>

<h2>Kiến trúc tổng thể</h2>
${diagram({
  w: 720, h: 280,
  nodes: [
    { id: 'st', label: 'Streamer', sub: 'encoder, OBS', x: 80, y: 70, w: 110, kind: 'client' },
    { id: 'pop', label: 'PoP ingest', sub: 'RTMP / SRT', x: 260, y: 70, w: 120, kind: 'lb' },
    { id: 'tc', label: 'Transcoder', sub: '1080p … 360p', x: 445, y: 70, w: 130 },
    { id: 'pk', label: 'Packager', sub: 'HLS / DASH', x: 630, y: 70, w: 120 },
    { id: 'or', label: 'Origin', sub: 'manifest + chunk', x: 445, y: 210, w: 140, kind: 'store' },
    { id: 's3', label: 'Lưu replay', sub: 'S3', x: 630, y: 210, w: 120, kind: 'store' },
    { id: 'cdn', label: 'CDN edge', x: 260, y: 210, w: 120, kind: 'lb' },
    { id: 'v', label: 'Người xem', sub: 'player ABR', x: 80, y: 210, w: 110, kind: 'client' },
  ],
  edges: [
    { from: 'st', to: 'pop', label: '1' },
    { from: 'pop', to: 'tc', label: '2' },
    { from: 'tc', to: 'pk', label: '3' },
    { from: 'pk', to: 'or', label: '4' },
    { from: 'pk', to: 's3', label: '7', dashed: true },
    { from: 'or', to: 'cdn', label: '5' },
    { from: 'cdn', to: 'v', label: '6' },
  ],
  caption: 'Hình: Đường đi của video livestream: ingest, transcode, đóng gói thành segment, phân phối qua CDN, và lưu lại để xem lại.',
})}
<ol>
<li><b>Streamer bắt đầu phát.</b> Nguồn có thể là bất kỳ thiết bị hình và tiếng nào nối vào một encoder. Encoder nén video (thường H.264) và đẩy lên bằng RTMP.</li>
<li>Để upload ổn định, nền tảng đặt <b>point-of-presence (PoP)</b> khắp thế giới; streamer kết nối tới PoP gần nhất, sau đó luồng đi trên mạng nội bộ của nền tảng về trung tâm xử lý.</li>
<li><b>Transcoder</b> mã hóa lại luồng vào thành nhiều độ phân giải và bitrate, rồi cắt thành các segment dài vài giây.</li>
<li><b>Packager</b> đóng gói segment theo định dạng player hiểu được. Phổ biến nhất là <b>HLS</b> (HTTP Live Streaming): một file manifest <code>.m3u8</code> liệt kê các segment.</li>
<li>Manifest và segment được <b>CDN cache</b>. Vì một segment giống hệt nhau cho mọi người xem, tỉ lệ cache hit rất cao.</li>
<li>Video tới <b>player</b> của người xem qua HTTP thông thường.</li>
<li>Để hỗ trợ xem lại, segment có thể được lưu vào kho như Amazon S3 (sách gọi là bước 7–8).</li>
</ol>

<h2>Đào sâu 1: vì sao cắt thành segment qua HTTP</h2>
<p>RTMP tiện cho chiều lên vì giữ một kết nối liên tục. Chiều xuống thì khác: hàng triệu người xem giữ kết nối riêng tới server là cực kỳ tốn kém. Khi video được cắt thành file nhỏ và phục vụ qua HTTP, mọi hạ tầng web sẵn có đều dùng được: CDN, cache, load balancer, tường lửa doanh nghiệp. Đó là lý do HLS và DASH thống trị phía phát tới người xem.</p>
${tbl(['Giao thức', 'Vai trò', 'Đặc điểm'], [
  ['RTMP', 'Ingest (streamer → nền tảng)', 'Chạy trên TCP, encoder nào cũng hỗ trợ, gần như không còn dùng để phát tới người xem'],
  ['SRT', 'Ingest qua mạng kém', 'Dựa trên UDP, có cơ chế gửi lại gói, chịu mất gói tốt hơn'],
  ['HLS', 'Phát tới người xem', 'Do Apple đề xuất, manifest <code>.m3u8</code> + segment, chạy trên mọi thiết bị'],
  ['MPEG-DASH', 'Phát tới người xem', 'Chuẩn mở, ý tưởng tương tự HLS'],
  ['WebRTC', 'Tương tác độ trễ dưới 1 giây', 'Kết nối gần peer-to-peer, khó scale tới hàng triệu người xem'],
])}

<h2>Đào sâu 2: adaptive bitrate</h2>
<p>Transcoder tạo ra một <b>bitrate ladder</b>, ví dụ 1080p khoảng 6 Mbps, 720p khoảng 3 Mbps, 480p khoảng 1,5 Mbps, 360p dưới 1 Mbps. Master manifest liệt kê tất cả. Player tự đo băng thông và độ đầy buffer, rồi chọn chất lượng cho từng segment tiếp theo. Mạng yếu đi thì tụt chất lượng thay vì dừng hình để tải.</p>
${seq({
  actors: [
    { id: 'p', label: 'Player', kind: 'client' },
    { id: 'c', label: 'CDN edge', kind: 'lb' },
    { id: 'o', label: 'Origin', kind: 'store' },
  ],
  msgs: [
    { from: 'p', to: 'c', label: 'GET master.m3u8' },
    { from: 'c', to: 'o', label: 'miss: lấy manifest' },
    { from: 'o', to: 'c', label: 'manifest', dashed: true },
    { from: 'c', to: 'p', label: 'các mức 1080p, 720p, 480p', dashed: true },
    { from: 'p', to: 'c', label: 'GET 720p/seg_101.ts' },
    { from: 'c', to: 'p', label: 'segment 2 giây (cache hit)', dashed: true, kind: 'good' },
    { note: 'Băng thông giảm, buffer chỉ còn 3 giây' },
    { from: 'p', to: 'c', label: 'GET 480p/seg_102.ts', kind: 'warn' },
    { from: 'p', to: 'c', label: 'tải lại playlist live' },
    { note: 'Playlist live thêm segment mới sau mỗi chu kỳ' },
  ],
  caption: 'Hình: Adaptive bitrate. Player chủ động đổi chất lượng theo từng segment; server và CDN không cần biết gì về người xem.',
})}

<h2>Đào sâu 3: độ trễ đến từ đâu</h2>
<p>Độ trễ glass-to-glass là tổng của nhiều chặng: encode ở máy streamer, upload, transcode, chờ đủ một segment, phân phối qua CDN, và buffer ở player. Chặng lớn nhất thường là segment và buffer: player thường giữ sẵn khoảng ba segment để chống giật, nên segment 6 giây dễ tạo độ trễ 20 giây trở lên.</p>
${diagram({
  w: 720, h: 250,
  nodes: [
    { id: 'enc', label: 'Encode', sub: '~0,5 giây', x: 100, y: 60, w: 130 },
    { id: 'up', label: 'Upload, ingest', sub: '~0,5 giây', x: 330, y: 60, w: 150 },
    { id: 'tc', label: 'Transcode, cắt', sub: '≈ 1 segment', x: 570, y: 60, w: 150 },
    { id: 'cdn', label: 'CDN', sub: '~0,2 giây', x: 570, y: 190, w: 150, kind: 'lb' },
    { id: 'buf', label: 'Buffer player', sub: '≈ 3 segment', x: 330, y: 190, w: 150, kind: 'warn' },
    { id: 'eye', label: 'Màn hình', sub: 'người xem', x: 100, y: 190, w: 130, kind: 'client' },
  ],
  edges: [
    { from: 'enc', to: 'up' },
    { from: 'up', to: 'tc' },
    { from: 'tc', to: 'cdn' },
    { from: 'cdn', to: 'buf' },
    { from: 'buf', to: 'eye' },
  ],
  caption: 'Hình: Các chặng tạo nên độ trễ glass-to-glass. Với segment 6 giây, riêng chặng cắt segment và buffer đã chiếm khoảng 24 giây.',
})}
${tbl(['Cách làm', 'Độ trễ điển hình', 'Đánh đổi'], [
  ['HLS/DASH thường, segment 6 giây', '15–30 giây', 'Rẻ, ổn định nhất, cache hiệu quả'],
  ['Segment ngắn 2 giây', '6–10 giây', 'Nhiều request hơn, nén kém hơn một chút'],
  ['Low-latency HLS / DASH (chunk nhỏ trong segment)', '2–5 giây', 'Player và CDN phải hỗ trợ, cấu hình phức tạp hơn'],
  ['WebRTC', 'Dưới 1 giây', 'Đắt, khó scale, phù hợp đấu giá, gọi video, tương tác trực tiếp'],
])}
${tip('<b>Ví dụ tính toán.</b> Một buổi phát game có chat sôi nổi: người xem hỏi, streamer trả lời. Độ trễ 25 giây làm cuộc trò chuyện vô nghĩa, nên các nền tảng game ưu tiên chế độ low-latency. Ngược lại một trận bóng đá phát cho hàng triệu người thì ổn định quan trọng hơn, chấp nhận trễ 20–30 giây.')}
${note('<b>Sai lầm thường gặp.</b> Thiết kế livestream giống video call, cho người xem kết nối trực tiếp tới server của streamer. Cách này không vượt quá vài trăm người xem. Hãy tách chiều lên (ingest) khỏi chiều xuống (phân phối qua CDN bằng HTTP).')}
${interview([
  'Vì sao livestream dùng RTMP để upload nhưng HLS để phát tới người xem?',
  'Người xem than độ trễ 30 giây. Bạn có những nút vặn nào để giảm, và mỗi nút tốn gì?',
  'Giải thích adaptive bitrate. Ai quyết định chuyển chất lượng: server hay player?',
  'Một streamer nổi tiếng có 3 triệu người xem cùng lúc. Thành phần nào chịu tải nhiều nhất và bạn bảo vệ origin ra sao?',
])}`,
  keys: [
    'Luồng chuẩn: encoder, PoP ingest (RTMP), transcode, cắt segment, đóng gói HLS/DASH, CDN, player.',
    'Cắt video thành file nhỏ qua HTTP để tận dụng CDN và cache cho hàng triệu người xem.',
    'Adaptive bitrate: player tự chọn chất lượng cho từng segment theo băng thông đo được.',
    'Độ trễ chủ yếu đến từ độ dài segment và buffer của player; giảm độ trễ thì tốn chi phí và độ ổn định.',
    'Lưu segment vào object storage như S3 để hỗ trợ xem lại.',
  ],
  quiz: [
    { q: 'Định dạng phát livestream tới người xem phổ biến nhất theo sách là gì?', o: ['RTMP', 'HLS', 'FTP', 'WebSocket'], a: 1, why: 'HLS (HTTP Live Streaming) đóng gói manifest và segment để player và CDN xử lý như file HTTP thông thường.' },
    { q: 'Vì sao nền tảng livestream đặt PoP ingest khắp thế giới?', o: ['Để transcode rẻ hơn', 'Để streamer kết nối tới server gần nhất, upload ổn định hơn', 'Để lưu replay', 'Để chạy chat'], a: 1, why: 'Chặng mạng công cộng từ streamer tới PoP ngắn hơn, phần còn lại đi trên mạng nội bộ ổn định của nền tảng.' },
    { q: 'Trong adaptive bitrate, ai quyết định chuyển từ 720p xuống 480p?', o: ['Origin server', 'CDN', 'Player phía người xem', 'Encoder của streamer'], a: 2, why: 'Player đo băng thông và buffer rồi tự chọn mức chất lượng cho segment tiếp theo.' },
    { q: 'Cách nào giảm độ trễ xuống dưới 1 giây nhưng khó scale nhất?', o: ['Segment 6 giây', 'Low-latency HLS', 'WebRTC', 'Tăng bitrate'], a: 2, why: 'WebRTC cho độ trễ rất thấp nhưng cần kết nối riêng cho từng người xem, không tận dụng được cache CDN thông thường.' },
  ],
};

/* ------------------------------------------------------------------ */
/* 6. ChatGPT và Generative AI                                         */
/* ------------------------------------------------------------------ */
const chatgpt: Lesson = {
  id: 'chatgpt',
  mod: 'thuc-chien',
  title: 'Hệ thống kiểu ChatGPT và bức tranh Generative AI',
  pages: [45, 357],
  min: 13,
  level: 'trung-binh',
  lede: 'Một hệ thống kiểu ChatGPT có hai nửa rất khác nhau: huấn luyện mô hình (tốn hàng tháng và rất nhiều GPU) và phục vụ câu hỏi (tính bằng giây cho mỗi người dùng). Hiểu ranh giới này giúp bạn thiết kế đúng chỗ khi xây ứng dụng GenAI.',
  body: `
<h2>Nửa thứ nhất: huấn luyện</h2>
<p>Sách chia quá trình huấn luyện thành hai giai đoạn lớn: <b>pre-training</b> và <b>fine-tuning</b>. Mô hình là một transformer kiểu <b>decoder-only</b>: nhận một chuỗi token và dự đoán token tiếp theo.</p>
${diagram({
  w: 720, h: 280,
  nodes: [
    { id: 'data', label: 'Dữ liệu\nInternet', x: 80, y: 70, w: 110, kind: 'store' },
    { id: 'pre', label: 'Pre-training', sub: 'đoán token kế tiếp', x: 265, y: 70, w: 150 },
    { id: 'base', label: 'Base model', sub: 'biết viết tiếp câu', x: 455, y: 70, w: 140 },
    { id: 'sft', label: 'SFT', sub: 'cặp hỏi – đáp mẫu', x: 630, y: 70, w: 130 },
    { id: 'rm', label: 'Reward model', sub: 'học thứ hạng câu trả lời', x: 610, y: 210, w: 170 },
    { id: 'ppo', label: 'RL (PPO)', sub: 'tối ưu theo reward', x: 390, y: 210, w: 150 },
    { id: 'chat', label: 'Mô hình chat', x: 170, y: 210, w: 140, kind: 'good' },
  ],
  edges: [
    { from: 'data', to: 'pre', label: '1' },
    { from: 'pre', to: 'base', label: '2' },
    { from: 'base', to: 'sft', label: '3' },
    { from: 'sft', to: 'rm', label: '4' },
    { from: 'rm', to: 'ppo', label: '5' },
    { from: 'ppo', to: 'chat', label: '6' },
  ],
  caption: 'Hình: Huấn luyện mô hình kiểu ChatGPT: pre-training trên dữ liệu lớn, rồi fine-tuning ba bước (SFT, reward model, học tăng cường PPO).',
})}
<ol>
<li><b>Pre-training:</b> huấn luyện trên một lượng rất lớn văn bản từ internet. Mục tiêu là đoán từ tiếp theo sao cho câu đúng ngữ pháp và có nghĩa giống dữ liệu gốc.</li>
<li>Kết quả là <b>base model</b>: nó viết tiếp được một câu cho trước nhưng chưa biết trả lời câu hỏi. Hỏi "Thủ đô của Pháp là gì?" có thể nhận về một loạt câu hỏi tương tự thay vì câu trả lời.</li>
<li><b>Supervised fine-tuning (SFT):</b> thu thập cặp câu hỏi và câu trả lời mẫu do con người viết, huấn luyện tiếp để mô hình học cách trả lời.</li>
<li>Thu thập thêm dữ liệu: một câu hỏi kèm nhiều câu trả lời, con người xếp hạng từ tốt nhất tới kém nhất. Dữ liệu này huấn luyện <b>reward model</b> biết chấm điểm câu trả lời.</li>
<li>Dùng <b>học tăng cường</b> (thuật toán PPO) để tối ưu mô hình sao cho câu trả lời đạt điểm reward cao. Bước 4–5 thường gọi chung là RLHF.</li>
<li>Kết quả là mô hình chat trả lời chính xác và hữu ích hơn.</li>
</ol>

<h2>Nửa thứ hai: trả lời một prompt</h2>
<p>Sách mô tả luồng phục vụ với ví dụ người dùng hỏi "Giải thích cách một thuật toán phân loại hoạt động". Điểm đáng chú ý là có <b>hai lớp kiểm duyệt</b>, một ở đầu vào và một ở đầu ra.</p>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'u', label: 'Người dùng', x: 80, y: 110, w: 110, kind: 'client' },
    { id: 'm1', label: 'Moderation\nđầu vào', x: 260, y: 110, w: 130, h: 56, kind: 'lb' },
    { id: 'llm', label: 'Mô hình LLM', sub: 'cụm GPU', x: 450, y: 110, w: 130 },
    { id: 'm2', label: 'Moderation\nđầu ra', x: 635, y: 110, w: 130, h: 56, kind: 'lb' },
    { id: 'tpl', label: 'Câu trả lời mẫu', sub: 'từ chối lịch sự', x: 450, y: 240, w: 160, kind: 'warn' },
  ],
  edges: [
    { from: 'u', to: 'm1', label: '1' },
    { from: 'm1', to: 'llm', label: '2' },
    { from: 'llm', to: 'm2', label: '3' },
    { from: 'm2', to: 'u', label: '4', curve: 140, kind: 'good' },
    { from: 'm1', to: 'tpl', label: '2b', kind: 'warn' },
    { from: 'm2', to: 'tpl', label: '3b', kind: 'warn' },
    { from: 'tpl', to: 'u', label: '4b', dashed: true },
  ],
  caption: 'Hình: (1–2) câu hỏi qua kiểm duyệt rồi tới mô hình; (3–4) câu trả lời được kiểm duyệt lần nữa trước khi hiển thị; (2b, 3b, 4b) vi phạm ở bất kỳ lớp nào thì trả câu trả lời mẫu.',
})}
<p>Phía sau sơ đồ đơn giản này là nhiều thành phần hạ tầng. Lịch sử hội thoại được lưu lại và ghép vào prompt mỗi lượt, vì mô hình không tự nhớ gì giữa các request; độ dài bị giới hạn bởi <b>context window</b>. Câu trả lời sinh ra từng token, nên server <b>stream</b> về trình duyệt (thường qua Server-Sent Events) để người dùng thấy chữ hiện dần. Trên GPU, server gom nhiều request thành batch và giữ <b>KV cache</b> của các token đã xử lý để không tính lại. Vì GPU đắt và khan hiếm, rate limit theo người dùng và theo gói cước là bắt buộc.</p>
${tbl(['Thành phần', 'Vai trò', 'Điểm thiết kế'], [
  ['API gateway', 'Xác thực, rate limit theo token và request', 'Giới hạn theo số token chứ không chỉ số request'],
  ['Kho hội thoại', 'Lưu lịch sử chat', 'Ghi nhiều, đọc theo user; cắt bớt khi vượt context window'],
  ['Moderation', 'Lọc đầu vào và đầu ra', 'Mô hình phân loại nhỏ, nhanh, chạy trước và sau LLM'],
  ['Inference server', 'Chạy mô hình trên GPU', 'Batching, KV cache, stream từng token'],
])}

<h2>Bức tranh Generative AI</h2>
<p>Bài "The Ultimate Walkthrough of the Generative AI Landscape" trong sách đi qua chín chủ đề: GenAI là gì, foundation model và LLM, bài báo "Attention Is All You Need", so sánh GenAI với AI truyền thống, cách huấn luyện foundation model, development stack, ứng dụng, thiết kế một ứng dụng GenAI đơn giản và vai trò AI engineer. Có thể gom thành các tầng như hình dưới.</p>
${diagram({
  w: 720, h: 380,
  nodes: [
    { id: 'app', label: 'Ứng dụng', sub: 'chatbot, trợ lý code, tạo ảnh, tóm tắt tài liệu', x: 360, y: 50, w: 560, kind: 'good' },
    { id: 'fw', label: 'Framework và điều phối', sub: 'LangChain, LlamaIndex, prompt, agent, RAG', x: 360, y: 140, w: 560 },
    { id: 'fm', label: 'Foundation model / LLM', sub: 'mô hình đóng qua API hoặc mô hình mở tự host', x: 360, y: 230, w: 560, kind: 'lb' },
    { id: 'infra', label: 'Hạ tầng', sub: 'GPU, cloud, vector database, kho dữ liệu huấn luyện', x: 360, y: 320, w: 560, kind: 'store' },
  ],
  edges: [
    { from: 'app', to: 'fw' },
    { from: 'fw', to: 'fm' },
    { from: 'fm', to: 'infra' },
  ],
  caption: 'Hình: Các tầng của hệ sinh thái GenAI. Phần lớn công ty xây ở hai tầng trên và mua hoặc thuê hai tầng dưới.',
})}
${tbl(['Tiêu chí', 'AI truyền thống', 'Generative AI'], [
  ['Đầu ra', 'Nhãn, con số dự đoán (spam hay không, giá nhà)', 'Nội dung mới: văn bản, ảnh, code, âm thanh'],
  ['Mô hình', 'Mỗi bài toán một mô hình riêng', 'Một foundation model dùng cho nhiều việc'],
  ['Dữ liệu', 'Cần dữ liệu gán nhãn cho từng bài toán', 'Pre-train trên dữ liệu khổng lồ không nhãn, sau đó tinh chỉnh'],
  ['Cách dùng', 'Gọi mô hình với đặc trưng đầu vào', 'Viết prompt, bổ sung ngữ cảnh, gọi tool'],
])}
<p>Bài báo "Attention Is All You Need" (2017) giới thiệu kiến trúc transformer, nền tảng của gần như mọi LLM hiện nay. Cơ chế attention cho phép mô hình nhìn toàn bộ chuỗi cùng lúc thay vì đọc tuần tự như RNN, nhờ đó huấn luyện song song trên GPU hiệu quả hơn nhiều.</p>
<p>Một ứng dụng GenAI đơn giản thường dùng mẫu <b>RAG</b> (retrieval-augmented generation): tài liệu nội bộ được cắt nhỏ, chuyển thành vector embedding và lưu vào vector database. Khi người dùng hỏi, hệ thống tìm các đoạn liên quan nhất, ghép vào prompt rồi mới gọi LLM. Cách này giúp mô hình trả lời dựa trên dữ liệu riêng mà không cần huấn luyện lại.</p>
${tip('<b>Thực tế.</b> Hầu hết đội sản phẩm không tự pre-train mô hình vì chi phí rất lớn. Họ chọn mô hình có sẵn qua API, dùng RAG cho dữ liệu riêng, và chỉ fine-tune khi cần đổi phong cách hoặc định dạng đầu ra. Công việc của AI engineer chủ yếu nằm ở tầng ứng dụng và điều phối.')}
${note('<b>Sai lầm thường gặp.</b> Tin rằng mô hình "nhớ" người dùng giữa các request. LLM không có trạng thái; mọi ngữ cảnh phải được ứng dụng gửi lại trong prompt. Hệ thống phải tự lưu lịch sử và chọn phần nào đưa vào khi context window có hạn.')}
${interview([
  'Mô tả các giai đoạn huấn luyện một mô hình kiểu ChatGPT. Vì sao base model sau pre-training chưa trả lời câu hỏi tốt?',
  'Vì sao cần kiểm duyệt cả đầu vào lẫn đầu ra?',
  'Thiết kế backend cho một chatbot phục vụ 1 triệu người dùng mỗi ngày. Bạn lưu lịch sử hội thoại và stream câu trả lời thế nào?',
  'Khi nào dùng RAG, khi nào fine-tune?',
])}`,
  keys: [
    'Huấn luyện gồm pre-training (đoán token kế tiếp) và fine-tuning ba bước: SFT, reward model, PPO.',
    'Base model chỉ biết viết tiếp câu; fine-tuning biến nó thành mô hình trả lời câu hỏi.',
    'Luồng phục vụ có kiểm duyệt ở cả đầu vào và đầu ra; vi phạm thì trả câu trả lời mẫu.',
    'LLM không có trạng thái: ứng dụng phải lưu lịch sử và ghép vào prompt trong giới hạn context window.',
    'Hệ sinh thái GenAI gồm tầng ứng dụng, framework điều phối, foundation model và hạ tầng.',
  ],
  quiz: [
    { q: 'Sau pre-training, mô hình làm được gì?', o: ['Trả lời câu hỏi chính xác', 'Viết tiếp một câu cho trước nhưng chưa biết trả lời câu hỏi', 'Tự kiểm duyệt nội dung', 'Tra cứu internet'], a: 1, why: 'Theo sách, base model chỉ học dự đoán từ tiếp theo; cần fine-tuning để thành mô hình hỏi đáp.' },
    { q: 'Reward model được huấn luyện từ dữ liệu nào?', o: ['Văn bản internet thô', 'Một câu hỏi kèm nhiều câu trả lời được con người xếp hạng', 'Log truy cập máy chủ', 'Ảnh có gán nhãn'], a: 1, why: 'Reward model học chấm điểm câu trả lời dựa trên thứ hạng do con người đưa ra, rồi được dùng cho bước PPO.' },
    { q: 'Câu trả lời của mô hình bị lớp kiểm duyệt đầu ra đánh dấu vi phạm. Hệ thống làm gì?', o: ['Vẫn hiển thị', 'Trả về câu trả lời mẫu (template)', 'Huấn luyện lại mô hình', 'Chặn tài khoản người dùng'], a: 1, why: 'Sách mô tả: không qua kiểm duyệt thì chuyển sang bộ sinh câu trả lời mẫu và hiển thị câu đó.' },
    { q: 'Kiến trúc nào là nền tảng của các LLM hiện nay?', o: ['RNN', 'Transformer', 'CNN', 'Decision tree'], a: 1, why: 'Transformer từ bài "Attention Is All You Need" (2017); GPT là transformer kiểu decoder-only.' },
  ],
};

/* ------------------------------------------------------------------ */
/* 7. Reddit                                                           */
/* ------------------------------------------------------------------ */
const reddit: Lesson = {
  id: 'reddit',
  mod: 'thuc-chien',
  title: 'Kiến trúc Reddit',
  pages: [247],
  min: 11,
  level: 'trung-binh',
  lede: 'Reddit phục vụ hơn 1 tỉ người dùng mỗi tháng. Kiến trúc của họ không có gì bí ẩn: CDN, load balancer, GraphQL, cache trước Postgres, queue cho việc nặng. Giá trị nằm ở cách các khối quen thuộc được ghép lại và tiến hóa dần.',
  body: `
<h2>Mười điểm chính theo sách</h2>
<p>Sách tổng hợp kiến trúc Reddit từ nhiều bài blog kỹ thuật của công ty, và lưu ý rằng kiến trúc luôn thay đổi nên một số chi tiết có thể đã khác. Mười điểm được gom theo tầng như sau:</p>
${tbl(['#', 'Tầng', 'Nội dung'], [
  ['1', 'Biên', 'Dùng CDN của <b>Fastly</b> đứng trước toàn bộ ứng dụng.'],
  ['2', 'Frontend', 'Dùng jQuery từ đầu 2009, sau đó chuyển sang TypeScript và nay là các framework Node.js hiện đại. Có app Android và iOS.'],
  ['3', 'Định tuyến', 'Load balancer đứng đầu stack ứng dụng, chuyển request tới service phù hợp.'],
  ['4', 'Backend', 'Khởi đầu là monolith viết bằng Python, đang chuyển dần sang microservices viết bằng <b>Go</b>.'],
  ['5', 'API', 'Dùng GraphQL nhiều. Từ đầu 2021 chuyển sang <b>GraphQL Federation</b>, ghép nhiều GraphQL API nhỏ (Domain Graph Services). Năm 2022 thêm các subgraph Go cho thực thể cốt lõi, tách dần GraphQL monolith.'],
  ['6', 'Lưu trữ', '<b>Postgres</b> cho mô hình dữ liệu cốt lõi, <b>memcached</b> phía trước để giảm tải. <b>Cassandra</b> dùng nhiều cho tính năng mới nhờ khả năng chịu lỗi và sẵn sàng.'],
  ['7', 'Đồng bộ dữ liệu', '<b>Debezium</b> chạy Change Data Capture để replicate dữ liệu và giữ cache nhất quán.'],
  ['8', 'Bất đồng bộ', 'Thao tác tốn kém như vote, đăng link được đẩy vào job queue qua <b>RabbitMQ</b> cho worker xử lý. <b>Kafka</b> chuyển dữ liệu thời gian thực để chạy luật kiểm duyệt và an toàn nội dung.'],
  ['9', 'Hạ tầng', 'Chạy trên <b>AWS</b> và <b>Kubernetes</b>.'],
  ['10', 'Triển khai', 'Dùng <b>Spinnaker</b>, <b>Drone CI</b> và <b>Terraform</b>.'],
])}

<h2>Đường đi của một request</h2>
${diagram({
  w: 720, h: 390,
  nodes: [
    { id: 'u', label: 'Người dùng', sub: 'web, iOS, Android', x: 85, y: 70, w: 130, kind: 'client' },
    { id: 'cdn', label: 'CDN', sub: 'Fastly', x: 260, y: 70, w: 110, kind: 'lb' },
    { id: 'lb', label: 'Load balancer', x: 440, y: 70, w: 130, kind: 'lb' },
    { id: 'fe', label: 'Web frontend', sub: 'Node.js', x: 630, y: 70, w: 130 },
    { id: 'gql', label: 'GraphQL\nFederation', x: 540, y: 200, w: 150, h: 56, kind: 'lb' },
    { id: 'mono', label: 'Monolith', sub: 'Python', x: 420, y: 330, w: 130 },
    { id: 'go', label: 'Microservices', sub: 'Go', x: 630, y: 330, w: 140 },
  ],
  edges: [
    { from: 'u', to: 'cdn', label: '1' },
    { from: 'cdn', to: 'lb', label: '2' },
    { from: 'lb', to: 'fe', label: '3' },
    { from: 'fe', to: 'gql', label: '4' },
    { from: 'gql', to: 'mono', label: '5' },
    { from: 'gql', to: 'go', label: '5' },
  ],
  groups: [{ x: 345, y: 14, w: 367, h: 356, label: 'AWS + Kubernetes' }],
  caption: 'Hình: Request đi qua CDN Fastly, load balancer, frontend, rồi tới tầng GraphQL Federation; tầng này gom dữ liệu từ monolith Python và các microservice Go.',
})}
<ol>
<li>Người dùng trên web hoặc app gửi request; nội dung tĩnh và có thể cache được trả thẳng từ edge.</li>
<li>Request còn lại đi qua CDN Fastly về hạ tầng của Reddit trên AWS.</li>
<li>Load balancer chuyển request tới service phù hợp, ví dụ frontend web.</li>
<li>Frontend và app mobile lấy dữ liệu qua tầng <b>GraphQL Federation</b>: client mô tả đúng các trường cần, gateway chia truy vấn thành phần việc cho từng subgraph.</li>
<li>Subgraph gọi tới phần logic tương ứng: phần cũ vẫn nằm trong monolith Python, phần mới hoặc đã tách nằm ở microservice Go.</li>
</ol>
<p>Điểm hay của GraphQL Federation ở đây là cho phép tách monolith <b>từ từ</b>. Client không cần biết một trường dữ liệu đến từ monolith hay từ service Go mới. Khi một thực thể (bài viết, bình luận, subreddit) được chuyển sang service mới, chỉ cần đổi subgraph phục vụ thực thể đó, schema chung giữ nguyên.</p>

<h2>Dữ liệu và xử lý bất đồng bộ</h2>
${diagram({
  w: 720, h: 400,
  nodes: [
    { id: 'svc', label: 'Services', x: 80, y: 100, w: 110 },
    { id: 'mc', label: 'Memcached', x: 260, y: 100, w: 120, kind: 'cache' },
    { id: 'pg', label: 'Postgres', sub: 'dữ liệu lõi', x: 440, y: 100, w: 120, kind: 'store' },
    { id: 'deb', label: 'Debezium', sub: 'CDC', x: 630, y: 100, w: 120 },
    { id: 'rmq', label: 'RabbitMQ', x: 80, y: 230, w: 120, kind: 'queue' },
    { id: 'cas', label: 'Cassandra', sub: 'tính năng mới', x: 260, y: 235, w: 130, kind: 'store' },
    { id: 'kf', label: 'Kafka', x: 440, y: 235, w: 110, kind: 'queue' },
    { id: 'rule', label: 'Rule engine', sub: 'an toàn nội dung', x: 630, y: 235, w: 140 },
    { id: 'wk', label: 'Job workers', x: 80, y: 350, w: 120 },
  ],
  edges: [
    { from: 'svc', to: 'mc', label: '1' },
    { from: 'mc', to: 'pg', label: '2' },
    { from: 'pg', to: 'deb', label: '3' },
    { from: 'deb', to: 'mc', label: '4', curve: 120, dashed: true },
    { from: 'svc', to: 'cas', label: '5' },
    { from: 'svc', to: 'rmq', label: '6' },
    { from: 'rmq', to: 'wk', label: '7' },
    { from: 'svc', to: 'kf', label: '8' },
    { from: 'kf', to: 'rule', label: '9' },
  ],
  caption: 'Hình: Tầng dữ liệu của Reddit. Memcached che Postgres, Debezium đọc thay đổi để đồng bộ, RabbitMQ gánh việc nặng, Kafka đưa dữ liệu tới luật kiểm duyệt.',
})}
<ol>
<li>Service đọc memcached trước.</li>
<li>Cache miss thì đọc Postgres, nơi giữ mô hình dữ liệu cốt lõi.</li>
<li>Debezium đọc log thay đổi của Postgres (CDC) thay vì để ứng dụng tự ghi kép.</li>
<li>Từ luồng thay đổi đó, dữ liệu được replicate đi nơi khác và cache được cập nhật để nhất quán.</li>
<li>Tính năng mới cần sẵn sàng cao và ghi nhiều dùng Cassandra.</li>
<li>Vote hay đăng link không xử lý ngay trong request mà đẩy vào RabbitMQ.</li>
<li>Job worker lấy việc ra xử lý: cập nhật điểm, xếp hạng, đếm vote.</li>
<li>Sự kiện nội dung được đẩy vào Kafka theo thời gian thực.</li>
<li>Rule engine chạy luật an toàn và kiểm duyệt trên luồng đó.</li>
</ol>

<h2>Vì sao lại chọn như vậy</h2>
${tbl(['Quyết định', 'Lợi ích', 'Cái giá'], [
  ['Vote qua queue', 'Request trả về nhanh, đỉnh tải được queue hấp thụ', 'Điểm số cập nhật trễ vài giây'],
  ['CDC bằng Debezium', 'Không ghi kép từ code ứng dụng, tránh lệch dữ liệu khi một bên ghi lỗi', 'Thêm một hệ thống phải vận hành và giám sát'],
  ['Postgres + Cassandra', 'Postgres cho dữ liệu quan hệ cần giao dịch; Cassandra cho tính năng cần scale ghi và sẵn sàng cao', 'Hai mô hình dữ liệu, hai bộ kỹ năng vận hành'],
  ['Tách monolith dần qua GraphQL Federation', 'Không phải viết lại một lần, client không bị ảnh hưởng', 'Giai đoạn chuyển tiếp dài, hai stack song song'],
])}
${tip('<b>Thực tế.</b> Reddit tách RabbitMQ (job queue cho việc cần làm đúng một lần như ghi vote) khỏi Kafka (luồng sự kiện cho nhiều bên cùng đọc như kiểm duyệt). Đây là cách chọn công cụ theo mẫu sử dụng: queue công việc khác với log sự kiện.')}
${note('<b>Sai lầm thường gặp.</b> Sao chép nguyên stack của Reddit cho một sản phẩm mới. Reddit đi tới kiến trúc này sau hơn 15 năm; khởi điểm của họ là một monolith Python. Hãy học lý do của từng quyết định thay vì danh sách công nghệ.')}
${interview([
  'Thiết kế tính năng vote của Reddit sao cho chịu được một bài viết nhận hàng trăm nghìn vote trong vài phút.',
  'Vì sao dùng CDC (Debezium) để giữ cache nhất quán thay vì xóa cache trong code ứng dụng?',
  'GraphQL Federation giúp tách monolith thế nào? Rủi ro của cách này là gì?',
  'Khi nào bạn chọn RabbitMQ, khi nào chọn Kafka?',
])}`,
  keys: [
    'Reddit: CDN Fastly, load balancer, GraphQL Federation, monolith Python chuyển dần sang microservices Go.',
    'Postgres cho dữ liệu cốt lõi có memcached phía trước; Cassandra cho tính năng mới.',
    'Debezium chạy CDC để replicate dữ liệu và giữ cache nhất quán.',
    'Vote và đăng link đi qua RabbitMQ; Kafka đưa dữ liệu thời gian thực tới luật kiểm duyệt.',
    'Hạ tầng AWS và Kubernetes; triển khai bằng Spinnaker, Drone CI, Terraform.',
  ],
  quiz: [
    { q: 'Reddit dùng gì để chạy Change Data Capture?', o: ['Kafka Streams', 'Debezium', 'RabbitMQ', 'Spinnaker'], a: 1, why: 'Theo sách, Debezium chạy CDC để hỗ trợ replicate dữ liệu và giữ cache nhất quán.' },
    { q: 'Thao tác nào được Reddit đẩy vào job queue RabbitMQ?', o: ['Đọc trang chủ', 'Vote và đăng link', 'Tải ảnh tĩnh', 'Đăng nhập'], a: 1, why: 'Sách nêu các thao tác tốn kém như vote hay submit link được hoãn sang async job queue.' },
    { q: 'Backend Reddit đang chuyển từ đâu sang đâu?', o: ['Java sang Kotlin', 'Monolith Python sang microservices Go', 'Go sang Rust', 'Node.js sang Python'], a: 1, why: 'Reddit khởi đầu là monolith Python và đang chuyển sang microservices viết bằng Go.' },
    { q: 'Vì sao Reddit dùng Cassandra cho nhiều tính năng mới?', o: ['Vì hỗ trợ JOIN tốt', 'Vì khả năng chịu lỗi và sẵn sàng cao', 'Vì rẻ hơn Postgres', 'Vì là cache in-memory'], a: 1, why: 'Sách nêu lý do chính là resiliency và availability của Cassandra.' },
  ],
};

/* ------------------------------------------------------------------ */
/* 8. Netflix                                                          */
/* ------------------------------------------------------------------ */
const netflix: Lesson = {
  id: 'netflix',
  mod: 'thuc-chien',
  title: 'Kiến trúc Netflix',
  pages: [175, 169, 202, 222, 275],
  min: 14,
  level: 'trung-binh',
  lede: 'Netflix là ví dụ kinh điển của microservices quy mô lớn, và cũng là công ty đóng góp nhiều công cụ mã nguồn mở cho cộng đồng. Kiến trúc API của họ đã đổi bốn lần, mỗi lần để giải một nỗi đau cụ thể.',
  body: `
<h2>Tech stack</h2>
<p>Sách tổng hợp tech stack của Netflix từ blog kỹ thuật và các dự án mã nguồn mở của công ty, kèm lưu ý rằng có thể có chi tiết chưa chính xác.</p>
${tbl(['Lớp', 'Công nghệ'], [
  ['Mobile và web', 'Swift, Kotlin cho app native; React cho web'],
  ['Giao tiếp frontend/server', 'GraphQL'],
  ['Backend', 'Zuul, Eureka, Spring Boot và các công nghệ khác'],
  ['Database', 'EVCache, Cassandra, CockroachDB và các database khác'],
  ['Messaging/streaming', 'Apache Kafka, Flink'],
  ['Lưu trữ video', 'S3 và Open Connect'],
  ['Xử lý dữ liệu', 'Flink, Spark; hiển thị bằng Tableau; Redshift cho data warehouse'],
  ['CI/CD', 'JIRA, Confluence, PagerDuty, Jenkins, Gradle, Chaos Monkey, Spinnaker, Atlas…'],
])}

<h2>Kiến trúc tổng thể</h2>
<p>Netflix tách hệ thống thành hai mặt rõ ràng. <b>Control plane</b> chạy trên AWS: đăng nhập, duyệt danh mục, gợi ý, chọn server phát. <b>Data plane</b> là bản thân các byte video, đi qua mạng CDN riêng tên <b>Open Connect</b>, với các máy chủ (Open Connect Appliance, OCA) đặt ngay trong mạng của nhà cung cấp internet.</p>
${diagram({
  w: 720, h: 420,
  nodes: [
    { id: 'c', label: 'Thiết bị', sub: 'TV, mobile, web', x: 80, y: 190, w: 120, kind: 'client' },
    { id: 'zuul', label: 'Zuul', sub: 'API gateway', x: 290, y: 110, w: 120, kind: 'lb' },
    { id: 'svc', label: 'Microservices', sub: 'Java, Spring Boot', x: 465, y: 110, w: 140 },
    { id: 'ev', label: 'EVCache', x: 640, y: 60, w: 120, kind: 'cache' },
    { id: 'cas', label: 'Cassandra', x: 640, y: 170, w: 120, kind: 'store' },
    { id: 'kf', label: 'Kafka', x: 465, y: 240, w: 120, kind: 'queue' },
    { id: 'fl', label: 'Flink, Spark', sub: 'xử lý dữ liệu', x: 640, y: 280, w: 130 },
    { id: 's3', label: 'S3', sub: 'kho video gốc', x: 465, y: 355, w: 130, kind: 'store' },
    { id: 'oca', label: 'Open Connect', sub: 'OCA tại ISP', x: 95, y: 345, w: 150, kind: 'external' },
  ],
  edges: [
    { from: 'c', to: 'zuul', label: '1' },
    { from: 'zuul', to: 'svc', label: '2' },
    { from: 'svc', to: 'ev', label: '3' },
    { from: 'svc', to: 'cas' },
    { from: 'svc', to: 'kf', label: '4' },
    { from: 'kf', to: 'fl', label: '5' },
    { from: 's3', to: 'oca', label: '6', dashed: true },
    { from: 'c', to: 'oca', label: '7', kind: 'good' },
  ],
  groups: [{ x: 210, y: 24, w: 505, h: 375, label: 'AWS (control plane)' }],
  caption: 'Hình: Control plane trên AWS xử lý mọi thứ trừ việc phát video; byte video đi từ Open Connect đặt sẵn trong mạng nhà cung cấp internet.',
})}
<ol>
<li>App gửi request (đăng nhập, lấy trang chủ, bấm Play) tới gateway Zuul trên AWS.</li>
<li>Zuul định tuyến tới các microservice viết bằng Java; service tìm nhau qua Eureka.</li>
<li>Service đọc dữ liệu từ EVCache trước, sau đó tới Cassandra.</li>
<li>Sự kiện (xem phim, tạm dừng, lỗi phát) được đẩy vào Kafka.</li>
<li>Flink và Spark xử lý luồng sự kiện cho gợi ý, giám sát và phân tích.</li>
<li>Video gốc nằm trên S3; nội dung được đổ sẵn xuống các OCA, thường vào giờ thấp điểm.</li>
<li>Khi bấm Play, service phát chọn OCA phù hợp và trả URL; thiết bị tải video thẳng từ OCA gần nhất, không qua AWS.</li>
</ol>

<h2>Bốn giai đoạn tiến hóa của API</h2>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'a1', label: 'Monolith', sub: 'một file WAR', x: 95, y: 80, w: 140 },
    { id: 'a2', label: 'Direct access', sub: 'client gọi thẳng', x: 275, y: 80, w: 140 },
    { id: 'a3', label: 'Gateway', sub: 'aggregation', x: 455, y: 80, w: 140, kind: 'lb' },
    { id: 'a4', label: 'GraphQL', sub: 'Federation', x: 635, y: 80, w: 140, kind: 'good' },
    { id: 'j1', label: 'Zuul gateway', sub: 'Java 8', x: 95, y: 230, w: 140, kind: 'lb' },
    { id: 'j2', label: 'BFF', sub: 'Groovy + RxJava', x: 275, y: 230, w: 140 },
    { id: 'j3', label: 'DGS', sub: 'Java 17, Spring Boot 3', x: 455, y: 230, w: 150 },
    { id: 'j4', label: 'Java 21', sub: 'virtual threads', x: 635, y: 230, w: 140, kind: 'good' },
  ],
  edges: [
    { from: 'a1', to: 'a2' },
    { from: 'a2', to: 'a3' },
    { from: 'a3', to: 'a4' },
    { from: 'j1', to: 'j2' },
    { from: 'j2', to: 'j3' },
    { from: 'j3', to: 'j4' },
  ],
  groups: [
    { x: 15, y: 22, w: 700, h: 96, label: 'Kiến trúc API' },
    { x: 15, y: 172, w: 700, h: 96, label: 'Ngăn xếp Java phía sau' },
  ],
  caption: 'Hình: Hàng trên là bốn giai đoạn kiến trúc API; hàng dưới là các thế hệ ngăn xếp Java hiện thực hóa chúng.',
})}
<p><b>Monolith:</b> ứng dụng đóng gói và triển khai như một khối, ví dụ một file Java WAR. Phần lớn startup bắt đầu như vậy. <b>Direct access:</b> sau khi tách microservices, client gọi thẳng từng service. Với hàng trăm, hàng nghìn service, phơi tất cả ra client là không ổn.</p>
<p><b>Gateway aggregation:</b> một màn hình cần dữ liệu từ nhiều service, ví dụ trang danh sách phim LOLOMO (list of lists of movies) cần hàng chục service. Gọi tất cả từ client gây vấn đề hiệu năng, nên Netflix dùng Zuul làm gateway điều phối. Sau đó vì TV, mobile, web có khác biệt nhỏ nhưng nhiều, Netflix chuyển sang mẫu <b>Backend for Frontend</b>: mỗi loại client có một backend nhỏ riêng viết bằng script Groovy, fan-out tới service bằng RxJava; Zuul lùi về vai trò proxy.</p>
<p><b>GraphQL Federation:</b> viết script Groovy tốn công cho đội UI, và lập trình reactive khó. Khi số kỹ sư và độ phức tạp domain tăng, Netflix dựng một GraphQL gateway duy nhất lấy dữ liệu từ các service khác. Client chỉ định chính xác trường cần, tránh lấy thừa hoặc thiếu như với REST.</p>
${diagram({
  w: 720, h: 310,
  nodes: [
    { id: 'c', label: 'Client', sub: 'TV, mobile, web', x: 80, y: 150, w: 120, kind: 'client' },
    { id: 'gw', label: 'GraphQL\ngateway', x: 290, y: 150, w: 140, h: 56, kind: 'lb' },
    { id: 'reg', label: 'Schema\nregistry', x: 290, y: 265, w: 130, kind: 'store' },
    { id: 'd1', label: 'Movie DGS', sub: 'Spring Boot', x: 560, y: 55, w: 160 },
    { id: 'd2', label: 'Production DGS', sub: 'Spring Boot', x: 560, y: 150, w: 160 },
    { id: 'd3', label: 'Talent DGS', sub: 'Spring Boot', x: 560, y: 245, w: 160 },
  ],
  edges: [
    { from: 'c', to: 'gw', label: '1', both: true },
    { from: 'gw', to: 'reg', label: '2', dashed: true },
    { from: 'gw', to: 'd1', both: true },
    { from: 'gw', to: 'd2', label: '3', both: true },
    { from: 'gw', to: 'd3', both: true },
  ],
  caption: 'Hình: GraphQL Federation. (1) client gửi một truy vấn; (2) gateway dùng schema hợp nhất để lập kế hoạch; (3) gọi các Domain Graph Service (movie, production, talent) rồi ghép kết quả.',
})}

<h2>Netflix dùng Java thế nào</h2>
<p>Theo sách, Netflix chủ yếu là "Java shop": mọi ứng dụng backend, kể cả app nội bộ, streaming và sản xuất phim, đều là ứng dụng Java. Các service ban đầu dùng Java 8. Các <b>Domain Graph Service (DGS)</b> trong mô hình federation dùng Java 17, Spring Boot 3 và các gói Spring Boot Netflix OSS. Riêng việc chuyển từ Java 8 lên Java 17 đã giúp giảm khoảng 20% CPU. Gần đây Netflix bắt đầu chuyển sang Java 21 để dùng virtual threads, giúp viết code đồng bộ dễ đọc mà vẫn xử lý nhiều request đồng thời.</p>

<h2>EVCache: bốn cách dùng cache</h2>
<p>Sách nêu mục tiêu của Netflix là giữ người dùng xem càng lâu càng tốt, trong khi khoảng chú ý của người dùng chỉ cỡ 90 giây. EVCache, kho key-value phân tán dựa trên memcached, giúp giảm latency và được dùng theo bốn cách:</p>
${tbl(['Cách dùng', 'Mô tả', 'Ví dụ'], [
  ['Lookaside cache', 'Đọc EVCache trước; miss thì gọi service và Cassandra, rồi cập nhật cache', 'Dữ liệu danh mục, hồ sơ'],
  ['Kho dữ liệu tạm thời', 'Lưu dữ liệu sống ngắn mà nhiều service cùng cập nhật', 'Phiên phát: service này mở, service khác cập nhật, cuối cùng đóng'],
  ['Kho chính', 'Hệ thống tính trước chạy hằng đêm ghi kết quả vào EVCache; service online đọc ra', 'Trang chủ cá nhân hóa cho từng profile'],
  ['Dữ liệu truy cập rất nhiều', 'Tiến trình riêng tính và đẩy sẵn vào cache, ứng dụng đọc với latency thấp và sẵn sàng cao', 'Chuỗi giao diện và bản dịch trên trang chủ'],
])}
${tip('<b>Thực tế.</b> Netflix là nguồn gốc của nhiều công cụ mã nguồn mở quen thuộc: Zuul (gateway), Eureka (service discovery), Hystrix (circuit breaker), Chaos Monkey (cố ý tắt instance để kiểm tra khả năng chịu lỗi) và Spinnaker (continuous delivery).')}
${note('<b>Sai lầm thường gặp.</b> Nghĩ rằng Netflix phát video từ AWS. AWS chỉ chạy control plane; phần băng thông lớn nhất đi qua Open Connect đặt trong mạng nhà cung cấp internet. Khi thiết kế hệ thống video, hãy tách việc điều khiển khỏi việc chuyển byte.')}
${interview([
  'Vì sao Netflix chuyển từ một API gateway chung sang BFF, rồi sang GraphQL Federation?',
  'Netflix tách control plane và data plane thế nào? Lợi ích của việc đặt máy chủ CDN trong mạng ISP?',
  'EVCache được dùng như kho chính cho trang chủ đã tính trước. Rủi ro là gì, và xử lý khi cache mất dữ liệu ra sao?',
  'GraphQL giải quyết vấn đề over-fetching và under-fetching thế nào?',
])}`,
  keys: [
    'Control plane chạy trên AWS (Zuul, microservices Java, EVCache, Cassandra, Kafka); video đi qua Open Connect.',
    'API tiến hóa: monolith, direct access, gateway aggregation, GraphQL Federation.',
    'Ngăn xếp Java: Zuul gateway, BFF bằng Groovy và RxJava, DGS trên Java 17 và Spring Boot 3, rồi Java 21.',
    'Lên Java 17 giảm khoảng 20% CPU; Java 21 mang tới virtual threads.',
    'EVCache dùng làm lookaside cache, kho tạm, kho chính cho dữ liệu tính trước và dữ liệu truy cập nhiều.',
  ],
  quiz: [
    { q: 'Vì sao Netflix chuyển từ một gateway chung sang Backend for Frontend?', o: ['Gateway quá đắt', 'TV, mobile, web có những khác biệt nhỏ mà một gateway chung khó đáp ứng', 'Zuul ngừng phát triển', 'Để bỏ microservices'], a: 1, why: 'Mỗi loại client có nhu cầu khác nhau, nên mỗi client có một backend nhỏ riêng để fan-out và điều phối.' },
    { q: 'Theo sách, chuyển từ Java 8 lên Java 17 mang lại gì?', o: ['Giảm 50% bộ nhớ', 'Khoảng 20% CPU', 'Bỏ được Spring Boot', 'Hỗ trợ GraphQL'], a: 1, why: 'Sách ghi nhận mức cải thiện khoảng 20% CPU khi chuyển từ Java 8 lên Java 17.' },
    { q: 'Byte video Netflix chủ yếu được phát từ đâu?', o: ['Máy chủ EC2 trên AWS', 'Open Connect Appliance đặt trong mạng ISP', 'Cassandra', 'EVCache'], a: 1, why: 'Open Connect là CDN riêng của Netflix; AWS chỉ chạy control plane.' },
    { q: 'EVCache được dùng làm "kho chính" (primary store) trong trường hợp nào?', o: ['Lưu mật khẩu người dùng', 'Trang chủ được tính trước hằng đêm cho từng profile', 'Lưu file video', 'Lưu log lỗi'], a: 1, why: 'Hệ thống tính trước ghi trang chủ vào EVCache, service online đọc từ đó để dựng trang.' },
  ],
};

/* ------------------------------------------------------------------ */
/* 9. Bài học từ các công ty lớn                                       */
/* ------------------------------------------------------------------ */
const congTyLon: Lesson = {
  id: 'cong-ty-lon',
  mod: 'thuc-chien',
  title: 'Bài học từ các công ty lớn',
  pages: [288, 120, 210, 339, 214, 136],
  min: 13,
  level: 'co-ban',
  lede: 'Các công ty lớn không có phép màu riêng: họ áp dụng một nhóm chiến lược scale quen thuộc thật kỷ luật, đo đạc từng mili giây, và chia sẻ lại rất nhiều công cụ và bài báo mà cả ngành đang dùng.',
  body: `
<h2>Amazon, Netflix và Uber có gì chung</h2>
<p>Sách trả lời ngắn gọn: cả ba đều rất giỏi scale hệ thống khi cần. Tám chiến lược sau xuất hiện ở gần như mọi hệ thống lớn. Hình dưới đặt chúng vào một kiến trúc, số trên mũi tên ứng với số thứ tự chiến lược trong bảng.</p>
${diagram({
  w: 720, h: 430,
  nodes: [
    { id: 'u', label: 'Người dùng', x: 80, y: 170, w: 110, kind: 'client' },
    { id: 'lb', label: 'Load\nbalancer', x: 250, y: 170, w: 110, h: 56, kind: 'lb' },
    { id: 'a1', label: 'App server', sub: '1. stateless', x: 440, y: 110, w: 130 },
    { id: 'a2', label: 'App server', sub: '1. stateless', x: 440, y: 230, w: 130 },
    { id: 'ca', label: 'Cache', x: 635, y: 60, w: 120, kind: 'cache' },
    { id: 'db', label: 'DB shard 1..N', x: 635, y: 170, w: 140, kind: 'store' },
    { id: 'rep', label: 'Read replica', x: 635, y: 290, w: 130, kind: 'store' },
    { id: 'mq', label: 'Queue', x: 440, y: 345, w: 120, kind: 'queue' },
    { id: 'wk', label: 'Worker', x: 635, y: 390, w: 120 },
  ],
  edges: [
    { from: 'u', to: 'lb', label: '3' },
    { from: 'lb', to: 'a1', label: '2' },
    { from: 'lb', to: 'a2', label: '2' },
    { from: 'a1', to: 'ca', label: '5' },
    { from: 'a1', to: 'db', label: '7' },
    { from: 'a2', to: 'rep', label: '6' },
    { from: 'db', to: 'rep', dashed: true, kind: 'muted' },
    { from: 'a2', to: 'mq', label: '8' },
    { from: 'mq', to: 'wk' },
  ],
  groups: [{ x: 360, y: 54, w: 160, h: 212, label: '4. Auto scaling' }],
  caption: 'Hình: Tám chiến lược scale trong một kiến trúc: (1) service stateless, (2) scale ngang, (3) load balancer, (4) auto scaling, (5) cache, (6) replication, (7) sharding, (8) xử lý bất đồng bộ.',
})}
${tbl(['#', 'Chiến lược', 'Ý chính'], [
  ['1', 'Stateless service', 'Không giữ dữ liệu riêng trên server (session để ở Redis hoặc token), nên thêm bớt server thoải mái.'],
  ['2', 'Scale ngang', 'Thêm server để chia tải thay vì mua máy to hơn.'],
  ['3', 'Load balancing', 'Phân phối request đều giữa các server.'],
  ['4', 'Auto scaling', 'Chính sách tự tăng giảm tài nguyên theo traffic thực tế.'],
  ['5', 'Caching', 'Giảm tải database và xử lý request lặp lại.'],
  ['6', 'Database replication', 'Nhân bản dữ liệu ra nhiều node để scale đọc và tăng dự phòng.'],
  ['7', 'Database sharding', 'Chia dữ liệu ra nhiều instance để scale cả ghi lẫn đọc.'],
  ['8', 'Xử lý bất đồng bộ', 'Đẩy việc tốn thời gian, tốn tài nguyên sang worker nền để kịp nhận request mới.'],
])}
<p>Một chi tiết nữa từ sách cho thấy vì sao họ đầu tư nhiều như vậy: khoảng 10 năm trước, Amazon phát hiện mỗi 100 ms latency tăng thêm làm mất 1% doanh số, tương đương khoảng 5,7 tỉ USD theo quy mô hiện tại. Các chiến lược giảm latency sách liệt kê là index database, cache, load balancing, CDN, xử lý bất đồng bộ và nén dữ liệu.</p>

<h2>Pinterest: thay một dòng, giảm 99% thời gian clone</h2>
<p>Đội Engineering Productivity của Pinterest sửa một dòng trong pipeline Jenkins của monorepo <b>Pinboard</b>, và thời gian clone giảm từ 40 phút xuống 30 giây. Pinboard là monorepo lớn và lâu đời nhất của Pinterest: 350 nghìn commit, 20 GB khi clone đầy đủ, khoảng 60 nghìn lượt git pull mỗi ngày làm việc.</p>
${diagram({
  w: 720, h: 280,
  nodes: [
    { id: 'jk', label: 'Jenkins', sub: 'stage Checkout', x: 90, y: 140, w: 130 },
    { id: 'repo', label: 'Pinboard', sub: 'monorepo 20 GB', x: 330, y: 140, w: 150, kind: 'store' },
    { id: 'bf', label: 'Trước: mọi refspec', sub: '2.500+ nhánh, ~40 phút', x: 590, y: 60, w: 200, kind: 'warn' },
    { id: 'af', label: 'Sau: chỉ master', sub: '~30 giây', x: 590, y: 220, w: 200, kind: 'good' },
  ],
  edges: [
    { from: 'jk', to: 'repo', label: 'git fetch' },
    { from: 'repo', to: 'bf', kind: 'warn' },
    { from: 'repo', to: 'af', kind: 'good' },
  ],
  caption: 'Hình: Shallow clone vẫn chậm khi Git tải về mọi nhánh. Chỉ định refspec cho đúng nhánh master giải quyết vấn đề.',
})}
<p>Pipeline viết bằng Groovy có stage "Checkout" đã bật shallow clone, không lấy tag và chỉ lấy 50 commit gần nhất. Tưởng như đã tối ưu, nhưng stage này không dùng tùy chọn <b>refspec</b>. Kết quả là Git vẫn fetch toàn bộ refspec ở mỗi build, tức hơn 2.500 nhánh. Đội chỉ cần thêm refspec cho nhánh họ quan tâm là <code>master</code>, tương tự lệnh <code>git fetch --depth 50 --no-tags origin +refs/heads/master:refs/remotes/origin/master</code>. Git chỉ còn xử lý một nhánh, và thời gian build giảm mạnh.</p>
<p>Bài học: <b>đo trước khi tối ưu</b>. Đội đã bật mọi tùy chọn "nổi tiếng" (shallow, depth) nhưng điểm nghẽn thật nằm ở chỗ khác. Chỉ khi xem Git thực sự tải gì mới thấy được.</p>

<h2>20 dự án mã nguồn mở do công ty lớn khởi xướng</h2>
${tbl(['Công ty', 'Dự án'], [
  ['Google', 'Kubernetes, TensorFlow, Go, Angular'],
  ['Meta', 'React, PyTorch, GraphQL, Cassandra'],
  ['Microsoft', 'VSCode, TypeScript, Playwright'],
  ['Netflix', 'Chaos Monkey, Hystrix, Zuul'],
  ['LinkedIn', 'Kafka, Samza, Pinot'],
  ['Red Hat', 'Ansible, OpenShift, Ceph Storage'],
])}
<p>Có thể thấy một mẫu chung: công ty gặp bài toán ở quy mô chưa ai gặp, tự xây công cụ nội bộ, rồi mở mã nguồn khi công cụ đủ chín. Kafka ra đời từ nhu cầu xử lý log khổng lồ của LinkedIn; Cassandra từ nhu cầu tìm kiếm hộp thư của Facebook.</p>

<h2>25 bài báo thay đổi ngành: chọn lọc</h2>
<p>Sách liệt kê 25 bài báo. Dưới đây là một phần, kèm lý do đáng đọc:</p>
${tbl(['Bài báo', 'Vì sao quan trọng'], [
  ['Dynamo (Amazon)', 'Key-value store luôn ghi được: consistent hashing, quorum, vector clock. Ảnh hưởng tới Cassandra, Riak.'],
  ['Google File System', 'Hệ thống file phân tán trên phần cứng rẻ, chấp nhận máy hỏng là chuyện bình thường. Cảm hứng cho HDFS.'],
  ['MapReduce', 'Mô hình xử lý song song dữ liệu khổng lồ, mở đường cho Hadoop.'],
  ['BigTable', 'Kho dữ liệu dạng cột rộng phân tán, nền của HBase và một phần Cassandra.'],
  ['Scaling Memcache at Facebook', 'Cách vận hành cache ở quy mô hàng tỉ request, gồm lease chống thundering herd.'],
  ['Borg', 'Quản lý cluster quy mô lớn ở Google, tiền thân ý tưởng của Kubernetes.'],
  ['Attention Is All You Need', 'Giới thiệu transformer, nền của các LLM hiện nay.'],
  ['Kafka', 'Log phân tán làm nền cho message streaming.'],
  ['Spanner', 'Database phân tán toàn cầu có giao dịch nhất quán mạnh.'],
  ['Dapper', 'Distributed tracing, cảm hứng cho Zipkin và Jaeger.'],
  ['Raft', 'Thuật toán đồng thuận dễ hiểu hơn Paxos, dùng trong etcd.'],
  ['Time, Clocks and the Ordering of Events', 'Lamport giải thích thứ tự sự kiện trong hệ phân tán khi không có đồng hồ chung.'],
])}
<p>Danh sách đầy đủ còn có Cassandra, FoundationDB, Amazon Aurora, Shard Manager, Flink, khảo sát về vector database, Zanzibar (phân quyền ở Google), Monarch (time series in-memory), Thrift, Bitcoin, WTF (gợi ý người theo dõi của Twitter), MyRocks và "GoTo Considered Harmful".</p>
${diagram({
  w: 720, h: 380,
  nodes: [
    { id: 'gfs', label: 'GFS', sub: '2003', x: 90, y: 60 },
    { id: 'mr', label: 'MapReduce', sub: '2004', x: 270, y: 60 },
    { id: 'bt', label: 'BigTable', sub: '2006', x: 450, y: 60 },
    { id: 'dy', label: 'Dynamo', sub: '2007', x: 630, y: 60 },
    { id: 'hd', label: 'Hadoop', sub: 'HDFS + MapReduce', x: 180, y: 190, w: 150, kind: 'good' },
    { id: 'hb', label: 'HBase', x: 450, y: 190, kind: 'good' },
    { id: 'cs', label: 'Cassandra', x: 630, y: 190, kind: 'good' },
    { id: 'at', label: 'Transformer', sub: 'Attention, 2017', x: 180, y: 320, w: 150 },
    { id: 'llm', label: 'GPT, LLM', sub: 'ChatGPT', x: 450, y: 320, w: 150, kind: 'good' },
  ],
  edges: [
    { from: 'gfs', to: 'hd' },
    { from: 'mr', to: 'hd' },
    { from: 'bt', to: 'hb' },
    { from: 'bt', to: 'cs' },
    { from: 'dy', to: 'cs' },
    { from: 'at', to: 'llm' },
  ],
  caption: 'Hình: Một số bài báo (hàng trên) và hệ thống mã nguồn mở hoặc sản phẩm chịu ảnh hưởng trực tiếp (màu xanh). Cassandra kết hợp mô hình dữ liệu của BigTable với cách phân tán của Dynamo.',
})}

<h2>15 dự án mã nguồn mở đã thay đổi thế giới</h2>
${tbl(['Lĩnh vực', 'Dự án', 'Đóng góp'], [
  ['Web', 'Node.js, React, Apache HTTP Server', 'JavaScript lên server; nền của nhiều framework web; web server làm mẫu cho nhiều server sau này'],
  ['Dữ liệu', 'PostgreSQL, Redis, Elasticsearch', 'Database quan hệ chất lượng cao miễn phí; kho dữ liệu đa năng; tìm kiếm và phân tích quy mô lớn'],
  ['Công cụ lập trình', 'Git, VSCode, Jupyter Notebook', 'Cộng tác toàn cầu; editor phổ biến; chia sẻ code chạy được kèm biểu đồ và giải thích'],
  ['ML và big data', 'TensorFlow, Apache Spark, Kafka', 'Học máy; xử lý big data; pipeline dữ liệu thời gian thực'],
  ['DevOps', 'Docker, Kubernetes, Linux', 'Đóng gói nhất quán; điều phối container; hệ điều hành phổ cập phát triển phần mềm'],
])}
${tip('<b>Áp dụng.</b> Khi học một công nghệ, hãy đọc bài báo gốc hoặc bài blog kỹ thuật đầu tiên của nó. Bài báo Dynamo giải thích vì sao Cassandra có tunable consistency; bài Kafka giải thích vì sao nó chỉ là một log append-only. Hiểu lý do thiết kế giúp bạn dùng đúng chỗ.')}
${note('<b>Sai lầm thường gặp.</b> Bê nguyên giải pháp của công ty lớn vào hệ thống nhỏ, ví dụ sharding khi dữ liệu mới vài GB. Các chiến lược trên giải những vấn đề có thật ở quy mô của họ. Hãy áp dụng khi số liệu của bạn chỉ ra cần thiết.')}
${interview([
  'Kể tám chiến lược scale phổ biến. Chiến lược nào bạn áp dụng đầu tiên cho một hệ thống đang chậm vì đọc nhiều?',
  'Vì sao service stateless là điều kiện để auto scaling hoạt động tốt?',
  'Pipeline CI của bạn mất 30 phút ở bước checkout. Bạn điều tra thế nào?',
  'Chọn một bài báo hệ phân tán bạn từng đọc và giải thích ý tưởng chính.',
])}`,
  keys: [
    'Tám chiến lược scale: stateless, scale ngang, load balancing, auto scaling, cache, replication, sharding, bất đồng bộ.',
    'Latency là tiền: Amazon từng ước tính mỗi 100 ms làm mất 1% doanh số.',
    'Pinterest giảm clone từ 40 phút xuống 30 giây chỉ bằng cách chỉ định refspec cho nhánh master.',
    'Nhiều công cụ phổ biến (Kafka, React, Kubernetes, Zuul) bắt nguồn từ nhu cầu nội bộ của công ty lớn.',
    'Các bài báo như GFS, MapReduce, Dynamo, BigTable, Attention là nền của hệ sinh thái hiện nay.',
  ],
  quiz: [
    { q: 'Chiến lược nào giúp scale cả ghi lẫn đọc của database?', o: ['Replication', 'Sharding', 'Caching', 'Load balancing'], a: 1, why: 'Replication chủ yếu scale đọc; sharding chia dữ liệu ra nhiều instance nên scale được cả ghi.' },
    { q: 'Thay đổi một dòng của Pinterest là gì?', o: ['Bật shallow clone', 'Thêm refspec chỉ lấy nhánh master', 'Chuyển sang Git LFS', 'Tách monorepo'], a: 1, why: 'Shallow clone đã được bật từ trước; thiếu refspec làm Git fetch hơn 2.500 nhánh ở mỗi build.' },
    { q: 'Kafka được khởi xướng tại công ty nào?', o: ['Google', 'Netflix', 'LinkedIn', 'Meta'], a: 2, why: 'Sách xếp Kafka cùng Samza và Pinot vào nhóm dự án của LinkedIn.' },
    { q: 'Bài báo nào giới thiệu kiến trúc transformer?', o: ['MapReduce', 'Dynamo', 'Attention Is All You Need', 'Raft'], a: 2, why: 'Transformer được giới thiệu trong "Attention Is All You Need" (2017), nền tảng của các LLM.' },
  ],
};

export const lessons: Lesson[] = [vanDe, thongBao, thanhToan, searchEngine, liveStreaming, chatgpt, reddit, netflix, congTyLon];
