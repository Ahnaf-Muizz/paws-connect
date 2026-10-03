import { json, route } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export const GET = route(async () => {
  return json({ user: await getCurrentUser() });
});
