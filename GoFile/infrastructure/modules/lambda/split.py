import json
import io
import os
import uuid
import boto3
from pypdf import PdfReader, PdfWriter

s3 = boto3.client("s3")

def _pages_from_split(split, total_pages):
    pages = []

    t = split.get("type")

    if t == "range":
        start = int(split["from"])
        end = int(split["to"])
        pages = list(range(start, end + 1))

    elif t == "ranges":
        for r in split.get("ranges", []):
            start = int(r["from"])
            end = int(r["to"])
            pages.extend(range(start, end + 1))

    elif t == "pages":
        pages = [int(p) for p in split.get("pages", [])]

    # validate + sanitize
    clean = []
    seen = set()
    for p in pages:
        if 1 <= p <= total_pages and p not in seen:
            clean.append(p)
            seen.add(p)

    return clean


def handle_split(event, context):
    body = json.loads(event["body"])

    bucket = body["bucket"]
    key = body["key"]
    splits = body.get("splits", [])

    if not splits:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "splits[] required"})
        }

    uploads_bucket = os.environ["UPLOADS_BUCKET"]
    processed_bucket = os.environ["PROCESSED_BUCKET"]

    obj = s3.get_object(Bucket=uploads_bucket, Key=key)
    reader = PdfReader(io.BytesIO(obj["Body"].read()))
    total_pages = len(reader.pages)

    results = []

    for idx, split in enumerate(splits, start=1):
        pages = _pages_from_split(split, total_pages)

        if not pages:
            continue

        writer = PdfWriter()
        for p in pages:
            writer.add_page(reader.pages[p - 1])

        buf = io.BytesIO()
        writer.write(buf)
        buf.seek(0)

        name = split.get("name") or f"split-{idx}"
        safe_name = name.replace("/", "_")
        out_key = f"splits/{safe_name}-{uuid.uuid4().hex}.pdf"

        s3.put_object(
            Bucket=processed_bucket,
            Key=out_key,
            Body=buf.getvalue(),
            ContentType="application/pdf"
        )

        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": processed_bucket, "Key": out_key},
            ExpiresIn=3600
        )

        results.append({
            "name": f"{safe_name}.pdf",
            "url": url
        })

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        },
        "body": json.dumps({"files": results})
    }
