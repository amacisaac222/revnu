# Lob.com Certified Mail Setup Guide

This guide walks through setting up Lob.com for automated USPS Certified Mail delivery of Notice of Intent to Lien letters.

## Overview

**Lob.com** is a programmatic mail API that enables sending physical letters via USPS with tracking.

**Features:**
- USPS Certified Mail with tracking
- Address verification before sending
- Real-time delivery tracking via webhooks
- Legally compliant delivery method for lien notices
- Cost: **$2.17 per certified letter**

---

## Step 1: Create Lob.com Account

1. Go to [https://dashboard.lob.com/register](https://dashboard.lob.com/register)
2. Sign up for a Lob.com account
3. Complete email verification

**Pricing:**
- Pay-as-you-go: No monthly fees
- Certified mail: $2.17 per letter
- Free address verification included

---

## Step 2: Get API Keys

1. Log in to [Lob Dashboard](https://dashboard.lob.com)
2. Navigate to **Settings** → **API Keys**
3. Copy your **Live Secret API Key** (starts with `live_`)
4. For testing, you can use **Test Secret API Key** (starts with `test_`)

⚠️ **Important:** Keep your API keys secret. Never commit them to git.

---

## Step 3: Add Environment Variables

Add the following to your `.env.local` file:

```bash
# Lob.com API Configuration
LOB_API_KEY=live_your_api_key_here
LOB_WEBHOOK_SECRET=your_webhook_secret_here
```

**To generate webhook secret:**
```bash
# Generate a random 32-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4: Configure Webhook in Lob Dashboard

Webhooks enable real-time delivery tracking updates.

### 4.1 Create Webhook Endpoint

1. In Lob Dashboard, go to **Settings** → **Webhooks**
2. Click **Add Webhook**
3. Configure webhook:

   **URL:** `https://yourdomain.com/api/webhooks/lob/tracking`

   **Events to subscribe to:**
   - ✅ `letter.created`
   - ✅ `letter.rendered`
   - ✅ `letter.in_transit`
   - ✅ `letter.in_local_area`
   - ✅ `letter.delivered`
   - ✅ `letter.re-routed`
   - ✅ `letter.returned_to_sender`
   - ✅ `letter.failed`

4. Click **Save Webhook**

### 4.2 Test Webhook (Optional)

Lob provides webhook testing in test mode:

```bash
# Send test webhook event
curl -X POST https://yourdomain.com/api/webhooks/lob/tracking \
  -H "Content-Type: application/json" \
  -H "lob-signature: your_webhook_secret" \
  -d '{
    "event_type": {
      "id": "letter.delivered"
    },
    "body": {
      "id": "ltr_test123",
      "tracking_number": "9400100000000000000000",
      "status": "delivered",
      "date_modified": "2026-01-31T12:00:00Z"
    }
  }'
```

---

## Step 5: Verify Integration

### 5.1 Test Address Verification

```typescript
import { verifyAddress } from "@/lib/certified-mail";

const result = await verifyAddress({
  name: "John Doe",
  address_line1: "1600 Pennsylvania Ave NW",
  address_city: "Washington",
  address_state: "DC",
  address_zip: "20500",
});

console.log(result.valid); // true
console.log(result.correctedAddress); // Standardized address
```

### 5.2 Test Certified Mail (Test Mode)

To test without actually sending mail, use test API key:

```bash
LOB_API_KEY=test_your_test_api_key_here
```

In test mode:
- No actual mail is sent
- No charges are incurred
- Webhooks still fire with simulated events
- All tracking numbers start with `test_`

---

## Step 6: Go Live

### 6.1 Switch to Live API Key

Update `.env.local` with live API key:

```bash
LOB_API_KEY=live_your_live_api_key_here
```

### 6.2 Add Billing Information

1. In Lob Dashboard, go to **Billing**
2. Add credit card for pay-as-you-go billing
3. Set up billing alerts (recommended)

### 6.3 Enable Production Webhook

Update webhook URL to production domain in Lob Dashboard.

---

## Usage in REVNU

### Sending a Notice of Intent

1. **Navigate to invoice** with lien-eligible status
2. **Generate NOI** - Click "Generate & Send NOI"
3. **Review PDF** - NOI PDF downloads automatically
4. **Send Certified Mail** - Click "Send via Certified Mail ($2.17)"
5. **Confirm sending** - Confirm cost and address
6. **Track delivery** - Tracking number displayed immediately

### Tracking Delivery

Real-time tracking updates are received via webhooks:

- **In Transit** - Letter is in USPS system
- **In Local Area** - Letter reached local postal facility
- **Delivered** - Letter successfully delivered (signed receipt)
- **Returned** - Undeliverable, returned to sender

### Delivery Status Updates

NOI delivery status automatically updates via webhooks:
- `pending` → `in_transit` → `delivered`
- Email notifications sent to contractor on delivery
- Audit logs created for compliance tracking

---

## Troubleshooting

### "Address not deliverable"

**Solution:** Use Lob's address verification to correct address:

```typescript
const verification = await verifyAddress(customerAddress);
if (verification.correctedAddress) {
  // Use corrected address
}
```

### Webhook signature verification failing

**Solution:** Ensure `LOB_WEBHOOK_SECRET` matches secret in Lob Dashboard

### "LOB_API_KEY not configured"

**Solution:** Add `LOB_API_KEY` to `.env.local` and restart dev server

---

## Cost Breakdown

**Per Certified Letter:**
- Base postage (First Class): $0.62
- Certified mail service: $1.55
- **Total: $2.17**

**Optional Add-ons:**
- Color printing: +$0.50
- Return envelope: +$0.30

**Typical NOI costs:**
- Black & white with return envelope: **$2.47**
- Standard black & white: **$2.17**

---

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use webhook signatures** to verify authenticity
3. **Store keys in environment variables** only
4. **Rotate keys periodically** (every 90 days recommended)
5. **Monitor API usage** in Lob Dashboard for anomalies
6. **Set up billing alerts** to prevent unexpected charges

---

## Lob.com Resources

- **Documentation:** https://docs.lob.com
- **API Reference:** https://docs.lob.com/api
- **Support:** support@lob.com
- **Status Page:** https://status.lob.com
- **Dashboard:** https://dashboard.lob.com

---

## Next Steps

After setup is complete:

1. ✅ Test address verification
2. ✅ Send test certified mail (test mode)
3. ✅ Verify webhook delivery tracking
4. ✅ Review audit logs
5. ✅ Go live with production API key

**Questions?** Contact Lob support or review their comprehensive documentation.
