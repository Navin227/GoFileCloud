data "aws_caller_identity" "current" {}

resource "aws_api_gateway_rest_api" "this" {
  name        = "${var.app_name}-${var.environment}-api"
  description = "GoFile Multi-Tool API"
}

locals {
  api_routes = {
    "upload-url" = "GET"

    "compress" = "ANY"   # 👈 IMPORTANT

    "convert"  = "ANY"
    "merge"    = "POST"
    "split"    = "POST"
    "summarize"= "POST"
    "query"    = "POST"
  }
}



# --- 1. Resources (Paths) ---
resource "aws_api_gateway_resource" "tools" {
  for_each    = local.api_routes
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = each.key
}

# --- 2. Authorizer ---
resource "aws_api_gateway_authorizer" "cognito" {
  name            = "${var.app_name}-${var.environment}-cognito"
  rest_api_id     = aws_api_gateway_rest_api.this.id
  type            = "COGNITO_USER_POOLS"
  provider_arns   = [var.cognito_user_pool_arn]
  identity_source = "method.request.header.Authorization"
}

# --- 3. Functional Methods (GET/POST) ---
resource "aws_api_gateway_method" "methods" {
  for_each      = local.api_routes
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.tools[each.key].id
  http_method   = each.value
  authorization = "NONE"
  # authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "lambda" {
  for_each                = local.api_routes
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.tools[each.key].id
  http_method             = aws_api_gateway_method.methods[each.key].http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${var.lambda_function_arn}/invocations"
  
  depends_on = [aws_api_gateway_method.methods]
}

# --- 4. CORS: OPTIONS Method ---
resource "aws_api_gateway_method" "options" {
  for_each      = local.api_routes
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.tools[each.key].id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# --- 5. CORS: OPTIONS Integration (MOCK) ---
resource "aws_api_gateway_integration" "options" {
  for_each    = local.api_routes
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.tools[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\":200}"
  }
  
  depends_on = [aws_api_gateway_method.options]
}

# --- 6. CORS: OPTIONS Method Response ---
resource "aws_api_gateway_method_response" "options_200" {
  for_each    = local.api_routes
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.tools[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
  
  depends_on = [aws_api_gateway_method.options]
}

# --- 7. CORS: OPTIONS Integration Response ---
resource "aws_api_gateway_integration_response" "options_200" {
  for_each    = local.api_routes
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.tools[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = aws_api_gateway_method_response.options_200[each.key].status_code

response_parameters = {
  "method.response.header.Access-Control-Allow-Origin"  = "'http://localhost:8080',"
  "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'"
  "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
}
  depends_on = [
    aws_api_gateway_integration.options,
    aws_api_gateway_method_response.options_200
  ]
}

# --- 8. Deployment & Stage ---
resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  triggers = {
    redeploy = sha1(jsonencode([
      aws_api_gateway_integration.lambda,
      aws_api_gateway_integration.options,
      aws_api_gateway_integration_response.options_200
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.lambda,
    aws_api_gateway_integration_response.options_200
  ]
}


# --- 9. Lambda Permission ---
resource "aws_lambda_permission" "apigw_convert" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.this.execution_arn}/*/*"
}



# --- 10. Gateway Responses for CORS (Fixes CORS errors on 4xx/5xx) ---

resource "aws_api_gateway_gateway_response" "auth_failure_cors" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  response_type = "UNAUTHORIZED"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }
}

resource "aws_api_gateway_gateway_response" "server_error_cors" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  response_type = "DEFAULT_5XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }
}

resource "aws_iam_role" "apigw_cloudwatch" {
  name = "apigw-cloudwatch-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "apigateway.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}


resource "aws_iam_role_policy" "apigw_cloudwatch_inline" {
  name = "apigw-cloudwatch-inline"
  role = aws_iam_role.apigw_cloudwatch.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}



resource "aws_api_gateway_account" "this" {
  cloudwatch_role_arn = aws_iam_role.apigw_cloudwatch.arn
}

resource "aws_api_gateway_stage" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  stage_name  = var.stage_name
  deployment_id = aws_api_gateway_deployment.this.id

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.apigw_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      responseLength = "$context.responseLength"
      errorMessage   = "$context.error.message"
    })
  }

  depends_on = [
    aws_api_gateway_account.this
  ]
}

resource "aws_cloudwatch_log_group" "apigw_logs" {
  name              = "/aws/apigateway/${aws_api_gateway_rest_api.this.name}"
  retention_in_days = 7
}

resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  stage_name  = aws_api_gateway_stage.this.stage_name
  method_path = "*/*"

  settings {
    logging_level      = "INFO"
    data_trace_enabled = true
    metrics_enabled    = true
  }
}

resource "aws_cloudwatch_log_group" "apigw_execution_logs" {
  name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.this.id}/${var.stage_name}"
  retention_in_days = 7
}
