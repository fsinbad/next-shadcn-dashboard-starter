import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const DB_PATH = process.env.DATABASE_URL || './data/app.db';

const adapter = new PrismaLibSql({
  url: `file:${DB_PATH}`
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export function generateId(): string {
  return randomUUID();
}
