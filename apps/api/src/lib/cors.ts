import { NextResponse } from "next/server";

// 공개 읽기 라우트용 CORS — 웹 리더(다른 origin)의 GET 허용.
export const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "accept, content-type, if-none-match",
  // 브라우저 fetch 가 조건부 재검증(If-None-Match)에 쓸 수 있도록 ETag 를 노출.
  "access-control-expose-headers": "etag",
};

export function corsJson(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): NextResponse {
  return NextResponse.json(body, { status, headers: { ...CORS_HEADERS, ...extraHeaders } });
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
