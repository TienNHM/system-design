import { useState } from 'react';
import { Seg, WidgetFrame } from './WidgetFrame';

type Nines = '99' | '99.9' | '99.99' | '99.999';
const OPTIONS: { id: Nines; label: string }[] = [
  { id: '99', label: '99%' },
  { id: '99.9', label: '99,9%' },
  { id: '99.99', label: '99,99%' },
  { id: '99.999', label: '99,999%' },
];

function fmtDuration(sec: number): string {
  if (sec < 60) return `${sec.toFixed(sec < 10 ? 2 : 1)} giây`;
  if (sec < 3600) return `${(sec / 60).toFixed(1)} phút`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)} giờ`;
  return `${(sec / 86400).toFixed(1)} ngày`;
}

const pct = (a: number) => `${(a * 100).toFixed(4).replace(/\.?0+$/, '').replace('.', ',')}%`;

export function NinesWidget() {
  const [n, setN] = useState<Nines>('99.99');
  const [count, setCount] = useState(3);
  const a = Number(n) / 100;
  const down = 1 - a;
  const serial = a ** count;
  const redundant = 1 - down ** 2;

  return (
    <WidgetFrame title="Máy tính số 9">
      <div className="controls">
        <Seg label="Mức availability" value={n} options={OPTIONS} onChange={setN} />
      </div>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Downtime cho phép</th>
              <th>Mỗi ngày</th>
              <th>Mỗi tháng</th>
              <th>Mỗi năm</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{pct(a)}</td>
              <td className="num">{fmtDuration(down * 86400)}</td>
              <td className="num">{fmtDuration(down * 86400 * 30)}</td>
              <td className="num">{fmtDuration(down * 86400 * 365)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="controls">
        <label className="lbl" htmlFor="nines-count">
          Số thành phần nối tiếp (LB → app → DB…)
        </label>
        <input
          id="nines-count"
          type="number"
          min={1}
          max={10}
          value={count}
          onChange={e => setCount(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
          style={{ width: 70 }}
        />
      </div>
      <p className="out">
        {count} thành phần nối tiếp, mỗi cái {pct(a)} ⇒ cả hệ thống chỉ còn <b>{pct(serial)}</b> (≈{' '}
        {fmtDuration((1 - serial) * 86400 * 365)} downtime/năm).
      </p>
      <p className="out">
        Chạy 2 bản song song dự phòng cho một thành phần ⇒ thành phần đó đạt <b>{pct(redundant)}</b>.
      </p>
    </WidgetFrame>
  );
}
