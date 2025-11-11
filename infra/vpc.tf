# VPC for ECS (if ECS is enabled)
# For MVP, you can use default VPC or create a simple VPC

# Simple VPC Configuration (optional, use default VPC for MVP)
resource "aws_vpc" "main" {
  count            = var.enable_ecs ? 1 : 0
  cidr_block       = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.app_name}-vpc-${var.environment}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  count  = var.enable_ecs ? 1 : 0
  vpc_id = aws_vpc.main[0].id

  tags = {
    Name = "${var.app_name}-igw-${var.environment}"
  }
}

# Public Subnets (for ALB)
resource "aws_subnet" "public" {
  count                   = var.enable_ecs ? 2 : 0
  vpc_id                  = aws_vpc.main[0].id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.app_name}-public-${count.index + 1}-${var.environment}"
    Type = "public"
  }
}

# Private Subnets (for ECS tasks)
resource "aws_subnet" "private" {
  count             = var.enable_ecs ? 2 : 0
  vpc_id            = aws_vpc.main[0].id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 2)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.app_name}-private-${count.index + 1}-${var.environment}"
    Type = "private"
  }
}

# Availability Zones Data Source
data "aws_availability_zones" "available" {
  state = "available"
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  count  = var.enable_ecs ? 1 : 0
  vpc_id = aws_vpc.main[0].id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main[0].id
  }

  tags = {
    Name = "${var.app_name}-public-rt-${var.environment}"
  }
}

# Route Table Associations for Public Subnets
resource "aws_route_table_association" "public" {
  count          = var.enable_ecs ? 2 : 0
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public[0].id
}

# NAT Gateway (for private subnets to access internet)
resource "aws_eip" "nat" {
  count  = var.enable_ecs ? 1 : 0
  domain = "vpc"

  tags = {
    Name = "${var.app_name}-nat-eip-${var.environment}"
  }
}

resource "aws_nat_gateway" "main" {
  count         = var.enable_ecs ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "${var.app_name}-nat-${var.environment}"
  }

  depends_on = [aws_internet_gateway.main]
}

# Route Table for Private Subnets
resource "aws_route_table" "private" {
  count  = var.enable_ecs ? 1 : 0
  vpc_id = aws_vpc.main[0].id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[0].id
  }

  tags = {
    Name = "${var.app_name}-private-rt-${var.environment}"
  }
}

# Route Table Associations for Private Subnets
resource "aws_route_table_association" "private" {
  count          = var.enable_ecs ? 2 : 0
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[0].id
}









