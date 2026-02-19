import { env } from '@/lib/env';

type LogLevel = 'info' | 'warn' | 'error';

type LogMeta = Record<string, unknown>;

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === 'warn') {
    console.warn(JSON.stringify(payload));
    return;
  }

  if (env.NODE_ENV !== 'test') {
    console.info(JSON.stringify(payload));
  }
}

export const logger = {
  info: (message: string, meta?: LogMeta): void => write('info', message, meta),
  warn: (message: string, meta?: LogMeta): void => write('warn', message, meta),
  error: (message: string, meta?: LogMeta): void => write('error', message, meta),
};
