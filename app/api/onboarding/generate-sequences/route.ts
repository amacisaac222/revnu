import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { generateStandardFlows } from "@/lib/standard-flows";
import { generateLienFlow } from "@/lib/lien-flow-generator";

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
  hasExistingInvoices: boolean;
  preferredChannels: { sms?: boolean; email?: boolean; phone?: boolean };
  communicationTone: string;
  averageInvoiceAmount: number;
  typicalPaymentTerms: number;
  // NEW fields
  primaryState: string;
  invoicesPerYear: number;
  latePaymentsPerMonth: number;
  timeSpentChasing: number;
  businessEmail: string;
  contactPhone: string;
  paymentInstructions?: string;
  paymentLink?: string;
}

export async function POST(req: NextRequest) {
  try {
    const data: OnboardingData = await req.json();

    const {
      organizationId,
      businessName,
      industry,
      hasExistingInvoices,
      preferredChannels,
      communicationTone,
      averageInvoiceAmount,
      typicalPaymentTerms,
      primaryState,
      invoicesPerYear,
      latePaymentsPerMonth,
      timeSpentChasing,
      businessEmail,
      contactPhone,
      paymentInstructions,
      paymentLink,
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

    // ============================================
    // STEP 1: Generate 5 Standard Flows
    // ============================================
    console.log("✨ Generating 5 standard flows...");

    const standardFlows = generateStandardFlows({
      businessName,
      contactEmail: businessEmail,
      contactPhone: contactPhone || "",
      paymentInstructions,
      paymentLink,
      communicationTone: communicationTone as any,
      preferredChannels,
      invoicesPerYear,
      latePaymentsPerMonth,
      timeSpentChasing,
    });

    // Save standard flows to database
    const createdStandardFlows = await Promise.all(
      standardFlows.map(async (flow, index) => {
        return db.sequenceTemplate.create({
          data: {
            organizationId: org.id,
            name: flow.name,
            description: flow.description,
            triggerDaysPastDue: flow.triggerDaysPastDue,
            isActive: true,
            isDefault: flow.isDefault,
            source: "standard",
            steps: {
              create: flow.steps.map((step) => ({
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

    console.log(`✅ Created ${createdStandardFlows.length} standard flows`);

    // ============================================
    // STEP 2: Generate State-Specific Lien Flow
    // ============================================
    console.log(`✨ Generating mechanic's lien flow for ${primaryState}...`);

    const lienFlow = generateLienFlow({
      businessName,
      contactEmail: businessEmail,
      contactPhone: contactPhone || "",
      paymentInstructions,
      paymentLink,
      communicationTone: communicationTone as any,
      preferredChannels,
      primaryState,
    });

    // Save lien flow to database
    const createdLienFlow = await db.sequenceTemplate.create({
      data: {
        organizationId: org.id,
        name: lienFlow.name,
        description: lienFlow.description,
        triggerDaysPastDue: lienFlow.triggerDaysPastDue,
        isActive: true,
        isDefault: false,
        source: "standard",
        isLienSequence: true,
        applicableStates: lienFlow.applicableStates,
        steps: {
          create: lienFlow.steps.map((step) => ({
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

    console.log(`✅ Created mechanic's lien flow for ${primaryState}`);

    // ============================================
    // STEP 3: Try AI Custom Generation (1-2 sequences)
    // ============================================
    let aiSequences: any[] = [];
    let generationSource: "ai" | "standard" = "standard";

    try {
      console.log("✨ Attempting AI custom sequence generation...");

      const channels = Object.entries(preferredChannels)
        .filter(([_, enabled]) => enabled)
        .map(([channel, _]) => channel)
        .join(", ");

      // Enhanced AI prompt with business metrics
      const prompt = `You are a payment collections specialist with expertise in ${industry || "trades"} businesses.

BUSINESS PROFILE:
- Name: ${businessName}
- Industry: ${industry || "general trades"}
- Primary State: ${primaryState}
- Invoices per year: ${invoicesPerYear}
- Late payments per month: ${latePaymentsPerMonth}
- Time spent chasing: ${timeSpentChasing} hours/week
- Average invoice: $${(averageInvoiceAmount / 100).toFixed(0)}
- Payment terms: Net ${typicalPaymentTerms} days
- Communication tone: ${communicationTone}
- Channels: ${channels}

BUSINESS INSIGHTS:
${latePaymentsPerMonth > 15 ? "• High delinquency rate - needs aggressive follow-up strategy" : ""}
${timeSpentChasing > 5 ? "• Significant time burden - automation is critical" : ""}
${invoicesPerYear > 200 ? "• High volume business - efficiency is key" : ""}
${primaryState ? `• Operating in ${primaryState} - mechanic's lien leverage available` : ""}

EXISTING SEQUENCES (DO NOT DUPLICATE):
1. Standard Collections (0 days past due) - general purpose
2. Urgent Collections (15 days past due) - accelerated
3. New Customer Welcome (manual) - relationship building
4. Partial Payment Follow-up (when partial paid)
5. High-Value Invoice (-3 days, 2x average) - premium touch
6. Mechanic's Lien Protection (${primaryState}, 30 days) - lien threats

YOUR TASK:
Generate 1-2 COMPLEMENTARY sequences that fill gaps or address this business's unique needs.

Examples of useful complementary sequences:
- Pre-emptive sequence (starts 7 days BEFORE due date for proactive businesses)
- Repeat customer appreciation flow (for loyal customers with occasional late payment)
- Industry-specific (e.g., seasonal construction payment patterns)
- Payment plan enrollment sequence (for large balances)
- VIP customer sequence (white-glove service for top customers)

Choose sequences that would benefit THIS specific business based on their profile.

REQUIREMENTS:
1. Create 1-2 sequences (focus on quality over quantity)
2. Each sequence should have 3-5 steps
3. Maintain the ${communicationTone} tone
4. Use "${businessName}" naturally
5. Include timing delays
6. Alternate between channels: ${channels}
7. Include template variables: {{customerName}}, {{invoiceNumber}}, {{amount}}, {{daysPastDue}}, {{dueDate}}, {{paymentLink}}
8. For SMS: Include opt-out language
9. Make them DIFFERENT from the 6 existing sequences

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "sequences": [
    {
      "name": "string (e.g., 'Pre-Due Courtesy Reminder - BusinessName')",
      "description": "string (brief description of when to use this sequence)",
      "triggerDaysPastDue": number (-7 for before due, 0 for on due, 15 for 15 days past, etc.),
      "steps": [
        {
          "stepNumber": 1,
          "delayDays": number,
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
        model: "claude-3-5-sonnet-20250219",
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
      generationSource = "ai";

      // Save AI-generated sequences
      aiSequences = await Promise.all(
        aiResponse.sequences.map(async (sequence: any) => {
          return db.sequenceTemplate.create({
            data: {
              organizationId: org.id,
              name: sequence.name,
              description: sequence.description,
              triggerDaysPastDue: sequence.triggerDaysPastDue,
              isActive: true,
              isDefault: false,
              source: "ai_generated",
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

      console.log(`✅ AI generated ${aiSequences.length} custom sequences`);
    } catch (aiError) {
      console.warn("⚠️ AI generation failed, using standard flows only:", aiError);
      // Continue without AI sequences - we already have 6 solid standard flows
    }

    // ============================================
    // STEP 4: Mark onboarding progress
    // ============================================
    await db.organization.update({
      where: { id: org.id },
      data: {
        onboardingProgress: {
          ...((org.onboardingProgress as any) || {}),
          createdSequence: true,
        },
      },
    });

    // ============================================
    // RETURN RESULTS
    // ============================================
    const totalSequences = createdStandardFlows.length + (createdLienFlow ? 1 : 0) + aiSequences.length;

    return NextResponse.json({
      success: true,
      standardFlows: createdStandardFlows,
      lienFlow: createdLienFlow,
      aiCustomFlows: aiSequences,
      totalCount: totalSequences,
      source: generationSource,
      breakdown: {
        standard: createdStandardFlows.length,
        lien: 1,
        aiCustom: aiSequences.length,
      },
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
