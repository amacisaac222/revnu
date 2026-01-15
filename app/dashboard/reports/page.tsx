import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { TrendingUp, DollarSign, Users, FileText, Calendar, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import RevenueChart from "./revenue-chart";
import CollectionRateChart from "./collection-rate-chart";
import CustomerGrowthChart from "./customer-growth-chart";

export default async function ReportsPage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  if (!dbUser?.organization) return null;

  // Get all invoices
  const invoices = await db.invoice.findMany({
    where: { organizationId: dbUser.organization.id },
    include: {
      customer: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Get all customers
  const customers = await db.customer.findMany({
    where: { organizationId: dbUser.organization.id },
    include: {
      invoices: {
        include: {
          payments: true,
        },
      },
    },
  });

  // Calculate key metrics
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.amountRemaining, 0);
  const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;

  // Average days to payment
  const paidInvoices = invoices.filter(inv => inv.status === "paid" && inv.paidAt);
  const avgDaysToPayment = paidInvoices.length > 0
    ? paidInvoices.reduce((sum, inv) => {
        const days = Math.floor(
          (inv.paidAt!.getTime() - inv.invoiceDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0) / paidInvoices.length
    : 0;

  // Revenue by month (last 12 months)
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      month: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      monthStart: new Date(d.getFullYear(), d.getMonth(), 1),
      monthEnd: new Date(d.getFullYear(), d.getMonth() + 1, 0),
    };
  }).reverse();

  const revenueByMonth = last12Months.map(({ month, monthStart, monthEnd }) => {
    const monthInvoices = invoices.filter(
      inv => inv.invoiceDate >= monthStart && inv.invoiceDate <= monthEnd
    );
    return {
      month,
      invoiced: monthInvoices.reduce((sum, inv) => sum + inv.amountDue, 0) / 100,
      collected: monthInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0) / 100,
      outstanding: monthInvoices.reduce((sum, inv) => sum + inv.amountRemaining, 0) / 100,
    };
  });

  // Collection rate by month
  const collectionRateByMonth = last12Months.map(({ month, monthStart, monthEnd }) => {
    const monthInvoices = invoices.filter(
      inv => inv.invoiceDate >= monthStart && inv.invoiceDate <= monthEnd
    );
    const monthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    const monthCollected = monthInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const rate = monthRevenue > 0 ? (monthCollected / monthRevenue) * 100 : 0;
    return {
      month,
      rate: parseFloat(rate.toFixed(1)),
    };
  });

  // Customer growth by month
  const customerGrowthByMonth = last12Months.map(({ month, monthEnd }) => {
    const count = customers.filter(c => c.createdAt <= monthEnd).length;
    return {
      month,
      customers: count,
    };
  });

  // Top customers by revenue
  const topCustomers = customers
    .map(c => ({
      name: `${c.firstName} ${c.lastName}`,
      totalInvoiced: c.invoices.reduce((sum, inv) => sum + inv.amountDue, 0),
      totalCollected: c.invoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
      totalOwed: c.invoices.reduce((sum, inv) => sum + inv.amountRemaining, 0),
      invoiceCount: c.invoices.length,
    }))
    .sort((a, b) => b.totalInvoiced - a.totalInvoiced)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Reports & Analytics</h1>
        <p className="text-revnu-gray mt-2">
          Comprehensive insights into your revenue and collection performance
        </p>
      </div>

      {/* Specialized Reports */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Specialized Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/reports/liens"
            className="group p-4 bg-revnu-dark/50 border border-revnu-green/20 rounded-lg hover:border-revnu-green hover:bg-revnu-green/10 transition flex items-start gap-3"
          >
            <div className="p-2 bg-revnu-green/20 rounded-lg group-hover:bg-revnu-green/30 transition">
              <Shield className="w-5 h-5 text-revnu-green" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-white">Mechanics Lien Report</h4>
                <ArrowRight className="w-4 h-4 text-revnu-gray group-hover:text-revnu-green transition" />
              </div>
              <p className="text-sm text-revnu-gray">
                Track lien-eligible invoices and filing deadlines
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-revnu-green/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-revnu-green" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-revnu-gray">Total Revenue</p>
            <p className="text-2xl font-black text-white">
              ${(totalRevenue / 100).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-revnu-gray">Collection Rate</p>
            <p className="text-2xl font-black text-white">
              {collectionRate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-revnu-gray">Avg Days to Payment</p>
            <p className="text-2xl font-black text-white">
              {avgDaysToPayment.toFixed(0)} days
            </p>
          </div>
        </div>

        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-revnu-gray">Total Customers</p>
            <p className="text-2xl font-black text-white">
              {customers.length}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Revenue Trends</h3>
          <RevenueChart data={revenueByMonth} />
        </div>

        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Collection Rate</h3>
          <CollectionRateChart data={collectionRateByMonth} />
        </div>
      </div>

      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Customer Growth</h3>
        <CustomerGrowthChart data={customerGrowthByMonth} />
      </div>

      {/* Top Customers Table */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Top 10 Customers by Revenue</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-revnu-dark/50 border-b border-revnu-green/10">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-bold text-revnu-gray uppercase">
                  Customer
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">
                  Invoiced
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">
                  Collected
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">
                  Outstanding
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-revnu-gray uppercase">
                  Invoices
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-revnu-green/10">
              {topCustomers.map((customer, idx) => (
                <tr key={idx} className="hover:bg-revnu-dark/30 transition">
                  <td className="py-3 px-4 text-white font-semibold">
                    {customer.name}
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    ${(customer.totalInvoiced / 100).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                    ${(customer.totalCollected / 100).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-400 font-bold">
                    ${(customer.totalOwed / 100).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-revnu-gray">
                    {customer.invoiceCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
