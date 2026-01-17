import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/campaigns
 *
 * List all campaigns for the organization with aggregated stats
 */
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const dbUser = await db.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get all unique campaigns with aggregated stats
    // Group enrollments by campaignId
    const enrollments = await db.campaignEnrollment.findMany({
      where: {
        organizationId: dbUser.organizationId,
      },
      include: {
        sequence: {
          select: {
            id: true,
            name: true,
            steps: {
              select: { id: true },
            },
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            amountRemaining: true,
          },
        },
        scheduledMessages: {
          select: {
            id: true,
            status: true,
            sentAt: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    // Group by campaignId and aggregate stats
    const campaignsMap = new Map();

    for (const enrollment of enrollments) {
      const campaignId = enrollment.campaignId;

      if (!campaignsMap.has(campaignId)) {
        campaignsMap.set(campaignId, {
          campaignId,
          campaignName: enrollment.campaignName,
          sequenceId: enrollment.sequenceId,
          sequenceName: enrollment.sequence.name,
          totalSteps: enrollment.sequence.steps.length,
          launchedAt: enrollment.enrolledAt,
          enrollments: [],
          stats: {
            total: 0,
            active: 0,
            paused: 0,
            completed: 0,
            stopped: 0,
            messagesSent: 0,
            messagesPending: 0,
            messagesFailed: 0,
          },
        });
      }

      const campaign = campaignsMap.get(campaignId);
      campaign.enrollments.push(enrollment);
      campaign.stats.total++;
      campaign.stats[enrollment.status as keyof typeof campaign.stats]++;

      // Count messages
      for (const msg of enrollment.scheduledMessages) {
        if (msg.status === 'sent') campaign.stats.messagesSent++;
        else if (msg.status === 'pending') campaign.stats.messagesPending++;
        else if (msg.status === 'failed') campaign.stats.messagesFailed++;
      }
    }

    const campaigns = Array.from(campaignsMap.values()).map((campaign) => {
      // Remove detailed enrollments from response, just send summary
      const { enrollments, ...summary } = campaign;
      return {
        ...summary,
        recipientCount: enrollments.length,
      };
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
