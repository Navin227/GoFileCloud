import boto3
import json
import os
import subprocess
import uuid
from datetime import datetime
from pdf2docx import Converter # type: ignore

# ---------- AWS ----------
s3 = boto3.client("s3", region_name=os.environ.get("AWS_REGION"))
dynamodb = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION"))

# ---------- ENV ----------
TABLE_NAME = os.environ["DYNAMODB_TABLE"]
JOB_TYPE = os.environ["JOB_TYPE"]
JOB_PAYLOAD = json.loads(os.environ["JOB_PAYLOAD"])

UPLOAD_BUCKET = JOB_PAYLOAD["bucket"]
PROCESSED_BUCKET = os.environ.get("PROCESSED_BUCKET", UPLOAD_BUCKET)

TMP_INPUT = "/tmp/input"
TMP_OUTPUT = "/tmp/output"
TMP_DIR = "/tmp"
INPUT_FILE = f"{TMP_DIR}/input"
OUTPUT_FILE = f"{TMP_DIR}/output"


table = dynamodb.Table(TABLE_NAME)

PDFSETTINGS_MAP = {
    "low": "/screen",
    "mid": "/ebook",
    "high": "/printer"
}

# ---------- HELPERS ----------
def update_job(job_id, status, extra=None):
    update_expr = "SET #st = :st, updatedAt = :u"
    expr_names = {
        "#st": "status"
    }
    expr_values = {
        ":st": status,
        ":u": datetime.utcnow().isoformat()
    }

    if extra:
        for k, v in extra.items():
            placeholder = f"#{k}"
            value_key = f":{k}"
            update_expr += f", {placeholder} = {value_key}"
            expr_names[placeholder] = k
            expr_values[value_key] = v

    table.update_item(
        Key={
            "file_id": JOB_PAYLOAD["key"]   # ✅ SAME AS LAMBDA
        },
        UpdateExpression=update_expr,
        ExpressionAttributeNames=expr_names,
        ExpressionAttributeValues=expr_values
    )

# ======================
# 🔹 COMPRESS (AS-IS)
# ======================
def compress_pdf(level: str):
    preset = PDFSETTINGS_MAP.get(level, "/ebook")

    cmd = [
        "gs",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        f"-dPDFSETTINGS={preset}",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={TMP_OUTPUT}.pdf",
        f"{TMP_INPUT}.pdf"
    ]

    subprocess.run(cmd, check=True)

def handle_compress():
    job_id = JOB_PAYLOAD["jobId"]
    key = JOB_PAYLOAD["key"]
    level = JOB_PAYLOAD.get("level", "mid")

    print("UPLOAD_BUCKET =", UPLOAD_BUCKET)
    print("KEY =", key)
    print("JOB_ID =", job_id)

    update_job(job_id, "PROCESSING")

    try:
        s3.download_file(
            UPLOAD_BUCKET,
            key,
            f"{TMP_INPUT}.pdf"
        )

        compress_pdf(level)

        output_key = f"compressed/{uuid.uuid4()}.pdf"

        s3.upload_file(
            f"{TMP_OUTPUT}.pdf",
            PROCESSED_BUCKET,
            output_key,
            ExtraArgs={"ContentType": "application/pdf"}
        )

        update_job(job_id, "DONE", {
            "outputBucket": PROCESSED_BUCKET,
            "outputKey": output_key
        })

        print(f"✅ Compression done: {PROCESSED_BUCKET}/{output_key}")

    except Exception as e:
        update_job(job_id, "FAILED", {
            "errorMessage": str(e)
        })
        raise

# ======================
# 🔹 CONVERT (NEW)
# ======================
def convert_pdf_to_docx(input_pdf, output_docx):
    cv = Converter(input_pdf)
    cv.convert(output_docx)
    cv.close()

def convert_with_soffice(input_path, target_ext):
    subprocess.run([
        "soffice",
        "--headless",
        "--convert-to", target_ext,
        "--outdir", TMP_DIR,
        input_path
    ], check=True)

    base = os.path.splitext(os.path.basename(input_path))[0]
    return f"{TMP_DIR}/{base}.{target_ext}"

def handle_convert():
    job_id = JOB_PAYLOAD["jobId"]
    key = JOB_PAYLOAD["key"]
    conversion = JOB_PAYLOAD["conversion"]

    update_job(job_id, "PROCESSING")

    try:
        ext = key.split(".")[-1]
        input_path = f"{TMP_DIR}/input.{ext}"
        s3.download_file(UPLOAD_BUCKET, key, input_path)

        if conversion == "pdf_to_docx":
            output_path = f"{TMP_DIR}/output.docx"
            convert_pdf_to_docx(input_path, output_path)

        elif conversion == "docx_to_pdf":
            output_path = convert_with_soffice(input_path, "pdf")

        elif conversion == "pptx_to_pdf":
            output_path = convert_with_soffice(input_path, "pptx")

        else:
            raise Exception("Unsupported conversion")

        if not os.path.exists(output_path):
            raise Exception("Conversion failed: output file not generated")

        output_key = f"converted/{uuid.uuid4()}.{output_path.split('.')[-1]}"
        s3.upload_file(output_path, PROCESSED_BUCKET, output_key)

        update_job(job_id, "DONE", {
            "outputBucket": PROCESSED_BUCKET,
            "outputKey": output_key
        })

    except Exception as e:
        update_job(job_id, "FAILED", {"errorMessage": str(e)})
        raise


# ---------- ENTRY ----------
if __name__ == "__main__":
    if JOB_TYPE == "compress":
        handle_compress()
    elif JOB_TYPE == "convert":
        handle_convert()
    else:
        print("❌ Unknown JOB_TYPE:", JOB_TYPE)
