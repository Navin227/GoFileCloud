variable "app_name" {
  description = "Name of the application (e.g., gofile)"
  type        = string
}

variable "environment" {
  description = "Environment (e.g., dev, prod)"
  type        = string
}

variable "uploads_bucket_arn" {
  description = "ARN of the uploads S3 bucket (from the S3 module)"
  type        = string
}

variable "processed_bucket_arn" {
  description = "ARN of the processed S3 bucket (from the S3 module)"
  type        = string
}

variable "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  type        = string
  nullable    = true  # Allow empty value until DynamoDB is created
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"  # or use var.region from root
}

variable "sqs_queue_arn" {
  type = string
}

