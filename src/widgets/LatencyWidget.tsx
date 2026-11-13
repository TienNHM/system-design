import { useState } from 'react';
import { WidgetFrame } from './WidgetFrame';

const ROWS: { label: string; ns: number; shown: string }[] = [
  { label: 'Đọc L1 cache', ns: 1, shown: '1 ns' },
  { label: 'Đọc L2 cache', ns: 10, shown: '10 ns' },
  { label: 'Đọc RAM', ns: 100, shown: '100 ns' },
  { label: 'Gửi 1 KB qua mạng 1 Gbps', ns: 10_000, shown: '10 µs' },
  { label: 'Đọc SSD', ns: 100_000, shown: '100 µs' },
  { label: 'Insert database', ns: 1_000_000, shown: '1 ms' },
  { label: 'CA → Hà Lan → CA', ns: 100_000_000, shown: '100 ms' },
  { label: 'Chu kỳ retry', ns: 5_000_000_000, shown: '5 s' },
];

const MAX_LOG = Math.log10(ROWS[ROWS.length - 1].ns);

/** Phóng đại: 1 ns ⇒ 1 giây. */
function humanScale(ns: number): string {
  const s = ns;
  if (s < 60) return `${s} giây`;
  if (s < 3600) return `${(s / 60).toFixed(1)} phút`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} giờ`;
  if (s < 86400 * 365) return `${(s / 86400).toFixed(1)} ngày`;
  return `${Math.round(s / (86400 * 365))} năm`;
}

export function LatencyWidget() {
  const [human, setHuman] = useState(false);
  return (
    <WidgetFrame title="Thang latency (thang log)">
      <div className="controls">
        <label className="lbl" htmlFor="lat-human">
          <input id="lat-human" type="checkbox" checked={human} onChange={e => setHuman(e.target.checked)} />
          Phóng to theo thang con người (1 ns = 1 giây)
        </label>
      </div>
      <div>
        {ROWS.map(r => (
          <div className="lat-row" key={r.label}>
            <span>{r.label}</span>
            <div className="track">
              <i style={{ width: `${Math.max(2, ((Math.log10(r.ns) + 0.3) / (MAX_LOG + 0.3)) * 100)}%` }} />
            </div>
            <span className="v">{r.shown}</span>
            {human && <span className="human">≈ {humanScale(r.ns)}</span>}
          </div>
        ))}
      </div>
      <p className="out" style={{ marginTop: 10 }}>
        Mỗi vạch chia là gấp 10 lần. Nếu đọc RAM mất <b>1 phút 40 giây</b> thì một vòng mạng xuyên lục địa mất hơn{' '}
        <b>3 năm</b>.
      </p>
    </WidgetFrame>
  );
}
