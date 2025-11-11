#!/bin/bash

# Start SmartCart Backend
cd /Users/ruchithanandikonda/Desktop/Project/smartcart/backend

export DYNAMO_ENDPOINT=http://localhost:8000
export AWS_REGION=us-east-1
export S3_BUCKET=smartcart-receipts-dev
export JWT_SECRET=your-256-bit-secret-key-change-in-production-minimum-32-characters-long

echo "🚀 Starting SmartCart Backend..."
echo "📊 DynamoDB: http://localhost:8000"
echo "🌍 AWS Region: $AWS_REGION"
echo ""
echo "⏳ Compiling and starting... (this may take 1-2 minutes)"
echo "✅ Look for 'Started SmartCartApplication' when ready!"
echo ""

mvn spring-boot:run
