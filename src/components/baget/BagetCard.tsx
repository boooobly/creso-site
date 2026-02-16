'use client';

import Image from 'next/image';

export type BagetItem = {
  id: string;
  article: string;
  name: string;
  color: string;
  style: string;
  width_mm: number;
  price_per_meter: number;
  image: string;
};

type BagetCardProps = {
  item: BagetItem;
  selected: boolean;
  onSelect: (item: BagetItem) => void;
};

export default function BagetCard({ item, selected, onSelect }: BagetCardProps) {
  return (
    <article className={`card rounded-2xl p-4 shadow-md transition ${selected ? 'border-[var(--brand-red)] ring-1 ring-[var(--brand-red)]/30' : ''}`}>
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
        <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, 320px" className="object-cover" loading="lazy" />
      </div>
      <h3 className="text-base font-semibold">{item.name}</h3>
      <p className="mt-1 text-sm text-neutral-600">Ширина профиля: {item.width_mm} мм</p>
      <p className="text-sm text-neutral-700">{item.price_per_meter.toLocaleString('ru-RU')} ₽ / м</p>
      <button type="button" onClick={() => onSelect(item)} className="btn-secondary mt-3 w-full no-underline">
        Выбрать багет
      </button>
    </article>
  );
}
