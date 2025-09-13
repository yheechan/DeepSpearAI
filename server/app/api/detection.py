from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any
import os
import time
import uuid
from datetime import datetime

from ..models.database import get_db
from ..models.models import DetectionResult
from ..services.ml_service import FakeDetectionService
from ..utils.file_utils import save_uploaded_file, validate_file, cleanup_file

router = APIRouter()

# Initialize ML service (placeholder for now)
ml_service = FakeDetectionService()

@router.post("/detect", response_model=Dict[str, Any])
async def detect_fake_content(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload an image and detect if it's AI-generated/fake.
    
    Returns:
        - filename: Original filename
        - file_id: Unique identifier for this detection
        - is_fake: Boolean indicating if content is fake
        - confidence: Confidence score (0.0 to 1.0)
        - processing_time: Time taken for analysis
        - created_at: Timestamp of analysis
    """
    
    # Validate file
    validation_result = validate_file(file)
    if not validation_result["valid"]:
        raise HTTPException(status_code=400, detail=validation_result["error"])
    
    start_time = time.time()
    
    try:
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Save uploaded file
        file_path = await save_uploaded_file(file, file_id)
        
        # TODO: Replace with actual ML model prediction
        # For now, use the ML service placeholder
        detection_result = await ml_service.predict(file_path)
        
        processing_time = time.time() - start_time
        
        # Save result to database
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
        
        # Schedule file cleanup after response is sent
        background_tasks.add_task(cleanup_file, file_path)
        
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
        
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )

@router.get("/history")
async def get_detection_history(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get recent detection history."""
    
    results = db.query(DetectionResult)\
                .order_by(DetectionResult.created_at.desc())\
                .offset(offset)\
                .limit(limit)\
                .all()
    
    return {
        "results": [
            {
                "id": result.id,
                "filename": result.filename,
                "is_fake": result.is_fake,
                "confidence": result.confidence_score,
                "created_at": result.created_at.isoformat()
            }
            for result in results
        ],
        "total": db.query(DetectionResult).count()
    }

@router.get("/result/{result_id}")
async def get_detection_result(result_id: int, db: Session = Depends(get_db)):
    """Get detailed results for a specific detection."""
    
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
        "mime_type": result.mime_type
    }