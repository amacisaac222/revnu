/**
 * Default fallback sequence templates
 * Used when AI generation fails or is unavailable
 */

interface SequenceStep {
  stepNumber: number;
  delayDays: number;
  channel: "sms" | "email";
  subject?: string;
  body: string;
}

interface SequenceTemplate {
  name: string;
  description: string;
  triggerDaysPastDue: number;
  steps: SequenceStep[];
}

interface DefaultSequencesParams {
  businessName: string;
  industry: string;
  communicationTone: "friendly" | "professional" | "firm" | "casual";
  followUpFrequency: "aggressive" | "moderate" | "relaxed";
  preferredChannels: { sms?: boolean; email?: boolean; phone?: boolean };
}

export function getDefaultSequences(params: DefaultSequencesParams): { sequences: SequenceTemplate[] } {
  const { businessName, communicationTone, followUpFrequency, preferredChannels } = params;

  // Determine primary channel
  const primaryChannel = preferredChannels.email ? "email" : "sms";
  const secondaryChannel = preferredChannels.sms && primaryChannel === "email" ? "sms" : "email";

  // Build sequences based on follow-up frequency
  const sequences: SequenceTemplate[] = [];

  // Standard sequence (always included)
  sequences.push({
    name: `Standard Collections - ${businessName}`,
    description: "Standard payment reminder sequence starting on invoice due date",
    triggerDaysPastDue: 0,
    steps: getStepsForTone(communicationTone, followUpFrequency, primaryChannel, secondaryChannel, businessName, false),
  });

  // Add urgent sequence for aggressive follow-up
  if (followUpFrequency === "aggressive") {
    sequences.push({
      name: `Urgent Collections - ${businessName}`,
      description: "Escalated sequence for invoices 15+ days past due",
      triggerDaysPastDue: 15,
      steps: getStepsForTone(communicationTone, followUpFrequency, primaryChannel, secondaryChannel, businessName, true),
    });
  }

  return { sequences };
}

function getStepsForTone(
  tone: string,
  frequency: string,
  primaryChannel: "sms" | "email",
  secondaryChannel: "sms" | "email",
  businessName: string,
  isUrgent: boolean
): SequenceStep[] {
  const delays = getDelays(frequency, isUrgent);

  switch (tone) {
    case "friendly":
      return getFriendlySteps(delays, primaryChannel, secondaryChannel, businessName);
    case "firm":
      return getFirmSteps(delays, primaryChannel, secondaryChannel, businessName);
    case "casual":
      return getCasualSteps(delays, primaryChannel, secondaryChannel, businessName);
    case "professional":
    default:
      return getProfessionalSteps(delays, primaryChannel, secondaryChannel, businessName);
  }
}

function getDelays(frequency: string, isUrgent: boolean): number[] {
  if (isUrgent) {
    return frequency === "aggressive" ? [0, 2, 4, 7] : [0, 3, 7, 14];
  }

  switch (frequency) {
    case "aggressive":
      return [0, 3, 7, 10, 14];
    case "relaxed":
      return [0, 7, 14, 21];
    case "moderate":
    default:
      return [0, 5, 10, 15];
  }
}

// ============================================
// PROFESSIONAL TONE
// ============================================

function getProfessionalSteps(
  delays: number[],
  primaryChannel: "sms" | "email",
  secondaryChannel: "sms" | "email",
  businessName: string
): SequenceStep[] {
  const steps: SequenceStep[] = [];

  // Step 1: Initial reminder (primary channel)
  if (primaryChannel === "email") {
    steps.push({
      stepNumber: 1,
      delayDays: delays[0],
      channel: "email",
      subject: "Payment Due - Invoice {{invoiceNumber}}",
      body: `Dear {{customerName}},

This is a reminder that invoice {{invoiceNumber}} for {{amount}} is now due for payment.

Invoice Date: [Invoice Date]
Due Date: [Due Date]
Amount Due: {{amount}}

Please submit payment at your earliest convenience using the link below:
{{paymentLink}}

If you have already sent payment, please disregard this notice. If you have any questions regarding this invoice, please contact us.

Thank you for your business.

Best regards,
${businessName}`,
    });
  } else {
    steps.push({
      stepNumber: 1,
      delayDays: delays[0],
      channel: "sms",
      body: `Hi {{customerName}}, this is ${businessName}. Your invoice {{invoiceNumber}} for {{amount}} is now due. Please pay here: {{paymentLink}}. Reply STOP to opt out.`,
    });
  }

  // Step 2: Follow-up (secondary channel)
  if (secondaryChannel === "email") {
    steps.push({
      stepNumber: 2,
      delayDays: delays[1],
      channel: "email",
      subject: "Payment Reminder - Invoice {{invoiceNumber}}",
      body: `Dear {{customerName}},

We have not yet received payment for invoice {{invoiceNumber}} in the amount of {{amount}}.

This invoice is now {{daysPastDue}} days past due. Please submit payment immediately to avoid any late fees or service interruptions.

Pay now: {{paymentLink}}

If you have any questions or need to arrange a payment plan, please contact us as soon as possible.

Thank you,
${businessName}`,
    });
  } else {
    steps.push({
      stepNumber: 2,
      delayDays: delays[1],
      channel: "sms",
      body: `{{customerName}}, invoice {{invoiceNumber}} for {{amount}} is {{daysPastDue}} days past due. Please pay now: {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
    });
  }

  // Step 3: Escalation (primary channel)
  if (primaryChannel === "email") {
    steps.push({
      stepNumber: 3,
      delayDays: delays[2],
      channel: "email",
      subject: "Urgent: Payment Required - Invoice {{invoiceNumber}}",
      body: `Dear {{customerName}},

This is an urgent notice regarding invoice {{invoiceNumber}} for {{amount}}, which is now {{daysPastDue}} days past due.

We require immediate payment to avoid:
- Additional late fees
- Collection proceedings
- Service suspension

Pay immediately: {{paymentLink}}

If you are experiencing financial difficulty, please contact us today to discuss payment arrangements.

${businessName}
[Contact Information]`,
    });
  } else {
    steps.push({
      stepNumber: 3,
      delayDays: delays[2],
      channel: "sms",
      body: `URGENT: {{customerName}}, invoice {{invoiceNumber}} for {{amount}} is {{daysPastDue}} days past due. Immediate payment required: {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
    });
  }

  // Step 4: Final notice (alternate channel)
  const finalChannel = steps[steps.length - 1].channel === "email" ? "sms" : "email";
  if (delays[3]) {
    if (finalChannel === "email") {
      steps.push({
        stepNumber: 4,
        delayDays: delays[3],
        channel: "email",
        subject: "Final Notice - Invoice {{invoiceNumber}}",
        body: `Dear {{customerName}},

FINAL NOTICE: Invoice {{invoiceNumber}} for {{amount}} remains unpaid after {{daysPastDue}} days.

This is your final opportunity to pay before this account is sent to collections.

Pay now: {{paymentLink}}

Failure to respond will result in:
- Collection agency referral
- Negative credit reporting
- Legal action

Contact us immediately: [Phone Number]

${businessName}`,
      });
    } else {
      steps.push({
        stepNumber: 4,
        delayDays: delays[3],
        channel: "sms",
        body: `FINAL NOTICE: {{customerName}}, invoice {{invoiceNumber}} ({{amount}}) is {{daysPastDue}} days overdue. Pay now to avoid collections: {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
      });
    }
  }

  return steps;
}

// ============================================
// FRIENDLY TONE
// ============================================

function getFriendlySteps(
  delays: number[],
  primaryChannel: "sms" | "email",
  secondaryChannel: "sms" | "email",
  businessName: string
): SequenceStep[] {
  const steps: SequenceStep[] = [];

  // Step 1: Gentle reminder
  if (primaryChannel === "email") {
    steps.push({
      stepNumber: 1,
      delayDays: delays[0],
      channel: "email",
      subject: "Friendly Reminder: Invoice {{invoiceNumber}}",
      body: `Hi {{customerName}},

Just a friendly reminder that invoice {{invoiceNumber}} for {{amount}} is due today.

We understand things get busy! If you have a moment, you can easily pay online:
{{paymentLink}}

If you've already sent payment, thank you so much! Please disregard this message.

Have questions? We're here to help - just reply to this email.

Thanks for being a valued customer!

${businessName}`,
    });
  } else {
    steps.push({
      stepNumber: 1,
      delayDays: delays[0],
      channel: "sms",
      body: `Hi {{customerName}}! Friendly reminder from ${businessName} - invoice {{invoiceNumber}} for {{amount}} is due today. Pay here: {{paymentLink}}. Reply STOP to opt out.`,
    });
  }

  // Step 2: Gentle follow-up
  if (secondaryChannel === "email") {
    steps.push({
      stepNumber: 2,
      delayDays: delays[1],
      channel: "email",
      subject: "Following Up: Invoice {{invoiceNumber}}",
      body: `Hi {{customerName}},

We hope all is well! We wanted to follow up on invoice {{invoiceNumber}} for {{amount}}, which is now a few days past due.

We understand that sometimes things slip through the cracks. If you have a chance, we'd really appreciate payment at your earliest convenience:
{{paymentLink}}

If there's anything we can help with or if you need to discuss payment options, please don't hesitate to reach out. We're happy to work with you!

Thanks so much,
${businessName}`,
    });
  } else {
    steps.push({
      stepNumber: 2,
      delayDays: delays[1],
      channel: "sms",
      body: `Hi {{customerName}}, just checking in about invoice {{invoiceNumber}} ({{amount}}). It's a few days overdue - can you take care of it? {{paymentLink}}. Thanks! ${businessName}. Reply STOP to opt out.`,
    });
  }

  // Step 3: More direct but still friendly
  if (primaryChannel === "email") {
    steps.push({
      stepNumber: 3,
      delayDays: delays[2],
      channel: "email",
      subject: "We Need Your Help: Invoice {{invoiceNumber}}",
      body: `Hi {{customerName}},

We really need your help! Invoice {{invoiceNumber}} for {{amount}} is now {{daysPastDue}} days past due, and we haven't received payment yet.

We understand that unexpected things come up. If you're experiencing any difficulties, please let us know - we're happy to work with you on a payment plan.

Otherwise, we'd really appreciate if you could take care of this today:
{{paymentLink}}

Thanks for your understanding and cooperation!

${businessName}`,
    });
  } else {
    steps.push({
      stepNumber: 3,
      delayDays: delays[2],
      channel: "sms",
      body: `Hi {{customerName}}, we really need your help with invoice {{invoiceNumber}} ({{amount}}) - it's {{daysPastDue}} days overdue. Can you pay today? {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
    });
  }

  // Step 4: Final friendly notice
  if (delays[3]) {
    const finalChannel = steps[steps.length - 1].channel === "email" ? "sms" : "email";
    if (finalChannel === "email") {
      steps.push({
        stepNumber: 4,
        delayDays: delays[3],
        channel: "email",
        subject: "Important: We Need to Hear From You",
        body: `Hi {{customerName}},

We've reached out several times about invoice {{invoiceNumber}} for {{amount}}, which is now {{daysPastDue}} days overdue.

We really value our relationship with you, but we need to resolve this balance. Please either:

1. Pay online now: {{paymentLink}}
2. Call us to discuss payment arrangements: [Phone]

We want to work with you, but we need to hear from you today. If we don't receive payment or hear from you soon, we'll unfortunately have no choice but to take further action.

Please reach out - we're here to help!

${businessName}`,
      });
    } else {
      steps.push({
        stepNumber: 4,
        delayDays: delays[3],
        channel: "sms",
        body: `{{customerName}}, we really need to resolve invoice {{invoiceNumber}} ({{amount}}) - {{daysPastDue}} days overdue. Please pay or call us today: {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
      });
    }
  }

  return steps;
}

// ============================================
// FIRM TONE
// ============================================

function getFirmSteps(
  delays: number[],
  primaryChannel: "sms" | "email",
  secondaryChannel: "sms" | "email",
  businessName: string
): SequenceStep[] {
  const steps: SequenceStep[] = [];

  // Step 1: Direct notice
  if (primaryChannel === "email") {
    steps.push({
      stepNumber: 1,
      delayDays: delays[0],
      channel: "email",
      subject: "Payment Required: Invoice {{invoiceNumber}}",
      body: `{{customerName}},

Invoice {{invoiceNumber}} for {{amount}} is due today. Payment is required immediately.

Amount Due: {{amount}}
Due Date: [Due Date]

Submit payment now: {{paymentLink}}

Late fees will be assessed for overdue payments.

${businessName}`,
    });
  } else {
    steps.push({
      stepNumber: 1,
      delayDays: delays[0],
      channel: "sms",
      body: `{{customerName}}, invoice {{invoiceNumber}} for {{amount}} is due. Payment required now: {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
    });
  }

  // Step 2: Firm follow-up
  if (secondaryChannel === "email") {
    steps.push({
      stepNumber: 2,
      delayDays: delays[1],
      channel: "email",
      subject: "OVERDUE: Invoice {{invoiceNumber}} - Action Required",
      body: `{{customerName}},

Invoice {{invoiceNumber}} for {{amount}} is now {{daysPastDue}} days OVERDUE. We have not received payment.

This is unacceptable. Payment must be submitted immediately.

Pay now: {{paymentLink}}

Late fees are accruing. Further delays will result in service suspension and collection proceedings.

Contact us immediately if there is a problem: [Phone]

${businessName}`,
    });
  } else {
    steps.push({
      stepNumber: 2,
      delayDays: delays[1],
      channel: "sms",
      body: `{{customerName}}, invoice {{invoiceNumber}} ({{amount}}) is OVERDUE. Payment required immediately: {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
    });
  }

  // Step 3: Strong escalation
  if (primaryChannel === "email") {
    steps.push({
      stepNumber: 3,
      delayDays: delays[2],
      channel: "email",
      subject: "FINAL DEMAND: Invoice {{invoiceNumber}}",
      body: `{{customerName}},

This is a FINAL DEMAND for payment of invoice {{invoiceNumber}} totaling {{amount}}, now {{daysPastDue}} days past due.

You have ignored multiple payment requests. This is unacceptable.

IMMEDIATE PAYMENT REQUIRED: {{paymentLink}}

If payment is not received within 48 hours:
- Your account will be sent to collections
- Additional fees will be assessed
- Legal action will be initiated
- Your credit will be negatively impacted

Pay now or contact us immediately: [Phone]

${businessName}`,
    });
  } else {
    steps.push({
      stepNumber: 3,
      delayDays: delays[2],
      channel: "sms",
      body: `FINAL DEMAND: {{customerName}}, pay invoice {{invoiceNumber}} ({{amount}}) NOW or face collections. {{daysPastDue}} days overdue: {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
    });
  }

  // Step 4: Collections warning
  if (delays[3]) {
    const finalChannel = steps[steps.length - 1].channel === "email" ? "sms" : "email";
    if (finalChannel === "email") {
      steps.push({
        stepNumber: 4,
        delayDays: delays[3],
        channel: "email",
        subject: "COLLECTIONS NOTICE: Invoice {{invoiceNumber}}",
        body: `{{customerName}},

This is your FINAL NOTICE before collections.

Invoice {{invoiceNumber}} - {{amount}} - {{daysPastDue}} days past due

You have repeatedly failed to pay despite multiple notices. This account will be referred to our collection agency and legal counsel within 24 hours unless payment is received in full.

LAST CHANCE TO PAY: {{paymentLink}}

Collection proceedings will result in:
- Additional collection fees (up to 40% of balance)
- Negative credit reporting
- Possible legal judgment and wage garnishment
- Court costs and attorney fees

This is not a threat. This is a promise. Pay now.

${businessName}
[Contact Information]`,
      });
    } else {
      steps.push({
        stepNumber: 4,
        delayDays: delays[3],
        channel: "sms",
        body: `COLLECTIONS NOTICE: {{customerName}}, invoice {{invoiceNumber}} ({{amount}}) goes to collections in 24hrs unless paid: {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
      });
    }
  }

  return steps;
}

// ============================================
// CASUAL TONE
// ============================================

function getCasualSteps(
  delays: number[],
  primaryChannel: "sms" | "email",
  secondaryChannel: "sms" | "email",
  businessName: string
): SequenceStep[] {
  const steps: SequenceStep[] = [];

  // Step 1: Casual reminder
  if (primaryChannel === "email") {
    steps.push({
      stepNumber: 1,
      delayDays: delays[0],
      channel: "email",
      subject: "Hey! Invoice {{invoiceNumber}} is due",
      body: `Hey {{customerName}},

Hope you're doing well! Just wanted to let you know that invoice {{invoiceNumber}} for {{amount}} is due today.

You can knock it out real quick here:
{{paymentLink}}

If you've already paid, awesome! Just ignore this.

Hit me back if you have any questions!

Cheers,
${businessName}`,
    });
  } else {
    steps.push({
      stepNumber: 1,
      delayDays: delays[0],
      channel: "sms",
      body: `Hey {{customerName}}! Your invoice {{invoiceNumber}} for {{amount}} is due. Quick payment link: {{paymentLink}}. Thanks! - ${businessName}. Reply STOP to opt out.`,
    });
  }

  // Step 2: Friendly nudge
  if (secondaryChannel === "email") {
    steps.push({
      stepNumber: 2,
      delayDays: delays[1],
      channel: "email",
      subject: "Quick reminder about invoice {{invoiceNumber}}",
      body: `Hey {{customerName}},

Just circling back on invoice {{invoiceNumber}} for {{amount}} - it's a few days past due now.

No worries if you've been busy! Happens to everyone. Can you take care of it when you get a chance?

{{paymentLink}}

Let me know if something's up or if you need to work out a different arrangement. We're flexible!

Thanks!
${businessName}`,
    });
  } else {
    steps.push({
      stepNumber: 2,
      delayDays: delays[1],
      channel: "sms",
      body: `Hey {{customerName}}, just a heads up - invoice {{invoiceNumber}} ({{amount}}) is a bit overdue. Can you handle it? {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
    });
  }

  // Step 3: More serious but still casual
  if (primaryChannel === "email") {
    steps.push({
      stepNumber: 3,
      delayDays: delays[2],
      channel: "email",
      subject: "We gotta talk about invoice {{invoiceNumber}}",
      body: `Hey {{customerName}},

Okay, so invoice {{invoiceNumber}} for {{amount}} is now {{daysPastDue}} days overdue and I really need you to take care of this.

I get it - life happens. But I've gotta keep the lights on too, you know?

Here's the payment link again: {{paymentLink}}

If money's tight right now, just shoot me a message and we can figure something out. But I need to hear from you, like, today.

Cool?

${businessName}`,
    });
  } else {
    steps.push({
      stepNumber: 3,
      delayDays: delays[2],
      channel: "sms",
      body: `{{customerName}}, real talk - invoice {{invoiceNumber}} ({{amount}}) is {{daysPastDue}} days late. I need you to pay or call me: {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
    });
  }

  // Step 4: Last casual notice
  if (delays[3]) {
    const finalChannel = steps[steps.length - 1].channel === "email" ? "sms" : "email";
    if (finalChannel === "email") {
      steps.push({
        stepNumber: 4,
        delayDays: delays[3],
        channel: "email",
        subject: "Last call on invoice {{invoiceNumber}}",
        body: `{{customerName}},

Look, I don't wanna be that person, but invoice {{invoiceNumber}} for {{amount}} has been sitting here for {{daysPastDue}} days and I haven't heard from you.

I've tried to be cool about this, but I'm running a business here and I need to get paid.

Pay now: {{paymentLink}}

If I don't get payment or at least hear from you by tomorrow, I'm gonna have to send this to collections. I really don't want to do that, so please just take care of it or call me.

Seriously - let's get this sorted.

${businessName}
[Phone]`,
      });
    } else {
      steps.push({
        stepNumber: 4,
        delayDays: delays[3],
        channel: "sms",
        body: `{{customerName}}, last chance on invoice {{invoiceNumber}} ({{amount}}) before collections. {{daysPastDue}} days late. Pay now: {{paymentLink}}. ${businessName}. Reply STOP to opt out.`,
      });
    }
  }

  return steps;
}
