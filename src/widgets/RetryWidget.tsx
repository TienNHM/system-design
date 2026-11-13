import { useMemo, useState } from 'react';
import { WidgetFrame } from './WidgetFrame';

const ATTEMPTS = 6;
const CAP = 32;

const SERIES = [
  { id: 'linear', label: 'Linear', color: 'var(--muted)', dash: '' },
  { id: 'linear-jitter', label: 'Linear jitter', color: 'var(--good)', dash: '5 4' },
  { id: 'exp', label: 'Exponential', color: 'var(--accent)', dash: '' },
  { id: 'exp-jitter', label: 'Exponential jitter', color: 'var(--signal)', dash: '5 4' },
] as const;

function compute(seed: number[]): Record<string, number[]> {
  const n = Array.from({ length: ATTEMPTS }, (_, i) => i + 1);
  return {
    linear: n.map(k => k),
    'linear-jitter': n.map((k, i) => k + seed[i]),
    exp: n.map(k => Math.min(CAP, 2 ** (k - 1))),
    'exp-jitter': n.map((k, i) => {
      const base = Math.min(CAP, 2 ** (k - 1));
      return base / 2 + seed[i] * (base / 2);
    }),
  };
}

const newSeed = () => Array.from({ length: ATTEMPTS }, () => Math.random());

export function RetryWidget() {
  const [seed, setSeed] = useState(newSeed);
  const data = useMemo(() => compute(seed), [seed]);

  const W = 560;
  const H = 260;
  const pad = { l: 44, r: 16, t: 14, b: 36 };
  const x = (i: number) => pad.l + (i / (ATTEMPTS - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - (v / CAP) * (H - pad.t - pad.b);
  const ticks = [0, 8, 16, 24, 32];

  return (
    <WidgetFrame title="Khoảng chờ giữa các lần retry">
      <div className="controls">
        <button type="button" className="btn small" onClick={() => setSeed(newSeed())}>
          Sinh jitter mới
        </button>
        <span className="out">Bắt đầu từ 1 giây, tối đa {CAP} giây.</span>
      </div>
      <div className="chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Biểu đồ khoảng chờ retry theo số lần thử">
          {ticks.map(t => (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--muted)">
                {t}s
              </text>
            </g>
          ))}
          {Array.from({ length: ATTEMPTS }, (_, i) => (
            <text key={i} x={x(i)} y={H - pad.b + 18} textAnchor="middle" fontSize={11} fill="var(--muted)">
              Lần {i + 1}
            </text>
          ))}
          {SERIES.map(s => {
            const pts = data[s.id].map((v, i) => `${x(i)},${y(v)}`).join(' ');
            return (
              <g key={s.id}>
                <polyline points={pts} fill="none" stroke={s.color} strokeWidth={2.2} strokeDasharray={s.dash} />
                {data[s.id].map((v, i) => (
                  <circle key={i} cx={x(i)} cy={y(v)} r={3} fill={s.color} />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="legend">
        {SERIES.map(s => (
          <span key={s.id}>
            <i style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <p className="out" style={{ marginTop: 10 }}>
        Bấm "Sinh jitter mới" nhiều lần: hai đường có jitter thay đổi, nên hàng nghìn client sẽ retry vào các thời điểm
        khác nhau thay vì cùng lúc.
      </p>
    </WidgetFrame>
  );
}
