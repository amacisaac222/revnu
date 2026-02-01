/**
 * API Route: Generate Notice of Intent to Lien (NOI)
 *
 * POST /api/invoices/[id]/noi/generate
 *
 * Generates a state-specific NOI PDF for an invoice
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { calculateNOIDeadlines, calculateResponseDeadline } from "@/lib/noi-calculator";
import { getNOITemplate, type NOITemplateData } from "@/lib/noi-templates";
import { addDays } from "date-fns";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoiceId = params.id;
    const body = await request.json();
    const { deliveryMethod = "certified_mail", recipients = [] } = body;

    // 1. Fetch invoice with all related data
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        organization: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // 2. Validate invoice is eligible for lien
    if (!invoice.lienEligible) {
      return NextResponse.json(
        { error: "Invoice is not eligible for mechanics lien" },
        { status: 400 }
      );
    }

    if (!invoice.lastWorkDate) {
      return NextResponse.json(
        { error: "Invoice must have lastWorkDate set for lien calculation" },
        { status: 400 }
      );
    }

    // 3. Get organization state (for lien laws)
    const state = invoice.organization.primaryState || "CA";

    // 4. Calculate NOI deadlines
    const noiCalculation = calculateNOIDeadlines(
      invoice.lastWorkDate,
      invoice.dueDate,
      state
    );

    // 5. Calculate response deadline
    const sentDate = new Date();
    const responseDeadline = calculateResponseDeadline(sentDate, state);

    // 6. Prepare template data
    const templateData: NOITemplateData = {
      // Contractor info
      contractorName: invoice.organization.businessName,
      contractorAddress: invoice.organization.settings?.address || "",
      contractorCity: invoice.organization.settings?.city || "",
      contractorState: state,
      contractorZip: invoice.organization.settings?.zip || "",
      contractorPhone: invoice.organization.phone || "",
      contractorEmail: invoice.organization.email || "",
      contractorLicenseNumber: invoice.organization.settings?.licenseNumber,

      // Customer info
      customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      customerAddress: invoice.customer.address || "",
      customerCity: invoice.customer.city || "",
      customerState: invoice.customer.state || state,
      customerZip: invoice.customer.zip || "",

      // Property info
      propertyAddress: invoice.customer.propertyAddress || invoice.customer.address || "",
      propertyCity: invoice.customer.propertyCity || invoice.customer.city || "",
      propertyState: invoice.customer.propertyState || invoice.customer.state || state,
      propertyZip: invoice.customer.propertyZip || invoice.customer.zip || "",

      // Invoice details
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate.toLocaleDateString(),
      dueDate: invoice.dueDate.toLocaleDateString(),
      workDescription: invoice.description || "Construction services",
      firstWorkDate: invoice.firstWorkDate?.toLocaleDateString() || addDays(invoice.lastWorkDate, -30).toLocaleDateString(),
      lastWorkDate: invoice.lastWorkDate.toLocaleDateString(),

      // Financial
      amountDue: invoice.amountRemaining,
      lateFees: 0, // TODO: Calculate from late fee settings
      totalAmount: invoice.amountRemaining,

      // Deadlines
      responseDeadline: responseDeadline.toLocaleDateString(),
      lienFilingDeadline: noiCalculation.lienFilingDeadline.toLocaleDateString(),
      noticeDate: sentDate.toLocaleDateString(),
    };

    // 7. Generate NOI letter text
    const noiText = getNOITemplate(state, templateData);

    // 8. Prepare recipient list
    const noiRecipients = recipients.length > 0
      ? recipients
      : [
          {
            name: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
            address: invoice.customer.address || "",
            city: invoice.customer.city || "",
            state: invoice.customer.state || state,
            zip: invoice.customer.zip || "",
            recipientType: "owner",
          },
        ];

    // 9. Create NOI record in database
    const noticeOfIntent = await db.noticeOfIntent.create({
      data: {
        invoiceId: invoice.id,
        noticeType: "notice_of_intent",
        state: state,
        sentDate: sentDate,
        responseDeadline: responseDeadline,
        deliveryMethod: deliveryMethod,
        deliveryStatus: "pending",
        recipients: noiRecipients,
        amountClaimed: invoice.amountRemaining,
        lateFees: 0,
        filingCosts: 0,
        totalAmount: invoice.amountRemaining,
        lienFilingDeadline: noiCalculation.lienFilingDeadline,
        daysUntilDeadline: noiCalculation.daysUntilLienDeadline,
        generatedBy: userId,
      },
    });

    // 10. Return NOI data (PDF generation will be separate step)
    return NextResponse.json({
      success: true,
      noi: {
        id: noticeOfIntent.id,
        noiText: noiText,
        calculation: noiCalculation,
        templateData: templateData,
        recipients: noiRecipients,
      },
    });
  } catch (error) {
    console.error("NOI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate NOI" },
      { status: 500 }
    );
  }
}
