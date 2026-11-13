import type { Lesson } from '../../types';
import { cols, diagram, interview, note, seq, tbl, tip } from '../helpers';

/*
 * BÀI MẪU: "cache-loi" là chuẩn chất lượng cho mọi bài học khác
 * (độ dài, số sơ đồ, cấu trúc mục, giọng văn).
 */

export const lessons: Lesson[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'load-balancing',
    mod: 'lb-cache',
    title: 'Thuật toán cân bằng tải',
    pages: [41, 34, 212, 317],
    min: 12,
    level: 'co-ban',
    widget: 'lb',
    lede: 'Load balancer đứng trước một nhóm server và quyết định request tiếp theo đi đâu. Chọn sai thuật toán, một server quá tải trong khi các server khác ngồi chơi.',
    body: `
<h2>Load balancer làm gì</h2>
<p><b>Load balancer</b> là thiết bị hoặc phần mềm phân phối traffic tới nhiều server. Sách tóm tắt bốn việc chính: chia traffic, đảm bảo tính sẵn sàng, cải thiện hiệu năng và giúp scale ứng dụng. Client chỉ biết một địa chỉ duy nhất; phía sau có thể là 3 hay 300 server, thêm bớt lúc nào cũng được.</p>
<p>Để biết server nào còn dùng được, load balancer liên tục chạy <b>health check</b>: gửi request tới một endpoint như <code>/health</code> mỗi vài giây. Server trả lỗi hoặc không trả lời liên tiếp vài lần thì bị loại khỏi pool; khi khỏe lại thì được đưa vào lại.</p>
${diagram({
  w: 720, h: 300,
  nodes: [
    { id: 'c', label: 'Người dùng', x: 80, y: 150, w: 110, kind: 'client' },
    { id: 'lb', label: 'Load balancer', sub: 'health check 5s', x: 290, y: 150, w: 140, h: 56, kind: 'lb' },
    { id: 's1', label: 'Server 1', sub: 'healthy', x: 590, y: 55, h: 56, kind: 'good' },
    { id: 's2', label: 'Server 2', sub: 'healthy', x: 590, y: 150, h: 56, kind: 'good' },
    { id: 's3', label: 'Server 3', sub: '/health lỗi', x: 590, y: 245, h: 56, kind: 'warn' },
  ],
  edges: [
    { from: 'c', to: 'lb' },
    { from: 'lb', to: 's1', label: '50%', kind: 'good' },
    { from: 'lb', to: 's2', label: '50%', kind: 'good' },
    { from: 'lb', to: 's3', label: 'loại khỏi pool', dashed: true, kind: 'warn' },
  ],
  caption: 'Hình: Server 3 không qua health check nên bị loại; traffic được chia lại cho hai server còn khỏe mà người dùng không hề biết.',
})}

<h2>Thuật toán tĩnh</h2>
<p>Thuật toán tĩnh không nhìn vào trạng thái hiện tại của server, chỉ dựa vào quy tắc cố định. Ưu điểm là đơn giản, nhanh, không cần thu thập số liệu.</p>
${tbl(['Thuật toán', 'Cách chọn server', 'Hợp khi'], [
  ['Round robin', 'Lần lượt từng server theo vòng', 'Server giống nhau, service stateless, request tốn công như nhau'],
  ['Sticky round robin', 'Request đầu của Alice tới server A thì các request sau của Alice cũng tới A', 'Ứng dụng giữ session trong RAM của server'],
  ['Weighted round robin', 'Server trọng số cao nhận nhiều request hơn', 'Server cấu hình khác nhau, hoặc chuyển dần traffic sang bản mới'],
  ['Hash', 'Băm IP hoặc URL của request để chọn server', 'Muốn cùng một key luôn tới cùng server, ví dụ để tận dụng cache cục bộ'],
])}
<p>Ví dụ weighted round robin: server A trọng số 3, server B trọng số 1. Trong mỗi 4 request, A nhận 3 và B nhận 1. Đây cũng là cách làm <b>canary release</b>: cho bản mới trọng số 1 và bản cũ trọng số 19 để chỉ 5% traffic chạy thử bản mới.</p>
<p>Hash đơn giản theo kiểu <code>hash(key) mod N</code> có nhược điểm: thêm hoặc bớt một server làm N thay đổi và gần như mọi key bị chuyển sang server khác. <b>Consistent hashing</b> giải quyết vấn đề này, chỉ khoảng 1/N số key phải di chuyển.</p>

<h2>Thuật toán động</h2>
<p>Thuật toán động dựa vào trạng thái thực tế lúc chạy, nên xử lý tốt khi các request tốn công rất khác nhau.</p>
${cols([
  { title: 'Least connections', body: '<p>Gửi request mới tới server đang có ít kết nối đồng thời nhất. Hợp với kết nối dài như WebSocket, hoặc khi có request mất 10 ms và request mất 10 giây lẫn lộn.</p>' },
  { title: 'Least response time', body: '<p>Gửi tới server đang phản hồi nhanh nhất. Tự tránh được server đang chậm vì GC, ổ đĩa hay "hàng xóm ồn ào" trên cùng máy vật lý. Cần đo latency liên tục.</p>' },
])}

<h2>L4 và L7</h2>
<p>Sách phân loại load balancer theo nhiều cách: phần cứng, phần mềm, dịch vụ cloud (AWS Elastic Load Balancer, Google Cloud Load Balancing, Azure Load Balancer), và theo tầng mạng. <b>L4</b> làm việc ở tầng transport, chỉ thấy IP và port TCP/UDP, nên rất nhanh nhưng không hiểu nội dung. <b>L7</b> làm việc ở tầng ứng dụng, đọc được URL, header, cookie, nên định tuyến thông minh hơn. Ngoài ra còn <b>GSLB</b> (Global Server Load Balancing) chia traffic giữa nhiều vùng địa lý, thường thông qua DNS.</p>
${diagram({
  w: 720, h: 300,
  nodes: [
    { id: 'c', label: 'Client', x: 80, y: 150, w: 110, kind: 'client' },
    { id: 'lb', label: 'L7 load balancer', sub: 'kết thúc TLS', x: 300, y: 150, w: 150, h: 56, kind: 'lb' },
    { id: 'a', label: 'API pool', x: 590, y: 55 },
    { id: 's', label: 'Static pool', x: 590, y: 150 },
    { id: 'm', label: 'Mobile backend', x: 590, y: 245, w: 140 },
  ],
  edges: [
    { from: 'c', to: 'lb', label: 'HTTPS' },
    { from: 'lb', to: 'a', label: '/api/*' },
    { from: 'lb', to: 's', label: '/static/*' },
    { from: 'lb', to: 'm', label: 'User-Agent app' },
  ],
  caption: 'Hình: L7 load balancer giải mã HTTPS rồi đọc path và header để chọn nhóm server. L4 không làm được việc này vì không đọc nội dung request.',
})}

<h2>Các use case thực tế</h2>
${tbl(['Use case', 'Ý nghĩa'], [
  ['Xử lý lỗi, sẵn sàng cao', 'Tự chuyển traffic khỏi thành phần hỏng, dịch vụ không gián đoạn'],
  ['Health check', 'Chỉ gửi request tới instance đang hoạt động tốt'],
  ['SSL termination', 'Giải mã TLS tại load balancer, giảm tải CPU cho backend'],
  ['Session persistence', 'Giữ một người dùng trên cùng một server khi ứng dụng cần'],
  ['Routing theo nền tảng', 'Mobile và desktop đi tới backend khác nhau, trả response phù hợp'],
  ['Cross-zone', 'Chia traffic qua nhiều availability zone, tăng khả năng chịu lỗi'],
  ['Scale ngang', 'Thêm server vào pool là có thêm năng lực, client không cần đổi gì'],
])}
${diagram({
  w: 720, h: 320,
  groups: [
    { x: 90, y: 100, w: 220, h: 205, label: 'Availability Zone A' },
    { x: 410, y: 100, w: 220, h: 205, label: 'Availability Zone B' },
  ],
  nodes: [
    { id: 'c', label: 'Client', x: 360, y: 40, w: 120, kind: 'client' },
    { id: 'la', label: 'LB node A', x: 200, y: 160, kind: 'lb' },
    { id: 'lb', label: 'LB node B', x: 520, y: 160, kind: 'lb' },
    { id: 'ta', label: '2 instance', x: 200, y: 260 },
    { id: 'tb', label: '8 instance', x: 520, y: 260 },
  ],
  edges: [
    { from: 'c', to: 'la', label: '50%' },
    { from: 'c', to: 'lb', label: '50%' },
    { from: 'la', to: 'ta' },
    { from: 'lb', to: 'tb' },
    { from: 'la', to: 'tb', dashed: true, kind: 'muted' },
    { from: 'lb', to: 'ta', dashed: true, kind: 'muted' },
  ],
  caption: 'Hình: Không bật cross-zone, mỗi instance ở zone A nhận 25% traffic còn ở zone B chỉ 6,25%. Bật cross-zone (nét đứt), cả 10 instance đều nhận 10%.',
})}
${tip('<b>Thực tế.</b> Trên AWS, Application Load Balancer là L7 (route theo path, host, header), còn Network Load Balancer là L4 (xử lý hàng triệu request mỗi giây với latency rất thấp). ALB bật cross-zone mặc định, còn NLB tắt mặc định; nếu số instance giữa các zone lệch nhau mà quên bật thì tải sẽ lệch như hình trên.')}
${note('<b>Sai lầm thường gặp.</b> Dùng sticky session để che giấu việc lưu session trong RAM server. Tải bị lệch khi vài người dùng "nặng" dính vào một server, và khi server đó chết thì mọi người dùng trên đó mất phiên. Tốt hơn là đưa session ra Redis để service thật sự stateless, rồi dùng round robin hoặc least connections.')}
${interview([
  'Các request của hệ thống có thời gian xử lý từ 5 ms đến 30 giây. Bạn chọn thuật toán cân bằng tải nào? Vì sao round robin không ổn?',
  'Khác biệt giữa L4 và L7 load balancer là gì? Khi nào chấp nhận dùng L4?',
  'Load balancer cũng có thể chết. Làm sao để nó không thành điểm lỗi duy nhất?',
])}`,
    keys: [
      'Tĩnh: round robin, sticky, weighted, hash. Động: least connections, least response time.',
      'Health check liên tục loại server hỏng khỏi pool; đây là nền tảng của tính sẵn sàng cao.',
      'L4 nhanh, chỉ thấy IP và port; L7 đọc URL, header, cookie nên route thông minh hơn và kết thúc TLS được.',
      'Cross-zone giúp chia đều tải khi số instance giữa các zone lệch nhau.',
    ],
    quiz: [
      { q: 'Server A mạnh gấp ba server B. Thuật toán nào tận dụng tốt nhất?', o: ['Round robin', 'Weighted round robin', 'IP hash', 'Sticky round robin'], a: 1, why: 'Đặt trọng số 3 cho A và 1 cho B để A nhận ba phần tư số request.' },
      { q: 'Thuật toán nào thuộc nhóm động?', o: ['Round robin', 'Hash', 'Least connections', 'Weighted round robin'], a: 2, why: 'Least connections cần biết số kết nối hiện tại của mỗi server, tức là trạng thái lúc chạy.' },
      { q: 'Muốn gửi /api/* và /static/* tới hai nhóm server khác nhau, cần loại load balancer nào?', o: ['L4', 'L7', 'DNS round robin', 'Phần cứng L2'], a: 1, why: 'Chỉ L7 đọc được URL path. L4 chỉ thấy IP và port.' },
      { q: 'Zone A có 2 instance, zone B có 8, không bật cross-zone, traffic chia đều hai zone. Mỗi instance ở zone A nhận bao nhiêu traffic?', o: ['10%', '12,5%', '25%', '50%'], a: 2, why: 'Zone A nhận 50% và chia cho 2 instance, nên mỗi instance nhận 25%.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'cache',
    mod: 'lb-cache',
    title: 'Cache nằm ở đâu và chiến lược eviction',
    pages: [75, 198, 275],
    min: 12,
    level: 'co-ban',
    widget: 'cache',
    lede: 'Dữ liệu được cache ở gần như mọi tầng, từ trình duyệt tới bên trong database. Vì cache luôn nhỏ hơn dữ liệu gốc, câu hỏi tiếp theo là khi đầy thì bỏ cái gì.',
    body: `
<h2>Cache ở khắp nơi</h2>
<p><b>Cache</b> là bản sao dữ liệu đặt ở nơi đọc nhanh hơn, gần người dùng hơn. Đọc RAM nhanh hơn đọc SSD hàng trăm lần, và đọc từ CDN cách người dùng 10 km nhanh hơn nhiều so với gọi về data center ở châu lục khác. Sách liệt kê tám chỗ dữ liệu được cache dọc theo đường đi của một request.</p>
${diagram({
  w: 720, h: 250,
  nodes: [
    { id: 'b', label: 'Trình duyệt', sub: 'Cache-Control', x: 90, y: 65, w: 130, h: 56, kind: 'client' },
    { id: 'cdn', label: 'CDN', sub: 'tài nguyên tĩnh', x: 270, y: 65, w: 130, h: 56, kind: 'cache' },
    { id: 'lb', label: 'Load balancer', sub: 'response', x: 450, y: 65, w: 130, h: 56, kind: 'lb' },
    { id: 'mq', label: 'Broker', sub: 'Kafka', x: 630, y: 65, w: 130, h: 56, kind: 'queue' },
    { id: 'sv', label: 'Service', sub: 'CPU cache, RAM', x: 630, y: 185, w: 130, h: 56 },
    { id: 'dc', label: 'Distributed', sub: 'Redis', x: 450, y: 185, w: 130, h: 56, kind: 'cache' },
    { id: 'es', label: 'Full-text search', sub: 'Elasticsearch', x: 270, y: 185, w: 130, h: 56 },
    { id: 'db', label: 'Database', sub: 'buffer pool', x: 90, y: 185, w: 130, h: 60, kind: 'store' },
  ],
  edges: [
    { from: 'b', to: 'cdn' },
    { from: 'cdn', to: 'lb' },
    { from: 'lb', to: 'mq' },
    { from: 'mq', to: 'sv' },
    { from: 'sv', to: 'dc' },
    { from: 'dc', to: 'es' },
    { from: 'es', to: 'db' },
  ],
  caption: 'Hình: Tám tầng cache theo sách, từ phía người dùng tới tận database.',
})}
<ol>
<li><b>Trình duyệt:</b> response HTTP kèm thời hạn trong header (<code>Cache-Control: max-age=3600</code>). Lần sau trình duyệt dùng bản lưu sẵn, không gọi mạng.</li>
<li><b>CDN:</b> lưu ảnh, CSS, JavaScript, video ở máy chủ gần người dùng.</li>
<li><b>Load balancer:</b> một số load balancer và reverse proxy cache được response.</li>
<li><b>Message broker:</b> Kafka ghi message xuống đĩa và giữ trong một khoảng thời gian theo chính sách retention, consumer đọc theo tốc độ của mình.</li>
<li><b>Service:</b> nhiều tầng nhỏ: CPU cache, RAM của process, đôi khi có cache cấp hai trên đĩa cục bộ.</li>
<li><b>Distributed cache:</b> Redis hoặc Memcached giữ key-value trong RAM, dùng chung cho nhiều service, đọc ghi nhanh hơn database nhiều.</li>
<li><b>Full-text search:</b> Elasticsearch giữ một bản sao dữ liệu đã đánh index để tìm kiếm tài liệu và log.</li>
<li><b>Database:</b> buffer pool giữ các trang dữ liệu nóng trong RAM; materialized view lưu sẵn kết quả query; WAL, transaction log, replication log ghi lại thay đổi trước khi áp dụng.</li>
</ol>

<h2>Tám chiến lược eviction</h2>
<p>Khi cache đầy, phải loại bớt phần tử để có chỗ cho phần tử mới. Chiến lược loại bỏ (eviction) quyết định tỉ lệ cache hit, nên ảnh hưởng trực tiếp tới tải của database.</p>
${tbl(['Chiến lược', 'Loại bỏ phần tử nào', 'Hợp khi'], [
  ['LRU (Least Recently Used)', 'Lâu nhất chưa được truy cập', 'Mặc định tốt cho đa số trường hợp: thứ vừa dùng dễ được dùng lại'],
  ['MRU (Most Recently Used)', 'Vừa được truy cập gần nhất', 'Quét tuần tự lặp lại, thứ vừa đọc xong sẽ lâu nữa mới cần lại'],
  ['SLRU (Segmented LRU)', 'Chia vùng thử việc và vùng bảo vệ; phần tử mới vào vùng thử việc, được truy cập lần nữa thì lên vùng bảo vệ', 'Chống một lần quét lớn đẩy hết dữ liệu nóng ra ngoài'],
  ['LFU (Least Frequently Used)', 'Ít được truy cập nhất', 'Tập dữ liệu nóng ổn định lâu dài'],
  ['FIFO', 'Vào sớm nhất, bất kể được dùng nhiều hay ít', 'Cần đơn giản tối đa'],
  ['TTL', 'Hết thời gian sống (không hẳn là thuật toán eviction)', 'Dữ liệu cần làm mới định kỳ'],
  ['Two-tiered', 'Tầng 1 trong RAM của service, tầng 2 là distributed cache', 'Dữ liệu cực nóng, muốn tránh cả vòng gọi mạng tới Redis'],
  ['RR (Random Replacement)', 'Chọn ngẫu nhiên', 'Không muốn tốn công theo dõi truy cập'],
])}
<p>LRU phổ biến vì cài đặt được với độ phức tạp O(1) cho cả đọc và ghi, bằng cách kết hợp hash map với danh sách liên kết đôi.</p>
${diagram({
  w: 720, h: 240,
  nodes: [
    { id: 'm', label: 'HashMap', sub: 'key → node', x: 300, y: 55, w: 150, h: 56, kind: 'lb' },
    { id: 'a', label: 'A', sub: 'mới dùng nhất', x: 110, y: 180, w: 130, h: 56, kind: 'good' },
    { id: 'b', label: 'B', x: 300, y: 180, w: 130 },
    { id: 'c', label: 'C', sub: 'lâu nhất', x: 490, y: 180, w: 130, h: 56, kind: 'warn' },
    { id: 'x', label: 'Bị loại\nkhi đầy', x: 650, y: 180, w: 90, h: 56, kind: 'external' },
  ],
  edges: [
    { from: 'm', to: 'a', dashed: true, kind: 'muted' },
    { from: 'm', to: 'b', dashed: true, kind: 'muted' },
    { from: 'm', to: 'c', dashed: true, kind: 'muted' },
    { from: 'a', to: 'b', both: true },
    { from: 'b', to: 'c', both: true },
    { from: 'c', to: 'x', kind: 'warn' },
  ],
  caption: 'Hình: LRU cache. HashMap tìm node trong O(1); mỗi lần truy cập, node được chuyển lên đầu danh sách; khi đầy, node ở cuối bị loại.',
})}
<p>Redis không chạy LRU chính xác mà dùng LRU xấp xỉ: lấy mẫu vài key ngẫu nhiên rồi loại key cũ nhất trong mẫu, tiết kiệm bộ nhớ theo dõi. Cấu hình bằng <code>maxmemory-policy</code>, ví dụ <code>allkeys-lru</code> hoặc <code>allkeys-lfu</code>.</p>

<h2>Netflix dùng cache thế nào</h2>
<p>Mục tiêu của Netflix là giữ người xem ở lại, trong khi sự chú ý trung bình của người dùng chỉ khoảng 90 giây. Netflix dùng <b>EVCache</b>, một kho key-value phân tán xây trên Memcached, để giảm latency. Sách nêu bốn cách dùng:</p>
${diagram({
  w: 720, h: 320,
  nodes: [
    { id: 'pre', label: 'Precompute\nhằng đêm', x: 110, y: 55, w: 140, h: 56 },
    { id: 'pub', label: 'Publisher\nchuỗi UI', x: 610, y: 55, w: 140, h: 56 },
    { id: 'e', label: 'EVCache', sub: 'Memcached', x: 360, y: 160, w: 150, h: 56, kind: 'cache' },
    { id: 'play', label: 'Playback\nservice', x: 610, y: 160, w: 140, h: 56 },
    { id: 'sv', label: 'Online service', x: 110, y: 265, w: 140, kind: 'client' },
    { id: 'db', label: 'Cassandra', x: 610, y: 265, w: 140, kind: 'store' },
  ],
  edges: [
    { from: 'sv', to: 'e', label: '1', both: true },
    { from: 'play', to: 'e', label: '2', both: true },
    { from: 'pre', to: 'e', label: '3' },
    { from: 'pub', to: 'e', label: '4' },
    { from: 'sv', to: 'db', label: 'miss', dashed: true },
  ],
  caption: 'Hình: Bốn vai trò của EVCache: (1) lookaside cache, (2) kho dữ liệu tạm, (3) kho chính cho dữ liệu tính sẵn, (4) dữ liệu truy cập rất nhiều.',
})}
<ol>
<li><b>Lookaside cache:</b> service đọc EVCache trước, miss thì gọi backend và Cassandra rồi cập nhật cache.</li>
<li><b>Kho dữ liệu tạm (transient):</b> thông tin phiên phát video. Service này mở phiên, service khác cập nhật, cuối cùng phiên được đóng.</li>
<li><b>Kho chính (primary store):</b> mỗi đêm hệ thống tính sẵn trang chủ cho từng profile dựa trên lịch sử xem và gợi ý, ghi thẳng vào EVCache để service online đọc.</li>
<li><b>Dữ liệu truy cập rất nhiều:</b> chuỗi giao diện và bản dịch, được một process riêng tính rồi đẩy vào EVCache bất đồng bộ.</li>
</ol>
${tip('<b>Thực tế.</b> Vai trò thứ ba cho thấy cache không chỉ là bản sao của database. Với trang chủ cá nhân hóa của Netflix, EVCache là nơi duy nhất service online đọc dữ liệu; nếu mất thì phải chạy lại job tính toán, nên cụm cache được nhân bản qua nhiều zone.')}
${note('<b>Sai lầm thường gặp.</b> Cache ở nhiều tầng với TTL không phối hợp: trình duyệt 1 giờ, CDN 1 ngày, Redis 10 phút. Khi cập nhật giá sản phẩm, Redis đã mới nhưng CDN vẫn trả giá cũ suốt cả ngày. Mỗi tầng cache cần một cách làm mất hiệu lực (invalidate) rõ ràng.')}
${interview([
  'Dữ liệu được cache ở nhiều tầng như vậy. Khi người dùng yêu cầu xóa dữ liệu cá nhân, làm sao đảm bảo nó bị xóa khỏi mọi nơi?',
  'Cài đặt LRU cache với get và put đều O(1). Bạn dùng cấu trúc dữ liệu gì?',
  'Khi nào LFU tốt hơn LRU, và khi nào LFU tệ hơn?',
])}`,
    keys: [
      'Cache có ở tám tầng: trình duyệt, CDN, load balancer, broker, service, distributed cache, search, database.',
      'LRU là mặc định tốt; LFU hợp với dữ liệu nóng ổn định; SLRU chống bị quét lớn đẩy dữ liệu nóng ra.',
      'LRU O(1) dùng hash map kết hợp danh sách liên kết đôi; Redis dùng LRU xấp xỉ bằng lấy mẫu.',
      'Netflix EVCache có bốn vai trò: lookaside, dữ liệu tạm, kho chính, dữ liệu truy cập cao.',
    ],
    quiz: [
      { q: 'Cache dung lượng 2, đang có [A, B], A vừa được truy cập. Thêm C với LRU thì phần tử nào bị loại?', o: ['A', 'B', 'C', 'Không loại'], a: 1, why: 'B là phần tử lâu nhất chưa được dùng nên LRU loại B.' },
      { q: 'FIFO khác LRU ở điểm nào?', o: ['FIFO không quan tâm phần tử có được truy cập lại hay không', 'FIFO loại phần tử mới nhất', 'FIFO dùng tần suất truy cập', 'Không khác'], a: 0, why: 'FIFO chỉ xét thứ tự vào. Một phần tử được dùng liên tục vẫn bị loại nếu nó vào sớm nhất.' },
      { q: 'Netflix tính sẵn trang chủ mỗi đêm và ghi vào EVCache cho service online đọc. Đây là vai trò nào?', o: ['Lookaside cache', 'Transient data store', 'Primary store', 'Two-tiered cache'], a: 2, why: 'Dữ liệu tính sẵn chỉ nằm trong EVCache và được đọc trực tiếp từ đó, nên EVCache là kho chính.' },
      { q: 'Trong SLRU, phần tử mới được đặt vào đâu?', o: ['Vùng bảo vệ', 'Vùng thử việc', 'Bị loại ngay', 'Đĩa'], a: 1, why: 'Phần tử mới vào vùng thử việc và chỉ được lên vùng bảo vệ khi được truy cập lại.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'cache-chien-luoc',
    mod: 'lb-cache',
    title: 'Chiến lược đọc/ghi cache và Redis',
    pages: [153, 75],
    min: 13,
    level: 'trung-binh',
    lede: 'Đặt cache vào hệ thống nghĩa là có hai bản dữ liệu. Chiến lược đọc ghi quyết định ai cập nhật bản nào, theo thứ tự nào, và bạn chấp nhận lệch dữ liệu tới mức nào.',
    body: `
<h2>Hai câu hỏi khi dùng cache</h2>
<p>Khi đọc: miss thì ai đi lấy dữ liệu từ database, ứng dụng hay chính cache? Khi ghi: ghi vào đâu trước, và có chờ cả hai nơi ghi xong mới trả lời không? Năm chiến lược phổ biến là năm cách trả lời khác nhau cho hai câu hỏi này.</p>

<h2>Chiến lược đọc: cache-aside và read-through</h2>
${seq({
  actors: [
    { id: 'a', label: 'Ứng dụng' },
    { id: 'c', label: 'Cache', kind: 'cache' },
    { id: 'd', label: 'Database', kind: 'store' },
  ],
  msgs: [
    { note: 'Cache-aside: ứng dụng tự điều phối' },
    { from: 'a', to: 'c', label: 'GET user:7 (miss)' },
    { from: 'a', to: 'd', label: 'SELECT * FROM users WHERE id = 7' },
    { from: 'd', to: 'a', label: 'row', dashed: true },
    { from: 'a', to: 'c', label: 'SET user:7 EX 600' },
    { note: 'Read-through: cache tự nạp từ database' },
    { from: 'a', to: 'c', label: 'get(user:7)' },
    { from: 'c', to: 'd', label: 'miss: loader đọc database' },
    { from: 'd', to: 'c', label: 'row', dashed: true },
    { from: 'c', to: 'a', label: 'value', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Cache-aside đặt logic nạp cache trong code ứng dụng. Read-through giao việc đó cho thư viện hoặc dịch vụ cache.',
})}
<p><b>Cache-aside</b> (lazy loading) phổ biến nhất vì dùng được với bất kỳ cache nào, kể cả Redis thuần, và cache chỉ chứa dữ liệu thực sự được đọc. Nếu cache sập, ứng dụng vẫn đọc thẳng database được. Nhược điểm là lần đọc đầu luôn miss, và code nạp cache lặp lại ở nhiều nơi.</p>
<p><b>Read-through</b> giống cache-aside về luồng dữ liệu, nhưng logic nằm trong tầng cache. Ứng dụng chỉ gọi <code>get()</code>; thư viện như Caffeine <code>LoadingCache</code> hoặc dịch vụ như Amazon DAX (trước DynamoDB) tự đọc database khi miss. Code gọn hơn nhưng phụ thuộc vào cache có hỗ trợ cơ chế này.</p>

<h2>Chiến lược ghi: write-through, write-behind, write-around</h2>
${seq({
  actors: [
    { id: 'a', label: 'Ứng dụng' },
    { id: 'c', label: 'Cache', kind: 'cache' },
    { id: 'd', label: 'Database', kind: 'store' },
  ],
  msgs: [
    { note: 'Write-through: ghi đồng bộ cả hai' },
    { from: 'a', to: 'c', label: 'SET price:42 = 99' },
    { from: 'c', to: 'd', label: 'UPDATE (đồng bộ)' },
    { from: 'c', to: 'a', label: 'OK sau khi DB xong', dashed: true },
    { note: 'Write-behind: trả lời ngay, ghi DB sau theo lô' },
    { from: 'a', to: 'c', label: 'INCR views:42' },
    { from: 'c', to: 'a', label: 'OK ngay', dashed: true, kind: 'good' },
    { from: 'c', to: 'd', label: 'vài giây sau: ghi gộp 1.000 lần tăng', kind: 'warn' },
    { note: 'Write-around: ghi thẳng DB, bỏ qua cache' },
    { from: 'a', to: 'd', label: 'UPDATE users SET ...' },
    { from: 'a', to: 'c', label: 'DEL user:7' },
  ],
  caption: 'Hình: Ba chiến lược ghi. Write-behind nhanh nhất nhưng có thể mất dữ liệu nếu cache chết trước khi kịp ghi xuống database.',
})}
${tbl(['Chiến lược', 'Ghi vào', 'Ưu điểm', 'Nhược điểm', 'Hợp với'], [
  ['Cache-aside', 'Ứng dụng tự đọc DB khi miss', 'Đơn giản, cache sập vẫn chạy', 'Miss lần đầu, có thể lệch dữ liệu', 'Đa số hệ thống đọc nhiều'],
  ['Read-through', 'Cache tự nạp khi miss', 'Code ứng dụng gọn', 'Cần cache hỗ trợ loader', 'Thư viện cache trong process'],
  ['Write-through', 'Cache và DB đồng bộ', 'Cache luôn mới', 'Ghi chậm hơn, cache chứa cả dữ liệu không ai đọc', 'Dữ liệu ghi xong đọc ngay'],
  ['Write-behind', 'Cache trước, DB sau theo lô', 'Ghi cực nhanh, giảm tải DB', 'Mất dữ liệu nếu cache chết', 'Bộ đếm lượt xem, like, metric'],
  ['Write-around', 'Chỉ DB, xóa key trong cache', 'Không làm bẩn cache bằng dữ liệu hiếm đọc', 'Lần đọc sau chắc chắn miss', 'Log, dữ liệu ghi nhiều đọc ít'],
])}

<h2>Vấn đề nhất quán</h2>
<p>Có hai bản dữ liệu thì luôn có khả năng chúng lệch nhau. Quy tắc quan trọng nhất với cache-aside: khi ghi, <b>cập nhật database trước rồi xóa key trong cache</b>, không ghi giá trị mới vào cache. Lý do: nếu hai request cùng ghi và cùng cập nhật cache, thứ tự tới cache có thể đảo ngược thứ tự tới database, để lại giá trị cũ trong cache vô thời hạn. Lệnh xóa thì idempotent, đảo thứ tự cũng không sao.</p>
<p>Ngay cả cách "ghi DB rồi xóa cache" vẫn còn một khe hở hiếm gặp. Request đọc A bị miss và đọc được giá trị cũ từ database; request ghi B cập nhật database và xóa cache; sau đó A mới ghi giá trị cũ vào cache. Cache giữ dữ liệu cũ cho tới khi hết TTL.</p>
${tbl(['Biện pháp', 'Cách làm'], [
  ['Luôn đặt TTL', 'Lưới an toàn cuối cùng: dữ liệu lệch tự hết sau vài phút'],
  ['Xóa hai lần có trễ', 'Xóa key ngay sau khi ghi, rồi xóa lần nữa sau vài trăm ms để dọn giá trị cũ bị ghi chen vào'],
  ['Invalidate theo CDC', 'Một process đọc binlog hoặc WAL của database và xóa key tương ứng, không phụ thuộc vào code ứng dụng'],
  ['Ghi kèm version', 'Chỉ ghi vào cache nếu version mới hơn version đang có'],
])}

<h2>Kiến trúc Redis đã tiến hóa thế nào</h2>
<p>Redis là cache phổ biến nhất hiện nay. Kiến trúc của nó lớn dần theo đúng các vấn đề người dùng gặp phải.</p>
${diagram({
  w: 720, h: 250,
  nodes: [
    { id: 's', label: 'Standalone', sub: '2010, Redis 1.0', x: 110, y: 65, w: 150, h: 56 },
    { id: 'p', label: 'Persistence', sub: 'RDB + AOF', x: 360, y: 65, w: 150, h: 56, kind: 'store' },
    { id: 'r', label: 'Replication', sub: 'primary → replica', x: 610, y: 65, w: 150, h: 56 },
    { id: 'se', label: 'Sentinel', sub: 'tự động failover', x: 610, y: 185, w: 150, h: 56, kind: 'lb' },
    { id: 'cl', label: 'Cluster', sub: '2015, 16384 slot', x: 360, y: 185, w: 150, h: 56, kind: 'cache' },
    { id: 'f', label: 'Redis 5 và 6', sub: 'Stream, I/O đa luồng', x: 110, y: 185, w: 150, h: 56, kind: 'good' },
  ],
  edges: [
    { from: 's', to: 'p' },
    { from: 'p', to: 'r' },
    { from: 'r', to: 'se' },
    { from: 'se', to: 'cl' },
    { from: 'cl', to: 'f' },
  ],
  caption: 'Hình: Mỗi bước tiến hóa của Redis giải quyết một giới hạn của bước trước: mất dữ liệu, một node chết, failover thủ công, giới hạn RAM của một máy.',
})}
<ol>
<li><b>Standalone (2010):</b> một instance làm cache cho ứng dụng. Dữ liệu nằm trong RAM nên restart là mất hết, và toàn bộ traffic đổ xuống database.</li>
<li><b>Persistence:</b> RDB chụp snapshot bộ nhớ định kỳ xuống đĩa; AOF (Append-Only File) ghi lại từng lệnh ghi. Restart thì nạp lại từ đĩa.</li>
<li><b>Replication:</b> primary nhận đọc ghi, replica đồng bộ dữ liệu từ primary và có thể phục vụ đọc.</li>
<li><b>Sentinel:</b> một nhóm process giám sát các instance, gửi thông báo, tự động đưa replica lên làm primary khi primary chết, và cho client biết primary hiện tại ở đâu.</li>
<li><b>Cluster (Redis 3.0, 2015):</b> chia dữ liệu thành 16384 hash slot, mỗi node giữ một phần. Key thuộc slot <code>CRC16(key) mod 16384</code>. Dung lượng và throughput tăng theo số node.</li>
<li><b>Về sau:</b> Redis 5.0 (2018) thêm kiểu dữ liệu Stream; Redis 6.0 (2020) dùng nhiều thread cho phần I/O mạng, vì phần này dần thành nút thắt, trong khi phần thực thi lệnh vẫn đơn luồng.</li>
</ol>
<p>Sách gắn ba mốc persistence, replication và Sentinel với Redis 2.8 năm 2013. Thực ra RDB và AOF đã có từ các bản 1.x; bản 2.8 mang lại Sentinel ổn định và lệnh PSYNC cho replica đồng bộ lại một phần sau khi mất kết nối, thay vì phải chép lại toàn bộ dữ liệu.</p>
${tip('<b>Thực tế.</b> Facebook dùng Memcached theo kiểu look-aside và chọn xóa key thay vì cập nhật khi dữ liệu thay đổi, vì lệnh xóa idempotent. Việc xóa được kích hoạt bởi một process đọc commit log của MySQL rồi phát lệnh invalidate tới các cụm cache, đúng mô hình invalidate theo CDC ở trên.')}
${note('<b>Sai lầm thường gặp.</b> Dùng write-behind cho dữ liệu không được phép mất như số dư tài khoản hay trạng thái đơn hàng. Write-behind chỉ hợp với dữ liệu chấp nhận mất vài giây gần nhất, như lượt xem hay số like.')}
${interview([
  'Khi cập nhật dữ liệu, bạn xóa cache hay ghi giá trị mới vào cache? Xóa trước hay sau khi ghi database? Giải thích các race condition.',
  'Thiết kế bộ đếm lượt xem video cho 1 tỉ lượt mỗi ngày. Bạn chọn chiến lược ghi nào?',
  'Redis Sentinel và Redis Cluster giải quyết hai bài toán khác nhau thế nào?',
  'Một node trong Redis Cluster chết. Chuyện gì xảy ra với các key thuộc slot của node đó?',
])}`,
    keys: [
      'Cache-aside phổ biến nhất: đọc cache, miss thì đọc DB rồi ghi cache. Read-through giao việc nạp cho tầng cache.',
      'Write-through nhất quán nhưng ghi chậm; write-behind nhanh nhưng có thể mất dữ liệu; write-around tránh làm bẩn cache.',
      'Khi ghi: cập nhật database trước rồi xóa key, luôn kèm TTL làm lưới an toàn.',
      'Redis tiến hóa: standalone, persistence, replication, Sentinel, rồi Cluster với 16384 hash slot.',
    ],
    quiz: [
      { q: 'Chiến lược nào trả lời ứng dụng ngay sau khi ghi cache và ghi database sau theo lô?', o: ['Write-through', 'Write-behind', 'Write-around', 'Cache-aside'], a: 1, why: 'Write-behind (write-back) ghi cache trước, gom các thay đổi rồi ghi bất đồng bộ xuống database.' },
      { q: 'Với cache-aside, khi cập nhật dữ liệu nên làm gì với cache?', o: ['Ghi giá trị mới vào cache trước khi ghi DB', 'Cập nhật DB rồi xóa key trong cache', 'Không làm gì, chờ TTL', 'Xóa toàn bộ cache'], a: 1, why: 'Xóa key là thao tác idempotent nên không bị lỗi do đảo thứ tự giữa các request ghi; lần đọc sau sẽ nạp giá trị mới.' },
      { q: 'Redis Cluster chia dữ liệu thành bao nhiêu hash slot?', o: ['1024', '4096', '16384', '65536'], a: 2, why: 'Redis Cluster dùng 16384 slot; key thuộc slot CRC16(key) mod 16384.' },
      { q: 'Thành phần nào của Redis tự động đưa replica lên làm primary khi primary chết?', o: ['AOF', 'RDB', 'Sentinel', 'Stream'], a: 2, why: 'Sentinel giám sát instance, thông báo, tự động failover và cung cấp địa chỉ primary hiện tại cho client.' },
    ],
  },

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
