import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeletePortfolioButton from '@/components/admin/portfolio/DeletePortfolioButton';
import PortfolioForm from '@/components/admin/portfolio/PortfolioForm';
import { getPortfolioItemById } from '@/lib/admin/portfolio-service';
import { removePortfolioItemAction, updatePortfolioItemAction } from '../actions';

type AdminPortfolioEditPageProps = {
  params: { id: string };
};

export default async function AdminPortfolioEditPage({ params }: AdminPortfolioEditPageProps) {
  const item = await getPortfolioItemById(params.id);

  if (!item) {
    notFound();
  }

  const updateAction = updatePortfolioItemAction.bind(null, item.id);
  const deleteAction = removePortfolioItemAction.bind(null, item.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/portfolio" className="inline-flex text-sm text-slate-600 transition hover:text-slate-900">
          ← Назад к списку работ
        </Link>
        <DeletePortfolioButton action={deleteAction} />
      </div>

      <PortfolioForm
        heading="Редактирование работы"
        description="Изменения сохраняются сразу после нажатия кнопки."
        submitLabel="Сохранить изменения"
        action={updateAction}
        initialValues={{
          title: item.title,
          slug: item.slug,
          category: item.category,
          shortDescription: item.shortDescription ?? '',
          coverImage: item.coverImage ?? '',
          galleryImages: Array.isArray(item.galleryImages) ? item.galleryImages.join('\n') : '',
          featured: item.featured,
          published: item.published,
          sortOrder: item.sortOrder
        }}
      />
    </div>
  );
}
