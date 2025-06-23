import React, { useState } from 'react';
import { authApi, RegisterData } from '@services/api/auth';
import { useNavigate, Link } from 'react-router-dom';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: navigator.language,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
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
      await authApi.register(formData);

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/onboarding');
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrors({ email: 'This email is already registered' });
      } else if (error.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          apiErrors[err.field] = err.message;
        });
        setErrors(apiErrors);
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = React.useMemo(() => {
    if (!formData.password) return 0;
    let strength = 0;
    if (formData.password.length >= 12) strength++;
    if (formData.password.length >= 16) strength++;
    if (/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)) strength++;
    if (/\d/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    return Math.min(strength, 4);
  }, [formData.password]);

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-bg-card p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-text-default mb-6 text-center">
          Create Your Account
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
            <label htmlFor="name" className="block text-sm font-medium text-text-alt mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.name ? 'border-red-500' : 'border-border-default'
                } bg-bg-card text-text-default`}
                placeholder="John Doe"
                disabled={isLoading}
              />
              <i className="fas fa-user absolute left-3 top-3 text-text-alt"></i>
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.name}
              </p>
            )}
          </div>

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
                placeholder="••••••••••••"
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

            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-alt">Password strength</span>
                  <span className="text-xs font-medium text-text-alt">
                    {strengthLabels[passwordStrength - 1] || 'Too weak'}
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded-full ${
                        i < passwordStrength
                          ? strengthColors[passwordStrength - 1]
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-alt mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-border-default'
                } bg-bg-card text-text-default`}
                placeholder="••••••••••••"
                disabled={isLoading}
              />
              <i className="fas fa-lock-check absolute left-3 top-3 text-text-alt"></i>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded border-border-default text-teal-600 focus:ring-teal-500"
            />
            <span className="ml-2 text-sm text-text-alt">
              I agree to the{' '}
              <Link to="/terms" className="text-teal-600 hover:text-teal-500">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-teal-600 hover:text-teal-500">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-500">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.terms}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !agreedToTerms}
          className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Creating Account...
            </>
          ) : (
            <>
              <i className="fas fa-user-plus mr-2"></i>
              Create Account
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-alt">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};