import { useState } from 'react';
import type { Question } from '../types';

interface Props {
  questions: Question[];
  /** Gọi mỗi khi người học trả lời một câu: (số câu đã trả lời, số câu đúng) */
  onProgress?: (answered: number, correct: number) => void;
}

export function Quiz({ questions, onProgress }: Props) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));

  const choose = (qi: number, oi: number) => {
    if (picked[qi] !== null) return;
    const next = picked.slice();
    next[qi] = oi;
    setPicked(next);
    const answered = next.filter(p => p !== null).length;
    const correct = next.filter((p, i) => p === questions[i].a).length;
    onProgress?.(answered, correct);
  };

  return (
    <div>
      {questions.map((q, qi) => {
        const p = picked[qi];
        return (
          <div className="q" key={qi}>
            <div className="q-t">
              {qi + 1}. {q.q}
            </div>
            <div className="opts">
              {q.o.map((opt, oi) => {
                let cls = 'opt';
                if (p !== null && oi === q.a) cls += ' right';
                else if (p === oi) cls += ' wrong';
                return (
                  <button key={oi} type="button" className={cls} disabled={p !== null} onClick={() => choose(qi, oi)}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {p !== null && (
              <div className="why">
                <b>{p === q.a ? 'Chính xác.' : 'Chưa đúng.'}</b> {q.why}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
