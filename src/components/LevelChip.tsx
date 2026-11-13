import type { Level } from '../types';

const LABEL: Record<Level, string> = {
  'co-ban': 'Cơ bản',
  'trung-binh': 'Trung bình',
  'nang-cao': 'Nâng cao',
};

export function LevelChip({ level }: { level: Level }) {
  return <span className={`chip lv lv-${level}`}>{LABEL[level]}</span>;
}
