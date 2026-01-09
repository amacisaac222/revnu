import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
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

    // Fetch all customers with invoice data
    const customers = await db.customer.findMany({
      where: { organizationId: dbUser.organization.id },
      include: {
        invoices: {
          where: {
            status: { in: ["outstanding", "partial"] },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Address",
      "City",
      "State",
      "ZIP",
      "SMS Consent",
      "SMS Opted Out",
      "Email Consent",
      "Outstanding Invoices",
      "Total Owed",
      "Created Date",
    ];

    const rows = customers.map((customer) => {
      const totalOwed = customer.invoices.reduce(
        (sum, inv) => sum + inv.amountRemaining,
        0
      );

      return [
        customer.firstName,
        customer.lastName,
        customer.email || "",
        customer.phone || "",
        customer.address || "",
        customer.city || "",
        customer.state || "",
        customer.zip || "",
        customer.smsConsentGiven ? "Yes" : "No",
        customer.smsOptedOut ? "Yes" : "No",
        customer.emailConsentGiven ? "Yes" : "No",
        customer.invoices.length,
        (totalOwed / 100).toFixed(2),
        new Date(customer.createdAt).toLocaleDateString(),
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && (cell.includes(",") || cell.includes('"'))
              ? `"${cell.replace(/"/g, '""')}"`
              : cell
          )
          .join(",")
      ),
    ].join("\n");

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting customers:", error);
    return NextResponse.json(
      { error: "Failed to export customers" },
      { status: 500 }
    );
  }
}
