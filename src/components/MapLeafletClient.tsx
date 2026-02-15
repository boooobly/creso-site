'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const MapLeafletInner = dynamic(() => import('./MapLeafletInner'), { ssr: false });

export default function MapLeafletClient() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px 0px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-80 w-full overflow-hidden rounded-2xl ring-1 ring-black/5">
      {isVisible ? <MapLeafletInner /> : <div className="h-full w-full bg-neutral-100/60 dark:bg-neutral-900/60" aria-hidden="true" />}
    </div>
  );
}
