import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyBearer } from "@/lib/auth";
import { updateItem, deleteItem } from "@/services/newsRepository";
import { newsCategorySchema, blockSchema } from "@/types/news.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const itemPatch = z
  .object({
    title: z.string().min(1).optional(),
    summary: z.string().min(1).optional(),
    tldr: z.string().nullable().optional(),
    category: newsCategorySchema.optional(),
    position: z.number().int().min(0).optional(),
    score: z.number().int().min(0).max(10).nullable().optional(),
    blocks: z.array(blockSchema).optional(),
    tags: z.array(z.string().min(1)).optional(),
    entities: z.array(z.string().min(1)).optional(),
    story_slug: z.string().nullable().optional(),
    follow_up_of: z.string().nullable().optional(),
    source_published_at: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
  })
  .strict();

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } },
): Promise<Response> {
  if (!verifyBearer(req)) return unauthorized();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = itemPatch.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.path.join(".")).join(", ") },
      { status: 400 },
    );
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }
  try {
    await updateItem(ctx.params.id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: { id: string } },
): Promise<Response> {
  if (!verifyBearer(req)) return unauthorized();
  try {
    await deleteItem(ctx.params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}
