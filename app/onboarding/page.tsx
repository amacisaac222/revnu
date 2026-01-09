import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user already has an organization
  const existingUser = await db.user.findUnique({
    where: { email: user.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  if (existingUser?.organization) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to RevenuPros</h1>
          <p className="text-gray-600">Tell us about your business</p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <OnboardingForm
            userEmail={user.emailAddresses[0]?.emailAddress || ""}
            userName={`${user.firstName || ""} ${user.lastName || ""}`.trim()}
          />
        </div>
      </div>
    </div>
  );
}
