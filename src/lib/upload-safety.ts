import { NextRequest, NextResponse } from 'next/server';

export const MULTIPART_ERRORS_RU = {
  FILE_TOO_LARGE: 'Размер файла превышает допустимый лимит.',
  TOTAL_TOO_LARGE: 'Суммарный размер загружаемых файлов превышает допустимый лимит.',
  TOO_MANY_FILES: 'Слишком много файлов. Уменьшите количество вложений.',
  REQUEST_TOO_LARGE: 'Размер загружаемых данных превышает допустимый лимит.',
} as const;

type MultipartErrorCode = keyof typeof MULTIPART_ERRORS_RU;

export type MultipartValidationResult =
  | { ok: true; totalBytes: number; filesCount: number }
  | { ok: false; code: MultipartErrorCode; error: string; status: number };

export function validateMultipartFiles(files: File[], limits: {
  maxFiles?: number;
  maxFileBytes?: number;
  maxTotalBytes?: number;
  messages?: Partial<Record<MultipartErrorCode, string>>;
}): MultipartValidationResult {
  const messages = { ...MULTIPART_ERRORS_RU, ...limits.messages };

  if (typeof limits.maxFiles === 'number' && files.length > limits.maxFiles) {
    return { ok: false, code: 'TOO_MANY_FILES', error: messages.TOO_MANY_FILES, status: 400 };
  }

  let totalBytes = 0;

  for (const file of files) {
    if (typeof limits.maxFileBytes === 'number' && file.size > limits.maxFileBytes) {
      return { ok: false, code: 'FILE_TOO_LARGE', error: messages.FILE_TOO_LARGE, status: 413 };
    }

    totalBytes += file.size;

    if (typeof limits.maxTotalBytes === 'number' && totalBytes > limits.maxTotalBytes) {
      return { ok: false, code: 'TOTAL_TOO_LARGE', error: messages.TOTAL_TOO_LARGE, status: 413 };
    }
  }

  return { ok: true, totalBytes, filesCount: files.length };
}

export function validateMultipartContentLength(request: NextRequest, limits: {
  maxContentLengthBytes?: number;
  messages?: Partial<Record<MultipartErrorCode, string>>;
}): MultipartValidationResult {
  const messages = { ...MULTIPART_ERRORS_RU, ...limits.messages };
  const raw = request.headers.get('content-length');

  if (!raw || typeof limits.maxContentLengthBytes !== 'number') {
    return { ok: true, totalBytes: 0, filesCount: 0 };
  }

  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > limits.maxContentLengthBytes) {
    return { ok: false, code: 'REQUEST_TOO_LARGE', error: messages.REQUEST_TOO_LARGE, status: 413 };
  }

  return { ok: true, totalBytes: 0, filesCount: 0 };
}

export function multipartErrorResponse(result: Exclude<MultipartValidationResult, { ok: true }>): NextResponse {
  return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
}
