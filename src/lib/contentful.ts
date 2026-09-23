import { createClient, type EntryFieldTypes } from 'contentful';

type ServiceEntry = { contentTypeId: 'service'; fields: { title: EntryFieldTypes.Symbol; description: EntryFieldTypes.Text; slug: EntryFieldTypes.Symbol } };
type FaqEntry = { contentTypeId: 'faqItem'; fields: { q: EntryFieldTypes.Symbol; a: EntryFieldTypes.Text } };

const space = process.env.CONTENTFUL_SPACE_ID?.trim();
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN?.trim();

const client = space && accessToken
  ? createClient({
      space,
      accessToken,
      timeout: 3000,
      retryLimit: 1,
    })
  : null;

export async function getServices() {
  if (!client) return null;
  const res = await client.getEntries<ServiceEntry>({ content_type: 'service', order: ['fields.title'], limit: 1000 });
  return res.items.map((item) => ({
    id: item.sys.id,
    title: item.fields.title,
    description: item.fields.description,
    slug: item.fields.slug || 'services',
  }));
}

export async function getFaq() {
  if (!client) return null;
  const res = await client.getEntries<FaqEntry>({ content_type: 'faqItem', order: ['fields.q'], limit: 1000 });
  return res.items.map((item) => ({ q: item.fields.q, a: item.fields.a }));
}
