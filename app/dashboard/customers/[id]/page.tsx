import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  if (!dbUser?.organization) {
    redirect("/onboarding");
  }

  // Fetch customer with all related data
  const customer = await db.customer.findFirst({
    where: {
      id,
      organizationId: dbUser.organization.id,
    },
    include: {
      invoices: {
        orderBy: { dueDate: "desc" },
        include: {
          collectionSequence: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          invoice: true,
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  // Calculate stats
  const totalInvoices = customer.invoices.length;
  const outstandingInvoices = customer.invoices.filter(
    (inv) => inv.status === "outstanding" || inv.status === "partial"
  ).length;
  const totalOwed = customer.invoices.reduce(
    (sum, inv) => sum + inv.amountRemaining,
    0
  );
  const overdueInvoices = customer.invoices.filter(
    (inv) => inv.daysPastDue > 0
  ).length;

  const statusColors: Record<string, string> = {
    outstanding: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    partial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    paid: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
    written_off: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  const messageStatusColors: Record<string, string> = {
    sent: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
    delivered: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    queued: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <Link
            href="/dashboard/customers"
            className="text-sm text-revnu-green hover:text-revnu-greenLight mb-2 inline-flex items-center gap-1"
          >
            ← Back to Customers
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-2">
            {customer.firstName} {customer.lastName}
          </h1>
          <div className="space-y-1 mt-2">
            {customer.email && (
              <p className="text-sm text-revnu-gray">
                <span className="font-bold">Email:</span>{" "}
                <a
                  href={`mailto:${customer.email}`}
                  className="text-revnu-green hover:text-revnu-greenLight"
                >
                  {customer.email}
                </a>
              </p>
            )}
            {customer.phone && (
              <p className="text-sm text-revnu-gray">
                <span className="font-bold">Phone:</span>{" "}
                <a
                  href={`tel:${customer.phone}`}
                  className="text-revnu-green hover:text-revnu-greenLight"
                >
                  {customer.phone}
                </a>
                {customer.smsConsentGiven && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-revnu-green/20 text-revnu-green border border-revnu-green/30">
                    SMS OK
                  </span>
                )}
                {customer.smsOptedOut && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    Opted Out
                  </span>
                )}
              </p>
            )}
            {customer.address && (
              <p className="text-sm text-revnu-gray">
                <span className="font-bold">Address:</span> {customer.address}
                {customer.city && `, ${customer.city}`}
                {customer.state && `, ${customer.state}`}
                {customer.zip && ` ${customer.zip}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/dashboard/customers/${customer.id}/edit`}
            className="px-4 py-2 bg-revnu-dark/50 border-2 border-revnu-green/30 text-white font-bold rounded-lg hover:bg-revnu-dark transition text-center"
          >
            Edit Customer
          </Link>
          <Link
            href={`/dashboard/invoices/new?customerId=${customer.id}`}
            className="px-4 py-2 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20 text-center"
          >
            Add Invoice
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-revnu-green/20 to-revnu-green/5 p-4 md:p-6 rounded-xl border-2 border-revnu-green/30">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Total Owed
          </div>
          <div className="text-2xl md:text-3xl font-black text-revnu-green">
            ${(totalOwed / 100).toLocaleString()}
          </div>
        </div>
        <div className="bg-revnu-dark/50 p-4 md:p-6 rounded-xl border-2 border-revnu-green/10">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Total Invoices
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            {totalInvoices}
          </div>
        </div>
        <div className="bg-revnu-dark/50 p-4 md:p-6 rounded-xl border-2 border-revnu-green/10">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Outstanding
          </div>
          <div className="text-2xl md:text-3xl font-black text-yellow-400">
            {outstandingInvoices}
          </div>
        </div>
        <div className="bg-revnu-dark/50 p-4 md:p-6 rounded-xl border-2 border-revnu-green/10">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Overdue
          </div>
          <div className="text-2xl md:text-3xl font-black text-red-400">
            {overdueInvoices}
          </div>
        </div>
      </div>

      {/* Customer Notes */}
      {customer.customerNotes && (
        <div className="bg-revnu-dark/50 p-4 md:p-6 rounded-xl border-2 border-revnu-green/10">
          <h2 className="text-lg font-black text-white mb-2">Notes</h2>
          <p className="text-sm text-revnu-gray whitespace-pre-wrap">
            {customer.customerNotes}
          </p>
        </div>
      )}

      {/* Invoices Section */}
      <div className="bg-revnu-dark/50 rounded-xl border-2 border-revnu-green/10">
        <div className="p-4 md:p-6 border-b border-revnu-green/10">
          <h2 className="text-xl font-black text-white">Invoices</h2>
        </div>

        {customer.invoices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-revnu-gray mb-4">No invoices yet</p>
            <Link
              href={`/dashboard/invoices/new?customerId=${customer.id}`}
              className="inline-block px-4 py-2 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition"
            >
              Create First Invoice
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-revnu-dark/50 border-b border-revnu-green/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-revnu-green/10">
                  {customer.invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-revnu-dark/30 transition"
                    >
                      <td className="px-6 py-4 font-black text-white">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-revnu-gray">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-revnu-gray">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                        {invoice.daysPastDue > 0 && (
                          <div className="text-red-400 font-bold text-xs mt-1">
                            {invoice.daysPastDue} days overdue
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        ${(invoice.amountDue / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-black text-revnu-green">
                        ${(invoice.amountRemaining / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                            statusColors[invoice.status]
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="text-sm text-revnu-green hover:text-revnu-greenLight font-bold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-revnu-green/10">
              {customer.invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/dashboard/invoices/${invoice.id}`}
                  className="block p-4 active:bg-revnu-dark/30 transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-white text-base mb-1">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-xs text-revnu-gray">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                          statusColors[invoice.status]
                        }`}
                      >
                        {invoice.status}
                      </span>
                      {invoice.daysPastDue > 0 && (
                        <div className="text-red-400 font-bold text-xs mt-1">
                          {invoice.daysPastDue} days overdue
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-revnu-dark/50 p-3 rounded border border-revnu-green/10">
                      <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                        Amount Due
                      </div>
                      <div className="text-base font-black text-white">
                        ${(invoice.amountDue / 100).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-revnu-dark/50 p-3 rounded border border-revnu-green/10">
                      <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                        Remaining
                      </div>
                      <div className="text-base font-black text-revnu-green">
                        ${(invoice.amountRemaining / 100).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Messages Section */}
      <div className="bg-revnu-dark/50 rounded-xl border-2 border-revnu-green/10">
        <div className="p-4 md:p-6 border-b border-revnu-green/10">
          <h2 className="text-xl font-black text-white">Communication History</h2>
          <p className="text-sm text-revnu-gray mt-1">
            Last {customer.messages.length} messages
          </p>
        </div>

        {customer.messages.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-revnu-gray">No messages sent yet</p>
          </div>
        ) : (
          <div className="divide-y divide-revnu-green/10">
            {customer.messages.map((message) => (
              <div key={message.id} className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                          message.channel === "sms"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        }`}
                      >
                        {message.channel.toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                          messageStatusColors[message.status]
                        }`}
                      >
                        {message.status}
                      </span>
                      {message.isAutomated && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-revnu-green/20 text-revnu-green border border-revnu-green/30">
                          Automated
                        </span>
                      )}
                    </div>
                    {message.invoice && (
                      <p className="text-xs text-revnu-gray">
                        Re: Invoice {message.invoice.invoiceNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-revnu-gray">
                    {new Date(message.createdAt).toLocaleString()}
                  </div>
                </div>
                {message.subject && (
                  <p className="font-bold text-white text-sm mb-1">
                    {message.subject}
                  </p>
                )}
                <p className="text-sm text-revnu-gray">{message.body}</p>
                {message.errorMessage && (
                  <p className="text-xs text-red-400 mt-2">
                    Error: {message.errorMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
