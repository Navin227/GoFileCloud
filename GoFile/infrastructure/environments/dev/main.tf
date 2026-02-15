module "s3" {
  source      = "../../modules/s3"
  base_name   = var.app_name
  environment = var.environment
  versioning  = true
  tags = {
    Environment = var.environment
  }
}

module "iam" {
  source                 = "../../modules/iam"
  app_name               = var.app_name
  environment            = var.environment
  uploads_bucket_arn     = module.s3.uploads_bucket_arn   # From S3 module
  processed_bucket_arn   = module.s3.processed_bucket_arn # From S3 module
  dynamodb_table_arn     = null                           # Optional (DynamoDB not created yet)
  region                 = var.region
  sqs_queue_arn          = module.sqs.queue_arn
}

resource "aws_iam_role" "lambda_role" {
  name = "lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  # Attach permissions (example: S3 and CloudWatch access)
  # environments/dev/main.tf → aws_iam_role.lambda_role
}

# Create an explicit, non-deprecated IAM inline policy attached to the role
resource "aws_iam_role_policy" "lambda_policy" {
  name = "lambda-policy"
  role = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject", # Read FROM uploads bucket
          "s3:PutObject"  # Write TO processed bucket
        ]
        Resource = [
          "${module.s3.uploads_bucket_arn}/*", # Use uploads bucket ARN
          module.s3.uploads_bucket_arn,
          "${module.s3.processed_bucket_arn}/*", # Processed bucket (for writing)
          module.s3.processed_bucket_arn
        ]
      }
    ]
  })

}

resource "aws_s3_object" "lambda_package" {
  bucket = module.s3.uploads_bucket_name
  key    = "lambda/gofile-${var.environment}-file-processor.zip"

  source = "${path.module}/../../modules/lambda/lambda.zip"
  etag   = filemd5("${path.module}/../../modules/lambda/lambda.zip")
}

module "dynamodb" {
  source      = "../../modules/dynamodb"
  app_name    = var.app_name    # From your dev variables (e.g., "gofile")
  environment = var.environment # From your dev variables (e.g., "dev")
  tags = {
    Environment = var.environment
  }
}
# 1 Allow S3 to invoke the Lambda (create this in the dev root module)
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowS3InvokeFromUploads"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda.lambda_function_name # uses lambda module output
  principal     = "s3.amazonaws.com"
  source_arn    = module.s3.uploads_bucket_arn # uses s3 module output
}

# 2 Configure S3 bucket notification to call the Lambda (note: this may replace other notifs)
resource "aws_s3_bucket_notification" "uploads_notify" {
  bucket = module.s3.uploads_bucket_name

  lambda_function {
    lambda_function_arn = module.lambda.lambda_function_arn
    events              = ["s3:ObjectCreated:*"]
    # optional: add filter_prefix/filter_suffix
    # filter_prefix = "uploads/"
  }

  depends_on = [aws_lambda_permission.allow_s3]
}

module "cognito" {
  source      = "../../modules/cognito"
  app_name    = var.app_name
  environment = var.environment
  region      = var.region

  # Forward Google OAuth and callback settings from the environment
  cognito_domain       = var.cognito_domain
  google_client_id     = var.google_client_id
  google_client_secret = var.google_client_secret
  callback_urls        = length(var.callback_urls) > 0 ? var.callback_urls : []
  logout_urls          = length(var.logout_urls) > 0 ? var.logout_urls : []
}
module "lambda" {
  source = "../../modules/lambda"

  function_name = "gofile-${var.environment}-file-processor"
  role_arn      = aws_iam_role.lambda_role.arn

  lambda_bucket_name = module.s3.uploads_bucket_name
  lambda_s3_key      = aws_s3_object.lambda_package.key

  api_gateway_execution_arn = module.api_gateway.execution_arn

  handler      = "main.handler"
  runtime      = "python3.10"
  timeout      = 30
  memory_size  = 512
  hf_api_token = var.hf_api_token

  environment_variables = {
    ENV                 = var.environment
    UPLOADS_BUCKET      = module.s3.uploads_bucket_name
    PROCESSED_BUCKET    = module.s3.processed_bucket_name
    DYNAMODB_TABLE      = module.dynamodb.table_name
    HF_API_TOKEN        = var.hf_api_token
    ECS_CLUSTER         = module.ecs.cluster_name
    ECS_TASK_DEFINITION = module.ecs.task_definition_arn
    ECS_SUBNETS         = join(",", var.subnet_ids)
    ECS_SECURITY_GROUPS = module.ecs.security_group_id
    COMPRESS_QUEUE_URL = module.sqs.queue_url
    COMPRESS_QUEUE_ARN = module.sqs.queue_arn

  }

}


module "api_gateway" {
  source = "../../modules/api_gateway"

  app_name    = var.app_name
  environment = var.environment
  region      = var.region
  stage_name  = var.stage_name

  cognito_user_pool_arn = module.cognito.user_pool_arn

  # 🔥 PASS LAMBDA DETAILS EXPLICITLY
  lambda_function_name = module.lambda.lambda_function_name
  lambda_function_arn  = module.lambda.lambda_function_arn
}


module "sqs" {
  source      = "../../modules/sqs"
  environment = var.environment
}


module "ecs" {
  source = "../../modules/ecs"


  project     = "gofile"
  environment = "dev"
  region      = "ap-south-1"


  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids

  ecr_image = "257394491429.dkr.ecr.ap-south-1.amazonaws.com/gofile-worker:latest"
}

