import { NextRequest, NextResponse } from 'next/server'
import { prisma, generateOrderNo, getAvailableCard, decryptCard } from '@/lib/db'
import { sendCardEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { productId, email } = await req.json()

    if (!productId || !email) {
      return NextResponse.json(
        { success: false, message: '缺少必要參數' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '郵箱格式不正確' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, message: '產品不存在或已下架' },
        { status: 404 }
      )
    }

    const availableCard = await getAvailableCard(product.cardType)
    if (!availableCard) {
      return NextResponse.json(
        { success: false, message: '該套餐暫時缺貨，請聯繫客服' },
        { status: 400 }
      )
    }

    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        email,
        productId: product.id,
        amount: product.price,
        cardType: product.cardType,
        payStatus: 0
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNo: order.orderNo,
        amount: Number(order.amount),
        cardType: order.cardType,
        duration: product.duration
      }
    })
  } catch (error) {
    console.error('創建訂單失敗:', error)
    return NextResponse.json(
      { success: false, message: '創建訂單失敗' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderNo = searchParams.get('orderNo')

    if (!orderNo) {
      return NextResponse.json(
        { success: false, message: '缺少訂單號' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: { product: true, card: true }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: '訂單不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        orderNo: order.orderNo,
        payStatus: order.payStatus,
        amount: Number(order.amount),
        cardType: order.cardType,
        duration: order.product?.duration,
        cardCode: order.card ? decryptCard(order.card.cardCode) : null,
        paidAt: order.paidAt,
        createdAt: order.createdAt
      }
    })
  } catch (error) {
    console.error('查詢訂單失敗:', error)
    return NextResponse.json(
      { success: false, message: '查詢訂單失敗' },
      { status: 500 }
    )
  }
}
