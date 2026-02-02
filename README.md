## 🚀Quick Start 

### 1. Clone & Prepare

```sh
# Clone the repository
git clone https://github.com/patrickcmartins/react-spa-dockerizer.git
cd react-spa-dockerizer

# Put your App.js in the directory
# (or use the included example)
```

### 2. Deploy!

```sh
# ONE COMMAND to build and run
make run

# OR use the quick script
./quick-deploy.sh
```

### 3. Open Your App

Visit: **[http://localhost:3000](http://localhost:3000/)**
## 📁 Project Structure

```sh
react-spa-dockerizer/
├── App.js                    # YOUR React component (drop it here)
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Optional multi-container setup
├── nginx.conf              # Optimized Nginx configuration
├── Makefile                # Automation commands
├── setup.sh                # Initial project setup
├── build.sh                # Docker build script
├── run.sh                  # Container run script
├── quick-deploy.sh         # All-in-one deployment
├── debug.sh                # Troubleshooting tool
├── clean.sh                # Cleanup script
├── package.json            # Auto-generated React dependencies
├── tailwind.config.js      # Tailwind configuration
├── public/                 # Auto-generated HTML files
│   ├── index.html
│   └── manifest.json
└── src/                    # Auto-generated source files
    ├── index.js
    ├── index.css
    └── App.js              # Your file gets copied here
```

## 🔄 How to Use Your Own App.js

### Option 1: Quick Replace (Recommended)

```sh
# 1. Replace the App.js file
cp /path/to/your/App.js .

# 2. Run quick deploy
./quick-deploy.sh
# or
make run
```

### Option 2: Manual Steps

```sh
# 1. Clean previous builds (optional)
make clean

# 2. Copy your App.js
cp your-app.js App.js

# 3. Setup (if first time)
make setup

# 4. Build and run
make run
```

### Option 3: Different Ports

```sh
# Run on port 8080
./run.sh 8080

# Run on port 5000 with custom name
docker run -d -p 5000:80 --name my-app react-dashboard:latest
```

## 🛠️ Available Commands

### Using Make (Recommended)

```sh
make setup    # Initial project setup
make build    # Build Docker image
make run      # Build and run container (port 3000)
make clean    # Remove all containers/images
make debug    # Show debugging information
make test     # Check prerequisites
make help     # Show all commands
```

### Using Direct Scripts

```sh
./setup.sh         # Create project structure
./build.sh         # Build Docker image
./run.sh           # Run container (port 3000)
./run.sh 8080      # Run on port 8080
./quick-deploy.sh  # One-command deployment
./debug.sh         # Troubleshoot issues
./clean.sh         # Clean everything
```

```sh
# View running containers
docker ps

# View logs
docker logs react-dashboard-3000

# Stop container
docker stop react-dashboard-3000

# Enter container shell
docker exec -it react-dashboard-3000 sh

# Remove all containers
docker rm $(docker ps -aq)
```

## 🔧 Advanced Usage

### Development with Hot Reload

```sh
# Build development image
docker build -f Dockerfile.dev -t react-dev .

# Run with volume mount for live updates
docker run -p 3000:3000 -v $(pwd)/src:/app/src react-dev
```

### Using Docker Compose

```sh
# Start with docker-compose
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Multiple Applications

```sh
# App 1 on port 3000
cd app1 && ./run.sh 3000

# App 2 on port 8080
cd app2 && ./run.sh 8080

# App 3 on port 5000
cd app3 && ./run.sh 5000
```

## 🐛 Troubleshooting

**1. "Port already in use"**

```sh
# Use a different port
./run.sh 8080

# Or find and stop the process
sudo lsof -i :3000
kill -9 <PID>
```

**2. "Docker build failed"**

```sh
# Clean and rebuild
make clean
make build

# Check Docker is running
docker --version
docker ps
``` 

**3. "App.js not found"**

```sh
# Ensure App.js is in the current directory
ls -la App.js

# Copy your file if missing
cp /path/to/your/file.js App.js
```

**4. "Container starts but app doesn't load"**

```sh
# Check container logs
docker logs react-dashboard-3000

# Check container is running
docker ps

# Restart container
docker restart react-dashboard-3000
```

### Debug Mode

```sh
# Run the debug script
./debug.sh

# This will check:
# - Docker installation
# - App.js existence
# - Project structure
# - Running containers
# - Image availability
```