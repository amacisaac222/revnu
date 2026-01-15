import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Users, Building2, FileText, DollarSign, TrendingUp, Activity, UserPlus, CreditCard } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is admin (you should add an isAdmin field to your User model)
  const dbUser = await db.user.findUnique({
    where: { email: user.emailAddresses[0]?.emailAddress },
  });

  // For now, we'll check if the user's role is 'admin' or if it's your specific email
  const adminEmails = ['amacisaac222@gmail.com', 'macisaab@gmail.com']; // Add your admin emails here
  const isAdmin = dbUser?.role === 'admin' || adminEmails.includes(dbUser?.email || '');

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Get platform-wide statistics
  const [
    totalUsers,
    totalOrganizations,
    totalInvoices,
    totalRevenue,
    recentSignups,
    organizationsWithData,
  ] = await Promise.all([
    db.user.count(),
    db.organization.count(),
    db.invoice.count(),
    db.invoice.aggregate({
      _sum: { amountDue: true },
    }),
    db.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { organization: true },
    }),
    db.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            invoices: true,
            sequenceTemplates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Calculate total messages sent
  const totalMessages = await db.message.count();

  // Get organizations by creation date for growth tracking
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newOrgsLast30Days = await db.organization.count({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  return (
    <div className="min-h-screen bg-revnu-dark">
      {/* Header */}
      <div className="bg-revnu-darker border-b border-revnu-slate/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
              <p className="text-revnu-gray mt-1">Platform-wide monitoring and management</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-revnu-slate/40 border border-revnu-green/20 text-white font-bold rounded-lg hover:bg-revnu-slate/60 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-revnu-green/20 rounded-lg">
                <Users className="w-6 h-6 text-revnu-green" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-revnu-gray">Total Users</p>
              <p className="text-2xl font-black text-white">{totalUsers}</p>
            </div>
          </div>

          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-revnu-gray">Organizations</p>
              <p className="text-2xl font-black text-white">{totalOrganizations}</p>
              <p className="text-xs text-revnu-gray">+{newOrgsLast30Days} last 30 days</p>
            </div>
          </div>

          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-revnu-gray">Total Invoices</p>
              <p className="text-2xl font-black text-white">{totalInvoices.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-revnu-gray">Total Revenue Tracked</p>
              <p className="text-2xl font-black text-white">
                ${((totalRevenue._sum.amountDue || 0) / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-revnu-green" />
              <h3 className="font-bold text-white">Messages Sent</h3>
            </div>
            <p className="text-3xl font-black text-white">{totalMessages.toLocaleString()}</p>
          </div>

          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <UserPlus className="w-5 h-5 text-revnu-green" />
              <h3 className="font-bold text-white">New Signups (30d)</h3>
            </div>
            <p className="text-3xl font-black text-white">{newOrgsLast30Days}</p>
          </div>

          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-revnu-green" />
              <h3 className="font-bold text-white">Avg Invoices/Org</h3>
            </div>
            <p className="text-3xl font-black text-white">
              {totalOrganizations > 0 ? (totalInvoices / totalOrganizations).toFixed(1) : '0'}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/users"
              className="p-4 bg-revnu-dark/50 border border-revnu-green/20 rounded-lg hover:border-revnu-green hover:bg-revnu-green/10 transition"
            >
              <Users className="w-6 h-6 text-revnu-green mb-2" />
              <h4 className="font-bold text-white">Manage Users</h4>
              <p className="text-sm text-revnu-gray mt-1">View and manage all users</p>
            </Link>

            <Link
              href="/admin/organizations"
              className="p-4 bg-revnu-dark/50 border border-revnu-green/20 rounded-lg hover:border-revnu-green hover:bg-revnu-green/10 transition"
            >
              <Building2 className="w-6 h-6 text-revnu-green mb-2" />
              <h4 className="font-bold text-white">Organizations</h4>
              <p className="text-sm text-revnu-gray mt-1">Monitor all organizations</p>
            </Link>

            <Link
              href="/admin/analytics"
              className="p-4 bg-revnu-dark/50 border border-revnu-green/20 rounded-lg hover:border-revnu-green hover:bg-revnu-green/10 transition"
            >
              <Activity className="w-6 h-6 text-revnu-green mb-2" />
              <h4 className="font-bold text-white">Analytics</h4>
              <p className="text-sm text-revnu-gray mt-1">PostHog insights and metrics</p>
            </Link>
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Signups</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-revnu-dark/50 border-b border-revnu-green/10">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Organization</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-revnu-green/10">
                {recentSignups.map((signup) => (
                  <tr key={signup.id} className="hover:bg-revnu-dark/30 transition">
                    <td className="py-3 px-4 text-white font-semibold">{signup.email}</td>
                    <td className="py-3 px-4 text-revnu-gray">{signup.organization.businessName}</td>
                    <td className="py-3 px-4 text-revnu-gray">
                      {new Date(signup.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Organizations Overview */}
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">All Organizations</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-revnu-dark/50 border-b border-revnu-green/10">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Business Name</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Users</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Customers</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Invoices</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Sequences</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-revnu-green/10">
                {organizationsWithData.map((org) => (
                  <tr key={org.id} className="hover:bg-revnu-dark/30 transition">
                    <td className="py-3 px-4 text-white font-semibold">{org.businessName}</td>
                    <td className="py-3 px-4 text-right text-revnu-gray">{org._count.users}</td>
                    <td className="py-3 px-4 text-right text-revnu-gray">{org._count.customers}</td>
                    <td className="py-3 px-4 text-right text-revnu-gray">{org._count.invoices}</td>
                    <td className="py-3 px-4 text-right text-revnu-gray">{org._count.sequenceTemplates}</td>
                    <td className="py-3 px-4 text-revnu-gray">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
