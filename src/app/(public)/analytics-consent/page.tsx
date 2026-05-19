import React from 'react';
import Link from 'next/link';

export default function AnalyticsConsentPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Согласие на аналитику</h1>
      <p>
        Для корректной работы сайта мы используем обязательные cookie и localStorage: они нужны для базовой
        функциональности и сохранения настроек интерфейса.
      </p>
      <p>
        Аналитика является дополнительной и включается только по вашему выбору. До согласия аналитические инструменты
        отключены.
      </p>
      <p>
        После вашего согласия может использоваться Яндекс.Метрика: clickmap, trackLinks, accurate bounce tracking,
        Webvisor, учет просмотров страниц (page hits) и цели по кликам на контакты.
      </p>
      <p>Вы можете принять аналитику, отклонить ее или изменить выбор позже через «Настройки cookie».</p>
      <Link href="/privacy" className="text-red-600 no-underline hover:text-red-500 dark:text-red-400">
        Вернуться к политике конфиденциальности
      </Link>
    </section>
  );
}
