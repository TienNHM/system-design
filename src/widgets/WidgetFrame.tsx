import type { ReactNode } from 'react';

export function WidgetFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="widget">
      <div className="widget-h">
        <h2>{title}</h2>
        <span>Thử nghiệm</span>
      </div>
      {children}
    </section>
  );
}

interface SegProps<T extends string> {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}

export function Seg<T extends string>({ value, options, onChange, label }: SegProps<T>) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          className={o.id === value ? 'on' : ''}
          aria-pressed={o.id === value}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
