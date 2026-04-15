import { prisma } from '@/lib/db/prisma';

export type HealthStatusLevel = 'ok' | 'warning' | 'error';

export type SystemHealthItem = {
  key: string;
  title: string;
  status: HealthStatusLevel;
  statusLabel: 'OK' | 'Предупреждение' | 'Ошибка';
  summary: string;
  details: string;
};

export type SystemHealthSnapshot = {
  checkedAt: string;
  items: SystemHealthItem[];
};

type EnvSource = NodeJS.ProcessEnv | Record<string, string | undefined>;

type SystemHealthOptions = {
  env?: EnvSource;
  checkDbConnection?: () => Promise<boolean>;
  loadPricingEntryCount?: () => Promise<number>;
};

const ADMIN_PASSWORD_FALLBACK = 'change-me-admin-password';
const ADMIN_SESSION_SECRET_FALLBACK = 'change-me-admin-secret';

function hasValue(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function toStatusLabel(status: HealthStatusLevel): SystemHealthItem['statusLabel'] {
  if (status === 'ok') return 'OK';
  if (status === 'warning') return 'Предупреждение';
  return 'Ошибка';
}

function createItem(input: Omit<SystemHealthItem, 'statusLabel'>): SystemHealthItem {
  return {
    ...input,
    statusLabel: toStatusLabel(input.status),
  };
}

async function defaultCheckDbConnection() {
  await prisma.$queryRaw`SELECT 1`;
  return true;
}

async function defaultLoadPricingEntryCount() {
  return prisma.pricingEntry.count();
}

function resolveDatabaseItem(env: EnvSource) {
  const dbEnabled = String(env.ENABLE_DATABASE ?? '').trim().toLowerCase() === 'true';
  const databaseUrlPresent = hasValue(env.DATABASE_URL);

  if (!dbEnabled) {
    return {
      dbEnabled,
      dbConfigured: false,
      item: createItem({
        key: 'database',
        title: 'База данных',
        status: 'warning',
        summary: 'База данных отключена',
        details: 'Переменная ENABLE_DATABASE выключена. Сайт работает в режиме без базы и использует резервные данные там, где это возможно.',
      }),
    };
  }

  if (!databaseUrlPresent) {
    return {
      dbEnabled,
      dbConfigured: false,
      item: createItem({
        key: 'database',
        title: 'База данных',
        status: 'error',
        summary: 'Нет адреса подключения к базе',
        details: 'ENABLE_DATABASE включена, но DATABASE_URL не задан. Это критическая ошибка конфигурации.',
      }),
    };
  }

  return {
    dbEnabled,
    dbConfigured: true,
    item: null,
  };
}

function resolveBaseUrlItem(env: EnvSource) {
  const baseUrlConfigured = hasValue(env.PUBLIC_BASE_URL);
  const isProduction = String(env.NODE_ENV ?? '').trim() === 'production' || String(env.VERCEL_ENV ?? '').trim() === 'production';

  if (baseUrlConfigured) {
    return createItem({
      key: 'public_base_url',
      title: 'Публичный адрес сайта (PUBLIC_BASE_URL)',
      status: 'ok',
      summary: 'Публичный адрес настроен',
      details: 'Система использует явно заданный адрес сайта для писем, ссылок и уведомлений.',
    });
  }

  if (isProduction) {
    return createItem({
      key: 'public_base_url',
      title: 'Публичный адрес сайта (PUBLIC_BASE_URL)',
      status: 'error',
      summary: 'В продакшене отсутствует PUBLIC_BASE_URL',
      details: 'Для продакшена требуется явный публичный адрес. Без него ссылки в письмах и сервисных сценариях могут работать некорректно.',
    });
  }

  return createItem({
    key: 'public_base_url',
    title: 'Публичный адрес сайта (PUBLIC_BASE_URL)',
    status: 'warning',
    summary: 'Используется локальный адрес по умолчанию',
    details: 'PUBLIC_BASE_URL не задан, поэтому для непроизводственной среды подставляется локальный адрес http://localhost:3000.',
  });
}

function resolveSmtpItem(env: EnvSource) {
  const smtpKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'LEADS_TO_EMAIL', 'LEADS_FROM_EMAIL'] as const;
  const presentCount = smtpKeys.filter((key) => hasValue(env[key])).length;

  if (presentCount === smtpKeys.length) {
    return createItem({
      key: 'smtp',
      title: 'Email / SMTP',
      status: 'ok',
      summary: 'Email-уведомления настроены',
      details: 'Все обязательные SMTP-параметры присутствуют. Почтовые уведомления могут отправляться.',
    });
  }

  if (presentCount > 0) {
    return createItem({
      key: 'smtp',
      title: 'Email / SMTP',
      status: 'warning',
      summary: 'SMTP заполнен частично',
      details: 'Часть SMTP-параметров отсутствует. Проверьте хост, порт, логин, пароль и адреса отправителя/получателя.',
    });
  }

  return createItem({
    key: 'smtp',
    title: 'Email / SMTP',
    status: 'warning',
    summary: 'Email-уведомления не настроены',
    details: 'SMTP-параметры не заданы. Отправка писем отключена до заполнения конфигурации.',
  });
}

function resolveTelegramItem(env: EnvSource) {
  const hasToken = hasValue(env.TELEGRAM_BOT_TOKEN);
  const hasChat = hasValue(env.TELEGRAM_CHAT_ID);

  if (hasToken && hasChat) {
    return createItem({
      key: 'telegram',
      title: 'Telegram-уведомления',
      status: 'ok',
      summary: 'Telegram настроен',
      details: 'Бот и чат для уведомлений заданы. Сервис может отправлять сообщения в Telegram.',
    });
  }

  if (hasToken || hasChat) {
    return createItem({
      key: 'telegram',
      title: 'Telegram-уведомления',
      status: 'warning',
      summary: 'Telegram заполнен частично',
      details: 'Нужно указать и токен бота, и chat ID. Сейчас конфигурация неполная.',
    });
  }

  return createItem({
    key: 'telegram',
    title: 'Telegram-уведомления',
    status: 'warning',
    summary: 'Telegram не настроен',
    details: 'Параметры Telegram не заданы. Оповещения в Telegram не отправляются.',
  });
}

function resolveBlobItem(env: EnvSource) {
  const hasBlobToken = hasValue(env.BLOB_READ_WRITE_TOKEN) || hasValue(env.VERCEL_BLOB_READ_WRITE_TOKEN);

  if (hasBlobToken) {
    return createItem({
      key: 'blob',
      title: 'Загрузка файлов (Vercel Blob)',
      status: 'ok',
      summary: 'Хранилище загрузок настроено',
      details: 'Токен Vercel Blob задан. Загрузка клиентских файлов в облачное хранилище доступна.',
    });
  }

  return createItem({
    key: 'blob',
    title: 'Загрузка файлов (Vercel Blob)',
    status: 'warning',
    summary: 'Vercel Blob не настроен',
    details: 'Токен Vercel Blob отсутствует. Загрузка файлов может завершаться ошибкой.',
  });
}

function resolveAdminAuthItem(env: EnvSource) {
  const isProduction = String(env.NODE_ENV ?? '').trim() === 'production';
  const password = env.ADMIN_PASSWORD?.trim();
  const secret = env.ADMIN_SESSION_SECRET?.trim();

  const hasPassword = Boolean(password);
  const hasSecret = Boolean(secret);
  const isUnsafePassword = password === ADMIN_PASSWORD_FALLBACK;
  const isUnsafeSecret = secret === ADMIN_SESSION_SECRET_FALLBACK;

  if (hasPassword && hasSecret && !isUnsafePassword && !isUnsafeSecret) {
    return createItem({
      key: 'admin_auth',
      title: 'Безопасность входа в админку',
      status: 'ok',
      summary: 'Секрет и пароль админки заданы безопасно',
      details: 'Настройки авторизации админ-панели выглядят корректно для текущей среды.',
    });
  }

  if (isProduction) {
    return createItem({
      key: 'admin_auth',
      title: 'Безопасность входа в админку',
      status: 'error',
      summary: 'Небезопасная конфигурация админ-доступа',
      details: 'В продакшене должны быть заданы ADMIN_PASSWORD и ADMIN_SESSION_SECRET, отличные от значений по умолчанию.',
    });
  }

  return createItem({
    key: 'admin_auth',
    title: 'Безопасность входа в админку',
    status: 'warning',
    summary: 'Используются dev-настройки для входа',
    details: 'Для локальной среды это допустимо, но перед продакшен-деплоем обязательно задайте безопасные ADMIN_PASSWORD и ADMIN_SESSION_SECRET.',
  });
}

async function resolvePricingItem(options: {
  dbEnabled: boolean;
  dbConfigured: boolean;
  loadPricingEntryCount: () => Promise<number>;
}) {
  if (!options.dbEnabled || !options.dbConfigured) {
    return createItem({
      key: 'pricing_source',
      title: 'Источник прайс-конфигурации',
      status: 'warning',
      summary: 'Используются резервные/встроенные значения',
      details: 'База данных недоступна для чтения прайса, поэтому сервисы опираются на fallback/default конфигурации.',
    });
  }

  try {
    const totalEntries = await options.loadPricingEntryCount();

    if (totalEntries > 0) {
      return createItem({
        key: 'pricing_source',
        title: 'Источник прайс-конфигурации',
        status: 'ok',
        summary: 'Прайс доступен из БД/админки',
        details: 'В базе найдены записи прайса. Сайт может использовать актуальную конфигурацию из админ-панели.',
      });
    }

    return createItem({
      key: 'pricing_source',
      title: 'Источник прайс-конфигурации',
      status: 'warning',
      summary: 'Записей прайса в БД пока нет',
      details: 'Таблица прайса пуста. До заполнения будут применяться встроенные fallback/default значения.',
    });
  } catch {
    return createItem({
      key: 'pricing_source',
      title: 'Источник прайс-конфигурации',
      status: 'warning',
      summary: 'Не удалось проверить записи прайса в БД',
      details: 'Проверка прайса завершилась ошибкой. На уровне расчётов могут использоваться резервные значения.',
    });
  }
}

function resolveBaguetteCatalogItem(env: EnvSource) {
  const hasSheetId = hasValue(env.BAGET_SHEET_ID);
  const hasSheetTab = hasValue(env.BAGET_SHEET_TAB);

  if (hasSheetId && hasSheetTab) {
    return createItem({
      key: 'baguette_catalog',
      title: 'Каталог багета (Google Sheets)',
      status: 'ok',
      summary: 'Google Sheets-конфигурация задана',
      details: 'ID таблицы и вкладка указаны. Живая проверка таблицы в этом экране не выполняется, показывается только статус конфигурации.',
    });
  }

  return createItem({
    key: 'baguette_catalog',
    title: 'Каталог багета (Google Sheets)',
    status: 'warning',
    summary: 'Используются значения по умолчанию или fallback',
    details: 'Явные BAGET_SHEET_ID/BAGET_SHEET_TAB не заданы. В работе используются встроенные настройки и резервные данные при недоступности таблицы.',
  });
}

export async function getAdminSystemHealth(options: SystemHealthOptions = {}): Promise<SystemHealthSnapshot> {
  const env = options.env ?? process.env;
  const checkDbConnection = options.checkDbConnection ?? defaultCheckDbConnection;
  const loadPricingEntryCount = options.loadPricingEntryCount ?? defaultLoadPricingEntryCount;

  const databaseState = resolveDatabaseItem(env);
  const items: SystemHealthItem[] = [];

  if (databaseState.item) {
    items.push(databaseState.item);
  } else {
    try {
      await checkDbConnection();
      items.push(createItem({
        key: 'database',
        title: 'База данных',
        status: 'ok',
        summary: 'База данных подключена',
        details: 'Подключение к базе успешно проверено лёгким запросом.',
      }));
    } catch {
      items.push(createItem({
        key: 'database',
        title: 'База данных',
        status: 'error',
        summary: 'База данных не отвечает',
        details: 'Проверка подключения завершилась ошибкой. Проверьте доступность БД и параметры окружения.',
      }));
    }
  }

  items.push(resolveBaseUrlItem(env));
  items.push(resolveSmtpItem(env));
  items.push(resolveTelegramItem(env));
  items.push(resolveBlobItem(env));
  items.push(resolveAdminAuthItem(env));
  items.push(await resolvePricingItem({
    dbEnabled: databaseState.dbEnabled,
    dbConfigured: databaseState.dbConfigured,
    loadPricingEntryCount,
  }));
  items.push(resolveBaguetteCatalogItem(env));

  return {
    checkedAt: new Date().toISOString(),
    items,
  };
}
