output "api_invoke_url" {
  value = module.api_gateway.invoke_url
}

output "user_pool_id" {
  value = module.cognito.user_pool_id
}

output "user_pool_client_id" {
  value = module.cognito.user_pool_client_id
}

output "user_pool_oauth_client_id" {
  description = "Cognito User Pool OAuth Client ID (used by Hosted UI)"
  value       = module.cognito.user_pool_oauth_client_id
}

output "user_pool_domain" {
  description = "Cognito user pool domain (used for Hosted UI)"
  value       = module.cognito.user_pool_domain
}

output "lambda_function_name" {
  value = module.lambda.lambda_function_name
}

output "auth_domain_url" {
  value = "${module.cognito.auth_domain}.auth.${var.region}.amazoncognito.com"
}