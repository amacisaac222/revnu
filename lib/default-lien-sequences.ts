// Default Mechanics Lien Protection Sequences
// These templates help contractors protect their payment rights

export const DEFAULT_LIEN_SEQUENCES = [
  {
    name: "Standard Collection with Lien Protection",
    description: "Friendly to firm escalation with mechanics lien awareness for property improvement work",
    triggerDaysPastDue: 15,
    isDefault: false,
    steps: [
      {
        stepNumber: 1,
        delayDays: 0, // Day 15 past due
        channel: "email",
        subject: "Friendly Payment Reminder - Invoice {{invoiceNumber}}",
        body: `Hi {{customerName}},

I hope this message finds you well. I wanted to reach out regarding Invoice {{invoiceNumber}} for ${{amountDue}}, which is now {{daysPastDue}} days past due.

I understand things can get busy. If there's any issue with the work we completed or the invoice, please let me know and we can resolve it together.

You can pay online here: {{paymentLink}}

Thanks for being a valued customer!

{{businessName}}`,
      },
      {
        stepNumber: 2,
        delayDays: 10, // Day 25 past due
        channel: "sms",
        subject: "",
        body: `Hi {{customerName}}, this is {{businessName}}. Invoice {{invoiceNumber}} (${{amountDue}}) is now {{daysPastDue}} days overdue. Please pay here: {{paymentLink}} or call us to discuss. Thanks!`,
      },
      {
        stepNumber: 3,
        delayDays: 15, // Day 40 past due
        channel: "email",
        subject: "IMPORTANT: Payment Required - Invoice {{invoiceNumber}}",
        body: `Dear {{customerName}},

Despite our previous reminders, Invoice {{invoiceNumber}} for ${{amountDue}} remains unpaid ({{daysPastDue}} days past due).

As a licensed contractor in {{state}}, we want to inform you that unpaid invoices for property improvement work may qualify for mechanics lien protection under state law.

We value your business and would prefer to resolve this amicably. Please pay the outstanding balance within the next 15 days to avoid any complications.

Pay now: {{paymentLink}}

If you have questions or concerns, please contact us immediately.

Regards,
{{businessName}}`,
      },
      {
        stepNumber: 4,
        delayDays: 15, // Day 55 past due
        channel: "email",
        subject: "FINAL NOTICE - Mechanics Lien Rights - Invoice {{invoiceNumber}}",
        body: `Dear {{customerName}},

This is a final notice regarding Invoice {{invoiceNumber}} for ${{amountDue}}, now {{daysPastDue}} days past due.

**IMPORTANT LEGAL NOTICE:**
Under {{state}} law, contractors who perform work that improves real property have the right to file a mechanics lien if payment is not received. A mechanics lien:
• Creates a legal claim against your property
• Appears in public records and clouds the title
• Can prevent refinancing or selling the property
• May result in foreclosure proceedings if not resolved

**We must receive payment within 10 days** to avoid initiating the mechanics lien process.

Pay immediately: {{paymentLink}}

We strongly prefer to resolve this without legal action. Please contact us today to arrange payment or discuss a payment plan.

Sincerely,
{{businessName}}
{{businessPhone}}`,
      },
    ],
  },
  {
    name: "Aggressive Lien-Focused Collection",
    description: "Direct approach emphasizing mechanics lien rights from the start",
    triggerDaysPastDue: 30,
    isDefault: false,
    steps: [
      {
        stepNumber: 1,
        delayDays: 0, // Day 30 past due
        channel: "email",
        subject: "Payment Required - Mechanics Lien Rights Reserved",
        body: `Dear {{customerName}},

Invoice {{invoiceNumber}} for ${{amountDue}} is now {{daysPastDue}} days overdue.

As a licensed contractor, we are required to inform you that this invoice qualifies for mechanics lien protection under {{state}} law. We reserve all rights to file a mechanics lien if payment is not received.

**Critical Deadlines:**
• Preliminary notice deadline: {{preliminaryNoticeDeadline}}
• Lien filing deadline: {{lienFilingDeadline}}

Please remit payment immediately to avoid lien filing: {{paymentLink}}

{{businessName}}`,
      },
      {
        stepNumber: 2,
        delayDays: 10, // Day 40 past due
        channel: "sms",
        subject: "",
        body: `URGENT: Invoice {{invoiceNumber}} (${{amountDue}}) - {{daysPastDue}} days overdue. Mechanics lien filing may be initiated. Pay now: {{paymentLink}} - {{businessName}}`,
      },
      {
        stepNumber: 3,
        delayDays: 10, // Day 50 past due
        channel: "email",
        subject: "DEMAND FOR PAYMENT - Mechanics Lien Notice",
        body: `Dear {{customerName}},

**DEMAND FOR PAYMENT**

Invoice {{invoiceNumber}} - Amount Due: ${{amountDue}}
Days Past Due: {{daysPastDue}}

This constitutes formal demand for payment of the above-referenced invoice for work performed on your property located at {{propertyAddress}}.

**NOTICE OF MECHANICS LIEN RIGHTS:**
Pursuant to {{state}} construction lien statutes, we hereby notify you of our intent to file a mechanics lien against the property if payment is not received within 7 days.

A mechanics lien will:
1. Cloud the title to your property
2. Appear in public records
3. Prevent sale or refinancing
4. May result in foreclosure and forced sale of the property

**Payment must be received by: {{lienDeadlineDate}}**

Pay immediately: {{paymentLink}}

If payment is not received, we will proceed with filing the mechanics lien and may pursue all available legal remedies.

{{businessName}}
{{businessPhone}}
{{businessEmail}}`,
      },
    ],
  },
  {
    name: "Friendly with Lien Awareness",
    description: "Gentle reminders that mention lien rights as educational information",
    triggerDaysPastDue: 10,
    isDefault: false,
    steps: [
      {
        stepNumber: 1,
        delayDays: 0, // Day 10 past due
        channel: "email",
        subject: "Quick Reminder - Invoice {{invoiceNumber}}",
        body: `Hi {{customerName}},

Just a friendly reminder that Invoice {{invoiceNumber}} for ${{amountDue}} is {{daysPastDue}} days past due.

Pay online: {{paymentLink}}

Thanks!
{{businessName}}`,
      },
      {
        stepNumber: 2,
        delayDays: 15, // Day 25 past due
        channel: "sms",
        subject: "",
        body: `Hi {{customerName}}! Invoice {{invoiceNumber}} (${{amountDue}}) is {{daysPastDue}} days overdue. Can you take care of this today? {{paymentLink}} Thanks! - {{businessName}}`,
      },
      {
        stepNumber: 3,
        delayDays: 20, // Day 45 past due
        channel: "email",
        subject: "Invoice {{invoiceNumber}} - Payment Protection Notice",
        body: `Hi {{customerName}},

I wanted to follow up on Invoice {{invoiceNumber}} (${{amountDue}}), which is now {{daysPastDue}} days overdue.

I want to make sure you're aware that as a licensed contractor in {{state}}, invoices for property improvement work are protected by mechanics lien rights. This means if payment issues continue, I may need to file a mechanics lien to protect my business.

I really don't want it to come to that! Let's work together to get this resolved. Can we get this paid in the next week?

Pay here: {{paymentLink}}

Or call me if there's an issue: {{businessPhone}}

Thanks,
{{businessName}}`,
      },
      {
        stepNumber: 4,
        delayDays: 15, // Day 60 past due
        channel: "email",
        subject: "Final Request Before Lien Filing - Invoice {{invoiceNumber}}",
        body: `Dear {{customerName}},

I've tried reaching out several times about Invoice {{invoiceNumber}} (${{amountDue}}), which is now {{daysPastDue}} days past due.

Unfortunately, if I don't receive payment within the next 7 days, I will have no choice but to file a mechanics lien on your property. This is not something I want to do, but I need to protect my business.

A mechanics lien will:
• Show up in public property records
• Make it difficult to sell or refinance your property
• Can only be removed once payment is made

Please help me avoid this step. Pay the invoice today: {{paymentLink}}

Or call me to work out a payment plan: {{businessPhone}}

Sincerely,
{{businessName}}`,
      },
    ],
  },
];
