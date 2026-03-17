import type { MouseEventHandler, ReactNode } from 'react';

type AdminAlertTone = 'success' | 'error' | 'info' | 'warning';

type AdminAlertProps = {
  tone?: AdminAlertTone;
  children: ReactNode;
  className?: string;
  role?: 'status' | 'alert';
};

const alertToneStyles: Record<AdminAlertTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-slate-200 bg-slate-50 text-slate-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800'
};

export function AdminAlert({ tone = 'info', children, className = '', role }: AdminAlertProps) {
  return (
    <p role={role} className={`rounded-lg border px-3 py-2 text-sm ${alertToneStyles[tone]} ${className}`.trim()}>
      {children}
    </p>
  );
}

type AdminButtonVariant = 'primary' | 'secondary' | 'danger';

type AdminButtonProps = {
  variant?: AdminButtonVariant;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const buttonVariantStyles: Record<AdminButtonVariant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
};

export function AdminButton({
  variant = 'secondary',
  children,
  type = 'button',
  disabled,
  className = '',
  onClick
}: AdminButtonProps) {
  const base = 'rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <button type={type} disabled={disabled} className={`${base} ${buttonVariantStyles[variant]} ${className}`.trim()} onClick={onClick}>
      {children}
    </button>
  );
}

type AdminEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function AdminEmptyState({ title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
