import React from 'react';
import { MapPin } from 'lucide-react';

interface ShippingFormProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-serif uppercase tracking-tight">SHIPPING ADDRESS</h2>
        <button className="text-[10px] font-bold tracking-widest text-luxury-red uppercase hover:opacity-70 transition-opacity">
          Log in for faster checkout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={onChange}
            placeholder="e.g. Alexander McQueen"
            className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/10 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="e.g. couture@redemption.com"
            className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/10 text-sm"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Address (Autocomplete)</label>
          <div className="relative">
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={onChange}
              placeholder="Start typing your address..."
              className="w-full pl-12 pr-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/20 text-sm"
            />
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-luxury-red" size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={onChange}
            placeholder="e.g. London"
            className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/20 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={onChange}
            placeholder="e.g. SW1A 1AA"
            className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/20 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
