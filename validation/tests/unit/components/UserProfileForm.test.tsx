import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileForm from '../../../components/UserProfileForm';
import { UserProfile } from '../../../types';

const mockDefaultProfile: UserProfile = {
  name: '',
  age: null,
  gender: null,
  height: null,
  weight: null,
  activityLevel: null,
  dietGoal: null,
  targetWeight: null,
  profileCreationDate: null,
  customMacroTargets: null
};

const mockCompleteProfile: UserProfile = {
  name: 'Jane Smith',
  age: 28,
  gender: 'female',
  height: { ft: 5, in: 6 },
  weight: 140,
  activityLevel: 'very_active',
  dietGoal: 'lose_weight',
  targetWeight: 130,
  profileCreationDate: '2024-01-01',
  customMacroTargets: null
};

const mockProps = {
  userProfile: mockDefaultProfile,
  onProfileUpdate: jest.fn(),
  onProfileComplete: jest.fn(),
  isInitialSetup: true
};

describe('UserProfileForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form correctly for initial setup', () => {
    render(<UserProfileForm {...mockProps} />);
    
    expect(screen.getByText(/personal information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
  });

  test('allows entering basic profile information', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const ageInput = screen.getByLabelText(/age/i);
    
    await user.type(nameInput, 'John Doe');
    await user.type(ageInput, '30');
    
    expect(nameInput).toHaveValue('John Doe');
    expect(ageInput).toHaveValue(30);
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const submitButton = screen.getByText(/save profile/i);
    await user.click(submitButton);
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/age is required/i)).toBeInTheDocument();
  });

  test('validates age range', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const ageInput = screen.getByLabelText(/age/i);
    
    // Test too young
    await user.type(ageInput, '12');
    expect(screen.getByText(/age must be between/i)).toBeInTheDocument();
    
    // Test too old
    await user.clear(ageInput);
    await user.type(ageInput, '120');
    expect(screen.getByText(/age must be between/i)).toBeInTheDocument();
  });

  test('handles height input correctly', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const feetInput = screen.getByLabelText(/feet/i);
    const inchesInput = screen.getByLabelText(/inches/i);
    
    await user.type(feetInput, '5');
    await user.type(inchesInput, '10');
    
    expect(feetInput).toHaveValue(5);
    expect(inchesInput).toHaveValue(10);
  });

  test('validates height values', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const inchesInput = screen.getByLabelText(/inches/i);
    await user.type(inchesInput, '15'); // Invalid inches
    
    expect(screen.getByText(/inches must be/i)).toBeInTheDocument();
  });

  test('handles weight input with validation', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const weightInput = screen.getByLabelText(/current weight/i);
    
    // Test valid weight
    await user.type(weightInput, '150');
    expect(weightInput).toHaveValue(150);
    
    // Test invalid weight
    await user.clear(weightInput);
    await user.type(weightInput, '500');
    expect(screen.getByText(/weight must be realistic/i)).toBeInTheDocument();
  });

  test('handles activity level selection', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const activitySelect = screen.getByLabelText(/activity level/i);
    await user.selectOptions(activitySelect, 'moderately_active');
    
    expect(activitySelect).toHaveValue('moderately_active');
  });

  test('handles diet goal selection', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const dietGoalSelect = screen.getByLabelText(/diet goal/i);
    await user.selectOptions(dietGoalSelect, 'lose_weight');
    
    expect(dietGoalSelect).toHaveValue('lose_weight');
  });

  test('shows target weight field when losing weight', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const dietGoalSelect = screen.getByLabelText(/diet goal/i);
    await user.selectOptions(dietGoalSelect, 'lose_weight');
    
    expect(screen.getByLabelText(/target weight/i)).toBeInTheDocument();
  });

  test('validates target weight against current weight', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const weightInput = screen.getByLabelText(/current weight/i);
    const dietGoalSelect = screen.getByLabelText(/diet goal/i);
    
    await user.type(weightInput, '150');
    await user.selectOptions(dietGoalSelect, 'lose_weight');
    
    const targetWeightInput = screen.getByLabelText(/target weight/i);
    await user.type(targetWeightInput, '160'); // Higher than current
    
    expect(screen.getByText(/target weight should be lower/i)).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    // Fill out form with valid data
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/age/i), '30');
    await user.selectOptions(screen.getByLabelText(/gender/i), 'male');
    await user.type(screen.getByLabelText(/feet/i), '6');
    await user.type(screen.getByLabelText(/inches/i), '0');
    await user.type(screen.getByLabelText(/current weight/i), '180');
    await user.selectOptions(screen.getByLabelText(/activity level/i), 'moderately_active');
    await user.selectOptions(screen.getByLabelText(/diet goal/i), 'maintain');
    
    const submitButton = screen.getByText(/save profile/i);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockProps.onProfileUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          age: 30,
          gender: 'male',
          height: { ft: 6, in: 0 },
          weight: 180,
          activityLevel: 'moderately_active',
          dietGoal: 'maintain'
        })
      );
    });
  });

  test('shows form in edit mode with existing data', () => {
    render(<UserProfileForm {...mockProps} userProfile={mockCompleteProfile} isInitialSetup={false} />);
    
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('28')).toBeInTheDocument();
    expect(screen.getByDisplayValue('female')).toBeInTheDocument();
  });

  test('handles form reset', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    // Enter some data
    await user.type(screen.getByLabelText(/name/i), 'Test Name');
    
    const resetButton = screen.getByText(/reset/i);
    await user.click(resetButton);
    
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
  });

  test('calculates BMI preview', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    // Enter height and weight
    await user.type(screen.getByLabelText(/feet/i), '5');
    await user.type(screen.getByLabelText(/inches/i), '10');
    await user.type(screen.getByLabelText(/current weight/i), '170');
    
    await waitFor(() => {
      expect(screen.getByText(/bmi.*24/i)).toBeInTheDocument();
    });
  });

  test('shows progress indicator during form completion', () => {
    render(<UserProfileForm {...mockProps} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
  });

  test('updates progress as form is filled', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    await user.type(screen.getByLabelText(/name/i), 'John');
    
    await waitFor(() => {
      expect(screen.getByText(/14% complete/i)).toBeInTheDocument(); // 1 of 7 fields
    });
  });

  test('handles dietary restrictions and allergies', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const allergiesInput = screen.getByLabelText(/allergies/i);
    await user.type(allergiesInput, 'Peanuts, Shellfish');
    
    expect(allergiesInput).toHaveValue('Peanuts, Shellfish');
  });

  test('supports accessibility features', () => {
    render(<UserProfileForm {...mockProps} />);
    
    // Check for proper labeling
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    
    // Check for form structure
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  test('handles custom macro targets', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm {...mockProps} />);
    
    const customMacrosCheckbox = screen.getByLabelText(/custom macro targets/i);
    await user.click(customMacrosCheckbox);
    
    expect(screen.getByLabelText(/protein target/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/carb target/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fat target/i)).toBeInTheDocument();
  });

  test('prevents form submission during processing', async () => {
    const user = userEvent.setup();
    const slowOnProfileUpdate = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<UserProfileForm {...mockProps} onProfileUpdate={slowOnProfileUpdate} />);
    
    // Fill form and submit
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    const submitButton = screen.getByText(/save profile/i);
    await user.click(submitButton);
    
    // Button should be disabled during processing
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });
});