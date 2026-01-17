import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { SubscriptionService } from "@/lib/subscription-service";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { promoCode } = await req.json();

    // Get user's organization
    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      include: { organization: true },
    });

    if (!dbUser || !dbUser.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if already subscribed
    if (SubscriptionService.isSubscriptionActive(dbUser.organization.subscriptionStatus)) {
      return NextResponse.json(
        { error: "Organization already has an active subscription" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/dashboard?payment=success`;
    const cancelUrl = `${baseUrl}/dashboard/send-reminders?payment=cancelled`;

    // Create checkout session (with promo code if provided)
    const checkoutUrl = await SubscriptionService.createCheckoutSession(
      dbUser.organization.id,
      successUrl,
      cancelUrl,
      promoCode || undefined
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
