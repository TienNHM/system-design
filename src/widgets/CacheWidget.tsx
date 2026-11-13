import { useMemo, useState } from 'react';
import { Seg, WidgetFrame } from './WidgetFrame';

type Policy = 'lru' | 'lfu' | 'fifo';
const POLICIES: { id: Policy; label: string }[] = [
  { id: 'lru', label: 'LRU' },
  { id: 'lfu', label: 'LFU' },
  { id: 'fifo', label: 'FIFO' },
];

interface Step {
  key: string;
  hit: boolean;
  state: string[];
  evicted?: string;
}

function simulate(seq: string[], cap: number, policy: Policy): Step[] {
  // order: thứ tự trong cache (đầu = cũ nhất theo tiêu chí của policy)
  let order: string[] = [];
  const freq = new Map<string, number>();
  const steps: Step[] = [];

  for (const key of seq) {
    const hit = order.includes(key);
    let evicted: string | undefined;
    freq.set(key, (freq.get(key) ?? 0) + 1);

    if (hit) {
      if (policy !== 'fifo') order = [...order.filter(k => k !== key), key];
    } else {
      if (order.length >= cap) {
        if (policy === 'lfu') {
          // ít truy cập nhất; hòa thì loại phần tử lâu chưa dùng nhất
          const min = Math.min(...order.map(k => freq.get(k) ?? 0));
          evicted = order.find(k => (freq.get(k) ?? 0) === min);
        } else {
          evicted = order[0];
        }
        order = order.filter(k => k !== evicted);
      }
      order = [...order, key];
    }
    steps.push({ key, hit, state: order.slice(), evicted });
  }
  return steps;
}

export function CacheWidget() {
  const [policy, setPolicy] = useState<Policy>('lru');
  const [cap, setCap] = useState(3);
  const [input, setInput] = useState('A B C A D A B E A C');
  const seq = input.toUpperCase().split(/[\s,]+/).filter(Boolean).slice(0, 30);
  const steps = useMemo(() => simulate(seq, cap, policy), [seq.join(' '), cap, policy]); // eslint-disable-line react-hooks/exhaustive-deps
  const hits = steps.filter(s => s.hit).length;

  return (
    <WidgetFrame title="Mô phỏng cache eviction">
      <div className="controls">
        <Seg label="Chiến lược" value={policy} options={POLICIES} onChange={setPolicy} />
        <label className="lbl" htmlFor="cache-cap">
          Dung lượng
        </label>
        <input
          id="cache-cap"
          type="number"
          min={1}
          max={6}
          value={cap}
          onChange={e => setCap(Math.min(6, Math.max(1, Number(e.target.value) || 1)))}
          style={{ width: 64 }}
        />
      </div>
      <div className="controls">
        <label className="lbl" htmlFor="cache-seq">
          Chuỗi truy cập
        </label>
        <input
          id="cache-seq"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: '1 1 220px', minWidth: 0 }}
        />
      </div>
      <p className="out">
        Hit rate: <b>{steps.length ? Math.round((hits / steps.length) * 100) : 0}%</b> ({hits}/{steps.length} lần hit)
      </p>
      <div className="cache-steps">
        {steps.map((s, i) => (
          <div key={i} className={`cstep ${s.hit ? 'hit' : 'miss'}`}>
            <b>{s.key}</b>
            <span>{s.hit ? 'HIT' : 'MISS'}</span>
            <div className="slots">
              {s.state.map(k => (
                <span className="slot" key={k}>
                  {k}
                </span>
              ))}
              {s.evicted && <span className="slot ev">{s.evicted}</span>}
            </div>
          </div>
        ))}
      </div>
      <p className="out" style={{ marginTop: 10 }}>
        Ô gạch ngang là phần tử vừa bị loại. Thử chuỗi có một key "hot" lặp lại nhiều lần để thấy LFU giữ nó lại tốt hơn
        FIFO.
      </p>
    </WidgetFrame>
  );
}
