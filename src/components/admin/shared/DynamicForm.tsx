import React, { useState, useEffect } from 'react';

export type FieldType = 'text' | 'number' | 'select' | 'textarea' | 'checkbox' | 'file' | 'section';

export interface FormOption {
  label: string;
  value: string | number;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FormOption[]; // For select fields
  placeholder?: string;
  multiple?: boolean; // For select or file
  prefix?: string; // e.g., "$"
}

interface DynamicFormProps {
  fields: FormField[];
  initialData?: any;
  onChange?: (data: any) => void;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  extension?: React.ReactNode;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ 
  fields, 
  initialData, 
  onChange,
  onSubmit, 
  onCancel,
  submitLabel = 'Save',
  isLoading = false,
  extension
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'select-multiple') {
      const options = (e.target as HTMLSelectElement).selectedOptions;
      newValue = Array.from(options).map(opt => opt.value);
    }
    
    const updatedData = { ...formData, [name]: newValue };
    setFormData(updatedData);
    if (onChange) onChange(updatedData);

    // Clear error
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    // Basic file text update simulating upload for now - in reality you'd handle FormData
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map(f => URL.createObjectURL(f)); // Dummy object URLs
      setFormData({ 
        ...formData, 
        [fieldName]: e.target.multiple ? [...(formData[fieldName] || []), ...fileNames] : [fileNames[0]]
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {fields.map(field => {
          if (field.type === 'section') {
            return (
              <div key={field.name} className="md:col-span-2 pt-6 first:pt-0">
                <h3 className="text-sm font-bold tracking-[0.2em] text-black uppercase mb-3">
                  {field.label}
                </h3>
                <div className="h-px bg-gray-100 w-full" />
              </div>
            );
          }

          return (
            <div key={field.name} className={(field.type === 'textarea' || field.type === 'file') ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-bold tracking-wide text-gray-400 uppercase mb-3">
                {field.label} {field.required && <span className="text-luxury-red">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  rows={4}
                  className={`w-full p-5 border ${errors[field.name] ? 'border-luxury-red' : 'border-gray-200'} rounded-lg text-sm focus:outline-none focus:border-luxury-red transition-all duration-300 bg-white shadow-sm hover:border-gray-300`}
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || (field.multiple ? [] : '')}
                  onChange={handleChange}
                  multiple={field.multiple}
                  className={`w-full h-14 px-5 border ${errors[field.name] ? 'border-luxury-red' : 'border-gray-200'} rounded-lg text-sm focus:outline-none focus:border-luxury-red transition-all duration-300 bg-white shadow-sm hover:border-gray-300 appearance-none`}
                >
                  {!field.multiple && <option value="">Select an option</option>}
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={!!formData[field.name]}
                    onChange={handleChange}
                    className="w-5 h-5 text-luxury-red rounded border-gray-300 focus:ring-luxury-red"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">{field.label}</span>
                </div>
              ) : field.type === 'file' ? (
                <div className="flex flex-col gap-4 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 hover:border-luxury-red transition-colors">
                  <input
                    type="file"
                    name={field.name}
                    multiple={field.multiple}
                    onChange={(e) => handleFileChange(e, field.name)}
                    className="text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-black file:text-white hover:file:bg-luxury-red transition-all cursor-pointer"
                  />
                  {/* Image previews */}
                  {Array.isArray(formData[field.name]) && formData[field.name].length > 0 && (
                     <div className="flex flex-wrap gap-3 mt-2">
                       {formData[field.name].map((imgUrl: string, idx: number) => (
                         <div key={idx} className="relative w-20 h-24 border rounded-lg bg-white overflow-hidden shadow-sm group">
                           <img src={imgUrl} alt="preview" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="text-[8px] text-white font-bold">PREVIEW</span>
                           </div>
                         </div>
                       ))}
                     </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  {field.prefix && (
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                      {field.prefix}
                    </span>
                  )}
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={`w-full h-14 ${field.prefix ? 'pl-14' : 'px-5'} border ${errors[field.name] ? 'border-luxury-red' : 'border-gray-200'} rounded-lg text-sm focus:outline-none focus:border-luxury-red transition-all duration-300 bg-white shadow-sm hover:border-gray-300`}
                  />
                </div>
              )}
              
              {errors[field.name] && (
                <p className="text-luxury-red text-[10px] font-bold uppercase tracking-wider mt-2 ml-1">{errors[field.name]}</p>
              )}
            </div>
          );
        })}
      </div>
      
      {extension && <div className="animate-fade-in">{extension}</div>}

      <div className="flex items-center justify-end gap-6 pt-10 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 text-xs font-bold tracking-widest text-gray-400 uppercase hover:text-black transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-12 py-4 bg-luxury-red text-white text-xs font-bold tracking-[0.2em] uppercase rounded-lg hover:bg-black transition-all duration-500 shadow-xl shadow-luxury-red/10 flex items-center justify-center min-w-[200px]"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};
