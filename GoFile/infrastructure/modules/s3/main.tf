# 1. UPLOADS BUCKET
resource "aws_s3_bucket" "uploads" {
  bucket        = "${var.base_name}-uploads-${var.environment}"
  force_destroy = true
  tags          = merge(var.tags, { Name = "uploads" })
}

# Uploads CORS (Separate Resource)
resource "aws_s3_bucket_cors_configuration" "uploads_cors" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET"]
    allowed_origins = ["http://localhost:8080"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Uploads Encryption (Separate Resource - Fixes Warnings)
resource "aws_s3_bucket_server_side_encryption_configuration" "uploads_encryption" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Uploads Versioning
resource "aws_s3_bucket_versioning" "uploads_versioning" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = var.versioning ? "Enabled" : "Disabled"
  }
}


# 2. PROCESSED BUCKET
resource "aws_s3_bucket" "processed" {
  bucket        = "${var.base_name}-processed-${var.environment}"
  force_destroy = true
  tags          = merge(var.tags, { Name = "processed" })
}

# Processed CORS
resource "aws_s3_bucket_cors_configuration" "processed_cors" {
  bucket = aws_s3_bucket.processed.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["http://localhost:8080"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Processed Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "processed_encryption" {
  bucket = aws_s3_bucket.processed.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Processed Versioning
resource "aws_s3_bucket_versioning" "processed_versioning" {
  bucket = aws_s3_bucket.processed.id
  versioning_configuration {
    status = var.versioning ? "Enabled" : "Disabled"
  }
}