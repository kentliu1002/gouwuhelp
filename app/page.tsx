"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 4);

  return (
    <div className="min-h-screen" style={{ background: "#0d0d0d", color: "#f5f0e8" }}>
      {/* Header */}
      <header className="relative pt-14 pb-6 px-6 text-center">
        <div className="text-xs tracking-[0.4em] mb-3" style={{ color: "#c9a96e" }}>
          LOUIS VUITTON · MONOGRAM
        </div>
        <h1 className="font-cormorant text-5xl font-light tracking-wide mb-2">奢寄</h1>
        <p className="text-xs tracking-widest" style={{ color: "#6a6460" }}>
          精选二手老花包袋
        </p>
        <div className="gold-line mt-8" />
      </header>

      {/* Search entry */}
      <div className="px-4 pb-6">
        <Link
          href="/listing"
          className="flex items-center gap-3 rounded-full px-5 py-3.5 text-sm"
          style={{ background: "#181818", color: "#6a6460", border: "1px solid #252525" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          搜索款式、货号…
        </Link>
      </div>

      {/* Category pills */}
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-7" style={{ scrollbarWidth: "none" }}>
        {["全部", "托特包", "手提包", "单肩包", "水桶包", "双肩包", "旅行袋"].map((c) => (
          <Link
            key={c}
            href={c === "全部" ? "/listing" : `/listing?category=${encodeURIComponent(c)}`}
            className="flex-none text-xs tracking-wider px-4 py-2 rounded-full whitespace-nowrap"
            style={{ border: "1px solid #252525", color: "#6a6460" }}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* Featured grid */}
      {!loading && featured.length > 0 && (
        <section className="px-4 pb-8">
          <div className="flex items-center justify-between mb-5">
            <span className="font-cormorant text-xl font-light" style={{ color: "#c9a96e" }}>
              精选在售
            </span>
            <Link href="/listing" className="text-xs tracking-wider" style={{ color: "#555" }}>
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 px-8 text-center">
          <div className="font-cormorant text-6xl font-light mb-6" style={{ color: "#1e1e1e" }}>LV</div>
          <p className="text-sm mb-1" style={{ color: "#444" }}>暂无在售商品</p>
          <p className="text-xs" style={{ color: "#333" }}>请稍后再来</p>
        </div>
      )}

      {/* Brand story */}
      <div className="px-6 py-8 text-center">
        <div className="gold-line mb-8" />
        <p className="font-cormorant text-xl font-light italic mb-2" style={{ color: "#4a4640" }}>
          &ldquo;Crafted for the journey of life&rdquo;
        </p>
        <p className="text-xs tracking-widest" style={{ color: "#333" }}>LOUIS VUITTON · EST. 1854</p>
      </div>

      {/* Seller entry */}
      <div className="px-4 pb-14 text-center">
        <div className="gold-line mb-8" />
        <Link
          href="/seller"
          className="inline-block text-xs tracking-[0.35em] px-8 py-3 rounded border"
          style={{ borderColor: "#2a2a2a", color: "#555" }}
        >
          卖家入口 →
        </Link>
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
          <div
            className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e" }}
          >
            {product.condition}
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs mb-0.5 truncate" style={{ color: "#5a5650" }}>
            {product.styleName}
            {product.modelSize && ` · ${product.modelSize}`}
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
