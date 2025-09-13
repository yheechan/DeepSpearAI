# Architecture Overview

This document provides a comprehensive overview of the DeepSpear AI containerized system architecture, including component relationships, data flow, and Docker-based design.

## 🏗️ Container Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Docker Host Environment                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    HTTP/REST     ┌─────────────────┐           │
│  │                 │ ◄─────────────── │                 │           │
│  │ Frontend Container│                │Backend Container│           │
│  │   React Client  │ ─────────────────►│ FastAPI Server │           │
│  │   Port: 3000    │     JSON/Files   │   Port: 8000    │           │
│  └─────────────────┘                  └─────────────────┘           │
│           │                                      │                  │
│           │                                      │ SQL/ORM          │
│           ▼                                      ▼                  │
│  ┌─────────────────┐                   ┌─────────────────┐           │
│  │  Volume Mount   │                   │Database Container│           │
│  │  ./client:/app  │                   │ PostgreSQL 16   │           │
│  └─────────────────┘                   │   Port: 5432    │           │
│                                         └─────────────────┘           │
│                                                │                     │
│                                                ▼                     │
│                                       ┌─────────────────┐            │
│                                       │ Persistent Vol. │            │
│                                       │postgres_data    │            │
│                                       └─────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
          ▲                                        ▲                  
          │ Host Port 3000                         │ Host Port 8000   
          │                                        │ Host Port 5432   
    ┌──────────┐                            ┌─────────────┐           
    │ Browser  │                            │ API Clients │           
    │ Users    │                            │ External    │           
    └──────────┘                            └─────────────┘           
```

## 🐳 Containerized System Components

### 1. Frontend Container (`deepspear_frontend`)
**Base Image**: `node:18` (standard - not Alpine for compatibility)
**Technology**: React 18 + Tailwind CSS + Framer Motion

**Container Configuration**:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Responsibilities**:
- Serves React SPA with hot reloading
- Handles file uploads with drag & drop interface
- Provides responsive UI for web and mobile
- Communicates with backend via Docker networking

**Volume Mounting**:
- `./client:/app` - Live code updates during development
- `/app/node_modules` - Prevents host override of container dependencies

### 2. Backend Container (`deepspear_backend`)  
**Base Image**: `python:3.11-slim` (optimized for FastAPI)
**Technology**: FastAPI + SQLAlchemy + Uvicorn

**Container Configuration**:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Responsibilities**:
- REST API endpoints with automatic documentation
- File processing and ML inference
- Database operations via service networking
- CORS configuration for frontend communication

**Service Discovery**:
- Connects to database via hostname `database` (Docker service name)
- Receives requests from frontend via `deepspear_network`

### 3. Database Container (`deepspear_database`)
**Base Image**: `postgres:16-alpine` (minimal footprint)
**Technology**: PostgreSQL 16 with persistent storage

**Container Configuration**:
```yaml
database:
  image: postgres:16-alpine
  environment:
    POSTGRES_DB: enter_db_name_here
    POSTGRES_USER: enter_username_here  
    POSTGRES_PASSWORD: enter_password_here
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./init.sql:/docker-entrypoint-initdb.d/init.sql
```

**Responsibilities**:
- Persistent data storage with Docker volumes
- Automatic schema initialization from `init.sql`
- Optimized for container networking
- Transaction safety and data integrity

**Schema Design**:
```sql
-- Auto-initialized on container startup
detection_results
├── id (SERIAL PRIMARY KEY)
├── filename (VARCHAR NOT NULL)
├── file_path (VARCHAR NOT NULL)
├── file_size (INTEGER NOT NULL)
├── mime_type (VARCHAR NOT NULL)
├── is_fake (BOOLEAN NOT NULL)
├── confidence_score (FLOAT NOT NULL)
├── processing_time (FLOAT)
├── model_version (VARCHAR)
├── created_at (TIMESTAMP)
└── analysis_details (TEXT)
```

### 4. ML Processing Layer
**Technology**: PyTorch + Computer Vision Libraries

**Responsibilities**:
- Image preprocessing and normalization
- Neural network inference
- Confidence score calculation
- Model versioning and management

## 🔄 Data Flow Architecture

### 1. Detection Workflow
```
User Interaction → File Upload → Validation → ML Processing → Database Storage → Result Display
```

**Detailed Flow**:
1. **User uploads image** via React frontend
2. **Frontend validates** file type and size
3. **API receives** multipart/form-data POST request
4. **Backend validates** file and creates unique filename
5. **File is saved** to temporary storage
6. **ML service processes** image through PyTorch model
7. **Results are calculated** with confidence scores
8. **Database stores** detection results
9. **Response sent** back to frontend with result ID
10. **Frontend redirects** to results page
11. **Results page fetches** detailed information from API

### 2. API Request/Response Flow
```
Frontend                Backend                 Database               ML Service
   │                       │                       │                       │
   ├── POST /detect ─────► │                       │                       │
   │   (multipart/form)    │                       │                       │
   │                       ├── Validate file ───► │                       │
   │                       │                       │                       │
   │                       ├── Process image ─────────────────────────────► │
   │                       │                       │                       │
   │                       │ ◄─────────────── confidence score ───────────┤
   │                       │                       │                       │
   │                       ├── Store result ─────► │                       │
   │                       │                       │                       │
   │ ◄── JSON response ───┤                       │                       │
   │   (result_id, confidence)                    │                       │
   │                       │                       │                       │
   ├── GET /result/123 ──► │                       │                       │
   │                       │                       │                       │
   │                       ├── Query result ─────► │                       │
   │                       │                       │                       │
   │ ◄── JSON response ───┤ ◄── Result data ─────┤                       │
```

## 🏛️ Architectural Patterns

### 1. Layered Architecture
The system follows a layered architecture pattern:

**Presentation Layer** (React Frontend)
- Handles user interaction
- Manages UI state
- Performs client-side validation

**API Layer** (FastAPI Routes)
- Handles HTTP requests/responses
- Input validation and serialization
- Error handling and status codes

**Business Logic Layer** (Services)
- Core application logic
- ML model integration
- File processing workflows

**Data Access Layer** (SQLAlchemy ORM)
- Database operations
- Data modeling and relationships
- Query optimization

**Data Storage Layer** (PostgreSQL)
- Persistent data storage
- ACID compliance
- Backup and recovery

### 2. Microservice-Ready Design
While currently monolithic, the architecture supports future microservice decomposition:

**Potential Services**:
- **Detection Service**: Core ML processing
- **File Service**: Upload and storage management
- **Result Service**: Analysis result management
- **User Service**: Authentication and user management
- **Notification Service**: Real-time updates

### 3. Repository Pattern
Data access is abstracted through repository-like patterns:

```python
# Data access abstraction
class DetectionResultRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, detection_data: dict) -> DetectionResult:
        result = DetectionResult(**detection_data)
        self.db.add(result)
        self.db.commit()
        return result
    
    def get_by_id(self, result_id: int) -> DetectionResult:
        return self.db.query(DetectionResult).filter(
            DetectionResult.id == result_id
        ).first()
```

## 🛡️ Security Architecture

### 1. Input Validation
**Frontend Validation**:
- File type and size checking
- MIME type validation
- Client-side form validation

**Backend Validation**:
- Pydantic models for request validation
- File content verification
- SQL injection prevention through ORM

### 2. File Security
**Upload Security**:
- File type whitelist
- Maximum file size limits
- Temporary file storage with cleanup
- Path traversal prevention

**Storage Security**:
- Isolated upload directory
- Non-executable file permissions
- Automatic file cleanup

### 3. API Security
**Current Security Measures**:
- CORS configuration
- Request size limits
- Error message sanitization
- Input sanitization

**Future Security Enhancements**:
- JWT authentication
- Rate limiting
- API key management
- Request logging and monitoring

## 🚀 Performance Architecture

### 1. Frontend Performance
**Optimization Strategies**:
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size optimization
- Service worker for caching (future)

### 2. Backend Performance
**Optimization Strategies**:
- Async/await for I/O operations
- Background task processing
- Database query optimization
- Connection pooling
- Response compression

### 3. Database Performance
**Optimization Strategies**:
- Indexed queries on common search fields
- Connection pooling with SQLAlchemy
- Query result caching (future)
- Database query monitoring

### 4. ML Model Performance
**Optimization Strategies**:
- Model quantization for faster inference
- Batch processing for multiple images
- GPU acceleration when available
- Model caching in memory
- Async model inference

## 🔧 Configuration Architecture

### 1. Environment-Based Configuration
```python
# Environment configuration pattern
class Settings:
    database_url: str = os.getenv("DATABASE_URL")
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    secret_key: str = os.getenv("SECRET_KEY")
    allowed_origins: List[str] = os.getenv("ALLOWED_ORIGINS", "").split(",")
```

### 2. Configuration Layers
1. **Default Values**: Hardcoded fallbacks
2. **Environment Variables**: Runtime configuration
3. **Configuration Files**: Environment-specific settings
4. **Runtime Configuration**: Dynamic configuration updates

## 📊 Monitoring and Observability

### 1. Logging Architecture
**Log Levels and Categories**:
- **ERROR**: System errors and exceptions
- **WARN**: Performance issues and warnings
- **INFO**: Business logic events
- **DEBUG**: Detailed diagnostic information

**Log Structure**:
```json
{
  "timestamp": "2025-09-13T10:30:00Z",
  "level": "INFO",
  "service": "detection_api",
  "request_id": "req_123",
  "user_id": "user_456",
  "message": "Image analysis completed",
  "metadata": {
    "file_size": 2048000,
    "processing_time": 2.1,
    "confidence": 0.85
  }
}
```

### 2. Metrics and Monitoring
**Key Metrics**:
- Request rate and response time
- Detection accuracy and confidence distribution
- Error rates and types
- File upload success/failure rates
- Database query performance

**Future Monitoring Tools**:
- Prometheus for metrics collection
- Grafana for visualization
- Jaeger for distributed tracing
- ELK stack for log aggregation

## 🔄 Scalability Architecture

### 1. Horizontal Scaling
**Frontend Scaling**:
- CDN for static assets
- Multiple frontend instances behind load balancer

**Backend Scaling**:
- Stateless API design
- Load balancer with multiple API instances
- Database connection pooling

**Database Scaling**:
- Read replicas for query scaling
- Database sharding (future)
- Caching layer (Redis)

### 2. Vertical Scaling
**Resource Optimization**:
- CPU optimization for ML inference
- Memory optimization for large file processing
- Storage optimization for file uploads

## 🎯 Design Decisions and Trade-offs

### 1. Technology Choices

**FastAPI vs Flask**:
- ✅ **Chosen**: FastAPI for automatic API documentation
- ✅ **Benefit**: Type hints and validation
- ❌ **Trade-off**: Slightly steeper learning curve

**React vs Vue/Angular**:
- ✅ **Chosen**: React for component ecosystem
- ✅ **Benefit**: Large community and library support
- ❌ **Trade-off**: More complex state management

**PostgreSQL vs MongoDB**:
- ✅ **Chosen**: PostgreSQL for ACID compliance
- ✅ **Benefit**: Strong consistency and relationships
- ❌ **Trade-off**: Less flexible schema evolution

### 2. Architectural Decisions

**Monolithic vs Microservices**:
- ✅ **Chosen**: Monolithic for initial development
- ✅ **Benefit**: Simpler deployment and debugging
- ❌ **Trade-off**: Harder to scale individual components

**Synchronous vs Asynchronous Processing**:
- ✅ **Chosen**: Synchronous for simplicity
- ✅ **Benefit**: Easier error handling and user feedback
- ❌ **Trade-off**: Potential timeout issues for large files

## 🛠️ Development Workflow

### 1. Code Organization
**Separation of Concerns**:
- Clear separation between frontend and backend
- Service layer abstraction for business logic
- Repository pattern for data access
- Utility functions for common operations

### 2. API Design
**RESTful Principles**:
- Resource-based URLs (`/api/v1/detect`, `/api/v1/result/{id}`)
- HTTP methods for operations (POST, GET, PUT, DELETE)
- Status codes for response indication
- JSON for data exchange

### 3. Error Handling Strategy
**Layered Error Handling**:
- Frontend: User-friendly error messages
- API: Proper HTTP status codes and error details
- Backend: Detailed logging for debugging
- Database: Transaction rollback on errors

## 🚀 Future Architecture Enhancements

### 1. Short-term Improvements
- Implement JWT authentication
- Add request rate limiting
- Implement response caching
- Add comprehensive logging

### 2. Medium-term Enhancements
- Migrate to microservices architecture
- Implement event-driven architecture
- Add real-time notifications (WebSocket)
- Implement advanced ML model management

### 3. Long-term Vision
- Multi-tenant architecture
- Global CDN integration
- AI model marketplace
- Advanced analytics and reporting

## 📚 Related Documentation

- [Backend Development Guide](./05-backend-development.md) - Detailed backend implementation
- [Frontend Development Guide](./06-frontend-development.md) - React development patterns
- [Database Guide](./07-database.md) - Database design and operations
- [ML Integration Guide](./08-ml-integration.md) - Machine learning implementation
- [API Reference](./09-api-reference.md) - Complete API documentation

This architecture provides a solid foundation for the DeepSpear AI application while maintaining flexibility for future enhancements and scaling requirements.