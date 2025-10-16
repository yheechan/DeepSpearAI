from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from .database import Base

class DetectionResult(Base):
    __tablename__ = "detection_results"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    
    # Detection results
    is_fake = Column(Boolean, nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0.0 to 1.0
    processing_time = Column(Float, nullable=False)  # seconds
    
    # User feedback
    user_is_fake = Column(Boolean, nullable=True)  # True if user thinks it's fake, False if real, null if not provided
    
    # Additional metadata
    model_version = Column(String, default="v1.0")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Optional: Store analysis details
    analysis_details = Column(Text, nullable=True)  # JSON string for detailed analysis
    
    def __repr__(self):
        return f"<DetectionResult(id={self.id}, filename='{self.filename}', confidence={self.confidence_score})>"