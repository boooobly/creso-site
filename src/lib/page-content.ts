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

export function getFaqItemsFromContentMap(
  map: Map<string, string>,
  sectionKey: string,
  maxItems: number
) {
  const items: Array<{ q: string; a: string }> = [];

  for (let i = 1; i <= maxItems; i += 1) {
    const q = map.get(`${sectionKey}.question${i}`)?.trim() ?? '';
    const a = map.get(`${sectionKey}.answer${i}`)?.trim() ?? '';

    if (!q || !a) continue;
    items.push({ q, a });
  }

  return items;
}
