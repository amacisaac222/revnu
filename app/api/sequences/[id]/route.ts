import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const sequence = await db.sequenceTemplate.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
        },
      },
    });

    if (!sequence) {
      return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
    }

    return NextResponse.json(sequence);
  } catch (error) {
    console.error("Error fetching sequence:", error);
    return NextResponse.json(
      { error: "Failed to fetch sequence" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      triggerDaysPastDue,
      isActive,
      isDefault,
      steps,
      organizationId,
    } = body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.sequenceTemplate.updateMany({
        where: {
          organizationId,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update sequence and steps in a transaction
    const sequence = await db.$transaction(async (tx) => {
      // Update sequence
      const updated = await tx.sequenceTemplate.update({
        where: { id },
        data: {
          name,
          description: description || null,
          triggerDaysPastDue,
          isActive,
          isDefault,
        },
      });

      // Delete existing steps
      await tx.sequenceStep.deleteMany({
        where: { sequenceId: id },
      });

      // Create new steps
      if (steps && steps.length > 0) {
        await tx.sequenceStep.createMany({
          data: steps.map((step: any) => ({
            sequenceId: id,
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
        where: { id },
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
      action: "sequence_updated",
      entityType: "sequence",
      entityId: id,
      metadata: {
        name,
        stepsCount: steps?.length || 0,
      },
    });

    return NextResponse.json(sequence);
  } catch (error) {
    console.error("Error updating sequence:", error);
    return NextResponse.json(
      { error: "Failed to update sequence" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const sequence = await db.sequenceTemplate.findUnique({
      where: { id },
      select: { organizationId: true, name: true },
    });

    if (!sequence) {
      return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
    }

    await db.sequenceTemplate.delete({
      where: { id },
    });

    // Log audit
    await logAudit({
      organizationId: sequence.organizationId,
      action: "sequence_deleted",
      entityType: "sequence",
      entityId: id,
      metadata: {
        name: sequence.name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sequence:", error);
    return NextResponse.json(
      { error: "Failed to delete sequence" },
      { status: 500 }
    );
  }
}
