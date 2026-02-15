'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trackEvent } from '@/lib/analytics';
import { postJSON } from '@/lib/fetcher';
import type { SiteMessages } from '@/lib/messages';

const optionalEmailSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  },
  z.string().email('Неверный e-mail').optional(),
);

const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  },
  z.string().min(6, 'Введите корректный телефон').optional(),
);

const schema = z
  .object({
    name: z.string().trim().min(2, 'Введите имя'),
    email: optionalEmailSchema,
    phone: optionalPhoneSchema,
    service: z.string().min(2),
    message: z.string().optional(),
    consent: z.boolean().refine((value) => value, {
      message: 'Необходимо согласие с политикой обработки персональных данных',
    }),
    website: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.email && !values.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Укажите телефон или e-mail',
      });
    }
  });

type FormData = z.infer<typeof schema>;

type LeadFormProps = {
  t: SiteMessages;
  initialService?: string;
  initialMessage?: string;
};

const DEFAULT_SERVICE = 'Общая заявка';

const DEFAULT_VALUES: Omit<FormData, 'consent'> = {
  name: '',
  email: undefined,
  phone: undefined,
  service: DEFAULT_SERVICE,
  message: '',
  website: '',
};

export default function LeadForm({ t, initialService, initialMessage }: LeadFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resolvedService = useMemo(() => (initialService?.trim() ? initialService.trim() : DEFAULT_SERVICE), [initialService]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful, isSubmitting },
    reset,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...DEFAULT_VALUES, consent: false },
    mode: 'onChange',
  });

  useEffect(() => {
    const currentValues = getValues();
    reset({
      ...currentValues,
      service: resolvedService,
      message: initialMessage ?? currentValues.message,
    });
  }, [getValues, initialMessage, reset, resolvedService]);

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);

    try {
      const payload = {
        ...data,
        email: data.email ?? 'no-email@lead.local',
        phone: data.phone ?? 'не указан',
      };

      const res = await postJSON<{ ok: true }>(`/api/lead`, payload);
      if (res.ok) {
        trackEvent('lead_form_submitted', { service: data.service });
        reset({ ...DEFAULT_VALUES, service: resolvedService, message: initialMessage ?? '', consent: false });
      }
    } catch {
      setSubmitError('Не удалось отправить заявку. Попробуйте ещё раз.');
    }
  };

  if (isSubmitSuccessful) return <p className="text-green-700">{t.lead.success}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <input type="hidden" {...register('service')} />
      <input type="hidden" {...register('message')} />
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register('website')}
      />

      <div>
        <input
          className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          placeholder="Имя"
          {...register('name')}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <input
            className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            placeholder="Телефон"
            {...register('phone')}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            placeholder="E-mail"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
      </div>

      <p className="text-xs text-neutral-600 dark:text-neutral-300">Укажите телефон или e-mail — как вам удобнее.</p>
      <p className="text-xs text-neutral-600 dark:text-neutral-300">Ответим в течение 30 минут. Без спама.</p>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" {...register('consent')} />
        <span>
          Я согласен с <Link href="/privacy" className="underline hover:no-underline">политикой обработки персональных данных</Link>
        </span>
      </label>
      {errors.consent && <p className="text-sm text-red-600">{errors.consent.message}</p>}

      <button
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[var(--brand-red)] px-5 py-3 font-semibold text-white shadow-md transition hover:bg-[#b52a2a] disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
      >
        {isSubmitting ? 'Отправка...' : t.lead.submit}
      </button>
    </form>
  );
}
