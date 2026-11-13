import type { Lesson } from '../../types';
import { cols, diagram, interview, note, seq, tbl, tip } from '../helpers';

export const lessons: Lesson[] = [
  /* ------------------------------------------------------------------ */
  /* 1. Git                                                              */
  /* ------------------------------------------------------------------ */
  {
    id: 'git',
    mod: 'devops-cloud',
    title: 'Git hoạt động thế nào',
    pages: [16, 43, 55],
    min: 10,
    level: 'co-ban',
    lede: 'Kỹ sư nào cũng dùng Git hằng ngày, nhưng ít người hình dung được thay đổi của mình đang nằm ở đâu. Nắm được bốn vùng lưu trữ và ba cách gộp nhánh thì phần lớn các tình huống "lỡ tay" đều có cách gỡ.',
    body: `
<h2>Code của bạn nằm ở bốn nơi</h2>
<p>Nhiều người nghĩ code chỉ có hai bản: một trên máy mình và một trên GitHub. Thực ra Git giữ ba vùng lưu trữ ngay trên máy local, cộng thêm remote là bốn. Phần lớn lệnh Git chỉ làm một việc: chuyển thay đổi từ vùng này sang vùng khác.</p>
<ul>
<li><b>Working directory</b>: thư mục bạn đang mở trong editor, nơi trực tiếp sửa file.</li>
<li><b>Staging area</b> (còn gọi là <b>index</b>): vùng tạm chứa những thay đổi đã chọn cho commit kế tiếp.</li>
<li><b>Local repository</b>: thư mục <code>.git</code>, chứa toàn bộ lịch sử commit trên máy bạn.</li>
<li><b>Remote repository</b>: bản repo trên server như GitHub hoặc GitLab, nơi cả nhóm đồng bộ với nhau.</li>
</ul>
${diagram({
  w: 720, h: 290,
  nodes: [
    { id: 'wd', label: 'Working\ndirectory', x: 110, y: 190, w: 130, h: 56, kind: 'client' },
    { id: 'st', label: 'Staging area', sub: 'index', x: 360, y: 190, w: 130, h: 56 },
    { id: 'lr', label: 'Local repo', sub: '.git', x: 610, y: 190, w: 130, kind: 'store' },
    { id: 'rr', label: 'Remote repo', sub: 'GitHub, GitLab', x: 610, y: 60, w: 140, kind: 'store' },
  ],
  edges: [
    { from: 'wd', to: 'st', label: 'git add', curve: -30 },
    { from: 'st', to: 'wd', label: 'git reset', curve: -30, dashed: true },
    { from: 'st', to: 'lr', label: 'git commit', curve: -30 },
    { from: 'lr', to: 'wd', label: 'git checkout', curve: -120, dashed: true },
    { from: 'lr', to: 'rr', label: 'git push', curve: -80 },
    { from: 'rr', to: 'lr', label: 'git fetch', curve: -80, dashed: true },
    { from: 'rr', to: 'wd', label: 'git pull', dashed: true },
  ],
  caption: 'Hình: Bốn vùng lưu trữ của Git. Mũi tên liền đưa thay đổi đi xa dần về phía remote, mũi tên đứt kéo thay đổi ngược về máy bạn.',
})}
<p>Bảng dưới tóm tắt các lệnh hay dùng theo hướng di chuyển dữ liệu. Khi gặp một lệnh lạ, hãy tự hỏi: nó đọc từ vùng nào và ghi vào vùng nào.</p>
${tbl(['Lệnh', 'Từ → tới', 'Ghi chú'], [
  ['<code>git add</code>', 'Working → Staging', 'Chọn thay đổi cho commit. <code>git add -p</code> cho phép chọn từng đoạn code.'],
  ['<code>git commit</code>', 'Staging → Local repo', 'Tạo một snapshot mới, định danh bằng hash SHA-1.'],
  ['<code>git push</code>', 'Local repo → Remote', 'Bị từ chối nếu remote có commit mới mà bạn chưa có.'],
  ['<code>git fetch</code>', 'Remote → Local repo', 'Cập nhật nhánh <code>origin/main</code>, không đụng tới file đang sửa.'],
  ['<code>git pull</code>', 'Remote → Local → Working', 'Bằng <code>fetch</code> rồi <code>merge</code> (hoặc rebase nếu thêm <code>--rebase</code>).'],
  ['<code>git checkout</code> / <code>git switch</code>', 'Local repo → Working', 'Chuyển nhánh hoặc lấy lại nội dung file từ một commit.'],
  ['<code>git reset</code>', 'Staging → Working, hoặc lùi nhánh', '<code>git reset file</code> bỏ file khỏi staging; <code>--soft</code>/<code>--hard HEAD~1</code> lùi nhánh về commit trước.'],
  ['<code>git stash</code>', 'Working → vùng cất tạm', 'Cất thay đổi dở dang để chuyển sang việc khác, lấy lại bằng <code>git stash pop</code>.'],
])}
<p>Sách đặt câu hỏi: <code>git tag</code> tác động lên vùng nào? Câu trả lời là local repository. Tag chỉ là một cái tên gắn vào commit trên máy bạn, và mặc định <code>git push</code> không đẩy tag. Muốn đồng bộ phải chạy <code>git push origin v1.2.0</code> hoặc <code>git push --tags</code>.</p>

<h2>Merge, rebase và squash</h2>
<p>Giả sử nhánh <code>main</code> có các commit A, B, C. Nhánh <code>feature</code> tách ra từ B và có thêm hai commit D, E. Có ba cách đưa D, E vào <code>main</code>, mỗi cách để lại một kiểu lịch sử khác nhau.</p>
${diagram({
  w: 720, h: 230,
  groups: [
    { x: 15, y: 15, w: 210, h: 200, label: 'Merge' },
    { x: 240, y: 15, w: 240, h: 200, label: 'Rebase' },
    { x: 495, y: 15, w: 210, h: 200, label: 'Squash merge' },
  ],
  nodes: [
    { id: 'c1', label: 'C', sub: 'main', x: 65, y: 170, w: 64, h: 44 },
    { id: 'e1', label: 'E', sub: 'feature', x: 65, y: 75, w: 64, h: 44 },
    { id: 'm', label: 'M', sub: '2 commit cha', x: 160, y: 122, w: 90, kind: 'good' },
    { id: 'c2', label: 'C', sub: 'main', x: 290, y: 170, w: 64, h: 44 },
    { id: 'd2', label: "D'", sub: 'hash mới', x: 360, y: 122, w: 64, h: 44 },
    { id: 'e2', label: "E'", sub: 'hash mới', x: 430, y: 74, w: 64, h: 44, kind: 'good' },
    { id: 'c3', label: 'C', sub: 'main', x: 550, y: 160, w: 64, h: 44 },
    { id: 's', label: 'S', sub: 'D + E gộp', x: 645, y: 95, w: 90, kind: 'good' },
  ],
  edges: [
    { from: 'c1', to: 'm' },
    { from: 'e1', to: 'm' },
    { from: 'c2', to: 'd2' },
    { from: 'd2', to: 'e2' },
    { from: 'c3', to: 's' },
  ],
  caption: 'Hình: Kết quả của ba cách gộp nhánh. Merge thêm commit M có hai cha; rebase chép D, E thành D′, E′ nối tiếp C; squash nén D và E thành một commit S.',
})}
${tbl(['Cách', 'Lịch sử sau khi gộp', 'Ưu điểm', 'Nhược điểm'], [
  ['<b>Merge</b>', 'Giữ nguyên mọi commit, thêm một merge commit nối hai nhánh', 'Không viết lại lịch sử, an toàn với nhánh dùng chung', 'Lịch sử nhiều nhánh rẽ, khó đọc khi có hàng trăm PR'],
  ['<b>Rebase</b>', 'Một đường thẳng, commit của feature được tạo lại trên đỉnh main', 'Lịch sử gọn, dễ <code>git bisect</code>', 'Đổi hash commit; nguy hiểm nếu người khác đã dựa trên commit cũ'],
  ['<b>Squash</b>', 'Mỗi feature thành đúng một commit trên main', 'Main sạch, mỗi commit ứng với một PR, dễ revert', 'Mất chi tiết từng bước nhỏ trong nhánh feature'],
])}
<p>Rebase có một "quy tắc vàng": không bao giờ rebase nhánh công khai mà người khác đang dùng. Rebase tạo commit mới với hash mới; ai đã kéo commit cũ về sẽ thấy lịch sử của mình và remote lệch nhau, và lần pull tiếp theo sẽ sinh ra các commit trùng lặp.</p>

<h2>Quy trình nhánh trong một nhóm</h2>
<p>Hầu hết nhóm hiện nay theo mô hình <b>feature branch</b> kết hợp pull request: mỗi tính năng làm trên nhánh riêng, mở PR để review và chạy CI, sau đó gộp vào <code>main</code>. Nhánh <code>main</code> luôn ở trạng thái có thể deploy.</p>
${diagram({
  w: 720, h: 280,
  nodes: [
    { id: 'f', label: 'feature/login', x: 90, y: 110, w: 130 },
    { id: 'pr', label: 'Pull request', sub: 'review + CI', x: 270, y: 110, w: 130, kind: 'lb' },
    { id: 'mn', label: 'main', sub: 'luôn deploy được', x: 450, y: 110, w: 140, kind: 'good' },
    { id: 'rl', label: 'Release', sub: 'tag v1.4.0', x: 630, y: 110, w: 120 },
    { id: 'hf', label: 'hotfix/payment', x: 450, y: 225, w: 140, kind: 'warn' },
  ],
  edges: [
    { from: 'f', to: 'pr', label: '1' },
    { from: 'pr', to: 'mn', label: '2' },
    { from: 'mn', to: 'rl', label: '3' },
    { from: 'mn', to: 'f', label: 'cập nhật từ main', curve: 90, dashed: true },
    { from: 'hf', to: 'mn', label: 'PR khẩn' },
  ],
  caption: 'Hình: Luồng feature branch. (1) mở PR; (2) gộp vào main sau khi review và CI xanh; (3) gắn tag để phát hành. Nhánh dài ngày nên thường xuyên cập nhật từ main.',
})}
${tbl(['Mô hình', 'Cách làm', 'Phù hợp'], [
  ['GitHub flow', 'Chỉ có <code>main</code> và các nhánh feature ngắn ngày, gộp qua PR', 'Web app deploy liên tục'],
  ['Git flow', 'Có thêm <code>develop</code>, <code>release/*</code>, <code>hotfix/*</code>', 'Sản phẩm phát hành theo phiên bản (app mobile, phần mềm đóng gói)'],
  ['Trunk-based', 'Commit nhỏ vào trunk nhiều lần mỗi ngày, tính năng dở dang ẩn sau feature flag', 'Nhóm lớn, CI mạnh, muốn tránh merge conflict lớn'],
])}
${tip('<b>Thực tế: Pinterest.</b> Monorepo Pinboard của Pinterest có khoảng 350 nghìn commit, dung lượng 20 GB và hơn 2.500 nhánh. Bước checkout trong pipeline Jenkins đã dùng shallow clone nhưng thiếu tùy chọn <code>refspec</code>, nên mỗi lần build vẫn tải mọi nhánh. Chỉ cần thêm refspec để fetch đúng nhánh <code>master</code>, thời gian clone giảm từ 40 phút xuống còn khoảng 30 giây.')}
${note('<b>Sai lầm thường gặp.</b> Rebase nhánh đã push rồi dùng <code>git push --force</code> đè lên commit của đồng nghiệp. Nếu buộc phải force push trên nhánh của mình, dùng <code>--force-with-lease</code>: Git sẽ từ chối nếu remote có commit mới mà bạn chưa thấy.')}
${interview([
  'Giải thích sự khác nhau giữa <code>git fetch</code> và <code>git pull</code>. Khi nào nên dùng <code>git pull --rebase</code>?',
  'Merge, rebase và squash khác nhau thế nào? Nhóm bạn nên chọn chiến lược nào cho PR vào main, vì sao?',
  'Bạn lỡ commit một file chứa mật khẩu và đã push lên remote. Bạn xử lý thế nào?',
])}`,
    keys: [
      'Git có bốn vùng lưu trữ: working directory, staging area, local repo và remote repo; hầu hết lệnh chỉ chuyển thay đổi giữa các vùng này.',
      'git pull bằng git fetch cộng git merge (hoặc rebase).',
      'Merge giữ nguyên lịch sử, rebase cho lịch sử thẳng nhưng đổi hash, squash gộp cả nhánh thành một commit.',
      'Không rebase nhánh công khai; nếu phải force push thì dùng --force-with-lease.',
    ],
    quiz: [
      { q: 'Lệnh nào tải commit mới từ remote về nhưng không thay đổi file trong working directory?', o: ['git pull', 'git fetch', 'git checkout', 'git merge'], a: 1, why: 'git fetch chỉ cập nhật local repo (các nhánh origin/*). git pull còn merge vào nhánh hiện tại nên làm thay đổi file.' },
      { q: 'Vì sao không nên rebase một nhánh mà đồng nghiệp đang dùng chung?', o: ['Rebase làm mất code', 'Rebase tạo commit mới với hash mới, làm lịch sử của người khác lệch với remote', 'Rebase chậm hơn merge', 'Rebase không chạy được trên remote'], a: 1, why: 'Commit cũ bị thay bằng commit mới. Ai đã dựa trên commit cũ sẽ gặp lịch sử phân nhánh và commit trùng lặp.' },
      { q: 'Bạn tạo tag v2.0.0 rồi chạy git push. Tag đã có trên remote chưa?', o: ['Có, push đẩy mọi thứ', 'Chưa, tag nằm ở local repo và phải push riêng', 'Có, nếu nhánh là main', 'Tag tự đồng bộ khi fetch'], a: 1, why: 'Mặc định git push không đẩy tag. Cần git push origin v2.0.0 hoặc git push --tags.' },
      { q: 'Chiến lược nào giúp mỗi PR tương ứng đúng một commit trên main?', o: ['Merge commit', 'Rebase', 'Squash merge', 'Cherry-pick'], a: 2, why: 'Squash nén toàn bộ commit của nhánh thành một commit duy nhất khi gộp vào main.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 2. Docker                                                           */
  /* ------------------------------------------------------------------ */
  {
    id: 'docker',
    mod: 'devops-cloud',
    title: 'Docker và container',
    pages: [128, 264],
    min: 11,
    level: 'co-ban',
    lede: 'Docker biến "chạy được trên máy tôi" thành "chạy được ở mọi nơi" bằng cách đóng gói ứng dụng cùng toàn bộ phụ thuộc vào một image. Đây là nền móng cho Kubernetes, CI/CD và gần như mọi hạ tầng cloud hiện đại.',
    body: `
<h2>Kiến trúc Docker</h2>
<p>Docker theo mô hình client–server với ba thành phần. <b>Docker client</b> là lệnh <code>docker</code> bạn gõ trong terminal. Nó không tự làm gì cả, chỉ gửi yêu cầu qua REST API tới <b>Docker daemon</b> (<code>dockerd</code>) chạy trên <b>Docker host</b>. Daemon quản lý mọi đối tượng: image, container, network, volume. Thành phần thứ ba là <b>registry</b>, kho lưu image; Docker Hub là registry công khai mặc định, doanh nghiệp thường dùng thêm registry riêng như Amazon ECR, Harbor hoặc GitHub Container Registry.</p>
${diagram({
  w: 720, h: 280,
  groups: [{ x: 190, y: 20, w: 345, h: 240, label: 'Docker host' }],
  nodes: [
    { id: 'cli', label: 'Docker client', sub: 'docker CLI', x: 90, y: 140, w: 130, h: 56, kind: 'client' },
    { id: 'dm', label: 'Docker daemon', sub: 'dockerd', x: 300, y: 140, w: 140, h: 56, kind: 'lb' },
    { id: 'img', label: 'Images', x: 455, y: 75, w: 110, kind: 'store' },
    { id: 'ct', label: 'Containers', x: 455, y: 205, w: 110, kind: 'good' },
    { id: 'reg', label: 'Registry', sub: 'Docker Hub, ECR', x: 640, y: 75, w: 120, kind: 'store' },
  ],
  edges: [
    { from: 'cli', to: 'dm', label: '1' },
    { from: 'dm', to: 'img' },
    { from: 'reg', to: 'img', label: '2', curve: 30 },
    { from: 'img', to: 'reg', label: 'push', curve: 30, dashed: true },
    { from: 'img', to: 'ct', label: '3' },
    { from: 'dm', to: 'ct' },
  ],
  caption: 'Hình: Kiến trúc Docker. (1) client gửi lệnh tới daemon; (2) daemon pull image từ registry nếu máy chưa có; (3) tạo container từ image. docker push đi theo chiều ngược lại.',
})}
<p>Khi chạy <code>docker run nginx</code>, daemon lần lượt làm năm việc theo sơ đồ dưới. Hiểu chuỗi này giúp bạn đoán được lỗi nằm ở đâu: không pull được image là vấn đề registry hoặc mạng, container tạo xong nhưng thoát ngay là vấn đề của process bên trong.</p>
${seq({
  actors: [
    { id: 'c', label: 'docker CLI', kind: 'client' },
    { id: 'd', label: 'Daemon', kind: 'lb' },
    { id: 'k', label: 'Container', kind: 'good' },
    { id: 'r', label: 'Registry', kind: 'external' },
  ],
  msgs: [
    { from: 'c', to: 'd', label: 'docker run nginx' },
    { from: 'd', to: 'd', label: 'tìm image local: chưa có' },
    { from: 'd', to: 'r', label: 'pull nginx:latest' },
    { from: 'r', to: 'd', label: 'các layer của image', dashed: true },
    { from: 'd', to: 'k', label: 'tạo container' },
    { from: 'd', to: 'k', label: 'cấp filesystem read-write' },
    { from: 'd', to: 'k', label: 'gắn network interface' },
    { from: 'd', to: 'k', label: 'start process chính', kind: 'good' },
    { from: 'k', to: 'c', label: 'log, exit code', dashed: true },
  ],
  caption: 'Hình: Các bước daemon thực hiện khi chạy docker run.',
})}

<h2>8 khái niệm phải biết</h2>
${tbl(['Khái niệm', 'Ý nghĩa'], [
  ['<b>Dockerfile</b>', 'Công thức build image: base image, cài phụ thuộc, copy code, lệnh khởi động.'],
  ['<b>Image</b>', 'Gói chỉ đọc chứa code, thư viện, runtime. Có tag để đánh phiên bản, ví dụ <code>api:1.4.2</code>.'],
  ['<b>Container</b>', 'Một instance đang chạy của image, cô lập với container khác và với host.'],
  ['<b>Registry</b>', 'Kho lưu và phân phối image, công khai (Docker Hub) hoặc riêng.'],
  ['<b>Volume</b>', 'Nơi lưu dữ liệu bền vững nằm ngoài filesystem của container; container xóa đi thì dữ liệu vẫn còn.'],
  ['<b>Docker Compose</b>', 'File YAML mô tả nhiều container (app, database, cache) và chạy cả cụm bằng một lệnh.'],
  ['<b>Network</b>', 'Mạng ảo cho container nói chuyện với nhau và với host; mạng tùy chỉnh giúp cô lập từng nhóm.'],
  ['<b>Docker CLI</b>', 'Công cụ dòng lệnh để build, run, quản lý volume, network.'],
])}

<h2>Container khác máy ảo ở đâu</h2>
${cols([
  { title: 'Máy ảo (VM)', body: '<p>Hypervisor giả lập phần cứng, mỗi VM chạy một hệ điều hành khách đầy đủ với kernel riêng. Image nặng vài GB, khởi động mất cỡ phút. Cô lập mạnh vì ranh giới nằm ở tầng phần cứng ảo.</p>' },
  { title: 'Container', body: '<p>Mọi container dùng chung kernel của host; Linux dùng <b>namespace</b> để cô lập (process, mạng, mount) và <b>cgroup</b> để giới hạn CPU, RAM. Image thường vài chục đến vài trăm MB, khởi động trong khoảng một giây.</p>' },
])}
<p>Vì dùng chung kernel, container Linux không chạy trực tiếp trên kernel Windows; Docker Desktop trên Windows và macOS thực chất chạy một VM Linux nhỏ ở bên dưới. Trong thực tế hai công nghệ thường đi cùng nhau: cloud cấp VM, và bạn chạy nhiều container trên mỗi VM.</p>

<h2>Image được xây từ các layer</h2>
<p>Mỗi lệnh <code>FROM</code>, <code>RUN</code>, <code>COPY</code> trong Dockerfile tạo ra một <b>layer</b> chỉ đọc. Layer được cache theo thứ tự: khi một layer thay đổi, mọi layer phía trên nó phải build lại. Khi chạy, Docker đặt thêm một layer read-write mỏng lên trên cùng cho riêng container đó.</p>
${diagram({
  w: 720, h: 320,
  groups: [{ x: 130, y: 75, w: 320, h: 230, label: 'Image (chỉ đọc)' }],
  nodes: [
    { id: 'rw', label: 'Container layer (read-write)', x: 290, y: 40, w: 280, h: 40, kind: 'good' },
    { id: 'l4', label: 'COPY . .   (code app)', x: 290, y: 120, w: 280, h: 40 },
    { id: 'l3', label: 'RUN npm ci', x: 290, y: 170, w: 280, h: 40 },
    { id: 'l2', label: 'COPY package*.json ./', x: 290, y: 220, w: 280, h: 40 },
    { id: 'l1', label: 'FROM node:20-alpine', x: 290, y: 270, w: 280, h: 40 },
    { id: 'a1', label: 'Sửa code', x: 620, y: 120, w: 120, kind: 'warn' },
    { id: 'a2', label: 'Sửa dependency', x: 620, y: 220, w: 130, kind: 'warn' },
  ],
  edges: [
    { from: 'a1', to: 'l4', label: 'build lại từ đây', kind: 'warn' },
    { from: 'a2', to: 'l2', label: 'build lại từ đây', kind: 'warn' },
  ],
  caption: 'Hình: Các layer của một image Node.js. Sửa code chỉ làm mất cache của layer trên cùng; npm ci chỉ chạy lại khi package.json thay đổi.',
})}
<p>Thứ tự trên là cố ý: copy file khai báo phụ thuộc trước, cài phụ thuộc, rồi mới copy code. Nếu đặt <code>COPY . .</code> lên đầu, mọi lần sửa một dòng code đều cài lại toàn bộ thư viện và build chậm đi nhiều lần.</p>
${tip('<b>Thực tế: multi-stage build.</b> Một service Go có thể build trong image <code>golang</code> nặng cỡ vài trăm MB, sau đó chỉ copy file binary sang stage cuối dùng image <code>distroless</code> hoặc <code>scratch</code>. Image chạy production chỉ còn vài chục MB, pull nhanh hơn khi scale và ít thư viện hơn nên bề mặt tấn công nhỏ hơn.')}
${note('<b>Sai lầm thường gặp.</b> Ghi dữ liệu quan trọng (file upload, database) vào filesystem của container. Layer read-write bị xóa cùng container, nên dữ liệu cần giữ phải nằm trên volume hoặc dịch vụ lưu trữ bên ngoài. Một lỗi khác là dùng tag <code>latest</code> ở production: không biết chính xác đang chạy phiên bản nào và khó rollback.')}
${interview([
  'Container và máy ảo khác nhau thế nào? Khi nào vẫn nên dùng VM?',
  'Dockerfile của bạn build mất 8 phút dù chỉ sửa một dòng code. Bạn tối ưu thế nào?',
  'Điều gì xảy ra với dữ liệu trong container khi container bị xóa? Làm sao để giữ dữ liệu?',
])}`,
    keys: [
      'Docker gồm client, daemon trên host và registry lưu image.',
      'Image là các layer chỉ đọc; container là image đang chạy cộng một layer read-write.',
      'Container dùng chung kernel với host (namespace, cgroup) nên nhẹ và khởi động nhanh hơn VM.',
      'Sắp xếp Dockerfile từ ít thay đổi đến hay thay đổi để tận dụng cache layer.',
      'Dữ liệu cần giữ phải nằm trên volume, không nằm trong container.',
    ],
    quiz: [
      { q: 'Lệnh docker build thực sự được thực thi ở đâu?', o: ['Trong Docker client', 'Trong Docker daemon', 'Trên Docker Hub', 'Trong container đang chạy'], a: 1, why: 'Client chỉ gửi yêu cầu qua API; daemon mới là thành phần build image, chạy container và quản lý tài nguyên.' },
      { q: 'Vì sao container khởi động nhanh hơn máy ảo?', o: ['Container dùng SSD', 'Container dùng chung kernel của host, không phải boot hệ điều hành', 'Container không có filesystem', 'Container chạy trên GPU'], a: 1, why: 'VM phải boot cả hệ điều hành khách; container chỉ là process được cô lập bằng namespace và cgroup.' },
      { q: 'Bạn sửa một file code. Layer nào trong Dockerfile mẫu phải build lại?', o: ['Tất cả các layer', 'Chỉ FROM', 'Layer COPY . . và các layer phía trên nó', 'Không layer nào'], a: 2, why: 'Cache bị vô hiệu từ layer đầu tiên có thay đổi trở lên; các layer bên dưới được dùng lại.' },
      { q: 'Thành phần nào của Docker dùng để lưu dữ liệu bền vững độc lập với vòng đời container?', o: ['Image', 'Network', 'Volume', 'Registry'], a: 2, why: 'Volume nằm ngoài filesystem của container và có thể chia sẻ giữa nhiều container.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 3. Kubernetes                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'kubernetes',
    mod: 'devops-cloud',
    title: 'Kubernetes (k8s)',
    pages: [297, 315, 126],
    min: 13,
    level: 'trung-binh',
    lede: 'Docker chạy được container trên một máy; Kubernetes điều phối hàng nghìn container trên hàng trăm máy. Nó tự đặt container lên máy phù hợp, tự khởi động lại khi chết và tự scale theo tải.',
    body: `
<h2>Kubernetes giải quyết vấn đề gì</h2>
<p>Kubernetes (viết tắt <b>k8s</b>, vì có 8 chữ cái giữa "k" và "s") là hệ thống <b>điều phối container</b> (container orchestration). Thiết kế của nó chịu ảnh hưởng lớn từ Borg, hệ thống nội bộ Google dùng để chạy dịch vụ của mình. Ý tưởng cốt lõi là <b>desired state</b>: bạn khai báo "tôi muốn 3 bản sao của service web", k8s liên tục so sánh trạng thái thực tế với mong muốn và tự sửa phần chênh lệch.</p>
<p>Một cluster gồm hai phần. <b>Control plane</b> là bộ não, ra quyết định cho toàn cluster. <b>Worker node</b> là các máy chạy ứng dụng. Mỗi cluster có ít nhất một worker node; ở production, control plane thường chạy trên nhiều máy và cluster có nhiều node để chịu được lỗi.</p>
${diagram({
  w: 720, h: 320,
  groups: [
    { x: 20, y: 78, w: 360, h: 230, label: 'Control plane' },
    { x: 410, y: 78, w: 295, h: 230, label: 'Worker node' },
  ],
  nodes: [
    { id: 'kc', label: 'kubectl', x: 295, y: 38, w: 120, h: 44, kind: 'client' },
    { id: 'sch', label: 'Scheduler', x: 110, y: 130, w: 140 },
    { id: 'cm', label: 'Controller\nmanager', x: 110, y: 205, w: 140, h: 52 },
    { id: 'etcd', label: 'etcd', sub: 'key-value', x: 110, y: 270, w: 140, kind: 'store' },
    { id: 'api', label: 'API server', sub: 'kube-apiserver', x: 295, y: 205, w: 140, h: 56, kind: 'lb' },
    { id: 'kl', label: 'kubelet', x: 490, y: 140, w: 120 },
    { id: 'kp', label: 'kube-proxy', x: 630, y: 140, w: 120 },
    { id: 'pods', label: 'Pods', sub: 'mỗi Pod một IP', x: 560, y: 245, w: 250, kind: 'good' },
  ],
  edges: [
    { from: 'kc', to: 'api', label: '1' },
    { from: 'api', to: 'etcd', label: '2' },
    { from: 'sch', to: 'api', label: '3' },
    { from: 'cm', to: 'api' },
    { from: 'api', to: 'kl', label: '4' },
    { from: 'kl', to: 'pods', label: '5' },
    { from: 'kp', to: 'pods' },
  ],
  caption: 'Hình: Thành phần của cluster k8s và luồng tạo một Pod. Cluster thật có nhiều worker node giống nhau.',
})}
<ol>
<li>Bạn chạy <code>kubectl apply -f deploy.yaml</code>. Mọi thao tác đều đi qua <b>API server</b>, cửa ngõ duy nhất của cluster.</li>
<li>API server xác thực, kiểm tra rồi lưu trạng thái mong muốn vào <b>etcd</b>, kho key-value phân tán (dùng thuật toán Raft) chứa toàn bộ dữ liệu cluster.</li>
<li><b>Scheduler</b> theo dõi các Pod chưa có node, chọn node phù hợp dựa trên CPU, RAM còn trống, affinity, taint, rồi ghi quyết định qua API server.</li>
<li><b>kubelet</b>, agent chạy trên mỗi node, thấy có Pod được giao cho mình.</li>
<li>kubelet gọi container runtime (containerd) để chạy container và báo trạng thái về. <b>kube-proxy</b> cấu hình luật mạng (iptables hoặc IPVS) để traffic gửi tới Service đến đúng Pod.</li>
</ol>
<p><b>Controller manager</b> chạy các vòng lặp điều khiển: Node controller phát hiện node chết, Job controller theo dõi job, EndpointSlice controller cập nhật danh sách Pod sau mỗi Service. Nếu một Pod chết, controller thấy số bản sao thiếu và tạo Pod mới.</p>

<h2>Các đối tượng cốt lõi</h2>
${diagram({
  w: 720, h: 340,
  nodes: [
    { id: 'u', label: 'Người dùng', x: 80, y: 250, w: 110, kind: 'client' },
    { id: 'ing', label: 'Ingress', sub: 'host, path', x: 250, y: 250, w: 120, kind: 'lb' },
    { id: 'svc', label: 'Service', sub: 'IP ổn định', x: 430, y: 250, w: 120, kind: 'lb' },
    { id: 'dep', label: 'Deployment', sub: 'replicas: 3', x: 250, y: 70, w: 130 },
    { id: 'rs', label: 'ReplicaSet', x: 430, y: 70, w: 120 },
    { id: 'pod', label: 'Pod × 3', sub: 'label app=web', x: 620, y: 160, w: 130, h: 56, kind: 'good' },
    { id: 'cfg', label: 'ConfigMap\nSecret', x: 620, y: 295, w: 120, kind: 'store' },
  ],
  edges: [
    { from: 'u', to: 'ing' },
    { from: 'ing', to: 'svc' },
    { from: 'svc', to: 'pod', label: 'selector' },
    { from: 'dep', to: 'rs' },
    { from: 'rs', to: 'pod', label: 'giữ đủ 3' },
    { from: 'cfg', to: 'pod', label: 'env / volume', dashed: true },
  ],
  caption: 'Hình: Deployment quản lý ReplicaSet, ReplicaSet giữ đủ số Pod; Service chọn Pod theo label và Ingress đưa traffic HTTP từ ngoài vào.',
})}
${tbl(['Đối tượng', 'Vai trò'], [
  ['<b>Pod</b>', 'Đơn vị nhỏ nhất k8s quản lý, gồm một hoặc vài container dùng chung IP và volume.'],
  ['<b>Deployment</b> / <b>ReplicaSet</b>', 'Chạy N bản sao Pod không trạng thái, hỗ trợ rolling update và rollback.'],
  ['<b>StatefulSet</b>', 'Pod có tên và ổ đĩa cố định (db-0, db-1), dùng cho database, Kafka.'],
  ['<b>DaemonSet</b>', 'Chạy đúng một Pod trên mỗi node, ví dụ agent thu log hoặc metrics.'],
  ['<b>Job</b> / <b>CronJob</b>', 'Tác vụ chạy xong rồi dừng, hoặc chạy theo lịch.'],
  ['<b>Service</b>', 'Địa chỉ ổn định trước nhóm Pod thay đổi liên tục: ClusterIP, NodePort, LoadBalancer.'],
  ['<b>Ingress</b>', 'Định tuyến HTTP theo host và path từ ngoài vào các Service.'],
  ['<b>ConfigMap</b> / <b>Secret</b>', 'Tách cấu hình và thông tin bí mật khỏi image.'],
])}

<h2>10 design pattern trên k8s</h2>
<p>Sách tổng hợp 10 pattern, chia thành bốn nhóm:</p>
${tbl(['Nhóm', 'Pattern', 'Ý chính'], [
  ['Nền tảng', 'Health Probe', 'Container phải có endpoint liveness/readiness để k8s biết khi nào restart hoặc ngừng gửi traffic.'],
  ['Nền tảng', 'Predictable Demands', 'Khai báo <code>requests</code>/<code>limits</code> CPU, RAM và các phụ thuộc lúc chạy.'],
  ['Nền tảng', 'Automated Placement', 'Hiểu cách scheduler đặt Pod: affinity, taint, toleration.'],
  ['Cấu trúc', 'Init Container', 'Container chạy xong trước container chính, ví dụ chờ database, chạy migration.'],
  ['Cấu trúc', 'Sidecar', 'Thêm năng lực (thu log, proxy mTLS) mà không sửa container chính.'],
  ['Hành vi', 'Batch Job', 'Quản lý đơn vị công việc độc lập, chạy xong là dừng.'],
  ['Hành vi', 'Stateful Service', 'Ứng dụng phân tán có trạng thái, định danh và ổ đĩa ổn định.'],
  ['Hành vi', 'Service Discovery', 'Client tìm service qua DNS nội bộ và Service.'],
  ['Cấp cao', 'Controller', 'Theo dõi trạng thái thực tế và đưa về trạng thái khai báo.'],
  ['Cấp cao', 'Operator', 'Đóng gói kiến thức vận hành (backup, failover) thành code, ví dụ operator cho PostgreSQL.'],
])}
<p>Ngoài sidecar, nhóm cấu trúc còn hai pattern hay gặp. <b>Ambassador</b> là container proxy đứng giữa app và dịch vụ bên ngoài (ví dụ proxy tới cụm Redis shard), giúp app chỉ cần gọi <code>localhost</code>. <b>Adapter</b> chuyển đổi đầu ra của app sang định dạng chuẩn, ví dụ exporter biến số liệu nội bộ thành metrics Prometheus.</p>
${diagram({
  w: 720, h: 260,
  groups: [{ x: 110, y: 25, w: 420, h: 215, label: 'Pod' }],
  nodes: [
    { id: 'ini', label: 'Init container', sub: 'chạy xong thì thoát', x: 215, y: 85, w: 160, h: 52, kind: 'external' },
    { id: 'vol', label: 'Volume chung', sub: 'emptyDir', x: 425, y: 85, w: 130, kind: 'store' },
    { id: 'app', label: 'App container', x: 215, y: 190, w: 160, kind: 'good' },
    { id: 'sc', label: 'Sidecar', sub: 'log agent', x: 425, y: 190, w: 130 },
    { id: 'ext', label: 'Hệ thống log', x: 630, y: 190, w: 120, kind: 'external' },
  ],
  edges: [
    { from: 'ini', to: 'app', label: 'xong mới chạy' },
    { from: 'app', to: 'vol', label: 'ghi log' },
    { from: 'vol', to: 'sc', label: 'đọc' },
    { from: 'sc', to: 'ext', label: 'gửi đi' },
  ],
  caption: 'Hình: Init container và sidecar trong cùng một Pod. App chỉ ghi log ra file; sidecar lo việc đọc và gửi log đi.',
})}

<h2>Hệ sinh thái công cụ</h2>
<p>Bản thân k8s chỉ là lõi. Một cluster production thường cần thêm công cụ ở nhiều mảng:</p>
${tbl(['Mảng', 'Công cụ phổ biến'], [
  ['Đóng gói, cấu hình', 'Helm, Kustomize'],
  ['GitOps, CD', 'Argo CD, Flux'],
  ['Monitoring, logging', 'Prometheus, Grafana, Fluent Bit, Loki'],
  ['Service mesh', 'Istio, Linkerd'],
  ['Mạng (CNI)', 'Calico, Cilium'],
  ['Bảo mật, policy', 'Falco, OPA Gatekeeper, Kyverno'],
  ['Autoscaling', 'HPA, KEDA, Cluster Autoscaler, Karpenter'],
  ['Quản lý, giao diện', 'k9s, Lens, Rancher'],
])}
${tip('<b>Thực tế.</b> Các dịch vụ k8s có quản lý như EKS (AWS), AKS (Azure), GKE (Google) vận hành control plane giúp bạn: etcd được backup, API server có nhiều bản sao. Đội của bạn chỉ còn lo worker node và ứng dụng. Với nhóm nhỏ, đây gần như luôn là lựa chọn hợp lý hơn tự dựng cluster.')}
${note('<b>Sai lầm thường gặp.</b> Không khai báo <code>resources.requests</code> và readiness probe. Thiếu requests, scheduler xếp quá nhiều Pod lên một node và chúng tranh nhau RAM rồi bị OOM kill. Thiếu readiness probe, Service gửi traffic vào Pod khi app còn đang khởi động, người dùng nhận lỗi 502 mỗi lần deploy.')}
${interview([
  'Mô tả điều gì xảy ra từ lúc chạy <code>kubectl apply</code> tới khi container chạy trên một node.',
  'Nếu etcd mất dữ liệu thì cluster bị ảnh hưởng thế nào? Bạn bảo vệ etcd ra sao?',
  'Liveness probe và readiness probe khác nhau thế nào? Cấu hình sai liveness probe có thể gây ra sự cố gì?',
  'Khi nào dùng StatefulSet thay cho Deployment?',
])}`,
    keys: [
      'Control plane (API server, etcd, scheduler, controller manager) ra quyết định; worker node (kubelet, kube-proxy, Pod) chạy ứng dụng.',
      'Mọi thao tác đi qua API server; etcd là nơi duy nhất lưu trạng thái cluster.',
      'K8s hoạt động theo desired state: controller liên tục đưa trạng thái thực tế về trạng thái khai báo.',
      'Pod là đơn vị nhỏ nhất; Deployment quản lý Pod không trạng thái, Service cho địa chỉ ổn định.',
      'Sidecar, init container, ambassador, adapter là các pattern tổ chức nhiều container trong một Pod.',
    ],
    quiz: [
      { q: 'Thành phần nào chọn node để chạy một Pod mới?', o: ['kubelet', 'Scheduler', 'etcd', 'kube-proxy'], a: 1, why: 'Scheduler theo dõi Pod chưa được gán node và chọn node dựa trên tài nguyên và ràng buộc.' },
      { q: 'Toàn bộ trạng thái của cluster được lưu ở đâu?', o: ['Trên từng kubelet', 'Trong etcd', 'Trong API server RAM', 'Trong container registry'], a: 1, why: 'etcd là kho key-value phân tán làm backing store cho mọi dữ liệu cluster; API server là thành phần duy nhất đọc ghi trực tiếp vào etcd.' },
      { q: 'Bạn muốn thêm chức năng gửi log mà không sửa image của ứng dụng. Pattern nào phù hợp?', o: ['Init container', 'Sidecar', 'Batch Job', 'Operator'], a: 1, why: 'Sidecar chạy cạnh container chính trong cùng Pod, mở rộng chức năng mà không đổi container chính.' },
      { q: 'Một Pod bị xóa ngoài ý muốn. Thành phần nào phát hiện và tạo Pod thay thế?', o: ['kubectl', 'Controller (ReplicaSet controller trong controller manager)', 'kube-proxy', 'Ingress'], a: 1, why: 'Controller so sánh số Pod thực tế với số replicas mong muốn và tạo Pod mới để bù.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 4. CI/CD và GitOps                                                  */
  /* ------------------------------------------------------------------ */
  {
    id: 'cicd-gitops',
    mod: 'devops-cloud',
    title: 'CI/CD, GitOps và đưa code lên production',
    pages: [104, 66, 295, 302],
    min: 13,
    level: 'trung-binh',
    lede: 'Viết code mới là nửa đầu; nửa sau là đưa code đó lên production an toàn, lặp lại được và rollback được. Bài này đi qua pipeline điển hình, GitOps, các chiến lược deploy và cách đánh số phiên bản.',
    body: `
<h2>Một dòng code đi tới production như thế nào</h2>
<p><b>CI</b> (continuous integration) là việc tự động build và test mỗi khi có code mới. <b>CD</b> (continuous delivery/deployment) là việc tự động đưa bản build đã qua kiểm tra lên các môi trường, tới tận production. Sách mô tả một quy trình điển hình ở doanh nghiệp như sau.</p>
${diagram({
  w: 720, h: 360,
  nodes: [
    { id: 'us', label: 'User story', sub: 'backlog, sprint', x: 90, y: 70, w: 130, kind: 'client' },
    { id: 'git', label: 'Git repo', x: 270, y: 70, w: 120, kind: 'store' },
    { id: 'ci', label: 'CI: Jenkins', sub: 'test, SonarQube', x: 450, y: 70, w: 140 },
    { id: 'art', label: 'Artifactory', sub: 'lưu bản build', x: 630, y: 70, w: 130, kind: 'store' },
    { id: 'dev', label: 'Dev', x: 630, y: 200, w: 120 },
    { id: 'qa', label: 'QA1 / QA2', x: 450, y: 200, w: 120 },
    { id: 'uat', label: 'UAT', x: 270, y: 200, w: 120 },
    { id: 'prod', label: 'Production', x: 90, y: 200, w: 130, kind: 'good' },
    { id: 'sre', label: 'SRE giám sát', sub: 'metrics, alert', x: 90, y: 315, w: 130 },
  ],
  edges: [
    { from: 'us', to: 'git', label: '1' },
    { from: 'git', to: 'ci', label: '2' },
    { from: 'ci', to: 'art', label: '3' },
    { from: 'art', to: 'dev', label: '4' },
    { from: 'dev', to: 'qa', label: '5' },
    { from: 'qa', to: 'uat', label: '6' },
    { from: 'uat', to: 'prod', label: '7' },
    { from: 'prod', to: 'sre', label: '8', dashed: true },
  ],
  caption: 'Hình: Hành trình của một thay đổi từ user story tới production, đi qua nhiều môi trường kiểm thử.',
})}
<ol>
<li>Product owner viết user story; nhóm dev đưa vào sprint (thường 2 tuần) và commit code vào Git.</li>
<li>Commit kích hoạt build trên Jenkins: phải qua unit test, ngưỡng code coverage và quality gate của SonarQube.</li>
<li>Bản build thành công được lưu vào kho artifact (Artifactory). Từ đây mọi môi trường dùng đúng một bản build, không build lại.</li>
<li>Deploy lên môi trường dev.</li>
<li>Nhiều nhóm làm song song nên mỗi tính năng được deploy sang QA1, QA2 để test độc lập: QA, regression, performance.</li>
<li>Qua QA thì lên UAT để người dùng nghiệp vụ nghiệm thu.</li>
<li>UAT đạt thì bản build thành release candidate và được deploy lên production theo lịch.</li>
<li>Đội SRE theo dõi production sau khi phát hành.</li>
</ol>

<h2>GitOps: Git là nguồn sự thật duy nhất</h2>
<p><b>GitOps</b> đưa toàn bộ cấu hình hạ tầng và ứng dụng vào Git dưới dạng khai báo (YAML, Helm chart). Muốn đổi production thì mở PR, không ai chạy lệnh tay vào cluster. Sách nêu các đặc điểm: quản lý phiên bản và cộng tác qua Git; hệ thống mô tả theo kiểu khai báo; tự động deploy khi Git thay đổi; hạ tầng bất biến (sửa qua Git chứ không sửa trực tiếp); quan sát liên tục để trạng thái thật khớp với Git; và mọi thay đổi đều có dấu vết phục vụ bảo mật, kiểm toán.</p>
${diagram({
  w: 720, h: 310,
  groups: [{ x: 20, y: 175, w: 300, h: 115, label: 'Kubernetes cluster' }],
  nodes: [
    { id: 'dv', label: 'Developer', x: 80, y: 70, w: 110, kind: 'client' },
    { id: 'ar', label: 'App repo', sub: 'source code', x: 250, y: 70, w: 120, kind: 'store' },
    { id: 'ci', label: 'CI pipeline', sub: 'build, test', x: 430, y: 70, w: 130 },
    { id: 'rg', label: 'Image registry', x: 620, y: 70, w: 140, kind: 'store' },
    { id: 'cr', label: 'Config repo', sub: 'manifest, Helm', x: 430, y: 230, w: 140, kind: 'store' },
    { id: 'argo', label: 'Argo CD', sub: 'so sánh, sync', x: 245, y: 240, w: 120, kind: 'lb' },
    { id: 'wl', label: 'Workloads', x: 95, y: 240, w: 100, kind: 'good' },
  ],
  edges: [
    { from: 'dv', to: 'ar', label: '1' },
    { from: 'ar', to: 'ci', label: '2' },
    { from: 'ci', to: 'rg', label: '3' },
    { from: 'ci', to: 'cr', label: '4' },
    { from: 'argo', to: 'cr', label: '5' },
    { from: 'argo', to: 'wl', label: '6' },
  ],
  caption: 'Hình: GitOps theo mô hình pull. (1–2) push code kích hoạt CI; (3) CI đẩy image; (4) CI cập nhật tag image trong config repo; (5) Argo CD trong cluster theo dõi config repo; (6) phát hiện khác biệt thì sync vào cluster.',
})}
${cols([
  { title: 'Mô hình push', body: '<p>CI pipeline chạy <code>kubectl apply</code> hoặc <code>helm upgrade</code> trực tiếp vào cluster. Đơn giản, nhưng CI phải giữ credential có quyền ghi vào cluster, và nếu ai đó sửa tay trên cluster thì không ai biết.</p>' },
  { title: 'Mô hình pull (GitOps)', body: '<p>Agent chạy bên trong cluster (Argo CD, Flux) kéo cấu hình từ Git và tự đồng bộ. Credential cluster không rời khỏi cluster. Agent phát hiện <b>drift</b> (cấu hình thật lệch Git) và đưa về đúng. Rollback bằng <code>git revert</code>.</p>' },
])}

<h2>Chiến lược deploy</h2>
${diagram({
  w: 720, h: 260,
  groups: [
    { x: 15, y: 20, w: 340, h: 225, label: 'Blue-green' },
    { x: 365, y: 20, w: 340, h: 225, label: 'Canary' },
  ],
  nodes: [
    { id: 'lb1', label: 'Load balancer', x: 185, y: 80, w: 140, kind: 'lb' },
    { id: 'bl', label: 'Blue (v1)', sub: 'đang live', x: 100, y: 195, w: 130 },
    { id: 'gr', label: 'Green (v2)', sub: 'đã test xong', x: 270, y: 195, w: 130, kind: 'good' },
    { id: 'lb2', label: 'Load balancer', x: 535, y: 80, w: 140, kind: 'lb' },
    { id: 'v1', label: 'v1', sub: '90% traffic', x: 450, y: 195, w: 130 },
    { id: 'v2', label: 'v2 (canary)', sub: '10% traffic', x: 620, y: 195, w: 130, kind: 'good' },
  ],
  edges: [
    { from: 'lb1', to: 'bl', label: 'hiện tại' },
    { from: 'lb1', to: 'gr', label: 'đổi 1 lần', dashed: true },
    { from: 'lb2', to: 'v1', label: '90%' },
    { from: 'lb2', to: 'v2', label: '10%' },
  ],
  caption: 'Hình: Blue-green chuyển toàn bộ traffic sang môi trường mới trong một lần; canary chuyển từng phần nhỏ và tăng dần nếu số liệu ổn.',
})}
${tbl(['Chiến lược', 'Cách làm', 'Ưu điểm', 'Nhược điểm'], [
  ['<b>Rolling</b>', 'Thay dần từng instance cũ bằng instance mới (mặc định của Deployment k8s)', 'Không tốn thêm hạ tầng', 'Hai phiên bản chạy song song một lúc; rollback chậm'],
  ['<b>Blue-green</b>', 'Dựng đủ môi trường mới, test xong thì chuyển load balancer', 'Chuyển và rollback gần như tức thì', 'Tốn gấp đôi tài nguyên trong lúc deploy; schema DB phải tương thích hai chiều'],
  ['<b>Canary</b>', 'Cho 1–10% traffic vào bản mới, theo dõi lỗi và latency rồi tăng dần', 'Lỗi chỉ ảnh hưởng nhóm nhỏ người dùng', 'Cần metrics tốt và công cụ chia traffic'],
])}

<h2>Số phiên bản nói lên điều gì</h2>
<p><b>Semantic Versioning</b> dùng dạng <code>MAJOR.MINOR.PATCH</code>. Tăng PATCH khi sửa lỗi mà không đổi API; tăng MINOR khi thêm tính năng nhưng vẫn tương thích ngược; tăng MAJOR khi có thay đổi phá vỡ tương thích. Dự án thường bắt đầu ở <code>0.1.0</code> và phát hành bản ổn định đầu tiên là <code>1.0.0</code>. Ví dụ: sửa lỗi trên 1.0.0 thành 1.0.1; thêm tính năng tương thích trên 1.0.3 thành 1.1.0; đổi API không tương thích trên 1.2.2 thành 2.0.0. Bản thử nghiệm có hậu tố như <code>1.0.0-beta</code>, <code>1.0.0-rc.1</code>; thông tin build gắn sau dấu cộng: <code>1.0.0+20240313</code>.</p>
<p>Quy ước này cho phép công cụ quản lý gói tự nâng cấp an toàn. Trong npm, <code>^1.2.3</code> chấp nhận mọi bản từ 1.2.3 tới dưới 2.0.0, còn <code>~1.2.3</code> chỉ chấp nhận bản vá 1.2.x.</p>

<h2>Các mô hình phát triển phần mềm (SDLC)</h2>
${tbl(['Mô hình', 'Đặc điểm', 'Hợp với'], [
  ['Waterfall', 'Tuần tự: yêu cầu, thiết kế, lập trình, kiểm thử, bảo trì; xong bước này mới sang bước sau', 'Yêu cầu rõ và ít đổi'],
  ['V-Model', 'Mở rộng waterfall, mỗi giai đoạn phát triển có một giai đoạn kiểm thử tương ứng', 'Hệ thống cần kiểm định chặt (y tế, ô tô)'],
  ['Iterative / Incremental', 'Xây hệ thống qua nhiều vòng, mỗi vòng thêm hoặc hoàn thiện một phần', 'Sản phẩm lớn cần ra bản dùng được sớm'],
  ['Spiral', 'Mỗi vòng gồm lập kế hoạch, phân tích rủi ro, phát triển, đánh giá', 'Dự án lớn, rủi ro cao'],
  ['Agile', 'Sprint ngắn, giao từng phần, nhận phản hồi liên tục (Scrum, Kanban, XP)', 'Yêu cầu thay đổi thường xuyên'],
  ['RAD', 'Ưu tiên làm prototype nhanh và lấy phản hồi sớm', 'Ứng dụng nhỏ, cần ra mắt nhanh'],
  ['Big Bang', 'Gần như không lập kế hoạch, tích hợp và test tất cả một lần', 'Dự án rất nhỏ hoặc thử nghiệm'],
])}
${tip('<b>Thực tế.</b> Argo CD là dự án do Intuit khởi xướng và hiện thuộc CNCF; nhiều công ty dùng nó để quản lý hàng trăm cluster từ một chỗ. Một quy trình phổ biến: CI chỉ được quyền ghi vào config repo, còn quyền ghi vào cluster chỉ có Argo CD, nên mọi thay đổi production đều để lại dấu vết trong Git.')}
${note('<b>Sai lầm thường gặp.</b> Build lại artifact cho từng môi trường. Bản đã test ở QA khác bản chạy trên production, và lỗi chỉ xuất hiện ở production. Hãy build một lần, đánh tag bất biến (ví dụ theo commit SHA), rồi promote đúng artifact đó qua các môi trường; chỉ cấu hình là khác nhau.')}
${interview([
  'Thiết kế pipeline CI/CD cho một microservice: các bước, các cổng kiểm tra và cách rollback.',
  'GitOps pull model khác push model thế nào? Vì sao pull model được coi là an toàn hơn?',
  'So sánh blue-green và canary. Khi thay đổi có migration database thì bạn cẩn thận điều gì?',
])}`,
    keys: [
      'CI tự động build và test; CD tự động đưa một artifact duy nhất qua dev, QA, UAT tới production.',
      'GitOps lấy Git làm nguồn sự thật; agent trong cluster (Argo CD, Flux) kéo cấu hình về và sửa drift.',
      'Rolling tiết kiệm tài nguyên, blue-green rollback tức thì, canary giới hạn phạm vi ảnh hưởng.',
      'SemVer: MAJOR phá tương thích, MINOR thêm tính năng tương thích, PATCH sửa lỗi.',
    ],
    quiz: [
      { q: 'Thư viện đang ở 2.3.1, bạn thêm một hàm mới mà không làm hỏng API cũ. Phiên bản tiếp theo là gì?', o: ['2.3.2', '2.4.0', '3.0.0', '2.3.1-beta'], a: 1, why: 'Thêm tính năng tương thích ngược thì tăng MINOR và đặt PATCH về 0.' },
      { q: 'Trong GitOps theo mô hình pull, thành phần nào áp cấu hình vào cluster?', o: ['CI pipeline chạy kubectl', 'Agent trong cluster như Argo CD', 'Developer từ máy cá nhân', 'Image registry'], a: 1, why: 'Agent chạy trong cluster theo dõi Git và tự đồng bộ, nên credential cluster không cần nằm ở CI.' },
      { q: 'Chiến lược nào cho 5% người dùng dùng thử bản mới trước khi mở rộng?', o: ['Blue-green', 'Rolling', 'Canary', 'Recreate'], a: 2, why: 'Canary chuyển một phần nhỏ traffic sang bản mới và tăng dần nếu số liệu ổn.' },
      { q: 'Mô hình SDLC nào đặt phân tích rủi ro vào mỗi vòng lặp?', o: ['Waterfall', 'Spiral', 'Big Bang', 'RAD'], a: 1, why: 'Mỗi vòng của Spiral gồm lập kế hoạch, phân tích rủi ro, phát triển và đánh giá.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 5. Cloud                                                            */
  /* ------------------------------------------------------------------ */
  {
    id: 'cloud',
    mod: 'devops-cloud',
    title: 'Dịch vụ cloud và tối ưu chi phí',
    pages: [29, 179, 235, 240, 118, 155, 108],
    min: 11,
    level: 'co-ban',
    lede: 'AWS có hơn 200 dịch vụ, Azure và Google Cloud cũng không kém. Tin tốt là các nhà cung cấp đều có cùng một bộ khối xây dựng, chỉ khác tên. Biết bộ khối đó và biết cách giữ hóa đơn trong tầm kiểm soát là đủ để bắt đầu.',
    body: `
<h2>Ba mức dịch vụ: IaaS, PaaS, SaaS</h2>
<p>Cloud chia theo mức độ nhà cung cấp lo giúp bạn. Càng lên cao bạn càng ít phải vận hành, đổi lại càng ít quyền kiểm soát.</p>
${tbl(['Mức', 'Nhà cung cấp lo', 'Bạn lo', 'Ví dụ'], [
  ['<b>IaaS</b>', 'Phần cứng, mạng, ảo hóa', 'Hệ điều hành, runtime, ứng dụng, dữ liệu', 'EC2, Azure VM, Compute Engine'],
  ['<b>PaaS</b>', 'Thêm hệ điều hành, runtime, scale', 'Code và dữ liệu', 'Elastic Beanstalk, App Engine, Azure App Service'],
  ['<b>FaaS</b> (serverless)', 'Gần như mọi thứ, tính tiền theo lần chạy', 'Từng hàm xử lý sự kiện', 'Lambda, Azure Functions, Cloud Functions'],
  ['<b>SaaS</b>', 'Toàn bộ phần mềm', 'Chỉ dùng và cấu hình', 'Gmail, Microsoft 365, Salesforce'],
])}

<h2>Cùng một khối, ba cái tên</h2>
<p>Sách có cheat sheet đối chiếu dịch vụ giữa các nhà cung cấp lớn. Bảng dưới rút gọn các nhóm quan trọng nhất cho AWS, Azure và Google Cloud.</p>
${tbl(['Nhóm', 'AWS', 'Azure', 'Google Cloud'], [
  ['Máy ảo', 'EC2', 'Virtual Machines', 'Compute Engine'],
  ['Kubernetes', 'EKS', 'AKS', 'GKE'],
  ['Serverless', 'Lambda', 'Functions', 'Cloud Functions, Cloud Run'],
  ['Object storage', 'S3', 'Blob Storage', 'Cloud Storage'],
  ['SQL có quản lý', 'RDS, Aurora', 'Azure SQL Database', 'Cloud SQL, Spanner'],
  ['NoSQL', 'DynamoDB', 'Cosmos DB', 'Firestore, Bigtable'],
  ['Cache', 'ElastiCache', 'Azure Cache for Redis', 'Memorystore'],
  ['Queue, streaming', 'SQS, Kinesis', 'Service Bus, Event Hubs', 'Pub/Sub'],
  ['DNS, CDN', 'Route 53, CloudFront', 'Azure DNS, Front Door', 'Cloud DNS, Cloud CDN'],
  ['Data warehouse', 'Redshift', 'Synapse Analytics', 'BigQuery'],
  ['Định danh, quyền', 'IAM', 'Entra ID, RBAC', 'Cloud IAM'],
  ['Monitoring', 'CloudWatch', 'Azure Monitor', 'Cloud Monitoring'],
])}

<h2>Những dịch vụ AWS nên học trước</h2>
<p>AWS ra mắt năm 2006 với S3 và EC2, nay có hơn 200 dịch vụ. Không cần học hết. Một ứng dụng web điển hình chỉ dùng khoảng mười dịch vụ, và nắm vững chúng là đủ cho phần lớn bài toán. Học theo thứ tự: compute (EC2, Lambda), lưu trữ (S3), database (RDS, DynamoDB), mạng (VPC, Route 53, CloudFront, ELB), bảo mật (IAM), giám sát (CloudWatch). Sau đó mới tới các dịch vụ chuyên biệt như SQS, SNS, ECS/EKS, Kinesis, SageMaker.</p>
${diagram({
  w: 720, h: 370,
  nodes: [
    { id: 'u', label: 'Người dùng', x: 80, y: 180, w: 110, kind: 'client' },
    { id: 'r53', label: 'Route 53', sub: 'DNS', x: 240, y: 65, w: 120 },
    { id: 'cf', label: 'CloudFront', sub: 'CDN', x: 240, y: 180, w: 120 },
    { id: 's3', label: 'S3', sub: 'file tĩnh', x: 240, y: 305, w: 120, kind: 'store' },
    { id: 'alb', label: 'ALB', sub: 'load balancer', x: 400, y: 180, w: 120, kind: 'lb' },
    { id: 'app', label: 'EC2 / ECS', sub: 'Auto Scaling', x: 555, y: 180, w: 130 },
    { id: 'cw', label: 'CloudWatch', sub: 'metrics, log', x: 555, y: 65, w: 130 },
    { id: 'rds', label: 'RDS', sub: 'PostgreSQL', x: 470, y: 305, w: 130, kind: 'store' },
    { id: 'ec', label: 'ElastiCache', sub: 'Redis', x: 630, y: 305, w: 120, kind: 'cache' },
  ],
  edges: [
    { from: 'u', to: 'r53', label: '1' },
    { from: 'u', to: 'cf', label: '2' },
    { from: 'cf', to: 's3', label: '3' },
    { from: 'cf', to: 'alb', label: '4' },
    { from: 'alb', to: 'app', label: '5' },
    { from: 'app', to: 'rds' },
    { from: 'app', to: 'ec' },
    { from: 'app', to: 'cw', dashed: true },
  ],
  caption: 'Hình: Ứng dụng web điển hình trên AWS ghép từ khoảng mười dịch vụ cơ bản.',
})}
<ol>
<li>Trình duyệt hỏi Route 53 để phân giải tên miền.</li>
<li>Request tới CloudFront, CDN gần người dùng nhất.</li>
<li>File tĩnh (ảnh, JS, CSS) lấy từ S3 và được cache ở edge.</li>
<li>Request động đi tới Application Load Balancer.</li>
<li>ALB phân phối tới các instance trong Auto Scaling group; instance đọc cache Redis trước, rồi tới RDS, và đẩy metrics, log về CloudWatch.</li>
</ol>

<h2>Chọn loại load balancer trên cloud</h2>
${diagram({
  w: 720, h: 300,
  nodes: [
    { id: 'c', label: 'Client', x: 80, y: 160, w: 100, kind: 'client' },
    { id: 'g', label: 'Global LB', sub: 'DNS / Anycast', x: 250, y: 160, w: 130, kind: 'lb' },
    { id: 'l7', label: 'Lớp 7 (L7)', sub: 'ALB, App Gateway', x: 450, y: 85, w: 150, kind: 'lb' },
    { id: 'l4', label: 'Lớp 4 (L4)', sub: 'NLB, Azure LB', x: 450, y: 235, w: 150, kind: 'lb' },
    { id: 'web', label: 'Web / API', x: 635, y: 85, w: 110 },
    { id: 'gm', label: 'Game, IoT', sub: 'TCP / UDP', x: 635, y: 235, w: 110 },
  ],
  edges: [
    { from: 'c', to: 'g' },
    { from: 'g', to: 'l7', label: 'HTTP(S)' },
    { from: 'g', to: 'l4', label: 'TCP/UDP' },
    { from: 'l7', to: 'web' },
    { from: 'l4', to: 'gm' },
  ],
  caption: 'Hình: Global LB chọn region gần nhất; trong region, L7 định tuyến theo nội dung HTTP còn L4 chuyển tiếp kết nối TCP/UDP.',
})}
${tbl(['Loại', 'Hoạt động ở', 'AWS', 'Azure', 'Google Cloud'], [
  ['Ứng dụng (L7)', 'HTTP: định tuyến theo path, host, header; kết thúc TLS', 'ALB', 'Application Gateway', 'Application Load Balancer'],
  ['Mạng (L4)', 'TCP/UDP, độ trễ rất thấp, IP tĩnh', 'NLB', 'Azure Load Balancer', 'Network Load Balancer'],
  ['Toàn cầu', 'Phân phối giữa các region, anycast hoặc DNS', 'Global Accelerator, Route 53', 'Front Door, Traffic Manager', 'Global external Application LB'],
  ['Appliance', 'Đưa traffic qua firewall, thiết bị bảo mật', 'Gateway Load Balancer', 'Gateway Load Balancer', 'Packet Mirroring, NGFW'],
])}

<h2>Giảm chi phí cloud</h2>
<p>Hóa đơn cloud không hợp lý là nỗi đau của rất nhiều tổ chức. Sách gom lại sáu kỹ thuật:</p>
${tbl(['Kỹ thuật', 'Cách làm'], [
  ['Giảm mức dùng', 'Thu nhỏ instance, dọn bớt storage, gộp các service nhỏ.'],
  ['Xóa tài nguyên nhàn rỗi', 'Tìm và xóa instance, database, ổ đĩa, snapshot không ai dùng.'],
  ['Right-sizing', 'Chọn cỡ instance theo số liệu sử dụng thật: CPU 5% cả tháng là dấu hiệu chọn quá to.'],
  ['Tắt ngoài giờ', 'Lên lịch tắt môi trường dev, test vào ban đêm và cuối tuần.'],
  ['Cam kết để giảm giá', 'Reserved Instances hoặc Savings Plans cho tải ổn định (AWS công bố giảm tới khoảng 72%). Spot Instances cho tải chịu được gián đoạn (giảm tới 90%), cùng các lớp storage rẻ hơn cho dữ liệu ít truy cập.'],
  ['Tối ưu truyền dữ liệu', 'Nén dữ liệu, dùng CDN, đặt các thành phần nói chuyện nhiều trong cùng region hoặc AZ để giảm phí truyền ra ngoài.'],
])}
${tip('<b>Thực tế: tắt môi trường dev ngoài giờ.</b> Môi trường dev chỉ cần chạy 12 giờ mỗi ngày, 5 ngày mỗi tuần, tức 60 trên 168 giờ. Tắt phần còn lại bằng một lịch tự động giảm khoảng 64% chi phí compute của môi trường đó mà không cần sửa dòng code nào.')}
${note('<b>Sai lầm thường gặp.</b> Chỉ nhìn giá instance mà quên phí truyền dữ liệu. Traffic đi ra Internet và traffic giữa các AZ đều tính tiền; một service gọi database ở AZ khác hàng tỷ lần mỗi tháng có thể tốn hơn chính cái database. Hãy gắn tag theo team, theo dự án cho mọi tài nguyên để biết tiền đang đi đâu.')}
${interview([
  'Khi nào bạn chọn serverless (Lambda) thay vì container trên ECS/EKS? Xét cả chi phí lẫn độ trễ.',
  'Hóa đơn AWS tháng này tăng 40%. Bạn điều tra và cắt giảm theo trình tự nào?',
  'ALB và NLB khác nhau thế nào? Một game server dùng UDP nên đặt sau loại nào?',
])}`,
    keys: [
      'IaaS, PaaS, FaaS, SaaS khác nhau ở mức nhà cung cấp vận hành giúp bạn.',
      'AWS, Azure, Google Cloud có cùng bộ khối xây dựng: compute, storage, database, mạng, IAM, monitoring.',
      'Load balancer L7 định tuyến theo nội dung HTTP; L4 chuyển tiếp TCP/UDP với độ trễ thấp.',
      'Giảm chi phí: right-sizing, xóa tài nguyên thừa, tắt ngoài giờ, reserved/spot, tối ưu truyền dữ liệu.',
    ],
    quiz: [
      { q: 'Dịch vụ nào của Azure tương ứng với Amazon S3?', o: ['Cosmos DB', 'Blob Storage', 'Azure Files', 'Service Bus'], a: 1, why: 'Blob Storage là object storage của Azure, tương đương S3 và Google Cloud Storage.' },
      { q: 'Bạn cần định tuyến /api tới service A và /img tới service B. Chọn load balancer nào?', o: ['NLB (L4)', 'ALB (L7)', 'Gateway Load Balancer', 'DNS round-robin'], a: 1, why: 'Định tuyến theo path cần đọc nội dung HTTP, việc của load balancer lớp 7.' },
      { q: 'Job xử lý ảnh chạy hàng đêm, bị ngắt giữa chừng thì chạy lại được. Cách tiết kiệm nhất là gì?', o: ['On-demand instance cỡ lớn', 'Reserved Instance 3 năm', 'Spot Instances', 'Dedicated host'], a: 2, why: 'Spot rẻ nhất nhưng có thể bị thu hồi, phù hợp với tải chịu được gián đoạn.' },
      { q: 'Heroku hoặc App Engine thuộc mức dịch vụ nào?', o: ['IaaS', 'PaaS', 'SaaS', 'On-premise'], a: 1, why: 'Bạn chỉ đưa code lên; nền tảng lo hệ điều hành, runtime và scale.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 6. Disaster recovery                                                */
  /* ------------------------------------------------------------------ */
  {
    id: 'disaster-recovery',
    mod: 'devops-cloud',
    title: 'Disaster recovery trên cloud',
    pages: [49],
    min: 10,
    level: 'trung-binh',
    lede: 'Cả một region cloud có thể gặp sự cố nhiều giờ. Kế hoạch disaster recovery (DR) quyết định bạn mất vài giây hay vài ngày dữ liệu, và dừng vài phút hay vài ngày dịch vụ.',
    body: `
<h2>Hai con số định nghĩa mọi kế hoạch DR</h2>
<p>Trước khi chọn giải pháp, cần thống nhất với phía nghiệp vụ hai chỉ số:</p>
<ul>
<li><b>RTO</b> (Recovery Time Objective): thời gian tối đa hệ thống được phép ngừng hoạt động sau thảm họa. Nói cách khác, bao lâu thì phải chạy lại.</li>
<li><b>RPO</b> (Recovery Point Objective): lượng dữ liệu tối đa được phép mất, đo bằng thời gian. RPO 1 giờ nghĩa là chấp nhận mất tối đa dữ liệu của 1 giờ cuối.</li>
</ul>
${diagram({
  w: 720, h: 170,
  nodes: [
    { id: 'bk', label: 'Lần backup /\nsync cuối', x: 100, y: 85, w: 130, h: 56 },
    { id: 'dis', label: 'Sự cố', sub: 'region sập', x: 360, y: 85, w: 120, kind: 'warn' },
    { id: 'rec', label: 'Hệ thống\nchạy lại', x: 620, y: 85, w: 130, h: 56, kind: 'good' },
  ],
  edges: [
    { from: 'bk', to: 'dis', label: 'RPO: dữ liệu mất', kind: 'warn' },
    { from: 'dis', to: 'rec', label: 'RTO: downtime', kind: 'warn' },
  ],
  caption: 'Hình: RPO nhìn về quá khứ (mất bao nhiêu dữ liệu), RTO nhìn về tương lai (mất bao lâu để phục hồi).',
})}
<p>Hai chỉ số này quyết định chi phí. RPO gần 0 đòi hỏi replicate dữ liệu liên tục sang nơi khác; RTO gần 0 đòi hỏi một môi trường thứ hai luôn sẵn sàng nhận traffic. Không phải hệ thống nào cũng cần mức đó: hệ thống báo cáo nội bộ chịu được vài giờ, còn hệ thống thanh toán thì không.</p>

<h2>Bốn chiến lược DR</h2>
<p>Sách giới thiệu bốn chiến lược phổ biến, xếp theo chi phí tăng dần và RTO giảm dần.</p>
${diagram({
  w: 720, h: 230,
  nodes: [
    { id: 's1', label: 'Backup &\nrestore', x: 90, y: 80, w: 130, h: 56 },
    { id: 's2', label: 'Pilot light', x: 270, y: 80, w: 130 },
    { id: 's3', label: 'Warm standby', x: 450, y: 80, w: 130 },
    { id: 's4', label: 'Multi-site\nactive-active', x: 630, y: 80, w: 130, h: 56, kind: 'good' },
    { id: 'lo', label: 'Chi phí thấp', sub: 'RTO giờ đến ngày', x: 90, y: 185, w: 140, kind: 'warn' },
    { id: 'hi', label: 'Chi phí cao', sub: 'RTO gần 0', x: 630, y: 185, w: 140, kind: 'good' },
  ],
  edges: [
    { from: 's1', to: 's2' },
    { from: 's2', to: 's3' },
    { from: 's3', to: 's4' },
    { from: 's1', to: 'lo', dashed: true, kind: 'muted' },
    { from: 's4', to: 'hi', dashed: true, kind: 'muted' },
  ],
  caption: 'Hình: Đi từ trái sang phải, môi trường dự phòng càng "nóng" thì phục hồi càng nhanh và càng tốn tiền.',
})}
<h3>1. Backup and restore</h3>
<p>Sao lưu dữ liệu và cấu hình định kỳ sang region khác (ví dụ snapshot database copy sang bucket S3 ở region thứ hai). Khi có sự cố, dựng lại toàn bộ hạ tầng từ đầu rồi restore dữ liệu. Rẻ nhất vì chỉ trả tiền lưu trữ, nhưng RTO thường từ vài giờ tới vài ngày, và RPO bằng khoảng cách tới lần backup thành công cuối cùng.</p>
<h3>2. Pilot light</h3>
<p>Giống ngọn lửa mồi trong bếp ga: phần cốt lõi luôn "cháy" ở region DR. Database được replicate liên tục, còn app server tắt hoặc chỉ có image sẵn sàng. Khi có sự cố, bật và scale app server lên. RTO từ vài phút tới vài giờ; RPO phụ thuộc tần suất đồng bộ dữ liệu.</p>
<h3>3. Warm standby</h3>
<p>Region DR chạy một bản thu nhỏ nhưng đầy đủ của hệ thống, dữ liệu luôn được cập nhật. Khi có sự cố chỉ cần scale lên và chuyển traffic. RTO vài phút tới vài giờ, RPO vài phút. Bản thu nhỏ cũng có thể dùng để test định kỳ.</p>
<h3>4. Hot site / multi-site</h3>
<p>Hai (hoặc nhiều) môi trường đầy đủ chạy song song, cùng nhận traffic thật (active-active) hoặc một bên chờ ở trạng thái nóng (hot standby). Một region chết thì DNS hoặc global load balancer chuyển toàn bộ traffic sang region còn lại. RTO gần như tức thì, RPO chỉ vài giây; chi phí gấp đôi và khó nhất về mặt nhất quán dữ liệu.</p>
${diagram({
  w: 720, h: 360,
  groups: [
    { x: 20, y: 125, w: 320, h: 220, label: 'Region chính' },
    { x: 380, y: 125, w: 320, h: 220, label: 'Region DR' },
  ],
  nodes: [
    { id: 'dns', label: 'DNS failover', sub: 'Route 53, health check', x: 360, y: 45, w: 170, kind: 'lb' },
    { id: 'a1', label: 'App servers', sub: 'chạy đầy đủ', x: 180, y: 190, w: 140, kind: 'good' },
    { id: 'd1', label: 'DB chính', x: 180, y: 295, w: 130, kind: 'store' },
    { id: 'a2', label: 'App servers', sub: 'tắt hoặc thu nhỏ', x: 540, y: 190, w: 150, kind: 'external' },
    { id: 'd2', label: 'DB replica', x: 540, y: 295, w: 130, kind: 'store' },
  ],
  edges: [
    { from: 'dns', to: 'a1', label: 'traffic' },
    { from: 'dns', to: 'a2', label: 'khi failover', dashed: true },
    { from: 'a1', to: 'd1' },
    { from: 'a2', to: 'd2', dashed: true },
    { from: 'd1', to: 'd2', label: 'replication' },
  ],
  caption: 'Hình: Khung chung của pilot light và warm standby. Pilot light tắt app server ở region DR; warm standby chạy bản thu nhỏ; multi-site chạy đầy đủ và nhận traffic ở cả hai bên.',
})}

<h2>So sánh</h2>
${tbl(['Chiến lược', 'RTO điển hình', 'RPO điển hình', 'Chi phí', 'Region DR có gì'], [
  ['Backup & restore', 'Vài giờ đến vài ngày', 'Tới lần backup cuối (thường vài giờ)', 'Thấp nhất', 'Chỉ bản backup'],
  ['Pilot light', 'Vài phút đến vài giờ', 'Theo tần suất đồng bộ', 'Thấp', 'Dữ liệu replicate, app tắt'],
  ['Warm standby', 'Vài phút đến vài giờ', 'Vài phút', 'Trung bình', 'Bản thu nhỏ đang chạy'],
  ['Hot site / multi-site', 'Gần như tức thì', 'Vài giây', 'Cao nhất (khoảng gấp đôi)', 'Bản đầy đủ, nhận traffic'],
])}
<p>Một công ty thường dùng nhiều chiến lược cùng lúc. Thanh toán và đăng nhập chạy multi-site; dịch vụ tìm kiếm dùng warm standby; hệ thống báo cáo và data warehouse chỉ cần backup and restore.</p>
${tip('<b>Thực tế.</b> Ngày 7/12/2021, region us-east-1 của AWS gặp sự cố kéo dài nhiều giờ, ảnh hưởng hàng loạt dịch vụ lớn. Các hệ thống đã có warm standby hoặc multi-site ở region khác và thường xuyên diễn tập failover chuyển được traffic đi; các hệ thống phụ thuộc hoàn toàn vào một region chỉ còn cách chờ.')}
${note('<b>Sai lầm thường gặp.</b> Có backup nhưng chưa bao giờ thử restore. Bản backup có thể hỏng, thiếu bảng, hoặc quy trình restore mất gấp ba lần RTO đã cam kết. Hãy diễn tập DR định kỳ, kiểm tra quota tài nguyên ở region DR, và nhớ rằng RPO bằng 0 cần replicate đồng bộ, làm tăng latency của mọi lần ghi.')}
${interview([
  'Giải thích RTO và RPO. Với hệ thống thanh toán và hệ thống báo cáo nội bộ, bạn đặt hai chỉ số này thế nào?',
  'Pilot light khác warm standby ở điểm nào? Khi nào chọn cái nào?',
  'Trong mô hình active-active hai region, khó khăn lớn nhất về dữ liệu là gì và bạn xử lý ra sao?',
])}`,
    keys: [
      'RTO là thời gian tối đa được phép dừng; RPO là lượng dữ liệu tối đa được phép mất, đo bằng thời gian.',
      'Bốn chiến lược theo chi phí tăng dần: backup & restore, pilot light, warm standby, multi-site.',
      'Pilot light chỉ giữ dữ liệu "nóng"; warm standby chạy bản thu nhỏ; multi-site chạy bản đầy đủ.',
      'Chọn chiến lược theo từng hệ thống và luôn diễn tập restore, failover định kỳ.',
    ],
    quiz: [
      { q: 'Nghiệp vụ chấp nhận mất tối đa 15 phút dữ liệu. Chỉ số nào đang được nói tới?', o: ['RTO = 15 phút', 'RPO = 15 phút', 'SLA = 15 phút', 'MTTR = 15 phút'], a: 1, why: 'RPO đo lượng dữ liệu được phép mất tính bằng thời gian.' },
      { q: 'Chiến lược nào replicate database liên tục nhưng để app server tắt ở region DR?', o: ['Backup & restore', 'Pilot light', 'Warm standby', 'Multi-site'], a: 1, why: 'Pilot light giữ phần cốt lõi (dữ liệu) luôn sẵn sàng, phần còn lại bật lên khi cần.' },
      { q: 'Chiến lược nào có RTO thấp nhất?', o: ['Backup & restore', 'Pilot light', 'Warm standby', 'Hot site / multi-site'], a: 3, why: 'Môi trường thứ hai đã chạy đầy đủ, chỉ cần chuyển traffic.' },
      { q: 'Vì sao đạt RPO gần bằng 0 lại tốn kém về hiệu năng?', o: ['Phải backup mỗi giờ', 'Cần replicate đồng bộ, mỗi lần ghi phải chờ region kia xác nhận', 'Phải tắt cache', 'Phải dùng ổ đĩa HDD'], a: 1, why: 'Replicate đồng bộ qua region xa cộng thêm độ trễ mạng vào mọi thao tác ghi.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 7. Observability                                                    */
  /* ------------------------------------------------------------------ */
  {
    id: 'observability',
    mod: 'devops-cloud',
    title: 'Monitoring, logging và observability',
    pages: [30, 140, 273, 226, 231, 300, 13, 157, 167, 83],
    min: 14,
    level: 'trung-binh',
    lede: 'Hệ thống nào rồi cũng có lúc chậm hoặc lỗi. Khác biệt nằm ở chỗ bạn biết trong vài phút hay sau khi khách hàng phàn nàn, và tìm ra nguyên nhân trong một giờ hay một tuần.',
    body: `
<h2>Ba trụ cột: metrics, logs, traces</h2>
<p><b>Monitoring</b> trả lời câu hỏi "hệ thống có ổn không" dựa trên những chỉ số đã biết trước. <b>Observability</b> rộng hơn: khả năng hỏi những câu chưa nghĩ tới, như "vì sao chỉ khách ở Đà Nẵng dùng app Android bị chậm". Để có được điều đó, hệ thống cần phát ra ba loại dữ liệu:</p>
${tbl(['Loại', 'Là gì', 'Trả lời câu hỏi', 'Công cụ'], [
  ['<b>Metrics</b>', 'Con số theo thời gian: QPS, latency p99, CPU, tỉ lệ lỗi', 'Có vấn đề không, từ lúc nào?', 'Prometheus, CloudWatch'],
  ['<b>Logs</b>', 'Bản ghi sự kiện chi tiết, nên có cấu trúc (JSON)', 'Chuyện gì đã xảy ra với request này?', 'ELK, Loki, Cloud Logging'],
  ['<b>Traces</b>', 'Hành trình một request qua nhiều service, gồm các span có thời gian', 'Chậm ở service nào, bước nào?', 'Jaeger, Tempo, X-Ray'],
])}
${diagram({
  w: 720, h: 340,
  nodes: [
    { id: 'app', label: 'Ứng dụng', sub: 'service, host', x: 110, y: 60, w: 130 },
    { id: 'ag', label: 'Agent / SDK', sub: 'OTel, Fluent Bit', x: 335, y: 60, w: 150 },
    { id: 'col', label: 'Collector', sub: 'lọc, gom batch', x: 565, y: 60, w: 140, kind: 'lb' },
    { id: 'm', label: 'Metrics', sub: 'Prometheus', x: 150, y: 180, w: 130, kind: 'store' },
    { id: 'l', label: 'Logs', sub: 'Loki, Elasticsearch', x: 380, y: 180, w: 150, kind: 'store' },
    { id: 't', label: 'Traces', sub: 'Jaeger, Tempo', x: 610, y: 180, w: 130, kind: 'store' },
    { id: 'al', label: 'Alerting', sub: 'gọi on-call', x: 150, y: 295, w: 130, kind: 'warn' },
    { id: 'db', label: 'Dashboard', sub: 'Grafana', x: 450, y: 295, w: 130, kind: 'good' },
  ],
  edges: [
    { from: 'app', to: 'ag' },
    { from: 'ag', to: 'col' },
    { from: 'col', to: 'm' },
    { from: 'col', to: 'l' },
    { from: 'col', to: 't' },
    { from: 'm', to: 'al', label: 'vượt ngưỡng', kind: 'warn' },
    { from: 'm', to: 'db' },
    { from: 'l', to: 'db' },
    { from: 't', to: 'db' },
  ],
  caption: 'Hình: Pipeline observability. Agent thu dữ liệu tại nguồn, collector gom và định tuyến về ba kho lưu trữ chuyên biệt, rồi hiển thị trên dashboard và sinh cảnh báo.',
})}
<p>Sách tổng hợp các khía cạnh một hệ thống giám sát cần có: thu thập, lưu trữ, phân tích, cảnh báo, trực quan hóa, báo cáo và tuân thủ, tự động hóa, tích hợp. Mỗi cloud đều có bộ dịch vụ riêng, và nhiều đội kết hợp với công cụ mã nguồn mở:</p>
${tbl(['Chức năng', 'AWS', 'Azure', 'Google Cloud', 'Mã nguồn mở'], [
  ['Metrics', 'CloudWatch Metrics', 'Azure Monitor Metrics', 'Cloud Monitoring', 'Prometheus'],
  ['Logs', 'CloudWatch Logs', 'Log Analytics', 'Cloud Logging', 'ELK, Loki'],
  ['Traces', 'X-Ray', 'Application Insights', 'Cloud Trace', 'Jaeger, Tempo'],
  ['Cảnh báo', 'CloudWatch Alarms', 'Azure Monitor Alerts', 'Cloud Monitoring alerting', 'Alertmanager'],
  ['Dashboard', 'CloudWatch Dashboards', 'Workbooks', 'Cloud Monitoring dashboards', 'Grafana'],
])}

<h2>Đọc log bằng dòng lệnh</h2>
<p>Khi chưa có hệ thống log tập trung, hoặc cần xem nhanh trên một máy, sáu lệnh sau giải quyết phần lớn nhu cầu: <code>grep</code> lọc dòng theo mẫu, <code>cut</code> cắt lấy cột, <code>sed</code> sửa và thay thế văn bản, <code>awk</code> xử lý theo cột với điều kiện, <code>sort</code> sắp xếp, <code>uniq</code> gộp các dòng liền kề trùng nhau. Sức mạnh nằm ở việc nối chúng bằng pipe.</p>
<ul>
<li>Lấy timestamp (cột 2) của các dòng Exception từ xxService: <code>grep "xxService" service.log | grep "Exception" | cut -d" " -f 2</code></li>
<li>Top 10 IP gọi nhiều nhất trong access log: <code>awk '{print $1}' access.log | sort | uniq -c | sort -rn | head</code></li>
</ul>

<h2>Chẩn đoán process "ngốn" CPU, RAM, IO</h2>
<p>Đây là câu hỏi phỏng vấn kinh điển. Cách làm đúng là đi từ tổng quan tới chi tiết: xem cả máy đang thiếu tài nguyên gì, rồi mới tìm process gây ra.</p>
${diagram({
  w: 720, h: 350,
  nodes: [
    { id: 's', label: 'Máy chậm', sub: 'cảnh báo, user báo', x: 90, y: 175, w: 130, kind: 'warn' },
    { id: 'top', label: 'top, uptime', sub: 'load, %CPU, %wa', x: 280, y: 175, w: 140 },
    { id: 'cpu', label: 'CPU', sub: 'pidstat -u, perf top', x: 570, y: 45, w: 210 },
    { id: 'mem', label: 'Bộ nhớ', sub: 'free -m, vmstat, pidstat -r', x: 570, y: 130, w: 210 },
    { id: 'io', label: 'Disk IO', sub: 'iostat -x, pidstat -d', x: 570, y: 215, w: 210 },
    { id: 'net', label: 'Mạng, file', sub: 'ss, netstat, lsof -p', x: 570, y: 300, w: 210 },
  ],
  edges: [
    { from: 's', to: 'top' },
    { from: 'top', to: 'cpu', label: 'us/sy cao' },
    { from: 'top', to: 'mem', label: 'swap si/so' },
    { from: 'top', to: 'io', label: '%wa cao' },
    { from: 'top', to: 'net', label: 'kết nối' },
  ],
  caption: 'Hình: Đi từ cái nhìn tổng quan (top) tới công cụ chuyên biệt cho từng loại tài nguyên.',
})}
${tbl(['Công cụ', 'Cho biết'], [
  ['<code>vmstat 1</code>', 'Process, bộ nhớ, paging, block IO, CPU theo từng giây; cột <code>si</code>/<code>so</code> khác 0 là đang swap.'],
  ['<code>iostat -x 1</code>', 'Thống kê CPU và IO theo từng ổ đĩa; <code>%util</code> gần 100% là đĩa bão hòa.'],
  ['<code>pidstat</code>', 'Mức dùng CPU (<code>-u</code>), RAM (<code>-r</code>), IO (<code>-d</code>), context switch (<code>-w</code>) theo từng process.'],
  ['<code>netstat</code> / <code>ss</code>', 'Kết nối và thống kê TCP, UDP, ICMP; ví dụ đếm kết nối ở trạng thái TIME_WAIT.'],
  ['<code>lsof</code>', 'File và socket một process đang mở; hữu ích khi gặp lỗi "too many open files".'],
])}
<p>Sách liệt kê 9 nguyên nhân hay gặp khiến CPU lên 100%: vòng lặp vô hạn, process chạy nền, lưu lượng tăng đột biến, ứng dụng nặng về tính toán, thiếu RAM (hệ thống liên tục swap và GC), quá nhiều process chạy đồng thời, busy waiting (vòng lặp chờ liên tục thay vì ngủ), biểu thức regex bị backtracking thảm họa, và malware như phần mềm đào tiền ảo.</p>

<h2>Nền tảng Linux cần nắm</h2>
<p><b>Các lệnh dùng nhiều nhất</b>: <code>ls</code>, <code>cd</code>, <code>mkdir</code>, <code>rm</code>, <code>cp</code>, <code>mv</code> để thao tác file; <code>cat</code>, <code>vi</code>, <code>grep</code>, <code>find</code>, <code>tar</code>, <code>du</code> để đọc, tìm, nén và đo dung lượng; <code>top</code>, <code>ps</code>, <code>kill</code> để quản lý process; <code>chmod</code> đổi quyền; <code>ping</code>, <code>ifconfig</code> (nay thường là <code>ip</code>) cho mạng.</p>
<p><b>Cây thư mục</b> theo chuẩn FHS (ra đời năm 1994), bắt đầu từ gốc <code>/</code>: <code>/etc</code> chứa cấu hình, <code>/var/log</code> chứa log, <code>/home</code> là thư mục người dùng, <code>/usr</code> chứa chương trình và thư viện, <code>/tmp</code> là file tạm, <code>/proc</code> là filesystem ảo phản ánh trạng thái kernel và process, <code>/dev</code> là thiết bị, <code>/boot</code> chứa kernel và bootloader.</p>
<p><b>Quyền file</b> gồm ba nhóm chủ thể (owner, group, other) và ba quyền (read, write, execute). Viết dạng số, r = 4, w = 2, x = 1: <code>chmod 755 deploy.sh</code> cho owner toàn quyền (7 = rwx), group và other chỉ đọc và chạy (5 = r-x). File chứa khóa bí mật nên là <code>600</code>.</p>
<p><b>Quá trình boot</b> giải thích vì sao máy "đứng" ở đâu đó khi khởi động:</p>
${diagram({
  w: 720, h: 260,
  nodes: [
    { id: 'b1', label: 'BIOS / UEFI', sub: 'POST', x: 90, y: 70, w: 130 },
    { id: 'b2', label: 'Dò phần cứng', sub: 'CPU, RAM, disk', x: 270, y: 70, w: 130 },
    { id: 'b3', label: 'Chọn thiết bị', sub: 'boot device', x: 450, y: 70, w: 130 },
    { id: 'b4', label: 'Bootloader', sub: 'GRUB', x: 630, y: 70, w: 130 },
    { id: 'b5', label: 'Kernel', sub: 'driver, mount /', x: 630, y: 190, w: 130 },
    { id: 'b6', label: 'systemd', sub: 'PID 1', x: 450, y: 190, w: 130 },
    { id: 'b7', label: 'default.target', sub: 'chạy các service', x: 270, y: 190, w: 140 },
    { id: 'b8', label: 'Màn hình login', x: 90, y: 190, w: 130, kind: 'good' },
  ],
  edges: [
    { from: 'b1', to: 'b2' },
    { from: 'b2', to: 'b3' },
    { from: 'b3', to: 'b4' },
    { from: 'b4', to: 'b5' },
    { from: 'b5', to: 'b6' },
    { from: 'b6', to: 'b7' },
    { from: 'b7', to: 'b8' },
  ],
  caption: 'Hình: Quá trình boot Linux, từ firmware kiểm tra phần cứng tới khi systemd khởi động xong các service.',
})}
${tip('<b>Thực tế: bốn tín hiệu vàng.</b> Sách SRE của Google khuyên mọi service tối thiểu phải theo dõi latency, traffic, errors và saturation. Một dashboard chỉ với bốn biểu đồ này, cộng cảnh báo khi tỉ lệ lỗi hoặc latency p99 vượt SLO, đã bắt được phần lớn sự cố trước khi người dùng kịp báo.')}
${note('<b>Sai lầm thường gặp.</b> Cảnh báo trên mọi thứ, ví dụ CPU trên 80%. On-call bị gọi dậy liên tục vì những việc không ảnh hưởng người dùng, dần dần bỏ qua cả cảnh báo thật. Hãy cảnh báo theo triệu chứng người dùng cảm nhận (tỉ lệ lỗi, latency), còn chỉ số tài nguyên để trên dashboard phục vụ điều tra. Một lỗi khác là log không có request ID, nên không thể nối log giữa các service.')}
${interview([
  'Một server Linux báo load average 30 trên máy 8 core. Bạn điều tra theo những bước nào?',
  'Metrics, logs và traces khác nhau thế nào? Một request chậm bất thường thì bạn dùng loại nào trước?',
  'Thiết kế hệ thống thu thập log cho 500 service chạy trên Kubernetes.',
  'chmod 640 nghĩa là gì? Vì sao file private key SSH phải có quyền 600?',
])}`,
    keys: [
      'Metrics cho biết có vấn đề, logs cho biết chuyện gì xảy ra, traces cho biết chậm ở đâu.',
      'Pipeline điển hình: agent, collector, kho lưu trữ riêng cho từng loại dữ liệu, dashboard và alerting.',
      'Chẩn đoán đi từ tổng quan (top, vmstat) tới chi tiết từng process (pidstat, iostat, lsof).',
      'grep, cut, sed, awk, sort, uniq nối bằng pipe đủ cho phần lớn việc đọc log trên một máy.',
      'Cảnh báo theo triệu chứng người dùng thấy, không theo từng chỉ số tài nguyên.',
    ],
    quiz: [
      { q: 'Request đi qua 6 microservice và chậm 3 giây. Loại dữ liệu nào giúp tìm service gây chậm nhanh nhất?', o: ['Metrics CPU', 'Distributed traces', 'Access log của gateway', 'Kết quả uptime'], a: 1, why: 'Trace ghi thời gian của từng span qua từng service, cho thấy ngay bước nào chiếm nhiều thời gian.' },
      { q: 'vmstat cho thấy cột si/so liên tục khác 0. Điều này gợi ý gì?', o: ['Disk IO bão hòa', 'Hệ thống thiếu RAM và đang swap', 'Mạng bị nghẽn', 'CPU bị throttle'], a: 1, why: 'si/so là lượng bộ nhớ swap vào/ra; khác 0 liên tục nghĩa là RAM không đủ.' },
      { q: 'Lệnh nào đếm số lần xuất hiện của mỗi dòng sau khi đã sắp xếp?', o: ['cut -d', 'uniq -c', 'sed -n', 'grep -v'], a: 1, why: 'uniq gộp các dòng liền kề trùng nhau, -c thêm số đếm; vì vậy cần sort trước.' },
      { q: 'chmod 755 script.sh cấp quyền gì cho group?', o: ['Đọc, ghi, chạy', 'Đọc và chạy', 'Chỉ đọc', 'Không có quyền'], a: 1, why: '5 = 4 (r) + 1 (x), tức r-x.' },
    ],
  },
];
