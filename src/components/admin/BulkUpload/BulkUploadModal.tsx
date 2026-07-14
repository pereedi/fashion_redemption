import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Download, FileSpreadsheet, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../config/apiClient';
import API_BASE_URL from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_ID_REFERENCE = [
  { id: '1',  label: 'Men — Shirts'                  },
  { id: '2',  label: 'Men — Trousers & Chinos'       },
  { id: '3',  label: 'Men — Jeans'                   },
  { id: '4',  label: 'Men — Suits & Blazers'         },
  { id: '5',  label: 'Men — 3-Piece Suits'           },
  { id: '6',  label: 'Men — Up-and-down Sets'        },
  { id: '7',  label: 'Men — Shirt & Trouser Sets'    },
  { id: '8',  label: 'Men — Jackets & Hoodies'       },
  { id: '9',  label: 'Men — Shorts'                  },
  { id: '10', label: 'Women — Dresses'               },
  { id: '11', label: 'Women — Tops & Blouses'        },
  { id: '12', label: 'Women — Skirts'                },
  { id: '13', label: 'Women — Pants & Trousers'      },
  { id: '14', label: 'Women — Jumpsuits'             },
  { id: '15', label: 'Women — 3-Piece Sets'          },
  { id: '16', label: 'Women — Jackets & Hoodies'     },
  { id: '17', label: 'Women — Denim'                 },
  { id: '18', label: 'Kids — Boys Clothing'          },
  { id: '19', label: 'Kids — Girls Clothing'         },
  { id: '20', label: 'Kids — Baby Wear'              },
  { id: '21', label: 'Footwear — Sneakers'           },
  { id: '22', label: 'Footwear — Sandals'            },
  { id: '23', label: 'Footwear — Heels'              },
  { id: '24', label: 'Footwear — Boots'              },
  { id: '25', label: 'Footwear — Slippers'           },
  { id: '26', label: 'Accessories — Bags'            },
  { id: '27', label: 'Accessories — Belts'           },
  { id: '28', label: 'Accessories — Hats & Caps'     },
];

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [showCategoryRef, setShowCategoryRef] = useState(false);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── File handling ───────────────────────────────────────────────────────────
  const handleFile = (f: File) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/csv',
      'text/plain',
    ];
    // Also allow by extension in case browser reports wrong MIME
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(f.type) && !['csv','xls','xlsx'].includes(ext || '')) {
      alert('Only CSV or Excel files (.csv, .xls, .xlsx) are allowed for the product data file.');
      return;
    }
    setFile(f);
    setStatus('idle');
    setResult(null);
  };

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

  const handleImages = (filesList: FileList) => {
    const list       = Array.from(filesList);
    const nonImages  = list.filter(f => !f.type.startsWith('image/'));
    const oversized  = list.filter(f => f.type.startsWith('image/') && f.size > MAX_IMAGE_SIZE);
    const valid      = list.filter(f => f.type.startsWith('image/') && f.size <= MAX_IMAGE_SIZE);

    if (nonImages.length > 0) {
      alert(`Skipped ${nonImages.length} non-image file(s):\n${nonImages.map(f => `• ${f.name}`).join('\n')}`);
    }
    if (oversized.length > 0) {
      alert(
        `Skipped ${oversized.length} image(s) over the 2 MB limit:\n` +
        oversized.map(f => `• ${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`).join('\n')
      );
    }
    if (valid.length > 0) {
      setImages(prev => {
        // Deduplicate by filename
        const existingNames = new Set(prev.map(f => f.name));
        return [...prev, ...valid.filter(f => !existingNames.has(f.name))];
      });
      setStatus('idle');
      setResult(null);
    }
  };

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');

    const formData = new FormData();
    formData.append('file', file);
    images.forEach(img => formData.append('images', img));

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
    } catch {
      setStatus('error');
      setResult({ message: 'Network error. Please check your connection and try again.' });
    }
  };

  // ── Template download ───────────────────────────────────────────────────────
  const downloadTemplate = () => {
  const headers = [
    'category_id', 'brand name', 'product name', 'description',
    'sku', 'cost_price', 'selling_price', 'size', 'colour', 'quantity', 'image'
  ];

  const examples = [
    // Scenario A: Size only — same SKU repeated per size, colour left empty
    ['10', 'Fashion Redemption', 'Elegant Black Dress',  'A beautiful formal dress', 'SKU001', '12000', '25000', 'S',  '',      '5',  'SKU001_1.jpg'],
    ['10', 'Fashion Redemption', 'Elegant Black Dress',  'A beautiful formal dress', 'SKU001', '12000', '25000', 'M',  '',      '10', 'SKU001_1.jpg'],
    ['10', 'Fashion Redemption', 'Elegant Black Dress',  'A beautiful formal dress', 'SKU001', '12000', '25000', 'L',  '',      '8',  'SKU001_1.jpg'],
    ['10', 'Fashion Redemption', 'Elegant Black Dress',  'A beautiful formal dress', 'SKU001', '12000', '25000', 'XL', '',      '3',  'SKU001_1.jpg'],
    // Scenario B: Colour + Size — same SKU repeated per colour and size combination
    ['1',  'Fashion Redemption', 'Classic Cotton Shirt', 'Premium cotton shirt',     'SKU002', '8000',  '18000', 'S',  'White', '5',  'SKU002_1.jpg'],
    ['1',  'Fashion Redemption', 'Classic Cotton Shirt', 'Premium cotton shirt',     'SKU002', '8000',  '18000', 'M',  'White', '8',  'SKU002_1.jpg'],
    ['1',  'Fashion Redemption', 'Classic Cotton Shirt', 'Premium cotton shirt',     'SKU002', '8000',  '18000', 'L',  'White', '4',  'SKU002_1.jpg'],
    ['1',  'Fashion Redemption', 'Classic Cotton Shirt', 'Premium cotton shirt',     'SKU002', '8000',  '18000', 'S',  'Black', '6',  'SKU002_1.jpg'],
    ['1',  'Fashion Redemption', 'Classic Cotton Shirt', 'Premium cotton shirt',     'SKU002', '8000',  '18000', 'M',  'Black', '9',  'SKU002_1.jpg'],
    ['1',  'Fashion Redemption', 'Classic Cotton Shirt', 'Premium cotton shirt',     'SKU002', '8000',  '18000', 'L',  'Black', '3',  'SKU002_1.jpg'],
    // Scenario C: Footwear with numeric sizes
    ['21', 'Fashion Redemption', 'Urban Sneakers',       'Casual everyday sneakers', 'SKU003', '15000', '35000', '40', 'Red',   '5',  'SKU003_1.jpg'],
    ['21', 'Fashion Redemption', 'Urban Sneakers',       'Casual everyday sneakers', 'SKU003', '15000', '35000', '41', 'Red',   '7',  'SKU003_1.jpg'],
    ['21', 'Fashion Redemption', 'Urban Sneakers',       'Casual everyday sneakers', 'SKU003', '15000', '35000', '42', 'Red',   '4',  'SKU003_1.jpg'],
  ];

  const commentRows = [
    '# INSTRUCTIONS:',
    '# - Each row = one size/colour variant of a product',
    '# - Repeat the same SKU on multiple rows to add more sizes or colours',
    '# - Leave the colour column empty if your product has no colour variation',
    '# - Name images after SKU e.g. SKU001_1.jpg  SKU001_2.jpg',
    '# - Delete these comment rows before uploading',
    '#',
  ].map(c => `"${c}"`);

  const csvRows = [
    ...commentRows,
    headers.map(h => `"${h}"`).join(','),
    ...examples.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvRows], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'fashion_redemption_bulk_template.csv';
  a.click();
  URL.revokeObjectURL(url);
};

  const reset = () => { setFile(null); setImages([]); setStatus('idle'); setResult(null); };
  const handleClose = () => { reset(); onClose(); };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-upload-title"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-start justify-center p-4 pt-10 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, type: 'spring', damping: 28 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-100 mb-10"
          >
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <div>
                <h2 id="bulk-upload-title" className="text-xl font-serif font-bold tracking-tight uppercase">
                  Bulk Product Upload
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Import multiple products via CSV or Excel + matching image files
                </p>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-black p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X size={22} />
              </button>
            </div>

            <div className="px-8 py-6 space-y-6">

              {/* ── Instructions ─────────────────────────────────────────────── */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
                <p className="text-[11px] font-bold tracking-wider uppercase text-amber-800">
                  How to prepare your upload
                </p>
                <ol className="text-[12px] text-amber-700 space-y-2 list-decimal pl-5">
                  <li>
                    <strong>Download the template</strong> below — fill it in using these exact columns:
                    <code className="block mt-1 bg-amber-100 px-2 py-1 rounded text-[11px] font-mono text-amber-900">
                      category_id | brand name | product name | description | sku | cost_price | selling_price | quantity | size | colour | image
                    </code>
                  </li>
                  <li>
                    <strong>SKU is the key</strong> — each product must have a unique SKU (e.g. <code className="bg-amber-100 px-1 rounded">SKU001</code>).
                    To add multiple sizes for one product, repeat its row with the same SKU but a different size and quantity.
                  </li>
                  <li>
                    <strong>Use category_id</strong> to assign products to the right category.{' '}
                    <button
                      type="button"
                      onClick={() => setShowCategoryRef(!showCategoryRef)}
                      className="underline text-amber-800 font-bold hover:text-black transition-colors"
                    >
                      {showCategoryRef ? 'Hide' : 'View'} category ID reference →
                    </button>
                  </li>
                  <li>
                    <strong>Name your images after their SKU</strong> — e.g.{' '}
                    <code className="bg-amber-100 px-1 rounded text-[11px]">SKU001_1.jpg</code>,{' '}
                    <code className="bg-amber-100 px-1 rounded text-[11px]">SKU001_2.jpg</code>.
                    Multiple images per product are ordered alphabetically. Max <strong>2 MB per image</strong>.
                  </li>
                  <li>
                    Upload the filled template in <strong>Step 1</strong>, then select all your product images in <strong>Step 2</strong>, then click <strong>Import Products</strong>.
                  </li>
                </ol>
              </div>

              {/* ── Category ID Reference ─────────────────────────────────────── */}
              <AnimatePresence>
                {showCategoryRef && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <p className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
                          Category ID Reference — use these numbers in the category_id column
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-0 max-h-56 overflow-y-auto">
                        {CATEGORY_ID_REFERENCE.map(({ id, label }) => (
                          <div key={id} className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 text-[11px]">
                            <span className="font-bold text-luxury-red w-6 flex-shrink-0">{id}</span>
                            <span className="text-gray-600">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Download Template ─────────────────────────────────────────── */}
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-3 w-full p-4 border border-dashed border-gray-200 rounded-xl hover:border-luxury-red hover:bg-red-50/20 transition-all group"
              >
                <Download size={18} className="text-gray-400 group-hover:text-luxury-red transition-colors flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold tracking-wider uppercase text-gray-600 group-hover:text-luxury-red transition-colors">
                    Download Template (CSV)
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Includes example rows showing correct format for single and multi-size products
                  </p>
                </div>
              </button>
              <p className="text-[10px] text-gray-400">
                Includes examples for size-only, colour+size, and footwear products.
                Repeat the same SKU per row for each size/colour variant.
              </p>

              {/* ── Upload Zones ──────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Step 1 — CSV / Excel */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500">
                    Step 1 — Product Data (CSV / Excel) <span className="text-luxury-red">*</span>
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDraggingFile(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 p-6 h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isDraggingFile    ? 'border-luxury-red bg-red-50/30' :
                      file              ? 'border-green-400 bg-green-50/20' :
                                          'border-gray-200 hover:border-luxury-red hover:bg-red-50/10'
                    }`}
                  >
                    <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx" className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

                    {file ? (
                      <>
                        <FileSpreadsheet size={30} className="text-green-500" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-800 truncate max-w-[190px]">{file.name}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-gray-400 hover:text-luxury-red transition-colors">
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload size={28} className="text-gray-300" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-600">Select Template File</p>
                          <p className="text-[10px] text-gray-400 mt-1">or drag & drop · CSV, XLS, XLSX</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Step 2 — Images */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500">
                    Step 2 — Product Images (Optional)
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingImages(true); }}
                    onDragLeave={() => setIsDraggingImages(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDraggingImages(false); if (e.dataTransfer.files) handleImages(e.dataTransfer.files); }}
                    onClick={() => imageInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 p-6 h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isDraggingImages  ? 'border-luxury-red bg-red-50/30' :
                      images.length > 0 ? 'border-green-400 bg-green-50/20' :
                                          'border-gray-200 hover:border-luxury-red hover:bg-red-50/10'
                    }`}
                  >
                    <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden"
                      onChange={(e) => e.target.files && handleImages(e.target.files)} />

                    {images.length > 0 ? (
                      <>
                        <Image size={30} className="text-green-500" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-800">{images.length} image{images.length !== 1 ? 's' : ''} selected</p>
                          <p className="text-[10px] text-gray-400 mt-1">Click to add more</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setImages([]); }}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-gray-400 hover:text-luxury-red transition-colors">
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload size={28} className="text-gray-300" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-600">Select Images</p>
                          <p className="text-[10px] text-gray-400 mt-1">or drag & drop · Max 2 MB each</p>
                          <p className="text-[10px] text-gray-400">Named SKU001.jpg, SKU001_2.jpg…</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Selected Images List ──────────────────────────────────────── */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                      Images queued ({images.length})
                    </p>
                    <button type="button" onClick={() => setImages([])}
                      className="text-[10px] font-bold text-luxury-red hover:underline">
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 bg-gray-50 border border-gray-100 rounded-lg scrollbar-hide">
                    {images.map((img, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-white px-2 py-1 border border-gray-200 rounded-md shadow-sm">
                        <span className="text-[10px] font-mono text-gray-700 max-w-[120px] truncate">{img.name}</span>
                        <span className="text-[9px] text-gray-400">({(img.size / 1024).toFixed(0)}KB)</span>
                        <button type="button"
                          onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                          className="text-gray-300 hover:text-luxury-red transition-colors ml-0.5">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Result ───────────────────────────────────────────────────── */}
              {result && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                  status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  {status === 'success'
                    ? <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    : <AlertCircle size={18} className="text-luxury-red flex-shrink-0 mt-0.5" />
                  }
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold uppercase tracking-wider ${
                      status === 'success' ? 'text-green-700' : 'text-luxury-red'
                    }`}>
                      {result.message}
                    </p>
                    {result.errors?.length > 0 && (
                      <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto scrollbar-hide">
                        {result.errors.map((err: string, i: number) => (
                          <li key={i} className="text-[11px] text-red-600">• {err}</li>
                        ))}
                      </ul>
                    )}
                    {status === 'success' && result.results && (
  <div className="flex gap-4 mt-2 flex-wrap">
    <span className="text-[11px] text-green-600">✓ {result.results.added} added</span>
    {result.results.skipped > 0 && (
      <span className="text-[11px] text-amber-600">⊘ {result.results.skipped} skipped (duplicate SKU)</span>
    )}
    {result.results.skippedRows?.length > 0 && (
      <span className="text-[11px] text-orange-600">⚠ {result.results.skippedRows.length} rows skipped (missing data)</span>
    )}
  </div>
)}

{/* Show skipped row details */}
{status === 'success' && result.results?.skippedRows?.length > 0 && (
  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700 mb-2">
      Rows skipped — missing required data:
    </p>
    <ul className="max-h-32 overflow-y-auto scrollbar-hide space-y-1">
      {result.results.skippedRows.map((err: string, i: number) => (
        <li key={i} className="text-[11px] text-orange-600">• {err}</li>
      ))}
    </ul>
  </div>
)}
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer ───────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                {file ? `✓ Template ready` : 'Template file required'}
                {images.length > 0 ? ` · ${images.length} image${images.length !== 1 ? 's' : ''} ready` : ''}
              </p>
              <div className="flex items-center gap-4">
                <button onClick={handleClose}
                  className="px-6 py-3 text-xs font-bold tracking-widest text-gray-400 uppercase hover:text-black transition-colors">
                  Cancel
                </button>
                <button onClick={handleUpload} disabled={!file || status === 'uploading'}
                  className="px-10 py-3 bg-luxury-red text-white text-xs font-bold tracking-[0.2em] uppercase rounded-lg hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 min-w-[160px] justify-center">
                  {status === 'uploading' ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Importing…</>
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