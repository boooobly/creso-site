'use client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { postJSON } from '@/lib/fetcher';
import type { SiteMessages } from '@/lib/messages';

const schema = z.object({
  name: z.string().min(2, 'Введите имя'),
  email: z.string().email('Неверный e-mail'),
  phone: z.string().min(6, 'Введите телефон'),
  service: z.string().min(2, 'Выберите услугу'),
  message: z.string().optional(),
  consent: z.boolean().refine((value) => value, {
    message: 'Необходимо согласие с политикой обработки персональных данных',
  }),
});

type FormData = z.infer<typeof schema>;

type LeadFormProps = {
  t: SiteMessages;
  initialService?: string;
  initialMessage?: string;
};

const DEFAULT_VALUES: Omit<FormData, 'consent'> = {
  name: '',
  email: '',
  phone: '',
  service: '',
  message: '',
};

export default function LeadForm({ t, initialService, initialMessage }: LeadFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful, isSubmitting },
    reset,
    getValues,
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { ...DEFAULT_VALUES, consent: false } });

  useEffect(() => {
    if (!initialService && !initialMessage) return;

    const currentValues = getValues();
    reset({
      ...currentValues,
      service: initialService ?? currentValues.service,
      message: initialMessage ?? currentValues.message,
    });
  }, [getValues, initialMessage, initialService, reset]);

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      const res = await postJSON<{ ok: true }>(`/api/lead`, data);
      if (res.ok) reset({ ...DEFAULT_VALUES, consent: false });
    } catch {
      setSubmitError('Не удалось отправить заявку. Попробуйте ещё раз.');
    }
  };

  if (isSubmitSuccessful) return <p className="text-green-700">{t.lead.success}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      <div>
        <input className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500" placeholder="Имя" {...register('name')} />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <input className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500" placeholder="E-mail" {...register('email')} />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <input className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500" placeholder="Телефон" {...register('phone')} />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <select className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100" defaultValue="" {...register('service')}>
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
      <textarea className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500" rows={4} placeholder="Комментарий (необязательно)" {...register('message')} />
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" {...register('consent')} />
        <span>
          Я согласен с <Link href="/privacy" className="underline hover:no-underline">политикой обработки персональных данных</Link>
        </span>
      </label>
      {errors.consent && <p className="text-sm text-red-600">{errors.consent.message}</p>}

      <button disabled={isSubmitting} className="btn-primary" type="submit">{isSubmitting ? 'Отправка...' : t.lead.submit}</button>
    </form>
  );
}
