import type { LucideIcon } from 'lucide-react';
import { Check, ShieldCheck } from 'lucide-react';

export interface StepDefinition {
  id: number;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export function Stepper(props: {
  steps: StepDefinition[];
  currentStep: number;
  maxVisitedStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <>
      <section className="external-stepper" aria-label="Progress pembelian">
        <nav className="external-stepper-track" aria-label="Tahap pembelian">
          {props.steps.map((step) => {
            const Icon = step.icon;
            const active = props.currentStep === step.id;
            const completed = step.id < props.currentStep || step.id < props.maxVisitedStep;
            const clickable = step.id <= props.maxVisitedStep;
            return (
              <button
                key={step.id}
                type="button"
                disabled={!clickable}
                aria-current={active ? 'step' : undefined}
                onClick={() => props.onStepClick(step.id)}
                className={`external-step ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}
              >
                <span className="external-step-icon">{completed && !active ? <Check size={17} /> : <Icon size={18} />}</span>
                <span className="external-step-copy"><small>Langkah {step.id}</small><strong>{step.shortLabel}</strong>{(active || completed) && <em>{active ? 'Dalam proses' : 'Selesai'}</em>}</span>
              </button>
            );
          })}
        </nav>
        <div className="external-stepper-note"><ShieldCheck size={17} /><span>Polis tetap 12 bulan. Mileage memengaruhi perhitungan premi, bukan masa perlindungan.</span></div>
      </section>

      <div className="mobile-progress">
        <div><span>Langkah {props.currentStep} dari {props.steps.length}</span><strong>{props.steps.find((step) => step.id === props.currentStep)?.label}</strong></div>
        <div className="mobile-progress-bar"><div style={{ width: `${(props.currentStep / props.steps.length) * 100}%` }} /></div>
      </div>
    </>
  );
}
