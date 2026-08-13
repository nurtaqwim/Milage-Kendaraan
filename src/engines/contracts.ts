import type {
  AuditEvent,
  ClaimMileageGuardrail,
  Decision,
  DocumentScanResult,
  MileageBandCode,
  PremiumBreakdown,
  QuoteForm,
  RiskAssessment,
  UsageEstimate
} from '../domain/types';

export interface EngineRequestContext {
  correlationId: string;
  quoteId: string;
  requestedAt: string;
  productVersion: string;
}

export interface VehicleDocumentResult {
  status: 'SUCCESS' | 'REVIEW';
  confidence: number;
  extracted: Partial<QuoteForm['vehicle']>;
  reasons: string[];
}

export interface IdentityVerificationResult {
  status: 'SUCCESS' | 'REVIEW';
  confidence: number;
  matchFields: string[];
  reviewReasons: string[];
}

export interface PaymentAuthorizationResult {
  status: 'AUTHORIZED' | 'DECLINED' | 'REVIEW';
  transactionId: string;
  tokenReference?: string;
}

export interface PolicyIssueResult {
  status: 'ISSUED' | 'PENDING_REVIEW';
  policyNumber?: string;
  endorsementNumber?: string;
}

export interface NotificationRequest {
  template: 'MILEAGE_75' | 'MILEAGE_90' | 'OVER_MILEAGE' | 'AUTO_UPGRADE_NOTICE' | 'RECONCILIATION_DUE';
  channels: Array<'WHATSAPP' | 'EMAIL' | 'APP'>;
  scheduledAt?: string;
  variables: Record<string, string | number>;
}


export interface GeoRiskResult {
  status: 'SUCCESS' | 'REVIEW';
  hazardSignals: Array<{ code: string; level: 'LOW' | 'MEDIUM' | 'HIGH'; explanation: string }>;
  dataVersion: string;
}

export interface FraudSignalResult {
  status: 'CLEAR' | 'REVIEW';
  signals: Array<{ code: string; severity: 'INFO' | 'WARN' | 'HIGH'; explanation: string }>;
  automaticDeclineAllowed: false;
}

export interface ConsentRecordResult {
  consentId: string;
  status: 'ACTIVE' | 'REVOKED';
  purpose: string;
  policyVersion: string;
  recordedAt: string;
}

export interface OptimizationResult {
  action: 'NO_ACTION' | 'REMIND' | 'TOP_UP' | 'REFER';
  recommendedTopUpCode?: 'T1' | 'T3' | 'T5' | 'T10';
  explanation: string;
  confidence: number;
}

export interface MileageEnginePort {
  forecast(form: QuoteForm, context: EngineRequestContext): Promise<UsageEstimate>;
}

export interface EvidenceEnginePort {
  verifyOdometer(input: { file: File; manualValue: number }, context: EngineRequestContext): Promise<DocumentScanResult>;
  parseVehicleDocument(file: File, context: EngineRequestContext): Promise<VehicleDocumentResult>;
}

export interface RiskEnginePort {
  assess(form: QuoteForm, usage: UsageEstimate, context: EngineRequestContext): Promise<RiskAssessment>;
  decide(form: QuoteForm, usage: UsageEstimate, context: EngineRequestContext): Promise<Decision>;
}

export interface RatingEnginePort {
  quoteBand(form: QuoteForm, band: MileageBandCode, context: EngineRequestContext): Promise<PremiumBreakdown>;
  quoteUpgrade(input: { form: QuoteForm; fromQuotaKm: number; toQuotaKm: number }, context: EngineRequestContext): Promise<{ premiumDifference: number | null; parityCheck: boolean }>;
}

export interface IdentityEnginePort {
  verify(form: QuoteForm, file: File, context: EngineRequestContext): Promise<IdentityVerificationResult>;
}

export interface PaymentEnginePort {
  authorize(input: { amount: number; method: QuoteForm['paymentMethod']; allowTokenization: boolean }, context: EngineRequestContext): Promise<PaymentAuthorizationResult>;
  capture(transactionId: string, context: EngineRequestContext): Promise<PaymentAuthorizationResult>;
}

export interface PolicyAdminEnginePort {
  issue(form: QuoteForm, context: EngineRequestContext): Promise<PolicyIssueResult>;
  endorseMileage(input: { policyNumber: string; targetQuotaKm: number; premiumDifference: number }, context: EngineRequestContext): Promise<PolicyIssueResult>;
}

export interface NotificationEnginePort {
  send(request: NotificationRequest, context: EngineRequestContext): Promise<{ messageId: string; status: 'QUEUED' | 'SENT' }>;
}

export interface ClaimsGuardrailEnginePort {
  evaluate(input: { usedKm: number; totalQuotaKm: number; toleranceKm: number; tamperFlag: boolean }, context: EngineRequestContext): Promise<ClaimMileageGuardrail>;
}

export interface AuditSinkPort {
  append(event: AuditEvent, context: EngineRequestContext): Promise<void>;
}


export interface GeoRiskEnginePort {
  enrich(input: { region: string; parking: string; vehicleUse: QuoteForm['vehicle']['vehicleUse'] }, context: EngineRequestContext): Promise<GeoRiskResult>;
}

export interface FraudSignalEnginePort {
  evaluate(input: { form: QuoteForm; documentFingerprints: string[]; deviceReference?: string }, context: EngineRequestContext): Promise<FraudSignalResult>;
}

export interface ConsentRegistryPort {
  record(input: { purpose: string; policyVersion: string; granted: boolean }, context: EngineRequestContext): Promise<ConsentRecordResult>;
  revoke(consentId: string, context: EngineRequestContext): Promise<ConsentRecordResult>;
}

export interface OptimizationEnginePort {
  recommendTopUp(input: { currentQuotaKm: number; usedKm: number; projectedPolicyKm: number }, context: EngineRequestContext): Promise<OptimizationResult>;
}

export interface EngineGateway {
  mileage: MileageEnginePort;
  evidence: EvidenceEnginePort;
  risk: RiskEnginePort;
  rating: RatingEnginePort;
  identity: IdentityEnginePort;
  payment: PaymentEnginePort;
  policyAdmin: PolicyAdminEnginePort;
  notification: NotificationEnginePort;
  claimsGuardrail: ClaimsGuardrailEnginePort;
  audit: AuditSinkPort;
  geoRisk?: GeoRiskEnginePort;
  fraudSignals?: FraudSignalEnginePort;
  consentRegistry?: ConsentRegistryPort;
  optimization?: OptimizationEnginePort;
}
