import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeletePortfolioButton from '@/components/admin/portfolio/DeletePortfolioButton';
import PortfolioForm from '@/components/admin/portfolio/PortfolioForm';
import { getPortfolioItemById } from '@/lib/admin/portfolio-service';
import { removePortfolioItemAction, updatePortfolioItemAction } from '../actions';

type AdminPortfolioEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPortfolioEditPage({ params }: AdminPortfolioEditPageProps) {
  const resolvedParams = await params;
  const item = await getPortfolioItemById(resolvedParams.id);

  if (!item) {
    notFound();
  }

  const updateAction = updatePortfolioItemAction.bind(null, item.id);
  const deleteAction = removePortfolioItemAction.bind(null, item.id);

  return (
    <div className="space-y-6">
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
          coverImageAssetId: item.coverImageAssetId ?? '',
          galleryImages: Array.isArray(item.galleryImages)
            ? item.galleryImages
                .map((entry) => {
                  if (typeof entry === 'string') {
                    return { url: entry };
                  }

                  if (!entry || typeof entry !== 'object') {
                    return null;
                  }

                  const url = String((entry as { url?: unknown }).url ?? '').trim();
                  const assetId = String((entry as { assetId?: unknown }).assetId ?? '').trim();
                  if (!url) return null;

                  return { url, assetId: assetId || undefined };
                })
                .filter((entry): entry is { url: string; assetId?: string } => Boolean(entry))
            : [],
          featured: item.featured,
          published: item.published,
          sortOrder: item.sortOrder
        }}
      />
    </div>
  );
}
