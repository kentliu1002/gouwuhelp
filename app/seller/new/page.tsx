"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LV_STYLES } from "@/lib/lv-data";
import type {
  Condition, HardwareColor, LeatherColor, HandleType, ClosureType,
  HandleCondition, HardwareCondition, ExteriorCondition, BottomCondition,
  InteriorCondition, RefurbishStatus, PurchaseChannel, AuthStatus,
  LockKeyStatus, StrapStatus,
} from "@/lib/types";
import type { IdentifyResult } from "@/lib/ai";

const STEPS = ["上传照片", "AI 识别", "选择款型", "商品成色", "配件状态", "瑕疵详情", "定价发布"];
const STEP_COUNT = STEPS.length;

export default function NewProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [images, setImages] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState<IdentifyResult | null>(null);
  const [styleName, setStyleName] = useState("");
  const [modelSize, setModelSize] = useState("");
  const [handleType, setHandleType] = useState<HandleType>("双手提");
  const [closureType, setClosureType] = useState<ClosureType>("拉链");
  const [hasLock, setHasLock] = useState(false);
  const [leatherColor, setLeatherColor] = useState<LeatherColor>("原色皮（浅蜂蜜色）");
  const [hardwareColor, setHardwareColor] = useState<HardwareColor>("金色");
  const [condition, setCondition] = useState<Condition>("95新");
  const [hasDustBag, setHasDustBag] = useState(false);
  const [hasBox, setHasBox] = useState(false);
  const [hasReceipt, setHasReceipt] = useState(false);
  const [lockKeyStatus, setLockKeyStatus] = useState<LockKeyStatus>("无");
  const [strapStatus, setStrapStatus] = useState<StrapStatus>("无肩带");
  const [handleCondition, setHandleCondition] = useState<HandleCondition>("无瑕疵");
  const [hardwareCondition, setHardwareCondition] = useState<HardwareCondition>("无瑕疵");
  const [exteriorCondition, setExteriorCondition] = useState<ExteriorCondition>("无瑕疵");
  const [bottomCondition, setBottomCondition] = useState<BottomCondition>("无磨损");
  const [interiorCondition, setInteriorCondition] = useState<InteriorCondition>("无瑕疵");
  const [refurbishStatus, setRefurbishStatus] = useState<RefurbishStatus>("未翻新");
  const [purchaseChannel, setPurchaseChannel] = useState<PurchaseChannel>("国内官方专柜");
  const [purchaseYear, setPurchaseYear] = useState<number | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("未鉴定");
  const [askingPrice, setAskingPrice] = useState("");

  const selectedStyle = LV_STYLES.find((s) => s.nameEn === styleName);
  const selectedSize = selectedStyle?.sizes.find((s) => s.label === modelSize);
  const styleNameZh = selectedStyle?.nameZh ?? "";

  async function handleUpload(files: FileList) {
    setUploading(true);
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const { urls } = await res.json();
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  async function handleIdentify() {
    if (!images.length) return;
    setIdentifying(true);
    try {
      const res = await fetch("/api/ai/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls: images }),
      });
      const result: IdentifyResult = await res.json();
      setAiResult(result);
      // Auto-fill from AI result
      const matched = LV_STYLES.find(
        (s) => s.nameEn.toLowerCase().includes(result.styleName.toLowerCase()) ||
               result.styleName.toLowerCase().includes(s.nameEn.toLowerCase())
      );
      if (matched) {
        setStyleName(matched.nameEn);
        if (matched.sizes.length === 1) setModelSize(matched.sizes[0].label);
      }
      if (result.handleType) setHandleType(result.handleType as HandleType);
      if (result.closureType) setClosureType(result.closureType as ClosureType);
      if (typeof result.hasLock === "boolean") setHasLock(result.hasLock);
      if (result.leatherColor) setLeatherColor(result.leatherColor as LeatherColor);
      if (result.hardwareColor) setHardwareColor(result.hardwareColor as HardwareColor);
    } catch {
      // ignore
    }
    setIdentifying(false);
    setStep(2);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setGenerating(true);
    const price = parseInt(askingPrice.replace(/,/g, ""));

    // Generate AI description
    let description = "";
    let promotionalCopy = "";
    try {
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styleName, styleNameZh, modelSize,
          modelNumber: selectedSize?.modelNumber ?? "",
          dimensions: selectedSize?.dimensions ?? "",
          condition, askingPrice: price,
          retailPrice: selectedSize?.retailPrice ?? null,
          hasDustBag, hasBox, hasReceipt,
          handleCondition, hardwareCondition, exteriorCondition,
          bottomCondition, interiorCondition, refurbishStatus, purchaseChannel,
        }),
      });
      const gen = await res.json();
      description = gen.description ?? "";
      promotionalCopy = gen.promotionalCopy ?? "";
    } catch { /* continue without description */ }
    setGenerating(false);

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isAvailable: true, images, styleName, styleNameZh,
        handleType, closureType, hasLock, leatherColor, hardwareColor,
        modelSize, modelNumber: selectedSize?.modelNumber ?? "",
        dimensions: selectedSize?.dimensions ?? "",
        retailPrice: selectedSize?.retailPrice ?? null,
        isDiscontinued: selectedStyle?.isDiscontinued ?? false,
        condition, hasDustBag, hasBox, hasReceipt,
        lockKeyStatus, strapStatus,
        handleCondition, hardwareCondition, exteriorCondition,
        bottomCondition, interiorCondition, refurbishStatus,
        purchaseChannel, purchaseYear, authStatus,
        description, promotionalCopy, askingPrice: price,
      }),
    });

    setSubmitting(false);
    router.push("/seller");
  }

  const progress = ((step + 1) / STEP_COUNT) * 100;

  return (
    <div className="min-h-screen" style={{ background: "#f7f6f4" }}>
      {/* Header */}
      <div className="bg-white border-b px-4 pt-12 pb-3 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} className="p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-0.5">步骤 {step + 1} / {STEP_COUNT}</p>
            <p className="text-sm font-semibold text-gray-900">{STEPS[step]}</p>
          </div>
        </div>
        <div className="h-1 rounded-full" style={{ background: "#f0ede8" }}>
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "#c9a96e" }}
          />
        </div>
      </div>

      <div className="px-4 py-6 pb-32">
        {/* Step 0: Upload */}
        {step === 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-4">请上传包袋的多角度照片（正面、侧面、底部、内里、五金细节），照片越多识别越准确</p>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed rounded-xl py-10 text-center mb-4"
              style={{ borderColor: "#e0dbd3", color: "#aaa" }}
            >
              {uploading ? (
                <span>上传中…</span>
              ) : (
                <>
                  <div className="text-3xl mb-2">📷</div>
                  <div className="text-sm">点击选择照片</div>
                  <div className="text-xs mt-1" style={{ color: "#ccc" }}>支持多选，建议 4-8 张</div>
                </>
              )}
            </button>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {images.map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden relative" style={{ background: "#e8e4df" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ background: "rgba(0,0,0,0.5)", fontSize: "10px" }}
                    >×</button>
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-lg flex items-center justify-center"
                  style={{ background: "#ebe8e3", color: "#bbb" }}
                >+</button>
              </div>
            )}
          </div>
        )}

        {/* Step 1: AI Identify */}
        {step === 1 && (
          <div className="text-center py-8">
            {aiResult ? (
              <div>
                <div className="text-4xl mb-3">✅</div>
                <p className="text-base font-semibold text-gray-800 mb-1">识别完成</p>
                <p className="text-sm text-gray-500 mb-4">置信度：{aiResult.confidence}</p>
                <div className="bg-white rounded-xl p-4 text-left space-y-3">
                  <InfoRow label="识别款式" value={`${aiResult.styleName} / ${aiResult.styleNameZh}`} />
                  <InfoRow label="手柄类型" value={aiResult.handleType} />
                  <InfoRow label="开合方式" value={aiResult.closureType} />
                  <InfoRow label="五金颜色" value={aiResult.hardwareColor} />
                  <InfoRow label="皮革颜色" value={aiResult.leatherColor} />
                </div>
                <p className="text-xs text-gray-400 mt-4">以上信息可在下一步手动修改</p>
              </div>
            ) : identifying ? (
              <div>
                <div className="text-4xl mb-4 animate-spin">🔄</div>
                <p className="text-sm text-gray-500">AI 正在识别包袋款型，请稍候…</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-base font-semibold text-gray-800 mb-2">AI 自动识别</p>
                <p className="text-sm text-gray-500 mb-6">已上传 {images.length} 张照片，点击开始识别</p>
                <button
                  onClick={handleIdentify}
                  className="w-full py-4 rounded-xl text-white font-medium"
                  style={{ background: "#1a1a1a" }}
                >
                  开始 AI 识别
                </button>
                <button onClick={() => setStep(2)} className="w-full py-3 mt-2 text-sm text-gray-400">
                  跳过，手动填写 →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Style selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">款式名称 *</label>
              <select
                value={styleName}
                onChange={(e) => { setStyleName(e.target.value); setModelSize(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white"
              >
                <option value="">请选择款式</option>
                {LV_STYLES.map((s) => (
                  <option key={s.nameEn} value={s.nameEn}>
                    {s.nameZh} ({s.nameEn}){s.isDiscontinued ? " [停产]" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedStyle && selectedStyle.sizes.length > 1 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">尺寸/型号 *</label>
                <div className="flex flex-wrap gap-2">
                  {selectedStyle.sizes.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setModelSize(s.label)}
                      className="px-4 py-2 rounded-full text-sm border"
                      style={{
                        borderColor: modelSize === s.label ? "#1a1a1a" : "#e5e7eb",
                        background: modelSize === s.label ? "#1a1a1a" : "white",
                        color: modelSize === s.label ? "white" : "#374151",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedSize && (
              <div className="bg-white rounded-xl p-4 space-y-2">
                <InfoRow label="货号" value={selectedSize.modelNumber} />
                <InfoRow label="包尺寸" value={selectedSize.dimensions} />
                {selectedSize.retailPrice && <InfoRow label="参考零售价" value={`¥${selectedSize.retailPrice.toLocaleString()}`} />}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">手柄/背带类型</label>
              <div className="flex flex-wrap gap-2">
                {(["双手提", "单肩带", "斜挎带", "双肩背", "腰带", "双手提+肩带", "手提+斜挎带"] as HandleType[]).map((v) => (
                  <Chip key={v} active={handleType === v} onClick={() => setHandleType(v)}>{v}</Chip>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">开合方式</label>
              <div className="flex flex-wrap gap-2">
                {(["拉链", "搭扣", "磁扣", "敞口"] as ClosureType[]).map((v) => (
                  <Chip key={v} active={closureType === v} onClick={() => setClosureType(v)}>{v}</Chip>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">五金颜色</label>
                <div className="flex gap-2">
                  {(["金色", "银色"] as HardwareColor[]).map((v) => (
                    <Chip key={v} active={hardwareColor === v} onClick={() => setHardwareColor(v)}>{v}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">是否有锁扣</label>
                <div className="flex gap-2">
                  <Chip active={hasLock} onClick={() => setHasLock(true)}>有</Chip>
                  <Chip active={!hasLock} onClick={() => setHasLock(false)}>无</Chip>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">皮革配件颜色</label>
              <div className="flex flex-wrap gap-2">
                {(["原色皮（浅蜂蜜色）", "深色氧化皮（深棕）"] as LeatherColor[]).map((v) => (
                  <Chip key={v} active={leatherColor === v} onClick={() => setLeatherColor(v)}>{v}</Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Condition */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">整体成色 *</label>
              <p className="text-xs text-gray-400 mb-3">请根据包袋实际使用情况如实选择</p>
              <div className="space-y-2">
                {([
                  { v: "全新", desc: "从未使用，仍带原始包装或标签" },
                  { v: "99新", desc: "几乎全新，极少使用，无明显痕迹" },
                  { v: "95新", desc: "轻度使用，可能有轻微氧化或极细微痕迹" },
                  { v: "90新及以下", desc: "明显使用痕迹，价格相对更低" },
                ] as { v: Condition; desc: string }[]).map(({ v, desc }) => (
                  <button
                    key={v}
                    onClick={() => setCondition(v)}
                    className="w-full rounded-xl p-4 text-left border-2"
                    style={{
                      borderColor: condition === v ? "#c9a96e" : "#e5e7eb",
                      background: condition === v ? "rgba(201,169,110,0.05)" : "white",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: condition === v ? "#c9a96e" : "#111" }}>{v}</span>
                      {condition === v && <span style={{ color: "#c9a96e" }}>✓</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Accessories */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-3">配件情况（可多选）</label>
              <div className="space-y-2">
                {[
                  { label: "防尘袋", value: hasDustBag, set: setHasDustBag },
                  { label: "原装盒子", value: hasBox, set: setHasBox },
                  { label: "购物小票/发票", value: hasReceipt, set: setHasReceipt },
                ].map(({ label, value, set }) => (
                  <button
                    key={label}
                    onClick={() => set(!value)}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-xl border-2"
                    style={{ borderColor: value ? "#c9a96e" : "#e5e7eb" }}
                  >
                    <span className="text-sm text-gray-800">{label}</span>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: value ? "#c9a96e" : "#d1d5db", background: value ? "#c9a96e" : "white" }}>
                      {value && <span className="text-white text-xs">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">锁头+钥匙</label>
              <div className="flex gap-2">
                {(["齐全", "仅有锁头", "无"] as LockKeyStatus[]).map((v) => (
                  <Chip key={v} active={lockKeyStatus === v} onClick={() => setLockKeyStatus(v)}>{v}</Chip>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">肩带</label>
              <div className="flex gap-2 flex-wrap">
                {(["有原配肩带", "无肩带", "非原配肩带"] as StrapStatus[]).map((v) => (
                  <Chip key={v} active={strapStatus === v} onClick={() => setStrapStatus(v)}>{v}</Chip>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">鉴定状态</label>
              <div className="flex gap-2 flex-wrap">
                {(["未鉴定", "已鉴定（附证书）"] as AuthStatus[]).map((v) => (
                  <Chip key={v} active={authStatus === v} onClick={() => setAuthStatus(v)}>{v}</Chip>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">购买渠道</label>
              <select
                value={purchaseChannel}
                onChange={(e) => setPurchaseChannel(e.target.value as PurchaseChannel)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white"
              >
                {(["国内官方专柜", "海外官方专柜", "机场免税店", "代购", "来源不明"] as PurchaseChannel[]).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">购买年份（可选）</label>
              <select
                value={purchaseYear ?? ""}
                onChange={(e) => setPurchaseYear(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white"
              >
                <option value="">不确定</option>
                {Array.from({ length: 30 }, (_, i) => 2025 - i).map((y) => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 5: Defect details */}
        {step === 5 && (
          <div className="space-y-5">
            <p className="text-xs text-gray-500">请如实描述各部位状态，帮助买家了解真实成色</p>

            <SelectField label="手柄状态" value={handleCondition} onChange={(v) => setHandleCondition(v as HandleCondition)}
              options={["无瑕疵", "轻微氧化", "明显氧化", "有污渍", "皮革开裂"]} />
            <SelectField label="五金状态" value={hardwareCondition} onChange={(v) => setHardwareCondition(v as HardwareCondition)}
              options={["无瑕疵", "轻微刮痕", "明显刮痕", "氧化发黑"]} />
            <SelectField label="包体外观" value={exteriorCondition} onChange={(v) => setExteriorCondition(v as ExteriorCondition)}
              options={["无瑕疵", "轻微污渍", "明显污渍", "边缘磨损"]} />
            <SelectField label="包底状态" value={bottomCondition} onChange={(v) => setBottomCondition(v as BottomCondition)}
              options={["无磨损", "轻微磨损", "明显磨损"]} />
            <SelectField label="内里状态" value={interiorCondition} onChange={(v) => setInteriorCondition(v as InteriorCondition)}
              options={["无瑕疵", "轻微污渍", "明显污渍", "内衬脱落"]} />
            <SelectField label="翻新情况" value={refurbishStatus} onChange={(v) => setRefurbishStatus(v as RefurbishStatus)}
              options={["未翻新", "手柄已翻新", "五金已翻新", "内里已翻新"]} />
          </div>
        )}

        {/* Step 6: Price & publish */}
        {step === 6 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">售价（元）*</label>
              {selectedSize?.retailPrice && (
                <p className="text-xs text-gray-400 mb-2">官方参考价 ¥{selectedSize.retailPrice.toLocaleString()}</p>
              )}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                <input
                  type="number"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder="输入售价"
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3.5 text-sm bg-white"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">确认商品信息</h3>
              <div className="space-y-2">
                <InfoRow label="款式" value={`${styleNameZh} ${modelSize}`} />
                <InfoRow label="货号" value={selectedSize?.modelNumber ?? "-"} />
                <InfoRow label="成色" value={condition} />
                <InfoRow label="售价" value={askingPrice ? `¥${parseInt(askingPrice).toLocaleString()}` : "-"} />
                <InfoRow label="已上传照片" value={`${images.length} 张`} />
              </div>
            </div>

            <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)" }}>
              <p className="text-xs" style={{ color: "#c9a96e" }}>
                📝 发布后 AI 将自动生成商品描述和促销话术，约需 10-20 秒
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t">
        {step < STEP_COUNT - 1 ? (
          <button
            onClick={() => {
              if (step === 0 && images.length === 0) { alert("请先上传至少一张照片"); return; }
              if (step === 2 && !styleName) { alert("请选择款式"); return; }
              if (step === 0) setStep(1);
              else if (step === 1 && !aiResult && !identifying) setStep(2);
              else setStep(step + 1);
            }}
            disabled={identifying}
            className="w-full py-4 rounded-xl text-white font-medium text-base"
            style={{ background: identifying ? "#ccc" : "#1a1a1a" }}
          >
            {step === 1 && !aiResult ? "跳过，下一步 →" : "下一步 →"}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !askingPrice || !styleName}
            className="w-full py-4 rounded-xl text-white font-medium text-base"
            style={{ background: submitting || !askingPrice || !styleName ? "#ccc" : "#1a1a1a" }}
          >
            {submitting ? (generating ? "AI 生成描述中…" : "发布中…") : "✓ 发布商品"}
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-full text-xs border"
      style={{
        borderColor: active ? "#1a1a1a" : "#e5e7eb",
        background: active ? "#1a1a1a" : "white",
        color: active ? "white" : "#6b7280",
      }}
    >
      {children}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} active={value === o} onClick={() => onChange(o)}>{o}</Chip>
        ))}
      </div>
    </div>
  );
}
