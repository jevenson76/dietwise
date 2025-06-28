# DietWise Freemium Implementation Overview

## Table of Contents
1. [Introduction](#introduction)
2. [Premium Features](#premium-features)
3. [Pricing Strategy](#pricing-strategy)
4. [Technical Architecture](#technical-architecture)
5. [User Experience Flow](#user-experience-flow)
6. [Revenue Optimization](#revenue-optimization)

## Introduction

DietWise has been transformed from a free app to a freemium model designed to maximize revenue while providing value to both free and premium users. The implementation focuses on creating natural upgrade points throughout the user journey.

## Premium Features

### 1. **Unlimited Barcode Scanning**
- **Free**: 5 scans per day
- **Premium**: Unlimited scans
- **Implementation**: Usage tracked in localStorage with daily reset

### 2. **AI Meal Suggestions**
- **Free**: 3 suggestions per day
- **Premium**: Unlimited suggestions
- **Implementation**: Counter resets daily at midnight

### 3. **Advanced Analytics Dashboard**
- **Free**: Blurred preview with upgrade prompt
- **Premium**: Full access to:
  - Calorie/macro trends
  - Macro distribution charts
  - Weekly comparisons
  - Meal timing analysis

### 4. **PDF Export**
- **Free**: 5 exports per month
- **Premium**: Unlimited exports with customizable options
- **Features**: Date range selection, weight history, macro breakdowns

### 5. **Custom Macro Targets**
- **Free**: Default calculated targets only
- **Premium**: Fully customizable protein, carb, fat, and fiber targets

### 6. **Historical Data Access**
- **Free**: Last 30 days only
- **Premium**: Unlimited history
- **Implementation**: Data filtering applied at runtime

### 7. **7-Day Meal Planner**
- **Free**: No access
- **Premium**: Full AI-powered meal planning

### 8. **Custom Foods & Meals Library**
- **Free**: 20 items limit
- **Premium**: Unlimited storage

## Pricing Strategy

### Subscription Tiers
- **Monthly**: $9.99/month
- **Yearly**: $79/year (34% savings, ~$6.58/month)
- **Free Trial**: 7 days for all new subscribers

### Payment Processing
- **Provider**: Stripe
- **Integration**: Stripe Checkout (hosted)
- **Security**: PCI compliant, no card data stored

## Technical Architecture

### Frontend Components
```
components/
├── StripeCheckout.tsx         # Payment flow UI
├── AdvancedAnalytics.tsx      # Premium analytics
├── CustomMacroTargets.tsx     # Macro customization
├── PDFExportButton.tsx        # PDF generation
├── UpgradePrompt.tsx          # Reusable upgrade CTAs
└── [Updated components with premium checks]
```

### State Management
- Premium status stored in localStorage
- Usage limits tracked with daily/monthly resets
- Real-time limit checking before feature access

### Data Filtering
```typescript
// Historical data limits
const filteredData = filterByHistoricalLimit(data, isPremiumUser);
```

## User Experience Flow

### Free User Journey
1. **Onboarding**: Full access to core features
2. **First Friction**: Barcode scan limit (day 1-2)
3. **Value Recognition**: After logging 10+ items
4. **Upgrade Prompts**: Strategic placement at natural breakpoints

### Premium User Benefits
1. **Immediate Access**: All limits removed
2. **Advanced Features**: Analytics, PDF export, meal planning
3. **No Ads**: Clean, focused experience
4. **Priority Support**: Future implementation

## Revenue Optimization

### Conversion Triggers
1. **Usage-Based**: When hitting daily limits
2. **Value-Based**: After consistent usage (10+ logs)
3. **Feature-Based**: Attempting premium features
4. **Time-Based**: Strategic prompts after key milestones

### Upgrade Prompt Strategy
- **Contextual**: Related to current user action
- **Non-Intrusive**: Doesn't block core functionality
- **Value-Focused**: Emphasizes benefits, not restrictions
- **Persistent**: Premium features marked with star icons

### Analytics Events
All user interactions tracked for optimization:
- Feature limit reached
- Upgrade prompt shown/clicked
- Premium feature attempted
- Subscription initiated/completed

## Future Enhancements

### Planned Features
1. **Premium Recipes**: Exclusive meal database
2. **Nutrition Coaching**: AI-powered recommendations
3. **Social Features**: Premium-only community
4. **API Access**: For fitness app integrations
5. **Family Plans**: Multi-user subscriptions

### A/B Testing Opportunities
- Pricing points
- Trial length
- Feature limits
- Upgrade prompt messaging
- Onboarding flow variations