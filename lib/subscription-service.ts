import { db } from "@/lib/db";
import Stripe from "stripe";

// Lazy-load Stripe client to avoid initialization during build
let _stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return _stripe;
}

// ============================================
// SINGLE TIER DEFINITION ($99/month)
// ============================================

export const TIER = {
  name: "Pro",
  price: 99,
  smsCredits: 500,
  emailCredits: 1000,
  features: {
    quickBooksIntegration: true,
    customBranding: false,
    advancedAnalytics: false,
    maxSequences: 999, // Unlimited
    maxTeamMembers: 5,
    prioritySupport: true,
  },
  stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_test_pro",
} as const;

export type BillingPeriod = "monthly";

// ============================================
// FEATURE GATING
// ============================================

export class SubscriptionService {
  /**
   * Check if organization has access to a specific feature
   */
  static async hasFeature(
    organizationId: string,
    feature: keyof typeof TIER.features
  ): Promise<boolean> {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) return false;

    // Check subscription status
    if (!this.isSubscriptionActive(org.subscriptionStatus)) {
      return false;
    }

    // Single tier - return feature availability
    const value = TIER.features[feature];
    return typeof value === 'boolean' ? value : Boolean(value);
  }

  /**
   * Check if organization can send SMS/Email (has credits remaining)
   */
  static async canSendMessage(
    organizationId: string,
    type: "sms" | "email"
  ): Promise<{ allowed: boolean; reason?: string }> {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return { allowed: false, reason: "Organization not found" };
    }

    if (!this.isSubscriptionActive(org.subscriptionStatus)) {
      return { allowed: false, reason: "Subscription is not active" };
    }

    // Check credits
    if (type === "sms") {
      if (org.smsCreditsUsed >= org.smsCreditsLimit) {
        return { allowed: false, reason: "SMS credit limit reached" };
      }
    } else {
      if (org.emailCreditsUsed >= org.emailCreditsLimit) {
        return { allowed: false, reason: "Email credit limit reached" };
      }
    }

    return { allowed: true };
  }

  /**
   * Increment SMS or Email usage
   */
  static async incrementUsage(
    organizationId: string,
    type: "sms" | "email",
    count: number = 1
  ): Promise<void> {
    const field = type === "sms" ? "smsCreditsUsed" : "emailCreditsUsed";

    await db.organization.update({
      where: { id: organizationId },
      data: {
        [field]: { increment: count },
      },
    });
  }

  /**
   * Get remaining credits for organization
   */
  static async getRemainingCredits(organizationId: string): Promise<{
    sms: { used: number; limit: number; remaining: number };
    email: { used: number; limit: number; remaining: number };
  }> {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    return {
      sms: {
        used: org.smsCreditsUsed,
        limit: org.smsCreditsLimit,
        remaining: org.smsCreditsLimit - org.smsCreditsUsed,
      },
      email: {
        used: org.emailCreditsUsed,
        limit: org.emailCreditsLimit,
        remaining: org.emailCreditsLimit - org.emailCreditsUsed,
      },
    };
  }

  /**
   * Check if subscription is active
   */
  static isSubscriptionActive(status?: string | null): boolean {
    return status === "active" || status === "trialing";
  }

  /**
   * Check if organization is on trial
   */
  static async isOnTrial(organizationId: string): Promise<boolean> {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org || !org.trialEndsAt) return false;

    return (
      org.subscriptionStatus === "trialing" &&
      new Date() < org.trialEndsAt
    );
  }

  /**
   * Get days remaining in trial
   */
  static async getTrialDaysRemaining(organizationId: string): Promise<number | null> {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org || !org.trialEndsAt) return null;

    const now = new Date();
    if (now >= org.trialEndsAt) return 0;

    const diff = org.trialEndsAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Create Stripe checkout session for subscription (single tier: $99/month)
   */
  static async createCheckoutSession(
    organizationId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    const priceId = TIER.stripePriceId;

    // Create or get Stripe customer
    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const customer = await getStripeClient().customers.create({
        email: org.email || undefined,
        metadata: {
          organizationId: org.id,
          businessName: org.businessName,
        },
      });
      customerId = customer.id;

      await db.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await getStripeClient().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          organizationId: org.id,
          tier: "pro",
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    return session.url!;
  }

  /**
   * Create Stripe portal session for managing subscription
   */
  static async createPortalSession(
    organizationId: string,
    returnUrl: string
  ): Promise<string> {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org || !org.stripeCustomerId) {
      throw new Error("Organization not found or no Stripe customer");
    }

    const session = await getStripeClient().billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  // Single tier - no upgrade/downgrade needed

  /**
   * Cancel subscription (at period end)
   */
  static async cancelSubscription(organizationId: string): Promise<void> {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org || !org.stripeSubscriptionId) {
      throw new Error("Organization not found or no active subscription");
    }

    await getStripeClient().subscriptions.update(org.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await db.auditLog.create({
      data: {
        organizationId: org.id,
        action: "subscription_cancel_scheduled",
        entityType: "subscription",
        entityId: org.stripeSubscriptionId,
        metadata: {
          canceledAt: new Date(),
        },
      },
    });
  }

  /**
   * Reactivate canceled subscription
   */
  static async reactivateSubscription(organizationId: string): Promise<void> {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org || !org.stripeSubscriptionId) {
      throw new Error("Organization not found or no subscription");
    }

    await getStripeClient().subscriptions.update(org.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await db.auditLog.create({
      data: {
        organizationId: org.id,
        action: "subscription_reactivated",
        entityType: "subscription",
        entityId: org.stripeSubscriptionId,
        metadata: {
          reactivatedAt: new Date(),
        },
      },
    });
  }
}
