import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createProduct, listProducts } from "@/lib/db";
import type { CreateProductInput } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase();
  const category = searchParams.get("category");

  const products = await listProducts(true);

  let filtered = products;
  if (query) {
    filtered = filtered.filter(
      (p) =>
        p.styleName.toLowerCase().includes(query) ||
        p.styleNameZh.includes(query) ||
        p.modelNumber.toLowerCase().includes(query)
    );
  }
  if (category) {
    filtered = filtered.filter((p) => {
      const { LV_STYLES } = require("@/lib/lv-data");
      const style = LV_STYLES.find((s: { nameEn: string; category: string }) => s.nameEn === p.styleName);
      return style?.category === category;
    });
  }

  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateProductInput;
  const id = uuidv4();
  const product = await createProduct({ ...body, id });
  return NextResponse.json(product, { status: 201 });
}
