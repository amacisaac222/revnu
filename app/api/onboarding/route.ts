import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      businessName,
      industry,
      phone,
      timezone,
      userEmail,
      userName,
      // Business metrics (NEW)
      primaryState,
      invoicesPerYear,
      latePaymentsPerMonth,
      timeSpentChasing,
      // Payment & contact (NEW)
      businessEmail,
      paymentInstructions,
      paymentLink,
      // Existing questionnaire fields
      hasExistingInvoices,
      preferredChannels,
      communicationTone,
      averageInvoiceAmount,
      typicalPaymentTerms,
    } = body;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: userEmail },
      include: { organization: true },
    });

    if (existingUser?.organization) {
      // User already has an organization, just return it
      return NextResponse.json({
        organization: existingUser.organization,
        user: existingUser,
      });
    }

    // Create organization and user in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create organization with all onboarding data
      const organization = await tx.organization.create({
        data: {
          businessName,
          industry,
          phone,
          email: businessEmail,
          timezone,
          subscriptionTier: "starter",
          // Business metrics (NEW)
          primaryState,
          invoicesPerYear,
          latePaymentsPerMonth,
          timeSpentChasing,
          // Payment settings (NEW)
          defaultPaymentUrl: paymentLink || null,
          paymentInstructions: paymentInstructions || null,
          // Collection preferences
          hasExistingInvoices: hasExistingInvoices || false,
          preferredChannels: preferredChannels || {},
          communicationTone,
          averageInvoiceAmount: averageInvoiceAmount || null,
          typicalPaymentTerms: typicalPaymentTerms || 30,
          completedOnboarding: true,
        },
      });

      // Create or update user linked to organization
      const user = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: {
              organizationId: organization.id,
              name: userName,
              role: "owner",
            },
          })
        : await tx.user.create({
            data: {
              email: userEmail,
              name: userName,
              role: "owner",
              organizationId: organization.id,
            },
          });

      return { organization, user };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
