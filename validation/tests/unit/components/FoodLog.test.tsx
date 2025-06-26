import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FoodLog from '../../../components/FoodLog';
import { FoodItem, UserProfile } from '../../../types';

// Mock props
const mockUserProfile: UserProfile = {
  name: 'John Doe',
  age: 30,
  gender: 'male',
  height: { ft: 5, in: 10 },
  weight: 180,
  activityLevel: 'moderately_active',
  dietGoal: 'maintain',
  targetWeight: 180,
  profileCreationDate: '2024-01-01',
  customMacroTargets: null
};

const mockFoodLog: FoodItem[] = [
  {
    id: '1',
    name: 'Banana',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3.1,
    sugar: 14.4,
    servingSize: '1 medium',
    dateAdded: '2024-06-26T10:00:00Z',
    mealType: 'breakfast'
  },
  {
    id: '2',
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    servingSize: '100g',
    dateAdded: '2024-06-26T12:00:00Z',
    mealType: 'lunch'
  }
];

const mockProps = {
  foodLog: mockFoodLog,
  userProfile: mockUserProfile,
  onRemoveFood: jest.fn(),
  onEditFood: jest.fn(),
  onMealTypeChange: jest.fn(),
  onClearDay: jest.fn(),
  isOnline: true,
  className: '',
  targetCalories: 2000,
  targetProtein: 150,
  targetCarbs: 250,
  targetFat: 65
};

describe('FoodLog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders food log correctly', () => {
    render(<FoodLog {...mockProps} />);
    
    expect(screen.getByText('Food Log')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
  });

  test('displays nutritional summary correctly', () => {
    render(<FoodLog {...mockProps} />);
    
    // Total calories should be 105 + 165 = 270
    expect(screen.getByText(/270.*calories/i)).toBeInTheDocument();
    
    // Total protein should be 1.3 + 31 = 32.3g
    expect(screen.getByText(/32\.3.*protein/i)).toBeInTheDocument();
  });

  test('groups foods by meal type', () => {
    render(<FoodLog {...mockProps} />);
    
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
  });

  test('allows removing food items', async () => {
    const user = userEvent.setup();
    render(<FoodLog {...mockProps} />);
    
    const removeButtons = screen.getAllByText(/remove|delete/i);
    await user.click(removeButtons[0]);
    
    expect(mockProps.onRemoveFood).toHaveBeenCalledWith('1');
  });

  test('allows editing food items', async () => {
    const user = userEvent.setup();
    render(<FoodLog {...mockProps} />);
    
    const editButtons = screen.getAllByText(/edit/i);
    await user.click(editButtons[0]);
    
    expect(mockProps.onEditFood).toHaveBeenCalledWith(mockFoodLog[0]);
  });

  test('allows changing meal type', async () => {
    const user = userEvent.setup();
    render(<FoodLog {...mockProps} />);
    
    const mealTypeSelects = screen.getAllByDisplayValue(/breakfast|lunch/i);
    await user.selectOptions(mealTypeSelects[0], 'dinner');
    
    expect(mockProps.onMealTypeChange).toHaveBeenCalledWith('1', 'dinner');
  });

  test('shows progress bars for macronutrients', () => {
    render(<FoodLog {...mockProps} />);
    
    // Should show progress for calories, protein, carbs, fat
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(4);
  });

  test('displays empty state when no foods logged', () => {
    render(<FoodLog {...mockProps} foodLog={[]} />);
    
    expect(screen.getByText(/no foods logged/i)).toBeInTheDocument();
    expect(screen.getByText(/start tracking/i)).toBeInTheDocument();
  });

  test('shows offline indicator when not online', () => {
    render(<FoodLog {...mockProps} isOnline={false} />);
    
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });

  test('allows clearing entire day', async () => {
    const user = userEvent.setup();
    render(<FoodLog {...mockProps} />);
    
    const clearButton = screen.getByText(/clear day/i);
    await user.click(clearButton);
    
    // Should show confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByText(/confirm|yes/i);
    await user.click(confirmButton);
    
    expect(mockProps.onClearDay).toHaveBeenCalled();
  });

  test('calculates macro percentages correctly', () => {
    render(<FoodLog {...mockProps} />);
    
    // Calories: 270/2000 = 13.5%
    const caloriesProgress = screen.getByRole('progressbar', { name: /calories/i });
    expect(caloriesProgress).toHaveAttribute('aria-valuenow', '13.5');
  });

  test('handles food items without complete nutrition data', () => {
    const incompleteFood: FoodItem = {
      id: '3',
      name: 'Unknown Food',
      calories: 100,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: null,
      sugar: null,
      servingSize: '1 serving',
      dateAdded: '2024-06-26T14:00:00Z',
      mealType: 'snack'
    };

    render(<FoodLog {...mockProps} foodLog={[incompleteFood]} />);
    
    expect(screen.getByText('Unknown Food')).toBeInTheDocument();
    expect(screen.getByText('100 calories')).toBeInTheDocument();
  });

  test('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<FoodLog {...mockProps} />);
    
    // Tab through interactive elements
    await user.tab();
    expect(document.activeElement).toBeInTheDocument();
  });

  test('exports food log data', async () => {
    const user = userEvent.setup();
    render(<FoodLog {...mockProps} />);
    
    const exportButton = screen.getByText(/export/i);
    await user.click(exportButton);
    
    // Should trigger export functionality
    await waitFor(() => {
      expect(screen.getByText(/exported/i)).toBeInTheDocument();
    });
  });

  test('filters foods by date range', async () => {
    const user = userEvent.setup();
    const foodsWithDifferentDates = [
      { ...mockFoodLog[0], dateAdded: '2024-06-25T10:00:00Z' },
      { ...mockFoodLog[1], dateAdded: '2024-06-26T12:00:00Z' }
    ];

    render(<FoodLog {...mockProps} foodLog={foodsWithDifferentDates} />);
    
    const dateFilter = screen.getByLabelText(/date/i);
    await user.type(dateFilter, '2024-06-26');
    
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  test('shows nutrition goals progress accurately', () => {
    render(<FoodLog {...mockProps} />);
    
    // Check that progress bars show correct percentages
    const proteinProgress = screen.getByRole('progressbar', { name: /protein/i });
    // 32.3g / 150g = 21.5%
    expect(proteinProgress).toHaveAttribute('aria-valuenow', '21.5');
  });

  test('handles premium features correctly', () => {
    render(<FoodLog {...mockProps} />);
    
    // Should show premium features if user has access
    if (mockUserProfile.isPremium) {
      expect(screen.getByText(/advanced analytics/i)).toBeInTheDocument();
    } else {
      expect(screen.getByText(/upgrade to premium/i)).toBeInTheDocument();
    }
  });
});