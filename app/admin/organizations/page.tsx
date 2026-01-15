import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Building2, Users, FileText, MessageSquare, Zap, TrendingUp } from "lucide-react";

export default async function AdminOrganizationsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await db.user.findUnique({
    where: { email: user.emailAddresses[0]?.emailAddress },
  });

  const adminEmails = ['amacisaac222@gmail.com', 'macisaab@gmail.com'];
  const isAdmin = dbUser?.role === 'admin' || adminEmails.includes(dbUser?.email || '');

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Get all organizations with detailed stats
  const organizations = await db.organization.findMany({
    include: {
      _count: {
        select: {
          users: true,
          customers: true,
          invoices: true,
          sequenceTemplates: true,
        },
      },
      users: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate revenue per organization
  const orgWithRevenue = await Promise.all(
    organizations.map(async (org) => {
      const revenue = await db.invoice.aggregate({
        where: { organizationId: org.id },
        _sum: { amountDue: true },
      });

      const messages = await db.message.count({
        where: { organizationId: org.id },
      });

      return {
        ...org,
        totalRevenue: revenue._sum.amountDue || 0,
        messageCount: messages,
      };
    })
  );

  const totalRevenue = orgWithRevenue.reduce((sum, org) => sum + org.totalRevenue, 0);
  const activeOrgs = orgWithRevenue.filter(org => org._count.invoices > 0).length;

  return (
    <div className="min-h-screen bg-revnu-dark">
      {/* Header */}
      <div className="bg-revnu-darker border-b border-revnu-slate/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-revnu-slate/40 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-revnu-gray" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-white">Organizations</h1>
              <p className="text-revnu-gray mt-1">Monitor all organizations and their activity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-5 h-5 text-revnu-green" />
              <h3 className="font-bold text-white">Total Orgs</h3>
            </div>
            <p className="text-3xl font-black text-white">{organizations.length}</p>
          </div>

          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-revnu-green" />
              <h3 className="font-bold text-white">Active</h3>
            </div>
            <p className="text-3xl font-black text-white">{activeOrgs}</p>
            <p className="text-xs text-revnu-gray mt-1">With invoices</p>
          </div>

          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-revnu-green" />
              <h3 className="font-bold text-white">Total Revenue</h3>
            </div>
            <p className="text-3xl font-black text-white">
              ${(totalRevenue / 100).toLocaleString()}
            </p>
          </div>

          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-revnu-green" />
              <h3 className="font-bold text-white">Avg Messages</h3>
            </div>
            <p className="text-3xl font-black text-white">
              {organizations.length > 0
                ? Math.round(orgWithRevenue.reduce((sum, org) => sum + org.messageCount, 0) / organizations.length)
                : 0}
            </p>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">All Organizations</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-revnu-dark/50 border-b border-revnu-green/10">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Business Name</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Industry</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Users</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Customers</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Invoices</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Messages</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Revenue</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-revnu-green/10">
                {orgWithRevenue.map((org) => (
                  <tr key={org.id} className="hover:bg-revnu-dark/30 transition">
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-white font-semibold">{org.businessName}</div>
                        <div className="text-xs text-revnu-gray">
                          {org.users.map(u => u.email).join(', ')}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-revnu-gray">{org.industry || '-'}</td>
                    <td className="py-3 px-4 text-right text-white font-semibold">{org._count.users}</td>
                    <td className="py-3 px-4 text-right text-revnu-gray">{org._count.customers}</td>
                    <td className="py-3 px-4 text-right">
                      {org._count.invoices > 0 ? (
                        <span className="text-white font-semibold">{org._count.invoices}</span>
                      ) : (
                        <span className="text-revnu-gray">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-revnu-gray">{org.messageCount}</td>
                    <td className="py-3 px-4 text-right">
                      {org.totalRevenue > 0 ? (
                        <span className="text-revnu-green font-bold">
                          ${(org.totalRevenue / 100).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-revnu-gray">$0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-revnu-gray text-sm">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Organizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Top by Revenue</h3>
            <div className="space-y-3">
              {orgWithRevenue
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 5)
                .map((org, index) => (
                  <div key={org.id} className="flex items-center justify-between p-3 bg-revnu-dark/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-revnu-green/20 rounded-full flex items-center justify-center">
                        <span className="text-revnu-green font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{org.businessName}</div>
                        <div className="text-xs text-revnu-gray">{org._count.invoices} invoices</div>
                      </div>
                    </div>
                    <div className="text-revnu-green font-bold">
                      ${(org.totalRevenue / 100).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Most Active</h3>
            <div className="space-y-3">
              {orgWithRevenue
                .sort((a, b) => b.messageCount - a.messageCount)
                .slice(0, 5)
                .map((org, index) => (
                  <div key={org.id} className="flex items-center justify-between p-3 bg-revnu-dark/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{org.businessName}</div>
                        <div className="text-xs text-revnu-gray">{org._count.customers} customers</div>
                      </div>
                    </div>
                    <div className="text-blue-400 font-bold">
                      {org.messageCount} msgs
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
