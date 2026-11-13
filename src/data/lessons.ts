// Danh sách module và bài học. Nội dung từng module nằm trong src/data/modules/<id>.ts.
// Nguồn tham khảo: "System Design LinkedIn Posts 2024" (ByteByteGo). Sơ đồ được vẽ lại, không sao chép hình gốc.
import type { Lesson, Module } from '../types';
import { lessons as nenTang } from './modules/nen-tang';
import { lessons as mang } from './modules/mang';
import { lessons as api } from './modules/api';
import { lessons as lbCache } from './modules/lb-cache';
import { lessons as duLieu } from './modules/du-lieu';
import { lessons as batDongBo } from './modules/bat-dong-bo';
import { lessons as kienTruc } from './modules/kien-truc';
import { lessons as devopsCloud } from './modules/devops-cloud';
import { lessons as baoMat } from './modules/bao-mat';
import { lessons as thucChien } from './modules/thuc-chien';

export const MODULES: Module[] = [
  { id: 'nen-tang', no: 'M1', name: 'Nền tảng', desc: 'Latency, ước lượng, tính sẵn sàng, scale và tư duy trade-off.' },
  { id: 'mang', no: 'M2', name: 'Mạng & Giao thức', desc: 'DNS, CDN, TCP/UDP, HTTP qua các phiên bản, HTTPS và TLS.' },
  { id: 'api', no: 'M3', name: 'API', desc: 'REST, GraphQL, gRPC, thiết kế API, idempotency, gateway và rate limit.' },
  { id: 'lb-cache', no: 'M4', name: 'Cân bằng tải & Cache', desc: 'Phân phối request, các tầng cache, chiến lược và sự cố cache.' },
  { id: 'du-lieu', no: 'M5', name: 'Cơ sở dữ liệu', desc: 'ACID, CAP, loại database, index, replication, sharding và lock.' },
  { id: 'bat-dong-bo', no: 'M6', name: 'Bất đồng bộ & Dữ liệu', desc: 'Kafka, messaging, retry, event sourcing, CDC và data pipeline.' },
  { id: 'kien-truc', no: 'M7', name: 'Kiến trúc phần mềm', desc: 'Microservices, các kiểu kiến trúc, 12-Factor, MVC/MVVM và design pattern.' },
  { id: 'devops-cloud', no: 'M8', name: 'DevOps & Cloud', desc: 'Git, Docker, Kubernetes, CI/CD, cloud, disaster recovery và observability.' },
  { id: 'bao-mat', no: 'M9', name: 'Bảo mật', desc: 'Session, JWT, OAuth, SSO, mã hóa, lưu mật khẩu và bảo mật web.' },
  { id: 'thuc-chien', no: 'M10', name: 'Thực chiến & Case study', desc: 'Thiết kế hệ thống thông báo, thanh toán, tìm kiếm, streaming và kiến trúc các công ty lớn.' },
];

export const LESSONS: Lesson[] = [
  ...nenTang,
  ...mang,
  ...api,
  ...lbCache,
  ...duLieu,
  ...batDongBo,
  ...kienTruc,
  ...devopsCloud,
  ...baoMat,
  ...thucChien,
].map(l => l);
