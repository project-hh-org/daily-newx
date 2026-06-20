import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyBearer } from "@/lib/auth";
import { getIssueAdmin, updateIssueMeta } from "@/services/newsRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COMPACT_RE = /^(\d{4})(\d{2})(\d{2})$/;
const DASHED_RE = /^\d{4}-\d{2}-\d{2}$/;
function toIso(slug: string): string | null {
  const m = slug.match(COMPACT_RE);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  if (DASHED_RE.test(slug)) return slug;
  return null;
}

const issuePatch = z
  .object({
    intro: z.string().nullable().optional(),
    outro: z.string().nullable().optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .strict();

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

// GET — 편집용 호 조회(draft 포함)
export async function GET(
  req: Request,
  ctx: { params: { date: string } },
): Promise<Response> {
  if (!verifyBearer(req)) return unauthorized();
  const iso = toIso(ctx.params.date);
  if (iso === null) return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  try {
    const issue = await getIssueAdmin(iso);
    if (!issue) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(issue);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}

// PATCH — intro/outro/status 수정
export async function PATCH(
  req: Request,
  ctx: { params: { date: string } },
): Promise<Response> {
  if (!verifyBearer(req)) return unauthorized();
  const iso = toIso(ctx.params.date);
  if (iso === null) return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = issuePatch.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  try {
    await updateIssueMeta(iso, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}
