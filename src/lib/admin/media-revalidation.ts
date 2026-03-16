import { revalidatePath } from 'next/cache';
import { SITE_IMAGE_SLOTS } from '@/lib/site-image-slots';

type MediaLike = {
  scope?: string | null;
  fileName?: string | null;
};

export function revalidateAfterMediaChange(item?: MediaLike | null) {
  revalidatePath('/admin/site-images');

  if (!item || item.scope !== 'site') return;

  if (item.fileName) {
    const slot = SITE_IMAGE_SLOTS.find((entry) => entry.key === item.fileName);
    if (slot) {
      revalidatePath(slot.route);
      return;
    }
  }

  for (const slot of SITE_IMAGE_SLOTS) {
    revalidatePath(slot.route);
  }
}
