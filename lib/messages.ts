import { and, asc, count, desc, eq, gt, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { HttpError } from "./auth";
import { getDb, schema as s } from "./db";

export const MESSAGE_MAX = 2000;

const pair = (a: number, b: number) => (a < b ? [a, b] : [b, a]);

export async function findOrCreateConversation(userId: number, toUserId: number, petId: number | null) {
  if (userId === toUserId) throw new HttpError(400, "You can't message yourself.");
  const db = await getDb();
  const [other] = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.id, toUserId)).limit(1);
  if (!other) throw new HttpError(404, "That user no longer exists.");
  if (petId) {
    const [pet] = await db.select({ ownerId: s.pets.ownerId }).from(s.pets).where(eq(s.pets.id, petId)).limit(1);
    if (!pet) throw new HttpError(404, "Pet not found.");
    if (pet.ownerId !== toUserId && pet.ownerId !== userId) throw new HttpError(400, "Conversations about a pet must include its owner.");
  }
  const [a, b] = pair(userId, toUserId);
  const [existing] = await db
    .select({ id: s.conversations.id })
    .from(s.conversations)
    .where(
      and(
        eq(s.conversations.userAId, a),
        eq(s.conversations.userBId, b),
        petId ? eq(s.conversations.petId, petId) : isNull(s.conversations.petId),
      ),
    )
    .limit(1);
  if (existing) return existing.id;
  const [created] = await db.insert(s.conversations).values({ userAId: a, userBId: b, petId }).returning({ id: s.conversations.id });
  return created.id;
}

const isMember = (userId: number) => or(eq(s.conversations.userAId, userId), eq(s.conversations.userBId, userId));

export async function listConversations(userId: number) {
  const db = await getDb();
  const convos = await db
    .select({ convo: s.conversations, pet: { id: s.pets.id, name: s.pets.name, photos: s.pets.photos, species: s.pets.species } })
    .from(s.conversations)
    .leftJoin(s.pets, eq(s.conversations.petId, s.pets.id))
    .where(isMember(userId))
    .orderBy(desc(s.conversations.lastMessageAt));
  if (!convos.length) return [];

  const ids = convos.map((c) => c.convo.id);
  const otherIds = convos.map((c) => (c.convo.userAId === userId ? c.convo.userBId : c.convo.userAId));
  const [people, lastMessages, unread] = await Promise.all([
    db.select({ id: s.users.id, name: s.users.name, verified: s.users.verified }).from(s.users).where(inArray(s.users.id, otherIds)),
    db
      .selectDistinctOn([s.messages.conversationId], { conversationId: s.messages.conversationId, body: s.messages.body, senderId: s.messages.senderId, createdAt: s.messages.createdAt })
      .from(s.messages)
      .where(inArray(s.messages.conversationId, ids))
      .orderBy(s.messages.conversationId, desc(s.messages.createdAt), desc(s.messages.id)),
    db
      .select({ conversationId: s.messages.conversationId, n: count() })
      .from(s.messages)
      .where(and(inArray(s.messages.conversationId, ids), ne(s.messages.senderId, userId), isNull(s.messages.readAt)))
      .groupBy(s.messages.conversationId),
  ]);
  const personById = new Map(people.map((p) => [p.id, p]));
  const lastById = new Map(lastMessages.map((m) => [m.conversationId, m]));
  const unreadById = new Map(unread.map((u) => [u.conversationId, u.n]));
  return convos.map(({ convo, pet }, i) => ({
    id: convo.id,
    lastMessageAt: convo.lastMessageAt,
    pet: pet?.id ? pet : null,
    other: personById.get(otherIds[i]) ?? { id: otherIds[i], name: "Former member", verified: false },
    last: lastById.get(convo.id) ?? null,
    unread: unreadById.get(convo.id) ?? 0,
  }));
}

export type ConversationSummary = Awaited<ReturnType<typeof listConversations>>[number];

export async function unreadCount(userId: number) {
  const db = await getDb();
  const [row] = await db
    .select({ n: count() })
    .from(s.messages)
    .innerJoin(s.conversations, eq(s.messages.conversationId, s.conversations.id))
    .where(and(isMember(userId), ne(s.messages.senderId, userId), isNull(s.messages.readAt)));
  return row?.n ?? 0;
}

export async function getConversation(userId: number, id: number) {
  const db = await getDb();
  const [row] = await db
    .select({ convo: s.conversations, pet: { id: s.pets.id, name: s.pets.name, photos: s.pets.photos, species: s.pets.species, status: s.pets.status } })
    .from(s.conversations)
    .leftJoin(s.pets, eq(s.conversations.petId, s.pets.id))
    .where(and(eq(s.conversations.id, id), isMember(userId)))
    .limit(1);
  if (!row) return null;
  const otherId = row.convo.userAId === userId ? row.convo.userBId : row.convo.userAId;
  const [other] = await db
    .select({ id: s.users.id, name: s.users.name, verified: s.users.verified, city: s.users.city })
    .from(s.users)
    .where(eq(s.users.id, otherId))
    .limit(1);
  return { id: row.convo.id, pet: row.pet?.id ? row.pet : null, other: other ?? { id: otherId, name: "Former member", verified: false, city: "" } };
}

/** Returns messages after `afterId` (all when 0) and marks the other person's messages as read. */
export async function readMessages(userId: number, conversationId: number, afterId = 0) {
  const db = await getDb();
  const rows = await db
    .select({ id: s.messages.id, senderId: s.messages.senderId, body: s.messages.body, createdAt: s.messages.createdAt, readAt: s.messages.readAt })
    .from(s.messages)
    .where(and(eq(s.messages.conversationId, conversationId), gt(s.messages.id, afterId)))
    .orderBy(asc(s.messages.id));
  if (rows.some((m) => m.senderId !== userId && !m.readAt)) {
    await db
      .update(s.messages)
      .set({ readAt: sql`now()` })
      .where(and(eq(s.messages.conversationId, conversationId), ne(s.messages.senderId, userId), isNull(s.messages.readAt)));
  }
  return rows;
}

export async function sendMessage(userId: number, conversationId: number, body: string) {
  const db = await getDb();
  const [message] = await db
    .insert(s.messages)
    .values({ conversationId, senderId: userId, body })
    .returning({ id: s.messages.id, senderId: s.messages.senderId, body: s.messages.body, createdAt: s.messages.createdAt, readAt: s.messages.readAt });
  await db.update(s.conversations).set({ lastMessageAt: message.createdAt }).where(eq(s.conversations.id, conversationId));
  return message;
}

export type ChatMessage = Awaited<ReturnType<typeof readMessages>>[number];
