# 📱 Complete Twilio Setup Guide

## Overview

This guide will walk you through:
1. Creating a Twilio account
2. Getting your credentials
3. Purchasing a phone number
4. Configuring webhooks
5. Testing the setup

**Estimated Time**: 15-20 minutes
**Cost**: Free trial (with limitations) or ~$1.15/month for production number

---

## Step 1: Create Twilio Account

### 1.1 Sign Up

1. Go to: **https://www.twilio.com/try-twilio**
2. Fill out the form:
   - Email
   - Password
   - First Name, Last Name
3. Click **Start your free trial**

### 1.2 Verify Your Phone Number

1. Twilio will send you a verification code
2. Enter the code
3. Complete the questionnaire:
   - **Which Twilio product are you here to use?** → SMS
   - **What do you plan to build?** → Alerts & Notifications
   - **How do you want to build with Twilio?** → With code
   - **What is your preferred language?** → JavaScript

4. Click **Get Started with Twilio**

---

## Step 2: Get Your Twilio Credentials

Once logged in, you'll see the **Console Dashboard**.

### 2.1 Find Your Credentials

On the dashboard, you'll see a box labeled **Account Info**:

```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: [Click "Show" to reveal]
```

### 2.2 Copy Your Credentials

1. Click the **copy icon** next to Account SID
2. Click **Show** next to Auth Token, then copy it
3. Save these somewhere safe temporarily

**Important**: Never share these publicly or commit them to git!

---

## Step 3: Get a Phone Number

### 3.1 For Trial Account (Free, Limited)

1. On the dashboard, click **Get a Trial Number**
2. Twilio will assign you a US number automatically
3. Click **Choose this Number**

**Trial Limitations**:
- Can only send to verified phone numbers
- Messages include "Sent from your Twilio trial account"
- Limited to a few messages

### 3.2 For Production (Recommended - $1.15/month)

1. Go to: **https://console.twilio.com/us1/develop/phone-numbers/manage/search**
2. Or click: **Phone Numbers** → **Buy a Number**

3. **Search for a number**:
   - Country: United States
   - Capabilities: ✅ SMS, ✅ Voice
   - Optional: Enter your area code
   - Click **Search**

4. **Choose a number**:
   - Browse available numbers
   - Click **Buy** on your preferred number
   - Confirm purchase (~$1.15/month)

5. **Copy your phone number** (format: +15555555555)

---

## Step 4: Add Credentials to Your Project

### 4.1 Open `.env.local`

Navigate to your project folder:
```bash
cd C:\Users\amaci\Desktop\revenupros.com
```

Open `.env.local` in your text editor (or create it if it doesn't exist)

### 4.2 Add Twilio Variables

Add these lines:

```bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your-auth-token-here"
TWILIO_PHONE_NUMBER="+15555555555"
```

**Replace with your actual values**:
- `TWILIO_ACCOUNT_SID` - From Console Dashboard
- `TWILIO_AUTH_TOKEN` - From Console Dashboard (click "Show")
- `TWILIO_PHONE_NUMBER` - Your Twilio number (include +1)

### 4.3 Verify Format

✅ **Correct**:
```bash
TWILIO_ACCOUNT_SID="AC1234567890abcdef1234567890abcd"
TWILIO_AUTH_TOKEN="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
TWILIO_PHONE_NUMBER="+15551234567"
```

❌ **Incorrect**:
```bash
TWILIO_PHONE_NUMBER="555-123-4567" # Missing +1
TWILIO_PHONE_NUMBER=15551234567 # Missing + and quotes
```

### 4.4 Save the File

**Important**:
- `.env.local` is in `.gitignore` - never commit it to git
- Keep these credentials secret

---

## Step 5: Configure SMS Webhook

This tells Twilio where to send incoming SMS replies (for opt-out handling).

### 5.1 Go to Phone Numbers

1. Navigate to: **https://console.twilio.com/us1/develop/phone-numbers/manage/incoming**
2. Or: **Phone Numbers** → **Manage** → **Active Numbers**
3. Click on **your phone number**

### 5.2 Configure Messaging

Scroll down to **Messaging Configuration** section:

**Under "A MESSAGE COMES IN"**:
1. Select: `Webhook`
2. HTTP Method: `POST`
3. URL: (see below)

### 5.3 Set Webhook URL

#### For Local Development (Testing):

You need **ngrok** to expose your localhost:

1. **Install ngrok**: https://ngrok.com/download
   ```bash
   # Or via npm
   npm install -g ngrok
   ```

2. **Start your Next.js dev server**:
   ```bash
   npm run dev
   ```

3. **In another terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** from ngrok:
   ```
   Forwarding: https://abc123.ngrok-free.app -> http://localhost:3000
   ```

5. **Use this webhook URL**:
   ```
   https://abc123.ngrok-free.app/api/webhooks/sms-reply
   ```

**Note**: ngrok URL changes every time you restart it (on free plan)

#### For Production (Deployment):

```
https://revenupros.com/api/webhooks/sms-reply
```

Or your Vercel URL:
```
https://your-project.vercel.app/api/webhooks/sms-reply
```

### 5.4 Save Configuration

Click **Save** at the bottom of the page.

---

## Step 6: Test Your Setup

### 6.1 Run the Test Script

We've created a test script to verify everything:

```bash
node scripts/test-twilio.js
```

**Expected Output**:
```
🔍 Testing Twilio Configuration...

Step 1: Checking Environment Variables
✅ TWILIO_ACCOUNT_SID: AC1234567...
✅ TWILIO_AUTH_TOKEN: a1b2c3d4e...
✅ TWILIO_PHONE_NUMBER: +15551234567

Step 2: Initializing Twilio Client
✅ Twilio client initialized

Step 3: Verifying Account
✅ Account verified: Your Account Name
   Status: active
   Type: Trial

Step 4: Verifying Phone Number
✅ Phone number verified: +15551234567
   Capabilities: SMS=true, Voice=true
   SMS Webhook: https://your-webhook-url/api/webhooks/sms-reply

Step 5: Send Test SMS (Optional)
⚠️  Skipping test SMS to avoid charges

============================================================
✅ Twilio configuration is VALID and ready to use!
============================================================
```

### 6.2 If Test Fails

**Error: "TWILIO_ACCOUNT_SID not set"**
- Make sure `.env.local` exists
- Check the variable names match exactly
- Restart your terminal/IDE

**Error: "Failed to verify account"**
- Check your Account SID and Auth Token are correct
- Make sure you copied them fully (no spaces)
- Verify the Auth Token hasn't expired

**Error: "Phone number not found"**
- Check phone number format: +15555555555
- Make sure the number is in your Twilio account
- Verify it's not a placeholder example number

---

## Step 7: Test SMS Sending

### 7.1 Via Your Application

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to**: http://localhost:3000/dashboard

3. **Test the send-test endpoint**:
   - Option A: Use the UI (if you have a test form)
   - Option B: Use curl:

   ```bash
   curl -X POST http://localhost:3000/api/sequences/send-test \
     -H "Content-Type: application/json" \
     -d "{\"channel\":\"sms\",\"message\":\"Test from REVNU\",\"testPhone\":\"+15555555555\"}"
   ```

   **Replace** `+15555555555` with:
   - **Trial account**: Your verified phone number
   - **Production**: Any valid US phone number

### 7.2 Expected Response

**Success**:
```json
{
  "success": true,
  "message": "Test SMS sent successfully",
  "channel": "sms",
  "sentTo": "+15555555555",
  "messageSid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**During Quiet Hours** (before 8 AM or after 9 PM):
```json
{
  "success": true,
  "scheduled": true,
  "scheduledFor": "2025-01-29T13:00:00.000Z",
  "message": "Test SMS scheduled for 1/29/2025, 8:00:00 AM",
  "channel": "sms"
}
```

---

## Step 8: Test Opt-Out Webhook

### 8.1 Send Initial SMS

Use the test above to send an SMS to your phone.

### 8.2 Reply with Opt-Out Keyword

From your phone, reply to the SMS with:
```
STOP
```

Or any of these keywords:
- STOPALL
- UNSUBSCRIBE
- CANCEL
- END
- QUIT

### 8.3 Expected Behavior

1. **You receive auto-reply**:
   ```
   You have been unsubscribed from [Your Business Name] SMS messages.
   Reply START to resubscribe.
   ```

2. **Database updated** (check with):
   ```sql
   SELECT name, phone, "smsOptedOut", "smsOptOutDate"
   FROM "Customer"
   WHERE phone = '+15555555555';
   ```

   Should show: `smsOptedOut = true`

3. **Audit log created**:
   ```sql
   SELECT * FROM "AuditLog"
   WHERE action = 'sms_opt_out'
   ORDER BY "createdAt" DESC
   LIMIT 1;
   ```

4. **Active campaigns paused**:
   ```sql
   SELECT id, status, "pauseReason"
   FROM "CampaignEnrollment"
   WHERE "customerId" = 'customer-id'
   AND status = 'paused';
   ```

### 8.4 Test Re-Opt-In

Reply to the SMS with:
```
START
```

You should receive:
```
You have been resubscribed to [Your Business Name] SMS messages.
Reply STOP to unsubscribe.
```

And `smsOptedOut` should be `false` again.

---

## Step 9: Production Deployment

### 9.1 Add to Vercel

1. **Go to your Vercel project**
2. **Settings** → **Environment Variables**
3. **Add each variable**:
   - Name: `TWILIO_ACCOUNT_SID`
   - Value: (your Account SID)
   - Environment: Production, Preview, Development
   - Click **Save**

Repeat for:
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

### 9.2 Update Webhook for Production

1. **Go back to Twilio Console**
2. **Phone Numbers** → **Manage** → **Active Numbers**
3. **Click your number**
4. **Update webhook URL** to:
   ```
   https://revenupros.com/api/webhooks/sms-reply
   ```
5. **Save**

### 9.3 Test Production

Send test SMS through your production app and verify:
- Messages send successfully
- Opt-out works
- Quiet hours enforcement active
- Webhook logs appear in Vercel

---

## 📊 Twilio Pricing

### Trial Account
- **Cost**: Free
- **Includes**: $15.50 trial credit
- **Limitations**:
  - Can only send to verified numbers
  - "Trial account" disclaimer in messages
  - Limited message volume

### Production Pricing
- **Phone Number**: $1.15/month
- **SMS Outbound**: $0.0079 per message (US)
- **SMS Inbound**: $0.0079 per message (US)

**Example**:
- 100 customers
- 5 messages each per month
- Total: 500 messages × $0.0079 = $3.95 + $1.15 = **$5.10/month**

### Upgrade to Production

1. **Add billing info**: https://console.twilio.com/us1/billing/manage-billing/billing-overview
2. **Click "Upgrade"**
3. **Add credit card**
4. **Set up auto-recharge** (recommended: $20 threshold, $50 recharge)

---

## 🔧 Troubleshooting

### "Error 21608: The number is unverified"

**Problem**: Trial account trying to send to unverified number

**Solution**:
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click **Add a new number**
3. Enter the recipient's number
4. Verify via SMS code

Or upgrade to production account.

---

### "Error 20003: Authentication Error"

**Problem**: Invalid Account SID or Auth Token

**Solution**:
1. Double-check credentials in Console
2. Make sure no extra spaces
3. Verify .env.local is loaded
4. Restart dev server

---

### "Webhook not receiving requests"

**Problem**: Twilio can't reach your webhook

**Solution**:
- **Local**: Make sure ngrok is running and URL is current
- **Production**: Verify URL is correct (https, not http)
- **Both**: Check webhook logs in Twilio Console

To view logs:
1. Go to: https://console.twilio.com/us1/monitor/logs/sms
2. Click on a message
3. See webhook request/response

---

### "Messages not sending during quiet hours"

**This is correct!** Quiet hours enforcement means:
- SMS blocked before 8 AM or after 9 PM local time
- Messages queued for next morning at 8 AM
- Cron job will process them automatically

To test:
1. Create scheduled message
2. Run cron job: `curl http://localhost:3000/api/cron/process-scheduled-messages -H "Authorization: Bearer your-secret"`
3. Message will send

---

## ✅ Setup Complete Checklist

- [ ] Twilio account created
- [ ] Account SID copied
- [ ] Auth Token copied
- [ ] Phone number purchased or assigned
- [ ] Credentials added to `.env.local`
- [ ] Test script passed (`node scripts/test-twilio.js`)
- [ ] SMS webhook configured
- [ ] Test message sent successfully
- [ ] Opt-out tested (reply STOP)
- [ ] Re-opt-in tested (reply START)
- [ ] Production credentials added to Vercel (if deploying)

---

## 🎯 Next Steps

1. **Test quiet hours**: Send message outside 8 AM - 9 PM
2. **Test campaign**: Create campaign and verify messages schedule
3. **Monitor usage**: https://console.twilio.com/us1/monitor/logs/sms
4. **Set up billing alerts**: Avoid surprise charges

---

## 📞 Support

- **Twilio Docs**: https://www.twilio.com/docs/sms
- **Twilio Support**: https://support.twilio.com
- **REVNU Docs**: See TESTING_GUIDE.md

Your Twilio setup is complete! 🎉
