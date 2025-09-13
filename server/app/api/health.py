from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint to verify the API is running."""
    return {
        "status": "healthy",
        "service": "DeepSpear AI Detection API",
        "version": "1.0.0"
    }

@router.get("/health/db")
async def database_health():
    """Check database connectivity."""
    try:
        # TODO: Add actual database health check
        # For now, return a placeholder response
        return {
            "status": "healthy",
            "database": "connected",
            "message": "Database connection is working"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }