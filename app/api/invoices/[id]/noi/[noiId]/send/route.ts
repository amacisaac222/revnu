/**
 * API Endpoint: Send Notice of Intent via Certified Mail
 *
 * POST /api/invoices/[id]/noi/[noiId]/send
 *
 * Sends an existing NOI letter via USPS Certified Mail using Lob.com.
 * Updates NOI record with tracking information.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendCertifiedMail, verifyAddress } from "@/lib/certified-mail";
import { generateNOIPDF } from "@/lib/noi-pdf-generator";
import { getNOITemplate } from "@/lib/noi-templates";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; noiId: string } }
) {
  try {
    const invoiceId = params.id;
    const noiId = params.noiId;

    // 1. Fetch NOI record
    const noi = await db.noticeOfIntent.findUnique({
      where: { id: noiId },
      include: {
        invoice: {
          include: {
            customer: true,
            organization: true,
          },
        },
      },
    });

    if (!noi || noi.invoiceId !== invoiceId) {
      return NextResponse.json({ error: "NOI not found" }, { status: 404 });
    }

    // 2. Verify NOI hasn't already been sent
    if (noi.deliveryStatus !== "pending") {
      return NextResponse.json(
        { error: `NOI already sent (status: ${noi.deliveryStatus})` },
        { status: 400 }
      );
    }

    const invoice = noi.invoice;
    const customer = invoice.customer;
    const organization = invoice.organization;

    // 3. Verify customer address
    const customerAddress = {
      name: `${customer.firstName} ${customer.lastName}`,
      address_line1: customer.billingAddress || "",
      address_line2: customer.billingAddress2 || undefined,
      address_city: customer.billingCity || "",
      address_state: customer.billingState || "",
      address_zip: customer.billingZip || "",
    };

    // Check if address fields are populated
    if (
      !customerAddress.address_line1 ||
      !customerAddress.address_city ||
      !customerAddress.address_state ||
      !customerAddress.address_zip
    ) {
      return NextResponse.json(
        {
          error:
            "Customer billing address is incomplete. Please update customer address before sending.",
        },
        { status: 400 }
      );
    }

    const addressVerification = await verifyAddress(customerAddress);
    if (!addressVerification.valid || !addressVerification.deliverable) {
      return NextResponse.json(
        {
          error: "Customer address is not deliverable. Please verify address.",
          details: addressVerification,
        },
        { status: 400 }
      );
    }

    // 4. Prepare sender address (organization)
    const senderAddress = {
      name: organization.businessName,
      address_line1: organization.billingAddress || "",
      address_line2: organization.billingAddress2 || undefined,
      address_city: organization.billingCity || "",
      address_state: organization.billingState || "",
      address_zip: organization.billingZip || "",
    };

    if (
      !senderAddress.address_line1 ||
      !senderAddress.address_city ||
      !senderAddress.address_state ||
      !senderAddress.address_zip
    ) {
      return NextResponse.json(
        {
          error:
            "Organization billing address is incomplete. Please update in settings.",
        },
        { status: 400 }
      );
    }

    // 5. Generate NOI PDF
    const noiTemplateData = {
      contractorName: organization.businessName,
      contractorAddress: `${senderAddress.address_line1}${senderAddress.address_line2 ? ", " + senderAddress.address_line2 : ""}`,
      contractorCity: senderAddress.address_city,
      contractorState: senderAddress.address_state,
      contractorZip: senderAddress.address_zip,
      contractorPhone: organization.phone || "",
      contractorEmail: organization.email || "",
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerAddress: `${customerAddress.address_line1}${customerAddress.address_line2 ? ", " + customerAddress.address_line2 : ""}`,
      customerCity: customerAddress.address_city,
      customerState: customerAddress.address_state,
      customerZip: customerAddress.address_zip,
      projectAddress: invoice.projectAddress || customerAddress.address_line1,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      amountDue: invoice.amountRemaining,
      lastWorkDate: invoice.lastWorkDate || invoice.dueDate,
      responseDeadline: noi.responseDeadline,
      lienFilingDeadline: noi.lienFilingDeadline,
      state: noi.state,
      claimAmount: noi.amountClaimed,
      totalAmount: noi.totalAmount,
    };

    const noiText = getNOITemplate(noi.state, noiTemplateData);
    const pdf = generateNOIPDF(noiText, noiTemplateData, {
      includeLetterhead: true,
      includeFooter: true,
    });

    // Convert PDF to Base64
    const pdfBase64 = pdf.output("datauristring");

    // 6. Send via certified mail
    const certifiedMailResult = await sendCertifiedMail({
      recipient: addressVerification.correctedAddress || customerAddress,
      sender: senderAddress,
      pdfBase64: pdfBase64,
      description: `Notice of Intent to Lien - Invoice ${invoice.invoiceNumber}`,
      metadata: {
        invoiceId: invoice.id,
        noiId: noi.id,
        organizationId: organization.id,
        customerId: customer.id,
      },
      returnEnvelope: true, // Include return envelope for customer response
    });

    if (!certifiedMailResult.success) {
      return NextResponse.json(
        {
          error: "Failed to send certified mail",
          details: certifiedMailResult.error,
        },
        { status: 500 }
      );
    }

    // 7. Update NOI record with tracking information
    await db.noticeOfIntent.update({
      where: { id: noi.id },
      data: {
        deliveryMethod: "certified_mail",
        deliveryStatus: "in_transit",
        trackingNumber: certifiedMailResult.trackingNumber,
        sentDate: new Date(),
        notes: `Sent via Lob.com certified mail. Letter ID: ${certifiedMailResult.letterId}`,
      },
    });

    // 8. Create audit log
    await db.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "noi_sent_certified_mail",
        entityType: "invoice",
        entityId: invoice.id,
        metadata: {
          noiId: noi.id,
          letterId: certifiedMailResult.letterId,
          trackingNumber: certifiedMailResult.trackingNumber,
          cost: certifiedMailResult.cost,
          expectedDelivery: certifiedMailResult.expectedDeliveryDate,
        },
      },
    });

    // 9. Return success with tracking information
    return NextResponse.json({
      success: true,
      message: "NOI sent via USPS Certified Mail",
      noi: {
        id: noi.id,
        invoiceId: invoice.id,
        sentDate: new Date(),
      },
      tracking: {
        trackingNumber: certifiedMailResult.trackingNumber,
        trackingUrl: certifiedMailResult.trackingUrl,
        expectedDelivery: certifiedMailResult.expectedDeliveryDate,
        cost: certifiedMailResult.cost,
      },
    });
  } catch (error) {
    console.error("Send NOI certified mail error:", error);
    return NextResponse.json(
      {
        error: "Failed to send NOI",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
