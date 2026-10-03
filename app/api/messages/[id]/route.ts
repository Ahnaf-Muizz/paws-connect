import { z } from "zod";
import { idParam, json, readJson, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { MESSAGE_MAX, getConversation, readMessages, sendMessage } from "@/lib/messages";

type Ctx = { params: Promise<{ id: string }> };

const SendInput = z.object({ body: z.string().trim().min(1, "Message can't be empty").max(MESSAGE_MAX) });

async function load(ctx: Ctx) {
  const user = await requireApiUser();
  const id = idParam((await ctx.params).id);
  const convo = await getConversation(user.id, id);
  if (!convo) throw new HttpError(404, "Conversation not found.");
  return { user, convo };
}

export const GET = route<Ctx>(async (req, ctx) => {
  const { user, convo } = await load(ctx);
  const after = Math.max(0, Number(new URL(req.url).searchParams.get("after")) || 0);
  return json({ messages: await readMessages(user.id, convo.id, after) });
});

export const POST = route<Ctx>(async (req, ctx) => {
  const { user, convo } = await load(ctx);
  const { body } = SendInput.parse(await readJson(req));
  return json({ message: await sendMessage(user.id, convo.id, body) }, { status: 201 });
});
