import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowLeft, 
  Download,
  Share,
  BarChart3,
  Info
} from 'lucide-react';
import { getDetectionResult } from '../services/api';

const ResultPage = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await getDetectionResult(resultId);
        setResult(data);
      } catch (err) {
        setError(err.message || 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };

    if (resultId) {
      fetchResult();
    }
  }, [resultId]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBgColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Result</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/detect"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Try Again</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No result found</p>
        </div>
      </div>
    );
  }

  const confidencePercentage = Math.round(result.confidence * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/detect"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Analyze Another Image</span>
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Detection Results
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Result */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Result Card */}
            <motion.div
              className={`card border-2 ${getConfidenceBgColor(result.confidence)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <div className="mb-4">
                  {result.is_fake ? (
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
                  ) : (
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  )}
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {result.is_fake ? 'Potentially Fake' : 'Likely Authentic'}
                </h2>
                
                <p className="text-lg text-gray-600 mb-4">
                  {result.is_fake 
                    ? 'This image appears to be AI-generated or manipulated'
                    : 'This image appears to be authentic'
                  }
                </p>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                    <span className={`text-2xl font-bold ${getConfidenceColor(result.confidence)}`}>
                      {confidencePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        result.confidence >= 0.8 ? 'bg-green-500' :
                        result.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${confidencePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Analysis Details */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Analysis Details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Name:</span>
                    <span className="font-medium text-gray-900">{result.filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size:</span>
                    <span className="font-medium text-gray-900">
                      {(result.file_size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Type:</span>
                    <span className="font-medium text-gray-900">{result.mime_type}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Time:</span>
                    <span className="font-medium text-gray-900">{result.processing_time}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model Version:</span>
                    <span className="font-medium text-gray-900">{result.model_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Analysis Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <motion.div
              className="card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Share className="h-4 w-4" />
                  <span>Share Result</span>
                </button>
                <Link
                  to="/detect"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <span>Analyze Another</span>
                </Link>
              </div>
            </motion.div>

            {/* Info Card */}
            <motion.div
              className="card bg-blue-50 border-blue-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-start space-x-3">
                <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
                  <p className="text-sm text-blue-800">
                    Our AI analyzes various image characteristics including compression artifacts, 
                    pixel patterns, and statistical anomalies to determine authenticity.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Processing Time */}
            <motion.div
              className="card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Processing completed in</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.processing_time} seconds
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;