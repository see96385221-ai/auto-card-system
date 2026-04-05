import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 加密卡密（簡單的 Base64 + 混淆）
export function encryptCard(code: string): string {
  return Buffer.from(code).toString('base64')
}

export function decryptCard(encrypted: string): string {
  return Buffer.from(encrypted, 'base64').toString('utf-8')
}

// 生成訂單號
export function generateOrderNo(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `CARD${dateStr}${random}`
}

// 獲取庫存數量
export async function getStockCount(cardType: string): Promise<number> {
  return await prisma.card.count({
    where: { cardType, status: 0 }
  })
}

// 獲取可用卡密
export async function getAvailableCard(cardType: string) {
  return await prisma.card.findFirst({
    where: { cardType, status: 0 },
    orderBy: { createdAt: 'asc' }
  })
}
