import React from 'react';
import { CreditCard, Landmark, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentMethod {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface PaymentMethodSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedId, onSelect }) => {
  const methods: PaymentMethod[] = [
    { id: 'card', label: 'CREDIT CARD', icon: CreditCard },
    { id: 'bank', label: 'BANK TRANSFER', icon: Landmark },
    { id: 'espees', label: 'ESPEES', icon: Hexagon },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif uppercase tracking-tight">PAYMENT OPTIONS</h2>
      <div className="grid grid-cols-3 gap-4">
        {methods.map((method) => {
          const Icon = method.icon;
          const isActive = selectedId === method.id;
          return (
            <motion.button
              key={method.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(method.id)}
              className={`flex flex-col items-center justify-center gap-4 p-8 border rounded-sm transition-all duration-500 ${
                isActive 
                  ? 'border-luxury-red bg-luxury-red/5 text-luxury-red' 
                  : 'border-black/5 hover:border-black/20 text-black/40'
              }`}
            >
              <Icon size={28} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">{method.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
