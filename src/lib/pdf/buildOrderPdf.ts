import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type QuoteItem = {
  title?: string;
  total?: number;
};

type QuoteShape = {
  items?: QuoteItem[];
  effectiveSize?: {
    width?: number;
    height?: number;
  };
};

function formatMoneyRub(amount: number | null | undefined): string {
  const value = Number(amount ?? 0);
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatValue(value: string | null | undefined): string {
  const text = (value ?? '').trim();
  return text || '—';
}

export async function buildOrderPdf(params: {
  orderNumber: string;
  createdAt: Date;
  customerName?: string | null;
  phone?: string | null;
  email?: string | null;
  comment?: string | null;
  total: number;
  prepayRequired: boolean;
  prepayAmount?: number | null;
  quote: any;
  payload?: any;
}): Promise<Uint8Array> {
  const quote = (params.quote ?? {}) as QuoteShape;
  const items = Array.isArray(quote.items) ? quote.items : [];

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const left = 48;
  const right = 548;
  let y = 800;

  const drawText = (text: string, opts?: { size?: number; bold?: boolean; color?: [number, number, number] }) => {
    const size = opts?.size ?? 11;
    const chosenFont = opts?.bold ? fontBold : font;
    const color = opts?.color ? rgb(opts.color[0], opts.color[1], opts.color[2]) : rgb(0, 0, 0);

    page.drawText(text, {
      x: left,
      y,
      size,
      font: chosenFont,
      color,
    });
    y -= size + 5;
  };

  const drawDivider = () => {
    y -= 4;
    page.drawLine({
      start: { x: left, y },
      end: { x: right, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 12;
  };

  drawText('CREDOMIR', { size: 16, bold: true });
  drawText(`Заказ №${params.orderNumber}`, { size: 14, bold: true });
  drawText(`Дата: ${formatDate(params.createdAt)}`, { size: 10, color: [0.35, 0.35, 0.35] });
  drawDivider();

  drawText('Клиент', { bold: true, size: 12 });
  drawText(`Имя: ${formatValue(params.customerName)}`);
  drawText(`Телефон: ${formatValue(params.phone)}`);
  drawText(`Email: ${formatValue(params.email)}`);
  drawText(`Комментарий: ${formatValue(params.comment)}`);
  drawDivider();

  drawText('Параметры работы', { bold: true, size: 12 });
  const effectiveW = quote.effectiveSize?.width;
  const effectiveH = quote.effectiveSize?.height;
  const effectiveSizeText = Number.isFinite(effectiveW) && Number.isFinite(effectiveH)
    ? `${Math.round(Number(effectiveW))} × ${Math.round(Number(effectiveH))} мм`
    : '—';
  drawText(`Эффективный размер: ${effectiveSizeText}`);
  drawDivider();

  drawText('Состав заказа', { bold: true, size: 12 });
  if (items.length === 0) {
    drawText('Позиции отсутствуют.');
  } else {
    for (const item of items) {
      const title = formatValue(item.title);
      const total = formatMoneyRub(item.total);
      const line = `• ${title}`;
      page.drawText(line, {
        x: left,
        y,
        size: 11,
        font,
      });

      const priceWidth = font.widthOfTextAtSize(total, 11);
      page.drawText(total, {
        x: right - priceWidth,
        y,
        size: 11,
        font,
      });
      y -= 16;

      if (y < 90) break;
    }
  }

  drawDivider();
  drawText(`Итого: ${formatMoneyRub(params.total)}`, { bold: true, size: 13 });

  if (params.prepayRequired) {
    drawText(`Предоплата (50%): ${formatMoneyRub(params.prepayAmount)}`, { bold: true });
  }

  y -= 8;
  drawText('Мы свяжемся с вами для подтверждения деталей заказа.', {
    size: 10,
    color: [0.35, 0.35, 0.35],
  });

  return pdfDoc.save();
}
