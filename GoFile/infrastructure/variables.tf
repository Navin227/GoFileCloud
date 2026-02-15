# 1. AWS Region (where resources live)
variable "aws_region" {
  description = "AWS region for deployment (e.g., us-east-1, eu-west-1)"
  type        = string
  default     = "ap-south-1" # Change if needed
}

# 2. App Name (consistent prefix for resources)
variable "app_name" {
  description = "GoFile app name (used in resource naming)"
  type        = string
  default     = "gofile"
}

# 3. Environment (dev/prod)
variable "environment" {
  description = "Deployment environment (dev/prod)"
  type        = string
  default     = "dev" # Switch to "prod" for production
}

# 4. S3 Bucket Name (unique per environment)
variable "s3_bucket_name" {
  description = "S3 bucket for user files (must be globally unique)"
  type        = string
  # No default—set in environment-specific tfvars (e.g., dev/prod)
}

# 5. DynamoDB Table Name (unique per environment)
variable "dynamodb_table_name" {
  description = "DynamoDB table for file metadata (must be region-unique)"
  type        = string
  # No default—set in environment-specific tfvars
}

# 6. Lambda Function Base Name
variable "lambda_function_name" {
  description = "Base name for Lambda functions (e.g., gofile-processor)"
  type        = string
  default     = "gofile-processor"
}

# 7. API Gateway Name
variable "api_gateway_name" {
  description = "Name of the API Gateway REST API"
  type        = string
  default     = "gofile-api"
}

# 8. Cognito User Pool Name
variable "cognito_user_pool_name" {
  description = "Name of the Cognito User Pool (for authentication)"
  type        = string
  default     = "gofile-user-pool"
}

# 9. SNS Topic Name (for notifications)
variable "sns_topic_name" {
  description = "Name of the SNS topic for user notifications"
  type        = string
  default     = "gofile-notifications"
}