'use client';

import { useEffect, useState } from 'react';

const HERO_ID = 'tshirts-hero';
const ORDER_ID = 'tshirts-order';

export default function FloatingTshirtsCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(HERO_ID);
    const order = document.getElementById(ORDER_ID);

    if (!hero || !order) {
      setIsVisible(false);
      return;
    }

    let heroInView = true;
    let orderInView = false;

    const updateVisibility = () => {
      setIsVisible(!heroInView && !orderInView);
    };

    const onScrollFallback = () => {
      const heroRect = hero.getBoundingClientRect();
      const orderRect = order.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      heroInView = heroRect.bottom > 0 && heroRect.top < viewportHeight;
      orderInView = orderRect.top <= viewportHeight * 0.9 && orderRect.bottom >= 100;
      updateVisibility();
    };

    const supportsIntersectionObserver = typeof IntersectionObserver !== 'undefined';

    if (!supportsIntersectionObserver) {
      onScrollFallback();
      window.addEventListener('scroll', onScrollFallback, { passive: true });
      window.addEventListener('resize', onScrollFallback);

      return () => {
        window.removeEventListener('scroll', onScrollFallback);
        window.removeEventListener('resize', onScrollFallback);
      };
    }

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroInView = entry.isIntersecting;
        updateVisibility();
      },
      { threshold: 0.05 },
    );

    const orderObserver = new IntersectionObserver(
      ([entry]) => {
        orderInView = entry.isIntersecting;
        updateVisibility();
      },
      { threshold: 0.2 },
    );

    heroObserver.observe(hero);
    orderObserver.observe(order);
    onScrollFallback();

    return () => {
      heroObserver.disconnect();
      orderObserver.disconnect();
    };
  }, []);

  const handleClick = () => {
    document.getElementById(ORDER_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-40 inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(220,38,38,0.3)] transition-all hover:scale-[1.02] hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 md:bottom-6 md:right-6 md:px-5 md:py-3"
    >
      Оставить заявку
    </button>
  );
}
