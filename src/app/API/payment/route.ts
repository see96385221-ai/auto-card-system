import { NextRequest, NextResponse } from 'next/server'
import { prisma, decryptCard } from '@/lib/db'
import { sendCardEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { orderNo, method } = await req.json()

    if (!orderNo || !method) {
      return NextResponse.json(
        { success: false, message: '缺少必要參數' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: { product: true }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: '訂單不存在' },
        { status: 404 }
      )
    }

    if (order.payStatus === 1) {
      return NextResponse.json(
        { success: false, message: '訂單已支付' },
        { status: 400 }
      )
    }

    const card = await prisma.card.findFirst({
      where: { cardType: order.cardType, status: 0 },
      orderBy: { createdAt: 'asc' }
    })

    if (!card) {
      return NextResponse.json(
        { success: false, message: '卡密庫存不足' },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          payStatus: 1,
          payMethod: method,
          cardId: card.id,
          paidAt: new Date()
        }
      }),
      prisma.card.update({
        where: { id: card.id },
        data: {
          status: 1,
          usedAt: new Date()
        }
      }),
      prisma.payLog.create({
        data: {
          orderNo: order.orderNo,
          amount: order.amount,
          method,
          verified: true,
          verifiedAt: new Date()
        }
      })
    ])

    try {
      await sendCardEmail(
        order.email,
        order.orderNo,
        decryptCard(card.cardCode),
        order.product?.duration || 0
      )
    } catch (emailError) {
      console.error('發送郵件失敗:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: '支付確認成功，卡密已發送',
      data: {
        orderNo: order.orderNo,
        cardCode: decryptCard(card.cardCode),
        email: order.email
      }
    })
  } catch (error) {
    console.error('確認支付失敗:', error)
    return NextResponse.json(
      { success: false, message: '確認支付失敗' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const methods = [
    {
      id: 'alipayhk',
      name: 'AlipayHK',
      icon: '/icons/alipayhk.png',
      qrCode: process.env.ALIPAYHK_QR || '',
      instructions: '打開 AlipayHK 掃描二維碼付款，請務必在備註填寫訂單號'
    },
    {
      id: 'wechatpay',
      name: 'WeChat Pay HK',
      icon: '/icons/wechatpay.png',
      qrCode: process.env.WECHATPAY_QR || '',
      instructions: '打開 WeChat Pay 掃描二維碼付款，請務必在備註填寫訂單號'
    },
    {
      id: 'fps',
      name: '轉數快 FPS',
      icon: '/icons/fps.png',
      qrCode: process.env.FPS_QR || '',
      instructions: `使用任何銀行 App 掃描 FPS 二維碼，FPS ID: ${process.env.FPS_ID || ''}`
    },
    {
      id: 'payme',
      name: 'PayMe',
      icon: '/icons/payme.png',
      qrCode: process.env.PAYME_QR || '',
      instructions: '打開 PayMe App 掃描付款，或點擊連結付款'
    }
  ]

  return NextResponse.json({ success: true, data: methods })
}
