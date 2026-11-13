import type { Lesson } from '../../types';
import { cols, diagram, interview, note, seq, tbl, tip } from '../helpers';

export const lessons: Lesson[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'api-style',
    mod: 'api',
    title: 'REST, GraphQL, gRPC và Webhook',
    pages: [32, 93, 147, 97, 366],
    min: 11,
    level: 'co-ban',
    lede: 'Mỗi giao thức API ra đời để giải một bài toán cụ thể. Một hệ thống thực tế thường dùng ba bốn giao thức cùng lúc, mỗi cái ở đúng chỗ của nó.',
    body: `
<h2>Bức tranh các giao thức API</h2>
<p>API là hợp đồng giữa hai phần mềm: bên gọi gửi gì, bên nhận trả gì, theo định dạng nào. Sách điểm qua sáu giao thức phổ biến nhất hiện nay là <b>SOAP</b>, <b>REST</b>, <b>GraphQL</b>, <b>gRPC</b>, <b>WebSocket</b> và <b>Webhook</b>. Chúng không thay thế nhau theo kiểu cái mới loại bỏ cái cũ. Mỗi giao thức tối ưu cho một kiểu giao tiếp khác nhau.</p>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'web', label: 'Web', x: 75, y: 70, w: 100, kind: 'client' },
    { id: 'app', label: 'Mobile app', x: 75, y: 220, w: 100, kind: 'client' },
    { id: 'gw', label: 'API Gateway', x: 280, y: 145, kind: 'lb' },
    { id: 'ord', label: 'Order service', x: 460, y: 70 },
    { id: 'pay', label: 'Payment service', x: 460, y: 220, w: 130 },
    { id: 'bank', label: 'Hệ thống cũ', sub: 'ngân hàng', x: 640, y: 70, w: 110, h: 56, kind: 'external' },
    { id: 'psp', label: 'Cổng thanh toán', x: 640, y: 220, w: 120, kind: 'external' },
  ],
  edges: [
    { from: 'web', to: 'gw', label: 'REST' },
    { from: 'web', to: 'gw', label: 'WebSocket', both: true, curve: -45, dashed: true },
    { from: 'app', to: 'gw', label: 'GraphQL' },
    { from: 'gw', to: 'ord', label: 'gRPC' },
    { from: 'gw', to: 'pay', label: 'gRPC' },
    { from: 'ord', to: 'bank', label: 'SOAP' },
    { from: 'psp', to: 'pay', label: 'webhook' },
  ],
  caption: 'Hình: Một hệ thống thương mại điện tử dùng cả sáu giao thức. Client nói REST/GraphQL/WebSocket, nội bộ nói gRPC, đối tác cũ nói SOAP, cổng thanh toán báo kết quả bằng webhook.',
})}
${tbl(['Giao thức', 'Định dạng', 'Kiểu giao tiếp', 'Phù hợp khi'], [
  ['SOAP', 'XML, có WSDL mô tả', 'Request/response, chuẩn chặt chẽ', 'Ngân hàng, bảo hiểm, hệ thống doanh nghiệp cũ cần chuẩn bảo mật WS-Security'],
  ['REST', 'Thường là JSON', 'Request/response theo resource', 'API công khai, CRUD, cần cache HTTP'],
  ['GraphQL', 'JSON', 'Một endpoint, client mô tả dữ liệu cần', 'Nhiều loại client, màn hình thay đổi liên tục'],
  ['gRPC', 'Protocol Buffers (nhị phân)', 'Gọi hàm từ xa, có streaming', 'Giao tiếp nội bộ giữa microservice'],
  ['WebSocket', 'Text hoặc nhị phân', 'Kết nối hai chiều, giữ lâu', 'Chat, game, bảng giá realtime'],
  ['Webhook', 'Thường là JSON qua HTTP POST', 'Bên kia chủ động gọi về khi có sự kiện', 'Thông báo thanh toán, CI/CD, tích hợp SaaS'],
])}

<h2>REST và GraphQL</h2>
<p><b>REST</b> chia hệ thống thành các resource, mỗi resource có URL riêng và được thao tác bằng các method HTTP chuẩn như <code>GET</code>, <code>POST</code>, <code>PUT</code>, <code>DELETE</code>. Ưu điểm lớn nhất là đơn giản và tận dụng được cache HTTP. Nhược điểm là để dựng một màn hình, client có thể phải gọi nhiều endpoint (under-fetching) hoặc nhận về nhiều field không dùng tới (over-fetching).</p>
<p><b>GraphQL</b> do Meta phát triển nội bộ năm 2012 và công bố năm 2015. Client gửi một query mô tả chính xác các field cần, kể cả dữ liệu lồng nhau, tới một endpoint duy nhất. GraphQL server đứng giữa client và các backend, gom nhiều lời gọi thành một. Ngoài query còn có <b>mutation</b> để sửa dữ liệu và <b>subscription</b> để nhận thông báo realtime.</p>
${cols([
  { title: 'REST', body: '<p>Hợp đồng đơn giản, ổn định. Cache dễ vì mỗi URL là một khóa cache. Dễ debug bằng trình duyệt hoặc <code>curl</code>. Có thể tốn nhiều vòng gọi để ghép dữ liệu liên quan.</p>' },
  { title: 'GraphQL', body: '<p>Client chọn field, một lần gọi lấy đủ dữ liệu. Schema có kiểu chặt giúp giảm lỗi. Đổi lại: server phức tạp hơn, cache khó hơn, và một query lồng sâu có thể làm sập backend nếu không giới hạn độ sâu và độ phức tạp.</p>' },
])}

<h2>gRPC hoạt động thế nào</h2>
<p><b>gRPC</b> là framework RPC (Remote Procedure Call) mã nguồn mở do Google phát triển. Với lập trình viên, gọi một service ở máy khác trông giống như gọi một hàm local. Bên dưới, gRPC dùng <b>Protocol Buffers</b> làm ngôn ngữ mô tả interface và định dạng dữ liệu, chạy trên <b>HTTP/2</b> nên nhiều lời gọi dùng chung một kết nối, và hỗ trợ streaming hai chiều.</p>
${diagram({
  w: 720, h: 250,
  nodes: [
    { id: 'c', label: 'Client', x: 80, y: 70, w: 100, kind: 'client' },
    { id: 'o', label: 'Order service', sub: 'gRPC client', x: 310, y: 70, h: 60 },
    { id: 's1', label: 'Client stub', sub: 'encode Protobuf', x: 570, y: 70, w: 140, h: 60 },
    { id: 's2', label: 'Server stub', sub: 'decode Protobuf', x: 570, y: 190, w: 140, h: 60 },
    { id: 'p', label: 'Payment service', sub: 'gRPC server', x: 310, y: 190, w: 140, h: 60 },
  ],
  edges: [
    { from: 'c', to: 'o', label: '1' },
    { from: 'o', to: 's1', label: '2' },
    { from: 's1', to: 's2', label: '3' },
    { from: 's2', to: 'p', label: '4' },
  ],
  caption: 'Hình: Luồng một lời gọi gRPC từ order service sang payment service. Kết quả quay về theo đúng chiều ngược lại.',
})}
<ol>
<li>Client gọi REST tới order service với body JSON.</li>
<li>Order service gọi hàm <code>Pay()</code> trên client stub được sinh tự động từ file <code>.proto</code>. Stub mã hóa tham số thành dạng nhị phân.</li>
<li>Gói tin đi qua mạng bằng HTTP/2. Nhờ nhị phân và nén header, payload nhỏ hơn và nhanh hơn JSON nhiều lần (sách nêu con số khoảng 5 lần).</li>
<li>Server stub giải mã và gọi hàm thật trong payment service. Kết quả được mã hóa, gửi ngược lại, và order service nhận về như một giá trị trả về bình thường.</li>
</ol>
<p>Điểm yếu của gRPC: trình duyệt không gọi trực tiếp được (cần gRPC-Web hoặc gateway chuyển đổi), payload nhị phân khó đọc khi debug, và mọi bên phải dùng chung file <code>.proto</code>. Vì vậy gRPC chủ yếu nằm ở giao tiếp nội bộ.</p>

<h2>Polling hay webhook</h2>
<p>Giả sử shop cần biết khi nào khách thanh toán xong ở một cổng thanh toán bên ngoài. Có hai cách. <b>Polling</b>: shop hỏi định kỳ "xong chưa?". <b>Webhook</b>: shop đăng ký một URL callback, cổng thanh toán tự gọi URL đó khi có sự kiện.</p>
${seq({
  actors: [
    { id: 'k', label: 'Khách hàng', kind: 'client' },
    { id: 's', label: 'Shop server' },
    { id: 'p', label: 'Cổng thanh toán', kind: 'external' },
  ],
  msgs: [
    { note: 'Polling: shop chủ động hỏi theo chu kỳ' },
    { from: 's', to: 'p', label: 'GET /payments/42' },
    { from: 'p', to: 's', label: 'status: pending', dashed: true },
    { from: 's', to: 'p', label: 'GET /payments/42 (5 giây sau)' },
    { from: 'p', to: 's', label: 'status: paid', dashed: true, kind: 'good' },
    { note: 'Webhook: cổng thanh toán báo ngay khi có sự kiện' },
    { from: 'k', to: 'p', label: 'Thanh toán' },
    { from: 'p', to: 's', label: 'POST /webhooks/payment (paid)', kind: 'good' },
    { from: 's', to: 'p', label: '200 OK', dashed: true },
    { from: 's', to: 'k', label: 'Đơn hàng đã xác nhận', dashed: true },
  ],
  caption: 'Hình: Polling tốn nhiều lời gọi rỗng và có độ trễ bằng chu kỳ hỏi. Webhook đẩy kết quả về ngay khi sự kiện xảy ra.',
})}
${tbl(['', 'Polling', 'Webhook'], [
  ['Ai chủ động', 'Bên nhận dữ liệu', 'Bên phát sinh sự kiện'],
  ['Độ trễ', 'Tối đa bằng chu kỳ hỏi', 'Gần như tức thì'],
  ['Tài nguyên', 'Lãng phí nhiều lời gọi không có dữ liệu mới', 'Chỉ gọi khi có sự kiện'],
  ['Kiểm soát', 'Tự quyết định lúc nào lấy dữ liệu', 'Phải mở endpoint công khai, xác thực chữ ký'],
  ['Rủi ro', 'Tốn tài nguyên', 'Mất thông báo khi mạng hoặc endpoint lỗi, cần retry'],
])}
<p>Polling hợp lý khi hạ tầng không cho phép nhận request từ ngoài vào, ví dụ ứng dụng nằm sau firewall. Webhook phù hợp khi cần dữ liệu ngay và lưu lượng lớn. Trong thực tế nhiều hệ thống dùng webhook làm kênh chính và một job polling chậm (ví dụ mỗi 15 phút) để đối soát những sự kiện bị lỡ.</p>
${tip('<b>Thực tế.</b> Stripe gửi sự kiện thanh toán qua webhook, ký mỗi request bằng header <code>Stripe-Signature</code> để bên nhận kiểm tra nguồn gốc. Nếu endpoint không trả về mã 2xx, Stripe tự gửi lại với thời gian chờ tăng dần trong tối đa ba ngày. Vì có gửi lại, cùng một sự kiện có thể tới nhiều lần, nên handler phải idempotent.')}
${note('<b>Sai lầm thường gặp.</b> Chọn GraphQL hoặc gRPC vì "mới và nhanh" cho một API công khai đơn giản. Kết quả là đối tác khó tích hợp, cache HTTP mất tác dụng, và đội ngũ phải gánh thêm độ phức tạp không cần thiết. Hãy bắt đầu từ ai là người gọi API và họ cần gì.')}
${interview([
  'Ứng dụng có web, iOS và Android, mỗi màn hình cần tập dữ liệu khác nhau từ năm service. Bạn chọn REST, GraphQL hay BFF (Backend for Frontend)? Vì sao?',
  'Vì sao gRPC phổ biến cho giao tiếp giữa microservice nhưng hiếm khi được dùng cho API công khai?',
  'Bạn tích hợp với một cổng thanh toán bằng webhook. Làm sao để không bỏ sót và không xử lý trùng sự kiện?',
  'Khi nào bạn chọn WebSocket thay vì polling hoặc Server-Sent Events?',
])}`,
    keys: [
      'REST cho API công khai và CRUD, GraphQL khi client cần chọn dữ liệu linh hoạt, gRPC cho giao tiếp nội bộ.',
      'gRPC dùng Protocol Buffers trên HTTP/2: payload nhỏ, nhanh, có streaming, nhưng khó gọi từ trình duyệt.',
      'GraphQL đổi sự linh hoạt phía client lấy độ phức tạp phía server và cache khó hơn.',
      'Webhook đẩy sự kiện về ngay; cần xác thực chữ ký, retry và xử lý trùng. Polling là kênh dự phòng tốt.',
    ],
    quiz: [
      { q: 'gRPC mặc định dùng định dạng dữ liệu và giao thức vận chuyển nào?', o: ['JSON trên HTTP/1.1', 'XML trên SOAP', 'Protocol Buffers trên HTTP/2', 'Text trên WebSocket'], a: 2, why: 'gRPC dùng Protocol Buffers làm IDL và định dạng nhị phân, truyền qua HTTP/2 để multiplex nhiều lời gọi trên một kết nối.' },
      { q: 'Ứng dụng mobile cần đúng 5 field từ 3 service khác nhau trong một lần gọi. Giao thức nào phù hợp nhất?', o: ['SOAP', 'GraphQL', 'Webhook', 'Polling'], a: 1, why: 'GraphQL cho client mô tả chính xác field cần và server gom dữ liệu từ nhiều nguồn trong một query.' },
      { q: 'Nhược điểm chính của webhook so với polling là gì?', o: ['Độ trễ cao hơn', 'Tốn nhiều request rỗng', 'Có thể mất thông báo khi mạng hoặc endpoint lỗi', 'Không dùng được HTTPS'], a: 2, why: 'Nếu endpoint lỗi đúng lúc sự kiện được gửi, thông báo có thể bị lỡ. Cần retry phía gửi và đối soát phía nhận.' },
      { q: 'Vì sao cache với GraphQL khó hơn REST?', o: ['GraphQL không dùng HTTP', 'Mọi query đi qua một endpoint, thường là POST, nên không dùng URL làm khóa cache được', 'GraphQL không trả JSON', 'GraphQL cấm cache'], a: 1, why: 'Cache HTTP dựa vào URL và method GET. GraphQL gom mọi thứ vào một endpoint nên phải cache ở tầng khác, ví dụ theo từng object.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'rest-design',
    mod: 'api',
    title: 'Thiết kế REST API chuẩn',
    pages: [22, 238, 333, 52, 182],
    min: 12,
    level: 'co-ban',
    lede: 'Thiết kế API không chỉ là đặt tên URL. Một API tốt dễ đoán, dễ mở rộng mà không phá client cũ, và an toàn trước các request giả mạo.',
    body: `
<h2>Sáu nguyên tắc của REST</h2>
<p><b>REST</b> (Representational State Transfer) là một phong cách kiến trúc do Roy Fielding mô tả năm 2000. Một API được gọi là RESTful khi tuân theo sáu ràng buộc sau:</p>
${tbl(['Nguyên tắc', 'Ý nghĩa thực tế'], [
  ['Client-server', 'Client lo giao diện, server lo dữ liệu. Hai bên phát triển độc lập.'],
  ['Stateless', 'Mỗi request mang đủ thông tin (token, tham số). Server không nhớ phiên, nên thêm server để scale rất dễ.'],
  ['Cacheable', 'Response tự khai báo có cache được không qua <code>Cache-Control</code>, <code>ETag</code>.'],
  ['Uniform interface', 'Resource có URL thống nhất, thao tác bằng method HTTP chuẩn.'],
  ['Layered system', 'Client không cần biết phía sau có load balancer, cache hay gateway.'],
  ['Code on demand (tùy chọn)', 'Server có thể gửi code (ví dụ JavaScript) cho client chạy.'],
])}

<h2>Đặt tên resource</h2>
<p>Lời khuyên đầu tiên trong "8 mẹo thiết kế API" của sách là thiết kế đường dẫn theo <b>domain model</b>. Resource là danh từ, method HTTP là động từ. Quan hệ cha con trong domain trở thành đường dẫn lồng nhau, nhưng không nên lồng quá hai cấp.</p>
${diagram({
  w: 720, h: 260,
  nodes: [
    { id: 'u', label: '/users', x: 90, y: 70 },
    { id: 'ui', label: '/users/{id}', x: 290, y: 70, w: 130 },
    { id: 'c', label: '/users/{id}/carts', x: 570, y: 70, w: 170 },
    { id: 'ci', label: '/carts/{id}', x: 290, y: 190, w: 130 },
    { id: 'it', label: '/carts/{id}/items', x: 570, y: 190, w: 170 },
  ],
  edges: [
    { from: 'u', to: 'ui', label: 'một user' },
    { from: 'ui', to: 'c', label: 'giỏ của user' },
    { from: 'c', to: 'ci', label: 'truy cập trực tiếp', dashed: true },
    { from: 'ci', to: 'it', label: 'món trong giỏ' },
  ],
  caption: 'Hình: Cây resource cho ví dụ giỏ hàng. Khi đã có ID của giỏ, truy cập thẳng /carts/{id} thay vì lồng thêm cấp /users/{id}/carts/{id}/items.',
})}
${tbl(['Nên', 'Không nên', 'Lý do'], [
  ['<code>GET /orders</code>', '<code>GET /getAllOrders</code>', 'Method đã là động từ'],
  ['<code>POST /orders</code>', '<code>POST /order/create</code>', 'Danh từ số nhiều, thống nhất'],
  ['<code>/order-items</code>', '<code>/Order_Items</code>', 'Chữ thường, gạch nối'],
  ['<code>POST /orders/batch</code>', '<code>POST /batchCreateOrders</code>', 'Sách khuyên đặt từ khóa batch ở cuối path'],
  ['<code>POST /orders/42/cancel</code>', '<code>PUT /orders/42</code> với cờ ẩn', 'Hành động nghiệp vụ rõ ràng, dễ tìm trong tài liệu'],
])}

<h2>Method, status code và định dạng lỗi</h2>
<p>Sách khuyên chỉ dùng một tập nhỏ method và status code để client dễ xử lý. <code>PATCH</code> thường gây tranh cãi trong team vì có nhiều cách hiểu cập nhật một phần, nên nhiều API chỉ dùng <code>GET</code>, <code>POST</code>, <code>PUT</code>, <code>DELETE</code>. Về status code, một bộ khoảng mười mã là đủ cho hầu hết API.</p>
${tbl(['Mã', 'Khi nào dùng'], [
  ['200 / 201 / 204', 'Thành công / đã tạo resource mới / thành công không có body'],
  ['400 / 422', 'Request sai cú pháp / đúng cú pháp nhưng dữ liệu không hợp lệ'],
  ['401 / 403', 'Chưa xác thực / đã xác thực nhưng không có quyền'],
  ['404 / 409', 'Không tìm thấy / xung đột trạng thái (ví dụ trùng email)'],
  ['429', 'Vượt giới hạn request (rate limit)'],
  ['500 / 503', 'Lỗi server / service tạm thời không sẵn sàng'],
])}
<p>Body lỗi nên có cấu trúc cố định trên toàn bộ API, ví dụ <code>{"error": {"code": "CART_ITEM_OUT_OF_STOCK", "message": "...", "request_id": "..."}}</code>. Mã lỗi dạng chuỗi cho client xử lý bằng code, <code>message</code> cho con người đọc, <code>request_id</code> để tra log. Chuẩn RFC 9457 (Problem Details) là một lựa chọn sẵn có.</p>

<h2>Versioning, lọc, sắp xếp và phân trang</h2>
<p>Thiết kế version ngay từ đầu giúp nâng cấp sau này đơn giản hơn. Ba cách phổ biến: đặt trong URL (<code>/v1/orders</code>), trong header (<code>Accept: application/vnd.shop.v2+json</code>), hoặc theo ngày phát hành. Cách URL dễ thấy và dễ debug nhất nên được dùng nhiều nhất.</p>
<p>Mẹo cuối cùng trong sách là thiết kế một bộ <b>quy tắc truy vấn</b> thống nhất. Ví dụ <code>GET /v1/orders?status=paid&amp;sort=-created_at&amp;limit=20&amp;cursor=abc</code>: lọc theo trạng thái, sắp xếp giảm dần theo thời gian tạo, mỗi trang 20 bản ghi. Khi mọi endpoint dùng cùng quy ước, client chỉ phải học một lần.</p>

<h2>API an toàn: khóa, chữ ký, chống replay</h2>
<p>Với API cho đối tác, sách mô tả một cách làm phổ biến. Mỗi client có một <b>app ID</b> và một hoặc nhiều cặp <b>access key</b> (công khai) và <b>secret key</b> (bí mật). Có thể cấp cặp khóa chỉ đọc và cặp khóa đọc ghi riêng. Secret key không bao giờ đi trên đường truyền. Client dùng nó để ký request bằng HMAC-SHA256.</p>
${seq({
  actors: [
    { id: 'c', label: 'Client đối tác', kind: 'client' },
    { id: 'g', label: 'API Gateway', kind: 'lb' },
    { id: 'k', label: 'Kho khóa', kind: 'store' },
    { id: 's', label: 'Order service' },
  ],
  msgs: [
    { note: 'Client gom tham số + timestamp + nonce, ký bằng secret key' },
    { from: 'c', to: 'g', label: 'POST /v1/orders + chữ ký' },
    { from: 'g', to: 'k', label: 'Tra secret theo access key' },
    { from: 'k', to: 'g', label: 'secret key', dashed: true },
    { from: 'g', to: 'g', label: 'Tính lại HMAC, so sánh' },
    { from: 'g', to: 'g', label: 'Kiểm tra timestamp, nonce' },
    { from: 'g', to: 's', label: 'Hợp lệ: chuyển tiếp', kind: 'good' },
    { from: 's', to: 'c', label: '201 Created', dashed: true },
  ],
  caption: 'Hình: Kiểm tra chữ ký tại gateway. Chữ ký chứng minh request đến từ người giữ secret key và không bị sửa; timestamp và nonce chặn việc gửi lại request cũ.',
})}
<p>Request nên mang ba thứ ngoài dữ liệu nghiệp vụ: thông tin xác thực, <b>timestamp</b> để từ chối request quá cũ, và <b>nonce</b> (chuỗi ngẫu nhiên dùng một lần) để từ chối request bị bắt lại và phát lại (replay attack). Sách cũng nhấn mạnh hai việc thuộc về thiết kế API: chọn header phù hợp và đặt quy tắc rate limit ngay tại gateway.</p>
${tip('<b>Thực tế.</b> AWS ký mọi request bằng Signature Version 4 dựa trên HMAC-SHA256, đúng mô hình access key và secret key ở trên. Về versioning, GitHub REST API dùng header <code>X-GitHub-Api-Version</code> theo ngày, còn Stripe gắn version theo ngày cho từng tài khoản và cho phép ghi đè bằng header <code>Stripe-Version</code>.')}
${note('<b>Sai lầm thường gặp.</b> Trả về <code>200 OK</code> kèm body <code>{"success": false}</code> cho mọi lỗi. Load balancer, retry policy và công cụ giám sát đều dựa vào status code; giấu lỗi trong body khiến chúng hiểu nhầm là thành công.')}
${interview([
  'Thiết kế API cho giỏ hàng: thêm món, đổi số lượng, xóa món, thanh toán. Bạn đặt URL và method thế nào?',
  'API v1 đã có hàng nghìn client. Bạn cần đổi kiểu dữ liệu của một field. Bạn triển khai thay đổi này ra sao?',
  'Timestamp và nonce chống replay attack như thế nào? Vì sao cần cả hai?',
])}`,
    keys: [
      'Resource là danh từ số nhiều, method HTTP là động từ; thiết kế path theo domain model, lồng tối đa hai cấp.',
      'Dùng một tập nhỏ status code và một định dạng lỗi thống nhất cho toàn bộ API.',
      'Thiết kế versioning và quy tắc lọc, sắp xếp, phân trang ngay từ đầu.',
      'API cho đối tác: access key và secret key, ký HMAC, kèm timestamp và nonce để chống replay.',
    ],
    quiz: [
      { q: 'URL nào đúng phong cách REST nhất để lấy danh sách đơn hàng của user 7?', o: ['GET /getOrders?user=7', 'GET /users/7/orders', 'POST /users/7/getOrders', 'GET /user/7/order/list'], a: 1, why: 'Danh từ số nhiều, lồng theo quan hệ domain, method GET thể hiện hành động đọc.' },
      { q: 'Client gửi email đã tồn tại khi đăng ký. Status code nào phù hợp?', o: ['200', '404', '409', '500'], a: 2, why: '409 Conflict báo request xung đột với trạng thái hiện tại của resource.' },
      { q: 'Nonce trong request ký HMAC dùng để làm gì?', o: ['Mã hóa body', 'Đảm bảo mỗi request là duy nhất, chặn phát lại', 'Nén payload', 'Chọn version API'], a: 1, why: 'Server ghi nhớ nonce đã dùng trong cửa sổ thời gian. Request bị bắt lại và gửi lần hai sẽ bị từ chối.' },
      { q: 'Theo sách, thao tác hàng loạt nên đặt từ khóa batch ở đâu?', o: ['Trong header', 'Ở cuối path, ví dụ /orders/batch', 'Ở đầu path, ví dụ /batch/orders', 'Trong query string'], a: 1, why: 'Đặt batch ở cuối path giữ resource làm gốc, dễ tìm trong tài liệu.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'api-hieu-nang',
    mod: 'api',
    title: 'Hiệu năng API và phân trang',
    pages: [224, 282],
    min: 12,
    level: 'trung-binh',
    lede: 'Phần lớn API chậm vì trả quá nhiều dữ liệu, chờ đĩa, chờ mạng và mở kết nối lặp đi lặp lại. Thuật toán hiếm khi là thủ phạm. Năm kỹ thuật trong bài xử lý đúng những điểm đó.',
    body: `
<h2>Năm cách cải thiện hiệu năng API</h2>
<p>Thời gian một request gồm nhiều phần: truyền dữ liệu qua mạng, ghi log, truy vấn database, mở kết nối. Sách liệt kê năm kỹ thuật, mỗi kỹ thuật cắt bớt một phần trong chuỗi đó.</p>
${diagram({
  w: 720, h: 300,
  nodes: [
    { id: 'c', label: 'Client', x: 75, y: 150, w: 100, kind: 'client' },
    { id: 'a', label: 'API server', x: 260, y: 150 },
    { id: 'buf', label: 'Log buffer', sub: 'lock-free', x: 450, y: 55, kind: 'queue' },
    { id: 'disk', label: 'Đĩa', x: 640, y: 55, w: 100, kind: 'store' },
    { id: 'r', label: 'Redis', sub: 'cache', x: 450, y: 150, kind: 'cache' },
    { id: 'pool', label: 'Connection pool', x: 450, y: 245, w: 140, kind: 'lb' },
    { id: 'db', label: 'Database', x: 640, y: 245, w: 100, kind: 'store' },
  ],
  edges: [
    { from: 'c', to: 'a', label: 'gzip', both: true },
    { from: 'a', to: 'buf', label: '1' },
    { from: 'buf', to: 'disk', label: 'flush', dashed: true },
    { from: 'a', to: 'r', label: '2' },
    { from: 'a', to: 'pool', label: '3' },
    { from: 'pool', to: 'db' },
  ],
  caption: 'Hình: (1) ghi log vào buffer rồi trả về ngay; (2) đọc cache trước database; (3) mượn kết nối có sẵn từ pool. Response được nén và phân trang trước khi gửi.',
})}
${tbl(['Kỹ thuật', 'Cắt bớt chi phí gì', 'Lưu ý'], [
  ['Phân trang kết quả', 'Không gửi cả triệu bản ghi trong một response', 'Chọn kiểu phân trang phù hợp (phần dưới)'],
  ['Ghi log bất đồng bộ', 'Không chờ ghi đĩa ở mỗi request; log vào buffer không khóa, flush định kỳ', 'Có thể mất vài log cuối nếu process chết đột ngột'],
  ['Cache dữ liệu', 'Đọc từ RAM (Redis) thay vì truy vấn database', 'Phải xử lý dữ liệu cũ và cache miss'],
  ['Nén payload', 'Giảm số byte truyền qua mạng bằng gzip hoặc brotli', 'Tốn CPU; payload rất nhỏ thì nén không đáng'],
  ['Connection pool', 'Không mở và đóng kết nối database ở mỗi request', 'Pool quá nhỏ gây xếp hàng, quá lớn làm database quá tải'],
])}
<p>Một con số để hình dung: mở một kết nối PostgreSQL mới có TLS có thể mất vài chục ms, trong khi một câu query theo index chỉ mất dưới 1 ms. Nếu không có pool, phần lớn thời gian request là chi phí bắt tay kết nối.</p>

<h2>Sáu kiểu phân trang</h2>
<p>Phân trang là kỹ thuật đứng đầu danh sách vì một endpoint trả về mọi bản ghi sẽ chậm dần theo thời gian khi dữ liệu lớn lên. Sách liệt kê sáu kiểu:</p>
${tbl(['Kiểu', 'Ví dụ', 'Ưu điểm', 'Nhược điểm'], [
  ['Offset', '<code>?offset=40&amp;limit=20</code>', 'Dễ làm, nhảy tới trang bất kỳ', 'Chậm khi offset lớn; lặp hoặc sót khi dữ liệu thay đổi'],
  ['Page', '<code>?page=3&amp;size=20</code>', 'Dễ hiểu với người dùng', 'Bản chất vẫn là offset, cùng nhược điểm'],
  ['Cursor', '<code>?cursor=eyJpZCI6MTAyfQ</code>', 'Ổn định khi dữ liệu thay đổi, nhanh', 'Không nhảy trang được; cursor là chuỗi mã hóa khó debug'],
  ['Keyset', '<code>?after_id=102&amp;limit=20</code>', 'Dùng index nên rất nhanh', 'Cần cột duy nhất có index, sắp xếp cố định'],
  ['Time', '<code>?start_time=...&amp;end_time=...</code>', 'Tự nhiên với log, sự kiện', 'Cần timestamp tin cậy; nhiều bản ghi trùng thời điểm'],
  ['Hybrid', '<code>?cursor=abc&amp;start_time=...</code>', 'Kết hợp ưu điểm, ví dụ cuộn feed theo thời gian', 'Phức tạp nhất'],
])}

<h2>Vì sao offset chậm khi trang lớn</h2>
<p>Câu <code>SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 100000</code> buộc database đọc 100.020 dòng rồi bỏ đi 100.000 dòng đầu. Trang càng sâu càng chậm. Keyset viết lại thành <code>WHERE id &gt; 100000 ORDER BY id LIMIT 20</code>: database nhảy thẳng tới vị trí đó trên B-tree index và chỉ đọc 20 dòng.</p>
${diagram({
  w: 720, h: 230,
  nodes: [
    { id: 'q1', label: 'OFFSET 100000\nLIMIT 20', x: 90, y: 60, w: 140, h: 56, kind: 'client' },
    { id: 'd1', label: 'Quét tuần tự', sub: '100.020 dòng', x: 330, y: 60, w: 140, kind: 'warn' },
    { id: 'r1', label: 'Bỏ 100.000,\ntrả 20', x: 580, y: 60, w: 140, h: 56, kind: 'warn' },
    { id: 'q2', label: 'WHERE id > 100000\nLIMIT 20', x: 90, y: 170, w: 150, h: 56, kind: 'client' },
    { id: 'd2', label: 'B-tree index', sub: 'seek trực tiếp', x: 330, y: 170, w: 140, kind: 'good' },
    { id: 'r2', label: 'Đọc đúng 20 dòng', x: 580, y: 170, w: 140, kind: 'good' },
  ],
  edges: [
    { from: 'q1', to: 'd1', kind: 'warn' },
    { from: 'd1', to: 'r1', kind: 'warn' },
    { from: 'q2', to: 'd2', kind: 'good' },
    { from: 'd2', to: 'r2', kind: 'good' },
  ],
  caption: 'Hình: Offset tốn công tỉ lệ với độ sâu của trang. Keyset dùng index để bắt đầu ngay tại vị trí cần đọc.',
})}
<p>Offset còn một vấn đề về đúng đắn. Giả sử người dùng đang xem trang 1 của feed thì có 3 bài mới được đăng. Khi họ sang trang 2 với <code>offset=20</code>, mọi bản ghi đã dịch xuống 3 vị trí, nên 3 bài cuối trang 1 hiện lại ở đầu trang 2. Ngược lại, nếu có bản ghi bị xóa, một số bài sẽ bị bỏ sót.</p>

<h2>Cursor hoạt động thế nào</h2>
<p>Cursor là vị trí của bản ghi cuối cùng đã trả về, được server mã hóa thành một chuỗi mờ (opaque) để client không phụ thuộc vào cấu trúc bên trong. Khi sắp xếp theo cột không duy nhất như <code>created_at</code>, cursor phải kèm thêm <code>id</code> để phân xử các bản ghi trùng thời điểm.</p>
${seq({
  actors: [
    { id: 'c', label: 'Client', kind: 'client' },
    { id: 'a', label: 'API' },
    { id: 'd', label: 'Database', kind: 'store' },
  ],
  msgs: [
    { from: 'c', to: 'a', label: 'GET /orders?limit=20' },
    { from: 'a', to: 'd', label: 'ORDER BY created_at DESC, id DESC LIMIT 21' },
    { from: 'd', to: 'a', label: '21 dòng', dashed: true },
    { note: 'Dòng thứ 21 chỉ để biết còn trang sau; cursor = base64(created_at, id) của dòng 20' },
    { from: 'a', to: 'c', label: '20 đơn + next_cursor', dashed: true },
    { from: 'c', to: 'a', label: 'GET /orders?cursor=eyJ0Ijo...' },
    { from: 'a', to: 'd', label: 'WHERE (created_at, id) < (t, 102) LIMIT 21' },
    { from: 'd', to: 'a', label: '21 dòng tiếp theo', dashed: true },
    { from: 'a', to: 'c', label: '20 đơn + next_cursor', dashed: true },
  ],
  caption: 'Hình: Phân trang bằng cursor. Lấy dư một dòng để biết còn dữ liệu hay không mà không cần đếm tổng.',
})}
${tip('<b>Thực tế.</b> Slack chuyển Web API sang phân trang bằng cursor: mỗi response có <code>response_metadata.next_cursor</code>, client gửi lại giá trị này để lấy trang tiếp. Cách này giữ hiệu năng ổn định với các workspace có hàng trăm nghìn kênh và người dùng, nơi offset trang sâu trở nên quá chậm.')}
${note('<b>Sai lầm thường gặp.</b> Cho client tự đặt <code>limit</code> không giới hạn, và trả kèm <code>total_count</code> ở mọi trang. Một request <code>limit=1000000</code> có thể làm sập service, còn <code>COUNT(*)</code> trên bảng lớn tốn ngang câu query chính. Hãy đặt giới hạn tối đa (ví dụ 100) và chỉ trả tổng khi thật cần.')}
${interview([
  'Endpoint danh sách đơn hàng ngày càng chậm khi người dùng xem các trang sau. Bạn chẩn đoán và sửa thế nào?',
  'Thiết kế phân trang cho news feed có bài mới liên tục. Vì sao không dùng offset?',
  'Kích thước connection pool nên chọn thế nào khi có 20 instance API và database chỉ chịu 500 kết nối?',
])}`,
    keys: [
      'Năm cách tăng tốc API: phân trang, log bất đồng bộ, cache, nén payload, connection pool.',
      'Offset và page đơn giản nhưng chậm ở trang sâu và lặp hoặc sót bản ghi khi dữ liệu thay đổi.',
      'Cursor và keyset dùng index, ổn định khi có dữ liệu mới; đổi lại không nhảy trang tùy ý được.',
      'Luôn giới hạn limit tối đa và kèm id để phân xử khi sắp xếp theo cột không duy nhất.',
    ],
    quiz: [
      { q: 'Vì sao OFFSET 1000000 LIMIT 20 chậm?', o: ['Vì LIMIT 20 quá nhỏ', 'Database phải đọc và bỏ qua một triệu dòng trước đó', 'Vì không có cache', 'Vì mạng chậm'], a: 1, why: 'Offset không nhảy được trên index; database đọc tuần tự rồi vứt bỏ các dòng phía trước.' },
      { q: 'Feed có bài mới liên tục. Kiểu phân trang nào tránh lặp bài tốt nhất?', o: ['Offset', 'Page', 'Cursor', 'Không phân trang'], a: 2, why: 'Cursor bám vào bản ghi cụ thể nên bài mới chèn lên đầu không làm lệch trang sau.' },
      { q: 'Ghi log bất đồng bộ đánh đổi điều gì?', o: ['Tăng latency', 'Có thể mất vài dòng log cuối nếu process chết', 'Tốn thêm kết nối database', 'Không đánh đổi gì'], a: 1, why: 'Log nằm trong buffer RAM trước khi được flush. Process chết đột ngột thì phần chưa flush bị mất.' },
      { q: 'Connection pool chủ yếu giảm chi phí nào?', o: ['Kích thước response', 'Mở và đóng kết nối database ở mỗi request', 'Số dòng database phải quét', 'Thời gian nén dữ liệu'], a: 1, why: 'Bắt tay TCP, TLS và xác thực database tốn thời gian; pool giữ sẵn kết nối để dùng lại.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'idempotency',
    mod: 'api',
    title: 'Idempotency: gọi lại an toàn',
    pages: [277],
    min: 11,
    level: 'trung-binh',
    lede: 'Trong hệ thống phân tán, request bị gửi lại là chuyện bình thường. Idempotency đảm bảo gửi lại bao nhiêu lần thì kết quả cũng chỉ như gửi một lần.',
    body: `
<h2>Vì sao phải gọi lại</h2>
<p>Một thao tác <b>idempotent</b> là thao tác thực hiện nhiều lần cho cùng kết quả như thực hiện một lần. Vấn đề này quan trọng vì khi client gặp timeout, nó không biết server đã xử lý hay chưa. Request có thể mất trên đường đi, hoặc đã xử lý xong nhưng response bị mất trên đường về. Cách an toàn duy nhất là gửi lại, và server phải chịu được việc nhận trùng.</p>
${seq({
  actors: [
    { id: 'c', label: 'App mobile', kind: 'client' },
    { id: 'a', label: 'Payment API' },
    { id: 'b', label: 'Ngân hàng', kind: 'external' },
  ],
  msgs: [
    { from: 'c', to: 'a', label: 'POST /charges 500.000đ' },
    { from: 'a', to: 'b', label: 'Trừ tiền' },
    { from: 'b', to: 'a', label: 'OK', dashed: true },
    { from: 'a', to: 'c', label: '201 Created (mất trên mạng)', dashed: true, kind: 'warn' },
    { note: 'App chờ 10 giây, timeout, không biết đã trừ tiền hay chưa' },
    { from: 'c', to: 'a', label: 'POST /charges 500.000đ (gửi lại)' },
    { from: 'a', to: 'b', label: 'Trừ tiền lần hai', kind: 'warn' },
  ],
  caption: 'Hình: Không có idempotency, một lần gửi lại hợp lệ biến thành một lần trừ tiền trùng.',
})}

<h2>Sáu trường hợp cần idempotency</h2>
${tbl(['Trường hợp', 'Rủi ro nếu xử lý trùng', 'Cách làm điển hình'], [
  ['RESTful API', 'Retry tạo thêm resource', 'Dùng PUT, DELETE cho thao tác có thể lặp; POST kèm idempotency key'],
  ['Thanh toán', 'Khách bị trừ tiền nhiều lần', 'Idempotency key cho mỗi lần thanh toán'],
  ['Quản lý đơn hàng', 'Tạo hai đơn, trừ kho hai lần', 'Mã đơn do client sinh, ràng buộc unique'],
  ['Thao tác database', 'Áp dụng lại transaction làm sai số liệu', 'Ghi giá trị tuyệt đối, upsert, điều kiện theo version'],
  ['Quản lý tài khoản', 'Đăng ký ra hai tài khoản, reset mật khẩu nhiều lần', 'Unique email; token reset chỉ dùng một lần'],
  ['Messaging phân tán', 'Consumer xử lý lại message sau khi queue gửi lại', 'Lưu message ID đã xử lý, handler không có tác dụng phụ'],
])}
<p>Trường hợp cuối rất phổ biến. Phần lớn message queue như Kafka, SQS, RabbitMQ đảm bảo giao <b>ít nhất một lần</b> (at-least-once). Muốn đạt hiệu quả "đúng một lần" thì consumer phải idempotent.</p>

<h2>HTTP method nào idempotent</h2>
${tbl(['Method', 'Safe (không đổi dữ liệu)', 'Idempotent', 'Giải thích'], [
  ['GET, HEAD, OPTIONS', 'Có', 'Có', 'Chỉ đọc'],
  ['PUT', 'Không', 'Có', 'Ghi đè toàn bộ resource bằng cùng giá trị, lặp lại vẫn ra cùng trạng thái'],
  ['DELETE', 'Không', 'Có', 'Xóa lần hai thì resource vẫn đã bị xóa (response có thể là 404, trạng thái không đổi)'],
  ['POST', 'Không', 'Không', 'Mỗi lần gọi có thể tạo resource mới'],
  ['PATCH', 'Không', 'Không bảo đảm', '<code>{"qty": 3}</code> thì idempotent, <code>{"op": "increment"}</code> thì không'],
])}
<p>Sách nhấn mạnh: <code>GET</code> idempotent sẵn, còn <code>POST</code> phải được thiết kế để idempotent. Ở tầng dữ liệu cũng vậy: <code>UPDATE account SET balance = 100</code> idempotent, còn <code>SET balance = balance - 10</code> thì không.</p>

<h2>Idempotency key</h2>
<p>Kỹ thuật phổ biến nhất cho <code>POST</code> là <b>idempotency key</b>. Client sinh một UUID cho mỗi thao tác nghiệp vụ (không phải cho mỗi lần gửi) và gửi kèm trong header <code>Idempotency-Key</code>. Mọi lần gửi lại của cùng thao tác dùng lại đúng key đó.</p>
${seq({
  actors: [
    { id: 'c', label: 'Client', kind: 'client' },
    { id: 'a', label: 'Payment API' },
    { id: 'k', label: 'Dedupe store', kind: 'store' },
    { id: 'b', label: 'Ngân hàng', kind: 'external' },
  ],
  msgs: [
    { from: 'c', to: 'a', label: 'POST /charges, key=K1' },
    { from: 'a', to: 'k', label: 'INSERT K1 status=processing' },
    { from: 'a', to: 'b', label: 'Trừ tiền' },
    { from: 'a', to: 'k', label: 'K1: done, lưu response' },
    { from: 'a', to: 'c', label: '201 (mất trên mạng)', dashed: true, kind: 'warn' },
    { from: 'c', to: 'a', label: 'Gửi lại, key=K1' },
    { from: 'a', to: 'k', label: 'INSERT K1 → trùng key' },
    { from: 'k', to: 'a', label: 'K1 đã done + response cũ', dashed: true },
    { from: 'a', to: 'c', label: '201 như lần đầu', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Lần gửi lại tìm thấy K1 đã hoàn tất nên API trả lại response cũ, không gọi ngân hàng lần nữa.',
})}
<p>Nếu lần gửi lại tới khi K1 vẫn đang <code>processing</code> (request đầu chưa xong), API trả <code>409 Conflict</code> để client chờ rồi thử lại sau. Bước <code>INSERT</code> phải dựa vào ràng buộc unique hoặc <code>SET NX</code> của Redis. Nếu viết theo kiểu "đọc xem có chưa, chưa có thì ghi", hai request đồng thời đều thấy "chưa có" và cùng xử lý.</p>

<h2>Thiết kế dedupe store</h2>
${tbl(['Cột', 'Mục đích'], [
  ['<code>key</code> + <code>client_id</code>', 'Khóa chính. Phạm vi theo client để hai khách hàng vô tình trùng UUID không ảnh hưởng nhau'],
  ['<code>request_hash</code>', 'Hash của body. Cùng key mà body khác thì trả lỗi 422, vì đó là lỗi của client'],
  ['<code>status</code>', '<code>processing</code> hoặc <code>done</code>'],
  ['<code>response_code</code>, <code>response_body</code>', 'Trả lại nguyên văn cho các lần gửi lại'],
  ['<code>expires_at</code>', 'Xóa sau 24 giờ đến vài ngày, đủ dài để bao hết cửa sổ retry'],
])}
${cols([
  { title: 'Lưu cùng database nghiệp vụ', body: '<p>Ghi key và ghi đơn hàng trong cùng một transaction. Nếu transaction rollback thì key cũng biến mất. Đúng đắn nhất, phù hợp cho thanh toán.</p>' },
  { title: 'Lưu trong Redis', body: '<p><code>SET key value NX EX 86400</code>. Nhanh và tự hết hạn, nhưng không nằm cùng transaction với database. Cần xử lý trường hợp ghi Redis thành công mà ghi database thất bại.</p>' },
])}
${tip('<b>Thực tế.</b> Stripe hỗ trợ header <code>Idempotency-Key</code> cho mọi request <code>POST</code>. Stripe lưu kết quả của lần gọi đầu tiên, kể cả khi đó là lỗi, và trả lại đúng kết quả đó cho các lần gửi lại. Key có thể bị xóa sau ít nhất 24 giờ. Nếu dùng lại key với tham số khác, Stripe báo lỗi thay vì xử lý.')}
${note('<b>Sai lầm thường gặp.</b> Để server tự sinh idempotency key. Key phải do client sinh trước lần gửi đầu tiên; nếu server sinh thì mỗi lần gửi lại sẽ nhận một key mới và việc chống trùng mất tác dụng.')}
${interview([
  'Thiết kế API chuyển tiền giữa hai ví sao cho client có thể retry thoải mái mà không chuyển trùng.',
  'Consumer Kafka xử lý message rồi mới commit offset. Nếu consumer chết giữa hai bước thì sao? Làm thế nào để an toàn?',
  'Vì sao DELETE được coi là idempotent dù lần gọi thứ hai trả về 404?',
])}`,
    keys: [
      'Timeout không cho biết request đã được xử lý hay chưa, nên retry là bắt buộc và server phải chịu được trùng lặp.',
      'GET, PUT, DELETE idempotent theo chuẩn; POST và PATCH thì phải tự thiết kế.',
      'Idempotency key do client sinh cho mỗi thao tác; server lưu kết quả và trả lại cho các lần gửi lại.',
      'Chống trùng phải dựa vào ràng buộc unique hoặc SET NX, không dùng kiểu đọc rồi mới ghi.',
    ],
    quiz: [
      { q: 'Method nào KHÔNG idempotent theo chuẩn HTTP?', o: ['GET', 'PUT', 'DELETE', 'POST'], a: 3, why: 'Gọi POST hai lần có thể tạo hai resource. PUT ghi đè cùng giá trị nên lặp lại không đổi kết quả.' },
      { q: 'Ai nên sinh idempotency key?', o: ['Server, khi nhận request', 'Client, trước lần gửi đầu tiên, dùng lại khi retry', 'Load balancer', 'Database'], a: 1, why: 'Key phải giống nhau giữa các lần gửi lại của cùng một thao tác, nên chỉ client mới sinh được.' },
      { q: 'Câu SQL nào idempotent?', o: ['UPDATE t SET n = n + 1', 'INSERT INTO log VALUES (...)', 'UPDATE t SET status = \'paid\' WHERE id = 7', 'DELETE FROM t LIMIT 1'], a: 2, why: 'Gán giá trị tuyệt đối cho cùng bản ghi thì chạy lại bao nhiêu lần trạng thái cũng như nhau.' },
      { q: 'Lần gửi lại tới khi request đầu với cùng key vẫn đang xử lý. Server nên làm gì?', o: ['Xử lý song song', 'Trả 409 để client thử lại sau', 'Xóa key cũ', 'Trả 200 rỗng'], a: 1, why: 'Xử lý song song có thể gây trùng. Báo xung đột để client chờ request đầu xong rồi nhận kết quả đã lưu.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'gateway',
    mod: 'api',
    title: 'API Gateway, reverse proxy và load balancer',
    pages: [138, 309, 324],
    min: 11,
    level: 'co-ban',
    lede: 'Ba thành phần cùng đứng giữa client và server nên rất dễ nhầm. Mỗi cái giải một bài toán khác nhau, và một sản phẩm như Nginx có thể đóng cả ba vai.',
    body: `
<h2>Ba vai trò, ba câu hỏi</h2>
<p>Sách dùng ba hình ảnh dễ nhớ. <b>Reverse proxy</b> là người "đổi danh tính": nhận request thay cho server và giấu server thật đi. <b>API gateway</b> là người đưa thư: đọc request rồi chuyển tới đúng service. <b>Load balancer</b> là cảnh sát giao thông: chia đều luồng xe cho các server để không chỗ nào bị nghẽn.</p>
${diagram({
  w: 720, h: 300,
  nodes: [
    { id: 'c', label: 'Client', x: 75, y: 150, w: 100, kind: 'client' },
    { id: 'lb', label: 'Load balancer', sub: 'L4', x: 250, y: 150, h: 56, kind: 'lb' },
    { id: 'g', label: 'API Gateway', sub: 'nhiều instance', x: 430, y: 150, h: 56, kind: 'lb' },
    { id: 'u', label: 'User service', x: 640, y: 55 },
    { id: 'o', label: 'Order service', x: 640, y: 150 },
    { id: 'p', label: 'Payment service', x: 640, y: 245, w: 130 },
    { id: 'a', label: 'Auth', sub: 'xác thực token', x: 250, y: 260, h: 56, kind: 'external' },
  ],
  edges: [
    { from: 'c', to: 'lb', label: 'HTTPS' },
    { from: 'lb', to: 'g' },
    { from: 'g', to: 'u', label: '/users' },
    { from: 'g', to: 'o', label: '/orders' },
    { from: 'g', to: 'p', label: '/payments' },
    { from: 'g', to: 'a', dashed: true, kind: 'muted' },
  ],
  caption: 'Hình: Một cách bố trí phổ biến. Load balancer chia tải cho cụm gateway; gateway xác thực rồi route theo path tới từng service.',
})}

<h2>API gateway làm gì</h2>
<p>API gateway là cổng vào duy nhất của hệ thống API. Nó nhận request, áp các chính sách bảo mật và giới hạn, chuyển request tới backend phù hợp rồi trả kết quả về client. Sách liệt kê sáu chức năng chính:</p>
${tbl(['Chức năng', 'Ví dụ cụ thể'], [
  ['Request routing', '<code>/orders/*</code> tới order service, <code>/users/*</code> tới user service'],
  ['Load balancing', 'Chia request giữa các instance của cùng một service'],
  ['Bảo mật', 'Kiểm tra JWT hoặc API key, phân quyền, kết thúc TLS'],
  ['Rate limiting và throttling', 'Mỗi API key tối đa 100 request mỗi phút'],
  ['API composition', 'Một lời gọi <code>/home</code> được gateway tách thành ba lời gọi backend rồi gộp kết quả'],
  ['Caching', 'Lưu response của <code>GET /products/42</code> trong 60 giây'],
])}
${seq({
  actors: [
    { id: 'c', label: 'Client', kind: 'client' },
    { id: 'g', label: 'API Gateway', kind: 'lb' },
    { id: 'a', label: 'Auth service', kind: 'external' },
    { id: 's', label: 'Order service' },
  ],
  msgs: [
    { from: 'c', to: 'g', label: 'GET /orders/42 + token' },
    { from: 'g', to: 'g', label: 'Kiểm tra rate limit' },
    { from: 'g', to: 'a', label: 'Token hợp lệ?' },
    { from: 'a', to: 'g', label: 'user=7, role=buyer', dashed: true },
    { from: 'g', to: 'g', label: 'Chọn route' },
    { from: 'g', to: 's', label: 'GET /orders/42 + X-User-Id: 7' },
    { from: 's', to: 'g', label: '200 + JSON', dashed: true },
    { from: 'g', to: 'g', label: 'Ghi log, metric' },
    { from: 'g', to: 'c', label: '200 + JSON', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Đường đi của một request qua gateway. Service phía sau nhận thông tin user đã xác thực, không phải tự kiểm tra token.',
})}

<h2>Nginx: vì sao phổ biến</h2>
<p>Nginx là web server và reverse proxy hiệu năng cao. Bí quyết nằm ở mô hình <b>master-worker</b>. Master process đọc file cấu hình và quản lý vòng đời các worker. Mỗi worker process chạy một vòng lặp sự kiện (event loop) với I/O không chặn, nên một worker phục vụ được hàng nghìn kết nối mà không cần mỗi kết nối một thread.</p>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'm', label: 'Master process', sub: 'đọc config, quản lý', x: 360, y: 55, w: 160, h: 56 },
    { id: 'w1', label: 'Worker 1', sub: 'event loop', x: 150, y: 155, h: 56 },
    { id: 'w2', label: 'Worker 2', sub: 'event loop', x: 360, y: 155, h: 56 },
    { id: 'w3', label: 'Worker N', sub: '= số CPU core', x: 570, y: 155, h: 56 },
    { id: 'k', label: 'Hàng chục nghìn kết nối của client', x: 360, y: 250, w: 380, kind: 'client' },
  ],
  edges: [
    { from: 'm', to: 'w1', dashed: true },
    { from: 'm', to: 'w2', dashed: true },
    { from: 'm', to: 'w3', dashed: true },
    { from: 'k', to: 'w1' },
    { from: 'k', to: 'w2' },
    { from: 'k', to: 'w3' },
  ],
  caption: 'Hình: Kiến trúc master-worker của Nginx. Thường đặt worker_processes auto để số worker bằng số CPU core.',
})}
<p>Mô hình này mang lại hai lợi ích. Thứ nhất là ổn định: một worker gặp lỗi thì master khởi động lại worker khác, các worker còn lại vẫn chạy. Thứ hai là nạp lại cấu hình không gián đoạn: master đọc config mới, tạo worker mới, còn worker cũ phục vụ nốt các kết nối đang mở rồi mới thoát. Nhờ vậy Nginx đảm nhận được bốn vai trò mà sách nêu: web server, reverse proxy và load balancer, cache nội dung, và SSL termination.</p>

<h2>So sánh ba thành phần</h2>
${tbl(['', 'Reverse proxy', 'Load balancer', 'API gateway'], [
  ['Câu hỏi chính', 'Giấu và bảo vệ server thế nào?', 'Gửi request tới instance nào?', 'Request này được phép không, đi tới service nào?'],
  ['Tầng hoạt động', 'L7 (HTTP)', 'L4 (TCP/UDP) hoặc L7', 'L7, hiểu API, user, API key'],
  ['Việc điển hình', 'TLS, cache, nén, chặn tấn công', 'Health check, chia tải, failover', 'Xác thực, rate limit, routing, gộp response'],
  ['Ví dụ', 'Nginx, HAProxy, Envoy', 'AWS ELB, HAProxy, Nginx', 'Kong, AWS API Gateway, Netflix Zuul'],
])}
<p>Ranh giới giữa ba khái niệm khá mờ vì chúng lồng vào nhau. Load balancer L7 về bản chất là một reverse proxy có thêm thuật toán chia tải. API gateway lại là một reverse proxy hiểu ngữ nghĩa API: biết request này của user nào, gọi endpoint nào, còn bao nhiêu lượt. Vì vậy, thay vì hỏi "dùng cái nào", hãy hỏi "hệ thống cần những chức năng nào, và đặt mỗi chức năng ở tầng nào".</p>
<p>Một website nhỏ có thể chỉ cần một Nginx làm cả ba việc. Khi hệ thống có hàng chục service và nhiều loại client, thường tách ra: load balancer của cloud đứng ngoài cùng lo TLS và chia tải, cụm API gateway lo xác thực và rate limit, còn bên trong các service gọi nhau qua service mesh hoặc load balancer nội bộ.</p>
${tip('<b>Thực tế.</b> Kong, một API gateway mã nguồn mở phổ biến, được xây trên nền Nginx và OpenResty (Nginx kèm LuaJIT). Phần định tuyến và proxy tận dụng mô hình worker của Nginx, còn các chức năng gateway như xác thực, rate limit được viết dưới dạng plugin Lua.')}
${note('<b>Sai lầm thường gặp.</b> Nhét logic nghiệp vụ vào gateway (tính giá, kiểm tra tồn kho) và chỉ chạy một instance gateway. Gateway nên mỏng, chỉ lo các việc chung cho mọi API; và vì mọi request đi qua nó, gateway phải chạy nhiều instance sau load balancer để không thành điểm lỗi duy nhất.')}
${interview([
  'Phân biệt reverse proxy, load balancer và API gateway. Khi nào một hệ thống cần cả ba?',
  'API gateway là điểm lỗi duy nhất. Bạn thiết kế thế nào để nó không làm sập cả hệ thống?',
  'Vì sao mô hình event-driven của Nginx dùng ít bộ nhớ hơn mô hình mỗi kết nối một thread?',
])}`,
    keys: [
      'Reverse proxy giấu và bảo vệ server, load balancer chia tải, API gateway quản lý và định tuyến API.',
      'Sáu chức năng gateway: routing, load balancing, bảo mật, rate limit, API composition, caching.',
      'Nginx dùng master-worker và event loop không chặn; mỗi worker phục vụ hàng nghìn kết nối.',
      'Gateway phải mỏng và chạy nhiều instance để không thành điểm lỗi duy nhất.',
    ],
    quiz: [
      { q: 'Giới hạn mỗi API key tối đa 100 request mỗi phút là việc điển hình của thành phần nào?', o: ['Database', 'API Gateway', 'CDN', 'Message queue'], a: 1, why: 'Rate limiting và throttling là một trong sáu chức năng chính của API gateway.' },
      { q: '"API composition" trong gateway nghĩa là gì?', o: ['Tự sinh tài liệu API', 'Gộp nhiều lời gọi backend thành một response cho client', 'Nén response', 'Ghép nhiều version API'], a: 1, why: 'Client gọi một lần, gateway gọi nhiều service rồi gộp kết quả, giảm số vòng gọi qua mạng.' },
      { q: 'Trong Nginx, process nào trực tiếp xử lý kết nối của client?', o: ['Master process', 'Worker process', 'Cache loader', 'Mỗi kết nối một thread riêng'], a: 1, why: 'Master chỉ đọc config và quản lý worker. Worker xử lý kết nối bằng event loop không chặn.' },
      { q: 'Load balancer L4 ra quyết định dựa trên thông tin gì?', o: ['URL path và header HTTP', 'IP và port TCP/UDP', 'Nội dung body JSON', 'Cookie phiên'], a: 1, why: 'L4 chỉ nhìn tới tầng transport nên không đọc được path, header hay cookie.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'rate-limit',
    mod: 'api',
    title: 'Rate limiting',
    pages: [309],
    min: 13,
    level: 'trung-binh',
    widget: 'ratelimit',
    lede: 'Rate limiter quyết định một request được đi tiếp hay bị từ chối dựa trên số request client đã gửi gần đây. Đây là tuyến phòng thủ đầu tiên trước lạm dụng, bot và lỗi retry vô tận.',
    body: `
<h2>Vì sao cần giới hạn</h2>
<p>Không giới hạn thì một client lỗi có thể retry hàng nghìn lần mỗi giây, một bot có thể cào toàn bộ dữ liệu, và một khách hàng lớn có thể chiếm hết tài nguyên của mọi người khác. Rate limiting giải quyết ba việc: chống tấn công từ chối dịch vụ, kiểm soát chi phí (nhất là khi gọi API trả phí phía sau), và chia công bằng tài nguyên giữa các client. Sách xếp rate limiting và throttling vào nhóm chức năng chính của API gateway.</p>

<h2>Token bucket</h2>
<p>Đây là thuật toán phổ biến nhất. Mỗi client có một cái xô chứa tối đa <b>b</b> token. Một bộ nạp thêm token với tốc độ <b>r</b> token mỗi giây, xô đầy thì token thừa bị bỏ. Mỗi request lấy một token; xô rỗng thì request bị từ chối. Widget ở cuối bài cho bạn chỉnh b và r để xem hành vi này.</p>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'f', label: 'Bộ nạp', sub: '+r token mỗi giây', x: 100, y: 65, w: 140, h: 56 },
    { id: 'b', label: 'Bucket', sub: 'tối đa b token', x: 330, y: 65, w: 140, h: 56, kind: 'cache' },
    { id: 'q', label: 'Request', x: 100, y: 190, w: 120, kind: 'client' },
    { id: 'k', label: 'Còn token?', x: 330, y: 190, w: 140, kind: 'lb' },
    { id: 'ok', label: 'Chuyển tới API', x: 590, y: 130, w: 150, kind: 'good' },
    { id: 'no', label: '429 Too Many\nRequests', x: 590, y: 245, w: 150, h: 56, kind: 'warn' },
  ],
  edges: [
    { from: 'f', to: 'b', label: 'nạp' },
    { from: 'q', to: 'k' },
    { from: 'b', to: 'k', label: 'lấy 1 token' },
    { from: 'k', to: 'ok', label: 'còn', kind: 'good' },
    { from: 'k', to: 'no', label: 'hết', kind: 'warn' },
  ],
  caption: 'Hình: Token bucket. Xô đầy cho phép một đợt burst tối đa b request; về lâu dài tốc độ trung bình không vượt quá r.',
})}
<p>Ví dụ b = 10, r = 2. Client im lặng một lúc thì xô đầy 10 token, nên có thể gửi ngay 10 request liền. Sau đó chỉ được 2 request mỗi giây. Thuật toán này dễ cài đặt, tốn ít bộ nhớ (mỗi client chỉ cần số token và thời điểm nạp gần nhất), và cho phép burst ngắn, rất hợp với hành vi thật của người dùng.</p>

<h2>Các thuật toán khác</h2>
${tbl(['Thuật toán', 'Cách hoạt động', 'Ưu điểm', 'Nhược điểm'], [
  ['Leaky bucket', 'Request vào hàng đợi FIFO, được lấy ra xử lý với tốc độ cố định', 'Đầu ra đều, bảo vệ backend nhạy cảm', 'Burst phải xếp hàng chờ, request cũ có thể chặn request mới'],
  ['Fixed window counter', 'Đếm request trong từng khung cố định, ví dụ mỗi phút', 'Đơn giản nhất, một counter mỗi client', 'Burst ở ranh giới hai khung có thể gấp đôi giới hạn'],
  ['Sliding window log', 'Lưu timestamp từng request, đếm số timestamp trong 60 giây gần nhất', 'Chính xác tuyệt đối', 'Tốn bộ nhớ: một bản ghi cho mỗi request'],
  ['Sliding window counter', 'Ước lượng: count = khung hiện tại + khung trước × tỉ lệ chồng lấn', 'Chính xác gần đúng, chỉ cần hai counter', 'Là ước lượng, giả định request phân bố đều trong khung trước'],
])}
<p>Vấn đề ranh giới của fixed window: giới hạn 100 request mỗi phút. Client gửi 100 request lúc 0:59 và 100 request nữa lúc 1:00. Cả hai khung đều hợp lệ, nhưng trong 2 giây thực tế đã có 200 request. Sliding window counter sửa điều này. Ví dụ lúc 1:15, khung trước có 80 request, khung hiện tại có 30: ước lượng = 30 + 80 × 75% = 90, vẫn dưới 100 nên cho qua.</p>

<h2>Đặt rate limiter ở đâu</h2>
${tbl(['Vị trí', 'Nhận xét'], [
  ['Phía client', 'Lịch sự với server nhưng không tin được, kẻ xấu bỏ qua dễ dàng'],
  ['Edge, CDN, WAF', 'Chặn sớm theo IP, phù hợp chống DDoS thô'],
  ['API gateway', 'Vị trí phổ biến nhất: biết API key, user, route; một chỗ cấu hình cho mọi service'],
  ['Trong service', 'Giới hạn theo logic nghiệp vụ, ví dụ tối đa 5 lần gửi OTP mỗi giờ'],
])}
<p>Khóa để đếm cũng quan trọng như vị trí: theo user ID, theo API key, theo IP, hoặc kết hợp. Giới hạn theo IP dễ chặn nhầm cả một văn phòng hay một nhà mạng dùng chung IP qua NAT.</p>

<h2>Rate limit phân tán với Redis</h2>
<p>Khi có nhiều instance gateway, mỗi instance tự đếm trong RAM sẽ sai: 5 instance, mỗi cái cho 100 request mỗi phút, thì client thực tế được 500. Cần một bộ đếm dùng chung, thường là Redis.</p>
${diagram({
  w: 720, h: 320,
  nodes: [
    { id: 'c1', label: 'Client A', x: 80, y: 70, w: 110, kind: 'client' },
    { id: 'c2', label: 'Client B', x: 80, y: 250, w: 110, kind: 'client' },
    { id: 'g1', label: 'Gateway 1', x: 300, y: 70, kind: 'lb' },
    { id: 'g2', label: 'Gateway 2', x: 300, y: 250, kind: 'lb' },
    { id: 'r', label: 'Redis', sub: 'counter dùng chung', x: 300, y: 160, w: 150, kind: 'cache' },
    { id: 's', label: 'Order service', x: 590, y: 160, w: 130 },
  ],
  edges: [
    { from: 'c1', to: 'g1' },
    { from: 'c2', to: 'g2' },
    { from: 'g1', to: 'r', both: true },
    { from: 'g2', to: 'r', both: true },
    { from: 'g1', to: 's', label: 'được phép', kind: 'good' },
    { from: 'g2', to: 's', label: 'được phép', kind: 'good' },
  ],
  caption: 'Hình: Mọi gateway kiểm tra và trừ token trên cùng một Redis, nên giới hạn đúng bất kể request rơi vào instance nào.',
})}
<p>Thao tác "đọc counter, kiểm tra, ghi lại" phải nguyên tử. Nếu tách thành <code>GET</code> rồi <code>SET</code>, hai gateway có thể cùng đọc 99 và cùng cho qua. Với fixed window, dùng <code>INCR</code> kết hợp <code>EXPIRE</code>. Với token bucket, đặt toàn bộ logic trong một Lua script chạy bằng <code>EVAL</code>; Redis chạy script nguyên tử, không lệnh nào chen vào giữa.</p>
${seq({
  actors: [
    { id: 'c', label: 'Client', kind: 'client' },
    { id: 'g', label: 'Gateway', kind: 'lb' },
    { id: 'r', label: 'Redis', kind: 'cache' },
    { id: 's', label: 'Service' },
  ],
  msgs: [
    { from: 'c', to: 'g', label: 'GET /orders' },
    { from: 'g', to: 'r', label: 'EVAL token_bucket.lua' },
    { from: 'r', to: 'g', label: 'cho phép, còn 4', dashed: true },
    { from: 'g', to: 's', label: 'chuyển tiếp' },
    { from: 'g', to: 'c', label: '200, X-RateLimit-Remaining: 4', dashed: true, kind: 'good' },
    { note: 'Client gửi tiếp 5 request trong cùng giây' },
    { from: 'g', to: 'r', label: 'EVAL token_bucket.lua' },
    { from: 'r', to: 'g', label: 'từ chối, chờ 2 giây', dashed: true },
    { from: 'g', to: 'c', label: '429, Retry-After: 2', dashed: true, kind: 'warn' },
  ],
  caption: 'Hình: Gateway hỏi Redis trước mỗi request và báo cho client biết còn bao nhiêu lượt, khi nào được gửi lại.',
})}

<h2>Trả lời client thế nào</h2>
<p>Request bị chặn nhận mã <code>429 Too Many Requests</code>. Header <code>Retry-After</code> (chuẩn HTTP) cho biết số giây cần chờ. Các header <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code> không phải chuẩn chính thức nhưng được dùng rộng rãi, giúp client tự điều tiết trước khi bị chặn.</p>
${tip('<b>Thực tế.</b> GitHub REST API cho user đã xác thực 5.000 request mỗi giờ và trả về các header <code>x-ratelimit-limit</code>, <code>x-ratelimit-remaining</code>, <code>x-ratelimit-reset</code> ở mọi response. Stripe công bố dùng token bucket trên Redis cho rate limiter của mình, còn Shopify REST Admin API dùng mô hình leaky bucket.')}
${note('<b>Sai lầm thường gặp.</b> Để rate limiter "fail closed": Redis sập thì từ chối mọi request, biến một sự cố cache thành sự cố toàn hệ thống. Phần lớn trường hợp nên "fail open", tạm cho request qua và cảnh báo, kèm một giới hạn dự phòng trong RAM của từng instance.')}
${interview([
  'Thiết kế rate limiter cho API công khai: 1.000 request mỗi phút cho mỗi API key, chạy trên 20 instance gateway.',
  'So sánh token bucket và leaky bucket. Bài toán nào hợp với từng loại?',
  'Fixed window có vấn đề gì ở ranh giới khung? Sliding window counter khắc phục ra sao?',
  'Redis dùng cho rate limiter bị chậm hoặc sập. Gateway nên phản ứng thế nào?',
])}`,
    keys: [
      'Token bucket: dung lượng b cho phép burst, tốc độ nạp r quyết định tốc độ trung bình.',
      'Fixed window đơn giản nhưng có thể gấp đôi giới hạn ở ranh giới; sliding window counter ước lượng chính xác hơn với chi phí thấp.',
      'Nhiều instance phải dùng bộ đếm chung như Redis, với thao tác nguyên tử (INCR hoặc Lua script).',
      'Trả 429 kèm Retry-After và các header X-RateLimit để client tự điều tiết.',
    ],
    quiz: [
      { q: 'Token bucket có b = 10, r = 1 token/giây. Client im lặng 1 phút rồi gửi liền 15 request. Bao nhiêu request được qua ngay?', o: ['1', '10', '15', '60'], a: 1, why: 'Xô chỉ chứa tối đa 10 token dù đã im lặng 60 giây. 5 request còn lại bị từ chối hoặc phải chờ nạp thêm.' },
      { q: 'Thuật toán nào cho đầu ra đều đặn nhất về phía backend?', o: ['Token bucket', 'Leaky bucket', 'Fixed window', 'Sliding window log'], a: 1, why: 'Leaky bucket lấy request khỏi hàng đợi với tốc độ cố định, nên backend nhận tải đều.' },
      { q: '5 instance gateway, mỗi cái tự đếm 100 request/phút trong RAM. Giới hạn thực tế với một client là bao nhiêu?', o: ['20', '100', 'Tới 500', 'Không giới hạn'], a: 2, why: 'Request được load balancer chia ra 5 instance, mỗi instance cho qua 100, nên tổng có thể lên 500.' },
      { q: 'Status code chuẩn cho request bị rate limit là gì?', o: ['403', '429', '503', '409'], a: 1, why: '429 Too Many Requests, thường kèm header Retry-After.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'api-testing',
    mod: 'api',
    title: 'Kiểm thử API và công cụ',
    pages: [53, 145, 122],
    min: 11,
    level: 'co-ban',
    lede: 'API là hợp đồng mà nhiều đội và đối tác dựa vào. Kiểm thử API đúng cách bắt lỗi ở tầng rẻ nhất, trước khi lỗi tới tay người dùng.',
    body: `
<h2>Kiểm thử chức năng hệ thống: bức tranh chung</h2>
<p>Sách nêu sáu cách tốt nhất để kiểm thử chức năng một hệ thống. <b>Unit test</b> kiểm tra từng hàm, từng class riêng lẻ. <b>Integration test</b> kiểm tra các phần ghép với nhau. <b>System test</b> đánh giá toàn bộ hệ thống so với yêu cầu. <b>Load test</b> xem hệ thống chịu tải cao ra sao. <b>Error test</b> xem phần mềm xử lý đầu vào sai và điều kiện lỗi thế nào. Cuối cùng là <b>tự động hóa</b> để mọi loại test chạy lặp lại được mà không tốn công người.</p>
${diagram({
  w: 720, h: 270,
  nodes: [
    { id: 'e', label: 'System / E2E', sub: 'ít, chậm, tốn kém', x: 360, y: 50, w: 200, h: 56, kind: 'warn' },
    { id: 'i', label: 'Integration / API test', sub: 'vừa phải', x: 360, y: 140, w: 380, h: 56 },
    { id: 'u', label: 'Unit test', sub: 'nhiều, nhanh, rẻ', x: 360, y: 230, w: 580, h: 56, kind: 'good' },
  ],
  caption: 'Hình: Kim tự tháp kiểm thử. Càng lên cao test càng gần trải nghiệm thật nhưng càng chậm và dễ vỡ, nên số lượng càng ít.',
})}

<h2>Chín loại kiểm thử API</h2>
${tbl(['Loại', 'Mục tiêu', 'Ví dụ'], [
  ['Smoke', 'Kiểm tra nhanh sau khi deploy xem API còn sống, không có gì vỡ', '<code>GET /health</code> và một luồng đặt hàng cơ bản'],
  ['Functional', 'So kết quả với yêu cầu chức năng', 'Áp mã giảm giá 10% thì tổng tiền đúng'],
  ['Integration', 'Ghép nhiều lời gọi API, kiểm tra giao tiếp giữa các service', 'Tạo đơn, thanh toán, kiểm tra kho bị trừ'],
  ['Regression', 'Bản sửa lỗi hoặc tính năng mới không làm hỏng hành vi cũ', 'Chạy lại toàn bộ bộ test trước mỗi release'],
  ['Load', 'Đo năng lực với các mức tải khác nhau', '2.000 request mỗi giây, p99 dưới 300 ms'],
  ['Stress', 'Đẩy vượt mức thiết kế, xem hệ thống có còn hoạt động và hồi phục không', 'Tăng dần tới khi lỗi, quan sát cách hỏng'],
  ['Security', 'Kiểm tra trước các mối đe dọa từ bên ngoài', 'Gọi API của user khác bằng token của mình'],
  ['UI', 'Giao diện hiển thị đúng dữ liệu API trả về', 'Danh sách đơn trên web khớp response'],
  ['Fuzz', 'Bơm dữ liệu sai, bất ngờ để tìm cách làm API sập', 'Chuỗi 10 MB, số âm, ký tự Unicode lạ'],
])}
<p>Load test và stress test hay bị nhầm. Load test hỏi "ở mức tải dự kiến, hệ thống có đạt mục tiêu không". Stress test hỏi "vượt quá mức đó thì hệ thống hỏng thế nào, có tự hồi phục không". Một hệ thống tốt khi quá tải nên từ chối bớt request (trả 429 hoặc 503) thay vì treo toàn bộ.</p>

<h2>Mỗi loại test chạy ở đâu</h2>
<p>Không phải test nào cũng chạy ở mỗi commit. Test nhanh chạy sớm và thường xuyên; test đắt chạy ở môi trường gần production và ít hơn.</p>
${diagram({
  w: 720, h: 200,
  nodes: [
    { id: 'p', label: 'Pull request', sub: 'unit, fuzz nhẹ', x: 90, y: 100, w: 140, h: 56, kind: 'client' },
    { id: 'ci', label: 'CI sau merge', sub: 'functional, integration', x: 270, y: 100, w: 160, h: 56 },
    { id: 'st', label: 'Staging', sub: 'regression, security', x: 455, y: 100, w: 150, h: 56 },
    { id: 'pr', label: 'Production', sub: 'smoke, giám sát', x: 635, y: 100, w: 140, h: 56, kind: 'good' },
  ],
  edges: [
    { from: 'p', to: 'ci' },
    { from: 'ci', to: 'st' },
    { from: 'st', to: 'pr' },
  ],
  caption: 'Hình: Test được rải theo pipeline. Load và stress test thường chạy định kỳ trên môi trường riêng có dữ liệu giống production.',
})}

<h2>Công cụ gọi và kiểm thử API</h2>
${tbl(['Công cụ', 'Đặc điểm', 'Hợp với'], [
  ['Postman', 'Nền tảng vòng đời API đầy đủ: collection, môi trường, mock server, tài liệu, cộng tác. Chạy collection trong CI bằng Newman', 'Team lớn, dự án phức tạp, cần chia sẻ'],
  ['Insomnia', 'Client mã nguồn mở, hỗ trợ REST, GraphQL, gRPC, giao diện gọn', 'Người thích công cụ mã nguồn mở, nhẹ'],
  ['ReadyAPI', 'Bộ công cụ thương mại của SmartBear (kế thừa SoapUI Pro): functional, security và load test trong một gói, mạnh về SOAP', 'Doanh nghiệp cần test tự động bài bản, có hệ thống SOAP'],
  ['Thunder Client', 'Extension trong VS Code, nhẹ, dùng ngay trong editor', 'Cá nhân, team nhỏ, nhu cầu đơn giản'],
  ['Hoppscotch', 'Mã nguồn mở, chạy trên trình duyệt, hỗ trợ REST, GraphQL, WebSocket', 'Cần công cụ miễn phí, không cài đặt'],
])}
<p>Ngoài các API client, mỗi loại test có công cụ chuyên dụng: k6, JMeter, Gatling cho load test; OWASP ZAP cho security test; Schemathesis đọc file OpenAPI và tự sinh hàng nghìn request ngẫu nhiên để fuzz test.</p>
${tip('<b>Thực tế.</b> Một cách làm phổ biến là lưu Postman collection cùng repository, chạy bằng Newman trong CI sau mỗi lần deploy lên staging. Bộ smoke test vài chục request chạy dưới một phút, và pipeline dừng ngay nếu một endpoint quan trọng trả sai status code.')}
${note('<b>Sai lầm thường gặp.</b> Chạy load test trên staging với database chỉ vài nghìn dòng rồi kết luận hệ thống chịu được tải. Với dữ liệu nhỏ, mọi thứ nằm gọn trong RAM và index; production có hàng trăm triệu dòng sẽ cho kết quả hoàn toàn khác.')}
${interview([
  'Bạn vừa nhận một API không có test nào. Bạn ưu tiên viết loại test nào trước, và vì sao?',
  'Phân biệt load test và stress test. Bạn đặt tiêu chí đạt hay không đạt như thế nào?',
  'Làm sao để integration test ổn định khi API gọi sang một dịch vụ bên thứ ba?',
])}`,
    keys: [
      'Chín loại test API: smoke, functional, integration, regression, load, stress, security, UI, fuzz.',
      'Kim tự tháp: nhiều unit test nhanh, ít E2E test chậm; mọi test nên tự động hóa trong pipeline.',
      'Load test đo năng lực ở mức dự kiến; stress test xem hệ thống hỏng và hồi phục thế nào khi vượt mức.',
      'Postman cho team lớn, Insomnia và Hoppscotch mã nguồn mở, Thunder Client trong VS Code, ReadyAPI cho test doanh nghiệp.',
    ],
    quiz: [
      { q: 'Loại test nào bơm dữ liệu ngẫu nhiên, sai định dạng vào API để tìm lỗ hổng?', o: ['Smoke test', 'Regression test', 'Fuzz test', 'UI test'], a: 2, why: 'Fuzz test cố tình gửi dữ liệu bất ngờ để tìm cách làm API lỗi hoặc sập.' },
      { q: 'Sau mỗi lần deploy, đội chạy vài request cơ bản để xác nhận API còn hoạt động. Đó là gì?', o: ['Stress test', 'Smoke test', 'Load test', 'Security test'], a: 1, why: 'Smoke test là kiểm tra nhanh, nông để biết bản deploy không vỡ những chức năng cơ bản.' },
      { q: 'Mục tiêu chính của regression test là gì?', o: ['Đo throughput tối đa', 'Bảo đảm thay đổi mới không làm hỏng hành vi cũ', 'Tìm lỗ hổng bảo mật', 'Kiểm tra giao diện'], a: 1, why: 'Regression test chạy lại các test cũ để phát hiện tính năng đã chạy đúng nay bị hỏng.' },
      { q: 'Công cụ nào là extension chạy ngay trong VS Code?', o: ['Postman', 'ReadyAPI', 'Thunder Client', 'JMeter'], a: 2, why: 'Thunder Client là extension của VS Code, phù hợp cho nhu cầu gọi API đơn giản ngay trong editor.' },
    ],
  },
];
