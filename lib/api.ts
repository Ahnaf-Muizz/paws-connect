import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "./auth";

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

export function route<C = unknown>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
      if (err instanceof ZodError) {
        const first = err.issues[0];
        const field = first?.path.join(".");
        return NextResponse.json(
          { error: first ? `${field ? `${field}: ` : ""}${first.message}` : "Invalid input", issues: err.issues },
          { status: 400 },
        );
      }
      console.error(err);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export const json = NextResponse.json;

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Request body must be JSON.");
  }
}

export function idParam(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, "Not found");
  return id;
}
