import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

export const twilioClient = accountSid && authToken
  ? twilio(accountSid, authToken)
  : null

export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || ''

// TCPA Compliance helpers
export const QUIET_HOURS_START = 21 // 9 PM
export const QUIET_HOURS_END = 8   // 8 AM

export function isWithinQuietHours(timezone: string): boolean {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  })

  const hour = parseInt(formatter.format(now))
  return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END
}

export async function sendSMS(params: {
  to: string
  body: string
  from?: string
}) {
  if (!twilioClient) {
    throw new Error('Twilio client not configured')
  }

  return await twilioClient.messages.create({
    to: params.to,
    from: params.from || TWILIO_PHONE_NUMBER,
    body: params.body,
  })
}
