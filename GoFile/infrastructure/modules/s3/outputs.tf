# modules/s3/outputs.tf

# Expose the UPLOADS bucket (raw user files)
output "uploads_bucket_name" {
  description = "Name of the S3 uploads bucket"
  value       = aws_s3_bucket.uploads.bucket
}

output "uploads_bucket_arn" {
  description = "ARN of the S3 uploads bucket"
  value       = aws_s3_bucket.uploads.arn
}

# Expose the PROCESSED bucket (processed files)
output "processed_bucket_name" {
  description = "Name of the S3 processed files bucket"
  value       = aws_s3_bucket.processed.bucket
}

output "processed_bucket_arn" {
  description = "ARN of the S3 processed files bucket"
  value       = aws_s3_bucket.processed.arn
}