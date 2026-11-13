import { LESSONS, lessonById } from './data';
import { useHashRoute } from './hooks/useHashRoute';
import { useProgress } from './hooks/useProgress';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { LessonPage } from './pages/LessonPage';
import { Review } from './pages/Review';
import { TocPage } from './pages/TocPage';

export default function App() {
  const route = useHashRoute();
  const { done, setLesson } = useProgress();
  const lesson = lessonById(route);

  let view;
  if (lesson) {
    view = <LessonPage lesson={lesson} isDone={done.has(lesson.id)} setDone={v => setLesson(lesson.id, v)} />;
  } else if (route === 'on-tap') {
    view = <Review />;
  } else if (route === 'muc-luc') {
    view = <TocPage />;
  } else {
    view = <Home done={done} />;
  }

  return (
    <>
      <TopBar route={route} doneCount={done.size} total={LESSONS.length} />
      <div className="shell">
        <Sidebar route={route} done={done} />
        <main>{view}</main>
      </div>
    </>
  );
}
