import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Link from "next/link";
import CustomersList from "./customers-list";

export default async function CustomersPage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  if (!dbUser?.organization) return null;

  const customers = await db.customer.findMany({
    where: { organizationId: dbUser.organization.id },
    include: {
      invoices: {
        where: {
          status: { in: ["outstanding", "partial"] },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Customers</h1>
          <p className="text-sm md:text-base text-revnu-gray mt-1">
            Manage your customers and their outstanding balances
          </p>
        </div>
        <Link
          href="/dashboard/customers/new"
          className="px-6 py-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20 text-center active:scale-98"
        >
          Add Customer
        </Link>
      </div>

      <CustomersList customers={customers} />
    </div>
  );
}
