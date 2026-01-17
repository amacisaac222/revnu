import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

/**
 * POST /api/campaigns/enroll
 *
 * Enroll customers in a sequence campaign (supports both invoice and customer modes)
 *
 * Body:
 * {
 *   sequenceId: string,
 *   mode: 'invoice' | 'customer',
 *   invoiceIds?: string[],  // Required for invoice mode
 *   customerIds?: string[], // Required for customer mode
 *   campaignName?: string,  // Optional user-friendly name
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sequenceId, mode, invoiceIds, customerIds, campaignName } = body;

    // Validate inputs
    if (!sequenceId || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: sequenceId, mode' },
        { status: 400 }
      );
    }

    if (mode === 'invoice' && (!invoiceIds || invoiceIds.length === 0)) {
      return NextResponse.json(
        { error: 'invoiceIds required for invoice mode' },
        { status: 400 }
      );
    }

    if (mode === 'customer' && (!customerIds || customerIds.length === 0)) {
      return NextResponse.json(
        { error: 'customerIds required for customer mode' },
        { status: 400 }
      );
    }

    // Get user's organization
    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      include: { organization: true },
    });

    if (!dbUser?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const organization = dbUser.organization;

    // Verify sequence exists and belongs to organization
    const sequence = await db.sequenceTemplate.findFirst({
      where: {
        id: sequenceId,
        organizationId: organization.id,
      },
    });

    if (!sequence) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
    }

    // Generate campaign ID for grouping enrollments
    const campaignId = nanoid(12);

    const enrollments = [];
    const skipped = [];
    const errors = [];

    if (mode === 'invoice') {
      // Invoice-based campaign
      for (const invoiceId of invoiceIds) {
        try {
          // Get invoice with customer
          const invoice = await db.invoice.findFirst({
            where: {
              id: invoiceId,
              organizationId: organization.id,
            },
            include: {
              customer: true,
            },
          });

          if (!invoice) {
            errors.push({ invoiceId, error: 'Invoice not found' });
            continue;
          }

          // Skip if invoice is already paid
          if (invoice.status === 'paid') {
            skipped.push({
              invoiceId,
              customerId: invoice.customerId,
              reason: 'Invoice already paid',
            });
            continue;
          }

          // Check for duplicate enrollment
          const existingEnrollment = await db.campaignEnrollment.findFirst({
            where: {
              organizationId: organization.id,
              sequenceId,
              invoiceId,
              customerId: invoice.customerId,
              status: { in: ['active', 'paused'] },
            },
          });

          if (existingEnrollment) {
            skipped.push({
              invoiceId,
              customerId: invoice.customerId,
              reason: 'Already enrolled in this sequence',
            });
            continue;
          }

          // Check if customer has any valid contact method
          const hasContact =
            (invoice.customer.phone && invoice.customer.smsConsentGiven) ||
            (invoice.customer.email && invoice.customer.emailConsentGiven);

          if (!hasContact) {
            skipped.push({
              invoiceId,
              customerId: invoice.customerId,
              reason: 'No valid contact method (missing SMS/email consent)',
            });
            continue;
          }

          // Create enrollment
          const enrollment = await db.campaignEnrollment.create({
            data: {
              organizationId: organization.id,
              sequenceId,
              invoiceId,
              customerId: invoice.customerId,
              campaignId,
              campaignName,
              status: 'active',
            },
          });

          enrollments.push(enrollment);
        } catch (error) {
          console.error('Error enrolling invoice:', error);
          errors.push({ invoiceId, error: 'Failed to enroll' });
        }
      }
    } else {
      // Customer-based campaign
      for (const customerId of customerIds) {
        try {
          // Get customer
          const customer = await db.customer.findFirst({
            where: {
              id: customerId,
              organizationId: organization.id,
            },
          });

          if (!customer) {
            errors.push({ customerId, error: 'Customer not found' });
            continue;
          }

          // Check for duplicate enrollment
          const existingEnrollment = await db.campaignEnrollment.findFirst({
            where: {
              organizationId: organization.id,
              sequenceId,
              customerId,
              invoiceId: null, // Customer-only enrollment
              status: { in: ['active', 'paused'] },
            },
          });

          if (existingEnrollment) {
            skipped.push({
              customerId,
              reason: 'Already enrolled in this sequence',
            });
            continue;
          }

          // Check if customer has any valid contact method
          const hasContact =
            (customer.phone && customer.smsConsentGiven) ||
            (customer.email && customer.emailConsentGiven);

          if (!hasContact) {
            skipped.push({
              customerId,
              reason: 'No valid contact method (missing SMS/email consent)',
            });
            continue;
          }

          // Create enrollment
          const enrollment = await db.campaignEnrollment.create({
            data: {
              organizationId: organization.id,
              sequenceId,
              customerId,
              campaignId,
              campaignName,
              status: 'active',
              // No invoiceId for customer-based campaigns
            },
          });

          enrollments.push(enrollment);
        } catch (error) {
          console.error('Error enrolling customer:', error);
          errors.push({ customerId, error: 'Failed to enroll' });
        }
      }
    }

    return NextResponse.json({
      success: true,
      campaignId,
      enrollments: enrollments.length,
      skipped: skipped.length,
      errors: errors.length,
      details: {
        enrolled: enrollments.map((e) => ({
          id: e.id,
          customerId: e.customerId,
          invoiceId: e.invoiceId,
        })),
        skipped,
        errors,
      },
    });
  } catch (error) {
    console.error('Campaign enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in campaign' },
      { status: 500 }
    );
  }
}
