import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { organization: true },
  });

  // Redirect to onboarding if user doesn't have an organization
  if (!dbUser?.organization) {
    redirect("/onboarding");
  }

  // Redirect to Send Reminders as the primary dashboard page
  redirect("/dashboard/send-reminders");
}
