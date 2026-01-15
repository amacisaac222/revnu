import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      include: { organization: true },
    });

    if (!dbUser?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {
      organizationId: dbUser.organization.id,
    };

    if (status === 'overdue') {
      where.status = { in: ['outstanding', 'partial'] };
      where.daysPastDue = { gt: 0 };
    } else if (status) {
      where.status = status;
    }

    const invoices = await db.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            smsConsentGiven: true,
            emailConsentGiven: true,
            smsConsentMethod: true,
            smsConsentDate: true,
          },
        },
      },
      orderBy: { daysPastDue: 'desc' },
      take: limit,
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

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
