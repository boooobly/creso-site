export default function KpiCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="mt-1 text-sm text-neutral-600">{label}</p>
    </div>
  );
}
