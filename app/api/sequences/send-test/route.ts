import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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

    // For MVP, we'll simulate sending without actual Twilio/Resend integration
    // In production, you'll integrate with Twilio for SMS and Resend for email

    if (channel === "sms") {
      // TODO: Integrate with Twilio
      // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await twilio.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: testPhone
      // });

      // For now, simulate success
      console.log("📱 TEST SMS would be sent to:", testPhone);
      console.log("Message:", message);

      return NextResponse.json({
        success: true,
        message: "Test SMS simulated successfully (Twilio not configured)",
        channel: "sms",
        sentTo: testPhone,
      });
    }

    if (channel === "email") {
      // TODO: Integrate with Resend
      // const { Resend } = require('resend');
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: dbUser.organization.email || process.env.RESEND_FROM_EMAIL,
      //   to: testEmail,
      //   subject: subject || 'Test Payment Reminder',
      //   html: message
      // });

      // For now, simulate success
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

    return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
  } catch (error) {
    console.error("Error sending test message:", error);
    return NextResponse.json(
      { error: "Failed to send test message" },
      { status: 500 }
    );
  }
}
