#!/bin/bash

# Start DynamoDB Local with persistent storage
# This ensures user data persists across restarts

DATA_DIR="${PWD}/.dynamodb-data"
PORT=8000

echo "Starting DynamoDB Local with persistent storage..."
echo "Data directory: $DATA_DIR"
echo "Port: $PORT"

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"

# Check if DynamoDB Local is already running
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "DynamoDB Local is already running on port $PORT"
    exit 0
fi

# Start DynamoDB Local with persistent storage
java -Djava.library.path=./DynamoDBLocal_lib \
     -jar DynamoDBLocal.jar \
     -sharedDb \
     -dbPath "$DATA_DIR" \
     -port $PORT \
     > /tmp/dynamodb.log 2>&1 &

DYNAMO_PID=$!
echo "DynamoDB Local started with PID: $DYNAMO_PID"
echo "PID saved to .dynamodb.pid"
echo $DYNAMO_PID > .dynamodb.pid

sleep 2

if kill -0 $DYNAMO_PID 2>/dev/null; then
    echo "✅ DynamoDB Local is running successfully"
    echo "📁 Data will be persisted in: $DATA_DIR"
else
    echo "❌ Failed to start DynamoDB Local. Check /tmp/dynamodb.log"
    exit 1
fi

