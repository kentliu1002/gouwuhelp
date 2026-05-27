#!/usr/bin/env python3
"""
本地同步脚本：从 idle-commodity.818.work 抓取已上架的 LOUIS VUITTON 商品，
下载图片 → 上传到 Vercel Blob → 通过 gouwu.help API 进行 AI 鉴别后，写入商品库。

运行方式：
  python3 scripts/sync-idle.py

无额外依赖（使用系统 curl）。
"""

import json
import time
import sys
import subprocess
import os
import tempfile
import urllib.parse

# ──────────────────────────────────────────
# 配置
# ──────────────────────────────────────────
IDLE_BASE = "https://idle-commodity.818.work"
IDLE_TOKEN = "a13e21fc094bb49c7eede87d1851237c"
IDLE_STATION = "FHE_NvvCRfWR"

SITE_BASE = "https://gouwu.help"  # 可改为 http://localhost:3000 本地测试

AI_DELAY_SECS = 3.0  # AI 调用间隔（防限速）

# 从 .env.local 读取 Vercel Blob token
def load_blob_token():
    env_files = [
        os.path.join(os.path.dirname(__file__), "..", ".env.local"),
        os.path.expanduser("~/.vercel/.env.local"),
    ]
    for path in env_files:
        path = os.path.normpath(path)
        if os.path.exists(path):
            with open(path) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("BLOB_READ_WRITE_TOKEN="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        return val
    return os.environ.get("BLOB_READ_WRITE_TOKEN", "")

BLOB_TOKEN = load_blob_token()
BLOB_BASE = "https://blob.vercel-storage.com"


# ──────────────────────────────────────────
# HTTP 工具（通过 curl 避免 Python SSL 问题）
# ──────────────────────────────────────────
def curl_post(url, payload, extra_headers=None, skip_ssl=False, timeout=30):
    cmd = ["curl", "-s", "-X", "POST",
           "-H", "Content-Type: application/json",
           "--max-time", str(timeout),
           "-d", json.dumps(payload)]
    if skip_ssl:
        cmd.append("-k")
    if extra_headers:
        for h in extra_headers:
            cmd += ["-H", h]
    cmd.append(url)

    result = subprocess.run(cmd, capture_output=True, text=True, env={**os.environ, "NO_PROXY": "*"})
    if not result.stdout.strip():
        raise RuntimeError(f"Empty response from {url}: {result.stderr}")
    return json.loads(result.stdout)


def curl_get(url, timeout=30):
    cmd = ["curl", "-s", "--max-time", str(timeout), url]
    result = subprocess.run(cmd, capture_output=True, text=True, env={**os.environ, "NO_PROXY": "*"})
    if not result.stdout.strip():
        raise RuntimeError(f"Empty response from {url}")
    return json.loads(result.stdout)


# ──────────────────────────────────────────
# Vercel Blob 上传（本机 → 公网 CDN）
# ──────────────────────────────────────────
def upload_image_to_blob(remote_url: str, pathname: str) -> str:
    """
    下载远程图片（中国 CDN）并上传到 Vercel Blob。
    返回 Vercel Blob 公开 URL。
    """
    # 1. 下载到临时文件
    suffix = os.path.splitext(remote_url.split("?")[0])[-1] or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp_path = tmp.name

    try:
        dl_result = subprocess.run(
            ["curl", "-s", "--max-time", "20", "-o", tmp_path, remote_url],
            capture_output=True,
        )
        if dl_result.returncode != 0 or os.path.getsize(tmp_path) < 1000:
            raise RuntimeError(f"图片下载失败: {remote_url}")

        # 2. 上传到 Vercel Blob
        content_type = "image/jpeg"
        if suffix.lower() == ".png":
            content_type = "image/png"
        elif suffix.lower() == ".webp":
            content_type = "image/webp"

        up_result = subprocess.run(
            [
                "curl", "-s", "-X", "PUT",
                "-H", f"Authorization: Bearer {BLOB_TOKEN}",
                "-H", f"x-content-type: {content_type}",
                "-H", f"Content-Type: {content_type}",
                "--data-binary", f"@{tmp_path}",
                f"{BLOB_BASE}/{pathname}",
            ],
            capture_output=True,
            text=True,
            env={**os.environ, "NO_PROXY": "*"},
        )
        if not up_result.stdout.strip():
            raise RuntimeError(f"Blob 上传无响应")
        blob_resp = json.loads(up_result.stdout)
        url = blob_resp.get("url")
        if not url:
            raise RuntimeError(f"Blob 上传失败: {up_result.stdout}")
        return url
    finally:
        os.unlink(tmp_path)


def upload_item_images(item: dict) -> list:
    """上传商品的最多 8 张图片，返回 Vercel Blob URL 列表"""
    sn = item["sn"].lower()
    pic_urls = (item.get("detailPicUrls") or [])[:8]
    blob_urls = []
    for i, url in enumerate(pic_urls):
        ext = os.path.splitext(url.split("?")[0])[-1] or ".jpg"
        pathname = f"products/{sn}/{i}{ext}"
        try:
            blob_url = upload_image_to_blob(url, pathname)
            blob_urls.append(blob_url)
        except Exception as e:
            print(f"             ⚠ 图片 {i+1} 上传失败: {e}")
    return blob_urls


# ──────────────────────────────────────────
# 第一步：抓取闲鱼后台 LOUIS VUITTON 已上架商品
# ──────────────────────────────────────────
def fetch_lv_items():
    print("📦 正在从 idle-commodity.818.work 获取 LOUIS VUITTON 在售商品…")
    all_items = []
    page = 1
    idle_headers = [
        f"token: {IDLE_TOKEN}",
        "appkey: luxury-mis",
        f"stationCode: {IDLE_STATION}",
        "lang: zh-CN",
    ]

    while True:
        try:
            data = curl_post(
                f"{IDLE_BASE}/mis/idle/goods/price/pageSn",
                {"current": page, "pageSize": 50, "saleStatus": 70},
                extra_headers=idle_headers,
                skip_ssl=True,
                timeout=20,
            )
        except Exception as e:
            print(f"  ⚠ 第 {page} 页请求失败: {e}")
            break

        items = data.get("data", {}).get("resultList", [])
        total = int(data.get("data", {}).get("total", 0))

        lv = [
            i for i in items
            if i.get("customBrandName") == "LOUIS VUITTON"
            and len(i.get("detailPicUrls") or []) > 0
        ]
        all_items.extend(lv)
        fetched = (page - 1) * 50 + len(items)
        print(f"  第 {page} 页 | 共 {total} 件 | 本批 LV {len(lv)} 件 | 累计 {len(all_items)} 件")

        if fetched >= total or not items:
            break
        page += 1
        time.sleep(0.3)

    print(f"\n✅ 共获取 {len(all_items)} 件在售 LOUIS VUITTON 商品\n")
    return all_items


# ──────────────────────────────────────────
# 第二步：检查已导入（以 SN 为 ID）
# ──────────────────────────────────────────
def get_existing_sns():
    try:
        products = curl_get(f"{SITE_BASE}/api/products?all=true")
        return set(p["id"] for p in products)
    except Exception as e:
        print(f"  ⚠ 获取现有商品列表失败: {e}")
        return set()


# ──────────────────────────────────────────
# 字段映射
# ──────────────────────────────────────────
DEFAULTS = {
    "condition": "90新及以下",
    "hasDustBag": False,
    "hasBox": False,
    "hasReceipt": False,
    "lockKeyStatus": "无",
    "strapStatus": "无肩带",
    "handleCondition": "轻微氧化",
    "hardwareCondition": "轻微刮痕",
    "exteriorCondition": "轻微污渍",
    "bottomCondition": "轻微磨损",
    "interiorCondition": "轻微污渍",
    "refurbishStatus": "未翻新",
    "purchaseChannel": "来源不明",
    "purchaseYear": None,
    "authStatus": "未鉴定",
}

HANDLE_TYPE_VALUES = ["双手提", "单肩带", "斜挎带", "双肩背", "腰带", "双手提+肩带", "手提+斜挎带"]
CLOSURE_TYPE_VALUES = ["拉链", "搭扣", "磁扣", "敞口"]
LEATHER_COLOR_VALUES = ["原色皮（浅蜂蜜色）", "深色氧化皮（深棕）", "黑色皮革"]
HARDWARE_COLOR_VALUES = ["金色", "银色", "黑色"]


def safe_val(val, allowed, default):
    return val if val in allowed else default


def build_product(item, identified, blob_image_urls):
    style_name = identified.get("styleName", "Unknown")
    style_zh = identified.get("styleNameZh", "未知款式")
    description = (
        f"Louis Vuitton {style_name}（{style_zh}），老花帆布经典款式，"
        f"成色约九成新，详情请参考实拍图片。"
    )
    promotional = (
        f"正品保障 · LV {style_zh} · "
        f"¥{int(item.get('salePrice', 0)):,} 入手好机会"
    )

    return {
        "id": item["sn"].lower(),  # SN 作为 ID 去重
        "isAvailable": True,
        "styleName": style_name,
        "styleNameZh": style_zh,
        "handleType": safe_val(identified.get("handleType"), HANDLE_TYPE_VALUES, "双手提"),
        "closureType": safe_val(identified.get("closureType"), CLOSURE_TYPE_VALUES, "拉链"),
        "hasLock": bool(identified.get("hasLock", False)),
        "leatherColor": safe_val(identified.get("leatherColor"), LEATHER_COLOR_VALUES, "原色皮（浅蜂蜜色）"),
        "hardwareColor": safe_val(identified.get("hardwareColor"), HARDWARE_COLOR_VALUES, "金色"),
        "modelSize": "",
        "modelNumber": "",
        "dimensions": "",
        "retailPrice": None,
        "isDiscontinued": False,
        **DEFAULTS,
        "images": blob_image_urls,
        "description": description,
        "promotionalCopy": promotional,
        "askingPrice": item.get("salePrice", 0),
    }


# ──────────────────────────────────────────
# 主流程
# ──────────────────────────────────────────
def main():
    if not BLOB_TOKEN:
        print("❌ 未找到 BLOB_READ_WRITE_TOKEN，请确保 .env.local 存在且包含此变量。")
        sys.exit(1)

    print("=" * 60)
    print("  gouwu.help 商品同步工具")
    print("  数据源：idle-commodity.818.work (已上架 LOUIS VUITTON)")
    print("=" * 60)
    print()

    # 1. 获取在售 LV 商品
    items = fetch_lv_items()
    if not items:
        print("❌ 未获取到商品，退出。")
        sys.exit(1)

    # 2. 检查已导入
    print("🔍 检查已导入商品…")
    existing_sns = get_existing_sns()
    print(f"  网站现有商品：{len(existing_sns)} 件")

    new_items = [i for i in items if i["sn"].lower() not in existing_sns]
    print(f"⭐ 本次待导入：{len(new_items)} 件（已跳过 {len(items) - len(new_items)} 件已存在）\n")

    if not new_items:
        print("✅ 无新商品，全部已导入。")
        return

    # 3. 逐件处理
    ok_count = 0
    fail_count = 0

    for idx, item in enumerate(new_items, 1):
        sn = item["sn"]
        series = item.get("customSeriesName") or "?"
        price = item.get("salePrice", 0)
        print(f"[{idx:3d}/{len(new_items)}] {sn}  系列={series}  ¥{price}")

        try:
            # 上传图片到 Vercel Blob
            print(f"           📤 上传图片…")
            blob_urls = upload_item_images(item)
            if not blob_urls:
                raise RuntimeError("图片全部上传失败")
            print(f"           ✓ 已上传 {len(blob_urls)} 张")

            # AI 鉴别（使用 blob URL 确保 AI 可访问）
            ai_photos = blob_urls[:4]
            identified = curl_post(
                f"{SITE_BASE}/api/ai/identify",
                {"imageUrls": ai_photos},
                timeout=60,
            )

            if "error" in identified:
                raise RuntimeError(f"AI error: {identified['error']}")

            style_name = identified.get("styleName", "Unknown")
            confidence = identified.get("confidence", "?")
            print(f"           🤖 AI: {style_name} (置信度:{confidence})")

            # 构建并保存商品
            product = build_product(item, identified, blob_urls)
            result = curl_post(f"{SITE_BASE}/api/products", product, timeout=30)
            saved_id = result.get("id", "?")
            print(f"           ✅ 保存成功 ID={saved_id}")
            ok_count += 1

        except Exception as e:
            print(f"           ❌ 失败: {e}")
            fail_count += 1

        time.sleep(AI_DELAY_SECS)

    print()
    print("=" * 60)
    print(f"同步完成：成功 {ok_count} 件 | 失败 {fail_count} 件")
    print("=" * 60)


if __name__ == "__main__":
    main()
