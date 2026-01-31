import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Twilio SMS Reply Webhook
 *
 * Handles inbound SMS messages from customers:
 * - Opt-out keywords: STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT
 * - Opt-in keywords: START, UNSTOP, YES
 * - All messages are logged for compliance
 *
 * Twilio sends form data (not JSON), so we parse URLSearchParams
 */

export async function POST(req: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await req.formData();

    const from = formData.get("From") as string; // Customer phone number
    const to = formData.get("To") as string; // Your Twilio number
    const body = (formData.get("Body") as string)?.trim().toUpperCase() || "";
    const messageSid = formData.get("MessageSid") as string;

    console.log("=ñ Inbound SMS:", { from, to, body, messageSid });

    // Find customer by phone number
    const customer = await db.customer.findFirst({
      where: {
        phone: from,
      },
      include: {
        organization: true,
      },
    });

    if (!customer) {
      console.warn("  Customer not found for phone:", from);

      // Return TwiML response (empty = no reply)
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`,
        {
          headers: {
            "Content-Type": "text/xml",
          },
        }
      );
    }

    // ============================================
    // OPT-OUT KEYWORDS (TCPA Compliant)
    // ============================================
    const OPT_OUT_KEYWORDS = [
      "STOP",
      "STOPALL",
      "UNSUBSCRIBE",
      "CANCEL",
      "END",
      "QUIT",
    ];

    if (OPT_OUT_KEYWORDS.includes(body)) {
      console.log("=Ñ Opt-out detected");

      // Update customer opt-out status
      await db.customer.update({
        where: { id: customer.id },
        data: {
          smsOptedOut: true,
          smsOptOutDate: new Date(),
        },
      });

      // Create audit log for compliance
      await db.auditLog.create({
        data: {
          organizationId: customer.organizationId,
          action: "sms_opt_out",
          entityType: "customer",
          entityId: customer.id,
          metadata: {
            phone: from,
            keyword: body,
            messageSid,
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Pause all active campaigns for this customer
      await db.campaignRecipient.updateMany({
        where: {
          customerId: customer.id,
          status: "active",
        },
        data: {
          status: "paused",
          pausedAt: new Date(),
          pauseReason: "sms_opt_out",
        },
      });

      console.log(" Customer opted out of SMS");

      // Return confirmation TwiML
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>You have been unsubscribed from ${customer.organization.businessName} SMS messages. Reply START to resubscribe.</Message>
</Response>`,
        {
          headers: {
            "Content-Type": "text/xml",
          },
        }
      );
    }

    // ============================================
    // OPT-IN KEYWORDS (Re-subscribe)
    // ============================================
    const OPT_IN_KEYWORDS = ["START", "UNSTOP", "YES"];

    if (OPT_IN_KEYWORDS.includes(body)) {
      console.log(" Opt-in detected");

      // Update customer opt-in status
      await db.customer.update({
        where: { id: customer.id },
        data: {
          smsOptedOut: false,
          smsOptOutDate: null,
        },
      });

      // Create audit log
      await db.auditLog.create({
        data: {
          organizationId: customer.organizationId,
          action: "sms_opt_in",
          entityType: "customer",
          entityId: customer.id,
          metadata: {
            phone: from,
            keyword: body,
            messageSid,
            timestamp: new Date().toISOString(),
          },
        },
      });

      console.log(" Customer opted back in to SMS");

      // Return confirmation TwiML
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>You have been resubscribed to ${customer.organization.businessName} SMS messages. Reply STOP to unsubscribe.</Message>
</Response>`,
        {
          headers: {
            "Content-Type": "text/xml",
          },
        }
      );
    }

    // ============================================
    // OTHER MESSAGES (Log for review)
    // ============================================
    console.log("=¬ General SMS reply - logging for review");

    // Create audit log for general messages
    await db.auditLog.create({
      data: {
        organizationId: customer.organizationId,
        action: "sms_inbound_message",
        entityType: "customer",
        entityId: customer.id,
        metadata: {
          phone: from,
          message: body,
          messageSid,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // No auto-reply for general messages (to avoid conversations)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );
  } catch (error) {
    console.error("L SMS webhook error:", error);

    // Return empty TwiML on error (don't expose errors to Twilio)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`,
      {
        headers: {
          "Content-Type": "text/xml",
        },
        status: 200, // Always return 200 to Twilio
      }
    );
  }
}
