import { useCallback, useState } from 'react';

const KEY = 'sd-vi-progress';

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function save(done: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]));
  } catch {
    /* trình duyệt chặn storage: tiến độ chỉ giữ trong phiên này */
  }
}

/** Tiến độ học, lưu trong localStorage của trình duyệt. */
export function useProgress() {
  const [done, setDone] = useState<Set<string>>(load);

  const setLesson = useCallback((id: string, value: boolean) => {
    setDone(prev => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      save(next);
      return next;
    });
  }, []);

  return { done, setLesson };
}
