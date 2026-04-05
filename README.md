# Auto Card System - 個人自動發卡系統

基於 Next.js + Vercel + PostgreSQL 的個人自動發卡系統，支持香港本地支付方式。

## 功能特點

- ✅ 4種時長套餐（1天/7天/30天/365天）
- ✅ 支持 AlipayHK / WeChat Pay HK / 轉數快 FPS / PayMe
- ✅ 自動發卡 + 郵件通知
- ✅ 庫存管理 + 防重複發卡
- ✅ 管理後台（庫存查看、卡密導入、訂單管理）
- ✅ 完全免費部署（Vercel + Vercel Postgres）

## 快速開始

### 1. 環境準備

- [GitHub](https://github.com) 帳號
- [Vercel](https://vercel.com) 帳號（使用 GitHub 登錄）
- [Resend](https://resend.com) 帳號（用於發送郵件）

### 2. 部署步驟

#### 步驟 1：創建 GitHub 倉庫

1. 在 GitHub 創建新倉庫（例如 `auto-card-system`）
2. 將本項目代碼上傳到倉庫

#### 步驟 2：設置 Vercel Postgres

1. 在 Vercel Dashboard 中，進入 Storage 標籤
2. 點擊 "Create Database" 選擇 "Postgres"
3. 選擇 Region（建議選香港或新加坡）
4. 創建後，複製 Database URL

#### 步驟 3：部署到 Vercel

1. 在 Vercel Dashboard 點擊 "Add New Project"
2. 導入你的 GitHub 倉庫
3. 在 Environment Variables 中添加：
   - `DATABASE_URL`：你的 Vercel Postgres URL
   - `RESEND_API_KEY`：從 Resend 獲取
   - `FROM_EMAIL`：你的發件郵箱（需要在 Resend 驗證）
   - `ADMIN_PASSWORD`：管理員密碼
   - `JWT_SECRET`：隨機字符串（用於 JWT 簽名）
   - `ALIPAYHK_QR`：AlipayHK 收款碼圖片 URL
   - `WECHATPAY_QR`：WeChat Pay 收款碼圖片 URL
   - `FPS_QR`：FPS 收款碼圖片 URL
   - `PAYME_QR`：PayMe 收款碼圖片 URL
   - `FPS_ID`：你的 FPS ID

4. 點擊 Deploy

#### 步驟 4：初始化數據庫

在本地終端運行：

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

或在 Vercel 的 Console 中運行：

```bash
npx prisma migrate deploy
```

### 3. 配置支付方式

1. 上傳你的收款二維碼到圖床（如 Imgur、Cloudinary）
2. 將圖片 URL 填入對應的環境變數
3. 重新部署

### 4. 導入卡密

1. 訪問 `https://your-app.vercel.app/admin`
2. 使用管理員密碼登錄
3. 進入「卡密管理」標籤
4. 選擇卡密類型，貼入卡密（每行一個）
5. 點擊導入

## 使用流程

### 用戶購買流程

1. 用戶訪問首頁，選擇套餐
2. 填寫郵箱，點擊購買
3. 系統生成訂單號，顯示收款二維碼
4. 用戶掃碼付款，**務必填寫訂單號在備註**
5. 管理員在後台確認收款（或設置自動輪詢）
6. 系統自動發卡，頁面顯示卡密，郵件同時發送

### 管理員確認支付

1. 登錄管理後台
2. 進入「訂單管理」標籤
3. 輸入訂單號
4. 點擊對應支付方式確認
5. 系統自動發卡並發送郵件

## 項目結構

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API 路由
│   │   ├── admin/        # 管理後台
│   │   ├── pay/          # 支付頁面
│   │   ├── page.tsx      # 首頁
│   │   └── layout.tsx    # 根佈局
│   ├── components/       # React 組件
│   ├── lib/              # 工具函數
│   │   ├── db.ts         # 數據庫操作
│   │   ├── email.ts      # 郵件發送
│   │   └── auth.ts       # 認證相關
│   └── types/            # TypeScript 類型
├── prisma/
│   └── schema.prisma     # 數據庫模型
├── public/               # 靜態資源
└── package.json
```

## 環境變數說明

| 變數名 | 說明 | 必需 |
|--------|------|------|
| DATABASE_URL | PostgreSQL 連接字符串 | ✅ |
| RESEND_API_KEY | Resend API 密鑰 | ✅ |
| FROM_EMAIL | 發件人郵箱 | ✅ |
| ADMIN_PASSWORD | 管理員密碼 | ✅ |
| JWT_SECRET | JWT 簽名密鑰 | ✅ |
| ALIPAYHK_QR | AlipayHK 收款碼 URL | ❌ |
| WECHATPAY_QR | WeChat Pay 收款碼 URL | ❌ |
| FPS_QR | FPS 收款碼 URL | ❌ |
| PAYME_QR | PayMe 收款碼 URL | ❌ |
| FPS_ID | FPS ID | ❌ |

## 注意事項

1. **個人支付限制**：由於使用個人收款碼，無法自動確認支付，需要管理員手動確認或設置輪詢
2. **安全建議**：
   - 使用強密碼作為 ADMIN_PASSWORD
   - 定期更換 JWT_SECRET
   - 啟用 Resend 的域名驗證
3. **免費額度**：
   - Vercel：每月 100GB 帶寬
   - Vercel Postgres：每月 10萬行數據
   - Resend：每日 100 封郵件

## 自定義開發

### 添加新套餐

修改 `prisma/init.sql` 添加產品數據，然後重新部署。

### 修改郵件模板

編輯 `src/lib/email.ts` 中的郵件內容。

### 自定義樣式

修改 `tailwind.config.js` 和組件中的 className。

## 技術支持

如有問題，請檢查：
1. Vercel Functions Log 查看錯誤
2. 確認所有環境變數已正確設置
3. 確認數據庫遷移已成功執行

## License

MIT License - 個人使用免費
