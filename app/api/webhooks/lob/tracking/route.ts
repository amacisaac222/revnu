/**
 * Webhook Handler: Lob.com Delivery Tracking
 *
 * POST /api/webhooks/lob/tracking
 *
 * Receives delivery status updates from Lob.com and updates NOI records.
 *
 * Lob sends webhooks for:
 * - letter.created
 * - letter.rendered (PDF generated)
 * - letter.in_transit
 * - letter.in_local_area
 * - letter.delivered
 * - letter.re-routed
 * - letter.returned_to_sender
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

/**
 * Verify Lob webhook signature
 */
function verifyLobSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  return signature === digest;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get webhook secret
    const webhookSecret = process.env.LOB_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("LOB_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // 2. Verify signature
    const signature = request.headers.get("lob-signature") || "";
    const rawBody = await request.text();

    if (!verifyLobSignature(rawBody, signature, webhookSecret)) {
      console.error("Invalid Lob webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Parse webhook payload
    const event = JSON.parse(rawBody);

    console.log("Lob webhook received:", {
      type: event.event_type?.id,
      letterId: event.body?.id,
    });

    // 4. Handle different event types
    const eventType = event.event_type?.id;
    const letter = event.body;

    if (!letter || !letter.id) {
      console.error("Invalid webhook payload - missing letter data");
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Find NOI by tracking number or Lob letter ID
    const trackingNumber = letter.tracking_number;
    let noi = null;

    if (trackingNumber) {
      noi = await db.noticeOfIntent.findFirst({
        where: { trackingNumber: trackingNumber },
      });
    }

    // If not found by tracking number, try to find by Lob letter ID in notes
    if (!noi) {
      const nois = await db.noticeOfIntent.findMany({
        where: {
          deliveryMethod: "certified_mail",
          deliveryStatus: { not: "delivered" },
        },
      });

      noi = nois.find((n) => n.notes?.includes(letter.id));
    }

    if (!noi) {
      console.log(
        "NOI not found for tracking number:",
        trackingNumber,
        "or letter ID:",
        letter.id
      );
      // Return 200 to acknowledge webhook (prevents retries)
      return NextResponse.json({ received: true });
    }

    // 5. Update NOI based on event type
    let deliveryStatus = noi.deliveryStatus;
    let deliveredAt = noi.deliveredAt;

    switch (eventType) {
      case "letter.created":
        deliveryStatus = "pending";
        break;

      case "letter.rendered":
        // PDF has been generated and letter is being prepared
        deliveryStatus = "pending";
        break;

      case "letter.in_transit":
        deliveryStatus = "in_transit";
        break;

      case "letter.in_local_area":
        // Letter has reached local postal facility
        deliveryStatus = "in_transit";
        break;

      case "letter.delivered":
        deliveryStatus = "delivered";
        deliveredAt = new Date(letter.date_modified || new Date());
        break;

      case "letter.re-routed":
        // Letter was re-routed, still in transit
        deliveryStatus = "in_transit";
        break;

      case "letter.returned_to_sender":
        deliveryStatus = "returned";
        break;

      case "letter.failed":
        deliveryStatus = "failed";
        break;
    }

    // 6. Update NOI record
    await db.noticeOfIntent.update({
      where: { id: noi.id },
      data: {
        deliveryStatus: deliveryStatus,
        deliveredAt: deliveredAt,
        // Append event to notes
        notes: `${noi.notes || ""}\n[${new Date().toISOString()}] ${eventType}`,
      },
    });

    console.log("Updated NOI:", {
      noiId: noi.id,
      status: deliveryStatus,
      deliveredAt: deliveredAt,
    });

    // 7. If delivered, check if we should send notification to contractor
    if (deliveryStatus === "delivered") {
      // Fetch invoice for notification
      const invoice = await db.invoice.findUnique({
        where: { id: noi.invoiceId },
        include: {
          organization: true,
          customer: true,
        },
      });

      if (invoice) {
        // TODO: Send email notification to contractor
        console.log("NOI delivered - notify contractor:", {
          organization: invoice.organization.businessName,
          customer: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
          invoice: invoice.invoiceNumber,
        });

        // Create audit log
        await db.auditLog.create({
          data: {
            organizationId: invoice.organizationId,
            action: "noi_delivered",
            entityType: "invoice",
            entityId: invoice.id,
            metadata: {
              noiId: noi.id,
              trackingNumber: trackingNumber,
              deliveredAt: deliveredAt,
              letterId: letter.id,
            },
          },
        });
      }
    }

    // 8. Return success
    return NextResponse.json({ received: true, noiId: noi.id });
  } catch (error) {
    console.error("Lob webhook error:", error);

    // Still return 200 to prevent Lob from retrying
    // (We don't want to DDoS ourselves with failed webhook retries)
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}

/**
 * GET endpoint to verify webhook is working
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/webhooks/lob/tracking",
    note: "POST only - Lob.com delivery tracking webhook",
  });
}
