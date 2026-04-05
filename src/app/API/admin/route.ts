import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminPassword, createToken, verifyToken } from '@/lib/auth'

// 登錄
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, message: '密碼錯誤' },
        { status: 401 }
      )
    }

    const token = await createToken({ role: 'admin' })

    return NextResponse.json({
      success: true,
      data: { token }
    })
  } catch (error) {
    console.error('登錄失敗:', error)
    return NextResponse.json(
      { success: false, message: '登錄失敗' },
      { status: 500 }
    )
  }
}

// 獲取統計數據
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json(
        { success: false, message: '未授權' },
        { status: 401 }
      )
    }

    // 獲取統計
    const totalOrders = await prisma.order.count()
    const paidOrders = await prisma.order.count({ where: { payStatus: 1 } })
    const totalRevenue = await prisma.order.aggregate({
      where: { payStatus: 1 },
      _sum: { amount: true }
    })

    // 獲取各類型庫存
    const stock1d = await prisma.card.count({ where: { cardType: '1d', status: 0 } })
    const stock7d = await prisma.card.count({ where: { cardType: '7d', status: 0 } })
    const stock30d = await prisma.card.count({ where: { cardType: '30d', status: 0 } })
    const stock365d = await prisma.card.count({ where: { cardType: '365d', status: 0 } })

    // 獲取最近訂單
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { product: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          paidOrders,
          totalRevenue: Number(totalRevenue._sum.amount || 0),
          stock: { '1d': stock1d, '7d': stock7d, '30d': stock30d, '365d': stock365d }
        },
        recentOrders: recentOrders.map(o => ({
          ...o,
          amount: Number(o.amount)
        }))
      }
    })
  } catch (error) {
    console.error('獲取統計失敗:', error)
    return NextResponse.json(
      { success: false, message: '獲取統計失敗' },
      { status: 500 }
    )
  }
}
