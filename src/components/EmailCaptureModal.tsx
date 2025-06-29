import React, { useState } from 'react';
import Modal from '@components/common/Modal';
import { trackEvent } from '@services/analyticsService';
import DietWiseLogo from './DietWiseLogo';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmit: (email: string) => void;
  userName?: string | null;
}

const EmailCaptureModal: React.FC<EmailCaptureModalProps> = ({
  isOpen,
  onClose,
  onEmailSubmit,
  userName
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onEmailSubmit(email);
      trackEvent('email_capture_submitted', { source: 'first_week_completion' });
      onClose();
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Email submission failed:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    trackEvent('email_capture_skipped', { source: 'first_week_completion' });
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={null} 
      size="md"
      logo={<DietWiseLogo size="large" className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border" />}
    >
      <div className="text-center p-6">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <i className="fas fa-trophy text-2xl text-green-600 dark:text-green-400"></i>
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-bold text-text-default mb-3">
          {userName ? `Amazing work, ${userName}!` : 'Amazing work!'}
        </h2>
        
        <p className="text-lg text-text-alt mb-6">
          You've completed your first week of food logging! 🎉
        </p>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 mb-6 border border-teal-200 dark:border-teal-700">
          <h3 className="text-lg font-semibold text-text-default mb-3">
            <i className="fas fa-chart-line mr-2 text-teal-500"></i>
            Get Your Weekly Progress Summary
          </h3>
          <p className="text-text-alt text-sm mb-4">
            Receive personalized insights delivered to your inbox every Sunday:
          </p>
          <ul className="text-left text-sm text-text-alt space-y-2">
            <li><i className="fas fa-check text-green-500 mr-2"></i>Weekly calorie and nutrition trends</li>
            <li><i className="fas fa-check text-green-500 mr-2"></i>Progress toward your weight goal</li>
            <li><i className="fas fa-check text-green-500 mr-2"></i>Personalized tips and encouragement</li>
            <li><i className="fas fa-check text-green-500 mr-2"></i>Meal suggestions for the upcoming week</li>
          </ul>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-bg-card text-text-default"
              required
            />
            <button
              type="submit"
              disabled={!email || isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Get Updates
                </>
              )}
            </button>
          </div>
        </form>

        {/* Trust Indicators */}
        <p className="text-xs text-text-alt mb-4">
          <i className="fas fa-shield-alt mr-1 text-green-500"></i>
          We respect your privacy. Unsubscribe anytime. No spam, ever.
        </p>

        {/* Skip Option */}
        <button
          onClick={handleSkip}
          className="text-text-alt hover:text-text-default text-sm underline transition-colors"
        >
          Maybe later
        </button>
      </div>
    </Modal>
  );
};

export default EmailCaptureModal;