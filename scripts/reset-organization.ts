/**
 * Reset Organization Script
 * Deletes your organization and all related data so you can test onboarding again
 *
 * Usage: npx tsx scripts/reset-organization.ts your-email@example.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetOrganization(userEmail: string) {
  try {
    console.log(`🔍 Looking for user with email: ${userEmail}`)

    // Find user and their organization
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { organization: true },
    })

    if (!user) {
      console.log(`❌ No user found with email: ${userEmail}`)
      return
    }

    if (!user.organization) {
      console.log(`✅ User ${userEmail} has no organization. Already ready for onboarding!`)
      return
    }

    console.log(`📋 Found organization: ${user.organization.businessName}`)
    console.log(`🗑️  Deleting organization and all related data...`)

    // Delete the organization (this will cascade delete everything due to Prisma schema)
    await prisma.organization.delete({
      where: { id: user.organization.id },
    })

    console.log(`✅ Successfully deleted organization!`)
    console.log(`✅ User ${userEmail} can now go through onboarding again`)
    console.log(`\n🚀 Visit /onboarding to start fresh!`)

  } catch (error) {
    console.error(`❌ Error:`, error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line args
const email = process.argv[2]

if (!email) {
  console.log(`
❌ Please provide an email address

Usage:
  npx tsx scripts/reset-organization.ts your-email@example.com

Example:
  npx tsx scripts/reset-organization.ts test@example.com
  `)
  process.exit(1)
}

resetOrganization(email)
