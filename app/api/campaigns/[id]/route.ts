import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/campaigns/[id]
 *
 * Get detailed campaign information with all enrollments
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;

    // Get user's organization
    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get all enrollments for this campaign
    const enrollments = await db.campaignEnrollment.findMany({
      where: {
        campaignId,
        organizationId: dbUser.organizationId,
      },
      include: {
        sequence: {
          include: {
            steps: {
              orderBy: { stepNumber: 'asc' },
            },
          },
        },
        customer: true,
        invoice: true,
        scheduledMessages: {
          orderBy: { scheduledFor: 'asc' },
        },
      },
      orderBy: {
        enrolledAt: 'asc',
      },
    });

    if (enrollments.length === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Build campaign summary
    const firstEnrollment = enrollments[0];
    const campaign = {
      campaignId,
      campaignName: firstEnrollment.campaignName,
      sequence: firstEnrollment.sequence,
      launchedAt: firstEnrollment.enrolledAt,
      enrollments: enrollments.map((e) => ({
        id: e.id,
        status: e.status,
        enrolledAt: e.enrolledAt,
        currentStep: e.currentStep,
        lastMessageSentAt: e.lastMessageSentAt,
        completedAt: e.completedAt,
        stoppedAt: e.stoppedAt,
        stoppedReason: e.stoppedReason,
        customer: {
          id: e.customer.id,
          firstName: e.customer.firstName,
          lastName: e.customer.lastName,
          email: e.customer.email,
          phone: e.customer.phone,
          smsConsentGiven: e.customer.smsConsentGiven,
          emailConsentGiven: e.customer.emailConsentGiven,
        },
        invoice: e.invoice
          ? {
              id: e.invoice.id,
              invoiceNumber: e.invoice.invoiceNumber,
              amountRemaining: e.invoice.amountRemaining,
              status: e.invoice.status,
              daysPastDue: e.invoice.daysPastDue,
            }
          : null,
        scheduledMessages: e.scheduledMessages.map((msg) => ({
          id: msg.id,
          channel: msg.channel,
          scheduledFor: msg.scheduledFor,
          sentAt: msg.sentAt,
          status: msg.status,
          subject: msg.subject,
          body: msg.body,
          errorMessage: msg.errorMessage,
        })),
      })),
      stats: {
        total: enrollments.length,
        active: enrollments.filter((e) => e.status === 'active').length,
        paused: enrollments.filter((e) => e.status === 'paused').length,
        completed: enrollments.filter((e) => e.status === 'completed').length,
        stopped: enrollments.filter((e) => e.status === 'stopped').length,
        cancelled: enrollments.filter((e) => e.status === 'cancelled').length,
        messagesSent: enrollments.reduce(
          (sum, e) =>
            sum + e.scheduledMessages.filter((m) => m.status === 'sent').length,
          0
        ),
        messagesPending: enrollments.reduce(
          (sum, e) =>
            sum + e.scheduledMessages.filter((m) => m.status === 'pending').length,
          0
        ),
        messagesFailed: enrollments.reduce(
          (sum, e) =>
            sum + e.scheduledMessages.filter((m) => m.status === 'failed').length,
          0
        ),
      },
    };

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign details' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/campaigns/[id]
 *
 * Update campaign (pause/resume/stop/rename)
 *
 * Body:
 * {
 *   action: 'pause' | 'resume' | 'stop' | 'rename',
 *   campaignName?: string  // Required for rename action
 * }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const body = await req.json();
    const { action, campaignName } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }

    // Get user's organization
    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Verify campaign exists
    const enrollmentCount = await db.campaignEnrollment.count({
      where: {
        campaignId,
        organizationId: dbUser.organizationId,
      },
    });

    if (enrollmentCount === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    let updateData: any = {};
    let statusFilter: any = {};

    switch (action) {
      case 'pause':
        updateData = { status: 'paused' };
        statusFilter = { status: 'active' }; // Only pause active enrollments
        break;

      case 'resume':
        updateData = { status: 'active' };
        statusFilter = { status: 'paused' }; // Only resume paused enrollments
        break;

      case 'stop':
        updateData = {
          status: 'stopped',
          stoppedAt: new Date(),
          stoppedReason: 'manual_stop',
        };
        statusFilter = { status: { in: ['active', 'paused'] } }; // Stop active and paused
        break;

      case 'rename':
        if (!campaignName) {
          return NextResponse.json(
            { error: 'campaignName required for rename action' },
            { status: 400 }
          );
        }
        updateData = { campaignName };
        statusFilter = {}; // Rename all enrollments regardless of status
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update all enrollments in the campaign
    const result = await db.campaignEnrollment.updateMany({
      where: {
        campaignId,
        organizationId: dbUser.organizationId,
        ...statusFilter,
      },
      data: updateData,
    });

    // If stopping, also cancel pending scheduled messages
    if (action === 'stop') {
      await db.scheduledMessage.updateMany({
        where: {
          enrollment: {
            campaignId,
            organizationId: dbUser.organizationId,
          },
          status: 'pending',
        },
        data: {
          status: 'cancelled',
        },
      });
    }

    return NextResponse.json({
      success: true,
      action,
      updated: result.count,
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
