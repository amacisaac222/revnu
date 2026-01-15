import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { organization: true },
  });

  console.log('\n📋 Users and Organizations:\n');
  users.forEach(u => {
    console.log(`  Email: ${u.email}`);
    console.log(`  Organization: ${u.organization.businessName}`);
    console.log(`  Org ID: ${u.organization.id}`);
    console.log('');
  });
}

main()
  .finally(() => prisma.$disconnect());
