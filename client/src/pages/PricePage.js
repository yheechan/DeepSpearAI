import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, ArrowRight } from 'lucide-react';

const PricePage = () => {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-white min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              현재는 무료입니다. <br/> 많이 써주세요.
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              현재는 데모 서비스 진행중입니다.<br />
              추후 유료화 정책이 적용될 예정입니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricePage;