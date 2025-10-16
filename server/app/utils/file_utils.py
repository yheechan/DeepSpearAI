from fastapi import UploadFile, HTTPException
import os
import aiofiles
import uuid
from typing import Dict, List
from pathlib import Path

# Configuration
MAX_FILE_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 52428800))  # 50MB default for mobile photos
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
    
    # Check MIME type (primary validation for mobile compatibility)
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
    
    # Check file extension (fallback validation, but allow mobile-friendly cases)
    if file.filename:
        file_extension = file.filename.split(".")[-1].lower()
        # Allow common mobile browser filename patterns
        mobile_friendly_patterns = ["blob", "image"]
        if file_extension not in ALLOWED_EXTENSIONS and file_extension not in mobile_friendly_patterns:
            # If MIME type is valid but extension isn't, only warn if no valid MIME type
            if not file.content_type or file.content_type not in allowed_mime_types:
                return {
                    "valid": False,
                    "error": f"File type '.{file_extension}' not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
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
    
    # Generate unique filename with mobile-friendly extension handling
    original_extension = "jpg"  # Default extension
    
    if file.filename and "." in file.filename:
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension in ALLOWED_EXTENSIONS:
            original_extension = file_extension
    
    # If filename doesn't give us a good extension, try to infer from MIME type
    if original_extension == "jpg" and file.content_type:
        mime_to_ext = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg", 
            "image/png": "png",
            "image/gif": "gif",
            "image/bmp": "bmp",
            "image/webp": "webp"
        }
        original_extension = mime_to_ext.get(file.content_type, "jpg")
    
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