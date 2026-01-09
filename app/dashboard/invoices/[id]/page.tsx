import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import SendReminderButton from "./send-reminder-button";
import RecordPaymentButton from "./record-payment-button";

export default async function InvoiceDetailPage({
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

  // Fetch invoice with all related data
  const invoice = await db.invoice.findFirst({
    where: {
      id,
      organizationId: dbUser.organization.id,
    },
    include: {
      customer: true,
      collectionSequence: {
        include: {
          steps: {
            orderBy: { stepNumber: "asc" },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      messages: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

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

  const paymentStatusColors: Record<string, string> = {
    completed: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    refunded: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <Link
            href="/dashboard/invoices"
            className="text-sm text-revnu-green hover:text-revnu-greenLight mb-2 inline-flex items-center gap-1"
          >
            ← Back to Invoices
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-2">
            Invoice {invoice.invoiceNumber}
          </h1>
          <div className="space-y-1 mt-2">
            <p className="text-sm text-revnu-gray">
              <span className="font-bold">Customer:</span>{" "}
              <Link
                href={`/dashboard/customers/${invoice.customer.id}`}
                className="text-revnu-green hover:text-revnu-greenLight"
              >
                {invoice.customer.firstName} {invoice.customer.lastName}
              </Link>
            </p>
            <p className="text-sm text-revnu-gray">
              <span className="font-bold">Invoice Date:</span>{" "}
              {new Date(invoice.invoiceDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-revnu-gray">
              <span className="font-bold">Due Date:</span>{" "}
              {new Date(invoice.dueDate).toLocaleDateString()}
              {invoice.daysPastDue > 0 && (
                <span className="ml-2 text-red-400 font-bold">
                  ({invoice.daysPastDue} days overdue)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <RecordPaymentButton
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoiceNumber}
            amountRemaining={invoice.amountRemaining}
            isPaid={invoice.status === "paid"}
          />
          <SendReminderButton
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoiceNumber}
            customerFirstName={invoice.customer.firstName}
            customerLastName={invoice.customer.lastName}
            canSendSMS={invoice.customer.smsConsentGiven && !invoice.customer.smsOptedOut}
            canSendEmail={invoice.customer.emailConsentGiven && !invoice.customer.emailOptedOut}
            smsConsentMethod={invoice.customer.smsConsentMethod}
            smsConsentDate={invoice.customer.smsConsentDate}
            emailConsentGiven={invoice.customer.emailConsentGiven}
            daysPastDue={invoice.daysPastDue}
            amountRemaining={invoice.amountRemaining}
            dueDate={invoice.dueDate}
            businessName={dbUser.organization.businessName || "Your Business"}
            businessPhone={dbUser.organization.phone || undefined}
            businessEmail={dbUser.organization.email || undefined}
          />
          <Link
            href={`/dashboard/invoices/${invoice.id}/edit`}
            className="px-4 py-2 bg-revnu-dark/50 border-2 border-revnu-green/30 text-white font-bold rounded-lg hover:bg-revnu-dark transition text-center"
          >
            Edit Invoice
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-revnu-green/20 to-revnu-green/5 p-4 md:p-6 rounded-xl border-2 border-revnu-green/30">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Amount Due
          </div>
          <div className="text-2xl md:text-3xl font-black text-revnu-green">
            ${(invoice.amountDue / 100).toLocaleString()}
          </div>
        </div>
        <div className="bg-revnu-dark/50 p-4 md:p-6 rounded-xl border-2 border-revnu-green/10">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Amount Paid
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            ${(invoice.amountPaid / 100).toLocaleString()}
          </div>
        </div>
        <div className="bg-revnu-dark/50 p-4 md:p-6 rounded-xl border-2 border-revnu-green/10">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Remaining
          </div>
          <div className="text-2xl md:text-3xl font-black text-yellow-400">
            ${(invoice.amountRemaining / 100).toLocaleString()}
          </div>
        </div>
        <div className="bg-revnu-dark/50 p-4 md:p-6 rounded-xl border-2 border-revnu-green/10">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Status
          </div>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-bold border ${
              statusColors[invoice.status]
            }`}
          >
            {invoice.status}
          </span>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-revnu-dark/50 p-4 md:p-6 rounded-xl border-2 border-revnu-green/10">
        <h2 className="text-lg font-black text-white mb-4">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Description
            </p>
            <p className="text-sm text-white">
              {invoice.description || "No description"}
            </p>
          </div>
          <div>
            <p className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Currency
            </p>
            <p className="text-sm text-white uppercase">{invoice.currency}</p>
          </div>
          {invoice.inCollection && (
            <>
              <div>
                <p className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                  In Collection
                </p>
                <p className="text-sm text-red-400 font-bold">
                  Yes (since{" "}
                  {invoice.collectionStartedAt &&
                    new Date(invoice.collectionStartedAt).toLocaleDateString()}
                  )
                </p>
              </div>
              <div>
                <p className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                  Collection Sequence
                </p>
                <p className="text-sm text-white">
                  {invoice.collectionSequence?.name || "None"}
                </p>
              </div>
              <div>
                <p className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                  Contact Attempts
                </p>
                <p className="text-sm text-white">{invoice.contactAttempts}</p>
              </div>
              <div>
                <p className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                  Last Contacted
                </p>
                <p className="text-sm text-white">
                  {invoice.lastContactedAt
                    ? new Date(invoice.lastContactedAt).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-revnu-dark/50 rounded-xl border-2 border-revnu-green/10">
        <div className="p-4 md:p-6 border-b border-revnu-green/10">
          <h2 className="text-xl font-black text-white">Payment History</h2>
        </div>

        {invoice.payments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-revnu-gray">No payments recorded</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-revnu-dark/50 border-b border-revnu-green/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-revnu-green/10">
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-revnu-dark/30 transition">
                      <td className="px-6 py-4 text-sm text-revnu-gray">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-black text-revnu-green">
                        ${(payment.amount / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white capitalize">
                        {payment.paymentMethod.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                            paymentStatusColors[payment.status]
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-revnu-gray">
                        {payment.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-revnu-green/10">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="font-black text-revnu-green text-lg">
                        ${(payment.amount / 100).toLocaleString()}
                      </div>
                      <div className="text-xs text-revnu-gray mt-1">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                        paymentStatusColors[payment.status]
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-sm text-white capitalize mb-1">
                    {payment.paymentMethod.replace("_", " ")}
                  </p>
                  {payment.notes && (
                    <p className="text-sm text-revnu-gray">{payment.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Communication History */}
      <div className="bg-revnu-dark/50 rounded-xl border-2 border-revnu-green/10">
        <div className="p-4 md:p-6 border-b border-revnu-green/10">
          <h2 className="text-xl font-black text-white">Communication History</h2>
          <p className="text-sm text-revnu-gray mt-1">
            Messages related to this invoice
          </p>
        </div>

        {invoice.messages.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-revnu-gray mb-4">No messages sent yet</p>
            <p className="text-sm text-revnu-gray">
              Use the "Send Reminder" button to contact the customer
            </p>
          </div>
        ) : (
          <div className="divide-y divide-revnu-green/10">
            {invoice.messages.map((message) => (
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
