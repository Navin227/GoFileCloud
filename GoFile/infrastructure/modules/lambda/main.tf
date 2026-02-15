resource "aws_lambda_function" "this" {
  function_name = var.function_name
  role          = var.role_arn
  handler       = var.handler
  runtime       = var.runtime

  timeout      = var.timeout
  memory_size = var.memory_size

  # Lambda code from S3
  s3_bucket = var.lambda_bucket_name
  s3_key    = var.lambda_s3_key

environment {
  variables = merge(
    var.environment_variables,
    {
        hf_api_token = var.hf_api_token
    }
  )
}


  tracing_config {
    mode = "Active"
  }

  depends_on = [
    aws_cloudwatch_log_group.this
  ]
}

# CloudWatch log group (important to avoid auto-create issues)
resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 14
}

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${var.api_gateway_execution_arn}/*/*"
}
