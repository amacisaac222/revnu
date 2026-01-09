import { db } from "@/lib/db";
import { validateMessageSend } from "@/lib/tcpa-compliance";
import { SubscriptionService } from "@/lib/subscription-service";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    const { channel } = await req.json();

    if (!channel || !["sms", "email"].includes(channel)) {
      return NextResponse.json(
        { error: "Invalid channel. Must be 'sms' or 'email'" },
        { status: 400 }
      );
    }

    // Get current user and organization
    const user = await currentUser();
    const dbUser = await db.user.findUnique({
      where: { email: user?.emailAddresses[0]?.emailAddress },
      include: { organization: true },
    });

    if (!dbUser?.organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get invoice with customer data
    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId: dbUser.organization.id,
      },
      include: {
        customer: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Count recent messages (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMessageCount = await db.message.count({
      where: {
        customerId: invoice.customer.id,
        channel,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Check subscription credits FIRST
    const creditsCheck = await SubscriptionService.canSendMessage(
      dbUser.organization.id,
      channel as "sms" | "email"
    );

    if (!creditsCheck.allowed) {
      return NextResponse.json(
        {
          error: creditsCheck.reason || "Credit limit reached",
          upgradeRequired: true,
        },
        { status: 402 } // Payment Required
      );
    }

    // TCPA Compliance Check
    const complianceCheck = await validateMessageSend({
      channel: channel as "sms" | "email",
      customer: {
        id: invoice.customer.id,
        timezone: invoice.customer.state || null, // You'd map state to timezone
        smsConsentGiven: invoice.customer.smsConsentGiven,
        smsOptedOut: invoice.customer.smsOptedOut,
        emailConsentGiven: invoice.customer.emailConsentGiven,
        emailOptedOut: invoice.customer.emailOptedOut,
      },
      recentMessageCount,
    });

    // Block if compliance check fails
    if (!complianceCheck.allowed) {
      return NextResponse.json(
        {
          error: "Cannot send message due to TCPA compliance violations",
          blockers: complianceCheck.blockers,
          warnings: complianceCheck.warnings,
        },
        { status: 403 }
      );
    }

    // Generate message content
    const businessName = dbUser.organization.businessName || "your provider";
    const customerName = `${invoice.customer.firstName} ${invoice.customer.lastName}`;
    const amount = (invoice.amountRemaining / 100).toFixed(2);
    const paymentLink = `https://pay.revnu.com/${invoice.id}`; // Placeholder

    const messageBody =
      channel === "sms"
        ? `Hi ${invoice.customer.firstName}, this is ${businessName}. Invoice #${invoice.invoiceNumber} for $${amount} is now ${invoice.daysPastDue} days past due. Pay online: ${paymentLink} Reply STOP to opt out.`
        : `Dear ${customerName},\n\nThis is a friendly reminder that invoice #${invoice.invoiceNumber} for $${amount} is now ${invoice.daysPastDue} days past due.\n\nPlease submit payment at your earliest convenience: ${paymentLink}\n\nThank you,\n${businessName}`;

    // Create message record
    const message = await db.message.create({
      data: {
        organizationId: dbUser.organization.id,
        customerId: invoice.customer.id,
        invoiceId: invoice.id,
        channel,
        direction: "outbound",
        subject:
          channel === "email"
            ? `Payment Reminder - Invoice #${invoice.invoiceNumber}`
            : undefined,
        body: messageBody,
        status: "queued",
        isAutomated: false,
        sentFromNumber:
          channel === "sms" ? dbUser.organization.phone : undefined,
        sentFromEmail:
          channel === "email" ? dbUser.organization.email : undefined,
      },
    });

    // Update invoice contact tracking
    await db.invoice.update({
      where: { id: invoice.id },
      data: {
        contactAttempts: invoice.contactAttempts + 1,
        lastContactedAt: new Date(),
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        organizationId: dbUser.organization.id,
        userId: dbUser.id,
        action: "message.sent",
        entityType: "Message",
        entityId: message.id,
        changes: {
          channel,
          invoiceId,
          customerId: invoice.customer.id,
          complianceWarnings: complianceCheck.warnings,
        },
      },
    });

    // TODO: Actually send the message via Twilio/email service
    // For now, just mark as sent
    await db.message.update({
      where: { id: message.id },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    // Increment usage counter AFTER successful send
    await SubscriptionService.incrementUsage(
      dbUser.organization.id,
      channel as "sms" | "email"
    );

    return NextResponse.json({
      success: true,
      message: "Reminder sent successfully",
      warnings: complianceCheck.warnings,
    });
  } catch (error) {
    console.error("Error sending reminder:", error);
    return NextResponse.json(
      { error: "Failed to send reminder" },
      { status: 500 }
    );
  }
}
