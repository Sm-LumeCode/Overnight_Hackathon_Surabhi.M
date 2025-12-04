// utils/loanUtils.ts
export interface UserProfile {
  monthlyIncome: number;
  age: number;
  employmentType: 'salaried' | 'self-employed' | 'business' | 'unemployed';
  cityTier: 1 | 2 | 3;
  creditScore?: number;
  existingEMIs: number;
}

export interface LoanSuggestion {
  type: string;
  amount: number;
  tenure: number; // in months
  interestRate: number;
  emi: number;
  eligibility: 'high' | 'medium' | 'low';
}

export class LoanCalculator {
  // Calculate EMI
  static calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    const monthlyRate = annualRate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) /
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi);
  }

  // Calculate eligibility score (0-100)
  static calculateEligibilityScore(profile: UserProfile): number {
    let score = 0;
    
    // Income score (40 points)
    if (profile.monthlyIncome >= 100000) score += 40;
    else if (profile.monthlyIncome >= 50000) score += 30;
    else if (profile.monthlyIncome >= 25000) score += 20;
    else score += 10;
    
    // Age score (25 points)
    if (profile.age >= 28 && profile.age <= 45) score += 25;
    else if (profile.age >= 25 && profile.age <= 50) score += 20;
    else if (profile.age >= 22 && profile.age <= 60) score += 15;
    else score += 5;
    
    // Employment score (20 points)
    if (profile.employmentType === 'salaried') score += 20;
    else if (profile.employmentType === 'business') score += 15;
    else if (profile.employmentType === 'self-employed') score += 10;
    else score += 5;
    
    // City tier score (10 points)
    score += (4 - profile.cityTier) * 3.33; // Tier 1: 10, Tier 2: 6.67, Tier 3: 3.33
    
    // Credit score (5 points)
    if (profile.creditScore && profile.creditScore >= 750) score += 5;
    else if (profile.creditScore && profile.creditScore >= 650) score += 3;
    
    return Math.min(score, 100);
  }

  // Get loan suggestions based on profile
  static getLoanSuggestions(profile: UserProfile): LoanSuggestion[] {
    const score = this.calculateEligibilityScore(profile);
    const suggestions: LoanSuggestion[] = [];
    
    // Maximum loan amount (based on income)
    const maxLoanMultiplier = score >= 70 ? 24 : score >= 50 ? 18 : 12;
    const maxLoanAmount = profile.monthlyIncome * maxLoanMultiplier;
    
    if (score >= 50) {
      // Personal Loan
      suggestions.push({
        type: 'Personal Loan',
        amount: Math.min(maxLoanAmount * 0.5, 2000000),
        tenure: 60,
        interestRate: score >= 70 ? 10.5 : 14.5,
        emi: 0,
        eligibility: score >= 70 ? 'high' : 'medium'
      });
      
      // Car Loan
      suggestions.push({
        type: 'Car Loan',
        amount: Math.min(maxLoanAmount * 0.7, 5000000),
        tenure: 84,
        interestRate: score >= 70 ? 8.7 : 11.5,
        emi: 0,
        eligibility: score >= 70 ? 'high' : 'medium'
      });
    }
    
    if (score >= 70) {
      // Home Loan
      suggestions.push({
        type: 'Home Loan',
        amount: Math.min(maxLoanAmount * 3, 20000000),
        tenure: 240,
        interestRate: 8.4,
        emi: 0,
        eligibility: 'high'
      });
    }
    
    // Calculate EMI for each suggestion
    suggestions.forEach(suggestion => {
      suggestion.emi = this.calculateEMI(
        suggestion.amount,
        suggestion.interestRate,
        suggestion.tenure
      );
    });
    
    return suggestions;
  }

  // Get required documents based on loan type
  static getRequiredDocuments(loanType: string): string[] {
    const commonDocs = [
      'Aadhaar Card',
      'PAN Card',
      'Passport-size photographs',
      'Address proof (Aadhaar, utility bill, passport)'
    ];
    
    const loanSpecificDocs: Record<string, string[]> = {
      'Personal Loan': [
        'Salary slips (last 3 months)',
        'Bank statements (last 6 months)',
        'Employment certificate'
      ],
      'Home Loan': [
        'Property documents',
        'Sale agreement',
        'NOC from builder',
        'ITR (last 2-3 years)',
        'Salary slips (last 6 months)'
      ],
      'Car Loan': [
        'Car quotation',
        'Driver\'s license',
        'Salary slips (last 3 months)',
        'Bank statements (last 3 months)'
      ],
      'Education Loan': [
        'Admission letter',
        'Fee structure',
        'Academic records',
        'Co-borrower documents'
      ]
    };
    
    return [...commonDocs, ...(loanSpecificDocs[loanType] || [])];
  }

  // Format currency for display
  static formatCurrency(amount: number): string {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  }

  // Get bank recommendations
  static getBankRecommendations(loanType: string): Array<{
    name: string;
    interestRate: string;
    processingFee: string;
    features: string[];
  }> {
    const recommendations: Record<string, any[]> = {
      'Personal Loan': [
        {
          name: 'HDFC Bank',
          interestRate: '10.5% - 21%',
          processingFee: '2%',
          features: ['Instant approval', 'No collateral', 'Flexible tenure']
        },
        {
          name: 'ICICI Bank',
          interestRate: '10.75% - 19%',
          processingFee: '2.25%',
          features: ['Quick disbursal', 'Online process', 'Low interest for high credit score']
        },
        {
          name: 'SBI',
          interestRate: '11.15% - 16%',
          processingFee: '1.5%',
          features: ['Lowest processing fee', 'Government bank', 'Transparent charges']
        }
      ],
      'Home Loan': [
        {
          name: 'SBI',
          interestRate: '8.4% - 9.65%',
          processingFee: '0.4%',
          features: ['Lowest interest', 'Long tenure (30 years)', 'Balance transfer']
        },
        {
          name: 'HDFC',
          interestRate: '8.45% - 9.35%',
          processingFee: '0.5%',
          features: ['Quick processing', 'Online application', 'Good customer service']
        }
      ]
    };
    
    return recommendations[loanType] || recommendations['Personal Loan'];
  }
}