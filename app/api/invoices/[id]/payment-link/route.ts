import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { createPaymentLink } from "@/lib/stripe";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: invoiceId } = await params;

    // Get user's organization
    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      include: { organization: true },
    });

    if (!dbUser?.organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get invoice
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

    // Check if payment link already exists
    if (invoice.stripePaymentLinkId) {
      return NextResponse.json({
        url: invoice.stripePaymentLinkId, // Note: This is actually the payment link URL
        message: "Payment link already exists",
      });
    }

    // Create Stripe payment link
    const paymentLink = await createPaymentLink({
      invoiceId: invoice.id,
      amount: invoice.amountRemaining,
      description: `Invoice ${invoice.invoiceNumber} - ${dbUser.organization.businessName}`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
        organizationId: dbUser.organization.id,
      },
    });

    // Update invoice with payment link
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        stripePaymentLinkId: paymentLink.url,
      },
    });

    return NextResponse.json({
      url: paymentLink.url,
      id: paymentLink.id,
    });
  } catch (error: any) {
    console.error("Error creating payment link:", error);

    // Handle Stripe not configured error
    if (error.message === "Stripe not configured") {
      return NextResponse.json(
        { error: "Payment processing is not configured. Please add Stripe API keys to your environment variables." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create payment link" },
      { status: 500 }
    );
  }
}
