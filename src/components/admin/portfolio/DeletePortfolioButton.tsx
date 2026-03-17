'use client';

import { useFormStatus } from 'react-dom';
import { AdminButton } from '@/components/admin/ui';

type DeletePortfolioButtonProps = {
  action: () => Promise<void>;
};

function Button() {
  const { pending } = useFormStatus();

  return (
    <AdminButton type="submit" variant="danger" className="px-4 py-2.5" disabled={pending}>
      {pending ? 'Удаляем...' : 'Удалить работу'}
    </AdminButton>
  );
}

export default function DeletePortfolioButton({ action }: DeletePortfolioButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm('Удалить эту работу? Действие нельзя отменить.')) {
          event.preventDefault();
        }
      }}
    >
      <Button />
    </form>
  );
}
