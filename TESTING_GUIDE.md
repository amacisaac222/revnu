# REVNU MVP Testing Guide

## <¯ Testing Overview

This guide covers end-to-end testing of all MVP features including:
- 6 Standard Flows + AI generation
- Quiet hours enforcement
- SMS opt-out handling
- Scheduled message processing
- Campaign execution

---

##  Pre-Testing Setup

### 1. Environment Variables

Ensure these are set in your `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Twilio (for SMS)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+15555555555"

# Resend (for Email)
RESEND_API_KEY="re_..."

# Anthropic (for AI sequences)
ANTHROPIC_API_KEY="sk-ant-..."

# Cron Secret
CRON_SECRET="your-random-secret-here"
```

### 2. Database Setup

```bash
# Push schema to database
npx prisma db push

# Verify schema
npx prisma studio
```

### 3. Start Development Server

```bash
npm run dev
```

---

## >ê Test Plan

### Test 1: Onboarding Flow (Manual Integration Required)

**Status**:   Components created but need manual integration

**Steps**:
1. Follow instructions in `ONBOARDING_INTEGRATION.md`
2. Import the 3 new step components into `app/onboarding/onboarding-wizard.tsx`
3. Test complete onboarding flow

**Expected Result**:
- User can complete all 5 steps
- Business metrics questions appear in Step 2
- Payment setup appears in Step 5
- 6-8 sequences created automatically

**Verification**:
```sql
-- Check organization created
SELECT * FROM "Organization" ORDER BY "createdAt" DESC LIMIT 1;

-- Check sequences generated (should be 6-8)
SELECT
  id,
  name,
  source,
  "isLienSequence",
  "applicableStates"
FROM "SequenceTemplate"
WHERE "organizationId" = 'org-id-here'
ORDER BY "createdAt" DESC;

-- Verify all 6 standard flows present
SELECT source, COUNT(*) FROM "SequenceTemplate"
WHERE "organizationId" = 'org-id-here'
GROUP BY source;
```

**Expected Sequences**:
1. Standard Collections (source: "standard")
2. Urgent Collections (source: "standard")
3. New Customer Welcome (source: "standard")
4. Partial Payment Follow-up (source: "standard")
5. High-Value Invoice (source: "standard")
6. Mechanic's Lien - {State} (source: "standard", isLienSequence: true)
7-8. AI Custom Sequences (source: "ai_generated") - if Anthropic API available

---

### Test 2: Settings Page

**Navigate to**: `/dashboard/settings`

**Test Business Profile Tab**:
- [ ] Update business name
- [ ] Change primary state
- [ ] Update business metrics (invoices/year, late payments, time chasing)
- [ ] Save changes
- [ ] Verify changes persist after page reload

**Test Payment Methods Tab**:
- [ ] Add payment link (e.g., `https://pay.stripe.com/test`)
- [ ] Verify live preview updates
- [ ] Clear payment link
- [ ] Add payment instructions text
- [ ] Verify preview updates
- [ ] Save changes

**Verification**:
```sql
SELECT
  "businessName",
  "primaryState",
  "invoicesPerYear",
  "latePaymentsPerMonth",
  "timeSpentChasing",
  "defaultPaymentUrl",
  "paymentInstructions"
FROM "Organization"
WHERE id = 'org-id-here';
```

---

### Test 3: Campaign Creation & Message Scheduling

**Setup**:
1. Create test customer with phone and email
2. Create test invoice for that customer
3. Navigate to Send Reminders

**Steps**:
1. Create new campaign
2. Select "Standard Collections" sequence
3. Select test invoice
4. Launch campaign

**Expected Behavior**:
- Campaign enrollment created
- ScheduledMessage records created for each step
- Messages scheduled with quiet hours enforcement
- Console shows: `=Å Scheduled X messages for Y enrollments`

**Verification**:
```sql
-- Check enrollment created
SELECT * FROM "CampaignEnrollment"
WHERE "customerId" = 'customer-id-here'
ORDER BY "createdAt" DESC LIMIT 1;

-- Check messages scheduled
SELECT
  id,
  channel,
  "scheduledFor",
  status,
  subject,
  LEFT(body, 100) as body_preview
FROM "ScheduledMessage"
WHERE "enrollmentId" = 'enrollment-id-here'
ORDER BY "scheduledFor" ASC;

-- Verify quiet hours applied
SELECT
  EXTRACT(HOUR FROM "scheduledFor") as hour,
  COUNT(*)
FROM "ScheduledMessage"
WHERE channel = 'sms'
GROUP BY hour
ORDER BY hour;
-- SMS messages should only be scheduled between 8-21 (8 AM - 9 PM)
```

---

### Test 4: Quiet Hours Enforcement

**Test Scenario A: Send During Allowed Hours** (8 AM - 9 PM local time)

```bash
curl -X POST http://localhost:3000/api/sequences/send-test \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "sms",
    "message": "Test message during allowed hours",
    "testPhone": "+15555555555"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Test SMS sent successfully",
  "channel": "sms",
  "sentTo": "+15555555555",
  "messageSid": "SMxxx..."
}
```

**Test Scenario B: Send Outside Allowed Hours** (before 8 AM or after 9 PM)

Temporarily change system time or test timezone:

```bash
curl -X POST http://localhost:3000/api/sequences/send-test \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "sms",
    "message": "Test message during quiet hours",
    "testPhone": "+15555555555"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "scheduled": true,
  "scheduledFor": "2025-01-29T13:00:00.000Z",
  "message": "Test SMS scheduled for 1/29/2025, 8:00:00 AM (outside quiet hours)",
  "channel": "sms",
  "sentTo": "+15555555555"
}
```

**Test Scenario C: Email (No Quiet Hours)**

```bash
curl -X POST http://localhost:3000/api/sequences/send-test \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "email",
    "subject": "Test Email",
    "message": "<p>This should send anytime</p>",
    "testEmail": "test@example.com"
  }'
```

**Expected**: Email sends immediately regardless of time

---

### Test 5: SMS Opt-Out Webhook

**Setup Twilio Webhook** (for testing):

1. Start ngrok: `ngrok http 3000`
2. Configure Twilio webhook: `https://your-ngrok-url.ngrok.io/api/webhooks/sms-reply`

**Test Scenario A: Customer Sends "STOP"**

Reply "STOP" to any SMS from your Twilio number

**Expected Behavior**:
1. Webhook receives message
2. Customer record updated: `smsOptedOut = true`
3. Active campaigns paused
4. Audit log created
5. Twilio auto-reply: "You have been unsubscribed from {BusinessName} SMS messages..."

**Verification**:
```sql
-- Check opt-out flag
SELECT
  name,
  phone,
  "smsOptedOut",
  "smsOptOutDate"
FROM "Customer"
WHERE phone = '+15555555555';

-- Check campaigns paused
SELECT
  id,
  status,
  "pausedAt",
  "pauseReason"
FROM "CampaignEnrollment"
WHERE "customerId" = 'customer-id-here';

-- Check audit log
SELECT * FROM "AuditLog"
WHERE action = 'sms_opt_out'
ORDER BY "createdAt" DESC LIMIT 1;
```

**Test Scenario B: Customer Sends "START" (Re-opt-in)**

Reply "START" to SMS

**Expected Behavior**:
1. Customer record updated: `smsOptedOut = false`
2. Audit log created
3. Twilio auto-reply: "You have been resubscribed..."

---

### Test 6: Scheduled Message Processor (Cron Job)

**Test Scenario A: Manual Trigger**

```bash
curl -X GET http://localhost:3000/api/cron/process-scheduled-messages \
  -H "Authorization: Bearer your-cron-secret"
```

**Expected Response**:
```json
{
  "success": true,
  "processed": 5,
  "results": {
    "sent": 4,
    "skipped": 1,
    "failed": 0,
    "rescheduled": 0
  },
  "timestamp": "2025-01-28T10:00:00.000Z"
}
```

**Test Scenario B: Verify Message Sending**

1. Create a ScheduledMessage with `scheduledFor` in the past
2. Run cron job manually
3. Verify message was sent

**Setup**:
```sql
INSERT INTO "ScheduledMessage" (
  id,
  "enrollmentId",
  "sequenceStepId",
  "customerId",
  channel,
  body,
  "scheduledFor",
  status,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'enrollment-id-here',
  'step-id-here',
  'customer-id-here',
  'sms',
  'Test message',
  NOW() - INTERVAL '5 minutes', -- 5 minutes ago
  'pending',
  NOW(),
  NOW()
);
```

**Run**:
```bash
curl -X GET http://localhost:3000/api/cron/process-scheduled-messages \
  -H "Authorization: Bearer your-cron-secret"
```

**Verification**:
```sql
SELECT
  id,
  status,
  "sentAt",
  "processedAt",
  "messageId"
FROM "ScheduledMessage"
WHERE id = 'scheduled-message-id';
-- Status should be 'sent', messageId should be populated
```

**Test Scenario C: Skip Paid Invoice**

1. Create ScheduledMessage for an invoice
2. Mark invoice as paid
3. Run cron job

**Expected**:
- Message skipped
- Status: `skipped_paid`
- ErrorMessage: "Invoice already paid"

---

### Test 7: Template Variable Substitution

**Verify Templates Fill Correctly**:

Check that created ScheduledMessage records have properly filled templates:

```sql
SELECT
  body,
  subject
FROM "ScheduledMessage"
WHERE "enrollmentId" = 'enrollment-id-here'
LIMIT 1;
```

**Expected body should have**:
- `{{customerName}}` replaced with actual name
- `{{invoiceNumber}}` replaced with actual invoice number
- `{{amount}}` replaced with formatted dollar amount
- `{{businessName}}` replaced with your business name
- `{{paymentLink}}` replaced with actual payment URL

**Should NOT contain**:
- Any `{{variable}}` placeholders
- Empty spaces where variables should be

---

### Test 8: State-Specific Lien Sequences

**Test Different States**:

1. Create organization with `primaryState = "CA"`
2. Verify lien sequence created for California
3. Update `primaryState = "TX"`
4. Generate new sequences
5. Verify Texas lien sequence

**Verification**:
```sql
SELECT
  name,
  "applicableStates",
  "triggerDaysPastDue"
FROM "SequenceTemplate"
WHERE "isLienSequence" = true
AND "organizationId" = 'org-id-here';
```

**Expected**:
- Name includes state name (e.g., "Mechanic's Lien Protection - California")
- `applicableStates` = "CA" or "TX"
- Trigger = 30 days past due

**Check Step Content**:
```sql
SELECT
  "stepNumber",
  subject,
  LEFT(body, 200) as body_preview
FROM "SequenceStep"
WHERE "sequenceTemplateId" = 'lien-sequence-id'
ORDER BY "stepNumber";
```

**Expected**:
- California: References 90-day filing deadline, 20-day prelim notice
- Texas: References 15-day demand letter, different filing requirements

---

### Test 9: Message Queue Utilities

**Test queueMessage()**:

```typescript
import { queueMessage } from '@/lib/message-queue';

const scheduled = await queueMessage({
  enrollmentId: 'enrollment-id',
  sequenceStepId: 'step-id',
  customerId: 'customer-id',
  invoiceId: 'invoice-id',
  channel: 'sms',
  body: 'Test message',
  scheduledFor: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
});
```

**Test cancelPendingMessages()**:

```typescript
import { cancelPendingMessages } from '@/lib/message-queue';

// Cancel all messages for an invoice
const result = await cancelPendingMessages({
  invoiceId: 'invoice-id',
});
// Should return count of cancelled messages
```

**Test getUpcomingMessages()**:

```typescript
import { getUpcomingMessages } from '@/lib/message-queue';

const upcoming = await getUpcomingMessages('customer-id');
// Should return array of pending messages
```

---

## = Common Issues & Solutions

### Issue: Sequences Not Generated

**Symptoms**: Onboarding completes but no sequences created

**Check**:
```sql
SELECT COUNT(*) FROM "SequenceTemplate" WHERE "organizationId" = 'org-id';
```

**Solutions**:
1. Check API logs for errors
2. Verify Anthropic API key (for AI sequences)
3. Standard flows should always be created even if AI fails

### Issue: Messages Not Sending

**Symptoms**: ScheduledMessages stuck in "pending" status

**Check**:
```sql
SELECT
  status,
  "errorMessage",
  "failureCount"
FROM "ScheduledMessage"
WHERE status != 'sent'
LIMIT 10;
```

**Solutions**:
1. Verify Twilio/Resend credentials
2. Check customer opt-out status
3. Verify invoice not already paid
4. Check cron job is running

### Issue: Cron Job Not Running

**Symptoms**: Messages never process

**Solutions**:
1. Local: Run manually with curl
2. Vercel: Check deployment logs
3. Verify CRON_SECRET environment variable
4. Check `vercel.json` cron configuration

### Issue: Quiet Hours Not Working

**Symptoms**: SMS sent outside 8 AM - 9 PM

**Check**:
1. Organization timezone setting
2. ScheduledMessage `scheduledFor` timestamps
3. Quiet hours calculation logic

**Debug**:
```typescript
import { isWithinQuietHours } from '@/lib/quiet-hours';

const result = isWithinQuietHours('America/New_York');
console.log(result);
// {
//   canSendNow: false,
//   reason: "Current time is 22:00 (after 9 PM) in America/New_York",
//   nextAvailableTime: "2025-01-29T13:00:00.000Z"
// }
```

---

## =Ê Performance Benchmarks

**Sequence Generation**:
- Target: < 10 seconds for 6-8 sequences
- Standard flows only: < 2 seconds
- With AI: 5-10 seconds (depends on API)

**Message Scheduling**:
- Target: < 1 second per enrollment
- 100 enrollments: < 100 seconds

**Cron Job Processing**:
- Target: < 30 seconds for 100 messages
- Alert if > 1 minute

---

##  Final Checklist

Before launching to production:

- [ ] All 6 standard flows generate correctly
- [ ] State-specific lien sequences work for all 50 states
- [ ] Quiet hours enforcement blocks messages correctly
- [ ] SMS opt-out keywords pause campaigns
- [ ] Cron job processes messages every 5 minutes
- [ ] Template variables fill correctly
- [ ] Settings page saves all changes
- [ ] Mobile UI works properly
- [ ] Error handling graceful (no crashes)
- [ ] Audit logs created for compliance actions

---

## =€ Load Testing (Optional)

For production readiness:

1. **Create 100 test customers**
2. **Create 100 test invoices**
3. **Enroll all in campaign**
4. **Verify**:
   - 400-500 ScheduledMessages created (4-5 steps per enrollment)
   - All scheduled correctly
   - Cron job processes in batches
   - No errors or timeouts

---

## =Ý Testing Log Template

Use this to track your testing:

```
Date: ___________
Tester: ___________

Test 1: Onboarding Flow
Status: [ ] Pass [ ] Fail
Notes: _______________________

Test 2: Settings Page
Status: [ ] Pass [ ] Fail
Notes: _______________________

Test 3: Campaign Creation
Status: [ ] Pass [ ] Fail
Notes: _______________________

Test 4: Quiet Hours
Status: [ ] Pass [ ] Fail
Notes: _______________________

Test 5: SMS Opt-Out
Status: [ ] Pass [ ] Fail
Notes: _______________________

Test 6: Cron Job
Status: [ ] Pass [ ] Fail
Notes: _______________________

Test 7: Template Variables
Status: [ ] Pass [ ] Fail
Notes: _______________________

Test 8: Lien Sequences
Status: [ ] Pass [ ] Fail
Notes: _______________________

Overall MVP Readiness: [ ] Ready [ ] Needs Work

Issues Found:
1. _______________________
2. _______________________
3. _______________________
```

---

## <¯ Success Criteria

MVP is ready for launch when:

 User can complete onboarding
 6-8 sequences generated automatically
 Campaigns create scheduled messages
 Quiet hours enforcement works
 Cron job sends messages successfully
 Opt-out keywords pause campaigns
 No critical bugs
 Mobile experience acceptable

**Estimated Testing Time**: 3-4 hours for thorough testing
