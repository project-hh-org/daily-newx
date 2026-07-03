import { describe, it, expect } from "vitest";
import {
  compactToIso,
  isoToCompact,
  isoToLabel,
  todayCompact,
  formatSourceDate,
  isBeforePublishTime,
  PUBLISH_HOUR,
} from "@/lib/date";

describe("날짜 변환", () => {
  it("compactToIso: 유효/무효", () => {
    expect(compactToIso("20260616")).toBe("2026-06-16");
    expect(compactToIso("2026-06-16")).toBeUndefined();
    expect(compactToIso("bad")).toBeUndefined();
  });

  it("isoToCompact: 유효/무효", () => {
    expect(isoToCompact("2026-06-16")).toBe("20260616");
    expect(isoToCompact("20260616")).toBeUndefined();
  });

  it("isoToLabel: 점 표기, 실패 시 원본", () => {
    expect(isoToLabel("2026-06-16")).toBe("2026.06.16");
    expect(isoToLabel("nope")).toBe("nope");
  });

  it("todayCompact: 로컬 날짜 YYYYMMDD (월 0-기반 보정)", () => {
    expect(todayCompact(new Date(2026, 5, 6))).toBe("20260606");
    expect(todayCompact(new Date(2026, 11, 25))).toBe("20261225");
  });

  it("formatSourceDate: ISO만 변환", () => {
    expect(formatSourceDate("2026-06-16")).toBe("2026.06.16");
    expect(formatSourceDate("어제")).toBe("어제");
  });
});

describe("발행 시각", () => {
  it("PUBLISH_HOUR = 9", () => {
    expect(PUBLISH_HOUR).toBe(9);
  });

  it("isBeforePublishTime: 9시 경계", () => {
    expect(isBeforePublishTime(new Date(2026, 5, 24, 8, 59))).toBe(true);
    expect(isBeforePublishTime(new Date(2026, 5, 24, 9, 0))).toBe(false);
    expect(isBeforePublishTime(new Date(2026, 5, 24, 23, 30))).toBe(false);
  });
});
