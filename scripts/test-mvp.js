/**
 * Simple MVP Test Script (JavaScript)
 * Run with: node scripts/test-mvp.js
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testMVP() {
  console.log('🔍 Testing MVP Components...\n');

  const results = [];

  // Test 1: Database Connection
  try {
    await db.$connect();
    console.log('✅ Database Connection: PASS');
    results.push({ test: 'Database', status: 'PASS' });
  } catch (error) {
    console.log('❌ Database Connection: FAIL');
    console.log('   Error:', error.message);
    results.push({ test: 'Database', status: 'FAIL' });
    await db.$disconnect();
    return;
  }

  // Test 2: Check Organizations
  try {
    const orgCount = await db.organization.count();
    console.log(`✅ Organizations Table: PASS (${orgCount} organizations)`);
    results.push({ test: 'Organizations', status: 'PASS', count: orgCount });
  } catch (error) {
    console.log('❌ Organizations Table: FAIL');
    console.log('   Error:', error.message);
    results.push({ test: 'Organizations', status: 'FAIL' });
  }

  // Test 3: Check Sequence Templates
  try {
    const totalSeq = await db.sequenceTemplate.count();
    const standardSeq = await db.sequenceTemplate.count({ where: { source: 'standard' } });
    const lienSeq = await db.sequenceTemplate.count({ where: { isLienSequence: true } });

    console.log(`✅ Sequence Templates: PASS`);
    console.log(`   Total: ${totalSeq}, Standard: ${standardSeq}, Lien: ${lienSeq}`);
    results.push({ test: 'Sequences', status: 'PASS', total: totalSeq, standard: standardSeq, lien: lienSeq });
  } catch (error) {
    console.log('❌ Sequence Templates: FAIL');
    console.log('   Error:', error.message);
    results.push({ test: 'Sequences', status: 'FAIL' });
  }

  // Test 4: Check Scheduled Messages
  try {
    const total = await db.scheduledMessage.count();
    const pending = await db.scheduledMessage.count({ where: { status: 'pending' } });
    const sent = await db.scheduledMessage.count({ where: { status: 'sent' } });

    console.log(`✅ Scheduled Messages: PASS`);
    console.log(`   Total: ${total}, Pending: ${pending}, Sent: ${sent}`);
    results.push({ test: 'Scheduled Messages', status: 'PASS', total, pending, sent });
  } catch (error) {
    console.log('❌ Scheduled Messages: FAIL');
    console.log('   Error:', error.message);
    results.push({ test: 'Scheduled Messages', status: 'FAIL' });
  }

  // Test 5: Check Environment Variables
  const requiredEnvs = ['DATABASE_URL', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'];
  const optionalEnvs = ['TWILIO_ACCOUNT_SID', 'RESEND_API_KEY', 'ANTHROPIC_API_KEY', 'CRON_SECRET'];

  const missingRequired = requiredEnvs.filter(v => !process.env[v]);
  const missingOptional = optionalEnvs.filter(v => !process.env[v]);

  if (missingRequired.length === 0) {
    console.log('✅ Required Environment Variables: PASS');
  } else {
    console.log('❌ Required Environment Variables: FAIL');
    console.log('   Missing:', missingRequired.join(', '));
  }

  if (missingOptional.length > 0) {
    console.log('⚠️  Optional Environment Variables: WARNING');
    console.log('   Missing:', missingOptional.join(', '));
  } else {
    console.log('✅ Optional Environment Variables: PASS');
  }

  // Test 6: Check Implementation Files
  const fs = require('fs');
  const path = require('path');

  const requiredFiles = [
    'lib/quiet-hours.ts',
    'lib/message-queue.ts',
    'lib/campaign-executor.ts',
    'app/api/cron/process-scheduled-messages/route.ts',
    'app/api/webhooks/sms-reply/route.ts',
    'components/onboarding/step1-business-basics.tsx',
    'components/onboarding/step2-business-volume.tsx',
    'components/onboarding/step5-payment-contact.tsx',
  ];

  const missingFiles = requiredFiles.filter(file => {
    const filePath = path.join(process.cwd(), file);
    return !fs.existsSync(filePath);
  });

  if (missingFiles.length === 0) {
    console.log('✅ Implementation Files: PASS');
  } else {
    console.log('❌ Implementation Files: FAIL');
    console.log('   Missing:', missingFiles.join(', '));
  }

  await db.$disconnect();

  // Summary
  console.log('\n' + '='.repeat(80));
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  console.log(`\n📊 Summary: ${passCount} passed, ${failCount} failed\n`);

  if (failCount > 0) {
    console.log('❌ MVP has issues that need to be addressed.\n');
    process.exit(1);
  } else {
    console.log('✅ MVP core components are working!\n');
  }
}

testMVP().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
