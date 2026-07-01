import React from 'react';
import { motion } from 'framer-motion';
import espeesLogo from '../../assets/espees.png';

interface PaymentMethod {
  id: string;
  label: string;
  image: string;
}

interface PaymentMethodSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedId, onSelect }) => {
  const methods: PaymentMethod[] = [
    { id: 'espees', label: 'ESPEES', image: espeesLogo },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif uppercase tracking-tight">PAYMENT OPTIONS</h2>
      <div className="flex flex-wrap gap-4">
        {methods.map((method) => {
          const isActive = selectedId === method.id;
          return (
            <motion.button
              key={method.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(method.id)}
              className={`flex flex-col items-center justify-center gap-4 p-8 border rounded-sm transition-all duration-500 w-44 h-36 ${
                isActive 
                  ? 'border-luxury-red bg-luxury-red/5 text-luxury-red' 
                  : 'border-black/5 hover:border-black/20 text-black/40'
              }`}
            >
              <img 
                src={method.image} 
                alt={method.label} 
                className="h-10 w-auto object-contain filter brightness-100" 
              />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">{method.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;

