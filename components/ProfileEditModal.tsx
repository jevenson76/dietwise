import React, { useState } from 'react';
import { UserProfile, Sex, ActivityLevel } from '../types';
import { validateUserProfile } from '../utils/validation';
import Modal from './common/Modal';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name: rawName, value } = e.target;
    const name = rawName as keyof UserProfile | 'height_ft' | 'height_in';

    let processedValue: any;

    if (name === 'age' || name === 'weight' || name === 'targetWeight') {
      processedValue = value ? parseFloat(value) : null;
    } else if (name === 'sex') {
      processedValue = value as Sex | null;
    } else if (name === 'activityLevel') {
      processedValue = value as ActivityLevel | null;
    } else if (name === 'height_ft' || name === 'height_in') {
      // Handle height separately
    } else {
      processedValue = value || null;
    }

    const newProfileUpdate: Partial<UserProfile> = {};

    if (name === 'height_ft') {
      newProfileUpdate.height = {
        ...(editedProfile.height || { ft: null, in: null }),
        ft: value ? parseInt(value, 10) : null,
        in: editedProfile.height?.in ?? null
      };
    } else if (name === 'height_in') {
      newProfileUpdate.height = {
        ...(editedProfile.height || { ft: null, in: null }),
        ft: editedProfile.height?.ft ?? null,
        in: value ? parseInt(value, 10) : null,
      };
    } else {
      (newProfileUpdate as any)[name] = processedValue;
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

    setEditedProfile(prev => ({
      ...prev,
      ...newProfileUpdate,
    }));
  };

  const handleSave = () => {
    // Validate all required fields
    const requiredFields = ['name', 'age', 'sex', 'weight'];
    let hasErrors = false;

    requiredFields.forEach(field => {
      if (!editedProfile[field as keyof UserProfile]) {
        setErrors(prev => ({ ...prev, [field]: 'This field is required' }));
        hasErrors = true;
      }
    });

    if (!editedProfile.height?.ft || !editedProfile.height?.in) {
      setErrors(prev => ({ ...prev, height: 'Height is required' }));
      hasErrors = true;
    }

    if (hasErrors || Object.keys(errors).length > 0) {
      return;
    }

    // Set initial weight if this is first time setting weight
    if (editedProfile.weight && !editedProfile.startWeight && !editedProfile.profileCreationDate) {
      editedProfile.startWeight = editedProfile.weight;
    }

    onSave(editedProfile);
    onClose();
  };

  const inputClass = "w-full px-4 py-3 border border-border-default rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base bg-bg-card text-text-default";
  const selectClass = inputClass;
  const getRadioLabelClass = (isSelected: boolean) => 
    `block w-full text-center px-4 py-3 border rounded-lg cursor-pointer transition-all text-base font-medium ${
      isSelected 
        ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 shadow-md' 
        : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-700'
    }`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-default border-b border-border-default pb-2">
            Basic Information
          </h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-alt mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={editedProfile.name || ''}
              onChange={handleChange}
              className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Your name"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-text-alt mb-1">
                Age *
              </label>
              <input
                type="number"
                name="age"
                id="age"
                value={editedProfile.age || ''}
                onChange={handleChange}
                className={`${inputClass} ${errors.age ? 'border-red-500' : ''}`}
                placeholder="25"
                min="1"
                max="120"
                required
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-500">{errors.age}</p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-text-alt mb-1">Gender *</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input 
                    type="radio" 
                    name="sex" 
                    id="male" 
                    value={Sex.MALE} 
                    checked={editedProfile.sex === Sex.MALE} 
                    onChange={handleChange} 
                    className="sr-only custom-radio-input"
                  />
                  <label htmlFor="male" className={getRadioLabelClass(editedProfile.sex === Sex.MALE)}>
                    <i className="fas fa-mars mr-2"></i>Male
                  </label>
                </div>
                <div>
                  <input 
                    type="radio" 
                    name="sex" 
                    id="female" 
                    value={Sex.FEMALE} 
                    checked={editedProfile.sex === Sex.FEMALE} 
                    onChange={handleChange} 
                    className="sr-only custom-radio-input"
                  />
                  <label htmlFor="female" className={getRadioLabelClass(editedProfile.sex === Sex.FEMALE)}>
                    <i className="fas fa-venus mr-2"></i>Female
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Stats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-default border-b border-border-default pb-2">
            Physical Stats
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-text-alt mb-1">
                Current Weight (lbs) *
              </label>
              <input
                type="number"
                name="weight"
                id="weight"
                value={editedProfile.weight || ''}
                onChange={handleChange}
                className={`${inputClass} ${errors.weight ? 'border-red-500' : ''}`}
                placeholder="150"
                min="10"
                max="1000"
                step="0.1"
                required
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-500">{errors.weight}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-alt mb-1">Height *</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="height_ft"
                  placeholder="Feet"
                  value={editedProfile.height?.ft ?? ''}
                  onChange={handleChange}
                  className={inputClass}
                  min="1"
                  max="8"
                />
                <input
                  type="number"
                  name="height_in"
                  placeholder="Inches"
                  value={editedProfile.height?.in ?? ''}
                  onChange={handleChange}
                  className={inputClass}
                  min="0"
                  max="11"
                  step="0.1"
                />
              </div>
              {errors.height && (
                <p className="mt-1 text-sm text-red-500">{errors.height}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="activityLevel" className="block text-sm font-medium text-text-alt mb-1">
              Activity Level
            </label>
            <select
              name="activityLevel"
              id="activityLevel"
              value={editedProfile.activityLevel || ''}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select Activity Level</option>
              <option value={ActivityLevel.SEDENTARY}>Sedentary (little or no exercise)</option>
              <option value={ActivityLevel.LIGHT}>Light (exercise 1-3 days/week)</option>
              <option value={ActivityLevel.MODERATE}>Moderate (exercise 3-5 days/week)</option>
              <option value={ActivityLevel.ACTIVE}>Active (exercise 6-7 days/week)</option>
              <option value={ActivityLevel.VERY_ACTIVE}>Very Active (hard exercise & physical job)</option>
            </select>
          </div>
        </div>

        {/* Goal Setting */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-default border-b border-border-default pb-2">
            Goal Setting
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="targetWeight" className="block text-sm font-medium text-text-alt mb-1">
                Target Weight (lbs)
              </label>
              <input
                type="number"
                name="targetWeight"
                id="targetWeight"
                value={editedProfile.targetWeight || ''}
                onChange={handleChange}
                className={inputClass}
                placeholder="140"
                min="10"
                max="1000"
                step="0.1"
              />
            </div>

            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-text-alt mb-1">
                Target Date
              </label>
              <input
                type="date"
                name="targetDate"
                id="targetDate"
                value={editedProfile.targetDate || ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-border-default">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-text-alt rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <i className="fas fa-save mr-2"></i>
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileEditModal;