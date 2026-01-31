/**
 * Twilio Test Script
 * Run with: node scripts/test-twilio.js
 *
 * Make sure .env.local has:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

// Load environment variables from .env.local manually
const fs = require('fs');
const path = require('path');
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
} catch (error) {
  console.log('Note: Could not load .env.local, using existing environment variables');
}

async function testTwilio() {
  console.log('🔍 Testing Twilio Configuration...\n');

  // Step 1: Check environment variables
  console.log('Step 1: Checking Environment Variables');
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid) {
    console.log('❌ TWILIO_ACCOUNT_SID not set');
    return;
  }
  console.log(`✅ TWILIO_ACCOUNT_SID: ${accountSid.substring(0, 10)}...`);

  if (!authToken) {
    console.log('❌ TWILIO_AUTH_TOKEN not set');
    return;
  }
  console.log(`✅ TWILIO_AUTH_TOKEN: ${authToken.substring(0, 10)}...`);

  if (!phoneNumber) {
    console.log('❌ TWILIO_PHONE_NUMBER not set');
    return;
  }
  console.log(`✅ TWILIO_PHONE_NUMBER: ${phoneNumber}`);

  // Step 2: Initialize Twilio client
  console.log('\nStep 2: Initializing Twilio Client');
  let client;
  try {
    const twilio = require('twilio');
    client = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized');
  } catch (error) {
    console.log('❌ Failed to initialize Twilio client');
    console.log('   Error:', error.message);
    console.log('   Hint: Run "npm install twilio"');
    return;
  }

  // Step 3: Verify account
  console.log('\nStep 3: Verifying Account');
  try {
    const account = await client.api.accounts(accountSid).fetch();
    console.log(`✅ Account verified: ${account.friendlyName}`);
    console.log(`   Status: ${account.status}`);
    console.log(`   Type: ${account.type}`);
  } catch (error) {
    console.log('❌ Failed to verify account');
    console.log('   Error:', error.message);
    console.log('   Hint: Check your ACCOUNT_SID and AUTH_TOKEN');
    return;
  }

  // Step 4: Verify phone number
  console.log('\nStep 4: Verifying Phone Number');
  try {
    const numbers = await client.incomingPhoneNumbers.list({ phoneNumber });
    if (numbers.length === 0) {
      console.log('❌ Phone number not found in your account');
      console.log(`   Number: ${phoneNumber}`);
      console.log('   Hint: Check the phone number format (+15555555555)');
      return;
    }
    const number = numbers[0];
    console.log(`✅ Phone number verified: ${number.friendlyName || number.phoneNumber}`);
    console.log(`   Capabilities: SMS=${number.capabilities.sms}, Voice=${number.capabilities.voice}`);
    if (number.smsUrl) {
      console.log(`   SMS Webhook: ${number.smsUrl}`);
    } else {
      console.log('   ⚠️  SMS Webhook not configured yet');
    }
  } catch (error) {
    console.log('❌ Failed to verify phone number');
    console.log('   Error:', error.message);
    return;
  }

  // Step 5: Test message (optional)
  console.log('\nStep 5: Send Test SMS (Optional)');
  console.log('⚠️  Skipping test SMS to avoid charges');
  console.log('   To test manually, add your verified number below:\n');
  console.log('   const testNumber = "+15555555555"; // Your verified number');
  console.log('   const message = await client.messages.create({');
  console.log('     to: testNumber,');
  console.log(`     from: "${phoneNumber}",`);
  console.log('     body: "Test from REVNU - Reply STOP to unsubscribe"');
  console.log('   });');
  console.log('   console.log("Message sent:", message.sid);\n');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Twilio configuration is VALID and ready to use!');
  console.log('='.repeat(60));
  console.log('\nNext Steps:');
  console.log('1. Configure webhook in Twilio console');
  console.log('2. Test SMS sending via your app');
  console.log('3. Test opt-out by replying STOP\n');
}

testTwilio().catch(error => {
  console.error('\n❌ Test failed:', error.message);
});
