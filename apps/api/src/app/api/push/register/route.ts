import { NextResponse } from "next/server";
import { z } from "zod";
import { savePushToken } from "@/services/pushRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 네이티브 앱에서만 호출(웹은 Expo push 토큰 없음) → 브라우저 CORS 대상 아님.
const bodySchema = z
  .object({
    token: z
      .string()
      .min(1)
      .refine(
        (t) => t.startsWith("ExponentPushToken") || t.startsWith("ExpoPushToken"),
        "invalid expo push token",
      ),
    platform: z.string().max(16).nullable().optional(),
  })
  .strict();

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  try {
    await savePushToken(parsed.data.token, parsed.data.platform ?? null);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}
