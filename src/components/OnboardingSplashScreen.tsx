import React, { useState } from 'react';
import { trackEvent } from '@services/analyticsService';

interface OnboardingSplashScreenProps {
  onComplete: () => void;
  onStartFreeTrial: () => void;
}

const OnboardingSplashScreen: React.FC<OnboardingSplashScreenProps> = ({ 
  onComplete, 
  onStartFreeTrial 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to DietWise",
      subtitle: "Your Personal Nutrition Companion",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-6 border border-emerald-400/30">
            <h3 className="text-xl font-semibold mb-3">Track Your Journey</h3>
            <p className="text-white/90">Log meals, monitor calories, and track your progress towards your health goals with our intuitive interface.</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-400/30">
            <h3 className="text-xl font-semibold mb-3">Smart Insights</h3>
            <p className="text-white/90">Get personalized recommendations based on your unique profile and dietary needs.</p>
          </div>
        </div>
      ),
      icon: "fa-heartbeat"
    },
    {
      title: "Core Features",
      subtitle: "Everything You Need",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30">
            <i className="fas fa-book text-2xl mb-2 text-purple-300"></i>
            <h4 className="font-semibold">Food Log</h4>
            <p className="text-sm text-white/80">Easy meal tracking</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-lg p-4 border border-green-400/30">
            <i className="fas fa-chart-line text-2xl mb-2 text-green-300"></i>
            <h4 className="font-semibold">Progress</h4>
            <p className="text-sm text-white/80">Visual weight tracking</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-lg p-4 border border-orange-400/30">
            <i className="fas fa-database text-2xl mb-2 text-orange-300"></i>
            <h4 className="font-semibold">Food Library</h4>
            <p className="text-sm text-white/80">Save custom foods</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg p-4 border border-indigo-400/30">
            <i className="fas fa-utensils text-2xl mb-2 text-indigo-300"></i>
            <h4 className="font-semibold">Meal Ideas</h4>
            <p className="text-sm text-white/80">AI-powered suggestions</p>
          </div>
        </div>
      ),
      icon: "fa-rocket"
    },
    {
      title: "Premium Benefits",
      subtitle: "Unlock Your Full Potential",
      content: (
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-green-400/30">
              <div className="flex items-center space-x-3 mb-2">
                <i className="fas fa-barcode text-green-400 text-xl"></i>
                <h4 className="font-semibold text-lg">Unlimited Barcode Scanning</h4>
              </div>
              <p className="text-white/90 text-sm ml-8">Scan any product instantly for quick food logging</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-blue-400/30">
              <div className="flex items-center space-x-3 mb-2">
                <i className="fas fa-brain text-blue-400 text-xl"></i>
                <h4 className="font-semibold text-lg">Intelligent Meal Planning</h4>
              </div>
              <p className="text-white/90 text-sm ml-8">AI-powered weekly meal suggestions tailored to your goals</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30">
              <div className="flex items-center space-x-3 mb-2">
                <i className="fas fa-chart-pie text-purple-400 text-xl"></i>
                <h4 className="font-semibold text-lg">Comprehensive Analytics</h4>
              </div>
              <p className="text-white/90 text-sm ml-8">Detailed nutrition insights, trends, and progress tracking</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-orange-400/30">
              <div className="flex items-center space-x-3 mb-2">
                <i className="fas fa-download text-orange-400 text-xl"></i>
                <h4 className="font-semibold text-lg">PDF Export & Full History</h4>
              </div>
              <p className="text-white/90 text-sm ml-8">Export reports and access unlimited data history</p>
            </div>
          </div>
        </div>
      ),
      icon: "fa-crown"
    },
    {
      title: "Ready to Transform Your Health?",
      subtitle: "Pick the perfect plan for your nutrition journey",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-300 text-gray-800 shadow-lg">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Free Plan</h3>
              <p className="text-gray-600">Perfect for getting started</p>
              <div className="text-3xl font-bold text-gray-800 mt-3">$0</div>
              <p className="text-sm text-gray-500">Forever free</p>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <i className="fas fa-check text-green-600 text-lg"></i>
                <span>Basic food logging</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-check text-green-600 text-lg"></i>
                <span>Weight tracking</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-check text-green-600 text-lg"></i>
                <span>15 custom foods/meals</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-check text-green-600 text-lg"></i>
                <span>30-day data history</span>
              </li>
            </ul>
          </div>
          
          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-yellow-400/90 to-orange-400/90 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-600 text-gray-900 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg text-xs font-semibold">
              7-Day Free Trial
            </div>
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold flex items-center justify-center mb-2">
                <i className="fas fa-star mr-2 text-yellow-600"></i>
                Premium Plan
              </h3>
              <p className="text-gray-800 mb-3">Everything in Free, plus:</p>
              <div className="text-3xl font-bold text-gray-900">$4.99</div>
              <p className="text-sm text-gray-700">per month • $49.99/year</p>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <i className="fas fa-star text-yellow-600 text-lg"></i>
                <span className="font-medium">Unlimited everything</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-star text-yellow-600 text-lg"></i>
                <span className="font-medium">Intelligent meal planning</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-star text-yellow-600 text-lg"></i>
                <span className="font-medium">Comprehensive analytics</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-star text-yellow-600 text-lg"></i>
                <span className="font-medium">PDF exports & full history</span>
              </li>
            </ul>
          </div>
        </div>
      ),
      icon: "fa-gem"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      trackEvent('onboarding_completed');
      onComplete();
    }
  };

  const handleSkip = () => {
    trackEvent('onboarding_skipped', { slide: currentSlide });
    onComplete();
  };

  const handleStartTrial = () => {
    trackEvent('onboarding_trial_started');
    onStartFreeTrial();
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors"
        >
          Skip <i className="fas fa-arrow-right ml-1"></i>
        </button>

        {/* Tap anywhere to continue hint - hidden on last slide */}
        {currentSlide !== slides.length - 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">
            <i className="fas fa-hand-pointer mr-2"></i>
            Tap anywhere to navigate
          </div>
        )}

        {/* Slide Content */}
        <div className="text-center text-white">
          {/* Icon */}
          <div className="mb-6">
            <i className={`fas ${currentSlideData.icon} text-6xl`}></i>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {currentSlideData.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {currentSlideData.subtitle}
          </p>

          {/* Content */}
          <div className="mb-12 max-h-[400px] overflow-y-auto custom-scrollbar px-2">
            {currentSlideData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {/* Progress Dots */}
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-white w-8' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {currentSlide === slides.length - 1 ? (
                <>
                  <button
                    onClick={onComplete}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-semibold transition-all"
                  >
                    Start Free
                  </button>
                  <button
                    onClick={handleStartTrial}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Free Trial
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-white hover:bg-white/90 text-teal-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Next <i className="fas fa-arrow-right ml-2"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSplashScreen;