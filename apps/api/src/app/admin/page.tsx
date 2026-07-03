"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";

type AdminItem = {
  id: string;
  category: string;
  position: number;
  title: string;
  summary: string;
  tldr: string | null;
  blocks: unknown[];
};

const BLOCK_TYPES =
  "heading·paragraph·bullets·numbered·quote·stat·callout·definition·table·timeline·prosCons·code·embed·image·divider";
type AdminIssue = {
  issue_date: string;
  issue_no: number | null;
  intro: string | null;
  outro: string | null;
  status: string;
};
type AdminData = { issue: AdminIssue; items: AdminItem[] };

const CATEGORIES = ["headline", "release", "paper", "community", "business"] as const;
const TOKEN_KEY = "daily-newx-admin-token";

function todayIso(): string {
  const d = new Date();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mo}-${da}`;
}

export default function AdminPage(): ReactElement {
  const [token, setToken] = useState("");
  const [date, setDate] = useState(todayIso());
  const [data, setData] = useState<AdminData | null>(null);
  const [msg, setMsg] = useState("");
  // 항목별 blocks JSON 편집 초안(id → JSON 문자열)과 원본(변경분만 저장 판단용).
  const [blocksDraft, setBlocksDraft] = useState<Record<string, string>>({});
  const [blocksOrig, setBlocksOrig] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (saved) setToken(saved);
  }, []);

  const auth = useCallback(
    (extra?: Record<string, string>): Record<string, string> => ({
      authorization: `Bearer ${token}`,
      ...(extra ?? {}),
    }),
    [token],
  );

  const load = useCallback(async (): Promise<void> => {
    setMsg("불러오는 중…");
    window.localStorage.setItem(TOKEN_KEY, token);
    try {
      const res = await fetch(`/api/admin/issue/${date}`, { headers: auth() });
      if (!res.ok) {
        setMsg(`로드 실패 (HTTP ${res.status})`);
        setData(null);
        return;
      }
      const json = (await res.json()) as AdminData;
      setData(json);
      const drafts: Record<string, string> = {};
      for (const it of json.items) {
        drafts[it.id] = JSON.stringify(it.blocks ?? [], null, 2);
      }
      setBlocksDraft(drafts);
      setBlocksOrig(drafts);
      setMsg(`불러옴 — ${json.items.length}건`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "에러");
    }
  }, [date, token, auth]);

  const formatBlocks = (id: string): void => {
    const draft = blocksDraft[id] ?? "[]";
    try {
      const pretty = JSON.stringify(JSON.parse(draft), null, 2);
      setBlocksDraft((d) => ({ ...d, [id]: pretty }));
      setMsg("블록 포맷됨");
    } catch {
      setMsg("블록 JSON 오류 — 포맷할 수 없습니다");
    }
  };

  const patchItem = async (item: AdminItem): Promise<void> => {
    // blocks 는 변경됐을 때만 포함(미변경 항목의 불필요한 재검증 방지).
    const draft = blocksDraft[item.id];
    let blocks: unknown[] | undefined;
    if (draft !== undefined && draft !== blocksOrig[item.id]) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(draft);
      } catch {
        setMsg("블록 JSON 파싱 실패 — 형식을 확인하세요");
        return;
      }
      if (!Array.isArray(parsed)) {
        setMsg("블록은 JSON 배열이어야 합니다");
        return;
      }
      blocks = parsed;
    }

    setMsg("저장 중…");
    const res = await fetch(`/api/admin/item/${item.id}`, {
      method: "PATCH",
      headers: auth({ "content-type": "application/json" }),
      body: JSON.stringify({
        title: item.title,
        summary: item.summary,
        tldr: item.tldr,
        category: item.category,
        position: item.position,
        ...(blocks !== undefined ? { blocks } : {}),
      }),
    });
    if (res.ok) {
      if (blocks !== undefined) {
        setBlocksOrig((o) => ({ ...o, [item.id]: draft }));
      }
      setMsg("저장됨");
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setMsg(`저장 실패 (HTTP ${res.status})${j.error ? ` — ${j.error}` : ""}`);
    }
  };

  const removeItem = async (id: string): Promise<void> => {
    if (!window.confirm("이 항목을 삭제할까요?")) return;
    const res = await fetch(`/api/admin/item/${id}`, { method: "DELETE", headers: auth() });
    if (res.ok) {
      setMsg("삭제됨");
      await load();
    } else {
      setMsg(`삭제 실패 (HTTP ${res.status})`);
    }
  };

  const patchIssue = async (): Promise<void> => {
    if (!data) return;
    setMsg("호 저장 중…");
    const res = await fetch(`/api/admin/issue/${date}`, {
      method: "PATCH",
      headers: auth({ "content-type": "application/json" }),
      body: JSON.stringify({
        intro: data.issue.intro,
        outro: data.issue.outro,
        status: data.issue.status,
      }),
    });
    setMsg(res.ok ? "호 저장됨" : `호 저장 실패 (HTTP ${res.status})`);
  };

  const move = async (item: AdminItem, dir: -1 | 1): Promise<void> => {
    if (data === null) return;
    const sameCat = data.items
      .filter((i) => i.category === item.category)
      .sort((a, b) => a.position - b.position);
    const idx = sameCat.findIndex((i) => i.id === item.id);
    const j = idx + dir;
    const a = sameCat[idx];
    const b = sameCat[j];
    if (a === undefined || b === undefined) return;
    const pa = a.position;
    const pb = b.position;
    setItem(a.id, { position: pb });
    setItem(b.id, { position: pa });
    setMsg("재정렬 중…");
    const res = await fetch(`/api/admin/reorder`, {
      method: "POST",
      headers: auth({ "content-type": "application/json" }),
      body: JSON.stringify({
        orders: [
          { id: a.id, position: pb },
          { id: b.id, position: pa },
        ],
      }),
    });
    setMsg(res.ok ? "재정렬됨" : `재정렬 실패 (HTTP ${res.status})`);
  };

  const setItem = (id: string, patch: Partial<AdminItem>): void => {
    setData((d) =>
      d === null
        ? d
        : { ...d, items: d.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) },
    );
  };

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 22 }}>daily-newx 어드민</h1>
      <p style={{ color: "#666", fontSize: 13 }}>
        INGEST_TOKEN 으로 인증. 게시는 루틴이 자동(여기선 수동 보정·삭제·재정렬·게시 토글).
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
        <input
          type="password"
          placeholder="INGEST_TOKEN"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ flex: 1, minWidth: 240, padding: 8 }}
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: 8 }} />
        <button onClick={() => void load()} style={{ padding: "8px 16px" }}>
          불러오기
        </button>
      </div>
      <div style={{ color: "#b23a24", fontSize: 13, minHeight: 18 }}>{msg}</div>

      {data !== null && (
        <>
          <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginTop: 16 }}>
            <strong>
              호 {data.issue.issue_date} (제{data.issue.issue_no ?? "?"}호)
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <textarea
                placeholder="intro"
                value={data.issue.intro ?? ""}
                onChange={(e) =>
                  setData((d) => (d ? { ...d, issue: { ...d.issue, intro: e.target.value } } : d))
                }
                rows={2}
              />
              <textarea
                placeholder="outro"
                value={data.issue.outro ?? ""}
                onChange={(e) =>
                  setData((d) => (d ? { ...d, issue: { ...d.issue, outro: e.target.value } } : d))
                }
                rows={2}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={data.issue.status}
                  onChange={(e) =>
                    setData((d) => (d ? { ...d, issue: { ...d.issue, status: e.target.value } } : d))
                  }
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </select>
                <button onClick={() => void patchIssue()}>호 저장</button>
              </div>
            </div>
          </section>

          {[...data.items]
            .sort((a, b) => a.category.localeCompare(b.category) || a.position - b.position)
            .map((it) => (
            <section
              key={it.id}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginTop: 12 }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <select value={it.category} onChange={(e) => setItem(it.id, { category: e.target.value })}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={it.position}
                  onChange={(e) => setItem(it.id, { position: Number(e.target.value) })}
                  style={{ width: 70 }}
                  title="position (정렬 순서)"
                />
                <button onClick={() => void move(it, -1)} title="위로">
                  ▲
                </button>
                <button onClick={() => void move(it, 1)} title="아래로">
                  ▼
                </button>
              </div>
              <input
                value={it.title}
                onChange={(e) => setItem(it.id, { title: e.target.value })}
                placeholder="title"
                style={{ width: "100%", padding: 6, marginBottom: 6 }}
              />
              <textarea
                value={it.tldr ?? ""}
                onChange={(e) => setItem(it.id, { tldr: e.target.value })}
                placeholder="tldr (한 줄)"
                rows={1}
                style={{ width: "100%", marginBottom: 6 }}
              />
              <textarea
                value={it.summary}
                onChange={(e) => setItem(it.id, { summary: e.target.value })}
                placeholder="summary"
                rows={3}
                style={{ width: "100%", marginBottom: 6 }}
              />
              <details style={{ marginBottom: 6 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, color: "#555" }}>
                  본문 블록 (blocks) — {Array.isArray(it.blocks) ? it.blocks.length : 0}개
                  {blocksDraft[it.id] !== blocksOrig[it.id] ? " · 수정됨" : ""}
                </summary>
                <textarea
                  value={blocksDraft[it.id] ?? ""}
                  onChange={(e) => setBlocksDraft((d) => ({ ...d, [it.id]: e.target.value }))}
                  spellCheck={false}
                  rows={12}
                  placeholder='[{"type":"paragraph","text":"..."}]'
                  style={{ width: "100%", marginTop: 6, fontFamily: "monospace", fontSize: 12 }}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                  <button type="button" onClick={() => formatBlocks(it.id)}>
                    포맷
                  </button>
                  <span style={{ fontSize: 11, color: "#999" }}>type: {BLOCK_TYPES}</span>
                </div>
              </details>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => void patchItem(it)}>저장</button>
                <button onClick={() => void removeItem(it.id)} style={{ color: "#b23a24" }}>
                  삭제
                </button>
              </div>
            </section>
          ))}
        </>
      )}
    </main>
  );
}
