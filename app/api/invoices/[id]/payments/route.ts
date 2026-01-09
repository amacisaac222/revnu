import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

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
    const body = await request.json();
    const {
      amount,
      paymentMethod,
      paymentDate,
      referenceNumber,
      notes,
    } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

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

    // Get invoice with current payment status
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

    // Validate payment amount doesn't exceed remaining balance
    if (amount > invoice.amountRemaining) {
      return NextResponse.json(
        { error: "Payment amount exceeds remaining balance" },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        invoiceId,
        amount,
        currency: invoice.currency,
        paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        referenceNumber: referenceNumber || null,
        status: "completed",
        notes: notes || null,
      },
    });

    // Update invoice amounts and status
    const newAmountPaid = invoice.amountPaid + amount;
    const newAmountRemaining = invoice.amountRemaining - amount;

    let newStatus = invoice.status;
    if (newAmountRemaining === 0) {
      newStatus = "paid";
    } else if (newAmountPaid > 0 && newAmountRemaining > 0) {
      newStatus = "partial";
    }

    const updatedInvoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        amountRemaining: newAmountRemaining,
        status: newStatus,
        paidAt: newAmountRemaining === 0 ? new Date() : invoice.paidAt,
      },
      include: {
        customer: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Log audit
    await logAudit({
      organizationId: dbUser.organization.id,
      action: "payment_received",
      entityType: "invoice",
      entityId: invoiceId,
      metadata: {
        paymentId: payment.id,
        amount,
        paymentMethod,
        invoiceNumber: invoice.invoiceNumber,
        customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
        newStatus,
      },
    });

    return NextResponse.json({
      payment,
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
