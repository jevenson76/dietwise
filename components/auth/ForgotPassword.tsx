import React, { useState } from 'react';
import { authApi } from '../../src/services/api/auth';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authApi.requestPasswordReset({ email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-6">
          <i className="fas fa-check-circle text-6xl text-green-500"></i>
        </div>
        <h2 className="text-2xl font-bold text-text-default mb-4">Check Your Email</h2>
        <p className="text-text-alt mb-6">
          We've sent a password reset link to <strong>{email}</strong>. 
          Please check your email and follow the instructions to reset your password.
        </p>
        <button
          onClick={onBackToLogin}
          className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-text-default mb-2">Forgot Password?</h2>
        <p className="text-text-alt">Enter your email and we'll send you a reset link</p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-default mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border-default rounded-lg bg-bg-card text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-150 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" color="text-white" label="Sending..." />
          ) : (
            <>
              <i className="fas fa-envelope mr-2"></i>
              Send Reset Link
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBackToLogin}
          className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;