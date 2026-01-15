import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import FirstTimeExperience from "@/components/dashboard/first-time-experience";
import ProgressChecklist from "@/components/dashboard/progress-checklist";
import DashboardOverview from "@/components/dashboard/dashboard-overview";

export default async function DashboardPage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  // Redirect to onboarding if user doesn't have an organization
  if (!dbUser?.organization) {
    redirect("/onboarding");
  }

  // Parse onboarding progress first
  const onboardingProgress = typeof dbUser.organization.onboardingProgress === 'object' && dbUser.organization.onboardingProgress !== null
    ? dbUser.organization.onboardingProgress as Record<string, boolean>
    : {};

  const showWelcome = !dbUser.organization.hasSeenWelcome;
  // Disable sequences showcase - users prefer the welcome screen
  const showSequencesShowcase = false;

  // Get comprehensive data
  const [
    totalCustomers,
    totalInvoices,
    totalOutstanding,
    totalPaid,
    allCustomers,
    activeSequences,
    allInvoices,
  ] = await Promise.all([
    db.customer.count({
      where: { organizationId: dbUser.organization.id },
    }),
    db.invoice.count({
      where: { organizationId: dbUser.organization.id },
    }),
    db.invoice.aggregate({
      where: {
        organizationId: dbUser.organization.id,
        status: { in: ["outstanding", "partial"] },
      },
      _sum: { amountRemaining: true },
    }),
    db.invoice.aggregate({
      where: {
        organizationId: dbUser.organization.id,
        status: "paid",
      },
      _sum: { amountPaid: true },
    }),
    db.customer.findMany({
      where: { organizationId: dbUser.organization.id },
      include: {
        invoices: {
          select: {
            id: true,
            status: true,
            amountRemaining: true,
            amountDue: true,
            amountPaid: true,
            createdAt: true,
            invoiceDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.sequenceTemplate.findMany({
      where: { organizationId: dbUser.organization.id },
      include: {
        steps: true,
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.invoice.findMany({
      where: { organizationId: dbUser.organization.id },
      select: {
        createdAt: true,
        invoiceDate: true,
        amountDue: true,
        amountPaid: true,
        amountRemaining: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const outstandingAmount = totalOutstanding._sum.amountRemaining || 0;
  const collectedAmount = totalPaid._sum.amountPaid || 0;
  const totalRevenue = outstandingAmount + collectedAmount;

  // Calculate collection rate
  const collectionRate = totalRevenue > 0 ? (collectedAmount / totalRevenue) * 100 : 0;

  // Process collection trends data (last 6 months)
  const trendsByMonth = new Map<string, { invoiced: number; collected: number; outstanding: number }>();
  const now = new Date();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    trendsByMonth.set(key, { invoiced: 0, collected: 0, outstanding: 0 });
  }

  // Aggregate invoice data by month
  allInvoices.forEach((invoice) => {
    const date = new Date(invoice.invoiceDate || invoice.createdAt);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (trendsByMonth.has(key)) {
      const current = trendsByMonth.get(key)!;
      current.invoiced += invoice.amountDue;
      current.collected += invoice.amountPaid;
      if (invoice.status === 'outstanding' || invoice.status === 'partial') {
        current.outstanding += invoice.amountRemaining;
      }
    }
  });

  const collectionTrendsData = Array.from(trendsByMonth.entries()).map(([month, data]) => ({
    month,
    invoiced: data.invoiced / 100,
    collected: data.collected / 100,
    outstanding: data.outstanding / 100,
  }));

  // Calculate top 10 accounts by outstanding balance
  const top10Accounts = allCustomers
    .map((customer) => {
      const totalOwed = customer.invoices
        .filter(inv => inv.status === 'outstanding' || inv.status === 'partial')
        .reduce((sum, inv) => sum + inv.amountRemaining, 0);

      const totalInvoiced = customer.invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
      const totalCollected = customer.invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

      return {
        ...customer,
        totalOwed,
        totalInvoiced,
        totalCollected,
        invoiceCount: customer.invoices.length,
      };
    })
    .filter(customer => customer.totalOwed > 0)
    .sort((a, b) => b.totalOwed - a.totalOwed)
    .slice(0, 10);

  // Recent customers for sidebar (last 10)
  const recentCustomers = allCustomers.slice(0, 10);

  return (
    <>
      {showWelcome && (
        <FirstTimeExperience organizationId={dbUser.organization.id} />
      )}

      <ProgressChecklist
        onboardingProgress={onboardingProgress}
        usedDemoData={dbUser.organization.usedDemoData}
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <Link
            href="/dashboard/customers/import"
            className="px-3 py-1.5 bg-revnu-green/20 border border-revnu-green/30 rounded-lg text-revnu-green font-semibold hover:bg-revnu-green/30 transition text-xs"
          >
            📁 Import
          </Link>
        </div>

        {/* Dynamic Widget System */}
        <DashboardOverview
          organizationId={dbUser.organization.id}
          stats={{
            totalRevenue,
            collectedAmount,
            outstandingAmount,
            collectionRate,
            totalCustomers,
          }}
          collectionTrendsData={collectionTrendsData}
          top10Accounts={top10Accounts}
          activeSequences={activeSequences}
        />
      </div>
    </>
  );
}
