import { ALL_QUESTIONS, DIAGRAM_COUNT, LESSONS, MODULES, TOC, lessonsOf } from '../data';
import { diagram } from '../data/helpers';
import { Tick } from '../components/Tick';
import { WIDGET_COUNT } from '../widgets';

/** Bản đồ tổng quan: mỗi thành phần gắn với module học tương ứng. */
const MAP_SVG = diagram({
  w: 900,
  h: 380,
  groups: [
    { x: 300, y: 40, w: 580, h: 320, label: 'Data center / Cloud · M8' },
  ],
  nodes: [
    { id: 'user', label: 'Người dùng', sub: 'M2 · Mạng', x: 80, y: 200, w: 120, h: 56, kind: 'client' },
    { id: 'dns', label: 'DNS', sub: 'M2', x: 80, y: 80, w: 100, kind: 'external' },
    { id: 'cdn', label: 'CDN', sub: 'M2', x: 80, y: 320, w: 100, kind: 'external' },
    { id: 'gw', label: 'API Gateway\nLoad balancer', sub: 'M3 · M4', x: 400, y: 200, w: 140, h: 72, kind: 'lb' },
    { id: 'auth', label: 'Xác thực', sub: 'M9 · Bảo mật', x: 400, y: 90, w: 130, h: 52, kind: 'service' },
    { id: 'svc', label: 'Microservices', sub: 'M7 · Kiến trúc', x: 600, y: 200, w: 140, h: 60, kind: 'service' },
    { id: 'cache', label: 'Cache', sub: 'M4', x: 600, y: 90, w: 120, h: 52, kind: 'cache' },
    { id: 'mq', label: 'Message queue', sub: 'M6 · Bất đồng bộ', x: 600, y: 310, w: 150, h: 56, kind: 'queue' },
    { id: 'db', label: 'Database', sub: 'M5', x: 800, y: 145, w: 120, h: 64, kind: 'store' },
    { id: 'worker', label: 'Worker\nData pipeline', sub: 'M6', x: 800, y: 300, w: 130, h: 64, kind: 'service' },
  ],
  edges: [
    { from: 'user', to: 'dns', label: '1' },
    { from: 'user', to: 'cdn', label: '2', dashed: true },
    { from: 'user', to: 'gw', label: '3' },
    { from: 'gw', to: 'auth' },
    { from: 'gw', to: 'svc' },
    { from: 'svc', to: 'cache' },
    { from: 'svc', to: 'db' },
    { from: 'svc', to: 'mq' },
    { from: 'mq', to: 'worker' },
    { from: 'worker', to: 'db', dashed: true },
  ],
  caption:
    'Hình: Bản đồ một hệ thống web điển hình. Mỗi thành phần ghi module học tương ứng. (1) phân giải tên miền, (2) tải nội dung tĩnh từ CDN, (3) gọi API qua gateway.',
});

export function Home({ done }: { done: Set<string> }) {
  const next = LESSONS.find(l => !done.has(l.id)) ?? LESSONS[0];
  const started = done.size > 0;

  return (
    <>
      <section className="hero">
        <div className="eyebrow">Lộ trình tự học · {MODULES.length} module</div>
        <h1>Học System Design qua các sơ đồ của ByteByteGo</h1>
        <p>
          Các bài học tiếng Việt được chắt lọc từ khoảng 200 bài đăng năm 2024 của ByteByteGo. Mỗi bài giải thích cơ chế bằng
          sơ đồ, so sánh các phương án, nêu ví dụ thực tế, sai lầm thường gặp, câu hỏi phỏng vấn và có quiz để tự kiểm tra.
        </p>
        <div className="hero-actions">
          <a className="btn primary" href={`#${next.id}`}>
            {started ? 'Học tiếp: ' : 'Bắt đầu: '}
            {next.title}
          </a>
          <a className="btn" href="#on-tap">
            Làm bài ôn tập
          </a>
        </div>
        <div className="stats">
          <div className="stat">
            <b>{LESSONS.length}</b>
            <span>bài học</span>
          </div>
          <div className="stat">
            <b>{DIAGRAM_COUNT}</b>
            <span>sơ đồ minh họa</span>
          </div>
          <div className="stat">
            <b>{ALL_QUESTIONS.length}</b>
            <span>câu hỏi quiz</span>
          </div>
          <div className="stat">
            <b>{WIDGET_COUNT}</b>
            <span>công cụ tương tác</span>
          </div>
          <div className="stat">
            <b>{TOC.length}</b>
            <span>bài gốc trong sách</span>
          </div>
        </div>
      </section>

      <section className="home-map">
        <div className="section-h">
          <h2>Bản đồ hệ thống</h2>
          <p>Mỗi module học tương ứng với một phần của kiến trúc.</p>
        </div>
        <div dangerouslySetInnerHTML={{ __html: MAP_SVG }} />
      </section>

      <div className="section-h">
        <h2>Lộ trình</h2>
        <p>Học theo thứ tự module, hoặc chọn chủ đề bạn cần.</p>
      </div>
      <div className="path">
        {MODULES.map(m => {
          const ls = lessonsOf(m.id);
          if (!ls.length) return null;
          const d = ls.filter(l => done.has(l.id)).length;
          const mins = ls.reduce((s, l) => s + l.min, 0);
          return (
            <article className="mcard" key={m.id}>
              <div className="mono">
                {m.no} · {ls.length} bài · ~{mins} phút
              </div>
              <h3>{m.name}</h3>
              <p>{m.desc}</p>
              <div className="bar" title={`Đã học ${d}/${ls.length}`}>
                <i style={{ width: `${(d / ls.length) * 100}%` }} />
              </div>
              <ul>
                {ls.map(l => (
                  <li key={l.id}>
                    <a href={`#${l.id}`}>
                      <Tick done={done.has(l.id)} />
                      <span>{l.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </>
  );
}
