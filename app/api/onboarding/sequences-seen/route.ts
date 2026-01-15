import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Missing organizationId" },
        { status: 400 }
      );
    }

    // Mark sequences as seen
    await db.organization.update({
      where: { id: organizationId },
      data: { hasSeenSequences: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking sequences as seen:", error);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}
