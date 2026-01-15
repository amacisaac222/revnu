import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { stringify } from "csv-stringify/sync";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user's organization
    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      include: { organization: true },
    });

    if (!dbUser?.organization) {
      return new Response("Organization not found", { status: 404 });
    }

    // Parse query parameters (same as main API)
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");
    const invoiceId = searchParams.get("invoiceId");
    const channel = searchParams.get("channel");
    const status = searchParams.get("status");
    const direction = searchParams.get("direction");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {
      organizationId: dbUser.organization.id,
    };

    if (customerId) where.customerId = customerId;
    if (invoiceId) where.invoiceId = invoiceId;
    if (channel) where.channel = channel;
    if (status) where.status = status;
    if (direction) where.direction = direction;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    if (search) {
      where.OR = [
        { body: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    // Use streaming approach for large datasets
    // Fetch in batches to avoid memory issues
    const BATCH_SIZE = 1000;
    let skip = 0;
    const csvRows: string[][] = [];

    // CSV Headers
    csvRows.push([
      "Date",
      "Time",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Invoice Number",
      "Channel",
      "Direction",
      "Status",
      "Subject",
      "Message Body",
      "Sent From",
      "Delivered At",
      "Failed At",
      "Error Message",
      "Automated",
    ]);

    // Fetch messages in batches
    while (true) {
      const batch = await db.message.findMany({
        where,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          invoice: {
            select: {
              invoiceNumber: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: BATCH_SIZE,
        skip,
      });

      if (batch.length === 0) break;

      // Convert each message to CSV row
      for (const msg of batch) {
        const sentFrom =
          msg.channel === "sms"
            ? msg.sentFromNumber || ""
            : msg.sentFromEmail || "";

        csvRows.push([
          new Date(msg.createdAt).toLocaleDateString(),
          new Date(msg.createdAt).toLocaleTimeString(),
          `${msg.customer.firstName} ${msg.customer.lastName}`,
          msg.customer.email || "",
          msg.customer.phone || "",
          msg.invoice?.invoiceNumber || "",
          msg.channel,
          msg.direction,
          msg.status,
          msg.subject || "",
          msg.body,
          sentFrom,
          msg.deliveredAt
            ? new Date(msg.deliveredAt).toLocaleString()
            : "",
          msg.failedAt ? new Date(msg.failedAt).toLocaleString() : "",
          msg.errorMessage || "",
          msg.isAutomated ? "Yes" : "No",
        ]);
      }

      if (batch.length < BATCH_SIZE) break;
      skip += BATCH_SIZE;
    }

    // Generate CSV content
    const csv = stringify(csvRows);

    // Generate filename with current date
    const filename = `revnu-communications-${new Date().toISOString().split("T")[0]}.csv`;

    // Return as downloadable CSV file
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting communications:", error);
    return new Response("Failed to export communications", { status: 500 });
  }
}
