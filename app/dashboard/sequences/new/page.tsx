import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import NewSequenceClient from "./new-sequence-client";

export default async function NewSequencePage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  if (!dbUser?.organization) {
    redirect("/onboarding");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Create Payment Reminder Sequence</h1>
        <p className="text-revnu-gray mt-2">
          Set up automated reminders with live preview
        </p>
      </div>

      <NewSequenceClient
        organizationId={dbUser.organization.id}
        businessName={dbUser.organization.businessName}
      />
    </div>
  );
}
