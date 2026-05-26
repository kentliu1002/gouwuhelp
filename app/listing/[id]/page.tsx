"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: Product | null) => setProduct(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
        <div className="font-cormorant text-2xl font-light" style={{ color: "#2a2a2a" }}>LV</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#0d0d0d", color: "#555" }}>
        <p className="mb-4">商品不存在</p>
        <Link href="/listing" style={{ color: "#c9a96e" }}>← 返回列表</Link>
      </div>
    );
  }

  const hasRetailPrice = product.retailPrice && product.retailPrice > 0;
  const discount = hasRetailPrice ? Math.round((product.askingPrice / product.retailPrice!) * 100) : null;

  return (
    <div className="min-h-screen" style={{ background: "#0d0d0d", color: "#f5f0e8" }}>
      {/* Back button */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center px-4 pt-12">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
      </div>

      {/* Image gallery */}
      <div className="relative" style={{ background: "#111" }}>
        <div className="aspect-square overflow-hidden">
          {product.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[imgIndex]}
              alt={product.styleNameZh}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-cormorant text-6xl font-light" style={{ color: "#1e1e1e" }}>LV</span>
            </div>
          )}
        </div>
        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: "none", background: "#0d0d0d" }}>
            {product.images.map((url, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className="flex-none w-16 h-16 rounded-lg overflow-hidden"
                style={{ border: `1.5px solid ${i === imgIndex ? "#c9a96e" : "#252525"}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="px-5 pt-6 pb-16">
        {/* Title */}
        <div className="mb-1">
          <span className="text-xs tracking-wider" style={{ color: "#c9a96e" }}>
            LOUIS VUITTON · MONOGRAM
          </span>
        </div>
        <h1 className="font-cormorant text-3xl font-light mb-1">
          {product.styleNameZh}
          {product.modelSize && <span style={{ color: "#888" }}> {product.modelSize}</span>}
        </h1>
        <p className="text-sm mb-4" style={{ color: "#666" }}>{product.styleName}</p>

        {/* Price */}
        <div className="flex items-end gap-3 mb-1">
          <span className="font-cormorant text-4xl font-light" style={{ color: "#c9a96e" }}>
            ¥{product.askingPrice.toLocaleString()}
          </span>
          {discount && discount < 100 && (
            <span className="text-xs mb-2 px-2 py-0.5 rounded" style={{ background: "rgba(201,169,110,0.1)", color: "#c9a96e" }}>
              {discount}折
            </span>
          )}
        </div>
        {hasRetailPrice && (
          <p className="text-xs mb-6" style={{ color: "#444" }}>
            官方参考价 ¥{product.retailPrice!.toLocaleString()}
          </p>
        )}

        <div className="gold-line mb-6" />

        {/* Condition & Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Tag gold>{product.condition}</Tag>
          {product.hasDustBag && <Tag>含防尘袋</Tag>}
          {product.hasBox && <Tag>含原盒</Tag>}
          {product.hasReceipt && <Tag>含购物凭证</Tag>}
          {product.lockKeyStatus !== "无" && <Tag>锁头钥匙{product.lockKeyStatus === "仅有锁头" ? "（仅锁头）" : ""}</Tag>}
        </div>

        {/* Description */}
        {product.description && (
          <div className="mb-6">
            <h3 className="font-cormorant text-lg font-light mb-3" style={{ color: "#c9a96e" }}>商品描述</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#b0aba3" }}>{product.description}</p>
          </div>
        )}

        {/* Promotional copy */}
        {product.promotionalCopy && (
          <div className="rounded-xl p-4 mb-6" style={{ background: "rgba(201,169,110,0.05)", border: "1px solid rgba(201,169,110,0.2)" }}>
            <p className="text-sm leading-relaxed font-cormorant italic text-lg" style={{ color: "#c9a96e" }}>
              &ldquo;{product.promotionalCopy}&rdquo;
            </p>
          </div>
        )}

        <div className="gold-line mb-6" />

        {/* SKU Details */}
        <h3 className="font-cormorant text-lg font-light mb-4" style={{ color: "#c9a96e" }}>商品详情</h3>
        <div className="space-y-3">
          <DetailRow label="品牌" value="Louis Vuitton · 路易威登" />
          <DetailRow label="系列" value="Monogram Canvas · 经典老花" />
          <DetailRow label="款式" value={`${product.styleNameZh} (${product.styleName})`} />
          {product.modelSize && <DetailRow label="尺寸规格" value={product.modelSize} />}
          {product.modelNumber && <DetailRow label="货号" value={product.modelNumber} />}
          {product.dimensions && <DetailRow label="包尺寸" value={product.dimensions} />}
          <DetailRow label="五金颜色" value={product.hardwareColor} />
          <DetailRow label="皮革配件" value={product.leatherColor} />
          <DetailRow label="开合方式" value={product.closureType} />
        </div>

        <div className="gold-line my-6" />

        {/* Condition details */}
        <h3 className="font-cormorant text-lg font-light mb-4" style={{ color: "#c9a96e" }}>成色说明</h3>
        <div className="space-y-3">
          <DetailRow label="整体成色" value={product.condition} highlight />
          <DetailRow label="手柄状态" value={product.handleCondition} />
          <DetailRow label="五金状态" value={product.hardwareCondition} />
          <DetailRow label="包体外观" value={product.exteriorCondition} />
          <DetailRow label="包底状态" value={product.bottomCondition} />
          <DetailRow label="内里状态" value={product.interiorCondition} />
          <DetailRow label="翻新情况" value={product.refurbishStatus} />
          {product.purchaseChannel && <DetailRow label="购买渠道" value={product.purchaseChannel} />}
          {product.purchaseYear && <DetailRow label="购买年份" value={`${product.purchaseYear}年`} />}
          <DetailRow label="鉴定状态" value={product.authStatus} />
        </div>
      </div>
    </div>
  );
}

function Tag({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span
      className="text-xs px-3 py-1 rounded-full"
      style={gold
        ? { background: "rgba(201,169,110,0.15)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }
        : { background: "#181818", color: "#888", border: "1px solid #252525" }
      }
    >
      {children}
    </span>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-xs w-24 flex-none" style={{ color: "#555" }}>{label}</span>
      <span className="text-sm text-right" style={{ color: highlight ? "#c9a96e" : "#b0aba3" }}>{value}</span>
    </div>
  );
}
