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
  CA: {
    preliminaryNoticeRequired: true,
    preliminaryNoticeDays: 20,
    lienFilingDays: 90,
    enforcementDays: 90,
    notes: "California requires 20-day preliminary notice for subcontractors"
  },
  TX: {
    preliminaryNoticeRequired: true,
    preliminaryNoticeDays: 15,
    lienFilingDays: 90,
    enforcementDays: 180,
    notes: "Texas requires notice by 15th day of 3rd month after work"
  },
  FL: {
    preliminaryNoticeRequired: true,
    preliminaryNoticeDays: 30,
    lienFilingDays: 90,
    enforcementDays: 365,
    notes: "Florida requires notice within 30 days from first furnishing"
  },
  NY: {
    preliminaryNoticeRequired: true,
    preliminaryNoticeDays: 30,
    lienFilingDays: 90,
    enforcementDays: 365,
    notes: "New York requires notice of lending for private projects"
  },
  AZ: {
    preliminaryNoticeRequired: true,
    preliminaryNoticeDays: 20,
    lienFilingDays: 120,
    enforcementDays: 180,
    notes: "Arizona requires preliminary 20-day notice"
  },
  WA: {
    preliminaryNoticeRequired: false,
    preliminaryNoticeDays: 0,
    lienFilingDays: 90,
    enforcementDays: 240,
    notes: "Washington does not require preliminary notice for direct contractors"
  },
  OR: {
    preliminaryNoticeRequired: true,
    preliminaryNoticeDays: 8,
    lienFilingDays: 75,
    enforcementDays: 120,
    notes: "Oregon requires information notice within 8 business days"
  },
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
