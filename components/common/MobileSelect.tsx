import React, { useState, useRef } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface Option {
  value: string | number;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface MobileSelectProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  helpText?: string;
  icon?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
}

const MobileSelect: React.FC<MobileSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  helpText,
  icon,
  required = false,
  disabled = false,
  searchable = false
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-200
    flex items-center justify-between cursor-pointer
    ${isMobile || isTablet ? 'text-base' : 'text-sm'}
    ${icon ? 'pl-12' : ''}
    ${error 
      ? 'border-red-500' 
      : isOpen
        ? 'border-teal-500 ring-2 ring-teal-200'
        : 'border-border-default hover:border-gray-400'
    }
    ${disabled 
      ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed' 
      : 'bg-white dark:bg-gray-900 text-text-default'
    }
  `;

  return (
    <div className="mb-4 relative">
      <label className="block mb-2">
        <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'} text-text-default`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            <i className={icon}></i>
          </div>
        )}
        
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={toggleClasses}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={selectedOption ? '' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400`}></i>
        </button>
        
        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={`
              absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 
              rounded-lg shadow-lg border border-border-default
              ${isMobile ? 'max-h-60' : 'max-h-48'} overflow-hidden
            `}
          >
            {searchable && (
              <div className="p-2 border-b border-border-default">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>
            )}
            
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full px-4 py-3 text-left flex items-center
                      ${isMobile || isTablet ? 'text-base' : 'text-sm'}
                      ${option.value === value 
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                      ${option.disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer'
                      }
                    `}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.icon && (
                      <i className={`${option.icon} mr-3`}></i>
                    )}
                    <span>{option.label}</span>
                    {option.value === value && (
                      <i className="fas fa-check ml-auto text-teal-500"></i>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default MobileSelect;