import { useState } from 'react';
import { LESSONS, MODULES, SEARCH_TEXT, lessonsOf } from '../data';
import { fold } from '../lib/text';
import { Tick } from './Tick';

interface Props {
  route: string;
  done: Set<string>;
}

export function Sidebar({ route, done }: Props) {
  const [q, setQ] = useState('');
  const query = fold(q.trim());
  const match = (id: string) => !query || (SEARCH_TEXT.get(id) ?? '').includes(query);
  const hits = query ? LESSONS.filter(l => match(l.id)).length : null;

  return (
    <aside className="side" aria-label="Danh sách bài học">
      <details open>
        <summary>Danh sách bài học ({LESSONS.length})</summary>
        <div className="side-body">
          <input
            id="lesson-search"
            type="text"
            className="side-search"
            placeholder="Tìm bài: kafka, jwt, shard…"
            value={q}
            onChange={e => setQ(e.target.value)}
            aria-label="Tìm bài học"
          />
          {hits !== null && <p className="side-hits">{hits} bài khớp</p>}
          {MODULES.map(m => {
            const ls = lessonsOf(m.id).filter(l => match(l.id));
            if (!ls.length) return null;
            return (
              <div className="mod" key={m.id}>
                <div className="mod-h">
                  <span className="mono">{m.no}</span>
                  {m.name}
                </div>
                <ol>
                  {ls.map(l => (
                    <li key={l.id}>
                      <a href={`#${l.id}`} className={route === l.id ? 'on' : ''}>
                        <Tick done={done.has(l.id)} />
                        <span>{l.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </details>
    </aside>
  );
}
