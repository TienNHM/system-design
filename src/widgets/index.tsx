import type { WidgetId } from '../types';

/** Công cụ tương tác gắn kèm bài học. Các widget được bổ sung ở commit sau. */
export function Widget({ id }: { id: WidgetId }) {
  return (
    <section className="widget">
      <div className="widget-h">
        <h2>Công cụ tương tác</h2>
        <span>{id}</span>
      </div>
      <p className="out">Đang xây dựng.</p>
    </section>
  );
}
