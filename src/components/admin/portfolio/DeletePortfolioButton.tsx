'use client';

import { useFormStatus } from 'react-dom';

type DeletePortfolioButtonProps = {
  action: () => Promise<void>;
};

function Button() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Удаляем...' : 'Удалить работу'}
    </button>
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
