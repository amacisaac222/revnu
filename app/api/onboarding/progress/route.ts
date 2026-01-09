import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { organizationId, progressKey, completed } = await req.json();

    if (!organizationId || !progressKey) {
      return NextResponse.json(
        { error: "Organization ID and progress key required" },
        { status: 400 }
      );
    }

    // Get current progress
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const currentProgress = typeof org.onboardingProgress === 'object' && org.onboardingProgress !== null
      ? org.onboardingProgress
      : {};

    // Update progress
    const updatedProgress = {
      ...currentProgress,
      [progressKey]: completed !== false,
    };

    await db.organization.update({
      where: { id: organizationId },
      data: {
        onboardingProgress: updatedProgress,
      },
    });

    return NextResponse.json({ success: true, progress: updatedProgress });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
