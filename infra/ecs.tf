# ECS Cluster
resource "aws_ecs_cluster" "main" {
  count = var.enable_ecs ? 1 : 0
  name  = "${var.app_name}-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.app_name}-Cluster"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "backend" {
  count             = var.enable_ecs ? 1 : 0
  name              = "/ecs/${var.app_name}-backend"
  retention_in_days = 7

  tags = {
    Name = "${var.app_name}-Backend-Logs"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "backend" {
  count                    = var.enable_ecs ? 1 : 0
  family                   = "${var.app_name}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution[0].arn
  task_role_arn            = aws_iam_role.app.arn

  container_definitions = jsonencode([
    {
      name  = "${var.app_name}-backend"
      image = var.backend_image != "" ? var.backend_image : "${aws_ecr_repository.backend[0].repository_url}:latest"

      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "S3_BUCKET"
          value = aws_s3_bucket.receipts.id
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend[0].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "${var.app_name}-Backend-Task"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  count              = var.enable_ecs ? 1 : 0
  name               = "${var.app_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb[0].id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "prod"

  tags = {
    Name = "${var.app_name}-ALB"
  }
}

# ALB Security Group
resource "aws_security_group" "alb" {
  count       = var.enable_ecs ? 1 : 0
  name        = "${var.app_name}-alb-sg-${var.environment}"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-ALB-SG"
  }
}

# ECS Security Group
resource "aws_security_group" "ecs" {
  count       = var.enable_ecs ? 1 : 0
  name        = "${var.app_name}-ecs-sg-${var.environment}"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    description     = "Backend from ALB"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb[0].id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-ECS-SG"
  }
}

# ALB Target Group
resource "aws_lb_target_group" "backend" {
  count                = var.enable_ecs ? 1 : 0
  name                 = "${var.app_name}-backend-tg-${var.environment}"
  port                 = 8080
  protocol             = "HTTP"
  vpc_id               = aws_vpc.main[0].id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/actuator/health"
    protocol            = "HTTP"
    matcher             = "200"
  }

  tags = {
    Name = "${var.app_name}-Backend-TG"
  }
}

# ALB Listener
resource "aws_lb_listener" "backend" {
  count             = var.enable_ecs ? 1 : 0
  load_balancer_arn = aws_lb.main[0].arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend[0].arn
  }
}

# ECS Service
resource "aws_ecs_service" "backend" {
  count           = var.enable_ecs ? 1 : 0
  name            = "${var.app_name}-backend-service-${var.environment}"
  cluster         = aws_ecs_cluster.main[0].id
  task_definition = aws_ecs_task_definition.backend[0].arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs[0].id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend[0].arn
    container_name   = "${var.app_name}-backend"
    container_port   = 8080
  }

  depends_on = [
    aws_lb_listener.backend,
    aws_iam_role_policy.cloudwatch_logs
  ]

  tags = {
    Name = "${var.app_name}-Backend-Service"
  }
}









