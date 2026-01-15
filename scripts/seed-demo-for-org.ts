import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...');

  // Get email from command line argument or prompt
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error('❌ Please provide an email address:');
    console.log('Usage: npm run seed:demo:org your-email@example.com');

    // Show available users
    const users = await prisma.user.findMany({
      include: { organization: true },
    });

    console.log('\n📋 Available users:');
    users.forEach(u => {
      console.log(`  - ${u.email} (${u.organization.businessName})`);
    });

    return;
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: { organization: true },
  });

  if (!user?.organization) {
    console.error(`❌ No user found with email: ${targetEmail}`);
    return;
  }

  const orgId = user.organization.id;
  console.log(`✅ Found organization: ${user.organization.businessName} (${user.email})`);

  // Delete existing demo data for this org (optional - comment out if you want to keep existing data)
  console.log('🗑️  Cleaning up existing demo data...');
  await prisma.message.deleteMany({ where: { organizationId: orgId } });
  await prisma.invoice.deleteMany({ where: { organizationId: orgId } });
  await prisma.customer.deleteMany({ where: { organizationId: orgId } });
  console.log('✅ Cleanup complete');

  // Create demo customers with property addresses for lien-eligible invoices
  console.log('👥 Creating customers...');
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        organizationId: orgId,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+15551234567',
        address: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        propertyAddress: '456 Oak Ave',
        propertyCity: 'Los Angeles',
        propertyState: 'CA',
        propertyZip: '90002',
        smsConsentGiven: true,
        emailConsentGiven: true,
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: orgId,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@example.com',
        phone: '+15559876543',
        address: '789 Pine St',
        city: 'Austin',
        state: 'TX',
        zip: '73301',
        propertyAddress: '321 Cedar Ln',
        propertyCity: 'Austin',
        propertyState: 'TX',
        propertyZip: '73302',
        smsConsentGiven: true,
        emailConsentGiven: true,
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: orgId,
        firstName: 'Mike',
        lastName: 'Rodriguez',
        email: 'mike.r@example.com',
        phone: '+15551112222',
        address: '555 Elm St',
        city: 'Miami',
        state: 'FL',
        zip: '33101',
        propertyAddress: '777 Maple Dr',
        propertyCity: 'Miami',
        propertyState: 'FL',
        propertyZip: '33102',
        smsConsentGiven: true,
        emailConsentGiven: true,
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: orgId,
        firstName: 'Lisa',
        lastName: 'Chen',
        email: 'lisa.chen@example.com',
        phone: '+15553334444',
        address: '999 Birch Ave',
        city: 'Phoenix',
        state: 'AZ',
        zip: '85001',
        propertyAddress: '111 Willow Ct',
        propertyCity: 'Phoenix',
        propertyState: 'AZ',
        propertyZip: '85002',
        smsConsentGiven: true,
        emailConsentGiven: true,
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Create lien-eligible invoices with varying urgency levels
  console.log('📄 Creating invoices...');
  const now = new Date();
  const invoices = await Promise.all([
    // Very urgent - 80 days since work completion (10 days left for CA 90-day deadline)
    prisma.invoice.create({
      data: {
        organizationId: orgId,
        customerId: customers[0].id,
        invoiceNumber: 'INV-2001',
        description: 'Electrical panel installation and wiring repair',
        invoiceDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        amountDue: 450000, // $4,500
        amountPaid: 0,
        amountRemaining: 450000,
        status: 'outstanding',
        daysPastDue: 60,
        firstWorkDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        lastWorkDate: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
        lienEligible: true,
        preliminaryNoticeSent: true,
        preliminaryNoticeSentAt: new Date(now.getTime() - 85 * 24 * 60 * 60 * 1000),
      },
    }),
    // Urgent - 55 days since completion (35 days left for CA)
    prisma.invoice.create({
      data: {
        organizationId: orgId,
        customerId: customers[1].id,
        invoiceNumber: 'INV-2002',
        description: 'HVAC system replacement - commercial unit',
        invoiceDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        amountDue: 1250000, // $12,500
        amountPaid: 0,
        amountRemaining: 1250000,
        status: 'outstanding',
        daysPastDue: 30,
        firstWorkDate: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000),
        lastWorkDate: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000),
        lienEligible: true,
        preliminaryNoticeSent: true,
        preliminaryNoticeSentAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      },
    }),
    // Upcoming - 25 days since completion (65 days left)
    prisma.invoice.create({
      data: {
        organizationId: orgId,
        customerId: customers[2].id,
        invoiceNumber: 'INV-2003',
        description: 'Plumbing repairs - kitchen and bathroom remodel',
        invoiceDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        amountDue: 875000, // $8,750
        amountPaid: 0,
        amountRemaining: 875000,
        status: 'outstanding',
        daysPastDue: 15,
        firstWorkDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        lastWorkDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        lienEligible: true,
        preliminaryNoticeSent: false,
      },
    }),
    // Safe - 10 days since completion (80 days left)
    prisma.invoice.create({
      data: {
        organizationId: orgId,
        customerId: customers[3].id,
        invoiceNumber: 'INV-2004',
        description: 'Roofing replacement and gutter installation',
        invoiceDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        amountDue: 1650000, // $16,500
        amountPaid: 0,
        amountRemaining: 1650000,
        status: 'outstanding',
        daysPastDue: 5,
        firstWorkDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        lastWorkDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        lienEligible: true,
        preliminaryNoticeSent: false,
      },
    }),
  ]);

  console.log(`✅ Created ${invoices.length} lien-eligible invoices`);

  // Create messages for communications tracking
  console.log('💬 Creating messages...');

  // Historical messages (older than 30 days)
  const historicalMessages = [];
  for (let i = 0; i < 19; i++) {
    const daysAgo = 31 + Math.floor(Math.random() * 30); // 31-60 days ago
    historicalMessages.push(
      prisma.message.create({
        data: {
          organizationId: orgId,
          customerId: customers[i % customers.length].id,
          invoiceId: invoices[i % invoices.length].id,
          channel: i % 2 === 0 ? 'sms' : 'email',
          direction: 'outbound',
          subject: i % 2 === 0 ? null : 'Payment Reminder',
          body: `Payment reminder for invoice ${invoices[i % invoices.length].invoiceNumber}`,
          status: 'delivered',
          sentAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
          deliveredAt: new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000 - 5 * 60 * 1000)),
          isAutomated: true,
        },
      })
    );
  }

  // Recent messages (last 30 days) - for widget display
  const recentMessages = [];
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 30); // 0-29 days ago
    const isFailed = i < 3; // 3 failed messages
    const channel = i % 3 === 0 ? 'email' : 'sms';

    recentMessages.push(
      prisma.message.create({
        data: {
          organizationId: orgId,
          customerId: customers[i % customers.length].id,
          invoiceId: invoices[i % invoices.length].id,
          channel,
          direction: 'outbound',
          subject: channel === 'email' ? 'Payment Reminder' : null,
          body: `Payment reminder for invoice ${invoices[i % invoices.length].invoiceNumber}`,
          status: isFailed ? 'failed' : 'delivered',
          sentAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
          deliveredAt: isFailed ? null : new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000 - 3 * 60 * 1000)),
          failedAt: isFailed ? new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000 - 1 * 60 * 1000)) : null,
          errorMessage: isFailed ? 'Invalid phone number' : null,
          isAutomated: true,
        },
      })
    );
  }

  await Promise.all([...historicalMessages, ...recentMessages]);

  console.log(`✅ Created ${historicalMessages.length + recentMessages.length} messages`);

  console.log('\n🎉 Demo data seeding complete!');
  console.log(`\n📊 Summary for ${user.organization.businessName}:`);
  console.log(`   - ${customers.length} customers`);
  console.log(`   - ${invoices.length} lien-eligible invoices`);
  console.log(`   - ${historicalMessages.length + recentMessages.length} messages`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
