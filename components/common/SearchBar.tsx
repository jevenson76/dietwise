import React, { useState, useEffect, useRef } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  showSuggestions?: boolean;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'prominent';
  disabled?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  suggestions = [],
  onSuggestionSelect,
  showSuggestions = true,
  icon = 'fas fa-search',
  size = 'md',
  variant = 'default',
  disabled = false,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase()) && suggestion.toLowerCase() !== value.toLowerCase()
  ).slice(0, 8);

  useEffect(() => {
    setShowSuggestionsList(isFocused && value.length > 0 && filteredSuggestions.length > 0 && showSuggestions);
    setSelectedSuggestionIndex(-1);
  }, [isFocused, value, filteredSuggestions.length, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestionsList(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestionsList) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestionsList(false);
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSuggestionSelect?.(suggestion);
    setShowSuggestionsList(false);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  };

  const variantClasses = {
    default: 'border border-border-default bg-white dark:bg-gray-900',
    compact: 'border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800',
    prominent: 'border-2 border-teal-300 dark:border-teal-600 bg-white dark:bg-gray-900 shadow-lg'
  };

  const containerClasses = `
    relative w-full
    ${className}
  `;

  const inputClasses = `
    w-full px-4 py-2 pr-12 rounded-lg transition-all duration-200
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${isFocused 
      ? 'border-teal-500 ring-2 ring-teal-200 dark:ring-teal-800' 
      : 'hover:border-gray-400 dark:hover:border-gray-500'
    }
    ${disabled 
      ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
      : 'text-text-default'
    }
    focus:outline-none
    ${isMobile ? 'text-base' : ''}
  `;

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <i className={`${icon} ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}></i>
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`${inputClasses} pl-10`}
          autoComplete="off"
        />

        {/* Clear Button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <i className={`fas fa-times ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}></i>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestionsList && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-border-default rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                w-full px-4 py-3 text-left transition-colors
                ${index === selectedSuggestionIndex 
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-text-default'
                }
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === filteredSuggestions.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-200 dark:border-gray-700'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{suggestion}</span>
                <i className="fas fa-arrow-up-right text-xs text-gray-400 ml-2"></i>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search Hint */}
      {isFocused && !value && variant === 'prominent' && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-border-default rounded-lg text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <i className="fas fa-lightbulb text-yellow-500"></i>
            <span>Try searching by food name, brand, or category</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;