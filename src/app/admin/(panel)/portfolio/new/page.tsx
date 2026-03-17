import Link from 'next/link';
import PortfolioForm from '@/components/admin/portfolio/PortfolioForm';
import { createPortfolioItemAction } from '../actions';

export default function AdminPortfolioCreatePage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/portfolio" className="inline-flex text-sm text-slate-600 transition hover:text-slate-900">
        ← Назад к списку работ
      </Link>

      <PortfolioForm
        heading="Новая работа"
        description="Заполните основные данные. После сохранения работу можно сразу опубликовать или оставить скрытой."
        submitLabel="Сохранить работу"
        action={createPortfolioItemAction}
        initialValues={{
          title: '',
          slug: '',
          category: '',
          shortDescription: '',
          coverImage: '',
          coverImageAssetId: '',
          galleryImages: '',
          featured: false,
          published: false,
          sortOrder: 0
        }}
      />
    </div>
  );
}
