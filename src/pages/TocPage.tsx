import { useState } from 'react';
import { TOC, lessonForPage } from '../data';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function TocPage() {
  const [q, setQ] = useState('');
  const items = TOC.filter(([t]) => norm(t).includes(norm(q.trim())));

  return (
    <div>
      <div className="eyebrow">Tài liệu gốc</div>
      <h1 style={{ margin: '6px 0 10px' }}>Mục lục sách</h1>
      <p className="lede" style={{ maxWidth: '66ch' }}>
        Toàn bộ {TOC.length} bài trong <i>System Design LinkedIn Posts 2024</i> (ByteByteGo), kèm số trang. Bài nào đã
        có bài học tiếng Việt thì có liên kết bên cạnh.
      </p>
      <input
        id="toc-search"
        type="text"
        className="toc-search"
        placeholder="Tìm bài, ví dụ: cache, kafka, oauth"
        value={q}
        onChange={e => setQ(e.target.value)}
        aria-label="Tìm trong mục lục"
      />
      <p className="out">
        Hiển thị <b>{items.length}</b> bài
      </p>
      <ul className="toc-list">
        {items.map(([title, page], i) => {
          const lesson = lessonForPage(page);
          return (
            <li key={`${page}-${i}`}>
              <span>
                {title}
                {lesson && (
                  <>
                    {' '}
                    <a href={`#${lesson.id}`}>→ bài học</a>
                  </>
                )}
              </span>
              <span className="mono">tr. {page}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
