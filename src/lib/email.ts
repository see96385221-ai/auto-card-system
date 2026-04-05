import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCardEmail(to: string, orderNo: string, cardCode: string, duration: number) {
  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || 'Auto Card <noreply@autocard.hk>',
    to: [to],
    subject: `您的卡密已送達 - 訂單 ${orderNo}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3b82f6;">🎉 感謝您的購買！</h2>
        <p>您的訂單 <strong>${orderNo}</strong> 已確認付款。</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">卡密信息</h3>
          <p style="font-size: 18px; font-weight: bold; color: #3b82f6; word-break: break-all;">
            ${cardCode}
          </p>
          <p style="color: #6b7280; margin-bottom: 0;">有效期：${duration} 天</p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          請妥善保存您的卡密，如有問題請聯繫客服。
        </p>
      </div>
    `
  })

  if (error) {
    console.error('發送郵件失敗:', error)
    throw error
  }

  return data
}

export async function sendPaymentReminder(to: string, orderNo: string, amount: number) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'Auto Card <noreply@autocard.hk>',
    to: [to],
    subject: `待付款訂單提醒 - ${orderNo}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>⏰ 訂單待付款</h2>
        <p>您有一筆訂單等待付款：</p>
        <ul>
          <li>訂單號：${orderNo}</li>
          <li>金額：HK$ ${amount}</li>
        </ul>
        <p>請盡快完成付款，訂單將在 30 分鐘後過期。</p>
      </div>
    `
  })
}
