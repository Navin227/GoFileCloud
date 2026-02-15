import json
import boto3
import os
import uuid
from ecs_trigger import trigger_worker
from boto3.dynamodb.conditions import Key

dynamo = boto3.resource("dynamodb")
s3 = boto3.client("s3")

TABLE = dynamo.Table(os.environ["DYNAMODB_TABLE"])

def response(code, body):
    return {
        "statusCode": code,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(body)
    }

def handle_post(event):
    body = json.loads(event["body"])

    job_id = str(uuid.uuid4())

    item = item = {
    "file_id": body["key"],          # 🔴 S3 key ONLY
    "jobId": job_id,
    "jobType": "compress",
    "status": "PROCESSING",
    "inputBucket": body["bucket"],
    "inputKey": body["key"],
    "level": body.get("level", "mid"),

}


    # save job
    TABLE.put_item(Item=item)

    # trigger ECS worker
    trigger_worker("compress", {
        "jobId": job_id,
        "bucket": body["bucket"],
        "key": body["key"],
        "level": item["level"],

    })

    return response(202, {
        "jobId": job_id,
        "status": "PROCESSING"
    })

def handle_get(event):
    params = event.get("queryStringParameters") or {}
    job_id = params.get("jobId")

    if not job_id:
        return response(400, {"error": "jobId is required"})

    res = TABLE.query(
    IndexName="jobId-index",
    KeyConditionExpression=Key("jobId").eq(job_id)
    )


    if not res["Items"]:
        return response(404, {"error": "Job not found"})

    item = res["Items"][0]

    # still processing
    if item["status"] != "DONE":
        return response(200, {
            "status": item["status"]
        })

    # DONE → generate download URL
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

def handle_compress(event, context):
    method = event["httpMethod"]

    if method == "POST":
        return handle_post(event)

    if method == "GET":
        return handle_get(event)

    return response(405, {"error": "Method not allowed"})
