import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Eye, ArrowRight, ChevronDown } from 'lucide-react';

const HomePage = () => {

  const [openFAQ, setOpenFAQ] = useState(null);

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
      description: "이미지 가짜일 확률과 탐지 결과에 대한 자세한 설명이 포함된 종합적인 분석을 제공합니다."
    }
  ];

  const faqs = [
    {
      question: "딥스피어 AI란 무엇이고 어떻게 작동하나요?",
      answer: "딥스피어 AI는 AI가 생성하거나 조작한 이미지를 실제 이미지와 구분하는 인공지능 감지 서비스입니다. 이미지의 픽셀 패턴과 통계적 특징을 분석해 AI 생성 가능성을 평가하며, 결과는 신뢰 점수(Confidence Score) 형태로 제공합니다. 웹이나 API를 통해 간편하게 사용할 수 있고, 다양한 산업에서 위조 이미지 검증에 활용됩니다."
    },
    {
      question: "딥스피어 AI를 어떻게 사용하나요?",
      answer: "딥스피어 AI는 현재 베타버전으로 웹사이트를 통해 무료로 이용할 수 있습니다. 이미지를 업로드하면 자동으로 분석이 진행되고, 결과는 신뢰 점수 형태로 바로 확인할 수 있습니다. 기업 고객의 경우, 향후 별도의 요금제를 통해 API 형태로 대량 이미지 감지 서비스를 제공할 예정입니다.웹사이트 또는 API를 통해 이미지를 업로드하거나 URL을 입력하면 자동으로 분석이 시작됩니다."
    },
    {
      question: "분석할 수 있는 이미지 유형에 제한이 있나요?",
      answer: "현재 딥스피어 AI는 정적 이미지(JPEG, PNG, WEBP 등) 에 한해 분석이 가능합니다. 하지만 앞으로는 딥페이크 영상, 음성 합성(딥보이스), 문서 위조 탐지 등으로 영역을 확장해, AI 생성 콘텐츠 전반을 아우르는 종합 감지 플랫폼으로 발전할 계획입니다."
    },
    {
      question: "왜 해외 서비스가 아닌 딥스피어 AI를 사용해야 하나요?",
      answer: "해외 서비스 대부분은 서양인 위주의 데이터로 학습되어 동양인, 특히 한국인 얼굴에 대한 인식 정확도가 떨어질 수 있습니다. 딥스피어 AI는 국내 스타트업으로서 한국인 중심의 데이터를 적극 활용해 학습했기 때문에, 한국 사용자와 환경에서 훨씬 높은 탐지 성능을 제공합니다. 즉, 우리 서비스는 한국 실정에 최적화된 딥페이크 탐지 성능이 강점입니다."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              인류는 더 이상 AI로부터 안전하지 않습니다.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI 생성 및 조작 이미지가 사회 전반에 미치는 영향과 실제 사례들을 살펴보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: '/images/home_page/usecases/fake_insurance.png',
                title: '조작된 차량 이미지로 가짜 보험 청구',
                description: 'AI로 조작된 차량 손상 이미지를 이용해 허위 사고를 꾸미고 보험금을 부당 청구하는 사례가 발생하고 있습니다.',
                link: 'https://www.theguardian.com/business/article/2024/may/02/car-insurance-scam-fake-damaged-added-photos-manipulated'
              },
              {
                image: '/images/home_page/usecases/fake_dangn.png',
                title: 'AI 이미지로 인한 중고 거래 사기',
                description: '실제 존재하지 않는 중고 상품의 이미지를 AI로 생성하거나 조작해 신뢰를 얻은 뒤 구매자를 속이는 사례가 늘고 있습니다.',
                link: 'https://www.sisajournal-e.com/news/curationView.html?idxno=414494'
              },
              {
                image: '/images/home_page/usecases/fake_celeb_ad.png',
                title: '유명인 사칭을 통한 허위 광고',
                description: '유명인의 얼굴과 발언을 AI로 합성해 마치 실제 인물의 추천처럼 꾸며, 도박 사이트나 코인 스캠 등 불법 광고에 악용되고 있습니다.',
                link: 'https://www.insight.co.kr/news/517153'
              },
              {
                image: '/images/home_page/usecases/fake_doctor.png',
                title: '가상 전문가를 이용한 허위 의료·건강 광고',
                description: 'AI로 생성된 가상 인물이 실제 전문가인 것처럼 등장해 검증되지 않은 일반식품이나 건강기능식품의 효능을 보증하는 광고가 확산되고 있습니다.',
                link: 'https://m.health.chosun.com/svc/news_view.html?contid=2025092603274'
              },
              {
                image: '/images/home_page/usecases/fake_news.png',
                title: 'AI가 생성한 가짜 뉴스 이미지',
                description: 'AI로 조작된 뉴스 이미지는 사실과 다른 정보를 사실처럼 보여주어 대중을 오도하고 언론의 신뢰성을 훼손할 수 있습니다.',
                link: 'https://news.kbs.co.kr/news/pc/view/view.do?ncd=7682217'
              },
              {
                image: '/images/home_page/usecases/fake_id.png',
                title: 'AI로 생성된 위조 신분증과 문서',
                description: 'AI 이미지 생성 기술을 이용해 실제와 구분이 어려운 가짜 신분증이나 문서를 만들어 신원 도용 및 디지털 사기에 악용하는 사례가 늘고 있습니다.',
                link: 'https://m.ddaily.co.kr/page/view/2025091517315768131'
              }

            ].map((useCase, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => window.open(useCase.link, '_blank')}
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={useCase.image}
                    alt={useCase.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
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

      {/* FAQ Section */}
      <section className="py-20" style={{ backgroundColor: '#F2F8FC' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-xl text-gray-600">
              딥스피어 AI를 이용하시는 분들이 자주 묻는 질문입니다.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    <span style={{ color: '#62A7DE' }}>Q.</span> {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
                      openFAQ === index ? 'transform rotate-180' : ''
                    }`}
                    style={{ color: '#62A7DE' }}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
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