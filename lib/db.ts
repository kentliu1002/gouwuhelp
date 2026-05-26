import { put, del, list, head } from "@vercel/blob";
import type { Product, CreateProductInput } from "./types";

const PREFIX = "products/";

function blobPath(id: string) {
  return `${PREFIX}${id}.json`;
}

export async function createProduct(input: CreateProductInput & { id: string }): Promise<Product> {
  const product: Product = { ...input, createdAt: Date.now() };
  await put(blobPath(product.id), JSON.stringify(product), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  return product;
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const info = await head(blobPath(id));
    const res = await fetch(info.url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json() as Promise<Product>;
  } catch {
    return null;
  }
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
  const product = await getProduct(id);
  if (!product) return null;
  const updated = { ...product, ...patch };
  await put(blobPath(id), JSON.stringify(updated), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const info = await head(blobPath(id));
    await del(info.url);
  } catch {
    // already deleted
  }
}

export async function listProducts(onlyAvailable = true): Promise<Product[]> {
  const { blobs } = await list({ prefix: PREFIX, mode: "expanded" });
  const dataBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));
  if (!dataBlobs.length) return [];

  const products = await Promise.all(
    dataBlobs.map(async (b) => {
      try {
        const res = await fetch(b.url, { cache: "no-store" });
        if (!res.ok) return null;
        return res.json() as Promise<Product>;
      } catch {
        return null;
      }
    })
  );

  const valid = products.filter((p): p is Product => p !== null);
  const sorted = valid.sort((a, b) => b.createdAt - a.createdAt);
  if (onlyAvailable) return sorted.filter((p) => p.isAvailable);
  return sorted;
}
