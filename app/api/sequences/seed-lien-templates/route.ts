import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { DEFAULT_LIEN_SEQUENCES } from "@/lib/default-lien-sequences";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
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

    // Check if lien templates already exist
    const existingTemplates = await db.sequenceTemplate.findMany({
      where: {
        organizationId: dbUser.organization.id,
        name: {
          in: DEFAULT_LIEN_SEQUENCES.map((seq) => seq.name),
        },
      },
    });

    if (existingTemplates.length > 0) {
      return NextResponse.json({
        message: "Lien sequence templates already exist",
        count: existingTemplates.length,
      });
    }

    // Create all lien-focused sequence templates
    const createdSequences = [];

    for (const template of DEFAULT_LIEN_SEQUENCES) {
      const sequence = await db.sequenceTemplate.create({
        data: {
          organizationId: dbUser.organization.id,
          name: template.name,
          description: template.description,
          isActive: true,
          isDefault: template.isDefault,
          triggerDaysPastDue: template.triggerDaysPastDue,
          steps: {
            create: template.steps.map((step) => ({
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

      createdSequences.push(sequence);
    }

    return NextResponse.json({
      message: "Lien sequence templates created successfully",
      count: createdSequences.length,
      sequences: createdSequences.map((seq) => ({
        id: seq.id,
        name: seq.name,
        description: seq.description,
        stepCount: seq.steps.length,
      })),
    });
  } catch (error: any) {
    console.error("Error seeding lien templates:", error);
    return NextResponse.json(
      { error: "Failed to seed lien templates" },
      { status: 500 }
    );
  }
}
