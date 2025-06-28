import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalculationsDisplay from '../../../components/CalculationsDisplay';
import { UserProfile, CalculatedMetrics } from '../../../types';

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

const mockCalculatedMetrics: CalculatedMetrics = {
  bmi: 25.8,
  bmr: 1850,
  tdee: 2600,
  targetCalories: 2600
};

const mockProps = {
  userProfile: mockUserProfile,
  calculatedMetrics: mockCalculatedMetrics,
  onRecalculate: jest.fn(),
  showAdvancedMetrics: false
};

describe('CalculationsDisplay Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders basic nutrition calculations', () => {
    render(<CalculationsDisplay {...mockProps} />);
    
    expect(screen.getByText('BMI')).toBeInTheDocument();
    expect(screen.getByText('25.8')).toBeInTheDocument();
    
    expect(screen.getByText('BMR')).toBeInTheDocument();
    expect(screen.getByText('1,850')).toBeInTheDocument();
    
    expect(screen.getByText('TDEE')).toBeInTheDocument();
    expect(screen.getByText('2,600')).toBeInTheDocument();
  });

  test('displays BMI category correctly', () => {
    render(<CalculationsDisplay {...mockProps} />);
    
    // BMI 25.8 should be "Overweight"
    expect(screen.getByText(/overweight/i)).toBeInTheDocument();
  });

  test('calculates BMI categories accurately', () => {
    const testCases = [
      { bmi: 18.0, category: 'underweight' },
      { bmi: 22.0, category: 'normal' },
      { bmi: 26.0, category: 'overweight' },
      { bmi: 32.0, category: 'obese' }
    ];

    testCases.forEach(({ bmi, category }) => {
      const metrics = { ...mockCalculatedMetrics, bmi };
      render(<CalculationsDisplay {...mockProps} calculatedMetrics={metrics} />);
      
      expect(screen.getByText(new RegExp(category, 'i'))).toBeInTheDocument();
    });
  });

  test('shows macro targets for different diet goals', () => {
    const loseWeightProfile = { 
      ...mockUserProfile, 
      dietGoal: 'lose_weight' as const,
      targetWeight: 160 
    };
    
    render(<CalculationsDisplay {...mockProps} userProfile={loseWeightProfile} />);
    
    expect(screen.getByText(/weight loss/i)).toBeInTheDocument();
    expect(screen.getByText(/deficit/i)).toBeInTheDocument();
  });

  test('displays custom macro targets when set', () => {
    const customMacroProfile = {
      ...mockUserProfile,
      customMacroTargets: {
        protein: 150,
        carbs: 200,
        fat: 80
      }
    };

    render(<CalculationsDisplay {...mockProps} userProfile={customMacroProfile} />);
    
    expect(screen.getByText('150g')).toBeInTheDocument(); // Protein
    expect(screen.getByText('200g')).toBeInTheDocument(); // Carbs
    expect(screen.getByText('80g')).toBeInTheDocument();  // Fat
  });

  test('calculates macro ratios correctly', () => {
    render(<CalculationsDisplay {...mockProps} />);
    
    // Should show protein/carbs/fat percentages
    expect(screen.getByText(/protein.*%/i)).toBeInTheDocument();
    expect(screen.getByText(/carbs.*%/i)).toBeInTheDocument();
    expect(screen.getByText(/fat.*%/i)).toBeInTheDocument();
  });

  test('handles recalculation trigger', async () => {
    const user = userEvent.setup();
    render(<CalculationsDisplay {...mockProps} />);
    
    const recalculateButton = screen.getByText(/recalculate/i);
    await user.click(recalculateButton);
    
    expect(mockProps.onRecalculate).toHaveBeenCalled();
  });

  test('shows advanced metrics when enabled', () => {
    render(<CalculationsDisplay {...mockProps} showAdvancedMetrics={true} />);
    
    expect(screen.getByText(/body fat estimate/i)).toBeInTheDocument();
    expect(screen.getByText(/ideal weight range/i)).toBeInTheDocument();
    expect(screen.getByText(/metabolic age/i)).toBeInTheDocument();
  });

  test('calculates daily calorie needs for different activity levels', () => {
    const activityLevels = [
      { level: 'sedentary', multiplier: 1.2 },
      { level: 'lightly_active', multiplier: 1.375 },
      { level: 'moderately_active', multiplier: 1.55 },
      { level: 'very_active', multiplier: 1.725 },
      { level: 'extremely_active', multiplier: 1.9 }
    ];

    activityLevels.forEach(({ level, multiplier }) => {
      const profile = { ...mockUserProfile, activityLevel: level as any };
      const expectedTDEE = Math.round(mockCalculatedMetrics.bmr! * multiplier);
      const metrics = { ...mockCalculatedMetrics, tdee: expectedTDEE };
      
      render(<CalculationsDisplay {...mockProps} userProfile={profile} calculatedMetrics={metrics} />);
      
      expect(screen.getByText(expectedTDEE.toLocaleString())).toBeInTheDocument();
    });
  });

  test('shows weight loss timeline for lose weight goal', () => {
    const loseWeightProfile = {
      ...mockUserProfile,
      dietGoal: 'lose_weight' as const,
      targetWeight: 160
    };

    render(<CalculationsDisplay {...mockProps} userProfile={loseWeightProfile} />);
    
    expect(screen.getByText(/estimated timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/weeks/i)).toBeInTheDocument();
  });

  test('displays nutrition quality score', () => {
    render(<CalculationsDisplay {...mockProps} showAdvancedMetrics={true} />);
    
    expect(screen.getByText(/nutrition score/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /nutrition score/i })).toBeInTheDocument();
  });

  test('handles missing calculation data gracefully', () => {
    const incompleteMetrics = {
      bmi: null,
      bmr: null,
      tdee: null,
      targetCalories: null
    };

    render(<CalculationsDisplay {...mockProps} calculatedMetrics={incompleteMetrics} />);
    
    expect(screen.getByText(/calculating/i)).toBeInTheDocument();
  });

  test('shows metric explanations on hover', async () => {
    const user = userEvent.setup();
    render(<CalculationsDisplay {...mockProps} />);
    
    const bmiLabel = screen.getByText('BMI');
    await user.hover(bmiLabel);
    
    expect(screen.getByText(/body mass index/i)).toBeInTheDocument();
  });

  test('formats numbers correctly for display', () => {
    const largeMetrics = {
      bmi: 25.847,
      bmr: 1847.3,
      tdee: 2603.8,
      targetCalories: 2603.8
    };

    render(<CalculationsDisplay {...mockProps} calculatedMetrics={largeMetrics} />);
    
    // Should round BMI to 1 decimal place
    expect(screen.getByText('25.8')).toBeInTheDocument();
    
    // Should round calories to whole numbers
    expect(screen.getByText('1,847')).toBeInTheDocument();
    expect(screen.getByText('2,604')).toBeInTheDocument();
  });

  test('shows calorie deficit for weight loss', () => {
    const loseWeightProfile = {
      ...mockUserProfile,
      dietGoal: 'lose_weight' as const,
      targetWeight: 160
    };

    render(<CalculationsDisplay {...mockProps} userProfile={loseWeightProfile} />);
    
    expect(screen.getByText(/500.*deficit/i)).toBeInTheDocument();
  });

  test('shows calorie surplus for weight gain', () => {
    const gainWeightProfile = {
      ...mockUserProfile,
      dietGoal: 'gain_weight' as const,
      targetWeight: 200
    };

    render(<CalculationsDisplay {...mockProps} userProfile={gainWeightProfile} />);
    
    expect(screen.getByText(/500.*surplus/i)).toBeInTheDocument();
  });

  test('calculates water intake recommendation', () => {
    render(<CalculationsDisplay {...mockProps} showAdvancedMetrics={true} />);
    
    // Should recommend water based on weight and activity
    expect(screen.getByText(/water intake/i)).toBeInTheDocument();
    expect(screen.getByText(/ounces/i)).toBeInTheDocument();
  });

  test('provides meal timing suggestions', () => {
    render(<CalculationsDisplay {...mockProps} showAdvancedMetrics={true} />);
    
    expect(screen.getByText(/meal timing/i)).toBeInTheDocument();
    expect(screen.getByText(/breakfast/i)).toBeInTheDocument();
  });
});