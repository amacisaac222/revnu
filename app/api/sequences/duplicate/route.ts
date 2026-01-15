import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
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

    const { sequenceId } = await request.json();

    // Get original sequence with steps
    const originalSequence = await db.sequenceTemplate.findUnique({
      where: { id: sequenceId },
      include: { steps: true },
    });

    if (!originalSequence || originalSequence.organizationId !== dbUser.organization.id) {
      return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
    }

    // Create duplicate
    const duplicateSequence = await db.sequenceTemplate.create({
      data: {
        organizationId: dbUser.organization.id,
        name: `${originalSequence.name} (Copy)`,
        description: originalSequence.description,
        isActive: false, // Set to inactive by default
        isDefault: false, // Cannot be default
        triggerDaysPastDue: originalSequence.triggerDaysPastDue,
        steps: {
          create: originalSequence.steps.map(step => ({
            stepNumber: step.stepNumber,
            delayDays: step.delayDays,
            channel: step.channel,
            subject: step.subject,
            body: step.body,
            isActive: step.isActive,
          })),
        },
      },
      include: { steps: true },
    });

    return NextResponse.json({ sequence: duplicateSequence });
  } catch (error) {
    console.error("Duplicate sequence error:", error);
    return NextResponse.json(
      { error: "Failed to duplicate sequence" },
      { status: 500 }
    );
  }
}
