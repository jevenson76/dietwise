import React, { useState } from 'react';
import { UserProfile } from '@appTypes';
import { trackEvent } from '@services/analyticsService';

interface QuickSetupWizardProps {
  isOpen: boolean;
  onComplete: (profile: Partial<UserProfile>) => void;
  onSkip: () => void;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const steps: SetupStep[] = [
  {
    id: 'personal',
    title: 'Tell us about yourself',
    description: 'Basic info to personalize your experience',
    icon: 'fa-user'
  },
  {
    id: 'goals',
    title: 'Set your goals',
    description: 'What do you want to achieve?',
    icon: 'fa-target'
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize your experience',
    icon: 'fa-sliders-h'
  }
];

const QuickSetupWizard: React.FC<QuickSetupWizardProps> = ({
  isOpen,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: null,
    sex: null,
    height: null,
    weight: null,
    activityLevel: null,
    targetWeight: null,
    profileCreationDate: new Date().toISOString()
  });

  const updateFormData = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      trackEvent('setup_wizard_step_completed', { step: currentStep });
    } else {
      trackEvent('setup_wizard_completed');
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    trackEvent('setup_wizard_skipped', { step: currentStep });
    onSkip();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Personal info
        return formData.name && formData.age && formData.sex;
      case 1: // Goals
        return formData.height && formData.weight && formData.targetWeight;
      case 2: // Preferences
        return formData.activityLevel;
      default:
        return false;
    }
  };

  const renderPersonalStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What's your name?
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="Enter your first name"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Age
          </label>
          <input
            type="number"
            value={formData.age || ''}
            onChange={(e) => updateFormData('age', parseInt(e.target.value) || null)}
            placeholder="25"
            min="13"
            max="120"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sex
          </label>
          <select
            value={formData.sex || ''}
            onChange={(e) => updateFormData('sex', e.target.value as 'male' | 'female')}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderGoalsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height (ft)
          </label>
          <input
            type="number"
            value={formData.height?.ft || ''}
            onChange={(e) => updateFormData('height', { 
              ft: parseInt(e.target.value) || 0, 
              in: formData.height?.in || 0 
            })}
            placeholder="5"
            min="3"
            max="8"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height (in)
          </label>
          <input
            type="number"
            value={formData.height?.in || ''}
            onChange={(e) => updateFormData('height', { 
              ft: formData.height?.ft || 0, 
              in: parseInt(e.target.value) || 0 
            })}
            placeholder="8"
            min="0"
            max="11"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Weight (lbs)
          </label>
          <input
            type="number"
            value={formData.weight || ''}
            onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || null)}
            placeholder="150"
            min="50"
            max="1000"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Weight (lbs)
          </label>
          <input
            type="number"
            value={formData.targetWeight || ''}
            onChange={(e) => updateFormData('targetWeight', parseFloat(e.target.value) || null)}
            placeholder="140"
            min="50"
            max="1000"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderPreferencesStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Activity Level
        </label>
        <div className="space-y-3">
          {[
            { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
            { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
            { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
            { value: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
            { value: 'extra', label: 'Extra Active', desc: 'Very hard exercise, physical job' }
          ].map((option) => (
            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="activityLevel"
                value={option.value}
                checked={formData.activityLevel === option.value}
                onChange={(e) => updateFormData('activityLevel', e.target.value)}
                className="mt-1 h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalStep();
      case 1:
        return renderGoalsStep();
      case 2:
        return renderPreferencesStep();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                <i className={`fas ${currentStepData.icon} text-teal-600 dark:text-teal-400`}></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentStepData.description}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip for now
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSetupWizard;