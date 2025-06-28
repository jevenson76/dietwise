import React from 'react';

// Generic stub component for missing components
const StubComponent: React.FC<{ name: string; [key: string]: any }> = ({ name, ...props }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
        {name} Component
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
        This feature is coming soon...
      </p>
    </div>
  );
};

// Export specific stub components
export const UPCScannerComponent = (props: any) => <StubComponent name="UPC Scanner" {...props} />;
export const MealPlannerComponent = (props: any) => <StubComponent name="Meal Planner" {...props} />;
export const ProgressTabComponent = (props: any) => <StubComponent name="Progress" {...props} />;
export const UserStatusDashboard = (props: any) => <StubComponent name="Status Dashboard" {...props} />;
export const MyLibraryComponent = (props: any) => <StubComponent name="Food Library" {...props} />;
export const ReviewPromptModal = (props: any) => <StubComponent name="Review Modal" {...props} />;
export const StripeCheckout = (props: any) => <StubComponent name="Checkout" {...props} />;
export const AdvancedAnalytics = (props: any) => <StubComponent name="Analytics" {...props} />;
export const PDFExportButton = (props: any) => <StubComponent name="PDF Export" {...props} />;
export const CustomMacroTargets = (props: any) => <StubComponent name="Macro Targets" {...props} />;
export const UpgradePrompt = (props: any) => <StubComponent name="Upgrade Prompt" {...props} />;
export const AuthModal = (props: any) => <StubComponent name="Auth Modal" {...props} />;
export const SettingsTab = (props: any) => <StubComponent name="Settings" {...props} />;
export const ProgressiveOnboarding = (props: any) => <StubComponent name="Onboarding" {...props} />;
export const OnboardingChecklist = (props: any) => <StubComponent name="Onboarding Checklist" {...props} />;

export default StubComponent;