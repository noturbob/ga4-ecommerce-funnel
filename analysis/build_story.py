"""Shape the BigQuery results into app/data/story.json, the only file the story app reads.

In:  data/results/*.csv (from pipeline/run_queries.py), sql/*.sql
Out: app/data/story.json
Run: python3 analysis/build_story.py

No numbers are computed here beyond simple ratios for display; every count comes from a query in sql/.
The SQL text is copied in too, so the site can show the query behind each chart.
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
R = ROOT / "data/results"
OUT = ROOT / "app/data/story.json"

# Shipping info fires together with "begin checkout" in this data (see 09_data_quality.sql), so the
# two are shown as one step.
STEPS = [("visitors", "Visited the store"), ("view_item", "Viewed a product"), ("add_to_cart", "Added to cart"),
         ("begin_checkout", "Started checkout"), ("add_payment_info", "Entered payment"), ("purchase", "Bought")]


def rows(name: str) -> list[dict]:
    def num(v: str):
        try:
            return int(v)
        except ValueError:
            try:
                return float(v)
            except ValueError:
                return v
    return [{k: num(v) for k, v in r.items()} for r in csv.DictReader(open(R / f"{name}.csv"))]


def funnel() -> dict:
    out = {}
    for r in rows("01_funnel"):
        assert r["add_shipping_info"] == r["begin_checkout"], r   # the merge above relies on this
        out[r["segment"]] = {"steps": [{"key": k, "label": label, "n": r[k]} for k, label in STEPS], "any_purchase": r["any_purchase"]}
    return out


def retention() -> list[dict]:
    cohorts: dict[str, dict] = {}
    for r in rows("03_retention"):
        c = cohorts.setdefault(r["cohort_week"], {"week": r["cohort_week"], "size": r["cohort_size"], "share": []})
        if r["weeks_later"] > 0:
            c["share"].append(r["share"])
    return list(cohorts.values())


if __name__ == "__main__":
    manifest = rows("MANIFEST")
    story = {
        "overview": rows("00_overview"),
        "funnel": funnel(),
        "channels": [r for r in rows("02_channels") if r["dimension"] == "channel"],
        "devices": [r for r in rows("02_channels") if r["dimension"] == "device"],
        "retention": retention(),
        "returns": rows("04_return_rates"),
        "products": rows("05_products"),
        "opportunity": rows("06_opportunity"),
        "quality": rows("09_data_quality"),
        "run": {"at": manifest[0]["run_at"], "gb_scanned": round(sum(r["bytes_scanned"] for r in manifest) / 1e9, 1)},
        "sql": {f.stem: f.read_text() for f in sorted((ROOT / "sql").glob("*.sql"))},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(story, indent=1))
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")
