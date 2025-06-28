import React, { useState, useRef } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface MobileFormInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search';
  placeholder?: string;
  error?: string;
  helpText?: string;
  icon?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}

const MobileFormInput: React.FC<MobileFormInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  helpText,
  icon,
  required = false,
  disabled = false,
  autoComplete,
  maxLength,
  min,
  max,
  step,
  onFocus,
  onBlur
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    
    // Scroll into view on mobile to prevent keyboard overlap
    if (isMobile) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const inputClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-200
    ${isMobile || isTablet ? 'text-base' : 'text-sm'}
    ${icon ? 'pl-12' : ''}
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
      : isFocused
        ? 'border-teal-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
        : 'border-border-default focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
    }
    ${disabled 
      ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed' 
      : 'bg-white dark:bg-gray-900 text-text-default'
    }
  `;

  return (
    <div className="mb-4">
      <label className="block mb-2">
        <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'} text-text-default`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <i className={icon}></i>
          </div>
        )}
        
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${label}-error` : helpText ? `${label}-help` : undefined}
        />
        
        {/* Clear button for mobile */}
        {isMobile && value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            aria-label="Clear input"
          >
            <i className="fas fa-times-circle"></i>
          </button>
        )}
      </div>
      
      {error && (
        <p id={`${label}-error`} className="mt-2 text-sm text-red-500 flex items-center">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${label}-help`} className="mt-2 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default MobileFormInput;