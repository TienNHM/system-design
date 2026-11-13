/**
 * Helper sinh HTML/SVG cho nội dung bài học.
 * Tất cả trả về chuỗi HTML để chèn vào `body` của bài học.
 * Màu sắc lấy từ CSS class (styles.css → phần "Diagrams"), nên tự đổi theo light/dark.
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ------------------------------------------------------------------ */
/* Khối văn bản                                                        */
/* ------------------------------------------------------------------ */

type FlowNode = string | [string, 'hl' | 'warn' | ''];

/** Chuỗi bước nằm ngang dạng chip, tự xuống dòng trên mobile. */
export const flow = (nodes: FlowNode[], cap?: string) =>
  '<div class="flow">' +
  nodes
    .map(n => {
      const [txt, cls] = Array.isArray(n) ? n : [n, ''];
      return `<span class="node ${cls}">${txt}</span>`;
    })
    .join('<span class="arr">→</span>') +
  '</div>' +
  (cap ? `<p class="flow-cap">${cap}</p>` : '');

/** Bảng. Ô có thể chứa HTML. */
export const tbl = (head: string[], rows: string[][]) =>
  '<div class="tbl-wrap"><table><thead><tr>' +
  head.map(h => `<th>${h}</th>`).join('') +
  '</tr></thead><tbody>' +
  rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') +
  '</tbody></table></div>';

/** Hộp lưu ý màu cam. Nên mở đầu bằng <b>Tiêu đề ngắn.</b> */
export const note = (t: string) => `<div class="note">${t}</div>`;

/** Hộp mẹo/ví dụ thực tế màu xanh. */
export const tip = (t: string) => `<div class="tip">${t}</div>`;

/** Hai hoặc ba cột so sánh song song. */
export const cols = (items: { title: string; body: string }[]) =>
  `<div class="cols cols-${items.length}">` +
  items.map(i => `<div class="col"><h3>${i.title}</h3>${i.body}</div>`).join('') +
  '</div>';

/** Danh sách câu hỏi phỏng vấn (dùng ở cuối body). */
export const interview = (qs: string[]) =>
  '<h2>Câu hỏi phỏng vấn gợi ý</h2><ol class="iv">' + qs.map(q => `<li>${q}</li>`).join('') + '</ol>';

/* ------------------------------------------------------------------ */
/* Sơ đồ kiến trúc (box + mũi tên)                                     */
/* ------------------------------------------------------------------ */

export type NodeKind =
  | 'client' // người dùng, trình duyệt, app
  | 'service' // server, service, process (mặc định)
  | 'store' // database, storage (vẽ hình trụ)
  | 'cache' // cache (viền xanh)
  | 'queue' // message queue, topic, log (có vạch dọc)
  | 'lb' // load balancer, gateway, proxy (viền đậm màu accent)
  | 'external' // hệ thống bên ngoài, bên thứ ba (viền nét đứt)
  | 'warn' // thành phần lỗi / điểm nghẽn (màu cam)
  | 'good'; // thành phần khỏe / kết quả tốt (màu xanh lá)

export interface DNode {
  id: string;
  /** Dùng "\n" để xuống dòng */
  label: string;
  /** Tâm của node trong hệ tọa độ viewBox */
  x: number;
  y: number;
  w?: number; // mặc định 120
  h?: number; // mặc định 48 (store: 60)
  kind?: NodeKind;
  /** Dòng chữ nhỏ dưới label, ví dụ "Redis" */
  sub?: string;
}

export interface DEdge {
  from: string;
  to: string;
  /** Nhãn trên mũi tên. Có thể là số thứ tự bước như "1" */
  label?: string;
  dashed?: boolean;
  kind?: 'warn' | 'good' | 'muted';
  /** true: vẽ mũi tên hai chiều */
  both?: boolean;
  /** Độ cong (px, có thể âm). 0 = thẳng */
  curve?: number;
}

export interface DGroup {
  x: number; // góc trên trái
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface DiagramSpec {
  /** Kích thước viewBox. Nên dùng w = 720, h tùy nội dung */
  w: number;
  h: number;
  nodes: DNode[];
  edges?: DEdge[];
  groups?: DGroup[];
  /** Chú thích dưới hình, bắt đầu bằng "Hình: ..." */
  caption?: string;
  /** Mô tả cho trình đọc màn hình. Mặc định = caption */
  alt?: string;
}

const DEFAULT_W = 120;
const DEFAULT_H = 48;

function boxOf(n: DNode) {
  const w = n.w ?? DEFAULT_W;
  const h = n.h ?? (n.kind === 'store' ? 60 : DEFAULT_H);
  return { w, h };
}

/** Điểm trên viền hình chữ nhật của node theo hướng tới (tx, ty). */
function borderPoint(n: DNode, tx: number, ty: number, gap = 4) {
  const { w, h } = boxOf(n);
  const dx = tx - n.x;
  const dy = ty - n.y;
  if (dx === 0 && dy === 0) return { x: n.x, y: n.y };
  const sx = (w / 2 + gap) / Math.abs(dx || 1e-9);
  const sy = (h / 2 + gap) / Math.abs(dy || 1e-9);
  const s = Math.min(sx, sy);
  return { x: n.x + dx * s, y: n.y + dy * s };
}

function textLines(label: string, x: number, y: number, cls: string, lineH = 15) {
  const lines = label.split('\n');
  const start = y - ((lines.length - 1) * lineH) / 2;
  return lines
    .map((l, i) => `<text class="${cls}" x="${x}" y="${start + i * lineH}" text-anchor="middle" dominant-baseline="central">${esc(l)}</text>`)
    .join('');
}

function drawNode(n: DNode) {
  const kind = n.kind ?? 'service';
  const { w, h } = boxOf(n);
  const x0 = n.x - w / 2;
  const y0 = n.y - h / 2;
  let shape: string;
  if (kind === 'store') {
    const ry = 8;
    shape =
      `<path class="dg-shape" d="M${x0},${y0 + ry} a${w / 2},${ry} 0 0,1 ${w},0 v${h - 2 * ry} a${w / 2},${ry} 0 0,1 ${-w},0 z"/>` +
      `<path class="dg-line" d="M${x0},${y0 + ry} a${w / 2},${ry} 0 0,0 ${w},0"/>`;
  } else if (kind === 'queue') {
    const bars = [0.72, 0.8, 0.88]
      .map(f => `<line class="dg-line" x1="${x0 + w * f}" y1="${y0 + 6}" x2="${x0 + w * f}" y2="${y0 + h - 6}"/>`)
      .join('');
    shape = `<rect class="dg-shape" x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6"/>${bars}`;
  } else if (kind === 'client') {
    shape = `<rect class="dg-shape" x="${x0}" y="${y0}" width="${w}" height="${h}" rx="${Math.min(h / 2, 22)}"/>`;
  } else {
    shape = `<rect class="dg-shape" x="${x0}" y="${y0}" width="${w}" height="${h}" rx="8"/>`;
  }
  const labelX = kind === 'queue' ? x0 + w * 0.36 : n.x;
  const ly = n.sub ? n.y - 7 : n.y + (kind === 'store' ? 4 : 0);
  const sub = n.sub
    ? `<text class="dg-sub" x="${labelX}" y="${n.y + (n.label.includes('\n') ? 20 : 11)}" text-anchor="middle" dominant-baseline="central">${esc(n.sub)}</text>`
    : '';
  return `<g class="dg-node k-${kind}">${shape}${textLines(n.label, labelX, ly, 'dg-label')}${sub}</g>`;
}

function drawEdge(e: DEdge, byId: Map<string, DNode>) {
  const a = byId.get(e.from);
  const b = byId.get(e.to);
  if (!a || !b) return '';
  const p1 = borderPoint(a, b.x, b.y);
  const p2 = borderPoint(b, a.x, a.y, 6);
  const cls = `dg-edge${e.dashed ? ' dashed' : ''}${e.kind ? ' e-' + e.kind : ''}`;
  const marker = `url(#dg-arrow${e.kind ? '-' + e.kind : ''})`;
  let d: string;
  let mx = (p1.x + p2.x) / 2;
  let my = (p1.y + p2.y) / 2;
  if (e.curve) {
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
    const nx = -(p2.y - p1.y) / len;
    const ny = (p2.x - p1.x) / len;
    const cx = mx + nx * e.curve;
    const cy = my + ny * e.curve;
    d = `M${p1.x},${p1.y} Q${cx},${cy} ${p2.x},${p2.y}`;
    mx = (p1.x + 2 * cx + p2.x) / 4;
    my = (p1.y + 2 * cy + p2.y) / 4;
  } else {
    d = `M${p1.x},${p1.y} L${p2.x},${p2.y}`;
  }
  const path = `<path class="${cls}" d="${d}" marker-end="${marker}"${e.both ? ` marker-start="${marker}"` : ''}/>`;
  let label = '';
  if (e.label) {
    const isStep = /^\d{1,2}[a-z]?$/.test(e.label);
    if (isStep) {
      label = `<g class="dg-step"><circle cx="${mx}" cy="${my}" r="10"/><text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="central">${esc(e.label)}</text></g>`;
    } else {
      const lines = e.label.split('\n');
      const tw = Math.max(...lines.map(l => l.length)) * 6.4 + 10;
      const th = lines.length * 14 + 4;
      label =
        `<rect class="dg-elabel-bg" x="${mx - tw / 2}" y="${my - th / 2}" width="${tw}" height="${th}" rx="4"/>` +
        textLines(e.label, mx, my, 'dg-elabel', 14);
    }
  }
  return path + label;
}

const MARKERS = ['', '-warn', '-good', '-muted']
  .map(
    k =>
      `<marker id="dg-arrow${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="dg-head${k ? ' e' + k : ''}" d="M0,0 L10,5 L0,10 z"/></marker>`,
  )
  .join('');

/** Lưu lại spec của mọi sơ đồ để script kiểm tra (scripts/content-stats.mjs) phát hiện node chồng/tràn. */
export const DIAGRAM_SPECS: DiagramSpec[] = [];

/** Sơ đồ kiến trúc: node + mũi tên + nhóm. Trả về <figure> chứa SVG. */
export function diagram(spec: DiagramSpec): string {
  DIAGRAM_SPECS.push(spec);
  const byId = new Map(spec.nodes.map(n => [n.id, n]));
  const groups = (spec.groups ?? [])
    .map(
      g =>
        `<g class="dg-group"><rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="12"/><text x="${g.x + 12}" y="${g.y + 16}">${esc(g.label)}</text></g>`,
    )
    .join('');
  const edges = (spec.edges ?? []).map(e => drawEdge(e, byId)).join('');
  const nodes = spec.nodes.map(drawNode).join('');
  const alt = esc(spec.alt ?? spec.caption ?? 'Sơ đồ minh họa');
  return (
    `<figure class="dg"><div class="dg-scroll"><svg viewBox="0 0 ${spec.w} ${spec.h}" role="img" aria-label="${alt}" style="min-width:${Math.min(spec.w, 560)}px">` +
    `<defs>${MARKERS}</defs>${groups}${edges}${nodes}</svg></div>` +
    (spec.caption ? `<figcaption>${spec.caption}</figcaption>` : '') +
    '</figure>'
  );
}

/* ------------------------------------------------------------------ */
/* Sơ đồ tuần tự (sequence diagram)                                    */
/* ------------------------------------------------------------------ */

export interface SeqMsg {
  from: string;
  to: string;
  label: string;
  /** Mũi tên nét đứt, dùng cho response */
  dashed?: boolean;
  kind?: 'warn' | 'good';
}

export interface SeqSpec {
  actors: { id: string; label: string; kind?: NodeKind }[];
  msgs: (SeqMsg | { note: string })[];
  caption?: string;
  /** Chiều rộng viewBox, mặc định 720 */
  w?: number;
}

/** Sơ đồ tuần tự: các actor ở trên, message đánh số theo thứ tự từ trên xuống. */
export function seq(spec: SeqSpec): string {
  const W = spec.w ?? 720;
  const pad = 70;
  const n = spec.actors.length;
  const gapX = n > 1 ? (W - pad * 2) / (n - 1) : 0;
  const xOf = new Map(spec.actors.map((a, i) => [a.id, pad + i * gapX]));
  const top = 34;
  const rowH = 40;
  const H = top + 30 + spec.msgs.length * rowH + 20;
  let step = 0;

  const heads = spec.actors
    .map(a => {
      const x = xOf.get(a.id)!;
      return (
        `<line class="dg-life" x1="${x}" y1="${top + 22}" x2="${x}" y2="${H - 8}"/>` +
        drawNode({ id: a.id, label: a.label, x, y: top, w: Math.min(130, gapX ? gapX - 14 : 130), h: 40, kind: a.kind ?? 'service' })
      );
    })
    .join('');

  const rows = spec.msgs
    .map((m, i) => {
      const y = top + 52 + i * rowH;
      if ('note' in m) {
        return `<rect class="dg-note" x="${pad - 50}" y="${y - 12}" width="${W - (pad - 50) * 2}" height="24" rx="5"/><text class="dg-elabel" x="${W / 2}" y="${y}" text-anchor="middle" dominant-baseline="central">${esc(m.note)}</text>`;
      }
      step++;
      const x1 = xOf.get(m.from)!;
      const x2 = xOf.get(m.to)!;
      const cls = `dg-edge${m.dashed ? ' dashed' : ''}${m.kind ? ' e-' + m.kind : ''}`;
      const marker = `url(#dg-arrow${m.kind ? '-' + m.kind : ''})`;
      const dir = x2 > x1 ? 1 : -1;
      let line: string;
      let tx: number;
      if (x1 === x2) {
        line = `<path class="${cls}" d="M${x1},${y - 6} h36 v14 h-30" fill="none" marker-end="${marker}"/>`;
        tx = x1 + 44;
        return line + `<text class="dg-elabel" x="${tx}" y="${y}" dominant-baseline="central">${step}. ${esc(m.label)}</text>`;
      }
      line = `<path class="${cls}" d="M${x1 + dir * 3},${y + 6} L${x2 - dir * 6},${y + 6}" marker-end="${marker}"/>`;
      tx = (x1 + x2) / 2;
      return line + `<text class="dg-elabel" x="${tx}" y="${y - 5}" text-anchor="middle">${step}. ${esc(m.label)}</text>`;
    })
    .join('');

  return (
    `<figure class="dg"><div class="dg-scroll"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(spec.caption ?? 'Sơ đồ tuần tự')}" style="min-width:${Math.min(W, 560)}px">` +
    `<defs>${MARKERS}</defs>${heads}${rows}</svg></div>` +
    (spec.caption ? `<figcaption>${spec.caption}</figcaption>` : '') +
    '</figure>'
  );
}
