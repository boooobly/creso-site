'use client';

import type { MouseEvent } from 'react';
import { useFormStatus } from 'react-dom';

type ReviewActionButtonProps = {
  label: string;
  pendingLabel: string;
  className: string;
  confirmText?: string;
};

export default function ReviewActionButton({ label, pendingLabel, className, confirmText }: ReviewActionButtonProps) {
  const { pending } = useFormStatus();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!confirmText) return;

    if (!window.confirm(confirmText)) {
      event.preventDefault();
    }
  };

  return (
    <button type="submit" disabled={pending} className={className} onClick={handleClick}>
      {pending ? pendingLabel : label}
    </button>
  );
}
