'use client';

import PublicDialog from '@/components/ui/PublicDialog';

import { useState } from 'react';
import ProtectedImage from '@/components/ui/ProtectedImage';

type PortfolioImage = {
  src: string;
  alt: string;
  title: string;
  category?: string;
  location?: string;
  fallbackSrc?: string;
};

type PortfolioProject = {
  id: string;
  label: string;
  images: readonly PortfolioImage[];
};

type OutdoorPortfolioGalleryProps = {
  projects: readonly PortfolioProject[];
};

function PortfolioCard({ image, onOpen }: { image: PortfolioImage; onOpen: (image: PortfolioImage) => void }) {
  const [currentSrc, setCurrentSrc] = useState(image.src);

  return (
    <button
      type="button"
      className="card-visual card-interactive group relative block h-full min-h-[250px] overflow-hidden text-left select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
      onClick={() => onOpen({ ...image, src: currentSrc })}
      aria-label={`Открыть ${image.alt}`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
        <ProtectedImage
          src={currentSrc}
          alt={image.alt}
          fill
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 1024px) 100vw, 33vw"
          onError={() => {
            if (image.fallbackSrc && currentSrc !== image.fallbackSrc) {
              setCurrentSrc(image.fallbackSrc);
            }
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="pointer-events-none absolute inset-x-3 bottom-3 md:inset-x-4 md:bottom-4">
        <p className="t-h4 !text-base !text-white leading-snug">{image.title}</p>
        {image.category ? <p className="t-small mt-1 text-white/80">{image.category}</p> : null}
      </div>
    </button>
  );
}

export default function OutdoorPortfolioGallery({ projects }: OutdoorPortfolioGalleryProps) {
  const [activeImage, setActiveImage] = useState<PortfolioImage | null>(null);

  return (
    <>
      <div className="space-y-7">
        {projects.map((project) => (
          <div key={project.id}>
            <div className="grid-cards md:grid-cols-3">
              {project.images.map((image) => (
                <PortfolioCard key={image.src} image={image} onOpen={setActiveImage} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeImage ? (
        <PublicDialog label="Просмотр работы" onClose={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setActiveImage(null)}
              className="absolute right-2 top-2 z-10 min-h-11 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white">
              Закрыть просмотр
            </button>
            <ProtectedImage
              src={activeImage.src}
              alt={activeImage.alt}
              width={1600}
              height={1000}
              className="h-auto max-h-[85vh] w-full rounded-xl object-contain"
              priority
            />
          </div>
        </PublicDialog>
      ) : null}
    </>
  );
}
