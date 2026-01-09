import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Link from "next/link";
// import FirstTimeExperience from "@/components/dashboard/first-time-experience";
// import ProgressChecklist from "@/components/dashboard/progress-checklist";

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

  const showWelcome = !dbUser.organization.hasSeenWelcome;

  // Get stats
  const [totalCustomers, totalInvoices, totalOutstanding, recentMessages] =
    await Promise.all([
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
      db.message.findMany({
        where: { organizationId: dbUser.organization.id },
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const outstandingAmount = totalOutstanding._sum.amountRemaining || 0;

  // Parse onboarding progress
  const onboardingProgress = typeof dbUser.organization.onboardingProgress === 'object' && dbUser.organization.onboardingProgress !== null
    ? dbUser.organization.onboardingProgress as Record<string, boolean>
    : {};

  return (
    <>
      {/* Temporarily disabled AI features */}
      {/* {showWelcome && (
        <FirstTimeExperience organizationId={dbUser.organization.id} />
      )}

      <ProgressChecklist
        onboardingProgress={onboardingProgress}
        usedDemoData={dbUser.organization.usedDemoData}
      /> */}

      <div className="space-y-6 md:space-y-8">
      {/* Header - Mobile optimized */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">Dashboard</h1>
        <p className="text-sm md:text-base text-revnu-gray mt-1">
          Welcome back, {dbUser.name || "there"}
        </p>
      </div>

      {/* Stats Grid - Stack on mobile */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {/* Featured Stat - Larger on mobile */}
        <div className="bg-gradient-to-br from-revnu-green/20 to-revnu-green/5 p-6 md:p-8 rounded-xl border-2 border-revnu-green/30">
          <div className="text-xs md:text-sm text-revnu-gray font-bold uppercase tracking-wide mb-2">Total Outstanding</div>
          <div className="text-4xl md:text-5xl font-black text-revnu-green">
            ${(outstandingAmount / 100).toLocaleString()}
          </div>
        </div>

        {/* Secondary Stats - Side by side on mobile */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
            <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">Active Invoices</div>
            <div className="text-2xl md:text-3xl font-black text-white">{totalInvoices}</div>
          </div>

          <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
            <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">Total Customers</div>
            <div className="text-2xl md:text-3xl font-black text-white">{totalCustomers}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Mobile optimized */}
      <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
        <h2 className="text-base md:text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/dashboard/customers/new"
            className="px-6 py-4 bg-revnu-dark/50 border-2 border-revnu-green/30 rounded-lg hover:border-revnu-green hover:bg-revnu-green/10 text-center text-white font-bold transition active:scale-98 text-base"
          >
            Add Customer
          </Link>
          <Link
            href="/dashboard/invoices/new"
            className="px-6 py-4 bg-revnu-dark/50 border-2 border-revnu-green/30 rounded-lg hover:border-revnu-green hover:bg-revnu-green/10 text-center text-white font-bold transition active:scale-98 text-base"
          >
            Create Invoice
          </Link>
          <Link
            href="/dashboard/sequences"
            className="px-6 py-4 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green text-center transition active:scale-98 text-base shadow-lg shadow-revnu-green/20"
          >
            Manage Sequences
          </Link>
        </div>
      </div>

      {/* Recent Activity - Mobile optimized */}
      <div className="bg-revnu-slate/40 rounded-xl border border-revnu-green/20">
        <div className="p-4 md:p-6 border-b border-revnu-green/10">
          <h2 className="text-base md:text-lg font-bold text-white">Recent Messages</h2>
        </div>
        <div className="divide-y divide-revnu-green/10">
          {recentMessages.length === 0 ? (
            <div className="p-6 md:p-8 text-center text-revnu-gray text-sm">
              No messages yet. Add customers and invoices to get started.
            </div>
          ) : (
            recentMessages.map((message) => (
              <div key={message.id} className="p-4 active:bg-revnu-dark/30 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm md:text-base">
                      {message.customer.firstName} {message.customer.lastName}
                    </div>
                    <div className="text-xs md:text-sm text-revnu-gray mt-1">
                      {message.channel === "sms" ? "SMS" : "Email"} •{" "}
                      <span className="text-revnu-green font-semibold">{message.status}</span>
                    </div>
                  </div>
                  <div className="text-xs text-revnu-gray flex-shrink-0">
                    {new Date(message.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
}
