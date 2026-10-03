import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { json, readJson, route } from "@/lib/api";
import { HttpError, startSession, toPublicUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

const Body = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string(),
});

export const POST = route(async (req) => {
  const { email, password } = Body.parse(await readJson(req));
  const db = await getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, "Email or password is incorrect.");
  }
  await startSession(user);
  return json({ user: toPublicUser(user) });
});
