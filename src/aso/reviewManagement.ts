import { trackEvent } from "@services/analyticsService";

export interface ReviewPromptMetrics {
    completedFirstWeek: boolean;
    achievedWeightMilestone: boolean;
    logged30Meals: boolean;
    foodLogStreak7Days: boolean;
}

export class ReviewManagementSystem {
  // REVIEW_REQUEST_TRIGGERS are conceptual, logic implemented in shouldRequestReview
  
  async shouldRequestReview(
    userId: string, // For potential future use (e.g., fetching user-specific suppression flags)
    metrics: ReviewPromptMetrics,
    lastPromptDate: string | null,
    hasGivenFeedback: boolean
  ): Promise<boolean> {
    
    if (hasGivenFeedback) {
      trackEvent('review_prompt_skipped_already_gave_feedback', { userId });
      return false; // User has already given feedback through the internal system
    }

    if (lastPromptDate) {
      const daysSinceLastPrompt = (new Date().getTime() - new Date(lastPromptDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastPrompt < 30) { // Don't prompt more than once every 30 days
        trackEvent('review_prompt_skipped_prompted_recently', { userId, daysSinceLastPrompt });
        return false;
      }
    }

    // Check for positive triggers
    if (metrics.achievedWeightMilestone) {
      trackEvent('review_prompt_triggered_weight_milestone', { userId });
      return true;
    }
    if (metrics.foodLogStreak7Days) {
      trackEvent('review_prompt_triggered_7day_streak', { userId });
      return true;
    }
    if (metrics.logged30Meals) {
      trackEvent('review_prompt_triggered_30_meals_logged', { userId });
      return true;
    }
     if (metrics.completedFirstWeek) {
      trackEvent('review_prompt_triggered_first_week', { userId });
      return true;
    }

    trackEvent('review_prompt_no_trigger_met', { userId, metrics });
    return false;
  }

  // Placeholder methods from original file, adapted or kept for conceptual structure
  async submitReviewResponse(reviewId: string, response: string): Promise<void> {
    console.log(`Submitting response for review ${reviewId}: ${response}`);
    trackEvent('review_response_submitted_placeholder', { reviewId });
  }

  async createInternalTicket(ticketData: any): Promise<void> {
    console.log("Creating internal ticket:", ticketData);
    trackEvent('internal_feedback_ticket_created_placeholder', ticketData);
  }

  async sendPersonalFollowUp(email: string): Promise<void> {
    console.log(`Sending personal follow-up to ${email}`);
    trackEvent('personal_follow_up_sent_placeholder', { email });
  }
  
  extractIssues(content: string): string[] {
    if (content.toLowerCase().includes("bug") || content.toLowerCase().includes("crash")) {
        return ["Technical Issue Reported"];
    }
    if (content.toLowerCase().includes("feature") || content.toLowerCase().includes("suggest")) {
        return ["Feature Request"];
    }
    return ["General Feedback"];
  }
  
  categorizeReview(content: string): 'technical_issue' | 'feature_request' | 'general_negative' {
     if (content.toLowerCase().includes("bug") || content.toLowerCase().includes("crash") || content.toLowerCase().includes("error")) {
        return "technical_issue";
    }
    if (content.toLowerCase().includes("feature") || content.toLowerCase().includes("suggest") || content.toLowerCase().includes("idea")) {
        return "feature_request";
    }
    return "general_negative";
  }

  async handleNegativeReview(reviewData: { reviewId: string, content: string, rating: number, userEmail?: string }): Promise<void> {
    const response = this.generateReviewResponse(reviewData);
    await this.submitReviewResponse(reviewData.reviewId, response);
    
    await this.createInternalTicket({
      type: 'negative_review',
      review_content: reviewData.content,
      user_rating: reviewData.rating,
      suggested_improvements: this.extractIssues(reviewData.content),
    });
    
    if (reviewData.userEmail) {
      await this.sendPersonalFollowUp(reviewData.userEmail);
    }
    trackEvent('negative_review_handled_placeholder', { rating: reviewData.rating });
  }

  private generateReviewResponse(reviewData: {content: string}): string {
    const templates = {
      technical_issue: `Thank you for your feedback! We're sorry you experienced technical issues. Our team is working on improvements, and we'd love to help resolve this personally. Please contact us at support@dietwise.app with details about the issue.`,
      feature_request: `Thanks for the suggestion! We're always looking to improve DietWise based on user feedback. This feature request has been added to our development roadmap. Follow us for updates!`,
      general_negative: `We appreciate your honest feedback and apologize that DietWise didn't meet your expectations. We'd love the opportunity to make this right - please reach out to our support team so we can help improve your experience.`,
    };
    
    const category = this.categorizeReview(reviewData.content);
    return templates[category] || templates.general_negative;
  }
}