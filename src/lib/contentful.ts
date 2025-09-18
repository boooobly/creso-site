import { createClient } from 'contentful';

export const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

// Готовые функции-загрузчики
export async function getServices() {
  const res = await client.getEntries({ content_type: 'service', order: ['fields.title'], limit: 1000 });
  return res.items.map((item: any) => ({
    id: item.sys.id,
    title: item.fields.title,
    description: item.fields.description,
    slug: item.fields.slug || 'services',
  }));
}

export async function getPortfolio() {
  const res = await client.getEntries({ content_type: 'portfolioItem', order: ['fields.title'], limit: 1000 });
  return res.items.map((item: any) => ({
    id: item.sys.id,
    title: item.fields.title,
    image: item.fields.image?.fields?.file?.url ? ('https:' + item.fields.image.fields.file.url) : '/og-image.png',
    category: item.fields.category || 'print',
  }));
}

export async function getFaq() {
  const res = await client.getEntries({ content_type: 'faqItem', order: ['fields.q'], limit: 1000 });
  return res.items.map((item: any) => ({ q: item.fields.q, a: item.fields.a }));
}

export async function getPosts() {
  const res = await client.getEntries({ content_type: 'post', order: ['-fields.date'], limit: 1000 });
  return res.items.map((item: any) => ({
    id: item.sys.id,
    title: item.fields.title,
    excerpt: item.fields.excerpt,
    date: item.fields.date,
  }));
}
