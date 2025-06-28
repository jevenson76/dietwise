import React from 'react';
import { UserProfile } from '../types';

interface UserProfileFormProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ profile, onProfileChange }) => {
  const handleChange = (field: keyof UserProfile, value: any) => {
    onProfileChange({ ...profile, [field]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={profile.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={profile.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium mb-1">Age</label>
          <input
            id="age"
            name="age"
            type="number"
            value={profile.age || ''}
            onChange={(e) => handleChange('age', parseInt(e.target.value) || null)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter your age"
          />
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium mb-1">Weight (lbs)</label>
          <input
            id="weight"
            name="weight"
            type="number"
            value={profile.weight || ''}
            onChange={(e) => handleChange('weight', parseFloat(e.target.value) || null)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter your weight"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="height_ft" className="block text-sm font-medium mb-1">Height (ft)</label>
            <input
              id="height_ft"
              name="height_ft"
              type="number"
              value={profile.height?.ft || ''}
              onChange={(e) => handleChange('height', { ...profile.height, ft: parseInt(e.target.value) || null })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Feet"
            />
          </div>
          <div>
            <label htmlFor="height_in" className="block text-sm font-medium mb-1">Height (in)</label>
            <input
              id="height_in"
              name="height_in"
              type="number"
              value={profile.height?.in || ''}
              onChange={(e) => handleChange('height', { ...profile.height, in: parseInt(e.target.value) || null })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Inches"
            />
          </div>
        </div>

        <div>
          <label htmlFor="sex" className="block text-sm font-medium mb-1">Sex</label>
          <select
            id="sex"
            name="sex"
            value={profile.sex || ''}
            onChange={(e) => handleChange('sex', e.target.value || null)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label htmlFor="activityLevel" className="block text-sm font-medium mb-1">Activity Level</label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={profile.activityLevel || ''}
            onChange={(e) => handleChange('activityLevel', e.target.value || null)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select...</option>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very Active</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;