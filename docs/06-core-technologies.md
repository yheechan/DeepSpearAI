# Core Technologies Guide

This document explains the key technologies used in DeepSpear AI backend development, focusing on SQLAlchemy ORM and FastAPI BackgroundTasks.

## Table of Contents
- [SQLAlchemy ORM](#sqlalchemy-orm)
- [FastAPI BackgroundTasks](#fastapi-backgroundtasks)
- [Integration in DeepSpear AI](#integration-in-deepspear-ai)
- [Best Practices](#best-practices)

---

## SQLAlchemy ORM

### What is SQLAlchemy?

SQLAlchemy is a Python Object-Relational Mapping (ORM) library that provides a high-level interface for database operations. It allows you to work with database tables as Python classes and database rows as Python objects.

### Key Benefits

1. **Database Abstraction**: Write Python code instead of raw SQL
2. **Type Safety**: IDE autocomplete and type checking
3. **Security**: Built-in protection against SQL injection
4. **Relationships**: Easy to define and navigate table relationships
5. **Migration Support**: Automatic schema generation and updates

### How SQLAlchemy Works in DeepSpear AI

#### 1. Database Configuration (`app/models/database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database connection setup
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Session factory for database transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all database models
Base = declarative_base()

# Dependency injection for database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 2. Model Definition (`app/models/models.py`)

```python
class DetectionResult(Base):
    __tablename__ = "detection_results"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    is_fake = Column(Boolean, nullable=False)
    confidence_score = Column(Float, nullable=False)
    processing_time = Column(Float, nullable=False)
    model_version = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    analysis_details = Column(Text, nullable=True)
```

#### 3. Database Operations in API Endpoints

**Creating Records:**
```python
# Instead of SQL: INSERT INTO detection_results (filename, is_fake, ...) VALUES (...)
db_result = DetectionResult(
    filename=file.filename,
    file_path=file_path,
    is_fake=detection_result["is_fake"],
    confidence_score=detection_result["confidence"]
    # ... other fields
)
db.add(db_result)
db.commit()
db.refresh(db_result)  # Get updated object with auto-generated fields
```

**Querying Records:**
```python
# Instead of SQL: SELECT * FROM detection_results ORDER BY created_at DESC LIMIT 10
results = db.query(DetectionResult)\
            .order_by(DetectionResult.created_at.desc())\
            .limit(10)\
            .all()
```

**Finding Specific Records:**
```python
# Instead of SQL: SELECT * FROM detection_results WHERE id = ?
result = db.query(DetectionResult)\
           .filter(DetectionResult.id == result_id)\
           .first()
```

### SQLAlchemy vs Raw SQL Comparison

| Operation | Raw SQL | SQLAlchemy ORM |
|-----------|---------|----------------|
| Insert | `INSERT INTO detection_results (filename, is_fake) VALUES ('test.jpg', true)` | `DetectionResult(filename='test.jpg', is_fake=True)` |
| Select | `SELECT * FROM detection_results WHERE is_fake = true` | `db.query(DetectionResult).filter(DetectionResult.is_fake == True)` |
| Update | `UPDATE detection_results SET confidence_score = 0.95 WHERE id = 1` | `result.confidence_score = 0.95; db.commit()` |
| Delete | `DELETE FROM detection_results WHERE id = 1` | `db.delete(result); db.commit()` |

---

## FastAPI BackgroundTasks

### What are BackgroundTasks?

BackgroundTasks is a FastAPI feature that allows you to run functions **after** sending the HTTP response to the client. This improves response times by handling non-critical operations asynchronously.

### Key Benefits

1. **Faster Response Times**: Client gets immediate response
2. **Resource Cleanup**: Handle file deletion, logging, etc., after response
3. **Non-blocking Operations**: Secondary tasks don't delay the user
4. **Error Recovery**: Cleanup tasks can run even if main operation fails

### How BackgroundTasks Work

#### Execution Flow
```
1. Client sends request
2. API processes main logic
3. API sends response to client ← Client gets response here
4. Background tasks execute ← Happens after response
```

#### Usage Pattern in DeepSpear AI

```python
from fastapi import BackgroundTasks

@router.post("/detect")
async def detect_fake_content(
    background_tasks: BackgroundTasks,  # ← Dependency injection
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Main processing logic
    file_path = await save_uploaded_file(file, file_id)
    detection_result = await ml_service.predict(file_path)
    
    # Save to database
    db_result = DetectionResult(...)
    db.add(db_result)
    db.commit()
    
    # Schedule cleanup to run after response is sent
    background_tasks.add_task(cleanup_file, file_path)
    
    # Return response immediately (cleanup happens later)
    return {"is_fake": detection_result["is_fake"], ...}
```

### Background Task Functions

Tasks can be regular functions or async functions:

```python
# Regular function
def cleanup_file(file_path: str):
    """Delete temporary file from disk."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Cleaned up file: {file_path}")
    except Exception as e:
        print(f"Error cleaning up file {file_path}: {e}")

# Async function
async def send_notification(email: str, message: str):
    """Send email notification."""
    # Email sending logic here
    pass

# Usage
background_tasks.add_task(cleanup_file, "/path/to/file.jpg")
background_tasks.add_task(send_notification, "user@example.com", "Analysis complete")
```

---

## Integration in DeepSpear AI

### File Upload Workflow

Our image detection endpoint demonstrates both technologies working together:

```python
@router.post("/detect")
async def detect_fake_content(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # 1. Save uploaded file temporarily
        file_path = await save_uploaded_file(file, file_id)
        
        # 2. Process with ML model
        detection_result = await ml_service.predict(file_path)
        
        # 3. Save metadata to database using SQLAlchemy
        db_result = DetectionResult(
            filename=file.filename,
            file_path=file_path,
            is_fake=detection_result["is_fake"],
            confidence_score=detection_result["confidence"],
            # ... other fields
        )
        db.add(db_result)
        db.commit()
        
        # 4. Schedule file cleanup for after response
        background_tasks.add_task(cleanup_file, file_path)
        
        # 5. Return results immediately
        return {
            "file_id": db_result.id,
            "is_fake": detection_result["is_fake"],
            "confidence": detection_result["confidence"]
        }
        
    except Exception as e:
        # Even on error, clean up the file
        if 'file_path' in locals():
            background_tasks.add_task(cleanup_file, file_path)
        raise HTTPException(status_code=500, detail=str(e))
```

### Data Flow

1. **User uploads image** → Temporary file saved to `/uploads/`
2. **ML model processes** → Analysis results generated
3. **SQLAlchemy saves** → Metadata stored in PostgreSQL database
4. **FastAPI responds** → Results sent to client immediately
5. **BackgroundTask cleans** → Temporary file deleted from disk

### Database Schema

The SQLAlchemy model creates this PostgreSQL table:

```sql
CREATE TABLE detection_results (
    id SERIAL PRIMARY KEY,
    filename VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR NOT NULL,
    is_fake BOOLEAN NOT NULL,
    confidence_score FLOAT NOT NULL,
    processing_time FLOAT NOT NULL,
    model_version VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_details TEXT
);
```

---

## Best Practices

### SQLAlchemy Best Practices

1. **Use Database Sessions Properly**
   ```python
   # ✅ Good: Use dependency injection
   def endpoint(db: Session = Depends(get_db)):
       # db session is automatically closed
       pass
   
   # ❌ Avoid: Manual session management
   db = SessionLocal()
   # Easy to forget db.close()
   ```

2. **Handle Database Errors**
   ```python
   try:
       db.add(new_record)
       db.commit()
   except SQLAlchemyError as e:
       db.rollback()
       raise HTTPException(status_code=500, detail="Database error")
   ```

3. **Use Appropriate Query Methods**
   ```python
   # For single record
   result = db.query(Model).filter(Model.id == id).first()
   
   # For multiple records
   results = db.query(Model).filter(Model.active == True).all()
   
   # With pagination
   results = db.query(Model).offset(skip).limit(limit).all()
   ```

### BackgroundTasks Best Practices

1. **Keep Tasks Lightweight**
   ```python
   # ✅ Good: Simple cleanup task
   background_tasks.add_task(cleanup_file, file_path)
   
   # ❌ Avoid: Heavy processing in background
   background_tasks.add_task(expensive_ml_training)
   ```

2. **Handle Task Errors Gracefully**
   ```python
   def cleanup_file(file_path: str):
       try:
           os.remove(file_path)
       except FileNotFoundError:
           # File already deleted, ignore
           pass
       except Exception as e:
           # Log error but don't crash
           logger.error(f"Cleanup failed: {e}")
   ```

3. **Use for Non-Critical Operations**
   ```python
   # ✅ Good uses:
   background_tasks.add_task(cleanup_temp_files)
   background_tasks.add_task(send_notification_email)
   background_tasks.add_task(update_usage_statistics)
   
   # ❌ Avoid for critical operations:
   # Don't use for database saves that affect the response
   ```

### Error Handling Patterns

```python
@router.post("/detect")
async def detect_fake_content(background_tasks: BackgroundTasks, ...):
    file_path = None
    try:
        file_path = await save_uploaded_file(file, file_id)
        # ... main logic ...
        background_tasks.add_task(cleanup_file, file_path)
        return response
        
    except ValidationError as e:
        # Don't cleanup on validation errors (file not saved)
        raise HTTPException(status_code=400, detail=str(e))
        
    except Exception as e:
        # Cleanup on processing errors
        if file_path:
            background_tasks.add_task(cleanup_file, file_path)
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Conclusion

SQLAlchemy and BackgroundTasks work together to create efficient, maintainable APIs:

- **SQLAlchemy** provides type-safe, pythonic database operations
- **BackgroundTasks** enables responsive APIs with proper resource cleanup
- Together, they create a robust foundation for the DeepSpear AI detection service

This architecture ensures fast response times for users while maintaining data integrity and proper resource management.