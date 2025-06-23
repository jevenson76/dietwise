import React, { useEffect, useState } from 'react';

// Motivational messages pool
const MOTIVATIONAL_MESSAGES = [
  "Every healthy choice is a step towards a better you",
  "Your journey to wellness starts with a single bite",
  "Small changes today, big results tomorrow",
  "Fuel your body, feed your potential",
  "Progress, not perfection",
  "You are what you eat, so eat amazing",
  "Today's healthy choices are tomorrow's strength",
  "Nourish your body, nurture your soul",
  "Every meal is a chance to love yourself",
  "Your health is an investment, not an expense",
  "Be stronger than your excuses",
  "Good nutrition is self-respect",
  "Healthy eating is a form of self-care",
  "Your body deserves the best fuel",
  "Make food your medicine",
  "Wellness is a journey, not a destination",
  "Choose foods that love you back",
  "A healthy outside starts from the inside",
  "You're one meal away from a good mood",
  "Eat well, live well, be well"
];

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const DietWiseSplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  duration = 5000 // Increased from 3000ms to 5000ms
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [logoScale, setLogoScale] = useState(0.5);
  const [opacity, setOpacity] = useState(0);
  const [messageOpacity, setMessageOpacity] = useState(0);
  const [motivationalMessage] = useState(() => 
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );

  useEffect(() => {
    // Animation sequence starts immediately for web
    // Note: When Capacitor is added later, we can hide the native splash screen here

    // Animation sequence
    const timer1 = setTimeout(() => {
      setOpacity(1);
      setLogoScale(1);
    }, 100);

    // Show motivational message after logo animation
    const timer2 = setTimeout(() => {
      setMessageOpacity(1);
    }, 800);

    // Start fade out
    const timer3 = setTimeout(() => {
      setOpacity(0);
    }, duration - 500);

    // Complete and hide
    const timer4 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete, duration]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-400 via-blue-500 to-purple-600"
      style={{
        opacity,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="text-center z-10">
        {/* Logo Container */}
        <div
          className="mb-8 flex items-center justify-center"
          style={{
            transform: `scale(${logoScale})`,
            transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Logo Icon */}
          <div className="bg-white rounded-full p-6 shadow-2xl mb-4">
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-green-600"
            >
              {/* Apple/Health Icon */}
              <path
                d="M50 15C35 15 25 25 25 40C25 55 35 65 50 85C65 65 75 55 75 40C75 25 65 15 50 15Z"
                fill="currentColor"
                className="text-green-500"
              />
              <path
                d="M45 10C40 10 35 15 35 20C35 25 40 30 45 30C50 30 55 25 55 20C55 15 50 10 45 10Z"
                fill="currentColor"
                className="text-green-400"
              />
              <circle cx="42" cy="35" r="3" fill="white" />
              <circle cx="58" cy="35" r="3" fill="white" />
              <path
                d="M35 45 Q50 55 65 45"
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-wide">
          DietWise
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide mb-8">
          Your Personal Health Companion
        </p>

        {/* Motivational Message */}
        <div 
          className="max-w-md mx-auto px-6"
          style={{
            opacity: messageOpacity,
            transition: 'opacity 0.8s ease-in-out',
          }}
        >
          <p className="text-lg md:text-xl text-white/95 font-medium italic">
            "{motivationalMessage}"
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Version */}
        <p className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">
          v1.0.0
        </p>
      </div>

      {/* Mobile-specific elements - will be hidden on web */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 hidden">
        <div className="w-16 h-1 bg-white/30 rounded-full"></div>
      </div>
    </div>
  );
};

export default DietWiseSplashScreen;