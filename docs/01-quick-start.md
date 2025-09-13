# Quick Start Guide

This guide will get DeepSpear AI running on your machine in just a few minutes using our fully functional Docker setup.

## 🎯 What You'll Achieve

By the end of this guide, you'll have:
- A complete 3-container architecture running locally
- Frontend accessible at http://localhost:3000
- Backend API accessible at http://localhost:8000
- PostgreSQL 16 database with persistent storage
- All services communicating via Docker networking

## ⚡ Prerequisites

Make sure you have installed:
- **Docker** (version 20.0 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** for cloning the repository

### Verify Prerequisites
```bash
# Check Docker installation
docker --version
docker-compose --version

# Should show Docker 20+ and Compose 2+
git --version
```

## 🚀 Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd DeepSpearAI
```

### 2. Start All Services ✅
```bash
# One command starts everything!
docker-compose up -d

# That's it! All containers are building and starting
```

**What happens automatically:**
- Downloads PostgreSQL 16 Alpine image
- Builds backend container with FastAPI
- Builds frontend container with React 18
- Creates Docker network for service communication
- Initializes database with schema
- Starts all services in correct order

### 3. Verify Installation ✅

Check that all containers are running:

```bash
# Check container status
docker ps

# Expected output:
# deepspear_frontend   running   0.0.0.0:3000->3000/tcp
# deepspear_backend    running   0.0.0.0:8000->8000/tcp  
# deepspear_database   running   0.0.0.0:5432->5432/tcp
```

### 4. Access the Application ✅

All services are now running! Open your web browser and navigate to:

- **🌐 Frontend Application**: http://localhost:3000
- **📡 Backend API**: http://localhost:8000
- **📚 API Documentation**: http://localhost:8000/docs
- **�️ Database**: localhost:5432

## 🧪 Test the Application

### 1. Test the Backend API ✅
```bash
# Test health endpoint
curl http://localhost:8000/api/v1/health

# Expected response:
# {"status":"healthy","service":"DeepSpear AI Detection API","version":"1.0.0"}

# Test root endpoint
curl http://localhost:8000/

# Expected response:
# {"message":"Welcome to DeepSpear AI - Fake Content Detection API","version":"1.0.0","docs":"/docs"}
```

### 2. Test the Frontend ✅
1. Go to http://localhost:3000
2. You should see the DeepSpear AI homepage with responsive design
3. Navigate through different pages to verify routing works
4. Check that the interface is mobile-friendly

### 3. Test Database Connection ✅
```bash
# Check backend can connect to database
docker logs deepspear_backend

# Should show: "Application startup complete" without errors
```

## 🔧 Essential Commands

### Managing All Services
```bash
# Start all services
docker-compose up -d

# Stop all services  
docker-compose down

# Restart all services
docker-compose restart

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend  
docker-compose logs -f database
```

### Individual Service Management
```bash
# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart database

# Rebuild and restart (after code changes)
docker-compose build backend
docker-compose up -d backend
```

### Database Operations
```bash
# Connect to PostgreSQL database
docker exec -it deepspear_database psql -U enter_username_here -d deepspearai

# View detection results table
docker exec deepspear_database psql -U enter_username_here -d deepspearai -c "SELECT * FROM detection_results LIMIT 5;"

# Database backup
docker exec deepspear_database pg_dump -U enter_username_here deepspearai > backup.sql

# Database restore  
docker exec -i deepspear_database psql -U enter_username_here deepspearai < backup.sql
```

## 🐛 Quick Troubleshooting

### All Containers Won't Start
```bash
# Check if ports are already in use
ss -tlnp | grep -E ':3000|:8000|:5432'

# If ports are in use, stop conflicting services
sudo systemctl stop postgresql  # If you have local PostgreSQL
# Or modify ports in docker-compose.yml
```

### Container Build Failures
```bash
# Clean up and rebuild
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### Backend API Not Responding
```bash
# Check backend container logs
docker logs deepspear_backend

# Should see: "Application startup complete"
# If you see database connection errors, wait a moment for database to start
```

### Frontend Won't Load
```bash
# Check frontend container logs
docker logs deepspear_frontend

# Verify frontend is serving on port 3000
curl -I http://localhost:3000
```

### Database Connection Issues
```bash
# Check database container logs
docker logs deepspear_database

# Should see: "database system is ready to accept connections"

# Test database connectivity
docker exec deepspear_database pg_isready -U enter_username_here
```

## 📝 Container Configuration

The Docker setup automatically configures:

### Environment Variables (`.env`)
```bash
# Database Configuration (automatically used by containers)
DB_HOST=enter_db_host_here                    # Docker service name
DB_PORT=enter_db_port_here
DB_NAME=enter_db_name_here
DB_USER=enter_uername_here
DB_PASSWORD=enter_password_here

# Backend Configuration
SECRET_KEY=your-secret-key-here
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Network Configuration
- **Network Name**: `deepspearai_deepspear_network`
- **Network Type**: Bridge network for container isolation
- **Service Discovery**: Containers communicate via service names
- **Port Mapping**: Host ports mapped to container ports

### Volume Configuration
- **Database Volume**: `deepspearai_postgres_data` for persistent storage
- **Code Volumes**: Live code mounting for development

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Three Docker containers are running (frontend, backend, database)
- ✅ Frontend loads without errors at http://localhost:3000
- ✅ Backend API responds at http://localhost:8000/api/v1/health
- ✅ API documentation loads at http://localhost:8000/docs
- ✅ No database connection errors in backend logs
- ✅ All containers show "Up" status in `docker ps`

## 🚀 Next Steps

Now that you have DeepSpear AI running with Docker:

1. **Explore the API**: Visit http://localhost:8000/docs for interactive documentation
2. **Learn the Architecture**: Read the [Architecture Overview](./04-architecture.md) 
3. **Set Up Development**: Follow the [Development Setup Guide](./02-development-setup.md)
4. **Test the System**: Check out the [Testing Guide](./03-testing.md)
5. **Add Your ML Model**: See [ML Model Integration](./08-ml-integration.md)

## 🔄 Daily Development Workflow

```bash
# Start your development day
docker-compose up -d

# Check everything is running
docker ps

# View logs if needed
docker-compose logs -f backend frontend

# Stop when done
docker-compose down
```

## 🆘 Need Help?

If you encounter issues:
1. Check container logs: `docker-compose logs [service-name]`
2. Verify all containers are running: `docker ps`
3. Review the [Troubleshooting Guide](./12-troubleshooting.md)
4. Ensure Docker and Docker Compose are properly installed
5. Check system resources (RAM, disk space)

**System Requirements:**
- RAM: 4GB minimum, 8GB recommended
- Storage: 5GB free space
- CPU: 2 cores minimum
- OS: Linux, macOS, or Windows with Docker Desktop