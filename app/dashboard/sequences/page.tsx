import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function SequencesPage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  if (!dbUser?.organization) return null;

  const sequences = await db.sequenceTemplate.findMany({
    where: { organizationId: dbUser.organization.id },
    include: {
      steps: {
        orderBy: { stepNumber: "asc" },
      },
      _count: {
        select: { invoices: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Payment Reminder Sequences</h1>
          <p className="text-revnu-gray mt-2">
            Automate your payment reminders with multi-step sequences
          </p>
        </div>
        <Link
          href="/dashboard/sequences/new"
          className="px-6 py-3 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition-all shadow-lg shadow-revnu-green/20"
        >
          Create Sequence
        </Link>
      </div>

      {/* Sequences List */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl overflow-hidden">
        {sequences.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              No sequences yet
            </h3>
            <p className="text-revnu-gray mb-6">
              Create your first reminder sequence to automate payment follow-ups
            </p>
            <Link
              href="/dashboard/sequences/new"
              className="inline-block px-6 py-3 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition-all"
            >
              Create Sequence
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-revnu-green/10">
            {sequences.map((sequence) => (
              <div
                key={sequence.id}
                className="p-6 hover:bg-revnu-green/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {sequence.name}
                      </h3>
                      {sequence.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-revnu-green/20 text-revnu-green">
                          Default
                        </span>
                      )}
                      {sequence.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-revnu-green/20 text-revnu-green">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-revnu-slate text-revnu-gray">
                          Inactive
                        </span>
                      )}
                    </div>

                    {sequence.description && (
                      <p className="text-revnu-gray mb-3">
                        {sequence.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-revnu-gray">
                      <div>
                        <span className="font-bold text-white">{sequence.steps.length}</span> steps
                      </div>
                      <div>
                        Starts <span className="font-bold text-white">{sequence.triggerDaysPastDue}</span> days past due
                      </div>
                      <div>
                        <span className="font-bold text-white">{sequence._count.invoices}</span> invoices using
                      </div>
                    </div>

                    {/* Step Preview */}
                    <div className="mt-4 flex items-center gap-2">
                      {sequence.steps.slice(0, 3).map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                          <div className="px-2 py-1 bg-revnu-dark border border-revnu-green/30 rounded text-xs font-bold text-revnu-green">
                            Day {step.delayDays} • {step.channel.toUpperCase()}
                          </div>
                          {idx < Math.min(sequence.steps.length, 3) - 1 && (
                            <div className="mx-1 text-revnu-green">→</div>
                          )}
                        </div>
                      ))}
                      {sequence.steps.length > 3 && (
                        <div className="text-xs text-revnu-gray">
                          +{sequence.steps.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/dashboard/sequences/${sequence.id}`}
                      className="px-4 py-2 text-sm border border-revnu-green/30 rounded-lg hover:bg-revnu-green/10 text-white font-semibold transition"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-3">
          How Payment Reminder Sequences Work
        </h4>
        <ul className="text-sm text-revnu-gray space-y-2">
          <li>• Create multi-step reminder sequences (friendly → firm → final)</li>
          <li>• Messages send automatically from YOUR business</li>
          <li>• Customize timing and tone for each step</li>
          <li>• All messages respect quiet hours (8 AM - 9 PM customer timezone)</li>
          <li>• Customers can opt out anytime by replying STOP</li>
        </ul>
      </div>
    </div>
  );
}
