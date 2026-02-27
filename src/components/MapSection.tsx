const OFFICE_LAT = 44.623084;
const OFFICE_LON = 41.959552;

const yandexMapEmbedUrl = `https://yandex.ru/map-widget/v1/?ll=${OFFICE_LON}%2C${OFFICE_LAT}&z=17&pt=${OFFICE_LON},${OFFICE_LAT},pm2rdm`;

export default function MapSection() {
  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-sm">
      <iframe
        title="Карта: ул. Калинина 106, Невинномысск"
        src={yandexMapEmbedUrl}
        loading="lazy"
        className="h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
