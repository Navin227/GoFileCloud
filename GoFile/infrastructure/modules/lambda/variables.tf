variable "function_name" {
  description = "Lambda function name"
  type        = string
}

variable "role_arn" {
  description = "IAM role ARN for Lambda execution"
  type        = string
}

variable "handler" {
  description = "Lambda handler (e.g. main.handler)"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "python3.10"
}

variable "timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "memory_size" {
  description = "Lambda memory size in MB"
  type        = number
  default     = 512
}

variable "lambda_bucket_name" {
  description = "S3 bucket containing lambda zip"
  type        = string
}

variable "lambda_s3_key" {
  description = "S3 key for lambda zip file"
  type        = string
}

variable "environment_variables" {
  description = "Environment variables for Lambda"
  type        = map(string)
  default     = {}
}

variable "api_gateway_execution_arn" {
  description = "Execution ARN of API Gateway"
  type        = string
}

variable "hf_api_token" {
  description = "HuggingFace API token"
  type        = string
  sensitive   = true
}


