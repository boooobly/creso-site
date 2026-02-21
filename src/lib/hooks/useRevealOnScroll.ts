'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject } from 'react';

type RevealOptions = {
  threshold?: number;
  rootMargin?: string;
};

type RevealResult<T extends HTMLElement> = {
  ref: MutableRefObject<T | null>;
  isVisible: boolean;
  prefersReducedMotion: boolean;
  revealProps: { 'data-reveal': 'in' | 'out' };
  getStaggerStyle: (delayMs: number) => CSSProperties;
};

export function useRevealOnScroll<T extends HTMLElement>({
  threshold = 0.2,
  rootMargin = '0px 0px -10% 0px',
}: RevealOptions = {}): RevealResult<T> {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
      if (event.matches) {
        setIsVisible(true);
      }
    };

    setPrefersReducedMotion(mediaQuery.matches);

    if (mediaQuery.matches) {
      setIsVisible(true);
      mediaQuery.addEventListener('change', onChange);
      return () => {
        mediaQuery.removeEventListener('change', onChange);
      };
    }

    const element = ref.current;
    if (!element) {
      mediaQuery.addEventListener('change', onChange);
      return () => {
        mediaQuery.removeEventListener('change', onChange);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    mediaQuery.addEventListener('change', onChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', onChange);
    };
  }, [threshold, rootMargin]);

  const revealProps = useMemo<{ 'data-reveal': 'in' | 'out' }>(
    () => ({ 'data-reveal': isVisible || prefersReducedMotion ? 'in' : 'out' }),
    [isVisible, prefersReducedMotion],
  );

  const getStaggerStyle = (delayMs: number): CSSProperties => {
    if (prefersReducedMotion) return {};
    return { transitionDelay: `${delayMs}ms` };
  };

  return { ref, isVisible, prefersReducedMotion, revealProps, getStaggerStyle };
}
