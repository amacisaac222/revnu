/**
 * State-Specific Mechanic's Lien Flow Generator (Flow 6)
 *
 * Generates mechanic's lien protection sequences customized for each state's lien laws.
 * Uses existing lien-deadlines.ts for state-specific rules and timing.
 */

import { getStateInfo } from "./lien-deadlines";

export interface LienFlowStep {
  stepNumber: number;
  delayDays: number;
  channel: "sms" | "email";
  subject?: string;
  body: string;
}

export interface LienFlowTemplate {
  name: string;
  description: string;
  triggerDaysPastDue: number;
  source: "standard";
  isDefault: false;
  isLienSequence: true;
  applicableStates: string; // Single state code like "CA"
  steps: LienFlowStep[];
}

export interface LienFlowParams {
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  paymentInstructions?: string;
  paymentLink?: string;
  communicationTone: "friendly" | "professional" | "firm" | "casual";
  preferredChannels: { sms?: boolean; email?: boolean; phone?: boolean };
  primaryState: string; // Two-letter state code (e.g., "CA", "TX")
}

/**
 * Generate state-specific mechanic's lien protection flow
 */
export function generateLienFlow(params: LienFlowParams): LienFlowTemplate {
  const {
    businessName,
    contactEmail,
    contactPhone,
    paymentInstructions,
    paymentLink,
    communicationTone,
    preferredChannels,
    primaryState,
  } = params;

  // Get state-specific lien rules
  const stateRules = getStateInfo(primaryState);

  // Payment info for messages
  const paymentText = paymentLink
    ? `Pay now: ${paymentLink}`
    : paymentInstructions || "Please contact us for payment options.";

  // Primary channel (prefer email for lien notices)
  const primaryChannel: "email" | "sms" = preferredChannels.email ? "email" : "sms";
  const secondaryChannel: "email" | "sms" = primaryChannel === "email" ? "sms" : "email";

  // State name for display
  const stateName = getStateName(primaryState);

  // Build steps based on tone
  const steps = buildLienSteps({
    primaryChannel,
    secondaryChannel,
    businessName,
    contactEmail,
    contactPhone,
    paymentText,
    stateName,
    stateRules,
    tone: communicationTone,
  });

  return {
    name: `Mechanic's Lien Protection - ${stateName}`,
    description: `State-specific lien collection sequence for ${stateName}. Escalates to lien filing threat with ${stateRules.lienFilingDays}-day deadline. ${
      stateRules.preliminaryNoticeRequired ? `Requires ${stateRules.preliminaryNoticeDays}-day preliminary notice.` : "No preliminary notice required."
    }`,
    triggerDaysPastDue: 30, // Starts at 30 days past due
    source: "standard",
    isDefault: false,
    isLienSequence: true,
    applicableStates: primaryState.toUpperCase(),
    steps,
  };
}

/**
 * Build lien protection steps based on communication tone
 */
function buildLienSteps(params: {
  primaryChannel: "email" | "sms";
  secondaryChannel: "email" | "sms";
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  paymentText: string;
  stateName: string;
  stateRules: any;
  tone: string;
}): LienFlowStep[] {
  const {
    primaryChannel,
    secondaryChannel,
    businessName,
    contactEmail,
    contactPhone,
    paymentText,
    stateName,
    stateRules,
    tone,
  } = params;

  const lienFilingDays = stateRules.lienFilingDays;
  const preliminaryRequired = stateRules.preliminaryNoticeRequired;
  const preliminaryDays = stateRules.preliminaryNoticeDays;

  // Adjust tone - lien sequences are inherently more serious, but respect user preference
  if (tone === "friendly" || tone === "casual") {
    return [
      // STEP 1: Day 30 - Gentle lien awareness
      {
        stepNumber: 1,
        delayDays: 0, // Day 30 past due
        channel: "email", // Always email for lien notices
        subject: "Invoice {{invoiceNumber}} - Payment Protection Notice",
        body: `Hi {{customerName}},\n\nI wanted to follow up on Invoice {{invoiceNumber}} for ${{amount}}, which is now {{daysPastDue}} days overdue.\n\nI need to make you aware that as a licensed contractor in ${stateName}, invoices for property improvement work are protected by mechanics lien rights. Under ${stateName} law, I have ${lienFilingDays} days from work completion to file a mechanics lien if payment isn't received.\n\nI really don't want it to come to that! Let's work together to get this resolved.\n\n${paymentText}\n\nOr call me if there's an issue: ${contactPhone || contactEmail}\n\nThanks,\n${businessName}`,
      },
      // STEP 2: Day 40 - SMS urgency
      {
        stepNumber: 2,
        delayDays: 10, // Day 40 past due
        channel: secondaryChannel,
        subject: secondaryChannel === "email" ? "Payment Needed - Invoice {{invoiceNumber}}" : undefined,
        body: secondaryChannel === "email"
          ? `Hi {{customerName}},\n\nI still haven't received payment for Invoice {{invoiceNumber}} (${{amount}}), now {{daysPastDue}} days overdue.\n\nTime is running out to avoid lien filing. Please pay this week.\n\n${paymentText}\n\nCall me: ${contactPhone || contactEmail}\n\n${businessName}`
          : `{{customerName}}, Invoice {{invoiceNumber}} (${{amount}}) - {{daysPastDue}} days overdue. Need payment this week to avoid lien filing. ${contactPhone || contactEmail} - ${businessName}`,
      },
      // STEP 3: Day 50 - Serious warning
      {
        stepNumber: 3,
        delayDays: 10, // Day 50 past due
        channel: "email",
        subject: "Urgent: Lien Filing Imminent - Invoice {{invoiceNumber}}",
        body: `Dear {{customerName}},\n\nInvoice {{invoiceNumber}} for ${{amount}} is {{daysPastDue}} days past due.\n\nUnfortunately, if I don't receive payment within the next 10 days, I will have no choice but to file a mechanics lien on your property at {{propertyAddress}}.\n\n**What is a Mechanics Lien?**\nA mechanics lien is a legal claim against your property that:\n• Appears in public property records\n• Clouds the title, making it difficult to sell or refinance\n• Can only be removed once the debt is paid\n• May lead to foreclosure proceedings if not resolved\n\n**${stateName} Lien Requirements:**\n${preliminaryRequired ? `• Preliminary Notice: Must be sent within ${preliminaryDays} days (already sent)` : "• No preliminary notice required"}\n• Lien Filing Deadline: ${lienFilingDays} days from work completion\n• We are approaching this deadline\n\nI want to avoid this step. Please help me by paying today.\n\n${paymentText}\n\nOr call me to work out a payment plan: ${contactPhone || contactEmail}\n\nSincerely,\n${businessName}`,
      },
      // STEP 4: Day 60 - Final notice
      {
        stepNumber: 4,
        delayDays: 10, // Day 60 past due
        channel: "email",
        subject: "FINAL NOTICE - Lien Filing This Week - Invoice {{invoiceNumber}}",
        body: `Dear {{customerName}},\n\n**FINAL NOTICE BEFORE LIEN FILING**\n\nInvoice {{invoiceNumber}}: ${{amount}}\nDays Past Due: {{daysPastDue}}\nProperty: {{propertyAddress}}\n\nI have tried multiple times to collect payment on this invoice. Despite my efforts to work with you, the balance remains unpaid.\n\n**I will file a mechanics lien against your property this week if payment is not received.**\n\nOnce the lien is filed:\n• It becomes public record\n• Your property title is clouded\n• You cannot sell or refinance without paying this debt\n• Additional legal fees and filing costs will be added\n• The lien may result in foreclosure if not resolved\n\n**You have ONE FINAL OPPORTUNITY to avoid this:**\nPay the full balance today: ${paymentText}\nOR call me immediately to arrange payment: ${contactPhone || contactEmail}\n\nIf I do not hear from you within 48 hours, the lien will be filed.\n\nSincerely,\n${businessName}\n${contactEmail || ""}`,
      },
    ];
  }

  if (tone === "firm") {
    return [
      // STEP 1: Day 30 - Direct lien notice
      {
        stepNumber: 1,
        delayDays: 0,
        channel: "email",
        subject: "NOTICE: Mechanics Lien Rights Reserved - Invoice {{invoiceNumber}}",
        body: `{{customerName}},\n\n**NOTICE OF MECHANICS LIEN RIGHTS**\n\nInvoice {{invoiceNumber}} for ${{amount}} is {{daysPastDue}} days past due.\n\nAs a licensed contractor, this invoice qualifies for mechanics lien protection under ${stateName} law. We reserve all rights to file a mechanics lien against the property at {{propertyAddress}}.\n\n**${stateName} Lien Law:**\n${preliminaryRequired ? `• Preliminary Notice Required: ${preliminaryDays} days (SENT)` : "• No Preliminary Notice Required"}\n• Lien Filing Deadline: ${lienFilingDays} days from completion\n• Enforcement: Lien can lead to foreclosure\n\n**PAYMENT REQUIRED IMMEDIATELY**\n\n${paymentText}\n\nFailure to pay will result in lien filing.\n\n${businessName}\n${contactEmail || ""}`,
      },
      // STEP 2: Day 40 - Escalation
      {
        stepNumber: 2,
        delayDays: 10,
        channel: secondaryChannel,
        subject: secondaryChannel === "email" ? "LIEN FILING IMMINENT - Invoice {{invoiceNumber}}" : undefined,
        body: `{{customerName}},\n\nInvoice {{invoiceNumber}} (${{amount}}) - {{daysPastDue}} days PAST DUE.\n\nMechanics lien filing will be initiated if payment not received within 10 days.\n\n${paymentText}\n\n${businessName}`,
      },
      // STEP 3: Day 50 - Demand
      {
        stepNumber: 3,
        delayDays: 10,
        channel: "email",
        subject: "DEMAND FOR PAYMENT - Mechanics Lien Notice",
        body: `{{customerName}},\n\n**DEMAND FOR PAYMENT**\n\nInvoice: {{invoiceNumber}}\nAmount: ${{amount}}\nDays Past Due: {{daysPastDue}}\nProperty: {{propertyAddress}}\n\n**NOTICE OF INTENT TO FILE MECHANICS LIEN**\n\nPursuant to ${stateName} construction lien statutes, we hereby notify you of our intent to file a mechanics lien if payment is not received within 7 days.\n\n**CONSEQUENCES OF LIEN FILING:**\n1. Legal claim against your property\n2. Public record - clouds title\n3. Prevents sale or refinancing\n4. Additional legal costs and filing fees\n5. Potential foreclosure proceedings\n\n**PAYMENT DEADLINE:** 7 days from receipt\n\n${paymentText}\n\nPay immediately or lien will be filed.\n\n${businessName}\n${contactPhone || contactEmail}`,
      },
      // STEP 4: Day 60 - Final demand
      {
        stepNumber: 4,
        delayDays: 10,
        channel: "email",
        subject: "FINAL DEMAND - Lien Filing Proceeding",
        body: `{{customerName}},\n\n**FINAL DEMAND FOR PAYMENT**\n\nInvoice {{invoiceNumber}}: ${{amount}}\nDays Past Due: {{daysPastDue}}\n\n**MECHANICS LIEN WILL BE FILED WITHIN 48 HOURS**\n\nYou have failed to respond to multiple collection attempts. A mechanics lien will be filed against {{propertyAddress}} if full payment is not received immediately.\n\n**TOTAL AMOUNT DUE (Including Filing Fees):** ${{amount}}\n\n${paymentText}\n\nThis is your final notice. After 48 hours, all collection remedies will be pursued.\n\n${businessName}\n${contactPhone || contactEmail}`,
      },
    ];
  }

  // Professional (default) tone
  return [
    // STEP 1: Day 30 - Professional lien notice
    {
      stepNumber: 1,
      delayDays: 0,
      channel: "email",
      subject: "Important Notice - Payment & Lien Rights - Invoice {{invoiceNumber}}",
      body: `Dear {{customerName}},\n\nInvoice {{invoiceNumber}} for ${{amount}} is {{daysPastDue}} days past due. We are writing to formally request payment and to inform you of our legal rights.\n\n**Mechanics Lien Protection Notice**\n\nAs a licensed contractor in ${stateName}, work performed on real property is protected by mechanics lien rights. Under ${stateName} law:\n\n${preliminaryRequired ? `• Preliminary Notice: Required within ${preliminaryDays} days of starting work (already sent)` : "• Preliminary Notice: Not required in " + stateName}\n• Lien Filing Period: ${lienFilingDays} days from substantial completion\n• A mechanics lien creates a legal claim against the property\n\nWe prefer to resolve this amicably and avoid the mechanics lien process. However, we must protect our business interests.\n\n**Requested Action:**\nPlease remit payment within 10 days.\n\n${paymentText}\n\nIf you have questions or need to discuss payment arrangements, please contact us at ${contactPhone || contactEmail}.\n\nSincerely,\n${businessName}`,
    },
    // STEP 2: Day 40 - Follow-up
    {
      stepNumber: 2,
      delayDays: 10,
      channel: secondaryChannel,
      subject: secondaryChannel === "email" ? "Urgent: Payment Required - Invoice {{invoiceNumber}}" : undefined,
      body: secondaryChannel === "email"
        ? `Dear {{customerName}},\n\nWe have not received payment for Invoice {{invoiceNumber}} (${{amount}}), which is {{daysPastDue}} days past due.\n\nTime-sensitive lien filing deadlines are approaching. Please contact us immediately to arrange payment.\n\n${paymentText}\n\nContact: ${contactPhone || contactEmail}\n\nRegards,\n${businessName}`
        : `{{customerName}}, Invoice {{invoiceNumber}} (${{amount}}) {{daysPastDue}} days overdue. Lien deadlines approaching. Pay now or call: ${contactPhone || contactEmail} - ${businessName}`,
    },
    // STEP 3: Day 50 - Intent to file
    {
      stepNumber: 3,
      delayDays: 10,
      channel: "email",
      subject: "Notice of Intent to File Mechanics Lien - Invoice {{invoiceNumber}}",
      body: `Dear {{customerName}},\n\n**NOTICE OF INTENT TO FILE MECHANICS LIEN**\n\nRe: Invoice {{invoiceNumber}}\nAmount Due: ${{amount}}\nDays Past Due: {{daysPastDue}}\nProperty Address: {{propertyAddress}}\n\nDespite previous requests for payment, Invoice {{invoiceNumber}} remains unpaid. We hereby provide notice of our intent to file a mechanics lien under ${stateName} law.\n\n**What This Means:**\n\nA mechanics lien is a legal claim against real property that:\n• Creates a public record attached to the property title\n• Can prevent the sale or refinancing of the property\n• Remains until the debt is satisfied\n• May lead to foreclosure proceedings under ${stateName} law\n• Incurs additional legal costs and filing fees\n\n**${stateName} Legal Requirements:**\n${preliminaryRequired ? `• Preliminary Notice: Sent within ${preliminaryDays} days ✓` : "• Preliminary Notice: Not required"}\n• Lien Filing Deadline: ${lienFilingDays} days from work completion\n• Current Status: Deadline approaching\n\n**Resolution Options:**\n\n1. Full Payment: ${paymentText}\n2. Payment Plan: Contact us at ${contactPhone || contactEmail}\n\n**You have 7 days to resolve this before lien filing proceeds.**\n\nWe strongly prefer to resolve this without legal action. Please contact us immediately.\n\nSincerely,\n${businessName}\n${contactEmail || ""}`,
    },
    // STEP 4: Day 60 - Final notice
    {
      stepNumber: 4,
      delayDays: 10,
      channel: "email",
      subject: "FINAL NOTICE - Mechanics Lien Filing Proceeding",
      body: `Dear {{customerName}},\n\n**FINAL NOTICE BEFORE LIEN FILING**\n\nInvoice: {{invoiceNumber}}\nOriginal Amount: ${{amount}}\nDays Past Due: {{daysPastDue}}\nProperty: {{propertyAddress}}\n\nThis is formal notice that we will file a mechanics lien against the above property within 3 business days if payment is not received.\n\n**Immediate Action Required:**\n\nOption 1: Pay in Full\n${paymentText}\n\nOption 2: Contact Us Immediately\nPhone: ${contactPhone || contactEmail}\nEmail: ${contactEmail || ""}\n\n**Consequences of Lien Filing:**\n\n1. Public record filed with county recorder\n2. Title report will show outstanding lien\n3. Property cannot be sold or refinanced until lien is satisfied\n4. Additional costs: Filing fees, legal fees, interest\n5. Potential foreclosure action under ${stateName} law\n6. Credit reporting implications\n\n**${stateName} Lien Laws:**\nUnder ${stateName} Statutes, contractors have ${lienFilingDays} days from substantial completion to file a mechanics lien. We are within this statutory period and are prepared to exercise our legal rights.\n\nWe have made multiple good-faith attempts to collect this debt. If we do not hear from you within 72 hours, we will proceed with filing.\n\nPlease contact us immediately to resolve this matter.\n\nSincerely,\n${businessName}\n${contactPhone || contactEmail}`,
    },
  ];
}

/**
 * Get full state name from two-letter code
 */
function getStateName(stateCode: string): string {
  const stateNames: Record<string, string> = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
    MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
    NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
    OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
    SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
    VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  };
  return stateNames[stateCode.toUpperCase()] || stateCode;
}
