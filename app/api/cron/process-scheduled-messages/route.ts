import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendSMS } from "@/lib/twilio";
import { sendEmail } from "@/lib/email";

/**
 * Scheduled Message Processor (Cron Job)
 *
 * Processes ScheduledMessage records that are ready to send (scheduledFor <= now)
 * Handles messages queued due to quiet hours enforcement
 *
 * HOW TO RUN:
 * - Vercel Cron: Add to vercel.json
 * - Manual: Call /api/cron/process-scheduled-messages?cron_secret=YOUR_SECRET
 * - Local: node scripts/process-scheduled-messages.js
 */

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("=P Starting scheduled message processor...");

    const now = new Date();

    // Find all pending messages that are ready to send
    const pendingMessages = await db.scheduledMessage.findMany({
      where: {
        status: "pending",
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        customer: {
          include: {
            organization: true,
          },
        },
        invoice: true,
        enrollment: true,
      },
      take: 100, // Process in batches of 100
      orderBy: {
        scheduledFor: "asc", // Oldest first
      },
    });

    console.log(`= Found ${pendingMessages.length} messages to process`);

    const results = {
      sent: 0,
      skipped: 0,
      failed: 0,
      rescheduled: 0,
    };

    // Process each message
    for (const scheduledMsg of pendingMessages) {
      try {
        // Skip if customer has opted out
        if (scheduledMsg.channel === "sms" && scheduledMsg.customer.smsOptedOut) {
          await db.scheduledMessage.update({
            where: { id: scheduledMsg.id },
            data: {
              status: "skipped_no_consent",
              processedAt: now,
              errorMessage: "Customer opted out of SMS",
            },
          });
          results.skipped++;
          console.log(`  Skipped message ${scheduledMsg.id} - customer opted out`);
          continue;
        }

        if (scheduledMsg.channel === "email" && scheduledMsg.customer.emailOptedOut) {
          await db.scheduledMessage.update({
            where: { id: scheduledMsg.id },
            data: {
              status: "skipped_no_consent",
              processedAt: now,
              errorMessage: "Customer opted out of email",
            },
          });
          results.skipped++;
          console.log(`  Skipped message ${scheduledMsg.id} - customer opted out`);
          continue;
        }

        // Skip if invoice is already paid
        if (scheduledMsg.invoice?.status === "paid") {
          await db.scheduledMessage.update({
            where: { id: scheduledMsg.id },
            data: {
              status: "skipped_paid",
              processedAt: now,
              errorMessage: "Invoice already paid",
            },
          });
          results.skipped++;
          console.log(`  Skipped message ${scheduledMsg.id} - invoice paid`);
          continue;
        }

        // Send the message
        if (scheduledMsg.channel === "sms") {
          const result = await sendSMS({
            to: scheduledMsg.customer.phone!,
            body: scheduledMsg.body,
            timezone: scheduledMsg.customer.organization.timezone,
            respectQuietHours: true,
          });

          if (result.scheduled) {
            // Still outside quiet hours - reschedule
            await db.scheduledMessage.update({
              where: { id: scheduledMsg.id },
              data: {
                scheduledFor: result.scheduledFor,
                errorMessage: "Rescheduled - outside quiet hours",
              },
            });
            results.rescheduled++;
            console.log(` Rescheduled message ${scheduledMsg.id} for ${result.scheduledFor}`);
          } else {
            // Successfully sent
            const message = await db.message.create({
              data: {
                customerId: scheduledMsg.customerId,
                organizationId: scheduledMsg.customer.organizationId,
                invoiceId: scheduledMsg.invoiceId,
                channel: "sms",
                direction: "outbound",
                subject: null,
                body: scheduledMsg.body,
                status: "sent",
                sentAt: now,
                twilioSid: result.messageSid,
              },
            });

            await db.scheduledMessage.update({
              where: { id: scheduledMsg.id },
              data: {
                status: "sent",
                sentAt: now,
                processedAt: now,
                messageId: message.id,
              },
            });

            // Update campaign enrollment status
            await db.campaignEnrollment.update({
              where: { id: scheduledMsg.enrollmentId },
              data: {
                lastMessageSentAt: now,
              },
            });

            results.sent++;
            console.log(` Sent SMS ${scheduledMsg.id} to ${scheduledMsg.customer.phone}`);
          }
        } else if (scheduledMsg.channel === "email") {
          // Email doesn't have quiet hours - send immediately
          await sendEmail({
            to: scheduledMsg.customer.email!,
            subject: scheduledMsg.subject || "Payment Reminder",
            html: scheduledMsg.body,
            from: scheduledMsg.customer.organization.email || undefined,
          });

          const message = await db.message.create({
            data: {
              customerId: scheduledMsg.customerId,
              organizationId: scheduledMsg.customer.organizationId,
              invoiceId: scheduledMsg.invoiceId,
              channel: "email",
              direction: "outbound",
              subject: scheduledMsg.subject,
              body: scheduledMsg.body,
              status: "sent",
              sentAt: now,
            },
          });

          await db.scheduledMessage.update({
            where: { id: scheduledMsg.id },
            data: {
              status: "sent",
              sentAt: now,
              processedAt: now,
              messageId: message.id,
            },
          });

          await db.campaignEnrollment.update({
            where: { id: scheduledMsg.enrollmentId },
            data: {
              lastMessageSentAt: now,
            },
          });

          results.sent++;
          console.log(` Sent email ${scheduledMsg.id} to ${scheduledMsg.customer.email}`);
        }
      } catch (error: any) {
        console.error(`L Error processing message ${scheduledMsg.id}:`, error);

        // Update failure count and status
        const failureCount = scheduledMsg.failureCount + 1;
        const maxRetries = 3;

        await db.scheduledMessage.update({
          where: { id: scheduledMsg.id },
          data: {
            failureCount,
            status: failureCount >= maxRetries ? "failed" : "pending",
            errorMessage: error.message || "Unknown error",
            processedAt: failureCount >= maxRetries ? now : undefined,
          },
        });

        results.failed++;
      }
    }

    console.log(" Scheduled message processing complete", results);

    return NextResponse.json({
      success: true,
      processed: pendingMessages.length,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("L Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
