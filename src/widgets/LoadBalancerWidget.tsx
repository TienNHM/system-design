import { useMemo, useState } from 'react';
import { Seg, WidgetFrame } from './WidgetFrame';

type Algo = 'rr' | 'wrr' | 'hash' | 'least';
const ALGOS: { id: Algo; label: string }[] = [
  { id: 'rr', label: 'Round robin' },
  { id: 'wrr', label: 'Weighted RR' },
  { id: 'hash', label: 'IP hash' },
  { id: 'least', label: 'Least connections' },
];

const SERVERS = [
  { name: 'S1', weight: 3 },
  { name: 'S2', weight: 2 },
  { name: 'S3', weight: 1 },
];
const CLIENTS = ['An', 'Bình', 'Chi'];

interface Req {
  id: number;
  client: number;
  /** Thời gian xử lý, tính theo số tick */
  dur: number;
}

function makeRequests(): Req[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    client: Math.floor(Math.random() * CLIENTS.length),
    dur: 1 + Math.floor(Math.random() * 5),
  }));
}

function hashStr(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Mỗi request đến ở tick = id. Trả về chỉ số server cho từng request. */
function assign(algo: Algo, reqs: Req[]): number[] {
  const wrrOrder = SERVERS.flatMap((s, i) => Array(s.weight).fill(i) as number[]);
  const busyUntil: number[][] = SERVERS.map(() => []);
  return reqs.map((r, i) => {
    let s: number;
    if (algo === 'rr') s = i % SERVERS.length;
    else if (algo === 'wrr') s = wrrOrder[i % wrrOrder.length];
    else if (algo === 'hash') s = hashStr(CLIENTS[r.client]) % SERVERS.length;
    else {
      const active = busyUntil.map(list => list.filter(end => end > r.id).length);
      s = active.indexOf(Math.min(...active));
    }
    busyUntil[s].push(r.id + r.dur);
    return s;
  });
}

export function LoadBalancerWidget() {
  const [algo, setAlgo] = useState<Algo>('rr');
  const [reqs, setReqs] = useState<Req[]>(makeRequests);
  const placed = useMemo(() => assign(algo, reqs), [algo, reqs]);

  return (
    <WidgetFrame title="Mô phỏng load balancer">
      <div className="controls">
        <Seg label="Thuật toán" value={algo} options={ALGOS} onChange={setAlgo} />
        <button type="button" className="btn small" onClick={() => setReqs(makeRequests())}>
          Tạo request mới
        </button>
      </div>
      <div className="servers">
        {SERVERS.map((s, si) => {
          const mine = reqs.filter((_, i) => placed[i] === si);
          return (
            <div className="srv" key={s.name}>
              <h3>
                {s.name} <span>{algo === 'wrr' ? `trọng số ${s.weight}` : `${mine.length} request`}</span>
              </h3>
              <div className="reqs">
                {mine.map(r => (
                  <span key={r.id} className={`req c${r.client}`} title={`Xử lý trong ${r.dur} tick`}>
                    #{r.id} {CLIENTS[r.client]}·{r.dur}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="out" style={{ marginTop: 10 }}>
        Mỗi ô là một request: số thứ tự, người gửi và thời gian xử lý (tick). Request thứ n đến ở tick n.{' '}
        {algo === 'hash' && 'Với IP hash, cùng một người luôn vào cùng một server.'}
        {algo === 'least' && 'Least connections chọn server đang có ít request chưa xử lý xong nhất.'}
        {algo === 'wrr' && 'S1 nhận gấp 3 lần S3 vì trọng số cao hơn.'}
        {algo === 'rr' && 'Round robin chia đều, không quan tâm request nặng hay nhẹ.'}
      </p>
    </WidgetFrame>
  );
}
