import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    }

    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (!org.usedDemoData) {
      return NextResponse.json(
        { error: "No demo data to clear" },
        { status: 400 }
      );
    }

    // Delete all messages
    await db.message.deleteMany({
      where: { organizationId: org.id },
    });

    // Delete all payments
    const invoices = await db.invoice.findMany({
      where: { organizationId: org.id },
      select: { id: true },
    });

    for (const invoice of invoices) {
      await db.payment.deleteMany({
        where: { invoiceId: invoice.id },
      });
    }

    // Delete all invoices
    await db.invoice.deleteMany({
      where: { organizationId: org.id },
    });

    // Delete all customers
    await db.customer.deleteMany({
      where: { organizationId: org.id },
    });

    // Delete all sequences
    const sequences = await db.sequenceTemplate.findMany({
      where: { organizationId: org.id },
      select: { id: true },
    });

    for (const sequence of sequences) {
      await db.sequenceStep.deleteMany({
        where: { sequenceId: sequence.id },
      });
    }

    await db.sequenceTemplate.deleteMany({
      where: { organizationId: org.id },
    });

    // Reset organization flags
    await db.organization.update({
      where: { id: org.id },
      data: {
        usedDemoData: false,
        onboardingProgress: {},
      },
    });

    return NextResponse.json({
      success: true,
      message: "Demo data cleared successfully",
    });
  } catch (error) {
    console.error("Demo data clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear demo data" },
      { status: 500 }
    );
  }
}
