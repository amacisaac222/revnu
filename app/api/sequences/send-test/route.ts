import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sendSMS } from "@/lib/twilio";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      include: { organization: true },
    });

    if (!dbUser?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const body = await req.json();
    const { channel, subject, message, testEmail, testPhone } = body;

    // Validate inputs
    if (!channel || !message) {
      return NextResponse.json(
        { error: "Channel and message are required" },
        { status: 400 }
      );
    }

    if (channel === "email" && !testEmail) {
      return NextResponse.json(
        { error: "Email address is required for email tests" },
        { status: 400 }
      );
    }

    if (channel === "sms" && !testPhone) {
      return NextResponse.json(
        { error: "Phone number is required for SMS tests" },
        { status: 400 }
      );
    }

    if (channel === "sms") {
      try {
        const result = await sendSMS({
          to: testPhone,
          body: message,
          timezone: dbUser.organization.timezone || "America/New_York",
          respectQuietHours: true,
        });

        if (result.scheduled) {
          return NextResponse.json({
            success: true,
            scheduled: true,
            scheduledFor: result.scheduledFor,
            message: `Test SMS scheduled for ${result.scheduledFor?.toLocaleString()} (outside quiet hours)`,
            channel: "sms",
            sentTo: testPhone,
          });
        }

        return NextResponse.json({
          success: true,
          message: "Test SMS sent successfully",
          channel: "sms",
          sentTo: testPhone,
          messageSid: result.messageSid,
        });
      } catch (error: any) {
        // Fallback to simulation if Twilio not configured
        if (error.message?.includes("not configured")) {
          console.log("📱 TEST SMS would be sent to:", testPhone);
          console.log("Message:", message);

          return NextResponse.json({
            success: true,
            message: "Test SMS simulated successfully (Twilio not configured)",
            channel: "sms",
            sentTo: testPhone,
          });
        }
        throw error;
      }
    }

    if (channel === "email") {
      try {
        await sendEmail({
          to: testEmail,
          subject: subject || "Test Payment Reminder",
          html: message,
          from: dbUser.organization.email || undefined,
        });

        return NextResponse.json({
          success: true,
          message: "Test email sent successfully",
          channel: "email",
          sentTo: testEmail,
        });
      } catch (error: any) {
        // Fallback to simulation if Resend not configured
        if (error.message?.includes("not configured")) {
          console.log("📧 TEST EMAIL would be sent to:", testEmail);
          console.log("Subject:", subject);
          console.log("Message:", message);

          return NextResponse.json({
            success: true,
            message: "Test email simulated successfully (Resend not configured)",
            channel: "email",
            sentTo: testEmail,
          });
        }
        throw error;
      }
    }

    return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
  } catch (error) {
    console.error("Error sending test message:", error);
    return NextResponse.json(
      { error: "Failed to send test message" },
      { status: 500 }
    );
  }
}
