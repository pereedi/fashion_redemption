import React from 'react';

interface CardFormProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CardForm: React.FC<CardFormProps> = ({ onChange }) => {
  return (
    <div className="p-8 bg-light-gray/20 border border-black/5 rounded-sm space-y-8 animate-fade-in shadow-inner">
      <div className="space-y-2">
        <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Card Number</label>
        <input
          type="text"
          name="cardNumber"
          placeholder="0000 0000 0000 0000"
          className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/10 text-sm font-mono tracking-widest"
          onChange={onChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Expiry Date</label>
          <input
            type="text"
            name="expiry"
            placeholder="MM / YY"
            className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/10 text-sm font-mono tracking-widest"
            onChange={onChange}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">CVV</label>
          <input
            type="password"
            name="cvv"
            placeholder="***"
            className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/10 text-sm font-mono tracking-widest"
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CardForm;
