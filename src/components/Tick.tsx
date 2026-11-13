export function Tick({ done }: { done: boolean }) {
  return (
    <span className={`tick${done ? ' done' : ''}`} aria-label={done ? 'Đã học' : 'Chưa học'}>
      ✓
    </span>
  );
}
