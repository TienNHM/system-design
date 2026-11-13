import { LESSONS } from './data/lessons';

export default function App() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Sổ tay System Design</h1>
      <p>{LESSONS.length} bài học đang được chuyển sang React.</p>
    </main>
  );
}
