import type { Lesson } from '../../types';
import { cols, diagram, interview, note, seq, tbl, tip } from '../helpers';

export const lessons: Lesson[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'kafka',
    mod: 'bat-dong-bo',
    title: 'Kafka: kiến trúc, tốc độ và độ tin cậy',
    pages: [241, 165, 171, 335],
    min: 13,
    level: 'trung-binh',
    lede: 'Kafka là xương sống dữ liệu của LinkedIn, Netflix, Uber. Muốn dùng nó đúng, bạn cần hiểu ba điều: dữ liệu được tổ chức thế nào, vì sao nó nhanh, và khi nào nó vẫn có thể làm mất message.',
    body: `
<h2>Kafka là gì</h2>
<p>Kafka là một <b>distributed event store</b> kiêm nền tảng streaming, khởi đầu là dự án nội bộ ở LinkedIn. Khác với message queue truyền thống xóa message ngay khi được xử lý, Kafka giữ message trên đĩa đến khi hết hạn (mặc định 7 ngày) và để consumer tự kéo dữ liệu theo tốc độ của mình. Nhiều consumer độc lập có thể đọc cùng một dữ liệu, và có thể đọc lại từ quá khứ.</p>

<h2>Các khái niệm cốt lõi</h2>
${tbl(['Khái niệm', 'Ý nghĩa'], [
  ['Message', 'Đơn vị dữ liệu, giống một hàng trong bảng: gồm headers, key và value.'],
  ['Topic', 'Nhóm message cùng loại, giống một thư mục. Ví dụ <code>orders</code>, <code>clicks</code>.'],
  ['Partition', 'Topic được chia thành nhiều partition. Mỗi partition là một log chỉ ghi nối thêm, có thứ tự.'],
  ['Offset', 'Số thứ tự của message trong partition. Consumer ghi nhớ offset đã đọc tới đâu.'],
  ['Broker', 'Một server Kafka. Cluster gồm nhiều broker; mỗi partition được replicate sang nhiều broker.'],
  ['Producer', 'Tạo message, gom thành batch, chọn partition (thường bằng hash của key) rồi gửi.'],
  ['Consumer group', 'Nhóm consumer chia nhau các partition của một topic để xử lý song song.'],
])}
${diagram({
  w: 720, h: 290,
  groups: [
    { x: 240, y: 10, w: 180, h: 262, label: 'Topic orders' },
    { x: 510, y: 45, w: 170, h: 200, label: 'Consumer group A' },
  ],
  nodes: [
    { id: 'p', label: 'Producer', sub: 'hash(key) % 3', x: 95, y: 147, w: 130 },
    { id: 'p0', label: 'P0', sub: 'offset 0..812', x: 330, y: 62, w: 150, kind: 'queue' },
    { id: 'p1', label: 'P1', sub: 'offset 0..790', x: 330, y: 147, w: 150, kind: 'queue' },
    { id: 'p2', label: 'P2', sub: 'offset 0..805', x: 330, y: 232, w: 150, kind: 'queue' },
    { id: 'c1', label: 'Consumer 1', x: 595, y: 100, w: 130 },
    { id: 'c2', label: 'Consumer 2', x: 595, y: 200, w: 130 },
  ],
  edges: [
    { from: 'p', to: 'p0', kind: 'muted' },
    { from: 'p', to: 'p1', kind: 'muted' },
    { from: 'p', to: 'p2', kind: 'muted' },
    { from: 'p0', to: 'c1' },
    { from: 'p1', to: 'c1' },
    { from: 'p2', to: 'c2' },
  ],
  caption: 'Hình: Topic 3 partition, consumer group A có 2 consumer. Mỗi partition chỉ được một consumer trong group đọc; một consumer có thể đọc nhiều partition.',
})}
<p>Ba hệ quả quan trọng rút ra từ hình:</p>
<ul>
<li><b>Thứ tự chỉ được đảm bảo trong một partition.</b> Muốn mọi sự kiện của một đơn hàng theo đúng thứ tự, dùng <code>order_id</code> làm key để chúng vào cùng partition.</li>
<li><b>Số partition là trần của song song.</b> Group có 4 consumer mà topic chỉ có 3 partition thì một consumer ngồi chơi.</li>
<li><b>Mỗi group đọc độc lập.</b> Thêm group B (ví dụ service phân tích) để đọc toàn bộ topic từ offset riêng, không ảnh hưởng group A.</li>
</ul>

<h2>Vì sao Kafka nhanh</h2>
<p>Sách chọn ra hai quyết định thiết kế đóng góp nhiều nhất. Thứ nhất là <b>sequential I/O</b>: Kafka chỉ ghi nối vào cuối log. Ghi tuần tự nhanh hơn ghi ngẫu nhiên rất nhiều, kể cả trên ổ cứng cơ, nên Kafka dùng được đĩa dung lượng lớn giá rẻ mà vẫn đạt throughput cao. Thứ hai là <b>zero copy</b> khi gửi dữ liệu cho consumer.</p>
${diagram({
  w: 720, h: 300,
  groups: [
    { x: 290, y: 15, w: 140, h: 95, label: 'User space' },
    { x: 20, y: 140, w: 680, h: 150, label: 'Kernel space và phần cứng' },
  ],
  nodes: [
    { id: 'disk', label: 'Đĩa', x: 80, y: 200, w: 100, kind: 'store' },
    { id: 'os', label: 'OS cache', sub: 'page cache', x: 250, y: 200, w: 120, kind: 'cache' },
    { id: 'app', label: 'Kafka app', x: 360, y: 68, w: 110, kind: 'warn' },
    { id: 'sock', label: 'Socket buffer', x: 470, y: 200, w: 120 },
    { id: 'nic', label: 'Card mạng', x: 640, y: 200, w: 100 },
  ],
  edges: [
    { from: 'disk', to: 'os', label: '1' },
    { from: 'os', to: 'app', label: '2', kind: 'warn' },
    { from: 'app', to: 'sock', label: '3', kind: 'warn' },
    { from: 'sock', to: 'nic', label: '4' },
    { from: 'os', to: 'nic', label: 'sendfile()', curve: 90, kind: 'good', dashed: true },
  ],
  caption: 'Hình: Không có zero copy, dữ liệu đi qua 4 lần sao chép (1→2→3→4), hai lần trong số đó qua bộ nhớ ứng dụng. Với sendfile(), OS cache gửi thẳng ra card mạng.',
})}
<p>Không có zero copy, mỗi message bị chép từ đĩa vào OS cache, từ OS cache lên ứng dụng Kafka, từ ứng dụng xuống socket buffer, rồi mới tới card mạng. Mỗi lần chuyển giữa user space và kernel space còn tốn một lần đổi ngữ cảnh. Với lời gọi hệ thống <code>sendfile()</code>, kernel đưa dữ liệu từ OS cache ra card mạng mà không qua ứng dụng. Điều này khả thi vì Kafka lưu message trên đĩa đúng định dạng gửi qua mạng, nên không cần sửa gì trước khi gửi.</p>

<h2>Kafka có làm mất message không?</h2>
<p>Có, nếu cấu hình sai. Nhiều người tin Kafka "theo thiết kế không bao giờ mất dữ liệu", nhưng message có thể rơi ở cả ba chặng.</p>
${diagram({
  w: 720, h: 270,
  nodes: [
    { id: 'pr', label: 'Producer', sub: 'acks, retries', x: 90, y: 130, w: 130 },
    { id: 'ld', label: 'Leader', sub: 'page cache', x: 300, y: 130, w: 130, kind: 'store' },
    { id: 'f1', label: 'Follower', sub: 'ISR', x: 480, y: 50, w: 120, kind: 'store' },
    { id: 'f2', label: 'Follower', sub: 'ISR', x: 480, y: 215, w: 120, kind: 'store' },
    { id: 'cs', label: 'Consumer', sub: 'commit offset', x: 640, y: 130, w: 110 },
  ],
  edges: [
    { from: 'pr', to: 'ld', label: '1' },
    { from: 'ld', to: 'f1', label: '2', dashed: true },
    { from: 'ld', to: 'f2', label: '2', dashed: true },
    { from: 'ld', to: 'cs', label: '3' },
  ],
  caption: 'Hình: Ba chặng có thể mất message: (1) producer gửi tới broker, (2) broker lưu và replicate, (3) consumer xử lý và commit offset.',
})}
${tbl(['Chặng', 'Rủi ro', 'Cấu hình an toàn'], [
  ['Producer', '<code>send()</code> chỉ đưa message vào record accumulator trong RAM; sender thread gửi sau. App crash hoặc gửi lỗi mà không retry thì mất.', '<code>acks=all</code>, bật <code>retries</code>, <code>enable.idempotence=true</code> để retry không tạo bản trùng'],
  ['Broker', 'Message được flush xuống đĩa bất đồng bộ; broker sập trước khi flush và chưa có replica nào giữ bản sao thì mất.', '<code>replication.factor=3</code>, <code>min.insync.replicas=2</code>, tắt <code>unclean.leader.election</code>'],
  ['Consumer', 'Auto commit có thể xác nhận offset trước khi xử lý xong; consumer chết giữa chừng thì message bị bỏ qua.', 'Tắt auto commit; commit async trong vòng lặp xử lý, commit sync trong khối xử lý lỗi và khi đóng'],
])}
<p>Với <code>acks=all</code>, leader chỉ xác nhận khi mọi replica trong ISR (in-sync replicas, các bản sao đang theo kịp) đã nhận message. Kết hợp <code>min.insync.replicas=2</code>, một message đã được xác nhận luôn nằm trên ít nhất hai broker, nên một broker mất điện không làm mất nó. Đổi lại latency ghi tăng nhẹ.</p>

<h2>5 use case hàng đầu</h2>
${tbl(['Use case', 'Cách dùng Kafka'], [
  ['Xử lý và phân tích log', 'Gom log từ hàng nghìn service về một nơi, đẩy tiếp sang Elasticsearch hoặc data lake.'],
  ['Streaming cho hệ gợi ý', 'Luồng click, lượt xem đi qua stream processor (Flink) để cập nhật gợi ý gần thời gian thực.'],
  ['Monitoring và cảnh báo', 'Metrics được stream liên tục, xử lý và phát cảnh báo khi vượt ngưỡng.'],
  ['Change data capture', 'Thay đổi trong database được đẩy vào Kafka để đồng bộ sang cache, search, warehouse.'],
  ['Di chuyển hệ thống', 'Hệ cũ và hệ mới cùng đọc một luồng sự kiện, chạy song song và so sánh trước khi chuyển hẳn.'],
])}
${tip('<b>Thực tế.</b> Theo sách, Netflix dùng Kafka và Flink cho messaging và streaming, còn Reddit dùng Kafka để chuyển dữ liệu theo thời gian thực cho các quy tắc kiểm duyệt nội dung. Ở cả hai, Kafka là "ống dẫn" trung tâm giữa nơi sinh dữ liệu và nhiều nơi tiêu thụ.')}
${note('<b>Sai lầm thường gặp.</b> Chọn số partition quá ít lúc đầu rồi phải tăng sau. Tăng partition làm đổi ánh xạ key → partition, phá vỡ thứ tự của các key đang chạy. Hãy ước lượng throughput cần thiết và để dư partition ngay từ đầu.')}
${interview([
  'Topic có 6 partition, consumer group có 8 consumer. Chuyện gì xảy ra? Muốn tăng tốc xử lý thì làm gì?',
  'Giải thích zero copy. Vì sao Kafka tận dụng được nó còn nhiều hệ thống khác thì không?',
  'Cấu hình producer, broker và consumer thế nào để không mất message của hệ thống thanh toán?',
])}`,
    keys: [
      'Topic chia thành partition; thứ tự chỉ đảm bảo trong một partition; số partition là trần song song của consumer group.',
      'Kafka nhanh nhờ ghi tuần tự và zero copy (sendfile) từ OS cache ra card mạng.',
      'Chống mất message: acks=all + idempotence, replication factor 3 + min.insync.replicas 2, commit offset sau khi xử lý.',
      'Use case chính: log, streaming cho gợi ý, monitoring, CDC, di chuyển hệ thống.',
    ],
    quiz: [
      { q: 'Zero copy bỏ qua bước nào?', o: ['Đọc từ đĩa', 'Sao chép dữ liệu qua bộ nhớ của ứng dụng Kafka', 'Gửi qua card mạng', 'Nạp vào OS cache'], a: 1, why: 'sendfile() cho phép kernel gửi dữ liệu từ OS cache thẳng ra card mạng mà không qua user space.' },
      { q: 'Consumer commit offset rồi mới xử lý, giữa chừng bị crash. Điều gì xảy ra?', o: ['Message được xử lý hai lần', 'Message bị bỏ qua, coi như mất', 'Kafka tự gửi lại', 'Không ảnh hưởng gì'], a: 1, why: 'Offset đã commit nên khi khởi động lại consumer đọc tiếp từ sau message đó, và nó chưa bao giờ được xử lý xong.' },
      { q: 'Muốn mọi sự kiện của cùng một đơn hàng được xử lý theo đúng thứ tự, nên làm gì?', o: ['Dùng 1 partition cho cả topic', 'Dùng order_id làm key của message', 'Tăng số consumer', 'Bật auto commit'], a: 1, why: 'Cùng key thì cùng partition, và thứ tự được đảm bảo trong một partition. Dùng 1 partition cũng đúng nhưng mất hết khả năng song song.' },
      { q: 'acks=all kết hợp min.insync.replicas=2 đảm bảo điều gì?', o: ['Message được ghi xuống đĩa ngay', 'Message đã xác nhận nằm trên ít nhất hai broker', 'Consumer nhận đúng một lần', 'Không bao giờ có message trùng'], a: 1, why: 'Leader chỉ xác nhận khi đủ số replica đồng bộ đã nhận, nên mất một broker không làm mất message đã xác nhận.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'messaging',
    mod: 'bat-dong-bo',
    title: '6 mẫu messaging và Saga',
    pages: [172, 177],
    min: 12,
    level: 'trung-binh',
    lede: 'Khi các service không muốn chờ nhau, chúng giao tiếp qua message. Sáu mẫu trong bài giải quyết sáu vấn đề cụ thể, và Saga là mẫu quan trọng nhất để giữ dữ liệu nhất quán giữa các microservice.',
    body: `
<h2>Vì sao cần giao tiếp bất đồng bộ</h2>
<p>Gọi đồng bộ (service A gọi B và chờ) đơn giản nhưng gắn chặt hai bên: B chậm thì A chậm, B chết thì A lỗi. Giao tiếp qua message broker tách người gửi khỏi người nhận về thời gian và về số lượng. Người gửi đặt message vào hàng đợi rồi làm việc khác; người nhận xử lý khi sẵn sàng. Đổi lại, hệ thống khó theo dõi hơn và chỉ nhất quán sau một khoảng thời gian.</p>

<h2>6 mẫu messaging trên cloud</h2>
${tbl(['Mẫu', 'Vấn đề giải quyết', 'Cách làm'], [
  ['Asynchronous Request-Reply', 'Tác vụ backend chạy lâu', 'API trả <code>202 Accepted</code> ngay kèm địa chỉ kiểm tra trạng thái; client hỏi lại sau.'],
  ['Publisher-Subscriber', 'Tách người gửi khỏi người nhận', 'Gửi vào topic; nhiều subscriber cùng nhận bản sao; người gửi không phải chờ.'],
  ['Claim Check', 'Message quá lớn', 'Lưu payload vào storage, chỉ gửi tham chiếu qua queue; người nhận lấy payload theo tham chiếu.'],
  ['Priority Queue', 'Một số request cần xử lý trước', 'Request ưu tiên cao được nhận và xử lý sớm hơn request ưu tiên thấp.'],
  ['Saga', 'Nhất quán dữ liệu giữa nhiều service', 'Chuỗi transaction cục bộ; bước sau lỗi thì chạy hành động bù trừ cho các bước trước.'],
  ['Competing Consumers', 'Xử lý song song lượng message lớn', 'Nhiều consumer cùng đọc một kênh, không cần điều phối; đổi lại không đảm bảo thứ tự.'],
])}
${seq({
  actors: [
    { id: 'c', label: 'Client', kind: 'client' },
    { id: 'api', label: 'API', kind: 'lb' },
    { id: 'q', label: 'Queue', kind: 'queue' },
    { id: 'w', label: 'Worker', kind: 'service' },
  ],
  msgs: [
    { from: 'c', to: 'api', label: 'POST /reports' },
    { from: 'api', to: 'q', label: 'đưa job vào hàng đợi' },
    { from: 'api', to: 'c', label: '202 Accepted, /status/91', dashed: true },
    { from: 'q', to: 'w', label: 'nhận job 91' },
    { from: 'c', to: 'api', label: 'GET /status/91' },
    { from: 'api', to: 'c', label: 'đang chạy', dashed: true },
    { from: 'w', to: 'api', label: 'job 91 xong', dashed: true, kind: 'good' },
    { from: 'c', to: 'api', label: 'GET /status/91' },
    { from: 'api', to: 'c', label: 'xong, link tải báo cáo', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Asynchronous request-reply. Client không giữ kết nối chờ trong lúc báo cáo được tạo.',
})}
<p>Pub-sub và competing consumers trông giống nhau nhưng khác ở chỗ ai nhận message. Với pub-sub, <b>mỗi subscriber nhận một bản sao</b>: event <code>OrderCreated</code> đến cả service email lẫn service phân tích. Với competing consumers, <b>mỗi message chỉ đến một consumer</b> trong nhóm, giống nhiều nhân viên cùng lấy việc từ một chồng hồ sơ. Kafka làm được cả hai: các consumer group khác nhau là pub-sub, các consumer trong cùng group là competing consumers.</p>
<h3>Đảm bảo giao nhận</h3>
${tbl(['Mức đảm bảo', 'Ý nghĩa', 'Hệ quả cho consumer'], [
  ['At-most-once', 'Gửi tối đa một lần, có thể mất', 'Chỉ hợp với dữ liệu mất cũng được như metrics lấy mẫu'],
  ['At-least-once', 'Không mất, nhưng có thể trùng', 'Phổ biến nhất; consumer phải idempotent (ví dụ lưu ID message đã xử lý)'],
  ['Exactly-once', 'Đúng một lần', 'Chỉ đạt được trong phạm vi hẹp (ví dụ transaction của Kafka); thực tế thường là at-least-once cộng idempotent'],
])}

<h2>Saga thay cho distributed transaction</h2>
<p>Trong microservices, mỗi service có database riêng nên không có một transaction chung. Distributed transaction kiểu two-phase commit khó scale, giữ lock lâu và làm giảm hiệu năng. <b>Saga</b> chia nghiệp vụ thành chuỗi transaction cục bộ, mỗi bước có một <b>hành động bù trừ</b> (compensating action). Nếu bước thứ ba lỗi, saga chạy bù trừ của bước hai rồi bước một, theo chiều ngược lại. Có hai cách điều phối saga.</p>
${diagram({
  w: 720, h: 270,
  nodes: [
    { id: 'bus', label: 'Event bus', sub: 'Kafka / SNS', x: 360, y: 135, w: 150, kind: 'queue' },
    { id: 'o', label: 'Order', x: 120, y: 50, w: 120 },
    { id: 'p', label: 'Payment', x: 600, y: 50, w: 120 },
    { id: 'i', label: 'Inventory', x: 120, y: 220, w: 120 },
    { id: 's', label: 'Shipping', x: 600, y: 220, w: 120 },
  ],
  edges: [
    { from: 'o', to: 'bus', label: 'OrderCreated' },
    { from: 'bus', to: 'p', label: 'nghe event' },
    { from: 'i', to: 'bus', label: 'StockReserved', both: true },
    { from: 's', to: 'bus', label: 'Shipped', both: true },
  ],
  caption: 'Hình: Saga kiểu choreography. Không có ai điều khiển; mỗi service nghe event của service khác và phát event của mình.',
})}
${diagram({
  w: 720, h: 250,
  nodes: [
    { id: 'c', label: 'Client', x: 120, y: 55, w: 110, kind: 'client' },
    { id: 'or', label: 'Orchestrator', sub: 'máy trạng thái saga', x: 380, y: 55, w: 170, kind: 'lb' },
    { id: 'o', label: 'Order', x: 140, y: 200, w: 120 },
    { id: 'p', label: 'Payment', x: 380, y: 200, w: 120, kind: 'warn' },
    { id: 'i', label: 'Inventory', x: 610, y: 200, w: 120 },
  ],
  edges: [
    { from: 'c', to: 'or', label: 'đặt hàng' },
    { from: 'or', to: 'o', label: '1' },
    { from: 'or', to: 'i', label: '2' },
    { from: 'or', to: 'p', label: '3', kind: 'warn' },
    { from: 'or', to: 'i', label: '4', curve: -60, dashed: true, kind: 'warn' },
  ],
  caption: 'Hình: Saga kiểu orchestration. (1) tạo đơn, (2) giữ hàng, (3) thanh toán lỗi, (4) orchestrator gửi lệnh bù trừ: trả hàng về kho, rồi hủy đơn.',
})}
${tbl(['Tiêu chí', 'Choreography', 'Orchestration'], [
  ['Điều phối', 'Phân tán, qua event', 'Tập trung ở orchestrator'],
  ['Phụ thuộc', 'Service chỉ biết event, ít phụ thuộc', 'Orchestrator biết mọi service'],
  ['Theo dõi luồng', 'Khó: logic rải ở nhiều nơi', 'Dễ: trạng thái saga nằm một chỗ'],
  ['Hợp với', 'Luồng ngắn, 2–4 bước', 'Luồng dài, nhiều nhánh, nhiều bù trừ'],
  ['Công cụ', 'Kafka, SNS/SQS', 'Temporal, AWS Step Functions, Camunda'],
])}

<h2>9 mẫu kiến trúc cho luồng dữ liệu và giao tiếp</h2>
<p>Sách mở rộng thêm một danh sách 9 mẫu tổng quát hơn, bao gồm cả đồng bộ và bất đồng bộ:</p>
${tbl(['Mẫu', 'Ý chính'], [
  ['Peer-to-Peer', 'Hai thành phần nói chuyện trực tiếp, không cần điều phối trung tâm.'],
  ['API Gateway', 'Một cổng vào duy nhất cho mọi request từ client tới backend.'],
  ['Pub-Sub', 'Broker tách publisher khỏi subscriber.'],
  ['Request-Response', 'Mẫu cơ bản nhất: client gửi và chờ phản hồi.'],
  ['Event Sourcing', 'Lưu thay đổi trạng thái dưới dạng chuỗi sự kiện.'],
  ['ETL', 'Gom dữ liệu từ nhiều nguồn, biến đổi rồi nạp vào đích.'],
  ['Batching', 'Tích lũy dữ liệu tới một thời điểm hoặc ngưỡng rồi xử lý một lượt.'],
  ['Stream Processing', 'Tiếp nhận và xử lý dữ liệu liên tục theo thời gian thực.'],
  ['Orchestration', 'Bộ điều phối trung tâm quản lý tương tác giữa các thành phần.'],
])}
${tip('<b>Ví dụ thực tế.</b> Một luồng đặt vé máy bay: giữ ghế, trừ tiền, xuất vé. Nếu xuất vé lỗi, saga hoàn tiền rồi nhả ghế. Hành động bù trừ không "xóa" lịch sử: khách vẫn thấy giao dịch trừ tiền và giao dịch hoàn tiền trên sao kê. Đó là bản chất của saga, khác với rollback của database.')}
${note('<b>Sai lầm thường gặp.</b> Quên rằng saga không có isolation. Trong lúc saga chạy dở, service khác có thể đọc thấy trạng thái trung gian (đơn đã tạo nhưng chưa thanh toán). Thêm nữa, hành động bù trừ phải idempotent và phải retry được, vì message có thể được giao nhiều lần.')}
${interview([
  'Thiết kế luồng đặt hàng gồm 4 service bằng saga. Bạn chọn choreography hay orchestration, vì sao?',
  'Cần gửi file video 2 GB giữa hai service qua queue. Bạn dùng mẫu nào?',
  'Competing consumers không đảm bảo thứ tự. Nếu thứ tự quan trọng với từng khách hàng thì xử lý thế nào?',
])}`,
    keys: [
      'Async request-reply: trả 202 Accepted cho tác vụ chạy lâu.',
      'Claim check gửi tham chiếu thay vì payload lớn; competing consumers xử lý song song nhưng mất thứ tự.',
      'Saga thay distributed transaction bằng transaction cục bộ cộng hành động bù trừ.',
      'Choreography: phân tán qua event, hợp luồng ngắn. Orchestration: tập trung, dễ theo dõi luồng dài.',
    ],
    quiz: [
      { q: 'Cần gửi file video 2 GB qua message queue. Nên dùng mẫu nào?', o: ['Priority Queue', 'Claim Check', 'Saga', 'Competing Consumers'], a: 1, why: 'Lưu video vào object storage, chỉ gửi đường dẫn qua queue.' },
      { q: 'API tạo báo cáo mất 5 phút. Mã HTTP nào hợp lý để trả ngay?', o: ['200 OK', '201 Created', '202 Accepted', '504 Gateway Timeout'], a: 2, why: '202 Accepted cho biết request đã được nhận để xử lý nhưng chưa xong.' },
      { q: 'Trong saga, bước thanh toán lỗi sau khi đã giữ hàng. Điều gì xảy ra?', o: ['Database tự rollback mọi service', 'Chạy hành động bù trừ: trả hàng về kho, hủy đơn', 'Bỏ qua lỗi', 'Khóa toàn bộ hệ thống'], a: 1, why: 'Không có transaction chung, nên saga phải chủ động chạy các bước bù trừ theo chiều ngược lại.' },
      { q: 'Ưu điểm chính của orchestration so với choreography?', o: ['Không cần message broker', 'Luồng nghiệp vụ nằm một chỗ, dễ theo dõi và sửa', 'Service hoàn toàn không phụ thuộc nhau', 'Không bao giờ lỗi'], a: 1, why: 'Orchestrator giữ trạng thái và logic của saga, nên luồng dài nhiều nhánh dễ hiểu và debug hơn.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'retry',
    mod: 'bat-dong-bo',
    title: 'Retry, backoff và circuit breaker',
    pages: [243],
    min: 11,
    level: 'trung-binh',
    widget: 'retry',
    lede: 'Lỗi tạm thời là chuyện thường ngày trong hệ phân tán. Retry đúng cách giúp hệ thống tự hồi phục; retry sai cách tạo ra bão retry đánh sập chính service đang cố hồi phục.',
    body: `
<h2>Khi nào nên retry</h2>
<p>Retry chỉ có ý nghĩa với <b>lỗi tạm thời</b> (transient error): mạng chập chờn, timeout, <code>503 Service Unavailable</code>, <code>429 Too Many Requests</code>, leader database đang failover. Lỗi do chính request sai như <code>400</code>, <code>401</code>, <code>404</code> thì retry bao nhiêu lần cũng vẫn lỗi. Điều kiện tiên quyết thứ hai: thao tác phải <b>idempotent</b>, hoặc mang <code>Idempotency-Key</code>, để retry không tạo ra hai đơn hàng hay trừ tiền hai lần.</p>

<h2>4 chiến lược retry</h2>
${tbl(['Chiến lược', 'Khoảng chờ', 'Ưu', 'Nhược'], [
  ['Linear backoff', '1s, 2s, 3s, 4s…', 'Đơn giản, dễ hiểu', 'Dưới tải cao dễ gây tranh chấp tài nguyên và bão retry'],
  ['Linear jitter', 'Tuyến tính + một lượng ngẫu nhiên', 'Các client không retry cùng lúc', 'Khoảng chờ cơ sở tăng chậm, vẫn có thể dồn lại'],
  ['Exponential backoff', '1s, 2s, 4s, 8s… tới một mức trần', 'Giảm tải mạnh, hợp hệ thống tải cao', 'Chờ lâu không cần thiết khi lỗi chỉ thoáng qua'],
  ['Exponential jitter', 'Lũy thừa rồi cộng hoặc nhân với số ngẫu nhiên', 'Tản retry tốt nhất, ít va chạm nhất', 'Thời gian chờ khó đoán, có lúc dài hơn cần'],
])}
${seq({
  actors: [
    { id: 'c', label: 'Client', kind: 'client' },
    { id: 's', label: 'Service', kind: 'service' },
  ],
  msgs: [
    { from: 'c', to: 's', label: 'Lần 1: POST /orders (Idempotency-Key: k7)' },
    { from: 's', to: 'c', label: '503 Service Unavailable', dashed: true, kind: 'warn' },
    { note: 'Chờ random(0, 1s)' },
    { from: 'c', to: 's', label: 'Lần 2: cùng request, cùng key' },
    { from: 's', to: 'c', label: 'timeout', dashed: true, kind: 'warn' },
    { note: 'Chờ random(0, 2s)' },
    { from: 'c', to: 's', label: 'Lần 3: cùng request, cùng key' },
    { from: 's', to: 'c', label: '201 Created', dashed: true, kind: 'good' },
  ],
  caption: 'Hình: Exponential backoff với full jitter. Cùng Idempotency-Key nên dù lần 2 đã xử lý xong ở server, lần 3 cũng không tạo đơn thứ hai.',
})}
<p>Công thức "full jitter" phổ biến: <code>sleep = random(0, min(cap, base × 2^attempt))</code>. Với base 1 giây và cap 30 giây, lần thử thứ 5 chờ ngẫu nhiên từ 0 đến 16 giây. Ngẫu nhiên hóa toàn bộ khoảng chờ giúp hàng nghìn client lỗi cùng lúc không quay lại cùng lúc.</p>

<h2>Bão retry và retry budget</h2>
<p>Retry nhân lên theo từng tầng. Nếu mỗi tầng retry 3 lần, một request của người dùng có thể biến thành 27 request xuống database đúng lúc database đang quá tải.</p>
${diagram({
  w: 720, h: 200,
  nodes: [
    { id: 'u', label: 'Client', sub: '1 request', x: 80, y: 100, w: 110, kind: 'client' },
    { id: 'a', label: 'Service A', sub: '3 lần thử', x: 270, y: 100, w: 120 },
    { id: 'b', label: 'Service B', sub: '9 lần thử', x: 460, y: 100, w: 120 },
    { id: 'd', label: 'Database', sub: '27 lần thử', x: 640, y: 100, w: 110, kind: 'warn' },
  ],
  edges: [
    { from: 'u', to: 'a', label: 'x3' },
    { from: 'a', to: 'b', label: 'x3', kind: 'warn' },
    { from: 'b', to: 'd', label: 'x3', kind: 'warn' },
  ],
  caption: 'Hình: Khuếch đại retry. Ba tầng mỗi tầng retry 3 lần biến 1 request thành 27 lần gọi vào tầng dưới cùng.',
})}
<ul>
<li><b>Chỉ retry ở một tầng</b>, thường là tầng gần người dùng nhất hoặc tầng gần lỗi nhất, không phải mọi tầng.</li>
<li><b>Giới hạn số lần</b> (thường 3) và tổng thời gian chờ tối đa.</li>
<li><b>Retry budget:</b> mỗi client chỉ được retry tối đa một tỉ lệ request, ví dụ 10%. Khi service phía dưới lỗi diện rộng, tỉ lệ này chặn retry lại thay vì nhân tải lên.</li>
<li><b>Tôn trọng <code>Retry-After</code></b> khi server trả 429 hoặc 503.</li>
</ul>

<h2>Circuit breaker</h2>
<p>Khi service phía dưới đã hỏng hẳn, retry chỉ làm nó lâu hồi phục hơn. <b>Circuit breaker</b> giống cầu dao điện: phát hiện lỗi vượt ngưỡng thì "ngắt", trả lỗi ngay mà không gọi xuống nữa, rồi thỉnh thoảng thử lại xem đã ổn chưa.</p>
${diagram({
  w: 720, h: 270,
  nodes: [
    { id: 'cl', label: 'Closed', sub: 'gọi bình thường', x: 130, y: 205, w: 150, kind: 'good' },
    { id: 'op', label: 'Open', sub: 'trả lỗi ngay', x: 590, y: 205, w: 150, kind: 'warn' },
    { id: 'hf', label: 'Half-open', sub: 'cho vài request thử', x: 360, y: 60, w: 170, kind: 'lb' },
  ],
  edges: [
    { from: 'cl', to: 'op', label: 'lỗi vượt ngưỡng' },
    { from: 'op', to: 'hf', label: 'hết thời gian chờ', curve: 70 },
    { from: 'hf', to: 'op', label: 'thử thất bại', curve: 70, kind: 'warn' },
    { from: 'hf', to: 'cl', label: 'thử thành công', kind: 'good' },
  ],
  caption: 'Hình: Ba trạng thái của circuit breaker. Ở trạng thái Open, request thất bại nhanh và service phía dưới có thời gian hồi phục.',
})}
${tbl(['Trạng thái', 'Hành vi', 'Chuyển trạng thái khi'], [
  ['Closed', 'Request đi qua bình thường, breaker đếm tỉ lệ lỗi trong một cửa sổ thời gian', 'Tỉ lệ lỗi vượt ngưỡng, ví dụ 50% trong 20 request gần nhất → Open'],
  ['Open', 'Trả lỗi hoặc giá trị dự phòng ngay, không gọi xuống', 'Hết thời gian chờ, ví dụ 30 giây → Half-open'],
  ['Half-open', 'Cho một số ít request thử đi qua', 'Thành công → Closed; thất bại → Open lại'],
])}

<h2>Timeout: tuyến phòng thủ đầu tiên</h2>
<p>Không có timeout, một service chậm giữ thread và kết nối của bên gọi mãi mãi, và lỗi lan ngược lên trên. Đặt riêng <b>connect timeout</b> (ngắn, khoảng 1 giây) và <b>read timeout</b> (theo p99 latency của service phía dưới cộng biên an toàn). Timeout của tầng dưới phải nhỏ hơn tầng trên; tốt hơn nữa là truyền <b>deadline</b> theo request để tầng dưới biết còn bao nhiêu thời gian và bỏ việc nếu đã quá hạn.</p>
${cols([
  { title: 'Retry', body: '<p>Dành cho lỗi tạm thời, ngắn. Giả định lần sau có thể thành công.</p>' },
  { title: 'Circuit breaker', body: '<p>Dành cho lỗi kéo dài. Ngừng gọi để bảo vệ cả hai phía.</p>' },
  { title: 'Timeout', body: '<p>Giới hạn thời gian chờ mỗi lần gọi. Là điều kiện để hai cơ chế kia hoạt động.</p>' },
])}
${tip('<b>Thực tế.</b> AWS khuyến nghị exponential backoff kèm jitter và đưa sẵn vào các SDK của mình. Thư viện Resilience4j (Java) và Polly (.NET) cung cấp sẵn retry, circuit breaker và timeout có thể ghép với nhau, nên hiếm khi cần tự viết.')}
${note('<b>Sai lầm thường gặp.</b> Retry cả những lỗi không phải tạm thời, hoặc retry thao tác không idempotent như gửi tiền mà không có Idempotency-Key. Kết quả là khách bị trừ tiền hai lần chỉ vì phản hồi đầu tiên bị timeout trên đường về.')}
${interview([
  'Một service phụ thuộc đang trả 503 cho 80% request. Hệ thống của bạn nên phản ứng thế nào để không làm tình hình tệ hơn?',
  'Vì sao cần thêm jitter vào exponential backoff? Điều gì xảy ra nếu không có nó?',
  'Hệ thống có 4 tầng service. Bạn đặt retry và timeout ở đâu?',
])}`,
    keys: [
      'Chỉ retry lỗi tạm thời và thao tác idempotent (hoặc có Idempotency-Key).',
      'Exponential backoff + jitter là lựa chọn mặc định tốt; luôn giới hạn số lần và thời gian chờ.',
      'Retry nhân theo tầng; dùng retry budget và chỉ retry ở một tầng.',
      'Circuit breaker có ba trạng thái Closed, Open, Half-open; giúp thất bại nhanh khi service phía dưới hỏng.',
      'Timeout của tầng dưới phải ngắn hơn tầng trên; truyền deadline theo request.',
    ],
    quiz: [
      { q: 'Vì sao cần thêm jitter vào backoff?', o: ['Để retry nhanh hơn', 'Để các client không retry cùng lúc', 'Để giảm số lần retry', 'Để đảm bảo thứ tự'], a: 1, why: 'Nếu hàng nghìn client lỗi cùng lúc và chờ cùng một khoảng, chúng sẽ quay lại cùng lúc và đánh sập server lần nữa.' },
      { q: 'Exponential backoff bắt đầu từ 1s (không jitter). Lần retry thứ 4 chờ bao lâu?', o: ['4s', '8s', '16s', '3s'], a: 1, why: '1s, 2s, 4s, 8s. Lần thứ 4 chờ 8 giây.' },
      { q: 'Circuit breaker đang Open, hết thời gian chờ. Nó chuyển sang trạng thái nào?', o: ['Closed', 'Half-open', 'Vẫn Open', 'Tắt hẳn'], a: 1, why: 'Half-open cho vài request thử; thành công thì về Closed, thất bại thì Open lại.' },
      { q: 'Lỗi nào KHÔNG nên retry?', o: ['503 Service Unavailable', 'Timeout', '400 Bad Request', '429 Too Many Requests'], a: 2, why: '400 là lỗi do chính request sai; gửi lại y nguyên vẫn lỗi.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'event-sourcing-cdc',
    mod: 'bat-dong-bo',
    title: 'Event sourcing, CQRS và Change Data Capture',
    pages: [9, 220],
    min: 13,
    level: 'nang-cao',
    lede: 'Ba kỹ thuật này cùng xoay quanh một ý: coi chuỗi thay đổi là dữ liệu chính. Chúng giúp đồng bộ nhiều hệ thống theo thời gian thực mà không phải ghi kép.',
    body: `
<h2>Event sourcing: lưu sự kiện thay vì trạng thái</h2>
<p>Cách truyền thống lưu <b>trạng thái hiện tại</b>: bảng <code>accounts</code> có cột <code>balance = 70</code>. Event sourcing đổi mô hình lập trình từ lưu trạng thái sang lưu <b>sự kiện</b>: <code>AccountOpened</code>, <code>Deposited(100)</code>, <code>Withdrawn(30)</code>. Trạng thái hiện tại là kết quả của việc phát lại mọi sự kiện. <b>Event store</b> chỉ ghi nối thêm và là nguồn sự thật duy nhất.</p>
${tbl(['Lợi ích', 'Cái giá'], [
  ['Lịch sử đầy đủ, audit trail miễn phí', 'Phát lại nhiều sự kiện chậm, cần snapshot định kỳ'],
  ['Dựng lại trạng thái tại bất kỳ thời điểm nào', 'Schema sự kiện phải tiến hóa cẩn thận vì không sửa được quá khứ'],
  ['Tạo view mới bằng cách phát lại sự kiện cũ', 'Truy vấn trạng thái hiện tại cần read model riêng'],
])}
<p>Sách đưa ví dụ <b>New York Times</b>: mọi bài báo, hình ảnh và byline từ năm 1851 được lưu trong một event store. Dữ liệu thô được denormalize thành nhiều view khác nhau rồi đẩy vào các node Elasticsearch phục vụ tìm kiếm trên website. Khi cần một kiểu view mới, họ chỉ cần phát lại log từ đầu.</p>

<h2>CQRS: tách mô hình đọc và ghi</h2>
<p><b>CQRS</b> (Command Query Responsibility Segregation) tách cấu trúc dữ liệu để ghi khỏi cấu trúc để đọc. Phía ghi tối ưu cho kiểm tra nghiệp vụ và tính đúng; phía đọc tối ưu cho truy vấn, có thể là nhiều store khác nhau. Event sourcing và CQRS hay đi cùng nhau: event store là phía ghi, các projection dựng read model là phía đọc.</p>
${diagram({
  w: 720, h: 270,
  nodes: [
    { id: 'cc', label: 'Lệnh ghi', x: 80, y: 60, w: 110, kind: 'client' },
    { id: 'cs', label: 'Command\nservice', x: 260, y: 60, w: 130, h: 52 },
    { id: 'es', label: 'Event store', sub: 'append-only', x: 460, y: 60, w: 140, kind: 'queue' },
    { id: 'pj', label: 'Projector', x: 630, y: 135, w: 110 },
    { id: 'rd', label: 'Read model', sub: 'SQL, Elasticsearch', x: 460, y: 210, w: 150, kind: 'store' },
    { id: 'qs', label: 'Query\nservice', x: 260, y: 210, w: 130, h: 52 },
    { id: 'cq', label: 'Truy vấn', x: 80, y: 210, w: 110, kind: 'client' },
  ],
  edges: [
    { from: 'cc', to: 'cs', label: '1' },
    { from: 'cs', to: 'es', label: '2' },
    { from: 'es', to: 'pj', label: '3' },
    { from: 'pj', to: 'rd', label: '4' },
    { from: 'cq', to: 'qs' },
    { from: 'qs', to: 'rd', label: 'đọc' },
  ],
  caption: 'Hình: Event sourcing kết hợp CQRS. (1) nhận lệnh, (2) kiểm tra rồi ghi sự kiện, (3) projector nghe sự kiện, (4) cập nhật read model phục vụ truy vấn.',
})}
<p>Read model được cập nhật bất đồng bộ, nên chỉ nhất quán sau một khoảng ngắn. Giao diện cần xử lý trường hợp người dùng vừa ghi xong mà read model chưa kịp cập nhật, ví dụ hiển thị lạc quan dữ liệu vừa gửi.</p>

<h2>Change Data Capture</h2>
<p>Không phải hệ thống nào cũng viết lại theo event sourcing được. <b>CDC</b> lấy sự kiện từ một database bình thường: theo dõi transaction log (binlog của MySQL, WAL của PostgreSQL) và biến mỗi lần insert, update, delete thành một event. Ứng dụng không cần sửa gì; mọi bước sau lần ghi đều trong suốt với nó.</p>
${diagram({
  w: 720, h: 330,
  nodes: [
    { id: 'app', label: 'Ứng dụng', x: 80, y: 60, w: 110, kind: 'client' },
    { id: 'db', label: 'Source DB', sub: 'binlog / WAL', x: 80, y: 180, w: 120, kind: 'store' },
    { id: 'dz', label: 'Debezium', sub: 'source connector', x: 270, y: 180, w: 140 },
    { id: 'k', label: 'Kafka', sub: 'topic thay đổi', x: 460, y: 180, w: 140, kind: 'queue' },
    { id: 'wh', label: 'Warehouse', x: 640, y: 70, w: 110, kind: 'store' },
    { id: 'rc', label: 'Redis', x: 640, y: 180, w: 110, kind: 'cache' },
    { id: 'se', label: 'Elasticsearch', x: 640, y: 290, w: 110 },
  ],
  edges: [
    { from: 'app', to: 'db', label: '1' },
    { from: 'db', to: 'dz', label: '2' },
    { from: 'dz', to: 'k', label: '3' },
    { from: 'k', to: 'wh', label: '4' },
    { from: 'k', to: 'rc', label: '4' },
    { from: 'k', to: 'se', label: '4' },
  ],
  caption: 'Hình: Luồng CDC với Debezium và Kafka Connect. Ứng dụng chỉ ghi vào database như bình thường.',
})}
<ol>
<li><b>Thay đổi dữ liệu:</b> ứng dụng insert, update hoặc delete trên database nguồn.</li>
<li><b>Bắt thay đổi:</b> source connector đọc transaction log của database.</li>
<li><b>Xử lý và phát:</b> thay đổi được chuyển sang định dạng chung (giá trị trước, giá trị sau, loại thao tác) và đẩy vào Kafka.</li>
<li><b>Tích hợp:</b> sink connector tiêu thụ topic và cập nhật hệ thống đích: warehouse, cache, search, theo thời gian thực.</li>
</ol>
<p>Debezium có connector cho hầu hết database phổ biến như MySQL, PostgreSQL, Oracle. So với job đồng bộ chạy định kỳ, CDC có độ trễ thấp hơn nhiều và bắt được cả lệnh delete, thứ mà truy vấn kiểu "lấy các hàng đổi sau thời điểm X" thường bỏ sót.</p>

<h2>Outbox pattern: giải bài toán ghi kép</h2>
<p>Service cần lưu đơn hàng vào database và phát event <code>OrderCreated</code> lên Kafka. Ghi hai nơi riêng rẽ (dual write) luôn có rủi ro: database commit xong nhưng gửi Kafka lỗi, hoặc ngược lại. <b>Outbox pattern</b> ghi event vào bảng <code>outbox</code> trong cùng transaction với dữ liệu nghiệp vụ, rồi để CDC đưa nó lên Kafka.</p>
${seq({
  actors: [
    { id: 's', label: 'Order service', kind: 'service' },
    { id: 'db', label: 'Database', kind: 'store' },
    { id: 'dz', label: 'Debezium', kind: 'service' },
    { id: 'k', label: 'Kafka', kind: 'queue' },
  ],
  msgs: [
    { from: 's', to: 'db', label: 'BEGIN' },
    { from: 's', to: 'db', label: 'INSERT orders' },
    { from: 's', to: 'db', label: 'INSERT outbox (OrderCreated)' },
    { from: 's', to: 'db', label: 'COMMIT', kind: 'good' },
    { note: 'Cả hai hàng cùng thành công hoặc cùng thất bại' },
    { from: 'dz', to: 'db', label: 'đọc WAL, thấy hàng outbox mới' },
    { from: 'dz', to: 'k', label: 'publish OrderCreated', kind: 'good' },
  ],
  caption: 'Hình: Outbox pattern. Event được phát khi và chỉ khi transaction nghiệp vụ commit, không cần distributed transaction.',
})}
${tbl(['Kỹ thuật', 'Nguồn sự thật', 'Khi nào dùng'], [
  ['Event sourcing', 'Event store', 'Nghiệp vụ cần lịch sử đầy đủ: tài chính, kho, sổ cái'],
  ['CQRS', 'Phía ghi', 'Đọc và ghi có yêu cầu rất khác nhau'],
  ['CDC', 'Database hiện có', 'Đồng bộ dữ liệu sang hệ khác mà không sửa ứng dụng'],
  ['Outbox', 'Database (bảng outbox)', 'Phát domain event đáng tin cậy từ một service'],
])}
${tip('<b>Thực tế.</b> Theo sách, Reddit dùng Debezium chạy CDC để hỗ trợ replication dữ liệu và giữ cache nhất quán với PostgreSQL. Sách cũng nêu một ví dụ microservice: service giỏ hàng phát sự kiện thêm, bớt sản phẩm vào Kafka; service chống gian lận, thanh toán và email cùng tiêu thụ, mỗi service tự dựng mô hình dữ liệu riêng.')}
${note('<b>Sai lầm thường gặp.</b> Phát thẳng event CDC của bảng nội bộ cho các team khác dùng. Khi bạn đổi tên cột, mọi consumer vỡ theo. Hãy dùng outbox với schema event được thiết kế riêng làm hợp đồng công khai, và giữ CDC thô cho mục đích nội bộ như đồng bộ cache.')}
${interview([
  'Service vừa lưu đơn hàng vừa phải gửi event lên Kafka. Làm sao đảm bảo không mất event và không phát event cho đơn chưa commit?',
  'So sánh event sourcing và CDC. Khi nào chọn cái nào?',
  'Trong CQRS, người dùng vừa cập nhật hồ sơ nhưng trang hồ sơ vẫn hiện dữ liệu cũ. Vì sao, và xử lý thế nào?',
])}`,
    keys: [
      'Event sourcing lưu chuỗi sự kiện; trạng thái là kết quả phát lại; event store là nguồn sự thật.',
      'CQRS tách mô hình ghi và đọc; read model nhất quán sau một khoảng ngắn.',
      'CDC đọc transaction log (binlog, WAL) và đẩy thay đổi qua Kafka tới cache, search, warehouse.',
      'Outbox ghi event trong cùng transaction với dữ liệu, tránh lỗi dual write.',
    ],
    quiz: [
      { q: 'Trong event sourcing, trạng thái hiện tại của tài khoản được xác định thế nào?', o: ['Đọc cột balance', 'Phát lại mọi sự kiện của tài khoản (hoặc từ snapshot gần nhất)', 'Hỏi cache', 'Lấy sự kiện cuối cùng'], a: 1, why: 'Event store là nguồn sự thật; trạng thái được tính bằng cách áp dụng lần lượt các sự kiện.' },
      { q: 'CDC lấy thay đổi từ đâu?', o: ['Polling bảng mỗi phút', 'Transaction log của database như binlog, WAL', 'Log ứng dụng', 'Trigger gửi email'], a: 1, why: 'Đọc transaction log giúp bắt mọi insert, update, delete với độ trễ thấp và không cần sửa ứng dụng.' },
      { q: 'Outbox pattern giải quyết vấn đề gì?', o: ['Query chậm', 'Ghi kép vào database và message broker không nhất quán', 'Thiếu index', 'Deadlock'], a: 1, why: 'Event được ghi trong cùng transaction với dữ liệu nghiệp vụ, rồi CDC hoặc relay phát lên broker.' },
      { q: 'Ví dụ New York Times trong sách dùng event store để làm gì?', o: ['Xử lý thanh toán', 'Lưu mọi bài báo từ 1851 rồi dựng view cho tìm kiếm Elasticsearch', 'Cache trang chủ', 'Đếm lượt xem'], a: 1, why: 'Nội dung được lưu trong event store, denormalize thành nhiều view và đẩy vào Elasticsearch.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'data-pipeline',
    mod: 'bat-dong-bo',
    title: 'Data pipeline: batch và stream',
    pages: [25, 143],
    min: 12,
    level: 'trung-binh',
    lede: 'Dữ liệu chỉ có giá trị khi đến được đúng người, đúng lúc, đúng dạng. Data pipeline là dây chuyền đưa dữ liệu thô từ ứng dụng tới dashboard, mô hình ML và tính năng sản phẩm.',
    body: `
<h2>5 giai đoạn của một data pipeline</h2>
<p>Sách chia data pipeline thành năm giai đoạn: <b>Collect</b>, <b>Ingest</b>, <b>Store</b>, <b>Compute</b> và <b>Consume</b>. Mỗi giai đoạn có công cụ chuyên biệt, và hiệu quả của cả dây chuyền phụ thuộc vào khâu yếu nhất.</p>
${diagram({
  w: 720, h: 290,
  groups: [
    { x: 20, y: 10, w: 130, h: 270, label: '1. Collect' },
    { x: 190, y: 10, w: 140, h: 270, label: '2. Ingest' },
    { x: 370, y: 10, w: 170, h: 270, label: '3–4. Store, Compute' },
    { x: 580, y: 10, w: 125, h: 270, label: '5. Consume' },
  ],
  nodes: [
    { id: 'a', label: 'App, web', x: 85, y: 70, w: 110, kind: 'client' },
    { id: 'd', label: 'Database', x: 85, y: 155, w: 110, kind: 'store' },
    { id: 'i', label: 'Thiết bị IoT', x: 85, y: 240, w: 110, kind: 'client' },
    { id: 'k', label: 'Event queue', sub: 'Kafka', x: 260, y: 155, w: 120, kind: 'queue' },
    { id: 'l', label: 'Lake / Warehouse', sub: 'S3, Snowflake', x: 455, y: 70, w: 150, kind: 'store' },
    { id: 'c', label: 'Batch + Stream', sub: 'Spark, Flink', x: 455, y: 215, w: 150 },
    { id: 'bi', label: 'Dashboard, BI', x: 642, y: 70, w: 110, kind: 'good' },
    { id: 'ml', label: 'ML, data sci', x: 642, y: 155, w: 110, kind: 'good' },
    { id: 'ap', label: 'Tính năng app', x: 642, y: 240, w: 110, kind: 'good' },
  ],
  edges: [
    { from: 'a', to: 'k', kind: 'muted' },
    { from: 'd', to: 'k', kind: 'muted' },
    { from: 'i', to: 'k', kind: 'muted' },
    { from: 'k', to: 'l' },
    { from: 'k', to: 'c' },
    { from: 'l', to: 'c', both: true },
    { from: 'l', to: 'bi' },
    { from: 'c', to: 'ml' },
    { from: 'c', to: 'ap' },
  ],
  caption: 'Hình: Năm giai đoạn của data pipeline. Store và Compute đan xen: compute đọc từ lake, ghi kết quả đã xử lý trở lại.',
})}
${tbl(['Giai đoạn', 'Việc chính', 'Công cụ tiêu biểu'], [
  ['Collect', 'Thu dữ liệu từ data store, data stream, ứng dụng, thiết bị', 'SDK tracking, CDC, agent log'],
  ['Ingest', 'Nạp dữ liệu vào hệ thống, sắp xếp trong event queue', 'Kafka, Kinesis, Pub/Sub'],
  ['Store', 'Lưu vào data lake, warehouse, lakehouse hoặc database', 'S3, HDFS, Snowflake, BigQuery'],
  ['Compute', 'Gộp, làm sạch, chuẩn hóa định dạng, nén, phân vùng; cả batch lẫn stream', 'Spark, Flink, dbt'],
  ['Consume', 'Phục vụ dashboard, BI, ML, decision engine, ứng dụng người dùng', 'Tableau, Superset, feature store'],
])}
<p>Ngoài năm khâu chính, một pipeline thực tế còn cần ba thứ chạy xuyên suốt. <b>Điều phối</b> (orchestration): công cụ như Airflow hay Dagster lập lịch các job, quản lý thứ tự phụ thuộc và chạy lại khi lỗi. <b>Kiểm tra chất lượng</b>: kiểm tra schema, số hàng, giá trị null ngay ở khâu ingest để dữ liệu bẩn không lan xuống. <b>Lineage và catalog</b>: biết bảng nào sinh ra từ đâu để khi một con số trên dashboard sai, có thể lần ngược về nguồn.</p>

<h2>Batch và stream</h2>
${cols([
  { title: 'Batch processing', body: '<p>Tích lũy dữ liệu theo khoảng (mỗi giờ, mỗi đêm) rồi xử lý một lượt. Throughput cao, dễ chạy lại khi lỗi, rẻ. Độ trễ từ vài phút tới cả ngày. Hợp với báo cáo doanh thu, tính lương, huấn luyện mô hình.</p>' },
  { title: 'Stream processing', body: '<p>Xử lý từng sự kiện ngay khi đến, độ trễ mili giây tới giây. Phức tạp hơn: phải xử lý sự kiện đến trễ, trùng lặp, trạng thái cửa sổ thời gian. Hợp với phát hiện gian lận, cảnh báo, gợi ý thời gian thực.</p>' },
])}
${diagram({
  w: 720, h: 260,
  nodes: [
    { id: 's', label: 'Nguồn sự kiện', x: 80, y: 130, w: 120, kind: 'client' },
    { id: 'k', label: 'Kafka', x: 260, y: 130, w: 110, kind: 'queue' },
    { id: 'b', label: 'Batch layer', sub: 'Spark, mỗi giờ', x: 450, y: 50, w: 150 },
    { id: 'sp', label: 'Speed layer', sub: 'Flink, vài giây', x: 450, y: 210, w: 150 },
    { id: 'sv', label: 'Serving layer', sub: 'gộp hai kết quả', x: 630, y: 130, w: 130, kind: 'good' },
  ],
  edges: [
    { from: 's', to: 'k' },
    { from: 'k', to: 'b', label: 'toàn bộ lịch sử' },
    { from: 'k', to: 'sp', label: 'dữ liệu mới' },
    { from: 'b', to: 'sv' },
    { from: 'sp', to: 'sv' },
  ],
  caption: 'Hình: Kiến trúc Lambda chạy song song batch (chính xác) và stream (nhanh). Kiến trúc Kappa bỏ batch layer, chỉ dùng stream và phát lại Kafka khi cần tính lại.',
})}
<p>Lambda cho kết quả nhanh mà vẫn chính xác, nhưng phải viết và vận hành cùng một logic ở hai hệ thống. Kappa đơn giản hơn, nhờ Kafka giữ được lịch sử dài và stream engine như Flink đã đủ mạnh. Nhiều nhóm hiện chọn stream cho phần cần thời gian thực và batch cho phần còn lại, không cố ép một kiến trúc cho mọi thứ.</p>

<h2>Data lake, warehouse và lakehouse</h2>
${tbl(['Tiêu chí', 'Data warehouse', 'Data lake', 'Lakehouse'], [
  ['Dữ liệu', 'Có cấu trúc, đã làm sạch', 'Mọi định dạng, kể cả thô', 'Mọi định dạng'],
  ['Schema', 'Schema-on-write', 'Schema-on-read', 'Schema áp lên file mở'],
  ['Chi phí lưu', 'Cao', 'Rất thấp (object storage)', 'Thấp'],
  ['Mạnh ở', 'SQL, BI, báo cáo', 'Lưu trữ rẻ, ML trên dữ liệu thô', 'Cả hai: transaction ACID trên file trong lake'],
  ['Ví dụ', 'Snowflake, BigQuery, Redshift', 'S3, HDFS, ADLS', 'Delta Lake, Apache Iceberg, Apache Hudi'],
])}
<p>ETL (extract, transform, load) biến đổi dữ liệu trước khi nạp vào warehouse. Với warehouse hiện đại có sức tính toán lớn, ELT phổ biến hơn: nạp thô vào trước, biến đổi bằng SQL ngay trong warehouse (thường bằng dbt).</p>

<h2>6 mẫu quản lý dữ liệu</h2>
<p>Bài "How do we manage data?" của sách liệt kê sáu mẫu xuất hiện khắp nơi trong pipeline và hệ thống vận hành:</p>
${tbl(['Mẫu', 'Ý chính', 'Dùng khi'], [
  ['Cache-aside', 'Đọc cache trước, miss thì đọc store rồi ghi vào cache', 'Đọc nhiều, ít cập nhật'],
  ['Materialized view', 'Lưu sẵn kết quả query trên đĩa', 'Tổng hợp phức tạp, BI'],
  ['CQRS', 'Tách mô hình đọc và ghi', 'Đọc và ghi có yêu cầu khác nhau'],
  ['Event sourcing', 'Lưu log mọi thay đổi', 'Cần audit, dựng lại trạng thái quá khứ'],
  ['Index table', 'Bảng phụ tối ưu cho một kiểu truy vấn', 'Tránh quét toàn bộ trên dữ liệu lớn'],
  ['Sharding', 'Chia dữ liệu ra nhiều server', 'Khối lượng vượt một máy'],
])}
${tip('<b>Thực tế.</b> Theo sách, Netflix dùng Kafka và Flink cho streaming, Spark và Flink để xử lý dữ liệu, Redshift làm data warehouse cho dữ liệu có cấu trúc, rồi trực quan hóa bằng Tableau. Đó là đủ năm giai đoạn: ứng dụng thu dữ liệu, Kafka nạp, Redshift và S3 lưu, Spark và Flink tính, Tableau tiêu thụ.')}
${note('<b>Sai lầm thường gặp.</b> Xây pipeline streaming phức tạp cho báo cáo mà sếp chỉ xem mỗi sáng. Batch hằng đêm rẻ hơn, dễ debug và chạy lại hơn nhiều. Một lỗi khác: bỏ qua kiểm tra chất lượng và schema ở khâu ingest, để dữ liệu bẩn lan xuống mọi dashboard phía sau.')}
${interview([
  'Thiết kế pipeline tính doanh thu theo giờ và phát hiện giao dịch gian lận trong vòng 1 giây. Phần nào batch, phần nào stream?',
  'So sánh data lake, data warehouse và lakehouse. Công ty khởi nghiệp nên bắt đầu với gì?',
  'Lambda và Kappa khác nhau thế nào? Khi nào Kappa không đủ?',
])}`,
    keys: [
      'Data pipeline gồm 5 giai đoạn: Collect, Ingest, Store, Compute, Consume.',
      'Batch rẻ, throughput cao, trễ lâu; stream trễ thấp nhưng phức tạp hơn.',
      'Warehouse cho dữ liệu sạch và SQL; lake lưu mọi thứ rẻ; lakehouse thêm ACID lên lake.',
      'Lambda chạy song song batch và stream; Kappa chỉ dùng stream và phát lại log.',
    ],
    quiz: [
      { q: 'Kafka thường đóng vai trò ở giai đoạn nào của data pipeline?', o: ['Collect', 'Ingest', 'Consume', 'Visualize'], a: 1, why: 'Kafka nhận và tổ chức dữ liệu trong event queue trước khi lưu và xử lý.' },
      { q: 'Phát hiện gian lận thẻ trong 1 giây cần kiểu xử lý nào?', o: ['Batch hằng đêm', 'Stream processing', 'ETL hằng tuần', 'Materialized view'], a: 1, why: 'Chỉ stream processing xử lý từng sự kiện với độ trễ đủ thấp.' },
      { q: 'Lakehouse bổ sung điều gì cho data lake?', o: ['Lưu trữ rẻ hơn', 'Transaction ACID và schema trên file trong lake', 'Thay thế Kafka', 'Không cần compute'], a: 1, why: 'Các định dạng bảng như Delta Lake, Iceberg thêm ACID, schema và time travel lên object storage.' },
      { q: 'Nhược điểm chính của kiến trúc Lambda?', o: ['Không xử lý được thời gian thực', 'Phải duy trì cùng logic ở hai hệ thống batch và stream', 'Không lưu được lịch sử', 'Không dùng được Kafka'], a: 1, why: 'Batch layer và speed layer cần hai bản cài đặt cho cùng một phép tính, tốn công vận hành và dễ lệch nhau.' },
    ],
  },
];
