import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyBearer } from "@/lib/auth";
import { reorderItems } from "@/services/newsRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reorderBody = z.object({
  orders: z.array(z.object({ id: z.string().min(1), position: z.number().int().min(0) })).min(1),
});

// POST /api/admin/reorder  body: { orders: [{ id, position }] }
export async function POST(req: Request): Promise<Response> {
  if (!verifyBearer(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = reorderBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  try {
    await reorderItems(parsed.data.orders);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}
