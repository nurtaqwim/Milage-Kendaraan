import { useCallback, useEffect, useState } from 'react';
import { INITIAL_FORM } from '../config/initialState';
import type { AuditEvent, QuoteForm } from '../domain/types';
import { createAuditEvent, createInitialAuditTrail } from '../engines/auditEngine';

const STORAGE_KEY = 'jasindo-mileage-v4-quote';
export function useQuoteSession() {
  const [form, setForm] = useState<QuoteForm>(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>(createInitialAuditTrail());
  const [lastSavedAt, setLastSavedAt] = useState('');

  // Prototype simulasi selalu dimulai dari kondisi bersih ketika halaman dibuka kembali.
  useEffect(() => {
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

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
