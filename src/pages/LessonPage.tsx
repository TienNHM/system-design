import { useMemo } from 'react';
import { LESSONS, moduleById } from '../data';
import { Quiz } from '../components/Quiz';
import { LevelChip } from '../components/LevelChip';
import { Widget } from '../widgets';
import { withHeadingIds } from '../lib/text';
import type { Lesson } from '../types';

interface Props {
  lesson: Lesson;
  isDone: boolean;
  setDone: (value: boolean) => void;
}

/** Cuộn tới mục trong bài mà không đổi location.hash (hash dùng cho routing). */
function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function LessonPage({ lesson, isDone, setDone }: Props) {
  const idx = LESSONS.findIndex(l => l.id === lesson.id);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const mod = moduleById(lesson.mod);
  const { html, headings } = useMemo(() => withHeadingIds(lesson.body), [lesson.body]);

  const toc = [
    ...headings,
    ...(lesson.widget ? [{ id: 'muc-cong-cu', text: 'Công cụ tương tác' }] : []),
    { id: 'muc-ghi-nho', text: 'Ghi nhớ' },
    { id: 'muc-quiz', text: 'Kiểm tra nhanh' },
  ];

  return (
    <div className="lesson-grid">
      <article className="lesson">
        <div className="crumbs">
          <span className="mono">{mod?.no}</span>
          <span>{mod?.name}</span>
          <span>·</span>
          <span>
            Bài {idx + 1}/{LESSONS.length}
          </span>
        </div>
        <h1>{lesson.title}</h1>
        <div className="meta">
          <LevelChip level={lesson.level} />
          <span className="chip">{lesson.min} phút đọc</span>
          <span className="chip">Sách: tr. {lesson.pages.join(', ')}</span>
          {isDone && <span className="chip chip-done">Đã học</span>}
        </div>
        <p className="lede">{lesson.lede}</p>

        {/* Nội dung do tác giả soạn sẵn trong src/data/modules/*.ts */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        {lesson.widget && (
          <div id="muc-cong-cu">
            <Widget id={lesson.widget} />
          </div>
        )}

        <section className="keys" id="muc-ghi-nho">
          <h2>Ghi nhớ</h2>
          <ul>
            {lesson.keys.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </section>

        <section className="quiz" id="muc-quiz">
          <h2>Kiểm tra nhanh</h2>
          <p>Trả lời hết các câu để tự động đánh dấu đã học bài này.</p>
          <Quiz
            key={lesson.id}
            questions={lesson.quiz}
            onProgress={answered => {
              if (answered === lesson.quiz.length) setDone(true);
            }}
          />
        </section>

        <div className="lesson-foot">
          <button type="button" className={`btn${isDone ? '' : ' primary'}`} onClick={() => setDone(!isDone)}>
            {isDone ? 'Bỏ đánh dấu đã học' : 'Đánh dấu đã học'}
          </button>
          <div className="pager">
            {prev && (
              <a className="btn small" href={`#${prev.id}`}>
                ← {prev.title}
              </a>
            )}
            {next ? (
              <a className="btn small" href={`#${next.id}`}>
                {next.title} →
              </a>
            ) : (
              <a className="btn small" href="#on-tap">
                Làm bài ôn tập →
              </a>
            )}
          </div>
        </div>
      </article>

      <nav className="toc" aria-label="Trong bài này">
        <div className="toc-h">Trong bài này</div>
        <ol>
          {toc.map(h => (
            <li key={h.id}>
              <button type="button" onClick={() => jump(h.id)}>
                {h.text}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
