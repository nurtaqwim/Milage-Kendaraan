import { PRODUCT_RULES } from './productConfig';
import type { QuoteForm } from '../domain/types';
import { addDaysToLocalDate } from '../utils/format';

export const INITIAL_FORM: QuoteForm = {
  vehicle: {
    plate: '',
    brand: '',
    model: '',
    year: '',
    sumInsured: '',
    region: '',
    coverage: 'COMPREHENSIVE',
    policyStart: addDaysToLocalDate(7),
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
