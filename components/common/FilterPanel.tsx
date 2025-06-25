import React, { useState } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

export interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
  icon?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'toggle';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  collapsed?: boolean;
}

export interface ActiveFilter {
  groupId: string;
  optionId?: string;
  value: any;
  label: string;
}

interface FilterPanelProps {
  filterGroups: FilterGroup[];
  activeFilters: ActiveFilter[];
  onFilterChange: (groupId: string, value: any) => void;
  onClearFilters: () => void;
  onClearFilter: (groupId: string) => void;
  className?: string;
  variant?: 'sidebar' | 'dropdown' | 'inline';
  showActiveCount?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filterGroups,
  activeFilters,
  onFilterChange,
  onClearFilters,
  onClearFilter,
  className = '',
  variant = 'sidebar',
  showActiveCount = true
}) => {
  const { isMobile } = useResponsive();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(filterGroups.filter(group => group.collapsed).map(group => group.id))
  );

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const renderRangeFilter = (group: FilterGroup) => {
    const activeFilter = activeFilters.find(f => f.groupId === group.id);
    const currentValue = activeFilter?.value || [group.min || 0, group.max || 100];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentValue[0]}{group.unit} - {currentValue[1]}{group.unit}
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min={group.min}
            max={group.max}
            step={group.step || 1}
            value={currentValue[0]}
            onChange={(e) => {
              const newValue = [parseInt(e.target.value), currentValue[1]];
              onFilterChange(group.id, newValue);
            }}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <input
            type="range"
            min={group.min}
            max={group.max}
            step={group.step || 1}
            value={currentValue[1]}
            onChange={(e) => {
              const newValue = [currentValue[0], parseInt(e.target.value)];
              onFilterChange(group.id, newValue);
            }}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    );
  };

  const renderSelectFilter = (group: FilterGroup) => {
    const activeFilter = activeFilters.find(f => f.groupId === group.id);
    const selectedValue = activeFilter?.value || '';

    return (
      <select
        value={selectedValue}
        onChange={(e) => onFilterChange(group.id, e.target.value)}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="">All {group.label}</option>
        {group.options?.map(option => (
          <option key={option.id} value={option.value}>
            {option.label} {option.count ? `(${option.count})` : ''}
          </option>
        ))}
      </select>
    );
  };

  const renderMultiSelectFilter = (group: FilterGroup) => {
    const activeFilter = activeFilters.find(f => f.groupId === group.id);
    const selectedValues = activeFilter?.value || [];

    return (
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {group.options?.map(option => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <label
              key={option.id}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  let newValues;
                  if (e.target.checked) {
                    newValues = [...selectedValues, option.value];
                  } else {
                    newValues = selectedValues.filter((v: any) => v !== option.value);
                  }
                  onFilterChange(group.id, newValues);
                }}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <div className="flex items-center space-x-2 flex-1">
                {option.icon && (
                  <i className={`${option.icon} text-sm text-gray-500`}></i>
                )}
                <span className="text-sm text-text-default">{option.label}</span>
                {option.count && (
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {option.count}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    );
  };

  const renderToggleFilter = (group: FilterGroup) => {
    const activeFilter = activeFilters.find(f => f.groupId === group.id);
    const isEnabled = activeFilter?.value || false;

    return (
      <label className="flex items-center space-x-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => onFilterChange(group.id, e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-11 h-6 rounded-full transition-colors ${
              isEnabled ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              } mt-1`}
            />
          </div>
        </div>
        <span className="text-sm text-text-default">{group.label}</span>
      </label>
    );
  };

  const renderDateFilter = (group: FilterGroup) => {
    const activeFilter = activeFilters.find(f => f.groupId === group.id);
    const currentValue = activeFilter?.value || { start: '', end: '' };

    return (
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">From</label>
          <input
            type="date"
            value={currentValue.start}
            onChange={(e) => onFilterChange(group.id, { ...currentValue, start: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">To</label>
          <input
            type="date"
            value={currentValue.end}
            onChange={(e) => onFilterChange(group.id, { ...currentValue, end: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
      </div>
    );
  };

  const renderFilterGroup = (group: FilterGroup) => {
    const isCollapsed = collapsedGroups.has(group.id);
    const hasActiveFilter = activeFilters.some(f => f.groupId === group.id);

    return (
      <div key={group.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <button
          onClick={() => toggleGroupCollapse(group.id)}
          className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium text-text-default">{group.label}</span>
            {hasActiveFilter && (
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilter && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFilter(group.id);
                }}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
            <i className={`fas fa-chevron-${isCollapsed ? 'down' : 'up'} text-sm text-gray-400`}></i>
          </div>
        </button>

        {!isCollapsed && (
          <div className="p-3 pt-0">
            {group.type === 'select' && renderSelectFilter(group)}
            {group.type === 'multiselect' && renderMultiSelectFilter(group)}
            {group.type === 'range' && renderRangeFilter(group)}
            {group.type === 'date' && renderDateFilter(group)}
            {group.type === 'toggle' && renderToggleFilter(group)}
          </div>
        )}
      </div>
    );
  };

  const containerClasses = {
    sidebar: 'w-full bg-bg-card border border-border-default rounded-lg',
    dropdown: 'absolute top-full left-0 right-0 mt-2 bg-bg-card border border-border-default rounded-lg shadow-lg z-50',
    inline: 'w-full'
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <i className="fas fa-filter text-teal-500"></i>
          <h3 className="font-semibold text-text-default">Filters</h3>
          {showActiveCount && activeFilters.length > 0 && (
            <span className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs px-2 py-1 rounded-full">
              {activeFilters.length}
            </span>
          )}
        </div>
        {activeFilters.length > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <div
                key={`${filter.groupId}-${index}`}
                className="flex items-center space-x-2 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full text-sm"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => onClearFilter(filter.groupId)}
                  className="hover:text-red-500 transition-colors"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Groups */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filterGroups.map(renderFilterGroup)}
      </div>

      {/* CSS for custom range slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default FilterPanel;