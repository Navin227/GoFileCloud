import json
import uuid
import boto3
import os
from ecs_trigger import trigger_worker
from boto3.dynamodb.conditions import Key

dynamo = boto3.resource("dynamodb")
s3 = boto3.client("s3")

TABLE = dynamo.Table(os.environ["DYNAMODB_TABLE"])

def response(code, body):
    return {
        "statusCode": code,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps(body)
    }

def handle_post(event):
    body = json.loads(event["body"])

    job_id = str(uuid.uuid4())

    item = {
        "file_id": body["key"],          # PK
        "jobId": job_id,
        "jobType": "convert",
        "status": "PROCESSING",
        "inputBucket": body["bucket"],
        "inputKey": body["key"],
        "conversion": body["conversion"]
    }

    TABLE.put_item(Item=item)

    trigger_worker("convert", {
        "jobId": job_id,
        "bucket": body["bucket"],
        "key": body["key"],
        "conversion": body["conversion"]
    })

    return response(202, {"jobId": job_id, "status": "PROCESSING"})

def handle_get(event):
    params = event.get("queryStringParameters") or {}
    job_id = params.get("jobId")

    if not job_id:
        return response(400, {"error": "jobId required"})

    res = TABLE.query(
        IndexName="jobId-index",
        KeyConditionExpression=Key("jobId").eq(job_id)
    )

    if not res["Items"]:
        return response(404, {"error": "Job not found"})

    item = res["Items"][0]

    if item["status"] != "DONE":
        return response(200, {"status": item["status"]})

    url = s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": item["outputBucket"],
            "Key": item["outputKey"]
        },
        ExpiresIn=3600
    )

    return response(200, {
        "status": "DONE",
        "downloadUrl": url
    })

# --------------------
# ENTRY
# --------------------
def handle_convert(event, context):
    method = event["httpMethod"]

    if method == "POST":
        return handle_post(event)

    if method == "GET":
        return handle_get(event)

    return response(405, {"error": "Method not allowed"})
