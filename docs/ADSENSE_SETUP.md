# Google AdSense Setup Guide for DietWise

## Overview
This guide explains how to configure Google AdSense for the DietWise application to start generating ad revenue.

## Implementation Details

### 1. Current Setup
The application has been configured with:
- **GoogleAdSense component** (`src/components/GoogleAdSense.tsx`) - A React component that renders AdSense ads
- **Ad configuration** (`src/constants/adConfig.ts`) - Centralized configuration for ad placements
- **Strategic ad placements** throughout the app:
  - Food Log tab: Banner ad (320x50)
  - Food Library tab: Banner ad (320x50)
  - Meal Ideas tab: Medium Rectangle (300x250)
  - Profile tab: Small banner (300x100)
  - Settings tab: Small banner (300x100)
  - Analytics tab: Small banner (300x100) - Premium users only

### 2. Configuration Steps

#### Step 1: Get Your AdSense Account
1. Sign up for Google AdSense at https://www.google.com/adsense/
2. Add your website URL: `https://your-dietwise-domain.com`
3. Wait for approval (usually 24-48 hours)

#### Step 2: Get Your Publisher ID
Once approved, find your publisher ID:
1. Go to AdSense Dashboard → Settings → Account → Account Information
2. Copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)

#### Step 3: Create Ad Units
For each placement, create an ad unit:
1. Go to AdSense → Ads → By ad unit → Display ads
2. Create the following ad units:

| Ad Unit Name | Type | Size | Placement |
|-------------|------|------|-----------|
| DietWise Food Log Banner | Display | Responsive (320x50 min) | After food log content |
| DietWise Food Library Banner | Display | Responsive (320x50 min) | After library content |
| DietWise Meal Ideas Rectangle | Display | 300x250 | After meal suggestions |
| DietWise Profile Banner | Display | 300x100 | Profile tab bottom |
| DietWise Settings Banner | Display | 300x100 | Settings tab bottom |
| DietWise Analytics Banner | Display | 300x100 | Analytics tab bottom |

3. Copy the ad slot ID for each unit (format: `XXXXXXXXXX`)

#### Step 4: Update Configuration

1. **Update the AdSense script in `index.html`:**
```html
<!-- Replace ca-pub-XXXXXXXXXXXXXXXX with your publisher ID -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
   crossorigin="anonymous"></script>
```

2. **Set environment variables in `.env`:**
```env
# Google AdSense Configuration
REACT_APP_ADSENSE_CLIENT_ID=ca-pub-YOUR_PUBLISHER_ID
REACT_APP_AD_SLOT_FOOD_LOG=YOUR_FOOD_LOG_SLOT_ID
REACT_APP_AD_SLOT_FOOD_LIBRARY=YOUR_FOOD_LIBRARY_SLOT_ID
REACT_APP_AD_SLOT_MEAL_IDEAS=YOUR_MEAL_IDEAS_SLOT_ID
REACT_APP_AD_SLOT_PROFILE=YOUR_PROFILE_SLOT_ID
REACT_APP_AD_SLOT_SETTINGS=YOUR_SETTINGS_SLOT_ID
REACT_APP_AD_SLOT_ANALYTICS=YOUR_ANALYTICS_SLOT_ID

# Enable production ads (remove for test mode)
REACT_APP_ADSENSE_PRODUCTION=true
```

3. **Alternative: Direct configuration update**
If not using environment variables, update `src/constants/adConfig.ts`:
```typescript
export const ADSENSE_CONFIG = {
  CLIENT_ID: 'ca-pub-YOUR_PUBLISHER_ID',
  AD_SLOTS: {
    FOOD_LOG_BANNER: 'YOUR_FOOD_LOG_SLOT_ID',
    FOOD_LIBRARY_BANNER: 'YOUR_FOOD_LIBRARY_SLOT_ID',
    // ... etc
  }
};
```

## Revenue Optimization

### Ad Placement Strategy
- Ads are placed at natural content breaks to minimize user disruption
- Banner ads (320x50) for mobile-friendly experience
- Medium rectangle (300x250) for higher CPM on meal ideas page
- Ads are hidden for premium users to enhance their experience

### Expected Revenue (Based on Your Estimates)
- **Monthly Active Users (MAU)**: 1,000-5,000
- **Page views per user**: ~10/month
- **Total impressions**: 10,000-50,000/month
- **Average CPM**: $1-$5
- **Monthly revenue**: $10-$250
- **Annual revenue**: $120-$3,000

### Optimization Tips
1. **Monitor Performance**: Use AdSense reports to track:
   - Page RPM (Revenue per thousand pageviews)
   - Click-through rate (CTR)
   - Top performing ad units

2. **A/B Testing**: Test different ad formats and placements
3. **Page Speed**: Ensure ads don't significantly impact loading time
4. **Mobile Optimization**: Most users will be on mobile devices
5. **Content Quality**: Higher quality content = higher CPM rates

## Compliance & Best Practices

### AdSense Policies
1. Never click your own ads
2. Don't encourage users to click ads
3. Ensure sufficient content on pages with ads
4. Follow AdSense content policies

### User Experience
1. Ads are automatically hidden for premium subscribers
2. Ad density is kept reasonable (1-2 ads per page)
3. Ads don't interfere with core functionality
4. Loading states prevent layout shift

## Testing

### Development Mode
By default, ads show in test mode during development:
- Gray placeholder boxes appear instead of real ads
- No revenue is generated
- Safe for development and testing

### Production Mode
Set `REACT_APP_ADSENSE_PRODUCTION=true` to enable real ads

## Monitoring & Analytics

### Track Ad Performance
The app already tracks:
- Page views
- User engagement
- Premium vs free users

### Recommended Analytics
1. Set up Google Analytics 4
2. Link AdSense to GA4
3. Create custom reports for:
   - Revenue by user segment
   - Ad performance by device type
   - Revenue impact on user retention

## Troubleshooting

### Common Issues
1. **Ads not showing**: Check browser console for errors
2. **Low revenue**: Review ad placement and user engagement
3. **Policy violations**: Review AdSense policy center

### Support Resources
- AdSense Help Center: https://support.google.com/adsense
- AdSense Community: https://support.google.com/adsense/community

## Next Steps
1. Complete AdSense application
2. Create ad units as specified
3. Update configuration with your IDs
4. Deploy to production
5. Monitor initial performance
6. Optimize based on data

## Revenue Scaling
As your user base grows:
- 10,000 MAU: $100-$500/month
- 50,000 MAU: $500-$2,500/month
- 100,000 MAU: $1,000-$5,000/month

Remember: Focus on user growth and engagement first, as these directly impact ad revenue.