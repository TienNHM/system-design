import type { WidgetId } from '../types';
import { LatencyWidget } from './LatencyWidget';
import { NinesWidget } from './NinesWidget';
import { LoadBalancerWidget } from './LoadBalancerWidget';
import { CacheWidget } from './CacheWidget';
import { RetryWidget } from './RetryWidget';
import { HashRingWidget } from './HashRingWidget';
import { RateLimitWidget } from './RateLimitWidget';

const MAP: Record<WidgetId, () => JSX.Element> = {
  latency: LatencyWidget,
  nines: NinesWidget,
  lb: LoadBalancerWidget,
  cache: CacheWidget,
  retry: RetryWidget,
  hashring: HashRingWidget,
  ratelimit: RateLimitWidget,
};

export const WIDGET_COUNT = Object.keys(MAP).length;

/** Công cụ tương tác gắn kèm bài học. */
export function Widget({ id }: { id: WidgetId }) {
  const Comp = MAP[id];
  return <Comp />;
}
