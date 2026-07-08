import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Download, FileSpreadsheet, Images } from 'lucide-react';
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
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB per file

  const handleImages = (filesList: FileList) => {
    const list = Array.from(filesList);
    const nonImages = list.filter(f => !f.type.startsWith('image/'));
    const oversized  = list.filter(f => f.type.startsWith('image/') && f.size > MAX_IMAGE_SIZE);
    const valid      = list.filter(f => f.type.startsWith('image/') && f.size <= MAX_IMAGE_SIZE);

    if (nonImages.length > 0) {
      alert(`Skipped ${nonImages.length} non-image file(s): ${nonImages.map(f => f.name).join(', ')}`);
    }
    if (oversized.length > 0) {
      alert(
        `Skipped ${oversized.length} image(s) exceeding the 2 MB limit:\n` +
        oversized.map(f => `• ${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`).join('\n')
      );
    }
    if (valid.length > 0) {
      setImages(prev => [...prev, ...valid]);
      setStatus('idle');
      setResult(null);
    }
  };

  const handleImagesDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(false);
    if (e.dataTransfer.files) {
      handleImages(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');

    const formData = new FormData();
    formData.append('file', file);
    images.forEach(img => {
      formData.append('images', img);
    });

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
    setImages([]);
    setStatus('idle');
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-upload-title"
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-start justify-center p-4 pt-16 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 mb-8 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 id="bulk-upload-title" className="text-xl font-serif font-bold tracking-tight uppercase">
                  Bulk Product Upload
                </h2>
                <p className="text-xs text-gray-400 mt-1">Upload a CSV/Excel file and corresponding image files to import products</p>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-black p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-hide">
              {/* Instructions Callout */}
              <div className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <p className="text-[10px] font-bold tracking-wider uppercase text-stone-700">Instructions & Image Guidelines</p>
                <ul className="text-[11px] text-stone-500 space-y-1.5 list-disc pl-4">
                  <li>Fill out the Excel/CSV template. The <strong>SKU</strong> column is required and acts as the unique product identifier.</li>
                  <li>Name image files using their SKU — e.g. <code className="bg-stone-200/60 px-1 rounded text-stone-800">SKU001.jpg</code>, <code className="bg-stone-200/60 px-1 rounded text-stone-800">SKU001_1.jpg</code>, <code className="bg-stone-200/60 px-1 rounded text-stone-800">SKU001_2.jpg</code>. Multiple images per SKU are ordered alphabetically.</li>
                  <li><strong>Max image size: 2 MB per file.</strong> 4K quality images are supported. Upload up to 500 images at once.</li>
                  <li>Select or drag all your image files at once (e.g. select-all from a folder). Oversized or non-image files are skipped automatically.</li>
                </ul>
              </div>

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

              {/* Drop Zones Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1: Drop Zone for CSV/Excel */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400">
                    Step 1: CSV or Excel File
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 p-6 h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
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
                        <FileSpreadsheet size={28} className="text-green-500" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-800 truncate max-w-[180px]">{file.name}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {(file.size / 1024).toFixed(1)} KB · Click to change
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-gray-400 hover:text-luxury-red transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload size={28} className="text-gray-300" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-600">Select Template File</p>
                          <p className="text-[10px] text-gray-400 mt-1">or drag & drop template</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Step 2: Drop Zone for Product Images */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400">
                    Step 2: Product Images (Optional)
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingImages(true); }}
                    onDragLeave={() => setIsDraggingImages(false)}
                    onDrop={handleImagesDrop}
                    onClick={() => imageInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 p-6 h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isDraggingImages ? 'border-luxury-red bg-red-50/30' :
                      images.length > 0 ? 'border-green-400 bg-green-50/20' :
                      'border-gray-200 hover:border-luxury-red hover:bg-red-50/10'
                    }`}
                  >
                    <input
                      ref={imageInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleImages(e.target.files)}
                    />
                    {images.length > 0 ? (
                      <>
                        <Images size={28} className="text-green-500" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-800">{images.length} Images Selected</p>
                          <p className="text-[10px] text-gray-400 mt-1">Click to add more images</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload size={28} className="text-gray-300" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-600">Select Images</p>
                          <p className="text-[10px] text-gray-400 mt-1">or drag & drop folder files</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Images List */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                      Images to Upload ({images.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => setImages([])}
                      className="text-[10px] font-bold text-luxury-red hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-gray-50 border border-gray-100 rounded-lg">
                    {images.map((img, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-200 rounded-md text-xs relative group shadow-sm">
                        <span className="text-[10px] font-mono text-gray-600 truncate max-w-[120px]">
                          {img.name}
                        </span>
                        <span className="text-[8px] text-gray-400">
                          ({(img.size / 1024).toFixed(0)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImages(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-gray-400 hover:text-luxury-red"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-100">
              <button
                onClick={handleClose}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BulkUploadModal;