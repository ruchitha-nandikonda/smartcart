# Users Table
resource "aws_dynamodb_table" "users" {
  name         = "${var.app_name}-Users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = {
    Name = "${var.app_name}-Users"
  }
}

# PantryItems Table
resource "aws_dynamodb_table" "pantry" {
  name         = "${var.app_name}-PantryItems"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "sortKey"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "sortKey"
    type = "S"
  }

  tags = {
    Name = "${var.app_name}-PantryItems"
  }
}

# Deals Table
resource "aws_dynamodb_table" "deals" {
  name         = "${var.app_name}-Deals"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  tags = {
    Name = "${var.app_name}-Deals"
  }
}

# Receipts Table
resource "aws_dynamodb_table" "receipts" {
  name         = "${var.app_name}-Receipts"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "sortKey"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "sortKey"
    type = "S"
  }

  tags = {
    Name = "${var.app_name}-Receipts"
  }
}

# OTPs Table
resource "aws_dynamodb_table" "otps" {
  name         = "${var.app_name}-OTPs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "email"
  range_key    = "type"

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "type"
    type = "S"
  }

  tags = {
    Name = "${var.app_name}-OTPs"
  }
}





