resource "aws_cognito_user_pool_client" "app_client" {
  name         = "${var.app_name}-${var.environment}-client"
  user_pool_id = aws_cognito_user_pool.this.id

  # No client secret for public apps
  generate_secret = false

  # Allow callback/logout URLs (use list if provided, otherwise fall back to single callback_url)
  callback_urls = length(var.callback_urls) > 0 ? var.callback_urls : [var.callback_url]
  logout_urls   = length(var.logout_urls) > 0 ? var.logout_urls : [var.callback_url]

  # Enable OAuth flows only when Google creds are provided
  allowed_oauth_flows_user_pool_client = var.google_client_id != "" && var.google_client_secret != "" ? true : false
  allowed_oauth_flows                  = var.google_client_id != "" && var.google_client_secret != "" ? ["code", "implicit"] : []
  allowed_oauth_scopes                 = var.google_client_id != "" && var.google_client_secret != "" ? ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"] : []
  supported_identity_providers         = var.google_client_id != "" && var.google_client_secret != "" ? ["COGNITO", "Google"] : ["COGNITO"]

  # ✅ Enable necessary authentication flows
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  # Recommended settings
  prevent_user_existence_errors = "ENABLED"

}

resource "aws_cognito_user_pool" "this" {
  name = "${var.app_name}-${var.environment}-users"

  # Allow self sign-up
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  auto_verified_attributes = ["email"]

  # Requirement for Google users to be mapped to Cognito
  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true

    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  password_policy {
    minimum_length = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
  }
}

# This creates a "Login Page" URL hosted by AWS
resource "aws_cognito_user_pool_domain" "main" {
  # Use a provided domain if set, otherwise use a deterministic name based on app + env
  domain       = length(var.cognito_domain) > 0 ? var.cognito_domain : "${var.app_name}-${var.environment}-auth-domain"
  user_pool_id = aws_cognito_user_pool.this.id

  # Prevent accidental deletion of the reserved domain (keeps URL constant across accidental destroys)
  lifecycle {
    prevent_destroy = true
  }
}

# The connection to Google (created only when client id/secret are provided)
resource "aws_cognito_identity_provider" "google" {
  count = var.google_client_id != "" && var.google_client_secret != "" ? 1 : 0

  user_pool_id  = aws_cognito_user_pool.this.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "profile email openid"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
    attributes_url                = "https://openidconnect.googleapis.com/v1/userinfo"
    attributes_url_add_attributes = "false"
    authorize_url                 = "https://accounts.google.com/o/oauth2/v2/auth"
    oidc_issuer                   = "https://accounts.google.com"
    token_request_method          = "POST"
    token_url                     = "https://oauth2.googleapis.com/token"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
  }
}
resource "aws_cognito_user_pool_client" "this" {
  name         = "${var.app_name}-${var.environment}-client"
  user_pool_id = aws_cognito_user_pool.this.id

  # 1. This list MUST include "Google"
  supported_identity_providers = ["COGNITO", "Google"]

  # 2. These MUST match your local browser exactly
  callback_urls = ["http://localhost:8080/auth"]
  logout_urls   = ["http://localhost:8080/auth"]

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  # 3. This ensures Google is set up BEFORE the client tries to use it
  depends_on = [aws_cognito_identity_provider.google]
}