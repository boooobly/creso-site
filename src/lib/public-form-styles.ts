export const publicFormStyles = {
  shell: 'card rounded-3xl border-neutral-200/90 bg-white/95 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.52)] dark:border-neutral-800 dark:bg-neutral-900 md:p-8',
  heading: 'space-y-2 border-b border-neutral-200/80 pb-5 dark:border-neutral-800',
  fieldsStack: 'space-y-5',
  fieldLabel: 't-label text-sm font-medium',
  helper: 't-helper text-xs',
  inputBase:
    'h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 shadow-sm transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-400 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/25 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500',
  inputInvalid: 'border-red-500 ring-2 ring-red-500/20',
  textArea: 'min-h-[120px] py-3',
  uploadZone: 'rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 p-3 transition hover:border-red-400 dark:border-neutral-700 dark:bg-neutral-900/60 md:p-4',
  consent: 'flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50/80 px-3.5 py-2.5 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-200',
  summaryCard: 'rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900/60',
  actionRow: 'flex flex-col gap-3 border-t border-neutral-200/80 pt-4 dark:border-neutral-800 md:flex-row md:items-center',
  submitButton: 'inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 md:min-w-[190px]',
};

export function publicInputClass(isInvalid = false) {
  return [publicFormStyles.inputBase, isInvalid ? publicFormStyles.inputInvalid : ''].join(' ').trim();
}
