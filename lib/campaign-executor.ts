/**
 * Campaign Executor
 *
 * Schedules messages for campaign enrollments with quiet hours enforcement
 * Creates ScheduledMessage records for each step in the sequence
 */

import { db } from "@/lib/db";
import { addDays, addHours } from "date-fns";
import { calculateScheduledSendTime } from "./quiet-hours";

export interface ScheduleEnrollmentParams {
  enrollmentId: string;
  startImmediately?: boolean; // Default: true
}

/**
 * Schedule all messages for a campaign enrollment
 * Creates ScheduledMessage records for each step in the sequence
 */
export async function scheduleEnrollmentMessages(
  params: ScheduleEnrollmentParams
) {
  const { enrollmentId, startImmediately = true } = params;

  // Get enrollment with sequence steps
  const enrollment = await db.campaignEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      sequence: {
        include: {
          steps: {
            orderBy: {
              delayDays: "asc",
            },
          },
        },
      },
      customer: {
        include: {
          organization: true,
        },
      },
      invoice: true,
    },
  });

  if (!enrollment) {
    throw new Error(`Enrollment ${enrollmentId} not found`);
  }

  const { sequence, customer, invoice } = enrollment;
  const timezone = customer.organization.timezone || "America/New_York";
  const now = new Date();

  // Determine base date for scheduling
  let baseDate: Date;

  if (startImmediately) {
    baseDate = now;
  } else if (invoice) {
    // For invoice-based campaigns, start from due date or invoice date
    baseDate = invoice.dueDate || invoice.invoiceDate;
  } else {
    // For customer-based campaigns, start now
    baseDate = now;
  }

  console.log(
    `= Scheduling ${sequence.steps.length} messages for enrollment ${enrollmentId}`
  );

  const scheduledMessages = [];

  // Create ScheduledMessage for each step
  for (const step of sequence.steps) {
    try {
      // Skip if step channel doesn't match customer consent
      if (step.channel === "sms") {
        if (!customer.phone || !customer.smsConsentGiven || customer.smsOptedOut) {
          console.log(`  Skipping step ${step.stepNumber} - no SMS consent`);
          continue;
        }
      }

      if (step.channel === "email") {
        if (!customer.email || !customer.emailConsentGiven || customer.emailOptedOut) {
          console.log(`  Skipping step ${step.stepNumber} - no email consent`);
          continue;
        }
      }

      // Calculate when this step should be sent
      const daysDelay = step.delayDays || 0;
      const preferredSendTime = addDays(baseDate, daysDelay);

      // Apply quiet hours enforcement for SMS/phone
      const scheduledFor = calculateScheduledSendTime(
        step.channel as "sms" | "email" | "phone",
        preferredSendTime,
        timezone
      );

      // Fill template with customer/invoice data
      const filledBody = fillMessageTemplate(step.body, {
        customer,
        invoice,
        organization: customer.organization,
      });

      const filledSubject = step.subject
        ? fillMessageTemplate(step.subject, {
            customer,
            invoice,
            organization: customer.organization,
          })
        : null;

      // Create scheduled message
      const scheduledMessage = await db.scheduledMessage.create({
        data: {
          enrollmentId: enrollment.id,
          sequenceStepId: step.id,
          customerId: customer.id,
          invoiceId: invoice?.id || null,
          channel: step.channel,
          subject: filledSubject,
          body: filledBody,
          scheduledFor,
          status: "pending",
        },
      });

      scheduledMessages.push(scheduledMessage);

      console.log(
        ` Scheduled step ${step.stepNumber} (${step.channel}) for ${scheduledFor.toISOString()}`
      );
    } catch (error) {
      console.error(`L Error scheduling step ${step.stepNumber}:`, error);
    }
  }

  // Update enrollment with first message time
  if (scheduledMessages.length > 0) {
    await db.campaignEnrollment.update({
      where: { id: enrollmentId },
      data: {
        nextMessageScheduled: scheduledMessages[0].scheduledFor,
      },
    });
  }

  return scheduledMessages;
}

/**
 * Fill message template with actual customer/invoice data
 */
function fillMessageTemplate(
  template: string,
  data: {
    customer: any;
    invoice: any;
    organization: any;
  }
): string {
  const { customer, invoice, organization } = data;

  let filled = template;

  // Customer variables
  const firstName = customer.name.split(" ")[0] || customer.name;
  filled = filled.replace(/\{\{customerName\}\}/g, customer.name);
  filled = filled.replace(/\{\{customerFirstName\}\}/g, firstName);
  filled = filled.replace(/\{\{customerEmail\}\}/g, customer.email || "");
  filled = filled.replace(/\{\{customerPhone\}\}/g, customer.phone || "");

  // Invoice variables
  if (invoice) {
    filled = filled.replace(/\{\{invoiceNumber\}\}/g, invoice.invoiceNumber);
    filled = filled.replace(
      /\{\{amount\}\}/g,
      `$${invoice.amount.toFixed(2)}`
    );
    filled = filled.replace(
      /\{\{dueDate\}\}/g,
      invoice.dueDate?.toLocaleDateString() || "N/A"
    );

    // Calculate days past due
    const daysPastDue = invoice.dueDate
      ? Math.floor(
          (new Date().getTime() - invoice.dueDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
    filled = filled.replace(
      /\{\{daysPastDue\}\}/g,
      Math.max(0, daysPastDue).toString()
    );
  }

  // Organization variables
  filled = filled.replace(/\{\{businessName\}\}/g, organization.businessName);
  filled = filled.replace(/\{\{businessPhone\}\}/g, organization.phone || "");
  filled = filled.replace(/\{\{businessEmail\}\}/g, organization.email || "");

  // Payment variables
  const paymentLink =
    organization.defaultPaymentUrl || invoice?.paymentLink || "#";
  filled = filled.replace(/\{\{paymentLink\}\}/g, paymentLink);

  const paymentInstructions =
    organization.paymentInstructions ||
    `Pay online: ${paymentLink}`;
  filled = filled.replace(/\{\{paymentInstructions\}\}/g, paymentInstructions);

  return filled;
}

/**
 * Schedule messages for multiple enrollments (bulk operation)
 */
export async function scheduleMultipleEnrollments(
  enrollmentIds: string[],
  startImmediately = true
) {
  const results = {
    success: 0,
    failed: 0,
    totalMessages: 0,
  };

  for (const enrollmentId of enrollmentIds) {
    try {
      const messages = await scheduleEnrollmentMessages({
        enrollmentId,
        startImmediately,
      });
      results.success++;
      results.totalMessages += messages.length;
    } catch (error) {
      console.error(`Failed to schedule enrollment ${enrollmentId}:`, error);
      results.failed++;
    }
  }

  return results;
}
