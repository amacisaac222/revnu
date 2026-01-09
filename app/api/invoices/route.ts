import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      organizationId,
      customerId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      description,
      amountDue,
      amountRemaining,
      collectionSequenceId,
      inCollection,
    } = body;

    // Calculate days past due
    const today = new Date();
    const due = new Date(dueDate);
    const daysPastDue = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));

    // Create invoice
    const invoice = await db.invoice.create({
      data: {
        organizationId,
        customerId,
        invoiceNumber,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        description: description || null,
        amountDue,
        amountRemaining,
        daysPastDue,
        status: "outstanding",
        collectionSequenceId: collectionSequenceId || null,
        inCollection: inCollection || false,
        collectionStartedAt: inCollection ? new Date() : null,
      },
      include: {
        customer: true,
      },
    });

    // Log audit
    await logAudit({
      organizationId,
      action: "invoice_created",
      entityType: "invoice",
      entityId: invoice.id,
      metadata: {
        invoiceNumber,
        customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
        amount: amountDue,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
