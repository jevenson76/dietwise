
interface Intervention {
  type: 'automated' | 'personal' | 'educational' | 'incentive';
  action: string;
  timing: string;
  success_probability: number;
}

interface UserHealthScore {
  overall_score: number; // 0-100
  component_scores: {
    engagement: number;
    feature_adoption: number;
    goal_progress: number;
    support_satisfaction: number;
    social_engagement: number;
  };
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  predicted_churn_probability: number;
  recommended_interventions: Intervention[];
}

// Dummy service placeholders - in a real app, these would be proper services or modules
const emailService = { sendDripCampaign: async (userId: string, campaign: string) => console.log(`Email drip ${campaign} to ${userId}`) };
const notificationService = { scheduleInAppNotification: async (userId: string, type: string) => console.log(`In-app notification ${type} to ${userId}`) };
const pushService = { sendNotification: async (userId: string, type: string) => console.log(`Push notification ${type} to ${userId}`) };


export class PredictiveHealthScoreEngine {
  async getUserData(userId: string): Promise<any> { /* Placeholder */ return { id: userId, name: `User ${userId}`, goalWeight: 150, currentWeight: 160, last_active: new Date() }; }
  async getUsageMetrics(userId: string): Promise<any> { /* Placeholder */ return { sessionsLast7Days: 5, featuresUsed: ['log', 'scan', 'ideas'], socialShares: 2 }; }
  async getFeedbackData(userId: string): Promise<any> { /* Placeholder */ return { supportTickets: [{ status: 'resolved', satisfaction: 0.8 }] }; }

  private calculateEngagementScore(usage: any): number { return Math.min(100, (usage.sessionsLast7Days / 7) * 100 + usage.socialShares * 5); }
  private calculateFeatureAdoptionScore(usage: any): number { return Math.min(100, (usage.featuresUsed.length / 5) * 100); } // Assuming 5 key features
  private calculateGoalProgressScore(user: any): number { 
      if (!user.goalWeight || !user.currentWeight || user.goalWeight === user.currentWeight) return 50; // Neutral or no goal
      const initialDiff = user.startWeight ? Math.abs(user.startWeight - user.goalWeight) : Math.abs(user.currentWeight + 10 - user.goalWeight); // Simulating a start weight
      if (initialDiff === 0) return 100;
      const currentDiff = Math.abs(user.currentWeight - user.goalWeight);
      return Math.max(0, Math.min(100, (1 - currentDiff / initialDiff) * 100));
  }
  private calculateSupportScore(feedback: any): number {
      if (!feedback.supportTickets || feedback.supportTickets.length === 0) return 80; // No issues is good
      const avgSatisfaction = feedback.supportTickets.reduce((acc: number, curr: any) => acc + (curr.satisfaction || 0.5), 0) / feedback.supportTickets.length;
      return avgSatisfaction * 100;
  }
  private calculateSocialScore(usage: any): number { return Math.min(100, usage.socialShares * 20); }

  private weightedAverage(scores: Record<string, number>, weights: Record<string, number>): number {
      let totalScore = 0;
      let totalWeight = 0;
      for (const key in scores) {
          if (weights[key]) {
              totalScore += scores[key] * weights[key];
              totalWeight += weights[key];
          }
      }
      return totalWeight > 0 ? totalScore / totalWeight : 50; // Default to 50 if no weights/scores
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
      if (score >= 80) return 'low';
      if (score >= 60) return 'medium';
      if (score >= 40) return 'high';
      return 'critical';
  }

  private predictChurnProbability(scores: any): number { 
      // Very simple model placeholder
      const baseChurn = 0.1;
      let churn = baseChurn - (scores.engagement / 1000) - (scores.goal_progress / 1000) + ((100 - scores.support_satisfaction) / 500);
      return Math.max(0.01, Math.min(0.99, parseFloat(churn.toFixed(2))));
  }

  async calculateHealthScore(userId: string): Promise<UserHealthScore> {
    const user = await this.getUserData(userId);
    const usage = await this.getUsageMetrics(userId);
    const feedback = await this.getFeedbackData(userId);
    
    const componentScores = {
      engagement: this.calculateEngagementScore(usage),
      feature_adoption: this.calculateFeatureAdoptionScore(usage),
      goal_progress: this.calculateGoalProgressScore(user),
      support_satisfaction: this.calculateSupportScore(feedback),
      social_engagement: this.calculateSocialScore(usage),
    };
    
    const overallScore = this.weightedAverage(componentScores, {
      engagement: 0.3,
      feature_adoption: 0.25,
      goal_progress: 0.25,
      support_satisfaction: 0.1,
      social_engagement: 0.1,
    });
    
    return {
      overall_score: parseFloat(overallScore.toFixed(1)),
      component_scores: componentScores,
      risk_level: this.determineRiskLevel(overallScore),
      predicted_churn_probability: this.predictChurnProbability(componentScores),
      recommended_interventions: await this.generateInterventions(componentScores, user),
    };
  }

  private async generateInterventions(scores: any, user: any): Promise<Intervention[]> {
    const interventions: Intervention[] = [];
    
    if (scores.engagement < 50) {
      interventions.push({
        type: 'automated',
        action: 'Send re-engagement email series',
        timing: 'immediate',
        success_probability: 0.35,
      });
      
      if (scores.engagement < 30) {
        interventions.push({
          type: 'personal',
          action: 'Personal outreach from customer success',
          timing: 'within_24_hours',
          success_probability: 0.65,
        });
      }
    }
    
    if (scores.feature_adoption < 40) {
      interventions.push({
        type: 'educational',
        action: 'Send feature tutorial videos',
        timing: 'next_login',
        success_probability: 0.45,
      });
    }
    
    if (scores.goal_progress < 30 && user.goalWeight) { // Only if a goal is set
      interventions.push({
        type: 'personal',
        action: 'Offer free nutrition consultation',
        timing: 'within_48_hours',
        success_probability: 0.70,
      });
       interventions.push({
        type: 'incentive',
        action: 'Offer 1 month premium for logging 7 consecutive days',
        timing: 'after_2_days_inactivity',
        success_probability: 0.25,
      });
    }
    
    return interventions;
  }

  // Automated Intervention Execution
  async executeInterventions(userId: string, interventions: Intervention[]): Promise<void> {
    for (const intervention of interventions) {
      switch (intervention.type) {
        case 'automated':
          await this.executeAutomatedIntervention(userId, intervention);
          break;
        case 'personal':
          await this.schedulePersonalIntervention(userId, intervention);
          break;
        case 'educational':
          await this.sendEducationalContent(userId, intervention);
          break;
        case 'incentive':
          await this.provideIncentive(userId, intervention);
          break;
      }
      await this.trackInterventionExecution(userId, intervention);
    }
  }

  private async executeAutomatedIntervention(userId: string, intervention: Intervention): Promise<void> {
    const automatedActions: Record<string, () => Promise<void>> = {
      'Send re-engagement email series': async () => {
        await emailService.sendDripCampaign(userId, 're_engagement_series');
      },
      'Show feature discovery popup': async () => {
        await notificationService.scheduleInAppNotification(userId, 'feature_discovery');
      },
      'Send push notification reminder': async () => {
        await pushService.sendNotification(userId, 'daily_reminder');
      },
    };
    
    const action = automatedActions[intervention.action];
    if (action) await action();
    else console.warn(`Automated action ${intervention.action} not implemented.`);
  }
  private async schedulePersonalIntervention(userId: string, intervention: Intervention): Promise<void> { /* Placeholder */ console.log(`Personal intervention: ${intervention.action} for ${userId} scheduled for ${intervention.timing}.`); }
  private async sendEducationalContent(userId: string, intervention: Intervention): Promise<void> { /* Placeholder */ console.log(`Educational content: ${intervention.action} for ${userId} to be sent on ${intervention.timing}.`); }
  private async provideIncentive(userId: string, intervention: Intervention): Promise<void> { /* Placeholder */ console.log(`Incentive: ${intervention.action} for ${userId} to be provided based on ${intervention.timing}.`); }
  private async trackInterventionExecution(userId: string, intervention: Intervention): Promise<void> { /* Placeholder */ console.log(`Intervention ${intervention.action} tracked for ${userId}.`); }

}

interface AtRiskUser {
    user_id: string;
    name: string;
    email: string;
    health_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    churn_probability: number;
    recommended_actions: Intervention[];
    last_activity: Date;
}

interface CustomerSuccessMetrics {
    health_score_distribution: any;
    at_risk_users: AtRiskUser[];
    intervention_effectiveness: any;
    success_stories: any;
    team_performance: any;
}

// Global instance for the dashboard to use
const healthScoreEngine = new PredictiveHealthScoreEngine();

// Proactive Customer Success Dashboard
export class CustomerSuccessDashboard {
  async getAllUsers(): Promise<Array<{id: string, name: string, email: string, last_active: Date}>> { 
      // Placeholder: In a real app, this would fetch from a database.
      return Array.from({length: 5}, (_, i) => ({ id: `user${i+1}`, name: `Test User ${i+1}`, email: `test${i+1}@example.com`, last_active: new Date(Date.now() - Math.random() * 10*24*60*60*1000)}));
  }
  async getHealthScoreDistribution(): Promise<any> { /* Placeholder */ return { low: 50, medium: 30, high: 15, critical: 5 }; }
  async getInterventionMetrics(): Promise<any> { /* Placeholder */ return { success_rate: 0.45, types_used: { automated: 100, personal: 20 } }; }
  async getSuccessStories(): Promise<any> { /* Placeholder */ return [{ userId: 'userX', story: 'Lost 20lbs!' }]; }
  async getTeamMetrics(): Promise<any> { /* Placeholder */ return { outreach_count: 50, resolution_time_avg: '2h' }; }


  async getDashboardData(): Promise<CustomerSuccessMetrics> {
    return {
      health_score_distribution: await this.getHealthScoreDistribution(),
      at_risk_users: await this.getAtRiskUsers(),
      intervention_effectiveness: await this.getInterventionMetrics(),
      success_stories: await this.getSuccessStories(),
      team_performance: await this.getTeamMetrics(),
    };
  }

  private async getAtRiskUsers(): Promise<AtRiskUser[]> {
    const users = await this.getAllUsers();
    const atRiskUsers: AtRiskUser[] = [];
    
    for (const user of users) {
      const healthScore = await healthScoreEngine.calculateHealthScore(user.id); // Use the global/instantiated engine
      
      if (healthScore.risk_level === 'high' || healthScore.risk_level === 'critical') {
        atRiskUsers.push({
          user_id: user.id,
          name: user.name,
          email: user.email,
          health_score: healthScore.overall_score,
          risk_level: healthScore.risk_level,
          churn_probability: healthScore.predicted_churn_probability,
          recommended_actions: healthScore.recommended_interventions,
          last_activity: user.last_active,
        });
      }
    }
    
    return atRiskUsers.sort((a, b) => b.churn_probability - a.churn_probability);
  }
}
