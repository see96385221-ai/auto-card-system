import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { duration: 'asc' }
    })

    const productsWithStock = await Promise.all(
      products.map(async (p) => ({
        ...p,
        price: Number(p.price),
        stock: await prisma.card.count({
          where: { cardType: p.cardType, status: 0 }
        })
      }))
    )

    return NextResponse.json({ success: true, data: productsWithStock })
  } catch (error) {
    console.error('獲取產品失敗:', error)
    return NextResponse.json(
      { success: false, message: '獲取產品失敗' },
      { status: 500 }
    )
  }
}
