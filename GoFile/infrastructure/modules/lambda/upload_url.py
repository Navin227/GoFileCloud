import json
import boto3
import os
import uuid
import mimetypes

s3 = boto3.client("s3")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
    "Access-Control-Allow-Credentials": "true"
}


def handle_upload_url(event, context):

    # 🔹 Preflight
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": ""
        }

    bucket = os.environ["UPLOADS_BUCKET"]

    params = event.get("queryStringParameters") or {}
    filename = params.get("filename")

    if not filename:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "filename required"})
        }

    file_id = str(uuid.uuid4())
    object_key = f"uploads/{file_id}-{filename}"

   
    upload_url = s3.generate_presigned_url(
    "put_object",
    Params={
        "Bucket": bucket,
        "Key": object_key
    },
    ExpiresIn=300
)


    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({
            "uploadUrl": upload_url,
            "fileKey": object_key
        })
    }
