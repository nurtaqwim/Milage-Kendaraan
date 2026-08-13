import { PRODUCT_RULES } from './productConfig';
import type { QuoteForm } from '../domain/types';

export const INITIAL_FORM: QuoteForm = {
  vehicle: {
    plate: '',
    chassisNumber: '',
    engineNumber: '',
    brand: '',
    model: '',
    year: '',
    sumInsured: '',
    region: '',
    coverage: 'COMPREHENSIVE',
    policyStart: '',
    vehicleUse: 'PRIVATE',
    stnkFileName: '',
    stnkStatus: 'IDLE',
    stnkConfidence: null,
    stnkReviewReason: '',
    stnkExtractedFields: []
  },
  odometer: {
    value: '',
    fileName: '',
    previewUrl: '',
    scanStatus: 'IDLE',
    scanResult: null
  },
  usage: {
    estimatorEnabled: false,
    commuteDays: '',
    commuteOneWayKm: '',
    weekendKm: '',
    monthlyTripKm: '',
    knownWeeklyKm: '',
    parking: '',
    telematicsConsent: false,
    telematicsStatus: 'IDLE'
  },
  plan: {
    purchaseMode: 'STARTER_TOPUP',
    selectedBand: 'M10',
    starterQuotaKm: PRODUCT_RULES.starterQuotaKm,
    upgradeMode: 'MANUAL',
    lowBandConsent: false,
    autoUpgradeConsent: false,
    paymentTokenConsent: false
  },
  protection: { addOns: [] },
  customer: {
    type: 'PERSONAL',
    name: '',
    nik: '',
    npwp: '',
    email: '',
    phone: '',
    address: '',
    identityFileName: '',
    identityStatus: 'IDLE',
    dataConsent: false,
    notificationChannels: ['WHATSAPP', 'EMAIL']
  },
  finalConsents: {
    annualPolicy: false,
    mileageMechanism: false,
    topUpExpiry: false,
    claimTreatment: false
  },
  paymentMethod: ''
};
