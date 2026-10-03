import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { idParam, json, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

/** Marks a report as resolved (pet reunited). Only the reporter can do this. */
export const PATCH = route<Ctx>(async (_req, ctx) => {
  const user = await requireApiUser();
  const id = idParam((await ctx.params).id);
  const db = await getDb();
  const [report] = await db.select({ reporterId: schema.lostFound.reporterId }).from(schema.lostFound).where(eq(schema.lostFound.id, id)).limit(1);
  if (!report) throw new HttpError(404, "Report not found.");
  if (report.reporterId !== user.id) throw new HttpError(403, "Only the person who posted this report can close it.");
  await db.update(schema.lostFound).set({ resolved: true }).where(eq(schema.lostFound.id, id));
  revalidatePath("/lost-found");
  return json({ ok: true });
});
