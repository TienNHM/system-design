// Thống kê nội dung bài học: node scripts/content-stats.mjs
// Bundle src/data/lessons.ts bằng esbuild (đi kèm Vite) rồi in bảng kiểm tra chất lượng.
import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = mkdtempSync(join(tmpdir(), 'sd-stats-'));
const out = join(dir, 'lessons.mjs');
await build({ entryPoints: ['scripts/entry-stats.ts'], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' });
const { LESSONS, MODULES, DIAGRAM_SPECS } = await import(pathToFileURL(out).href);
rmSync(dir, { recursive: true, force: true });

const words = html => html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const ids = new Set();
let problems = 0;
const rows = [];
for (const l of LESSONS) {
  const w = words(l.body);
  const d = (l.body.match(/<figure class="dg">/g) || []).length;
  const issues = [];
  if (ids.has(l.id)) issues.push('trùng id');
  ids.add(l.id);
  if (!MODULES.some(m => m.id === l.mod)) issues.push('mod sai');
  if (w < 600) issues.push('ngắn');
  if (d < 2) issues.push('<2 sơ đồ');
  if (l.quiz.length < 3) issues.push('<3 quiz');
  if (!/Câu hỏi phỏng vấn/.test(l.body)) issues.push('thiếu phỏng vấn');
  l.quiz.forEach((q, i) => { if (q.a < 0 || q.a >= q.o.length) issues.push(`quiz ${i + 1} đáp án sai chỉ số`); });
  if (issues.length) problems++;
  rows.push([l.mod, l.id, w, d, l.quiz.length, issues.join(', ')]);
}
console.table(rows.map(([mod, id, w, d, q, iss]) => ({ mod, id, words: w, diagrams: d, quiz: q, issues: iss })));
const total = rows.reduce((a, r) => ({ w: a.w + r[2], d: a.d + r[3], q: a.q + r[4] }), { w: 0, d: 0, q: 0 });
console.log(`${LESSONS.length} bài · ${total.w} từ · ${total.d} sơ đồ · ${total.q} câu quiz · ${problems} bài có vấn đề`);

// Kiểm tra bố cục sơ đồ: node chồng nhau hoặc tràn khỏi viewBox
const size = n => ({ w: n.w ?? 120, h: n.h ?? (n.kind === 'store' ? 60 : 48) });
let layoutIssues = 0;
for (const sp of DIAGRAM_SPECS) {
  const where = (sp.caption || '').slice(0, 70);
  for (const n of sp.nodes) {
    const { w, h } = size(n);
    if (n.x - w / 2 < 2 || n.y - h / 2 < 2 || n.x + w / 2 > sp.w - 2 || n.y + h / 2 > sp.h - 2) {
      console.log(`TRÀN  [${n.id}] trong "${where}"`); layoutIssues++;
    }
    const lines = n.label.split(String.fromCharCode(10));
    const maxLine = Math.max(...lines.map(x => x.length));
    if (maxLine * 7.4 > w - 8) { console.log(`CHỮ DÀI [${n.id}: ${lines.join(' / ')}] trong "${where}"`); layoutIssues++; }
  }
  for (let i = 0; i < sp.nodes.length; i++) for (let j = i + 1; j < sp.nodes.length; j++) {
    const a = sp.nodes[i], b = sp.nodes[j], A = size(a), B = size(b);
    if (Math.abs(a.x - b.x) < (A.w + B.w) / 2 + 6 && Math.abs(a.y - b.y) < (A.h + B.h) / 2 + 6) {
      console.log(`CHỒNG [${a.id}] & [${b.id}] trong "${where}"`); layoutIssues++;
    }
  }
  for (const e of sp.edges || []) {
    if (!sp.nodes.some(n => n.id === e.from) || !sp.nodes.some(n => n.id === e.to)) { console.log(`EDGE HỎNG ${e.from}→${e.to} trong "${where}"`); layoutIssues++; }
  }
}
console.log(`${DIAGRAM_SPECS.length} sơ đồ kiến trúc kiểm tra · ${layoutIssues} vấn đề bố cục`);
