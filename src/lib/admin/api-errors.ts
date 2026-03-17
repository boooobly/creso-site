import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export function handleAdminApiError(error: unknown) {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    const issuePath = firstIssue?.path?.length ? ` (${firstIssue.path.join('.')})` : '';
    const issueMessage = firstIssue?.message ? ` ${firstIssue.message}${issuePath}` : '';

    return NextResponse.json(
      { ok: false, error: `Проверьте корректность данных формы.${issueMessage}`.trim(), issues: error.issues },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'Запись с таким ключом уже существует.' }, { status: 409 });
    }

    if (error.code === 'P2025') {
      return NextResponse.json({ ok: false, error: 'Запись не найдена.' }, { status: 404 });
    }

    if (error.code === 'P2022') {
      return NextResponse.json(
        { ok: false, error: 'Структура базы данных не обновлена. Примените последние миграции Prisma.' },
        { status: 500 }
      );
    }
  }

  const message = error instanceof Error ? error.message : 'Unknown server error.';
  if (message.startsWith('[env]')) {
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  return null;
}
