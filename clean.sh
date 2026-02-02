#!/bin/bash
echo "🧹 Cleaning up Docker resources..."

# Stop and remove containers
echo "Stopping containers..."
docker stop react-dashboard-3000 react-dashboard-8080 react-dashboard 2>/dev/null || true

echo "Removing containers..."
docker rm react-dashboard-3000 react-dashboard-8080 react-dashboard 2>/dev/null || true

# Remove images
echo "Removing images..."
docker rmi react-dashboard:latest 2>/dev/null || true

# Remove unused resources | Be CAREFUL while uncommenting this. Read the reference docs first: https://docs.docker.com/reference/cli/docker/system/prune/
# echo "Removing unused Docker resources..."
# docker system prune -f

echo "✅ Cleanup complete!"