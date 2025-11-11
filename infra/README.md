# SmartCart Infrastructure as Code

This directory contains Terraform configuration for provisioning AWS infrastructure for SmartCart.

## Prerequisites

1. **AWS CLI** configured with credentials:
   ```bash
   aws configure
   ```

2. **Terraform** installed (>= 1.0):
   ```bash
   brew install terraform  # macOS
   # or download from https://www.terraform.io/downloads
   ```

3. **AWS Account** with appropriate permissions

## Quick Start

### 1. Initialize Terraform

```bash
cd infra
terraform init
```

### 2. Review the Plan

```bash
# Review what will be created
terraform plan
```

### 3. Apply Changes

```bash
# Create/update infrastructure
terraform apply

# Auto-approve (use with caution)
terraform apply -auto-approve
```

### 4. View Outputs

```bash
terraform output
```

## Infrastructure Components

### DynamoDB Tables
- **Users**: User accounts
- **PantryItems**: Household inventory
- **Deals**: Store deals and promotions
- **Receipts**: Receipt metadata

### S3 Bucket
- **Receipts Storage**: Original receipt images and Textract JSON
- Encryption enabled (SSE-S3)
- Versioning enabled
- Lifecycle policy (archive after 90 days)

### IAM Roles & Policies
- **App Role**: Permissions for ECS tasks (DynamoDB, S3, Textract)
- **Execution Role**: Permissions for ECS to pull images and write logs

### ECS/Fargate (Optional)
- **Cluster**: ECS cluster for running containers
- **Service**: Backend service running on Fargate
- **Task Definition**: Container configuration
- **ALB**: Application Load Balancer for public access

### ECR (Optional)
- **Repository**: Docker image repository for backend

## Configuration

### Variables

Edit `variables.tf` or create `terraform.tfvars`:

```hcl
aws_region    = "us-east-1"
environment   = "dev"
receipts_bucket = "smartcart-receipts-dev"
enable_ecs    = false  # Set to true to enable ECS deployment
backend_image = ""     # ECR image URI when deploying
```

### Environment-Specific Deployments

Create separate directories or use workspaces:

```bash
# Using workspaces
terraform workspace new dev
terraform workspace new prod

# Or separate directories
mkdir -p infra/dev infra/prod
```

## Deployment Options

### MVP Setup (Minimal)
Only creates DynamoDB tables and S3 bucket (no ECS):

```bash
# Set variable
terraform apply -var="enable_ecs=false"
```

### Full Production Setup
Includes ECS Fargate, ALB, VPC:

```bash
# Set variables
terraform apply \
  -var="enable_ecs=true" \
  -var="backend_image=123456789012.dkr.ecr.us-east-1.amazonaws.com/smartcart-backend:latest"
```

## Cost Considerations

### DynamoDB
- Uses PAY_PER_REQUEST billing mode
- No reserved capacity costs
- Pay only for what you use

### S3
- Standard storage pricing
- Glacier transition after 90 days (cheaper)
- Versioning adds minimal cost for small files

### ECS Fargate (if enabled)
- ~$15/month for minimal setup (0.25 vCPU, 0.5GB RAM)
- ALB: ~$20/month
- NAT Gateway: ~$32/month + data transfer
- **Total**: ~$67/month minimum for ECS setup

## Destroying Infrastructure

```bash
# Destroy all infrastructure
terraform destroy

# Destroy specific resources
terraform destroy -target=aws_ecs_service.backend
```

⚠️ **Warning**: This will delete all data in DynamoDB tables and S3 bucket!

## Troubleshooting

### Terraform State Lock
If state is locked:
```bash
terraform force-unlock <LOCK_ID>
```

### State Backend
For team collaboration, configure remote state:
```hcl
# Uncomment in main.tf
backend "s3" {
  bucket = "smartcart-terraform-state"
  key    = "dev/terraform.tfstate"
  region = "us-east-1"
}
```

### Permissions Issues
Ensure IAM user/role has permissions for:
- DynamoDB (CreateTable, DescribeTable, etc.)
- S3 (CreateBucket, PutBucketPolicy, etc.)
- IAM (CreateRole, AttachRolePolicy, etc.)
- ECS/ECR (if enable_ecs=true)
- VPC (if enable_ecs=true)

## Next Steps

1. **Set up CI/CD** (see Section 13 of spec)
   - Build and push Docker image to ECR
   - Deploy infrastructure via Terraform

2. **Configure Frontend** (S3 Static Website)
   - Create S3 bucket for frontend
   - Configure CloudFront distribution
   - Set up Route 53 (optional)

3. **Monitoring & Alerts**
   - CloudWatch alarms
   - Cost monitoring
   - Application logs

## References

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Architecture Best Practices](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)









