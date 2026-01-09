import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import InvoiceForm from "./invoice-form";

export default async function NewInvoicePage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  if (!dbUser?.organization) {
    redirect("/onboarding");
  }

  // Get customers and sequences for dropdown
  const [customers, sequences] = await Promise.all([
    db.customer.findMany({
      where: { organizationId: dbUser.organization.id },
      orderBy: { lastName: "asc" },
    }),
    db.sequenceTemplate.findMany({
      where: {
        organizationId: dbUser.organization.id,
        isActive: true,
      },
      orderBy: [
        { isDefault: "desc" },
        { name: "asc" },
      ],
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Invoice</h1>
        <p className="text-gray-600 mt-1">
          Add a new invoice and optionally start automated reminders
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <InvoiceForm
          organizationId={dbUser.organization.id}
          customers={customers}
          sequences={sequences}
        />
      </div>
    </div>
  );
}
