export interface Product {
  id: string
  name: string
  duration: number
  price: number
  cardType: string
  isActive: boolean
}

export interface Card {
  id: string
  cardCode: string
  cardType: string
  status: number
  createdAt: string
}

export interface Order {
  id: string
  orderNo: string
  email: string
  productId: string
  amount: number
  cardType: string
  payMethod: string | null
  payStatus: number
  cardId: string | null
  paidAt: string | null
  createdAt: string
  product?: Product
  card?: Card
}

export interface PaymentMethod {
  id: string
  name: string
  icon: string
  qrCode: string
  instructions: string
}

export type CardType = '1d' | '7d' | '30d' | '365d'
