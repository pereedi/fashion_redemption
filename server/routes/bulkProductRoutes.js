import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import ProductRepository from '../repositories/ProductRepository.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Per-file cap: 2MB. Allow up to 500 files so bulk batches of 100+ images work fine.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,   // 2 MB per file
    files: 501                    // 1 CSV + up to 500 images
  }
});

const uploadFields = upload.fields([
  { name: 'file',   maxCount: 1   },
  { name: 'images', maxCount: 500 }  // up to 500 product images per batch
]);

const REQUIRED_COLUMNS = ['sku', 'name', 'description', 'category', 'type', 'price', 'size', 'colour', 'quantity'];

const parseSheet = (buffer, mimetype) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1 });
};

const validateRow = (row, index) => {
  const errors = [];
  if (!row.sku) errors.push(`Row ${index}: SKU is required`);
  if (!row.name) errors.push(`Row ${index}: Name is required`);
  if (!row.category) errors.push(`Row ${index}: Category is required`);
  if (!row.type) errors.push(`Row ${index}: Type is required`);
  if (!row.price || isNaN(Number(row.price))) errors.push(`Row ${index}: Valid price is required`);
  if (!row.size) errors.push(`Row ${index}: Size is required`);
  if (!row.quantity || isNaN(Number(row.quantity))) errors.push(`Row ${index}: Valid quantity is required`);
  return errors;
};

router.post('/bulk-upload', uploadFields, async (req, res) => {
  const files = req.files || {};
  const fileArray = files['file'];
  const imageFiles = files['images'] || [];

  if (!fileArray || fileArray.length === 0) {
    return res.status(400).json({ success: false, message: 'No CSV or Excel template file uploaded' });
  }

  const sheetFile = fileArray[0];
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (!allowedTypes.includes(sheetFile.mimetype)) {
    return res.status(400).json({ success: false, message: 'Only CSV or Excel files are allowed for the template' });
  }

  try {
    const rows = parseSheet(sheetFile.buffer, sheetFile.mimetype);
    if (rows.length < 2) {
      return res.status(400).json({ success: false, message: 'File is empty or has no data rows' });
    }

    // Normalize headers
    const headers = rows[0].map(h => h?.toString().toLowerCase().trim());
    const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missing.join(', ')}`
      });
    }

    // Map rows to objects
    const dataRows = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, i) => { obj[header] = row[i]?.toString().trim() || ''; });
      return obj;
    }).filter(row => row.sku); // Skip empty rows

    // Validate all rows first — don't import partial data
    const allErrors = [];
    dataRows.forEach((row, i) => {
      const errors = validateRow(row, i + 2);
      allErrors.push(...errors);
    });

    if (allErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Fix these errors and re-upload.',
        errors: allErrors
      });
    }

    // Group rows by SKU — multiple rows = multiple variants (sizes/colours)
    const productMap = new Map();
    dataRows.forEach(row => {
      const sku = row.sku.toUpperCase().trim();
      if (!productMap.has(sku)) {
        // Find matching image files by filename matching the SKU
        const cleanedSku = sku.toLowerCase();
        const matchedFiles = imageFiles.filter(imgFile => {
          const originalName = imgFile.originalname.toLowerCase();
          const lastDotIndex = originalName.lastIndexOf('.');
          const nameWithoutExt = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
          const cleanedName = nameWithoutExt.trim();

          // Matches "SKU001" or starts with "SKU001_" or "SKU001-"
          if (cleanedName === cleanedSku) return true;
          if (cleanedName.startsWith(cleanedSku + '_') || cleanedName.startsWith(cleanedSku + '-')) return true;
          return false;
        });

        // Sort matching files alphabetically so sequence order is correct (e.g. _1 before _2)
        matchedFiles.sort((a, b) => a.originalname.localeCompare(b.originalname, undefined, { numeric: true, sensitivity: 'base' }));

        // Convert image buffer to base64 string
        const base64Images = matchedFiles.map(imgFile => {
          return `data:${imgFile.mimetype};base64,${imgFile.buffer.toString('base64')}`;
        });

        productMap.set(sku, {
          sku,
          name: row.name,
          description: row.description,
          category: row.category.toLowerCase(),
          type: row.type.toLowerCase(),
          base_price: Number(row.price),
          external_id: `prod_${sku}`,
          images: base64Images.length > 0 ? base64Images : [`/images/products/${sku}_1.jpg`],
          variants: []
        });
      }
      
      // Each row adds a variant
      productMap.get(sku).variants.push({
        size: row.size,
        color: row.colour || '',
        stock: Number(row.quantity) || 0,
        price_override: null
      });
    });

    // Insert products
    const results = { added: 0, skipped: 0, errors: [] };
    for (const [sku, productData] of productMap.entries()) {
      try {
        await ProductRepository.create(productData);
        results.added++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' || err.message.includes('unique') || err.message.includes('duplicate')) {
          results.skipped++;
        } else {
          results.errors.push(`SKU ${sku}: ${err.message}`);
        }
      }
    }

    res.json({
      success: true,
      message: `Import complete. ${results.added} products added, ${results.skipped} skipped (already exist).`,
      results
    });

  } catch (err) {
    logger.error('Bulk upload failed', { error: err.message });
    res.status(500).json({ success: false, message: 'Import failed: ' + err.message });
  }
});

export default router;