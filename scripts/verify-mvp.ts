/**
 * MVP Verification Script
 *
 * Run with: npx ts-node scripts/verify-mvp.ts
 *
 * Checks:
 * - Database connectivity
 * - Schema integrity
 * - Required tables exist
 * - Standard flows present
 * - Settings configured
 * - Environment variables set
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: CheckResult[] = [];

async function runChecks() {
  console.log('= Running MVP Verification Checks...\n');

  // Check 1: Database Connection
  try {
    await db.$connect();
    results.push({
      name: 'Database Connection',
      status: 'PASS',
      message: 'Successfully connected to database',
    });
  } catch (error: any) {
    results.push({
      name: 'Database Connection',
      status: 'FAIL',
      message: `Failed to connect: ${error.message}`,
    });
    await printResults();
    process.exit(1);
  }

  // Check 2: Organizations Table
  try {
    const orgCount = await db.organization.count();
    results.push({
      name: 'Organizations Table',
      status: 'PASS',
      message: `Found ${orgCount} organizations`,
      details: { count: orgCount },
    });

    if (orgCount === 0) {
      results.push({
        name: 'Test Organization',
        status: 'WARN',
        message: 'No organizations found. Run onboarding to create one.',
      });
    }
  } catch (error: any) {
    results.push({
      name: 'Organizations Table',
      status: 'FAIL',
      message: `Error: ${error.message}`,
    });
  }

  // Check 3: SequenceTemplate Table
  try {
    const seqCount = await db.sequenceTemplate.count();
    results.push({
      name: 'SequenceTemplate Table',
      status: 'PASS',
      message: `Found ${seqCount} sequence templates`,
      details: { count: seqCount },
    });

    // Check for standard flows
    const standardFlows = await db.sequenceTemplate.findMany({
      where: { source: 'standard' },
      select: {
        name: true,
        source: true,
        isLienSequence: true,
      },
    });

    if (standardFlows.length >= 6) {
      results.push({
        name: 'Standard Flows',
        status: 'PASS',
        message: `Found ${standardFlows.length} standard flows`,
        details: standardFlows.map((f) => f.name),
      });
    } else if (standardFlows.length > 0) {
      results.push({
        name: 'Standard Flows',
        status: 'WARN',
        message: `Only ${standardFlows.length} standard flows (expected 6+)`,
        details: standardFlows.map((f) => f.name),
      });
    } else {
      results.push({
        name: 'Standard Flows',
        status: 'WARN',
        message: 'No standard flows found. Complete onboarding to generate.',
      });
    }

    // Check for lien sequences
    const lienFlows = await db.sequenceTemplate.findMany({
      where: { isLienSequence: true },
      select: {
        name: true,
        applicableStates: true,
      },
    });

    if (lienFlows.length > 0) {
      results.push({
        name: 'Lien Sequences',
        status: 'PASS',
        message: `Found ${lienFlows.length} lien sequences`,
        details: lienFlows.map((f) => `${f.name} (${f.applicableStates})`),
      });
    }
  } catch (error: any) {
    results.push({
      name: 'SequenceTemplate Table',
      status: 'FAIL',
      message: `Error: ${error.message}`,
    });
  }

  // Check 4: ScheduledMessage Table
  try {
    const msgCount = await db.scheduledMessage.count();
    const pendingCount = await db.scheduledMessage.count({
      where: { status: 'pending' },
    });
    const sentCount = await db.scheduledMessage.count({
      where: { status: 'sent' },
    });

    results.push({
      name: 'ScheduledMessage Table',
      status: 'PASS',
      message: `Total: ${msgCount}, Pending: ${pendingCount}, Sent: ${sentCount}`,
      details: { total: msgCount, pending: pendingCount, sent: sentCount },
    });

    // Check for overdue pending messages
    const overdueCount = await db.scheduledMessage.count({
      where: {
        status: 'pending',
        scheduledFor: {
          lt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        },
      },
    });

    if (overdueCount > 0) {
      results.push({
        name: 'Overdue Messages',
        status: 'WARN',
        message: `${overdueCount} messages overdue by 1+ hour. Run cron job.`,
      });
    }
  } catch (error: any) {
    results.push({
      name: 'ScheduledMessage Table',
      status: 'FAIL',
      message: `Error: ${error.message}`,
    });
  }

  // Check 5: Environment Variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];

  const optionalEnvVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'RESEND_API_KEY',
    'ANTHROPIC_API_KEY',
    'CRON_SECRET',
  ];

  const missingRequired = requiredEnvVars.filter((v) => !process.env[v]);
  const missingOptional = optionalEnvVars.filter((v) => !process.env[v]);

  if (missingRequired.length === 0) {
    results.push({
      name: 'Required Environment Variables',
      status: 'PASS',
      message: 'All required variables set',
    });
  } else {
    results.push({
      name: 'Required Environment Variables',
      status: 'FAIL',
      message: `Missing: ${missingRequired.join(', ')}`,
    });
  }

  if (missingOptional.length > 0) {
    results.push({
      name: 'Optional Environment Variables',
      status: 'WARN',
      message: `Missing: ${missingOptional.join(', ')}`,
      details: 'Some features may not work without these',
    });
  } else {
    results.push({
      name: 'Optional Environment Variables',
      status: 'PASS',
      message: 'All optional variables set',
    });
  }

  // Check 6: Quiet Hours Implementation Files
  const fs = require('fs');
  const path = require('path');

  const requiredFiles = [
    'lib/quiet-hours.ts',
    'lib/message-queue.ts',
    'lib/campaign-executor.ts',
    'lib/twilio.ts',
    'app/api/cron/process-scheduled-messages/route.ts',
    'app/api/webhooks/sms-reply/route.ts',
  ];

  const missingFiles = requiredFiles.filter((file) => {
    const filePath = path.join(process.cwd(), file);
    return !fs.existsSync(filePath);
  });

  if (missingFiles.length === 0) {
    results.push({
      name: 'Required Implementation Files',
      status: 'PASS',
      message: 'All required files present',
    });
  } else {
    results.push({
      name: 'Required Implementation Files',
      status: 'FAIL',
      message: `Missing: ${missingFiles.join(', ')}`,
    });
  }

  // Check 7: Organization Settings
  const orgs = await db.organization.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      businessName: true,
      primaryState: true,
      invoicesPerYear: true,
      latePaymentsPerMonth: true,
      timeSpentChasing: true,
      timezone: true,
      defaultPaymentUrl: true,
      paymentInstructions: true,
    },
  });

  for (const org of orgs) {
    const issues = [];
    if (!org.primaryState) issues.push('primaryState');
    if (!org.invoicesPerYear) issues.push('invoicesPerYear');
    if (org.latePaymentsPerMonth === null) issues.push('latePaymentsPerMonth');
    if (!org.timezone) issues.push('timezone');

    if (issues.length === 0) {
      results.push({
        name: `Organization: ${org.businessName}`,
        status: 'PASS',
        message: 'All settings configured',
      });
    } else {
      results.push({
        name: `Organization: ${org.businessName}`,
        status: 'WARN',
        message: `Missing settings: ${issues.join(', ')}`,
      });
    }
  }

  await printResults();
  await db.$disconnect();
}

function printResults() {
  console.log('\n=Ê Verification Results:\n');
  console.log('P'.repeat(80));

  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const result of results) {
    const icon = result.status === 'PASS' ? '' : result.status === 'WARN' ? ' ' : 'L';
    const color =
      result.status === 'PASS' ? '\x1b[32m' : result.status === 'WARN' ? '\x1b[33m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${icon} ${color}${result.name.padEnd(40)}${reset} ${result.message}`);

    if (result.details) {
      if (Array.isArray(result.details)) {
        result.details.forEach((detail) => {
          console.log(`   - ${detail}`);
        });
      } else if (typeof result.details === 'object') {
        Object.entries(result.details).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      } else {
        console.log(`   ${result.details}`);
      }
    }

    if (result.status === 'PASS') passCount++;
    if (result.status === 'WARN') warnCount++;
    if (result.status === 'FAIL') failCount++;
  }

  console.log('P'.repeat(80));
  console.log(
    `\n=È Summary: ${passCount} passed, ${warnCount} warnings, ${failCount} failed\n`
  );

  if (failCount > 0) {
    console.log('L MVP is NOT ready for launch. Address failures above.\n');
    process.exit(1);
  } else if (warnCount > 0) {
    console.log('   MVP is mostly ready, but some warnings need attention.\n');
  } else {
    console.log(' MVP is ready for launch! All checks passed.\n');
  }
}

runChecks().catch((error) => {
  console.error('Error running verification:', error);
  process.exit(1);
});
