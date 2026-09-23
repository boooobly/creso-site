'use client';

import Link from 'next/link';

export default function PublicError({ reset }: { reset: () => void }) {
  return <section className="mx-auto max-w-xl space-y-4 py-16 text-center">
    <h1 className="text-2xl font-bold">Не удалось загрузить страницу</h1>
    <p>Попробуйте ещё раз или свяжитесь с нами — поможем с вашим заказом.</p>
    <div className="flex flex-wrap justify-center gap-3">
      <button type="button" onClick={reset} className="btn-primary">Повторить загрузку</button>
      <Link href="/contacts" className="btn-secondary">Контакты</Link>
    </div>
  </section>;
}
