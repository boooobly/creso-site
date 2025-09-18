'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { postJSON } from '@/lib/fetcher';

const schema = z.object({
  name: z.string().min(2, 'Введите имя'),
  email: z.string().email('Неверный e-mail'),
  phone: z.string().min(6, 'Введите телефон'),
  service: z.string().min(2, 'Выберите услугу'),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LeadForm({ t }: { t: any }) {
  const { register, handleSubmit, formState: { errors, isSubmitSuccessful }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const res = await postJSON<{ ok: true }>(`/api/lead`, data);
    if (res.ok) reset();
  };

  if (isSubmitSuccessful) return <p className="text-green-700">{t.lead.success}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <input className="w-full rounded-xl border p-3" placeholder="Имя" {...register('name')} />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <input className="w-full rounded-xl border p-3" placeholder="E-mail" {...register('email')} />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <input className="w-full rounded-xl border p-3" placeholder="Телефон" {...register('phone')} />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <select className="w-full rounded-xl border p-3" defaultValue="" {...register('service')}>
          <option value="" disabled>Выберите услугу</option>
          <option>Багет</option>
          <option>Фрезеровка</option>
          <option>Широкоформатная печать</option>
          <option>Наружная реклама</option>
          <option>Плоттерная резка</option>
          <option>Термоперенос</option>
          <option>Визитки и флаеры</option>
        </select>
        {errors.service && <p className="text-sm text-red-600">{errors.service.message}</p>}
      </div>
      <textarea className="w-full rounded-xl border p-3" rows={4} placeholder="Краткое ТЗ" {...register('message')} />
      <button type="submit" className="btn-primary">{t.lead.submit}</button>
    </form>
  );
}