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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    // Dynamically import Anthropic only when needed
    let Anthropic, anthropic;
    try {
      Anthropic = (await import("@anthropic-ai/sdk")).default;
      anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    } catch (error) {
      console.error("Failed to load Anthropic SDK:", error);
      return NextResponse.json(
        {
          error: "AI service temporarily unavailable",
          message: "Please try again later"
        },
        { status: 503 }
      );
    }

    // Use Claude to generate realistic demo data based on industry
    const prompt = `Generate realistic sample data for a ${org.industry || "trades"} business named "${org.businessName}".

Create 3-5 customers with:
- Realistic first and last names
- Phone numbers (use format: +1 area code and number)
- Emails
- Addresses in the United States

For 2-3 of these customers, create unpaid invoices with:
- Invoice numbers (format: INV-YYYY-####)
- Realistic amounts for ${org.industry || "trades"} services (between $300-$5000)
- Due dates that are 5-30 days in the past
- Brief service descriptions relevant to ${org.industry || "trades"}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "customers": [
    {
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string (E.164 format)",
      "address": "string",
      "city": "string",
      "state": "string (2-letter)",
      "zip": "string"
    }
  ],
  "invoices": [
    {
      "customerIndex": 0,
      "invoiceNumber": "string",
      "description": "string",
      "amount": 0,
      "dueDate": "YYYY-MM-DD",
      "daysPastDue": 0
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const demoData = JSON.parse(responseText);

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
