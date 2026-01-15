import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/lib/db";

// Force dynamic rendering to skip static generation
export const dynamic = 'force-dynamic'

// Lazy-load Stripe client to avoid initialization during build
let _stripe: Stripe | null = null

function getStripeClient(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    })
  }
  return _stripe
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      const stripe = getStripeClient()
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle subscription events
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ============================================
// SUBSCRIPTION EVENT HANDLERS
// ============================================

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find organization by Stripe customer ID
  const organization = await db.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!organization) {
    console.error(`Organization not found for Stripe customer: ${customerId}`);
    return;
  }

  // Get single tier limits
  const { smsLimit, emailLimit, features } = getTierLimits();

  // Update organization
  await db.organization.update({
    where: { id: organization.id },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionTier: "pro",
      billingPeriod: "monthly",
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      smsCreditsLimit: smsLimit,
      emailCreditsLimit: emailLimit,
      smsCreditsUsed: 0,
      emailCreditsUsed: 0,
      billingCycleStart: new Date(subscription.current_period_start * 1000),
      billingCycleEnd: new Date(subscription.current_period_end * 1000),
      ...features,
    },
  });

  // Create audit log
  await db.auditLog.create({
    data: {
      organizationId: organization.id,
      action: "subscription_created",
      entityType: "subscription",
      entityId: subscription.id,
      metadata: {
        tier: "pro",
        billingInterval: "monthly",
        status: subscription.status,
      },
    },
  });

  console.log(`Subscription created for organization ${organization.id}: pro`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const organization = await db.organization.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!organization) {
    console.error(`Organization not found for subscription: ${subscription.id}`);
    return;
  }

  const { smsLimit, emailLimit, features } = getTierLimits();

  await db.organization.update({
    where: { id: organization.id },
    data: {
      subscriptionStatus: subscription.status,
      subscriptionTier: "pro",
      billingPeriod: "monthly",
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      smsCreditsLimit: smsLimit,
      emailCreditsLimit: emailLimit,
      billingCycleStart: new Date(subscription.current_period_start * 1000),
      billingCycleEnd: new Date(subscription.current_period_end * 1000),
      ...features,
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: organization.id,
      action: "subscription_updated",
      entityType: "subscription",
      entityId: subscription.id,
      metadata: {
        tier: "pro",
        billingInterval: "monthly",
        status: subscription.status,
      },
    },
  });

  console.log(`Subscription updated for organization ${organization.id}: pro`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const organization = await db.organization.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!organization) {
    console.error(`Organization not found for subscription: ${subscription.id}`);
    return;
  }

  // Downgrade to free tier or mark as canceled
  await db.organization.update({
    where: { id: organization.id },
    data: {
      subscriptionStatus: "canceled",
      subscriptionEndsAt: new Date(subscription.ended_at! * 1000),
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: organization.id,
      action: "subscription_canceled",
      entityType: "subscription",
      entityId: subscription.id,
      metadata: {
        canceledAt: new Date(subscription.canceled_at! * 1000),
        endedAt: new Date(subscription.ended_at! * 1000),
      },
    },
  });

  console.log(`Subscription canceled for organization ${organization.id}`);
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const organization = await db.organization.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!organization) return;

  await db.auditLog.create({
    data: {
      organizationId: organization.id,
      action: "trial_ending_soon",
      entityType: "subscription",
      entityId: subscription.id,
      metadata: {
        trialEndsAt: new Date(subscription.trial_end! * 1000),
      },
    },
  });

  // TODO: Send email notification about trial ending
  console.log(`Trial ending soon for organization ${organization.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const organization = await db.organization.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!organization) return;

  // Reset usage credits at start of new billing period
  await db.organization.update({
    where: { id: organization.id },
    data: {
      smsCreditsUsed: 0,
      emailCreditsUsed: 0,
      billingCycleStart: new Date(invoice.period_start * 1000),
      billingCycleEnd: new Date(invoice.period_end * 1000),
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: organization.id,
      action: "invoice_paid",
      entityType: "invoice",
      entityId: invoice.id,
      metadata: {
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000),
      },
    },
  });

  console.log(`Invoice paid for organization ${organization.id}: $${invoice.amount_paid / 100}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const organization = await db.organization.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!organization) return;

  // Update subscription status to past_due
  await db.organization.update({
    where: { id: organization.id },
    data: {
      subscriptionStatus: "past_due",
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: organization.id,
      action: "payment_failed",
      entityType: "invoice",
      entityId: invoice.id,
      metadata: {
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        attemptCount: invoice.attempt_count,
      },
    },
  });

  // TODO: Send email notification about payment failure
  console.log(`Payment failed for organization ${organization.id}`);
}

// ============================================
// SINGLE TIER CONFIGURATION ($99/month Pro)
// ============================================

function getTierLimits() {
  return {
    smsLimit: 500,
    emailLimit: 1000,
    features: {
      hasQuickBooksAccess: true,
      hasCustomBranding: false,
      hasAdvancedAnalytics: false,
      maxSequences: 999,
      maxTeamMembers: 5,
    },
  };
}

// ============================================
// PAYMENT LINK EVENT HANDLERS
// ============================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const invoiceId = session.metadata?.invoiceId;
  if (!invoiceId) {
    console.error("No invoice ID in checkout session metadata");
    return;
  }

  // Get invoice
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true },
  });

  if (!invoice) {
    console.error(`Invoice not found: ${invoiceId}`);
    return;
  }

  // Get payment intent details
  const paymentIntentId = session.payment_intent as string;

  // Create payment record
  const payment = await db.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: session.amount_total!,
      currency: session.currency || "usd",
      paymentMethod: "credit_card",
      paymentDate: new Date(),
      stripePaymentId: paymentIntentId,
      status: "completed",
      notes: "Payment via Stripe payment link",
    },
  });

  // Update invoice
  const newAmountPaid = invoice.amountPaid + session.amount_total!;
  const newAmountRemaining = invoice.amountRemaining - session.amount_total!;

  await db.invoice.update({
    where: { id: invoice.id },
    data: {
      amountPaid: newAmountPaid,
      amountRemaining: newAmountRemaining,
      status: newAmountRemaining === 0 ? "paid" : "partial",
      paidAt: newAmountRemaining === 0 ? new Date() : invoice.paidAt,
      stripePaymentIntentId: paymentIntentId,
    },
  });

  // Create audit log
  await db.auditLog.create({
    data: {
      organizationId: invoice.organizationId,
      action: "payment_received",
      entityType: "invoice",
      entityId: invoice.id,
      metadata: {
        paymentId: payment.id,
        amount: session.amount_total! / 100,
        paymentMethod: "stripe",
        invoiceNumber: invoice.invoiceNumber,
        customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      },
    },
  });

  console.log(`Payment completed for invoice ${invoice.invoiceNumber}: $${session.amount_total! / 100}`);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const invoiceId = paymentIntent.metadata?.invoiceId;
  if (!invoiceId) {
    // This might be a subscription payment, which is handled elsewhere
    return;
  }

  console.log(`Payment intent succeeded for invoice ${invoiceId}: ${paymentIntent.id}`);
  // Payment is already recorded in handleCheckoutCompleted
}
