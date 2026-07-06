import { NextResponse } from "next/server";
import { verifyBearer } from "@/lib/auth";
import { corsJson, corsPreflight } from "@/lib/cors";
import { toolUpdatesIngestSchema } from "@/types/news.types";
import { upsertToolUpdates, getToolUpdates } from "@/services/toolUpdatesRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return corsPreflight();
}

function sinceIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// GET /api/tool-updates?tools=claude,codex&days=14 — 공개 읽기(선택 도구·최근 N일).
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const tools = (url.searchParams.get("tools") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 40);
  const daysRaw = Number(url.searchParams.get("days") ?? "14");
  const days = Number.isFinite(daysRaw) && daysRaw > 0 && daysRaw <= 60 ? Math.floor(daysRaw) : 14;

  if (tools.length === 0) return corsJson({ updates: [] });
  try {
    const updates = await getToolUpdates(tools, sinceIso(days));
    return corsJson({ updates });
  } catch (err) {
    return corsJson({ error: err instanceof Error ? err.message : "unknown error" }, 500);
  }
}

// POST /api/tool-updates — Bearer. 루틴이 매일 도구 업데이트 업서트.
export async function POST(req: Request): Promise<Response> {
  if (!verifyBearer(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = toolUpdatesIngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  try {
    const upserted = await upsertToolUpdates(parsed.data.updates);
    return NextResponse.json({ ok: true, upserted });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}
