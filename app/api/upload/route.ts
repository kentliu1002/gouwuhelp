import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const files = form.getAll("files") as File[];

  if (!files.length) return NextResponse.json({ error: "no files" }, { status: 400 });

  const urls = await Promise.all(
    files.map(async (file) => {
      const blob = await put(`products/${Date.now()}-${file.name}`, file, {
        access: "public",
        addRandomSuffix: true,
      });
      return blob.url;
    })
  );

  return NextResponse.json({ urls });
}
