import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    }

    // Mark welcome as seen
    await db.organization.update({
      where: { id: organizationId },
      data: {
        hasSeenWelcome: true,
        completedOnboarding: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Welcome tracking error:", error);
    return NextResponse.json(
      { error: "Failed to update welcome status" },
      { status: 500 }
    );
  }
}
