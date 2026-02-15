import boto3
import json
import os

ecs = boto3.client("ecs")

CLUSTER = os.environ["ECS_CLUSTER"]
TASK_DEFINITION = os.environ["ECS_TASK_DEFINITION"]
SUBNETS = os.environ["ECS_SUBNETS"].split(",")
SECURITY_GROUPS = os.environ["ECS_SECURITY_GROUPS"].split(",")

DYNAMODB_TABLE = os.environ["DYNAMODB_TABLE"]
AWS_REGION = os.environ.get("AWS_REGION", "ap-south-1")
PROCESSED_BUCKET = os.environ.get("PROCESSED_BUCKET", "")

def trigger_worker(job_type: str, payload: dict):
    print("🚀 About to call RunTask")
    print("Cluster:", CLUSTER)
    print("Task Definition:", TASK_DEFINITION)
    print("Subnets:", SUBNETS)
    print("Security Groups:", SECURITY_GROUPS)
    print("Job Type:", job_type)
    print("Payload:", json.dumps(payload))

    resp = ecs.run_task(
        cluster=CLUSTER,
        launchType="FARGATE",
        taskDefinition=TASK_DEFINITION,
        networkConfiguration={
            "awsvpcConfiguration": {
                "subnets": SUBNETS,
                "securityGroups": SECURITY_GROUPS,
                "assignPublicIp": "ENABLED"
            }
        },
        overrides={
            "containerOverrides": [
                {
                    "name": "worker",
                    "environment": [
                        {"name": "JOB_TYPE", "value": job_type},
                        {"name": "JOB_PAYLOAD", "value": json.dumps(payload)},
                        {"name": "DYNAMODB_TABLE", "value": DYNAMODB_TABLE},
                        {"name": "AWS_REGION", "value": AWS_REGION},
                        {"name": "PROCESSED_BUCKET", "value": PROCESSED_BUCKET}
                        
                    ]
                }
            ]
        }
    )

    print("📦 RunTask response:", json.dumps(resp, default=str))
    return resp
