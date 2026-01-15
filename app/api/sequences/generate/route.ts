import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Lazy-load Anthropic client
let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a description of the sequence you want to create" },
        { status: 400 }
      );
    }

    // Build the AI prompt
    const systemPrompt = `You are a payment collections specialist who generates professional payment reminder sequences.

The user will describe what kind of sequence they want in plain English. Your job is to:
1. Parse their request and understand the context
2. Generate a complete, professional sequence with appropriate steps
3. Use proper timing and escalation
4. Be TCPA compliant (include opt-out for SMS)
5. Use template variables for personalization

AVAILABLE TEMPLATE VARIABLES:
- {{customerName}} - Full customer name
- {{customerFirstName}} - First name only
- {{invoiceNumber}} - Invoice number
- {{amount}} - Full invoice amount
- {{amountRemaining}} - Outstanding balance
- {{daysPastDue}} - Days past due
- {{dueDate}} - Invoice due date
- {{paymentLink}} - Payment URL
- {{businessName}} - Your business name

REQUIREMENTS:
- Generate 2-5 steps (based on user request)
- Use appropriate channels (SMS for short urgent, Email for detailed)
- Start friendly/professional and escalate appropriately
- Keep SMS under 160 characters when possible
- Include clear calls to action
- Be respectful but firm
- For SMS: Include opt-out language in final step

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "steps": [
    {
      "id": "unique-id-1",
      "stepNumber": 1,
      "delayDays": number,
      "channel": "sms" | "email",
      "subject": "string (for email only, empty string for SMS)",
      "body": "string (the actual message template with variables)"
    }
  ]
}`;

    const userPrompt = `Generate a payment reminder sequence based on this request:

"${prompt}"

Remember to:
- Analyze if they want aggressive/friendly/professional tone
- Determine appropriate number of steps (usually 3-4)
- Set proper timing (start gentle, escalate over time)
- Use template variables for personalization
- Keep messages clear and actionable
- Include payment links and opt-out language

Return ONLY the JSON object, no other text.`;

    // Call Claude API
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: systemPrompt + "\n\n" + userPrompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Clean up response (remove markdown code blocks if present)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const aiResponse = JSON.parse(cleanedResponse);

    // Validate response structure
    if (!aiResponse.steps || !Array.isArray(aiResponse.steps) || aiResponse.steps.length === 0) {
      throw new Error("Invalid AI response format");
    }

    // Ensure each step has required fields
    const validatedSteps = aiResponse.steps.map((step: any, index: number) => ({
      id: step.id || crypto.randomUUID(),
      stepNumber: step.stepNumber || index + 1,
      delayDays: typeof step.delayDays === 'number' ? step.delayDays : 0,
      channel: step.channel === "email" ? "email" : "sms",
      subject: step.subject || "",
      body: step.body || "",
    }));

    console.log("✅ AI sequence generation successful:", validatedSteps.length, "steps");

    return NextResponse.json({
      steps: validatedSteps,
    });
  } catch (error) {
    console.error("AI sequence generation error:", error);

    // Return more specific error messages
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate sequence. Please try rephrasing your request or create manually.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
