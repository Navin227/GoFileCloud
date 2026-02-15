import json
import boto3
import os

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

TABLE_NAME = os.environ["DYNAMODB_TABLE"]
table = dynamodb.Table(TABLE_NAME)


def handler(event, context):
    """
    GET /compress/status?jobId=xxxx
    """

    params = event.get("queryStringParameters") or {}
    job_id = params.get("jobId")

    if not job_id:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "jobId is required"})
        }

    # 🔍 Query via GSI
    res = table.query(
        IndexName="jobId-index",
        KeyConditionExpression=boto3.dynamodb.conditions.Key("jobId").eq(job_id)
    )

    if not res["Items"]:
        return {
            "statusCode": 404,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Job not found"})
        }

    item = res["Items"][0]
    status = item["status"]

    # ⏳ Still running
    if status != "DONE":
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "status": status
            })
        }

    # ✅ DONE → generate download URL
    bucket = item["outputBucket"]
    key = item["outputKey"]

    download_url = s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": bucket,
            "Key": key
        },
        ExpiresIn=3600  # 1 hour
    )

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({
            "status": "DONE",
            "downloadUrl": download_url
        })
    }
