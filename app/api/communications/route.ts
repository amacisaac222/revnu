import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor"); // Format: "timestamp_id"
    const limit = parseInt(searchParams.get("limit") || "50");
    const customerId = searchParams.get("customerId");
    const invoiceId = searchParams.get("invoiceId");
    const channel = searchParams.get("channel"); // "sms" | "email"
    const status = searchParams.get("status"); // "pending" | "sent" | "delivered" | "failed"
    const direction = searchParams.get("direction"); // "outbound" | "inbound"
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search"); // Search in body/subject

    // Build where clause
    const where: any = {
      organizationId: dbUser.organization.id,
    };

    if (customerId) where.customerId = customerId;
    if (invoiceId) where.invoiceId = invoiceId;
    if (channel) where.channel = channel;
    if (status) where.status = status;
    if (direction) where.direction = direction;

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Search filter (case-insensitive partial match in body or subject)
    if (search) {
      where.OR = [
        { body: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    // Cursor-based pagination
    // Cursor format: "createdAt_id" (ISO timestamp + underscore + message ID)
    let cursorCondition = {};
    if (cursor) {
      const [cursorDate, cursorId] = cursor.split("_");
      cursorCondition = {
        OR: [
          { createdAt: { lt: new Date(cursorDate) } },
          {
            AND: [
              { createdAt: new Date(cursorDate) },
              { id: { lt: cursorId } },
            ],
          },
        ],
      };
    }

    // Fetch messages with cursor pagination
    const messages = await db.message.findMany({
      where: {
        ...where,
        ...cursorCondition,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            amountDue: true,
            amountRemaining: true,
          },
        },
      },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" }, // Tie-breaker for stable sort
      ],
      take: limit + 1, // Fetch one extra to determine if there's a next page
    });

    // Determine if there's a next page
    const hasNextPage = messages.length > limit;
    const items = hasNextPage ? messages.slice(0, limit) : messages;

    // Generate next cursor
    let nextCursor = null;
    if (hasNextPage) {
      const lastItem = items[items.length - 1];
      nextCursor = `${lastItem.createdAt.toISOString()}_${lastItem.id}`;
    }

    // Get total count (for stats, limited to avoid performance issues)
    const totalCount = await db.message.count({
      where,
    });

    // Get stats breakdown
    const stats = await db.message.groupBy({
      by: ["status"],
      where: { organizationId: dbUser.organization.id },
      _count: { status: true },
    });

    const statsMap = stats.reduce(
      (acc, s) => {
        acc[s.status] = s._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      messages: items,
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
        totalCount,
      },
      stats: {
        total: totalCount,
        sent: (statsMap.sent || 0) + (statsMap.delivered || 0),
        delivered: statsMap.delivered || 0,
        failed: statsMap.failed || 0,
        pending: (statsMap.pending || 0) + (statsMap.queued || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching communications:", error);
    return NextResponse.json(
      { error: "Failed to fetch communications" },
      { status: 500 }
    );
  }
}
