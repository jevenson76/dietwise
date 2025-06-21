import React, { useState } from 'react';
import { UserProfile, Sex, ActivityLevel } from '../types';
import { validateUserProfile, ValidationError } from '../utils/validation';

interface UserProfileFormProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ profile, onProfileChange }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name: rawName, value } = e.target;
    const name = rawName as keyof UserProfile | 'height_ft' | 'height_in';

    let processedValue: any; // Allow 'any' for intermediate processing

    if (name === 'age' || name === 'weight' || name === 'targetWeight') {
      processedValue = value ? parseFloat(value) : null;
    } else if (name === 'sex') {
      processedValue = value as Sex | null;
    } else if (name === 'activityLevel') {
      processedValue = value as ActivityLevel | null;
    } else if (name === 'height_ft' || name === 'height_in') {
      // Handled separately below
    } else {
      processedValue = value || null;
    }

    const newProfileDataUpdate: Partial<UserProfile> = {};

    if (name === 'height_ft') {
      newProfileDataUpdate.height = {
        ...(profile.height || { ft: null, in: null }), // Ensure profile.height is not null before spreading
        ft: value ? parseInt(value, 10) : null,
        in: profile.height?.in ?? null
      };
    } else if (name === 'height_in') {
      newProfileDataUpdate.height = {
        ...(profile.height || { ft: null, in: null }), // Ensure profile.height is not null before spreading
        ft: profile.height?.ft ?? null,
        in: value ? parseInt(value, 10) : null,
      };
    } else {
        // Here, 'name' is narrowed by the preceding if/else if to be a keyof UserProfile.
        // The cast to 'any' for newProfileDataUpdate bypasses a complex TS inference issue
        // where the LHS of the assignment was incorrectly inferred as 'never'.
        (newProfileDataUpdate as any)[name] = processedValue;
    }
    
    if (name === 'weight' && value && !profile.startWeight && !profile.profileCreationDate) {
      newProfileDataUpdate.startWeight = parseFloat(value);
    }
    
    // Validate the field
    const validationError = validateUserProfile(name, value);
    
    // Update errors state
    setErrors(prev => {
      const newErrors = { ...prev };
      if (validationError) {
        newErrors[validationError.field] = validationError.message;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
    
    onProfileChange({
      ...profile,
      ...newProfileDataUpdate,
    });
  };

  const inputClass = "mt-1 block w-full px-4 py-2.5 border border-border-default rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm placeholder-slate-400 bg-bg-card text-text-default dark:placeholder-slate-500";
  const selectClass = inputClass;
  const radioLabelBaseClass = "custom-radio-label block w-full text-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm cursor-pointer hover:border-teal-400";


  return (
    <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl">
      <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-6 border-b border-border-default pb-4">
        <i className="fas fa-user-edit mr-2.5 text-teal-600"></i>Your Personal Details
      </h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-alt">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={profile.name || ''}
            onChange={handleChange}
            className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
            placeholder="e.g., Alex Doe"
            maxLength={100}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-alt">Email (Optional)</label>
          <input
            type="email"
            name="email"
            id="email"
            value={profile.email || ''}
            onChange={handleChange}
            className={`${inputClass} ${errors.email ? 'border-red-500' : ''}`}
            placeholder="e.g., alex.doe@example.com"
            maxLength={100}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.email}
            </p>
          )}
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Used for future updates or account recovery. We respect your privacy.</p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-text-alt">Age (years)</label>
            <input
              type="number"
              name="age"
              id="age"
              value={profile.age || ''}
              onChange={handleChange}
              className={`${inputClass} ${errors.age ? 'border-red-500' : ''}`}
              placeholder="e.g., 30"
              min="1"
              max="120"
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-500" role="alert">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.age}
              </p>
            )}
          </div>
          <div>
            <span className="block text-sm font-medium text-text-alt mb-1">Sex</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input 
                  type="radio" 
                  name="sex" 
                  id="male" 
                  value={Sex.MALE} 
                  checked={profile.sex === Sex.MALE} 
                  onChange={handleChange} 
                  className="sr-only custom-radio-input"
                />
                <label htmlFor="male" className={`${radioLabelBaseClass}`}>
                  <i className="fas fa-mars mr-2"></i>Male
                </label>
              </div>
              <div>
                <input 
                  type="radio" 
                  name="sex" 
                  id="female" 
                  value={Sex.FEMALE} 
                  checked={profile.sex === Sex.FEMALE} 
                  onChange={handleChange} 
                  className="sr-only custom-radio-input"
                />
                <label htmlFor="female" className={`${radioLabelBaseClass}`}>
                  <i className="fas fa-venus mr-2"></i>Female
                </label>
              </div>
            </div>
          </div>
        
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-alt">Height</label>
            <div className="grid grid-cols-2 gap-x-4">
                <div>
                    <label htmlFor="height_ft" className="block text-xs font-medium text-text-alt">Feet</label>
                    <input
                        type="number"
                        name="height_ft"
                        id="height_ft"
                        value={profile.height?.ft ?? ''}
                        onChange={handleChange}
                        className={`${inputClass} ${errors.height_ft ? 'border-red-500' : ''}`}
                        placeholder="e.g., 5"
                        min="1"
                        max="8"
                    />
                    {errors.height_ft && (
                      <p className="mt-1 text-sm text-red-500" role="alert">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.height_ft}
                      </p>
                    )}
                </div>
                <div>
                    <label htmlFor="height_in" className="block text-xs font-medium text-text-alt">Inches</label>
                    <input
                        type="number"
                        name="height_in"
                        id="height_in"
                        value={profile.height?.in ?? ''}
                        onChange={handleChange}
                        className={`${inputClass} ${errors.height_in ? 'border-red-500' : ''}`}
                        placeholder="e.g., 8"
                        min="0"
                        max="11"
                        step="0.1"
                    />
                    {errors.height_in && (
                      <p className="mt-1 text-sm text-red-500" role="alert">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.height_in}
                      </p>
                    )}
                </div>
            </div>
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-text-alt">Current Weight (lbs)</label>
            <input
              type="number"
              name="weight"
              id="weight"
              value={profile.weight || ''}
              onChange={handleChange}
              className={`${inputClass} ${errors.weight ? 'border-red-500' : ''}`}
              placeholder="e.g., 150"
              min="10"
              max="1000"
              step="0.1"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-500" role="alert">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.weight}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="activityLevel" className="block text-sm font-medium text-text-alt">Activity Level</label>
            <select
              name="activityLevel"
              id="activityLevel"
              value={profile.activityLevel || ''}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="" disabled>Select Activity Level</option>
              <option value={ActivityLevel.SEDENTARY}>Sedentary (little or no exercise)</option>
              <option value={ActivityLevel.LIGHT}>Light (exercise 1-3 days/week)</option>
              <option value={ActivityLevel.MODERATE}>Moderate (exercise 3-5 days/week)</option>
              <option value={ActivityLevel.ACTIVE}>Active (exercise 6-7 days/week)</option>
              <option value={ActivityLevel.VERY_ACTIVE}>Very Active (hard exercise & physical job)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;