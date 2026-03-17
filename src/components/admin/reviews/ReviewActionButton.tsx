'use client';

import type { MouseEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { AdminButton } from '@/components/admin/ui';

type ReviewActionButtonProps = {
  label: string;
  pendingLabel: string;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  confirmText?: string;
};

export default function ReviewActionButton({ label, pendingLabel, variant = 'secondary', className, confirmText }: ReviewActionButtonProps) {
  const { pending } = useFormStatus();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!confirmText) return;

    if (!window.confirm(confirmText)) {
      event.preventDefault();
    }
  };

  return (
    <AdminButton type="submit" variant={variant} disabled={pending} className={className} onClick={handleClick}>
      {pending ? pendingLabel : label}
    </AdminButton>
  );
}
