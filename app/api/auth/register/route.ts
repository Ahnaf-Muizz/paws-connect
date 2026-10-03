import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { json, readJson, route } from "@/lib/api";
import { HttpError, startSession, toPublicUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

const Body = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.email("Enter a valid email").transform((e) => e.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  city: z.string().trim().max(80).optional(),
});

export const POST = route(async (req) => {
  const body = Body.parse(await readJson(req));
  const db = await getDb();
  const [existing] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, body.email));
  if (existing) throw new HttpError(409, "An account with that email already exists.");
  const [user] = await db
    .insert(schema.users)
    .values({
      name: body.name,
      email: body.email,
      passwordHash: await bcrypt.hash(body.password, 10),
      city: body.city || "Lubbock, TX",
    })
    .returning();
  await startSession(user);
  return json({ user: toPublicUser(user) }, { status: 201 });
});
