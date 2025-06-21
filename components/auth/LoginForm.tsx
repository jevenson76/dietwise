import React, { useState } from 'react';
import { authApi, LoginData } from '@services/api/auth';
import { useNavigate, Link } from 'react-router-dom';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authApi.login(formData);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrors({ general: 'Invalid email or password' });
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-bg-card p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-text-default mb-6 text-center">
          Welcome Back
        </h2>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {errors.general}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-alt mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.email ? 'border-red-500' : 'border-border-default'
                } bg-bg-card text-text-default`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              <i className="fas fa-envelope absolute left-3 top-3 text-text-alt"></i>
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-alt mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.password ? 'border-red-500' : 'border-border-default'
                } bg-bg-card text-text-default`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <i className="fas fa-lock absolute left-3 top-3 text-text-alt"></i>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-text-alt hover:text-text-default"
              >
                <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.password}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-border-default text-teal-600 focus:ring-teal-500"
            />
            <span className="ml-2 text-sm text-text-alt">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-teal-600 hover:text-teal-500"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Signing in...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign In
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-alt">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Create one
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};