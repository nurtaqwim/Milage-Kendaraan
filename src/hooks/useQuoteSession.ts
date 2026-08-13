import { useCallback, useEffect, useMemo, useState } from 'react';
import { INITIAL_FORM } from '../config/initialState';
import type { AuditEvent, QuoteForm } from '../domain/types';
import { createAuditEvent, createInitialAuditTrail } from '../engines/auditEngine';

const STORAGE_KEY = 'jasindo-mileage-v4-quote';
const STORAGE_VERSION = 2;

interface StoredSession {
  version?: number;
  form: QuoteForm;
  currentStep: number;
  maxVisitedStep: number;
  auditTrail: AuditEvent[];
  updatedAt: string;
}

function mergeStoredForm(stored?: Partial<QuoteForm>): QuoteForm {
  return {
    ...INITIAL_FORM,
    ...(stored ?? {}),
    vehicle: { ...INITIAL_FORM.vehicle, ...(stored?.vehicle ?? {}) },
    odometer: { ...INITIAL_FORM.odometer, ...(stored?.odometer ?? {}), previewUrl: '' },
    usage: { ...INITIAL_FORM.usage, ...(stored?.usage ?? {}) },
    plan: { ...INITIAL_FORM.plan, ...(stored?.plan ?? {}) },
    protection: {
      ...INITIAL_FORM.protection,
      ...(stored?.protection ?? {}),
      addOns: Array.isArray(stored?.protection?.addOns) ? stored.protection.addOns : INITIAL_FORM.protection.addOns
    },
    customer: {
      ...INITIAL_FORM.customer,
      ...(stored?.customer ?? {}),
      notificationChannels: Array.isArray(stored?.customer?.notificationChannels)
        ? stored.customer.notificationChannels
        : INITIAL_FORM.customer.notificationChannels
    },
    finalConsents: { ...INITIAL_FORM.finalConsents, ...(stored?.finalConsents ?? {}) }
  };
}

function loadSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (!parsed?.form) return null;

    const currentStep = Math.min(7, Math.max(1, Number(parsed.currentStep || 1)));
    const maxVisitedStep = Math.min(7, Math.max(currentStep, Number(parsed.maxVisitedStep || currentStep)));

    return {
      version: STORAGE_VERSION,
      form: mergeStoredForm(parsed.form),
      currentStep,
      maxVisitedStep,
      auditTrail: Array.isArray(parsed.auditTrail) ? parsed.auditTrail : createInitialAuditTrail(),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : ''
    };
  } catch {
    return null;
  }
}

export function useQuoteSession() {
  const restored = useMemo(loadSession, []);
  const [form, setForm] = useState<QuoteForm>(restored?.form ?? INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(restored?.currentStep ?? 1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(restored?.maxVisitedStep ?? 1);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>(restored?.auditTrail ?? createInitialAuditTrail());
  const [lastSavedAt, setLastSavedAt] = useState(restored?.updatedAt ?? '');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const updatedAt = new Date().toISOString();
      const safeForm = {
        ...form,
        odometer: { ...form.odometer, previewUrl: '' }
      };
      const payload: StoredSession = { version: STORAGE_VERSION, form: safeForm, currentStep, maxVisitedStep, auditTrail, updatedAt };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastSavedAt(updatedAt);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [form, currentStep, maxVisitedStep, auditTrail]);

  const updateSection = useCallback(<K extends keyof QuoteForm>(section: K, patch: Partial<QuoteForm[K]>) => {
    setForm((previous) => ({ ...previous, [section]: { ...(previous[section] as object), ...(patch as object) } }));
  }, []);

  const log = useCallback((event: Omit<AuditEvent, 'id' | 'at'>) => {
    setAuditTrail((previous) => [createAuditEvent(event), ...previous].slice(0, 100));
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setForm(INITIAL_FORM);
    setCurrentStep(1);
    setMaxVisitedStep(1);
    setAuditTrail(createInitialAuditTrail());
    setLastSavedAt('');
  }, []);

  return { form, setForm, updateSection, currentStep, setCurrentStep, maxVisitedStep, setMaxVisitedStep, auditTrail, setAuditTrail, lastSavedAt, log, reset };
}
