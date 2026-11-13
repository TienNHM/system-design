import { useEffect, useState } from 'react';

/** Đọc route từ location.hash (vd: #home, #latency). Trả về chuỗi không có dấu #. */
export function useHashRoute(fallback = 'home'): string {
  const read = () => decodeURIComponent(window.location.hash.slice(1)) || fallback;
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return route;
}
