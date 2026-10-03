import { json, route } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { getMatches } from "@/lib/queries";

export const GET = route(async () => {
  const user = await requireApiUser();
  const { profile, matches } = await getMatches(user.id);
  return json({ hasProfile: Boolean(profile), matches });
});
