import type { Metadata } from 'next';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Вход в админ-панель'
};

type AdminLoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Вход для администратора</h1>
        <p className="mt-2 text-sm text-slate-600">
          Используйте пароль администратора, чтобы открыть рабочую панель сайта.
        </p>

        <div className="mt-6">
          <AdminLoginForm nextPath={resolvedSearchParams?.next} />
        </div>
      </section>
    </div>
  );
}
