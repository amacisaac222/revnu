const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function checkFlows() {
  console.log('\n📋 Checking Current Flows in Database...\n');

  const standardFlows = await db.sequenceTemplate.findMany({
    where: { source: 'standard' }
  });

  const aiFlows = await db.sequenceTemplate.findMany({
    where: { source: 'ai-generated' }
  });

  console.log('Standard Flows (Auto-generated):', standardFlows.length);
  if (standardFlows.length > 0) {
    standardFlows.forEach((flow, i) => {
      console.log(`  ${i+1}. ${flow.name}`);
      console.log(`     Type: ${flow.type}`);
      console.log(`     Steps: ${flow.steps.length}`);
    });
  } else {
    console.log('  ❌ None - Complete onboarding to generate\n');
  }

  console.log('\nAI-Generated Flows (Custom):', aiFlows.length);
  if (aiFlows.length > 0) {
    aiFlows.forEach((flow, i) => {
      console.log(`  ${i+1}. ${flow.name}`);
      console.log(`     Type: ${flow.type}`);
      console.log(`     Steps: ${flow.steps.length}`);
    });
  } else {
    console.log('  ❌ None - Complete onboarding to generate\n');
  }

  console.log('\n📝 To Generate Flows:');
  console.log('1. Go to: http://localhost:3000/onboarding');
  console.log('2. Complete all 5 steps');
  console.log('3. Flows will be auto-generated based on:');
  console.log('   - Business type (HVAC, Electrical, Plumbing, etc.)');
  console.log('   - Project size');
  console.log('   - Collection strategy');
  console.log('   - State (for lien sequences)\n');

  await db.$disconnect();
}

checkFlows().catch(console.error);
