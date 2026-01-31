import { isWithinQuietHours, calculateScheduledSendTime } from "./quiet-hours";

// Lazy-load the Twilio client to avoid initialization during build
let _twilioClient: any = null;

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }
  if (!_twilioClient) {
    // Dynamic import to prevent initialization during build
    const twilio = require("twilio");
    _twilioClient = twilio(accountSid, authToken);
  }
  return _twilioClient;
}

export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";
export const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID || "";

export interface SendSMSParams {
  to: string;
  body: string;
  from?: string;
  timezone?: string; // Customer timezone for quiet hours
  respectQuietHours?: boolean; // Default true
}

export interface SendSMSResult {
  messageSid?: string;
  scheduled?: boolean;
  scheduledFor?: Date;
  error?: string;
}

/**
 * Send SMS with quiet hours enforcement (TCPA compliant)
 *
 * If sent during quiet hours (before 8 AM or after 9 PM):
 * - Returns scheduled time for next morning 8 AM
 * - Caller should queue the message for later delivery
 */
export async function sendSMS(params: SendSMSParams): Promise<SendSMSResult> {
  const client = getTwilioClient();
  if (!client) {
    throw new Error("Twilio client not configured");
  }

  const {
    to,
    body,
    from = TWILIO_PHONE_NUMBER,
    timezone = "America/New_York",
    respectQuietHours = true,
  } = params;

  // Check quiet hours if enforcement is enabled
  if (respectQuietHours) {
    const quietHoursCheck = isWithinQuietHours(timezone);

    if (!quietHoursCheck.canSendNow) {
      console.log(`⏰ SMS blocked by quiet hours: ${quietHoursCheck.reason}`);
      return {
        scheduled: true,
        scheduledFor: quietHoursCheck.nextAvailableTime,
      };
    }
  }

  // Send immediately - within allowed hours
  try {
    const messageParams: any = {
      to,
      body,
    };

    // Use Messaging Service SID if available, otherwise use from number
    if (TWILIO_MESSAGING_SERVICE_SID) {
      messageParams.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
    } else {
      messageParams.from = from;
    }

    const message = await client.messages.create(messageParams);

    return {
      messageSid: message.sid,
      scheduled: false,
    };
  } catch (error) {
    console.error("Twilio SMS error:", error);
    throw error;
  }
}
