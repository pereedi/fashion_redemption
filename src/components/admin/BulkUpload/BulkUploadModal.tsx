import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Download, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../config/apiClient';
import API_BASE_URL from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    const allowed = ['text/csv', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowed.includes(f.type)) {
      alert('Only CSV or Excel files (.csv, .xls, .xlsx) are allowed');
      return;
    }
    setFile(f);
    setStatus('idle');
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiFetch(`${API_BASE_URL}/api/admin/bulk-upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      setResult(data);
      setStatus(data.success ? 'success' : 'error');
      if (data.success) onSuccess();
    } catch (err) {
      setStatus('error');
      setResult({ message: 'Network error. Please try again.' });
    }
  };

  const downloadTemplate = () => {
    const headers = ['SKU', 'Name', 'Description', 'Category', 'Type', 'Price', 'Size', 'Colour', 'Quantity'];
    const example = ['SKU001', 'Elegant Black Dress', 'A beautiful dress', 'women', 'clothing', '25000', 'M', 'Black', '10'];
    const csv = [headers.join(','), example.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fashion_redemption_bulk_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-upload-title"
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <div>
                <h2 id="bulk-upload-title" className="text-xl font-serif font-bold tracking-tight uppercase">
                  Bulk Product Upload
                </h2>
                <p className="text-xs text-gray-400 mt-1">Upload a CSV or Excel file to import multiple products</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-black p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Download Template */}
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-3 w-full p-4 border border-dashed border-gray-200 rounded-xl hover:border-luxury-red hover:bg-red-50/20 transition-all group"
              >
                <Download size={18} className="text-gray-400 group-hover:text-luxury-red transition-colors" />
                <div className="text-left">
                  <p className="text-xs font-bold tracking-wider uppercase text-gray-600 group-hover:text-luxury-red transition-colors">
                    Download Template
                  </p>
                  <p className="text-[10px] text-gray-400">
                    SKU, Name, Description, Category, Type, Price, Size, Colour, Quantity
                  </p>
                </div>
              </button>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  isDragging ? 'border-luxury-red bg-red-50/30' :
                  file ? 'border-green-400 bg-green-50/20' :
                  'border-gray-200 hover:border-luxury-red hover:bg-red-50/10'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {file ? (
                  <>
                    <FileSpreadsheet size={36} className="text-green-500" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-800">{file.name}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {(file.size / 1024).toFixed(1)} KB · Click to change
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="absolute top-3 right-3 p-1 bg-white rounded-full shadow text-gray-400 hover:text-luxury-red transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload size={36} className="text-gray-300" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-600">Drop your file here</p>
                      <p className="text-[11px] text-gray-400 mt-1">or click to browse · CSV, XLS, XLSX · Max 10MB</p>
                    </div>
                  </>
                )}
              </div>

              {/* Result */}
              {result && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                  status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  {status === 'success'
                    ? <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    : <AlertCircle size={18} className="text-luxury-red flex-shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${
                      status === 'success' ? 'text-green-700' : 'text-luxury-red'
                    }`}>
                      {result.message}
                    </p>
                    {result.errors?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {result.errors.map((err: string, i: number) => (
                          <li key={i} className="text-[11px] text-red-600">• {err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-xs font-bold tracking-widest text-gray-400 uppercase hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || status === 'uploading'}
                  className="px-10 py-3 bg-luxury-red text-white text-xs font-bold tracking-[0.2em] uppercase rounded-lg hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 min-w-[160px] justify-center"
                >
                  {status === 'uploading' ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Importing...</>
                  ) : (
                    <><Upload size={14} /> Import Products</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BulkUploadModal;