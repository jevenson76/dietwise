
interface CorporateWellnessPackage {
  tier: 'starter' | 'professional' | 'enterprise';
  features: string[];
  pricing: {
    per_employee_monthly: number;
    minimum_employees: number;
    setup_fee: number;
  };
  customization: string[];
}

export const CORPORATE_PACKAGES: CorporateWellnessPackage[] = [
  {
    tier: 'starter',
    features: [
      'Team challenges and leaderboards',
      'Aggregate wellness reporting',
      'Bulk user management',
      'Basic custom branding',
    ],
    pricing: {
      per_employee_monthly: 8,
      minimum_employees: 50,
      setup_fee: 1000,
    },
    customization: ['Company logo', 'Color scheme'],
  },
  {
    tier: 'professional', 
    features: [
      'All Starter features',
      'Advanced analytics dashboard',
      'Integration with HR systems',
      'Nutrition seminars and webinars',
      'Dedicated customer success manager',
    ],
    pricing: {
      per_employee_monthly: 15,
      minimum_employees: 100,
      setup_fee: 2500,
    },
    customization: ['Full white-labeling', 'Custom challenges', 'Company-specific content'],
  },
  {
    tier: 'enterprise',
    features: [
      'All Professional features',
      'Custom API integrations',
      'On-premise deployment options',
      'Advanced security and compliance',
      'Dedicated nutrition consultants',
    ],
    pricing: {
      per_employee_monthly: 25,
      minimum_employees: 500,
      setup_fee: 10000,
    },
    customization: ['Complete platform customization', 'Custom feature development'],
  },
];

interface ROIProjection {
    annual_investment: number;
    projected_benefits: number;
    roi_percentage: number;
    payback_period_months: number;
}

interface CorporateProposal {
    company: string;
    recommended_package: CorporateWellnessPackage;
    pricing: any; // Simplified
    roi_projection: ROIProjection;
    implementation_timeline: string;
    success_metrics: string[];
}

// Corporate Sales Pipeline
export class CorporateWellnessManager {

  recommendPackage(companyData: any): CorporateWellnessPackage {
      if (companyData.employee_count >= 500 && companyData.needs_custom_integration) {
          return CORPORATE_PACKAGES.find(p => p.tier === 'enterprise')!;
      }
      if (companyData.employee_count >= 100) {
          return CORPORATE_PACKAGES.find(p => p.tier === 'professional')!;
      }
      return CORPORATE_PACKAGES.find(p => p.tier === 'starter')!;
  }

  async calculateCustomPricing(companyData: any, packageInfo: CorporateWellnessPackage): Promise<any> {
      // Placeholder
      let finalPrice = packageInfo.pricing.per_employee_monthly;
      if (companyData.employee_count > 1000) finalPrice *= 0.9; // Volume discount
      return { ...packageInfo.pricing, per_employee_monthly: finalPrice };
  }

  createImplementationPlan(companyData: any): string {
      return `Phase 1 (Kick-off & Setup): 1 week. Phase 2 (Onboarding & Training): 2 weeks for ${companyData.employee_count} employees. Phase 3 (Launch & Monitoring): Ongoing.`;
  }

  defineSuccessMetrics(companyData: any): string[] {
      return [`Achieve ${companyData.target_engagement_rate || 70}% employee engagement within 3 months.`, `Demonstrate a ${companyData.health_improvement_target || 5}% improvement in aggregate health scores.`];
  }

  async generateCorporateProposal(companyData: any): Promise<CorporateProposal> {
    const packageRecommendation = this.recommendPackage(companyData);
    const customPricing = await this.calculateCustomPricing(companyData, packageRecommendation);

    return {
      company: companyData.name,
      recommended_package: packageRecommendation,
      pricing: customPricing,
      roi_projection: this.calculateROI(companyData, packageRecommendation),
      implementation_timeline: this.createImplementationPlan(companyData),
      success_metrics: this.defineSuccessMetrics(companyData),
    };
  }

  private calculateROI(companyData: any, pkg: CorporateWellnessPackage): ROIProjection {
    const employeeCount = companyData.employee_count;
    // Use the custom price if available, otherwise the base package price
    const perEmployeeMonthly = companyData.customPricing?.per_employee_monthly || pkg.pricing.per_employee_monthly;
    const annualCost = perEmployeeMonthly * 12 * employeeCount + pkg.pricing.setup_fee;

    // Industry average wellness ROI calculations
    const reducedHealthcareCosts = employeeCount * (companyData.avg_healthcare_cost_reduction_per_employee || 500); 
    const improvedProductivity = employeeCount * (companyData.avg_productivity_gain_per_employee || 1200); 
    const reducedAbsenteeism = employeeCount * (companyData.avg_absenteeism_reduction_value_per_employee || 800);

    const totalBenefits = reducedHealthcareCosts + improvedProductivity + reducedAbsenteeism;
    const roi = annualCost > 0 ? ((totalBenefits - annualCost) / annualCost) * 100 : 0; // Avoid division by zero
    const payback_period_months = totalBenefits > 0 ? Math.ceil((annualCost / totalBenefits) * 12) : Infinity; // Avoid division by zero

    return {
      annual_investment: annualCost,
      projected_benefits: totalBenefits,
      roi_percentage: parseFloat(roi.toFixed(2)),
      payback_period_months,
    };
  }
}
