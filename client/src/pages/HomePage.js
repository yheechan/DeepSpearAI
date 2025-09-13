import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Eye, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Advanced Detection",
      description: "State-of-the-art AI models trained to detect sophisticated fake content with high accuracy."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-time Analysis",
      description: "Get instant results with our optimized processing pipeline. Upload and analyze in seconds."
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Detailed Insights",
      description: "Comprehensive analysis with confidence scores and detailed explanations of detection results."
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
              Don't get{' '}
              <span className="text-gradient">juked by AI</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Advanced AI-powered fake content detection service. 
              Verify authenticity with cutting-edge deep learning technology.
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
                <span>Detect Fake Content</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <button className="btn-secondary text-lg px-8 py-4">
                Learn More
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
              Why Choose DeepSpear AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our advanced technology provides reliable, fast, and accurate fake content detection.
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
              Ready to Verify Your Content?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Upload your image and get instant AI-powered fake content detection results.
            </p>
            <Link
              to="/detect"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-4 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2 text-lg"
            >
              <span>Start Detection</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;