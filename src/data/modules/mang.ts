import type { Lesson } from '../../types';
import { cols, diagram, interview, note, seq, tbl, tip } from '../helpers';

export const lessons: Lesson[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'go-url',
    mod: 'mang',
    title: 'Điều gì xảy ra khi bạn gõ một URL',
    pages: [284],
    min: 11,
    level: 'co-ban',
    lede: 'Đây là câu hỏi phỏng vấn kinh điển vì nó chạm tới gần như mọi tầng của web: DNS, TCP, TLS, HTTP và trình duyệt. Trả lời tốt câu này là có bộ khung để gắn mọi kiến thức mạng khác vào.',
    body: `
<h2>Bước 1: phân tích URL</h2>
<p>Giả sử Bob gõ <code>https://shop.example.com/products/phone</code> rồi nhấn Enter. Trình duyệt tách URL thành các phần, mỗi phần quyết định một việc khác nhau ở các bước sau.</p>
${tbl(['Thành phần', 'Ví dụ', 'Ý nghĩa'], [
  ['Scheme', '<code>https://</code>', 'Giao thức dùng để kết nối. HTTPS nghĩa là HTTP chạy trên TLS, mặc định cổng 443'],
  ['Domain', '<code>shop.example.com</code>', 'Tên miền, cần phân giải ra địa chỉ IP qua DNS'],
  ['Path', '<code>/products/</code>', 'Đường dẫn tới tài nguyên trên server'],
  ['Resource', '<code>phone</code>', 'Tên tài nguyên Bob muốn xem'],
])}

<h2>Toàn cảnh luồng xử lý</h2>
<p>Hình dưới gom cả hành trình vào một sơ đồ tuần tự. Mỗi mũi tên là một lần gửi gói tin hoặc một bước xử lý; phần giải thích chi tiết nằm ở các mục tiếp theo.</p>
${seq({
  actors: [
    { id: 'b', label: 'Trình duyệt', kind: 'client' },
    { id: 'dns', label: 'DNS resolver', kind: 'external' },
    { id: 's', label: 'Web server' },
    { id: 'cdn', label: 'CDN', kind: 'cache' },
  ],
  msgs: [
    { note: 'Tra cache: trình duyệt, hệ điều hành, router, ISP' },
    { from: 'b', to: 'dns', label: 'IP của shop.example.com?' },
    { from: 'dns', to: 'b', label: '203.0.113.10', dashed: true },
    { from: 'b', to: 's', label: 'SYN' },
    { from: 's', to: 'b', label: 'SYN-ACK', dashed: true },
    { from: 'b', to: 's', label: 'ACK' },
    { note: 'TLS handshake (HTTPS): xác minh chứng chỉ, thống nhất khóa phiên' },
    { from: 'b', to: 's', label: 'GET /products/phone HTTP/1.1' },
    { from: 's', to: 's', label: 'xử lý, đọc DB' },
    { from: 's', to: 'b', label: '200 OK + HTML', dashed: true, kind: 'good' },
    { from: 'b', to: 'cdn', label: 'GET app.js, style.css, ảnh' },
    { from: 'cdn', to: 'b', label: 'file tĩnh từ edge gần nhất', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Từ lúc nhấn Enter tới khi có HTML và tài nguyên tĩnh. DNS, TCP, TLS và HTTP lần lượt diễn ra trước khi trình duyệt vẽ được trang.',
})}

<h2>Bước 2: DNS lookup</h2>
<p>Trình duyệt cần địa chỉ IP để kết nối. Để tra nhanh, kết quả DNS được cache ở nhiều tầng: cache của trình duyệt, cache của hệ điều hành, cache trên router mạng nội bộ và cache ở resolver của ISP. Chỉ khi mọi tầng đều miss, resolver mới đi hỏi lần lượt root server, TLD server và authoritative server (bài DNS và CDN sẽ đi sâu phần này).</p>
${diagram({
  w: 720, h: 240,
  nodes: [
    { id: 'a', label: 'Cache trình duyệt', x: 120, y: 60, w: 150 },
    { id: 'b', label: 'Cache hệ điều hành', x: 360, y: 60, w: 160 },
    { id: 'c', label: 'Cache router', x: 600, y: 60, w: 140 },
    { id: 'd', label: 'Resolver của ISP', x: 600, y: 180, w: 150, kind: 'external' },
    { id: 'e', label: 'Root → TLD → Auth', sub: 'tra cứu đệ quy', x: 360, y: 180, w: 170, kind: 'external' },
    { id: 'f', label: 'Có địa chỉ IP', x: 120, y: 180, w: 150, kind: 'good' },
  ],
  edges: [
    { from: 'a', to: 'b', label: 'miss' },
    { from: 'b', to: 'c', label: 'miss' },
    { from: 'c', to: 'd', label: 'miss' },
    { from: 'd', to: 'e', label: 'miss' },
    { from: 'e', to: 'f', label: 'trả IP', kind: 'good' },
  ],
  caption: 'Hình: Các tầng cache DNS. Tầng nào hit thì trả IP ngay; chỉ khi tất cả đều miss mới cần tra cứu đệ quy từ root server.',
})}

<h2>Bước 3 và 4: TCP và TLS</h2>
<p>Có IP rồi, trình duyệt mở kết nối <b>TCP</b> tới server bằng bắt tay ba bước: SYN, SYN-ACK, ACK. Việc này tốn một vòng đi về (RTT). Với HTTPS, hai bên tiếp tục <b>TLS handshake</b>: server gửi chứng chỉ, trình duyệt kiểm tra chứng chỉ, rồi hai bên thống nhất khóa mã hóa cho phiên. TLS 1.3 cần thêm 1 RTT, TLS 1.2 cần 2 RTT.</p>
${tbl(['Bước', 'Chi phí điển hình', 'Cách giảm'], [
  ['DNS lookup', '0 nếu cache hit; vài chục ms nếu phải tra đệ quy', 'TTL hợp lý, <code>dns-prefetch</code>'],
  ['TCP handshake', '1 RTT', 'Keep-alive, tái sử dụng kết nối'],
  ['TLS handshake', '1 RTT (TLS 1.3) hoặc 2 RTT (TLS 1.2)', 'TLS 1.3, session resumption, <code>preconnect</code>'],
  ['Request và response', '1 RTT + thời gian server xử lý', 'Cache, CDN, nén dữ liệu'],
])}

<h2>Bước 5 và 6: HTTP request và render</h2>
<p>Trình duyệt gửi request dạng <code>GET /products/phone HTTP/1.1</code> kèm header <code>Host: shop.example.com</code>. Server xử lý (đọc cache, database), rồi trả về status <code>200 OK</code> với header như <code>Content-Type: text/html; charset=utf-8</code> và phần thân là HTML.</p>
<p>Phía sau địa chỉ IP kia hiếm khi chỉ là một máy. Ở hệ thống thật, IP thường thuộc về một load balancer hoặc reverse proxy như Nginx. Nó kết thúc TLS, chọn một app server còn khỏe để chuyển request tới; app server đọc cache, nếu miss thì query database, rồi dựng HTML hoặc JSON trả về. Trong phỏng vấn, nói thêm được đoạn này cho thấy bạn hiểu cả hai đầu của đường truyền chứ không chỉ phía trình duyệt.</p>
<p>Nhận được HTML, trình duyệt bắt đầu render. Nó parse HTML thành cây DOM, parse CSS thành CSSOM, ghép hai cây thành render tree, tính vị trí từng phần tử (layout) rồi vẽ ra màn hình (paint). Trong lúc parse, mỗi thẻ <code>&lt;script&gt;</code>, <code>&lt;link&gt;</code>, <code>&lt;img&gt;</code> lại sinh thêm request mới, thường tới CDN.</p>
${diagram({
  w: 720, h: 230,
  nodes: [
    { id: 'h', label: 'HTML', x: 90, y: 60, w: 100 },
    { id: 'dom', label: 'DOM', x: 270, y: 60, w: 110 },
    { id: 'c', label: 'CSS', x: 90, y: 170, w: 100 },
    { id: 'cssom', label: 'CSSOM', x: 270, y: 170, w: 110 },
    { id: 'rt', label: 'Render tree', x: 450, y: 115, w: 130 },
    { id: 'p', label: 'Layout + Paint', sub: 'pixel ra màn hình', x: 630, y: 115, w: 140, kind: 'good' },
  ],
  edges: [
    { from: 'h', to: 'dom', label: 'parse' },
    { from: 'c', to: 'cssom', label: 'parse' },
    { from: 'dom', to: 'rt' },
    { from: 'cssom', to: 'rt' },
    { from: 'rt', to: 'p' },
  ],
  caption: 'Hình: Pipeline render của trình duyệt. CSS chặn render, còn JavaScript đồng bộ chặn cả việc parse HTML.',
})}
${tip('<b>Thực tế.</b> Các trang lớn dùng <code>&lt;link rel="preconnect"&gt;</code> để mở sẵn TCP và TLS tới CDN ngay khi trang bắt đầu tải, và gắn <code>defer</code> cho script để JavaScript không chặn việc parse HTML. Hai thay đổi nhỏ này thường cắt được vài trăm ms trên mạng di động.')}
${note('<b>Sai lầm thường gặp.</b> Kể DNS, TCP, HTTP như thể chúng xảy ra lại cho mọi request. Thực tế DNS được cache theo TTL, kết nối TCP và TLS được tái sử dụng (keep-alive, HTTP/2 multiplexing), nên các request sau trên cùng domain bỏ qua gần hết các bước đầu.')}
${interview([
  'Mô tả từng bước khi bạn gõ một URL vào trình duyệt. Bước nào có thể bị bỏ qua ở lần truy cập thứ hai?',
  'Một trang tải chậm ở lần đầu nhưng nhanh ở lần sau. Những tầng cache nào có thể là nguyên nhân?',
  'Vì sao TLS 1.3 làm trang mở nhanh hơn TLS 1.2?',
])}`,
    keys: [
      'URL gồm scheme, domain, path, resource; scheme quyết định giao thức và cổng.',
      'Trình tự: DNS → TCP handshake → TLS handshake → HTTP request/response → render.',
      'DNS được cache ở trình duyệt, OS, router, ISP trước khi phải tra đệ quy.',
      'Trình duyệt dựng DOM và CSSOM, ghép thành render tree, rồi layout và paint.',
    ],
    quiz: [
      { q: 'Trình duyệt cần gì trước tiên để mở kết nối TCP tới shop.example.com?', o: ['Chứng chỉ TLS', 'Địa chỉ IP từ DNS', 'Cookie phiên', 'File HTML'], a: 1, why: 'TCP kết nối tới địa chỉ IP, nên trình duyệt phải phân giải tên miền qua DNS trước.' },
      { q: 'Bắt tay TCP gồm những gói nào theo thứ tự?', o: ['SYN, ACK, FIN', 'SYN, SYN-ACK, ACK', 'ClientHello, ServerHello', 'GET, 200 OK'], a: 1, why: 'Client gửi SYN, server trả SYN-ACK, client xác nhận bằng ACK.' },
      { q: 'Ở lần truy cập thứ hai trong vài phút, bước nào thường được bỏ qua nhờ cache?', o: ['Render trang', 'Tra cứu DNS đệ quy', 'Gửi HTTP request', 'Parse HTML'], a: 1, why: 'Kết quả DNS được cache theo TTL ở trình duyệt và hệ điều hành nên không cần hỏi lại root, TLD.' },
      { q: 'Trình duyệt ghép những gì để tạo render tree?', o: ['DOM và CSSOM', 'HTML và JavaScript', 'DNS và TCP', 'Cookie và header'], a: 0, why: 'Render tree là kết hợp của cây DOM (từ HTML) và CSSOM (từ CSS).' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'dns-cdn',
    mod: 'mang',
    title: 'DNS và CDN',
    pages: [284, 254, 322],
    min: 12,
    level: 'co-ban',
    lede: 'DNS quyết định người dùng tìm thấy server của bạn, CDN quyết định họ nhận nội dung nhanh tới đâu. Cả hai đều là hệ thống phân tán khổng lồ dựa trên cache.',
    body: `
<h2>DNS: danh bạ của Internet</h2>
<p><b>DNS</b> (Domain Name System) chuyển tên miền dễ nhớ như <code>example.com</code> thành địa chỉ IP mà máy tính dùng để kết nối. DNS được tổ chức thành cây phân cấp. Trên cùng là <b>root server</b>, tiếp theo là <b>TLD server</b> phụ trách từng đuôi như <code>.com</code>, <code>.vn</code>, và dưới cùng là <b>authoritative server</b> giữ bản ghi thật của từng tên miền.</p>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'root', label: 'Root server', sub: '"."', x: 360, y: 55, w: 140, kind: 'external' },
    { id: 'com', label: 'TLD .com', x: 190, y: 150, w: 130, kind: 'external' },
    { id: 'vn', label: 'TLD .vn', x: 530, y: 150, w: 130, kind: 'external' },
    { id: 'a1', label: 'Authoritative', sub: 'example.com', x: 190, y: 245, w: 150 },
    { id: 'a2', label: 'Authoritative', sub: 'example.vn', x: 530, y: 245, w: 150 },
  ],
  edges: [
    { from: 'root', to: 'com', label: 'ủy quyền' },
    { from: 'root', to: 'vn', label: 'ủy quyền' },
    { from: 'com', to: 'a1', label: 'NS record' },
    { from: 'vn', to: 'a2', label: 'NS record' },
  ],
  caption: 'Hình: Cây phân cấp DNS. Mỗi tầng chỉ biết tầng ngay dưới nó do ai quản lý.',
})}

<h2>Tra cứu đệ quy hoạt động thế nào</h2>
<p>Khi mọi tầng cache đều miss, máy người dùng hỏi một <b>recursive resolver</b> (của ISP, hoặc public như 8.8.8.8, 1.1.1.1). Resolver nhận trách nhiệm tìm câu trả lời cuối cùng: nó hỏi lần lượt từng tầng, mỗi tầng trả về địa chỉ của tầng kế tiếp. Phía client gọi là truy vấn đệ quy (recursive), còn resolver hỏi các server khác theo kiểu lặp (iterative).</p>
${seq({
  actors: [
    { id: 'c', label: 'Máy người dùng', kind: 'client' },
    { id: 'r', label: 'Resolver', kind: 'lb' },
    { id: 'root', label: 'Root', kind: 'external' },
    { id: 'tld', label: 'TLD .com', kind: 'external' },
    { id: 'auth', label: 'Authoritative' },
  ],
  msgs: [
    { note: 'Cache trình duyệt và hệ điều hành đều miss' },
    { from: 'c', to: 'r', label: 'example.com?' },
    { from: 'r', to: 'root', label: 'example.com?' },
    { from: 'root', to: 'r', label: 'hỏi TLD .com', dashed: true },
    { from: 'r', to: 'tld', label: 'example.com?' },
    { from: 'tld', to: 'r', label: 'NS: ns1.example.com', dashed: true },
    { from: 'r', to: 'auth', label: 'A record của example.com?' },
    { from: 'auth', to: 'r', label: 'A 203.0.113.10, TTL 300', dashed: true, kind: 'good' },
    { note: 'Resolver cache kết quả trong 300 giây cho mọi người dùng khác' },
    { from: 'r', to: 'c', label: '203.0.113.10', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Tra cứu DNS đệ quy. Resolver đi từ root xuống authoritative, rồi cache câu trả lời theo TTL.',
})}
<p>DNS chủ yếu chạy trên UDP cổng 53 vì truy vấn nhỏ và cần nhanh; khi câu trả lời quá lớn hoặc khi đồng bộ zone giữa các server, DNS chuyển sang TCP.</p>
${tbl(['Bản ghi', 'Ý nghĩa', 'Ví dụ'], [
  ['A', 'Tên miền → địa chỉ IPv4', '<code>example.com → 203.0.113.10</code>'],
  ['AAAA', 'Tên miền → địa chỉ IPv6', '<code>example.com → 2001:db8::10</code>'],
  ['CNAME', 'Bí danh trỏ sang tên miền khác', '<code>www → example.com</code>, hoặc trỏ sang tên của CDN'],
  ['MX', 'Server nhận email của tên miền', '<code>mail.example.com</code>, có độ ưu tiên'],
  ['NS', 'Authoritative server phụ trách tên miền', '<code>ns1.example.com</code>'],
  ['TXT', 'Chuỗi văn bản tùy ý', 'Xác minh tên miền, SPF, DKIM cho email'],
])}
<p>Mỗi bản ghi có <b>TTL</b> quy định được cache bao lâu. TTL dài giảm tải cho DNS và tăng tốc tra cứu, nhưng khi đổi IP thì người dùng phải chờ cache hết hạn mới thấy địa chỉ mới.</p>

<h2>CDN: đưa nội dung tới gần người dùng</h2>
<p><b>CDN</b> (Content Delivery Network) là mạng máy chủ đặt ở nhiều vị trí địa lý (gọi là PoP hoặc edge), giữ bản sao nội dung tĩnh như ảnh, video, CSS, JS. DNS của CDN trả về địa chỉ edge gần người dùng nhất. Nếu edge đã có file (cache hit), người dùng nhận ngay; nếu chưa (cache miss), edge kéo file từ server gốc (origin), lưu lại rồi trả về.</p>
${diagram({
  w: 720, h: 270,
  nodes: [
    { id: 'u1', label: 'Người dùng VN', x: 90, y: 70, w: 130, kind: 'client' },
    { id: 'u2', label: 'Người dùng Mỹ', x: 90, y: 200, w: 130, kind: 'client' },
    { id: 'e1', label: 'Edge Singapore', sub: 'cache hit', x: 330, y: 70, w: 140, kind: 'cache' },
    { id: 'e2', label: 'Edge Virginia', sub: 'cache miss', x: 330, y: 200, w: 140, kind: 'cache' },
    { id: 'o', label: 'Origin server', sub: 'bản gốc', x: 600, y: 135, w: 140 },
  ],
  edges: [
    { from: 'u1', to: 'e1', label: 'gần, nhanh', kind: 'good' },
    { from: 'u2', to: 'e2', label: 'gần' },
    { from: 'e2', to: 'o', label: 'miss: kéo file', dashed: true },
    { from: 'e1', to: 'o', label: 'chỉ khi hết TTL', dashed: true, kind: 'muted' },
  ],
  caption: 'Hình: CDN phục vụ từ edge gần nhất. Origin chỉ nhận request khi edge chưa có file hoặc file đã hết hạn.',
})}
${cols([
  { title: 'Pull CDN', body: '<p>Edge tự kéo file từ origin ở lần request đầu tiên rồi cache theo <code>Cache-Control</code>. Dễ vận hành, phù hợp đa số website. Request đầu tiên ở mỗi edge sẽ chậm hơn.</p>' },
  { title: 'Push CDN', body: '<p>Bạn chủ động upload nội dung lên CDN trước khi người dùng cần. Phù hợp file lớn, ít thay đổi như video, bản cài đặt. Bạn tự chịu trách nhiệm cập nhật và xóa nội dung cũ.</p>' },
])}
<p>Edge cache được điều khiển bằng header như <code>Cache-Control: public, max-age=31536000</code>. Để cập nhật file mà không phải chờ hết hạn, cách bền vững nhất là đặt phiên bản vào tên file (<code>app.3f9a1c.js</code>); mỗi lần build sinh tên mới nên cache cũ tự hết tác dụng. Lệnh purge của CDN chỉ nên dùng khi khẩn cấp.</p>

<h2>8 mẹo tăng tốc frontend</h2>
<p>CDN giải quyết phần mạng. Sách bổ sung 8 mẹo ở phía frontend để trang tải nhanh hơn nữa:</p>
${tbl(['Mẹo', 'Cách làm'], [
  ['Nén dữ liệu', 'Nén file (gzip, Brotli) và thu gọn dữ liệu trước khi truyền'],
  ['Selective rendering (windowing)', 'Chỉ render phần tử đang hiển thị, ví dụ danh sách dài chỉ vẽ các dòng trên màn hình'],
  ['Code splitting', 'Chia bundle lớn thành nhiều bundle nhỏ, tải theo nhu cầu'],
  ['Priority-based loading', 'Ưu tiên tài nguyên thiết yếu và nội dung nằm trong màn hình đầu (above the fold)'],
  ['Pre-loading', 'Tải trước tài nguyên chắc chắn sẽ dùng cho trang hiện tại'],
  ['Tree shaking', 'Loại bỏ code không bao giờ được gọi khỏi bundle cuối'],
  ['Pre-fetching', 'Tải hoặc cache trước tài nguyên có khả năng cần ở bước tiếp theo'],
  ['Dynamic import', 'Chỉ tải module khi người dùng thực hiện hành động cần tới nó'],
])}
${tip('<b>Thực tế.</b> Netflix vận hành CDN riêng tên Open Connect, đặt máy chủ chứa sẵn phim ngay trong mạng của các nhà mạng. Phần lớn lưu lượng video vì vậy không phải đi qua Internet đường dài, còn backend trên cloud chỉ lo phần duyệt phim, đăng nhập và gợi ý.')}
${note('<b>Sai lầm thường gặp.</b> Để TTL DNS 24 giờ rồi chuyển server. Người dùng tiếp tục bị gửi tới IP cũ suốt một ngày. Trước khi migrate vài ngày, hãy hạ TTL xuống 60-300 giây. Một lỗi khác là cho CDN cache trang có dữ liệu cá nhân, khiến người này thấy thông tin của người khác; trang như vậy cần <code>Cache-Control: private</code> hoặc <code>no-store</code>.')}
${interview([
  'Mô tả quá trình tra cứu DNS đệ quy khi mọi tầng cache đều miss. Resolver lưu kết quả bao lâu?',
  'Bạn cập nhật file app.js nhưng người dùng vẫn nhận bản cũ từ CDN. Nguyên nhân và cách khắc phục lâu dài?',
  'Khi nào chọn push CDN thay vì pull CDN?',
])}`,
    keys: [
      'DNS phân cấp: root → TLD → authoritative; resolver tra cứu thay client rồi cache theo TTL.',
      'Bản ghi phổ biến: A, AAAA, CNAME, MX, NS, TXT. DNS chủ yếu chạy trên UDP cổng 53.',
      'CDN phục vụ nội dung từ edge gần người dùng; pull CDN tự kéo từ origin, push CDN do bạn upload trước.',
      'Đặt phiên bản vào tên file để cập nhật cache an toàn; hạ TTL DNS trước khi migrate.',
    ],
    quiz: [
      { q: 'Bản ghi DNS nào ánh xạ tên miền sang địa chỉ IPv6?', o: ['A', 'AAAA', 'CNAME', 'MX'], a: 1, why: 'A dùng cho IPv4, AAAA dùng cho IPv6.' },
      { q: 'Trong tra cứu đệ quy, root server trả lời resolver điều gì?', o: ['Địa chỉ IP cuối cùng', 'Địa chỉ TLD server phụ trách đuôi tên miền', 'Chứng chỉ TLS', 'Bản ghi MX'], a: 1, why: 'Root chỉ biết TLD nào phụ trách .com, .vn... và chỉ resolver tới đó.' },
      { q: 'Với pull CDN, request đầu tiên tới một edge chưa có file sẽ thế nào?', o: ['Bị lỗi 404', 'Edge kéo file từ origin, cache lại rồi trả về', 'Chuyển hướng người dùng về origin', 'Chờ admin upload file'], a: 1, why: 'Pull CDN tự lấy file từ origin ở lần miss đầu tiên rồi cache cho các request sau.' },
      { q: 'Mẹo frontend nào loại bỏ code không bao giờ được dùng khỏi bundle?', o: ['Pre-fetching', 'Tree shaking', 'Windowing', 'Dynamic import'], a: 1, why: 'Tree shaking phân tích import và bỏ phần code chết khỏi bundle cuối.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'tcp-udp',
    mod: 'mang',
    title: 'TCP, UDP và các giao thức mạng phổ biến',
    pages: [17, 352, 216],
    min: 12,
    level: 'co-ban',
    lede: 'Hầu hết giao thức ứng dụng bạn dùng hằng ngày đều chạy trên TCP hoặc UDP. Chọn đúng tầng vận chuyển là chọn giữa độ tin cậy và độ trễ.',
    body: `
<h2>TCP và UDP khác nhau thế nào</h2>
<p><b>TCP</b> (Transmission Control Protocol) mở kết nối trước khi gửi, đánh số thứ tự từng byte, gửi lại gói bị mất và đảm bảo dữ liệu tới đúng thứ tự. <b>UDP</b> (User Datagram Protocol) chỉ đóng gói dữ liệu thành datagram rồi gửi đi, không bắt tay, không gửi lại, không sắp xếp. UDP đơn giản, header nhỏ và nhanh, phần còn lại ứng dụng tự lo.</p>
${tbl(['Tiêu chí', 'TCP', 'UDP'], [
  ['Kết nối', 'Có, bắt tay 3 bước trước khi gửi', 'Không, gửi ngay'],
  ['Độ tin cậy', 'Xác nhận (ACK) và gửi lại gói mất', 'Không đảm bảo tới nơi'],
  ['Thứ tự', 'Đảm bảo đúng thứ tự', 'Có thể đến lộn xộn'],
  ['Kiểm soát luồng, tắc nghẽn', 'Có (flow control, congestion control)', 'Không'],
  ['Header', '20-60 byte', '8 byte'],
  ['Dùng cho', 'Web, email, truyền file, database', 'Video call, DNS, game, IoT, HTTP/3'],
])}

<h2>Bắt tay ba bước và đóng kết nối</h2>
<p>Mỗi bên chọn một số thứ tự ban đầu ngẫu nhiên và phải xác nhận số của bên kia. Sau ba gói, cả hai biết đối phương sẵn sàng nhận và biết bắt đầu đếm từ đâu. Đóng kết nối thì mỗi chiều gửi FIN riêng nên thường cần bốn gói.</p>
${seq({
  actors: [
    { id: 'c', label: 'Client', kind: 'client' },
    { id: 's', label: 'Server' },
  ],
  msgs: [
    { from: 'c', to: 's', label: 'SYN, seq = x' },
    { from: 's', to: 'c', label: 'SYN-ACK, seq = y, ack = x + 1', dashed: true },
    { from: 'c', to: 's', label: 'ACK, ack = y + 1' },
    { note: 'ESTABLISHED: hai bên bắt đầu trao đổi dữ liệu' },
    { from: 'c', to: 's', label: 'Dữ liệu (HTTP request)' },
    { from: 's', to: 'c', label: 'ACK + dữ liệu (HTTP response)', dashed: true },
    { note: 'Đóng kết nối: mỗi chiều đóng riêng' },
    { from: 'c', to: 's', label: 'FIN' },
    { from: 's', to: 'c', label: 'ACK', dashed: true },
    { from: 's', to: 'c', label: 'FIN', dashed: true },
    { from: 'c', to: 's', label: 'ACK' },
  ],
  caption: 'Hình: TCP bắt tay ba bước (SYN, SYN-ACK, ACK) để mở kết nối và trao đổi FIN theo từng chiều để đóng.',
})}
<p>Chi phí bắt tay là một vòng đi về (RTT) trước khi gửi được byte dữ liệu đầu tiên. Với khách hàng ở xa server 150 ms, mỗi kết nối mới tốn thêm 150 ms. Đó là lý do keep-alive và connection pool quan trọng.</p>

<h2>4 trường hợp dùng UDP phổ biến</h2>
<p>Sách liệt kê bốn nhóm ứng dụng chọn UDP vì đơn giản, nhanh và ít overhead:</p>
<ul>
<li><b>Live video và VoIP:</b> ứng dụng gọi video chịu được mất vài gói. Một khung hình đến muộn thì vô dụng, nên chờ TCP gửi lại còn tệ hơn bỏ qua.</li>
<li><b>DNS:</b> truy vấn nhỏ, cần nhanh, nên phần lớn chạy trên UDP; DNS chỉ dùng TCP cho câu trả lời lớn hoặc đồng bộ zone.</li>
<li><b>Market data multicast:</b> trong giao dịch tần suất cao, sàn phát dữ liệu giá tới nhiều người nhận cùng lúc bằng UDP multicast với độ trễ thấp.</li>
<li><b>IoT:</b> thiết bị nhỏ gửi các gói dữ liệu ngắn, không đủ tài nguyên duy trì kết nối TCP.</li>
</ul>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'x', label: 'Sàn giao dịch', sub: 'feed giá', x: 100, y: 145, w: 140, kind: 'external' },
    { id: 'sw', label: 'Switch', sub: 'multicast group', x: 330, y: 145, w: 140, kind: 'lb' },
    { id: 'a', label: 'Trading server A', x: 590, y: 55, w: 160 },
    { id: 'b', label: 'Trading server B', x: 590, y: 145, w: 160 },
    { id: 'c', label: 'Trading server C', x: 590, y: 235, w: 160 },
  ],
  edges: [
    { from: 'x', to: 'sw', label: '1 gói UDP' },
    { from: 'sw', to: 'a', kind: 'good' },
    { from: 'sw', to: 'b', kind: 'good' },
    { from: 'sw', to: 'c', kind: 'good' },
  ],
  caption: 'Hình: UDP multicast. Sàn gửi một gói, hạ tầng mạng nhân bản tới mọi thành viên trong nhóm, không có bắt tay hay ACK làm chậm.',
})}

<h2>8 giao thức mạng phổ biến</h2>
<p>Sách liệt kê 8 giao thức mà developer gặp hằng ngày. Hình dưới cho thấy mỗi giao thức nằm trên tầng vận chuyển nào.</p>
${diagram({
  w: 720, h: 370,
  nodes: [
    { id: 'http', label: 'HTTP / HTTPS', x: 100, y: 55, w: 130 },
    { id: 'ws', label: 'WebSocket', x: 270, y: 55, w: 130 },
    { id: 'smtp', label: 'SMTP / FTP', x: 440, y: 55, w: 130 },
    { id: 'h3', label: 'HTTP/3', x: 620, y: 55, w: 130 },
    { id: 'tcp', label: 'TCP', x: 270, y: 150, w: 130, kind: 'lb' },
    { id: 'dns', label: 'DNS', x: 440, y: 150, w: 130 },
    { id: 'quic', label: 'QUIC', sub: 'tin cậy + TLS 1.3', x: 620, y: 150, w: 140 },
    { id: 'udp', label: 'UDP', x: 530, y: 240, w: 130, kind: 'lb' },
    { id: 'ip', label: 'IP (IPv4 / IPv6)', x: 360, y: 325, w: 300, kind: 'store' },
  ],
  edges: [
    { from: 'http', to: 'tcp' },
    { from: 'ws', to: 'tcp' },
    { from: 'smtp', to: 'tcp' },
    { from: 'h3', to: 'quic' },
    { from: 'quic', to: 'udp' },
    { from: 'dns', to: 'udp' },
    { from: 'tcp', to: 'ip' },
    { from: 'udp', to: 'ip' },
  ],
  caption: 'Hình: Giao thức ứng dụng và tầng vận chuyển bên dưới. HTTP/3 dựng độ tin cậy trên UDP thông qua QUIC.',
})}
${tbl(['Giao thức', 'Dùng để', 'Tầng dưới'], [
  ['HTTP', 'Trao đổi tài liệu và API trên web', 'TCP'],
  ['HTTP/3', 'HTTP trên QUIC, giảm độ trễ và tránh nghẽn đầu hàng của TCP', 'UDP'],
  ['HTTPS', 'HTTP được mã hóa bằng TLS', 'TCP (hoặc QUIC)'],
  ['WebSocket', 'Kênh hai chiều lâu dài cho chat, thông báo realtime', 'TCP'],
  ['TCP', 'Truyền dữ liệu tin cậy, đúng thứ tự', 'IP'],
  ['UDP', 'Truyền datagram nhanh, không đảm bảo', 'IP'],
  ['SMTP', 'Gửi email giữa các mail server', 'TCP'],
  ['FTP', 'Truyền file giữa client và server', 'TCP'],
])}

<h2>IPv4 và IPv6</h2>
<p>Lý do chính để chuyển sang IPv6 là IPv4 đã cạn địa chỉ. Địa chỉ IPv4 dài 32 bit, viết thành bốn số thập phân như <code>192.168.0.12</code>, cho khoảng 4,3 tỷ địa chỉ. IPv6 dài 128 bit, viết thành tám nhóm hex như <code>2001:db8::10</code>, đủ cho gần như vô hạn thiết bị.</p>
${tbl(['Tiêu chí', 'IPv4', 'IPv6'], [
  ['Độ dài địa chỉ', '32 bit (~4,3 tỷ)', '128 bit (~3,4 × 10<sup>38</sup>)'],
  ['Header', '20-60 byte, nhiều trường (checksum, fragment offset, options)', 'Cố định 40 byte; trường ít dùng chuyển sang extension header'],
  ['NAT', 'Phổ biến để nhiều máy dùng chung một IP public', 'Không cần, mỗi thiết bị có địa chỉ riêng'],
  ['Chuyển đổi', 'Dual stack: chạy song song cả hai trên cùng thiết bị', 'Ngoài ra có tunneling và NAT64'],
])}
${tip('<b>Thực tế.</b> HTTP/3 là ví dụ rõ nhất cho việc "UDP không đáng tin" chỉ đúng ở tầng vận chuyển. QUIC chạy trên UDP nhưng tự làm ACK, gửi lại gói mất và mã hóa bằng TLS 1.3. Lý do chọn UDP là để triển khai ở user space, cập nhật nhanh mà không cần chờ hệ điều hành và thiết bị mạng hỗ trợ giao thức mới.')}
${note('<b>Sai lầm thường gặp.</b> Nghĩ rằng TCP đảm bảo message đã được ứng dụng bên kia xử lý. TCP chỉ đảm bảo byte tới được bộ đệm của hệ điều hành bên nhận. Nếu tiến trình chết trước khi xử lý, dữ liệu vẫn mất; muốn chắc chắn phải có xác nhận ở tầng ứng dụng.')}
${interview([
  'Vì sao ứng dụng gọi video thường dùng UDP thay vì TCP?',
  'Giải thích bắt tay ba bước của TCP. Vì sao không thể chỉ dùng hai bước?',
  'HTTP/3 chạy trên UDP. Làm sao nó vẫn đảm bảo dữ liệu tới nơi đúng thứ tự?',
])}`,
    keys: [
      'TCP: có kết nối, tin cậy, đúng thứ tự. UDP: không kết nối, nhanh, header 8 byte.',
      'Bắt tay TCP: SYN → SYN-ACK → ACK, tốn 1 RTT trước khi gửi dữ liệu.',
      'UDP dùng cho live video/VoIP, DNS, market data multicast và IoT.',
      'IPv4 32 bit (~4,3 tỷ địa chỉ), IPv6 128 bit với header cố định 40 byte; dual stack giúp chuyển đổi.',
    ],
    quiz: [
      { q: 'Gói thứ hai trong bắt tay ba bước của TCP là gì?', o: ['SYN', 'ACK', 'SYN-ACK', 'FIN'], a: 2, why: 'Server trả lời SYN của client bằng SYN-ACK, vừa xác nhận vừa gửi số thứ tự của mình.' },
      { q: 'Vì sao truy vấn DNS thường dùng UDP?', o: ['UDP bảo mật hơn', 'Truy vấn nhỏ, cần nhanh, không đáng để bắt tay', 'TCP không hỗ trợ cổng 53', 'UDP đảm bảo thứ tự'], a: 1, why: 'Một truy vấn DNS vừa trong một gói; bỏ bắt tay TCP giúp giảm độ trễ.' },
      { q: 'Địa chỉ IPv6 dài bao nhiêu bit?', o: ['32', '64', '128', '256'], a: 2, why: 'IPv6 dùng 128 bit, IPv4 dùng 32 bit.' },
      { q: 'Giao thức nào sau đây chạy trên UDP?', o: ['SMTP', 'WebSocket', 'HTTP/3', 'FTP'], a: 2, why: 'HTTP/3 chạy trên QUIC, mà QUIC được xây trên UDP.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'http',
    mod: 'mang',
    title: 'HTTP: phương thức, status code, cookie và các phiên bản',
    pages: [204, 299, 44, 57, 271],
    min: 13,
    level: 'co-ban',
    lede: 'HTTP là ngôn ngữ chung giữa trình duyệt, mobile app và backend. Hiểu đúng phương thức, status code và cookie giúp API của bạn dễ dùng, dễ cache và an toàn hơn.',
    body: `
<h2>Phương thức HTTP</h2>
<p>Mỗi request có một <b>phương thức</b> (verb) cho biết client muốn làm gì với tài nguyên. Hai tính chất quan trọng nhất là <b>safe</b> (không thay đổi dữ liệu trên server) và <b>idempotent</b> (gọi một lần hay nhiều lần cho cùng kết quả trên server). Tính idempotent quyết định việc retry có an toàn hay không.</p>
${tbl(['Phương thức', 'Dùng để', 'Safe', 'Idempotent'], [
  ['GET', 'Lấy tài nguyên', 'Có', 'Có'],
  ['HEAD', 'Như GET nhưng chỉ trả header, không có body', 'Có', 'Có'],
  ['OPTIONS', 'Hỏi tài nguyên hỗ trợ những gì (dùng trong CORS preflight)', 'Có', 'Có'],
  ['TRACE', 'Kiểm tra vòng lặp: server trả lại request nhận được', 'Có', 'Có'],
  ['PUT', 'Tạo hoặc thay thế toàn bộ tài nguyên', 'Không', 'Có'],
  ['DELETE', 'Xóa tài nguyên', 'Không', 'Có'],
  ['POST', 'Tạo tài nguyên mới, gửi lệnh', 'Không', 'Không: gửi hai lần tạo hai bản ghi'],
  ['PATCH', 'Sửa một phần tài nguyên', 'Không', 'Không đảm bảo'],
  ['CONNECT', 'Mở tunnel tới server đích (proxy HTTPS)', 'Không', 'Không'],
])}

<h2>Status code</h2>
<p>Response luôn có status code ba chữ số, chia thành 5 nhóm và được định nghĩa trong RFC 9110. Chỉ cần nhìn chữ số đầu là biết lỗi thuộc về ai.</p>
${tbl(['Nhóm', 'Ý nghĩa', 'Mã hay gặp'], [
  ['1xx', 'Thông tin, request đang được xử lý', '<code>100 Continue</code>, <code>101 Switching Protocols</code> (nâng lên WebSocket)'],
  ['2xx', 'Thành công', '<code>200 OK</code>, <code>201 Created</code>, <code>204 No Content</code>'],
  ['3xx', 'Chuyển hướng', '<code>301</code>/<code>308</code> chuyển vĩnh viễn, <code>302</code>/<code>307</code> chuyển tạm, <code>304 Not Modified</code>'],
  ['4xx', 'Lỗi phía client', '<code>400</code>, <code>401 Unauthorized</code>, <code>403 Forbidden</code>, <code>404</code>, <code>409 Conflict</code>, <code>429 Too Many Requests</code>'],
  ['5xx', 'Lỗi phía server', '<code>500</code>, <code>502 Bad Gateway</code>, <code>503 Service Unavailable</code>, <code>504 Gateway Timeout</code>'],
])}
<p>Sách đặt câu hỏi về mã 401. Dù tên là "Unauthorized", 401 thực chất nói về <b>xác thực</b> (authentication): server chưa biết bạn là ai, hãy gửi thông tin đăng nhập. Còn 403 nói về <b>phân quyền</b> (authorization): server biết bạn là ai nhưng bạn không có quyền truy cập.</p>

<h2>Cookie: cho HTTP một chút trí nhớ</h2>
<p>HTTP vốn <b>stateless</b>: mỗi request độc lập, server không nhớ bạn là ai. Sách so sánh cookie với tấm thẻ ở quán cà phê: lần đầu Bob gọi một ly espresso hai đường, thu ngân ghi thẻ và đưa Bob giữ. Lần sau Bob chỉ cần đưa thẻ là quán biết ngay khách quen thích gì. Cookie là tấm thẻ đó: server cấp một mẩu dữ liệu nhỏ, trình duyệt lưu lại và tự gửi kèm mọi request sau tới cùng domain.</p>
${seq({
  actors: [
    { id: 'b', label: 'Trình duyệt', kind: 'client' },
    { id: 's', label: 'Server' },
  ],
  msgs: [
    { from: 'b', to: 's', label: 'POST /login (email, mật khẩu)' },
    { from: 's', to: 'b', label: '200 OK, Set-Cookie: sid=abc123; HttpOnly; Secure; SameSite=Lax', dashed: true },
    { note: 'Trình duyệt lưu cookie theo domain và path' },
    { from: 'b', to: 's', label: 'GET /cart, Cookie: sid=abc123' },
    { note: 'Server tra session abc123 và nhận ra đây là Bob' },
    { from: 's', to: 'b', label: '200 OK, giỏ hàng của Bob', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Server cấp cookie qua header Set-Cookie; trình duyệt tự gửi lại qua header Cookie ở các request sau.',
})}
${tbl(['Thuộc tính', 'Tác dụng'], [
  ['Name, Value', 'Tên và giá trị, mỗi cookie tối đa khoảng 4 KB'],
  ['Domain, Path', 'Phạm vi domain và đường dẫn mà trình duyệt gửi kèm cookie'],
  ['Expires / Max-Age', 'Thời hạn. Không đặt thì là session cookie, mất khi đóng trình duyệt'],
  ['Secure', 'Chỉ gửi qua HTTPS'],
  ['HttpOnly', 'JavaScript không đọc được qua <code>document.cookie</code>, giảm thiệt hại khi bị XSS'],
  ['SameSite', '<code>Strict</code>: không gửi khi request đến từ site khác; <code>Lax</code>: chỉ gửi khi người dùng điều hướng bằng link; <code>None</code>: luôn gửi, bắt buộc kèm <code>Secure</code>. Chống CSRF'],
])}

<h2>HTTP/1.1, HTTP/2 và HTTP/3</h2>
<p><b>HTTP/1.1</b> là văn bản thuần, mỗi kết nối TCP chỉ xử lý một request tại một thời điểm. Trình duyệt phải mở khoảng 6 kết nối song song cho mỗi domain, và request phía sau phải chờ request phía trước (head-of-line blocking).</p>
<p>Sách giải thích 5 điểm làm <b>HTTP/2</b> nhanh hơn: <b>binary framing</b> mã hóa message thành các frame nhị phân nhỏ; nhờ đó có <b>multiplexing</b>, nhiều request và response đan xen trên cùng một kết nối; <b>stream prioritization</b> cho phép gán trọng số để tài nguyên quan trọng được gửi trước; <b>server push</b> gửi kèm tài nguyên trước khi client hỏi (Chrome đã tắt tính năng này từ 2022); và <b>HPACK</b> nén header lặp lại giữa các request. Sách cũng lưu ý HTTP/2 vẫn có thể chậm trong một số tình huống, nên cần đo thực tế.</p>
<p>Điểm yếu còn lại của HTTP/2 nằm ở TCP: một gói bị mất làm mọi stream trên kết nối phải chờ. <b>HTTP/3</b> chạy trên <b>QUIC</b> (dựa trên UDP), mỗi stream độc lập nên mất gói ở stream này không chặn stream khác. QUIC gộp TLS 1.3 vào handshake nên mở kết nối chỉ mất 1 RTT, và kết nối không bị đứt khi điện thoại chuyển từ Wi-Fi sang 4G.</p>
${diagram({
  w: 720, h: 310,
  groups: [
    { x: 10, y: 30, w: 230, h: 265, label: 'HTTP/1.1' },
    { x: 245, y: 30, w: 230, h: 265, label: 'HTTP/2' },
    { x: 480, y: 30, w: 230, h: 265, label: 'HTTP/3' },
  ],
  nodes: [
    { id: 'c1', label: 'Trình duyệt', x: 125, y: 80, w: 130, kind: 'client' },
    { id: 'm1', label: 'Nhiều kết nối TCP\nmỗi cái 1 request', x: 125, y: 165, w: 190, h: 56, kind: 'warn' },
    { id: 's1', label: 'Server', x: 125, y: 250, w: 130 },
    { id: 'c2', label: 'Trình duyệt', x: 360, y: 80, w: 130, kind: 'client' },
    { id: 'm2', label: 'Một kết nối TCP\nnhiều stream', x: 360, y: 165, w: 190, h: 56 },
    { id: 's2', label: 'Server', x: 360, y: 250, w: 130 },
    { id: 'c3', label: 'Trình duyệt', x: 595, y: 80, w: 130, kind: 'client' },
    { id: 'm3', label: 'QUIC trên UDP\nstream độc lập', x: 595, y: 165, w: 190, h: 56, kind: 'good' },
    { id: 's3', label: 'Server', x: 595, y: 250, w: 130 },
  ],
  edges: [
    { from: 'c1', to: 'm1', both: true },
    { from: 'm1', to: 's1', both: true },
    { from: 'c2', to: 'm2', both: true },
    { from: 'm2', to: 's2', both: true },
    { from: 'c3', to: 'm3', both: true },
    { from: 'm3', to: 's3', both: true },
  ],
  caption: 'Hình: Ba thế hệ HTTP. HTTP/2 gom request vào một kết nối; HTTP/3 chuyển sang QUIC để mất gói ở một stream không chặn các stream khác.',
})}
${tbl(['Phiên bản', 'Năm', 'Điểm chính'], [
  ['HTTP/1.1', '1997', 'Văn bản, keep-alive, một request mỗi lúc trên mỗi kết nối'],
  ['HTTP/2', '2015', 'Binary framing, multiplexing, HPACK, ưu tiên stream'],
  ['HTTP/3', '2022', 'QUIC trên UDP, TLS 1.3 tích hợp, không nghẽn đầu hàng ở tầng vận chuyển'],
])}
${tip('<b>Thực tế.</b> Nhiều kỹ thuật tối ưu thời HTTP/1.1 như gộp mọi file JS thành một bundle khổng lồ, hay chia ảnh ra nhiều subdomain (domain sharding) để mở thêm kết nối, trở nên thừa hoặc phản tác dụng với HTTP/2. Khi nâng cấp giao thức, hãy xem lại các "mẹo" cũ.')}
${note('<b>Sai lầm thường gặp.</b> Dùng GET cho thao tác thay đổi dữ liệu (ví dụ <code>GET /delete?id=5</code>). Crawler, prefetch của trình duyệt hay proxy cache đều coi GET là an toàn và có thể gọi lại bất cứ lúc nào. Một lỗi khác là luôn trả <code>200</code> kèm thông báo lỗi trong body, khiến client, cache và monitoring đều hiểu sai.')}
${interview([
  'PUT và POST khác nhau thế nào về tính idempotent? Điều đó ảnh hưởng gì tới việc retry?',
  'Phân biệt 401 và 403. Khi token hết hạn, API nên trả mã nào?',
  'Bạn sẽ đặt những thuộc tính nào cho cookie phiên đăng nhập, và vì sao?',
  'HTTP/2 đã có multiplexing, vậy HTTP/3 giải quyết thêm vấn đề gì?',
])}`,
    keys: [
      'GET, PUT, DELETE là idempotent; POST thì không. GET, HEAD, OPTIONS là safe.',
      'Status code: 2xx thành công, 3xx chuyển hướng, 4xx lỗi client, 5xx lỗi server. 401 là chưa xác thực, 403 là không có quyền.',
      'Cookie phiên nên có HttpOnly, Secure và SameSite để chống XSS đánh cắp và CSRF.',
      'HTTP/2 multiplex nhiều stream trên một kết nối TCP; HTTP/3 chạy trên QUIC/UDP để tránh nghẽn đầu hàng.',
    ],
    quiz: [
      { q: 'Phương thức nào không idempotent?', o: ['GET', 'PUT', 'DELETE', 'POST'], a: 3, why: 'Gửi hai POST giống nhau có thể tạo hai bản ghi; GET, PUT, DELETE gọi lặp lại vẫn cho cùng trạng thái.' },
      { q: 'Người dùng đã đăng nhập nhưng truy cập trang admin không được phép. Mã phù hợp là?', o: ['401', '403', '404', '500'], a: 1, why: 'Server đã biết người dùng là ai (đã xác thực) nhưng họ không có quyền, nên dùng 403 Forbidden.' },
      { q: 'Thuộc tính cookie nào ngăn JavaScript đọc cookie?', o: ['Secure', 'SameSite', 'HttpOnly', 'Domain'], a: 2, why: 'HttpOnly khiến cookie không truy cập được qua document.cookie, giảm rủi ro khi bị XSS.' },
      { q: 'Tính năng nào của HTTP/2 cho phép nhiều request chạy song song trên một kết nối?', o: ['Server push', 'Multiplexing', 'HPACK', 'Keep-alive'], a: 1, why: 'Binary framing cho phép đan xen frame của nhiều stream trên cùng một kết nối TCP.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'https-tls',
    mod: 'mang',
    title: 'HTTPS, TLS, SSH và VPN',
    pages: [189, 321, 59],
    min: 13,
    level: 'trung-binh',
    lede: 'Ba công nghệ này cùng giải một bài toán: nói chuyện an toàn qua một mạng không tin cậy. Chúng dùng chung bộ công cụ gồm mã hóa bất đối xứng để trao đổi khóa và mã hóa đối xứng để truyền dữ liệu.',
    body: `
<h2>HTTPS bảo vệ điều gì</h2>
<p><b>HTTPS</b> là HTTP chạy bên trong một kênh <b>TLS</b> (Transport Layer Security, kế thừa SSL). Kênh này mang lại ba đảm bảo: <b>bí mật</b> (người nghe lén chỉ thấy dữ liệu mã hóa), <b>toàn vẹn</b> (dữ liệu bị sửa trên đường sẽ bị phát hiện) và <b>xác thực</b> (bạn đang nói chuyện với đúng <code>bank.com</code>, không phải kẻ mạo danh).</p>
${cols([
  { title: 'Mã hóa đối xứng', body: '<p>Hai bên dùng chung một khóa để mã hóa và giải mã, ví dụ AES. Rất nhanh, phù hợp cho lượng dữ liệu lớn. Khó khăn: làm sao trao khóa cho bên kia mà không bị nghe lén.</p>' },
  { title: 'Mã hóa bất đối xứng', body: '<p>Mỗi bên có cặp khóa: public key ai cũng biết, private key giữ bí mật. Dữ liệu mã hóa bằng public key chỉ private key mới giải được. An toàn để trao đổi khóa nhưng chậm hơn nhiều.</p>' },
])}
<p>TLS kết hợp cả hai: dùng mã hóa bất đối xứng trong handshake để hai bên thống nhất một <b>session key</b>, rồi dùng session key đó mã hóa đối xứng cho toàn bộ dữ liệu phía sau.</p>

<h2>TLS handshake</h2>
<p>Hình dưới mô tả handshake TLS 1.2 với trao đổi khóa RSA, phiên bản dễ hiểu nhất về mặt khái niệm. Handshake diễn ra ngay sau khi kết nối TCP được mở.</p>
${seq({
  actors: [
    { id: 'c', label: 'Trình duyệt', kind: 'client' },
    { id: 's', label: 'Server' },
  ],
  msgs: [
    { note: 'Kết nối TCP đã mở (SYN, SYN-ACK, ACK)' },
    { from: 'c', to: 's', label: 'ClientHello: phiên bản TLS, cipher suite hỗ trợ, số ngẫu nhiên' },
    { from: 's', to: 'c', label: 'ServerHello: cipher suite được chọn, số ngẫu nhiên', dashed: true },
    { from: 's', to: 'c', label: 'Certificate (chứa public key của server)', dashed: true },
    { from: 'c', to: 'c', label: 'kiểm tra chứng chỉ theo chuỗi CA' },
    { from: 'c', to: 's', label: 'Pre-master secret, mã hóa bằng public key của server' },
    { note: 'Server giải mã bằng private key; hai bên cùng tính ra session key' },
    { from: 'c', to: 's', label: 'ChangeCipherSpec, Finished' },
    { from: 's', to: 'c', label: 'ChangeCipherSpec, Finished', dashed: true },
    { note: 'Từ đây mọi dữ liệu mã hóa đối xứng bằng session key' },
    { from: 'c', to: 's', label: 'GET /account (đã mã hóa)', kind: 'good' },
    { from: 's', to: 'c', label: '200 OK (đã mã hóa)', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: TLS handshake (TLS 1.2, trao đổi khóa RSA). Khóa bất đối xứng chỉ dùng để chuyển bí mật, dữ liệu dùng khóa đối xứng.',
})}
<p><b>TLS 1.3</b> rút gọn handshake còn 1 RTT và bỏ hẳn trao đổi khóa RSA. Thay vào đó hai bên dùng Diffie-Hellman với khóa tạm thời (ECDHE): mỗi bên gửi một nửa thông tin và cùng tính ra session key mà không bao giờ truyền khóa qua mạng. Nhờ vậy dù private key của server bị lộ sau này, kẻ tấn công cũng không giải mã được các phiên đã ghi lại trước đó (forward secrecy).</p>

<h2>Chứng chỉ và chuỗi tin cậy</h2>
<p>Làm sao trình duyệt biết public key nhận được thật sự thuộc về <code>bank.com</code>? Nhờ <b>chứng chỉ số</b> do một <b>Certificate Authority</b> (CA) ký. Trình duyệt và hệ điều hành có sẵn danh sách root CA đáng tin (trust store). Root CA ký cho intermediate CA, intermediate CA ký cho chứng chỉ của website.</p>
${diagram({
  w: 720, h: 250,
  nodes: [
    { id: 'root', label: 'Root CA', sub: 'có sẵn trong trust store', x: 120, y: 65, w: 170, kind: 'good' },
    { id: 'mid', label: 'Intermediate CA', x: 360, y: 65, w: 150 },
    { id: 'leaf', label: 'Chứng chỉ bank.com', sub: 'public key + chữ ký', x: 600, y: 65, w: 170 },
    { id: 'b', label: 'Trình duyệt', x: 360, y: 190, w: 140, kind: 'client' },
  ],
  edges: [
    { from: 'root', to: 'mid', label: 'ký' },
    { from: 'mid', to: 'leaf', label: 'ký' },
    { from: 'b', to: 'leaf', label: 'kiểm tra chữ ký', dashed: true },
    { from: 'b', to: 'root', label: 'tin sẵn', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Chuỗi chứng chỉ. Trình duyệt kiểm tra từng chữ ký ngược lên tới root CA mà nó vốn tin tưởng.',
})}
<p>Ngoài chữ ký, trình duyệt còn kiểm tra chứng chỉ còn hạn, tên miền khớp với trường SAN, và chứng chỉ chưa bị thu hồi. Chỉ một điều kiện sai là trình duyệt hiện cảnh báo đỏ.</p>

<h2>SSH: đăng nhập máy từ xa an toàn</h2>
<p><b>SSH</b> (Secure Shell) cho phép kết nối an toàn tới máy từ xa qua mạng không tin cậy, mặc định trên TCP cổng 22. SSH có hai phiên bản, SSH-1 và SSH-2; SSH-2 được IETF chuẩn hóa và là bản dùng hiện nay. Theo sách, SSH-2 gồm ba tầng xếp chồng:</p>
${tbl(['Tầng', 'Nhiệm vụ', 'Chi tiết'], [
  ['Transport', 'Mã hóa, toàn vẹn, bảo vệ dữ liệu', 'Trao đổi khóa Diffie-Hellman, xác thực server bằng host key (lưu trong <code>known_hosts</code>)'],
  ['Authentication', 'Xác minh danh tính client', 'Public key (<code>~/.ssh/id_ed25519</code>), mật khẩu, hoặc keyboard-interactive'],
  ['Connection', 'Ghép nhiều kênh logic trên một kết nối', 'Shell, chạy lệnh, SFTP, port forwarding cùng chạy song song'],
])}

<h2>VPN: đường hầm qua mạng công cộng</h2>
<p><b>VPN</b> (Virtual Private Network) tạo một kết nối mã hóa qua mạng kém an toàn như Wi-Fi quán cà phê hay Internet công cộng. Sách mô tả VPN hoạt động theo 4 bước: (1) thiết lập đường hầm bảo mật giữa thiết bị và VPN server; (2) mã hóa dữ liệu truyền đi; (3) che địa chỉ IP thật, website chỉ thấy IP của VPN server; (4) định tuyến toàn bộ lưu lượng qua VPN server.</p>
${diagram({
  w: 720, h: 290,
  groups: [
    { x: 20, y: 25, w: 690, h: 115, label: 'Không có VPN' },
    { x: 20, y: 160, w: 690, h: 115, label: 'Có VPN' },
  ],
  nodes: [
    { id: 'l1', label: 'Laptop', x: 90, y: 85, w: 100, kind: 'client' },
    { id: 'i1', label: 'Wi-Fi / ISP', sub: 'thấy domain, IP', x: 270, y: 85, w: 150, kind: 'warn' },
    { id: 'w1', label: 'Website', sub: 'thấy IP thật', x: 630, y: 85, w: 120, kind: 'external' },
    { id: 'l2', label: 'Laptop', x: 90, y: 220, w: 100, kind: 'client' },
    { id: 'i2', label: 'Wi-Fi / ISP', sub: 'chỉ thấy bản mã', x: 270, y: 220, w: 150 },
    { id: 'v', label: 'VPN server', x: 450, y: 220, w: 120, kind: 'lb' },
    { id: 'w2', label: 'Website', sub: 'thấy IP VPN', x: 630, y: 220, w: 120, kind: 'external' },
  ],
  edges: [
    { from: 'l1', to: 'i1' },
    { from: 'i1', to: 'w1' },
    { from: 'l2', to: 'i2', label: '1', kind: 'good' },
    { from: 'i2', to: 'v', label: '2', kind: 'good' },
    { from: 'v', to: 'w2', label: '3' },
  ],
  caption: 'Hình: Có VPN, dữ liệu đi trong đường hầm mã hóa tới VPN server (1, 2) rồi mới ra Internet (3); website chỉ thấy IP của VPN server.',
})}
${tbl(['Ưu điểm', 'Nhược điểm'], [
  ['Riêng tư và ẩn danh: che IP gốc, mạng trung gian không đọc được dữ liệu', 'Một số dịch vụ chặn IP của VPN'],
  ['Bảo mật khi dùng Wi-Fi công cộng', 'Kết nối chậm hơn do thêm chặng và chi phí mã hóa'],
  ['Truy cập mạng nội bộ công ty từ xa', 'Phải tin nhà cung cấp VPN, vì họ thấy toàn bộ lưu lượng'],
])}
${tip('<b>Thực tế.</b> Let\'s Encrypt cấp chứng chỉ TLS miễn phí, tự động gia hạn qua giao thức ACME, với thời hạn ngắn 90 ngày. Nhờ vậy HTTPS đã thành mặc định cho gần như mọi website. Ở chiều ngược lại, các doanh nghiệp đang chuyển từ VPN "vào được là tin" sang mô hình zero trust, xác thực từng request tới từng ứng dụng.')}
${note('<b>Sai lầm thường gặp.</b> Nghĩ rằng HTTPS che giấu hoàn toàn bạn đang truy cập trang nào. Mạng trung gian vẫn thấy địa chỉ IP đích, và thường thấy cả tên miền qua trường SNI trong ClientHello cùng truy vấn DNS chưa mã hóa. HTTPS chỉ giấu path, query, header và nội dung.')}
${interview([
  'Vì sao TLS dùng mã hóa bất đối xứng cho handshake nhưng dùng mã hóa đối xứng cho dữ liệu?',
  'Trình duyệt kiểm tra những gì để tin một chứng chỉ? Chuyện gì xảy ra nếu thiếu intermediate certificate?',
  'Forward secrecy là gì, và vì sao TLS 1.3 loại bỏ trao đổi khóa RSA?',
  'Mô tả ba tầng của SSH-2 và nhiệm vụ của từng tầng.',
])}`,
    keys: [
      'TLS dùng bất đối xứng để thống nhất session key, rồi mã hóa đối xứng cho dữ liệu vì nhanh hơn.',
      'Chứng chỉ được xác minh theo chuỗi: website ← intermediate CA ← root CA trong trust store.',
      'TLS 1.3: handshake 1 RTT, chỉ dùng ECDHE nên có forward secrecy.',
      'SSH-2 có 3 tầng: transport, authentication, connection. VPN tạo đường hầm mã hóa và che IP thật.',
    ],
    quiz: [
      { q: 'Trong TLS, vì sao dữ liệu chính được mã hóa bằng khóa đối xứng?', o: ['Vì an toàn hơn khóa bất đối xứng', 'Vì nhanh hơn nhiều', 'Vì không cần trao đổi khóa', 'Vì trình duyệt không hỗ trợ khóa bất đối xứng'], a: 1, why: 'Mã hóa đối xứng nhanh hơn nhiều. Khóa bất đối xứng chỉ dùng lúc đầu để trao đổi bí mật an toàn.' },
      { q: 'Trình duyệt tin một chứng chỉ website dựa vào đâu?', o: ['Chứng chỉ có dung lượng lớn', 'Chuỗi chữ ký dẫn về một root CA có sẵn trong trust store', 'Server gửi kèm mật khẩu', 'Tên miền có đuôi .com'], a: 1, why: 'Trình duyệt kiểm tra chữ ký từng tầng ngược lên tới root CA mà nó vốn tin tưởng.' },
      { q: 'Tầng nào của SSH ghép shell, SFTP và port forwarding trên cùng một kết nối?', o: ['Transport', 'Authentication', 'Connection', 'Session'], a: 2, why: 'Connection layer chia kết nối đã mã hóa và xác thực thành nhiều kênh logic.' },
      { q: 'Khi dùng VPN, website đích thấy địa chỉ IP nào?', o: ['IP thật của laptop', 'IP của VPN server', 'IP của router Wi-Fi', 'Không thấy IP nào'], a: 1, why: 'Lưu lượng đi ra Internet từ VPN server nên website chỉ thấy IP của VPN server.' },
    ],
  },
];
