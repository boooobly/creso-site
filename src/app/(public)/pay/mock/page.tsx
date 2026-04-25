export default function MockPaymentPage() {
  return (
    <main className="container py-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Онлайн-оплата отключена</h1>
        <p className="mt-3 text-sm text-neutral-700">
          Онлайн-оплата на сайте отключена. Оплата и предоплата согласуются с менеджером после проверки заказа.
        </p>
      </div>
    </main>
  );
}
