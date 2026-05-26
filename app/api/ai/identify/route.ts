import { NextRequest, NextResponse } from "next/server";
import { identifyBag } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { imageUrls } = (await req.json()) as { imageUrls: string[] };
  if (!imageUrls?.length) return NextResponse.json({ error: "no images" }, { status: 400 });

  const result = await identifyBag(imageUrls);
  return NextResponse.json(result);
}
