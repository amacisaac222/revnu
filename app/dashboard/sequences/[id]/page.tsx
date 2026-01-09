import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SequenceForm from "../new/sequence-form";

export default async function EditSequencePage({
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

  const sequence = await db.sequenceTemplate.findUnique({
    where: {
      id,
      organizationId: dbUser.organization.id,
    },
    include: {
      steps: {
        orderBy: { stepNumber: "asc" },
      },
    },
  });

  if (!sequence) {
    redirect("/dashboard/sequences");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Payment Reminder Sequence</h1>
        <p className="text-gray-600 mt-1">
          Update your automated reminder sequence
        </p>
      </div>

      <SequenceForm
        organizationId={dbUser.organization.id}
        sequence={sequence as any}
      />
    </div>
  );
}
