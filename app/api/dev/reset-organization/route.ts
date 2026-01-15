import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * DEV ONLY: Reset organization endpoint
 * Deletes current user's organization so they can test onboarding again
 *
 * Usage: Visit /api/dev/reset-organization in your browser while logged in
 */
export async function GET(req: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 }
      );
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "No email found" },
        { status: 400 }
      );
    }

    // Find user and their organization
    const dbUser = await db.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!dbUser) {
      return NextResponse.json({
        success: true,
        message: "No database user found. You're ready for onboarding!",
        action: "Visit /onboarding to start",
      });
    }

    if (!dbUser.organization) {
      return NextResponse.json({
        success: true,
        message: "You have no organization. Already ready for onboarding!",
        action: "Visit /onboarding to start",
      });
    }

    const orgName = dbUser.organization.businessName;

    // Delete the organization (cascades to all related data)
    await db.organization.delete({
      where: { id: dbUser.organization.id },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted organization "${orgName}"`,
      deletedOrganization: orgName,
      action: "Visit /onboarding to start fresh!",
    });

  } catch (error) {
    console.error("Reset organization error:", error);
    return NextResponse.json(
      {
        error: "Failed to reset organization",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
