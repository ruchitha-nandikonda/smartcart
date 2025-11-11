variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "receipts_bucket" {
  description = "S3 bucket name for receipts storage"
  type        = string
  default     = "smartcart-receipts-dev"
}

variable "backend_image" {
  description = "ECR image URI for backend (format: account.dkr.ecr.region.amazonaws.com/repo:tag)"
  type        = string
  default     = ""
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "smartcart"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "enable_ecs" {
  description = "Enable ECS Fargate deployment"
  type        = bool
  default     = false
}









