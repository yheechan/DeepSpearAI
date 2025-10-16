import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/images/logos/logo_transparent.png" 
                alt="딥스피어 AI 로고" 
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold">DeepSpear AI</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              고급 AI 기반 가짜 콘텐츠 탐지 서비스.
              최첨단 기술로 디지털 무결성을 보호합니다.
            </p>
            <p className="text-sm text-gray-500">
              AI에게 속지 마세요 - 정확한 콘텐츠 검증은 딥스피어 AI를 믿으세요.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">빠른 링크</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                  홈
                </a>
              </li>
              <li>
                <a href="/detect" className="text-gray-400 hover:text-white transition-colors duration-200">
                  콘텐츠 탐지
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors duration-200">
                  회사 소개
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">연결</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Email"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} 딥스피어 AI. 모든 권리 보유.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;