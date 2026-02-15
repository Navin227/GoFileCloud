terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"  # Use the latest stable AWS provider
    }
  }
}

# Configure the AWS provider (uses variables from variables.tf)
provider "aws" {
  region = var.aws_region
}

# Test Resource: Create a simple S3 bucket
resource "aws_s3_bucket" "gofile_test" {
  bucket = var.s3_bucket_name  # Uses the variable from dev/prod tfvars


  tags = {
    Name        = "${var.app_name}-test-bucket"
    Environment = var.environment
  }
}