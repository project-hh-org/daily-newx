// 날짜 표현 변환.
// - 화면 라벨: "2026.06.16"
// - URL/슬러그: "20260616" (대시 없음)
// - ISO: "2026-06-16"

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const COMPACT_RE = /^(\d{4})(\d{2})(\d{2})$/;

/** 발행 루틴 시각(로컬, 24h). 루틴 변경 시 이 값만 바꾸면 됨. */
export const PUBLISH_HOUR = 9;

/** 지금이 당일 정식 발행 시각 이전인지(로컬 기준). */
export function isBeforePublishTime(now: Date = new Date()): boolean {
  return now.getHours() < PUBLISH_HOUR;
}

export function compactToIso(compact: string): string | undefined {
  const m = compact.match(COMPACT_RE);
  if (!m) return undefined;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

export function isoToCompact(iso: string): string | undefined {
  const m = iso.match(ISO_RE);
  if (!m) return undefined;
  return `${m[1]}${m[2]}${m[3]}`;
}

export function isoToLabel(iso: string): string {
  const m = iso.match(ISO_RE);
  if (!m) return iso;
  return `${m[1]}.${m[2]}.${m[3]}`;
}

/** 로컬 타임존 기준 오늘을 compact("YYYYMMDD")로. */
export function todayCompact(now: Date = new Date()): string {
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${mo}${d}`;
}

/** source_published_at 같은 원문 발행일을 짧게 표기. 파싱 실패 시 원본 반환. */
export function formatSourceDate(value: string): string {
  const iso = ISO_RE.test(value) ? value : undefined;
  if (iso) return isoToLabel(iso);
  return value;
}
