import React from 'react';
import { ChevronRight } from 'lucide-react';

type Step = 'cart' | 'information' | 'shipping' | 'payment';

interface CheckoutStepsProps {
  currentStep: Step;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
  const steps = [
    { id: 'cart', label: 'CART' },
    { id: 'information', label: 'INFORMATION' },
    { id: 'shipping', label: 'SHIPPING' },
    { id: 'payment', label: 'PAYMENT' },
  ];

  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <nav className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] mb-12">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <span className={`transition-colors duration-300 ${idx <= currentIdx ? 'text-luxury-red' : 'text-black/30'}`}>
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <ChevronRight size={12} className="text-black/10" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default CheckoutSteps;
