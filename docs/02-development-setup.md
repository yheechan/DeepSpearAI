# Development Setup Guide

This guide provides detailed instructions for setting up a development environment for DeepSpear AI with our fully functional Docker-based architecture.

## 🎯 Development Approaches

### 🐳 Docker Development (Recommended) ✅
- **Pros**: Identical to production, consistent environment, easy setup, no dependency conflicts
- **Cons**: Minimal learning curve if new to Docker
- **Best For**: Team development, CI/CD, production parity

### 💻 Native Development (Alternative)
- **Pros**: Direct debugging, faster rebuilds for experienced developers
- **Cons**: Environment setup complexity, dependency management
- **Best For**: Individual development, specific debugging needs

## 🐳 Docker Development Setup (Primary Method)

### Prerequisites ✅
```bash
# Verify Docker installation
docker --version          # Should be 20.0+
docker-compose --version  # Should be 2.0+

# All working! Docker setup fully tested and operational
```

### 1. Clone and Start Development ✅
```bash
git clone <repository-url>
cd DeepSpearAI

# One command to start everything
docker-compose up -d

# Verify all containers are running
docker ps
```

### 2. Development Workflow ✅

#### Container Architecture
```
Development Environment:
├── 🌐 Frontend Container (deepspear_frontend)
│   ├── React 18 with hot reloading
│   ├── Tailwind CSS with JIT compilation
│   ├── Volume: ./client:/app (live code updates)
│   └── Port: 3000
├── 🔧 Backend Container (deepspear_backend) 
│   ├── FastAPI with auto-reload
│   ├── SQLAlchemy with database
│   ├── Volume: ./server:/app (live code updates)
│   └── Port: 8000
└── 🗄️ Database Container (deepspear_database)
    ├── PostgreSQL 16 Alpine
    ├── Persistent volume storage
    └── Port: 5432
```

#### Live Development Commands ✅
```bash
# Start development environment (all services)
docker-compose up -d

# View live logs (essential for development)
docker-compose logs -f backend frontend

# Individual service logs
docker-compose logs -f backend
docker-compose logs -f frontend  
docker-compose logs -f database

# Restart specific service (after config changes)
docker-compose restart backend
docker-compose restart frontend

# Execute commands inside containers
docker exec -it deepspear_backend bash
docker exec -it deepspear_frontend sh
docker exec -it deepspear_database psql -U enter_username_here -d deepspearai
```

#### Hot Reloading ✅
Both services have hot reloading enabled:

**Backend Changes**: 
- Edit files in `./server/` 
- FastAPI automatically reloads
- Changes visible immediately

**Frontend Changes**:
- Edit files in `./client/src/`
- React hot reloads in browser
- Tailwind CSS recompiles automatically

### 3. Database Development ✅

#### Database Access & Operations
```bash
# Connect to PostgreSQL database
docker exec -it deepspear_database psql -U enter_username_here -d deepspearai

# Common development queries
\dt                                          # List all tables
\d detection_results                         # Describe table structure  
SELECT * FROM detection_results LIMIT 5;    # View recent results
SELECT COUNT(*) FROM detection_results;     # Count total records

# Exit database
\q
```

#### Database Management
```bash
# Database backup (for development snapshots)
docker exec deepspear_database pg_dump -U enter_username_here deepspearai > dev_backup.sql

# Database restore (reset to known state)
docker exec -i deepspear_database psql -U enter_username_here deepspearai < dev_backup.sql

# Reset database completely (removes all data)
docker-compose down -v
docker-compose up -d
```

#### Schema Changes
```bash
# After modifying models in server/app/models/models.py
# Restart backend to apply changes
docker-compose restart backend

# Check if changes applied
docker logs deepspear_backend
```

## 💻 Native Development Setup

### Backend Setup (Python/FastAPI)

#### 1. Python Environment
```bash
cd server

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. Database Setup
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE deepspearai;
CREATE USER enter_username_here WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE deepspearai TO enter_username_here;
\q

# Initialize database
psql -U enter_username_here -d deepspearai -f ../init.sql
```

#### 3. Environment Configuration
```bash
# Copy and edit environment file
cp .env.example .env

# Edit .env file
DATABASE_URL=postgresql://enter_username_here:your_password@localhost:5432/deepspearai
SECRET_KEY=your-development-secret-key
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000
```

#### 4. Run Backend
```bash
# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Server will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Frontend Setup (React)

#### 1. Node.js Environment
```bash
cd client

# Install Node.js (if not installed)
# Visit https://nodejs.org or use nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node

# Install dependencies
npm install
```

#### 2. Environment Configuration
```bash
# Create environment file
cat > .env << EOL
REACT_APP_API_URL=http://localhost:8000
GENERATE_SOURCEMAP=false
EOL
```

#### 3. Run Frontend
```bash
# Start React development server
npm start

# Application will be available at http://localhost:3000
# Automatically opens in browser
```

## 🛠️ Development Tools and IDE Setup

### Visual Studio Code Setup

#### Recommended Extensions
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.flake8",
    "ms-python.black-formatter",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode-remote.remote-containers"
  ]
}
```

#### VS Code Settings
```json
{
  "python.defaultInterpreterPath": "./server/venv/bin/python",
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "HTML"
  }
}
```

### Backend Development Tools

#### Install Development Dependencies
```bash
# Inside server directory
pip install pytest pytest-asyncio black flake8 mypy

# Code formatting
black .

# Linting
flake8 .

# Type checking
mypy .
```

#### Pre-commit Hooks
```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << EOL
repos:
  - repo: https://github.com/psf/black
    rev: 22.3.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/flake8
    rev: 4.0.1
    hooks:
      - id: flake8
EOL

# Install hooks
pre-commit install
```

### Frontend Development Tools

#### Code Quality Tools
```bash
# Inside client directory
npm install --save-dev eslint prettier

# Create prettier config
cat > .prettierrc << EOL
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
EOL
```

## 🧪 Development Workflow

### 1. Daily Development Routine
```bash
# Start development environment
docker-compose up -d

# Check logs for any issues
docker-compose logs backend frontend

# Make your changes to source code
# Backend: server/app/
# Frontend: client/src/

# Test your changes
# Backend: http://localhost:8000/docs
# Frontend: http://localhost:3000
```

### 2. Code Quality Checks
```bash
# Backend checks
cd server
black .                    # Format code
flake8 .                   # Check style
pytest                     # Run tests

# Frontend checks
cd client
npm run lint               # Check JavaScript/React code
npm run format             # Format code
npm test                   # Run tests
```

### 3. Database Development
```bash
# Reset database during development
docker-compose down -v
docker-compose up -d

# Or manually reset
docker-compose exec db psql -U enter_username_here -d deepspearai -c "DROP TABLE detection_results CASCADE;"
docker-compose restart backend  # Will recreate tables
```

## 🔧 Common Development Tasks

### Adding New API Endpoints
1. Create route handler in `server/app/api/`
2. Define Pydantic models if needed
3. Add database operations in models
4. Update frontend API service
5. Test the endpoint

### Adding New Frontend Components
1. Create component in `client/src/components/`
2. Style with Tailwind CSS classes
3. Add to appropriate page
4. Test responsiveness
5. Add error handling

### Database Schema Changes
1. Modify models in `server/app/models/models.py`
2. Generate migration: `alembic revision --autogenerate`
3. Review and edit migration file
4. Apply migration: `alembic upgrade head`
5. Update frontend if needed

## 🐛 Development Troubleshooting

### Port Conflicts
```bash
# Find processes using ports
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # Database

# Kill processes or change ports in configuration
```

### Module Import Errors
```bash
# Backend: Ensure you're in the right directory and virtual environment
cd server
source venv/bin/activate

# Frontend: Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Test connection
psql -U enter_username_here -d deepspearai -h localhost

# Reset database if corrupted
docker-compose down -v
docker-compose up -d
```

## 📚 Learning Resources

### Backend (FastAPI + Python)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Tutorial](https://docs.sqlalchemy.org/en/14/tutorial/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Frontend (React + JavaScript)
- [React Documentation](https://reactjs.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

### Development Tools
- [Docker Documentation](https://docs.docker.com/)
- [VS Code Python Tutorial](https://code.visualstudio.com/docs/python/python-tutorial)
- [Git Workflow Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)

## 🚀 Next Steps

After setting up your development environment:

1. **Learn the Architecture**: Read [Architecture Overview](./04-architecture.md)
2. **Run Tests**: Follow the [Testing Guide](./03-testing.md)
3. **Understand the Backend**: Check [Backend Development](./05-backend-development.md)
4. **Explore the Frontend**: Read [Frontend Development](./06-frontend-development.md)
5. **Integrate ML Models**: See [ML Model Integration](./08-ml-integration.md)