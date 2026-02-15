
resource "aws_ecs_cluster" "this" {
  name = "${var.project}-${var.environment}-cluster"
}

data "aws_iam_policy_document" "ecs_assume" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}
resource "aws_cloudwatch_log_group" "ecs_worker" {
  name              = "/ecs/gofile-dev-worker"
  retention_in_days = 7
}

resource "aws_iam_role" "ecs_execution_role" {
  name = "gofile-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task_role" {
  name = "gofile-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}
resource "aws_iam_role_policy" "ecs_task_s3_policy" {
  name = "gofile-ecs-task-s3"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [
          "arn:aws:s3:::gofile-processed-dev",
          "arn:aws:s3:::gofile-uploads-dev"
        ]
      }
    ]
  })
}


resource "aws_security_group" "ecs" {
  name   = "${var.project}-${var.environment}-ecs-sg"
  vpc_id = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_task_definition" "worker" {
  family                   = "gofile-dev-worker"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "1024"
  memory                   = "2048"

  execution_role_arn = aws_iam_role.ecs_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn   # (agar already hai)

  container_definitions = jsonencode([
    {
      name  = "worker"
      image = "257394491429.dkr.ecr.ap-south-1.amazonaws.com/gofile-worker:latest"

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/gofile-dev-worker"
          awslogs-region        = "ap-south-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}
