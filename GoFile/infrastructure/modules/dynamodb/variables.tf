
variable "app_name" {
  description = "Base name of the application (used to name the table)"
  type        = string
}

# Deployment environment (dev/prod)
variable "environment" {
  description = "Environment (dev/prod) to make the table name unique"
  type        = string
}

# Tags for organization/cost tracking
variable "tags" {
  description = "Tags to apply to the DynamoDB table"
  type        = map(string)
  default     = {}
}

# Primary key (hash key) for the table (unique per file)
variable "hash_key" {
  description = "Primary (hash) key for the DynamoDB table"
  type        = string
  default     = "file_id" # We'll use a unique ID per file (e.g., UUID)
}

# Billing mode (PAY_PER_REQUEST = no fixed costs, great for dev)
variable "billing_mode" {
  description = "DynamoDB billing mode (PAY_PER_REQUEST or PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table (optional)"
  type        = string
  nullable    = true
  default     = null
}

variable "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table (optional)"
  type        = string
  nullable    = true
  default     = null
}