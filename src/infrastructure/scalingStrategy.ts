
interface ServerConfig { type: string; count: number; spec: string; region: string; }
interface DatabaseConfig { type: string; spec: string; storage: string; count?: number; memory?: string; }
interface CacheConfig { type: string; provider: string; size: string; bandwidth?: string; }
interface CDNConfig { provider: string; regions: string[]; }
interface MonitoringConfig { apm: string; logging: string; alerting: string; }

interface ScalingTier {
  name: string;
  user_range: [number, number];
  infrastructure: {
    servers: ServerConfig[];
    databases: DatabaseConfig[];
    caching: CacheConfig[];
    cdn: CDNConfig;
  };
  monitoring: MonitoringConfig;
  cost_estimate: number;
}

export const SCALING_TIERS: ScalingTier[] = [
  {
    name: 'Launch',
    user_range: [0, 10000],
    infrastructure: {
      servers: [
        { type: 'web', count: 2, spec: 't3.medium', region: 'us-east-1' },
        { type: 'api', count: 2, spec: 't3.medium', region: 'us-east-1' },
        { type: 'worker', count: 1, spec: 't3.small', region: 'us-east-1' },
      ],
      databases: [
        { type: 'primary', spec: 'db.t3.micro', storage: '100GB' },
        { type: 'redis', spec: 'cache.t3.micro', memory: '1GB', storage: 'memory' },
      ],
      caching: [
        { type: 'application', provider: 'Redis', size: '1GB' },
        { type: 'cdn', provider: 'CloudFlare', bandwidth: '1TB', size: 'N/A' },
      ],
      cdn: { provider: 'CloudFlare', regions: ['US'] },
    },
    monitoring: {
      apm: 'New Relic',
      logging: 'CloudWatch',
      alerting: 'PagerDuty',
    },
    cost_estimate: 2000, // per month
  },
  {
    name: 'Growth',
    user_range: [10000, 100000],
    infrastructure: {
      servers: [
        { type: 'web', count: 4, spec: 't3.large', region: 'multi' },
        { type: 'api', count: 6, spec: 't3.large', region: 'multi' },
        { type: 'worker', count: 3, spec: 't3.medium', region: 'multi' },
      ],
      databases: [
        { type: 'primary', spec: 'db.r5.large', storage: '500GB' },
        { type: 'read_replica', spec: 'db.r5.large', storage: '500GB' },
        { type: 'redis', spec: 'cache.r5.large', memory: '16GB', storage: 'memory' },
      ],
      caching: [
        { type: 'application', provider: 'Redis Cluster', size: '16GB' },
        { type: 'cdn', provider: 'CloudFlare', bandwidth: '10TB', size: 'N/A' },
      ],
      cdn: { provider: 'CloudFlare', regions: ['US', 'EU'] },
    },
    monitoring: {
      apm: 'New Relic',
      logging: 'ElasticSearch',
      alerting: 'PagerDuty',
    },
    cost_estimate: 8000,
  },
  {
    name: 'Scale', 
    user_range: [100000, 1000000],
    infrastructure: {
      servers: [
        { type: 'web', count: 10, spec: 'c5.xlarge', region: 'multi' },
        { type: 'api', count: 15, spec: 'c5.xlarge', region: 'multi' },
        { type: 'worker', count: 8, spec: 'c5.large', region: 'multi' },
        { type: 'ai_processing', count: 4, spec: 'p3.xlarge', region: 'multi' },
      ],
      databases: [
        { type: 'primary', spec: 'db.r5.2xlarge', storage: '2TB' },
        { type: 'read_replica', spec: 'db.r5.2xlarge', storage: '2TB', count: 3 },
        { type: 'redis', spec: 'cache.r5.2xlarge', memory: '64GB', storage: 'memory' },
        { type: 'analytics', spec: 'Redshift', storage: '5TB' },
      ],
      caching: [
        { type: 'application', provider: 'Redis Cluster', size: '64GB' },
        { type: 'cdn', provider: 'CloudFlare', bandwidth: '100TB', size: 'N/A' },
      ],
      cdn: { provider: 'CloudFlare', regions: ['Global'] },
    },
    monitoring: {
      apm: 'DataDog',
      logging: 'ElasticSearch Cluster',
      alerting: 'PagerDuty + Slack',
    },
    cost_estimate: 35000,
  },
];

interface PerformanceReport {
    timestamp: Date;
    metrics: any;
    sla_violations: string[];
    scaling_recommendations: ScalingRecommendation[];
    cost_optimization: CostOptimizationSuggestion[];
}

interface ScalingRecommendation {
    type: 'scale_up' | 'scale_out' | 'optimize';
    resource: string;
    reason: string;
    action: string;
    estimated_cost: number;
}
interface CostOptimizationSuggestion {
    area: string;
    suggestion: string;
    estimated_savings: number;
}


// Performance Monitoring System
export class PerformanceMonitor {
  private readonly SLA_TARGETS = {
    response_time_p95: 500, // ms
    response_time_p99: 1000, // ms
    uptime: 99.9, // %
    error_rate: 0.1, // %
  };

  async collectMetrics(): Promise<any> {
    // Placeholder for actual metrics collection
    return {
        cpu_utilization: Math.random() * 100,
        memory_utilization: Math.random() * 100,
        response_time_p95: Math.random() * 1200,
        response_time_p99: Math.random() * 2000,
        uptime: 99 + Math.random(),
        error_rate: Math.random() * 0.5,
        db_connections: Math.floor(Math.random() * 100),
        max_db_connections: 120,
        cache_hit_rate: 0.7 + Math.random() * 0.3,
    };
  }

  checkSLAViolations(metrics: any): string[] {
      const violations: string[] = [];
      if (metrics.response_time_p95 > this.SLA_TARGETS.response_time_p95) violations.push(`P95 Response Time High: ${metrics.response_time_p95.toFixed(0)}ms`);
      if (metrics.response_time_p99 > this.SLA_TARGETS.response_time_p99) violations.push(`P99 Response Time High: ${metrics.response_time_p99.toFixed(0)}ms`);
      if (metrics.uptime < this.SLA_TARGETS.uptime) violations.push(`Uptime Low: ${metrics.uptime.toFixed(2)}%`);
      if (metrics.error_rate > this.SLA_TARGETS.error_rate) violations.push(`Error Rate High: ${metrics.error_rate.toFixed(2)}%`);
      return violations;
  }

  async getCostOptimizations(metrics: any): Promise<CostOptimizationSuggestion[]> {
      const suggestions: CostOptimizationSuggestion[] = [];
      if (metrics.cpu_utilization < 20 && metrics.memory_utilization < 30) {
          suggestions.push({ area: "Server Fleet", suggestion: "Consider downsizing idle instances or consolidating workloads.", estimated_savings: 500 });
      }
      // Add more cost optimization logic here
      return suggestions;
  }
  
  async configureAutoScaling(policies: any): Promise<void> {
      console.log("Configuring auto-scaling policies:", policies);
      // Placeholder for actual cloud provider API calls
  }


  async monitorPerformance(): Promise<PerformanceReport> {
    const metrics = await this.collectMetrics();
    const alerts = this.checkSLAViolations(metrics);
    
    return {
      timestamp: new Date(),
      metrics,
      sla_violations: alerts,
      scaling_recommendations: await this.getScalingRecommendations(metrics),
      cost_optimization: await this.getCostOptimizations(metrics),
    };
  }

  private async getScalingRecommendations(metrics: any): Promise<ScalingRecommendation[]> {
    const recommendations: ScalingRecommendation[] = [];
    
    // CPU utilization scaling
    if (metrics.cpu_utilization > 80) {
      recommendations.push({
        type: 'scale_out', // Changed to scale_out as typically you add more instances
        resource: 'web_servers',
        reason: 'High CPU utilization',
        action: 'Add 2 more web servers',
        estimated_cost: 400,
      });
    }
    
    // Database performance scaling
    if (metrics.db_connections > 0.8 * metrics.max_db_connections) {
      recommendations.push({
        type: 'scale_up',
        resource: 'database',
        reason: 'High database connection usage',
        action: 'Upgrade to larger DB instance',
        estimated_cost: 1000,
      });
    }
    
    // Cache hit rate optimization
    if (metrics.cache_hit_rate < 0.85) {
      recommendations.push({
        type: 'optimize',
        resource: 'cache',
        reason: 'Low cache hit rate',
        action: 'Review caching strategy and increase cache size',
        estimated_cost: 200,
      });
    }
    
    return recommendations;
  }

  // Auto-scaling Implementation
  async implementAutoScaling(): Promise<void> {
    const autoScalingPolicies = {
      web_servers: {
        min_instances: 2,
        max_instances: 20,
        scale_up_threshold: { cpu: 70, requests: 1000 }, // Example metrics
        scale_down_threshold: { cpu: 30, requests: 200 },
        cooldown_period: 300, // seconds
      },
      api_servers: {
        min_instances: 2,
        max_instances: 30,
        scale_up_threshold: { cpu: 75, response_time: 500 }, // Example metrics
        scale_down_threshold: { cpu: 25, response_time: 200 },
        cooldown_period: 180,
      },
      workers: {
        min_instances: 1,
        max_instances: 10,
        scale_up_threshold: { queue_depth: 100 }, // Example metrics
        scale_down_threshold: { queue_depth: 10 },
        cooldown_period: 600,
      },
    };
    
    await this.configureAutoScaling(autoScalingPolicies);
  }
}
