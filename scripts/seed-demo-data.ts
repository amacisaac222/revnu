import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...');

  // Get the first user's organization (or create one if needed)
  const user = await prisma.user.findFirst({
    include: { organization: true },
  });

  if (!user?.organization) {
    console.error('❌ No organization found. Please create a user first.');
    return;
  }

  const orgId = user.organization.id;
  console.log(`✅ Found organization: ${user.organization.businessName}`);

  // Create demo customers with property addresses for lien-eligible invoices
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
        firstName: 'Michael',
        lastName: 'Williams',
        email: 'mike.w@example.com',
        phone: '+15555551234',
        address: '555 Elm St',
        city: 'Miami',
        state: 'FL',
        zip: '33101',
        propertyAddress: '888 Palm Dr',
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
        firstName: 'Emily',
        lastName: 'Brown',
        email: 'emily.brown@example.com',
        phone: '+15554443333',
        address: '222 Maple Ave',
        city: 'Phoenix',
        state: 'AZ',
        zip: '85001',
        propertyAddress: '777 Desert Rd',
        propertyCity: 'Phoenix',
        propertyState: 'AZ',
        propertyZip: '85002',
        smsConsentGiven: true,
        emailConsentGiven: true,
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers with property addresses`);

  // Create lien-eligible invoices with work dates
  const now = new Date();
  const invoices = await Promise.all([
    // Urgent - work completed 80 days ago (10 days left to file in CA)
    prisma.invoice.create({
      data: {
        organizationId: orgId,
        customerId: customers[0].id,
        invoiceNumber: 'INV-2001',
        invoiceDate: new Date(now.getTime() - 85 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000),
        description: 'Electrical panel installation and wiring repair',
        amountDue: 450000, // $4,500
        amountRemaining: 450000,
        status: 'outstanding',
        firstWorkDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        lastWorkDate: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
        lienEligible: true,
        preliminaryNoticeSent: true,
        preliminaryNoticeSentAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
      },
    }),
    // Very urgent - work completed 85 days ago (5 days left in TX)
    prisma.invoice.create({
      data: {
        organizationId: orgId,
        customerId: customers[1].id,
        invoiceNumber: 'INV-2002',
        invoiceDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        description: 'HVAC system replacement and ductwork installation',
        amountDue: 875000, // $8,750
        amountRemaining: 875000,
        status: 'outstanding',
        firstWorkDate: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000),
        lastWorkDate: new Date(now.getTime() - 85 * 24 * 60 * 60 * 1000),
        lienEligible: true,
        preliminaryNoticeSent: false,
      },
    }),
    // Upcoming - work completed 60 days ago (30 days left in FL)
    prisma.invoice.create({
      data: {
        organizationId: orgId,
        customerId: customers[2].id,
        invoiceNumber: 'INV-2003',
        invoiceDate: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        description: 'Roof replacement and structural repair',
        amountDue: 1250000, // $12,500
        amountRemaining: 1250000,
        status: 'outstanding',
        firstWorkDate: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000),
        lastWorkDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        lienEligible: true,
        preliminaryNoticeSent: true,
        preliminaryNoticeSentAt: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000),
      },
    }),
    // Safe - work completed 30 days ago (90 days left in AZ)
    prisma.invoice.create({
      data: {
        organizationId: orgId,
        customerId: customers[3].id,
        invoiceNumber: 'INV-2004',
        invoiceDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        description: 'Plumbing installation for kitchen remodel',
        amountDue: 325000, // $3,250
        amountRemaining: 325000,
        status: 'outstanding',
        firstWorkDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        lastWorkDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        lienEligible: true,
        preliminaryNoticeSent: true,
        preliminaryNoticeSentAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${invoices.length} lien-eligible invoices`);

  // Create demo messages (communications history)
  const messageTemplates = [
    {
      channel: 'email',
      subject: 'Payment Reminder - Invoice {invoiceNumber}',
      body: 'Hi {customerName}, this is a friendly reminder that invoice {invoiceNumber} for ${amount} is now due. Please submit payment at your earliest convenience.',
      status: 'delivered',
    },
    {
      channel: 'sms',
      subject: null,
      body: 'Hi {customerName}, your invoice {invoiceNumber} for ${amount} is overdue. Please pay today to avoid late fees.',
      status: 'delivered',
    },
    {
      channel: 'email',
      subject: 'Important: Mechanics Lien Notice - Invoice {invoiceNumber}',
      body: 'Hi {customerName}, we must inform you that we have the right to file a mechanics lien on your property for unpaid invoice {invoiceNumber} (${amount}). Please contact us to resolve this.',
      status: 'sent',
    },
    {
      channel: 'sms',
      subject: null,
      body: 'URGENT: Invoice {invoiceNumber} ${amount} is 60 days overdue. We may file a lien if not paid within 10 days.',
      status: 'delivered',
    },
  ];

  const messages = [];
  for (let i = 0; i < invoices.length; i++) {
    const invoice = invoices[i];
    const customer = customers[i];

    // Create 3-5 messages per invoice
    const messageCount = Math.floor(Math.random() * 3) + 3;
    for (let j = 0; j < messageCount; j++) {
      const template = messageTemplates[j % messageTemplates.length];
      const daysAgo = 70 - (j * 15);

      const body = template.body
        .replace('{customerName}', customer.firstName)
        .replace('{invoiceNumber}', invoice.invoiceNumber)
        .replace('${amount}', (invoice.amountDue / 100).toFixed(2));

      const subject = template.subject
        ? template.subject
            .replace('{invoiceNumber}', invoice.invoiceNumber)
            .replace('${amount}', (invoice.amountDue / 100).toFixed(2))
        : null;

      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      messages.push(
        prisma.message.create({
          data: {
            organizationId: orgId,
            customerId: customer.id,
            invoiceId: invoice.id,
            channel: template.channel,
            direction: 'outbound',
            subject,
            body,
            status: template.status,
            createdAt,
            sentAt: createdAt,
            deliveredAt:
              template.status === 'delivered'
                ? new Date(createdAt.getTime() + 2000)
                : null,
            sentFromEmail:
              template.channel === 'email'
                ? 'billing@revenupros.com'
                : null,
            sentFromNumber:
              template.channel === 'sms' ? '+15555550000' : null,
            isAutomated: true,
          },
        })
      );
    }
  }

  await Promise.all(messages);
  console.log(`✅ Created ${messages.length} demo messages`);

  // Create some additional recent messages (last 30 days) for communications widget
  const recentMessages = [];
  for (let i = 0; i < 20; i++) {
    const customer = customers[i % customers.length];
    const invoice = invoices[i % invoices.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const template = messageTemplates[i % messageTemplates.length];

    const body = template.body
      .replace('{customerName}', customer.firstName)
      .replace('{invoiceNumber}', invoice.invoiceNumber)
      .replace('${amount}', (invoice.amountDue / 100).toFixed(2));

    const subject = template.subject
      ? template.subject
          .replace('{invoiceNumber}', invoice.invoiceNumber)
          .replace('${amount}', (invoice.amountDue / 100).toFixed(2))
      : null;

    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Add some failures for testing
    const isFailed = i % 10 === 0;
    const status = isFailed ? 'failed' : template.status;

    recentMessages.push(
      prisma.message.create({
        data: {
          organizationId: orgId,
          customerId: customer.id,
          invoiceId: invoice.id,
          channel: template.channel,
          direction: 'outbound',
          subject,
          body,
          status,
          createdAt,
          sentAt: createdAt,
          deliveredAt: status === 'delivered' ? new Date(createdAt.getTime() + 2000) : null,
          failedAt: isFailed ? new Date(createdAt.getTime() + 5000) : null,
          errorMessage: isFailed ? 'Invalid phone number' : null,
          sentFromEmail: template.channel === 'email' ? 'billing@revenupros.com' : null,
          sentFromNumber: template.channel === 'sms' ? '+15555550000' : null,
          isAutomated: true,
        },
      })
    );
  }

  await Promise.all(recentMessages);
  console.log(`✅ Created ${recentMessages.length} recent messages for communications widget`);

  console.log('\n🎉 Demo data seeded successfully!\n');
  console.log('Summary:');
  console.log(`  - ${customers.length} customers with property addresses`);
  console.log(`  - ${invoices.length} lien-eligible invoices`);
  console.log(`  - ${messages.length + recentMessages.length} total messages`);
  console.log(`  - 1 urgent lien (10 days left)`);
  console.log(`  - 1 very urgent lien (5 days left)`);
  console.log(`  - 1 upcoming lien (30 days left)`);
  console.log(`  - 1 safe lien (90 days left)`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
