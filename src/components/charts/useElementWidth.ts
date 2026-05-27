import { useEffect, useRef, useState } from 'react';

// Mide el ancho del elemento referenciado para gráficas responsive.
// Devuelve `fallbackWidth` mientras no se haya medido o si ResizeObserver no existe.
export function useElementWidth<T extends HTMLElement = HTMLDivElement>(
  fallbackWidth = 320,
): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallbackWidth);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width;
      if (typeof measured === 'number' && measured > 0) setWidth(measured);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
