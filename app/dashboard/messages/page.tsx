import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function MessagesPage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  if (!dbUser?.organization) return null;

  const messages = await db.message.findMany({
    where: { organizationId: dbUser.organization.id },
    include: {
      customer: true,
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: messages.length,
    sent: messages.filter((m) => m.status === "sent" || m.status === "delivered").length,
    failed: messages.filter((m) => m.status === "failed").length,
    pending: messages.filter((m) => m.status === "pending" || m.status === "queued").length,
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">Messages</h1>
        <p className="text-sm md:text-base text-revnu-gray mt-1">
          View all automated messages sent to customers
        </p>
      </div>

      {/* Stats - Mobile optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">Total Messages</div>
          <div className="text-2xl md:text-3xl font-black text-white">{stats.total}</div>
        </div>
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">Sent</div>
          <div className="text-2xl md:text-3xl font-black text-revnu-green">{stats.sent}</div>
        </div>
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">Failed</div>
          <div className="text-2xl md:text-3xl font-black text-red-400">{stats.failed}</div>
        </div>
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">Pending</div>
          <div className="text-2xl md:text-3xl font-black text-yellow-400">{stats.pending}</div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-revnu-slate/40 rounded-xl border border-revnu-green/20">
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-bold text-white mb-2">
              No messages yet
            </h3>
            <p className="text-revnu-gray mb-6">
              Messages will appear here when you create invoices and activate payment reminder sequences
            </p>
            <Link
              href="/dashboard/sequences"
              className="inline-block px-6 py-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20"
            >
              Set Up Sequences
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-revnu-dark/50 border-b border-revnu-green/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Channel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Direction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-revnu-green/10">
                    {messages.map((message) => {
                      const statusColors = {
                        sent: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
                        delivered: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
                        failed: "bg-red-500/20 text-red-400 border-red-500/30",
                        pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                        queued: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                      };

                      return (
                        <tr key={message.id} className="hover:bg-revnu-dark/30 transition">
                          <td className="px-6 py-4 text-sm text-revnu-gray whitespace-nowrap">
                            {new Date(message.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            <br />
                            <span className="text-xs">
                              {new Date(message.createdAt).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-white">
                            {message.customer.firstName} {message.customer.lastName}
                          </td>
                          <td className="px-6 py-4 text-sm text-revnu-gray">
                            {message.invoice?.invoiceNumber || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-revnu-slate/40 text-white border border-revnu-green/10 uppercase">
                              {message.channel}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-revnu-gray capitalize">
                            {message.direction}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                                statusColors[message.status as keyof typeof statusColors] || "bg-revnu-slate/40 text-revnu-gray border-revnu-green/10"
                              }`}
                            >
                              {message.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-white max-w-md truncate">
                            {message.subject || message.body}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-revnu-green/10">
              {messages.map((message) => {
                const statusColors = {
                  sent: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
                  delivered: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
                  failed: "bg-red-500/20 text-red-400 border-red-500/30",
                  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                  queued: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                };

                return (
                  <div
                    key={message.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-white text-base">
                          {message.customer.firstName} {message.customer.lastName}
                        </div>
                        <div className="text-sm text-revnu-gray mt-1">
                          {message.invoice?.invoiceNumber || 'No invoice'}
                        </div>
                        <div className="text-xs text-revnu-gray mt-1">
                          {new Date(message.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right space-y-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                            statusColors[message.status as keyof typeof statusColors] || "bg-revnu-slate/40 text-revnu-gray border-revnu-green/10"
                          }`}
                        >
                          {message.status}
                        </span>
                        <div>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-revnu-slate/40 text-white border border-revnu-green/10 uppercase">
                            {message.channel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-revnu-dark/50 p-3 rounded border border-revnu-green/10">
                      <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-2">
                        Message
                      </div>
                      <div className="text-sm text-white line-clamp-3">
                        {message.subject && <div className="font-bold mb-1">{message.subject}</div>}
                        {message.body}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
