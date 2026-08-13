import type { AuditEvent } from '../domain/types';

export function createAuditEvent(params: Omit<AuditEvent, 'id' | 'at'>): AuditEvent {
  return { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, at: new Date().toISOString(), ...params };
}

export function createInitialAuditTrail(): AuditEvent[] {
  return [
    createAuditEvent({
      type: 'QUOTE_CREATED',
      title: 'Sesi penawaran dibuat',
      detail: 'Draft disimpan lokal pada browser untuk prototype.',
      source: 'SYSTEM'
    })
  ];
}
