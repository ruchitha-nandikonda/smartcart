output "dynamodb_tables" {
  description = "DynamoDB table names"
  value = {
    users     = aws_dynamodb_table.users.name
    pantry    = aws_dynamodb_table.pantry.name
    deals     = aws_dynamodb_table.deals.name
    receipts  = aws_dynamodb_table.receipts.name
  }
}

output "s3_bucket" {
  description = "S3 bucket for receipts"
  value = {
    name   = aws_s3_bucket.receipts.id
    arn    = aws_s3_bucket.receipts.arn
    region = aws_s3_bucket.receipts.region
  }
}

output "iam_role_arn" {
  description = "IAM role ARN for ECS tasks"
  value       = aws_iam_role.app.arn
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = var.enable_ecs ? aws_ecr_repository.backend[0].repository_url : null
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = var.enable_ecs ? aws_ecs_cluster.main[0].name : null
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = var.enable_ecs ? aws_ecs_service.backend[0].name : null
}









