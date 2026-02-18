import type { PrismaClient } from '@prisma/client';

type GlobalPrisma = {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

export function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient: PrismaClientCtor } = require('@prisma/client') as { PrismaClient: new () => PrismaClient };
  const prisma = new PrismaClientCtor();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
