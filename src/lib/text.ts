/** Bỏ dấu tiếng Việt, chữ thường — dùng cho tìm kiếm và slug. */
export const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');

export const slug = (s: string) =>
  fold(s.replace(/<[^>]+>/g, ''))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

export interface Heading {
  id: string;
  text: string;
}

/** Gắn id cho các thẻ <h2> trong HTML bài học và trả về danh sách mục. */
export function withHeadingIds(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    let id = 'muc-' + slug(inner);
    while (used.has(id)) id += '-2';
    used.add(id);
    headings.push({ id, text: inner.replace(/<[^>]+>/g, '') });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, headings };
}

/** Đếm số từ (xấp xỉ) của HTML, bỏ qua SVG. */
export function wordCount(html: string): number {
  const text = html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ');
  return text.split(/\s+/).filter(Boolean).length;
}
