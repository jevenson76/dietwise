import React, { useEffect } from 'react';
import { activateSubscription } from '../src/services/stripeService';

const CheckoutSuccess: React.FC = () => {
  useEffect(() => {
    // Get URL parameters to determine which plan was purchased
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      // In a real app, you'd verify the session with your backend
      // For demo purposes, we'll activate the subscription locally
      const plan = urlParams.get('plan') || 'yearly'; // Default to yearly
      activateSubscription('dietwise_user', plan as 'monthly' | 'yearly');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-3xl text-green-600 dark:text-green-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-text-default mb-2">Welcome to Premium!</h1>
          <p className="text-text-alt">
            Your subscription has been activated successfully. You now have access to all premium features!
          </p>
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-text-default mb-2">What's unlocked:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-text-alt">
            <div className="flex items-center">
              <i className="fas fa-infinity text-teal-500 mr-2"></i>
              <span>Unlimited Scans</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-robot text-teal-500 mr-2"></i>
              <span>Unlimited AI Ideas</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-calendar-week text-teal-500 mr-2"></i>
              <span>7-Day Meal Plans</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-chart-line text-teal-500 mr-2"></i>
              <span>Advanced Analytics</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <i className="fas fa-arrow-right mr-2"></i>
          Start Using Premium Features
        </button>

        <p className="text-xs text-text-alt mt-4">
          Your trial starts now. You'll be charged after 7 days unless you cancel.
        </p>
      </div>
    </div>
  );
};

export default CheckoutSuccess;