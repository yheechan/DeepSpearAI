import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 120000, // 2 minutes timeout for mobile compatibility
  withCredentials: false, // Explicitly set for mobile browsers
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || error.response.data?.message || 'Server error';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error('Request failed');
    }
  }
);

/**
 * Upload an image for fake content detection
 * @param {File} file - The image file to upload
 * @returns {Promise} - Promise resolving to detection result
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Track upload progress
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

/**
 * Get detection result by ID
 * @param {string|number} resultId - The ID of the detection result
 * @returns {Promise} - Promise resolving to detection result details
 */
export const getDetectionResult = async (resultId) => {
  try {
    const response = await api.get(`/result/${resultId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to get detection result:', error);
    throw error;
  }
};

/**
 * Get detection history
 * @param {number} limit - Number of results to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise} - Promise resolving to history data
 */
export const getDetectionHistory = async (limit = 10, offset = 0) => {
  try {
    const response = await api.get('/history', {
      params: { limit, offset },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to get detection history:', error);
    throw error;
  }
};

/**
 * Check API health status
 * @returns {Promise} - Promise resolving to health status
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Export the axios instance for direct use if needed
export default api;