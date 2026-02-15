
output "table_name" {
  description = "Name of the DynamoDB metadata table"
  value       = aws_dynamodb_table.file_metadata.name
}

# ARN of the DynamoDB table (for IAM permissions)
output "table_arn" {
  description = "ARN of the DynamoDB metadata table"
  value       = aws_dynamodb_table.file_metadata.arn
}

