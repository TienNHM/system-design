import { LESSONS, moduleById } from '../data';
import { Quiz } from '../components/Quiz';
import { Widget } from '../widgets';
import type { Lesson } from '../types';

interface Props {
  lesson: Lesson;
  isDone: boolean;
  setDone: (value: boolean) => void;
}

export function LessonPage({ lesson, isDone, setDone }: Props) {
  const idx = LESSONS.findIndex(l => l.id === lesson.id);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const mod = moduleById(lesson.mod);

  return (
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
        <span className="chip">{lesson.min} phút đọc</span>
        <span className="chip">Sách: tr. {lesson.pages.join(', ')}</span>
        {isDone && <span className="chip">Đã học</span>}
      </div>
      <p className="lede">{lesson.lede}</p>

      {/* Nội dung do tác giả soạn sẵn trong src/data/lessons.ts */}
      <div className="prose" dangerouslySetInnerHTML={{ __html: lesson.body }} />

      {lesson.widget && <Widget id={lesson.widget} />}

      <section className="keys">
        <h2>Ghi nhớ</h2>
        <ul>
          {lesson.keys.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul>
      </section>

      <section className="quiz">
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
  );
}
