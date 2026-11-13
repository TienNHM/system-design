import { useMemo, useState } from 'react';
import { ALL_QUESTIONS, MODULES, lessonById } from '../data';
import { Quiz } from '../components/Quiz';

const SIZE = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Review() {
  const [mod, setMod] = useState('all');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState({ answered: 0, correct: 0 });

  const questions = useMemo(() => {
    const pool = mod === 'all' ? ALL_QUESTIONS : ALL_QUESTIONS.filter(q => lessonById(q.lessonId)?.mod === mod);
    return shuffle(pool).slice(0, SIZE);
    // round đổi thì trộn lại câu hỏi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod, round]);

  const restart = (m = mod) => {
    setMod(m);
    setRound(r => r + 1);
    setScore({ answered: 0, correct: 0 });
  };

  const finished = score.answered === questions.length;

  return (
    <div className="lesson">
      <div className="eyebrow">Ôn tập</div>
      <h1 style={{ margin: '6px 0 10px' }}>Bài ôn tập ngẫu nhiên</h1>
      <p className="lede">
        {questions.length} câu hỏi lấy ngẫu nhiên từ các bài học. Chọn một module để ôn riêng phần đó.
      </p>
      <div className="controls">
        <label className="lbl" htmlFor="review-mod">
          Module
        </label>
        <select id="review-mod" value={mod} onChange={e => restart(e.target.value)}>
          <option value="all">Tất cả module</option>
          {MODULES.map(m => (
            <option key={m.id} value={m.id}>
              {m.no} · {m.name}
            </option>
          ))}
        </select>
        <button type="button" className="btn small" onClick={() => restart()}>
          Đổi bộ câu hỏi
        </button>
      </div>
      <div className="score" aria-live="polite">
        Đúng {score.correct}/{score.answered}
        {finished && ` · Hoàn thành ${Math.round((score.correct / questions.length) * 100)}%`}
      </div>
      <Quiz key={`${mod}-${round}`} questions={questions} onProgress={(answered, correct) => setScore({ answered, correct })} />
      {finished && (
        <button type="button" className="btn primary" onClick={() => restart()}>
          Làm bộ mới
        </button>
      )}
    </div>
  );
}
