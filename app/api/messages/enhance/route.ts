import { NextRequest, NextResponse } from "next/server";

// This is a placeholder for AI enhancement
// In production, you would integrate with Anthropic Claude API or OpenAI

export async function POST(request: NextRequest) {
  try {
    const { channel, content, tone, invoiceData } = await request.json();

    // For now, return enhanced versions based on tone
    // In production, call Claude API here

    if (channel === 'sms') {
      let enhanced = content;

      switch (tone) {
        case 'friendly':
          enhanced = `Hi! Just a friendly reminder about invoice ${invoiceData.invoiceNumber} for $${invoiceData.amountDue}. We'd love to help if you have any questions! Pay here: {{paymentLink}}`;
          break;
        case 'firm':
          enhanced = `Payment required: Invoice ${invoiceData.invoiceNumber} ($${invoiceData.amountDue}) is ${invoiceData.daysPastDue} days overdue. Please remit payment immediately: {{paymentLink}}`;
          break;
        case 'urgent':
          enhanced = `URGENT: Invoice ${invoiceData.invoiceNumber} ($${invoiceData.amountDue}) is ${invoiceData.daysPastDue} days past due. Immediate action required. Pay now: {{paymentLink}}`;
          break;
      }

      return NextResponse.json({ content: enhanced });
    } else {
      // Email
      let subject = content.subject;
      let body = content.body;

      switch (tone) {
        case 'friendly':
          subject = `Friendly Reminder: Invoice ${invoiceData.invoiceNumber}`;
          body = `Hi {{customerName}},\n\nHope you're doing well! This is a friendly reminder about invoice ${invoiceData.invoiceNumber} for $${invoiceData.amountDue}.\n\nIf you have any questions or need assistance, please don't hesitate to reach out.\n\nPay online: {{paymentLink}}\n\nThank you!`;
          break;
        case 'firm':
          subject = `Payment Required: Invoice ${invoiceData.invoiceNumber}`;
          body = `Dear {{customerName}},\n\nThis is an important notice regarding invoice ${invoiceData.invoiceNumber} for $${invoiceData.amountDue}, which is ${invoiceData.daysPastDue} days past due.\n\nPlease remit payment immediately to avoid further action.\n\nPay now: {{paymentLink}}`;
          break;
        case 'urgent':
          subject = `URGENT: Overdue Invoice ${invoiceData.invoiceNumber} - Immediate Action Required`;
          body = `{{customerName}},\n\nThis is an urgent notice. Invoice ${invoiceData.invoiceNumber} for $${invoiceData.amountDue} is ${invoiceData.daysPastDue} days overdue.\n\nImmediate payment is required to avoid collection proceedings.\n\nPay immediately: {{paymentLink}}`;
          break;
      }

      return NextResponse.json({ content: { subject, body } });
    }
  } catch (error) {
    console.error("AI enhancement error:", error);
    return NextResponse.json(
      { error: "Failed to enhance message" },
      { status: 500 }
    );
  }
}
