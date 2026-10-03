import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "./db";
import type { User } from "./db/schema";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session-token";

export type PublicUser = Omit<User, "passwordHash">;

export async function startSession(user: { id: number; name: string }) {
  const token = await signSession({ uid: user.id, name: user.name });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export const getSessionUserId = cache(async (): Promise<number | null> => {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  return session?.uid ?? null;
});

export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const db = await getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, uid)).limit(1);
  if (!user) return null;
  return toPublicUser(user);
});

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...rest } = user;
  void passwordHash;
  return rest;
}

export async function requireUser(next = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Please log in to continue.");
  return user;
}
