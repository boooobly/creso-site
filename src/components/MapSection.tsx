'use client';

import { useState } from 'react';
import { BRAND } from '@/lib/constants';

const OFFICE_LAT = 44.623084;
const OFFICE_LON = 41.959552;

const yandexMapEmbedUrl = `https://yandex.ru/map-widget/v1/?ll=${OFFICE_LON}%2C${OFFICE_LAT}&z=17&pt=${OFFICE_LON},${OFFICE_LAT},pm2rdm`;

export default function MapSection() {
  const [active, setActive] = useState(false);
  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-black/5 shadow-sm dark:bg-neutral-900">
      {active ? <iframe
        title="Карта: ул. Калинина 106, Невинномысск"
        src={yandexMapEmbedUrl}
        loading="lazy"
        className="h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      /> : <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-semibold">{BRAND.address}</p>
        <button type="button" className="btn-secondary" onClick={() => setActive(true)}>Показать интерактивную карту</button>
        <a href={BRAND.yandexRoute} target="_blank" rel="noreferrer" className="underline">Построить маршрут в Яндекс Картах</a>
      </div>}
    </div>
  );
}
