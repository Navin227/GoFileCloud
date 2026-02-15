import boto3
import json
import io
import requests  # type: ignore
import os
from pypdf import PdfReader

# ---------- AWS Clients ----------
s3 = boto3.client("s3")

# ---------- HuggingFace Config ----------
HF_API_URL = "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6"
HF_TOKEN = os.environ["HF_API_TOKEN"]

headers = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/json"
}

# ---------- PDF Text Extraction ----------
def extract_pdf_text(bucket, key):
    obj = s3.get_object(Bucket=bucket, Key=key)
    reader = PdfReader(io.BytesIO(obj["Body"].read()))
    text = ""
    for page in reader.pages:
        t = page.extract_text()
        if t:
            text += t + "\n"
    return text


# ---------- Chunking ----------
def chunk_text(text, max_chars=3500):
    chunks = []
    current = ""
    for line in text.split("\n"):
        if len(current) + len(line) > max_chars:
            chunks.append(current)
            current = line
        else:
            current += "\n" + line
    if current:
        chunks.append(current)
    return chunks[:5]  # safety limit


# ---------- HF Summarization ----------
def summarize_chunk(text):
    payload = {
        "inputs": f"""
Summarize the following document into a concise, high-level abstract.
Focus on intent, key ideas, and outcomes.
Do NOT copy headings or page structure.

Document:
{text}
""",
        "parameters": {
            "max_length": 200,
            "min_length": 80,
            "do_sample": False,
            "truncation": True
        }
    }

    res = requests.post(HF_API_URL, headers=headers, json=payload)
    res.raise_for_status()

    data = res.json()
    if isinstance(data, list) and "summary_text" in data[0]:
        return data[0]["summary_text"]

    return str(data)


# ---------- Lambda Handler ----------
def handle_summarize(event, context):
    body = json.loads(event["body"])
    bucket = body["bucket"]
    key = body["key"]

    text = extract_pdf_text(bucket, key)
    chunks = chunk_text(text)

    summaries = [summarize_chunk(chunk) for chunk in chunks]
    final_summary = "\n\n".join(summaries)

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({
            "summary": final_summary
        })
    }
