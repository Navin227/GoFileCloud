variable "app_name" {
  description = "Application name"
  type        = string
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "ARN of the Cognito User Pool used for authorization"
  type        = string
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "dev"
}

variable "lambda_function_name" {
  description = "Lambda function name to integrate with API Gateway"
  type        = string
}

variable "lambda_function_arn" {
  description = "Lambda function ARN"
  type        = string
}
