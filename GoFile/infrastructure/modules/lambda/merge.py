import json
import boto3
import io
import uuid
import os
from pypdf import PdfWriter

s3 = boto3.client("s3")

def handle_merge(event, context):
    body = json.loads(event["body"])
    files = body.get("files", [])

    if not files or len(files) < 2:
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": "At least 2 files required"})
        }

    # ✅ FIX HERE
    uploads_bucket = os.environ["UPLOADS_BUCKET"]
    processed_bucket = os.environ["PROCESSED_BUCKET"]

    writer = PdfWriter()

    for key in files:
        obj = s3.get_object(Bucket=uploads_bucket, Key=key)
        pdf_bytes = io.BytesIO(obj["Body"].read())
        writer.append(pdf_bytes)

    out = io.BytesIO()
    writer.write(out)
    out.seek(0)

    output_key = f"merged/{uuid.uuid4()}.pdf"

    s3.put_object(
        Bucket=processed_bucket,
        Key=output_key,
        Body=out,
        ContentType="application/pdf"
    )

    url = s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": processed_bucket,
            "Key": output_key
        },
        ExpiresIn=3600
    )

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        },
        "body": json.dumps({
            "download_url": url
        })
    }
