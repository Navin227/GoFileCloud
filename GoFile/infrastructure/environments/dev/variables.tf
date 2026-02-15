variable "app_name" {
  description = "Base application name (e.g., 'gofile')"
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g., 'dev', 'prod')"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}


variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
}

variable "allowed_oauth_flows" {
  description = "Allowed OAuth flows for Cognito"
  type        = list(string)
}

variable "allowed_oauth_scopes" {
  description = "Allowed OAuth scopes for Cognito"
  type        = list(string)
}

variable "callback_urls" {
  description = "Callback URLs passed to Cognito app clients"
  type        = list(string)
  default     = []
}

variable "logout_urls" {
  description = "Logout URLs passed to Cognito app clients"
  type        = list(string)
  default     = []
}

variable "google_client_id" {
  description = "Google OAuth Client ID (set to enable Google OAuth)"
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  default     = ""
}


# Variables passed to the Cognito module
variable "cognito_domain" {
  description = "Optional fixed domain (prefix) for Cognito hosted UI"
  type        = string
  default     = ""
}

variable "hf_api_token" {
  description = "HuggingFace API token"
  type        = string
  sensitive   = true
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}


