# Testing Guide

This comprehensive guide covers testing strategies and execution for DeepSpear AI's Docker-based architecture.

## 🎯 Testing Strategy

### Testing Pyramid for Containerized Application
```
    /\
   /  \    Unit Tests (70%)
  /____\   - Individual functions and components
 /      \  - Isolated container testing
/________\  
           Integration Tests (20%)
           - Container-to-container communication
           - API endpoints with database
           
           E2E Tests (10%)
           - Full user workflows through containers
           - Frontend-backend integration
```

### Test Types for Docker Environment

1. **Container Unit Tests**: Testing within individual containers
2. **Service Integration Tests**: Cross-container communication
3. **API Tests**: REST endpoints via containers
4. **Frontend Component Tests**: React components in container
5. **Database Tests**: PostgreSQL container operations
6. **End-to-End Tests**: Complete workflows through Docker services

## 🐳 Docker-Based Testing

### Test Environment Setup ✅
```bash
# Ensure all containers are running
docker-compose up -d

# Verify test environment
docker ps

# All containers should be healthy:
# deepspear_frontend, deepspear_backend, deepspear_database
```

### Quick Health Tests ✅
```bash
# Test all services are responding
curl http://localhost:8000/api/v1/health    # Backend health
curl -I http://localhost:3000               # Frontend availability
docker exec deepspear_database pg_isready -U enter_username_here  # Database readiness
```

## 🧪 Backend Testing (FastAPI in Container)

### Running Backend Tests ✅
```bash
# Execute tests inside the backend container
docker exec deepspear_backend pytest

# Run tests with coverage
docker exec deepspear_backend pytest --cov=app

# Run specific test file
docker exec deepspear_backend pytest tests/test_api/test_health.py

# Run tests with verbose output
docker exec deepspear_backend pytest -v

# Run tests and see real-time output
docker exec -it deepspear_backend pytest -v -s
```

### Backend Test Structure
```
server/
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Docker-aware fixtures
│   ├── test_api/
│   │   ├── __init__.py
│   │   ├── test_detection.py    # Detection endpoint tests
│   │   └── test_health.py       # Health endpoint tests
│   ├── test_services/
│   │   ├── __init__.py
│   │   └── test_ml_service.py   # ML service tests
│   ├── test_models/
│   │   ├── __init__.py
│   │   └── test_database.py     # Database model tests
│   └── test_utils/
│       ├── __init__.py
│       └── test_file_utils.py   # Utility function tests
```

### Container-Aware Test Configuration
```python
# conftest.py for Docker environment
import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.database import Base, get_db
from main import app
import os

# Use container database for integration tests
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://enter_username_here:enter_password_here.@database:5432/deepspearai_test")

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def test_client():
    """Create a test client using the containerized app."""
    with TestClient(app) as client:
        yield client

@pytest.fixture
def sample_image():
    """Provide a sample image for testing uploads."""
    return {"file": ("test.jpg", b"fake_image_data", "image/jpeg")}
```
            yield db_session
        finally:
            db_session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture
def sample_image():
    """Create a sample image file for testing."""
    from PIL import Image
    import io
    
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes
```

#### 3. API Endpoint Tests (`test_api/test_detection.py`)
```python
import pytest
from fastapi.testclient import TestClient
import io
from PIL import Image

def test_health_endpoint(test_client):
    """Test health check endpoint."""
    response = test_client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_detect_endpoint_success(test_client, sample_image):
    """Test successful image detection."""
    files = {"file": ("test.jpg", sample_image, "image/jpeg")}
    response = test_client.post("/api/v1/detect", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert "file_id" in data
    assert "confidence" in data
    assert "is_fake" in data
    assert isinstance(data["confidence"], float)
    assert isinstance(data["is_fake"], bool)

def test_detect_endpoint_invalid_file(test_client):
    """Test detection with invalid file type."""
    files = {"file": ("test.txt", io.StringIO("not an image"), "text/plain")}
    response = test_client.post("/api/v1/detect", files=files)
    
    assert response.status_code == 400
    assert "not allowed" in response.json()["detail"].lower()

def test_detect_endpoint_no_file(test_client):
    """Test detection without file."""
    response = test_client.post("/api/v1/detect")
    assert response.status_code == 422  # Validation error

def test_get_detection_result(test_client, sample_image):
    """Test retrieving detection results."""
    # First, create a detection
    files = {"file": ("test.jpg", sample_image, "image/jpeg")}
    response = test_client.post("/api/v1/detect", files=files)
    result_id = response.json()["file_id"]
    
    # Then retrieve the result
    response = test_client.get(f"/api/v1/result/{result_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == result_id
    assert "confidence" in data
    assert "is_fake" in data

def test_get_nonexistent_result(test_client):
    """Test retrieving non-existent result."""
    response = test_client.get("/api/v1/result/99999")
    assert response.status_code == 404

def test_detection_history(test_client, sample_image):
    """Test detection history endpoint."""
    # Create a few detections
    for i in range(3):
        files = {"file": (f"test{i}.jpg", sample_image, "image/jpeg")}
        test_client.post("/api/v1/detect", files=files)
    
    # Get history
    response = test_client.get("/api/v1/history")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "total" in data
    assert len(data["results"]) >= 3
```

#### 4. Service Tests (`test_services/test_ml_service.py`)
```python
import pytest
import tempfile
import os
from PIL import Image
from app.services.ml_service import FakeDetectionService

@pytest.fixture
def ml_service():
    """Create ML service instance."""
    return FakeDetectionService()

@pytest.fixture
def test_image_path():
    """Create a temporary test image."""
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        img = Image.new('RGB', (224, 224), color='blue')
        img.save(tmp.name)
        yield tmp.name
    os.unlink(tmp.name)

def test_ml_service_initialization(ml_service):
    """Test ML service initialization."""
    assert ml_service.device is not None
    assert ml_service.transform is not None
    assert not ml_service.model_loaded

def test_load_model(ml_service):
    """Test model loading."""
    result = ml_service.load_model()
    assert result is True
    assert ml_service.model_loaded is True

@pytest.mark.asyncio
async def test_predict_image(ml_service, test_image_path):
    """Test image prediction."""
    result = await ml_service.predict(test_image_path)
    
    assert "is_fake" in result
    assert "confidence" in result
    assert "details" in result
    assert isinstance(result["is_fake"], bool)
    assert 0.0 <= result["confidence"] <= 1.0

@pytest.mark.asyncio
async def test_predict_invalid_image(ml_service):
    """Test prediction with invalid image path."""
    result = await ml_service.predict("/nonexistent/path.jpg")
    
    assert result["confidence"] == 0.0
    assert "Error during prediction" in result["details"]

def test_preprocess_image(ml_service, test_image_path):
    """Test image preprocessing."""
    tensor = ml_service.preprocess_image(test_image_path)
    
    assert tensor.shape == (1, 3, 224, 224)  # Batch, Channels, Height, Width
    assert tensor.dtype.is_floating_point

def test_get_model_info(ml_service):
    """Test model information retrieval."""
    info = ml_service.get_model_info()
    
    assert "model_loaded" in info
    assert "device" in info
    assert "model_type" in info
    assert "version" in info
```

#### 5. Database Tests (`test_models/test_database.py`)
```python
import pytest
from app.models.models import DetectionResult
from sqlalchemy.orm import Session

def test_create_detection_result(db_session: Session):
    """Test creating a detection result."""
    result = DetectionResult(
        filename="test.jpg",
        file_path="/tmp/test.jpg",
        file_size=1024,
        mime_type="image/jpeg",
        is_fake=True,
        confidence_score=0.85,
        processing_time=2.1
    )
    
    db_session.add(result)
    db_session.commit()
    db_session.refresh(result)
    
    assert result.id is not None
    assert result.filename == "test.jpg"
    assert result.is_fake is True
    assert result.confidence_score == 0.85

def test_query_detection_results(db_session: Session):
    """Test querying detection results."""
    # Create test data
    results = [
        DetectionResult(
            filename=f"test{i}.jpg",
            file_path=f"/tmp/test{i}.jpg",
            file_size=1024 * i,
            mime_type="image/jpeg",
            is_fake=i % 2 == 0,
            confidence_score=0.8 + (i * 0.05),
            processing_time=1.0 + i
        )
        for i in range(5)
    ]
    
    for result in results:
        db_session.add(result)
    db_session.commit()
    
    # Test queries
    all_results = db_session.query(DetectionResult).all()
    assert len(all_results) == 5
    
    fake_results = db_session.query(DetectionResult).filter(
        DetectionResult.is_fake == True
    ).all()
    assert len(fake_results) == 3  # Results 0, 2, 4
    
    high_confidence = db_session.query(DetectionResult).filter(
        DetectionResult.confidence_score > 0.9
    ).all()
    assert len(high_confidence) == 2  # Results 3, 4
```

### Running Backend Tests

#### Basic Test Execution
```bash
cd server

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_api/test_detection.py

# Run specific test function
pytest tests/test_api/test_detection.py::test_health_endpoint

# Run tests with coverage
pytest --cov=app --cov-report=html

# Run tests in parallel
pytest -n auto
```

#### Test Output Examples
```bash
# Successful test run
$ pytest -v
================== test session starts ==================
tests/test_api/test_detection.py::test_health_endpoint PASSED
tests/test_api/test_detection.py::test_detect_endpoint_success PASSED
tests/test_api/test_detection.py::test_detect_endpoint_invalid_file PASSED
tests/test_services/test_ml_service.py::test_predict_image PASSED
================== 4 passed in 2.35s ==================

# Test with coverage
$ pytest --cov=app
================== test session starts ==================
tests/test_api/test_detection.py ....
tests/test_services/test_ml_service.py ....

---------- coverage: platform linux, python 3.11.0 -----------
Name                        Stmts   Miss  Cover
-----------------------------------------------
app/__init__.py                 0      0   100%
app/api/detection.py           89     12    87%
app/services/ml_service.py     156     23    85%
-----------------------------------------------
TOTAL                         245     35    86%
```

## 🖥️ Frontend Testing (React + Jest)

### Test Structure
```
client/
├── src/
│   ├── __tests__/               # Test files
│   │   ├── components/
│   │   │   ├── Navbar.test.js
│   │   │   └── Footer.test.js
│   │   ├── pages/
│   │   │   ├── HomePage.test.js
│   │   │   ├── DetectionPage.test.js
│   │   │   └── ResultPage.test.js
│   │   └── services/
│   │       └── api.test.js
│   └── setupTests.js            # Test configuration
```

### Setting Up Frontend Tests

#### 1. Test Dependencies (Already included)
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.5.2"
  }
}
```

#### 2. Component Tests (`__tests__/components/Navbar.test.js`)
```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const NavbarWrapper = () => (
  <BrowserRouter>
    <Navbar />
  </BrowserRouter>
);

describe('Navbar Component', () => {
  test('renders company name', () => {
    render(<NavbarWrapper />);
    expect(screen.getByText('DeepSpear AI')).toBeInTheDocument();
  });

  test('contains navigation links', () => {
    render(<NavbarWrapper />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Detect Fake Content')).toBeInTheDocument();
  });

  test('mobile menu toggle works', () => {
    render(<NavbarWrapper />);
    
    // Find and click the mobile menu button
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    // Check if mobile menu appears (implementation depends on your CSS)
    // This test might need adjustment based on how mobile menu is implemented
  });

  test('navigation links have correct href attributes', () => {
    render(<NavbarWrapper />);
    
    const homeLink = screen.getByRole('link', { name: /home/i });
    const detectLink = screen.getByRole('link', { name: /detect fake content/i });
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(detectLink).toHaveAttribute('href', '/detect');
  });
});
```

#### 3. Page Tests (`__tests__/pages/HomePage.test.js`)
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';

const HomePageWrapper = () => (
  <BrowserRouter>
    <HomePage />
  </BrowserRouter>
);

describe('HomePage Component', () => {
  test('renders main heading with company motto', () => {
    render(<HomePageWrapper />);
    expect(screen.getByText(/don't get juked by ai/i)).toBeInTheDocument();
  });

  test('renders feature cards', () => {
    render(<HomePageWrapper />);
    expect(screen.getByText('Advanced Detection')).toBeInTheDocument();
    expect(screen.getByText('Real-time Analysis')).toBeInTheDocument();
    expect(screen.getByText('Detailed Insights')).toBeInTheDocument();
  });

  test('contains call-to-action buttons', () => {
    render(<HomePageWrapper />);
    expect(screen.getByText('Detect Fake Content')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  test('detect button links to detection page', () => {
    render(<HomePageWrapper />);
    const detectButton = screen.getByRole('link', { name: /detect fake content/i });
    expect(detectButton).toHaveAttribute('href', '/detect');
  });
});
```

#### 4. API Service Tests (`__tests__/services/api.test.js`)
```javascript
import axios from 'axios';
import { uploadImage, getDetectionResult, checkHealth } from '../../services/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    test('successfully uploads image', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        data: {
          file_id: 1,
          filename: 'test.jpg',
          is_fake: false,
          confidence: 0.85,
          processing_time: 2.1
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await uploadImage(mockFile);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/detect',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    test('handles upload error', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const errorMessage = 'Upload failed';

      mockedAxios.post.mockRejectedValue(new Error(errorMessage));

      await expect(uploadImage(mockFile)).rejects.toThrow(errorMessage);
    });
  });

  describe('getDetectionResult', () => {
    test('successfully gets detection result', async () => {
      const mockResponse = {
        data: {
          id: 1,
          filename: 'test.jpg',
          is_fake: false,
          confidence: 0.85
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getDetectionResult(1);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/result/1', {
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('checkHealth', () => {
    test('successfully checks health', async () => {
      const mockResponse = {
        data: { status: 'healthy', service: 'DeepSpear AI Detection API' }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await checkHealth();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/health', {
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockResponse.data);
    });
  });
});
```

### Running Frontend Tests

#### Basic Test Execution
```bash
cd client

# Run all tests
npm test

# Run tests in watch mode (default)
npm test -- --watchAll

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test HomePage.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

## 🔄 Integration Testing

### API Integration Tests
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
cd server
pytest tests/integration/

# Test specific integration scenarios
pytest tests/integration/test_full_workflow.py
```

### Example Integration Test
```python
# tests/integration/test_full_workflow.py
import pytest
from fastapi.testclient import TestClient
import io
from PIL import Image

@pytest.mark.integration
def test_complete_detection_workflow(test_client):
    """Test the complete detection workflow from upload to result retrieval."""
    
    # 1. Check API health
    health_response = test_client.get("/api/v1/health")
    assert health_response.status_code == 200
    
    # 2. Upload image for detection
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    files = {"file": ("test.jpg", img_bytes, "image/jpeg")}
    upload_response = test_client.post("/api/v1/detect", files=files)
    assert upload_response.status_code == 200
    
    upload_data = upload_response.json()
    assert "file_id" in upload_data
    file_id = upload_data["file_id"]
    
    # 3. Retrieve detection result
    result_response = test_client.get(f"/api/v1/result/{file_id}")
    assert result_response.status_code == 200
    
    result_data = result_response.json()
    assert result_data["id"] == file_id
    assert "confidence" in result_data
    assert "is_fake" in result_data
    
    # 4. Check history includes our detection
    history_response = test_client.get("/api/v1/history")
    assert history_response.status_code == 200
    
    history_data = history_response.json()
    assert any(result["id"] == file_id for result in history_data["results"])
```

## 🎭 End-to-End Testing

### Using Playwright (Optional)
```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install
```

### E2E Test Example
```javascript
// e2e/detection-workflow.spec.js
import { test, expect } from '@playwright/test';

test('complete fake detection workflow', async ({ page }) => {
  // Navigate to homepage
  await page.goto('http://localhost:3000');
  
  // Check homepage loads correctly
  await expect(page.locator('h1')).toContainText("Don't get juked by AI");
  
  // Navigate to detection page
  await page.click('text=Detect Fake Content');
  await expect(page).toHaveURL('/detect');
  
  // Upload an image
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('test-files/sample-image.jpg');
  
  // Start analysis
  await page.click('text=Analyze Image');
  
  // Wait for results page
  await expect(page).toHaveURL(/\/result\/\d+/);
  
  // Check results are displayed
  await expect(page.locator('text=Detection Results')).toBeVisible();
  await expect(page.locator('text=Confidence Score')).toBeVisible();
});
```

## 📊 Test Coverage and Quality

### Coverage Goals
- **Backend**: Aim for 80%+ code coverage
- **Frontend**: Aim for 70%+ code coverage
- **Critical paths**: 100% coverage for detection workflow

### Coverage Reports
```bash
# Backend coverage
cd server
pytest --cov=app --cov-report=html
open htmlcov/index.html

# Frontend coverage
cd client
npm test -- --coverage --watchAll=false
open coverage/lcov-report/index.html
```

### Quality Metrics
- All tests should pass consistently
- No flaky tests (tests that sometimes fail)
- Fast test execution (< 30 seconds for unit tests)
- Clear, descriptive test names
- Good error messages when tests fail

## 🔧 Continuous Integration

### GitHub Actions Example
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd server
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd server
          pytest --cov=app

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd client
          npm install
      - name: Run tests
        run: |
          cd client
          npm test -- --coverage --watchAll=false
```

## 🚀 Performance Testing

### Load Testing with Apache Bench
```bash
# Test API endpoint performance
ab -n 100 -c 10 http://localhost:8000/api/v1/health

# Test with POST requests (requires more setup)
# Create a sample request file and use tools like wrk or artillery
```

### Memory and Resource Testing
```bash
# Monitor resource usage during tests
docker stats

# Profile memory usage
pip install memory-profiler
python -m memory_profiler tests/test_memory_usage.py
```

## 🐛 Test Debugging

### Common Test Issues
1. **Database state**: Ensure tests clean up after themselves
2. **Async operations**: Use proper async/await in tests
3. **File handling**: Clean up uploaded files in tests
4. **Network requests**: Mock external API calls

### Debugging Tools
```bash
# Run tests with debugging
pytest --pdb                    # Drop into debugger on failure
pytest -s                      # Don't capture output
pytest --lf                    # Run only last failed tests

# Frontend debugging
npm test -- --no-watch         # Run once without watch mode
npm test -- --verbose          # Verbose output
```

## 📚 Next Steps

After setting up testing:

1. **Learn CI/CD**: Set up automated testing in your deployment pipeline
2. **Performance Testing**: Add load testing for production readiness
3. **Security Testing**: Add security-focused tests
4. **Monitor Tests**: Set up test result monitoring and alerts

## 🎯 Testing Best Practices

### General Principles
- **AAA Pattern**: Arrange, Act, Assert
- **DRY**: Don't Repeat Yourself in test setup
- **Fast**: Keep unit tests fast (< 1 second each)
- **Isolated**: Tests shouldn't depend on each other
- **Repeatable**: Tests should produce same results every time

### Test Naming Convention
```python
def test_[what_is_being_tested]_[under_what_circumstances]_[expected_behavior]():
    # Example: test_detect_endpoint_with_valid_image_returns_success()
    pass
```

### Common Patterns
- Use fixtures for common test data
- Mock external dependencies
- Test both success and failure cases
- Include edge cases in tests
- Keep tests simple and focused