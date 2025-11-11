# ECR Repository for Backend
resource "aws_ecr_repository" "backend" {
  count = var.enable_ecs ? 1 : 0
  name  = "${var.app_name}-backend"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = "${var.app_name}-Backend"
  }
}

# ECR Lifecycle Policy (keep last 10 images)
resource "aws_ecr_lifecycle_policy" "backend" {
  count      = var.enable_ecs ? 1 : 0
  repository = aws_ecr_repository.backend[0].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}









