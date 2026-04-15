import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { calculateHeatTransferPricing } from '@/lib/calculations/heatTransferPricing';
import { calculatePlotterCuttingPricing } from '@/lib/calculations/plotterCuttingPricing';
import { calculateWideFormatPricing } from '@/lib/calculations/wideFormatPricing';
import { WIDE_FORMAT_PRICING_FALLBACK_CONFIG } from '@/lib/wide-format/wideFormatPricing';
import { HEAT_TRANSFER_PRICING_FALLBACK_CONFIG } from '@/lib/heat-transfer/heatTransferPricing';
import { PLOTTER_CUTTING_PRICING_FALLBACK_CONFIG } from '@/lib/plotter-cutting/plotterCuttingPricing';

const sendMailMock = vi.fn(async () => ({}));

vi.mock('@/lib/env', () => ({
  requireDatabaseEnv: () => undefined,
  getServerEnv: () => ({
    NODE_ENV: 'test',
    ENABLE_DATABASE: false,
    SEND_CUSTOMER_EMAILS: false,
    ADMIN_TOKEN: 'test-admin-token',
    ORDER_TOKEN_SECRET: 'test-order-secret',
    MAIL_TO: 'manager@example.com',
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: 587,
    SMTP_USER: 'user@example.com',
    SMTP_PASS: 'secret',
    TELEGRAM_BOT_TOKEN: '',
    TELEGRAM_CHAT_ID: '',
  }),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({
      sendMail: sendMailMock,
    }),
  },
}));

vi.mock('@/lib/anti-spam', () => ({
  enforcePublicRequestGuard: () => null,
}));

vi.mock('@/lib/quote-logging', () => ({
  logQuoteGeneration: () => undefined,
}));

vi.mock('@/lib/wide-format/wideFormatPricing', async () => {
  const actual = await vi.importActual<typeof import('@/lib/wide-format/wideFormatPricing')>('@/lib/wide-format/wideFormatPricing');

  return {
    ...actual,
    getWideFormatPricingConfig: async () => ({
      config: actual.WIDE_FORMAT_PRICING_FALLBACK_CONFIG,
      loadedKeys: [],
      fallbackUsedKeys: [],
      missingKeys: [],
      unknownKeys: [],
      isComplete: true,
    }),
  };
});

vi.mock('@/lib/heat-transfer/heatTransferPricing', async () => {
  const actual = await vi.importActual<typeof import('@/lib/heat-transfer/heatTransferPricing')>('@/lib/heat-transfer/heatTransferPricing');

  return {
    ...actual,
    getHeatTransferPricingConfig: async () => ({
      config: actual.HEAT_TRANSFER_PRICING_FALLBACK_CONFIG,
      loadedKeys: [],
      fallbackUsedKeys: [],
      missingKeys: [],
      unknownKeys: [],
      isComplete: true,
    }),
  };
});


vi.mock('@/lib/print/printPricing', async () => {
  const actual = await vi.importActual<typeof import('@/lib/print/printPricing')>('@/lib/print/printPricing');

  return {
    ...actual,
    getPrintPricingConfig: async () => ({
      config: actual.PRINT_PRICING_FALLBACK_CONFIG,
      loadedKeys: [],
      fallbackUsedKeys: [],
      missingKeys: [],
      unknownKeys: [],
      isComplete: true,
    }),
  };
});

vi.mock('@/lib/plotter-cutting/plotterCuttingPricing', async () => {
  const actual = await vi.importActual<typeof import('@/lib/plotter-cutting/plotterCuttingPricing')>('@/lib/plotter-cutting/plotterCuttingPricing');

  return {
    ...actual,
    getPlotterCuttingPricingConfig: async () => ({
      config: actual.PLOTTER_CUTTING_PRICING_FALLBACK_CONFIG,
      loadedKeys: [],
      fallbackUsedKeys: [],
      missingKeys: [],
      unknownKeys: [],
      isComplete: true,
    }),
  };
});

beforeEach(() => {
  sendMailMock.mockClear();
});

describe('calculator & pricing regression coverage', () => {
  const createWideFormatOrderFormData = (overrides?: Record<string, string>) => {
    const formData = new FormData();
    formData.set('name', 'Иван');
    formData.set('phone', '89991234567');
    formData.set('email', 'user@example.com');
    formData.set('width', '1600');
    formData.set('height', '1600');
    formData.set('quantity', '1');
    formData.set('materialId', 'self_adhesive_film_matte_1_5');
    formData.set('edgeGluing', 'false');
    formData.set('imageWelding', 'false');
    formData.set('grommets', 'false');
    formData.set('plotterCutByRegistrationMarks', 'false');
    formData.set('cutByPositioningMarks', 'false');
    formData.set('privacyConsent', 'true');

    if (overrides) {
      for (const [key, value] of Object.entries(overrides)) {
        formData.set(key, value);
      }
    }

    return formData;
  };

  it('wide-format quote and shared calculation stay aligned for minimum price and quantity growth', async () => {
    const { POST } = await import('@/app/api/quotes/wide-format/route');

    const lowPayload = {
      material: 'canvas_cotton_350',
      bannerDensity: 300,
      widthInput: '0.1',
      heightInput: '0.1',
      quantityInput: '1',
      edgeGluing: false,
      imageWelding: false,
      grommets: false,
      plotterCutByRegistrationMarks: false,
      cutByPositioningMarks: false,
    } as const;

    const highPayload = {
      ...lowPayload,
      quantityInput: '3',
    };

    const lowResponse = await POST(new Request('http://localhost:3000/api/quotes/wide-format', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(lowPayload),
    }));

    const highResponse = await POST(new Request('http://localhost:3000/api/quotes/wide-format', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(highPayload),
    }));

    const lowJson = await lowResponse.json();
    const highJson = await highResponse.json();
    const lowCalc = calculateWideFormatPricing(lowPayload, WIDE_FORMAT_PRICING_FALLBACK_CONFIG);
    const highCalc = calculateWideFormatPricing(highPayload, WIDE_FORMAT_PRICING_FALLBACK_CONFIG);

    expect(lowResponse.status).toBe(200);
    expect(lowJson.quote.totalCost).toBe(lowCalc.totalCost);
    expect(lowJson.quote.totalCost).toBeGreaterThan(0);
    expect(Number.isNaN(lowJson.quote.totalCost)).toBe(false);
    expect(lowJson.quote.basePrintCost).toBe(WIDE_FORMAT_PRICING_FALLBACK_CONFIG.minimumPrintPriceRUB);

    expect(highResponse.status).toBe(200);
    expect(highJson.quote.totalCost).toBe(highCalc.totalCost);
    expect(highJson.quote.totalCost).toBeGreaterThanOrEqual(lowJson.quote.totalCost);
  });

  it('wide-format order rejects oversized film dimensions from business width rules', async () => {
    const { POST } = await import('@/app/api/wide-format-order/route');

    const formData = createWideFormatOrderFormData();

    const response = await POST(new NextRequest('http://localhost:3000/api/wide-format-order', {
      method: 'POST',
      headers: { 'user-agent': 'Vitest' },
      body: formData,
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
    });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('wide-format order rejects requests without privacy consent', async () => {
    const { POST } = await import('@/app/api/wide-format-order/route');

    const formData = createWideFormatOrderFormData({ privacyConsent: 'false' });

    const response = await POST(new NextRequest('http://localhost:3000/api/wide-format-order', {
      method: 'POST',
      headers: { 'user-agent': 'Vitest' },
      body: formData,
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Подтвердите согласие с политикой конфиденциальности.',
    });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('heat-transfer quote and order use the same pricing math and never trust client total', async () => {
    const { POST: quotePost } = await import('@/app/api/quotes/heat-transfer/route');
    const { POST: orderPost } = await import('@/app/api/heat-transfer/route');

    const input = {
      productType: 'film',
      mugType: 'white330',
      mugPrintType: 'single',
      mugQuantity: 1,
      tshirtQuantity: 1,
      useOwnClothes: false,
      filmLengthInput: '0.2',
      filmUrgent: false,
      filmTransfer: false,
    } as const;

    const sharedCalc = calculateHeatTransferPricing(input, HEAT_TRANSFER_PRICING_FALLBACK_CONFIG);

    const quoteResponse = await quotePost(new Request('http://localhost:3000/api/quotes/heat-transfer', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    }));

    const quoteJson = await quoteResponse.json();

    expect(quoteResponse.status).toBe(200);
    expect(quoteJson.quote.total).toBe(sharedCalc.total);
    expect(quoteJson.quote.total).toBeGreaterThanOrEqual(HEAT_TRANSFER_PRICING_FALLBACK_CONFIG.film.minimumOrderTotal);

    const orderResponse = await orderPost(new NextRequest('http://localhost:3000/api/heat-transfer', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Vitest',
      },
      body: JSON.stringify({
        productType: 'film',
        configuration: {
          mugType: 'white330',
          mugPrintType: 'single',
          mugQuantity: 1,
          tshirtSize: 'L',
          tshirtGender: 'male',
          useOwnClothes: false,
          tshirtQuantity: 1,
          filmLength: 0.2,
          filmUrgent: false,
          filmTransfer: false,
        },
        pricing: {
          quantity: 999,
          subtotal: -111,
          discount: -20,
          total: -131,
          details: ['client-side fake values'],
        },
        files: [],
        contact: {
          name: 'Иван',
          phone: '+79991234567',
          agreed: true,
        },
      }),
    }));

    expect(orderResponse.status).toBe(200);
    expect(sendMailMock).toHaveBeenCalledTimes(1);

    const orderMail = sendMailMock.mock.calls[0]?.[0]?.text as string;
    expect(orderMail).toContain(`Итого: ${Math.round(sharedCalc.total)} ₽`);
    expect(orderMail).not.toContain('Итого: -131 ₽');
  });

  it('plotter order recalculates totals from server config and rejects invalid complexity', async () => {
    const { POST } = await import('@/app/api/plotter/route');

    const invalidResponse = await POST(new NextRequest('http://localhost:3000/api/plotter', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'Vitest' },
      body: JSON.stringify({
        calculator: {
          material: 'vinyl',
          cutLength: 10,
          area: 2,
          complexity: 0,
          extras: {
            weeding: true,
            mountingFilm: true,
            transfer: true,
            urgent: true,
          },
          baseCost: 0,
          extrasCost: 0,
          minimumApplied: false,
          total: 0,
        },
        files: [],
        contact: {
          name: 'Иван',
          phone: '+79991234567',
          agreed: true,
        },
      }),
    }));

    expect(invalidResponse.status).toBe(400);

    const expected = calculatePlotterCuttingPricing({
      cutLengthInput: '10',
      areaInput: '2',
      complexity: 1.3,
      weeding: true,
      mountingFilm: true,
      transfer: true,
      urgent: true,
    }, PLOTTER_CUTTING_PRICING_FALLBACK_CONFIG);

    const validResponse = await POST(new NextRequest('http://localhost:3000/api/plotter', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'Vitest' },
      body: JSON.stringify({
        calculator: {
          material: 'vinyl',
          cutLength: 10,
          area: 2,
          complexity: 1.3,
          extras: {
            weeding: true,
            mountingFilm: true,
            transfer: true,
            urgent: true,
          },
          baseCost: -1,
          extrasCost: -1,
          minimumApplied: false,
          total: -1,
        },
        files: [],
        contact: {
          name: 'Иван',
          phone: '+79991234567',
          agreed: true,
        },
      }),
    }));

    expect(validResponse.status).toBe(200);
    const plotterMail = sendMailMock.mock.calls.at(-1)?.[0]?.text as string;
    expect(plotterMail).toContain(`Итого: ${expected.totalCost} ₽`);
    expect(expected.totalCost).toBeGreaterThan(0);
    expect(Number.isNaN(expected.totalCost)).toBe(false);
  });

  it('print quote returns stable totals for business cards and rejects malformed payloads', async () => {
    const { POST } = await import('@/app/api/quotes/print/route');

    const validResponse = await POST(new Request('http://localhost:3000/api/quotes/print', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productType: 'cards',
        size: '90x50',
        density: 300,
        printType: 'single',
        lamination: false,
        presetQuantity: 1000,
        customQuantityInput: '',
      }),
    }));

    const validJson = await validResponse.json();
    expect(validResponse.status).toBe(200);
    expect(validJson.quote.totalPrice).toBe(5000);
    expect(validJson.quote.totalPrice).toBeGreaterThan(0);

    const invalidResponse = await POST(new Request('http://localhost:3000/api/quotes/print', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productType: 'cards',
        size: '',
        density: 300,
        printType: 'single',
        lamination: false,
        presetQuantity: 1000,
        customQuantityInput: '',
      }),
    }));

    expect(invalidResponse.status).toBe(400);
  });
});
