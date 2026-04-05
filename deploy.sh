#!/bin/bash

echo "🚀 開始部署 Auto Card System..."

# 檢查環境變數
if [ -z "$DATABASE_URL" ]; then
    echo "❌ 錯誤：未設置 DATABASE_URL"
    exit 1
fi

echo "📦 安裝依賴..."
npm install

echo "🔄 生成 Prisma Client..."
npx prisma generate

echo "🗄️  執行數據庫遷移..."
npx prisma migrate deploy

echo "🌱 初始化數據..."
npx prisma db seed || echo "數據已存在，跳過初始化"

echo "✅ 部署完成！"
echo ""
echo "請確保已在 Vercel 設置以下環境變數："
echo "- DATABASE_URL"
echo "- RESEND_API_KEY"
echo "- FROM_EMAIL"
echo "- ADMIN_PASSWORD"
echo "- JWT_SECRET"
echo "- ALIPAYHK_QR (可選)"
echo "- WECHATPAY_QR (可選)"
echo "- FPS_QR (可選)"
echo "- PAYME_QR (可選)"
echo "- FPS_ID (可選)"
