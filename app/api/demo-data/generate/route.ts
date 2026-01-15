import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_DEMO_DATA } from "@/lib/default-demo-data";

// Force dynamic rendering to skip static generation
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    }

    // Get organization details
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Use default demo data (AI generation disabled due to API issues)
    // Generate unique invoice numbers using timestamp
    const timestamp = Date.now().toString().slice(-6);
    const demoData = {
      customers: DEFAULT_DEMO_DATA.customers,
      invoices: DEFAULT_DEMO_DATA.invoices.map((inv, idx) => ({
        ...inv,
        invoiceNumber: `INV-${timestamp}-${idx + 1}`, // Unique invoice number
        customerIndex: idx % DEFAULT_DEMO_DATA.customers.length,
        amount: inv.amount / 100, // Convert from cents to dollars for invoice creation
        dueDate: new Date(Date.now() + inv.dueDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysPastDue: inv.dueDate < 0 ? Math.abs(inv.dueDate) : 0
      }))
    };

    // Create customers
    const createdCustomers = await Promise.all(
      demoData.customers.map(async (customer: any) => {
        return db.customer.create({
          data: {
            organizationId: org.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            zip: customer.zip,
            smsConsentGiven: true,
            smsConsentDate: new Date(),
            smsConsentMethod: "demo_data",
            emailConsentGiven: true,
          },
        });
      })
    );

    // Create invoices
    await Promise.all(
      demoData.invoices.map(async (invoice: any) => {
        const customer = createdCustomers[invoice.customerIndex];
        const amountInCents = Math.round(invoice.amount * 100);
        const dueDate = new Date(invoice.dueDate);

        return db.invoice.create({
          data: {
            organizationId: org.id,
            customerId: customer.id,
            invoiceNumber: invoice.invoiceNumber,
            description: invoice.description,
            amountDue: amountInCents,
            amountRemaining: amountInCents,
            invoiceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
            dueDate: dueDate,
            daysPastDue: invoice.daysPastDue,
            status: "outstanding",
          },
        });
      })
    );

    // Mark organization as using demo data
    await db.organization.update({
      where: { id: org.id },
      data: {
        usedDemoData: true,
        onboardingProgress: {
          addedCustomer: true,
          createdInvoice: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      customersCount: createdCustomers.length,
      invoicesCount: demoData.invoices.length,
    });
  } catch (error) {
    console.error("Demo data generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate demo data" },
      { status: 500 }
    );
  }
}
