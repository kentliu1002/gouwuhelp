import { kv } from "@vercel/kv";
import type { Product, CreateProductInput } from "./types";

const PRODUCTS_KEY = "products";

function productKey(id: string) {
  return `product:${id}`;
}

export async function createProduct(input: CreateProductInput & { id: string }): Promise<Product> {
  const product: Product = { ...input, createdAt: Date.now() };
  await kv.set(productKey(product.id), product);
  await kv.zadd(PRODUCTS_KEY, { score: product.createdAt, member: product.id });
  return product;
}

export async function getProduct(id: string): Promise<Product | null> {
  return kv.get<Product>(productKey(id));
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
  const product = await getProduct(id);
  if (!product) return null;
  const updated = { ...product, ...patch };
  await kv.set(productKey(id), updated);
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  await kv.del(productKey(id));
  await kv.zrem(PRODUCTS_KEY, id);
}

export async function listProducts(onlyAvailable = true): Promise<Product[]> {
  const ids = await kv.zrange<string[]>(PRODUCTS_KEY, 0, -1);
  if (!ids.length) return [];
  const products = await Promise.all(ids.map((id) => kv.get<Product>(productKey(id))));
  const valid = products.filter((p): p is Product => p !== null);
  if (onlyAvailable) return valid.filter((p) => p.isAvailable).reverse();
  return valid.reverse();
}
