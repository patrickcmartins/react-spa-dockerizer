.PHONY: setup build run clean debug test

setup:
	@echo "⚙️  Setting up project..."
	chmod +x setup.sh
	./setup.sh

build: setup
	@echo "🔨 Building Docker image..."
	chmod +x build.sh
	./build.sh

run: build
	@echo "🚀 Running container..."
	chmod +x run.sh
	./run.sh

clean:
	@echo "🧹 Cleaning up..."
	chmod +x clean.sh
	./clean.sh

debug:
	@echo "🔧 Debugging..."
	chmod +x debug.sh
	./debug.sh

test:
	@echo "🧪 Testing..."
	@if [ -f "App.js" ]; then \
		echo "✅ App.js exists"; \
		lines=$$(wc -l < App.js); \
		echo "   Lines: $$lines"; \
	else \
		echo "❌ App.js missing"; \
	fi
	@if docker --version > /dev/null 2>&1; then \
		echo "✅ Docker is installed"; \
	else \
		echo "❌ Docker not found"; \
	fi

help:
	@echo "Available commands:"
	@echo "  make setup    - Setup project structure"
	@echo "  make build    - Build Docker image"
	@echo "  make run      - Build and run container"
	@echo "  make clean    - Clean up Docker resources"
	@echo "  make debug    - Debug the current setup"
	@echo "  make test     - Test prerequisites"
	@echo "  make help     - Show this help"