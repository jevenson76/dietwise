import React, { useState } from 'react';
import { authApi } from '../../src/services/api/auth';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import DietWiseLogo from '../../src/components/DietWiseLogo';

interface LoginProps {
  onSuccess: () => void;
  onSignupClick: () => void;
  onForgotPasswordClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onSignupClick, onForgotPasswordClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authApi.login({ email, password });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <DietWiseLogo size="medium" className="mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-text-default mb-2">Welcome Back</h2>
        <p className="text-text-alt">Sign in to your DietWise account</p>
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-default mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 pr-10 border border-border-default rounded-lg bg-bg-card text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-alt hover:text-text-default"
              tabIndex={-1}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-150 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" color="text-white" label="Signing in..." />
          ) : (
            <>
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-text-alt">
          Don't have an account?{' '}
          <button
            onClick={onSignupClick}
            className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;