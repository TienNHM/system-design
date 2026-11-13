import { MODULES, lessonsOf } from '../data';
import { Tick } from './Tick';

interface Props {
  route: string;
  done: Set<string>;
}

export function Sidebar({ route, done }: Props) {
  return (
    <aside className="side" aria-label="Danh sách bài học">
      <details open>
        <summary>Danh sách bài học</summary>
        <div className="side-body">
          {MODULES.map(m => (
            <div className="mod" key={m.id}>
              <div className="mod-h">
                <span className="mono">{m.no}</span>
                {m.name}
              </div>
              <ol>
                {lessonsOf(m.id).map(l => (
                  <li key={l.id}>
                    <a href={`#${l.id}`} className={route === l.id ? 'on' : ''}>
                      <Tick done={done.has(l.id)} />
                      <span>{l.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </details>
    </aside>
  );
}
