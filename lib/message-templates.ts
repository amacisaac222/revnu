/**
 * TCPA-Compliant Message Templates
 * Pre-built templates for SMS and Email payment reminders
 */

export interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  category: "friendly" | "firm" | "final" | "thank_you";
  channels: ("sms" | "email" | "both")[];
  daysPastDueMin: number;
  daysPastDueMax: number;
  smsTemplate?: string;
  emailSubject?: string;
  emailBody?: string;
  requiresConsent: boolean;
  includesOptOut: boolean;
}

// Template variables available:
// {customerFirstName} - Customer's first name
// {customerFullName} - Customer's full name
// {businessName} - Organization's business name
// {invoiceNumber} - Invoice number
// {invoiceAmount} - Amount due
// {dueDate} - Original due date
// {daysPastDue} - Number of days past due
// {paymentLink} - Payment link URL
// {businessPhone} - Business phone number
// {businessEmail} - Business email

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  // ========================================
  // FRIENDLY REMINDERS (0-7 days past due)
  // ========================================
  {
    id: "friendly-sms-1",
    name: "Friendly Reminder - SMS",
    description: "Gentle SMS reminder for recently overdue invoices",
    category: "friendly",
    channels: ["sms"],
    daysPastDueMin: 0,
    daysPastDueMax: 7,
    smsTemplate:
      "Hi {customerFirstName}, this is {businessName}. Just a friendly reminder that invoice #{invoiceNumber} for ${invoiceAmount} was due on {dueDate}. Pay here: {paymentLink} Reply STOP to opt out.",
    requiresConsent: true,
    includesOptOut: true,
  },
  {
    id: "friendly-email-1",
    name: "Friendly Reminder - Email",
    description: "Polite email reminder for recently overdue invoices",
    category: "friendly",
    channels: ["email"],
    daysPastDueMin: 0,
    daysPastDueMax: 7,
    emailSubject: "Friendly Reminder: Invoice #{invoiceNumber} Payment",
    emailBody: `Hi {customerFirstName},

I hope this message finds you well. This is a friendly reminder that invoice #{invoiceNumber} for ${invoiceAmount} was due on {dueDate}.

We understand that things can get busy, so we wanted to send a gentle reminder. You can easily make a payment using the link below:

Payment Link: {paymentLink}

If you've already sent payment, please disregard this message and accept our thanks!

If you have any questions about this invoice or need to discuss payment arrangements, please don't hesitate to reach out.

Best regards,
{businessName}
{businessPhone}

---
To stop receiving payment reminders via email, reply with "UNSUBSCRIBE" in the subject line.`,
    requiresConsent: true,
    includesOptOut: true,
  },
  {
    id: "friendly-both-1",
    name: "Friendly Reminder - SMS & Email",
    description: "Gentle multi-channel reminder for recently overdue invoices",
    category: "friendly",
    channels: ["both"],
    daysPastDueMin: 0,
    daysPastDueMax: 7,
    smsTemplate:
      "Hi {customerFirstName}! Friendly reminder from {businessName}: Invoice #{invoiceNumber} ($${invoiceAmount}) is now due. Pay here: {paymentLink} Reply STOP to opt out.",
    emailSubject: "Payment Reminder: Invoice #{invoiceNumber}",
    emailBody: `Hi {customerFirstName},

This is a friendly reminder that invoice #{invoiceNumber} for ${invoiceAmount} is now past its due date of {dueDate}.

Payment Link: {paymentLink}

If you've already paid, thank you! Otherwise, please submit payment at your earliest convenience.

Questions? Contact us at {businessPhone} or reply to this email.

Thank you,
{businessName}

---
To unsubscribe from payment reminders, reply with "UNSUBSCRIBE".`,
    requiresConsent: true,
    includesOptOut: true,
  },

  // ========================================
  // FIRM REMINDERS (8-30 days past due)
  // ========================================
  {
    id: "firm-sms-1",
    name: "Firm Reminder - SMS",
    description: "More direct SMS reminder for overdue invoices",
    category: "firm",
    channels: ["sms"],
    daysPastDueMin: 8,
    daysPastDueMax: 30,
    smsTemplate:
      "{businessName}: Invoice #{invoiceNumber} for ${invoiceAmount} is now {daysPastDue} days overdue. Please pay immediately: {paymentLink} or call {businessPhone}. Reply STOP to opt out.",
    requiresConsent: true,
    includesOptOut: true,
  },
  {
    id: "firm-email-1",
    name: "Firm Reminder - Email",
    description: "Direct email reminder emphasizing urgency",
    category: "firm",
    channels: ["email"],
    daysPastDueMin: 8,
    daysPastDueMax: 30,
    emailSubject: "URGENT: Invoice #{invoiceNumber} - {daysPastDue} Days Overdue",
    emailBody: `Dear {customerFullName},

This is an important notice regarding invoice #{invoiceNumber} for ${invoiceAmount}, which is now {daysPastDue} days past due (original due date: {dueDate}).

IMMEDIATE ACTION REQUIRED

Please submit payment as soon as possible to avoid further collection actions:
Payment Link: {paymentLink}

If you are experiencing difficulty making payment, please contact us immediately at {businessPhone} to discuss payment arrangements. We are willing to work with you, but we must hear from you.

WHAT HAPPENS NEXT:
If we do not receive payment or hear from you within 7 days, this account may be subject to:
• Late fees and interest charges
• Suspension of services
• Reporting to credit bureaus
• Further collection actions

We value your business and want to resolve this matter amicably. Please take action today.

Sincerely,
{businessName}
Accounts Receivable
{businessPhone}
{businessEmail}

---
If you have questions about this invoice or believe there is an error, please contact us immediately.
To unsubscribe from payment reminders, reply with "UNSUBSCRIBE".`,
    requiresConsent: true,
    includesOptOut: true,
  },
  {
    id: "firm-both-1",
    name: "Firm Reminder - SMS & Email",
    description: "Urgent multi-channel reminder for overdue invoices",
    category: "firm",
    channels: ["both"],
    daysPastDueMin: 8,
    daysPastDueMax: 30,
    smsTemplate:
      "URGENT - {businessName}: Invoice #{invoiceNumber} ($${invoiceAmount}) is {daysPastDue} days overdue. Pay now: {paymentLink} or call {businessPhone}. Reply STOP to opt out.",
    emailSubject: "URGENT: Payment Required - Invoice #{invoiceNumber}",
    emailBody: `Dear {customerFullName},

URGENT NOTICE: Invoice #{invoiceNumber} for ${invoiceAmount} is now {daysPastDue} days past due.

Original Due Date: {dueDate}
Amount Due: ${invoiceAmount}
Days Overdue: {daysPastDue}

IMMEDIATE ACTION REQUIRED:
Pay now: {paymentLink}

If you cannot pay in full, contact us at {businessPhone} to arrange a payment plan. We must hear from you within 7 days to avoid further collection actions.

Sincerely,
{businessName}
{businessPhone}

---
To unsubscribe, reply "UNSUBSCRIBE".`,
    requiresConsent: true,
    includesOptOut: true,
  },

  // ========================================
  // FINAL NOTICES (30+ days past due)
  // ========================================
  {
    id: "final-sms-1",
    name: "Final Notice - SMS",
    description: "Final warning before collections or legal action",
    category: "final",
    channels: ["sms"],
    daysPastDueMin: 30,
    daysPastDueMax: 999,
    smsTemplate:
      "FINAL NOTICE - {businessName}: Invoice #{invoiceNumber} ($${invoiceAmount}) is {daysPastDue} days overdue. Pay by [DATE] or account goes to collections: {paymentLink} Call {businessPhone} ASAP. Reply STOP to opt out.",
    requiresConsent: true,
    includesOptOut: true,
  },
  {
    id: "final-email-1",
    name: "Final Notice - Email",
    description: "Final warning email before escalation",
    category: "final",
    channels: ["email"],
    daysPastDueMin: 30,
    daysPastDueMax: 999,
    emailSubject: "FINAL NOTICE: Invoice #{invoiceNumber} - Immediate Action Required",
    emailBody: `FINAL NOTICE

Dear {customerFullName},

This is your FINAL NOTICE regarding invoice #{invoiceNumber} for ${invoiceAmount}, which is now {daysPastDue} days past due.

ACCOUNT SUMMARY:
Invoice Number: #{invoiceNumber}
Original Due Date: {dueDate}
Amount Due: ${invoiceAmount}
Days Overdue: {daysPastDue}
Status: SERIOUSLY PAST DUE

IMMEDIATE PAYMENT REQUIRED

You have until [SPECIFIC DATE - 7 days from send] to pay this invoice in full or contact us to arrange payment. After this date, your account will be escalated to the following actions:

1. Referral to a third-party collection agency
2. Reporting to credit bureaus (which will negatively impact your credit score)
3. Potential legal action to recover the debt
4. Additional collection fees and legal costs added to your balance

PAY NOW: {paymentLink}

CANNOT PAY IN FULL?
If you are experiencing financial hardship, contact us IMMEDIATELY at {businessPhone} or reply to this email. We may be able to arrange a payment plan, but we must hear from you before [DEADLINE DATE].

DISPUTE THIS DEBT?
If you believe this debt is in error or you dispute the amount, you have the right to request validation of the debt. Contact us in writing within 30 days of receiving this notice.

This is an attempt to collect a debt. Any information obtained will be used for that purpose.

{businessName}
Accounts Receivable Department
{businessPhone}
{businessEmail}

---
This is a final attempt to resolve this matter without further action.
To unsubscribe from payment reminders, reply with "UNSUBSCRIBE".`,
    requiresConsent: true,
    includesOptOut: true,
  },

  // ========================================
  // THANK YOU MESSAGES
  // ========================================
  {
    id: "thankyou-sms-1",
    name: "Payment Received - SMS",
    description: "Thank you message after payment received",
    category: "thank_you",
    channels: ["sms"],
    daysPastDueMin: 0,
    daysPastDueMax: 0,
    smsTemplate:
      "Thank you {customerFirstName}! We received your payment of ${invoiceAmount} for invoice #{invoiceNumber}. Receipt: {paymentLink} - {businessName}",
    requiresConsent: false,
    includesOptOut: false,
  },
  {
    id: "thankyou-email-1",
    name: "Payment Received - Email",
    description: "Thank you email with payment confirmation",
    category: "thank_you",
    channels: ["email"],
    daysPastDueMin: 0,
    daysPastDueMax: 0,
    emailSubject: "Payment Received - Invoice #{invoiceNumber}",
    emailBody: `Dear {customerFullName},

Thank you for your payment!

We have successfully received your payment of ${invoiceAmount} for invoice #{invoiceNumber}.

PAYMENT DETAILS:
Amount Paid: ${invoiceAmount}
Invoice Number: #{invoiceNumber}
Date Received: {paymentDate}

Your account is now current. We appreciate your prompt payment and your business.

If you have any questions, please contact us at {businessPhone}.

Best regards,
{businessName}
{businessPhone}
{businessEmail}`,
    requiresConsent: false,
    includesOptOut: false,
  },

  // ========================================
  // PAYMENT PLAN TEMPLATES
  // ========================================
  {
    id: "payment-plan-offer-email",
    name: "Payment Plan Offer - Email",
    description: "Offer payment plan option for struggling customers",
    category: "firm",
    channels: ["email"],
    daysPastDueMin: 15,
    daysPastDueMax: 60,
    emailSubject: "Payment Plan Available - Invoice #{invoiceNumber}",
    emailBody: `Dear {customerFullName},

We understand that unexpected circumstances can make it difficult to pay invoices on time. We want to work with you.

CURRENT BALANCE: ${invoiceAmount}
Invoice #{invoiceNumber} - {daysPastDue} days overdue

PAYMENT PLAN OPTION:
We can arrange a payment plan that allows you to pay this balance over time in smaller installments. This can help you avoid:
• Collection actions
• Credit reporting
• Additional fees
• Service interruption

HOW TO SET UP A PAYMENT PLAN:
1. Call us at {businessPhone}
2. Email us at {businessEmail}
3. Reply to this email with your proposed payment schedule

We are here to help, but we need to hear from you within 7 days. Don't let this go to collections – let's work together to resolve this.

Alternatively, you can pay in full now: {paymentLink}

Sincerely,
{businessName}
{businessPhone}

---
To unsubscribe from payment reminders, reply with "UNSUBSCRIBE".`,
    requiresConsent: true,
    includesOptOut: true,
  },

  // ========================================
  // PARTIAL PAYMENT ACKNOWLEDGMENT
  // ========================================
  {
    id: "partial-payment-email",
    name: "Partial Payment Received - Email",
    description: "Acknowledge partial payment and request remainder",
    category: "friendly",
    channels: ["email"],
    daysPastDueMin: 0,
    daysPastDueMax: 999,
    emailSubject: "Partial Payment Received - Invoice #{invoiceNumber}",
    emailBody: `Dear {customerFullName},

Thank you for your recent payment toward invoice #{invoiceNumber}.

PAYMENT SUMMARY:
Original Amount: ${originalAmount}
Amount Paid: ${amountPaid}
Remaining Balance: ${invoiceAmount}

We appreciate your payment. However, there is still a remaining balance of ${invoiceAmount} on this invoice.

Please submit the remaining balance: {paymentLink}

If you need to arrange a payment plan for the remaining balance, please contact us at {businessPhone}.

Thank you,
{businessName}
{businessPhone}

---
To unsubscribe from payment reminders, reply with "UNSUBSCRIBE".`,
    requiresConsent: true,
    includesOptOut: true,
  },
];

/**
 * Get templates filtered by criteria
 */
export function getTemplates(filters?: {
  channel?: "sms" | "email" | "both";
  category?: "friendly" | "firm" | "final" | "thank_you";
  daysPastDue?: number;
}): MessageTemplate[] {
  let templates = [...MESSAGE_TEMPLATES];

  if (filters?.channel) {
    templates = templates.filter((t) => t.channels.includes(filters.channel!));
  }

  if (filters?.category) {
    templates = templates.filter((t) => t.category === filters.category);
  }

  if (filters?.daysPastDue !== undefined) {
    templates = templates.filter(
      (t) =>
        filters.daysPastDue! >= t.daysPastDueMin &&
        filters.daysPastDue! <= t.daysPastDueMax
    );
  }

  return templates;
}

/**
 * Get recommended template based on invoice status
 */
export function getRecommendedTemplate(
  daysPastDue: number,
  channel: "sms" | "email" | "both"
): MessageTemplate | null {
  let category: "friendly" | "firm" | "final";

  if (daysPastDue <= 7) {
    category = "friendly";
  } else if (daysPastDue <= 30) {
    category = "firm";
  } else {
    category = "final";
  }

  const templates = getTemplates({ channel, category, daysPastDue });
  return templates[0] || null;
}

/**
 * Fill template with actual data
 */
export function fillTemplate(
  template: string,
  data: {
    customerFirstName: string;
    customerFullName: string;
    businessName: string;
    invoiceNumber: string;
    invoiceAmount: string;
    dueDate: string;
    daysPastDue: number;
    paymentLink: string;
    businessPhone?: string;
    businessEmail?: string;
    paymentDate?: string;
    originalAmount?: string;
    amountPaid?: string;
  }
): string {
  let filled = template;

  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    filled = filled.replace(regex, String(value || ""));
  });

  return filled;
}
