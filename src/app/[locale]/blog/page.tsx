import posts from '@/data/posts.json';

export default function BlogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Блог</h1>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="card p-4">
            <div className="text-sm text-neutral-500">{new Date(p.date).toLocaleDateString('ru-RU')}</div>
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-neutral-700">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}