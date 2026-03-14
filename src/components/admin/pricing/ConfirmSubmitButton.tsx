'use client';

import { useFormStatus } from 'react-dom';

type ConfirmSubmitButtonProps = {
  action: () => Promise<void>;
  confirmText: string;
  idleLabel: string;
  pendingLabel: string;
  className?: string;
};

function InnerButton({ idleLabel, pendingLabel, className }: Omit<ConfirmSubmitButtonProps, 'action' | 'confirmText'>) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export default function ConfirmSubmitButton({
  action,
  confirmText,
  idleLabel,
  pendingLabel,
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
      <InnerButton idleLabel={idleLabel} pendingLabel={pendingLabel} className={className} />
    </form>
  );
}
