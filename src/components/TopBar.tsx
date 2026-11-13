interface Props {
  route: string;
  doneCount: number;
  total: number;
}

const NAV = [
  { id: 'home', label: 'Lộ trình' },
  { id: 'on-tap', label: 'Ôn tập' },
  { id: 'muc-luc', label: 'Mục lục sách' },
];

export function TopBar({ route, doneCount, total }: Props) {
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#home">
          <b>Sổ tay System Design</b>
          <span>ByteByteGo 2024 · VI</span>
        </a>
        <nav className="topnav" aria-label="Điều hướng chính">
          {NAV.map(n => (
            <a key={n.id} href={`#${n.id}`} className={route === n.id ? 'on' : ''}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="progress-mini" title={`Đã học ${doneCount}/${total} bài`}>
          <div className="meter">
            <i style={{ width: `${pct}%` }} />
          </div>
          <span>
            {doneCount}/{total}
          </span>
        </div>
      </div>
    </header>
  );
}
