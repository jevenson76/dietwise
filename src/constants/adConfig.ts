// Google AdSense Configuration
// Replace these with your actual AdSense client ID and ad slot IDs

export const ADSENSE_CONFIG = {
  // Your AdSense Publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)
  CLIENT_ID: process.env.REACT_APP_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX',
  
  // Ad Slot IDs for different placements
  AD_SLOTS: {
    // After Food Log tab content - Banner Ad (320x50)
    FOOD_LOG_BANNER: process.env.REACT_APP_AD_SLOT_FOOD_LOG || 'XXXXXXXXXX',
    
    // After Food Library tab content - Banner Ad (320x50)
    FOOD_LIBRARY_BANNER: process.env.REACT_APP_AD_SLOT_FOOD_LIBRARY || 'XXXXXXXXXX',
    
    // After Meal Ideas content - Medium Rectangle (300x250)
    MEAL_IDEAS_RECTANGLE: process.env.REACT_APP_AD_SLOT_MEAL_IDEAS || 'XXXXXXXXXX',
    
    // Profile tab - Small Banner (300x100)
    PROFILE_BANNER: process.env.REACT_APP_AD_SLOT_PROFILE || 'XXXXXXXXXX',
    
    // Settings tab - Small Banner (300x100)
    SETTINGS_BANNER: process.env.REACT_APP_AD_SLOT_SETTINGS || 'XXXXXXXXXX',
    
    // Analytics tab (Premium users) - Small Banner (300x100)
    ANALYTICS_BANNER: process.env.REACT_APP_AD_SLOT_ANALYTICS || 'XXXXXXXXXX',
  },
  
  // Enable test mode when in development
  TEST_MODE: process.env.NODE_ENV === 'development' && !process.env.REACT_APP_ADSENSE_PRODUCTION,
  
  // Ad refresh settings
  REFRESH_INTERVAL: 30000, // 30 seconds minimum between refreshes
  
  // Responsive breakpoints
  RESPONSIVE: {
    mobile: { width: 320, height: 50 },
    tablet: { width: 728, height: 90 },
    desktop: { width: 970, height: 90 }
  }
};

// Ad placement configurations
export const AD_PLACEMENTS = {
  FOOD_LOG: {
    format: 'auto' as const,
    fullWidthResponsive: true,
    className: 'mt-6'
  },
  FOOD_LIBRARY: {
    format: 'horizontal' as const,
    fullWidthResponsive: true,
    className: 'mt-6'
  },
  MEAL_IDEAS: {
    format: 'rectangle' as const,
    fullWidthResponsive: false,
    className: 'mt-6 mx-auto max-w-sm'
  },
  PROFILE: {
    format: 'horizontal' as const,
    fullWidthResponsive: true,
    className: 'mt-6'
  },
  SETTINGS: {
    format: 'horizontal' as const,
    fullWidthResponsive: true,
    className: 'mt-6'
  },
  ANALYTICS: {
    format: 'horizontal' as const,
    fullWidthResponsive: true,
    className: 'mt-6'
  }
};

// Helper function to check if ads should be shown
export const shouldShowAds = (isPremiumUser: boolean = false): boolean => {
  // Always show ads for free users
  // For premium users, you might want to hide ads or show fewer
  return !isPremiumUser;
};