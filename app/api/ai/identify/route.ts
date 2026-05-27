import { NextRequest, NextResponse } from "next/server";
import { identifyBag } from "@/lib/ai";
import { LV_STYLES } from "@/lib/lv-data";

export const maxDuration = 120; // seconds – 4-image AI calls take ~40-80s

const KNOWN_STYLES = LV_STYLES.map((s) => ({
  nameEn: s.nameEn,
  nameZh: s.nameZh,
  category: s.category,
}));

export async function POST(req: NextRequest) {
  const { imageUrls } = (await req.json()) as { imageUrls: string[] };
  if (!imageUrls?.length) return NextResponse.json({ error: "no images" }, { status: 400 });

  try {
    const result = await identifyBag(imageUrls, KNOWN_STYLES);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ai/identify] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
