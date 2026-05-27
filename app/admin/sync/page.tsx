"use client";

import { useState } from "react";

interface SyncStatus {
  total: number;
  imported: number;
  remaining: number;
}

interface SyncResult {
  sn: string;
  ok: boolean;
  error?: string;
}

interface SyncResponse {
  total: number;
  remaining: number;
  processed: number;
  results: SyncResult[];
}

export default function SyncPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  async function checkStatus() {
    const res = await fetch("/api/admin/sync");
    const data = (await res.json()) as SyncStatus;
    setStatus(data);
  }

  function addLog(msg: string) {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  async function runSync() {
    setRunning(true);
    addLog("开始同步…");

    let remaining = Infinity;
    let totalImported = 0;

    while (remaining > 0) {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      if (!res.ok) {
        addLog(`请求失败: ${res.status}`);
        break;
      }
      const data = (await res.json()) as SyncResponse;
      remaining = data.remaining;
      totalImported += data.processed;

      for (const r of data.results) {
        if (r.ok) {
          addLog(`✅ 导入成功: ${r.sn}`);
        } else {
          addLog(`❌ 导入失败: ${r.sn} — ${r.error}`);
        }
      }

      addLog(`进度: 本批处理 ${data.processed} 件，还剩 ${remaining} 件`);

      if (data.processed === 0) break; // safety: no progress
    }

    addLog(`✔ 同步完成，共导入 ${totalImported} 件商品`);
    setRunning(false);
    await checkStatus();
  }

  return (
    <div style={{ padding: 32, fontFamily: "monospace", maxWidth: 800 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>商品同步 · LOUIS VUITTON 已上架</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button
          onClick={checkStatus}
          disabled={running}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          查看状态
        </button>
        <button
          onClick={runSync}
          disabled={running}
          style={{
            padding: "8px 16px",
            cursor: running ? "not-allowed" : "pointer",
            background: running ? "#ccc" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          {running ? "同步中…" : "开始同步"}
        </button>
      </div>

      {status && (
        <div
          style={{
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <div>寄售平台在售 LV 商品总数：<strong>{status.total}</strong></div>
          <div>已导入：<strong>{status.imported}</strong></div>
          <div>待导入：<strong>{status.remaining}</strong></div>
        </div>
      )}

      {log.length > 0 && (
        <div
          style={{
            background: "#111",
            color: "#0f0",
            borderRadius: 8,
            padding: 16,
            height: 400,
            overflowY: "auto",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
