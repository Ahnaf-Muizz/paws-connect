import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "paws_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // A shared fallback would let anyone forge sessions, so deployed builds must configure one.
    if (process.env.VERCEL) throw new Error("AUTH_SECRET is not set. Add it in the Vercel project settings.");
    return new TextEncoder().encode("paws-connect-local-development-secret");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = { uid: number; name: string };

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.uid !== "number") return null;
    return { uid: payload.uid, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
