#!/bin/bash
# Quick deploy script - drop your App.js in this directory and run this script

echo "🚀 Quick Deploy Script"
echo "======================"

# Check if App.js exists
if [ ! -f "App.js" ]; then
    echo "❌ Error: No App.js file found!"
    echo "Please copy your App.js file to this directory and run again."
    exit 1
fi

# Clean up old build
echo "🧹 Cleaning up..."
rm -rf src/App.js build/ node_modules/ 2>/dev/null || true

# Setup if needed
if [ ! -f "package.json" ]; then
    echo "⚙️  Initial setup..."
    chmod +x setup.sh
    ./setup.sh
fi

# Copy new App.js
echo "📄 Copying App.js..."
cp App.js src/App.js

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t react-dashboard:latest .

# Run container
echo "🚀 Starting container..."
chmod +x run.sh
./run.sh

echo "✅ Deployment complete! Your app is now running."