'use client';

import Image, { type ImageProps } from 'next/image';
import { type DragEvent, type MouseEvent } from 'react';

type ProtectedImageProps = ImageProps & {
  disableSelection?: boolean;
};

const preventDefault = (event: MouseEvent<HTMLElement> | DragEvent<HTMLElement>) => {
  event.preventDefault();
};

export default function ProtectedImage({ disableSelection = true, className, onContextMenu, onDragStart, draggable, ...props }: ProtectedImageProps) {
  const { alt = '' } = props;

  return (
    <Image
      {...props}
      alt={alt}
      draggable={draggable ?? false}
      onContextMenu={(event) => {
        preventDefault(event);
        onContextMenu?.(event);
      }}
      onDragStart={(event) => {
        preventDefault(event);
        onDragStart?.(event);
      }}
      className={[disableSelection ? 'select-none' : '', className].filter(Boolean).join(' ')}
    />
  );
}
