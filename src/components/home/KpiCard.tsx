export default function KpiCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="t-value">{value}</p>
      <p className="t-small mt-1 text-neutral-600">{label}</p>
    </div>
  );
}
