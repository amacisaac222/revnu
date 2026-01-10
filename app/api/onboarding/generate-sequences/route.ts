import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

// Force dynamic rendering to skip static generation
export const dynamic = 'force-dynamic'

// Lazy-load Anthropic client to avoid initialization during build
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

interface OnboardingData {
  organizationId: string;
  businessName: string;
  industry: string;
  collectionMethod: string;
  hasExistingInvoices: boolean;
  preferredChannels: { sms?: boolean; email?: boolean; phone?: boolean };
  communicationTone: string;
  followUpFrequency: string;
  averageInvoiceAmount: number;
  typicalPaymentTerms: number;
}

export async function POST(req: NextRequest) {
  try {
    const data: OnboardingData = await req.json();

    const {
      organizationId,
      businessName,
      industry,
      collectionMethod,
      hasExistingInvoices,
      preferredChannels,
      communicationTone,
      followUpFrequency,
      averageInvoiceAmount,
      typicalPaymentTerms,
    } = data;

    // Verify organization exists
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Build channel list for prompt
    const channels = Object.entries(preferredChannels)
      .filter(([_, enabled]) => enabled)
      .map(([channel, _]) => channel)
      .join(", ");

    // Determine number of sequences based on frequency
    const sequenceCount = followUpFrequency === "aggressive" ? 2 : 1;

    // Build the AI prompt
    const prompt = `You are a payment collections specialist with expertise in ${industry || "trades"} businesses.
Generate ${sequenceCount} professional payment reminder sequence(s) for "${businessName}".

BUSINESS CONTEXT:
- Industry: ${industry || "general trades"}
- Current collection method: ${collectionMethod}
- Has existing outstanding invoices: ${hasExistingInvoices ? "Yes" : "No"}
- Average invoice amount: $${(averageInvoiceAmount / 100).toFixed(0)}
- Standard payment terms: Net ${typicalPaymentTerms} days
- Communication tone preference: ${communicationTone}
- Follow-up frequency: ${followUpFrequency}
- Available channels: ${channels}

REQUIREMENTS:
1. Create ${sequenceCount} complete sequence template(s)
2. Each sequence should have 3-5 steps
3. Start with a ${communicationTone} tone and gradually escalate professionally
4. Use "${businessName}" naturally in messages (not repetitively)
5. Include specific timing delays appropriate for ${followUpFrequency} follow-up
6. Alternate between channels when possible (${channels})
7. Include payment link placeholder: {{paymentLink}}
8. Include customer name placeholder: {{customerName}}
9. Include invoice number placeholder: {{invoiceNumber}}
10. Include amount placeholder: {{amount}}
11. Be TCPA compliant - include opt-out language for SMS
12. Keep messages concise and actionable
13. Respect the ${communicationTone} voice throughout

${followUpFrequency === "aggressive"
  ? "- First sequence: Standard collections (starts at invoice due date)\n- Second sequence: Urgent collections (starts at 15 days past due)"
  : "- Create one comprehensive standard collections sequence"}

TONE GUIDELINES:
${communicationTone === "friendly" ? "- Warm, understanding, conversational\n- Use phrases like 'just a friendly reminder', 'we understand'\n- Maintain positivity even when escalating" : ""}
${communicationTone === "professional" ? "- Business-like, respectful, clear\n- Use formal greetings and closings\n- Focus on facts and deadlines" : ""}
${communicationTone === "firm" ? "- Direct, assertive, no-nonsense\n- Use phrases like 'payment is required', 'immediate attention needed'\n- Professional but more urgent language" : ""}
${communicationTone === "casual" ? "- Relaxed, conversational, friendly\n- Use contractions and informal language\n- Like talking to a friend who owes you money" : ""}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "sequences": [
    {
      "name": "string (e.g., 'Standard Collections - BusinessName')",
      "description": "string (brief description of when to use this sequence)",
      "triggerDaysPastDue": number (0 for on due date, 15 for 15 days past due, etc.),
      "steps": [
        {
          "stepNumber": 1,
          "delayDays": number (days after trigger before sending this step),
          "channel": "sms" | "email",
          "subject": "string (for email only, omit for SMS)",
          "body": "string (the actual message template)"
        }
      ]
    }
  ]
}`;

    // Call Claude API
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const aiResponse = JSON.parse(responseText);

    // Create sequences in database
    const createdSequences = await Promise.all(
      aiResponse.sequences.map(async (sequence: any, index: number) => {
        return db.sequenceTemplate.create({
          data: {
            organizationId: org.id,
            name: sequence.name,
            description: sequence.description,
            triggerDaysPastDue: sequence.triggerDaysPastDue,
            isActive: true,
            isDefault: index === 0, // First sequence is default
            steps: {
              create: sequence.steps.map((step: any) => ({
                stepNumber: step.stepNumber,
                delayDays: step.delayDays,
                channel: step.channel,
                subject: step.subject || null,
                body: step.body,
                isActive: true,
              })),
            },
          },
          include: {
            steps: {
              orderBy: { stepNumber: "asc" },
            },
          },
        });
      })
    );

    // Mark onboarding as having created sequences
    await db.organization.update({
      where: { id: org.id },
      data: {
        onboardingProgress: {
          ...((org.onboardingProgress as any) || {}),
          createdSequence: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      sequences: createdSequences,
      count: createdSequences.length,
    });
  } catch (error) {
    console.error("Sequence generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate sequences",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
