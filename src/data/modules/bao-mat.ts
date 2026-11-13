import type { Lesson } from '../../types';
import { cols, diagram, interview, note, seq, tbl, tip } from '../helpers';

export const lessons: Lesson[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'auth',
    mod: 'bao-mat',
    title: 'Session, cookie và JWT',
    pages: [229, 261, 87],
    min: 11,
    level: 'co-ban',
    lede: 'HTTP không nhớ gì giữa hai request, nên mọi hệ thống có đăng nhập đều phải trả lời câu hỏi: lần sau làm sao biết người này là ai? Session và JWT là hai câu trả lời phổ biến nhất, mỗi cách đánh đổi giữa sự đơn giản khi thu hồi và khả năng scale.',
    body: `
<h2>Vấn đề cần giải quyết</h2>
<p>Sau khi người dùng nhập đúng mật khẩu, server cần cấp cho trình duyệt một "bằng chứng" để gửi kèm mọi request sau. Có hai hướng. Hướng thứ nhất: server tự ghi nhớ trạng thái đăng nhập và chỉ đưa cho client một mã tham chiếu. Hướng thứ hai: server đưa cho client toàn bộ thông tin đã được ký, client tự mang theo. Sách ví von: cách thứ nhất giống hành khách chỉ cầm mã đặt chỗ còn hãng bay giữ hồ sơ; cách thứ hai giống tấm vé ghi đủ thông tin và có dấu chống giả.</p>

<h2>Session-based authentication</h2>
${seq({
  actors: [
    { id: 'b', label: 'Trình duyệt', kind: 'client' },
    { id: 's', label: 'Server' },
    { id: 'st', label: 'Session store', kind: 'store' },
  ],
  msgs: [
    { from: 'b', to: 's', label: 'POST /login (email, mật khẩu)' },
    { from: 's', to: 'st', label: 'lưu sid=abc → userId 42' },
    { from: 's', to: 'b', label: 'Set-Cookie: sid=abc; HttpOnly', dashed: true },
    { note: 'Các request sau: trình duyệt tự gửi cookie' },
    { from: 'b', to: 's', label: 'GET /orders, Cookie: sid=abc' },
    { from: 's', to: 'st', label: 'tra sid=abc' },
    { from: 'st', to: 's', label: 'userId 42, role user', dashed: true },
    { from: 's', to: 'b', label: '200 danh sách đơn', dashed: true },
  ],
  caption: 'Hình: Session. Server giữ trạng thái trong session store (Redis, database); cookie chỉ chứa một ID ngẫu nhiên không mang thông tin gì.',
})}
<p>Ưu điểm lớn nhất là kiểm soát: muốn đăng xuất người dùng ở mọi thiết bị, chỉ cần xóa bản ghi session. Nhược điểm là mỗi request phải tra session store. Khi chạy nhiều server, store phải dùng chung (thường là Redis) hoặc phải bật sticky session. Sách cũng lưu ý cookie gắn với một trình duyệt và một domain, nên không thuận tiện cho app mobile hay API gọi từ nhiều nơi.</p>

<h2>JWT-based authentication</h2>
<p><b>JWT</b> (JSON Web Token) là chuỗi gồm ba phần ngăn bởi dấu chấm: <code>header.payload.signature</code>. Header ghi thuật toán ký. Payload chứa các <b>claim</b> như <code>sub</code> (ID người dùng), <code>exp</code> (hạn dùng), <code>iss</code> (bên cấp), <code>aud</code> (bên nhận). Signature được tạo từ header và payload bằng khóa bí mật, nên ai sửa payload thì chữ ký không còn khớp.</p>
${diagram({
  w: 720, h: 260,
  nodes: [
    { id: 'h', label: 'Header', sub: '{"alg":"RS256"}', x: 120, y: 65, w: 170 },
    { id: 'p', label: 'Payload', sub: '{"sub":"42","exp":...}', x: 360, y: 65, w: 200 },
    { id: 'k', label: 'Hàm ký', sub: 'RS256 + private key', x: 360, y: 190, w: 190, kind: 'lb' },
    { id: 's', label: 'Signature', sub: 'chống sửa đổi', x: 600, y: 190, w: 160, kind: 'good' },
  ],
  edges: [
    { from: 'h', to: 'k', label: 'base64url' },
    { from: 'p', to: 'k', label: 'base64url' },
    { from: 'k', to: 's' },
  ],
  caption: 'Hình: Cấu trúc JWT. Header và payload chỉ được mã hóa base64url, ai cũng đọc được; signature chỉ bên giữ khóa mới tạo ra được.',
})}
${seq({
  actors: [
    { id: 'b', label: 'Client', kind: 'client' },
    { id: 'a', label: 'Auth service', kind: 'lb' },
    { id: 'api', label: 'API service' },
  ],
  msgs: [
    { from: 'b', to: 'a', label: 'POST /login' },
    { note: 'Auth service kiểm tra mật khẩu, ký JWT bằng private key' },
    { from: 'a', to: 'b', label: 'access token (15 phút) + refresh token', dashed: true },
    { from: 'b', to: 'api', label: 'Authorization: Bearer eyJhbGci...' },
    { note: 'API verify chữ ký bằng public key, kiểm tra exp và aud; không gọi DB' },
    { from: 'api', to: 'b', label: '200 dữ liệu', dashed: true },
    { from: 'b', to: 'a', label: 'token hết hạn: gửi refresh token' },
    { from: 'a', to: 'b', label: 'access token mới + refresh token mới', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: JWT với cặp access token ngắn hạn và refresh token. Service nào có public key cũng tự xác minh được token.',
})}
<p>Vì API tự xác minh được chữ ký, không cần store dùng chung nên rất hợp với microservices và mobile. Với thuật toán bất đối xứng (RS256, ES256), chỉ auth service giữ private key; các service khác lấy public key từ endpoint JWKS. Với HS256, mọi service phải giữ cùng một secret, nên một service bị lộ là lộ khả năng tạo token.</p>

<h2>Thu hồi token và refresh token</h2>
<p>Điểm yếu của JWT là khó thu hồi: token hợp lệ cho tới khi hết <code>exp</code>, kể cả khi người dùng đã đổi mật khẩu. Các cách xử lý phổ biến:</p>
${tbl(['Kỹ thuật', 'Cách làm', 'Đánh đổi'], [
  ['Access token ngắn hạn', '<code>exp</code> 5–15 phút', 'Cửa sổ rủi ro nhỏ, phải refresh thường xuyên'],
  ['Refresh token', 'Token dài hạn lưu phía server, dùng để xin access token mới', 'Thu hồi refresh token là chặn được phiên'],
  ['Rotation', 'Mỗi lần refresh cấp refresh token mới, token cũ vô hiệu', 'Phát hiện được refresh token bị đánh cắp và dùng lại'],
  ['Denylist theo <code>jti</code>', 'Lưu ID các token bị thu hồi trong Redis tới khi hết hạn', 'Lại có một lần tra cứu mỗi request'],
])}

<h2>Lưu token ở đâu trên trình duyệt</h2>
${cols([
  { title: 'Cookie HttpOnly', body: '<p>JavaScript không đọc được nên XSS không lấy trộm được token. Gắn thêm <code>Secure</code> (chỉ gửi qua HTTPS) và <code>SameSite=Lax</code> hoặc <code>Strict</code>. Vì trình duyệt tự gửi cookie, cần chống CSRF.</p>' },
  { title: 'localStorage', body: '<p>Dễ dùng, gửi thủ công qua header <code>Authorization</code> nên không bị CSRF. Nhưng bất kỳ script nào trên trang, kể cả script bị chèn qua XSS hay thư viện bên thứ ba bị nhiễm độc, đều đọc được token.</p>' },
])}
${tbl(['Tiêu chí', 'Session', 'JWT'], [
  ['Trạng thái lưu ở', 'Server (session store)', 'Trong token phía client'],
  ['Thu hồi', 'Xóa session là xong', 'Khó; cần exp ngắn, refresh token, denylist'],
  ['Scale', 'Cần store dùng chung', 'Service tự verify, không cần store'],
  ['Kích thước gửi kèm', 'ID khoảng 32 byte', 'Vài trăm byte tới vài KB'],
  ['Hợp với', 'Web app truyền thống, một domain', 'API, mobile, microservices, nhiều domain'],
])}
${tip('<b>Thực tế.</b> Sách điểm qua thêm đăng nhập bằng QR code: web hiển thị QR chứa một token ngẫu nhiên, app mobile đã đăng nhập quét mã và xác nhận, server gắn phiên của trình duyệt với tài khoản đó. WhatsApp Web và các ví điện tử dùng cách này để không phải gõ mật khẩu trên máy lạ.')}
${note('<b>Sai lầm thường gặp.</b> Nhét thông tin nhạy cảm vào payload JWT vì nghĩ token "đã mã hóa". Payload chỉ là base64url, dán vào jwt.io là đọc được. Một lỗi kinh điển khác: thư viện chấp nhận <code>alg: none</code> hoặc cho phép đổi RS256 sang HS256, khiến kẻ tấn công tự ký token. Luôn cố định thuật toán được chấp nhận khi verify.')}
${interview([
  'So sánh session và JWT. Bạn chọn cách nào cho một hệ thống microservices có cả web và mobile?',
  'Người dùng bấm "đăng xuất khỏi mọi thiết bị". Với JWT, bạn hiện thực tính năng này thế nào?',
  'Refresh token rotation phát hiện token bị đánh cắp bằng cách nào?',
  'Lưu access token trong cookie HttpOnly hay localStorage? Phân tích rủi ro XSS và CSRF.',
])}`,
    keys: [
      'Session lưu trạng thái ở server, cookie chỉ chứa ID; thu hồi dễ nhưng cần store dùng chung.',
      'JWT gồm header.payload.signature; payload chỉ là base64url, ai cũng đọc được.',
      'JWT tự xác minh được nên scale tốt, nhưng thu hồi khó: dùng access token ngắn hạn và refresh token có rotation.',
      'Cookie nên có HttpOnly, Secure, SameSite; localStorage dễ bị lộ token qua XSS.',
      'Luôn cố định thuật toán ký khi verify JWT, không tin trường alg trong header.',
    ],
    quiz: [
      { q: 'Payload của JWT được bảo vệ thế nào?', o: ['Được mã hóa AES, không ai đọc được', 'Chỉ base64url; chữ ký chống sửa đổi nhưng không che nội dung', 'Được băm bằng bcrypt', 'Lưu ở server'], a: 1, why: 'JWT ký (JWS) đảm bảo toàn vẹn, không đảm bảo bí mật. Muốn che nội dung phải dùng JWE.' },
      { q: 'Ưu điểm chính của session so với JWT là gì?', o: ['Không cần lưu gì ở server', 'Thu hồi phiên ngay lập tức bằng cách xóa session', 'Token nhỏ gọn hơn khi gọi nhiều domain', 'Không cần HTTPS'], a: 1, why: 'Trạng thái nằm ở server nên xóa bản ghi là phiên hết hiệu lực ngay.' },
      { q: 'Cờ cookie nào ngăn JavaScript đọc cookie?', o: ['Secure', 'SameSite', 'HttpOnly', 'Domain'], a: 2, why: 'HttpOnly chặn document.cookie, giảm thiệt hại khi có XSS.' },
      { q: 'Vì sao nhiều hệ thống dùng RS256 thay vì HS256 cho JWT?', o: ['RS256 tạo token ngắn hơn', 'Service chỉ cần public key để verify, không thể tự tạo token', 'HS256 không còn được hỗ trợ', 'RS256 không cần exp'], a: 1, why: 'Với bất đối xứng, chỉ auth service giữ private key; lộ public key không cho phép giả mạo token.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'oauth-sso',
    mod: 'bao-mat',
    title: 'OAuth 2.0 và SSO',
    pages: [102, 312, 269],
    min: 12,
    level: 'trung-binh',
    lede: 'Nút "Đăng nhập với Google" trông đơn giản nhưng phía sau là hai chuẩn khác nhau: OAuth 2.0 để ủy quyền truy cập và OpenID Connect hoặc SAML để xác thực một lần cho nhiều ứng dụng. Nhầm hai khái niệm này là nguồn gốc của nhiều lỗ hổng.',
    body: `
<h2>OAuth 2.0 giải quyết vấn đề gì</h2>
<p>Giả sử một app in ảnh muốn lấy ảnh từ Google Photos của bạn. Cách tệ nhất là đưa app mật khẩu Google: app có toàn quyền, không giới hạn thời gian, và muốn thu hồi thì phải đổi mật khẩu. <b>OAuth 2.0</b> là framework <b>ủy quyền</b> (authorization) cho phép app nhận một <b>access token</b> có phạm vi hẹp (<b>scope</b>, ví dụ chỉ đọc ảnh), có hạn dùng và thu hồi được, mà không bao giờ thấy mật khẩu.</p>
<p>Sách nêu ba việc một token OAuth làm được: đăng nhập một lần vào nhiều dịch vụ, chia sẻ quyền truy cập giữa các hệ thống, và cho app đọc một phần hồ sơ người dùng mà họ đã đồng ý.</p>

<h2>Bốn vai trò</h2>
${diagram({
  w: 720, h: 300,
  nodes: [
    { id: 'u', label: 'Resource owner', sub: 'người dùng', x: 120, y: 70, w: 150, kind: 'client' },
    { id: 'c', label: 'Client', sub: 'app in ảnh', x: 120, y: 230, w: 150 },
    { id: 'as', label: 'Authorization server', sub: 'accounts.google.com', x: 580, y: 70, w: 190, kind: 'lb' },
    { id: 'rs', label: 'Resource server', sub: 'Photos API', x: 580, y: 230, w: 190, kind: 'store' },
  ],
  edges: [
    { from: 'u', to: 'c', label: 'dùng app' },
    { from: 'u', to: 'as', label: 'đăng nhập, đồng ý' },
    { from: 'c', to: 'as', label: 'đổi code lấy token' },
    { from: 'c', to: 'rs', label: 'gọi API + token' },
    { from: 'rs', to: 'as', label: 'kiểm tra token', dashed: true },
  ],
  caption: 'Hình: Bốn vai trò trong OAuth 2.0. Mật khẩu chỉ được nhập ở authorization server; client chỉ cầm token.',
})}

<h2>Authorization code + PKCE: luồng nên dùng mặc định</h2>
<p>Đây là luồng phổ biến nhất và an toàn nhất cho ứng dụng có người dùng. <b>PKCE</b> (Proof Key for Code Exchange, RFC 7636) thêm một bí mật dùng một lần để kẻ chặn được authorization code cũng không đổi được nó thành token. Ban đầu PKCE dành cho app mobile, nay được khuyến nghị cho mọi loại client.</p>
${seq({
  actors: [
    { id: 'u', label: 'Người dùng', kind: 'client' },
    { id: 'c', label: 'Client app' },
    { id: 'as', label: 'Auth server', kind: 'lb' },
    { id: 'rs', label: 'Resource API', kind: 'store' },
  ],
  msgs: [
    { from: 'u', to: 'c', label: 'bấm Đăng nhập với Google' },
    { note: 'Client tạo code_verifier ngẫu nhiên; code_challenge = SHA256(code_verifier)' },
    { from: 'c', to: 'as', label: '/authorize?code_challenge&state' },
    { from: 'u', to: 'as', label: 'đăng nhập + đồng ý scope' },
    { from: 'as', to: 'c', label: 'redirect_uri?code=xyz&state', dashed: true },
    { from: 'c', to: 'as', label: 'POST /token + code_verifier' },
    { note: 'Auth server băm code_verifier, so với code_challenge đã lưu' },
    { from: 'as', to: 'c', label: 'access token + refresh token', dashed: true, kind: 'good' },
    { from: 'c', to: 'rs', label: 'GET /photos, Bearer token' },
    { from: 'rs', to: 'c', label: 'dữ liệu trong phạm vi scope', dashed: true },
  ],
  caption: 'Hình: Authorization code flow với PKCE. Code đi qua trình duyệt nên có thể bị lộ, nhưng không có code_verifier thì vô dụng.',
})}
<p>Tham số <code>state</code> là giá trị ngẫu nhiên client kiểm tra lại khi nhận redirect, nhằm chống CSRF trong luồng đăng nhập. Server-side app (confidential client) còn gửi kèm <code>client_secret</code> ở bước đổi token; SPA và app mobile không giữ được secret nên dựa vào PKCE.</p>

<h2>Các luồng khác</h2>
${tbl(['Luồng', 'Dùng cho', 'Tình trạng'], [
  ['Authorization code + PKCE', 'Web, SPA, mobile có người dùng', 'Khuyến nghị mặc định'],
  ['Client credentials', 'Máy với máy: cron job, service gọi service, không có người dùng', 'Khuyến nghị cho machine-to-machine'],
  ['Device code', 'Thiết bị khó nhập liệu: smart TV, CLI', 'Khuyến nghị cho thiết bị hạn chế'],
  ['Refresh token', 'Xin access token mới khi token cũ hết hạn', 'Dùng kèm rotation'],
  ['Implicit', 'SPA đời cũ, token trả thẳng trên URL', 'Không còn khuyến nghị (OAuth 2.0 Security BCP, OAuth 2.1)'],
  ['Resource owner password', 'Client nhận thẳng username, mật khẩu', 'Không còn khuyến nghị; phá vỡ mục đích của OAuth'],
])}
<p>Implicit flow trả access token trong fragment của URL, dễ rò qua lịch sử trình duyệt, header Referer hay extension. Từ khi trình duyệt hỗ trợ CORS tốt và có PKCE, SPA nên dùng authorization code + PKCE.</p>

<h2>SSO: đăng nhập một lần</h2>
<p><b>Single Sign-On</b> cho phép người dùng đăng nhập một lần ở một máy chủ xác thực trung tâm (identity provider, IdP) rồi dùng nhiều ứng dụng mà không nhập lại mật khẩu. Ví dụ trong sách: đăng nhập Gmail xong, mở YouTube là đã vào sẵn tài khoản.</p>
${seq({
  actors: [
    { id: 'u', label: 'Người dùng', kind: 'client' },
    { id: 'g', label: 'Gmail' },
    { id: 'sso', label: 'SSO server', kind: 'lb' },
    { id: 'y', label: 'YouTube' },
  ],
  msgs: [
    { from: 'u', to: 'g', label: 'mở Gmail' },
    { from: 'g', to: 'sso', label: 'chưa đăng nhập: chuyển hướng' },
    { from: 'u', to: 'sso', label: 'nhập mật khẩu (một lần)' },
    { note: 'SSO server tạo global session (cookie trên domain của IdP) và cấp token' },
    { from: 'sso', to: 'g', label: 'token / assertion', dashed: true },
    { from: 'g', to: 'u', label: 'hộp thư', dashed: true },
    { from: 'u', to: 'y', label: 'mở YouTube' },
    { from: 'y', to: 'sso', label: 'chuyển hướng xác thực' },
    { from: 'sso', to: 'y', label: 'đã có session: cấp token ngay', dashed: true, kind: 'good' },
    { from: 'y', to: 'u', label: 'vào thẳng, không hỏi mật khẩu', dashed: true },
  ],
  caption: 'Hình: SSO. Lần thứ hai, IdP nhận ra global session nên cấp token cho ứng dụng mới mà không hỏi lại mật khẩu.',
})}
${tbl(['Tiêu chí', 'SAML 2.0', 'OpenID Connect (OIDC)'], [
  ['Ra đời', '2005', '2014'],
  ['Định dạng', 'Assertion XML có chữ ký', 'ID token dạng JWT'],
  ['Nền tảng', 'Chuẩn độc lập', 'Lớp xác thực xây trên OAuth 2.0'],
  ['Phổ biến ở', 'Doanh nghiệp: Okta, ADFS, ứng dụng SaaS nội bộ', 'Web hiện đại, mobile, "Đăng nhập với Google"'],
])}
${tip('<b>Thực tế.</b> Khi bấm "Đăng nhập với Google", app thường dùng OIDC: thêm scope <code>openid</code> vào authorization code flow và nhận về <code>id_token</code> (JWT chứa <code>sub</code>, <code>email</code>, <code>aud</code>) bên cạnh access token. ID token dùng để biết người dùng là ai; access token dùng để gọi API.')}
${note('<b>Sai lầm thường gặp.</b> Dùng access token OAuth như bằng chứng đăng nhập: nhận một access token bất kỳ rồi gọi API lấy email và coi đó là người dùng. Kẻ tấn công có thể lấy token cấp cho app khác của họ rồi đưa vào app của bạn. Hãy dùng ID token của OIDC và kiểm tra <code>aud</code> trùng với client ID của bạn.')}
${interview([
  'OAuth 2.0 là xác thực hay ủy quyền? OIDC bổ sung điều gì?',
  'Giải thích PKCE chống được tấn công nào và vì sao SPA cần nó.',
  'Một cron job cần gọi API nội bộ mỗi giờ. Bạn dùng luồng OAuth nào?',
  'Mô tả luồng SSO khi người dùng đã đăng nhập ứng dụng A rồi mở ứng dụng B.',
])}`,
    keys: [
      'OAuth 2.0 là framework ủy quyền: client nhận access token có scope và hạn dùng, không thấy mật khẩu.',
      'Bốn vai trò: resource owner, client, authorization server, resource server.',
      'Authorization code + PKCE là luồng mặc định cho app có người dùng; client credentials cho máy với máy.',
      'Implicit và password grant không còn được khuyến nghị.',
      'SSO dựa trên global session ở IdP; SAML dùng assertion XML, OIDC dùng ID token JWT trên nền OAuth 2.0.',
    ],
    quiz: [
      { q: 'Service thanh toán gọi service báo cáo lúc 2 giờ sáng, không có người dùng nào tham gia. Luồng OAuth phù hợp?', o: ['Implicit', 'Authorization code', 'Client credentials', 'Resource owner password'], a: 2, why: 'Client credentials dành cho machine-to-machine; client tự xác thực bằng client ID và secret hoặc chứng chỉ.' },
      { q: 'PKCE bảo vệ điều gì?', o: ['Mã hóa access token', 'Ngăn kẻ chặn được authorization code đổi nó thành token', 'Thay thế HTTPS', 'Giảm kích thước token'], a: 1, why: 'Chỉ client tạo ra code_verifier mới chứng minh được mình là bên khởi tạo luồng.' },
      { q: 'Token nào của OIDC dùng để biết người dùng là ai?', o: ['Access token', 'Refresh token', 'ID token', 'Authorization code'], a: 2, why: 'ID token là JWT chứa danh tính người dùng, dành cho client đọc và kiểm tra.' },
      { q: 'Vì sao implicit flow không còn được khuyến nghị?', o: ['Quá chậm', 'Access token trả trên URL nên dễ rò rỉ', 'Không hỗ trợ scope', 'Chỉ dùng được với SAML'], a: 1, why: 'Token trong URL fragment có thể lộ qua lịch sử, Referer hoặc extension trình duyệt.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'api-auth',
    mod: 'bao-mat',
    title: 'Các phương thức xác thực REST API',
    pages: [362],
    min: 10,
    level: 'co-ban',
    lede: 'Mỗi request tới API phải trả lời được câu hỏi "ai đang gọi". Có nhiều cách gửi bằng chứng đó, từ username và mật khẩu đơn giản đến chứng chỉ TLS hai chiều, và mỗi cách hợp với một kiểu client khác nhau.',
    body: `
<h2>Xác thực và phân quyền</h2>
<p><b>Xác thực</b> (authentication) trả lời "bạn là ai". <b>Phân quyền</b> (authorization) trả lời "bạn được làm gì". API trả <code>401 Unauthorized</code> khi thiếu hoặc sai bằng chứng xác thực, và <code>403 Forbidden</code> khi đã biết là ai nhưng không đủ quyền. Bài này tập trung vào phần xác thực, thường được thực hiện tập trung tại API Gateway.</p>
${diagram({
  w: 720, h: 310,
  nodes: [
    { id: 'c', label: 'Client', sub: 'app, partner, CLI', x: 90, y: 150, w: 130, kind: 'client' },
    { id: 'gw', label: 'API Gateway', sub: 'kiểm tra credential', x: 340, y: 150, w: 160, kind: 'lb' },
    { id: 'as', label: 'Auth server', sub: 'JWKS, introspect', x: 340, y: 50, w: 160, kind: 'external' },
    { id: 'ks', label: 'API key store', sub: 'lưu hash của key', x: 340, y: 255, w: 160, kind: 'store' },
    { id: 's', label: 'Service', x: 610, y: 150, w: 130, kind: 'good' },
  ],
  edges: [
    { from: 'c', to: 'gw', label: 'Authorization' },
    { from: 'gw', to: 'as', dashed: true },
    { from: 'gw', to: 'ks', dashed: true },
    { from: 'gw', to: 's', label: 'X-User-Id' },
  ],
  caption: 'Hình: Gateway kiểm tra mọi loại credential tại một chỗ (token qua auth server, API key qua key store) rồi chuyển danh tính đã xác minh cho service phía sau.',
})}

<h2>1. Basic authentication</h2>
<p>Client gửi <code>Authorization: Basic base64(username:password)</code> trong mọi request. Base64 chỉ là encoding, không phải mã hóa, nên bắt buộc phải đi qua HTTPS. Đơn giản, được mọi công cụ hỗ trợ, nhưng mật khẩu thật đi theo mọi request và không có khái niệm hết hạn hay phạm vi. Sách khuyên chỉ dùng cho ứng dụng đơn giản hoặc khi kết nối đã được bảo vệ, ví dụ công cụ nội bộ hay registry riêng.</p>

<h2>2. Token (Bearer) authentication</h2>
<p>Client đăng nhập một lần để nhận token (thường là JWT), sau đó gửi <code>Authorization: Bearer &lt;token&gt;</code>. Mật khẩu không phải gửi lại, token có hạn dùng và có thể mang thông tin quyền. "Bearer" nghĩa là ai cầm token cũng dùng được, nên token phải ngắn hạn và chỉ đi qua HTTPS.</p>

<h2>3. API key</h2>
<p>Server cấp cho mỗi ứng dụng hoặc đối tác một chuỗi ngẫu nhiên dài, client gửi qua header như <code>X-API-Key</code>. API key định danh <b>ứng dụng</b> hơn là người dùng, thường dùng để đo lượng dùng, tính tiền, giới hạn tốc độ. Server nên chỉ lưu hash của key (giống mật khẩu), cho phép đặt nhiều key để xoay vòng (rotation) và không đặt key trong query string vì sẽ lọt vào log.</p>

<h2>4. OAuth 2.0</h2>
<p>Khi ứng dụng bên thứ ba cần truy cập dữ liệu <b>của người dùng</b> với quyền giới hạn, OAuth là lựa chọn chuẩn. Client nhận access token có scope sau khi người dùng đồng ý, và người dùng thu hồi được bất cứ lúc nào. Chi tiết các luồng nằm ở bài OAuth 2.0 và SSO.</p>

<h2>5. HMAC signature</h2>
<p>Client và server cùng giữ một secret nhưng secret không bao giờ đi trên mạng. Mỗi request, client tính chữ ký HMAC trên các thành phần quan trọng (method, path, timestamp, hash của body) rồi gửi kèm. Server tính lại và so sánh. Cách này vừa xác thực bên gửi, vừa đảm bảo request không bị sửa, vừa chống phát lại nhờ timestamp.</p>
${seq({
  actors: [
    { id: 'c', label: 'Client', kind: 'client' },
    { id: 'x', label: 'Kẻ tấn công', kind: 'warn' },
    { id: 's', label: 'API server' },
  ],
  msgs: [
    { note: 'Client: sig = HMAC-SHA256(secret, method + path + timestamp + sha256(body))' },
    { from: 'c', to: 's', label: 'POST /orders + X-Key-Id, X-Timestamp, X-Signature' },
    { note: 'Server lấy secret theo key id, tính lại chữ ký, so sánh constant-time' },
    { from: 's', to: 'c', label: '200: chữ ký khớp, timestamp trong 5 phút', dashed: true, kind: 'good' },
    { from: 'x', to: 's', label: 'sửa body, giữ chữ ký cũ', kind: 'warn' },
    { from: 's', to: 'x', label: '401: chữ ký không khớp', dashed: true },
    { from: 'x', to: 's', label: 'phát lại request sau 1 giờ', kind: 'warn' },
    { from: 's', to: 'x', label: '401: timestamp quá hạn', dashed: true },
  ],
  caption: 'Hình: HMAC signature chống sửa đổi và chống phát lại. AWS Signature Version 4 hoạt động theo nguyên lý này.',
})}

<h2>6. Mutual TLS (mTLS)</h2>
<p>TLS thông thường chỉ client kiểm tra chứng chỉ server. Với <b>mTLS</b>, server cũng yêu cầu client xuất trình chứng chỉ do một CA tin cậy cấp. Danh tính gắn với private key nằm trên máy client nên rất khó đánh cắp qua mạng. mTLS phổ biến cho giao tiếp giữa các service (service mesh như Istio, Linkerd tự cấp và xoay vòng chứng chỉ) và cho API ngân hàng, thanh toán.</p>
${seq({
  actors: [
    { id: 'c', label: 'Service A', kind: 'client' },
    { id: 's', label: 'Service B' },
  ],
  msgs: [
    { from: 'c', to: 's', label: 'ClientHello' },
    { from: 's', to: 'c', label: 'ServerHello + chứng chỉ B + CertificateRequest', dashed: true },
    { note: 'A kiểm tra chứng chỉ B theo CA nội bộ' },
    { from: 'c', to: 's', label: 'chứng chỉ A + CertificateVerify (ký bằng private key A)' },
    { note: 'B kiểm tra chứng chỉ A và chữ ký: biết chắc người gọi là service A' },
    { from: 'c', to: 's', label: 'dữ liệu mã hóa hai chiều', kind: 'good' },
  ],
  caption: 'Hình: mTLS. Cả hai bên cùng xuất trình chứng chỉ trong lúc bắt tay TLS, trước khi gửi byte dữ liệu ứng dụng nào.',
})}

<h2>So sánh</h2>
${tbl(['Phương thức', 'Định danh', 'Độ an toàn', 'Hết hạn / thu hồi', 'Hợp với'], [
  ['Basic', 'Người dùng', 'Thấp, cần HTTPS', 'Phải đổi mật khẩu', 'Công cụ nội bộ đơn giản'],
  ['Bearer token / JWT', 'Người dùng', 'Tốt nếu ngắn hạn', 'Có exp; thu hồi cần cơ chế thêm', 'SPA, mobile, microservices'],
  ['API key', 'Ứng dụng', 'Trung bình', 'Thu hồi thủ công, nên rotation', 'API công khai, đo lượng dùng'],
  ['OAuth 2.0', 'Người dùng + ứng dụng', 'Cao', 'Token có hạn, người dùng thu hồi được', 'Ứng dụng bên thứ ba'],
  ['HMAC', 'Ứng dụng', 'Cao, chống sửa và phát lại', 'Xoay vòng secret', 'Webhook, API thanh toán, AWS'],
  ['mTLS', 'Máy / service', 'Rất cao', 'Chứng chỉ có hạn, CA thu hồi', 'Service với service, B2B tài chính'],
])}
${tip('<b>Thực tế.</b> Stripe ký mọi webhook bằng HMAC-SHA256 trong header <code>Stripe-Signature</code> kèm timestamp; thư viện của Stripe từ chối webhook lệch quá 5 phút để chống phát lại. GitHub làm tương tự với header <code>X-Hub-Signature-256</code>.')}
${note('<b>Sai lầm thường gặp.</b> Nhúng API key bí mật vào app mobile hoặc JavaScript frontend. Ai cũng giải nén được app và lấy key. Key trên client chỉ nên là key công khai có quyền hạn chế; thao tác cần quyền thật phải đi qua backend của bạn.')}
${interview([
  'Khi nào bạn chọn API key thay vì OAuth cho một API công khai?',
  'HMAC signature chống được những tấn công nào mà Bearer token không chống được?',
  'Vì sao so sánh chữ ký phải dùng hàm constant-time?',
  'mTLS giữa các microservice được triển khai và xoay vòng chứng chỉ thế nào trong thực tế?',
])}`,
    keys: [
      '401 là chưa xác thực được; 403 là đã biết là ai nhưng không đủ quyền.',
      'Basic auth chỉ là base64, bắt buộc HTTPS và nên hạn chế dùng.',
      'API key định danh ứng dụng; lưu hash, cho phép rotation, không đặt trong URL.',
      'HMAC ký từng request: chống sửa đổi và phát lại mà không gửi secret đi.',
      'mTLS xác thực hai chiều bằng chứng chỉ, phù hợp cho service với service.',
    ],
    quiz: [
      { q: 'Header Authorization: Basic dXNlcjpwYXNz có an toàn khi gửi qua HTTP thường không?', o: ['Có, vì đã mã hóa base64', 'Không, base64 giải ngược được ngay', 'Có, nếu mật khẩu dài', 'Chỉ an toàn với GET'], a: 1, why: 'Base64 là encoding, không có khóa; ai chặn được gói tin là đọc được mật khẩu.' },
      { q: 'Phương thức nào giúp server phát hiện body request bị sửa trên đường đi, ngay cả khi không dùng TLS?', o: ['API key', 'Basic auth', 'HMAC signature', 'Bearer token'], a: 2, why: 'Chữ ký HMAC tính trên body; sửa body thì chữ ký không còn khớp.' },
      { q: 'API key thường định danh ai?', o: ['Người dùng cuối', 'Ứng dụng hoặc đối tác gọi API', 'Trình duyệt', 'Database'], a: 1, why: 'API key gắn với ứng dụng; muốn biết người dùng nào cần OAuth hoặc token người dùng.' },
      { q: 'Phương thức nào phù hợp nhất để hai microservice trong cluster xác thực lẫn nhau?', o: ['Basic auth', 'mTLS', 'API key trong query string', 'Cookie session'], a: 1, why: 'mTLS cho cả hai bên xuất trình chứng chỉ; service mesh tự động hóa việc cấp và xoay vòng.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'mat-khau-ma-hoa',
    mod: 'bao-mat',
    title: 'Lưu mật khẩu, mã hóa và dữ liệu nhạy cảm',
    pages: [292, 124, 106],
    min: 12,
    level: 'trung-binh',
    lede: 'Rò rỉ database là chuyện nên giả định sẽ xảy ra. Điều quyết định thiệt hại là dữ liệu bị lộ ở dạng nào: mật khẩu gốc, hash yếu dễ bẻ, hay hash chậm có salt mà kẻ tấn công mất hàng trăm năm để thử.',
    body: `
<h2>Vì sao không lưu mật khẩu gốc hay hash thường</h2>
<p>Lưu mật khẩu dạng plain text thì bất kỳ ai có quyền đọc database, kể cả nhân viên nội bộ, đều thấy. Lưu hash trực tiếp, ví dụ <code>SHA-256(password)</code>, cũng chưa đủ. Hai người dùng cùng mật khẩu sẽ có cùng hash, và kẻ tấn công có thể dùng <b>rainbow table</b>, bảng hash tính sẵn cho hàng tỉ mật khẩu phổ biến, để tra ngược gần như tức thì. Hơn nữa SHA-256 được thiết kế để nhanh: một GPU hiện đại thử được hàng tỉ hash mỗi giây.</p>

<h2>Salt và hàm băm chậm</h2>
<p>Theo OWASP, <b>salt</b> là chuỗi ngẫu nhiên, duy nhất cho từng mật khẩu, được ghép vào trước khi băm. Salt không cần giữ bí mật và lưu ngay cạnh hash. Nó khiến rainbow table vô dụng và buộc kẻ tấn công phải bẻ từng tài khoản riêng.</p>
${diagram({
  w: 720, h: 280,
  nodes: [
    { id: 'pw', label: 'Mật khẩu', sub: 'người dùng nhập', x: 100, y: 70, w: 140, kind: 'client' },
    { id: 'sa', label: 'Salt ngẫu nhiên', sub: '16 byte, CSPRNG', x: 100, y: 210, w: 140 },
    { id: 'hf', label: 'Hàm băm chậm', sub: 'Argon2id / bcrypt', x: 360, y: 135, w: 170, kind: 'lb' },
    { id: 'db', label: 'Bảng users', sub: 'salt + hash', x: 610, y: 135, w: 140, kind: 'store' },
  ],
  edges: [
    { from: 'pw', to: 'hf', label: '1' },
    { from: 'sa', to: 'hf', label: '2' },
    { from: 'hf', to: 'db', label: '3' },
    { from: 'sa', to: 'db', dashed: true, curve: 50 },
  ],
  caption: 'Hình: Lưu mật khẩu. (1) mật khẩu và (2) salt riêng cho từng người dùng đi vào hàm băm chậm; (3) lưu hash cùng salt (thường gộp chung một chuỗi).',
})}
<p>Bước còn lại là chọn hàm băm được thiết kế để <b>chậm và tốn bộ nhớ</b> có điều chỉnh được, nhằm làm chậm brute force mà người dùng thật không nhận ra (khoảng vài chục tới vài trăm ms mỗi lần đăng nhập).</p>
${tbl(['Thuật toán', 'Đặc điểm', 'Gợi ý cấu hình (OWASP)'], [
  ['Argon2id', 'Thắng Password Hashing Competition 2015; tốn bộ nhớ nên GPU, ASIC khó tăng tốc', 'Lựa chọn đầu tiên; ví dụ 19 MiB bộ nhớ, 2 vòng, parallelism 1'],
  ['scrypt', 'Cũng tốn bộ nhớ', 'Dùng khi không có Argon2id'],
  ['bcrypt', 'Lâu đời, có ở mọi ngôn ngữ; chỉ dùng 72 byte đầu của mật khẩu', 'Cost factor từ 10 trở lên'],
  ['PBKDF2', 'Được chuẩn FIPS chấp nhận, nhưng không tốn bộ nhớ', '600.000 vòng với HMAC-SHA256'],
  ['MD5, SHA-1, SHA-256 thuần', 'Quá nhanh, không phù hợp cho mật khẩu', 'Không dùng'],
])}

<h2>Kiểm tra mật khẩu khi đăng nhập</h2>
${seq({
  actors: [
    { id: 'u', label: 'Người dùng', kind: 'client' },
    { id: 's', label: 'Server' },
    { id: 'd', label: 'Database', kind: 'store' },
  ],
  msgs: [
    { from: 'u', to: 's', label: 'email + mật khẩu (qua HTTPS)' },
    { from: 's', to: 'd', label: 'lấy salt và hash H2 theo email' },
    { from: 'd', to: 's', label: 'salt, H2, tham số cost', dashed: true },
    { note: 'Server tính H1 = hash(mật khẩu + salt) với cùng tham số' },
    { note: 'So sánh H1 và H2 bằng hàm constant-time' },
    { from: 's', to: 'u', label: 'khớp: tạo session; sai: lỗi chung chung', dashed: true },
  ],
  caption: 'Hình: Xác minh mật khẩu. Server không bao giờ giải ngược hash; nó băm lại mật khẩu vừa nhập và so sánh.',
})}
<p>Thông báo lỗi nên chung chung ("email hoặc mật khẩu không đúng") để không tiết lộ email nào đã đăng ký. Kết hợp rate limit đăng nhập và xác thực hai lớp (2FA) để brute force trực tuyến không khả thi.</p>

<h2>Encoding, encryption và tokenization</h2>
${tbl(['', 'Encoding', 'Encryption', 'Tokenization'], [
  ['Mục đích', 'Đổi định dạng để truyền, lưu', 'Giữ bí mật nội dung', 'Thay dữ liệu nhạy cảm bằng giá trị thay thế'],
  ['Cần khóa', 'Không', 'Có (đối xứng hoặc bất đối xứng)', 'Không; mapping nằm trong token vault'],
  ['Đảo ngược', 'Ai cũng đảo được', 'Chỉ bên có khóa', 'Chỉ qua vault; token không chứa thông tin gốc'],
  ['Ví dụ', 'Base64, URL encoding, UTF-8', 'AES-256-GCM, RSA, TLS', 'Số thẻ 4111... thành tok_9f3a...'],
  ['Dùng khi', 'Gửi binary qua kênh text', 'Dữ liệu khi lưu và khi truyền', 'Thẻ thanh toán, giảm phạm vi PCI DSS'],
])}
${diagram({
  w: 720, h: 300,
  nodes: [
    { id: 'c', label: 'Số thẻ', sub: '4111 1111 ...', x: 90, y: 120, w: 130, kind: 'client' },
    { id: 't', label: 'Tokenization\nservice', x: 330, y: 120, w: 150, h: 56, kind: 'lb' },
    { id: 'v', label: 'Token vault', sub: 'mapping đã mã hóa', x: 330, y: 245, w: 170, kind: 'store' },
    { id: 'm', label: 'Hệ thống đơn hàng', sub: 'chỉ lưu token', x: 590, y: 120, w: 170, kind: 'good' },
  ],
  edges: [
    { from: 'c', to: 't', label: '1' },
    { from: 't', to: 'v', label: '2' },
    { from: 't', to: 'm', label: 'tok_9f3a' },
  ],
  caption: 'Hình: Tokenization. (1) số thẻ thật đi vào dịch vụ tokenization; (2) mapping được cất trong vault; hệ thống phía sau chỉ thấy token nên lộ database cũng không lộ số thẻ.',
})}
<p>Encryption có hai họ. <b>Đối xứng</b> (AES) dùng cùng một khóa để mã hóa và giải mã, nhanh, dùng cho dữ liệu lớn. <b>Bất đối xứng</b> (RSA, ECC) dùng cặp public key và private key, chậm hơn, dùng để trao đổi khóa và ký số. TLS kết hợp cả hai: bất đối xứng để thỏa thuận khóa phiên, đối xứng để mã hóa dữ liệu.</p>

<h2>Quản lý dữ liệu nhạy cảm</h2>
<p>Dữ liệu nhạy cảm gồm thông tin định danh cá nhân (PII), sức khỏe, tài chính, sở hữu trí tuệ, hồ sơ học tập và pháp lý. Luật như GDPR ở châu Âu phạt rất nặng khi vi phạm, nên bảo vệ dữ liệu phải được thiết kế từ đầu. Sách gom thành bốn nhóm biện pháp:</p>
${tbl(['Nhóm', 'Biện pháp'], [
  ['Mã hóa và quản lý khóa', 'TLS khi truyền; mã hóa khi lưu; khóa đặt trong KMS hoặc Vault, không nằm trong code. Khóa quan trọng có thể chia cho nhiều vai trò, cần đủ các phần mới mở được.'],
  ['Giải nhạy dữ liệu', 'Ẩn danh hóa, che (masking) như <code>***-***-1234</code> khi hiển thị, hoặc chia sẻ dữ liệu cho phân tích, nghiên cứu.'],
  ['Quyền tối thiểu', 'RBAC: mỗi vai trò chỉ thấy dữ liệu cần cho công việc.'],
  ['Vòng đời dữ liệu', 'Cấp quyền cho developer khi phát triển, thu hồi khi sản phẩm dữ liệu đã chạy; xóa dữ liệu hết hạn lưu trữ.'],
])}
${tip('<b>Thực tế.</b> AWS KMS, Google Cloud KMS dùng <b>envelope encryption</b>: dữ liệu được mã hóa bằng data key (DEK) sinh riêng, còn DEK được mã hóa bằng master key (KEK) không bao giờ rời KMS. Xoay vòng master key không cần mã hóa lại toàn bộ dữ liệu, chỉ cần mã hóa lại các DEK.')}
${note('<b>Sai lầm thường gặp.</b> Tự viết thuật toán mã hóa hoặc dùng AES ở chế độ ECB, nơi các khối dữ liệu giống nhau cho ra bản mã giống nhau và để lộ cấu trúc. Hãy dùng thư viện đã kiểm chứng với chế độ có xác thực như AES-GCM, và không bao giờ dùng lại nonce với cùng một khóa.')}
${interview([
  'Thiết kế cách lưu mật khẩu cho hệ thống 10 triệu người dùng. Bạn chọn thuật toán và tham số nào?',
  'Salt và pepper khác nhau thế nào? Mỗi cái được lưu ở đâu?',
  'Khi nào dùng tokenization thay vì encryption cho số thẻ tín dụng?',
  'Envelope encryption là gì và giúp ích gì khi xoay vòng khóa?',
])}`,
    keys: [
      'Không lưu mật khẩu gốc; không dùng hash nhanh như SHA-256 thuần cho mật khẩu.',
      'Salt ngẫu nhiên, riêng cho từng người dùng, lưu cạnh hash; nó vô hiệu hóa rainbow table.',
      'Dùng hàm băm chậm có tham số: Argon2id ưu tiên, sau đó scrypt, bcrypt, PBKDF2.',
      'Encoding không bảo mật; encryption cần khóa; tokenization thay dữ liệu bằng token và giữ mapping trong vault.',
      'Khóa đặt trong KMS hoặc Vault, áp dụng quyền tối thiểu, masking và quản lý vòng đời dữ liệu.',
    ],
    quiz: [
      { q: 'Salt có cần được giữ bí mật không?', o: ['Có, phải mã hóa salt', 'Không, salt lưu cạnh hash; tác dụng của nó là làm mỗi hash là duy nhất', 'Có, phải lưu trong KMS', 'Không cần salt nếu dùng SHA-256'], a: 1, why: 'Salt chống precomputation (rainbow table) và hash trùng nhau; nó không phải bí mật.' },
      { q: 'Vì sao bcrypt hoặc Argon2 tốt hơn SHA-256 cho mật khẩu?', o: ['Cho ra hash ngắn hơn', 'Được thiết kế chậm, chỉnh được độ tốn kém để làm chậm brute force', 'Có thể giải ngược khi cần', 'Không cần salt'], a: 1, why: 'Hàm băm mật khẩu cố ý chậm (và Argon2 tốn bộ nhớ), làm mỗi lần thử của kẻ tấn công rất đắt.' },
      { q: 'Base64 thuộc loại nào?', o: ['Encryption đối xứng', 'Encoding', 'Hashing', 'Tokenization'], a: 1, why: 'Base64 đổi định dạng, không cần khóa, ai cũng giải được.' },
      { q: 'Tokenization giúp gì cho tuân thủ PCI DSS?', o: ['Tăng tốc xử lý thanh toán', 'Hệ thống chỉ lưu token nên phần lớn hạ tầng nằm ngoài phạm vi kiểm tra', 'Thay thế HTTPS', 'Mã hóa nhanh hơn AES'], a: 1, why: 'Token không chứa dữ liệu thẻ; chỉ vault và dịch vụ tokenization phải đạt chuẩn nghiêm ngặt.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'web-security',
    mod: 'bao-mat',
    title: 'Bảo mật web và hệ thống',
    pages: [249, 36, 294, 185, 196, 64, 162],
    min: 13,
    level: 'trung-binh',
    lede: 'Phần lớn sự cố bảo mật đến từ những lỗi quen thuộc: tin input người dùng, cấu hình sai, quên vá. Thuật toán mã hóa bị bẻ là chuyện hiếm. Bài này đi từ các lỗ hổng web phổ biến tới cách đưa bảo mật vào toàn bộ quy trình phát triển.',
    body: `
<h2>Nền tảng: bộ ba CIA</h2>
<p>Mọi biện pháp bảo mật đều bảo vệ ít nhất một trong ba thuộc tính. <b>Confidentiality</b> (bí mật): chỉ người được phép mới đọc được dữ liệu. <b>Integrity</b> (toàn vẹn): dữ liệu không bị sửa trái phép. <b>Availability</b> (sẵn sàng): hệ thống phục vụ được khi cần. Mã hóa bảo vệ C, chữ ký và hash bảo vệ I, chống DDoS và dự phòng bảo vệ A. Các mối đe dọa phổ biến gồm malware, phishing, tấn công từ chối dịch vụ và lỗ hổng ứng dụng; lớp phòng thủ cơ bản là firewall, phần mềm diệt malware và mã hóa.</p>

<h2>Cross-Site Scripting (XSS)</h2>
<p>XSS xảy ra khi ứng dụng đưa dữ liệu người dùng vào trang HTML mà không xử lý, khiến trình duyệt của nạn nhân chạy script của kẻ tấn công. Script đó chạy với quyền của trang, nên đọc được cookie không có HttpOnly, token trong localStorage, hoặc thực hiện thao tác thay người dùng.</p>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'a', label: 'Kẻ tấn công', x: 100, y: 70, w: 130, kind: 'warn' },
    { id: 'w', label: 'Web app', sub: 'không escape output', x: 360, y: 70, w: 170 },
    { id: 'd', label: 'Database', sub: 'comment có <script>', x: 610, y: 70, w: 170, kind: 'store' },
    { id: 'v', label: 'Nạn nhân', sub: 'trình duyệt', x: 360, y: 220, w: 150, kind: 'client' },
    { id: 'e', label: 'Server kẻ gian', x: 610, y: 220, w: 150, kind: 'external' },
  ],
  edges: [
    { from: 'a', to: 'w', label: '1' },
    { from: 'w', to: 'd', label: '2', both: true },
    { from: 'w', to: 'v', label: '3' },
    { from: 'v', to: 'e', label: '4', kind: 'warn' },
  ],
  caption: 'Hình: Stored XSS. (1) kẻ tấn công gửi comment chứa script; (2) app lưu rồi đọc lại; (3) trang hiển thị cho nạn nhân kèm script; (4) script gửi cookie hoặc token về server kẻ gian.',
})}
${tbl(['Loại', 'Script nằm ở đâu', 'Ví dụ'], [
  ['Stored (lưu trữ)', 'Trong database, ảnh hưởng mọi người xem', 'Comment, tên hiển thị, bài đăng'],
  ['Reflected (phản xạ)', 'Trong request, server phản hồi lại ngay', 'Link <code>/search?q=&lt;script&gt;...</code> gửi qua email'],
  ['DOM-based', 'Phía client, JavaScript tự chèn dữ liệu không an toàn', '<code>el.innerHTML = location.hash</code>'],
])}
<p>Phòng chống: <b>escape output</b> theo đúng ngữ cảnh (HTML, thuộc tính, JavaScript, URL), dùng framework tự escape như React hay các template engine hiện đại, <b>validate input</b> theo whitelist, đặt <b>Content Security Policy</b> (<code>Content-Security-Policy: script-src 'self'</code>) để trình duyệt từ chối script lạ, và gắn <code>HttpOnly</code> cho cookie phiên.</p>

<h2>CSRF và SQL injection</h2>
${seq({
  actors: [
    { id: 'b', label: 'Trình duyệt', kind: 'client' },
    { id: 'bank', label: 'bank.com' },
    { id: 'evil', label: 'evil.com', kind: 'warn' },
  ],
  msgs: [
    { from: 'b', to: 'bank', label: 'đăng nhập, nhận cookie phiên' },
    { from: 'b', to: 'evil', label: 'mở link trong email lạ' },
    { from: 'evil', to: 'b', label: 'trang có form ẩn tự submit', dashed: true, kind: 'warn' },
    { from: 'b', to: 'bank', label: 'POST /transfer, cookie gửi tự động', kind: 'warn' },
    { note: 'Phòng: SameSite=Lax/Strict, CSRF token, kiểm tra header Origin' },
    { from: 'bank', to: 'b', label: '403: thiếu CSRF token hợp lệ', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: CSRF lợi dụng việc trình duyệt tự gửi cookie. Kẻ tấn công không đọc được phản hồi nhưng vẫn gây ra hành động.',
})}
<p><b>SQL injection</b> xảy ra khi input được nối thẳng vào câu SQL. Với <code>"SELECT * FROM users WHERE email = '" + email + "'"</code>, chỉ cần nhập <code>' OR '1'='1</code> là lấy được toàn bộ bảng. Cách sửa dứt điểm là <b>parameterized query</b> (prepared statement), nơi dữ liệu luôn được gửi tách khỏi câu lệnh; ORM làm điều này mặc định. Thêm vào đó, tài khoản database của ứng dụng chỉ nên có quyền tối thiểu.</p>

<h2>Firewall: 6 cách dùng</h2>
${tbl(['Kiểu luật', 'Ví dụ'], [
  ['Theo port', 'Chỉ mở 80 và 443 cho web'],
  ['Theo IP', 'Whitelist IP văn phòng, chặn IP độc hại đã biết'],
  ['Theo giao thức', 'Chỉ cho TCP tới port 22 (SSH), chặn ICMP từ ngoài'],
  ['Theo thời gian', 'Luật khác nhau trong và ngoài giờ làm việc'],
  ['Stateful inspection', 'Chỉ cho gói tin thuộc kết nối đã thiết lập từ bên trong đi vào'],
  ['Theo ứng dụng', 'Chặn BitTorrent, giới hạn ứng dụng chat; WAF lọc request HTTP độc hại'],
])}

<h2>Thiết kế hệ thống an toàn</h2>
<p>Sách đưa ra một checklist 12 mảng khi thiết kế: xác thực, phân quyền, mã hóa, quản lý lỗ hổng, audit và tuân thủ, bảo mật mạng, bảo mật thiết bị đầu cuối, ứng phó sự cố, bảo mật container, bảo mật API, quản lý nhà cung cấp bên thứ ba và khôi phục sau thảm họa. Ba nguyên tắc xuyên suốt: <b>defense in depth</b> (nhiều lớp phòng thủ), <b>least privilege</b> (quyền tối thiểu) và <b>secure by default</b> (mặc định an toàn).</p>

<h2>DevSecOps: đưa bảo mật vào pipeline</h2>
<p><b>DevSecOps</b> mở rộng DevOps bằng cách tích hợp bảo mật vào mọi giai đoạn thay vì chỉ kiểm tra trước khi release. Mười khái niệm chính theo sách: kiểm tra bảo mật tự động, giám sát liên tục, tự động hóa CI/CD, Infrastructure as Code, bảo mật container, quản lý secret, threat modeling, tích hợp QA, cộng tác giữa các đội và quản lý lỗ hổng.</p>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'c', label: 'Commit', sub: 'quét secret', x: 85, y: 80, w: 130 },
    { id: 'b', label: 'Build', sub: 'SAST, SCA', x: 260, y: 80, w: 130 },
    { id: 't', label: 'Test', sub: 'DAST', x: 440, y: 80, w: 130 },
    { id: 'd', label: 'Deploy', sub: 'IaC + image scan', x: 620, y: 80, w: 150 },
    { id: 'p', label: 'Production', sub: 'WAF, runtime', x: 620, y: 220, w: 150, kind: 'good' },
    { id: 'm', label: 'Giám sát', sub: 'SIEM, cảnh báo', x: 330, y: 220, w: 150 },
  ],
  edges: [
    { from: 'c', to: 'b' },
    { from: 'b', to: 't' },
    { from: 't', to: 'd' },
    { from: 'd', to: 'p' },
    { from: 'p', to: 'm' },
    { from: 'm', to: 'c', label: 'phản hồi', dashed: true },
  ],
  caption: 'Hình: Pipeline DevSecOps. SAST quét mã nguồn, SCA quét thư viện phụ thuộc, DAST tấn công thử ứng dụng đang chạy; phát hiện ở production quay lại thành việc cần sửa.',
})}

<h2>Bảo mật trên cloud và lộ trình học</h2>
<p>Mỗi nhà cung cấp cloud đặt tên dịch vụ bảo mật khác nhau, nên sách có một bảng tra cứu tương đương. Một số cặp hay dùng:</p>
${tbl(['Nhu cầu', 'AWS', 'Azure', 'Google Cloud'], [
  ['Danh tính và quyền', 'IAM', 'Microsoft Entra ID', 'Cloud IAM'],
  ['Quản lý khóa', 'KMS', 'Key Vault', 'Cloud KMS'],
  ['Quản lý secret', 'Secrets Manager', 'Key Vault', 'Secret Manager'],
  ['WAF, chống DDoS', 'AWS WAF, Shield', 'Azure WAF, DDoS Protection', 'Cloud Armor'],
  ['Phát hiện mối đe dọa', 'GuardDuty', 'Defender for Cloud', 'Security Command Center'],
  ['Nhật ký audit', 'CloudTrail', 'Activity Log', 'Cloud Audit Logs'],
])}
<p>Với người muốn đi sâu, lộ trình học an ninh mạng trong sách gồm bảy mảng: kiến trúc bảo mật, framework và tiêu chuẩn (ISO 27001, NIST), bảo mật ứng dụng, đánh giá rủi ro, quản trị rủi ro doanh nghiệp, threat intelligence và vận hành bảo mật (SOC). Với kỹ sư backend, điểm khởi đầu thực tế nhất là OWASP Top 10.</p>
${tip('<b>Thực tế.</b> Vụ rò rỉ Equifax năm 2017 làm lộ dữ liệu khoảng 147 triệu người bắt nguồn từ một lỗ hổng Apache Struts đã có bản vá từ hai tháng trước nhưng chưa được cập nhật. Một bước SCA trong pipeline cùng quy trình vá định kỳ đã có thể chặn được.')}
${note('<b>Sai lầm thường gặp.</b> Coi bảo mật là việc của đội security ở cuối dự án. Khi đó lỗ hổng được phát hiện lúc sửa đắt nhất. Đưa quét tự động vào CI, review threat model khi thiết kế tính năng mới, và không bao giờ commit secret vào Git, kể cả repo private.')}
${interview([
  'Phân biệt stored, reflected và DOM-based XSS. Content Security Policy giúp gì?',
  'Cookie SameSite=Lax chống CSRF thế nào? Trường hợp nào vẫn cần CSRF token?',
  'Vì sao parameterized query chống được SQL injection còn escape thủ công thì dễ sót?',
  'Bạn sẽ thêm những bước bảo mật nào vào pipeline CI/CD hiện tại của đội?',
])}`,
    keys: [
      'Bộ ba CIA: bí mật, toàn vẹn, sẵn sàng; mọi biện pháp bảo vệ ít nhất một thuộc tính.',
      'XSS: escape output theo ngữ cảnh, CSP, cookie HttpOnly. CSRF: SameSite, CSRF token, kiểm tra Origin.',
      'SQL injection được chặn dứt điểm bằng parameterized query và quyền database tối thiểu.',
      'Firewall lọc theo port, IP, giao thức, thời gian, trạng thái kết nối và ứng dụng.',
      'DevSecOps đưa SAST, SCA, DAST, quét IaC, container và quản lý secret vào pipeline.',
    ],
    quiz: [
      { q: 'Kẻ tấn công lưu script vào phần bình luận và mọi người xem bài đều bị chạy script. Đây là loại gì?', o: ['Reflected XSS', 'Stored XSS', 'CSRF', 'SQL injection'], a: 1, why: 'Script được lưu trong database và phát cho mọi người xem, đặc trưng của stored XSS.' },
      { q: 'Biện pháp nào chặn dứt điểm SQL injection?', o: ['Giấu thông báo lỗi', 'Parameterized query', 'Dùng HTTPS', 'Mã hóa database'], a: 1, why: 'Dữ liệu được gửi tách khỏi câu lệnh nên không bao giờ được hiểu là SQL.' },
      { q: 'CSRF lợi dụng điều gì?', o: ['Trình duyệt tự gửi cookie kèm request tới domain đích', 'Mật khẩu yếu', 'Database không có index', 'Server thiếu RAM'], a: 0, why: 'Request giả mạo từ trang khác vẫn mang cookie phiên hợp lệ nếu không có SameSite hoặc CSRF token.' },
      { q: 'Công cụ quét thư viện phụ thuộc có lỗ hổng đã biết thuộc loại nào?', o: ['DAST', 'SAST', 'SCA', 'WAF'], a: 2, why: 'SCA (Software Composition Analysis) đối chiếu phiên bản thư viện với cơ sở dữ liệu CVE.' },
    ],
  },
];
