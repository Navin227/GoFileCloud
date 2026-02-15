import boto3

def handle_query(body, bucket, table_name):
    file_key = body.get('fileKey')
    question = body.get('query').lower()
    textract = boto3.client('textract')
    
    response = textract.detect_document_text(Document={'S3Object': {'Bucket': bucket, 'Name': file_key}})
    lines = [item['Text'] for item in response['Blocks'] if item['BlockType'] == 'LINE']
    
    # Basic RAG Search
    answer = "Sorry, I couldn't find information about that."
    for line in lines:
        if question in line.lower():
            answer = f"Found in document: {line}"
            break
            
    return {"answer": answer}