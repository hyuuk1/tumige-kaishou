import { PrismaClient } from "@prisma/client";

// グローバル変数にPrismaを保持させる（ホットリロード対策）
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // デバッグ用クエリログ出力
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
