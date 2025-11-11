# IAM Policy Document for App Permissions
data "aws_iam_policy_document" "app" {
  # S3 permissions for receipts
  statement {
    sid    = "S3ReceiptsAccess"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject"
    ]
    resources = ["${aws_s3_bucket.receipts.arn}/*"]
  }

  # S3 bucket operations (for listing)
  statement {
    sid    = "S3BucketAccess"
    effect = "Allow"
    actions = [
      "s3:ListBucket"
    ]
    resources = [aws_s3_bucket.receipts.arn]
  }

  # Textract permissions
  statement {
    sid    = "TextractAccess"
    effect = "Allow"
    actions = [
      "textract:AnalyzeExpense",
      "textract:DetectDocumentText"
    ]
    resources = ["*"]
  }

  # DynamoDB permissions
  statement {
    sid    = "DynamoDBAccess"
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem"
    ]
    resources = [
      aws_dynamodb_table.users.arn,
      aws_dynamodb_table.pantry.arn,
      aws_dynamodb_table.deals.arn,
      aws_dynamodb_table.receipts.arn
    ]
  }
}

# IAM Role for ECS Tasks
resource "aws_iam_role" "app" {
  name = "${var.app_name}-app-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.app_name}-AppRole"
  }
}

# IAM Policy for App
resource "aws_iam_policy" "app" {
  name        = "${var.app_name}-app-policy-${var.environment}"
  description = "Policy for SmartCart application"
  policy      = data.aws_iam_policy_document.app.json
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "app" {
  role       = aws_iam_role.app.name
  policy_arn = aws_iam_policy.app.arn
}

# CloudWatch Logs permissions (for ECS)
resource "aws_iam_role_policy" "cloudwatch_logs" {
  count = var.enable_ecs ? 1 : 0
  name  = "${var.app_name}-cloudwatch-logs"
  role  = aws_iam_role.app.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:log-group:/ecs/${var.app_name}*"
      }
    ]
  })
}

# ECS Task Execution Role (for pulling images, writing logs)
resource "aws_iam_role" "ecs_execution" {
  count = var.enable_ecs ? 1 : 0
  name  = "${var.app_name}-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# ECS Task Execution Policy
resource "aws_iam_role_policy_attachment" "ecs_execution" {
  count      = var.enable_ecs ? 1 : 0
  role       = aws_iam_role.ecs_execution[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Additional policy for ECR access
resource "aws_iam_role_policy" "ecr_access" {
  count = var.enable_ecs ? 1 : 0
  name  = "${var.app_name}-ecr-access"
  role  = aws_iam_role.ecs_execution[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })
}









