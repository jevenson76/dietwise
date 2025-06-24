import React, { useEffect } from 'react';

interface DebugProfileTabProps {
  activeTab: string;
  isPremiumUser: boolean;
  isInitialSetup: boolean;
  tabOrder: string[];
  userProfile: any;
}

const DebugProfileTab: React.FC<DebugProfileTabProps> = ({
  activeTab,
  isPremiumUser,
  isInitialSetup,
  tabOrder,
  userProfile
}) => {
  useEffect(() => {
    console.log('=== DIETWISE DEBUG INFO ===');
    console.log('Active Tab:', activeTab);
    console.log('Tab Order:', tabOrder);
    console.log('Tab Index:', tabOrder.indexOf(activeTab));
    console.log('Is Premium User:', isPremiumUser);
    console.log('Is Initial Setup:', isInitialSetup);
    console.log('Profile Creation Date:', userProfile.profileCreationDate);
    console.log('Has Seen Onboarding:', localStorage.getItem('hasSeenOnboarding'));
    console.log('Current URL:', window.location.href);
    console.log('=========================');
  }, [activeTab, isPremiumUser, isInitialSetup, tabOrder, userProfile]);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50 text-xs font-mono max-w-sm">
      <h3 className="font-bold mb-2 text-yellow-400">DEBUG INFO</h3>
      <div className="space-y-1">
        <div>Active Tab: <span className="text-green-400">{activeTab}</span></div>
        <div>Tab Position: <span className="text-green-400">{tabOrder.indexOf(activeTab) + 1} of {tabOrder.length}</span></div>
        <div>Premium: <span className={isPremiumUser ? 'text-green-400' : 'text-red-400'}>{isPremiumUser ? 'YES' : 'NO'}</span></div>
        <div>Initial Setup: <span className={isInitialSetup ? 'text-yellow-400' : 'text-green-400'}>{isInitialSetup ? 'YES' : 'NO'}</span></div>
        <div>Profile Date: <span className="text-blue-400">{userProfile.profileCreationDate || 'NOT SET'}</span></div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-yellow-400">All Tabs:</div>
        {tabOrder.map((tab, idx) => (
          <div key={tab} className={`text-xs ${activeTab === tab ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
            {idx + 1}. {tab} {activeTab === tab ? '← ACTIVE' : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugProfileTab;