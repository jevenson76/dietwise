import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import FoodLog from '../../components/FoodLog';
import { FoodItem, Sex, ActivityLevel } from '../../types';

// Mock all the imported components
vi.mock('../../components/common/Modal', () => ({ 
  default: ({ children, isOpen, onClose, title }: any) => 
    isOpen ? <div data-testid="modal">{title}<div>{children}</div><button onClick={onClose}>Close</button></div> : null
}));

vi.mock('../../components/common/EmptyState', () => ({ 
  default: ({ title, description, actionLabel, onAction, secondaryActionLabel, onSecondaryAction }: any) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && <button onClick={onAction}>{actionLabel}</button>}
      {secondaryActionLabel && <button onClick={onSecondaryAction}>{secondaryActionLabel}</button>}
    </div>
  )
}));

vi.mock('../../components/common/AnimatedButton', () => ({ 
  default: ({ children, onClick, disabled, className, icon, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className} 
      data-testid={props['data-tooltip'] || 'animated-button'}
      {...props}
    >
      {icon && <span className={icon} />}
      {children}
    </button>
  )
}));

vi.mock('../../components/common/AnimatedCard', () => ({ 
  default: ({ children, title, icon, iconColor }: any) => (
    <div data-testid="animated-card">
      <h2>{title}</h2>
      {icon && <span className={icon} />}
      <div>{children}</div>
    </div>
  )
}));

vi.mock('../../components/common/AnimatedList', () => ({ 
  default: ({ children, className }: any) => (
    <div data-testid="animated-list" className={className}>{children}</div>
  )
}));

vi.mock('../../components/common/FeedbackAnimations', () => ({ 
  default: ({ children }: any) => <div data-testid="feedback-animations">{children}</div>
}));

vi.mock('../../components/common/ProgressIndicator', () => ({ 
  default: ({ value, max, label, showPercentage, showValue }: any) => (
    <div data-testid="progress-indicator">
      <span>{label}</span>
      <span>{showValue && `${value}/${max}`}</span>
      {showPercentage && <span>{Math.round((value/max) * 100)}%</span>}
    </div>
  )
}));

vi.mock('../../components/common/SearchBar', () => ({ 
  default: ({ value, onChange, onClear, placeholder, suggestions, onSuggestionSelect }: any) => (
    <div data-testid="search-bar">
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        data-testid="search-input"
      />
      <button onClick={onClear} data-testid="clear-search">Clear</button>
      {suggestions?.map((suggestion: string, i: number) => (
        <button key={i} onClick={() => onSuggestionSelect(suggestion)} data-testid={`suggestion-${i}`}>
          {suggestion}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../../components/common/FilterPanel', () => ({ 
  default: ({ activeFilters, onFilterChange, onClearFilters, onClearFilter }: any) => (
    <div data-testid="filter-panel">
      <button onClick={onClearFilters} data-testid="clear-all-filters">Clear All</button>
      {activeFilters?.map((filter: any, i: number) => (
        <div key={i} data-testid={`active-filter-${i}`}>
          {filter.label}
          <button onClick={() => onClearFilter(filter.groupId)} data-testid={`clear-filter-${i}`}>×</button>
        </div>
      ))}
    </div>
  )
}));

vi.mock('../../utils/smartSuggestions', () => ({
  getSmartFoodSuggestions: vi.fn(() => [
    { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, servingSize: '1 medium' },
    { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, servingSize: '1 medium' }
  ]),
  getTimeBasedGreeting: vi.fn(() => 'Good morning! Ready to fuel your day?')
}));

describe('FoodLog', () => {
  const mockProps = {
    loggedItems: [] as FoodItem[],
    offlineQueue: [] as FoodItem[],
    onAddFood: vi.fn(),
    onRemoveFood: vi.fn(),
    targetCalories: 2000,
    userName: 'John',
    onOpenLogFromMyMeals: vi.fn(),
    isOnline: true,
    onSyncOfflineItems: vi.fn(),
    onOpenUPCScanner: vi.fn(),
    apiKeyMissing: false,
    canScanBarcode: { allowed: true, remaining: 5 },
    isPremiumUser: false
  };

  const sampleFoodItem: FoodItem = {
    id: '1',
    name: 'Apple',
    calories: 95,
    servingSize: '1 medium',
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    timestamp: Date.now()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the main food log card', () => {
      render(<FoodLog {...mockProps} />);
      expect(screen.getByTestId('animated-card')).toBeInTheDocument();
      expect(screen.getByText("Today's Food Log")).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<FoodLog {...mockProps} />);
      expect(screen.getByText('Log My Meal')).toBeInTheDocument();
      expect(screen.getByText('Scan UPC')).toBeInTheDocument();
      expect(screen.getByText('Add Manually')).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });

    it('should display greeting message', () => {
      render(<FoodLog {...mockProps} />);
      expect(screen.getByText('Good morning! Ready to fuel your day?')).toBeInTheDocument();
    });

    it('should show progress indicator when target calories is set', () => {
      render(<FoodLog {...mockProps} />);
      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
      expect(screen.getByText('Daily Calorie Progress')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no items are logged', () => {
      render(<FoodLog {...mockProps} />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Start Your Food Journey')).toBeInTheDocument();
    });

    it('should show different empty state when filtering returns no results', () => {
      const propsWithItems = {
        ...mockProps,
        loggedItems: [sampleFoodItem]
      };
      
      render(<FoodLog {...propsWithItems} />);
      
      // Open filters and apply a search that returns no results
      fireEvent.click(screen.getByText('Filter'));
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'nonexistent food' } });
      
      expect(screen.getByText('No Food Entries Found')).toBeInTheDocument();
    });
  });

  describe('Food Items Display', () => {
    it('should display logged food items', () => {
      const propsWithItems = {
        ...mockProps,
        loggedItems: [sampleFoodItem]
      };
      
      render(<FoodLog {...propsWithItems} />);
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('95 kcal')).toBeInTheDocument();
      expect(screen.getByText('Serving: 1 medium')).toBeInTheDocument();
    });

    it('should display offline queue items with offline indicator', () => {
      const propsWithOfflineItems = {
        ...mockProps,
        offlineQueue: [sampleFoodItem]
      };
      
      render(<FoodLog {...propsWithOfflineItems} />);
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('(Offline)')).toBeInTheDocument();
    });

    it('should display macro information when available', () => {
      const propsWithItems = {
        ...mockProps,
        loggedItems: [sampleFoodItem]
      };
      
      render(<FoodLog {...propsWithItems} />);
      expect(screen.getByText('P: 0.5g')).toBeInTheDocument();
      expect(screen.getByText('C: 25g')).toBeInTheDocument();
      expect(screen.getByText('F: 0.3g')).toBeInTheDocument();
    });
  });

  describe('Manual Food Addition', () => {
    it('should open manual add modal when button is clicked', () => {
      render(<FoodLog {...mockProps} />);
      fireEvent.click(screen.getByText('Add Manually'));
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Add Food Manually')).toBeInTheDocument();
    });

    it('should call onAddFood when manually adding a food item', async () => {
      render(<FoodLog {...mockProps} />);
      
      // Open modal
      fireEvent.click(screen.getByText('Add Manually'));
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/Food Name/), { target: { value: 'Test Food' } });
      fireEvent.change(screen.getByLabelText(/Calories/), { target: { value: '100' } });
      
      // Submit
      fireEvent.click(screen.getByText('Add Food Item'));
      
      await waitFor(() => {
        expect(mockProps.onAddFood).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Food',
            calories: 100
          }),
          'manual'
        );
      });
    });

    it('should disable submit button when required fields are empty', () => {
      render(<FoodLog {...mockProps} />);
      fireEvent.click(screen.getByText('Add Manually'));
      
      const submitButton = screen.getByText('Add Food Item');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Action Buttons', () => {
    it('should call onOpenLogFromMyMeals when Log My Meal is clicked', () => {
      render(<FoodLog {...mockProps} />);
      fireEvent.click(screen.getByText('Log My Meal'));
      expect(mockProps.onOpenLogFromMyMeals).toHaveBeenCalled();
    });

    it('should call onOpenUPCScanner when Scan UPC is clicked', () => {
      render(<FoodLog {...mockProps} />);
      fireEvent.click(screen.getByText('Scan UPC'));
      expect(mockProps.onOpenUPCScanner).toHaveBeenCalled();
    });

    it('should disable UPC scanner when API key is missing', () => {
      const propsWithMissingAPI = {
        ...mockProps,
        apiKeyMissing: true
      };
      
      render(<FoodLog {...propsWithMissingAPI} />);
      expect(screen.getByText('Scan UPC')).toBeDisabled();
    });

    it('should disable UPC scanner when scan limit is reached', () => {
      const propsWithNoScans = {
        ...mockProps,
        canScanBarcode: { allowed: false, remaining: 0 }
      };
      
      render(<FoodLog {...propsWithNoScans} />);
      expect(screen.getByText('Scan UPC')).toBeDisabled();
    });
  });

  describe('Calorie Progress', () => {
    it('should calculate and display total calories correctly', () => {
      const multipleItems = [
        { ...sampleFoodItem, id: '1', calories: 100 },
        { ...sampleFoodItem, id: '2', calories: 200 }
      ];
      
      const propsWithMultipleItems = {
        ...mockProps,
        loggedItems: multipleItems
      };
      
      render(<FoodLog {...propsWithMultipleItems} />);
      expect(screen.getByText('300/2000')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('should show remaining calories correctly', () => {
      const propsWithItems = {
        ...mockProps,
        loggedItems: [{ ...sampleFoodItem, calories: 500 }]
      };
      
      render(<FoodLog {...propsWithItems} />);
      expect(screen.getByText('1,500 kcal remaining')).toBeInTheDocument();
    });

    it('should show over target when calories exceed target', () => {
      const propsWithExcessCalories = {
        ...mockProps,
        loggedItems: [{ ...sampleFoodItem, calories: 2500 }],
        targetCalories: 2000
      };
      
      render(<FoodLog {...propsWithExcessCalories} />);
      expect(screen.getByText('500 kcal over target')).toBeInTheDocument();
    });
  });

  describe('Offline Functionality', () => {
    it('should show offline sync banner when offline items exist', () => {
      const propsWithOfflineItems = {
        ...mockProps,
        offlineQueue: [sampleFoodItem]
      };
      
      render(<FoodLog {...propsWithOfflineItems} />);
      expect(screen.getByText(/You have 1 item\(s\) logged offline/)).toBeInTheDocument();
    });

    it('should show sync button when online with offline items', () => {
      const propsWithOfflineItems = {
        ...mockProps,
        offlineQueue: [sampleFoodItem],
        isOnline: true
      };
      
      render(<FoodLog {...propsWithOfflineItems} />);
      expect(screen.getByText('Sync Now')).toBeInTheDocument();
    });

    it('should call onSyncOfflineItems when sync button is clicked', () => {
      const propsWithOfflineItems = {
        ...mockProps,
        offlineQueue: [sampleFoodItem],
        isOnline: true
      };
      
      render(<FoodLog {...propsWithOfflineItems} />);
      fireEvent.click(screen.getByText('Sync Now'));
      expect(mockProps.onSyncOfflineItems).toHaveBeenCalled();
    });
  });

  describe('Search and Filter', () => {
    it('should show search bar when items exist', () => {
      const propsWithItems = {
        ...mockProps,
        loggedItems: [sampleFoodItem]
      };
      
      render(<FoodLog {...propsWithItems} />);
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('should toggle filter panel when filter button is clicked', () => {
      const propsWithItems = {
        ...mockProps,
        loggedItems: [sampleFoodItem]
      };
      
      render(<FoodLog {...propsWithItems} />);
      fireEvent.click(screen.getByText('Filter'));
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', () => {
      const propsWithItems = {
        ...mockProps,
        loggedItems: [sampleFoodItem]
      };
      
      render(<FoodLog {...propsWithItems} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      fireEvent.click(screen.getByTestId('clear-search'));
      
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Food Removal', () => {
    it('should call onRemoveFood when remove button is clicked', () => {
      const propsWithItems = {
        ...mockProps,
        loggedItems: [sampleFoodItem]
      };
      
      render(<FoodLog {...propsWithItems} />);
      
      const removeButton = screen.getByLabelText(/Remove Apple/);
      fireEvent.click(removeButton);
      
      expect(mockProps.onRemoveFood).toHaveBeenCalledWith('1', false);
    });

    it('should call onRemoveFood with offline flag for offline items', () => {
      const propsWithOfflineItems = {
        ...mockProps,
        offlineQueue: [sampleFoodItem]
      };
      
      render(<FoodLog {...propsWithOfflineItems} />);
      
      const removeButton = screen.getByLabelText(/Remove Apple \(Pending Sync\)/);
      fireEvent.click(removeButton);
      
      expect(mockProps.onRemoveFood).toHaveBeenCalledWith('1', true);
    });
  });

  describe('Smart Suggestions', () => {
    it('should display smart suggestions', () => {
      render(<FoodLog {...mockProps} />);
      expect(screen.getByText('Quick Add Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });

    it('should add suggested food when clicked', () => {
      render(<FoodLog {...mockProps} />);
      
      const appleButton = screen.getByText('Apple');
      fireEvent.click(appleButton);
      
      expect(mockProps.onAddFood).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Apple',
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3
        }),
        'manual'
      );
    });
  });

  describe('Premium Features', () => {
    it('should show remaining scan count for non-premium users', () => {
      render(<FoodLog {...mockProps} />);
      expect(screen.getByText('5')).toBeInTheDocument(); // remaining scans badge
    });

    it('should not show scan count badge for premium users', () => {
      const premiumProps = {
        ...mockProps,
        isPremiumUser: true
      };
      
      render(<FoodLog {...premiumProps} />);
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null target calories gracefully', () => {
      const propsWithNullTarget = {
        ...mockProps,
        targetCalories: null
      };
      
      render(<FoodLog {...propsWithNullTarget} />);
      expect(screen.queryByTestId('progress-indicator')).not.toBeInTheDocument();
    });

    it('should handle empty manual form submission gracefully', () => {
      render(<FoodLog {...mockProps} />);
      fireEvent.click(screen.getByText('Add Manually'));
      
      const submitButton = screen.getByText('Add Food Item');
      expect(submitButton).toBeDisabled();
    });

    it('should handle items without macro information', () => {
      const itemWithoutMacros = {
        ...sampleFoodItem,
        protein: undefined,
        carbs: undefined,
        fat: undefined
      };
      
      const propsWithPartialItem = {
        ...mockProps,
        loggedItems: [itemWithoutMacros]
      };
      
      render(<FoodLog {...propsWithPartialItem} />);
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('P:')).not.toBeInTheDocument();
    });
  });
});