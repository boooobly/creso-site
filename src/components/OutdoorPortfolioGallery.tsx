'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!activeImage) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveImage(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeImage]);

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <ProtectedImage
              src={activeImage.src}
              alt={activeImage.alt}
              width={1600}
              height={1000}
              className="h-auto max-h-[85vh] w-full rounded-xl object-contain"
              priority
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
