export default function KpiCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="card-info h-full">
      <p className="t-value">{value}</p>
      <p className="t-small mt-1 text-neutral-600">{label}</p>
    </div>
  );
}
