'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trackEvent } from '@/lib/analytics';
import { postJSON } from '@/lib/fetcher';
import type { SiteMessages } from '@/lib/messages';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';

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
  z.string().refine((value) => getPhoneDigits(value).length === 11, 'Введите корректный телефон').optional(),
);

function createSchema(phoneRequired: boolean) {
  return z
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
      if (phoneRequired && !values.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: 'Укажите телефон',
        });
        return;
      }

      if (!phoneRequired && !values.email && !values.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: 'Укажите телефон или e-mail',
        });
      }
    });
}

type FormData = z.infer<ReturnType<typeof createSchema>>;

type LeadFormProps = {
  t: SiteMessages;
  initialService?: string;
  initialMessage?: string;
  source?: string;
  showMessageField?: boolean;
  phoneRequired?: boolean;
  submitMessagePrefix?: string;
  includePageUrl?: boolean;
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

export default function LeadForm({
  t,
  initialService,
  initialMessage,
  source = 'main',
  showMessageField = false,
  phoneRequired = false,
  submitMessagePrefix,
  includePageUrl = false,
}: LeadFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resolvedService = useMemo(() => (initialService?.trim() ? initialService.trim() : DEFAULT_SERVICE), [initialService]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitSuccessful, isSubmitting },
    reset,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(createSchema(phoneRequired)),
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
      const phoneDigits = getPhoneDigits(data.phone ?? '');
      const pageUrl = includePageUrl && typeof window !== 'undefined' ? window.location.href : undefined;
      const commentLines = [
        submitMessagePrefix?.trim(),
        data.message?.trim(),
        pageUrl ? `Страница: ${pageUrl}` : undefined,
      ].filter(Boolean);

      const res = await postJSON<{ ok: true }>(`/api/leads`, {
        source,
        name: data.name,
        phone: phoneDigits,
        email: data.email,
        comment: commentLines.length > 0 ? commentLines.join('\n') : undefined,
        extras: {
          service: data.service,
          consent: data.consent,
        },
        company: data.website,
      });
      if (res.ok) {
        trackEvent('lead_form_submitted', { service: data.service });
        reset({ ...DEFAULT_VALUES, service: resolvedService, message: initialMessage ?? '', consent: false });
      }
    } catch {
      setSubmitError('Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.');
    }
  };

  if (isSubmitSuccessful) {
    return <p className="text-green-700">Заявка отправлена. Менеджер свяжется с вами в ближайшее время.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {submitError && <p className="t-small text-red-500">{submitError}</p>}

      <input type="hidden" {...register('service')} />
      {!showMessageField && <input type="hidden" {...register('message')} />}
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
          className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          placeholder="Имя"
          {...register('name')}
        />
        {errors.name && <p className="mt-1 t-small text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="w-full">
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                placeholder="+7 (___) ___-__-__"
              />
            )}
          />
          {errors.phone && <p className="mt-1 t-small text-red-500">{errors.phone.message}</p>}
        </div>
        <div className="w-full">
          <input
            className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            placeholder="E-mail"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 t-small text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      {showMessageField ? (
        <div>
          <textarea
            className="min-h-[120px] w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            placeholder="Комментарий"
            {...register('message')}
          />
        </div>
      ) : (
        <p className="t-small text-muted-foreground">Укажите телефон или e-mail — как вам удобнее.</p>
      )}
      <p className="t-small rounded-lg border border-neutral-200 bg-white/80 px-3.5 py-2.5 text-muted-foreground">Ответим в течение 30 минут. Без спама.</p>

      <label className="flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium">
        <input type="checkbox" className="mt-1" {...register('consent')} />
        <span>
          Я согласен с <Link href="/privacy" className="underline hover:no-underline">политикой обработки персональных данных</Link>
        </span>
      </label>
      {errors.consent && <p className="t-small text-red-500">{errors.consent.message}</p>}

      <button
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[var(--brand-red)] px-5 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#b52a2a] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
      >
        {isSubmitting ? 'Отправка...' : t.lead.submit}
      </button>
    </form>
  );
}
