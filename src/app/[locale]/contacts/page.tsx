import MapLeaflet from '@/components/MapLeaflet';
import { BRAND } from '@/lib/constants';

export default function ContactsPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 items-start">
      <div>
        <h1 className="text-2xl font-bold">Контакты</h1>
        <p className="mt-2 text-neutral-700">Адрес: {BRAND.address}</p>
        <p className="text-neutral-700">Тел: {BRAND.phone}</p>
        <p className="text-neutral-700">E-mail: {BRAND.email}</p>
        <a className="btn-secondary no-underline mt-4 inline-block" href={BRAND.yandexRoute} target="_blank">Маршрут в Яндекс.Картах</a>
      </div>
      <MapLeaflet />
    </div>
  );
}