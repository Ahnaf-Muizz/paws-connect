import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/queries";

export const metadata: Metadata = { title: "Adopter profile", robots: { index: false } };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string; next?: string }> }) {
  const user = await requireUser("/profile");
  const [profile, sp] = await Promise.all([getProfile(user.id), searchParams]);
  return (
    <div className="container-page max-w-3xl pb-10">
      <PageHeader
        eyebrow={sp.welcome ? `Welcome, ${user.name.split(" ")[0]}!` : "Adopter profile"}
        title={profile ? "Your adopter profile" : "Tell us about your home"}
        description="Your answers power your match scores. Owners see your score and the reasons behind it, never your private details."
      />
      <ProfileForm
        initial={profile}
        city={user.city}
        next={sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/matches"}
      />
    </div>
  );
}
