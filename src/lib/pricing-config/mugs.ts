export const MUGS_COVERING_OPTIONS = [
  { value: 'glossy', label: 'Глянец' },
  { value: 'matte', label: 'Мат' },
] as const;

export const MUGS_ALLOWED_RASTER_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'] as const;
export const MUGS_ALLOWED_VECTOR_EXTENSIONS = ['.pdf', '.cdr', '.ai', '.eps', '.dxf', '.svg'] as const;

export const MUGS_ALLOWED_EXTENSIONS = [
  ...MUGS_ALLOWED_RASTER_EXTENSIONS,
  ...MUGS_ALLOWED_VECTOR_EXTENSIONS,
] as const;

export const MUGS_ALLOWED_RASTER_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const MUGS_ALLOWED_VECTOR_MIME_TYPES = [
  'application/pdf',
  'application/postscript',
  'image/svg+xml',
  'application/illustrator',
  'application/vnd.adobe.illustrator',
  'application/coreldraw',
  'application/x-coreldraw',
  'application/cdr',
  'image/vnd.dxf',
  'application/dxf',
] as const;

export const MUGS_ALLOWED_MIME_TYPES = [
  ...MUGS_ALLOWED_RASTER_MIME_TYPES,
  ...MUGS_ALLOWED_VECTOR_MIME_TYPES,
] as const;

export const MUGS_MAX_UPLOAD_SIZE_MB = 20;
