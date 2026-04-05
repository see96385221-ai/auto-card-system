'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  duration: number
  price: number
  cardType: string
  stock: number
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      toast.error('獲取產品失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProduct) {
      toast.error('請選擇套餐')
      return
    }

    if (!email) {
      toast.error('請填寫郵箱')
      return
    }

    const product = products.find(p => p.id === selectedProduct)
    if (!product || product.stock === 0) {
      toast.error('該套餐暫時缺貨')
      return
    }

    // 創建訂單
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct, email })
      })

      const data = await res.json()
      if (data.success) {
        router.push(`/pay?orderNo=${data.data.orderNo}`)
      } else {
        toast.error(data.message || '創建訂單失敗')
      }
    } catch (error) {
      toast.error('網絡錯誤')
    }
  }

  const getDurationText = (days: number) => {
    if (days === 1) return '1天'
    if (days === 7) return '7天'
    if (days === 30) return '30天'
    if (days === 365) return '365天'
    return `${days}天`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎫 自動發卡系統</h1>
          <p className="text-gray-600">選擇適合您的套餐，即買即用</p>
        </div>

        {/* Product Selection */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`
                  relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200
                  ${selectedProduct === product.id 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }
                  ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {selectedProduct === product.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{getDurationText(product.duration)}</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-2">HK${product.price}</p>
                  <p className={`text-sm ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `庫存: ${product.stock}` : '暫時缺貨'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Email Input */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              接收卡密的郵箱地址
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
            <p className="mt-2 text-sm text-gray-500">卡密將同時顯示在頁面並發送至此郵箱</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            立即購買
          </button>
        </form>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-gray-900 mb-2">即時發卡</h3>
            <p className="text-gray-600 text-sm">付款成功後自動發送卡密</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold text-gray-900 mb-2">安全可靠</h3>
            <p className="text-gray-600 text-sm">支持多種香港本地支付方式</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="font-bold text-gray-900 mb-2">郵件備份</h3>
            <p className="text-gray-600 text-sm">卡密同時發送到您的郵箱</p>
          </div>
        </div>
      </div>
    </main>
  )
}
