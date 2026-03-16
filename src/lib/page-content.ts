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
