import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import CustomerForm from "./customer-form";

export default async function NewCustomerPage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  if (!dbUser?.organization) {
    redirect("/onboarding");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Customer</h1>
        <p className="text-gray-600 mt-1">
          Add a new customer to start managing their invoices
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <CustomerForm organizationId={dbUser.organization.id} />
      </div>
    </div>
  );
}
