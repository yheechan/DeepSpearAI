# Backend Development Guide

This comprehensive guide covers FastAPI backend development for DeepSpear AI within our Docker containerized environment.

## 🎯 Backend Overview

The DeepSpear AI backend runs in a dedicated Docker container with **FastAPI**, providing:
- Automatic API documentation at `/docs`
- Container-based development with hot reloading
- Database connectivity to PostgreSQL container
- Type hints and validation
- High performance with async support

## 🐳 Container-Based Development

### Container Setup ✅
```bash
# Backend container is automatically configured in docker-compose.yml
# Hot reloading enabled for development
docker-compose up -d backend

# Access backend container
docker exec -it deepspear_backend bash

# View live backend logs
docker-compose logs -f backend
```

### Container Configuration
```dockerfile
# server/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Start with hot reloading for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

## 🏗️ Project Structure

```
server/
├── app/
│   ├── __init__.py
│   ├── api/                    # API route handlers
│   │   ├── __init__.py
│   │   ├── detection.py        # Detection endpoints  
│   │   └── health.py           # Health check endpoints
│   ├── models/                 # Database models
│   │   ├── __init__.py
│   │   ├── database.py         # Container database connection
│   │   └── models.py           # SQLAlchemy models
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   └── ml_service.py       # ML processing service
│   └── utils/                  # Utility functions
│       ├── __init__.py
│       └── file_utils.py       # File handling utilities
├── uploads/                    # File upload storage (mounted volume)
├── main.py                     # Application entry point
├── requirements.txt            # Python dependencies
├── .env                       # Container environment variables
└── Dockerfile                 # Container configuration
```

## 🚀 FastAPI Application in Container

### Main Application (`main.py`) ✅

```python
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from app.api import detection, health
from app.models.database import engine, get_db
from app.models import models

# Load environment variables (from container environment)
load_dotenv()

# Create database tables (connects to database container)
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app with container-aware configuration
app = FastAPI(
    title=os.getenv("PROJECT_NAME", "DeepSpear AI"),
    description="AI-powered fake content detection service",
    version="1.0.0",
    docs_url="/docs",           # Available at http://localhost:8000/docs
    redoc_url="/redoc"          # Alternative docs at http://localhost:8000/redoc
)

# Configure CORS for frontend container communication
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (uploaded content accessible via container networking)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API routes with versioning
api_prefix = os.getenv("API_V1_PREFIX", "/api/v1")
app.include_router(health.router, prefix=api_prefix, tags=["health"])
app.include_router(detection.router, prefix=api_prefix, tags=["detection"])

# Root endpoint (responds at http://localhost:8000/)
@app.get("/")
async def root():
    return {
        "message": "Welcome to DeepSpear AI - Fake Content Detection API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Container lifecycle events
@app.on_event("startup")
async def startup_event():
    """Initialize services when container starts"""
    print("🚀 DeepSpear AI Backend starting in container...")
    # Initialize ML models, check database connection, etc.

@app.on_event("shutdown") 
async def shutdown_event():
    """Cleanup when container stops"""
    print("🛑 DeepSpear AI Backend shutting down...")
```

### Container Database Connection ✅

```python
# app/models/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Database URL uses Docker service name 'database'
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://enter_username_here:enter_password_here.@database:5432/deepspearai"
)

# Create engine with container networking
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    """Database session dependency for API endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```
    """Initialize services on application startup."""
    print("🚀 DeepSpear AI API starting up...")
    # Initialize ML model, check database connection, etc.

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on application shutdown."""
    print("🛑 DeepSpear AI API shutting down...")
    # Clean up ML models, close connections, etc.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=os.getenv("DEBUG", "False").lower() == "true"
    )
```

## 🗄️ Database Integration

### Database Configuration (`app/models/database.py`)

```python
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create SQLAlchemy engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,          # Verify connections before use
    pool_size=10,                # Connection pool size
    max_overflow=20,             # Additional connections allowed
    pool_recycle=3600,           # Recycle connections every hour
    echo=os.getenv("DEBUG", "False").lower() == "true"  # Log SQL queries in debug
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    """
    Database dependency for FastAPI routes.
    Creates a new database session for each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database utilities
def get_db_session():
    """Get a database session outside of FastAPI context."""
    return SessionLocal()

async def check_database_connection():
    """Check if database is accessible."""
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        print(f"Database connection error: {e}")
        return False
```

### Data Models (`app/models/models.py`)

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import validates
from .database import Base

class DetectionResult(Base):
    """
    Model for storing image detection results.
    
    This table stores all detection attempts with their results,
    allowing for analysis history and performance tracking.
    """
    __tablename__ = "detection_results"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # File information
    filename = Column(String, nullable=False, index=True)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    
    # Detection results
    is_fake = Column(Boolean, nullable=False, index=True)
    confidence_score = Column(Float, nullable=False, index=True)
    processing_time = Column(Float, nullable=False)
    
    # Metadata
    model_version = Column(String, default="v1.0", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Additional analysis data
    analysis_details = Column(Text, nullable=True)
    
    # Validation
    @validates('confidence_score')
    def validate_confidence(self, key, confidence):
        if not 0.0 <= confidence <= 1.0:
            raise ValueError("Confidence score must be between 0.0 and 1.0")
        return confidence
    
    @validates('file_size')
    def validate_file_size(self, key, size):
        if size < 0:
            raise ValueError("File size must be positive")
        return size
    
    def __repr__(self):
        return f"<DetectionResult(id={self.id}, filename='{self.filename}', confidence={self.confidence_score})>"
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "filename": self.filename,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "is_fake": self.is_fake,
            "confidence": self.confidence_score,
            "processing_time": self.processing_time,
            "model_version": self.model_version,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

# Create database indexes for performance
Index('idx_detection_results_composite', 
      DetectionResult.created_at.desc(), 
      DetectionResult.confidence_score.desc())

# Future models can be added here
class User(Base):
    """User model for future authentication implementation."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
```

## 🛣️ API Route Handlers

### Detection API (`app/api/detection.py`)

```python
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import os
import time
import uuid
from datetime import datetime

from ..models.database import get_db
from ..models.models import DetectionResult
from ..services.ml_service import FakeDetectionService
from ..utils.file_utils import save_uploaded_file, validate_file, cleanup_file

router = APIRouter()

# Initialize ML service (singleton pattern)
ml_service = FakeDetectionService()

@router.post("/detect", response_model=Dict[str, Any])
async def detect_fake_content(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Image file to analyze"),
    db: Session = Depends(get_db)
):
    """
    Upload and analyze an image for fake content detection.
    
    Args:
        file: Image file (JPG, PNG, GIF, BMP, WEBP, max 10MB)
        
    Returns:
        Detection result with confidence score and analysis details
        
    Raises:
        HTTPException: 400 for invalid files, 500 for processing errors
    """
    
    # Validate uploaded file
    validation_result = validate_file(file)
    if not validation_result["valid"]:
        raise HTTPException(status_code=400, detail=validation_result["error"])
    
    start_time = time.time()
    file_id = str(uuid.uuid4())
    
    try:
        # Save uploaded file to temporary storage
        file_path = await save_uploaded_file(file, file_id)
        
        # Process image through ML model
        detection_result = await ml_service.predict(file_path)
        
        processing_time = time.time() - start_time
        
        # Create database record
        db_result = DetectionResult(
            filename=file.filename,
            file_path=file_path,
            file_size=file.size or 0,
            mime_type=file.content_type or "unknown",
            is_fake=detection_result["is_fake"],
            confidence_score=detection_result["confidence"],
            processing_time=processing_time,
            model_version="v1.0",
            analysis_details=detection_result.get("details", "")
        )
        
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        
        # Schedule file cleanup (runs after response is sent)
        background_tasks.add_task(cleanup_file, file_path)
        
        # Return response
        return {
            "file_id": db_result.id,
            "filename": file.filename,
            "is_fake": detection_result["is_fake"],
            "confidence": detection_result["confidence"],
            "processing_time": round(processing_time, 3),
            "created_at": db_result.created_at.isoformat(),
            "message": f"Image analyzed with {detection_result['confidence']:.1%} confidence"
        }
        
    except Exception as e:
        # Clean up file if there was an error
        if 'file_path' in locals():
            background_tasks.add_task(cleanup_file, file_path)
        
        # Log error (in production, use proper logging)
        print(f"Detection error: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )

@router.get("/result/{result_id}", response_model=Dict[str, Any])
async def get_detection_result(result_id: int, db: Session = Depends(get_db)):
    """
    Get detailed results for a specific detection.
    
    Args:
        result_id: ID of the detection result
        
    Returns:
        Detailed detection result information
        
    Raises:
        HTTPException: 404 if result not found
    """
    
    result = db.query(DetectionResult).filter(DetectionResult.id == result_id).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Detection result not found")
    
    return {
        "id": result.id,
        "filename": result.filename,
        "is_fake": result.is_fake,
        "confidence": result.confidence_score,
        "processing_time": result.processing_time,
        "model_version": result.model_version,
        "created_at": result.created_at.isoformat(),
        "file_size": result.file_size,
        "mime_type": result.mime_type,
        "analysis_details": result.analysis_details
    }

@router.get("/history", response_model=Dict[str, Any])
async def get_detection_history(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get recent detection history with pagination.
    
    Args:
        limit: Maximum number of results to return (default: 10)
        offset: Number of results to skip (default: 0)
        
    Returns:
        Paginated list of detection results
    """
    
    # Query with pagination and ordering
    results = db.query(DetectionResult)\
                .order_by(DetectionResult.created_at.desc())\
                .offset(offset)\
                .limit(limit)\
                .all()
    
    # Get total count for pagination
    total_count = db.query(DetectionResult).count()
    
    return {
        "results": [
            {
                "id": result.id,
                "filename": result.filename,
                "is_fake": result.is_fake,
                "confidence": result.confidence_score,
                "created_at": result.created_at.isoformat(),
                "processing_time": result.processing_time
            }
            for result in results
        ],
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "has_next": (offset + limit) < total_count
    }

@router.get("/stats", response_model=Dict[str, Any])
async def get_detection_stats(db: Session = Depends(get_db)):
    """
    Get detection statistics and analytics.
    
    Returns:
        Statistical summary of detection results
    """
    
    from sqlalchemy import func, and_
    
    # Basic statistics
    total_detections = db.query(DetectionResult).count()
    fake_detections = db.query(DetectionResult)\
                        .filter(DetectionResult.is_fake == True)\
                        .count()
    
    # Average confidence scores
    avg_confidence = db.query(func.avg(DetectionResult.confidence_score)).scalar() or 0
    
    # Average processing time
    avg_processing_time = db.query(func.avg(DetectionResult.processing_time)).scalar() or 0
    
    # Recent activity (last 24 hours)
    from datetime import datetime, timedelta
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_detections = db.query(DetectionResult)\
                          .filter(DetectionResult.created_at >= yesterday)\
                          .count()
    
    return {
        "total_detections": total_detections,
        "fake_detections": fake_detections,
        "authentic_detections": total_detections - fake_detections,
        "fake_percentage": (fake_detections / total_detections * 100) if total_detections > 0 else 0,
        "average_confidence": round(avg_confidence, 3),
        "average_processing_time": round(avg_processing_time, 3),
        "recent_detections_24h": recent_detections
    }
```

### Health Check API (`app/api/health.py`)

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import os
import psutil
from datetime import datetime

from ..models.database import get_db, check_database_connection

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Basic health check endpoint.
    
    Returns:
        Service status and basic information
    """
    return {
        "status": "healthy",
        "service": "DeepSpear AI Detection API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """
    Detailed health check including system metrics.
    
    Returns:
        Comprehensive health status including database and system metrics
    """
    
    # Check database connectivity
    db_status = "healthy"
    try:
        db.execute("SELECT 1")
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # System metrics
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Check upload directory
    upload_dir = os.path.join(os.getcwd(), "uploads")
    upload_dir_exists = os.path.exists(upload_dir)
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "service": {
            "name": "DeepSpear AI Detection API",
            "version": "1.0.0",
            "uptime": "runtime_uptime_here"  # Could implement actual uptime tracking
        },
        "database": {
            "status": db_status,
            "url": os.getenv("DATABASE_URL", "").split("@")[-1] if os.getenv("DATABASE_URL") else "not_configured"
        },
        "system": {
            "memory_usage": f"{memory.percent}%",
            "memory_available": f"{memory.available / (1024**3):.2f}GB",
            "disk_usage": f"{disk.percent}%",
            "disk_free": f"{disk.free / (1024**3):.2f}GB"
        },
        "storage": {
            "upload_directory": upload_dir,
            "upload_directory_exists": upload_dir_exists
        }
    }

@router.get("/health/db")
async def database_health(db: Session = Depends(get_db)):
    """
    Database-specific health check.
    
    Returns:
        Database connectivity and performance metrics
    """
    
    try:
        # Test basic connectivity
        start_time = time.time()
        db.execute("SELECT 1")
        response_time = time.time() - start_time
        
        # Test table access
        from ..models.models import DetectionResult
        result_count = db.query(DetectionResult).count()
        
        return {
            "status": "healthy",
            "database": "connected",
            "response_time_ms": round(response_time * 1000, 2),
            "tables_accessible": True,
            "detection_results_count": result_count,
            "message": "Database is working properly"
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "message": "Database connection failed"
        }
```

## 🧠 Service Layer Implementation

### ML Service (`app/services/ml_service.py`)

```python
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import asyncio
import random
import os
import logging
from typing import Dict, Any

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FakeDetectionService:
    """
    Service for detecting AI-generated/fake content using PyTorch models.
    
    This is a template service that you can customize with your actual model.
    The service handles model loading, image preprocessing, and inference.
    """
    
    def __init__(self):
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_loaded = False
        self.model_path = os.getenv("MODEL_PATH", "models/fake_detection_model.pth")
        
        # Image preprocessing pipeline
        # Adjust these transforms based on your model's requirements
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        logger.info(f"ML Service initialized on device: {self.device}")
    
    def load_model(self, model_path: str = None) -> bool:
        """
        Load the PyTorch model for fake detection.
        
        Args:
            model_path: Optional path to model file
            
        Returns:
            True if model loaded successfully, False otherwise
        """
        
        model_path = model_path or self.model_path
        
        try:
            if model_path and os.path.exists(model_path):
                # Load your actual trained model
                # Example for a saved PyTorch model:
                # self.model = torch.load(model_path, map_location=self.device)
                # self.model.eval()
                logger.info(f"Model loaded from {model_path}")
            else:
                # For development: Create a dummy model
                # Replace this with your actual model architecture
                self.model = self._create_dummy_model()
                logger.warning("Using dummy model for development")
            
            self.model_loaded = True
            logger.info("Model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model_loaded = False
            return False
    
    def _create_dummy_model(self):
        """
        Creates a dummy model for development purposes.
        
        TODO: Replace this with your actual model architecture.
        
        Returns:
            Dummy PyTorch model
        """
        
        class DummyFakeDetector(nn.Module):
            def __init__(self):
                super().__init__()
                # Simple dummy architecture
                self.features = nn.Sequential(
                    nn.Conv2d(3, 64, kernel_size=3, padding=1),
                    nn.ReLU(),
                    nn.AdaptiveAvgPool2d((1, 1)),
                    nn.Flatten()
                )
                self.classifier = nn.Linear(64, 2)  # Binary classification: fake vs real
            
            def forward(self, x):
                features = self.features(x)
                return self.classifier(features)
        
        model = DummyFakeDetector()
        model.eval()
        return model
    
    def preprocess_image(self, image_path: str) -> torch.Tensor:
        """
        Preprocess image for model input.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Preprocessed image tensor
            
        Raises:
            ValueError: If image cannot be processed
        """
        
        try:
            # Load and convert image
            image = Image.open(image_path).convert('RGB')
            
            # Apply preprocessing transforms
            tensor = self.transform(image)
            
            # Add batch dimension
            return tensor.unsqueeze(0)
            
        except Exception as e:
            raise ValueError(f"Error preprocessing image: {e}")
    
    async def predict(self, image_path: str) -> Dict[str, Any]:
        """
        Predict if the image is AI-generated/fake.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary containing:
                - is_fake: Boolean indicating if content is fake
                - confidence: Confidence score (0.0 to 1.0)
                - details: Additional analysis details
        """
        
        # Load model if not already loaded
        if not self.model_loaded:
            self.load_model()
        
        try:
            # Preprocess image
            input_tensor = self.preprocess_image(image_path)
            
            # Move to device
            input_tensor = input_tensor.to(self.device)
            
            # Run inference
            if self.model_loaded and self.model:
                with torch.no_grad():
                    # Get model outputs
                    outputs = self.model(input_tensor)
                    
                    # Apply softmax to get probabilities
                    probabilities = torch.softmax(outputs, dim=1)
                    
                    # Get fake probability (assuming index 1 is fake class)
                    fake_prob = probabilities[0][1].item()
                    
                    # Additional model analysis could go here
                    # For example, feature extraction for explainability
                    
            else:
                # Fallback: Generate realistic demo prediction
                fake_prob = random.uniform(0.1, 0.9)
                logger.warning("Using dummy prediction - model not loaded")
            
            # Determine final prediction
            confidence_threshold = float(os.getenv("CONFIDENCE_THRESHOLD", 0.5))
            is_fake = fake_prob > confidence_threshold
            confidence = fake_prob if is_fake else (1.0 - fake_prob)
            
            # Generate analysis details
            details = self._generate_analysis_details(fake_prob, image_path)
            
            return {
                "is_fake": is_fake,
                "confidence": round(confidence, 4),
                "details": details
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                "is_fake": False,
                "confidence": 0.0,
                "details": f"Error during prediction: {str(e)}"
            }
    
    def _generate_analysis_details(self, fake_prob: float, image_path: str) -> str:
        """
        Generate detailed analysis information.
        
        Args:
            fake_prob: Probability that image is fake
            image_path: Path to analyzed image
            
        Returns:
            JSON string with analysis details
        """
        
        import json
        from pathlib import Path
        
        # Get image metadata
        try:
            image = Image.open(image_path)
            width, height = image.size
            mode = image.mode
        except:
            width = height = mode = "unknown"
        
        details = {
            "model_version": "v1.0",
            "analysis_method": "CNN-based detection",
            "raw_fake_probability": round(fake_prob, 4),
            "image_properties": {
                "width": width,
                "height": height,
                "mode": mode,
                "file_size": Path(image_path).stat().st_size if os.path.exists(image_path) else 0
            },
            "features_analyzed": [
                "texture_patterns",
                "compression_artifacts", 
                "color_distribution",
                "edge_consistency"
            ],
            "processing_notes": "Template implementation - replace with actual model analysis"
        }
        
        return json.dumps(details, indent=2)
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the loaded model.
        
        Returns:
            Dictionary with model information
        """
        
        return {
            "model_loaded": self.model_loaded,
            "device": str(self.device),
            "model_type": "CNN-based fake detection",
            "model_path": self.model_path,
            "version": "v1.0",
            "status": "Ready" if self.model_loaded else "Not loaded",
            "capabilities": [
                "image_fake_detection",
                "confidence_scoring",
                "feature_analysis"
            ]
        }
    
    async def batch_predict(self, image_paths: list) -> list:
        """
        Predict multiple images in batch for better performance.
        
        Args:
            image_paths: List of image file paths
            
        Returns:
            List of prediction results
        """
        
        results = []
        for image_path in image_paths:
            result = await self.predict(image_path)
            results.append(result)
        
        return results

# Global service instance (singleton pattern)
ml_service_instance = FakeDetectionService()

def get_ml_service() -> FakeDetectionService:
    """Dependency injection for ML service."""
    return ml_service_instance
```

## 🛠️ Utility Functions

### File Utilities (`app/utils/file_utils.py`)

```python
from fastapi import UploadFile, HTTPException
import os
import aiofiles
import uuid
import hashlib
from typing import Dict, List
from pathlib import Path

# Configuration from environment
MAX_FILE_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 10485760))  # 10MB default
ALLOWED_EXTENSIONS = set(os.getenv("ALLOWED_EXTENSIONS", "jpg,jpeg,png,gif,bmp,webp").split(","))
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")

def validate_file(file: UploadFile) -> Dict[str, any]:
    """
    Comprehensive file validation for uploaded content.
    
    Args:
        file: FastAPI UploadFile object
        
    Returns:
        Dictionary with 'valid' boolean and 'error' message if invalid
    """
    
    # Check if file exists
    if not file:
        return {"valid": False, "error": "No file provided"}
    
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        max_size_mb = MAX_FILE_SIZE / (1024 * 1024)
        current_size_mb = file.size / (1024 * 1024)
        return {
            "valid": False, 
            "error": f"File size ({current_size_mb:.1f}MB) exceeds maximum allowed size ({max_size_mb}MB)"
        }
    
    # Check file extension
    if file.filename:
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ALLOWED_EXTENSIONS:
            return {
                "valid": False,
                "error": f"File type '.{file_extension}' not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            }
    else:
        return {"valid": False, "error": "Filename is required"}
    
    # Check MIME type
    if file.content_type:
        allowed_mime_types = {
            "image/jpeg", "image/jpg", "image/png", "image/gif", 
            "image/bmp", "image/webp"
        }
        if file.content_type not in allowed_mime_types:
            return {
                "valid": False,
                "error": f"MIME type '{file.content_type}' not allowed"
            }
    
    return {"valid": True, "error": None}

async def save_uploaded_file(file: UploadFile, file_id: str) -> str:
    """
    Save uploaded file to disk with unique filename and security measures.
    
    Args:
        file: FastAPI UploadFile object
        file_id: Unique identifier for the file
        
    Returns:
        Path to saved file
        
    Raises:
        Exception: If file saving fails
    """
    
    # Ensure upload directory exists
    upload_dir = Path(UPLOAD_FOLDER)
    upload_dir.mkdir(exist_ok=True)
    
    # Generate secure filename
    original_extension = file.filename.split(".")[-1].lower() if file.filename else "jpg"
    safe_filename = f"{file_id}.{original_extension}"
    file_path = upload_dir / safe_filename
    
    try:
        # Read file content
        content = await file.read()
        
        # Validate file content (basic check)
        if len(content) == 0:
            raise ValueError("Empty file")
        
        # Save file asynchronously
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Set secure file permissions (read-only)
        os.chmod(file_path, 0o644)
        
        return str(file_path)
        
    except Exception as e:
        # Clean up if there was an error
        if file_path.exists():
            file_path.unlink()
        raise Exception(f"Error saving file: {str(e)}")

async def cleanup_file(file_path: str) -> bool:
    """
    Delete file from disk safely.
    
    Args:
        file_path: Path to file to delete
        
    Returns:
        True if successful, False otherwise
    """
    
    try:
        file_obj = Path(file_path)
        if file_obj.exists() and file_obj.is_file():
            # Ensure file is within upload directory for security
            upload_dir = Path(UPLOAD_FOLDER).resolve()
            if upload_dir in file_obj.resolve().parents:
                file_obj.unlink()
                return True
        return False
    except Exception as e:
        print(f"Error cleaning up file {file_path}: {e}")
        return False

def get_file_info(file_path: str) -> Dict[str, any]:
    """
    Get comprehensive information about a file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        Dictionary with file information
    """
    
    try:
        file_obj = Path(file_path)
        if not file_obj.exists():
            return {"exists": False}
        
        stat = file_obj.stat()
        return {
            "exists": True,
            "size": stat.st_size,
            "created": stat.st_ctime,
            "modified": stat.st_mtime,
            "extension": file_obj.suffix.lower(),
            "filename": file_obj.name,
            "is_image": file_obj.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        }
    except Exception as e:
        return {"exists": False, "error": str(e)}

def calculate_file_hash(file_path: str) -> str:
    """
    Calculate SHA-256 hash of file for integrity checking.
    
    Args:
        file_path: Path to the file
        
    Returns:
        Hexadecimal hash string
    """
    
    hash_sha256 = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    except Exception:
        return ""

def clean_old_files(max_age_hours: int = 24) -> int:
    """
    Clean up old uploaded files to manage storage.
    
    Args:
        max_age_hours: Maximum age of files to keep (in hours)
        
    Returns:
        Number of files cleaned up
    """
    
    import time
    
    upload_dir = Path(UPLOAD_FOLDER)
    if not upload_dir.exists():
        return 0
    
    current_time = time.time()
    max_age_seconds = max_age_hours * 3600
    cleaned_count = 0
    
    try:
        for file_path in upload_dir.iterdir():
            if file_path.is_file():
                file_age = current_time - file_path.stat().st_mtime
                if file_age > max_age_seconds:
                    file_path.unlink()
                    cleaned_count += 1
    except Exception as e:
        print(f"Error during file cleanup: {e}")
    
    return cleaned_count

# Background task for periodic cleanup
async def periodic_cleanup():
    """Background task to clean up old files periodically."""
    import asyncio
    
    while True:
        try:
            cleaned = clean_old_files(24)  # Clean files older than 24 hours
            if cleaned > 0:
                print(f"Cleaned up {cleaned} old files")
            await asyncio.sleep(3600)  # Run every hour
        except Exception as e:
            print(f"Error in periodic cleanup: {e}")
            await asyncio.sleep(3600)
```

## 🔧 Configuration Management

### Environment Configuration

```python
# app/config.py
from pydantic import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    database_url: str
    
    # Application
    debug: bool = False
    secret_key: str
    project_name: str = "DeepSpear AI"
    api_v1_prefix: str = "/api/v1"
    
    # CORS
    allowed_origins: List[str] = ["http://localhost:3000"]
    
    # File Upload
    max_upload_size: int = 10485760  # 10MB
    allowed_extensions: str = "jpg,jpeg,png,gif,bmp,webp"
    upload_folder: str = "uploads"
    
    # ML Model
    model_path: str = "models/fake_detection_model.pth"
    confidence_threshold: float = 0.5
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## 🚀 Running the Backend

### Development Mode
```bash
cd server

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run with hot reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
# Run with production settings
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker Mode
```bash
# Build and run with Docker
docker build -t deepspear-backend .
docker run -p 8000:8000 deepspear-backend
```

## 📚 Next Steps

1. **Integrate Your ML Model**: Replace the dummy ML service with your actual PyTorch model
2. **Add Authentication**: Implement JWT-based authentication
3. **Add Logging**: Set up comprehensive logging and monitoring
4. **Optimize Performance**: Add caching and optimize database queries
5. **Add Tests**: Write comprehensive unit and integration tests

For more specific topics, check out:
- [ML Model Integration](./08-ml-integration.md)
- [Testing Guide](./03-testing.md)
- [Database Guide](./07-database.md)
- [API Reference](./09-api-reference.md)