/**
 * Quiet Hours Enforcement (TCPA Compliance)
 *
 * Enforces 8 AM - 9 PM local time window for SMS/phone communications
 * Messages sent outside this window are queued for next morning 8 AM
 */

import { addHours, setHours, setMinutes, setSeconds, addDays } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export const QUIET_HOURS_START = 21; // 9 PM
export const QUIET_HOURS_END = 8; // 8 AM

export interface QuietHoursResult {
  canSendNow: boolean;
  reason?: string;
  nextAvailableTime?: Date;
}

/**
 * Check if current time is within allowed hours (8 AM - 9 PM) for a given timezone
 */
export function isWithinQuietHours(
  timezone: string = "America/New_York"
): QuietHoursResult {
  try {
    // Get current time in the target timezone
    const now = new Date();
    const zonedNow = toZonedTime(now, timezone);
    const currentHour = zonedNow.getHours();

    // Check if we're in quiet hours (before 8 AM or after 9 PM)
    if (currentHour < QUIET_HOURS_END) {
      // It's before 8 AM - queue for 8 AM today
      const nextAvailable = setSeconds(
        setMinutes(setHours(zonedNow, QUIET_HOURS_END), 0),
        0
      );
      const nextAvailableUTC = fromZonedTime(nextAvailable, timezone);

      return {
        canSendNow: false,
        reason: `Current time is ${currentHour}:00 (before 8 AM) in ${timezone}`,
        nextAvailableTime: nextAvailableUTC,
      };
    }

    if (currentHour >= QUIET_HOURS_START) {
      // It's after 9 PM - queue for 8 AM tomorrow
      const tomorrow = addDays(zonedNow, 1);
      const nextAvailable = setSeconds(
        setMinutes(setHours(tomorrow, QUIET_HOURS_END), 0),
        0
      );
      const nextAvailableUTC = fromZonedTime(nextAvailable, timezone);

      return {
        canSendNow: false,
        reason: `Current time is ${currentHour}:00 (after 9 PM) in ${timezone}`,
        nextAvailableTime: nextAvailableUTC,
      };
    }

    // We're in the allowed window (8 AM - 9 PM)
    return {
      canSendNow: true,
    };
  } catch (error) {
    console.error("Error checking quiet hours:", error);
    // On error, default to allowing (safer than blocking)
    return {
      canSendNow: true,
    };
  }
}

/**
 * Calculate next available send time for a given timezone
 * Always returns 8 AM in the target timezone (today if before quiet hours, tomorrow if during/after)
 */
export function getNextAvailableSendTime(
  timezone: string = "America/New_York"
): Date {
  const check = isWithinQuietHours(timezone);

  if (check.canSendNow) {
    // Can send now
    return new Date();
  }

  // Return the calculated next available time
  return check.nextAvailableTime!;
}

/**
 * Check if a specific channel respects quiet hours
 * SMS and Phone calls must respect quiet hours
 * Email can be sent anytime
 */
export function shouldRespectQuietHours(channel: "sms" | "email" | "phone"): boolean {
  return channel === "sms" || channel === "phone";
}

/**
 * Calculate scheduled send time with quiet hours consideration
 */
export function calculateScheduledSendTime(
  channel: "sms" | "email" | "phone",
  preferredTime: Date,
  timezone: string = "America/New_York"
): Date {
  // Email doesn't respect quiet hours
  if (!shouldRespectQuietHours(channel)) {
    return preferredTime;
  }

  // Check if preferred time is within allowed hours
  const zonedPreferred = toZonedTime(preferredTime, timezone);
  const hour = zonedPreferred.getHours();

  // If preferred time is within allowed hours, use it
  if (hour >= QUIET_HOURS_END && hour < QUIET_HOURS_START) {
    return preferredTime;
  }

  // Otherwise, schedule for next available time
  return getNextAvailableSendTime(timezone);
}
