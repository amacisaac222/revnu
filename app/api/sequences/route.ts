import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get organization ID from query params or from user's organization
    const { searchParams } = new URL(request.url);
    let organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      // Fetch from user's organization if not provided
      const user = await db.user.findFirst({
        where: {
          OR: [
            { clerkUserId: userId },
            { email: { contains: userId } }
          ]
        },
        select: { organizationId: true },
      });

      if (!user?.organizationId) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }

      organizationId = user.organizationId;
    }

    const sequences = await db.sequenceTemplate.findMany({
      where: { organizationId },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
        },
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sequences });
  } catch (error) {
    console.error("Error fetching sequences:", error);
    return NextResponse.json(
      { error: "Failed to fetch sequences" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      organizationId,
      name,
      description,
      triggerDaysPastDue,
      isActive,
      isDefault,
      steps,
    } = body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.sequenceTemplate.updateMany({
        where: {
          organizationId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create sequence with steps in a transaction
    const sequence = await db.$transaction(async (tx) => {
      const newSequence = await tx.sequenceTemplate.create({
        data: {
          organizationId,
          name,
          description: description || null,
          triggerDaysPastDue,
          isActive,
          isDefault,
        },
      });

      // Create steps
      if (steps && steps.length > 0) {
        await tx.sequenceStep.createMany({
          data: steps.map((step: any) => ({
            sequenceId: newSequence.id,
            stepNumber: step.stepNumber,
            delayDays: step.delayDays,
            channel: step.channel,
            subject: step.subject || null,
            body: step.body,
            isActive: true,
          })),
        });
      }

      return tx.sequenceTemplate.findUnique({
        where: { id: newSequence.id },
        include: {
          steps: {
            orderBy: { stepNumber: "asc" },
          },
        },
      });
    });

    // Log audit
    await logAudit({
      organizationId,
      action: "sequence_created",
      entityType: "sequence",
      entityId: sequence!.id,
      metadata: {
        name,
        stepsCount: steps?.length || 0,
      },
    });

    return NextResponse.json(sequence);
  } catch (error) {
    console.error("Error creating sequence:", error);
    return NextResponse.json(
      { error: "Failed to create sequence" },
      { status: 500 }
    );
  }
}
