import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Mail, Building2, Calendar, Shield } from "lucide-react";

export default async function AdminUsersPage() {
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

  // Get all users with their organizations
  const users = await db.user.findMany({
    include: {
      organization: true,
    },
    orderBy: { createdAt: 'desc' },
  });

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
              <h1 className="text-3xl font-black text-white">User Management</h1>
              <p className="text-revnu-gray mt-1">View and manage all platform users</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-revnu-green" />
              <h3 className="font-bold text-white">Total Users</h3>
            </div>
            <p className="text-3xl font-black text-white">{users.length}</p>
          </div>

          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-revnu-green" />
              <h3 className="font-bold text-white">Admin Users</h3>
            </div>
            <p className="text-3xl font-black text-white">
              {users.filter(u => u.role === 'admin' || adminEmails.includes(u.email)).length}
            </p>
          </div>

          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-revnu-green" />
              <h3 className="font-bold text-white">New This Month</h3>
            </div>
            <p className="text-3xl font-black text-white">
              {users.filter(u => {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return u.createdAt >= monthAgo;
              }).length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">All Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-revnu-dark/50 border-b border-revnu-green/10">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Organization</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-revnu-green/10">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-revnu-dark/30 transition">
                    <td className="py-3 px-4 text-white font-semibold">{u.email}</td>
                    <td className="py-3 px-4 text-revnu-gray">{u.name || '-'}</td>
                    <td className="py-3 px-4 text-revnu-gray">{u.organization.businessName}</td>
                    <td className="py-3 px-4">
                      {u.role === 'admin' || adminEmails.includes(u.email) ? (
                        <span className="px-2 py-1 bg-revnu-green/20 text-revnu-green text-xs font-bold rounded">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-revnu-slate/40 text-revnu-gray text-xs font-bold rounded">
                          User
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-revnu-gray">
                      {new Date(u.createdAt).toLocaleDateString()}
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
