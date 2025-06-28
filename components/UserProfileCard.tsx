import React from 'react';
import { UserProfile, CalculatedMetrics } from '../types';
import DietWiseLogo from '../src/components/DietWiseLogo';

interface UserProfileCardProps {
  profile: UserProfile;
  metrics: CalculatedMetrics;
  onEditProfile: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ profile, metrics, onEditProfile }) => {
  const getInitials = () => {
    if (!profile.name) return 'U';
    return profile.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBMIStatus = (bmi: number | null) => {
    if (!bmi) return { status: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    
    if (bmi < 18.5) return { status: 'Underweight', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (bmi < 25) return { status: 'Normal', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (bmi < 30) return { status: 'Overweight', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'Obese', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const formatHeight = () => {
    if (!profile.height?.ft || !profile.height?.in) return 'Not set';
    return `${profile.height.ft}'${profile.height.in}"`;
  };

  const bmiInfo = getBMIStatus(metrics.bmi);

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 p-6 sm:p-8 rounded-2xl shadow-xl border border-teal-100 dark:border-slate-600">
      {/* Header with Logo and Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <DietWiseLogo size="medium" className="flex-shrink-0" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-default">
              {profile.name || 'Your Profile'}
            </h2>
            <p className="text-text-alt text-sm">Your health journey starts here</p>
          </div>
        </div>
        <button
          onClick={onEditProfile}
          className="bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-teal-600 dark:text-teal-400 font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-teal-200 dark:border-slate-500"
        >
          <i className="fas fa-edit mr-2"></i>
          Edit Profile
        </button>
      </div>

      {/* Profile Avatar/Initials */}
      <div className="flex items-center space-x-6 mb-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl sm:text-3xl font-bold text-white">
            {getInitials()}
          </span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-alt">Age</p>
              <p className="text-lg font-semibold text-text-default">
                {profile.age || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-alt">Gender</p>
              <p className="text-lg font-semibold text-text-default">
                {profile.sex ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1) : 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Personal Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-600">
          <div className="text-center">
            <i className="fas fa-ruler-vertical text-2xl text-blue-500 mb-2"></i>
            <p className="text-sm text-text-alt">Height</p>
            <p className="text-xl font-bold text-text-default">
              {formatHeight()}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-600">
          <div className="text-center">
            <i className="fas fa-fire text-2xl text-orange-500 mb-2"></i>
            <p className="text-sm text-text-alt">Daily Calories</p>
            <p className="text-xl font-bold text-text-default">
              {metrics.targetCalories ? metrics.targetCalories.toLocaleString() : '--'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-600">
          <div className="text-center">
            <i className="fas fa-running text-2xl text-green-500 mb-2"></i>
            <p className="text-sm text-text-alt">Activity Level</p>
            <p className="text-sm font-bold text-text-default">
              {profile.activityLevel ? 
                profile.activityLevel.charAt(0).toUpperCase() + profile.activityLevel.slice(1).replace('_', ' ') : 
                'Not set'
              }
            </p>
          </div>
        </div>
      </div>

      {/* BMI Status Badge */}
      {metrics.bmi && (
        <div className={`${bmiInfo.bgColor} ${bmiInfo.color} p-3 rounded-lg text-center mb-6`}>
          <p className="font-medium">BMI Status: {bmiInfo.status}</p>
        </div>
      )}

      {/* Quick Weight Summary - Links to Weigh In Tab */}
      {profile.weight && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-teal-200 dark:border-teal-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-700 dark:text-teal-300">Current Weight</p>
              <p className="text-2xl font-bold text-teal-800 dark:text-teal-200">{profile.weight} lbs</p>
              {metrics.bmi && (
                <p className="text-xs text-teal-600 dark:text-teal-400">BMI: {metrics.bmi.toFixed(1)}</p>
              )}
            </div>
            <div className="text-center">
              <i className="fas fa-weight text-3xl text-teal-500 mb-2"></i>
              <p className="text-xs text-teal-600 dark:text-teal-400">Visit Weigh In tab</p>
              <p className="text-xs text-teal-600 dark:text-teal-400">for detailed tracking</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;