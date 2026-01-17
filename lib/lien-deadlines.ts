// State-specific Mechanics Lien Deadline Calculator
// Based on 2024-2025 state law requirements

export interface LienDeadlines {
  state: string;
  preliminaryNoticeRequired: boolean;
  preliminaryNoticeDays: number; // Days from first work to send preliminary notice
  lienFilingDays: number; // Days from completion to file lien
  enforcementDays: number; // Days from filing to enforce lien
  preliminaryNoticeDeadline: Date | null;
  lienFilingDeadline: Date | null;
  enforcementDeadline: Date | null;
  warningLevel: "green" | "yellow" | "red"; // green = plenty of time, yellow = getting close, red = urgent
  daysUntilFilingDeadline: number;
}

interface StateLienRules {
  preliminaryNoticeRequired: boolean;
  preliminaryNoticeDays: number;
  lienFilingDays: number;
  enforcementDays: number;
  notes?: string;
}

// State-specific lien rules (simplified - full implementation would need legal review)
const STATE_LIEN_RULES: Record<string, StateLienRules> = {
  AL: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 180, enforcementDays: 180, notes: "Alabama does not require preliminary notice for general contractors" },
  AK: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 30, lienFilingDays: 120, enforcementDays: 180, notes: "Alaska requires notice within 30 days of first furnishing" },
  AZ: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 20, lienFilingDays: 120, enforcementDays: 180, notes: "Arizona requires preliminary 20-day notice" },
  AR: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 180, notes: "Arkansas does not require preliminary notice" },
  CA: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 20, lienFilingDays: 90, enforcementDays: 90, notes: "California requires 20-day preliminary notice for subcontractors" },
  CO: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 10, lienFilingDays: 120, enforcementDays: 180, notes: "Colorado requires notice within 10 days of first work" },
  CT: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 90, lienFilingDays: 90, enforcementDays: 365, notes: "Connecticut requires notice of intent to lien" },
  DE: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 180, notes: "Delaware does not require preliminary notice" },
  FL: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 45, lienFilingDays: 90, enforcementDays: 365, notes: "Florida requires notice within 45 days from first furnishing" },
  GA: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 30, lienFilingDays: 90, enforcementDays: 365, notes: "Georgia requires notice of commencement within 30 days" },
  HI: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 45, lienFilingDays: 45, enforcementDays: 180, notes: "Hawaii requires notice within 45 days of first furnishing" },
  ID: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 90, lienFilingDays: 90, enforcementDays: 180, notes: "Idaho requires preliminary notice within 90 days" },
  IL: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 730, notes: "Illinois does not require preliminary notice" },
  IN: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 60, lienFilingDays: 90, enforcementDays: 365, notes: "Indiana requires notice within 60 days of first work" },
  IA: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 180, notes: "Iowa does not require preliminary notice" },
  KS: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 90, lienFilingDays: 120, enforcementDays: 365, notes: "Kansas requires notice to owner within 90 days" },
  KY: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 180, enforcementDays: 365, notes: "Kentucky does not require preliminary notice" },
  LA: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 60, enforcementDays: 365, notes: "Louisiana has 60-day filing deadline from substantial completion" },
  ME: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 120, notes: "Maine does not require preliminary notice" },
  MD: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 120, lienFilingDays: 180, enforcementDays: 180, notes: "Maryland requires notice within 120 days" },
  MA: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 30, lienFilingDays: 90, enforcementDays: 90, notes: "Massachusetts requires notice of contract within 30 days" },
  MI: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 90, lienFilingDays: 90, enforcementDays: 365, notes: "Michigan requires notice of furnishing within 90 days" },
  MN: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 45, lienFilingDays: 120, enforcementDays: 365, notes: "Minnesota requires pre-lien notice within 45 days" },
  MS: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 365, notes: "Mississippi does not require preliminary notice" },
  MO: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 180, notes: "Missouri does not require preliminary notice" },
  MT: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 90, lienFilingDays: 90, enforcementDays: 180, notes: "Montana requires notice of lien within 90 days" },
  NE: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 120, enforcementDays: 180, notes: "Nebraska does not require preliminary notice" },
  NV: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 31, lienFilingDays: 90, enforcementDays: 180, notes: "Nevada requires notice of right to lien within 31 days" },
  NH: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 60, lienFilingDays: 120, enforcementDays: 365, notes: "New Hampshire requires notice of intention within 60 days" },
  NJ: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 90, lienFilingDays: 90, enforcementDays: 365, notes: "New Jersey requires notice of unpaid balance within 90 days" },
  NM: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 30, lienFilingDays: 120, enforcementDays: 180, notes: "New Mexico requires preliminary notice within 30 days" },
  NY: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 30, lienFilingDays: 90, enforcementDays: 365, notes: "New York requires notice of lending for private projects" },
  NC: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 120, enforcementDays: 180, notes: "North Carolina does not require preliminary notice" },
  ND: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 365, notes: "North Dakota does not require preliminary notice" },
  OH: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 21, lienFilingDays: 75, enforcementDays: 180, notes: "Ohio requires notice of furnishing within 21 days" },
  OK: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 75, lienFilingDays: 90, enforcementDays: 365, notes: "Oklahoma requires notice within 75 days of first furnishing" },
  OR: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 8, lienFilingDays: 75, enforcementDays: 120, notes: "Oregon requires information notice within 8 business days" },
  PA: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 180, enforcementDays: 180, notes: "Pennsylvania does not require preliminary notice" },
  RI: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 90, lienFilingDays: 120, enforcementDays: 365, notes: "Rhode Island requires notice within 90 days" },
  SC: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 365, notes: "South Carolina does not require preliminary notice" },
  SD: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 180, notes: "South Dakota does not require preliminary notice" },
  TN: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 365, notes: "Tennessee does not require preliminary notice" },
  TX: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 15, lienFilingDays: 90, enforcementDays: 180, notes: "Texas requires notice by 15th day of 3rd month after work" },
  UT: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 20, lienFilingDays: 90, enforcementDays: 180, notes: "Utah requires preliminary notice within 20 days" },
  VT: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 180, enforcementDays: 365, notes: "Vermont does not require preliminary notice" },
  VA: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 90, lienFilingDays: 90, enforcementDays: 180, notes: "Virginia requires notice within 90 days from last furnishing" },
  WA: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 240, notes: "Washington does not require preliminary notice for direct contractors" },
  WV: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 90, enforcementDays: 180, notes: "West Virginia does not require preliminary notice" },
  WI: { preliminaryNoticeRequired: false, preliminaryNoticeDays: 0, lienFilingDays: 180, enforcementDays: 365, notes: "Wisconsin does not require preliminary notice" },
  WY: { preliminaryNoticeRequired: true, preliminaryNoticeDays: 75, lienFilingDays: 75, enforcementDays: 180, notes: "Wyoming requires notice within 75 days of first furnishing" },
  // Default for other states
  DEFAULT: {
    preliminaryNoticeRequired: true,
    preliminaryNoticeDays: 20,
    lienFilingDays: 90,
    enforcementDays: 180,
    notes: "Using general guidelines - consult local attorney for exact requirements"
  }
};

export function calculateLienDeadlines(
  state: string,
  firstWorkDate: Date | null,
  lastWorkDate: Date | null
): LienDeadlines {
  const stateCode = state.toUpperCase();
  const rules = STATE_LIEN_RULES[stateCode] || STATE_LIEN_RULES.DEFAULT;

  let preliminaryNoticeDeadline: Date | null = null;
  let lienFilingDeadline: Date | null = null;
  let enforcementDeadline: Date | null = null;
  let daysUntilFilingDeadline = 0;

  if (firstWorkDate && rules.preliminaryNoticeRequired) {
    preliminaryNoticeDeadline = new Date(firstWorkDate);
    preliminaryNoticeDeadline.setDate(
      preliminaryNoticeDeadline.getDate() + rules.preliminaryNoticeDays
    );
  }

  if (lastWorkDate) {
    lienFilingDeadline = new Date(lastWorkDate);
    lienFilingDeadline.setDate(
      lienFilingDeadline.getDate() + rules.lienFilingDays
    );

    enforcementDeadline = new Date(lienFilingDeadline);
    enforcementDeadline.setDate(
      enforcementDeadline.getDate() + rules.enforcementDays
    );

    // Calculate days until filing deadline
    const today = new Date();
    daysUntilFilingDeadline = Math.floor(
      (lienFilingDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  // Determine warning level
  let warningLevel: "green" | "yellow" | "red" = "green";
  if (daysUntilFilingDeadline < 0) {
    warningLevel = "red"; // Deadline passed
  } else if (daysUntilFilingDeadline <= 14) {
    warningLevel = "red"; // Less than 2 weeks
  } else if (daysUntilFilingDeadline <= 30) {
    warningLevel = "yellow"; // Less than 30 days
  }

  return {
    state: stateCode,
    preliminaryNoticeRequired: rules.preliminaryNoticeRequired,
    preliminaryNoticeDays: rules.preliminaryNoticeDays,
    lienFilingDays: rules.lienFilingDays,
    enforcementDays: rules.enforcementDays,
    preliminaryNoticeDeadline,
    lienFilingDeadline,
    enforcementDeadline,
    warningLevel,
    daysUntilFilingDeadline,
  };
}

export function isLienEligible(
  hasPropertyAddress: boolean,
  state: string | null,
  description: string | null
): boolean {
  // Basic eligibility check
  // Invoice must:
  // 1. Have a property address (work location)
  // 2. Have a valid state
  // 3. Be for property improvement work (not just service/consulting)

  if (!hasPropertyAddress || !state) {
    return false;
  }

  // Check if description suggests property improvement
  const improvementKeywords = [
    'install', 'installation', 'repair', 'replace', 'replacement',
    'construction', 'remodel', 'renovation', 'build', 'electrical',
    'plumbing', 'hvac', 'roofing', 'flooring', 'drywall', 'painting',
    'framing', 'foundation', 'siding', 'window', 'door', 'concrete'
  ];

  if (description) {
    const lowerDesc = description.toLowerCase();
    return improvementKeywords.some(keyword => lowerDesc.includes(keyword));
  }

  // If no description, assume eligible (user should verify)
  return true;
}

export function getStateInfo(stateCode: string): StateLienRules {
  return STATE_LIEN_RULES[stateCode.toUpperCase()] || STATE_LIEN_RULES.DEFAULT;
}

export function formatDeadlineMessage(deadlines: LienDeadlines): string {
  if (!deadlines.lienFilingDeadline) {
    return "Set work completion date to calculate lien deadlines";
  }

  const { daysUntilFilingDeadline, lienFilingDeadline } = deadlines;

  if (daysUntilFilingDeadline < 0) {
    return `⚠️ Lien filing deadline has passed! You may have lost your lien rights.`;
  } else if (daysUntilFilingDeadline === 0) {
    return `🚨 URGENT: Lien must be filed TODAY!`;
  } else if (daysUntilFilingDeadline <= 7) {
    return `🚨 URGENT: Only ${daysUntilFilingDeadline} days left to file lien!`;
  } else if (daysUntilFilingDeadline <= 14) {
    return `⚠️ ${daysUntilFilingDeadline} days left to file lien - take action soon`;
  } else if (daysUntilFilingDeadline <= 30) {
    return `⏰ ${daysUntilFilingDeadline} days until lien filing deadline`;
  } else {
    return `✓ ${daysUntilFilingDeadline} days remaining to file lien`;
  }
}
