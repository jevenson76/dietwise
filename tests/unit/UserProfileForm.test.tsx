import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileForm from '../../components/UserProfileForm';
import { UserProfile, Sex, ActivityLevel } from '../../types';

describe('UserProfileForm', () => {
  const mockProfile: UserProfile = {
    name: 'Test User',
    email: 'test@example.com',
    age: 30,
    sex: Sex.MALE,
    height: { ft: 5, in: 9 },
    weight: 154,
    activityLevel: ActivityLevel.MODERATE,
    targetWeight: 140,
    goalPace: 'moderate',
    dietPlan: 'balanced',
  };

  const mockOnProfileChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    render(<UserProfileForm profile={mockProfile} onProfileChange={mockOnProfileChange} />);
    
    // Check for input fields by their id or placeholder
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByText(/sex/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current weight/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/feet/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/inches/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/activity level/i)).toBeInTheDocument();
  });

  it('displays initial values correctly', () => {
    render(<UserProfileForm profile={mockProfile} onProfileChange={mockOnProfileChange} />);
    
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('154')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9')).toBeInTheDocument();
  });

  it('validates age input', async () => {
    const user = userEvent.setup();
    const profileWithoutAge = { ...mockProfile, age: null };
    render(<UserProfileForm profile={profileWithoutAge} onProfileChange={mockOnProfileChange} />);
    
    const ageInput = screen.getByLabelText(/age/i);
    
    // First ensure no error exists
    expect(screen.queryByText(/age must be between/i)).not.toBeInTheDocument();
    
    // Test invalid age
    await user.type(ageInput, '150');
    
    // Validation happens on change, so error should appear immediately
    await waitFor(() => {
      expect(screen.getByText(/age must be between/i)).toBeInTheDocument();
    });
    
    // Clear and test valid age
    await user.clear(ageInput);
    await user.type(ageInput, '25');
    
    // Error should disappear immediately
    await waitFor(() => {
      expect(screen.queryByText(/age must be between/i)).not.toBeInTheDocument();
    });
  });

  it('calls onProfileChange when form fields are changed', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm profile={mockProfile} onProfileChange={mockOnProfileChange} />);
    
    // Clear mock to ensure we're only looking at calls from our test
    mockOnProfileChange.mockClear();
    
    // Test that changing any field triggers onProfileChange
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'new@example.com');
    
    // Just verify that onProfileChange was called
    await waitFor(() => {
      expect(mockOnProfileChange).toHaveBeenCalled();
    });
  });

  it('handles sex selection', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm profile={mockProfile} onProfileChange={mockOnProfileChange} />);
    
    // Clear previous calls
    mockOnProfileChange.mockClear();
    
    // Click female radio button
    const femaleRadio = screen.getByLabelText(/female/i);
    await user.click(femaleRadio);
    
    await waitFor(() => {
      const lastCall = mockOnProfileChange.mock.calls[mockOnProfileChange.mock.calls.length - 1];
      expect(lastCall[0].sex).toBe(Sex.FEMALE);
    });
  });

  it('handles activity level selection', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm profile={mockProfile} onProfileChange={mockOnProfileChange} />);
    
    // Clear previous calls
    mockOnProfileChange.mockClear();
    
    // Change activity level
    const activitySelect = screen.getByLabelText(/activity level/i);
    await user.selectOptions(activitySelect, ActivityLevel.VERY_ACTIVE);
    
    await waitFor(() => {
      const lastCall = mockOnProfileChange.mock.calls[mockOnProfileChange.mock.calls.length - 1];
      expect(lastCall[0].activityLevel).toBe(ActivityLevel.VERY_ACTIVE);
    });
  });

  it('validates weight input', async () => {
    const user = userEvent.setup();
    const profileWithValidWeight = { ...mockProfile, weight: 150 };
    render(<UserProfileForm profile={profileWithValidWeight} onProfileChange={mockOnProfileChange} />);
    
    const weightInput = screen.getByLabelText(/current weight/i);
    
    // First ensure no error exists
    expect(screen.queryByText(/weight must be between/i)).not.toBeInTheDocument();
    
    // Clear the input and type invalid weight
    await user.click(weightInput);
    await user.keyboard('{Control>}a{/Control}');
    await user.type(weightInput, '2000');
    
    // Validation happens on change
    await waitFor(() => {
      expect(screen.getByText(/weight must be between/i)).toBeInTheDocument();
    });
  });

  it('handles height input correctly', async () => {
    const user = userEvent.setup();
    // Start with null height to avoid validation errors
    const profileWithoutHeight = { ...mockProfile, height: null };
    render(<UserProfileForm profile={profileWithoutHeight} onProfileChange={mockOnProfileChange} />);
    
    // Clear mock to track only our changes
    mockOnProfileChange.mockClear();
    
    // Get inputs
    const feetInput = screen.getByPlaceholderText(/feet/i);
    const inchesInput = screen.getByPlaceholderText(/inches/i);
    
    // Type valid height values
    await user.type(feetInput, '6');
    
    // Just verify that onProfileChange was called with feet value
    await waitFor(() => {
      expect(mockOnProfileChange).toHaveBeenCalled();
      const lastCall = mockOnProfileChange.mock.calls[mockOnProfileChange.mock.calls.length - 1];
      expect(lastCall[0].height?.ft).toBe(6);
    });
    
    // Now type inches
    await user.type(inchesInput, '2');
    
    // Verify inches was set
    await waitFor(() => {
      const lastCall = mockOnProfileChange.mock.calls[mockOnProfileChange.mock.calls.length - 1];
      expect(lastCall[0].height?.in).toBe(2);
    });
  });
});