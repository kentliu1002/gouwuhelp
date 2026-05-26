import { NextRequest, NextResponse } from "next/server";
import { generateDescription } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await generateDescription(body);
  return NextResponse.json(result);
}
