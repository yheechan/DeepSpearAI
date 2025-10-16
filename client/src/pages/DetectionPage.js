import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { uploadImage } from '../services/api';
import imageCompression from 'browser-image-compression';

const DetectionPage = () => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('유효한 이미지 파일을 업로드해주세요 (JPG, PNG, GIF, BMP, WEBP)');
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      try {
        // Compress image for mobile compatibility
        const options = {
          maxSizeMB: 2,          // Reduce to 2MB max
          maxWidthOrHeight: 1920, // Max dimensions for mobile
          useWebWorker: true,     // Use web worker for better performance
          fileType: 'image/jpeg', // Convert to JPEG for better compression
        };

        setError('이미지 처리 중...');
        const compressedFile = await imageCompression(file, options);
        
        setSelectedFile(compressedFile);
        setError('');
        
        // Create preview URL with compressed file
        const url = URL.createObjectURL(compressedFile);
        setPreviewUrl(url);
        
        console.log('원본 파일 크기:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('압축된 파일 크기:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
        
      } catch (compressionError) {
        console.error('이미지 압축 실패:', compressionError);
        // 압축 실패시 원본 파일로 대체
        setSelectedFile(file);
        setError('');
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB to handle large mobile photos
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('먼저 파일을 선택해주세요');
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);
    setError('');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadImage(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadState('success');

      // Navigate to results page after a short delay
      setTimeout(() => {
        navigate(`/result/${result.file_id}`);
      }, 1500);

    } catch (err) {
      setUploadState('error');
      setError(err.message || '업로드 실패. 다시 시도해주세요.');
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    setUploadState('idle');
    setUploadProgress(0);
    setError('');
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            가짜 콘텐츠 탐지
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            이미지를 업로드하여 AI가 생성한 것인지 진짜인지 분석해보세요. 
            우리의 고급 탐지 시스템이 상세한 결과를 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                이미지 업로드
              </h2>
              
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-primary-400 bg-primary-50'
                    : selectedFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                
                <div className="space-y-4">
                  {selectedFile ? (
                    <>
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-green-700">
                          파일 선택됨
                        </p>
                        <p className="text-sm text-gray-600">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          {isDragActive
                            ? '여기에 이미지를 놓으세요'
                            : '이미지를 드래그하여 놓거나 클릭하여 선택하세요'
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          JPG, PNG, GIF, BMP, WEBP 지원 (최대 50MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Upload Progress */}
              {uploadState === 'uploading' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">업로드 및 분석 중...</span>
                    <span className="text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadState === 'uploading'}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {uploadState === 'uploading' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>분석 중...</span>
                    </>
                  ) : uploadState === 'success' ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>완료!</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5" />
                      <span>이미지 분석</span>
                    </>
                  )}
                </button>
                
                {selectedFile && (
                  <button
                    onClick={resetUpload}
                    disabled={uploadState === 'uploading'}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    재설정
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                미리보기
              </h2>
              
              {previewUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="text-sm text-gray-600">
                    <p><strong>이름:</strong> {selectedFile?.name}</p>
                    <p><strong>크기:</strong> {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB</p>
                    <p><strong>형식:</strong> {selectedFile?.type}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>선택된 이미지 없음</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionPage;