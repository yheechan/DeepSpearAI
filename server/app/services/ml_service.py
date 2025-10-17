import requests
from pathlib import Path
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import asyncio
import random
import os
from typing import Dict, Any

class FakeDetectionService:
    """
    Service for detecting AI-generated/fake content using PyTorch models.
    This is a template - you'll need to replace with your actual model.
    """
    
    def __init__(self):
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_loaded = False
        
        # Image preprocessing pipeline
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
    
    def load_model(self, model_path: str = None) -> bool:
        """
        Load the PyTorch model for fake detection.
        
        TODO: Replace this with your actual model loading logic.
        For now, this is a placeholder that doesn't load a real model.
        """
        try:
            if model_path and os.path.exists(model_path):
                # TODO: Load your actual trained model
                # self.model = torch.load(model_path, map_location=self.device)
                # self.model.eval()
                pass
            else:
                # For development: Create a dummy model
                # Replace this with your actual model architecture
                self.model = self._create_dummy_model()
            
            self.model_loaded = True
            print(f"Model loaded successfully on device: {self.device}")
            return True
            
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model_loaded = False
            return False
    
    def _create_dummy_model(self):
        """
        Creates a dummy model for development purposes.
        TODO: Replace this with your actual model architecture.
        """
        class DummyModel(nn.Module):
            def __init__(self):
                super().__init__()
                self.classifier = nn.Linear(1000, 2)  # Fake vs Real
            
            def forward(self, x):
                # Return random predictions for demo
                batch_size = x.shape[0] if len(x.shape) > 3 else 1
                return torch.rand(batch_size, 2)
        
        return DummyModel()
    
    def preprocess_image(self, image_path: str) -> torch.Tensor:
        """
        Preprocess image for model input with EXIF orientation correction.
        """
        try:
            image = Image.open(image_path)
            
            # Handle EXIF orientation for mobile photos
            try:
                # Get EXIF data
                if hasattr(image, '_getexif') and image._getexif() is not None:
                    exif = image._getexif()
                    orientation_key = 274  # EXIF orientation tag
                    
                    if orientation_key in exif:
                        orientation = exif[orientation_key]
                        # Apply rotation based on EXIF orientation
                        if orientation == 3:
                            image = image.rotate(180, expand=True)
                        elif orientation == 6:
                            image = image.rotate(270, expand=True)
                        elif orientation == 8:
                            image = image.rotate(90, expand=True)
                        # orientations 2, 4, 5, 7 involve flipping, less common
                        elif orientation == 2:
                            image = image.transpose(Image.FLIP_LEFT_RIGHT)
                        elif orientation == 4:
                            image = image.rotate(180, expand=True).transpose(Image.FLIP_LEFT_RIGHT)
                        elif orientation == 5:
                            image = image.rotate(270, expand=True).transpose(Image.FLIP_LEFT_RIGHT)
                        elif orientation == 7:
                            image = image.rotate(90, expand=True).transpose(Image.FLIP_LEFT_RIGHT)
            except (AttributeError, KeyError, TypeError):
                # If EXIF processing fails, continue with original image
                pass
            
            # Convert to RGB (removes alpha channel if present)
            image = image.convert('RGB')
            return self.transform(image).unsqueeze(0)  # Add batch dimension
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
            
            # TODO: Replace this section with your actual model inference
            if self.model_loaded and self.model:
                with torch.no_grad():
                    # Move to device
                    input_tensor = input_tensor.to(self.device)
                    
                    # Get prediction
                    outputs = self.model(input_tensor)
                    
                    # Apply softmax to get probabilities
                    probabilities = torch.softmax(outputs, dim=1)
                    
                    # Get fake probability (assuming index 1 is fake)
                    fake_prob = probabilities[0][1].item()
            else:
                # Fallback: Generate random prediction for demo
                fake_prob = random.uniform(0.1, 0.9)
            
            # Determine if fake based on threshold
            is_fake = fake_prob > 0.5
            confidence = fake_prob if is_fake else (1.0 - fake_prob)
            
            # Additional analysis details (placeholder)
            details = {
                "model_version": "v1.0",
                "analysis_method": "CNN-based detection",
                "features_analyzed": ["texture_patterns", "compression_artifacts", "color_distribution"],
                "processing_notes": "Template implementation - replace with actual model"
            }
            
            return {
                "is_fake": is_fake,
                "confidence": confidence,
                "details": str(details)  # Convert to string for database storage
            }
            
        except Exception as e:
            # Return error case with low confidence
            return {
                "is_fake": False,
                "confidence": 0.0,
                "details": f"Error during prediction: {str(e)}"
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model."""
        return {
            "model_loaded": self.model_loaded,
            "device": str(self.device),
            "model_type": "CNN-based fake detection",
            "version": "v1.0",
            "status": "Template - Replace with actual model"
        }
    
    async def test_single_image(self, image_path: str, api_url: str = "http://localhost:8000"):
        """
        Test the API with a single image
        
        Args:
            image_path: Path to image file
            api_url: Base URL of the API
        """
        details = {
            "model_version": "clip.MVP.v1.0",
            "analysis_method": "clip detection",
            "features_analyzed": ["texture_patterns", "compression_artifacts", "color_distribution"],
            "processing_notes": "Template implementation - replace with actual model"
        }
        endpoint = f"{api_url}/predict"
        
        # Check if file exists
        if not Path(image_path).exists():
            return {
                "is_fake": False,
                "confidence": 0.0,
                "details": f"Error during prediction: file not found: {image_path}"
            }
        
        # Prepare file upload
        with open(image_path, 'rb') as f:
            files = {'file': (Path(image_path).name, f, 'image/jpeg')}
            
            # print(f"Sending request to {endpoint}...")
            # print(f"Image: {image_path}")
            # print("-" * 60)
            
            try:
                response = requests.post(endpoint, files=files)
                
                if response.status_code == 200:
                    result = response.json()
                    # print("✓ Success!")
                    # print("\nPrediction Results:")
                    # print("=" * 60)
                    
                    pred = result['prediction']
                    # print(f"Label:              {pred['label']}")
                    # print(f"Is Fake:            {pred['is_fake']}")
                    # print(f"Fake Probability:   {pred['fake_probability']:.2%}")
                    # print(f"Real Probability:   {pred['real_probability']:.2%}")
                    # print(f"Confidence:         {pred['confidence']:.2f}%")
                    
                    # print("\nFile Info:")
                    # print("-" * 60)
                    file_info = result['file_info']
                    # print(f"Filename:           {file_info['filename']}")
                    # print(f"Content Type:       {file_info['content_type']}")
                    # print(f"Size:               {file_info['size']}")


                    return {
                        "is_fake": pred['is_fake'],
                        "confidence": pred['fake_probability'],
                        "details": str(details)
                    }
                    
                else:
                    # print(f"✗ Error: {response.status_code}")
                    # print(response.json())
                    return {
                        "is_fake": False,
                        "confidence": 0.0,
                        "details": f"Error during prediction: {response.status_code}"
                    }
                    
            except requests.exceptions.ConnectionError:
                # print("✗ Error: Could not connect to API server")
                # print(f"Make sure the server is running at {api_url}")
                return {
                    "is_fake": False,
                    "confidence": 0.0,
                    "details": "Error during prediction: could not connect to API server"
                }
            except Exception as e:
                # print(f"✗ Error: {str(e)}")
                return {
                    "is_fake": False,
                    "confidence": 0.0,
                    "details": f"Error during prediction: {str(e)}"
                }
            return {
                "is_fake": False,
                "confidence": 0.0,
                "details": f"Error during prediction: Unknown error"
            }
