import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: Load user's dashboard layout
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      include: {
        organization: {
          select: {
            dashboardLayout: true,
            widgetSettings: true,
          },
        },
      },
    });

    if (!dbUser?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({
      dashboardLayout: dbUser.organization.dashboardLayout,
      widgetSettings: dbUser.organization.widgetSettings,
    });
  } catch (error) {
    console.error("Error loading dashboard layout:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard layout" },
      { status: 500 }
    );
  }
}

// POST: Save user's dashboard layout
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tab, widgets, widgetSettings } = body;

    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      include: { organization: true },
    });

    if (!dbUser?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get current layout
    const currentLayout = (dbUser.organization.dashboardLayout as any) || {};

    // Update layout for specific tab
    const updatedLayout = {
      ...currentLayout,
      [tab]: widgets,
    };

    // Update in database
    await db.organization.update({
      where: { id: dbUser.organization.id },
      data: {
        dashboardLayout: updatedLayout,
        ...(widgetSettings && { widgetSettings }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving dashboard layout:", error);
    return NextResponse.json(
      { error: "Failed to save dashboard layout" },
      { status: 500 }
    );
  }
}
