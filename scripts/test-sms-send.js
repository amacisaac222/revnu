/**
 * Direct Twilio SMS Test
 *
 * Tests SMS sending directly without authentication
 * Run with: node scripts/test-sms-send.js
 */

const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (value) process.env[key] = value;
    }
  });
}

const twilio = require('twilio');

async function testSMS() {
  console.log('\n🧪 Testing Twilio SMS Configuration...\n');

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  // Step 1: Check environment variables
  console.log('Step 1: Environment Variables');
  if (!accountSid) {
    console.log('❌ TWILIO_ACCOUNT_SID not set');
    process.exit(1);
  }
  console.log(`✅ TWILIO_ACCOUNT_SID: ${accountSid}`);

  if (!authToken) {
    console.log('❌ TWILIO_AUTH_TOKEN not set');
    process.exit(1);
  }
  console.log(`✅ TWILIO_AUTH_TOKEN: ${authToken.substring(0, 8)}...`);

  if (messagingServiceSid) {
    console.log(`✅ TWILIO_MESSAGING_SERVICE_SID: ${messagingServiceSid}`);
  } else if (phoneNumber) {
    console.log(`✅ TWILIO_PHONE_NUMBER: ${phoneNumber}`);
  } else {
    console.log('❌ Either TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER required');
    process.exit(1);
  }

  // Step 2: Initialize Twilio client
  console.log('\nStep 2: Initializing Twilio Client');
  let client;
  try {
    client = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized');
  } catch (error) {
    console.log(`❌ Failed to initialize client: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Send test SMS
  console.log('\nStep 3: Sending Test SMS');
  console.log(`📱 Sending to: ${phoneNumber} (your Twilio number)`);
  console.log(`📝 Message: "Test from REVNU - Your MVP is ready! 🚀"`);

  try {
    const messageParams = {
      to: phoneNumber,
      body: 'Test from REVNU - Your MVP is ready! 🚀'
    };

    // Use Messaging Service SID if available, otherwise use from number
    if (messagingServiceSid) {
      messageParams.messagingServiceSid = messagingServiceSid;
      console.log(`📨 Using Messaging Service: ${messagingServiceSid}`);
    } else {
      messageParams.from = phoneNumber;
      console.log(`📨 Using From Number: ${phoneNumber}`);
    }

    const message = await client.messages.create(messageParams);

    console.log('\n✅ SMS SENT SUCCESSFULLY!\n');
    console.log('Message Details:');
    console.log(`  SID: ${message.sid}`);
    console.log(`  To: ${message.to}`);
    console.log(`  From: ${message.from}`);
    console.log(`  Status: ${message.status}`);
    console.log(`  Date: ${message.dateCreated}`);

    console.log('\n🎉 SUCCESS! Twilio is configured correctly!\n');
    console.log('Next steps:');
    console.log('1. Check your phone for the test message');
    console.log('2. Complete onboarding to generate sequences');
    console.log('3. Create a test campaign\n');

  } catch (error) {
    console.log(`\n❌ FAILED TO SEND SMS\n`);
    console.log(`Error: ${error.message}`);
    if (error.code) console.log(`Code: ${error.code}`);
    if (error.moreInfo) console.log(`More info: ${error.moreInfo}`);
    console.log('\nTroubleshooting:');
    console.log('1. Verify your Twilio credentials are correct');
    console.log('2. Check your Twilio account balance');
    console.log('3. Ensure phone number or Messaging Service is active');
    console.log('4. Review Twilio error codes: https://www.twilio.com/docs/api/errors\n');
    process.exit(1);
  }
}

testSMS().catch(console.error);
