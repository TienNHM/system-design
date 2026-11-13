import { LESSONS, MODULES } from './lessons';
import type { Lesson, Module, Question } from '../types';

export { LESSONS, MODULES };
export { TOC } from './toc';

export const lessonById = (id: string): Lesson | undefined => LESSONS.find(l => l.id === id);
export const moduleById = (id: string): Module | undefined => MODULES.find(m => m.id === id);
export const lessonsOf = (modId: string): Lesson[] => LESSONS.filter(l => l.mod === modId);

/** Bài học đầu tiên có tham chiếu tới trang này của sách. */
export const lessonForPage = (page: number): Lesson | undefined =>
  LESSONS.find(l => l.pages.includes(page));

export interface TaggedQuestion extends Question {
  lessonId: string;
  key: string;
}

export const ALL_QUESTIONS: TaggedQuestion[] = LESSONS.flatMap(l =>
  l.quiz.map((q, i) => ({ ...q, lessonId: l.id, key: `${l.id}-${i}` })),
);
