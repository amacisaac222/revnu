/**
 * TCPA Compliance Utilities
 * Helpers for ensuring compliance with TCPA regulations
 */

/**
 * Check if current time is within TCPA allowed hours (8 AM - 9 PM local time)
 * @param timezone Customer's timezone (e.g., "America/New_York")
 * @returns {isAllowed: boolean, localTime: string, reason?: string}
 */
export function isWithinAllowedHours(timezone?: string): {
  isAllowed: boolean;
  localTime: string;
  reason?: string;
} {
  const tz = timezone || "America/New_York"; // Default to ET if no timezone

  try {
    // Get current time in customer's timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const localTime = formatter.format(now);
    const [hours, minutes] = localTime.split(":").map(Number);

    // TCPA requires messages only between 8 AM and 9 PM local time
    const isAllowed = hours >= 8 && hours < 21;

    if (!isAllowed) {
      const nextAllowedTime = hours < 8 ? "8:00 AM" : "8:00 AM tomorrow";
      return {
        isAllowed: false,
        localTime,
        reason: `Current time in ${tz} is ${localTime}. Messages can only be sent between 8:00 AM - 9:00 PM. Next allowed time: ${nextAllowedTime}`,
      };
    }

    return {
      isAllowed: true,
      localTime,
    };
  } catch (error) {
    console.error("Error checking allowed hours:", error);
    // Default to allowing if there's an error parsing timezone
    return {
      isAllowed: true,
      localTime: "unknown",
      reason: "Could not determine customer timezone - proceeding with caution",
    };
  }
}

/**
 * Calculate days between messages for frequency checking
 */
export function calculateDaysSinceLastMessage(
  lastMessageDate?: Date | null
): number {
  if (!lastMessageDate) return 999; // No previous message

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastMessageDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if messaging frequency is compliant
 * @param messageCount Number of messages sent in last 7 days
 * @returns {isCompliant: boolean, warning?: string}
 */
export function checkMessagingFrequency(messageCount: number): {
  isCompliant: boolean;
  warning?: string;
} {
  // CFPB Regulation F: Maximum 7 calls in 7 days (doesn't apply to texts, but good practice)
  // For SMS, we'll use a more conservative limit
  const MAX_MESSAGES_PER_WEEK = 10;

  if (messageCount >= MAX_MESSAGES_PER_WEEK) {
    return {
      isCompliant: false,
      warning: `You have sent ${messageCount} messages to this customer in the last 7 days. Consider reducing frequency to avoid harassment claims.`,
    };
  }

  if (messageCount >= 7) {
    return {
      isCompliant: true,
      warning: `You have sent ${messageCount} messages in the last 7 days. Approaching recommended limit.`,
    };
  }

  return {
    isCompliant: true,
  };
}

/**
 * Validate opt-out status
 */
export function checkOptOutStatus(
  channel: "sms" | "email",
  smsOptedOut?: boolean,
  emailOptedOut?: boolean
): {
  canSend: boolean;
  reason?: string;
} {
  if (channel === "sms" && smsOptedOut) {
    return {
      canSend: false,
      reason: "Customer has opted out of SMS messages. Sending would violate TCPA.",
    };
  }

  if (channel === "email" && emailOptedOut) {
    return {
      canSend: false,
      reason: "Customer has opted out of email messages. Sending would violate CAN-SPAM.",
    };
  }

  return {
    canSend: true,
  };
}

/**
 * Validate consent status
 */
export function checkConsentStatus(
  channel: "sms" | "email",
  smsConsentGiven?: boolean,
  emailConsentGiven?: boolean
): {
  hasConsent: boolean;
  warning?: string;
} {
  if (channel === "sms" && !smsConsentGiven) {
    return {
      hasConsent: false,
      warning: "No documented SMS consent. Sending without prior express written consent violates TCPA and carries penalties of $500-$1,500 per message.",
    };
  }

  if (channel === "email" && !emailConsentGiven) {
    return {
      hasConsent: false,
      warning: "No documented email consent. Sending without consent may violate CAN-SPAM regulations.",
    };
  }

  return {
    hasConsent: true,
  };
}

/**
 * Comprehensive compliance check before sending a message
 */
export async function validateMessageSend(params: {
  channel: "sms" | "email";
  customer: {
    id: string;
    timezone?: string | null;
    smsConsentGiven?: boolean;
    smsOptedOut?: boolean;
    emailConsentGiven?: boolean;
    emailOptedOut?: boolean;
  };
  recentMessageCount?: number;
}): Promise<{
  allowed: boolean;
  warnings: string[];
  blockers: string[];
}> {
  const { channel, customer, recentMessageCount = 0 } = params;
  const warnings: string[] = [];
  const blockers: string[] = [];

  // 1. Check opt-out status (BLOCKER)
  const optOutCheck = checkOptOutStatus(
    channel,
    customer.smsOptedOut,
    customer.emailOptedOut
  );
  if (!optOutCheck.canSend) {
    blockers.push(optOutCheck.reason!);
  }

  // 2. Check consent status (WARNING for email, BLOCKER for SMS)
  const consentCheck = checkConsentStatus(
    channel,
    customer.smsConsentGiven,
    customer.emailConsentGiven
  );
  if (!consentCheck.hasConsent) {
    if (channel === "sms") {
      blockers.push(consentCheck.warning!);
    } else {
      warnings.push(consentCheck.warning!);
    }
  }

  // 3. Check time restrictions for SMS (BLOCKER)
  if (channel === "sms") {
    const timeCheck = isWithinAllowedHours(customer.timezone || undefined);
    if (!timeCheck.isAllowed) {
      blockers.push(timeCheck.reason!);
    }
  }

  // 4. Check messaging frequency (WARNING)
  const frequencyCheck = checkMessagingFrequency(recentMessageCount);
  if (frequencyCheck.warning) {
    warnings.push(frequencyCheck.warning);
  }

  return {
    allowed: blockers.length === 0,
    warnings,
    blockers,
  };
}
