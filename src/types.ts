export type WidgetId = 'latency' | 'nines' | 'lb' | 'cache' | 'retry';

export interface Module {
  id: string;
  no: string;
  name: string;
  desc: string;
}

export interface Question {
  q: string;
  /** Các lựa chọn */
  o: string[];
  /** Chỉ số đáp án đúng */
  a: number;
  why: string;
}

export interface Lesson {
  id: string;
  mod: string;
  title: string;
  /** Trang tham chiếu trong sách */
  pages: number[];
  /** Thời gian đọc ước tính (phút) */
  min: number;
  widget?: WidgetId;
  lede: string;
  /** Nội dung HTML do tác giả soạn (không phải input người dùng) */
  body: string;
  keys: string[];
  quiz: Question[];
}
