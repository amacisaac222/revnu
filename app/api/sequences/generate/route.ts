import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
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

    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: "Claude AI not configured",
          message: "Add ANTHROPIC_API_KEY to your .env file to enable AI sequence generation"
        },
        { status: 503 }
      );
    }

    // Dynamically import Anthropic only when needed
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Call Claude to generate the sequence
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are an expert at creating payment reminder sequences for trades businesses (electricians, plumbers, HVAC, etc.).

Generate a multi-step payment reminder sequence based on this request: "${prompt}"

Business context:
- Business name: ${dbUser.organization.businessName}
- Industry: ${dbUser.organization.industry || "trades/services"}

IMPORTANT RULES:
1. Create 3-4 steps that progress from friendly → firm → final notice
2. Each step should have:
   - delayDays: number (0 for first step, then 3-7 day gaps)
   - channel: "sms" or "email" or "both"
   - subject: string (for email, short and direct)
   - body: string (the message content)
3. Use these template variables (customer will see actual values):
   - {{customerFirstName}} - Customer's first name
   - {{customerName}} - Full customer name
   - {{invoiceNumber}} - Invoice number
   - {{amountRemaining}} - Amount still owed
   - {{paymentLink}} - Direct payment link
   - {{businessName}} - Your business name
   - {{daysPastDue}} - Days past the due date
4. SMS messages should be under 160 characters when possible
5. Tone should match trades industry: direct, professional, no-nonsense
6. Progressive firmness: Step 1 friendly, Step 2 firm but polite, Step 3 final notice
7. Always include payment link for easy action

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "steps": [
    {
      "stepNumber": 1,
      "delayDays": 0,
      "channel": "sms",
      "subject": "",
      "body": "Hi {{customerFirstName}}! Invoice #{{invoiceNumber}} for {{amountRemaining}} is due today. Pay here: {{paymentLink}} - {{businessName}}"
    }
  ]
}`,
        },
      ],
    });

    // Parse Claude's response
    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response format from Claude");
    }

    let responseText = content.text.trim();

    // Remove markdown code blocks if present
    responseText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "")
      .trim();

    const generated = JSON.parse(responseText);

    if (!generated.steps || !Array.isArray(generated.steps)) {
      throw new Error("Invalid sequence format from Claude");
    }

    // Add IDs to steps
    const stepsWithIds = generated.steps.map((step: any) => ({
      ...step,
      id: Date.now().toString() + Math.random().toString(36).substring(7),
    }));

    return NextResponse.json({
      success: true,
      steps: stepsWithIds,
    });
  } catch (error: any) {
    console.error("Error generating sequence:", error);

    if (error.message?.includes("JSON")) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate sequence" },
      { status: 500 }
    );
  }
}
