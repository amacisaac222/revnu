// Email service (Resend or SendGrid)
// Using fetch for Resend - simple and no extra dependencies

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@revenupros.com'

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  if (!RESEND_API_KEY) {
    throw new Error('Resend API key not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: params.from || RESEND_FROM_EMAIL,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send email: ${error}`)
  }

  return await response.json()
}
