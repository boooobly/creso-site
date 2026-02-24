export default function BadgeChip({ label }: { label: string }) {
  return (
    <li className="rounded-full border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/5 px-4 py-2 text-sm font-medium text-neutral-700">
      {label}
    </li>
  );
}
