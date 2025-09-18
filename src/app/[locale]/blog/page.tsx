import localPosts from '@/data/posts.json';
import { getPosts } from '@/lib/contentful';

export default async function BlogPage() {
  const cms = await getPosts().catch(() => null);
  const posts = (cms ?? (localPosts as any[]));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Блог</h1>
      <ul className="space-y-3">
        {posts.map((p: any) => (
          <li key={p.id} className="card p-4">
            <div className="text-sm text-neutral-500">
              {p.date ? new Date(p.date).toLocaleDateString('ru-RU') : ''}
            </div>
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-neutral-700">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
