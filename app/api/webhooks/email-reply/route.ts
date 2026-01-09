import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Email opt-out keywords
const OPT_OUT_KEYWORDS = [
  "UNSUBSCRIBE",
  "STOP",
  "REMOVE",
  "OPT OUT",
  "OPTOUT",
  "CANCEL",
  "DELETE",
];

/**
 * Webhook endpoint to handle incoming email replies
 * Processes opt-out requests automatically
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, subject, text, html } = body;

    if (!from) {
      return NextResponse.json(
        { error: "Missing sender email" },
        { status: 400 }
      );
    }

    // Extract email address
    const emailMatch = from.match(/<(.+)>/) || [null, from];
    const email = emailMatch[1].toLowerCase();

    // Check if message is an opt-out request
    const messageText = (text || html || subject || "").toUpperCase();
    const isOptOut = OPT_OUT_KEYWORDS.some(keyword =>
      messageText.includes(keyword)
    );

    // Find customer by email
    const customer = await db.customer.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!customer) {
      console.log(`Customer not found for email: ${email}`);
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
          emailOptedOut: true,
          emailOptedOutAt: new Date(),
        },
      });

      // Create audit log entry
      await db.auditLog.create({
        data: {
          organizationId: customer.organizationId,
          userId: null, // Automated action
          action: "customer.email_opt_out",
          entityType: "Customer",
          entityId: customer.id,
          changes: {
            action: "Email Opt-Out",
            method: "Inbound Email Reply",
            subject: subject || "",
            email: from,
          },
        },
      });

      console.log(`Customer ${customer.id} opted out of email: ${email}`);

      // You would typically send a confirmation email here using your email service
    }

    // Log the incoming message
    await db.message.create({
      data: {
        organizationId: customer.organizationId,
        customerId: customer.id,
        channel: "email",
        direction: "inbound",
        subject: subject || "",
        body: text || html || "",
        status: "delivered",
        sentAt: new Date(),
        deliveredAt: new Date(),
        isAutomated: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing email webhook:", error);
    return NextResponse.json({
      success: false,
      error: "Internal error"
    }, { status: 200 });
  }
}
