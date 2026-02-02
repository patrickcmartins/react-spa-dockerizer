#!/bin/bash
echo "🔧 Debugging Docker setup..."
echo "============================="

echo "1. Checking current directory..."
pwd
ls -la

echo ""
echo "2. Checking App.js..."
if [ -f "App.js" ]; then
    echo "✅ App.js found"
    echo "   Size: $(wc -l < App.js) lines"
else
    echo "❌ App.js NOT found!"
fi

echo ""
echo "3. Checking project structure..."
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    cat package.json | grep -A5 '"dependencies"'
else
    echo "❌ package.json missing"
fi

echo ""
echo "4. Checking Docker..."
docker --version
docker images | grep react-dashboard || echo "No react-dashboard image found"

echo ""
echo "5. Checking containers..."
docker ps -a | grep react-dashboard || echo "No react-dashboard containers found"

echo ""
echo "6. Checking src directory..."
if [ -d "src" ]; then
    echo "✅ src directory exists"
    ls -la src/
else
    echo "❌ src directory missing"
fi

echo ""
echo "============================="
echo "To fix:"
echo "1. Run: ./setup.sh (if not done)"
echo "2. Ensure App.js is in current directory"
echo "3. Run: ./build.sh"
echo "4. Run: ./run.sh"