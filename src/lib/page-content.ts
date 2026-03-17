import { listPageContentByPageKey, toPageContentStringMap } from '@/lib/admin/page-content-service';

export async function getPageContentMap(pageKey: string) {
  try {
    const items = await listPageContentByPageKey(pageKey);
    return toPageContentStringMap(items);
  } catch {
    return new Map<string, string>();
  }
}

export function getPageContentValue(
  map: Map<string, string>,
  sectionKey: string,
  fieldKey: string,
  defaultValue: string
) {
  return map.get(`${sectionKey}.${fieldKey}`)?.trim() || defaultValue;
}

export function getPageContentList<T extends Record<string, string>>(
  map: Map<string, string>,
  sectionKey: string,
  fieldKey: string,
  defaultItems: T[],
  requiredKeys: Array<keyof T>
): T[] {
  const rawValue = map.get(`${sectionKey}.${fieldKey}`)?.trim();

  if (!rawValue) return defaultItems;

  try {
    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) return defaultItems;

    const normalized = parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const record = item as Record<string, unknown>;
        const next: Record<string, string> = {};

        for (const [key, value] of Object.entries(record)) {
          next[key] = typeof value === 'string' ? value.trim() : '';
        }

        return next as T;
      })
      .filter((item) => requiredKeys.every((key) => String(item[key] ?? '').trim().length > 0));

    return normalized.length > 0 ? normalized : defaultItems;
  } catch {
    return defaultItems;
  }
}

export function getFaqItemsFromContentMap(
  map: Map<string, string>,
  sectionKey: string,
  maxItems: number
) {
  const listItems = getPageContentList(
    map,
    sectionKey,
    'items',
    [] as Array<{ question: string; answer: string }>,
    ['question', 'answer']
  );

  if (listItems.length > 0) {
    return listItems.slice(0, maxItems).map((item) => ({ q: item.question, a: item.answer }));
  }

  const items: Array<{ q: string; a: string }> = [];

  for (let i = 1; i <= maxItems; i += 1) {
    const q = map.get(`${sectionKey}.question${i}`)?.trim() ?? '';
    const a = map.get(`${sectionKey}.answer${i}`)?.trim() ?? '';

    if (!q || !a) continue;
    items.push({ q, a });
  }

  return items;
}
