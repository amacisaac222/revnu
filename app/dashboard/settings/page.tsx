import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await db.user.findUnique({
    where: { email: user.emailAddresses[0]?.emailAddress },
    include: {
      organization: true
    },
  });

  if (!dbUser?.organization) {
    redirect("/onboarding");
  }

  return <SettingsClient organization={dbUser.organization} />;
}
