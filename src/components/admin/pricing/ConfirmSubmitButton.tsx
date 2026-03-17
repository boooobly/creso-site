'use client';

import { useFormStatus } from 'react-dom';
import { AdminButton } from '@/components/admin/ui';

type ConfirmSubmitButtonProps = {
  action: () => Promise<void>;
  confirmText: string;
  idleLabel: string;
  pendingLabel: string;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
};

function InnerButton({ idleLabel, pendingLabel, variant, className }: Omit<ConfirmSubmitButtonProps, 'action' | 'confirmText'>) {
  const { pending } = useFormStatus();

  return (
    <AdminButton type="submit" variant={variant} disabled={pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </AdminButton>
  );
}

export default function ConfirmSubmitButton({
  action,
  confirmText,
  idleLabel,
  pendingLabel,
  variant = 'secondary',
  className,
}: ConfirmSubmitButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) {
          event.preventDefault();
        }
      }}
    >
      <InnerButton idleLabel={idleLabel} pendingLabel={pendingLabel} variant={variant} className={className} />
    </form>
  );
}
