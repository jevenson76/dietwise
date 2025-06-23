import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { trackEvent } from '@services/analyticsService';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Track successful subscription
    trackEvent('subscription_success', { sessionId });

    // Clear any demo mode
    localStorage.removeItem('premiumDemo');

    // Set a flag to refresh premium status
    localStorage.setItem('refreshPremiumStatus', 'true');

    setStatus('success');

    // Redirect to app after 3 seconds
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [sessionId, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-default">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-default p-4">
        <div className="text-center max-w-md">
          <i className="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
          <h1 className="text-2xl font-bold text-text-default mb-2">Something went wrong</h1>
          <p className="text-text-alt mb-6">
            We couldn't process your subscription. Please try again or contact support.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg"
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-default p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 animate-bounce">
          <i className="fas fa-check-circle text-8xl text-green-500"></i>
        </div>
        <h1 className="text-3xl font-bold text-text-default mb-4">
          Welcome to DietWise Premium! 🎉
        </h1>
        <p className="text-text-alt mb-2">
          Your subscription has been activated successfully.
        </p>
        <p className="text-text-alt mb-8">
          You now have access to all premium features including unlimited barcode scans, 
          advanced analytics, and much more!
        </p>
        <p className="text-sm text-text-alt">
          Redirecting you to the app...
        </p>
      </div>
    </div>
  );
};

export default Success;