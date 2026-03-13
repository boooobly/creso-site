'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function LightRays() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || shouldReduceMotion) return;

    let targetX = 50;
    let targetY = 6;
    let currentX = 50;
    let currentY = 6;
    let rafId = 0;

    const apply = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      container.style.setProperty('--mx', `${currentX.toFixed(2)}%`);
      container.style.setProperty('--my', `${currentY.toFixed(2)}%`);
      rafId = window.requestAnimationFrame(apply);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const bounds = container.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const xPercent = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100);
      const yPercent = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100);

      targetX = 50 + (xPercent - 50) * 0.12;
      targetY = 6 + (yPercent - 18) * 0.06;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = window.requestAnimationFrame(apply);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.cancelAnimationFrame(rafId);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ '--mx': '50%', '--my': '6%' } as CSSProperties}
    >
      <div className="absolute inset-0 hidden md:block bg-[radial-gradient(82%_50%_at_var(--mx)_var(--my),rgba(212,28,28,0.12)_0%,rgba(212,28,28,0.08)_24%,rgba(212,28,28,0.03)_48%,transparent_72%)] blur-2xl" />
      <div className="absolute inset-0 hidden md:block bg-[repeating-conic-gradient(from_186deg_at_var(--mx)_var(--my),rgba(212,28,28,0.11)_0deg,rgba(212,28,28,0.11)_2.2deg,transparent_8deg,transparent_18deg)] opacity-45 blur-[1px]" />
      <div className="absolute inset-0 hidden md:block bg-gradient-to-b from-white/35 via-white/72 to-white/96" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/88 md:hidden" />
    </div>
  );
}
