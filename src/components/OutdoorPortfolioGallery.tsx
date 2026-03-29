'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

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
      className="card-visual card-interactive group flex h-full flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
      onClick={() => onOpen({ ...image, src: currentSrc })}
      aria-label={`Открыть ${image.alt}`}
    >
      <div className="relative h-56 w-full overflow-hidden bg-neutral-100">
        <Image
          src={currentSrc}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 1024px) 100vw, 33vw"
          onError={() => {
            if (image.fallbackSrc && currentSrc !== image.fallbackSrc) {
              setCurrentSrc(image.fallbackSrc);
            }
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-4 md:p-5">
        <p className="t-h4 !text-base leading-snug">{image.title}</p>
        {image.category ? <p className="t-small text-muted-foreground">{image.category}</p> : null}
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
          <div key={project.id} className="space-y-3">
            <p className="t-caption text-neutral-600 dark:text-neutral-300">{project.label}</p>
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
            <Image
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
