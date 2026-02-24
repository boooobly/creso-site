import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_TTL_SECONDS = 24 * 60 * 60;

type PdfTokenPayload = {
  orderNumber: string;
  exp: number;
};

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string | null {
  try {
    return Buffer.from(value, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

function signPart(payloadPart: string, secret: string): string {
  return createHmac('sha256', secret).update(payloadPart).digest('base64url');
}

export function createOrderPdfAccessToken(orderNumber: string, secret: string): string {
  const payload: PdfTokenPayload = {
    orderNumber,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };

  const payloadPart = toBase64Url(JSON.stringify(payload));
  const signature = signPart(payloadPart, secret);
  return `${payloadPart}.${signature}`;
}

export function verifyOrderPdfAccessToken(params: {
  token: string;
  orderNumber: string;
  secret: string;
}): boolean {
  const [payloadPart, signaturePart] = params.token.split('.');
  if (!payloadPart || !signaturePart) {
    return false;
  }

  const expectedSignature = signPart(payloadPart, params.secret);
  const signatureBuffer = Buffer.from(signaturePart);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  const decodedPayload = fromBase64Url(payloadPart);
  if (!decodedPayload) {
    return false;
  }

  let payload: PdfTokenPayload;
  try {
    payload = JSON.parse(decodedPayload) as PdfTokenPayload;
  } catch {
    return false;
  }

  if (payload.orderNumber !== params.orderNumber) {
    return false;
  }

  if (!Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  return true;
}
