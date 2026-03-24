export const MUGS_DESIGN_TRANSFER_KEY = 'mugs:standalone-design-transfer:v1';
export const MUGS_ORDER_RETURN_URL = '/services/mugs#mug-order-form';

export type MugDesignerTransferPayload = {
  version: 1;
  createdAt: string;
  mockPreview: {
    filename: string;
    mimeType: 'image/png';
    dataUrl: string;
  };
  printPreview: {
    filename: string;
    mimeType: 'image/png';
    dataUrl: string;
  };
  layout: {
    filename: string;
    mimeType: 'application/json';
    json: string;
  };
};

export function saveMugDesignerTransfer(payload: MugDesignerTransferPayload): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(MUGS_DESIGN_TRANSFER_KEY, JSON.stringify(payload));
}

export function readMugDesignerTransfer(): MugDesignerTransferPayload | null {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(MUGS_DESIGN_TRANSFER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as MugDesignerTransferPayload;
    if (!parsed || parsed.version !== 1) return null;
    if (!parsed.mockPreview?.dataUrl || !parsed.printPreview?.dataUrl || !parsed.layout?.json) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearMugDesignerTransfer(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(MUGS_DESIGN_TRANSFER_KEY);
}
