/**
 * Standard Pre-built Reminder Flow Templates
 *
 * These 5 core flows are generated for every new user during onboarding.
 * They cover the most common collection scenarios and are immediately usable.
 *
 * Flow 6 (Mechanic's Lien) is generated separately with state-specific content.
 */

export interface FlowStep {
  stepNumber: number;
  delayDays: number;
  channel: "sms" | "email";
  subject?: string;
  body: string;
}

export interface FlowTemplate {
  name: string;
  description: string;
  triggerDaysPastDue: number;
  source: "standard";
  isDefault: boolean;
  steps: FlowStep[];
}

export interface StandardFlowsParams {
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  paymentInstructions?: string;
  paymentLink?: string;
  communicationTone: "friendly" | "professional" | "firm" | "casual";
  preferredChannels: { sms?: boolean; email?: boolean; phone?: boolean };
  // Business metrics for timing adjustments
  invoicesPerYear?: number;
  latePaymentsPerMonth?: number;
  timeSpentChasing?: number;
}

/**
 * Calculate appropriate delay timings based on business metrics
 */
function calculateDelays(params: StandardFlowsParams): {
  standard: number[];
  urgent: number[];
  highValue: number[];
} {
  const { invoicesPerYear = 100, latePaymentsPerMonth = 10, timeSpentChasing = 3 } = params;

  // High volume + high delinquency = aggressive (shorter delays)
  if (latePaymentsPerMonth > 15 && invoicesPerYear > 200) {
    return {
      standard: [0, 2, 5, 7, 10],      // Faster standard sequence
      urgent: [0, 2, 4, 6],              // Very fast urgent
      highValue: [-3, 0, 3, 7, 10],     // Start before due date
    };
  }

  // Low volume + low delinquency = relaxed (longer delays)
  if (latePaymentsPerMonth <= 5 && invoicesPerYear <= 50) {
    return {
      standard: [0, 7, 14, 21],
      urgent: [0, 5, 10, 15],
      highValue: [-3, 0, 7, 14, 21],
    };
  }

  // Default moderate timing
  return {
    standard: [0, 3, 7, 10, 14],
    urgent: [0, 3, 7, 10],
    highValue: [-3, 0, 5, 10, 15],
  };
}

/**
 * Get primary and secondary channels based on preferences
 */
function getChannels(preferredChannels: { sms?: boolean; email?: boolean; phone?: boolean }): {
  primary: "sms" | "email";
  secondary: "sms" | "email";
} {
  const primary = preferredChannels.email ? "email" : "sms";
  const secondary = primary === "email" ? "sms" : "email";
  return { primary, secondary };
}

/**
 * Generate all 5 standard flows for a new user
 */
export function generateStandardFlows(params: StandardFlowsParams): FlowTemplate[] {
  const delays = calculateDelays(params);
  const channels = getChannels(params.preferredChannels);
  const { businessName, contactEmail, contactPhone, paymentInstructions, paymentLink } = params;

  // Payment info for messages
  const paymentText = paymentLink
    ? `Pay now: ${paymentLink}`
    : paymentInstructions || "Please contact us for payment options.";

  return [
    // ============================================
    // FLOW 1: STANDARD COLLECTIONS
    // ============================================
    {
      name: `Standard Collections - ${businessName}`,
      description: "General-purpose collection sequence starting on invoice due date. Escalates from friendly to firm.",
      triggerDaysPastDue: 0,
      source: "standard",
      isDefault: true, // This is the primary default flow
      steps: getStandardSteps(delays.standard, channels, businessName, paymentText, params.communicationTone),
    },

    // ============================================
    // FLOW 2: URGENT COLLECTIONS
    // ============================================
    {
      name: `Urgent Collections - ${businessName}`,
      description: "Accelerated sequence for invoices 15+ days past due. Shorter delays, more urgency.",
      triggerDaysPastDue: 15,
      source: "standard",
      isDefault: false,
      steps: getUrgentSteps(delays.urgent, channels, businessName, paymentText, params.communicationTone),
    },

    // ============================================
    // FLOW 3: NEW CUSTOMER WELCOME
    // ============================================
    {
      name: "First Invoice - Welcome Sequence",
      description: "Relationship-building flow for first-time customers. Extra friendly tone to establish rapport.",
      triggerDaysPastDue: 0, // Manual trigger or first invoice
      source: "standard",
      isDefault: false,
      steps: getWelcomeSteps(channels, businessName, paymentText),
    },

    // ============================================
    // FLOW 4: PARTIAL PAYMENT FOLLOW-UP
    // ============================================
    {
      name: "Partial Payment - Thank You & Reminder",
      description: "Acknowledges partial payment and follows up on remaining balance. Grateful but persistent tone.",
      triggerDaysPastDue: 0, // Triggered when invoice status = "partial"
      source: "standard",
      isDefault: false,
      steps: getPartialPaymentSteps(channels, businessName, paymentText, params.communicationTone),
    },

    // ============================================
    // FLOW 5: HIGH-VALUE INVOICE
    // ============================================
    {
      name: "High-Value Invoice - Premium Touch",
      description: "Higher-touch sequence for large invoices (over 2x average). Starts before due date, offers payment plans.",
      triggerDaysPastDue: -3, // Starts 3 days BEFORE due date
      source: "standard",
      isDefault: false,
      steps: getHighValueSteps(delays.highValue, channels, businessName, contactPhone, paymentText, params.communicationTone),
    },
  ];
}

// ============================================
// FLOW 1: STANDARD COLLECTIONS STEPS
// ============================================
function getStandardSteps(
  delays: number[],
  channels: { primary: "sms" | "email"; secondary: "sms" | "email" },
  businessName: string,
  paymentText: string,
  tone: string
): FlowStep[] {
  const [d1, d2, d3, d4, d5] = delays;

  if (tone === "friendly") {
    return [
      {
        stepNumber: 1,
        delayDays: d1,
        channel: channels.primary,
        subject: channels.primary === "email" ? "Friendly Reminder - Invoice {{invoiceNumber}}" : undefined,
        body: channels.primary === "email"
          ? `Hi {{customerName}},\n\nJust a friendly reminder that Invoice {{invoiceNumber}} for ${{amount}} is due today.\n\nWe understand things can get busy! If there's any issue with the invoice, please let me know and we can work it out.\n\n${paymentText}\n\nThanks for your business!\n\n${businessName}\n${contactEmail || ""}`
          : `Hi {{customerName}}! Quick reminder - Invoice {{invoiceNumber}} (${{amount}}) is due today. ${paymentText} Thanks! - ${businessName}`
      },
      {
        stepNumber: 2,
        delayDays: d2,
        channel: channels.secondary,
        subject: channels.secondary === "email" ? "Following Up - Invoice {{invoiceNumber}}" : undefined,
        body: channels.secondary === "email"
          ? `Hi {{customerName}},\n\nI wanted to follow up on Invoice {{invoiceNumber}} (${{amount}}), which is now {{daysPastDue}} days past due.\n\nIf you've already sent payment, thank you! If not, would you mind taking care of it today?\n\n${paymentText}\n\nLet me know if you have any questions!\n\nBest,\n${businessName}`
          : `Hi {{customerName}}, Invoice {{invoiceNumber}} (${{amount}}) is {{daysPastDue}} days overdue. Can you take care of this today? ${paymentText} - ${businessName}`
      },
      {
        stepNumber: 3,
        delayDays: d3,
        channel: channels.primary,
        subject: channels.primary === "email" ? "Payment Reminder - Invoice {{invoiceNumber}}" : undefined,
        body: `Hi {{customerName}},\n\nI've reached out a couple times about Invoice {{invoiceNumber}} (${{amount}}), which is now {{daysPastDue}} days past due.\n\nI really need to get this resolved. Is there anything preventing payment?\n\n${paymentText}\n\nPlease let me know if we need to discuss this.\n\nThanks,\n${businessName}`
      },
      {
        stepNumber: 4,
        delayDays: d4,
        channel: channels.secondary,
        subject: channels.secondary === "email" ? "Urgent: Payment Required - Invoice {{invoiceNumber}}" : undefined,
        body: `{{customerName}},\n\nInvoice {{invoiceNumber}} for ${{amount}} is now {{daysPastDue}} days past due. I need payment within the next few days to avoid further action.\n\n${paymentText}\n\nIf there's a problem, please call me immediately.\n\n${businessName}`
      },
      {
        stepNumber: 5,
        delayDays: d5,
        channel: channels.primary,
        subject: channels.primary === "email" ? "Final Notice - Invoice {{invoiceNumber}}" : undefined,
        body: `{{customerName}},\n\nThis is a final notice regarding Invoice {{invoiceNumber}} (${{amount}}), now {{daysPastDue}} days past due.\n\nIf I don't receive payment within 5 business days, I will have no choice but to pursue other collection methods.\n\n${paymentText}\n\nPlease contact me today to resolve this.\n\n${businessName}`
      },
    ];
  }

  if (tone === "firm") {
    return [
      {
        stepNumber: 1,
        delayDays: d1,
        channel: channels.primary,
        subject: channels.primary === "email" ? "Payment Due - Invoice {{invoiceNumber}}" : undefined,
        body: `{{customerName}},\n\nInvoice {{invoiceNumber}} for ${{amount}} is due today. Please remit payment immediately.\n\n${paymentText}\n\n${businessName}`
      },
      {
        stepNumber: 2,
        delayDays: d2,
        channel: channels.secondary,
        subject: channels.secondary === "email" ? "PAST DUE - Invoice {{invoiceNumber}}" : undefined,
        body: `{{customerName}},\n\nInvoice {{invoiceNumber}} (${{amount}}) is {{daysPastDue}} days PAST DUE. Payment is required immediately.\n\n${paymentText}\n\n${businessName}`
      },
      {
        stepNumber: 3,
        delayDays: d3,
        channel: channels.primary,
        subject: channels.primary === "email" ? "URGENT: Payment Required - Invoice {{invoiceNumber}}" : undefined,
        body: `{{customerName}},\n\nInvoice {{invoiceNumber}} for ${{amount}} is {{daysPastDue}} days overdue. Immediate payment is required.\n\nFailure to pay may result in:\n• Suspension of future services\n• Referral to collections\n• Legal action\n\n${paymentText}\n\nPay today to avoid escalation.\n\n${businessName}`
      },
      {
        stepNumber: 4,
        delayDays: d4,
        channel: channels.secondary,
        subject: channels.secondary === "email" ? "FINAL NOTICE - Invoice {{invoiceNumber}}" : undefined,
        body: `{{customerName}},\n\nFINAL NOTICE: Invoice {{invoiceNumber}} (${{amount}}) - {{daysPastDue}} days past due.\n\nYou must pay within 48 hours or we will proceed with collection proceedings.\n\n${paymentText}\n\n${businessName}`
      },
      {
        stepNumber: 5,
        delayDays: d5,
        channel: channels.primary,
        subject: channels.primary === "email" ? "DEMAND FOR PAYMENT - Invoice {{invoiceNumber}}" : undefined,
        body: `{{customerName}},\n\nDEMAND FOR PAYMENT\n\nInvoice {{invoiceNumber}}: ${{amount}}\nDays Past Due: {{daysPastDue}}\n\nThis is a formal demand for immediate payment. If full payment is not received within 5 business days, we will pursue all available legal remedies.\n\n${paymentText}\n\n${businessName}`
      },
    ];
  }

  // Professional (default) tone
  return [
    {
      stepNumber: 1,
      delayDays: d1,
      channel: channels.primary,
      subject: channels.primary === "email" ? "Payment Reminder - Invoice {{invoiceNumber}}" : undefined,
      body: channels.primary === "email"
        ? `Dear {{customerName}},\n\nThis is a courtesy reminder that Invoice {{invoiceNumber}} for ${{amount}} is due today.\n\n${paymentText}\n\nIf you have any questions regarding this invoice, please don't hesitate to contact us.\n\nSincerely,\n${businessName}`
        : `{{customerName}}, Invoice {{invoiceNumber}} (${{amount}}) is due today. ${paymentText} - ${businessName}`
    },
    {
      stepNumber: 2,
      delayDays: d2,
      channel: channels.secondary,
      subject: channels.secondary === "email" ? "Past Due Reminder - Invoice {{invoiceNumber}}" : undefined,
      body: `Dear {{customerName}},\n\nInvoice {{invoiceNumber}} for ${{amount}} is now {{daysPastDue}} days past due. We kindly request prompt payment.\n\n${paymentText}\n\nIf payment has already been sent, please disregard this notice.\n\nRegards,\n${businessName}`
    },
    {
      stepNumber: 3,
      delayDays: d3,
      channel: channels.primary,
      subject: channels.primary === "email" ? "Payment Required - Invoice {{invoiceNumber}}" : undefined,
      body: `Dear {{customerName}},\n\nWe have not yet received payment for Invoice {{invoiceNumber}} (${{amount}}), which is now {{daysPastDue}} days past due.\n\nPlease arrange payment within the next 48 hours.\n\n${paymentText}\n\nIf there are any issues preventing payment, please contact us immediately to discuss.\n\nSincerely,\n${businessName}`
    },
    {
      stepNumber: 4,
      delayDays: d4,
      channel: channels.secondary,
      subject: channels.secondary === "email" ? "Urgent: Payment Required - Invoice {{invoiceNumber}}" : undefined,
      body: `Dear {{customerName}},\n\nInvoice {{invoiceNumber}} for ${{amount}} remains unpaid ({{daysPastDue}} days past due).\n\nWe require immediate payment to avoid further collection action.\n\n${paymentText}\n\nPlease contact us if you need to discuss payment arrangements.\n\nSincerely,\n${businessName}`
    },
    {
      stepNumber: 5,
      delayDays: d5,
      channel: channels.primary,
      subject: channels.primary === "email" ? "Final Notice - Invoice {{invoiceNumber}}" : undefined,
      body: `Dear {{customerName}},\n\nThis is a final notice regarding Invoice {{invoiceNumber}} for ${{amount}}, now {{daysPastDue}} days past due.\n\nIf payment is not received within 5 business days, we will be forced to pursue alternative collection methods, which may include:\n• Referral to a collection agency\n• Suspension of services\n• Legal action\n\n${paymentText}\n\nPlease remit payment immediately or contact us to resolve this matter.\n\nSincerely,\n${businessName}`
    },
  ];
}

// ============================================
// FLOW 2: URGENT COLLECTIONS STEPS
// ============================================
function getUrgentSteps(
  delays: number[],
  channels: { primary: "sms" | "email"; secondary: "sms" | "email" },
  businessName: string,
  paymentText: string,
  tone: string
): FlowStep[] {
  const [d1, d2, d3, d4] = delays;

  // Urgent flow is always more aggressive regardless of tone
  return [
    {
      stepNumber: 1,
      delayDays: d1,
      channel: channels.primary,
      subject: channels.primary === "email" ? "URGENT: Payment Required - Invoice {{invoiceNumber}}" : undefined,
      body: `{{customerName}},\n\nInvoice {{invoiceNumber}} for ${{amount}} is seriously overdue ({{daysPastDue}} days past due).\n\nImmediate payment is required.\n\n${paymentText}\n\n${businessName}`
    },
    {
      stepNumber: 2,
      delayDays: d2,
      channel: channels.secondary,
      subject: channels.secondary === "email" ? "URGENT ACTION REQUIRED - Invoice {{invoiceNumber}}" : undefined,
      body: `{{customerName}},\n\nInvoice {{invoiceNumber}} (${{amount}}) - {{daysPastDue}} days past due.\n\nPay immediately to avoid collection proceedings.\n\n${paymentText}\n\n${businessName}`
    },
    {
      stepNumber: 3,
      delayDays: d3,
      channel: channels.primary,
      subject: channels.primary === "email" ? "FINAL WARNING - Invoice {{invoiceNumber}}" : undefined,
      body: `{{customerName}},\n\nFINAL WARNING: Invoice {{invoiceNumber}} (${{amount}}) is {{daysPastDue}} days overdue.\n\nYou have 48 hours to pay before we proceed with:\n• Collection agency referral\n• Legal action\n• Suspension of all services\n\n${paymentText}\n\nContact us immediately.\n\n${businessName}`
    },
    {
      stepNumber: 4,
      delayDays: d4,
      channel: channels.secondary,
      subject: channels.secondary === "email" ? "NOTICE OF COLLECTION ACTION - Invoice {{invoiceNumber}}" : undefined,
      body: `{{customerName}},\n\nNotice of Intent to Pursue Collection\n\nInvoice: {{invoiceNumber}}\nAmount: ${{amount}}\nDays Past Due: {{daysPastDue}}\n\nThis account will be referred to our collection agency within 3 business days if payment is not received.\n\n${paymentText}\n\nThis is your final opportunity to resolve this directly.\n\n${businessName}`
    },
  ];
}

// ============================================
// FLOW 3: NEW CUSTOMER WELCOME STEPS
// ============================================
function getWelcomeSteps(
  channels: { primary: "sms" | "email"; secondary: "sms" | "email" },
  businessName: string,
  paymentText: string
): FlowStep[] {
  return [
    {
      stepNumber: 1,
      delayDays: 0,
      channel: "email", // Always email for welcome
      subject: "Welcome! Your First Invoice from {{businessName}}",
      body: `Dear {{customerName}},\n\nThank you for choosing ${businessName}! We're excited to work with you.\n\nAttached is your first invoice ({{invoiceNumber}}) for ${{amount}}, due on {{dueDate}}.\n\n${paymentText}\n\nWe pride ourselves on quality work and excellent customer service. If you have any questions about this invoice or our services, please don't hesitate to reach out.\n\nWe look forward to a great working relationship!\n\nBest regards,\n${businessName}`
    },
    {
      stepNumber: 2,
      delayDays: 7,
      channel: channels.primary,
      subject: channels.primary === "email" ? "Friendly Check-In - Invoice {{invoiceNumber}}" : undefined,
      body: `Hi {{customerName}},\n\nJust checking in to make sure you received Invoice {{invoiceNumber}} (${{amount}}) and that everything looks good.\n\nThe invoice is due on {{dueDate}}. Let me know if you have any questions!\n\n${paymentText}\n\nThanks,\n${businessName}`
    },
    {
      stepNumber: 3,
      delayDays: 14, // On due date
      channel: channels.secondary,
      subject: channels.secondary === "email" ? "Payment Due Today - Invoice {{invoiceNumber}}" : undefined,
      body: `Hi {{customerName}},\n\nJust a friendly reminder that Invoice {{invoiceNumber}} for ${{amount}} is due today.\n\n${paymentText}\n\nThanks for your business!\n\n${businessName}`
    },
  ];
}

// ============================================
// FLOW 4: PARTIAL PAYMENT STEPS
// ============================================
function getPartialPaymentSteps(
  channels: { primary: "sms" | "email"; secondary: "sms" | "email" },
  businessName: string,
  paymentText: string,
  tone: string
): FlowStep[] {
  return [
    {
      stepNumber: 1,
      delayDays: 0,
      channel: "email", // Always email for thank you
      subject: "Thank You! Remaining Balance - Invoice {{invoiceNumber}}",
      body: `Dear {{customerName}},\n\nThank you for your recent payment on Invoice {{invoiceNumber}}!\n\nWe received ${{amountPaid}}, leaving a remaining balance of ${{amountRemaining}}.\n\n${paymentText}\n\nWe appreciate your business!\n\nBest regards,\n${businessName}`
    },
    {
      stepNumber: 2,
      delayDays: 7,
      channel: channels.primary,
      subject: channels.primary === "email" ? "Remaining Balance - Invoice {{invoiceNumber}}" : undefined,
      body: `Hi {{customerName}},\n\nQuick reminder about the remaining balance of ${{amountRemaining}} on Invoice {{invoiceNumber}}.\n\n${paymentText}\n\nLet me know if you need anything!\n\n${businessName}`
    },
    {
      stepNumber: 3,
      delayDays: 14,
      channel: channels.secondary,
      subject: channels.secondary === "email" ? "Final Balance Due - Invoice {{invoiceNumber}}" : undefined,
      body: `{{customerName}},\n\nThe remaining balance of ${{amountRemaining}} on Invoice {{invoiceNumber}} is now due.\n\nPlease complete payment at your earliest convenience.\n\n${paymentText}\n\nThank you,\n${businessName}`
    },
  ];
}

// ============================================
// FLOW 5: HIGH-VALUE INVOICE STEPS
// ============================================
function getHighValueSteps(
  delays: number[],
  channels: { primary: "sms" | "email"; secondary: "sms" | "email" },
  businessName: string,
  contactPhone: string,
  paymentText: string,
  tone: string
): FlowStep[] {
  const [d1, d2, d3, d4, d5] = delays;

  return [
    {
      stepNumber: 1,
      delayDays: d1, // -3 days (before due date)
      channel: "email", // Always email for courtesy notice
      subject: "Upcoming Payment - Invoice {{invoiceNumber}}",
      body: `Dear {{customerName}},\n\nThis is a courtesy notice that Invoice {{invoiceNumber}} for ${{amount}} will be due in 3 days ({{dueDate}}).\n\nFor larger invoices like this, we're happy to discuss payment arrangements if needed. Feel free to call us at ${contactPhone || "our office"}.\n\n${paymentText}\n\nThank you for your business!\n\nBest regards,\n${businessName}`
    },
    {
      stepNumber: 2,
      delayDays: d2, // Due date
      channel: channels.primary,
      subject: channels.primary === "email" ? "Payment Due - Invoice {{invoiceNumber}}" : undefined,
      body: `Dear {{customerName}},\n\nInvoice {{invoiceNumber}} for ${{amount}} is due today.\n\n${paymentText}\n\nIf you need to set up a payment plan, please contact us at ${contactPhone || "our office"}. We're here to work with you.\n\nSincerely,\n${businessName}`
    },
    {
      stepNumber: 3,
      delayDays: d3,
      channel: channels.secondary,
      subject: channels.secondary === "email" ? "Payment Reminder - Invoice {{invoiceNumber}}" : undefined,
      body: `Dear {{customerName}},\n\nInvoice {{invoiceNumber}} (${{amount}}) is now {{daysPastDue}} days past due.\n\nFor an invoice of this size, we want to work with you. If you're experiencing any payment difficulties, please call me at ${contactPhone || "our office"} to discuss options.\n\n${paymentText}\n\nWe value your business and want to find a solution that works for both of us.\n\nRegards,\n${businessName}`
    },
    {
      stepNumber: 4,
      delayDays: d4,
      channel: channels.primary,
      subject: channels.primary === "email" ? "Urgent: Payment Required - Invoice {{invoiceNumber}}" : undefined,
      body: `Dear {{customerName}},\n\nInvoice {{invoiceNumber}} for ${{amount}} is {{daysPastDue}} days overdue.\n\nGiven the size of this invoice, I need to speak with you directly. Please call me at ${contactPhone || "our office"} by end of day to arrange payment or discuss a payment plan.\n\n${paymentText}\n\nIf I don't hear from you, we'll need to proceed with collection procedures.\n\nSincerely,\n${businessName}`
    },
    {
      stepNumber: 5,
      delayDays: d5,
      channel: channels.secondary,
      subject: channels.secondary === "email" ? "Final Notice - Invoice {{invoiceNumber}}" : undefined,
      body: `Dear {{customerName}},\n\nFinal notice regarding Invoice {{invoiceNumber}} for ${{amount}}, now {{daysPastDue}} days past due.\n\nWe have attempted to work with you on this large balance, but payment has not been received.\n\nYou have 5 business days to:\n1. Pay the full balance: ${paymentText}\n2. Call us to set up an immediate payment plan: ${contactPhone || "our office"}\n\nAfter 5 days, we will pursue all available collection remedies.\n\nSincerely,\n${businessName}`
    },
  ];
}
