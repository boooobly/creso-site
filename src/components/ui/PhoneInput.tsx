'use client';

import { ChangeEvent } from 'react';

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onBlur?: () => void;
};

export function getPhoneDigits(value: string): string {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return '';

  let normalized = digitsOnly;
  if (normalized.startsWith('8')) normalized = `7${normalized.slice(1)}`;
  if (!normalized.startsWith('7')) normalized = `7${normalized}`;

  return normalized.slice(0, 11);
}

function formatRuPhone(digits: string): string {
  if (!digits) return '';

  const local = digits.slice(1);
  if (!local) return '+7 ';

  const p1 = local.slice(0, 3);
  const p2 = local.slice(3, 6);
  const p3 = local.slice(6, 8);
  const p4 = local.slice(8, 10);

  let result = '+7 ';
  if (p1) result += `(${p1}`;
  if (p1.length === 3) result += ')';
  if (p2) result += ` ${p2}`;
  if (p3) result += `-${p3}`;
  if (p4) result += `-${p4}`;

  return result;
}

export default function PhoneInput({
  value,
  onChange,
  name,
  id,
  required,
  placeholder = '+7 (___) ___-__-__',
  className,
  disabled,
  onBlur,
}: PhoneInputProps) {
  const digits = getPhoneDigits(value);
  const formattedValue = formatRuPhone(digits);
  const isValid = digits.length === 11 && digits.startsWith('7');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDigits = getPhoneDigits(event.target.value);
    onChange(nextDigits ? formatRuPhone(nextDigits) : '');
  };

  const baseClassName = [
    'h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 shadow-sm transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-red-500 dark:focus:ring-red-500/30',
    isValid ? 'ring-2 ring-green-500/20 border-green-500/40' : '',
    className || '',
  ].join(' ');

  return (
    <div className="space-y-1">
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={formattedValue}
        onChange={handleChange}
        onBlur={onBlur}
        name={name}
        id={id}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={baseClassName}
      />
      {isValid && <p className="text-xs text-emerald-600">Номер введён</p>}
    </div>
  );
}
