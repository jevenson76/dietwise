import React, { useState } from 'react';
import { UserProfile, Sex, ActivityLevel } from '../types';
import { trackEvent } from '@services/analyticsService';

interface ProgressiveOnboardingProps {
  onComplete: (profile: Partial<UserProfile>) => void;
  onSkip: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  component: React.ReactNode;
  isValid: () => boolean;
}

const ProgressiveOnboarding: React.FC<ProgressiveOnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: null,
    age: null,
    sex: null,
    height: { ft: null, in: null },
    weight: null,
    activityLevel: null,
    targetWeight: null,
  });

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: "Let's get to know you",
      subtitle: "Tell us your name to personalize your experience",
      isValid: () => !!profile.name && profile.name.trim().length > 0,
      component: (
        <div className="space-y-4">
          <div className="text-center mb-8">
            <i className="fas fa-user-circle text-6xl text-white/80 mb-4"></i>
          </div>
          <input
            type="text"
            placeholder="What's your name?"
            value={profile.name || ''}
            onChange={(e) => updateProfile('name', e.target.value)}
            className="w-full px-6 py-4 text-lg bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-center"
            autoFocus
          />
          <p className="text-sm text-white/70 text-center">
            We'll use this to greet you in the app
          </p>
        </div>
      ),
    },
    {
      id: 'basics',
      title: `Nice to meet you, ${profile.name?.split(' ')[0]}!`,
      subtitle: "Let's set up your basic info",
      isValid: () => !!profile.age && !!profile.sex,
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-white/90 mb-2 text-center">How old are you?</label>
            <input
              type="number"
              placeholder="Age"
              value={profile.age || ''}
              onChange={(e) => updateProfile('age', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-6 py-3 text-lg bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-center"
              min="1"
              max="120"
            />
          </div>
          
          <div>
            <label className="block text-white/90 mb-3 text-center">Biological sex</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateProfile('sex', Sex.MALE)}
                className={`py-4 px-6 rounded-xl font-medium transition-all ${
                  profile.sex === Sex.MALE
                    ? 'bg-white text-teal-600 shadow-lg transform scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <i className="fas fa-mars mr-2"></i>Male
              </button>
              <button
                onClick={() => updateProfile('sex', Sex.FEMALE)}
                className={`py-4 px-6 rounded-xl font-medium transition-all ${
                  profile.sex === Sex.FEMALE
                    ? 'bg-white text-teal-600 shadow-lg transform scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <i className="fas fa-venus mr-2"></i>Female
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'measurements',
      title: "Your current measurements",
      subtitle: "This helps us calculate your nutritional needs",
      isValid: () => {
        const hasHeight = profile.height?.ft !== null && profile.height?.ft > 0;
        const hasWeight = profile.weight !== null && profile.weight > 0;
        return hasHeight && hasWeight;
      },
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-white/90 mb-3 text-center">Height</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder="Feet"
                  value={profile.height?.ft || ''}
                  onChange={(e) => updateProfile('height', { 
                    ...profile.height, 
                    ft: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="w-full px-4 py-3 text-lg bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-center"
                  min="1"
                  max="8"
                />
                <p className="text-xs text-white/60 text-center mt-1">feet</p>
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Inches"
                  value={profile.height?.in || ''}
                  onChange={(e) => updateProfile('height', { 
                    ...profile.height, 
                    in: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="w-full px-4 py-3 text-lg bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-center"
                  min="0"
                  max="11"
                />
                <p className="text-xs text-white/60 text-center mt-1">inches</p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-white/90 mb-3 text-center">Current Weight</label>
            <input
              type="number"
              placeholder="Weight in pounds"
              value={profile.weight || ''}
              onChange={(e) => updateProfile('weight', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full px-6 py-3 text-lg bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-center"
              min="10"
              max="1000"
              step="0.1"
            />
            <p className="text-xs text-white/60 text-center mt-1">pounds</p>
          </div>
        </div>
      ),
    },
    {
      id: 'activity',
      title: "How active are you?",
      subtitle: "This helps us estimate your daily calorie needs",
      isValid: () => !!profile.activityLevel,
      component: (
        <div className="space-y-3">
          {[
            { value: ActivityLevel.SEDENTARY, label: 'Sedentary', desc: 'Little or no exercise' },
            { value: ActivityLevel.LIGHT, label: 'Light', desc: 'Exercise 1-3 days/week' },
            { value: ActivityLevel.MODERATE, label: 'Moderate', desc: 'Exercise 3-5 days/week' },
            { value: ActivityLevel.ACTIVE, label: 'Active', desc: 'Exercise 6-7 days/week' },
            { value: ActivityLevel.VERY_ACTIVE, label: 'Very Active', desc: 'Hard exercise & physical job' },
          ].map((level) => (
            <button
              key={level.value}
              onClick={() => updateProfile('activityLevel', level.value)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                profile.activityLevel === level.value
                  ? 'bg-white text-teal-600 shadow-lg transform scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <div className="font-semibold">{level.label}</div>
              <div className="text-sm opacity-80">{level.desc}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'goal',
      title: "What's your goal?",
      subtitle: "Set a target weight to track your progress",
      isValid: () => profile.targetWeight !== null && profile.targetWeight > 0,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-white mb-2">
              Current: {profile.weight} lbs
            </div>
            {profile.targetWeight && profile.weight && (
              <div className="text-lg text-white/80">
                Goal: {profile.targetWeight > profile.weight ? 'Gain' : 'Lose'} {Math.abs(profile.targetWeight - profile.weight).toFixed(1)} lbs
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-white/90 mb-3 text-center">Target Weight</label>
            <input
              type="number"
              placeholder="Target weight in pounds"
              value={profile.targetWeight || ''}
              onChange={(e) => updateProfile('targetWeight', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full px-6 py-3 text-lg bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-center"
              min="10"
              max="1000"
              step="0.1"
            />
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white/90 text-sm">
            <i className="fas fa-info-circle mr-2"></i>
            Healthy weight change is typically 1-2 lbs per week
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      trackEvent('onboarding_step_completed', { step: currentStepData.id });
    } else {
      trackEvent('onboarding_profile_completed');
      onComplete({
        ...profile,
        profileCreationDate: new Date().toISOString(),
        startWeight: profile.weight,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    trackEvent('onboarding_skipped', { step: currentStepData.id });
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700">
      {/* Background animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/70 text-sm text-center mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="text-white">
          <h2 className="text-3xl font-bold text-center mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-lg text-white/90 text-center mb-8">
            {currentStepData.subtitle}
          </p>

          <div className="mb-8">
            {currentStepData.component}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={currentStep === 0 ? handleSkip : handleBack}
              className="px-6 py-3 text-white/70 hover:text-white transition-colors"
            >
              {currentStep === 0 ? 'Skip' : 'Back'}
            </button>

            <button
              onClick={handleNext}
              disabled={!currentStepData.isValid()}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                currentStepData.isValid()
                  ? 'bg-white text-teal-600 hover:bg-white/90 shadow-lg hover:shadow-xl'
                  : 'bg-white/30 text-white/70 cursor-not-allowed'
              }`}
            >
              {currentStep === steps.length - 1 ? "Let's go!" : 'Next'}
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveOnboarding;