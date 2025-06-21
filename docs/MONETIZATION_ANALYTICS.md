# DietWise Monetization Analytics Guide

## Overview
This guide outlines the analytics implementation for tracking and optimizing the freemium monetization strategy.

## Key Performance Indicators (KPIs)

### 1. Conversion Metrics
- **Free to Premium Conversion Rate**: Target 2-5%
- **Trial to Paid Conversion**: Target 50-60%
- **Time to Conversion**: Average days from signup to premium

### 2. Revenue Metrics
- **Monthly Recurring Revenue (MRR)**
- **Annual Recurring Revenue (ARR)**
- **Average Revenue Per User (ARPU)**
- **Customer Lifetime Value (CLV)**

### 3. Engagement Metrics
- **Daily Active Users (DAU)**
- **Feature Usage by Tier**
- **Retention Rate (Day 1, 7, 30)**
- **Churn Rate**

## Analytics Events Implementation

### User Journey Events

```typescript
// Onboarding
trackEvent('user_signed_up', { referrer, device_type });
trackEvent('profile_completed', { completion_time });
trackEvent('first_food_logged', { method: 'manual' | 'scan' | 'meal' });

// Feature Usage
trackEvent('barcode_scan_attempted', { premium_status, daily_count });
trackEvent('meal_suggestion_requested', { premium_status, daily_count });
trackEvent('analytics_viewed', { premium_status, time_range });
trackEvent('pdf_exported', { premium_status, date_range });

// Limit Events
trackEvent('daily_limit_reached', { feature, limit_type });
trackEvent('premium_feature_blocked', { feature });

// Conversion Events
trackEvent('upgrade_prompt_shown', { location, variant });
trackEvent('upgrade_prompt_clicked', { location, variant });
trackEvent('checkout_initiated', { plan, source });
trackEvent('subscription_activated', { plan, trial });
trackEvent('subscription_cancelled', { reason, tenure });
```

### A/B Testing Framework

```typescript
interface Experiment {
  name: string;
  variants: string[];
  allocation: number[]; // percentage per variant
}

const experiments = {
  pricing: {
    name: 'pricing_test',
    variants: ['control_9.99', 'test_7.99', 'test_12.99'],
    allocation: [34, 33, 33]
  },
  limits: {
    name: 'scan_limit_test',
    variants: ['5_scans', '3_scans', '10_scans'],
    allocation: [34, 33, 33]
  }
};

// Track variant exposure
trackEvent('experiment_exposed', {
  experiment_name: experiment.name,
  variant: assignedVariant
});
```

## Funnel Analysis

### Conversion Funnel Stages

1. **Acquisition**
   - App visit/download
   - Account creation
   - Profile completion

2. **Activation**
   - First food logged
   - First barcode scan
   - First week completed

3. **Revenue**
   - Upgrade prompt viewed
   - Checkout initiated
   - Payment completed

4. **Retention**
   - Daily active use
   - Premium renewal
   - Feature adoption

### Funnel Tracking Implementation

```typescript
// Funnel stage tracking
const trackFunnelStage = (stage: string, metadata?: any) => {
  trackEvent('funnel_stage_reached', {
    stage,
    timestamp: new Date().toISOString(),
    session_id: getSessionId(),
    ...metadata
  });
};

// Example usage
trackFunnelStage('acquisition_complete', { source: 'organic' });
trackFunnelStage('activation_first_log', { method: 'barcode' });
trackFunnelStage('revenue_checkout_started', { plan: 'monthly' });
```

## Cohort Analysis

### Cohort Definitions

```typescript
interface Cohort {
  name: string;
  startDate: Date;
  endDate: Date;
  users: string[];
  metrics: {
    conversion_rate: number;
    retention_d1: number;
    retention_d7: number;
    retention_d30: number;
    arpu: number;
  };
}

// Track cohort assignment
const assignUserToCohort = (userId: string) => {
  const signupWeek = getWeekNumber(new Date());
  const cohortName = `week_${signupWeek}_2025`;
  
  trackEvent('cohort_assigned', {
    user_id: userId,
    cohort: cohortName,
    signup_date: new Date().toISOString()
  });
};
```

## Revenue Analytics

### Subscription Metrics Tracking

```typescript
// MRR Calculation
const calculateMRR = () => {
  const activeSubscriptions = getActiveSubscriptions();
  
  const mrr = activeSubscriptions.reduce((total, sub) => {
    const monthlyValue = sub.plan === 'yearly' 
      ? sub.amount / 12 
      : sub.amount;
    return total + monthlyValue;
  }, 0);
  
  trackEvent('mrr_calculated', {
    value: mrr,
    subscriber_count: activeSubscriptions.length,
    date: new Date().toISOString()
  });
};

// Churn Rate Tracking
const trackChurn = (userId: string, reason?: string) => {
  const subscription = getSubscription(userId);
  const lifetimeValue = calculateLTV(subscription);
  
  trackEvent('subscription_churned', {
    user_id: userId,
    tenure_days: subscription.tenureDays,
    lifetime_value: lifetimeValue,
    churn_reason: reason,
    plan: subscription.plan
  });
};
```

### Price Elasticity Testing

```typescript
const priceTests = [
  { price: 7.99, conversion_rate: 0 },
  { price: 9.99, conversion_rate: 0 },
  { price: 12.99, conversion_rate: 0 },
  { price: 14.99, conversion_rate: 0 }
];

// Track price sensitivity
trackEvent('price_displayed', {
  price_point: selectedPrice,
  user_segment: getUserSegment(),
  shown_at: new Date().toISOString()
});

trackEvent('price_converted', {
  price_point: selectedPrice,
  time_to_convert: getTimeSinceFirstView()
});
```

## Feature Usage Analytics

### Premium Feature Adoption

```typescript
interface FeatureUsage {
  feature: string;
  usage_count: number;
  unique_users: number;
  premium_only: boolean;
  conversion_attribution: number; // % of conversions using this feature
}

// Track feature engagement
const trackFeatureUsage = (feature: string, isPremium: boolean) => {
  trackEvent('feature_used', {
    feature_name: feature,
    user_tier: isPremium ? 'premium' : 'free',
    session_features_used: getSessionFeatureCount(),
    timestamp: new Date().toISOString()
  });
};
```

## Dashboard Implementation

### Real-time Metrics Dashboard

```typescript
const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState({
    dau: 0,
    mau: 0,
    conversionRate: 0,
    mrr: 0,
    churnRate: 0
  });

  useEffect(() => {
    // Real-time updates via WebSocket
    const ws = new WebSocket('wss://metrics.dietwise.app');
    
    ws.on('metrics_update', (data) => {
      setMetrics(data);
    });

    return () => ws.close();
  }, []);

  return (
    <div className="metrics-grid">
      <MetricCard title="DAU" value={metrics.dau} />
      <MetricCard title="Conversion" value={`${metrics.conversionRate}%`} />
      <MetricCard title="MRR" value={`$${metrics.mrr}`} />
      <MetricCard title="Churn" value={`${metrics.churnRate}%`} />
    </div>
  );
};
```

## Reporting Queries

### SQL Analytics Queries

```sql
-- Daily Conversion Rate
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT CASE WHEN subscription_status = 'active' THEN user_id END) as premium_users,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN subscription_status = 'active' THEN user_id END) / COUNT(DISTINCT user_id), 2) as conversion_rate
FROM users
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Feature Usage by Tier
SELECT 
  feature_name,
  user_tier,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE event_name = 'feature_used'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY feature_name, user_tier
ORDER BY usage_count DESC;

-- Cohort Retention
SELECT 
  cohort_week,
  COUNT(DISTINCT user_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN days_since_signup >= 1 THEN user_id END) / COUNT(DISTINCT user_id) as d1_retention,
  COUNT(DISTINCT CASE WHEN days_since_signup >= 7 THEN user_id END) / COUNT(DISTINCT user_id) as d7_retention,
  COUNT(DISTINCT CASE WHEN days_since_signup >= 30 THEN user_id END) / COUNT(DISTINCT user_id) as d30_retention
FROM user_cohorts
GROUP BY cohort_week
ORDER BY cohort_week DESC;
```

## Optimization Recommendations

### Conversion Rate Optimization

1. **Test Timing**:
   - When to show first upgrade prompt
   - Frequency of prompts
   - Context-based vs time-based

2. **Message Testing**:
   - Value proposition messaging
   - Urgency/scarcity tactics
   - Social proof integration

3. **Pricing Experiments**:
   - Price points
   - Trial length
   - Discount strategies

### Retention Optimization

1. **Engagement Hooks**:
   - Push notification strategy
   - Email campaigns
   - In-app achievements

2. **Feature Stickiness**:
   - Identify high-retention features
   - Guide users to sticky features early
   - Remove friction from key workflows

## Alert Configuration

### Business Metric Alerts

```typescript
const alertThresholds = {
  conversion_rate_drop: {
    threshold: 0.8, // 20% drop
    period: 'day',
    action: 'email_team'
  },
  mrr_decline: {
    threshold: 0.95, // 5% drop
    period: 'week',
    action: 'slack_notification'
  },
  churn_spike: {
    threshold: 1.5, // 50% increase
    period: 'day',
    action: 'urgent_alert'
  }
};
```

## Privacy Considerations

### GDPR Compliance
- User consent for analytics
- Data anonymization
- Right to deletion
- Data export capabilities

### Analytics Best Practices
- No PII in event properties
- Use hashed user IDs
- Implement data retention policies
- Regular privacy audits