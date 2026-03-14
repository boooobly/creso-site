import { AdminPageSection, PlaceholderCard } from './AdminPageSection';

type AdminSectionScaffoldProps = {
  title: string;
  description: string;
  blocks: Array<{ title: string; description: string }>;
};

export default function AdminSectionScaffold({
  title,
  description,
  blocks
}: AdminSectionScaffoldProps) {
  return (
    <div className="space-y-6">
      <AdminPageSection title={title} description={description}>
        <div className="grid gap-4 md:grid-cols-2">
          {blocks.map((block) => (
            <PlaceholderCard key={block.title} title={block.title} description={block.description} />
          ))}
        </div>
      </AdminPageSection>
    </div>
  );
}
