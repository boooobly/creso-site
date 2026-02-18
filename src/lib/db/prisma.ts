type GlobalPrisma = {
  prisma?: any;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

export function getPrismaClient(): any {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('@prisma/client') as { PrismaClient: new () => any };
  const prisma = new PrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
