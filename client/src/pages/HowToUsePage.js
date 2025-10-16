import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, ArrowRight } from 'lucide-react';

const HowToUsePage = () => {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              AI 생성 탐지
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              더 이상 AI에게 속지마세요.<br />
              딥스피어 AI의 최첨단 기술로 이미지의 진위를 확인하세요.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
            {/* Right: Steps Section (모바일에서 먼저 표시) */}
            <div className="space-y-6 order-1 md:order-2 md:pl-8">
              {/* Step 01 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-4">
                  <div className="inline-flex rounded-full px-4 py-2" style={{ backgroundColor: '#E7F4FF' }}>
                    <span className="font-bold text-sm" style={{ color: '#62A7DE' }}>STEP 01</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    분석할 이미지 업로드
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    이미지를 업로드하세요. <br />
                    사진을 끌어다 놓거나 이미지 URL을 입력하세요.
                  </p>
                </div>
              </motion.div>
            </div>
            
            {/* Left: Image Upload Section (모바일에서 나중에 표시) */}
            <div className="order-2 md:order-1">
              <img 
                src="/images/how_to_use_page/STEP1_picture.png" 
                alt="이미지 업로드 섹션" 
                className="w-full h-auto"
              />
            </div>
          </div>
          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center mt-16">

            {/* Left: Steps Section (모바일에서 먼저 표시) */}
            <div className="space-y-6 order-1 md:order-2 md:pl-8">
              {/* Step 01 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-4">
                  <div className="inline-flex rounded-full px-4 py-2" style={{ backgroundColor: '#E7F4FF' }}>
                    <span className="font-bold text-sm" style={{ color: '#62A7DE' }}>STEP 02</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    딥스피어 AI 이미지 분석 진행
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    딥스피어 AI가 마법을 부리게 하세요. <br />
                    저희 AI 플랫폼이 이미지를 분석합니다.
                  </p>
                </div>
              </motion.div>
            </div>
            {/* Right: Image Upload Section (모바일에서 나중에 표시) */}
            <div className="order-2 md:order-2">
              <img 
                src="/images/how_to_use_page/STEP2_picture.png" 
                alt="이미지 업로드 섹션" 
                className="w-full h-auto"
              />
            </div>
          </div>
          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
            {/* Right: Steps Section (모바일에서 먼저 표시) */}
            <div className="space-y-6 order-1 md:order-2 md:pl-8">
              {/* Step 01 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-4">
                  <div className="inline-flex rounded-full px-4 py-2" style={{ backgroundColor: '#E7F4FF' }}>
                    <span className="font-bold text-sm" style={{ color: '#62A7DE' }}>STEP 03</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    결과 확인
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    결과를 확인하세요. <br />
                    이 이미지를 생성하는 데 AI가 사용되었는지 확인하세요.
                  </p>
                </div>
              </motion.div>
            </div>
            
            {/* Left: Image Upload Section (모바일에서 나중에 표시) */}
            <div className="order-2 md:order-1">
              <img 
                src="/images/how_to_use_page/STEP3_picture.png" 
                alt="이미지 업로드 섹션" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
        
      </section>
    </div>
  );
};

export default HowToUsePage;