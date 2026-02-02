#!/bin/bash
echo "🔨 Building Docker image..."

# Check if setup is complete
if [ ! -f "package.json" ]; then
    echo "⚠️  Project not set up. Running setup.sh first..."
    chmod +x setup.sh
    ./setup.sh
fi

# Check if App.js exists in root
if [ ! -f "App.js" ]; then
    echo "❌ Error: App.js not found in current directory!"
    echo "Please ensure your App.js file is in the current directory."
    exit 1
fi

# Copy App.js to src directory
echo "📄 Copying App.js to src directory..."
cp -f App.js src/App.js

# Check if it was copied
if [ ! -f "src/App.js" ]; then
    echo "❌ Error: Failed to copy App.js to src directory!"
    exit 1
fi

echo "✅ App.js copied successfully."

# Build the Docker image
echo "🚀 Building Docker image (this may take a few minutes)..."
docker build -t react-dashboard:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build complete!"
    echo "🚀 Run with: ./run.sh"
else
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi