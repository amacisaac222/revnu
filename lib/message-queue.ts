/**
 * Message Queue Utilities
 *
 * Helper functions for queueing messages that are blocked by quiet hours
 * or need to be sent at a specific time
 */

import { db } from "@/lib/db";

export interface QueueMessageParams {
  enrollmentId: string;
  sequenceStepId: string;
  customerId: string;
  invoiceId?: string;
  channel: "sms" | "email";
  subject?: string;
  body: string;
  scheduledFor: Date;
}

/**
 * Queue a message for later delivery
 * Used when quiet hours enforcement blocks immediate sending
 */
export async function queueMessage(params: QueueMessageParams) {
  const {
    enrollmentId,
    sequenceStepId,
    customerId,
    invoiceId,
    channel,
    subject,
    body,
    scheduledFor,
  } = params;

  const scheduledMessage = await db.scheduledMessage.create({
    data: {
      enrollmentId,
      sequenceStepId,
      customerId,
      invoiceId: invoiceId || null,
      channel,
      subject: subject || null,
      body,
      scheduledFor,
      status: "pending",
      failureCount: 0,
    },
  });

  console.log(
    `=� Queued ${channel} message ${scheduledMessage.id} for ${scheduledFor.toISOString()}`
  );

  return scheduledMessage;
}

/**
 * Cancel all pending messages for a customer
 * Used when customer opts out or invoice is paid
 */
export async function cancelPendingMessages(params: {
  customerId?: string;
  invoiceId?: string;
  enrollmentId?: string;
}) {
  const { customerId, invoiceId, enrollmentId } = params;

  const where: any = {
    status: "pending",
  };

  if (customerId) where.customerId = customerId;
  if (invoiceId) where.invoiceId = invoiceId;
  if (enrollmentId) where.enrollmentId = enrollmentId;

  const result = await db.scheduledMessage.updateMany({
    where,
    data: {
      status: "cancelled",
      processedAt: new Date(),
      errorMessage: "Cancelled by system",
    },
  });

  console.log(`=� Cancelled ${result.count} pending messages`);

  return result;
}

/**
 * Get upcoming scheduled messages for a customer
 */
export async function getUpcomingMessages(customerId: string) {
  return await db.scheduledMessage.findMany({
    where: {
      customerId,
      status: "pending",
      scheduledFor: {
        gte: new Date(),
      },
    },
    orderBy: {
      scheduledFor: "asc",
    },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          amountDue: true,
        },
      },
    },
  });
}

/**
 * Reschedule a pending message
 */
export async function rescheduleMessage(
  messageId: string,
  newScheduledFor: Date
) {
  return await db.scheduledMessage.update({
    where: {
      id: messageId,
      status: "pending",
    },
    data: {
      scheduledFor: newScheduledFor,
    },
  });
}
