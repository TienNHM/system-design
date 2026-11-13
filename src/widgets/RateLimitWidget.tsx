import { useEffect, useRef, useState } from 'react';
import { WidgetFrame } from './WidgetFrame';

interface Log {
  t: number;
  ok: boolean;
}

/** Mô phỏng token bucket: bucket chứa tối đa `cap` token, nạp `rate` token mỗi giây, mỗi request tốn 1 token. */
export function RateLimitWidget() {
  const [cap, setCap] = useState(5);
  const [rate, setRate] = useState(1);
  const [tokens, setTokens] = useState(5);
  const [log, setLog] = useState<Log[]>([]);
  const last = useRef(performance.now());
  const start = useRef(performance.now());

  // Nạp token theo thời gian thực
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - last.current) / 1000;
      last.current = now;
      setTokens(t => Math.min(cap, t + dt * rate));
    }, 100);
    return () => window.clearInterval(id);
  }, [cap, rate]);

  const send = (n: number) => {
    let t = tokens;
    const entries: Log[] = [];
    for (let i = 0; i < n; i++) {
      const ok = t >= 1;
      if (ok) t -= 1;
      entries.push({ t: (performance.now() - start.current) / 1000, ok });
    }
    setTokens(t);
    setLog(l => [...entries.reverse(), ...l].slice(0, 30));
  };

  const reset = () => {
    setTokens(cap);
    setLog([]);
    start.current = performance.now();
  };

  const ok = log.filter(l => l.ok).length;

  return (
    <WidgetFrame title="Token bucket">
      <div className="controls">
        <label className="lbl" htmlFor="rl-cap">Dung lượng bucket</label>
        <input id="rl-cap" type="number" min={1} max={20} value={cap} style={{ width: 64 }}
          onChange={e => { const v = Math.min(20, Math.max(1, Number(e.target.value) || 1)); setCap(v); setTokens(t => Math.min(v, t)); }} />
        <label className="lbl" htmlFor="rl-rate">Nạp (token/giây)</label>
        <input id="rl-rate" type="number" min={0.5} max={10} step={0.5} value={rate} style={{ width: 70 }}
          onChange={e => setRate(Math.min(10, Math.max(0.5, Number(e.target.value) || 1)))} />
      </div>
      <div className="bucket" aria-label={`Còn ${Math.floor(tokens)} token`}>
        {Array.from({ length: cap }, (_, i) => (
          <span key={i} className={`tok${i < Math.floor(tokens) ? ' full' : ''}`} />
        ))}
        <span className="mono out" style={{ marginLeft: 8 }}>
          <b>{tokens.toFixed(1)}</b> / {cap} token
        </span>
      </div>
      <div className="controls">
        <button type="button" className="btn small primary" onClick={() => send(1)}>Gửi 1 request</button>
        <button type="button" className="btn small" onClick={() => send(10)}>Gửi dồn 10 request</button>
        <button type="button" className="btn small" onClick={reset}>Làm lại</button>
      </div>
      <p className="out">
        Được xử lý <b>{ok}</b> · Bị từ chối (HTTP 429) <b>{log.length - ok}</b>
      </p>
      <div className="reqs" style={{ minHeight: 26 }}>
        {log.map((l, i) => (
          <span key={i} className={`req ${l.ok ? 'c2' : 'c1'}`}>
            {l.ok ? '200' : '429'} · {l.t.toFixed(1)}s
          </span>
        ))}
      </div>
      <p className="out" style={{ marginTop: 10 }}>
        Bucket cho phép một đợt burst bằng đúng dung lượng của nó, sau đó chỉ cho qua theo tốc độ nạp. Bấm "Gửi dồn 10 request" rồi
        chờ vài giây và bấm lại để thấy token được nạp dần.
      </p>
    </WidgetFrame>
  );
}
