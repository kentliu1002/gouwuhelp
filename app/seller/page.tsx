"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function SellerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?all=true")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function toggleAvailability(id: string, isAvailable: boolean) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !isAvailable }),
    });
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isAvailable: !isAvailable } : p));
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除这件商品？")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen" style={{ background: "#f7f6f4" }}>
      {/* Header */}
      <div className="bg-white border-b px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">商品管理</h1>
          <Link
            href="/seller/new"
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-white"
            style={{ background: "#1a1a1a" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            录入新商品
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 pt-4 pb-2">
        {[
          { label: "在售", value: products.filter((p) => p.isAvailable).length },
          { label: "全部", value: products.length },
          { label: "已下架", value: products.filter((p) => !p.isAvailable).length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Product list */}
      <div className="px-4 pt-4 pb-20 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
          ))
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">还没有商品，点击右上角开始录入</p>
            <Link href="/seller/new" className="text-sm font-medium" style={{ color: "#1a1a1a" }}>
              + 录入第一件商品
            </Link>
          </div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl overflow-hidden flex">
              <div className="w-20 h-20 flex-none" style={{ background: "#f0ede8" }}>
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg font-light" style={{ fontFamily: "serif" }}>LV</div>
                )}
              </div>
              <div className="flex-1 p-3 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.styleNameZh} {p.modelSize}</p>
                    <p className="text-xs text-gray-400 truncate">{p.condition} · {p.modelNumber}</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: "#c9a96e" }}>
                      ¥{p.askingPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-none">
                    <button
                      onClick={() => toggleAvailability(p.id, p.isAvailable)}
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: p.isAvailable ? "#e8f5e9" : "#f5f5f5",
                        color: p.isAvailable ? "#388e3c" : "#999",
                      }}
                    >
                      {p.isAvailable ? "在售" : "已下架"}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: "#fff0f0", color: "#e53935" }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xs text-gray-400">← 买家端</Link>
        <Link href="/seller/new" className="text-xs font-medium" style={{ color: "#1a1a1a" }}>
          + 录入新商品
        </Link>
      </div>
    </div>
  );
}
