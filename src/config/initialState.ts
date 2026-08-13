import { PRODUCT_RULES } from './productConfig';
import type { QuoteForm } from '../domain/types';
import { addDaysToLocalDate } from '../utils/format';

export const INITIAL_FORM: QuoteForm = {
  vehicle: {
    plate: 'B 1234 ABC',
    brand: 'Honda',
    model: 'CR-V',
    year: String(new Date().getFullYear() - 3),
    sumInsured: '450000000',
    region: 'DKI Jakarta',
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
    value: '24580',
    fileName: '',
    previewUrl: '',
    scanStatus: 'IDLE',
    scanResult: null
  },
  usage: {
    commuteDays: '3',
    commuteOneWayKm: '12',
    weekendKm: '35',
    monthlyTripKm: '100',
    knownWeeklyKm: '',
    parking: 'Garasi / area tertutup',
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
    name: 'Budi Santoso',
    nik: '',
    npwp: '',
    email: 'budi@email.com',
    phone: '081234567890',
    address: 'Jakarta Selatan',
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
