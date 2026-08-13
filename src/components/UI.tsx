import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Circle,
  Info,
  LoaderCircle,
  UploadCloud,
  X,
  XCircle
} from 'lucide-react';
import type { DecisionStatus, DocumentQualityCheck, EngineStatus } from '../domain/types';

export function StepHeading(props: { eyebrow: string; title: string; description: string; icon: ReactNode }) {
  return (
    <div className="step-heading">
      <div className="step-heading-icon" aria-hidden="true">{props.icon}</div>
      <div>
        <p className="eyebrow">{props.eyebrow}</p>
        <h1>{props.title}</h1>
        <p>{props.description}</p>
      </div>
    </div>
  );
}

export function Field(props: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`field ${props.error ? 'field-error' : ''} ${props.className ?? ''}`.trim()}>
      <div className="field-label">
        {props.label} {props.required && <span aria-hidden="true">*</span>}
      </div>
      {props.children}
      {props.error ? (
        <p className="field-message error" role="alert"><XCircle size={15} /> {props.error}</p>
      ) : props.hint ? (
        <p className="field-message">{props.hint}</p>
      ) : null}
    </div>
  );
}

export function Callout(props: {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const tone = props.tone ?? 'info';
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'warning' ? AlertTriangle : tone === 'danger' ? XCircle : Info;
  return (
    <div className={`callout callout-${tone} ${props.compact ? 'compact' : ''}`}>
      <div className="callout-icon" aria-hidden="true"><Icon size={19} /></div>
      <div><strong>{props.title}</strong><div className="callout-copy">{props.children}</div></div>
    </div>
  );
}

export function StatusBadge(props: { status: DecisionStatus | EngineStatus | 'SAFE' | 'ACTION'; label?: string }) {
  const normalized = props.status.toLowerCase();
  return <span className={`status-badge status-${normalized}`} role="status">{props.label ?? props.status}</span>;
}

export function SummaryRow(props: { label: string; value: ReactNode; strong?: boolean; subtext?: string }) {
  return (
    <div className={`summary-row ${props.strong ? 'strong' : ''}`}>
      <span>{props.label}{props.subtext && <small>{props.subtext}</small>}</span>
      <strong>{props.value}</strong>
    </div>
  );
}

export function UploadBox(props: {
  label: string;
  fileName: string;
  accept?: string;
  onChange: (file: File | null) => void;
  hint?: string;
}) {
  return (
    <label className={`upload-box ${props.fileName ? 'has-file' : ''}`}>
      <input
        type="file"
        accept={props.accept ?? 'image/*,.pdf'}
        onChange={(event) => props.onChange(event.target.files?.[0] ?? null)}
      />
      <span className="upload-icon"><UploadCloud size={25} /></span>
      <span className="upload-copy">
        <strong>{props.fileName || props.label}</strong>
        <small>{props.fileName ? 'File siap diproses' : props.hint ?? 'Klik untuk memilih file'}</small>
      </span>
    </label>
  );
}

export function CheckboxRow(props: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description?: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`check-row-wrap ${props.error ? 'invalid' : ''}`}>
      <label className="check-row">
        <input type="checkbox" checked={props.checked} onChange={(event) => props.onChange(event.target.checked)} disabled={props.disabled} />
        <span className="custom-check" aria-hidden="true">{props.checked && <Check size={14} />}</span>
        <span><strong>{props.title}</strong>{props.description && <small>{props.description}</small>}</span>
      </label>
      {props.error && <p className="field-message error" role="alert"><XCircle size={14} /> {props.error}</p>}
    </div>
  );
}

export function QualityChecks(props: { checks: DocumentQualityCheck[] }) {
  return (
    <div className="quality-list">
      {props.checks.map((check) => {
        const Icon = check.status === 'PASS' ? CheckCircle2 : check.status === 'FAIL' ? XCircle : AlertTriangle;
        return (
          <div className={`quality-item quality-${check.status.toLowerCase()}`} key={check.id}>
            <Icon size={17} />
            <div><strong>{check.label}</strong><span>{check.detail}</span></div>
          </div>
        );
      })}
    </div>
  );
}

export function LoadingButton(props: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  const { loading, children, ...buttonProps } = props;
  return (
    <button {...buttonProps} disabled={loading || buttonProps.disabled} aria-busy={loading || undefined}>
      {loading && <LoaderCircle size={17} className="spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Modal(props: { open: boolean; title: string; children: ReactNode; onClose: () => void; footer?: ReactNode }) {
  const cardRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(props.onClose);
  const titleIdRef = useRef(`modal-title-${Math.random().toString(36).slice(2)}`);
  onCloseRef.current = props.onClose;

  useEffect(() => {
    if (!props.open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.setTimeout(() => closeRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...(cardRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      ) ?? [])].filter((element) => !element.hasAttribute('hidden'));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [props.open]);

  if (!props.open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && props.onClose()}>
      <section ref={cardRef} className="modal-card" role="dialog" aria-modal="true" aria-labelledby={titleIdRef.current}>
        <button ref={closeRef} type="button" className="modal-close" onClick={props.onClose} aria-label="Tutup"><X size={19} /></button>
        <h2 id={titleIdRef.current}>{props.title}</h2>
        <div className="modal-body">{props.children}</div>
        {props.footer && <div className="modal-footer">{props.footer}</div>}
      </section>
    </div>
  );
}

export function EmptyRadio(props: { selected: boolean }) {
  return props.selected ? <CheckCircle2 size={20} /> : <Circle size={20} />;
}
