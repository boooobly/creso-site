'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type PortfolioImage = {
  src: string;
  alt: string;
};

type OutdoorPortfolioGalleryProps = {
  images: PortfolioImage[];
};

export default function OutdoorPortfolioGallery({ images }: OutdoorPortfolioGalleryProps) {
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <button
            key={image.src}
            type="button"
            className="group card overflow-hidden rounded-xl bg-white text-left shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
            onClick={() => setActiveImage(image)}
            aria-label={`Открыть ${image.alt}`}
          >
            <div className="overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                width={900}
                height={600}
                className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </button>
        ))}
      </div>

      {activeImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
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
