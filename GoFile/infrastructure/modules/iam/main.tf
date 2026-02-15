# 1. Lambda Execution Role (allows Lambda to assume this role)
resource "aws_iam_role" "lambda_execution_role" {
  name = "${var.app_name}-${var.environment}-lambda-role"

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
}

# 2. Policy: Read from the uploads S3 bucket
resource "aws_iam_policy" "lambda_s3_read_policy" {
  name        = "${var.app_name}-${var.environment}-lambda-s3-read-policy"
  description = "Allow Lambda to read from the uploads S3 bucket"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",   # Read files
          "s3:ListBucket"   # List files in the bucket
        ]
        Effect   = "Allow"
        Resource = [
          var.uploads_bucket_arn,       # Bucket ARN
          "${var.uploads_bucket_arn}/*" # Objects in the bucket
        ]
      }
    ]
  })
}

# 3. Policy: Write to the processed S3 bucket
resource "aws_iam_policy" "lambda_s3_write_policy" {
  name        = "${var.app_name}-${var.environment}-lambda-s3-write-policy"
  description = "Allow Lambda to write to the processed S3 bucket"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",   # Upload processed files
          "s3:PutObjectAcl"# Set file permissions
        ]
        Effect   = "Allow"
        Resource = [
          var.processed_bucket_arn,       # Bucket ARN
          "${var.processed_bucket_arn}/*" # Objects in the bucket
        ]
      }
    ]
  })
}

# 5. Policy: Publish to SNS (once it exists)
resource "aws_iam_policy" "lambda_sns_policy" {
  name        = "${var.app_name}-${var.environment}-lambda-sns-policy"
  description = "Allow Lambda to send notifications (SNS)"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sns:Publish" # Send notifications to users
        ]
        Effect   = "Allow"
        Resource = "*"  # Replace with actual SNS topic ARN later
      }
    ]
  })
}

# 6. Attach policies to the Lambda role
resource "aws_iam_role_policy_attachment" "lambda_s3_read_attach" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_s3_read_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_s3_write_attach" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_s3_write_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_sns_attach" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_sns_policy.arn
}

# 7. Output: IAM role ARN (used by Lambda module)
output "lambda_execution_role_arn" {
  value = aws_iam_role.lambda_execution_role.arn
}
resource "aws_iam_role_policy_attachment" "lambda_logs_attach" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  }

resource "aws_iam_policy" "lambda_dynamodb" {
  name        = "${var.app_name}-${var.environment}-dynamodb-rw"
  description = "Allow Lambda to write metadata to DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query"
        ]
        # FIX: Exact ARN of your table
        Resource = "arn:aws:dynamodb:ap-south-1:257394491429:table/gofile-metadata-dev"
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_sqs" {
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "sqs:SendMessage"
      ]
      Resource = var.sqs_queue_arn

    }]
  })
}

resource "aws_iam_role_policy" "lambda_run_ecs" {
  name = "lambda-run-ecs-task"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:RunTask"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_sqs_send" {
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "sqs:SendMessage"
        ]
        Resource = "arn:aws:sqs:ap-south-1:257394491429:gofile-compress-queue-dev"
      }
    ]
  })
}

