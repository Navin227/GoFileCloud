resource "aws_sqs_queue" "compress_queue" {
  name                      = "gofile-compress-queue-${var.environment}"
  visibility_timeout_seconds = 300
}
