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
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900"
      onClick={() => onOpen({ ...image, src: currentSrc })}
      aria-label={`Открыть ${image.alt}`}
    >
      <div className="relative h-56 w-full overflow-hidden bg-neutral-100">
        <Image
          src={currentSrc}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 33vw"
          onError={() => {
            if (image.fallbackSrc && currentSrc !== image.fallbackSrc) {
              setCurrentSrc(image.fallbackSrc);
            }
          }}
        />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
        <p className="text-sm font-semibold leading-relaxed text-neutral-900 dark:text-neutral-100">{image.title}</p>
        {image.category ? <p className="text-xs text-neutral-600 dark:text-neutral-300">{image.category}</p> : null}
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
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{project.label}</p>
            <div className="grid gap-4 md:grid-cols-3">
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
