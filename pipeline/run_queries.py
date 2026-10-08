"""Run every query in sql/ against Google's public GA4 sample in BigQuery and save the results.

In:  sql/*.sql (BigQuery Standard SQL, one question per file)
Out: data/results/<query>.csv, one per file
     data/results/MANIFEST.csv: query, rows, bytes scanned, SHA-256 of the SQL and of the result, run time
Run: uv run python pipeline/run_queries.py [--project YOUR_GCP_PROJECT]

The dataset is bigquery-public-data.ga4_obfuscated_sample_ecommerce: three months (Nov 2020 to
Jan 2021) of Google Analytics 4 events from the Google Merchandise Store. Querying it is free in
the BigQuery sandbox; a full run scans about 3.5 GB of the free 1 TB a month.
"""
import argparse
import csv
import hashlib
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from google.cloud import bigquery

ROOT = Path(__file__).resolve().parent.parent
SQL, OUT = ROOT / "sql", ROOT / "data/results"


def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def main(project: str, only: list[str]) -> None:
    client = bigquery.Client(project=project)
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for f in sorted(SQL.glob("*.sql")):
        if only and f.stem not in only:
            continue
        t0 = time.time()
        job = client.query(f.read_text())
        rows = list(job.result())
        out = OUT / f"{f.stem}.csv"
        with open(out, "w", newline="") as fh:
            w = csv.writer(fh)
            w.writerow([s.name for s in job.result().schema])
            w.writerows([list(r.values()) for r in rows])
        manifest.append({"query": f.name, "rows": len(rows), "bytes_scanned": job.total_bytes_processed,
                         "sql_sha256": sha(f.read_bytes()), "result_sha256": sha(out.read_bytes()),
                         "seconds": round(time.time() - t0, 1), "run_at": datetime.now(timezone.utc).isoformat(timespec="seconds")})
        print(f"{f.name:32} {len(rows):5} rows  {job.total_bytes_processed / 1e6:7.1f} MB scanned")
    if not only:
        with open(OUT / "MANIFEST.csv", "w", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=list(manifest[0]))
            w.writeheader()
            w.writerows(manifest)
    check()


def check() -> None:
    """Stop if the totals don't match what the dataset is known to contain."""
    overview = list(csv.DictReader(open(OUT / "00_overview.csv")))
    total = next(r for r in overview if r["month"] == "all")
    assert int(total["events"]) == 4_295_584, total     # the sample as first measured, 2026-10-08
    assert int(total["users"]) == 270_154, total
    assert int(total["purchase_events"]) == 5_692, total
    print("checks passed")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", default="ga4-funnel-noturbob", help="any GCP project with BigQuery enabled (the sandbox is enough)")
    ap.add_argument("only", nargs="*", help="run only these queries (file stems)")
    a = ap.parse_args()
    sys.exit(main(a.project, a.only))
