import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Eye, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "고급 탐지 기능",
      description: "정교한 가짜 콘텐츠를 높은 정확도로 탐지하도록 훈련된 최첨단 AI 모델입니다."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "실시간 분석",
      description: "최적화된 처리 파이프라인으로 즉시 결과를 확인하세요. 몇 초 만에 업로드하고 분석할 수 있습니다."
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "상세한 인사이트",
      description: "이미지 가짜 확률과 탐지 결과에 대한 자세한 설명이 포함된 종합적인 분석을 제공합니다."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-indigo-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              AI에게{' '}
              <span className="text-gradient">속지 마세요</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              고급 AI 기반 가짜 콘텐츠 탐지 서비스.
              최첨단 딥러닝 기술로 진위를 확인하세요.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                to="/detect"
                className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4"
              >
                <span>가짜 콘텐츠 탐지</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <button className="btn-secondary text-lg px-8 py-4">
                더 알아보기
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              딥스피어 AI를 선택하는 이유는?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              우리의 고급 기술은 신뢰할 수 있고 빠르며 정확한 가짜 콘텐츠 탐지를 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card text-center hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              콘텐츠 검증을 시작할 준비가 되셨나요?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              이미지를 업로드하고 즉시 AI 기반 가짜 콘텐츠 탐지 결과를 확인하세요.
            </p>
            <Link
              to="/detect"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-4 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2 text-lg"
            >
              <span>탐지 시작</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;