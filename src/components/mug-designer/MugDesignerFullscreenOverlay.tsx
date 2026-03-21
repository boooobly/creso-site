'use client';

import { PropsWithChildren, useEffect } from 'react';
import { X } from 'lucide-react';

type Props = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}>;

export default function MugDesignerFullscreenOverlay({ isOpen, onClose, onApply, children }: Props) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarCompensation > 0) {
      document.body.style.paddingRight = `${scrollbarCompensation}px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[120] flex items-stretch justify-center px-3 py-3 transition duration-200 sm:px-4 sm:py-4 lg:px-6 lg:py-6 ${
        isOpen
          ? 'bg-neutral-950/70 opacity-100 backdrop-blur-sm'
          : 'pointer-events-none invisible bg-neutral-950/0 opacity-0'
      }`}
    >
      <div className="flex h-full w-full max-w-[1680px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#f4f1ee] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-white/90 px-5 py-4 backdrop-blur sm:px-6 lg:px-7">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Полноэкранный редактор</p>
            <h3 className="text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">Конструктор кружки</h3>
            <p className="text-sm text-neutral-600">Отредактируйте макет, затем примените его к заявке без перехода на другую страницу.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-100"
            aria-label="Закрыть конструктор кружки"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4">
          {children}
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-200 bg-white/90 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-7">
          <p className="text-sm text-neutral-600">Страница заявки остаётся на месте на фоне, а текущий макет можно применить в один клик.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              Закрыть
            </button>
            <button
              type="button"
              onClick={onApply}
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Применить макет
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
