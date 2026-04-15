import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createSignedAdminSessionToken } from '@/lib/admin-auth';

type OrderRecord = {
  id: string;
  number: string;
  source: string;
  status: string;
  createdAt: Date;
  customerName: string;
  phone: string;
  email?: string;
  comment?: string;
  total: number;
  prepayRequired: boolean;
  prepayAmount: number | null;
  paymentStatus: string;
  paymentProvider: string | null;
  paymentRef: string | null;
  paidAmount: number | null;
  paidAt: Date | null;
  payloadJson: unknown;
  quoteJson: unknown;
};

type ReviewRecord = {
  id: string;
  name: string;
  isAnonymous: boolean;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  moderatedAt: Date | null;
};

const orders = new Map<string, OrderRecord>();
const reviews = new Map<string, ReviewRecord>();
let orderSeq = 1;

const pricingListMock = vi.fn();
const pricingUpdateMock = vi.fn();
const pageContentListMock = vi.fn();
const pageContentUpdateMock = vi.fn();
const canonicalLeadPostMock = vi.fn();

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({
    ADMIN_TOKEN: 'admin-token',
    ORDER_TOKEN_SECRET: 'order-secret',
    SEND_CUSTOMER_EMAILS: false,
    TELEGRAM_BOT_TOKEN: '',
    TELEGRAM_CHAT_ID: '',
  }),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    order: {
      create: vi.fn(async ({ data }: { data: Partial<OrderRecord> & { number: string } }) => {
        const record: OrderRecord = {
          id: `order-${orderSeq++}`,
          number: data.number,
          source: data.source ?? 'baget',
          status: data.status ?? 'new',
          createdAt: new Date('2026-04-15T10:00:00.000Z'),
          customerName: data.customerName ?? 'Customer',
          phone: data.phone ?? '+79990000000',
          email: data.email,
          comment: data.comment,
          total: Number(data.total ?? 0),
          prepayRequired: Boolean(data.prepayRequired),
          prepayAmount: data.prepayAmount == null ? null : Number(data.prepayAmount),
          paymentStatus: data.paymentStatus ?? 'unpaid',
          paymentProvider: data.paymentProvider ?? null,
          paymentRef: data.paymentRef ?? null,
          paidAmount: data.paidAmount == null ? null : Number(data.paidAmount),
          paidAt: data.paidAt ?? null,
          payloadJson: data.payloadJson ?? null,
          quoteJson: data.quoteJson ?? null,
        };

        orders.set(record.number, record);
        return record;
      }),
      findUnique: vi.fn(async ({ where, select }: { where: { number?: string }; select?: Record<string, boolean> }) => {
        const record = where.number ? orders.get(where.number) : undefined;
        if (!record) return null;
        if (!select) return record;

        const selected: Record<string, unknown> = {};
        for (const [key, enabled] of Object.entries(select)) {
          if (enabled) selected[key] = (record as Record<string, unknown>)[key];
        }
        return selected;
      }),
      update: vi.fn(async ({ where, data }: { where: { number?: string; id?: string }; data: Partial<OrderRecord> }) => {
        const target = where.number
          ? orders.get(where.number)
          : [...orders.values()].find((order) => order.id === where.id);
        if (!target) throw new Error('Order not found');

        Object.assign(target, data);
        return target;
      }),
    },
    review: {
      findMany: vi.fn(async ({ where }: { where?: { status?: ReviewRecord['status'] } }) => {
        const status = where?.status;
        return [...reviews.values()].filter((item) => (status ? item.status === status : true));
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<ReviewRecord> }) => {
        const review = reviews.get(where.id);
        if (!review) throw new Error('review not found');
        Object.assign(review, data);
        return {
          id: review.id,
          status: review.status,
          moderatedAt: review.moderatedAt,
        };
      }),
    },
  },
}));

vi.mock('@/lib/baget/sheetsCatalog', () => ({
  getBagetCatalogFromSheet: vi.fn(async () => [{
    id: 'baget-1',
    article: 'A1',
    name: 'Classic',
    color: 'gold',
    style: 'classic',
    width_mm: 20,
    price_per_meter: 10,
    image: '/baget.jpg',
  }]),
  mapSheetItemsToBagetItems: vi.fn((items: unknown[]) => items),
}));

vi.mock('@/lib/calculations/bagetQuote', () => ({
  bagetQuote: vi.fn(() => ({
    total: 10000,
    effectiveSize: { width: 500, height: 700 },
    items: [{ title: 'Багет', total: 10000 }],
  })),
}));

vi.mock('@/lib/baget/baguetteExtrasPricing', () => ({
  getBaguetteExtrasPricingConfig: vi.fn(async () => ({ config: {} })),
}));

vi.mock('@/lib/orders/bagetOrderSummary', () => ({
  buildBagetOrderSummary: vi.fn(() => ({ lines: ['summary'] })),
}));

vi.mock('@/lib/orders/storeCustomerImage', () => ({
  MAX_ORDER_IMAGE_SIZE_BYTES: 10 * 1024 * 1024,
  storeBagetCustomerImage: vi.fn(async () => null),
}));

vi.mock('@/lib/file-validation', () => ({
  validateUploadedImageFile: vi.fn(async () => ({ ok: true })),
}));

vi.mock('@/lib/notifications/notifyNewOrder', () => ({
  notifyNewOrder: vi.fn(async () => undefined),
}));

vi.mock('@/lib/notifications/sendCustomerOrderEmail', () => ({
  sendCustomerOrderEmail: vi.fn(async () => undefined),
}));

vi.mock('@/lib/url/getBaseUrl', () => ({
  getBaseUrl: () => 'http://localhost:3000',
}));

vi.mock('@/lib/pdf/buildOrderPdf', () => ({
  buildOrderPdf: vi.fn(async ({ orderNumber }: { orderNumber: string }) => Buffer.from(`PDF-${orderNumber}`)),
}));

vi.mock('@/lib/admin/pricing-service', () => ({
  listPricingEntries: pricingListMock,
  updatePricingEntry: pricingUpdateMock,
  createPricingEntry: vi.fn(),
  deletePricingEntry: vi.fn(),
}));

vi.mock('@/lib/admin/page-content-service', () => ({
  listPageContentItems: pageContentListMock,
  updatePageContentItem: pageContentUpdateMock,
  createPageContentItem: vi.fn(),
  deletePageContentItem: vi.fn(),
}));

vi.mock('@/app/api/leads/route', () => ({
  POST: canonicalLeadPostMock,
}));

describe('critical customer/admin integration smoke flows', () => {
  beforeEach(() => {
    orders.clear();
    reviews.clear();
    orderSeq = 1;

    reviews.set('review-1', {
      id: 'review-1',
      name: 'Пётр',
      isAnonymous: false,
      rating: 5,
      text: 'Отлично',
      status: 'pending',
      createdAt: new Date('2026-04-15T09:00:00.000Z'),
      moderatedAt: null,
    });

    pricingListMock.mockReset();
    pricingUpdateMock.mockReset();
    pageContentListMock.mockReset();
    pageContentUpdateMock.mockReset();
    canonicalLeadPostMock.mockReset();

    pricingListMock.mockResolvedValue({ items: [{ id: 'price-1', key: 'baget.base', value: '1000' }], total: 1, page: 1, pageSize: 20 });
    pricingUpdateMock.mockResolvedValue({ id: 'price-1', key: 'baget.base', value: '1200' });
    pageContentListMock.mockResolvedValue({ items: [{ id: 'content-1', pageKey: 'home', sectionKey: 'hero' }], total: 1, page: 1, pageSize: 20 });
    pageContentUpdateMock.mockResolvedValue({ id: 'content-1', value: 'Новый текст' });

    canonicalLeadPostMock.mockResolvedValue(NextResponse.json({ ok: true }));

    process.env.NODE_ENV = 'test';
    process.env.ADMIN_SESSION_SECRET = 'integration-admin-secret';
    process.env.ADMIN_SESSION_TTL_SECONDS = '86400';
    process.env.PUBLIC_BASE_URL = 'http://localhost:3000';
  });

  it('runs customer order → payment → paid status → PDF flow and validates token failures', async () => {
    const { POST: createOrder } = await import('@/app/api/orders/route');
    const orderRequest = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customer: { name: 'Иван', phone: '+79991234567', email: 'ivan@example.com', comment: 'Тестовый заказ' },
        baget: {
          width: 500,
          height: 700,
          quantity: 1,
          selectedBagetId: 'baget-1',
          workType: 'canvas',
          glazing: 'none',
          hasPassepartout: false,
          backPanel: false,
          stand: false,
          requiresPrint: false,
          printMaterial: null,
          transferSource: 'manual',
        },
        fulfillmentType: 'pickup',
      }),
    });

    const orderResponse = await createOrder(orderRequest);
    const orderJson = await orderResponse.json();

    expect(orderResponse.status).toBe(200);
    expect(orderJson.orderNumber).toBeTypeOf('string');
    expect(orderJson.orderNumber.length).toBeGreaterThan(4);
    expect(orderJson.accessToken).toBeTypeOf('string');

    const { GET: getOrder } = await import('@/app/api/orders/[number]/route');
    const forbiddenOrderResponse = await getOrder(
      new NextRequest(`http://localhost:3000/api/orders/${orderJson.orderNumber}?token=bad-token`),
      { params: { number: orderJson.orderNumber } },
    );
    expect(forbiddenOrderResponse.status).toBe(403);

    const orderStatusResponse = await getOrder(
      new NextRequest(`http://localhost:3000/api/orders/${orderJson.orderNumber}?token=${encodeURIComponent(orderJson.accessToken)}`),
      { params: { number: orderJson.orderNumber } },
    );
    const orderStatusJson = await orderStatusResponse.json();

    expect(orderStatusResponse.status).toBe(200);
    expect(orderStatusJson.paymentStatus).toBe('unpaid');

    const { POST: createPayment } = await import('@/app/api/payments/create/route');
    const invalidPaymentTokenResponse = await createPayment(
      new NextRequest('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderJson.orderNumber, token: 'bad-token' }),
      }),
    );
    expect(invalidPaymentTokenResponse.status).toBe(403);

    const createPaymentResponse = await createPayment(
      new NextRequest('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderJson.orderNumber, token: orderJson.accessToken }),
      }),
    );
    const createPaymentJson = await createPaymentResponse.json();

    expect(createPaymentResponse.status).toBe(200);
    expect(createPaymentJson.paymentStatus).toBe('pending');
    expect(createPaymentJson.paymentRef).toMatch(/^pay_/);

    const { POST: completeMockPayment } = await import('@/app/api/payments/mock/complete/route');
    const completePaymentResponse = await completeMockPayment(
      new NextRequest('http://localhost:3000/api/payments/mock/complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderJson.orderNumber,
          paymentRef: createPaymentJson.paymentRef,
          status: 'paid',
          token: orderJson.accessToken,
        }),
      }),
    );

    expect(completePaymentResponse.status).toBe(200);

    const paidOrderResponse = await getOrder(
      new NextRequest(`http://localhost:3000/api/orders/${orderJson.orderNumber}?token=${encodeURIComponent(orderJson.accessToken)}`),
      { params: { number: orderJson.orderNumber } },
    );
    const paidOrderJson = await paidOrderResponse.json();

    expect(paidOrderResponse.status).toBe(200);
    expect(paidOrderJson.paymentStatus).toBe('paid');
    expect(paidOrderJson.securePdfUrl).toContain('/api/orders/');
    expect(paidOrderJson.securePdfUrl).toContain('token=');

    const { GET: getOrderPdf } = await import('@/app/api/orders/[number]/pdf/route');
    const pdfResponse = await getOrderPdf(
      new NextRequest(paidOrderJson.securePdfUrl),
      { params: { number: orderJson.orderNumber } },
    );

    expect(pdfResponse.status).toBe(200);
    expect(pdfResponse.headers.get('content-type')).toBe('application/pdf');
  });

  it('runs admin auth/session smoke flow across protected endpoints and moderation/content pricing updates', async () => {
    const token = await createSignedAdminSessionToken();
    const cookie = `admin_session=${token}`;

    const { GET: getAdminReviews } = await import('@/app/api/admin/reviews/route');
    const reviewsResponse = await getAdminReviews(
      new NextRequest('http://localhost:3000/api/admin/reviews?status=pending', {
        method: 'GET',
        headers: { cookie },
      }),
    );
    const reviewsJson = await reviewsResponse.json();

    expect(reviewsResponse.status).toBe(200);
    expect(reviewsJson.ok).toBe(true);
    expect(reviewsJson.items).toHaveLength(1);

    const { PATCH: moderateReview } = await import('@/app/api/admin/reviews/[id]/route');
    const moderateResponse = await moderateReview(
      new NextRequest('http://localhost:3000/api/admin/reviews/review-1', {
        method: 'PATCH',
        headers: {
          cookie,
          origin: 'http://localhost:3000',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      }),
      { params: { id: 'review-1' } },
    );

    expect(moderateResponse.status).toBe(200);
    expect(reviews.get('review-1')?.status).toBe('approved');

    const { GET: getPricing } = await import('@/app/api/admin/pricing/route');
    const pricingResponse = await getPricing(
      new NextRequest('http://localhost:3000/api/admin/pricing', {
        method: 'GET',
        headers: { cookie },
      }),
    );
    expect(pricingResponse.status).toBe(200);
    expect(pricingListMock).toHaveBeenCalledTimes(1);

    const { PATCH: patchPricing } = await import('@/app/api/admin/pricing/[id]/route');
    const patchPricingResponse = await patchPricing(
      new NextRequest('http://localhost:3000/api/admin/pricing/price-1', {
        method: 'PATCH',
        headers: {
          cookie,
          origin: 'http://localhost:3000',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ value: '1200' }),
      }),
      { params: { id: 'price-1' } },
    );
    expect(patchPricingResponse.status).toBe(200);
    expect(pricingUpdateMock).toHaveBeenCalledWith('price-1', { value: '1200' });

    const { GET: getPageContent } = await import('@/app/api/admin/page-content/route');
    const pageContentResponse = await getPageContent(
      new NextRequest('http://localhost:3000/api/admin/page-content', {
        method: 'GET',
        headers: { cookie },
      }),
    );
    expect(pageContentResponse.status).toBe(200);
    expect(pageContentListMock).toHaveBeenCalledTimes(1);

    const { PATCH: patchPageContent } = await import('@/app/api/admin/page-content/[id]/route');
    const patchPageContentResponse = await patchPageContent(
      new NextRequest('http://localhost:3000/api/admin/page-content/content-1', {
        method: 'PATCH',
        headers: {
          cookie,
          origin: 'http://localhost:3000',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ value: 'Новый текст' }),
      }),
      { params: { id: 'content-1' } },
    );
    expect(patchPageContentResponse.status).toBe(200);
    expect(pageContentUpdateMock).toHaveBeenCalledWith('content-1', { value: 'Новый текст' });
  });

  it('covers legacy failures: deprecated moderation route and canonical lead wrapper headers', async () => {
    const { PATCH } = await import('@/app/api/reviews/[id]/moderate/route');
    const deprecatedResponse = await PATCH(
      new NextRequest('http://localhost:3000/api/reviews/review-1/moderate', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      }),
      { params: { id: 'review-1' } },
    );

    expect(deprecatedResponse.status).toBe(410);

    const { POST } = await import('@/app/api/lead/route');
    const leadResponse = await POST(
      new NextRequest('http://localhost:3000/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Иван',
          email: 'ivan@example.com',
          phone: '+79991234567',
          service: 'Широкоформатная печать',
          message: 'Нужен расчёт',
          consent: true,
        }),
      }),
    );

    expect(leadResponse.status).toBe(200);
    expect(canonicalLeadPostMock).toHaveBeenCalledTimes(1);
    expect(leadResponse.headers.get('x-creso-api-deprecated')).toBe('true');
    expect(leadResponse.headers.get('x-creso-api-canonical')).toBe('/api/leads');
  });
});
