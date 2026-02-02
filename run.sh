#!/bin/bash
PORT=${1:-3000}
CONTAINER_NAME="react-dashboard-${PORT}"

echo "🚀 Starting container on port $PORT..."

# Stop and remove existing container with the same name
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Run new container
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$PORT":80 \
  --restart unless-stopped \
  react-dashboard:latest

# Wait a moment for the container to start
sleep 2

# Check if container is running
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "✅ Container '$CONTAINER_NAME' is running!"
    echo "🌐 Open: http://localhost:$PORT"
    echo ""
    echo "📊 Container status:"
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "❌ Container failed to start. Check logs with: docker logs $CONTAINER_NAME"
    exit 1
fi