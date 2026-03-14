import { AdminPageSection, PlaceholderCard } from '@/components/admin/AdminPageSection';

export default function AdminSiteImagesPage() {
  return (
    <div className="space-y-6">
      <AdminPageSection
        title="Изображения сайта"
        description="Здесь будут храниться и переиспользоваться изображения для страниц, портфолио и баннеров."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <PlaceholderCard
            title="Библиотека изображений"
            description="Список загруженных файлов с быстрым поиском и фильтрами по разделам."
          />
          <PlaceholderCard
            title="Загрузка файлов"
            description="Простая загрузка изображений с подписью и альтернативным текстом."
          />
          <PlaceholderCard
            title="Переиспользование"
            description="Подключение одного изображения сразу в несколько блоков сайта."
          />
          <PlaceholderCard
            title="Активность"
            description="Подсказка, какие изображения уже используются, а какие можно архивировать."
          />
        </div>
      </AdminPageSection>
    </div>
  );
}
