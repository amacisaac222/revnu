import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      organizationId,
      // Profile
      businessName,
      industry,
      phone,
      email,
      timezone,
      primaryState,
      // Business Metrics
      invoicesPerYear,
      latePaymentsPerMonth,
      timeSpentChasing,
      typicalPaymentTerms,
      averageInvoiceAmount,
      communicationTone,
      // Payment
      paymentLink,
      paymentInstructions,
    } = body;

    // Verify user has access to this organization
    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      include: { organization: true },
    });

    if (!dbUser || dbUser.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update organization
    const updatedOrg = await db.organization.update({
      where: { id: organizationId },
      data: {
        businessName,
        industry,
        phone,
        email,
        timezone,
        primaryState,
        invoicesPerYear,
        latePaymentsPerMonth,
        timeSpentChasing,
        typicalPaymentTerms,
        averageInvoiceAmount,
        communicationTone,
        defaultPaymentUrl: paymentLink || null,
        paymentInstructions: paymentInstructions || null,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        organizationId,
        userId: dbUser.id,
        action: "settings_updated",
        entityType: "organization",
        entityId: organizationId,
        metadata: {
          updatedFields: Object.keys(body).filter(k => k !== "organizationId"),
        },
      },
    });

    return NextResponse.json({ success: true, organization: updatedOrg });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
