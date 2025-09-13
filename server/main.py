from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from app.api import detection, health
from app.models.database import engine, get_db
from app.models import models

# Load environment variables
load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=os.getenv("PROJECT_NAME", "DeepSpear AI"),
    description="AI-powered fake content detection service",
    version="1.0.0"
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API routes
api_prefix = os.getenv("API_V1_PREFIX", "/api/v1")
app.include_router(health.router, prefix=api_prefix, tags=["health"])
app.include_router(detection.router, prefix=api_prefix, tags=["detection"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to DeepSpear AI - Fake Content Detection API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=os.getenv("DEBUG", "False").lower() == "true"
    )