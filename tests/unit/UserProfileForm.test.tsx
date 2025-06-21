import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileForm from '@components/UserProfileForm';
import { UserProfile, Sex } from '@appTypes';

describe('UserProfileForm', () => {
  const mockProfile: UserProfile = {
    age: 30,
    sex: 'male' as Sex,
    height: 175,
    weight: 70,
    activity_level: 'moderate',
    goal_weight: 65,
    goal_pace: 'moderate',
    diet_plan: 'balanced',
  };

  const mockOnProfileChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    render(<UserProfileForm profile={mockProfile} onProfileChange={mockOnProfileChange} />);
    
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sex/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/activity level/i)).toBeInTheDocument();
  });

  it('displays initial values correctly', () => {
    render(<UserProfileForm profile={mockProfile} onProfileChange={mockOnProfileChange} />);
    
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('175')).toBeInTheDocument();
    expect(screen.getByDisplayValue('70')).toBeInTheDocument();
  });

  it('validates age input', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm profile={mockProfile} onProfileChange={mockOnProfileChange} />);
    
    const ageInput = screen.getByLabelText(/age/i);
    
    // Test invalid age
    await user.clear(ageInput);
    await user.type(ageInput, '150');
    
    expect(screen.getByText(/age must be between/i)).toBeInTheDocument();
    
    // Test valid age
    await user.clear(ageInput);
    await user.type(ageInput, '25');
    
    expect(screen.queryByText(/age must be between/i)).not.toBeInTheDocument();
  });

  it('calls onUpdate with correct data on form submission', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm profile={mockProfile} onProfileChange={mockOnProfileChange} />);
    
    // Update weight
    const weightInput = screen.getByLabelText(/current weight/i);
    await user.clear(weightInput);
    await user.type(weightInput, '75');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /save profile/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnProfileChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockProfile,
          weight: 75,
        })
      );
    });
  });

  it('handles metric/imperial unit conversion', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm profile={mockProfile} onProfileChange={mockOnProfileChange} />);
    
    // Switch to imperial
    const unitToggle = screen.getByRole('button', { name: /switch to imperial/i });
    await user.click(unitToggle);
    
    // Check conversions
    expect(screen.getByDisplayValue('68.9')).toBeInTheDocument(); // 175cm to inches
    expect(screen.getByDisplayValue('154.3')).toBeInTheDocument(); // 70kg to lbs
  });

  it('disables form during submission', async () => {
    const user = userEvent.setup();
    
    // Mock slow update
    mockOnProfileChange.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<UserProfileForm profile={mockProfile} onProfileChange={mockOnProfileChange} />);
    
    const submitButton = screen.getByRole('button', { name: /save profile/i });
    await user.click(submitButton);
    
    // Check form is disabled
    expect(submitButton).toBeDisabled();
    expect(screen.getByLabelText(/age/i)).toBeDisabled();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});