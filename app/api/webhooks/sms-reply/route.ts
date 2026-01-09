import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// List of opt-out keywords per TCPA requirements
const OPT_OUT_KEYWORDS = [
  "STOP",
  "STOPALL",
  "UNSUBSCRIBE",
  "CANCEL",
  "END",
  "QUIT",
  "STOP ALL",
  "OPT OUT",
  "OPTOUT",
  "REMOVE",
];

/**
 * Webhook endpoint to handle incoming SMS replies from Twilio
 * Processes opt-out requests automatically
 */
export async function POST(req: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await req.formData();
    const from = formData.get("From") as string; // Customer phone number
    const body = formData.get("Body") as string; // Message content
    const twilioSid = formData.get("MessageSid") as string;

    if (!from || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize phone number (remove +1, spaces, dashes, etc.)
    const normalizedPhone = from.replace(/[^\d]/g, "").slice(-10);

    // Check if message is an opt-out request
    const messageUpper = body.trim().toUpperCase();
    const isOptOut = OPT_OUT_KEYWORDS.some(keyword =>
      messageUpper === keyword || messageUpper.includes(keyword)
    );

    // Find customer by phone number
    const customer = await db.customer.findFirst({
      where: {
        phone: {
          contains: normalizedPhone,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!customer) {
      console.log(`Customer not found for phone: ${from}`);
      // Still return 200 to Twilio
      return NextResponse.json({
        success: true,
        message: "Customer not found"
      });
    }

    // Process opt-out
    if (isOptOut) {
      await db.customer.update({
        where: { id: customer.id },
        data: {
          smsOptedOut: true,
          smsOptedOutAt: new Date(),
        },
      });

      // Create audit log entry
      await db.auditLog.create({
        data: {
          organizationId: customer.organizationId,
          userId: null, // Automated action
          action: "customer.opt_out",
          entityType: "Customer",
          entityId: customer.id,
          metadata: {
            action: "SMS Opt-Out",
            method: "Inbound SMS Reply",
            keyword: body.trim(),
            phone: from,
          },
        },
      });

      console.log(`Customer ${customer.id} opted out via SMS keyword: ${body}`);

      // Send confirmation message back to customer (required by TCPA)
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>You have been successfully unsubscribed from ${customer.organization?.businessName || 'our'} messages. You will not receive any more texts. Reply START to resubscribe.</Message>
</Response>`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/xml",
          },
        }
      );
    }

    // Log the incoming message
    await db.message.create({
      data: {
        organizationId: customer.organizationId,
        customerId: customer.id,
        channel: "sms",
        direction: "inbound",
        body,
        status: "delivered",
        twilioSid,
        sentAt: new Date(),
        deliveredAt: new Date(),
        isAutomated: false,
      },
    });

    // Return success to Twilio
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing SMS webhook:", error);
    // Return 200 to prevent Twilio retries
    return NextResponse.json({
      success: false,
      error: "Internal error"
    }, { status: 200 });
  }
}
