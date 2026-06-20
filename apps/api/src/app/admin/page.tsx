"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";

type AdminItem = {
  id: string;
  category: string;
  position: number;
  title: string;
  summary: string;
  tldr: string | null;
};
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
      setMsg(`불러옴 — ${json.items.length}건`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "에러");
    }
  }, [date, token, auth]);

  const patchItem = async (item: AdminItem): Promise<void> => {
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
      }),
    });
    setMsg(res.ok ? "저장됨" : `저장 실패 (HTTP ${res.status})`);
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

          {data.items.map((it) => (
            <section
              key={it.id}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginTop: 12 }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
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
