'use client';

import { useFormStatus } from 'react-dom';
import { AdminButton } from '@/components/admin/ui';

export default function SubmitOrderUpdateButton() {
  const { pending } = useFormStatus();

  return (
    <AdminButton type="submit" variant="primary" disabled={pending} className="px-4">
      {pending ? 'Сохраняем…' : 'Сохранить изменения'}
    </AdminButton>
  );
}
