import json
from upload_url import handle_upload_url
from summarize import handle_summarize
from merge import handle_merge   
from split import handle_split
from compress import handle_compress
from convert import handle_convert

def handler(event, context):
    path = event.get("path", "")

    if path.endswith("/upload-url"):
        return handle_upload_url(event, context)

    if path.endswith("/summarize"):
        return handle_summarize(event, context)

    if path.endswith("/merge"):         
        return handle_merge(event, context)
    
    if path.endswith("/split"):
        return handle_split(event, context)

    if path.endswith("/compress"):
        return handle_compress(event, context)
    
    if path.endswith("/convert"):
        return handle_convert(event, context)

    return {
        "statusCode": 404,
        "body": json.dumps({"message": "Not found"})
    }

