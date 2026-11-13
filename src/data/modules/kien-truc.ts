import type { Lesson } from '../../types';
import { cols, diagram, interview, note, tbl, tip } from '../helpers';

export const lessons: Lesson[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'microservices',
    mod: 'kien-truc',
    title: 'Microservices: cấu trúc và best practice',
    pages: [267, 101, 160, 305],
    min: 11,
    level: 'trung-binh',
    lede: 'Microservices chia một ứng dụng lớn thành nhiều service nhỏ, mỗi service tự deploy và tự sở hữu dữ liệu. Sự linh hoạt đó đi kèm toàn bộ độ phức tạp của một hệ phân tán, nên cần nắm rõ các thành phần và nguyên tắc trước khi quyết định tách.',
    body: `
<h2>Microservices giải quyết vấn đề gì</h2>
<p>Một ứng dụng <b>monolith</b> gom mọi chức năng (đặt hàng, thanh toán, người dùng, thông báo) vào một codebase và một lần deploy. Khi đội nhỏ, cách này nhanh và dễ debug. Khi đội lên tới hàng chục hoặc hàng trăm kỹ sư, mỗi lần release phải chờ tất cả cùng xong, một lỗi nhỏ ở module báo cáo có thể làm sập cả trang thanh toán, và không thể scale riêng phần đang chịu tải.</p>
<p><b>Microservices</b> tách ứng dụng theo năng lực nghiệp vụ. Mỗi service do một đội sở hữu, có database riêng, giao tiếp với service khác qua API hoặc message, và được build, test, deploy độc lập. Mục tiêu chính là để các đội đi nhanh mà không giẫm chân nhau.</p>

<h2>Kiến trúc điển hình: đường đi của một request</h2>
${diagram({
  w: 720, h: 320,
  nodes: [
    { id: 'c', label: 'Client', x: 70, y: 150, w: 100, kind: 'client' },
    { id: 'cdn', label: 'CDN', sub: 'file tĩnh', x: 230, y: 265, kind: 'cache' },
    { id: 'lb', label: 'Load balancer', x: 230, y: 150, w: 130, kind: 'lb' },
    { id: 'gw', label: 'API Gateway', x: 420, y: 150, w: 130, kind: 'lb' },
    { id: 'idp', label: 'Identity\nProvider', x: 420, y: 50, h: 56 },
    { id: 'reg', label: 'Service registry', sub: 'Consul, Eureka', x: 420, y: 265, w: 140 },
    { id: 'a', label: 'Order service', x: 630, y: 90 },
    { id: 'b', label: 'User service', x: 630, y: 210 },
  ],
  edges: [
    { from: 'c', to: 'cdn', label: 'tĩnh', dashed: true },
    { from: 'c', to: 'lb', label: '1' },
    { from: 'lb', to: 'gw', label: '2' },
    { from: 'gw', to: 'idp', label: '3' },
    { from: 'gw', to: 'reg', label: '4' },
    { from: 'gw', to: 'a', label: '5' },
    { from: 'gw', to: 'b', dashed: true },
  ],
  caption: 'Hình: Request đi qua load balancer và API Gateway; gateway xác thực với Identity Provider, tra registry để tìm instance rồi chuyển tới service đích.',
})}
<ol>
<li><b>Load balancer</b> nhận traffic từ client và rải đều cho các instance của gateway. Nội dung tĩnh (ảnh, JS, CSS) được client lấy từ <b>CDN</b> gần nhất, không chạm vào backend.</li>
<li><b>API Gateway</b> là cổng vào duy nhất: định tuyến theo path, giới hạn tốc độ, gom response, chuyển đổi giao thức.</li>
<li>Gateway hỏi <b>Identity Provider</b> (Keycloak, Okta, Azure AD) để xác thực token và kiểm tra quyền.</li>
<li>Gateway tra <b>service registry</b> để biết service đích đang chạy ở những địa chỉ nào. Mỗi instance tự đăng ký khi khởi động và gửi heartbeat định kỳ.</li>
<li>Request tới đúng service. Mỗi service thuộc một domain và có database riêng.</li>
</ol>

<h2>Bên trong: dữ liệu riêng, message và khả năng quan sát</h2>
<p>Phía sau gateway, các service nói chuyện với nhau theo hai kiểu. Gọi đồng bộ (REST, gRPC) khi cần câu trả lời ngay. Gửi sự kiện bất đồng bộ qua message broker khi bên gửi không cần chờ, ví dụ "đơn hàng đã tạo" để service thanh toán và thông báo tự xử lý.</p>
${diagram({
  w: 720, h: 380,
  groups: [
    { x: 30, y: 20, w: 200, h: 245, label: 'Domain: Order' },
    { x: 490, y: 20, w: 200, h: 245, label: 'Domain: Payment' },
  ],
  nodes: [
    { id: 'os', label: 'Order service', x: 130, y: 85 },
    { id: 'odb', label: 'Order DB', sub: 'PostgreSQL', x: 130, y: 200, kind: 'store' },
    { id: 'k', label: 'Kafka', sub: 'message broker', x: 360, y: 85, w: 150, kind: 'queue' },
    { id: 'rc', label: 'Redis', sub: 'distributed cache', x: 360, y: 200, w: 150, kind: 'cache' },
    { id: 'ps', label: 'Payment service', x: 590, y: 85, w: 130 },
    { id: 'pdb', label: 'Payment DB', sub: 'MySQL', x: 590, y: 200, kind: 'store' },
    { id: 'obs', label: 'Prometheus + ELK', sub: 'metrics, log, trace', x: 360, y: 320, w: 200 },
  ],
  edges: [
    { from: 'os', to: 'k', label: 'OrderCreated' },
    { from: 'k', to: 'ps', label: 'subscribe' },
    { from: 'os', to: 'odb' },
    { from: 'ps', to: 'pdb' },
    { from: 'os', to: 'rc', dashed: true },
    { from: 'os', to: 'obs', dashed: true, kind: 'muted' },
    { from: 'ps', to: 'obs', dashed: true, kind: 'muted' },
  ],
  caption: 'Hình: Mỗi domain sở hữu database riêng. Service giao tiếp bất đồng bộ qua Kafka, dùng chung cache phân tán và đẩy metrics, log về hệ thống quan sát tập trung.',
})}
<p>Sách liệt kê 9 thành phần của một ứng dụng microservices chạy production:</p>
${tbl(['Thành phần', 'Vai trò', 'Công cụ ví dụ'], [
  ['API Gateway', 'Cổng vào thống nhất: routing, filter, load balancing', 'Kong, Spring Cloud Gateway'],
  ['Service registry', 'Danh bạ các service để gateway và service khác tìm nhau', 'Consul, Eureka, ZooKeeper'],
  ['Service layer', 'Mỗi service phục vụ một chức năng nghiệp vụ, chạy nhiều instance', 'Spring Boot, NestJS'],
  ['Authorization server', 'Quản lý danh tính và quyền truy cập', 'Keycloak, Azure AD, Okta'],
  ['Data storage', 'Lưu dữ liệu của từng service', 'PostgreSQL, MySQL'],
  ['Distributed cache', 'Giảm latency, giảm tải database', 'Redis, Couchbase, Memcached'],
  ['Giao tiếp bất đồng bộ', 'Tách rời bên gửi và bên nhận', 'Kafka, RabbitMQ'],
  ['Metrics', 'Thu thập và vẽ biểu đồ chỉ số', 'Prometheus, Grafana'],
  ['Log tập trung', 'Gom, lưu, tìm kiếm log từ mọi service', 'Logstash, Elasticsearch, Kibana'],
])}

<h2>9 best practice khi xây dựng microservices</h2>
${tbl(['Nguyên tắc', 'Ý nghĩa thực tế'], [
  ['Thiết kế cho lỗi', 'Hệ phân tán chắc chắn sẽ lỗi. Dùng circuit breaker, bulkhead, graceful degradation để một service chết không kéo cả hệ thống theo.'],
  ['Service nhỏ, một trách nhiệm', 'Mỗi service làm tốt một việc. Nếu mô tả service cần chữ "và" nhiều lần, có thể nó đang ôm quá nhiều.'],
  ['Giao thức nhẹ', 'REST hoặc gRPC cho gọi đồng bộ, message broker cho bất đồng bộ.'],
  ['Service discovery', 'Instance lên xuống liên tục nên không hard-code địa chỉ. Dùng Consul, Eureka hoặc Kubernetes Service.'],
  ['Sở hữu dữ liệu', 'Mỗi service có database riêng; service khác chỉ đọc qua API hoặc sự kiện, không truy cập thẳng bảng.'],
  ['Mẫu resiliency', 'Retry có backoff, timeout, cache, rate limit.'],
  ['Bảo mật mọi tầng', 'Bề mặt tấn công lớn hơn monolith nhiều. Xác thực cả traffic nội bộ (mTLS, token giữa service).'],
  ['Log tập trung', 'Một request đi qua 5 service thì log phải gom về một chỗ, gắn chung trace ID.'],
  ['Container hóa', 'Docker đóng gói, Kubernetes điều phối, scale và triển khai từng service độc lập.'],
])}
<p>Một bài khác trong sách bổ sung vài nguyên tắc ở góc độ tổ chức: build riêng cho từng service, giữ các service ở mức độ trưởng thành tương đương, thiết kế service <b>stateless</b>, chia ranh giới theo <b>domain-driven design</b> (DDD), cân nhắc <b>micro frontend</b> để đội frontend cũng tách được, và dùng một lớp orchestration (như Kubernetes) để quản lý vòng đời service.</p>

<h2>Monolith hay microservices</h2>
${cols([
  { title: 'Monolith', body: '<p>Một codebase, một lần deploy, một database. Gọi hàm trong cùng process nên nhanh, transaction ACID đơn giản, debug bằng một stack trace. Phù hợp đội nhỏ, sản phẩm đang tìm hướng đi.</p>' },
  { title: 'Microservices', body: '<p>Deploy và scale độc lập, mỗi đội chọn công nghệ riêng, lỗi được cô lập. Đổi lại phải lo network chậm và lỗi, dữ liệu phân tán, transaction xuyên service (saga), tracing và vận hành phức tạp hơn nhiều.</p>' },
])}
${tbl(['Tiêu chí', 'Monolith', 'Microservices'], [
  ['Tốc độ khởi đầu', 'Nhanh', 'Chậm, cần hạ tầng trước'],
  ['Deploy', 'Cả khối cùng lúc', 'Từng service'],
  ['Scale', 'Nhân bản cả ứng dụng', 'Scale riêng phần nóng'],
  ['Nhất quán dữ liệu', 'Transaction trong một DB', 'Eventual consistency, saga'],
  ['Debug', 'Một process, một log', 'Cần distributed tracing'],
  ['Phù hợp', 'Đội nhỏ, domain còn thay đổi nhiều', 'Nhiều đội, ranh giới domain rõ ràng'],
])}
${tip('<b>Thực tế.</b> Netflix mất khoảng 7 năm (từ 2008 tới đầu 2016) để chuyển từ monolith trong data center sang hàng trăm microservice trên AWS. Chiều ngược lại cũng có: năm 2023, đội Prime Video của Amazon gộp một hệ thống giám sát video từ các service phân tán thành một service duy nhất và báo cáo giảm hơn 90% chi phí hạ tầng. Kiến trúc nào cũng phải đi theo bài toán cụ thể.')}
${note('<b>Sai lầm thường gặp: distributed monolith.</b> Tách code thành nhiều service nhưng vẫn dùng chung một database, hoặc một request phải gọi đồng bộ dây chuyền qua 6–7 service. Kết quả là chịu mọi chi phí của hệ phân tán mà vẫn phải deploy cùng nhau. Dấu hiệu dễ nhận: không thể release service A nếu service B chưa release.')}
${interview([
  'Khi nào bạn khuyên một startup giữ monolith thay vì chuyển sang microservices?',
  'Service registry hoạt động thế nào? Điều gì xảy ra khi một instance chết mà chưa kịp hủy đăng ký?',
  'Làm sao đảm bảo nhất quán dữ liệu khi một đơn hàng cần cập nhật cả Order service và Payment service?',
  'Một request đi qua 5 service bị chậm. Bạn tìm service gây chậm bằng cách nào?',
])}`,
    keys: [
      'Microservices tách theo năng lực nghiệp vụ; mỗi service tự deploy, tự scale và sở hữu database riêng.',
      'Thành phần cốt lõi: API Gateway, Identity Provider, service registry, message broker, cache, metrics và log tập trung.',
      'Thiết kế cho lỗi: circuit breaker, retry có backoff, timeout và graceful degradation.',
      'Dùng chung database hoặc gọi đồng bộ dây chuyền dài biến microservices thành distributed monolith.',
      'Microservices giải quyết bài toán tổ chức nhiều đội; đội nhỏ thường làm tốt hơn với monolith có module rõ ràng.',
    ],
    quiz: [
      { q: 'Thành phần nào giúp API Gateway biết địa chỉ hiện tại của các instance service?', o: ['CDN', 'Service registry', 'Identity Provider', 'Message broker'], a: 1, why: 'Instance tự đăng ký vào registry (Consul, Eureka) khi khởi động, gateway tra registry để định tuyến.' },
      { q: 'Vì sao mỗi microservice nên có database riêng?', o: ['Để tiết kiệm chi phí', 'Để giảm coupling, service tiến hóa schema độc lập', 'Vì SQL không hỗ trợ nhiều kết nối', 'Để không cần backup'], a: 1, why: 'Dùng chung database khiến thay đổi schema của một service làm vỡ service khác, mất khả năng deploy độc lập.' },
      { q: 'Dấu hiệu nào cho thấy hệ thống là distributed monolith?', o: ['Mỗi service có pipeline CI riêng', 'Service giao tiếp qua Kafka', 'Không thể release một service nếu service khác chưa release', 'Dùng Kubernetes'], a: 2, why: 'Khi các service phải deploy cùng nhau, lợi ích cốt lõi của microservices là deploy độc lập đã mất.' },
      { q: 'Công cụ nào thuộc nhóm log tập trung?', o: ['Consul', 'Logstash + Elasticsearch + Kibana', 'Keycloak', 'Redis'], a: 1, why: 'Bộ ELK gom, lưu và hiển thị log từ mọi service.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'kieu-kien-truc',
    mod: 'kien-truc',
    title: 'Các kiểu kiến trúc phần mềm',
    pages: [61, 191, 177],
    min: 11,
    level: 'trung-binh',
    lede: 'Kiến trúc là bản thiết kế quyết định các thành phần được chia ra sao và nói chuyện với nhau thế nào. Biết các kiểu kiến trúc phổ biến giúp bạn gọi tên vấn đề nhanh và chọn đúng công cụ thay vì phát minh lại bánh xe.',
    body: `
<h2>Kiểu kiến trúc và mẫu kiến trúc</h2>
<p><b>Kiểu kiến trúc</b> (architectural style) mô tả hình dạng tổng thể của hệ thống: chia thành tầng, thành service, hay xoay quanh sự kiện. <b>Mẫu kiến trúc</b> (architectural pattern) là lời giải đã được kiểm chứng cho một vấn đề cụ thể bên trong kiểu đó, ví dụ API Gateway hay pub-sub. Sách dành ba bài cho chủ đề này: bảng tổng hợp các kiểu kiến trúc, 5 mẫu phổ biến nhất và 9 mẫu cho luồng dữ liệu và giao tiếp.</p>
<p>Không có kiểu nào tốt nhất. Mỗi kiểu tối ưu cho một vài thuộc tính (dễ phát triển, dễ scale, chịu lỗi, linh hoạt) và trả giá ở thuộc tính khác.</p>

<h2>1. Layered (n-tier)</h2>
<p>Kiểu quen thuộc nhất. Code chia thành các tầng xếp chồng, mỗi tầng chỉ gọi tầng ngay dưới nó. Ba tầng kinh điển là presentation (giao diện, controller), business (quy tắc nghiệp vụ) và persistence (truy cập dữ liệu). Phần lớn ứng dụng Spring MVC, ASP.NET hay Django đều bắt đầu theo kiểu này.</p>
${diagram({
  w: 720, h: 345,
  nodes: [
    { id: 'u', label: 'Người dùng', x: 100, y: 50, w: 110, kind: 'client' },
    { id: 'p', label: 'Presentation layer', sub: 'UI, controller', x: 420, y: 50, w: 320 },
    { id: 'b', label: 'Business layer', sub: 'quy tắc nghiệp vụ', x: 420, y: 135, w: 320 },
    { id: 's', label: 'Persistence layer', sub: 'repository, ORM', x: 420, y: 220, w: 320 },
    { id: 'd', label: 'Database', x: 420, y: 305, w: 160, kind: 'store' },
  ],
  edges: [
    { from: 'u', to: 'p' },
    { from: 'p', to: 'b' },
    { from: 'b', to: 's' },
    { from: 's', to: 'd' },
  ],
  caption: 'Hình: Kiến trúc phân tầng. Mỗi tầng chỉ phụ thuộc tầng ngay bên dưới, nhờ đó có thể thay đổi một tầng mà ít ảnh hưởng tầng khác.',
})}
<p>Ưu điểm là dễ hiểu, dễ chia việc theo kỹ năng. Nhược điểm là một thay đổi nghiệp vụ nhỏ (thêm một trường) thường phải sửa cả ba tầng, và toàn bộ vẫn deploy như một khối. Khi các tầng chỉ chuyển tiếp dữ liệu mà không thêm logic, ta gặp anti-pattern "sinkhole".</p>

<h2>2. Event-driven</h2>
<p>Các thành phần không gọi nhau trực tiếp mà phát ra <b>sự kiện</b> (event) mô tả điều đã xảy ra, như <code>OrderPlaced</code>. Một <b>event broker</b> chuyển sự kiện tới mọi thành phần quan tâm. Bên phát không biết và không cần biết ai đang nghe.</p>
${diagram({
  w: 720, h: 280,
  nodes: [
    { id: 'o', label: 'Order service', sub: 'producer', x: 110, y: 140 },
    { id: 'k', label: 'Event broker', sub: 'Kafka', x: 350, y: 140, w: 150, kind: 'queue' },
    { id: 'e', label: 'Email service', x: 600, y: 55 },
    { id: 'i', label: 'Inventory', x: 600, y: 140 },
    { id: 'a', label: 'Analytics', x: 600, y: 225 },
  ],
  edges: [
    { from: 'o', to: 'k', label: 'OrderPlaced' },
    { from: 'k', to: 'e' },
    { from: 'k', to: 'i' },
    { from: 'k', to: 'a' },
  ],
  caption: 'Hình: Kiến trúc hướng sự kiện. Thêm consumer mới (ví dụ Analytics) không cần sửa Order service.',
})}
<p>Kiểu này tách rời mạnh và scale tốt, rất hợp với luồng xử lý thời gian thực. Cái giá là khó theo dõi luồng tổng thể, phải chấp nhận eventual consistency và xử lý sự kiện trùng hoặc đến sai thứ tự.</p>

<h2>3. Hexagonal (ports and adapters) và clean architecture</h2>
<p>Ý tưởng: đặt logic nghiệp vụ vào lõi, không phụ thuộc framework, database hay giao thức. Lõi định nghĩa các <b>port</b> (interface). Thế giới bên ngoài kết nối qua <b>adapter</b>: REST controller là adapter vào, repository Postgres là adapter ra. Clean architecture và onion architecture là các biến thể cùng tinh thần: phụ thuộc luôn hướng vào trong.</p>
${diagram({
  w: 720, h: 300,
  groups: [{ x: 240, y: 70, w: 240, h: 160, label: 'Lõi ứng dụng' }],
  nodes: [
    { id: 'core', label: 'Domain core', sub: 'logic nghiệp vụ', x: 360, y: 160, w: 180, h: 64, kind: 'good' },
    { id: 'web', label: 'REST controller', x: 100, y: 70, w: 140 },
    { id: 'test', label: 'Unit test', x: 100, y: 240, w: 140, kind: 'client' },
    { id: 'db', label: 'DB adapter', sub: 'Postgres', x: 620, y: 70, w: 140 },
    { id: 'mq', label: 'Message adapter', sub: 'Kafka', x: 620, y: 240, w: 140 },
  ],
  edges: [
    { from: 'web', to: 'core', label: 'port vào' },
    { from: 'test', to: 'core', label: 'port vào' },
    { from: 'core', to: 'db', label: 'port ra' },
    { from: 'core', to: 'mq', label: 'port ra' },
  ],
  caption: 'Hình: Hexagonal architecture. Lõi chỉ biết interface; có thể thay Postgres bằng MongoDB hoặc chạy test không cần database.',
})}
<p>Lợi ích lớn nhất là test được logic nghiệp vụ mà không dựng database thật, và thay hạ tầng mà không đụng tới lõi. Với CRUD đơn giản, số lớp interface và adapter có thể là thừa.</p>

<h2>Các kiểu khác cần biết</h2>
${tbl(['Kiểu', 'Ý tưởng chính', 'Phù hợp', 'Điểm yếu'], [
  ['Microkernel (plug-in)', 'Lõi nhỏ ổn định, tính năng mở rộng bằng plug-in', 'IDE (VS Code, Eclipse), trình duyệt, phần mềm đóng gói', 'Thiết kế API cho plug-in khó, plug-in lỗi ảnh hưởng lõi'],
  ['Microservices', 'Nhiều service nhỏ deploy độc lập, dữ liệu riêng', 'Hệ thống lớn nhiều đội', 'Độ phức tạp vận hành và dữ liệu phân tán'],
  ['Space-based', 'Dữ liệu và xử lý nằm trong lưới bộ nhớ phân tán, database chỉ ghi bất đồng bộ phía sau', 'Tải đột biến cực lớn: bán vé, đấu giá', 'Đắt, khó đảm bảo nhất quán'],
  ['Client-server', 'Client gửi request, server xử lý và trả kết quả', 'Web, mobile, hầu hết ứng dụng', 'Server là điểm tập trung tải'],
  ['Pipe and filter', 'Dữ liệu chảy qua chuỗi bước xử lý độc lập', 'ETL, compiler, xử lý ảnh', 'Không hợp với tương tác qua lại nhiều'],
])}

<h2>9 mẫu cho luồng dữ liệu và giao tiếp</h2>
${tbl(['Mẫu', 'Mô tả ngắn'], [
  ['Peer-to-peer', 'Hai thành phần nói chuyện trực tiếp, không cần điều phối trung tâm (BitTorrent, WebRTC).'],
  ['API Gateway', 'Một điểm vào duy nhất cho mọi request tới backend.'],
  ['Pub-sub', 'Publisher gửi message vào broker, subscriber nhận; hai bên không biết nhau.'],
  ['Request-response', 'Client gửi request và chờ response. Mẫu nền tảng nhất.'],
  ['Event sourcing', 'Lưu chuỗi sự kiện thay đổi trạng thái thay vì chỉ lưu trạng thái cuối.'],
  ['ETL', 'Extract từ nhiều nguồn, transform thành cấu trúc chuẩn, load vào kho đích.'],
  ['Batching', 'Gom dữ liệu theo thời gian hoặc ngưỡng rồi xử lý một lần.'],
  ['Stream processing', 'Xử lý dữ liệu liên tục ngay khi tới (Flink, Kafka Streams).'],
  ['Orchestration', 'Một bộ điều phối trung tâm gọi các service theo một workflow.'],
])}
${tip('<b>Thực tế.</b> Một hệ thống thật thường trộn nhiều kiểu. Ví dụ một sàn thương mại điện tử: mỗi microservice bên trong dùng layered hoặc hexagonal; các service giao tiếp theo event-driven qua Kafka; luồng thanh toán dùng orchestration (saga có bộ điều phối); còn dữ liệu cho báo cáo đi qua ETL vào data warehouse mỗi đêm theo batching.')}
${note('<b>Sai lầm thường gặp.</b> Chọn kiến trúc theo trào lưu. Một đội 4 người dựng 15 microservice event-driven sẽ dành phần lớn thời gian cho hạ tầng thay vì tính năng. Hãy bắt đầu từ thuộc tính quan trọng nhất của bài toán (tốc độ ra mắt, khả năng scale, chịu lỗi) rồi chọn kiểu kiến trúc tương ứng.')}
${interview([
  'So sánh kiến trúc phân tầng và hexagonal. Khi nào bạn chọn hexagonal?',
  'Event-driven giúp gì khi cần thêm tính năng mới? Nhược điểm khi debug là gì?',
  'Space-based architecture giải quyết vấn đề gì mà kiến trúc có database trung tâm gặp phải?',
  'Phân biệt orchestration và choreography (pub-sub) trong giao tiếp giữa các service.',
])}`,
    keys: [
      'Layered dễ hiểu, dễ bắt đầu nhưng thay đổi nhỏ thường lan qua nhiều tầng.',
      'Event-driven tách rời producer và consumer, đổi lại khó theo dõi luồng và phải chấp nhận eventual consistency.',
      'Hexagonal và clean architecture đặt logic nghiệp vụ ở lõi; phụ thuộc luôn hướng vào trong qua port và adapter.',
      'Microkernel hợp với sản phẩm cần plug-in; space-based hợp với tải đột biến cực lớn.',
      'Hệ thống thật thường kết hợp nhiều kiểu; chọn theo thuộc tính quan trọng nhất của bài toán.',
    ],
    quiz: [
      { q: 'Trong hexagonal architecture, REST controller đóng vai trò gì?', o: ['Lõi nghiệp vụ', 'Adapter phía vào', 'Port phía ra', 'Database'], a: 1, why: 'Controller chuyển HTTP request thành lời gọi vào port của lõi, nên là adapter phía vào.' },
      { q: 'VS Code cho phép cài extension để thêm ngôn ngữ, theme, debugger. Đây là kiểu kiến trúc nào?', o: ['Space-based', 'Microkernel (plug-in)', 'Layered', 'Peer-to-peer'], a: 1, why: 'Lõi ổn định và nhỏ, tính năng mở rộng qua plug-in là đặc trưng của microkernel.' },
      { q: 'Muốn thêm service Analytics nhận mọi đơn hàng mới mà không sửa Order service. Kiểu nào hỗ trợ tốt nhất?', o: ['Layered', 'Request-response', 'Event-driven / pub-sub', 'Monolith'], a: 2, why: 'Analytics chỉ cần subscribe sự kiện OrderPlaced; Order service không biết có thêm consumer.' },
      { q: 'Mẫu nào lưu lại toàn bộ chuỗi thay đổi trạng thái thay vì chỉ trạng thái hiện tại?', o: ['ETL', 'Event sourcing', 'Batching', 'API Gateway'], a: 1, why: 'Event sourcing lưu các sự kiện; trạng thái hiện tại được dựng lại bằng cách phát lại chúng.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'twelve-factor',
    mod: 'kien-truc',
    title: '12-Factor App',
    pages: [151, 89],
    min: 10,
    level: 'co-ban',
    lede: '12-Factor App là bộ 12 nguyên tắc do Heroku đúc kết để xây ứng dụng chạy tốt trên cloud: dễ deploy, dễ scale, ít bất ngờ giữa môi trường dev và production. Gần như mọi nền tảng container hiện nay đều ngầm giả định ứng dụng tuân theo các nguyên tắc này.',
    body: `
<h2>Vì sao cần 12 nguyên tắc</h2>
<p>Ứng dụng "chạy được trên máy tôi" thường hỏng khi lên server vì cấu hình hard-code, phụ thuộc thư viện cài tay, hoặc lưu file lên ổ đĩa cục bộ. Khi chạy nhiều instance sau load balancer, các giả định đó vỡ ngay. 12-Factor gom những bài học này thành một checklist ngắn, áp dụng cho mọi ngôn ngữ.</p>

<h2>12 nguyên tắc kèm ví dụ</h2>
${tbl(['#', 'Nguyên tắc', 'Ý nghĩa', 'Ví dụ thực tế'], [
  ['1', 'Codebase', 'Một codebase trong version control, deploy ra nhiều môi trường', 'Một repo Git; staging và production chỉ khác commit đang chạy'],
  ['2', 'Dependencies', 'Khai báo rõ và cô lập mọi phụ thuộc', '<code>package.json</code> + lockfile, <code>requirements.txt</code>; không giả định server có sẵn <code>curl</code>'],
  ['3', 'Config', 'Cấu hình tách khỏi code, lưu trong biến môi trường', '<code>DATABASE_URL</code>, <code>STRIPE_KEY</code> truyền qua env, không commit vào repo'],
  ['4', 'Backing services', 'Database, cache, queue là tài nguyên gắn vào qua URL', 'Đổi Postgres local sang Amazon RDS chỉ bằng đổi <code>DATABASE_URL</code>'],
  ['5', 'Build, release, run', 'Tách bạch ba giai đoạn', 'CI build image một lần; release = image + config; run = khởi chạy process'],
  ['6', 'Processes', 'Process stateless, không chia sẻ gì', 'Session để trong Redis, file upload lên S3, không lưu trong RAM hay ổ đĩa'],
  ['7', 'Port binding', 'Ứng dụng tự mở port để phục vụ', 'Service tự lắng nghe <code>PORT=8080</code>, không cần cài vào Tomcat có sẵn'],
  ['8', 'Concurrency', 'Scale ngang bằng cách chạy thêm process', 'Tăng <code>replicas</code> từ 3 lên 10; tách process web và worker'],
  ['9', 'Disposability', 'Khởi động nhanh, tắt nhẹ nhàng', 'Bắt <code>SIGTERM</code>, xử lý nốt request đang dở rồi mới thoát'],
  ['10', 'Dev/prod parity', 'Dev, staging, production giống nhau nhất có thể', 'Dev dùng Postgres trong Docker thay vì SQLite'],
  ['11', 'Logs', 'Log là luồng sự kiện ghi ra stdout', 'Ứng dụng không tự quản lý file log; nền tảng gom về ELK hoặc Loki'],
  ['12', 'Admin processes', 'Tác vụ quản trị chạy như process một lần', 'Migration chạy bằng job riêng cùng image và config với ứng dụng'],
])}

<h2>Build, release, run trong thực tế</h2>
${diagram({
  w: 720, h: 260,
  nodes: [
    { id: 'g', label: 'Codebase', sub: 'Git', x: 80, y: 100, w: 110 },
    { id: 'b', label: 'Build', sub: 'image v42', x: 250, y: 100 },
    { id: 'r', label: 'Release', sub: 'image + config', x: 430, y: 100, w: 130 },
    { id: 'x', label: 'Run', sub: 'N process', x: 625, y: 100, w: 110, kind: 'good' },
    { id: 'c', label: 'Config', sub: 'biến môi trường', x: 430, y: 210, w: 130, kind: 'external' },
  ],
  edges: [
    { from: 'g', to: 'b', label: '1' },
    { from: 'b', to: 'r', label: '2' },
    { from: 'c', to: 'r', dashed: true },
    { from: 'r', to: 'x', label: '3' },
  ],
  caption: 'Hình: (1) CI build ra một image bất biến; (2) ghép image với config của môi trường thành một release có số hiệu; (3) nền tảng chạy release đó.',
})}
<p>Điểm mấu chốt: cùng một image được đưa qua staging rồi production, chỉ config thay đổi. Nếu production lỗi, rollback là chạy lại release trước, không cần build lại. Không ai được sửa code trực tiếp trên server đang chạy.</p>

<h2>Process stateless và backing services</h2>
${diagram({
  w: 720, h: 320,
  groups: [{ x: 225, y: 18, w: 170, h: 290, label: 'Process stateless' }],
  nodes: [
    { id: 'lb', label: 'Load balancer', x: 90, y: 120, w: 130, kind: 'lb' },
    { id: 'p1', label: 'web.1', sub: 'PORT=8080', x: 310, y: 75 },
    { id: 'p2', label: 'web.2', sub: 'PORT=8080', x: 310, y: 165 },
    { id: 'p3', label: 'worker.1', x: 310, y: 255 },
    { id: 'db', label: 'Postgres', sub: 'DATABASE_URL', x: 580, y: 75, w: 140, kind: 'store' },
    { id: 'rd', label: 'Redis', sub: 'REDIS_URL', x: 580, y: 165, w: 140, kind: 'cache' },
    { id: 's3', label: 'S3', sub: 'S3_BUCKET', x: 580, y: 255, w: 140, kind: 'external' },
  ],
  edges: [
    { from: 'lb', to: 'p1' },
    { from: 'lb', to: 'p2' },
    { from: 'p1', to: 'db' },
    { from: 'p2', to: 'rd' },
    { from: 'p3', to: 's3', dashed: true },
  ],
  caption: 'Hình: Mọi trạng thái nằm ở backing service, được gắn vào qua URL trong biến môi trường. Process có thể bị tắt hoặc nhân bản bất cứ lúc nào.',
})}
<p>Nhờ nguyên tắc 6, 8 và 9, Kubernetes có thể giết một pod và dựng pod mới ở node khác mà người dùng không mất session. Đây cũng là lý do sticky session thường bị coi là dấu hiệu vi phạm 12-Factor.</p>

<h2>Quản lý cấu hình: từ thao tác tay đến IaC</h2>
<p>Nguyên tắc 3 nói về cấu hình của ứng dụng. Sách mở rộng sang cấu hình hạ tầng, so sánh hai cách làm. <b>Configuration management truyền thống</b> tập trung duy trì trạng thái mong muốn của server, thiết bị mạng sau khi chúng đã được cấp phát; thường bắt đầu bằng thao tác tay và thay đổi bằng chuỗi lệnh từng bước. <b>Infrastructure as Code</b> (IaC) mô tả hạ tầng bằng file code đặt trong Git, thường theo kiểu khai báo (declarative): bạn viết trạng thái mong muốn, công cụ tự tính ra cần tạo, sửa, xóa gì.</p>
${diagram({
  w: 720, h: 270,
  groups: [
    { x: 20, y: 20, w: 180, h: 230, label: 'Truyền thống' },
    { x: 220, y: 20, w: 480, h: 230, label: 'Infrastructure as Code' },
  ],
  nodes: [
    { id: 'ad', label: 'Kỹ sư DevOps', x: 110, y: 85, w: 130, kind: 'client' },
    { id: 'sv', label: 'Server', sub: 'cấu hình tay', x: 110, y: 200, w: 130, kind: 'warn' },
    { id: 'tf', label: 'Code IaC', sub: 'Terraform', x: 300, y: 140 },
    { id: 'ci', label: 'CI/CD', sub: 'plan, apply', x: 470, y: 140 },
    { id: 'cl', label: 'Hạ tầng cloud', x: 630, y: 140, w: 120, kind: 'good' },
  ],
  edges: [
    { from: 'ad', to: 'sv', label: 'SSH, lệnh tay', kind: 'warn' },
    { from: 'tf', to: 'ci' },
    { from: 'ci', to: 'cl' },
  ],
  caption: 'Hình: Thao tác tay dễ lệch cấu hình giữa các server; IaC đưa thay đổi hạ tầng qua review và pipeline như code ứng dụng.',
})}
${tbl(['Tiêu chí', 'Truyền thống', 'IaC'], [
  ['Cách thay đổi', 'Lệnh từng bước, thường thủ công', 'Sửa file, review, pipeline áp dụng'],
  ['Lịch sử', 'Phụ thuộc ghi chép', 'Git log đầy đủ ai sửa gì'],
  ['Tái tạo môi trường', 'Khó, dễ sai lệch (configuration drift)', 'Chạy lại code là có môi trường giống hệt'],
  ['Công cụ', 'Script shell, thao tác console', 'Terraform, AWS CloudFormation, Chef, Puppet'],
])}
${tip('<b>Thực tế.</b> 12-Factor được Adam Wiggins, đồng sáng lập Heroku, công bố khoảng năm 2011 dựa trên kinh nghiệm vận hành hàng trăm nghìn ứng dụng. Mô hình <code>Deployment</code> + <code>ConfigMap</code> + <code>Secret</code> của Kubernetes gần như ánh xạ thẳng các nguyên tắc 3, 5, 6 và 8.')}
${note('<b>Sai lầm thường gặp.</b> Đưa secret vào biến môi trường rồi in toàn bộ env ra log khi khởi động để "debug". Biến môi trường tách config khỏi code nhưng không tự bảo vệ secret. Với khóa API và mật khẩu database, hãy dùng secret manager (Vault, AWS Secrets Manager) và không bao giờ log chúng.')}
${interview([
  'Ứng dụng của bạn lưu session trong RAM. Điều gì xảy ra khi scale lên 3 instance sau load balancer, và bạn sửa thế nào?',
  'Vì sao nên build image một lần rồi dùng lại cho mọi môi trường thay vì build riêng cho production?',
  'Ứng dụng nên làm gì khi nhận tín hiệu SIGTERM?',
  'So sánh configuration management truyền thống và IaC. Configuration drift là gì?',
])}`,
    keys: [
      'Config nằm trong biến môi trường, không nằm trong code; cùng một image chạy ở mọi môi trường.',
      'Process stateless: session, file và trạng thái phải ở backing service như Redis, S3, database.',
      'Build, release, run tách bạch giúp rollback nhanh và không sửa code trên server.',
      'Log ghi ra stdout; nền tảng chịu trách nhiệm gom và lưu trữ.',
      'IaC mô tả hạ tầng bằng code khai báo trong Git, tránh configuration drift của thao tác tay.',
    ],
    quiz: [
      { q: 'Theo 12-Factor, mật khẩu database nên đặt ở đâu?', o: ['Hard-code trong file nguồn', 'File config commit vào repo', 'Biến môi trường hoặc secret được nền tảng inject', 'Trong log khởi động'], a: 2, why: 'Config tách khỏi code; secret được inject lúc chạy và không đưa vào repo.' },
      { q: 'Ứng dụng lưu file upload trên ổ đĩa cục bộ của container vi phạm nguyên tắc nào rõ nhất?', o: ['Codebase', 'Processes (stateless)', 'Port binding', 'Logs'], a: 1, why: 'Process phải stateless; file nên lưu ở backing service như S3 để instance nào cũng truy cập được.' },
      { q: 'Muốn xử lý gấp đôi lượng request, 12-Factor khuyên làm gì?', o: ['Tăng RAM cho server', 'Chạy thêm process giống hệt (scale ngang)', 'Viết lại bằng ngôn ngữ nhanh hơn', 'Tắt log'], a: 1, why: 'Nguyên tắc Concurrency: scale bằng cách nhân bản process theo loại công việc.' },
      { q: 'Công cụ nào thuộc nhóm IaC?', o: ['Terraform', 'Grafana', 'Redis', 'Kafka'], a: 0, why: 'Terraform mô tả hạ tầng bằng code khai báo; các công cụ còn lại là giám sát, cache và messaging.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'mvc-mvvm',
    mod: 'kien-truc',
    title: 'MVC, MVP, MVVM, MVVM-C và VIPER',
    pages: [279],
    min: 9,
    level: 'co-ban',
    lede: 'Đây là các mẫu tổ chức code giao diện phổ biến nhất trên web, iOS và Android. Tất cả cùng trả lời một câu hỏi: đặt logic ở đâu để màn hình không biến thành một file nghìn dòng không ai dám sửa.',
    body: `
<h2>Vấn đề chung</h2>
<p>Mọi màn hình đều có hai phần: dữ liệu nghiệp vụ và cách hiển thị. Nếu viết lẫn vào nhau, ta không test được logic mà không dựng UI, và đổi giao diện là phải đụng vào nghiệp vụ. Các mẫu trong bài này đều tách hai phần đó và khác nhau ở thành phần "phiên dịch" đứng giữa.</p>
<p>Sách tóm tắt mấy điểm chung: MVC là mẫu lâu đời nhất, ra đời gần 50 năm trước (Trygve Reenskaug, Xerox PARC, cuối thập niên 1970). Mọi mẫu đều có <b>View</b> để hiển thị và nhận thao tác người dùng. Hầu hết có <b>Model</b> quản lý dữ liệu nghiệp vụ (VIPER gọi là Entity). Controller, Presenter và ViewModel đều là "người phiên dịch" giữa View và Model. Vì phần phiên dịch dễ phình to, các mẫu mới lần lượt ra đời để chia nhỏ nó.</p>

<h2>MVC: Model, View, Controller</h2>
${diagram({
  w: 720, h: 280,
  nodes: [
    { id: 'u', label: 'Người dùng', x: 90, y: 135, w: 110, kind: 'client' },
    { id: 'v', label: 'View', x: 330, y: 60 },
    { id: 'c', label: 'Controller', x: 330, y: 215 },
    { id: 'm', label: 'Model', sub: 'dữ liệu + nghiệp vụ', x: 590, y: 135, w: 150 },
  ],
  edges: [
    { from: 'u', to: 'v', label: '1', curve: 20 },
    { from: 'v', to: 'c', label: '2' },
    { from: 'c', to: 'm', label: '3' },
    { from: 'm', to: 'v', label: '4', dashed: true },
    { from: 'v', to: 'u', label: '5', curve: 20 },
  ],
  caption: 'Hình: Luồng MVC. (1) người dùng thao tác trên View; (2) View chuyển sự kiện cho Controller; (3) Controller cập nhật Model; (4) Model báo thay đổi cho View; (5) View vẽ lại.',
})}
<p>Trên web phía server (Rails, Spring MVC, ASP.NET MVC), Controller nhận HTTP request, gọi Model rồi chọn View để render. Trên iOS truyền thống, UIViewController vừa giữ View vừa làm Controller, nên rất dễ phình thành "Massive View Controller" chứa cả networking, validation và điều hướng.</p>

<h2>MVP: tách hẳn View khỏi Model</h2>
<p>Trong MVP, View trở nên "thụ động": nó chỉ hiển thị và chuyển sự kiện cho <b>Presenter</b>. Presenter lấy dữ liệu từ Model, định dạng xong rồi gọi các hàm của View qua một interface, ví dụ <code>view.showLoading()</code>, <code>view.showUser(name)</code>. View và Model không bao giờ nói chuyện trực tiếp. Vì View chỉ là interface, có thể test Presenter bằng một View giả. MVP từng rất phổ biến trên Android trước khi có Jetpack ViewModel.</p>

<h2>MVVM: data binding thay cho gọi hàm</h2>
${diagram({
  w: 720, h: 230,
  nodes: [
    { id: 'v', label: 'View', sub: 'SwiftUI / Compose', x: 110, y: 115, w: 150 },
    { id: 'vm', label: 'ViewModel', sub: 'state + lệnh', x: 360, y: 115, w: 140 },
    { id: 'm', label: 'Model', sub: 'repository, API', x: 610, y: 115, w: 140 },
  ],
  edges: [
    { from: 'v', to: 'vm', label: 'data binding', both: true },
    { from: 'vm', to: 'm', label: 'gọi', curve: 30 },
    { from: 'm', to: 'vm', label: 'dữ liệu', curve: 30, dashed: true },
  ],
  caption: 'Hình: MVVM. View tự đồng bộ với state của ViewModel qua binding; ViewModel không giữ tham chiếu tới View.',
})}
<p><b>ViewModel</b> phơi ra state (ví dụ <code>isLoading</code>, <code>items</code>) và các lệnh (<code>refresh()</code>). View "bind" vào state: khi state đổi, View tự cập nhật. Khác biệt lớn với MVP là ViewModel không biết View nào đang dùng nó, nên một ViewModel có thể phục vụ nhiều View và test rất dễ: gọi lệnh rồi kiểm tra state. SwiftUI, Jetpack Compose, WPF, Angular và Vue đều xây quanh ý tưởng này.</p>

<h2>MVVM-C và VIPER: chia nhỏ hơn nữa</h2>
<p><b>MVVM-C</b> thêm <b>Coordinator</b> để lo điều hướng giữa các màn hình. ViewModel chỉ báo "người dùng đã chọn sản phẩm 42", Coordinator quyết định mở màn hình nào. Nhờ vậy các màn hình không phụ thuộc nhau và có thể tái sử dụng trong nhiều luồng.</p>
<p><b>VIPER</b> (phổ biến trên iOS) chia một màn hình thành năm vai trò, mỗi vai trò một trách nhiệm:</p>
${diagram({
  w: 720, h: 300,
  nodes: [
    { id: 'v', label: 'View', x: 90, y: 150, w: 110 },
    { id: 'p', label: 'Presenter', x: 290, y: 150 },
    { id: 'i', label: 'Interactor', sub: 'use case', x: 480, y: 70 },
    { id: 'e', label: 'Entity', sub: 'dữ liệu', x: 645, y: 70, w: 110, kind: 'store' },
    { id: 'r', label: 'Router', sub: 'điều hướng', x: 480, y: 230 },
  ],
  edges: [
    { from: 'v', to: 'p', both: true },
    { from: 'p', to: 'i', both: true },
    { from: 'i', to: 'e' },
    { from: 'p', to: 'r' },
  ],
  caption: 'Hình: VIPER. Presenter là trung tâm; Interactor chứa nghiệp vụ, Entity là dữ liệu thuần, Router lo chuyển màn hình.',
})}

<h2>So sánh</h2>
${tbl(['Mẫu', 'Thành phần giữa', 'View biết gì', 'Điều hướng', 'Dễ test', 'Hợp với'], [
  ['MVC', 'Controller', 'Có thể đọc Model trực tiếp', 'Trong Controller', 'Trung bình', 'Web server-side, app nhỏ'],
  ['MVP', 'Presenter', 'Chỉ biết Presenter', 'Trong Presenter', 'Tốt', 'Android đời cũ, WinForms'],
  ['MVVM', 'ViewModel', 'Bind vào state của ViewModel', 'Trong ViewModel hoặc View', 'Tốt', 'UI khai báo: SwiftUI, Compose, Vue'],
  ['MVVM-C', 'ViewModel + Coordinator', 'Như MVVM', 'Coordinator', 'Tốt', 'App nhiều luồng màn hình'],
  ['VIPER', 'Presenter + Interactor + Router', 'Chỉ biết Presenter', 'Router', 'Rất tốt', 'App lớn, đội đông'],
])}
${tip('<b>Thực tế.</b> Google chính thức khuyến nghị kiến trúc dựa trên ViewModel và luồng dữ liệu một chiều cho Android (Jetpack ViewModel, StateFlow, Compose). Trên iOS, SwiftUI với <code>@Observable</code>/<code>ObservableObject</code> khiến MVVM gần như là lựa chọn mặc định; VIPER vẫn gặp ở các codebase UIKit lớn.')}
${note('<b>Sai lầm thường gặp.</b> Dùng VIPER cho một màn hình cài đặt có 3 nút: 5 file và hàng chục interface cho vài dòng logic. Độ chia nhỏ nên tỉ lệ với độ phức tạp của màn hình. Ngược lại, giữ MVC thuần cho màn hình checkout nhiều bước sẽ sớm sinh ra Massive View Controller.')}
${interview([
  'Khác biệt cốt lõi giữa Presenter trong MVP và ViewModel trong MVVM là gì?',
  'Massive View Controller là gì và bạn tách nó ra thế nào?',
  'Vì sao Coordinator giúp các màn hình dễ tái sử dụng hơn?',
])}`,
    keys: [
      'Mọi mẫu đều tách View khỏi Model; khác nhau ở thành phần trung gian.',
      'MVC đơn giản nhưng Controller dễ phình to; MVP buộc View thụ động và giao tiếp qua interface.',
      'MVVM dùng data binding; ViewModel không giữ tham chiếu tới View nên dễ test và tái sử dụng.',
      'MVVM-C thêm Coordinator lo điều hướng; VIPER chia năm vai trò cho màn hình phức tạp.',
      'Chọn mức chia nhỏ tương xứng với độ phức tạp của màn hình và quy mô đội.',
    ],
    quiz: [
      { q: 'Trong MVVM, View cập nhật khi dữ liệu đổi bằng cơ chế nào?', o: ['Presenter gọi hàm của View', 'Data binding vào state của ViewModel', 'Router gửi sự kiện', 'View tự hỏi database'], a: 1, why: 'View bind vào state; ViewModel đổi state thì View tự cập nhật, ViewModel không gọi View trực tiếp.' },
      { q: 'Thành phần nào trong VIPER chịu trách nhiệm chuyển màn hình?', o: ['Interactor', 'Entity', 'Router', 'View'], a: 2, why: 'Router (wireframe) lo điều hướng, giữ Presenter không phụ thuộc màn hình khác.' },
      { q: 'Mẫu nào lâu đời nhất?', o: ['MVVM', 'VIPER', 'MVP', 'MVC'], a: 3, why: 'MVC ra đời cuối thập niên 1970 ở Xerox PARC, gần 50 năm trước.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'design-patterns',
    mod: 'kien-truc',
    title: 'SOLID, design pattern và nguyên tắc viết code tốt',
    pages: [304, 74, 134, 23, 336],
    min: 12,
    level: 'co-ban',
    lede: 'Kiến trúc tốt sẽ đổ vỡ nếu code bên trong mỗi service rối. Bài này gom những nền tảng giúp code dễ đọc, dễ sửa và dễ test: OOP, SOLID, các design pattern kinh điển, 10 nguyên tắc viết code tốt, các mô hình lập trình và cách đọc sơ đồ lớp UML.',
    body: `
<h2>OOP: bốn trụ cột</h2>
<p>Lập trình hướng đối tượng tổ chức chương trình quanh <b>object</b>, gói dữ liệu (thuộc tính) và hành vi (phương thức) vào một chỗ. <b>Class</b> là bản thiết kế, object là thực thể tạo từ bản thiết kế đó. Bốn trụ cột:</p>
${tbl(['Trụ cột', 'Ý nghĩa', 'Ví dụ'], [
  ['Encapsulation (đóng gói)', 'Giấu trạng thái bên trong, chỉ cho thay đổi qua phương thức', '<code>account.withdraw(100)</code> kiểm tra số dư, không cho gán thẳng <code>balance = -5</code>'],
  ['Abstraction (trừu tượng)', 'Phơi ra cái gì làm được, giấu cách làm', 'Gọi <code>storage.save(file)</code> mà không cần biết lưu lên S3 hay ổ đĩa'],
  ['Inheritance (kế thừa)', 'Class con nhận lại thuộc tính và hành vi của class cha', '<code>SavingsAccount extends Account</code>'],
  ['Polymorphism (đa hình)', 'Cùng một lời gọi, mỗi kiểu xử lý theo cách riêng', '<code>shape.area()</code> tính khác nhau cho Circle và Square'],
])}

<h2>SOLID: năm nguyên tắc thiết kế class</h2>
${tbl(['Nguyên tắc', 'Phát biểu', 'Dấu hiệu vi phạm'], [
  ['<b>S</b>ingle Responsibility', 'Mỗi class chỉ có một lý do để thay đổi', 'Class <code>UserService</code> vừa validate, vừa gửi email, vừa xuất PDF'],
  ['<b>O</b>pen/Closed', 'Mở để mở rộng, đóng với sửa đổi', 'Thêm phương thức thanh toán mới phải sửa một chuỗi <code>if/else</code> dài'],
  ['<b>L</b>iskov Substitution', 'Object class con thay được cho class cha mà chương trình vẫn đúng', '<code>Square extends Rectangle</code> làm hỏng code đặt riêng chiều rộng và chiều cao'],
  ['<b>I</b>nterface Segregation', 'Nhiều interface nhỏ, chuyên biệt tốt hơn một interface lớn', 'Class máy in đơn giản buộc phải cài <code>fax()</code> và <code>scan()</code>'],
  ['<b>D</b>ependency Inversion', 'Module cấp cao và cấp thấp cùng phụ thuộc vào abstraction', '<code>OrderService</code> tự <code>new StripeClient()</code> bên trong'],
])}
${diagram({
  w: 720, h: 280,
  nodes: [
    { id: 'o', label: 'OrderService', sub: 'module cấp cao', x: 120, y: 140, w: 150 },
    { id: 'i', label: 'PaymentGateway', sub: '«interface»', x: 370, y: 140, w: 160, kind: 'lb' },
    { id: 's', label: 'StripeAdapter', x: 610, y: 65, w: 140 },
    { id: 'm', label: 'MoMoAdapter', x: 610, y: 215, w: 140 },
  ],
  edges: [
    { from: 'o', to: 'i', label: 'phụ thuộc' },
    { from: 's', to: 'i', label: 'implements', dashed: true },
    { from: 'm', to: 'i', label: 'implements', dashed: true },
  ],
  caption: 'Hình: Dependency Inversion. OrderService chỉ biết interface; thêm cổng thanh toán mới là thêm một adapter, không sửa OrderService (đồng thời thỏa Open/Closed).',
})}

<h2>Design pattern kinh điển</h2>
<p>Cuốn <i>Design Patterns</i> (1994) của "Gang of Four" mô tả 23 mẫu, chia ba nhóm. Bảng cheat sheet trong sách tóm tắt cách dùng từng mẫu; dưới đây là những mẫu hay gặp nhất:</p>
${tbl(['Nhóm', 'Mẫu', 'Dùng khi', 'Ví dụ'], [
  ['Creational (khởi tạo)', 'Factory Method', 'Để class con quyết định tạo object cụ thể nào', '<code>NotificationFactory.create("sms")</code>'],
  ['', 'Builder', 'Object có nhiều tham số tùy chọn', '<code>HttpRequest.newBuilder().uri(...).timeout(...).build()</code>'],
  ['', 'Prototype', 'Tạo object mới bằng cách clone object mẫu', 'Sao chép một tài liệu template'],
  ['', 'Singleton', 'Chỉ cần đúng một instance toàn cục', 'Connection pool, logger (dùng dè dặt)'],
  ['Structural (cấu trúc)', 'Adapter', 'Ghép interface không tương thích', 'Bọc SDK thanh toán cũ theo interface mới'],
  ['', 'Decorator', 'Thêm hành vi mà không sửa class gốc', 'Bọc repository bằng lớp cache, lớp log'],
  ['', 'Facade', 'Một API đơn giản cho hệ thống con phức tạp', '<code>checkout()</code> gọi kho, thanh toán, vận chuyển'],
  ['', 'Proxy', 'Đại diện kiểm soát truy cập object thật', 'Lazy loading, kiểm tra quyền'],
  ['Behavioral (hành vi)', 'Observer', 'Nhiều bên cần biết khi trạng thái đổi', 'Event listener, pub-sub trong app'],
  ['', 'Strategy', 'Đổi thuật toán lúc chạy', 'Chọn cách tính phí ship theo khu vực'],
  ['', 'Chain of Responsibility', 'Request đi qua chuỗi handler, mỗi handler xử lý hoặc chuyển tiếp', 'Middleware HTTP'],
  ['', 'Command', 'Đóng gói thao tác thành object', 'Undo/redo, hàng đợi tác vụ'],
])}
${diagram({
  w: 720, h: 230,
  nodes: [
    { id: 'r', label: 'HTTP request', x: 80, y: 90, w: 120, kind: 'client' },
    { id: 'a', label: 'AuthHandler', x: 260, y: 90, w: 130 },
    { id: 'l', label: 'RateLimitHandler', x: 450, y: 90, w: 150 },
    { id: 'c', label: 'Controller', x: 640, y: 90, w: 110, kind: 'good' },
    { id: 'x', label: '401 / 429', x: 355, y: 190, w: 120, kind: 'warn' },
  ],
  edges: [
    { from: 'r', to: 'a' },
    { from: 'a', to: 'l', label: 'next()' },
    { from: 'l', to: 'c', label: 'next()' },
    { from: 'a', to: 'x', dashed: true, kind: 'warn' },
    { from: 'l', to: 'x', dashed: true, kind: 'warn' },
  ],
  caption: 'Hình: Chain of Responsibility trong middleware. Mỗi handler tự quyết định chặn request hay gọi handler kế tiếp; thêm handler mới không sửa handler cũ.',
})}

<h2>10 nguyên tắc viết code tốt</h2>
${tbl(['Nguyên tắc', 'Gợi ý áp dụng'], [
  ['Theo chuẩn code', 'PEP 8, Google Java Style; để linter và formatter tự kiểm tra trong CI'],
  ['Tài liệu và comment', 'Comment giải thích "vì sao", không lặp lại "cái gì" mà code đã nói'],
  ['Robustness', 'Xử lý input bất thường và exception, không để chương trình sập vô cớ'],
  ['Theo SOLID', 'Đặc biệt là một trách nhiệm và phụ thuộc vào abstraction'],
  ['Dễ test', 'Hàm nhỏ, inject phụ thuộc, có test tự động'],
  ['Trừu tượng vừa phải', 'Không thiết kế quá đà, cũng không bỏ qua khả năng mở rộng'],
  ['Dùng pattern có chừng mực', 'Pattern dùng sai chỗ làm code khó hiểu hơn'],
  ['Giảm phụ thuộc toàn cục', 'Truyền tham số thay cho biến global; hạn chế side effect'],
  ['Refactor liên tục', 'Trả nợ kỹ thuật sớm, từng bước nhỏ'],
  ['Bảo mật là ưu tiên', 'Tránh lỗ hổng phổ biến: injection, lộ secret, thiếu kiểm tra quyền'],
])}

<h2>8 mô hình lập trình</h2>
${tbl(['Mô hình', 'Ý tưởng', 'Ngôn ngữ / công cụ'], [
  ['Imperative', 'Chuỗi lệnh thay đổi trạng thái chương trình', 'C, Java, Python'],
  ['Declarative', 'Mô tả kết quả mong muốn, không mô tả luồng điều khiển', 'SQL, HTML'],
  ['Object-oriented', 'Object gói dữ liệu và hành vi', 'Java, C#, Ruby'],
  ['Aspect-oriented', 'Tách mối quan tâm cắt ngang (log, transaction) thành aspect', 'AspectJ, Spring AOP'],
  ['Functional', 'Hàm toán học, dữ liệu bất biến', 'Haskell, Erlang, Lisp'],
  ['Reactive', 'Luồng dữ liệu bất đồng bộ và lan truyền thay đổi', 'RxJS, Reactor'],
  ['Generic', 'Viết thuật toán, cấu trúc dữ liệu không phụ thuộc kiểu', 'Java generics, C++ template'],
  ['Concurrent', 'Nhiều tác vụ chạy chồng lấn về thời gian', 'Go goroutine, Java thread'],
])}

<h2>Đọc sơ đồ lớp UML</h2>
<p>Sơ đồ lớp UML gồm class (tên, thuộc tính, phương thức), interface, enumeration và các quan hệ. Năm quan hệ cần nhận ra: <b>association</b> (biết nhau, đường liền), <b>aggregation</b> (chứa nhưng phần tử sống độc lập, hình thoi rỗng), <b>composition</b> (chứa và phần tử chết theo, hình thoi đặc), <b>inheritance</b> (mũi tên tam giác rỗng, đường liền) và <b>implementation</b> (tam giác rỗng, đường đứt).</p>
${diagram({
  w: 720, h: 260,
  nodes: [
    { id: 'an', label: 'Animal', x: 120, y: 60 },
    { id: 'dg', label: 'Dog', x: 120, y: 200 },
    { id: 'or', label: 'Order', x: 360, y: 60 },
    { id: 'ol', label: 'OrderLine', x: 360, y: 200 },
    { id: 'tm', label: 'Team', x: 600, y: 60 },
    { id: 'pl', label: 'Player', x: 600, y: 200 },
  ],
  edges: [
    { from: 'dg', to: 'an', label: 'inheritance' },
    { from: 'or', to: 'ol', label: 'composition' },
    { from: 'tm', to: 'pl', label: 'aggregation', dashed: true },
  ],
  caption: 'Hình: Ba quan hệ hay nhầm. Dog là một Animal; OrderLine không tồn tại nếu Order bị xóa; Player vẫn tồn tại khi Team giải tán.',
})}
${tip('<b>Thực tế.</b> Spring Framework là một bộ sưu tập pattern sống: Dependency Injection hiện thực Dependency Inversion, <code>@Transactional</code> dùng Proxy và AOP, <code>JdbcTemplate</code> dùng Template Method, còn filter chain của Spring Security là Chain of Responsibility.')}
${note('<b>Sai lầm thường gặp.</b> Học pattern xong và áp vào mọi chỗ: một class <code>AbstractFactoryProviderManager</code> cho việc tạo một object duy nhất. Pattern là từ vựng để giải quyết vấn đề có thật. Nếu chưa có vấn đề, code đơn giản thắng.')}
${interview([
  'Cho ví dụ vi phạm Liskov Substitution và cách sửa.',
  'Phân biệt Decorator và Proxy. Khi nào dùng mỗi loại?',
  'Vì sao Singleton thường bị xem là anti-pattern trong code cần test?',
  'Composition khác aggregation thế nào? Vẽ ví dụ trên sơ đồ lớp.',
])}`,
    keys: [
      'Bốn trụ cột OOP: đóng gói, trừu tượng, kế thừa, đa hình.',
      'SOLID: một trách nhiệm, mở rộng không sửa, class con thay được class cha, interface nhỏ, phụ thuộc vào abstraction.',
      'Design pattern chia ba nhóm: creational, structural, behavioral; dùng khi có vấn đề thật, không dùng để trang trí.',
      'Code tốt dễ đọc, dễ test, ít phụ thuộc toàn cục và được refactor liên tục.',
      'UML: composition (thoi đặc) phần tử chết theo; aggregation (thoi rỗng) phần tử sống độc lập.',
    ],
    quiz: [
      { q: 'Thêm phương thức thanh toán mới mà không sửa OrderService, chỉ thêm class mới. Nguyên tắc nào được thỏa mãn rõ nhất?', o: ['Single Responsibility', 'Open/Closed', 'Interface Segregation', 'Liskov Substitution'], a: 1, why: 'Hệ thống mở rộng bằng code mới và đóng với sửa đổi code cũ.' },
      { q: 'Muốn thêm cache cho repository mà không sửa repository gốc, nên dùng pattern nào?', o: ['Singleton', 'Decorator', 'Builder', 'Prototype'], a: 1, why: 'Decorator bọc object gốc cùng interface và thêm hành vi trước hoặc sau lời gọi.' },
      { q: 'Middleware HTTP lần lượt kiểm tra xác thực, rate limit rồi mới tới controller là pattern nào?', o: ['Observer', 'Facade', 'Chain of Responsibility', 'Factory Method'], a: 2, why: 'Request đi qua chuỗi handler, mỗi handler xử lý hoặc chuyển tiếp.' },
      { q: 'SQL thuộc mô hình lập trình nào?', o: ['Imperative', 'Declarative', 'Aspect-oriented', 'Concurrent'], a: 1, why: 'SQL mô tả kết quả cần lấy; database tự quyết định cách thực thi.' },
    ],
  },
];
