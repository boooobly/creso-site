export const BAGET_TRANSFER_SOURCE_QUERY_KEY = 'transferSource';
export const BAGET_TRANSFER_SOURCE_WIDE_FORMAT_CANVAS = 'wide_format_canvas';

export function isWideFormatCanvasBagetTransfer(value: string | undefined): boolean {
  return value === BAGET_TRANSFER_SOURCE_WIDE_FORMAT_CANVAS;
}
