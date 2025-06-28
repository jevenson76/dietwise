import React, { useState, useEffect } from 'react';
import { trackEvent } from '@services/analyticsService';

interface TooltipStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface OnboardingTooltipProps {
  isFirstTimeUser: boolean;
  currentTab: string;
}

const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ isFirstTimeUser, currentTab }) => {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [hasSeenTooltips, setHasSeenTooltips] = useState<boolean>(() => {
    return localStorage.getItem('hasSeenTooltips') === 'true';
  });

  // Define tooltip steps for different tabs
  const tooltipSteps: Record<string, TooltipStep[]> = {
    'Log Food': [
      {
        id: 'log-food-intro',
        target: '[data-tooltip="add-food-button"]',
        title: 'Start Logging Your Meals',
        content: 'Tap here to add foods to your daily log. You can search, scan barcodes, or choose from your saved foods.',
        position: 'bottom',
        highlight: true,
      },
      {
        id: 'calorie-tracker',
        target: '[data-tooltip="calorie-summary"]',
        title: 'Track Your Progress',
        content: 'This shows your daily calorie intake vs. your target. Stay in the green to meet your goals!',
        position: 'top',
      },
    ],
    'Profile': [
      {
        id: 'profile-setup',
        target: '[data-tooltip="profile-form"]',
        title: 'Complete Your Profile',
        content: 'Fill in your details here to get personalized calorie and macro targets.',
        position: 'right',
      },
      {
        id: 'weight-goal',
        target: '[data-tooltip="weight-goal"]',
        title: 'Set Your Goal',
        content: 'Choose a realistic target weight and date. We\'ll calculate the perfect daily calories for you.',
        position: 'left',
      },
    ],
  };

  const steps = tooltipSteps[currentTab] || [];

  useEffect(() => {
    if (isFirstTimeUser && !hasSeenTooltips && steps.length > 0) {
      // Start tooltips after a short delay
      const timer = setTimeout(() => {
        setCurrentStep(0);
        trackEvent('onboarding_tooltips_started', { tab: currentTab });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFirstTimeUser, hasSeenTooltips, currentTab, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    trackEvent('onboarding_tooltips_skipped', { tab: currentTab, step: currentStep });
    handleComplete();
  };

  const handleComplete = () => {
    setCurrentStep(-1);
    setHasSeenTooltips(true);
    localStorage.setItem('hasSeenTooltips', 'true');
    trackEvent('onboarding_tooltips_completed', { tab: currentTab });
  };

  if (currentStep === -1 || !steps[currentStep]) {
    return null;
  }

  const currentTooltip = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleSkip}
      />
      
      {/* Tooltip */}
      <div 
        className={`fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 max-w-sm ${
          currentTooltip.highlight ? 'ring-4 ring-teal-500 ring-opacity-50' : ''
        }`}
        style={{
          // Position calculation would be done with a ref to the target element
          // For now, using static positioning
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentTooltip.title}
          </h3>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {currentTooltip.content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-teal-500 w-4'
                    : index < currentStep
                    ? 'bg-teal-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSkip}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip tour
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTooltip;