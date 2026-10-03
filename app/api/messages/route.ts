import { z } from "zod";
import { json, readJson, route } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { MESSAGE_MAX, findOrCreateConversation, listConversations, sendMessage, unreadCount } from "@/lib/messages";

const StartInput = z.object({
  toUserId: z.number().int().positive(),
  petId: z.number().int().positive().nullable().optional(),
  body: z.string().trim().min(1).max(MESSAGE_MAX).optional(),
});

export const GET = route(async (req) => {
  const user = await requireApiUser();
  if (new URL(req.url).searchParams.get("unread")) return json({ unread: await unreadCount(user.id) });
  return json({ conversations: await listConversations(user.id) });
});

export const POST = route(async (req) => {
  const user = await requireApiUser();
  const input = StartInput.parse(await readJson(req));
  const conversationId = await findOrCreateConversation(user.id, input.toUserId, input.petId ?? null);
  if (input.body) await sendMessage(user.id, conversationId, input.body);
  return json({ conversationId }, { status: 201 });
});
