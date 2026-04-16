import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Production: use Turso via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
  // Local dev: falls back to DATABASE_URL (file:./prisma/dev.db)
  const url =
    process.env.TURSO_DATABASE_URL ??
    process.env.DATABASE_URL ??
    "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const libsql = createClient({ url, authToken });
  const adapter = new PrismaLibSQL(libsql);

  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
