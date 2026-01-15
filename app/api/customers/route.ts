import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

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
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const customers = await db.customer.findMany({
      where: { organizationId: dbUser.organization.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { lastName: "asc" },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
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
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zip,
      smsConsentGiven,
      smsConsentDate,
      smsConsentMethod,
      emailConsentGiven,
      customerNotes,
    } = body;

    // Create customer
    const customer = await db.customer.create({
      data: {
        organizationId,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        smsConsentGiven: smsConsentGiven || false,
        smsConsentDate: smsConsentDate ? new Date(smsConsentDate) : null,
        smsConsentMethod: smsConsentMethod || null,
        emailConsentGiven: emailConsentGiven || false,
        customerNotes: customerNotes || null,
      },
    });

    // Log audit
    await logAudit({
      organizationId,
      action: "customer_created",
      entityType: "customer",
      entityId: customer.id,
      metadata: {
        customerName: `${firstName} ${lastName}`,
        smsConsentGiven,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
