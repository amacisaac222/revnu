/**
 * API Route: Download NOI PDF
 *
 * GET /api/invoices/[id]/noi/[noiId]/pdf
 *
 * Generates and downloads NOI as PDF
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getNOITemplate, type NOITemplateData } from "@/lib/noi-templates";
import { generateNOIPDFBlob, generateNOIFilename } from "@/lib/noi-pdf-generator";
import { addDays } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; noiId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoiceId = params.id;
    const noiId = params.noiId;

    // 1. Fetch NOI with invoice data
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

    if (!noi) {
      return NextResponse.json({ error: "NOI not found" }, { status: 404 });
    }

    if (noi.invoice.id !== invoiceId) {
      return NextResponse.json(
        { error: "NOI does not belong to this invoice" },
        { status: 400 }
      );
    }

    const invoice = noi.invoice;

    // 2. Prepare template data
    const templateData: NOITemplateData = {
      // Contractor info
      contractorName: invoice.organization.businessName,
      contractorAddress: (invoice.organization.settings as any)?.address || "",
      contractorCity: (invoice.organization.settings as any)?.city || "",
      contractorState: noi.state,
      contractorZip: (invoice.organization.settings as any)?.zip || "",
      contractorPhone: invoice.organization.phone || "",
      contractorEmail: invoice.organization.email || "",
      contractorLicenseNumber: (invoice.organization.settings as any)?.licenseNumber,

      // Customer info
      customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      customerAddress: invoice.customer.address || "",
      customerCity: invoice.customer.city || "",
      customerState: invoice.customer.state || noi.state,
      customerZip: invoice.customer.zip || "",

      // Property info
      propertyAddress:
        invoice.customer.propertyAddress || invoice.customer.address || "",
      propertyCity: invoice.customer.propertyCity || invoice.customer.city || "",
      propertyState:
        invoice.customer.propertyState || invoice.customer.state || noi.state,
      propertyZip: invoice.customer.propertyZip || invoice.customer.zip || "",

      // Invoice details
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate.toLocaleDateString(),
      dueDate: invoice.dueDate.toLocaleDateString(),
      workDescription: invoice.description || "Construction services",
      firstWorkDate:
        invoice.firstWorkDate?.toLocaleDateString() ||
        addDays(invoice.lastWorkDate!, -30).toLocaleDateString(),
      lastWorkDate: invoice.lastWorkDate!.toLocaleDateString(),

      // Financial
      amountDue: noi.amountClaimed,
      lateFees: noi.lateFees,
      totalAmount: noi.totalAmount,

      // Deadlines
      responseDeadline: noi.responseDeadline.toLocaleDateString(),
      lienFilingDeadline: noi.lienFilingDeadline.toLocaleDateString(),
      noticeDate: noi.sentDate.toLocaleDateString(),
    };

    // 3. Generate NOI text
    const noiText = getNOITemplate(noi.state, templateData);

    // 4. Generate PDF
    const pdfBlob = generateNOIPDFBlob(noiText, templateData, {
      includeLetterhead: true,
      includeFooter: true,
    });

    // 5. Generate filename
    const filename = generateNOIFilename(
      invoice.invoiceNumber,
      `${invoice.customer.firstName}_${invoice.customer.lastName}`,
      noi.sentDate
    );

    // 6. Convert Blob to Buffer for NextResponse
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. Return PDF with proper headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("NOI PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
