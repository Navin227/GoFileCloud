# infrastructure/modules/cognito/outputs.tf

output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.this.id
}

output "user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.this.arn
}

output "user_pool_client_id" {
  description = "Cognito User Pool Client ID (legacy app_client)"
  value       = aws_cognito_user_pool_client.app_client.id
}

output "user_pool_oauth_client_id" {
  description = "Cognito User Pool OAuth Client ID (app-client used by UI)"
  value       = aws_cognito_user_pool_client.this.id
}

output "user_pool_domain" {
  description = "Cognito User Pool domain (used for OAuth redirect URI)"
  value       = aws_cognito_user_pool_domain.main.domain
}

# Seed test user details (optional)
variable "test_user_email" {
  description = "Email or username for the test user"
  type        = string
  default     = "testuser@example.com"
}

variable "test_user_password" {
  description = "Temporary password for the test user"
  type        = string
  default     = "Test@1234"
}

output "auth_domain" {
  value = aws_cognito_user_pool_domain.main.domain
}