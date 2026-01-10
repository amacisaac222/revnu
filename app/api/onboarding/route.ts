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
      // New questionnaire fields
      collectionMethod,
      hasExistingInvoices,
      preferredChannels,
      communicationTone,
      followUpFrequency,
      averageInvoiceAmount,
      typicalPaymentTerms,
    } = body;

    // Create organization and user in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create organization with all onboarding data
      const organization = await tx.organization.create({
        data: {
          businessName,
          industry,
          phone,
          timezone,
          subscriptionTier: "starter",
          // Collection preferences
          collectionMethod,
          hasExistingInvoices: hasExistingInvoices || false,
          preferredChannels: preferredChannels || {},
          communicationTone,
          followUpFrequency,
          averageInvoiceAmount: averageInvoiceAmount || null,
          typicalPaymentTerms: typicalPaymentTerms || 30,
          completedOnboarding: true,
        },
      });

      // Create user linked to organization
      const user = await tx.user.create({
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
