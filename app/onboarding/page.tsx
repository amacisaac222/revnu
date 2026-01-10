import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import OnboardingWizard from "./onboarding-wizard";

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
    <OnboardingWizard
      userEmail={user.emailAddresses[0]?.emailAddress || ""}
      userName={`${user.firstName || ""} ${user.lastName || ""}`.trim()}
    />
  );
}
