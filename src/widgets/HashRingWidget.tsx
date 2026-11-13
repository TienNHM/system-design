import { useMemo, useState } from 'react';
import { WidgetFrame } from './WidgetFrame';

const RING = 360;
const KEYS = Array.from({ length: 24 }, (_, i) => `user:${1000 + i * 37}`);
const COLORS = ['var(--accent)', 'var(--signal)', 'var(--good)', 'var(--bad)', 'var(--ink-soft)', 'var(--muted)'];

/** FNV-1a 32-bit, đổi ra góc 0–359 */
function angle(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % RING;
}

interface Point {
  server: number;
  a: number;
}

function buildRing(servers: number, vnodes: number): Point[] {
  const pts: Point[] = [];
  for (let s = 0; s < servers; s++) {
    for (let v = 0; v < vnodes; v++) pts.push({ server: s, a: angle(`S${s + 1}#${v}`) });
  }
  return pts.sort((x, y) => x.a - y.a);
}

/** Server sở hữu key = điểm đầu tiên trên vòng theo chiều kim đồng hồ */
function owner(ring: Point[], a: number): number {
  return (ring.find(p => p.a >= a) ?? ring[0]).server;
}

export function HashRingWidget() {
  const [servers, setServers] = useState(4);
  const [vnodes, setVnodes] = useState(1);

  const ring = useMemo(() => buildRing(servers, vnodes), [servers, vnodes]);
  const before = useMemo(() => buildRing(servers - 1, vnodes), [servers, vnodes]);
  const owners = KEYS.map(k => owner(ring, angle(k)));
  const ownersBefore = KEYS.map(k => (servers > 1 ? owner(before, angle(k)) : 0));
  const moved = servers > 1 ? owners.filter((o, i) => o !== ownersBefore[i]).length : 0;
  const modMoved = servers > 1 ? KEYS.filter(k => angle(k) % servers !== angle(k) % (servers - 1)).length : 0;
  const counts = Array.from({ length: servers }, (_, s) => owners.filter(o => o === s).length);

  const R = 120;
  const C = 150;
  const pos = (a: number, r = R) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
  };

  return (
    <WidgetFrame title="Vòng consistent hashing">
      <div className="controls">
        <label className="lbl" htmlFor="ring-servers">Số server</label>
        <input id="ring-servers" type="range" min={2} max={6} value={servers} onChange={e => setServers(Number(e.target.value))} />
        <b className="mono">{servers}</b>
        <label className="lbl" htmlFor="ring-vnodes" style={{ marginLeft: 12 }}>Virtual node / server</label>
        <input id="ring-vnodes" type="range" min={1} max={20} value={vnodes} onChange={e => setVnodes(Number(e.target.value))} />
        <b className="mono">{vnodes}</b>
      </div>
      <div className="ring-wrap">
        <svg viewBox="0 0 300 300" role="img" aria-label="Vòng băm với server và key" className="ring-svg">
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--line-strong)" strokeWidth={2} />
          {KEYS.map((k, i) => {
            const p = pos(angle(k), R - 16);
            return <circle key={k} cx={p.x} cy={p.y} r={4} fill={COLORS[owners[i]]} opacity={0.85} />;
          })}
          {ring.map((pt, i) => {
            const p = pos(pt.a);
            return (
              <g key={i}>
                <rect x={p.x - 6} y={p.y - 6} width={12} height={12} rx={2} fill={COLORS[pt.server]} stroke="var(--surface)" strokeWidth={1.5} />
                {vnodes <= 2 && (
                  <text x={pos(pt.a, R + 18).x} y={pos(pt.a, R + 18).y} fontSize={10} textAnchor="middle" dominantBaseline="central" fill="var(--ink)">
                    S{pt.server + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="ring-side">
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Server</th><th>Số key</th></tr>
              </thead>
              <tbody>
                {counts.map((c, s) => (
                  <tr key={s}>
                    <td><span className="swatch" style={{ background: COLORS[s] }} /> S{s + 1}</td>
                    <td className="num">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="out">
            Thêm S{servers} vào cụm {servers - 1} server: consistent hashing di chuyển <b>{moved}/{KEYS.length}</b> key. Nếu dùng{' '}
            <code>hash % N</code>, số key phải di chuyển là <b>{modMoved}/{KEYS.length}</b>.
          </p>
        </div>
      </div>
      <p className="out" style={{ marginTop: 10 }}>
        Ô vuông là server (hoặc virtual node), chấm tròn là key, cùng màu với server sở hữu nó. Mỗi key thuộc về server đầu tiên gặp
        được khi đi theo chiều kim đồng hồ. Tăng virtual node để thấy số key giữa các server đều hơn.
      </p>
    </WidgetFrame>
  );
}
