import { NextRequest, NextResponse } from 'next/server'
import { prisma, encryptCard } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json(
        { success: false, message: '未授權' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const cardType = searchParams.get('type')
    const status = searchParams.get('status')

    const where: any = {}
    if (cardType) where.cardType = cardType
    if (status !== null) where.status = parseInt(status)

    const cards = await prisma.card.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ success: true, data: cards })
  } catch (error) {
    console.error('獲取卡密失敗:', error)
    return NextResponse.json(
      { success: false, message: '獲取卡密失敗' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json(
        { success: false, message: '未授權' },
        { status: 401 }
      )
    }

    const { cardType, codes } = await req.json()

    if (!cardType || !codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json(
        { success: false, message: '缺少必要參數' },
        { status: 400 }
      )
    }

    const validTypes = ['1d', '7d', '30d', '365d']
    if (!validTypes.includes(cardType)) {
      return NextResponse.json(
        { success: false, message: '無效的卡類型' },
        { status: 400 }
      )
    }

    const uniqueCodes = Array.from(new Set(codes.map(c => c.trim()).filter(c => c)))
    
    const encryptedCodes = uniqueCodes.map(code => ({
      cardCode: encryptCard(code),
      cardType,
      status: 0
    }))

    const result = await prisma.card.createMany({
      data: encryptedCodes,
      skipDuplicates: true
    })

    await prisma.adminLog.create({
      data: {
        action: 'import_cards',
        details: `導入 ${result.count} 張 ${cardType} 卡密`,
        ip: req.headers.get('x-forwarded-for') || ''
      }
    })

    return NextResponse.json({
      success: true,
      message: `成功導入 ${result.count} 張卡密`,
      data: { count: result.count }
    })
  } catch (error) {
    console.error('導入卡密失敗:', error)
    return NextResponse.json(
      { success: false, message: '導入卡密失敗' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json(
        { success: false, message: '未授權' },
        { status: 401 }
      )
    }

    const { id } = await req.json()

    await prisma.card.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '刪除成功'
    })
  } catch (error) {
    console.error('刪除卡密失敗:', error)
    return NextResponse.json(
      { success: false, message: '刪除卡密失敗' },
      { status: 500 }
    )
  }
}
