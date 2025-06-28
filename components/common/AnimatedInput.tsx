import React, { useState, useRef, useEffect } from 'react';

interface AnimatedInputProps {
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
  animation?: 'float' | 'scale' | 'slide' | 'glow';
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
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
  animation = 'float'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setHasValue(!!e.target.value);
  };

  const labelClasses = `
    absolute transition-all duration-300 ease-out pointer-events-none
    ${isFocused || hasValue 
      ? 'text-xs -top-2 left-3 px-2 bg-bg-card text-teal-600 dark:text-teal-400 transform scale-90' 
      : 'text-sm top-3 left-4 text-gray-500'
    }
    ${animation === 'float' && (isFocused || hasValue) ? 'animate-float' : ''}
  `;

  const inputClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-300 ease-out
    bg-white dark:bg-gray-900 text-text-default
    ${icon ? 'pl-12' : ''}
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
      : isFocused
        ? 'border-teal-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
        : 'border-border-default hover:border-gray-400'
    }
    ${disabled 
      ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed' 
      : ''
    }
    ${animation === 'scale' && isFocused ? 'scale-[1.02]' : ''}
    ${animation === 'glow' && isFocused ? 'shadow-lg shadow-teal-500/20' : ''}
  `;

  const containerClasses = `
    relative mb-4
    ${animation === 'slide' && isFocused ? 'transform translate-x-1' : ''}
  `;

  return (
    <div className={containerClasses}>
      <div className="relative">
        {icon && (
          <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
            isFocused ? 'text-teal-500 scale-110' : 'text-gray-400'
          }`}>
            <i className={icon}></i>
          </div>
        )}
        
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={handleChange}
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
        
        <label className={labelClasses}>
          {label}
          {required && (
            <span className="text-red-500 ml-1 transition-all duration-300">*</span>
          )}
        </label>
      </div>
      
      {error && (
        <div className="mt-2 opacity-0 animate-fade-in">
          <p id={`${label}-error`} className="text-sm text-red-500 flex items-center">
            <i className="fas fa-exclamation-circle mr-1 animate-pulse"></i>
            {error}
          </p>
        </div>
      )}
      
      {helpText && !error && (
        <p id={`${label}-help`} className="mt-2 text-sm text-gray-500 opacity-0 animate-fade-in">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default AnimatedInput;