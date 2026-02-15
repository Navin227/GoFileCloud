terraform {
  backend "s3" {
    # Your manually created bucket
    bucket         = "s3-gofile-backend"

    # Path/filename for Terraform's state file *inside* your bucket (can stay as-is)
    key            = "global/terraform.tfstate"

    # MUST match the region where you created your bucket + DynamoDB table!
    region         = "ap-south-1" 

    # Your manually created DynamoDB lock table
    dynamodb_table = "dynamo-gofile-backend"

    # Always encrypt your state file (AWS handles this automatically)
    encrypt        = true
  }
}