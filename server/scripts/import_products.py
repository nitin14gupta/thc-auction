"""One-off bulk import of the hypefly product catalog into Supabase.

Usage (from server/, with the venv active):
    python scripts/import_products.py --file ../client/public/hypefly_db_ready.json

Safe to re-run: products are upserted on source_id, and each run replaces the
variants for the products it just touched.
"""

import argparse
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from db.config import get_supabase_client  # noqa: E402

PRODUCT_BATCH_SIZE = 500
VARIANT_BATCH_SIZE = 1000


def _chunk(items: list, size: int):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def _product_row(p: dict) -> dict:
    return {
        "source_id": p["id"],
        "name": p["name"],
        "slug": p.get("slug"),
        "url": p.get("url"),
        "brand": p.get("brand"),
        "product_type": p.get("product_type"),
        "product_category": p.get("product_category"),
        "gender": p.get("gender"),
        "sku": p.get("sku"),
        "gtin": p.get("gtin"),
        "price": p.get("price"),
        "compare_at_price": p.get("compare_at_price"),
        "currency": p.get("currency") or "INR",
        "in_stock": bool(p.get("in_stock", True)),
        "only_few_left": bool(p.get("only_few_left", False)),
        "express_delivery": bool(p.get("express_delivery", False)),
        "ships_in_18_to_20_days": bool(p.get("ships_in_18_to_20_days", False)),
        "shipping_text": p.get("shipping_text"),
        "sold_by": p.get("sold_by"),
        "rating": p.get("rating"),
        "review_count": p.get("review_count"),
        "product_fit": p.get("product_fit"),
        "product_fit_description": p.get("product_fit_description"),
        "images": p.get("images") or [],
        "seo": p.get("seo"),
        "description": p.get("description"),
        "source": p.get("source"),
        "scraped_at": p.get("scraped_at"),
    }


def import_products(file_path: str, batch_size: int) -> None:
    print(f"Loading {file_path} ...")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    raw_products = data["products"]
    print(f"Loaded {len(raw_products)} products.")

    # De-dupe by source_id (last occurrence wins) — a single upsert statement
    # can't affect the same conflict key twice, and the source data has some
    # repeated ids.
    by_source_id: dict[int, dict] = {p["id"]: p for p in raw_products}
    products = list(by_source_id.values())
    if len(products) != len(raw_products):
        print(f"Deduplicated {len(raw_products) - len(products)} repeated source_id rows.")

    db = get_supabase_client()

    print("Upserting products...")
    for i, batch in enumerate(_chunk(products, batch_size)):
        rows = [_product_row(p) for p in batch]
        db.table("products").upsert(rows, on_conflict="source_id").execute()
        print(f"  products batch {i + 1} ({len(rows)} rows) done")

    print("Building source_id -> product_id map...")
    id_map: dict[int, str] = {}
    page_size = 1000
    offset = 0
    while True:
        res = (
            db.table("products")
            .select("id, source_id")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        rows = res.data
        if not rows:
            break
        for row in rows:
            id_map[row["source_id"]] = row["id"]
        offset += page_size
        if len(rows) < page_size:
            break
    print(f"  mapped {len(id_map)} products")

    print("Building variant rows...")
    variant_rows = []
    touched_product_ids = set()
    for p in products:
        product_id = id_map.get(p["id"])
        if not product_id:
            continue
        touched_product_ids.add(product_id)
        for v in p.get("variants") or []:
            variant_rows.append(
                {
                    "product_id": product_id,
                    "size": v.get("size"),
                    "shipping_mode": v.get("shipping_mode"),
                    "sale_price": v.get("sale_price"),
                    "compare_at_price": v.get("compare_at_price"),
                }
            )
    print(f"  {len(variant_rows)} variant rows to insert")

    print("Clearing existing variants for touched products...")
    for batch in _chunk(list(touched_product_ids), 500):
        db.table("product_variants").delete().in_("product_id", batch).execute()

    print("Inserting variants...")
    for i, batch in enumerate(_chunk(variant_rows, VARIANT_BATCH_SIZE)):
        db.table("product_variants").insert(batch).execute()
        print(f"  variants batch {i + 1} ({len(batch)} rows) done")

    print("Done.")
    print(f"Total products: {len(id_map)}, total variants: {len(variant_rows)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Import hypefly product catalog into Supabase.")
    parser.add_argument(
        "--file",
        default=os.path.join("..", "client", "public", "hypefly_db_ready.json"),
        help="Path to hypefly_db_ready.json",
    )
    parser.add_argument("--batch-size", type=int, default=PRODUCT_BATCH_SIZE)
    args = parser.parse_args()

    import_products(args.file, args.batch_size)


if __name__ == "__main__":
    main()
