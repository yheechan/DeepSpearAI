# DeepSpear AI Documentation

Welcome to the comprehensive documentation for DeepSpear AI - a fully functional, containerized fake content detection service.

## 🎉 Current Status (September 2025)

**✅ Fully Operational Docker Setup**
- Complete 3-container architecture deployed and tested
- Frontend, Backend, and Database containers all working
- API endpoints responding with health checks passing
- Container networking and inter-service communication verified
- Production-ready configuration with persistent storage

## 📚 Documentation Structure

This documentation is organized into focused guides for our Docker-based architecture:

### 🚀 Getting Started
- **[Quick Start Guide](./01-quick-start.md)** - Get running in minutes with Docker ✅
- **[Development Setup](./02-development-setup.md)** - Container-based development workflow ✅  
- **[Testing Guide](./03-testing.md)** - Testing within Docker environment ✅

### 🏗️ Architecture & Development
- **[Architecture Overview](./04-architecture.md)** - Container system design ✅
- **[Backend Development](./05-backend-development.md)** - FastAPI in containers
- **[Frontend Development](./06-frontend-development.md)** - React development workflow
- **[Database Guide](./07-database.md)** - PostgreSQL 16 container management

### 🤖 AI/ML Integration
- **[ML Model Integration](./08-ml-integration.md)** - PyTorch model deployment in containers
- **[API Reference](./09-api-reference.md)** - Complete API documentation

### 🚀 Deployment & Production
- **[Docker Guide](./10-docker.md)** - Container orchestration and commands ✅
- **[Production Deployment](./11-production.md)** - Production deployment strategies
- **[Troubleshooting](./12-troubleshooting.md)** - Container-specific issue resolution

## 🎯 Learning Path

**For New Users (Fastest Path):**
1. **[Quick Start Guide](./01-quick-start.md)** - One command: `docker-compose up -d` ⚡
2. **[Architecture Overview](./04-architecture.md)** - Understand the container setup
3. **[Development Setup](./02-development-setup.md)** - Start developing immediately

**For Developers:**
1. **[Development Setup](./02-development-setup.md)** - Hot reloading with containers
2. **[Backend Development](./05-backend-development.md)** - FastAPI container development
3. **[Testing Guide](./03-testing.md)** - Container-based testing workflow
4. **[ML Model Integration](./08-ml-integration.md)** - Deploy AI models in containers

**For DevOps:**
1. **[Docker Guide](./10-docker.md)** - Complete container management
2. **[Production Deployment](./11-production.md)** - Scale and deploy containers
3. **[Troubleshooting](./12-troubleshooting.md)** - Resolve container issues

## ⚡ Quick Access

### Immediate Development
```bash
# Clone and start (30 seconds to running system)
git clone <repository-url>
cd DeepSpearAI
docker-compose up -d
```

### Application URLs
- **🌐 Frontend**: http://localhost:3000 - React application
- **🔧 Backend**: http://localhost:8000 - FastAPI with auto-docs
- **📖 API Docs**: http://localhost:8000/docs - Interactive documentation
- **🗄️ Database**: localhost:5432 - PostgreSQL 16

### Essential Commands
```bash
# View all container logs
docker-compose logs -f

# Access any container
docker exec -it deepspear_backend bash
docker exec -it deepspear_frontend sh  
docker exec -it deepspear_database psql -U enter_username_here -d deepspearai

# Stop everything
docker-compose down
```

## 🆘 Getting Help

### Container-Specific Help
- **Container Issues**: Check [Troubleshooting Guide](./12-troubleshooting.md)
- **API Problems**: Review [API Reference](./09-api-reference.md) and logs
- **Development Issues**: See [Development Setup](./02-development-setup.md)

### Debug Commands
```bash
# Check container status
docker ps

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Test service connectivity
curl http://localhost:8000/api/v1/health
curl -I http://localhost:3000
```

## 🔄 Development Workflow

### Daily Development
1. `docker-compose up -d` - Start all services
2. Make code changes (hot reloading enabled)
3. `docker-compose logs -f backend frontend` - Monitor changes
4. `docker-compose down` - Stop when done

### Container Benefits
- ✅ **Consistent Environment**: Identical dev/prod setup
- ✅ **Zero Setup Time**: No manual dependency installation  
- ✅ **Hot Reloading**: Instant code updates in containers
- ✅ **Easy Testing**: Isolated test environments
- ✅ **Production Parity**: Deploy exactly what you develop

## 📋 Prerequisites

Before starting, ensure you have:
- Docker and Docker Compose installed
- Git for version control
- Basic knowledge of Python, JavaScript, and SQL
- Understanding of REST APIs and web development concepts

Let's get started with the [Quick Start Guide](./01-quick-start.md)!