'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Stats {
  totalOrders: number
  paidOrders: number
  totalRevenue: number
  stock: { [key: string]: number }
}

interface Order {
  id: string
  orderNo: string
  email: string
  amount: number
  cardType: string
  payStatus: number
  createdAt: string
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'cards' | 'orders'>('overview')

  // Cards import
  const [cardType, setCardType] = useState('1d')
  const [cardCodes, setCardCodes] = useState('')

  // Orders filter
  const [filterOrderNo, setFilterOrderNo] = useState('')

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken')
    if (savedToken) {
      setToken(savedToken)
      setIsLoggedIn(true)
      fetchData(savedToken)
    }
  }, [])

  const fetchData = async (authToken: string) => {
    try {
      const res = await fetch('/api/admin', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const data = await res.json()
      if (data.success) {
        setStats(data.data.stats)
        setOrders(data.data.recentOrders)
      } else {
        handleLogout()
      }
    } catch (error) {
      toast.error('獲取數據失敗')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('adminToken', data.data.token)
        setToken(data.data.token)
        setIsLoggedIn(true)
        fetchData(data.data.token)
        toast.success('登錄成功')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('登錄失敗')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken('')
    setIsLoggedIn(false)
    setStats(null)
    setOrders([])
  }

  const handleImportCards = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardCodes.trim()) {
      toast.error('請輸入卡密')
      return
    }

    const codes = cardCodes.split('\n').filter(c => c.trim())

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cardType, codes })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        setCardCodes('')
        fetchData(token)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('導入失敗')
    }
  }

  const confirmPayment = async (orderNo: string, method: string) => {
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo, method })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('支付已確認，卡密已發送')
        fetchData(token)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('確認失敗')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">管理員登錄</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入管理員密碼"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              登錄
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">管理後台</h1>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            退出登錄
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex space-x-4 mb-6">
          {(['overview', 'cards', 'orders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all
                ${activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {tab === 'overview' && '概覽'}
              {tab === 'cards' && '卡密管理'}
              {tab === 'orders' && '訂單管理'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm">總訂單</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm">已支付</p>
                <p className="text-3xl font-bold text-green-600">{stats.paidOrders}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm">總收入</p>
                <p className="text-3xl font-bold text-blue-600">HK${stats.totalRevenue}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm">總庫存</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Object.values(stats.stock).reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">庫存詳情</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.stock).map(([type, count]) => (
                  <div key={type} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-500 text-sm">{type} 庫存</p>
                    <p className={`text-2xl font-bold ${count < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                      {count}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">最近訂單</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">訂單號</th>
                      <th className="text-left py-2">郵箱</th>
                      <th className="text-left py-2">金額</th>
                      <th className="text-left py-2">狀態</th>
                      <th className="text-left py-2">時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-2 font-mono text-sm">{order.orderNo}</td>
                        <td className="py-2 text-sm">{order.email}</td>
                        <td className="py-2">HK${order.amount}</td>
                        <td className="py-2">
                          <span className={`
                            px-2 py-1 rounded text-xs
                            ${order.payStatus === 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                          `}>
                            {order.payStatus === 1 ? '已支付' : '未支付'}
                          </span>
                        </td>
                        <td className="py-2 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">導入卡密</h3>
            <form onSubmit={handleImportCards} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">卡密類型</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="1d">1天</option>
                  <option value="7d">7天</option>
                  <option value="30d">30天</option>
                  <option value="365d">365天</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  卡密列表（每行一個）
                </label>
                <textarea
                  value={cardCodes}
                  onChange={(e) => setCardCodes(e.target.value)}
                  rows={10}
                  placeholder="XXXX-XXXX-XXXX-XXXX&#10;XXXX-XXXX-XXXX-XXXX"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
              >
                導入卡密
              </button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">手動確認支付</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={filterOrderNo}
                onChange={(e) => setFilterOrderNo(e.target.value)}
                placeholder="輸入訂單號"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex space-x-2">
                {['alipayhk', 'wechatpay', 'fps', 'payme'].map((method) => (
                  <button
                    key={method}
                    onClick={() => confirmPayment(filterOrderNo, method)}
                    disabled={!filterOrderNo}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition-all"
                  >
                    確認{method}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                輸入訂單號後點擊對應支付方式確認收款並自動發卡
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
