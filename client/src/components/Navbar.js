import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/images/logos/long_logo.png" 
              alt="딥스피어 AI 로고" 
              className="h-12 w-30 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/how-to-use"
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-pretendard font-medium"
            >
              AI 생성 탐지
            </Link>
            <Link
              to="/price"
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              가격 안내
            </Link>
            <Link
              to="/team-introduce"
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              팀소개
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                홈
              </Link>
              <Link
                to="/how-to-use"
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                AI 생성 탐지
              </Link>
              <Link
                to="/price"
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                가격 안내
              </Link>
              <Link
                to="/team-introduce"
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                팀소개
              </Link>
              <Link
                to="/detect"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                가짜 콘텐츠 탐지
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;