# modules/cognito/variables.tf

# App + Environment (for naming)
variable "app_name" {
  description = "Base name of your app (e.g., 'gofile')"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev/prod)"
  type        = string
}

# Optional: URLs for redirects (for frontend logins; leave empty for dev)
variable "callback_urls" {
  description = "URLs to redirect to after login (for frontend)"
  type        = list(string)
  default     = []
}

variable "logout_urls" {
  description = "URLs to redirect to after logout (for frontend)"
  type        = list(string)
  default     = []
}

variable "region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-1"
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  default     = "" # We will pass this from .tfvars
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  default     = ""
}

variable "callback_url" {
  default = "http://localhost:5173/"
}

# Optional override for the Cognito hosted UI domain (use a stable value to avoid changes on destroy/recreate)
variable "cognito_domain" {
  description = "Optional fixed domain (prefix) for Cognito hosted UI. If set, this value will be used exactly."
  type        = string
  default     = ""
}