import type { Decision, QuoteComparison, QuoteForm, RiskAssessment, UsageEstimate } from '../domain/types';
import { evaluateEligibility } from './eligibilityEngine';
import { estimateUsage } from './mileageEngine';
import { calculateQuoteComparison } from './pricingEngine';
import { assessRiskContext } from './riskContextEngine';

export interface QuoteIntelligenceSnapshot {
  generatedAt: string;
  adapter: 'LOCAL_PROTOTYPE';
  versions: {
    mileage: string;
    eligibility: string;
    pricing: string;
    risk: string;
  };
  usage: UsageEstimate;
  decision: Decision;
  risk: RiskAssessment;
  quote: QuoteComparison;
}

/**
 * Satu titik orkestrasi untuk seluruh hasil intelligence pada quote.
 * Saat engine production tersedia, UI cukup mengganti implementasi fungsi ini
 * dengan adapter API/gateway tanpa membongkar flow per screen.
 */
export function buildQuoteIntelligence(form: QuoteForm): QuoteIntelligenceSnapshot {
  const usage = estimateUsage(form);
  const expectedBand = usage.recommendedBand ?? 'M30';
  return {
    generatedAt: new Date().toISOString(),
    adapter: 'LOCAL_PROTOTYPE',
    versions: {
      mileage: 'mileage-local-1.1',
      eligibility: 'eligibility-local-1.1',
      pricing: 'pricing-mock-1.1',
      risk: 'risk-context-local-1.0'
    },
    usage,
    decision: evaluateEligibility(form, usage),
    risk: assessRiskContext(form, usage),
    quote: calculateQuoteComparison(form, expectedBand)
  };
}
