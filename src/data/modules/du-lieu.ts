import type { Lesson } from '../../types';
import { cols, diagram, interview, note, seq, tbl, tip } from '../helpers';

export const lessons: Lesson[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'acid-cap',
    mod: 'du-lieu',
    title: 'ACID, CAP và BASE',
    pages: [110, 112],
    min: 11,
    level: 'trung-binh',
    lede: 'Ba bộ chữ viết tắt này mô tả ba góc nhìn khác nhau về tính đúng đắn của dữ liệu. Hiểu sai chúng, đặc biệt là hai chữ "C", dẫn tới những lựa chọn database sai ngay từ đầu.',
    body: `
<h2>Ba câu hỏi khác nhau</h2>
<p>ACID trả lời câu hỏi: một <b>transaction</b> (nhóm thao tác đọc ghi) trên một database được đảm bảo những gì. CAP trả lời câu hỏi: một hệ dữ liệu phân tán nhiều node hành xử thế nào khi mạng giữa các node bị đứt. BASE là triết lý thiết kế của nhiều hệ NoSQL, chấp nhận nới lỏng tính nhất quán để đổi lấy khả năng phục vụ liên tục.</p>
<p>Ba khái niệm hay bị trộn lẫn vì cùng nói về "consistency". Bài này tách chúng ra và chỉ ra giới hạn của từng cái.</p>

<h2>ACID: bốn cam kết của một transaction</h2>
${tbl(['Chữ', 'Ý nghĩa', 'Ví dụ khi vi phạm'], [
  ['<b>A</b>tomicity', 'Tất cả hoặc không gì cả. Các lệnh ghi trong transaction không thể bị tách nhỏ; lỗi giữa chừng thì rollback toàn bộ.', 'Trừ tiền tài khoản A thành công nhưng cộng vào B thất bại, tiền biến mất.'],
  ['<b>C</b>onsistency', 'Giữ các bất biến (invariant) của database: khóa ngoại, <code>CHECK</code>, <code>UNIQUE</code>, quy tắc nghiệp vụ. Dữ liệu sau transaction phải hợp lệ.', 'Số dư âm dù có ràng buộc <code>balance &gt;= 0</code>.'],
  ['<b>I</b>solation', 'Các transaction chạy đồng thời không giẫm lên nhau. Mức chặt nhất là serializable: mỗi transaction chạy như thể chỉ có mình nó.', 'Hai người cùng mua chiếc vé cuối cùng và cả hai đều thành công.'],
  ['<b>D</b>urability', 'Đã commit thì không mất, kể cả khi server sập. Trong hệ phân tán, nghĩa là dữ liệu đã được sao chép sang node khác.', 'Báo "đặt hàng thành công" rồi mất đơn sau khi mất điện.'],
])}
${seq({
  actors: [
    { id: 'app', label: 'Ứng dụng', kind: 'client' },
    { id: 'db', label: 'Database', kind: 'store' },
    { id: 'log', label: 'WAL / redo log', kind: 'store' },
  ],
  msgs: [
    { from: 'app', to: 'db', label: 'BEGIN' },
    { from: 'app', to: 'db', label: 'UPDATE A: -100' },
    { from: 'db', to: 'log', label: 'ghi bản ghi thay đổi' },
    { from: 'app', to: 'db', label: 'UPDATE B: +100 → lỗi', kind: 'warn' },
    { note: 'Atomicity: bỏ toàn bộ thay đổi của transaction' },
    { from: 'app', to: 'db', label: 'ROLLBACK' },
    { from: 'db', to: 'app', label: 'A và B giữ nguyên số dư', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Transaction chuyển tiền bị lỗi giữa chừng. Database dùng log để hoàn tác phần đã làm, nên không có trạng thái "nửa vời".',
})}
<p>Trong thực tế, serializable rất tốn kém nên đa số database mặc định dùng mức isolation lỏng hơn (PostgreSQL mặc định là Read Committed). Chữ "I" vì vậy thường được thực thi một phần, và bạn cần biết mình đang ở mức nào. Bài "Lock, isolation level và deadlock" đi sâu vào chuyện này.</p>

<h2>Hai chữ C không giống nhau</h2>
${cols([
  { title: 'C trong ACID', body: '<p>Dữ liệu tuân thủ mọi ràng buộc đã khai báo. Đây là thuộc tính của <b>ứng dụng cộng database</b>: database kiểm tra ràng buộc, còn ứng dụng phải viết transaction đúng logic.</p>' },
  { title: 'C trong CAP', body: '<p>Mọi lần đọc nhận được bản ghi mới nhất hoặc nhận lỗi. Đây là <b>linearizability</b>: cả cụm nhiều node hành xử như thể chỉ có một bản dữ liệu duy nhất.</p>' },
])}

<h2>CAP: khi mạng giữa các node bị đứt</h2>
<p>Định lý CAP phát biểu rằng một kho dữ liệu phân tán chỉ có thể đảm bảo hai trong ba tính chất:</p>
<ul>
<li><b>Consistency:</b> mọi lần đọc trả về bản ghi mới nhất hoặc lỗi.</li>
<li><b>Availability:</b> mọi request đến node còn sống đều nhận được phản hồi.</li>
<li><b>Partition tolerance:</b> hệ thống vẫn chạy khi mạng giữa các node bị chia cắt.</li>
</ul>
${diagram({
  w: 720, h: 290,
  groups: [
    { x: 150, y: 92, w: 180, h: 100, label: 'Region A' },
    { x: 390, y: 92, w: 180, h: 100, label: 'Region B' },
  ],
  nodes: [
    { id: 'cw', label: 'Client ghi x=2', x: 240, y: 45, w: 140, kind: 'client' },
    { id: 'cr', label: 'Client đọc x', x: 480, y: 45, w: 140, kind: 'client' },
    { id: 'n1', label: 'Node 1', sub: 'x = 2', x: 240, y: 150, kind: 'store' },
    { id: 'n2', label: 'Node 2', sub: 'x = 1 (cũ)', x: 480, y: 150, kind: 'store' },
    { id: 'cp', label: 'Trả lỗi\n(chọn C)', x: 380, y: 245, w: 140, h: 52, kind: 'warn' },
    { id: 'ap', label: 'Trả x = 1\n(chọn A)', x: 600, y: 245, w: 140, h: 52, kind: 'good' },
  ],
  edges: [
    { from: 'cw', to: 'n1' },
    { from: 'cr', to: 'n2' },
    { from: 'n1', to: 'n2', label: 'mạng đứt', kind: 'warn', dashed: true },
    { from: 'n2', to: 'cp', kind: 'muted' },
    { from: 'n2', to: 'ap', kind: 'muted' },
  ],
  caption: 'Hình: Khi có partition, Node 2 không nhận được giá trị mới. Nó chỉ có hai lựa chọn: từ chối trả lời (giữ C) hoặc trả dữ liệu cũ (giữ A).',
})}
<p>Sách nhấn mạnh rằng CAP bị phê bình là quá hẹp và không nên dùng để phân loại database. Trong hệ phân tán, lỗi mạng chắc chắn sẽ xảy ra, nên P không phải là thứ bạn được chọn bỏ. Câu hỏi thực sự chỉ xuất hiện <b>trong lúc có partition</b>: hy sinh C hay hy sinh A. Martin Kleppmann, trong bài "Please stop calling databases CP or AP", còn chỉ ra rằng nhiều database không thỏa trọn vẹn C hay A theo định nghĩa của định lý, nên nhãn "CP" hay "AP" gần như vô nghĩa. Nên hỏi cụ thể: với cấu hình này, khi một node mất kết nối thì lệnh đọc và ghi hành xử ra sao.</p>

<h2>PACELC: bổ sung cho lúc mạng bình thường</h2>
<p>CAP không nói gì về 99,9% thời gian khi mạng ổn định. PACELC lấp khoảng trống đó: nếu có Partition thì chọn A hoặc C; Else (bình thường) thì chọn Latency hoặc Consistency. Muốn mọi lần đọc đều mới nhất, mỗi lần ghi phải chờ nhiều replica xác nhận, và latency tăng lên. Cassandra và DynamoDB thường được xếp vào nhóm PA/EL; HBase thuộc nhóm PC/EC.</p>

<h2>BASE: triết lý của nhiều hệ NoSQL</h2>
<p>Mô hình ACID của database quan hệ quá chặt với các hệ NoSQL cần scale ra hàng trăm node. BASE linh hoạt hơn và ưu tiên availability:</p>
${tbl(['Tiêu chí', 'ACID', 'BASE'], [
  ['Viết tắt', 'Atomicity, Consistency, Isolation, Durability', '<b>B</b>asically <b>A</b>vailable, <b>S</b>oft state, <b>E</b>ventual consistency'],
  ['Ưu tiên', 'Đúng đắn tuyệt đối', 'Luôn phục vụ được'],
  ['Đọc ngay sau ghi', 'Thấy giá trị mới', 'Có thể thấy giá trị cũ trong một khoảng ngắn'],
  ['Hợp với', 'Thanh toán, tồn kho, sổ cái', 'Feed, lượt like, log, giỏ hàng chịu được sai lệch tạm thời'],
  ['Ví dụ', 'PostgreSQL, MySQL', 'Cassandra, DynamoDB (mặc định)'],
])}
${tip('<b>Thực tế.</b> DynamoDB mặc định dùng eventually consistent read, rẻ bằng một nửa strongly consistent read. Khi cần đọc giá trị mới nhất (ví dụ kiểm tra số dư trước khi trừ), ứng dụng truyền <code>ConsistentRead=true</code> cho riêng lệnh đó. Một hệ thống có thể dùng cả hai mức nhất quán, chọn theo từng câu truy vấn.')}
${note('<b>Sai lầm thường gặp.</b> Chọn NoSQL "vì CAP bắt phải bỏ consistency", hoặc tin rằng database quan hệ "là CA". Một PostgreSQL đơn node không phân tán nên CAP không áp dụng; khi thêm replica async, nó cũng có thể trả dữ liệu cũ. Hãy hỏi cụ thể về hành vi khi mất kết nối và độ trễ replication.')}

<h2>Bonus: SOLID và KISS</h2>
<p>Sách gộp thêm hai nguyên tắc thiết kế phần mềm hay gặp trong phỏng vấn:</p>
${tbl(['Nguyên tắc', 'Ý chính'], [
  ['SRP', 'Mỗi đơn vị code chỉ có một trách nhiệm.'],
  ['OCP', 'Mở để mở rộng, đóng để sửa đổi.'],
  ['LSP', 'Lớp con phải thay thế được lớp cha mà không làm sai chương trình.'],
  ['ISP', 'Tách nhiều interface nhỏ theo trách nhiệm thay vì một interface lớn.'],
  ['DIP', 'Phụ thuộc vào abstraction để tách rời các thành phần.'],
  ['KISS', '"Keep it simple, stupid": hệ thống đơn giản thường chạy tốt nhất. Nguyên tắc được Hải quân Mỹ ghi nhận năm 1960.'],
])}
${interview([
  'Phân biệt chữ C trong ACID và chữ C trong CAP. Cho ví dụ một hệ thống vi phạm cái này mà không vi phạm cái kia.',
  'Vì sao nói "chọn 2 trong 3" của CAP là cách hiểu sai? PACELC bổ sung điều gì?',
  'Bạn thiết kế hệ thống đếm lượt xem video và hệ thống trừ tiền ví. Mỗi cái nên ưu tiên ACID hay BASE, vì sao?',
])}`,
    keys: [
      'ACID là cam kết của một transaction: tất cả hoặc không, giữ ràng buộc, cô lập, bền vững.',
      'C trong ACID là giữ bất biến dữ liệu; C trong CAP là mọi lần đọc thấy bản ghi mới nhất.',
      'Partition chắc chắn xảy ra, nên CAP thực chất là chọn C hay A trong lúc mạng đứt; đừng dán nhãn database là CP hay AP.',
      'PACELC: khi mạng bình thường vẫn phải đánh đổi giữa latency và consistency.',
      'BASE chấp nhận nhất quán sau một khoảng thời gian để luôn phục vụ được.',
    ],
    quiz: [
      { q: 'Chuyển tiền: trừ tài khoản A xong thì server sập trước khi cộng vào B. Tính chất nào đảm bảo tiền không biến mất?', o: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], a: 0, why: 'Atomicity: transaction chưa hoàn tất thì bị rollback toàn bộ, nên lệnh trừ tiền A cũng bị hoàn tác.' },
      { q: 'Trong lúc mạng giữa hai region bị đứt, node ở region B trả về giá trị cũ thay vì báo lỗi. Hệ thống đang ưu tiên gì?', o: ['Consistency', 'Availability', 'Durability', 'Isolation'], a: 1, why: 'Trả lời bằng dữ liệu có thể cũ thay vì từ chối là chọn availability trong lúc có partition.' },
      { q: 'PACELC bổ sung điều gì cho CAP?', o: ['Thêm tính chất Durability', 'Đánh đổi latency và consistency khi mạng bình thường', 'Cách loại bỏ partition', 'Quy tắc chọn shard key'], a: 1, why: 'Else (không có partition) vẫn phải chọn giữa Latency thấp và Consistency mạnh, vì đồng bộ nhiều replica tốn thời gian.' },
      { q: 'Chữ "E" trong BASE nghĩa là gì?', o: ['Exclusive lock', 'Eventual consistency', 'Event sourcing', 'Elastic scaling'], a: 1, why: 'BASE chấp nhận các replica lệch nhau tạm thời và sẽ hội tụ về cùng giá trị sau một khoảng thời gian.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'loai-db',
    mod: 'du-lieu',
    title: 'Các loại database và cách chọn',
    pages: [63, 130, 266, 343],
    min: 11,
    level: 'co-ban',
    lede: 'Không có database tốt nhất cho mọi việc. Chọn đúng loại database theo hình dạng dữ liệu và kiểu truy vấn giúp tránh được những cuộc migration đau đớn về sau.',
    body: `
<h2>Chọn database bắt đầu từ câu truy vấn</h2>
<p>Câu hỏi đúng là "dữ liệu của tôi trông như thế nào và tôi sẽ hỏi nó những câu gì", thay vì "database nào đang hot". Một bảng đơn hàng cần transaction và join; một chuỗi số đo nhiệt độ cần ghi liên tục và tổng hợp theo thời gian; một mạng bạn bè cần duyệt quan hệ nhiều tầng. Mỗi kiểu truy vấn hợp với một cách tổ chức dữ liệu khác nhau trên đĩa.</p>

<h2>8 loại database phổ biến</h2>
${tbl(['Loại', 'Tổ chức dữ liệu', 'Ví dụ', 'Hợp với'], [
  ['<b>Relational</b>', 'Bảng, hàng, cột; khóa và join; SQL', 'PostgreSQL, MySQL', 'Đơn hàng, tài chính, mọi thứ cần transaction'],
  ['<b>Key-value</b>', 'Một key trỏ tới một value, tra cứu O(1)', 'Redis, DynamoDB', 'Session, cache, giỏ hàng, rate limit'],
  ['<b>Document</b>', 'Tài liệu JSON/BSON lồng nhau, schema linh hoạt', 'MongoDB, Couchbase', 'Catalog sản phẩm, CMS, hồ sơ người dùng'],
  ['<b>Wide-column</b>', 'Partition key + clustering key, mỗi hàng có thể có cột khác nhau', 'Cassandra, HBase, ScyllaDB', 'Ghi cực lớn: tin nhắn, log, IoT'],
  ['<b>Graph</b>', 'Đỉnh và cạnh, duyệt quan hệ', 'Neo4j', 'Mạng xã hội, gợi ý, phát hiện gian lận'],
  ['<b>Time-series</b>', 'Điểm dữ liệu gắn timestamp, nén theo thời gian', 'InfluxDB, TimescaleDB', 'Metrics, giá chứng khoán, cảm biến'],
  ['<b>Vector</b>', 'Vector embedding, tìm láng giềng gần nhất', 'Milvus, Pinecone, pgvector', 'Tìm kiếm ngữ nghĩa, RAG cho LLM'],
  ['<b>Search</b>', 'Inverted index trên văn bản', 'Elasticsearch, OpenSearch', 'Full-text search, phân tích log'],
])}

<h2>Cây quyết định đơn giản</h2>
${diagram({
  w: 720, h: 430,
  nodes: [
    { id: 'q1', label: 'Cần transaction,\njoin phức tạp?', x: 95, y: 220, w: 140, h: 60, kind: 'lb' },
    { id: 'rel', label: 'Relational', sub: 'PostgreSQL, MySQL', x: 290, y: 70, w: 150, kind: 'good' },
    { id: 'q2', label: 'Truy vấn chính\nlà gì?', x: 300, y: 220, w: 140, h: 60, kind: 'lb' },
    { id: 'kv', label: 'Key-value', sub: 'Redis, DynamoDB', x: 590, y: 50, w: 150 },
    { id: 'doc', label: 'Document', sub: 'MongoDB', x: 590, y: 135, w: 150 },
    { id: 'gr', label: 'Graph', sub: 'Neo4j', x: 590, y: 220, w: 150 },
    { id: 'ts', label: 'Time-series', sub: 'InfluxDB', x: 590, y: 305, w: 150 },
    { id: 'vs', label: 'Vector / Search', sub: 'Elasticsearch', x: 590, y: 390, w: 150 },
  ],
  edges: [
    { from: 'q1', to: 'rel', label: 'có', kind: 'good' },
    { from: 'q1', to: 'q2', label: 'không' },
    { from: 'q2', to: 'kv', label: 'tra theo key' },
    { from: 'q2', to: 'doc', label: 'JSON linh hoạt' },
    { from: 'q2', to: 'gr', label: 'quan hệ nhiều tầng' },
    { from: 'q2', to: 'ts', label: 'theo thời gian' },
    { from: 'q2', to: 'vs', label: 'tương tự, full-text' },
  ],
  caption: 'Hình: Cây quyết định thô. Khi phân vân, bắt đầu với database quan hệ rồi thêm database chuyên dụng cho đúng phần cần nó.',
})}
<p>Cây này chỉ là điểm xuất phát. Thêm hai yếu tố nữa: <b>quy mô ghi</b> (hàng trăm nghìn lần ghi mỗi giây thì cân nhắc wide-column) và <b>đội ngũ</b> (một database đội đã vận hành thành thạo thường tốt hơn một database "đúng lý thuyết" mà không ai biết debug).</p>

<h2>6 mô hình dữ liệu kinh điển</h2>
<p>Sách liệt kê 6 mô hình dữ liệu, đi từ đơn giản đến chuyên biệt:</p>
${tbl(['Mô hình', 'Cấu trúc', 'Điểm mạnh và yếu'], [
  ['Flat', 'Một bảng duy nhất, giống bảng tính', 'Dễ hiểu; không thể hiện được quan hệ phức tạp'],
  ['Hierarchical', 'Cây: mỗi bản ghi có một cha, nhiều con', 'Nhanh với quan hệ cha con rõ ràng; khó với quan hệ nhiều-nhiều'],
  ['Network', 'Đồ thị: bản ghi có nhiều cha và nhiều con', 'Xử lý được nhiều-nhiều; phức tạp khi truy vấn'],
  ['Relational', 'Bảng và khóa, do E.F. Codd đề xuất năm 1970', 'Linh hoạt, SQL đơn giản, chuẩn hóa tránh dư thừa; phổ biến nhất'],
  ['Star schema', 'Bảng fact ở giữa, các bảng dimension xung quanh', 'Tối ưu cho phân tích OLAP, ít join'],
  ['Snowflake', 'Star schema nhưng dimension được chuẩn hóa thành nhiều bảng', 'Tiết kiệm lưu trữ; nhiều join hơn'],
])}
${diagram({
  w: 720, h: 270,
  nodes: [
    { id: 'f', label: 'fact_sales', sub: 'số lượng, doanh thu', x: 360, y: 135, w: 170, kind: 'store' },
    { id: 't', label: 'dim_time', sub: 'ngày, tháng, quý', x: 130, y: 60, w: 150 },
    { id: 'p', label: 'dim_product', sub: 'tên, danh mục', x: 590, y: 60, w: 150 },
    { id: 's', label: 'dim_store', sub: 'cửa hàng, vùng', x: 130, y: 210, w: 150 },
    { id: 'c', label: 'dim_customer', sub: 'tuổi, hạng', x: 590, y: 210, w: 150 },
  ],
  edges: [
    { from: 'f', to: 't', kind: 'muted' },
    { from: 'f', to: 'p', kind: 'muted' },
    { from: 'f', to: 's', kind: 'muted' },
    { from: 'f', to: 'c', kind: 'muted' },
  ],
  caption: 'Hình: Star schema trong data warehouse. Câu hỏi "doanh thu theo vùng trong quý 3" chỉ cần join bảng fact với hai dimension.',
})}

<h2>Top 10 database mã nguồn mở</h2>
<p>Theo mức độ phổ biến và ảnh hưởng trong cộng đồng, sách xếp hạng: MySQL, PostgreSQL, MariaDB, Apache Cassandra, Neo4j, SQLite, CockroachDB, Redis, MongoDB và Couchbase. Danh sách cho thấy database quan hệ vẫn chiếm ưu thế (năm trong mười cái là SQL hoặc tương thích SQL), bên cạnh mỗi nhóm NoSQL lớn một đại diện.</p>

<h2>PostgreSQL có đang "nuốt" cả thế giới database?</h2>
<p>Nhờ hệ thống extension, PostgreSQL làm được việc của nhiều loại database chuyên dụng. Sách tóm gọn: khi phân vân, cứ dùng PostgreSQL.</p>
${diagram({
  w: 720, h: 280,
  nodes: [
    { id: 'pg', label: 'PostgreSQL', x: 360, y: 140, w: 150, kind: 'store' },
    { id: 'ts', label: 'TimescaleDB', sub: 'time-series', x: 130, y: 50, w: 140 },
    { id: 'vec', label: 'pgvector', sub: 'vector, ML', x: 360, y: 50, w: 140 },
    { id: 'olap', label: 'Citus, Hydra', sub: 'OLAP, phân tán', x: 590, y: 50, w: 140 },
    { id: 'geo', label: 'PostGIS', sub: 'dữ liệu địa lý', x: 130, y: 230, w: 140 },
    { id: 'srch', label: 'ParadeDB', sub: 'full-text search', x: 360, y: 230, w: 140 },
    { id: 'graph', label: 'Apache AGE', sub: 'graph', x: 590, y: 230, w: 140 },
  ],
  edges: [
    { from: 'pg', to: 'ts', kind: 'muted' },
    { from: 'pg', to: 'vec', kind: 'muted' },
    { from: 'pg', to: 'olap', kind: 'muted' },
    { from: 'pg', to: 'geo', kind: 'muted' },
    { from: 'pg', to: 'srch', kind: 'muted' },
    { from: 'pg', to: 'graph', kind: 'muted' },
  ],
  caption: 'Hình: Một số extension giúp PostgreSQL phủ các use case của database chuyên dụng.',
})}
<p>Ngoài ra, PostgreSQL còn truy vấn được dữ liệu ở MongoDB, MySQL, Redis qua foreign data wrapper (federated query), và nhiều database "phái sinh" như CockroachDB, YugabyteDB, AlloyDB, Supabase dùng giao thức hoặc engine của nó. Extension phù hợp khi quy mô vừa phải; ở quy mô rất lớn, database chuyên dụng vẫn thường nhanh và rẻ hơn.</p>

${tip('<b>Thực tế.</b> Theo sách, Reddit dùng PostgreSQL cho mô hình dữ liệu cốt lõi, đặt memcached phía trước để giảm tải, và dùng Cassandra cho nhiều tính năng mới vì khả năng chịu lỗi và sẵn sàng cao. Đây là <b>polyglot persistence</b>: mỗi loại dữ liệu nằm ở database hợp với nó nhất.')}
${note('<b>Sai lầm thường gặp.</b> Chọn MongoDB hay Cassandra cho sản phẩm mới chỉ vì "NoSQL scale tốt", trong khi dữ liệu có nhiều quan hệ và chỉ vài GB. Kết quả là tự viết lại join và transaction trong code. Với phần lớn hệ thống, một PostgreSQL có index tốt và read replica đủ dùng rất lâu.')}
${interview([
  'Bạn thiết kế ứng dụng chat. Tin nhắn, hồ sơ người dùng và tìm kiếm tin nhắn nên lưu ở loại database nào?',
  'Khi nào bạn dùng extension của PostgreSQL (pgvector, TimescaleDB) thay vì một database chuyên dụng?',
  'Star schema khác snowflake ở điểm nào? Vì sao data warehouse thường dùng star schema?',
])}`,
    keys: [
      'Chọn database theo hình dạng dữ liệu và kiểu truy vấn, không theo xu hướng.',
      'Relational cho transaction; key-value cho tra cứu nhanh; wide-column cho ghi lớn; graph cho quan hệ; time-series, vector, search cho truy vấn chuyên biệt.',
      'Star schema (fact + dimension) là mô hình chuẩn của data warehouse.',
      'PostgreSQL với extension phủ được nhiều use case; khi phân vân, bắt đầu từ nó.',
    ],
    quiz: [
      { q: 'Hệ thống lưu metrics CPU của 10.000 server mỗi 10 giây và thường truy vấn trung bình theo giờ. Loại database nào hợp nhất?', o: ['Graph', 'Time-series', 'Document', 'Key-value'], a: 1, why: 'Dữ liệu gắn timestamp, ghi liên tục và tổng hợp theo khoảng thời gian là đúng sở trường của time-series database.' },
      { q: 'Tìm "bạn của bạn của bạn" có cùng sở thích. Loại database nào truy vấn tự nhiên nhất?', o: ['Relational', 'Wide-column', 'Graph', 'Search'], a: 2, why: 'Graph database lưu cạnh trực tiếp nên duyệt nhiều tầng quan hệ mà không cần join nhiều lần.' },
      { q: 'Trong star schema, bảng ở trung tâm chứa gì?', o: ['Thuộc tính mô tả như tên sản phẩm', 'Số đo định lượng như doanh thu', 'Index', 'Log thay đổi'], a: 1, why: 'Bảng fact chứa số đo định lượng; các bảng dimension chứa thuộc tính mô tả.' },
      { q: 'Extension nào giúp PostgreSQL làm tìm kiếm vector?', o: ['PostGIS', 'pgvector', 'TimescaleDB', 'Apache AGE'], a: 1, why: 'pgvector thêm kiểu vector và phép tìm láng giềng gần nhất. PostGIS dành cho địa lý, AGE cho graph.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'index-cau-truc',
    mod: 'du-lieu',
    title: 'Index và cấu trúc dữ liệu bên trong database',
    pages: [181, 313],
    min: 13,
    level: 'nang-cao',
    lede: 'Mọi database đều là một vài cấu trúc dữ liệu được ghép khéo léo. Biết bên dưới là B-tree hay LSM-tree giúp bạn đoán trước database sẽ nhanh ở đâu và chậm ở đâu.',
    body: `
<h2>Index giải quyết vấn đề gì</h2>
<p>Không có index, câu <code>SELECT * FROM users WHERE email = ?</code> phải quét toàn bộ bảng: 100 triệu hàng là 100 triệu lần so sánh. Index là một cấu trúc dữ liệu phụ, sắp xếp sẵn theo cột cần tìm, giúp tìm ra vị trí hàng trong O(log n) hoặc O(1). Cái giá phải trả: mỗi lần ghi phải cập nhật thêm index, và index chiếm thêm đĩa.</p>
<p>Hai họ storage engine chính quyết định cách database ghi dữ liệu xuống đĩa: <b>B-tree</b> (cập nhật tại chỗ) và <b>LSM-tree</b> (chỉ ghi nối thêm). Phần lớn khác biệt hiệu năng giữa PostgreSQL và Cassandra bắt nguồn từ lựa chọn này.</p>

<h2>B-tree: cây cân bằng trên đĩa</h2>
${diagram({
  w: 720, h: 280,
  nodes: [
    { id: 'r', label: '[ 40 | 80 ]', sub: 'root', x: 360, y: 50, w: 130 },
    { id: 'i1', label: '[ 15 | 30 ]', x: 185, y: 140, w: 130 },
    { id: 'i2', label: '[ 55 | 70 ]', x: 535, y: 140, w: 130 },
    { id: 'l1', label: '1..14', sub: 'leaf page', x: 100, y: 235, w: 110 },
    { id: 'l2', label: '15..39', sub: 'leaf page', x: 270, y: 235, w: 110 },
    { id: 'l3', label: '40..54', sub: 'leaf page', x: 450, y: 235, w: 110 },
    { id: 'l4', label: '55..79', sub: 'leaf page', x: 620, y: 235, w: 110 },
  ],
  edges: [
    { from: 'r', to: 'i1' },
    { from: 'r', to: 'i2' },
    { from: 'i1', to: 'l1' },
    { from: 'i1', to: 'l2' },
    { from: 'i2', to: 'l3' },
    { from: 'i2', to: 'l4' },
    { from: 'l1', to: 'l2', dashed: true, kind: 'muted' },
    { from: 'l2', to: 'l3', dashed: true, kind: 'muted' },
    { from: 'l3', to: 'l4', dashed: true, kind: 'muted' },
  ],
  caption: 'Hình: B+tree rút gọn. Tìm key 60: root → [55|70] → leaf 55..79. Các leaf nối nhau nên quét khoảng (range scan) chỉ cần đi ngang.',
})}
<p>Mỗi node là một page cố định (PostgreSQL dùng page 8 KB, InnoDB 16 KB) chứa hàng trăm key, nên cây rất "thấp": 3–4 tầng đủ cho hàng tỉ hàng. Đọc một key tốn 3–4 lần đọc page, thường các tầng trên đã nằm sẵn trong RAM. Ghi thì phải tìm đúng page và sửa tại chỗ, có khi phải tách page; đó là ghi ngẫu nhiên lên đĩa. B-tree cho hiệu năng đọc và ghi ổn định, là lựa chọn mặc định của MySQL, PostgreSQL, SQL Server.</p>

<h2>LSM-tree: biến ghi ngẫu nhiên thành ghi tuần tự</h2>
<p>Sách tóm tắt: LSM tree = skiplist + SSTable, cho throughput ghi rất cao. Luồng ghi như sau:</p>
${diagram({
  w: 720, h: 270,
  nodes: [
    { id: 'w', label: 'Lệnh ghi', x: 80, y: 130, w: 110, kind: 'client' },
    { id: 'wal', label: 'WAL', sub: 'append-only, đĩa', x: 260, y: 55, w: 130, kind: 'store' },
    { id: 'mem', label: 'Memtable', sub: 'skiplist, RAM', x: 260, y: 205, w: 130, kind: 'cache' },
    { id: 'l0', label: 'SSTable L0', sub: 'bất biến', x: 450, y: 205, w: 130, kind: 'store' },
    { id: 'l1', label: 'SSTable L1', sub: 'đã gộp', x: 630, y: 205, w: 110, kind: 'store' },
    { id: 'bf', label: 'Bloom filter', sub: 'mỗi SSTable', x: 540, y: 65, w: 130, kind: 'lb' },
  ],
  edges: [
    { from: 'w', to: 'wal', label: '1' },
    { from: 'w', to: 'mem', label: '2' },
    { from: 'mem', to: 'l0', label: '3' },
    { from: 'l0', to: 'l1', label: '4' },
    { from: 'bf', to: 'l0', dashed: true, kind: 'muted' },
  ],
  caption: 'Hình: Đường ghi của LSM-tree. Mọi thao tác trên đĩa đều là ghi tuần tự; bloom filter giúp đường đọc bỏ qua các SSTable chắc chắn không chứa key.',
})}
<ol>
<li>Ghi bản ghi vào <b>WAL</b> (write-ahead log) để không mất dữ liệu nếu crash.</li>
<li>Chèn vào <b>memtable</b> trong RAM, thường là skiplist để giữ key luôn được sắp xếp. Đến đây đã báo ghi thành công.</li>
<li>Memtable đầy (vài chục MB) thì được flush xuống đĩa thành một <b>SSTable</b>: file key đã sắp xếp, không bao giờ sửa.</li>
<li><b>Compaction</b> chạy nền, gộp nhiều SSTable nhỏ thành file lớn hơn, loại bỏ bản ghi cũ và tombstone (dấu xóa).</li>
</ol>
<p>Đổi lại, đọc một key có thể phải dò memtable rồi lần lượt nhiều SSTable. Bloom filter của từng SSTable trả lời nhanh "chắc chắn không có ở đây", giúp bỏ qua phần lớn file. LevelDB, RocksDB, Cassandra, ScyllaDB và HBase dùng LSM-tree.</p>
${tbl(['Tiêu chí', 'B-tree', 'LSM-tree'], [
  ['Cách ghi', 'Sửa tại chỗ, ghi ngẫu nhiên', 'Nối thêm, ghi tuần tự'],
  ['Throughput ghi', 'Trung bình', 'Rất cao'],
  ['Đọc theo key', 'Ổn định, vài lần đọc page', 'Có thể phải dò nhiều SSTable'],
  ['Chi phí ẩn', 'Phân mảnh page, tách page', 'Compaction tốn CPU và I/O, gây latency đột biến'],
  ['Ví dụ', 'PostgreSQL, MySQL InnoDB', 'Cassandra, RocksDB, ScyllaDB'],
])}

<h2>8 cấu trúc dữ liệu làm nên database hiện đại</h2>
${tbl(['Cấu trúc', 'Vai trò', 'Dùng ở'], [
  ['Skiplist', 'Index trong RAM, giữ thứ tự, chèn và tìm O(log n)', 'Redis sorted set, memtable'],
  ['Hash index', 'Hiện thực "Map": tra cứu theo key bằng O(1), không hỗ trợ range', 'Redis, hash index của PostgreSQL'],
  ['SSTable', '"Map" bất biến trên đĩa, key đã sắp xếp', 'Cassandra, LevelDB'],
  ['LSM tree', 'Skiplist + SSTable, throughput ghi cao', 'RocksDB, Cassandra'],
  ['B-tree', 'Cây trên đĩa, đọc ghi ổn định', 'Hầu hết database quan hệ'],
  ['Inverted index', 'Từ khóa → danh sách tài liệu chứa nó', 'Lucene, Elasticsearch'],
  ['Suffix tree', 'Tìm mẫu chuỗi con nhanh', 'Tìm kiếm chuỗi, tin sinh học'],
  ['R-tree', 'Index nhiều chiều, tìm láng giềng gần nhất', 'PostGIS, tìm quán ăn quanh đây'],
])}
<p>Bloom filter không nằm trong danh sách 8 của sách nhưng có mặt ở khắp nơi: LSM-tree dùng nó để bỏ qua SSTable, cache dùng nó để chặn key không tồn tại. Nó có thể báo nhầm "có" nhưng không bao giờ báo nhầm "không".</p>
<p>Sách còn có một danh sách "10 cấu trúc dữ liệu dùng hằng ngày" ngoài database: list cho feed Twitter, stack cho undo/redo, queue cho hàng đợi máy in, hash table cho cache, heap cho lập lịch tác vụ, tree cho cây HTML, graph cho quan hệ bạn bè và tìm đường, R-tree cho tìm điểm gần nhất.</p>

${tip('<b>Thực tế.</b> Sách kể rằng Discord gặp vấn đề với Cassandra vì nền tảng LSM-tree: đọc đắt hơn ghi, nên kênh có nhiều người đọc cùng lúc tạo thành hotspot, còn compaction SSTable làm chậm cả cluster. Đây là ví dụ điển hình của việc storage engine quyết định hiệu năng ở quy mô lớn.')}
${note('<b>Sai lầm thường gặp.</b> Tạo index cho mọi cột. Mỗi index làm chậm mọi lệnh ghi và tốn RAM. Với composite index <code>(country, city)</code>, query chỉ lọc theo <code>city</code> không dùng được index vì quy tắc tiền tố bên trái. Hãy tạo index theo câu truy vấn thực tế và kiểm tra bằng <code>EXPLAIN</code>.')}
${interview([
  'So sánh B-tree và LSM-tree. Bạn chọn engine nào cho hệ thống thu thập log ghi 500.000 bản ghi mỗi giây?',
  'Vì sao LSM-tree cần bloom filter? Nếu bỏ bloom filter, đường đọc chậm đi thế nào?',
  'Tại sao hash index không hỗ trợ được truy vấn <code>WHERE created_at BETWEEN ...</code>?',
])}`,
    keys: [
      'Index đổi chi phí ghi và dung lượng lấy tốc độ đọc.',
      'B-tree sửa tại chỗ, đọc ghi ổn định; nền tảng của database quan hệ.',
      'LSM-tree: WAL → memtable (skiplist) → SSTable → compaction; ghi tuần tự nên ghi rất nhanh, đọc đắt hơn.',
      'Bloom filter giúp LSM bỏ qua SSTable không chứa key; inverted index cho full-text; R-tree cho dữ liệu không gian.',
    ],
    quiz: [
      { q: 'Trong LSM-tree, dữ liệu vừa ghi nằm ở đâu trước khi được flush xuống SSTable?', o: ['B-tree page', 'Memtable trong RAM (cùng WAL trên đĩa)', 'Bloom filter', 'Inverted index'], a: 1, why: 'Lệnh ghi đi vào WAL để bền vững và memtable để truy cập nhanh. Memtable đầy mới flush thành SSTable.' },
      { q: 'Vì sao LSM-tree có throughput ghi cao hơn B-tree?', o: ['Không cần ghi xuống đĩa', 'Mọi thao tác đĩa đều là ghi tuần tự', 'Không có index', 'Dùng hash thay vì sắp xếp'], a: 1, why: 'LSM chỉ nối thêm vào WAL và ghi SSTable mới một lần, tránh ghi ngẫu nhiên vào page như B-tree.' },
      { q: 'Cấu trúc nào hợp nhất để tìm "10 cửa hàng gần vị trí của tôi"?', o: ['Hash index', 'Inverted index', 'R-tree', 'Skiplist'], a: 2, why: 'R-tree index dữ liệu nhiều chiều như tọa độ và hỗ trợ tìm láng giềng gần nhất.' },
      { q: 'Composite index (country, city). Query nào KHÔNG tận dụng được index?', o: ['WHERE country = ?', 'WHERE country = ? AND city = ?', 'WHERE city = ?', 'ORDER BY country, city'], a: 2, why: 'Index sắp theo country trước rồi mới tới city, nên chỉ lọc theo city thì không đi theo tiền tố bên trái được.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'replication',
    mod: 'du-lieu',
    title: 'Replication và 7 chiến lược scale database',
    pages: [245, 347],
    min: 12,
    level: 'trung-binh',
    lede: 'Replication là cách rẻ nhất để database chịu được nhiều đọc hơn và sống sót khi một server chết. Nhưng nó cũng đưa vào hệ thống một vấn đề mới: các bản sao không bao giờ hoàn toàn đồng bộ.',
    body: `
<h2>Vì sao cần nhiều bản sao</h2>
<p><b>Replication</b> là giữ cùng một dữ liệu trên nhiều server. Nó phục vụ ba mục tiêu: <b>sẵn sàng cao</b> (một node chết thì node khác thay), <b>scale đọc</b> (chia lượng đọc cho nhiều replica) và <b>giảm latency</b> (đặt replica gần người dùng ở region khác). Replication không giúp scale ghi, vì mọi bản sao đều phải nhận đủ mọi lệnh ghi.</p>

<h2>Leader-follower: mô hình phổ biến nhất</h2>
${diagram({
  w: 720, h: 270,
  nodes: [
    { id: 'w', label: 'App ghi', x: 90, y: 60, w: 110, kind: 'client' },
    { id: 'l', label: 'Leader', sub: 'nhận mọi lệnh ghi', x: 330, y: 60, w: 150, kind: 'store' },
    { id: 'f1', label: 'Follower 1', sub: 'chỉ đọc', x: 220, y: 205, w: 130, kind: 'store' },
    { id: 'f2', label: 'Follower 2', sub: 'chỉ đọc', x: 450, y: 205, w: 130, kind: 'store' },
    { id: 'r', label: 'App đọc', x: 640, y: 205, w: 100, kind: 'client' },
  ],
  edges: [
    { from: 'w', to: 'l', label: 'INSERT' },
    { from: 'l', to: 'f1', label: 'replication log', dashed: true },
    { from: 'l', to: 'f2', dashed: true },
    { from: 'r', to: 'f2', label: 'SELECT' },
  ],
  caption: 'Hình: Leader-follower. Leader gửi luồng thay đổi (WAL, binlog) cho follower; các lệnh đọc được chia cho follower.',
})}
<p>Leader ghi thay đổi vào log rồi gửi log đó cho các follower áp dụng lại theo đúng thứ tự. Khi leader chết, một follower được đề bạt lên làm leader mới (failover). Phần khó của failover là chọn follower có dữ liệu mới nhất và tránh tình trạng hai node cùng nghĩ mình là leader (split brain).</p>

<h2>Ba kiến trúc replication</h2>
${tbl(['Mô hình', 'Cách ghi', 'Ưu', 'Nhược', 'Ví dụ'], [
  ['Leader-follower', 'Chỉ leader nhận ghi', 'Đơn giản, không xung đột ghi', 'Leader là nút cổ chai ghi; failover phức tạp', 'PostgreSQL, MySQL, MongoDB'],
  ['Multi-leader', 'Mỗi region có một leader, đồng bộ chéo', 'Ghi latency thấp ở nhiều region', 'Xung đột khi hai nơi sửa cùng bản ghi', 'MySQL Group Replication, ứng dụng offline-first'],
  ['Leaderless', 'Ghi vào nhiều node, đọc từ nhiều node', 'Không có điểm lỗi đơn, chịu lỗi tốt', 'Phải sửa dữ liệu lệch (read repair, anti-entropy)', 'Cassandra, DynamoDB'],
])}
<p>Với leaderless, sách nêu quy tắc quorum: nếu số node nhận ghi (W) cộng số node đọc (R) lớn hơn tổng số bản sao (N), tức <code>W + R &gt; N</code>, thì tập node đọc và tập node ghi luôn giao nhau, nên lần đọc thấy được giá trị mới nhất. Cấu hình phổ biến là N = 3, W = 2, R = 2.</p>

<h2>Đồng bộ hay bất đồng bộ</h2>
${cols([
  { title: 'Synchronous', body: '<p>Leader chờ follower xác nhận rồi mới báo commit. Không mất dữ liệu khi leader chết, nhưng một follower chậm làm mọi lệnh ghi chậm theo, follower chết thì ghi bị chặn.</p>' },
  { title: 'Asynchronous', body: '<p>Leader commit ngay, gửi log cho follower sau. Ghi nhanh, nhưng leader chết trước khi gửi log thì mất các lệnh ghi cuối. Đây là mặc định của nhiều hệ thống.</p>' },
  { title: 'Semi-sync', body: '<p>Chờ ít nhất một follower xác nhận, các follower còn lại async. Cân bằng giữa an toàn và tốc độ; MySQL hỗ trợ sẵn chế độ này.</p>' },
])}

<h2>Replication lag và các bất thường khi đọc</h2>
<p>Với replication bất đồng bộ, follower có thể chậm vài mili giây đến vài phút so với leader. Bình thường không ai nhận ra, nhưng lúc tải cao lag tăng vọt và người dùng thấy những điều kỳ lạ.</p>
${seq({
  actors: [
    { id: 'u', label: 'Người dùng', kind: 'client' },
    { id: 'l', label: 'Leader', kind: 'store' },
    { id: 'f', label: 'Follower', kind: 'store' },
  ],
  msgs: [
    { from: 'u', to: 'l', label: 'Đổi tên thành "Lan"' },
    { from: 'l', to: 'u', label: 'OK', dashed: true, kind: 'good' },
    { from: 'u', to: 'f', label: 'Tải lại trang hồ sơ' },
    { from: 'f', to: 'u', label: 'Tên cũ "Hoa"', dashed: true, kind: 'warn' },
    { note: 'Log thay đổi chưa tới follower' },
    { from: 'l', to: 'f', label: 'replication log (trễ 2 giây)' },
  ],
  caption: 'Hình: Vi phạm read-your-writes. Người dùng vừa sửa xong lại thấy dữ liệu cũ vì lần đọc đi vào follower bị trễ.',
})}
${tbl(['Bất thường', 'Biểu hiện', 'Cách xử lý'], [
  ['Read-your-writes', 'Không thấy thay đổi chính mình vừa làm', 'Đọc từ leader dữ liệu của chính người dùng, hoặc trong vài giây sau khi ghi'],
  ['Monotonic reads', 'Tải lại trang thấy dữ liệu "lùi về quá khứ"', 'Gắn mỗi người dùng với một replica cố định'],
  ['Consistent prefix', 'Thấy câu trả lời trước câu hỏi', 'Ghi các sự kiện liên quan vào cùng một partition'],
])}

<h2>7 chiến lược scale database</h2>
<p>Replication chỉ là một trong bảy chiến lược sách liệt kê. Thứ tự dưới đây đi từ rẻ và đơn giản đến đắt và phức tạp; nên thử từ trên xuống.</p>
${tbl(['#', 'Chiến lược', 'Cách làm', 'Giải quyết'], [
  ['1', 'Indexing', 'Xem pattern truy vấn và tạo index đúng', 'Query chậm'],
  ['2', 'Materialized view', 'Tính trước kết quả query phức tạp và lưu lại', 'Báo cáo, tổng hợp'],
  ['3', 'Denormalization', 'Lưu dư thừa để giảm join', 'Join tốn kém'],
  ['4', 'Vertical scaling', 'Thêm CPU, RAM, ổ đĩa cho server', 'Mọi thứ, nhưng có trần'],
  ['5', 'Caching', 'Đưa dữ liệu hay đọc lên tầng nhanh hơn', 'Tải đọc'],
  ['6', 'Replication', 'Tạo bản sao trên server khác', 'Scale đọc, sẵn sàng cao'],
  ['7', 'Sharding', 'Chia bảng ra nhiều server', 'Scale cả ghi lẫn đọc'],
])}
${tip('<b>Thực tế.</b> Theo sách, bước đầu tiên khi Figma scale PostgreSQL là nâng lên instance RDS lớn nhất (r5.24xlarge), tạo nhiều read replica để chia tải đọc và thêm PgBouncer làm connection pooler. Chỉ khi các bước rẻ này hết tác dụng, họ mới chuyển sang partition dữ liệu.')}
${note('<b>Sai lầm thường gặp.</b> Chuyển toàn bộ lệnh đọc sang replica mà không xét luồng "ghi xong đọc lại ngay" như thanh toán, đổi mật khẩu, tạo đơn. Hãy phân loại: dữ liệu cần mới tuyệt đối đọc từ leader, còn feed, danh sách, thống kê đọc từ replica.')}
${interview([
  'Leader chết khi đang dùng replication bất đồng bộ. Dữ liệu nào có thể mất và làm sao giảm thiểu?',
  'Giải thích quy tắc W + R > N. Với N = 3, cấu hình W = 1, R = 1 có vấn đề gì?',
  'Người dùng phàn nàn vừa đăng bài xong thì không thấy bài của mình. Bạn chẩn đoán và sửa thế nào?',
])}`,
    keys: [
      'Replication giúp sẵn sàng cao và scale đọc, không scale được ghi.',
      'Ba mô hình: leader-follower, multi-leader, leaderless (quorum W + R > N).',
      'Sync an toàn nhưng chậm; async nhanh nhưng có thể mất dữ liệu và gây replication lag.',
      'Replication lag gây lỗi read-your-writes; đọc dữ liệu vừa ghi từ leader.',
      'Thử 7 chiến lược theo thứ tự: index, materialized view, denormalize, scale dọc, cache, replica, rồi mới sharding.',
    ],
    quiz: [
      { q: 'Hệ thống bị quá tải ghi. Chiến lược nào KHÔNG giúp được?', o: ['Sharding', 'Thêm read replica', 'Giảm số index thừa', 'Gom lệnh ghi theo batch'], a: 1, why: 'Mọi replica đều phải nhận đủ mọi lệnh ghi, nên thêm replica chỉ chia tải đọc.' },
      { q: 'Leaderless với N = 3. Cấu hình nào đảm bảo đọc thấy bản ghi mới nhất?', o: ['W = 1, R = 1', 'W = 2, R = 2', 'W = 1, R = 2', 'W = 0, R = 3'], a: 1, why: 'W + R = 4 > 3 nên tập đọc và tập ghi luôn có ít nhất một node chung.' },
      { q: 'Người dùng sửa hồ sơ, tải lại thấy thông tin cũ. Đây là bất thường gì?', o: ['Dirty read', 'Vi phạm read-your-writes', 'Split brain', 'Deadlock'], a: 1, why: 'Lần đọc đi vào follower chưa nhận được log thay đổi, nên người dùng không thấy chính thay đổi của mình.' },
      { q: 'Nhược điểm chính của replication đồng bộ hoàn toàn?', o: ['Có thể mất dữ liệu khi leader chết', 'Follower chậm hoặc chết làm chậm hoặc chặn mọi lệnh ghi', 'Không đọc được từ follower', 'Gây xung đột ghi'], a: 1, why: 'Leader phải chờ mọi follower xác nhận nên hiệu năng ghi bị kéo theo follower chậm nhất.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'sharding',
    mod: 'du-lieu',
    title: 'Sharding và consistent hashing',
    pages: [208, 341],
    min: 13,
    level: 'nang-cao',
    widget: 'hashring',
    lede: 'Sharding là bước cuối cùng khi một database không còn chứa nổi dữ liệu hoặc lượng ghi. Nó mở khóa khả năng scale gần như vô hạn, đổi lại mọi thứ khác trở nên khó hơn.',
    body: `
<h2>Sharding là gì</h2>
<p><b>Sharding</b> chia một tập dữ liệu lớn thành nhiều phần nhỏ gọi là <b>shard</b>, mỗi shard nằm trên một server riêng. Mỗi hàng chỉ thuộc về đúng một shard. Lợi ích theo sách: scale được, hiệu năng tốt hơn (mỗi shard nhỏ, index vừa RAM) và sẵn sàng hơn (một shard chết chỉ ảnh hưởng một phần người dùng).</p>
<p>Sharding thường đi kèm replication: mỗi shard có leader và vài follower. Sharding chia tải ghi; replication bảo vệ từng shard.</p>

<h2>Các thuật toán chia shard</h2>
${tbl(['Thuật toán', 'Cách làm', 'Ưu', 'Nhược'], [
  ['Range-based', 'Chia theo khoảng giá trị: họ A–M và N–Z, hoặc theo tháng', 'Range query hiệu quả, dễ hiểu', 'Dễ lệch tải (hotspot)'],
  ['Hash-based', 'shard = hash(key) mod N', 'Phân bố đều', 'Đổi N thì gần như mọi key đổi shard'],
  ['Consistent hashing', 'Đặt shard và key trên một vòng băm', 'Thêm hoặc bớt shard chỉ di chuyển một phần nhỏ key', 'Cần virtual node để đều'],
  ['Virtual bucket', 'Key → bucket ảo cố định → shard vật lý', 'Cân bằng lại bằng cách chuyển bucket, ít di chuyển dữ liệu', 'Cần lưu bảng ánh xạ'],
  ['Directory-based', 'Bảng tra cứu ghi rõ key nào nằm ở shard nào', 'Linh hoạt tuyệt đối', 'Bảng tra cứu là điểm nghẽn và điểm lỗi'],
])}
<p>Bốn dòng đầu là "top 4" của sách; bài crash course về sharding gộp hash và consistent hashing làm một và thêm directory-based. Redis Cluster là ví dụ của virtual bucket: key được băm vào 16.384 hash slot, mỗi node giữ một nhóm slot.</p>

<h2>Vì sao hash mod N gặp rắc rối</h2>
<p>Với 4 shard, key có hash 13 nằm ở shard 13 mod 4 = 1. Thêm shard thứ 5, nó chuyển sang 13 mod 5 = 3. Tính chung, khi đi từ 4 lên 5 shard, khoảng 80% số key phải đổi chỗ: một cuộc di chuyển dữ liệu khổng lồ đúng lúc hệ thống đang quá tải.</p>
<p><b>Consistent hashing</b> băm cả server và key lên cùng một vòng số (ví dụ 0 đến 2<sup>32</sup>−1). Mỗi key thuộc về server đầu tiên gặp được khi đi theo chiều kim đồng hồ. Thêm một server chỉ "cắt" một đoạn của server kế bên, nên chỉ khoảng 1/N số key phải di chuyển.</p>
${diagram({
  w: 720, h: 300,
  nodes: [
    { id: 'a', label: 'Server A', x: 360, y: 45, w: 120, kind: 'store' },
    { id: 'b', label: 'Server B', x: 580, y: 150, w: 120, kind: 'store' },
    { id: 'c', label: 'Server C', x: 360, y: 255, w: 120, kind: 'store' },
    { id: 'd', label: 'Server D', sub: 'mới thêm', x: 140, y: 150, w: 120, kind: 'good' },
  ],
  edges: [
    { from: 'a', to: 'b', label: 'key thuộc B', curve: -40 },
    { from: 'b', to: 'c', label: 'key thuộc C', curve: -40 },
    { from: 'c', to: 'd', label: 'key thuộc D', curve: -40, kind: 'good' },
    { from: 'd', to: 'a', label: 'key thuộc A', curve: -40 },
  ],
  caption: 'Hình: Vòng consistent hashing đi theo chiều kim đồng hồ. Thêm D giữa C và A: chỉ những key trên đoạn C→D chuyển từ A sang D, các server khác không bị ảnh hưởng.',
})}
<p>Chỉ với vài server, các đoạn trên vòng dài ngắn rất khác nhau và một server có thể gánh gấp đôi server khác. Giải pháp là <b>virtual node</b>: mỗi server vật lý xuất hiện ở 100–200 vị trí trên vòng. Các đoạn nhỏ trộn lẫn nhau nên tải đều hơn, và khi một server rời đi, phần key của nó rải đều cho mọi server còn lại thay vì dồn vào một máy. Server mạnh hơn có thể nhận nhiều virtual node hơn. Hãy thử với widget bên dưới bài.</p>

<h2>Chọn shard key</h2>
<p>Shard key quyết định mọi thứ và gần như không thể đổi sau này. Sách nêu ba tiêu chí:</p>
${tbl(['Tiêu chí', 'Nên', 'Ví dụ xấu'], [
  ['Cardinality', 'Nhiều giá trị khác nhau', '<code>country</code>: chỉ vài chục giá trị, không chia nổi 100 shard'],
  ['Frequency', 'Mỗi giá trị xuất hiện với tần suất gần đều nhau', '<code>tenant_id</code> khi một khách hàng chiếm 40% dữ liệu'],
  ['Monotonic change', 'Không tăng hoặc giảm đều theo thời gian', '<code>created_at</code> với range sharding: mọi lệnh ghi dồn vào shard mới nhất'],
])}
<p>Ngoài ra, shard key nên khớp với truy vấn chính để phần lớn query chỉ chạm một shard. Ứng dụng chat nên shard theo <code>channel_id</code> vì gần như mọi truy vấn đều là "tin nhắn trong kênh X".</p>
<p><b>Hotspot</b> vẫn xảy ra với shard key tốt, ví dụ một người nổi tiếng có hàng chục triệu follower. Cách xử lý phổ biến là thêm hậu tố ngẫu nhiên vào key nóng (<code>celeb_123#0..9</code>) để rải ra 10 shard, đổi lại khi đọc phải gom từ 10 nơi.</p>

<h2>Định tuyến request đến đúng shard</h2>
${diagram({
  w: 720, h: 250,
  nodes: [
    { id: 'app', label: 'App server', x: 90, y: 125, w: 120, kind: 'client' },
    { id: 'r', label: 'Routing tier', sub: 'proxy', x: 300, y: 125, w: 140, kind: 'lb' },
    { id: 'cfg', label: 'Bản đồ shard', sub: 'key → shard', x: 300, y: 215, w: 140, kind: 'cache' },
    { id: 's1', label: 'Shard 1', x: 560, y: 45, kind: 'store' },
    { id: 's2', label: 'Shard 2', x: 560, y: 130, kind: 'store' },
    { id: 's3', label: 'Shard 3', x: 560, y: 215, kind: 'store' },
  ],
  edges: [
    { from: 'app', to: 'r', label: 'query' },
    { from: 'cfg', to: 'r', dashed: true, kind: 'muted' },
    { from: 'r', to: 's1', kind: 'muted' },
    { from: 'r', to: 's2', label: 'user_id=42' },
    { from: 'r', to: 's3', kind: 'muted' },
  ],
  caption: 'Hình: Routing tier tra bản đồ shard rồi chuyển query đến đúng shard. Ứng dụng không cần biết dữ liệu nằm ở đâu.',
})}
<p>Có ba cách: <b>shard-aware node</b> (client gửi tới node bất kỳ, node tự chuyển tiếp, như Cassandra), <b>routing tier</b> riêng (như hình, ví dụ Vitess, mongos) và <b>shard-aware client</b> (thư viện client biết bản đồ shard, như Redis Cluster client).</p>

<h2>Resharding và truy vấn xuyên shard</h2>
<ul>
<li><b>Resharding:</b> khi thêm shard, dữ liệu phải di chuyển trong lúc hệ thống vẫn chạy. Quy trình thường là sao chép nền, ghi kép, kiểm tra, rồi chuyển routing. Virtual bucket và consistent hashing giảm khối lượng phải chuyển.</li>
<li><b>Query xuyên shard:</b> câu query không có shard key phải gửi tới mọi shard rồi gộp kết quả (scatter-gather), chậm bằng shard chậm nhất. Hạn chế bằng cách denormalize, hoặc duy trì một index phụ toàn cục.</li>
<li><b>Join và transaction xuyên shard:</b> gần như phải tránh. Thiết kế để dữ liệu hay dùng chung nằm cùng shard.</li>
</ul>
${tip('<b>Thực tế.</b> Theo sách, khi một số bảng của Figma vượt nhiều terabyte và hàng tỉ hàng, họ chia ngang các bảng đó ra nhiều database vật lý và xây dịch vụ <b>DBProxy</b> để định tuyến và thực thi query, đúng mô hình routing tier ở trên.')}
${note('<b>Sai lầm thường gặp.</b> Shard quá sớm. Sharding làm mất join, transaction toàn cục và unique constraint toàn cục, và làm việc vận hành phức tạp gấp nhiều lần. Hãy dùng hết sáu chiến lược còn lại trước, và chỉ shard khi lượng ghi hoặc dung lượng thực sự vượt một máy.')}
${interview([
  'Thiết kế sharding cho bảng tin nhắn của một ứng dụng chat 500 triệu người dùng. Chọn shard key nào, vì sao?',
  'Giải thích vì sao hash mod N gây di chuyển dữ liệu lớn khi thêm shard, và consistent hashing cải thiện thế nào.',
  'Virtual node giải quyết vấn đề gì của consistent hashing?',
  'Làm sao truy vấn "tìm user theo email" khi bảng users được shard theo user_id?',
])}`,
    keys: [
      'Sharding chia dữ liệu ra nhiều server để scale cả ghi lẫn dung lượng; thường kết hợp replication.',
      'Range dễ hotspot; hash mod N phân bố đều nhưng resharding đắt; consistent hashing chỉ di chuyển khoảng 1/N key.',
      'Virtual node làm tải đều hơn và rải tải khi một server rời đi.',
      'Shard key cần cardinality cao, tần suất đều, không tăng đơn điệu, và khớp truy vấn chính.',
      'Query xuyên shard và join là cái giá lớn nhất của sharding.',
    ],
    quiz: [
      { q: 'Dùng hash(key) mod N, tăng từ 4 lên 5 shard. Khoảng bao nhiêu key phải di chuyển?', o: ['Khoảng 20%', 'Khoảng 50%', 'Khoảng 80%', '0%'], a: 2, why: 'Một key giữ nguyên shard chỉ khi hash mod 4 bằng hash mod 5, xảy ra với khoảng 1/5 số key; còn lại khoảng 80% phải chuyển.' },
      { q: 'Shard bảng đơn hàng theo created_at với range sharding. Vấn đề chính là gì?', o: ['Không range query được', 'Mọi lệnh ghi mới dồn vào một shard', 'Không thể thêm shard', 'Cardinality quá thấp'], a: 1, why: 'Shard key tăng đơn điệu nên shard chứa khoảng thời gian hiện tại nhận gần như toàn bộ tải ghi.' },
      { q: 'Virtual node trong consistent hashing giúp gì?', o: ['Giảm số server cần dùng', 'Phân bố tải đều hơn giữa các server', 'Loại bỏ nhu cầu replication', 'Tăng tốc hàm băm'], a: 1, why: 'Mỗi server có nhiều vị trí trên vòng nên các đoạn được trộn đều, tránh server gánh đoạn quá dài.' },
      { q: 'Query không chứa shard key sẽ được xử lý thế nào?', o: ['Trả lỗi', 'Gửi tới mọi shard rồi gộp kết quả', 'Chỉ chạy trên shard đầu tiên', 'Chạy trên replica'], a: 1, why: 'Router không biết dữ liệu ở đâu nên phải scatter-gather, chậm và tốn tài nguyên của mọi shard.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'lock-isolation',
    mod: 'du-lieu',
    title: 'Lock, isolation level và deadlock',
    pages: [280, 227],
    min: 13,
    level: 'nang-cao',
    lede: 'Khi hàng nghìn transaction cùng đọc ghi một bảng, database dùng lock và isolation level để giữ dữ liệu đúng. Hiểu chúng giúp bạn tránh cả hai thái cực: dữ liệu sai và hệ thống tắc nghẽn.',
    body: `
<h2>Vấn đề: các transaction chạy đồng thời</h2>
<p>Hai người cùng rút tiền từ một tài khoản 100 nghìn. Cả hai đọc số dư 100, cùng trừ 70, cùng ghi 30. Kết quả: rút ra 140 nghìn nhưng số dư vẫn còn 30. Đây là <b>lost update</b>, một trong nhiều bất thường khi transaction không được cô lập đúng. Database có hai công cụ chính: <b>lock</b> (khóa tài nguyên để transaction khác phải chờ) và <b>MVCC</b> (giữ nhiều phiên bản dữ liệu để người đọc không chặn người ghi).</p>

<h2>Các loại lock</h2>
${tbl(['Lock', 'Mục đích'], [
  ['Shared (S)', 'Nhiều transaction cùng đọc, không ai được sửa. Các S lock tương thích với nhau.'],
  ['Exclusive (X)', 'Đọc và sửa. Khi có X lock, không transaction nào lấy được bất kỳ lock nào khác trên tài nguyên đó.'],
  ['Update (U)', 'Đánh dấu "định sửa". Tránh deadlock kinh điển khi hai transaction cùng giữ S rồi cùng xin nâng lên X.'],
  ['Schema', 'Bảo vệ cấu trúc bảng, ví dụ chặn <code>ALTER TABLE</code> khi đang có query chạy.'],
  ['Bulk update (BU)', 'Dùng khi bulk insert, giảm số lock cần cấp để tăng tốc.'],
  ['Key-range', 'Khóa một khoảng key trong index để chặn phantom read (chèn hàng mới vào khoảng đã đọc).'],
  ['Row / Page / Table', 'Độ mịn của lock: một hàng, một page dữ liệu, hoặc cả bảng. Càng thô càng đơn giản nhưng càng giảm đồng thời.'],
])}
${tbl(['Đang giữ → / Xin ↓', 'S', 'U', 'X'], [
  ['S', 'Được', 'Được', 'Chờ'],
  ['U', 'Được', 'Chờ', 'Chờ'],
  ['X', 'Chờ', 'Chờ', 'Chờ'],
])}
<p>Bảng tương thích trên cho thấy vì sao U lock giúp tránh deadlock: chỉ một transaction được giữ U trên một hàng, nên không thể có hai người cùng "chờ nâng cấp" lẫn nhau. SQL Server còn có <b>lock escalation</b>: khi một transaction giữ quá nhiều row lock (khoảng 5.000), database gộp thành table lock để tiết kiệm bộ nhớ.</p>

<h2>Isolation level và các bất thường</h2>
${tbl(['Isolation level', 'Dirty read', 'Non-repeatable read', 'Phantom read'], [
  ['Read Uncommitted', 'Có thể', 'Có thể', 'Có thể'],
  ['Read Committed', 'Không', 'Có thể', 'Có thể'],
  ['Repeatable Read', 'Không', 'Không', 'Có thể (theo chuẩn SQL)'],
  ['Serializable', 'Không', 'Không', 'Không'],
])}
<ul>
<li><b>Dirty read:</b> đọc dữ liệu transaction khác chưa commit, rồi transaction đó rollback.</li>
<li><b>Non-repeatable read:</b> đọc cùng một hàng hai lần trong một transaction, nhận hai giá trị khác nhau.</li>
<li><b>Phantom read:</b> chạy lại cùng một điều kiện <code>WHERE</code>, xuất hiện thêm hàng mới do transaction khác chèn vào.</li>
</ul>
<p>Mặc định của PostgreSQL là Read Committed, của MySQL InnoDB là Repeatable Read. Thực tế khác chuẩn SQL: Repeatable Read của PostgreSQL dùng snapshot nên không có phantom, còn InnoDB dùng gap lock (một dạng key-range lock) để chặn phần lớn phantom.</p>

<h2>Optimistic và pessimistic locking</h2>
${cols([
  { title: 'Pessimistic', body: '<p>Khóa trước, sửa sau: <code>SELECT ... FOR UPDATE</code> giữ X lock trên hàng tới khi commit. Hợp khi xung đột thường xuyên, như đặt ghế đang hot. Nhược điểm: giữ lock lâu làm người khác phải chờ, dễ deadlock.</p>' },
  { title: 'Optimistic', body: '<p>Không khóa. Mỗi hàng có cột <code>version</code>; khi ghi kiểm tra version chưa đổi. Nếu đổi thì báo xung đột và thử lại. Hợp khi xung đột hiếm, như sửa hồ sơ. Nhược điểm: xung đột nhiều thì retry liên tục.</p>' },
])}
${seq({
  actors: [
    { id: 'a', label: 'Transaction A', kind: 'client' },
    { id: 'db', label: 'Database', kind: 'store' },
    { id: 'b', label: 'Transaction B', kind: 'client' },
  ],
  msgs: [
    { from: 'a', to: 'db', label: 'đọc stock=5, version=7' },
    { from: 'b', to: 'db', label: 'đọc stock=5, version=7' },
    { from: 'a', to: 'db', label: 'UPDATE stock=4, version=8 WHERE version=7', kind: 'good' },
    { from: 'db', to: 'a', label: '1 hàng được cập nhật', dashed: true },
    { from: 'b', to: 'db', label: 'UPDATE stock=4, version=8 WHERE version=7', kind: 'warn' },
    { from: 'db', to: 'b', label: '0 hàng: xung đột', dashed: true, kind: 'warn' },
    { note: 'B đọc lại (stock=4, version=8) rồi thử lại' },
  ],
  caption: 'Hình: Optimistic locking bằng cột version. Lần ghi thứ hai thất bại vì version đã đổi, nên không có lost update.',
})}

<h2>Deadlock</h2>
<p><b>Deadlock</b> xảy ra khi hai hoặc nhiều transaction chờ nhau nhả lock, nên không ai tiến được và chúng chờ mãi mãi.</p>
${seq({
  actors: [
    { id: 't1', label: 'T1: A → B', kind: 'client' },
    { id: 'ra', label: 'Hàng tài khoản A', kind: 'store' },
    { id: 'rb', label: 'Hàng tài khoản B', kind: 'store' },
    { id: 't2', label: 'T2: B → A', kind: 'client' },
  ],
  msgs: [
    { from: 't1', to: 'ra', label: 'X lock A', kind: 'good' },
    { from: 't2', to: 'rb', label: 'X lock B', kind: 'good' },
    { from: 't1', to: 'rb', label: 'xin X lock B → chờ', kind: 'warn' },
    { from: 't2', to: 'ra', label: 'xin X lock A → chờ', kind: 'warn' },
    { note: 'Vòng chờ: T1 chờ T2, T2 chờ T1' },
    { from: 'rb', to: 't2', label: 'chọn T2 làm nạn nhân, rollback', dashed: true },
    { from: 'rb', to: 't1', label: 'T1 lấy được lock B, tiếp tục', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Hai lệnh chuyển tiền ngược chiều cùng lúc gây deadlock. Database phát hiện vòng chờ và rollback một transaction.',
})}
<p>Theo Coffman (1971), deadlock chỉ xảy ra khi đồng thời có đủ bốn điều kiện. Phá được một điều kiện là phòng được deadlock:</p>
${tbl(['Điều kiện Coffman', 'Ý nghĩa', 'Cách phá'], [
  ['Mutual exclusion', 'Tài nguyên chỉ một bên được giữ', 'Dùng MVCC cho phép đọc không khóa'],
  ['Hold and wait', 'Giữ lock này trong khi chờ lock khác', 'Xin mọi lock một lần ngay từ đầu'],
  ['No preemption', 'Không thể cướp lock của bên khác', 'Timeout: giữ quá lâu thì bị rollback'],
  ['Circular wait', 'Tồn tại vòng chờ', 'Resource ordering: luôn khóa theo thứ tự cố định'],
])}
<p>Sách nêu ba cách phòng: <b>resource ordering</b> (xin tài nguyên theo thứ tự tăng dần), <b>timeout</b> và <b>Banker’s algorithm</b> (giả lập cấp phát để chỉ cấp khi vẫn ở trạng thái an toàn). Khi deadlock đã xảy ra, database chọn một <b>nạn nhân</b> dựa trên chi phí rollback, độ ưu tiên hoặc tài nguyên đã dùng, rồi rollback toàn bộ hoặc một phần transaction đó.</p>
${tip('<b>Thực tế.</b> Lỗi deadlock trong hình rất phổ biến ở hệ thống ví điện tử. Cách sửa đơn giản nhất là resource ordering: luôn khóa tài khoản có ID nhỏ hơn trước, bất kể chiều chuyển tiền. InnoDB phát hiện deadlock ngay và trả lỗi 1213 cho nạn nhân; PostgreSQL kiểm tra vòng chờ sau <code>deadlock_timeout</code> (mặc định 1 giây). Ứng dụng phải bắt lỗi này và retry.')}
${note('<b>Sai lầm thường gặp.</b> Gọi API bên ngoài (thanh toán, gửi email) khi đang giữ transaction mở. Lock bị giữ hàng giây, các transaction khác xếp hàng chờ và hệ thống tắc nghẽn. Hãy giữ transaction ngắn nhất có thể và đưa việc chậm ra ngoài transaction.')}
${interview([
  'Hai request cùng mua sản phẩm cuối cùng trong kho. Bạn dùng optimistic hay pessimistic locking, vì sao?',
  'Liệt kê bốn điều kiện Coffman. Resource ordering phá điều kiện nào?',
  'Phân biệt non-repeatable read và phantom read. Isolation level nào ngăn được từng loại?',
])}`,
    keys: [
      'Shared lock cho phép nhiều người đọc; exclusive lock độc quyền; update lock tránh deadlock khi nâng S lên X.',
      'Bốn isolation level đánh đổi giữa đúng đắn và đồng thời; nhớ dirty, non-repeatable và phantom read.',
      'Pessimistic khóa trước (FOR UPDATE); optimistic kiểm tra version khi ghi.',
      'Deadlock cần đủ bốn điều kiện Coffman; khóa theo thứ tự cố định là cách phòng đơn giản nhất.',
      'Giữ transaction ngắn và luôn retry khi bị chọn làm nạn nhân deadlock.',
    ],
    quiz: [
      { q: 'Transaction A đang giữ shared lock trên một hàng. Transaction B xin exclusive lock trên hàng đó. Điều gì xảy ra?', o: ['B được cấp ngay', 'B phải chờ A nhả lock', 'A bị rollback', 'Cả hai cùng được ghi'], a: 1, why: 'X lock không tương thích với bất kỳ lock nào khác, nên B phải chờ đến khi A nhả S lock.' },
      { q: 'Trong một transaction, chạy cùng câu SELECT ... WHERE price < 100 hai lần và lần hai có thêm hàng mới. Đây là gì?', o: ['Dirty read', 'Non-repeatable read', 'Phantom read', 'Lost update'], a: 2, why: 'Hàng mới khớp điều kiện do transaction khác chèn vào là phantom. Key-range lock hoặc Serializable ngăn được nó.' },
      { q: 'Luôn khóa tài khoản có ID nhỏ hơn trước phá điều kiện Coffman nào?', o: ['Mutual exclusion', 'Hold and wait', 'No preemption', 'Circular wait'], a: 3, why: 'Khi mọi transaction khóa theo cùng một thứ tự, không thể hình thành vòng chờ.' },
      { q: 'Optimistic locking phù hợp nhất khi nào?', o: ['Xung đột xảy ra rất thường xuyên', 'Xung đột hiếm, đọc nhiều hơn ghi', 'Cần khóa cả bảng', 'Transaction kéo dài nhiều phút'], a: 1, why: 'Không giữ lock nên rẻ khi hiếm xung đột; nếu xung đột nhiều thì retry liên tục rất tốn kém.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'case-db',
    mod: 'du-lieu',
    title: 'Case study: Figma và Discord scale database',
    pages: [290, 325],
    min: 12,
    level: 'nang-cao',
    lede: 'Hai công ty, hai con đường: Figma giữ PostgreSQL và chia nhỏ dần, Discord đổi database hai lần. Cả hai đều đi theo nguyên tắc làm bước rẻ trước, chỉ làm bước đắt khi buộc phải làm.',
    body: `
<h2>Figma: scale PostgreSQL lên 100 lần</h2>
<p>Theo sách, Figma có khoảng 3 triệu người dùng hằng tháng, lượng người dùng tăng 200% kể từ 2018, và database PostgreSQL tăng trưởng 100 lần. Toàn bộ khởi đầu chỉ là một database Amazon RDS lớn. Hành trình chia ba giai đoạn, mỗi giai đoạn khớp với một chiến lược trong danh sách 7 chiến lược scale database.</p>
${diagram({
  w: 720, h: 250,
  groups: [
    { x: 20, y: 20, w: 200, h: 210, label: 'Giai đoạn 1' },
    { x: 260, y: 20, w: 200, h: 210, label: 'Giai đoạn 2' },
    { x: 500, y: 20, w: 200, h: 210, label: 'Giai đoạn 3' },
  ],
  nodes: [
    { id: 'a1', label: 'RDS r5.24xlarge', sub: 'scale dọc', x: 120, y: 80, w: 160 },
    { id: 'a2', label: 'Read replica', sub: '+ PgBouncer', x: 120, y: 175, w: 160, kind: 'store' },
    { id: 'b1', label: 'DB "Files"', sub: 'tách nhóm bảng', x: 360, y: 80, w: 160, kind: 'store' },
    { id: 'b2', label: 'DB "Orgs"', sub: 'tách nhóm bảng', x: 360, y: 175, w: 160, kind: 'store' },
    { id: 'c1', label: 'DBProxy', sub: 'định tuyến query', x: 600, y: 80, w: 160, kind: 'lb' },
    { id: 'c2', label: 'Shard 1..N', sub: 'chia ngang bảng', x: 600, y: 175, w: 160, kind: 'store' },
  ],
  edges: [
    { from: 'a1', to: 'a2', dashed: true },
    { from: 'a1', to: 'b1', kind: 'muted' },
    { from: 'b1', to: 'c1', kind: 'muted' },
    { from: 'c1', to: 'c2' },
  ],
  caption: 'Hình: Ba giai đoạn scale của Figma: scale dọc và replica, vertical partitioning, rồi horizontal partitioning với DBProxy.',
})}
<h3>Giai đoạn 1: scale dọc và replication</h3>
<p>Figma nâng instance từ r5.12xlarge lên r5.24xlarge, loại lớn nhất RDS có lúc đó. Họ thêm nhiều read replica để chia tải đọc, và đặt <b>PgBouncer</b> làm connection pooler. Mỗi kết nối PostgreSQL là một process riêng tốn vài MB RAM, nên khi số app server tăng, chính số lượng kết nối trở thành giới hạn trước cả CPU.</p>
<h3>Giai đoạn 2: vertical partitioning</h3>
<p>Các bảng nhiều traffic như "Figma Files" và "Organizations" được chuyển sang database riêng. Mỗi database có cụm PgBouncer riêng. Cách này không cần đổi schema, chỉ cần đảm bảo các bảng bị tách ra không join với nhau.</p>
<h3>Giai đoạn 3: horizontal partitioning</h3>
<p>Theo thời gian, một số bảng vượt nhiều terabyte và hàng tỉ hàng. Hai vấn đề xuất hiện: <b>VACUUM</b> của PostgreSQL (tiến trình dọn các phiên bản hàng cũ của MVCC) chạy quá lâu, và IOPS cần dùng vượt giới hạn tối đa của RDS thời điểm đó. Figma chia ngang các bảng lớn ra nhiều database vật lý và xây dịch vụ <b>DBProxy</b> để định tuyến và thực thi query, giúp ứng dụng gần như không phải biết dữ liệu nằm ở shard nào.</p>

<h2>Discord: hàng nghìn tỉ tin nhắn</h2>
${tbl(['Thời điểm', 'Database', 'Chuyện gì xảy ra'], [
  ['2015', 'Một MongoDB replica set', 'Phiên bản đầu tiên. Tới tháng 11/2015 có 100 triệu tin nhắn, RAM không chứa nổi dữ liệu và index, latency khó đoán.'],
  ['2017', 'Cassandra, 12 node', 'Lưu hàng tỉ tin nhắn. Cassandra hợp với tải ghi lớn của chat.'],
  ['Đầu 2022', 'Cassandra, 177 node', 'Hàng nghìn tỉ tin nhắn. Latency lại khó đoán, việc bảo trì quá tốn kém.'],
  ['Sau 2022', 'ScyllaDB + data service Rust', 'p99 đọc 15 ms (Cassandra: 40–125 ms); p99 ghi 5 ms (Cassandra: 5–70 ms).'],
])}
<p>Sách nêu ba nguyên nhân khiến Cassandra gặp khó:</p>
<ul>
<li><b>LSM-tree làm đọc đắt hơn ghi.</b> Một server Discord lớn với hàng trăm người cùng đọc một kênh tạo ra lượng đọc đồng thời rất lớn trên một partition, thành hotspot.</li>
<li><b>Bảo trì cluster</b> như compaction SSTable ảnh hưởng hiệu năng của cả node.</li>
<li><b>GC pause</b> của JVM gây các đợt latency tăng đột biến.</li>
</ul>
<p>ScyllaDB tương thích Cassandra nhưng viết bằng C++, không có garbage collector. Discord thiết kế lại thành ba tầng: API monolith, <b>data service viết bằng Rust</b>, và lưu trữ trên ScyllaDB. Tin nhắn được phân vùng theo <code>(channel_id, bucket)</code>, trong đó bucket là một cửa sổ thời gian cố định, để mỗi partition không phình to vô hạn.</p>
${diagram({
  w: 720, h: 230,
  nodes: [
    { id: 'u', label: 'Hàng nghìn\nngười dùng', x: 70, y: 115, w: 100, h: 56, kind: 'client' },
    { id: 'api', label: 'API monolith', x: 260, y: 115, w: 120 },
    { id: 'ds', label: 'Data service', sub: 'Rust, gộp request', x: 465, y: 115, w: 140, kind: 'good' },
    { id: 'db', label: 'ScyllaDB', sub: 'C++, không GC', x: 655, y: 115, w: 100, kind: 'store' },
  ],
  edges: [
    { from: 'u', to: 'api' },
    { from: 'api', to: 'ds', label: 'gRPC' },
    { from: 'ds', to: 'db' },
  ],
  caption: 'Hình: Kiến trúc lưu tin nhắn mới của Discord. Data service đứng giữa API và database để gom các request giống nhau.',
})}
<p>Data service đem lại kỹ thuật quan trọng nhất là <b>request coalescing</b>: nếu nhiều người cùng yêu cầu đúng một dữ liệu (ví dụ tin nhắn mới nhất của một kênh đông người), chỉ request đầu tiên thực sự chạy query; các request đến sau đăng ký chờ cùng kết quả. Các request cho cùng một kênh được định tuyến về cùng một instance data service để việc gộp đạt hiệu quả cao.</p>
${seq({
  actors: [
    { id: 'a', label: 'Người dùng A', kind: 'client' },
    { id: 'b', label: 'Người dùng B', kind: 'client' },
    { id: 'ds', label: 'Data service', kind: 'service' },
    { id: 'db', label: 'ScyllaDB', kind: 'store' },
  ],
  msgs: [
    { from: 'a', to: 'ds', label: 'tin mới của kênh 42' },
    { from: 'ds', to: 'db', label: 'SELECT ... channel 42' },
    { from: 'b', to: 'ds', label: 'tin mới của kênh 42' },
    { note: 'Query đang chạy: B đăng ký chờ cùng kết quả' },
    { from: 'db', to: 'ds', label: 'kết quả', dashed: true },
    { from: 'ds', to: 'a', label: 'trả kết quả', dashed: true, kind: 'good' },
    { from: 'ds', to: 'b', label: 'trả cùng kết quả', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Request coalescing. Hai request giống nhau chỉ tạo ra một query xuống database.',
})}

<h2>So sánh hai con đường</h2>
${tbl(['Tiêu chí', 'Figma', 'Discord'], [
  ['Kiểu dữ liệu', 'Quan hệ, cần transaction', 'Tin nhắn nối thêm, khối lượng ghi khổng lồ'],
  ['Chiến lược', 'Giữ PostgreSQL, chia nhỏ dần', 'Đổi sang database hợp với workload'],
  ['Điểm nghẽn chính', 'Kết nối, VACUUM, IOPS', 'Hotspot đọc, compaction, GC pause'],
  ['Thành phần mới', 'PgBouncer, DBProxy', 'Data service Rust, ScyllaDB'],
])}
${tip('<b>Bài học chung.</b> Cả hai đều thêm một <b>tầng trung gian</b> giữa ứng dụng và database (DBProxy, data service). Tầng này che giấu chi tiết sharding, gộp request và cho phép thay đổi phía dưới mà không sửa hàng trăm service phía trên.')}
${note('<b>Sai lầm thường gặp.</b> Sao chép kiến trúc cuối cùng của Figma hay Discord cho hệ thống mới. Họ chỉ tới đó sau nhiều năm và khi đã gặp giới hạn cụ thể. Hãy đo điểm nghẽn thực tế (kết nối, IOPS, latency p99) trước khi chọn bước tiếp theo.')}
${interview([
  'Figma chọn vertical partitioning trước horizontal partitioning. Ưu điểm của thứ tự này là gì?',
  'Vì sao một database dựa trên LSM-tree như Cassandra gặp vấn đề với hotspot đọc ở Discord?',
  'Giải thích request coalescing. Nó khác cache thông thường ở điểm nào?',
])}`,
    keys: [
      'Figma: scale dọc + read replica + PgBouncer → tách nhóm bảng ra database riêng → chia ngang với DBProxy.',
      'Discord: MongoDB → Cassandra → ScyllaDB, theo nhu cầu ghi và latency ổn định.',
      'Cassandra gặp hotspot đọc, compaction và GC pause; ScyllaDB (C++) giảm p99 đọc từ 40–125 ms xuống 15 ms.',
      'Request coalescing gộp các request giống nhau thành một query xuống database.',
      'Một tầng trung gian (proxy hoặc data service) giữa app và database giúp thay đổi phía dưới dễ dàng.',
    ],
    quiz: [
      { q: 'Bước đầu tiên Figma làm khi PostgreSQL quá tải là gì?', o: ['Chuyển sang Cassandra', 'Nâng instance lớn hơn và thêm read replica, PgBouncer', 'Sharding ngay', 'Bỏ bớt index'], a: 1, why: 'Theo sách, Figma nâng RDS lên r5.24xlarge, thêm read replica và dùng PgBouncer trước khi partition.' },
      { q: 'Vì sao Figma phải chia ngang bảng ở giai đoạn 3?', o: ['Hết connection', 'Bảng nhiều TB gây vấn đề VACUUM và vượt IOPS tối đa của RDS', 'Muốn dùng NoSQL', 'Chi phí license'], a: 1, why: 'Các bảng hàng tỉ hàng khiến VACUUM khó khăn và nhu cầu IOPS vượt giới hạn của một instance RDS.' },
      { q: 'Nguyên nhân nào KHÔNG được nêu cho vấn đề của Discord với Cassandra?', o: ['Đọc đắt hơn ghi do LSM-tree', 'Compaction SSTable', 'GC pause', 'Thiếu hỗ trợ SQL join'], a: 3, why: 'Sách nêu hotspot đọc do LSM, chi phí bảo trì như compaction và GC pause. Join không phải vấn đề.' },
      { q: 'Request coalescing giúp gì?', o: ['Nén dữ liệu tin nhắn', 'Gộp nhiều request giống nhau thành một query', 'Mã hóa kết nối', 'Tự động sharding'], a: 1, why: 'Data service chỉ chạy một query cho nhiều request trùng nhau đang chờ, giảm mạnh tải lên database ở các kênh nóng.' },
    ],
  },
];
