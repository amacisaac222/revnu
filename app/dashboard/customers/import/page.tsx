import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ImportForm from "./import-form";

export default async function ImportCustomersPage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  if (!dbUser?.organization) {
    redirect("/onboarding");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Import Customers</h1>
        <p className="text-revnu-gray mt-1">
          Upload a CSV or Excel file to import multiple customers at once
        </p>
      </div>

      <div className="bg-revnu-slate/40 p-6 rounded-lg border border-revnu-green/20">
        <ImportForm organizationId={dbUser.organization.id} />
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-revnu-slate/40 p-6 rounded-lg border border-revnu-green/20">
        <h2 className="text-lg font-bold text-white mb-4">File Requirements</h2>
        <div className="space-y-3 text-sm text-revnu-gray">
          <p>Your CSV file should include the following columns:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-white">firstName</strong> (required)</li>
            <li><strong className="text-white">lastName</strong> (required)</li>
            <li><strong className="text-white">email</strong> (optional, but recommended for duplicate detection)</li>
            <li><strong className="text-white">phone</strong> (optional)</li>
            <li><strong className="text-white">address</strong> (optional)</li>
            <li><strong className="text-white">city</strong> (optional)</li>
            <li><strong className="text-white">state</strong> (optional)</li>
            <li><strong className="text-white">zip</strong> (optional)</li>
            <li><strong className="text-white">notes</strong> (optional)</li>
            <li><strong className="text-white">invoiceNumber, invoiceDescription, invoiceAmount, invoiceDueDate</strong> (optional - for creating invoices)</li>
          </ul>
          <p className="mt-4">
            <strong className="text-white">Note:</strong> Column headers are case-insensitive. If a customer with the same email already exists, their information will be updated instead of creating a duplicate.
          </p>
        </div>
      </div>
    </div>
  );
}
