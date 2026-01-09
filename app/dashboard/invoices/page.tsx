import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Link from "next/link";
import InvoicesList from "./invoices-list";

export default async function InvoicesPage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  if (!dbUser?.organization) return null;

  const invoices = await db.invoice.findMany({
    where: { organizationId: dbUser.organization.id },
    include: {
      customer: true,
    },
    orderBy: { dueDate: "desc" },
  });

  const stats = {
    outstanding: invoices.filter((i) => i.status === "outstanding").length,
    partial: invoices.filter((i) => i.status === "partial").length,
    paid: invoices.filter((i) => i.status === "paid").length,
    totalOutstanding: invoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + i.amountRemaining, 0),
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Invoices</h1>
          <p className="text-sm md:text-base text-revnu-gray mt-1">Track and manage outstanding invoices</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="px-6 py-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20 text-center active:scale-98"
        >
          Create Invoice
        </Link>
      </div>

      {/* Stats - Mobile optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-revnu-green/20 to-revnu-green/5 p-4 md:p-6 rounded-xl border-2 border-revnu-green/30">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">Total Outstanding</div>
          <div className="text-2xl md:text-3xl font-black text-revnu-green">
            ${(stats.totalOutstanding / 100).toLocaleString()}
          </div>
        </div>
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">Outstanding</div>
          <div className="text-2xl md:text-3xl font-black text-white">{stats.outstanding}</div>
        </div>
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">Partial Payment</div>
          <div className="text-2xl md:text-3xl font-black text-white">{stats.partial}</div>
        </div>
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">Paid</div>
          <div className="text-2xl md:text-3xl font-black text-revnu-green">{stats.paid}</div>
        </div>
      </div>

      <InvoicesList invoices={invoices} />
    </div>
  );
}
