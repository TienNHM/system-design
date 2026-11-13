import { ALL_QUESTIONS, LESSONS, MODULES, TOC, lessonsOf } from '../data';
import { Tick } from '../components/Tick';

export function Home({ done }: { done: Set<string> }) {
  const next = LESSONS.find(l => !done.has(l.id)) ?? LESSONS[0];
  const started = done.size > 0;

  return (
    <>
      <section className="hero">
        <div className="eyebrow">Lộ trình tự học · 7 module</div>
        <h1>Học System Design qua các sơ đồ của ByteByteGo</h1>
        <p>
          Các bài học tiếng Việt được chắt lọc từ khoảng 200 bài đăng năm 2024. Mỗi bài có phần giải thích ngắn, bảng so
          sánh, công cụ thử nghiệm và quiz để kiểm tra lại.
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
            <b>{ALL_QUESTIONS.length}</b>
            <span>câu hỏi quiz</span>
          </div>
          <div className="stat">
            <b>5</b>
            <span>công cụ tương tác</span>
          </div>
          <div className="stat">
            <b>{TOC.length}</b>
            <span>bài gốc trong sách</span>
          </div>
        </div>
      </section>

      <div className="section-h">
        <h2>Lộ trình</h2>
        <p>Học theo thứ tự module, hoặc chọn chủ đề bạn cần.</p>
      </div>
      <div className="path">
        {MODULES.map(m => {
          const ls = lessonsOf(m.id);
          const d = ls.filter(l => done.has(l.id)).length;
          return (
            <article className="mcard" key={m.id}>
              <div className="mono">
                {m.no} · {d}/{ls.length} bài
              </div>
              <h3>{m.name}</h3>
              <p>{m.desc}</p>
              <div className="bar">
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
