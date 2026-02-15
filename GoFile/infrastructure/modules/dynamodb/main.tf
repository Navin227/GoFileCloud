resource "aws_dynamodb_table" "file_metadata" {
  name         = "${var.app_name}-metadata-${var.environment}"
  billing_mode = var.billing_mode

  # Primary key (file-centric)
  hash_key = var.hash_key

  attribute {
    name = var.hash_key
    type = "S"
  }

  # 🔹 New attribute: jobId (for async jobs)
  attribute {
    name = "jobId"
    type = "S"
  }

  # 🔹 New attribute: jobType (compress / convert / split)
  attribute {
    name = "jobType"
    type = "S"
  }

  # 🔹 GSI: query jobs by jobId
  global_secondary_index {
    name            = "jobId-index"
    hash_key        = "jobId"
    projection_type = "ALL"
  }

  # 🔹 GSI: query all jobs of a type
  global_secondary_index {
    name            = "jobType-index"
    hash_key        = "jobType"
    projection_type = "ALL"
  }

  tags = merge(var.tags, {
    Environment = var.environment
    App         = var.app_name
    Purpose     = "File metadata + async job tracking"
  })
}
