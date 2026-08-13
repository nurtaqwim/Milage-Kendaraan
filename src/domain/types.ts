export type MileageBandCode = 'M5' | 'M10' | 'M15' | 'M20' | 'M30';
export type TopUpCode = 'T1' | 'T3' | 'T5' | 'T10';
export type CoverageType = 'COMPREHENSIVE' | 'TLO';
export type PurchaseMode = 'STARTER_TOPUP' | 'ANNUAL_BAND';
export type UpgradeMode = 'MANUAL' | 'AUTO';
export type CustomerType = 'PERSONAL' | 'COMPANY';
export type NotificationChannel = 'WHATSAPP' | 'EMAIL' | 'APP';
export type DecisionStatus = 'PASS' | 'WARN' | 'REFER' | 'BLOCK';
export type EngineStatus = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'MISMATCH' | 'REVIEW';

export interface MileageBand {
  code: MileageBandCode;
  limitKm: number;
  label: string;
  customerLabel: string;
  variablePremium: Record<CoverageType, number>;
}

export interface TopUpPack {
  code: TopUpCode;
  incrementKm: number;
  label: string;
}

export interface AddOn {
  id: string;
  title: string;
  description: string;
  premium: number;
}

export interface RuleReason {
  code: string;
  title: string;
  detail: string;
  status: DecisionStatus;
}

export interface Decision {
  status: DecisionStatus;
  score?: number;
  reasons: RuleReason[];
}

export interface DocumentQualityCheck {
  id: 'sharpness' | 'glare' | 'framing' | 'metadata' | 'tamper';
  label: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

export interface DocumentScanResult {
  status: EngineStatus;
  extractedValue?: number;
  confidence?: number;
  qualityChecks: DocumentQualityCheck[];
  reviewReason?: string;
}

export interface UsageEstimate {
  annualKm: number;
  lowerKm: number;
  upperKm: number;
  weeklyKm: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedBand: MileageBandCode | null;
  method: string;
}

export interface PremiumBreakdown {
  baseRiskPremium: number;
  mileagePremium: number;
  ageLoading: number;
  addOnPremium: number;
  administrationFee: number;
  total: number;
}

export interface QuoteComparison {
  upfront: PremiumBreakdown;
  expectedAnnual: PremiumBreakdown;
  currentBand: MileageBandCode;
  expectedBand: MileageBandCode;
}

export interface VehicleData {
  plate: string;
  chassisNumber: string;
  engineNumber: string;
  brand: string;
  model: string;
  year: string;
  sumInsured: string;
  region: string;
  coverage: CoverageType;
  policyStart: string;
  vehicleUse: 'PRIVATE' | 'COMMERCIAL';
  stnkFileName: string;
  stnkStatus: EngineStatus;
  stnkConfidence: number | null;
  stnkReviewReason: string;
  stnkExtractedFields: string[];
}

export interface OdometerData {
  value: string;
  fileName: string;
  previewUrl: string;
  scanStatus: EngineStatus;
  scanResult: DocumentScanResult | null;
}

export interface UsageData {
  estimatorEnabled: boolean;
  commuteDays: string;
  commuteOneWayKm: string;
  weekendKm: string;
  monthlyTripKm: string;
  knownWeeklyKm: string;
  parking: string;
  telematicsConsent: boolean;
  telematicsStatus: EngineStatus;
}

export interface PlanData {
  purchaseMode: PurchaseMode;
  selectedBand: MileageBandCode;
  starterQuotaKm: number;
  upgradeMode: UpgradeMode;
  lowBandConsent: boolean;
  autoUpgradeConsent: boolean;
  paymentTokenConsent: boolean;
}

export interface ProtectionData {
  addOns: string[];
}

export interface CustomerData {
  type: CustomerType;
  name: string;
  nik: string;
  npwp: string;
  email: string;
  phone: string;
  address: string;
  identityFileName: string;
  identityStatus: EngineStatus;
  dataConsent: boolean;
  notificationChannels: NotificationChannel[];
}

export interface FinalConsentData {
  annualPolicy: boolean;
  mileageMechanism: boolean;
  topUpExpiry: boolean;
  claimTreatment: boolean;
}

export interface QuoteForm {
  vehicle: VehicleData;
  odometer: OdometerData;
  usage: UsageData;
  plan: PlanData;
  protection: ProtectionData;
  customer: CustomerData;
  finalConsents: FinalConsentData;
  paymentMethod: 'VA' | 'QRIS' | 'CARD' | '';
}

export interface AuditEvent {
  id: string;
  at: string;
  type: string;
  title: string;
  detail: string;
  source: 'CUSTOMER' | 'RULE_ENGINE' | 'VISION_ENGINE' | 'PRICING_ENGINE' | 'SYSTEM';
}


export interface RiskInsight {
  code: string;
  label: string;
  value: string;
  impact: 'POSITIVE' | 'NEUTRAL' | 'ATTENTION';
  explanation: string;
}

export interface RiskAssessment {
  score: number;
  band: 'LOW' | 'MEDIUM' | 'HIGH';
  insights: RiskInsight[];
}

export interface ClaimMileageGuardrail {
  policyCoverageStatus: 'ACTIVE';
  automaticDeclineAllowed: false;
  action: 'NORMAL_REVIEW' | 'PREMIUM_ADJUSTMENT_REVIEW' | 'FRAUD_INVESTIGATION';
  reason: string;
}

export interface PolicySimulation {
  policyNumber: string;
  startDate: string;
  endDate: string;
  totalQuotaKm: number;
  usedKm: number;
  activeBand: MileageBandCode;
  auditTrail: AuditEvent[];
}
