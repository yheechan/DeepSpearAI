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
    // Since confidence represents fake probability, reverse the colors
    // High fake probability (dangerous) = red, Low fake probability (safe) = green
    if (confidence >= 0.8) return 'text-red-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getConfidenceBgColor = (confidence) => {
    // Since confidence represents fake probability, reverse the colors
    // High fake probability (dangerous) = red, Low fake probability (safe) = green
    if (confidence >= 0.8) return 'bg-red-100 border-red-200';
    if (confidence >= 0.6) return 'bg-yellow-100 border-yellow-200';
    return 'bg-green-100 border-green-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">분석 결과 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결과 로딩 오류</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/detect"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>다시 시도</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">결과를 찾을 수 없습니다</p>
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
            <span>다른 이미지 분석</span>
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            탐지 결과
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
                  {result.is_fake 
                    ? '이 이미지는 AI로 생성되었거나 조작된 것으로 보입니다'
                    : '이 이미지는 원본 이미지인 것으로 보입니다'
                  }
                </h2>
                
                <p className="text-lg text-gray-600 mb-4">
                  {result.is_fake ? '원본 이미지' : 'AI 제작 이미지'}
                </p>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">AI 제작 이미지 가능성(확률)</span>
                    <span className={`text-2xl font-bold ${getConfidenceColor(result.confidence)}`}>
                      {confidencePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        result.confidence >= 0.8 ? 'bg-red-500' :
                        result.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-green-500'
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
                <span>분석 세부사항</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">파일명:</span>
                    <span className="font-medium text-gray-900">{result.filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">파일 크기:</span>
                    <span className="font-medium text-gray-900">
                      {(result.file_size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">파일 형식:</span>
                    <span className="font-medium text-gray-900">{result.mime_type}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">처리 시간:</span>
                    <span className="font-medium text-gray-900">{result.processing_time}초</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">모델 버전:</span>
                    <span className="font-medium text-gray-900">{result.model_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">분석 날짜:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(result.created_at).toLocaleDateString('ko-KR')}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">액션</h3>
              <div className="space-y-3">
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>보고서 다운로드</span>
                </button>
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Share className="h-4 w-4" />
                  <span>결과 공유</span>
                </button>
                <Link
                  to="/detect"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <span>다른 이미지 분석</span>
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
                  <h4 className="font-semibold text-blue-900 mb-2">작동 방식</h4>
                  <p className="text-sm text-blue-800">
                    우리의 AI는 압축 아티팩트, 픽셀 패턴, 통계적 이상 등 다양한 이미지 특성을 
                    분석하여 진위를 판별합니다.
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
                  <p className="text-sm text-gray-600">처리 완료 시간</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.processing_time} 초
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