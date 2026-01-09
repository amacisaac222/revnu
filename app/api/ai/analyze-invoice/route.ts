import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID required" },
        { status: 400 }
      );
    }

    // Get invoice with full context
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        organization: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
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
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build context for AI
    const amountDue = (invoice.amountRemaining / 100).toFixed(2);
    const hasMessages = invoice.messages.length > 0;
    const hasPayments = invoice.payments.length > 0;
    const partialPayment = invoice.status === "partial";

    const prompt = `You are an expert payment collection advisor for ${invoice.organization.industry || "trades"} businesses. Analyze this invoice situation and provide actionable recommendations.

INVOICE DETAILS:
- Amount Due: $${amountDue}
- Days Past Due: ${invoice.daysPastDue}
- Customer: ${invoice.customer.firstName} ${invoice.customer.lastName}
- Status: ${invoice.status}
- Previous Messages Sent: ${invoice.messages.length}
- Payment History: ${hasPayments ? `Made ${invoice.payments.length} payment(s)` : "No payments yet"}
${partialPayment ? `- Partial Payment Made: Customer has shown willingness to pay` : ""}

Provide your analysis in this JSON format:
{
  "urgency": "low" | "medium" | "high" | "critical",
  "recommendedAction": "wait" | "friendly_reminder" | "firm_reminder" | "final_notice" | "call_customer",
  "messageTone": "friendly" | "professional" | "firm" | "urgent",
  "suggestedMessage": "A short, professional message template (2-3 sentences)",
  "reasoning": "Brief explanation of why this approach is recommended",
  "estimatedPaymentProbability": 0-100,
  "nextSteps": ["action1", "action2", "action3"],
  "timing": "Send now" | "Wait 3-5 days" | "Send tomorrow morning" | etc
}

Consider:
- TCPA compliance and professional tone
- The relationship with the customer
- Payment patterns and history
- Industry norms for ${invoice.organization.industry || "trades"} businesses
- Escalation appropriate to days past due`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const analysis = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      analysis,
      invoice: {
        id: invoice.id,
        number: invoice.invoiceNumber,
        amount: amountDue,
        daysPastDue: invoice.daysPastDue,
        customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      },
    });
  } catch (error) {
    console.error("Invoice analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze invoice" },
      { status: 500 }
    );
  }
}
