"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { Suspense } from "react";

function ListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [query, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const cats = ["", "托特包", "手提包", "单肩包", "水桶包", "双肩包", "旅行袋"];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchProducts();
  }

  return (
    <div className="min-h-screen" style={{ background: "#0d0d0d", color: "#f5f0e8" }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-4">
        <button onClick={() => router.back()} className="mr-3 p-1" style={{ color: "#666" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: "#181818", border: "1px solid #252525" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索款式、货号…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#e8e3db" }}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} style={{ color: "#555" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-5" style={{ scrollbarWidth: "none" }}>
        {cats.map((c) => (
          <button
            key={c || "all"}
            onClick={() => setCategory(c)}
            className="flex-none text-xs tracking-wider px-4 py-2 rounded-full whitespace-nowrap"
            style={{
              border: `1px solid ${category === c ? "#c9a96e" : "#252525"}`,
              color: category === c ? "#c9a96e" : "#555",
              background: category === c ? "rgba(201,169,110,0.08)" : "transparent",
            }}
          >
            {c || "全部"}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: "#141414" }}>
                <div className="aspect-square" style={{ background: "#1a1a1a" }} />
                <div className="p-3 space-y-2">
                  <div className="h-3 rounded" style={{ background: "#222", width: "70%" }} />
                  <div className="h-4 rounded" style={{ background: "#1e1e1e", width: "90%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-cormorant text-3xl font-light mb-3" style={{ color: "#2a2a2a" }}>— 暂无结果 —</p>
            <p className="text-sm" style={{ color: "#444" }}>请尝试其他关键词或类别</p>
          </div>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: "#555" }}>共 {products.length} 件商品</p>
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/listing/${product.id}`} className="block">
      <div className="rounded-xl overflow-hidden" style={{ background: "#141414" }}>
        <div className="aspect-square relative overflow-hidden" style={{ background: "#1a1a1a" }}>
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.styleNameZh} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-cormorant text-3xl font-light" style={{ color: "#2a2a2a" }}>LV</span>
            </div>
          )}
          <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e" }}>
            {product.condition}
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs mb-0.5 truncate" style={{ color: "#5a5650" }}>
            {product.styleName}{product.modelSize && ` · ${product.modelSize}`}
          </p>
          <p className="text-sm font-medium leading-snug truncate" style={{ color: "#e8e3db" }}>
            {product.styleNameZh}
          </p>
          <p className="mt-2 font-cormorant text-xl" style={{ color: "#c9a96e" }}>
            ¥{product.askingPrice.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function ListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#0d0d0d" }} />}>
      <ListingContent />
    </Suspense>
  );
}
