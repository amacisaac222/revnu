import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { calculateLienDeadlines } from "@/lib/lien-deadlines";

export const dynamic = 'force-dynamic';

export async function GET() {
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
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get all lien-eligible invoices that are not paid
    const invoices = await db.invoice.findMany({
      where: {
        organizationId: dbUser.organization.id,
        lienEligible: true,
        status: {
          in: ["outstanding", "partial"],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            propertyAddress: true,
            propertyCity: true,
            propertyState: true,
            propertyZip: true,
          },
        },
      },
      orderBy: {
        lastWorkDate: "asc", // Oldest completion dates first (most urgent)
      },
    });

    // Calculate deadlines for each invoice
    const lienData = invoices
      .map((invoice) => {
        if (!invoice.customer.propertyState || !invoice.lastWorkDate) {
          return null;
        }

        const deadlines = calculateLienDeadlines(
          invoice.customer.propertyState,
          invoice.firstWorkDate,
          invoice.lastWorkDate
        );

        return {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          description: invoice.description,
          amountDue: invoice.amountDue,
          amountRemaining: invoice.amountRemaining,
          status: invoice.status,
          customerId: invoice.customer.id,
          customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
          customerEmail: invoice.customer.email,
          customerPhone: invoice.customer.phone,
          propertyAddress: invoice.customer.propertyAddress,
          propertyCity: invoice.customer.propertyCity,
          propertyState: invoice.customer.propertyState,
          propertyZip: invoice.customer.propertyZip,
          firstWorkDate: invoice.firstWorkDate,
          lastWorkDate: invoice.lastWorkDate,
          preliminaryNoticeSent: invoice.preliminaryNoticeSent,
          preliminaryNoticeSentAt: invoice.preliminaryNoticeSentAt,
          lienFiled: invoice.lienFiled,
          lienFiledAt: invoice.lienFiledAt,
          lienFilingReference: invoice.lienFilingReference,
          // Deadline calculations
          lienFilingDeadline: deadlines.lienFilingDeadline,
          daysUntilDeadline: deadlines.daysUntilFilingDeadline,
          warningLevel: deadlines.warningLevel,
          preliminaryNoticeRequired: deadlines.preliminaryNoticeRequired,
          preliminaryNoticeDeadline: deadlines.preliminaryNoticeDeadline,
        };
      })
      .filter((item) => item !== null);

    // Calculate summary stats
    const total = lienData.length;
    const urgent = lienData.filter((item) => item.daysUntilDeadline <= 14).length;
    const upcoming = lienData.filter(
      (item) => item.daysUntilDeadline > 14 && item.daysUntilDeadline <= 30
    ).length;
    const safe = lienData.filter((item) => item.daysUntilDeadline > 30).length;
    const totalAmountAtRisk = lienData.reduce(
      (sum, item) => sum + item.amountRemaining,
      0
    );
    const urgentAmountAtRisk = lienData
      .filter((item) => item.daysUntilDeadline <= 14)
      .reduce((sum, item) => sum + item.amountRemaining, 0);

    // Group by state
    const byState = lienData.reduce((acc, item) => {
      const state = item.propertyState || "Unknown";
      if (!acc[state]) {
        acc[state] = {
          state,
          count: 0,
          totalAmount: 0,
          urgent: 0,
        };
      }
      acc[state].count++;
      acc[state].totalAmount += item.amountRemaining;
      if (item.daysUntilDeadline <= 14) {
        acc[state].urgent++;
      }
      return acc;
    }, {} as Record<string, { state: string; count: number; totalAmount: number; urgent: number }>);

    return NextResponse.json({
      liens: lienData,
      summary: {
        total,
        urgent,
        upcoming,
        safe,
        totalAmountAtRisk,
        urgentAmountAtRisk,
        byState: Object.values(byState).sort((a, b) => b.urgent - a.urgent),
      },
    });
  } catch (error) {
    console.error("Error fetching lien report:", error);
    return NextResponse.json(
      { error: "Failed to fetch lien report" },
      { status: 500 }
    );
  }
}
