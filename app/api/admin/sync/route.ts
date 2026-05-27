import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";
import { createProduct } from "@/lib/db";
import { identifyBag, generateDescription } from "@/lib/ai";
import { LV_STYLES } from "@/lib/lv-data";

export const maxDuration = 300; // seconds – batch sync needs up to 5 min
import type { CreateProductInput } from "@/lib/types";

const IDLE_BASE = "https://idle-commodity.818.work";
const IDLE_TOKEN = process.env.IDLE_TOKEN ?? "a13e21fc094bb49c7eede87d1851237c";
const IDLE_STATION = process.env.IDLE_STATION_CODE ?? "FHE_NvvCRfWR";
const BATCH_SIZE = 5; // items per call to avoid timeout

interface IdleItem {
  customBrandName: string;
  customSeriesName: string | null;
  salePrice: number;
  saleStatus: number;
  itemId: string | null;
  detailPicUrls: string[];
  sn: string;
  skuId: string;
  sellerOrderNo: string;
  categories: { categoryName: string; level: number }[];
}

async function fetchIdleLvItems(): Promise<IdleItem[]> {
  const allItems: IdleItem[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(`${IDLE_BASE}/mis/idle/goods/price/pageSn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: IDLE_TOKEN,
        appkey: "luxury-mis",
        stationCode: IDLE_STATION,
        lang: "zh-CN",
      },
      body: JSON.stringify({ current: page, pageSize: 50, saleStatus: 70 }),
      cache: "no-store",
    });

    if (!res.ok) break;
    const data = await res.json();
    const items: IdleItem[] = data?.data?.resultList ?? [];
    const total = parseInt(data?.data?.total ?? "0", 10);

    const lvItems = items.filter(
      (i) => i.customBrandName === "LOUIS VUITTON" && i.detailPicUrls?.length > 0
    );
    allItems.push(...lvItems);

    if (allItems.length >= total || items.length === 0) break;
    page++;
  }

  return allItems;
}

function snToId(sn: string): string {
  // SN2605200459390029 → sn2605200459390029
  return sn.toLowerCase();
}

async function itemExists(sn: string): Promise<boolean> {
  try {
    await head(`products/${snToId(sn)}.json`);
    return true;
  } catch {
    return false;
  }
}

const KNOWN_STYLES = LV_STYLES.map((s) => ({
  nameEn: s.nameEn,
  nameZh: s.nameZh,
  category: s.category,
}));

function norm(s: string) {
  return s.toLowerCase().replace(/[-\s]+/g, " ").trim();
}

function lookupStyle(styleName: string) {
  const aiName = norm(styleName);
  return (
    LV_STYLES.find((s) => norm(s.nameEn) === aiName) ??
    LV_STYLES.find(
      (s) => norm(s.nameEn).includes(aiName) || aiName.includes(norm(s.nameEn))
    )
  );
}

async function importItem(item: IdleItem): Promise<{ sn: string; ok: boolean; error?: string }> {
  try {
    // Use first 4 photos for AI identification
    const photos = item.detailPicUrls.slice(0, 4);
    const identified = await identifyBag(photos, KNOWN_STYLES);

    // Look up style info from DB
    const style = lookupStyle(identified.styleName);
    const size = style?.sizes[0]; // default to first size if multiple

    // Generate description
    const productInfo = {
      styleName: identified.styleName,
      styleNameZh: identified.styleNameZh,
      modelSize: size?.label ?? "",
      modelNumber: size?.modelNumber ?? "",
      dimensions: size?.dimensions ?? "",
      condition: "90新及以下" as const,
      askingPrice: item.salePrice,
      retailPrice: size?.retailPrice ?? null,
      hasDustBag: false,
      hasBox: false,
      hasReceipt: false,
      handleCondition: "轻微氧化" as const,
      hardwareCondition: "轻微刮痕" as const,
      exteriorCondition: "轻微污渍" as const,
      bottomCondition: "轻微磨损" as const,
      interiorCondition: "轻微污渍" as const,
      refurbishStatus: "未翻新" as const,
      purchaseChannel: "来源不明" as const,
    };
    const { description, promotionalCopy } = await generateDescription(productInfo);

    const input: CreateProductInput = {
      isAvailable: true,
      styleName: identified.styleName,
      styleNameZh: identified.styleNameZh,
      handleType: (identified.handleType as CreateProductInput["handleType"]) ?? "双手提",
      closureType: (identified.closureType as CreateProductInput["closureType"]) ?? "拉链",
      hasLock: identified.hasLock ?? false,
      leatherColor:
        (identified.leatherColor as CreateProductInput["leatherColor"]) ?? "原色皮（浅蜂蜜色）",
      hardwareColor:
        (identified.hardwareColor as CreateProductInput["hardwareColor"]) ?? "金色",
      modelSize: size?.label ?? "",
      modelNumber: size?.modelNumber ?? "",
      dimensions: size?.dimensions ?? "",
      retailPrice: size?.retailPrice ?? null,
      isDiscontinued: style?.isDiscontinued ?? false,
      condition: "90新及以下",
      hasDustBag: false,
      hasBox: false,
      hasReceipt: false,
      lockKeyStatus: "无",
      strapStatus: "无肩带",
      handleCondition: "轻微氧化",
      hardwareCondition: "轻微刮痕",
      exteriorCondition: "轻微污渍",
      bottomCondition: "轻微磨损",
      interiorCondition: "轻微污渍",
      refurbishStatus: "未翻新",
      purchaseChannel: "来源不明",
      purchaseYear: null,
      authStatus: "未鉴定",
      images: item.detailPicUrls.slice(0, 8),
      description,
      promotionalCopy,
      askingPrice: item.salePrice,
    };

    await createProduct({ ...input, id: snToId(item.sn) });
    return { sn: item.sn, ok: true };
  } catch (err) {
    return { sn: item.sn, ok: false, error: String(err) };
  }
}

export async function POST(req: NextRequest) {
  // Optional: protect with a secret
  const secret = req.headers.get("x-sync-secret");
  if (process.env.SYNC_SECRET && secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all on-sale LV items
    const allItems = await fetchIdleLvItems();

    // Find items not yet imported
    const newItems: IdleItem[] = [];
    for (const item of allItems) {
      if (!(await itemExists(item.sn))) {
        newItems.push(item);
      }
    }

    // Process a batch
    const batch = newItems.slice(0, BATCH_SIZE);
    const results = await Promise.all(batch.map(importItem));

    return NextResponse.json({
      total: allItems.length,
      remaining: newItems.length - batch.length,
      processed: batch.length,
      results,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET: status check
export async function GET() {
  try {
    const allItems = await fetchIdleLvItems();
    const existChecks = await Promise.all(allItems.map((i) => itemExists(i.sn)));
    const imported = existChecks.filter(Boolean).length;
    return NextResponse.json({
      total: allItems.length,
      imported,
      remaining: allItems.length - imported,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
