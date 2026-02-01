/**
 * Notice of Intent to Lien (NOI) Calculator
 *
 * Calculates critical lien deadlines based on state law and work completion dates.
 * Determines when NOI should be sent to maximize collection effectiveness.
 */

import { getStateInfo } from "./lien-deadlines";
import { addDays, differenceInDays, isBefore, isAfter } from "date-fns";

export interface NOICalculation {
  // State requirements
  state: string;
  stateName: string;
  noiRequired: boolean;
  noiRecommended: boolean;

  // Critical dates
  workCompletionDate: Date;
  preliminaryNoticeDeadline: Date | null;
  noiRecommendedDate: Date; // When NOI should be sent (30-60 days past due typically)
  lienFilingDeadline: Date;

  // Time remaining
  daysUntilLienDeadline: number;
  daysUntilPreliminaryDeadline: number | null;

  // NOI effectiveness window
  noiWindow: {
    earliest: Date; // Don't send before this (too early, not effective)
    optimal: Date;  // Best time to send (30 days past due)
    latest: Date;   // Must send before this to allow response time before lien filing
  };

  // Required recipients
  requiredRecipients: Array<{
    recipientType: "owner" | "general_contractor" | "lender" | "tenant";
    required: boolean;
    notes?: string;
  }>;

  // State-specific requirements
  deliveryRequirements: {
    certifiedMailRequired: boolean;
    handDeliveryAllowed: boolean;
    emailAllowed: boolean;
    specificLanguageRequired: boolean;
    languageNotes?: string;
  };
}

/**
 * Calculate NOI deadlines and recommendations for an invoice
 */
export function calculateNOIDeadlines(
  lastWorkDate: Date,
  invoiceDueDate: Date,
  stateCode: string,
  claimantType: "prime_contractor" | "subcontractor" | "material_supplier" = "prime_contractor"
): NOICalculation {
  const stateInfo = getStateInfo(stateCode);
  const today = new Date();

  // Calculate lien filing deadline
  const lienFilingDeadline = addDays(lastWorkDate, stateInfo.lienFilingDays);
  const daysUntilLienDeadline = differenceInDays(lienFilingDeadline, today);

  // Calculate preliminary notice deadline (if required)
  let preliminaryNoticeDeadline: Date | null = null;
  let daysUntilPreliminaryDeadline: number | null = null;

  if (stateInfo.preliminaryNoticeRequired) {
    // Preliminary notice based on first work date or contract date
    // For simplicity, using work completion date minus typical project duration
    // In production, this should be based on actual first work date
    const estimatedFirstWorkDate = addDays(lastWorkDate, -30); // Assume 30-day project
    preliminaryNoticeDeadline = addDays(estimatedFirstWorkDate, stateInfo.preliminaryNoticeDays || 20);
    daysUntilPreliminaryDeadline = differenceInDays(preliminaryNoticeDeadline, today);
  }

  // Determine NOI effectiveness window
  // Earliest: Invoice is 15 days past due (customer has had time to pay)
  // Optimal: 30 days past due (typical NOI sweet spot)
  // Latest: 30 days before lien deadline (gives customer time to respond)

  const noiWindow = {
    earliest: addDays(invoiceDueDate, 15),
    optimal: addDays(invoiceDueDate, 30),
    latest: addDays(lienFilingDeadline, -30), // 30 days before lien deadline
  };

  // Determine if NOI is required or recommended
  const noiRequired = getStateNOIRequirement(stateCode);
  const noiRecommended = !noiRequired; // If not required, it's still recommended

  // Get required recipients based on state
  const requiredRecipients = getRequiredRecipients(stateCode, claimantType);

  // Get delivery requirements
  const deliveryRequirements = getDeliveryRequirements(stateCode);

  return {
    state: stateCode,
    stateName: stateInfo.stateName || stateCode,
    noiRequired,
    noiRecommended,
    workCompletionDate: lastWorkDate,
    preliminaryNoticeDeadline,
    noiRecommendedDate: noiWindow.optimal,
    lienFilingDeadline,
    daysUntilLienDeadline,
    daysUntilPreliminaryDeadline,
    noiWindow,
    requiredRecipients,
    deliveryRequirements,
  };
}

/**
 * Check if NOI is legally required in this state
 * Based on lien notice requirements document
 */
function getStateNOIRequirement(stateCode: string): boolean {
  const requiredStates = [
    "CO", // Colorado - Required
    "PA", // Pennsylvania - Required (30-day notice)
    "WI", // Wisconsin - Required
    "WY", // Wyoming - Required
    "ND", // North Dakota - Required
    "CT", // Connecticut - Required
    "LA", // Louisiana - Required
    "AR", // Arkansas - Required
    "MO", // Missouri - Required
  ];

  return requiredStates.includes(stateCode.toUpperCase());
}

/**
 * Determine required recipients for NOI based on state and claimant type
 */
function getRequiredRecipients(
  stateCode: string,
  claimantType: "prime_contractor" | "subcontractor" | "material_supplier"
): Array<{
  recipientType: "owner" | "general_contractor" | "lender" | "tenant";
  required: boolean;
  notes?: string;
}> {
  const state = stateCode.toUpperCase();
  const recipients: Array<{
    recipientType: "owner" | "general_contractor" | "lender" | "tenant";
    required: boolean;
    notes?: string;
  }> = [];

  // Owner is almost always required
  recipients.push({
    recipientType: "owner",
    required: true,
    notes: "Property owner - required in all states",
  });

  // General contractor (for subs/suppliers)
  if (claimantType === "subcontractor" || claimantType === "material_supplier") {
    recipients.push({
      recipientType: "general_contractor",
      required: true,
      notes: "General contractor - required for subcontractors and suppliers",
    });
  }

  // Lender (varies by state)
  const lenderRequiredStates = ["CA", "AZ", "NV"];
  if (lenderRequiredStates.includes(state)) {
    recipients.push({
      recipientType: "lender",
      required: true,
      notes: `${state} requires notice to lender/title company`,
    });
  }

  return recipients;
}

/**
 * Get delivery method requirements for state
 */
function getDeliveryRequirements(stateCode: string): {
  certifiedMailRequired: boolean;
  handDeliveryAllowed: boolean;
  emailAllowed: boolean;
  specificLanguageRequired: boolean;
  languageNotes?: string;
} {
  const state = stateCode.toUpperCase();

  // States requiring certified mail
  const certifiedMailStates = ["CO", "PA", "WI", "WY", "ND"];

  // States allowing email delivery
  const emailAllowedStates = ["CA", "TX", "FL", "AZ"];

  // States with specific language requirements
  const specificLanguageStates = ["CO", "PA", "CA"];

  const languageNotes: Record<string, string> = {
    CO: "Must include specific statutory language per CRS 38-22-109",
    PA: "Must reference Mechanics Lien Law of 1963",
    CA: "Should reference California Civil Code Section 8800-8822",
  };

  return {
    certifiedMailRequired: certifiedMailStates.includes(state),
    handDeliveryAllowed: true, // Generally allowed in all states
    emailAllowed: emailAllowedStates.includes(state),
    specificLanguageRequired: specificLanguageStates.includes(state),
    languageNotes: languageNotes[state],
  };
}

/**
 * Check if it's currently a good time to send NOI
 */
export function shouldSendNOINow(
  calculation: NOICalculation,
  currentDate: Date = new Date()
): {
  shouldSend: boolean;
  reason: string;
  urgency: "low" | "medium" | "high" | "critical";
} {
  const { noiWindow, daysUntilLienDeadline } = calculation;

  // Too early
  if (isBefore(currentDate, noiWindow.earliest)) {
    return {
      shouldSend: false,
      reason: `Too early - wait until ${noiWindow.earliest.toLocaleDateString()}`,
      urgency: "low",
    };
  }

  // Past lien deadline - too late
  if (daysUntilLienDeadline <= 0) {
    return {
      shouldSend: false,
      reason: "Lien filing deadline has passed - consult attorney",
      urgency: "critical",
    };
  }

  // Within 30 days of deadline - URGENT
  if (daysUntilLienDeadline <= 30) {
    return {
      shouldSend: true,
      reason: `URGENT - Only ${daysUntilLienDeadline} days until lien deadline`,
      urgency: "critical",
    };
  }

  // Past optimal window - should have sent already
  if (isAfter(currentDate, noiWindow.optimal)) {
    return {
      shouldSend: true,
      reason: `Overdue - optimal send date was ${noiWindow.optimal.toLocaleDateString()}`,
      urgency: "high",
    };
  }

  // In optimal window - perfect time
  if (isAfter(currentDate, noiWindow.earliest) && isBefore(currentDate, noiWindow.latest)) {
    return {
      shouldSend: true,
      reason: "Optimal time to send NOI - customer has had sufficient time to pay",
      urgency: "medium",
    };
  }

  // Default - wait a bit longer
  return {
    shouldSend: false,
    reason: "Wait a few more days for optimal effectiveness",
    urgency: "low",
  };
}

/**
 * Calculate response deadline for NOI (typically 10-20 days after sending)
 */
export function calculateResponseDeadline(
  sentDate: Date,
  stateCode: string
): Date {
  const state = stateCode.toUpperCase();

  // State-specific response periods
  const responsePeriods: Record<string, number> = {
    CO: 10, // Colorado - 10 days typical
    PA: 30, // Pennsylvania - 30 days required by law
    WI: 15, // Wisconsin - 15 days
    WY: 10, // Wyoming - 10 days
    CA: 20, // California - 20 days recommended
    TX: 10, // Texas - 10 days typical
    FL: 15, // Florida - 15 days
  };

  const days = responsePeriods[state] || 10; // Default 10 days
  return addDays(sentDate, days);
}

/**
 * Format NOI deadline summary for display
 */
export function formatNOIDeadlines(calculation: NOICalculation): string {
  const { state, noiRequired, noiRecommended, noiWindow, lienFilingDeadline, daysUntilLienDeadline } = calculation;

  let summary = `${state} Lien Deadlines:\n\n`;

  if (noiRequired) {
    summary += `⚠️ NOI REQUIRED by state law\n`;
  } else if (noiRecommended) {
    summary += `✓ NOI Recommended (47% payment rate)\n`;
  }

  summary += `\nOptimal Send Date: ${noiWindow.optimal.toLocaleDateString()}\n`;
  summary += `Lien Filing Deadline: ${lienFilingDeadline.toLocaleDateString()} (${daysUntilLienDeadline} days)\n`;

  if (calculation.preliminaryNoticeDeadline) {
    summary += `Preliminary Notice: ${calculation.preliminaryNoticeDeadline.toLocaleDateString()}\n`;
  }

  return summary;
}
