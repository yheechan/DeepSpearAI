from fastapi import UploadFile, HTTPException
import os
import aiofiles
import uuid
from typing import Dict, List
from pathlib import Path

# Configuration
MAX_FILE_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 10485760))  # 10MB default
ALLOWED_EXTENSIONS = os.getenv("ALLOWED_EXTENSIONS", "jpg,jpeg,png,gif,bmp,webp").split(",")
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")

def validate_file(file: UploadFile) -> Dict[str, any]:
    """
    Validate uploaded file for size, type, and extension.
    
    Returns:
        Dictionary with 'valid' boolean and 'error' message if invalid
    """
    
    # Check if file exists
    if not file:
        return {"valid": False, "error": "No file provided"}
    
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        max_size_mb = MAX_FILE_SIZE / (1024 * 1024)
        return {
            "valid": False, 
            "error": f"File size ({file.size / (1024 * 1024):.1f}MB) exceeds maximum allowed size ({max_size_mb}MB)"
        }
    
    # Check file extension
    if file.filename:
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ALLOWED_EXTENSIONS:
            return {
                "valid": False,
                "error": f"File type '.{file_extension}' not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            }
    
    # Check MIME type
    if file.content_type:
        allowed_mime_types = [
            "image/jpeg", "image/jpg", "image/png", "image/gif", 
            "image/bmp", "image/webp"
        ]
        if file.content_type not in allowed_mime_types:
            return {
                "valid": False,
                "error": f"MIME type '{file.content_type}' not allowed"
            }
    
    return {"valid": True, "error": None}

async def save_uploaded_file(file: UploadFile, file_id: str) -> str:
    """
    Save uploaded file to disk with unique filename.
    
    Args:
        file: FastAPI UploadFile object
        file_id: Unique identifier for the file
        
    Returns:
        Path to saved file
    """
    
    # Ensure upload directory exists
    upload_dir = Path(UPLOAD_FOLDER)
    upload_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    original_extension = file.filename.split(".")[-1].lower() if file.filename else "jpg"
    filename = f"{file_id}.{original_extension}"
    file_path = upload_dir / filename
    
    try:
        # Save file asynchronously
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return str(file_path)
        
    except Exception as e:
        # Clean up if there was an error
        if file_path.exists():
            file_path.unlink()
        raise Exception(f"Error saving file: {str(e)}")

async def cleanup_file(file_path: str) -> bool:
    """
    Delete file from disk.
    
    Args:
        file_path: Path to file to delete
        
    Returns:
        True if successful, False otherwise
    """
    try:
        file_obj = Path(file_path)
        if file_obj.exists():
            file_obj.unlink()
            return True
        return False
    except Exception as e:
        print(f"Error cleaning up file {file_path}: {e}")
        return False

def get_file_info(file_path: str) -> Dict[str, any]:
    """
    Get information about a file.
    
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
            "filename": file_obj.name
        }
    except Exception as e:
        return {"exists": False, "error": str(e)}

def clean_old_files(max_age_hours: int = 24) -> int:
    """
    Clean up old uploaded files.
    
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