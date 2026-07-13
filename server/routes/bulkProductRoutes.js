import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import ProductRepository from '../repositories/ProductRepository.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,  // 2 MB per file
    files: 501                   // 1 CSV + up to 500 images
  }
});

const uploadFields = upload.fields([
  { name: 'file',   maxCount: 1   },
  { name: 'images', maxCount: 500 }
]);

// ─── Required columns matching your actual spreadsheet ───────────────────────
// Accepts: category_id, brand name, product name, description, sku,
//          cost_price, selling_price, quantity, image
// Also supports the older format for backwards compatibility:
//          name, category, type, price, size, colour
const REQUIRED_COLUMNS = ['sku', 'product name', 'description', 'selling_price', 'quantity'];

// ─── Category ID → category/type mapping ─────────────────────────────────────
// Update these IDs to match whatever values are in your category_id column
const CATEGORY_ID_MAP = {
  // Men's clothing
  '1':  { category: 'men',        type: 'shirts'              },
  '2':  { category: 'men',        type: 'trousers'            },
  '3':  { category: 'men',        type: 'jeans'               },
  '4':  { category: 'men',        type: 'suits'               },
  '5':  { category: 'men',        type: '3-piece-suits'       },
  '6':  { category: 'men',        type: 'up-and-down-sets'    },
  '7':  { category: 'men',        type: 'shirt-and-trouser-sets' },
  '8':  { category: 'men',        type: 'jackets'             },
  '9':  { category: 'men',        type: 'shorts'              },
  // Women's clothing
  '10': { category: 'women',      type: 'dresses'             },
  '11': { category: 'women',      type: 'tops'                },
  '12': { category: 'women',      type: 'skirts'              },
  '13': { category: 'women',      type: 'pants'               },
  '14': { category: 'women',      type: 'jumpsuits'           },
  '15': { category: 'women',      type: '3-piece-sets'        },
  '16': { category: 'women',      type: 'jackets'             },
  '17': { category: 'women',      type: 'denim'               },
  // Kids
  '18': { category: 'kids',       type: 'boys'                },
  '19': { category: 'kids',       type: 'girls'               },
  '20': { category: 'kids',       type: 'baby'                },
  // Footwear
  '21': { category: 'footwear',   type: 'sneakers'            },
  '22': { category: 'footwear',   type: 'sandals'             },
  '23': { category: 'footwear',   type: 'heels'               },
  '24': { category: 'footwear',   type: 'boots'               },
  '25': { category: 'footwear',   type: 'slippers'            },
  // Accessories
  '26': { category: 'accessories', type: 'bags'               },
  '27': { category: 'accessories', type: 'belts'              },
  '28': { category: 'accessories', type: 'hats'               },
};

// Also accept plain text category names (fallback if no category_id)
const CATEGORY_NAME_MAP = {
  'men':         { category: 'men',        type: 'clothing'   },
  'women':       { category: 'women',      type: 'clothing'   },
  'kids':        { category: 'kids',       type: 'clothing'   },
  'footwear':    { category: 'footwear',   type: 'sneakers'   },
  'accessories': { category: 'accessories', type: 'bags'      },
};

const resolveCategory = (categoryId, categoryName) => {
  // Try ID first
  if (categoryId) {
    const idStr = String(categoryId).trim();
    if (CATEGORY_ID_MAP[idStr]) return CATEGORY_ID_MAP[idStr];
  }
  // Fall back to plain name
  if (categoryName) {
    const key = String(categoryName).toLowerCase().trim();
    if (CATEGORY_NAME_MAP[key]) return CATEGORY_NAME_MAP[key];
  }
  return null;
};

// ─── Parse CSV / Excel ────────────────────────────────────────────────────────
const parseSheet = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1 });
};

// ─── Normalise a header so "Product Name", "product name", "PRODUCT NAME"
//     all become "product name" ───────────────────────────────────────────────
const normaliseHeader = (h) =>
  h?.toString().toLowerCase().replace(/\s+/g, ' ').trim() || '';

// ─── Per-row validation ───────────────────────────────────────────────────────
const validateRow = (row, index) => {
  const errors = [];
  if (!row.sku)                                         errors.push(`Row ${index}: SKU is required`);
  if (!row['product name'] && !row.name)                errors.push(`Row ${index}: Product name is required`);
  if (!row['selling_price'] && !row['price'] ||
      isNaN(Number(row['selling_price'] ?? row['price'])))
                                                        errors.push(`Row ${index}: Valid selling price is required`);
  if (!row['quantity'] || isNaN(Number(row['quantity'])))
                                                        errors.push(`Row ${index}: Valid quantity is required`);
  return errors;
};

// ─── Route ────────────────────────────────────────────────────────────────────
router.post('/bulk-upload', uploadFields, async (req, res) => {
  const files      = req.files || {};
  const fileArray  = files['file'];
  const imageFiles = files['images'] || [];

  if (!fileArray || fileArray.length === 0) {
    return res.status(400).json({ success: false, message: 'No CSV or Excel file uploaded' });
  }

  const sheetFile = fileArray[0];
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Some OS / browsers report CSV differently
    'application/csv',
    'text/plain',
  ];

  if (!allowedTypes.includes(sheetFile.mimetype)) {
    return res.status(400).json({
      success: false,
      message: `Unsupported file type: ${sheetFile.mimetype}. Upload a .csv, .xls, or .xlsx file.`
    });
  }

  try {
    const rows = parseSheet(sheetFile.buffer);

    if (rows.length < 2) {
      return res.status(400).json({ success: false, message: 'File is empty or has no data rows' });
    }

    // Normalise headers
    const headers = rows[0].map(normaliseHeader);

    // Check required columns
    const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missing.join(', ')}. ` +
                 `Your file has: ${headers.filter(Boolean).join(', ')}`
      });
    }

    // Map rows → objects using normalised headers
    const dataRows = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        if (header) obj[header] = row[i]?.toString().trim() ?? '';
      });
      return obj;
    }).filter(row => row.sku && row.sku.trim() !== ''); // skip blank rows

    // Validate all rows before importing anything
    const allErrors = [];
    dataRows.forEach((row, i) => {
      allErrors.push(...validateRow(row, i + 2));
    });

    if (allErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed — fix these errors and re-upload.',
        errors: allErrors
      });
    }

    // ── Group by SKU (multiple rows = multiple size/colour variants) ──────────
    const productMap = new Map();

    dataRows.forEach(row => {
      const sku = row.sku.toUpperCase().trim();

      if (!productMap.has(sku)) {
        // Resolve category
        const catResult = resolveCategory(
          row['category_id'] || row['category id'],
          row['category'] || row['category name']
        );

        // Find matching uploaded images by filename
        const skuLower = sku.toLowerCase();
        const matchedImages = imageFiles
          .filter(imgFile => {
            const name = imgFile.originalname.toLowerCase();
            const base = name.includes('.') ? name.substring(0, name.lastIndexOf('.')) : name;
            return (
              base === skuLower ||
              base.startsWith(skuLower + '_') ||
              base.startsWith(skuLower + '-')
            );
          })
          .sort((a, b) =>
            a.originalname.localeCompare(b.originalname, undefined, {
              numeric: true, sensitivity: 'base'
            })
          )
          .map(imgFile =>
            `data:${imgFile.mimetype};base64,${imgFile.buffer.toString('base64')}`
          );

        productMap.set(sku, {
          sku,
          name:        row['product name'] || row['name'] || row['brand name'] || sku,
          description: row['description']  || '',
          category:    catResult?.category || 'men',
          type:        catResult?.type     || 'clothing',
          base_price:  Number(row['selling_price'] || row['price'] || 0),
          external_id: `prod_${sku}`,
          // Use uploaded images if present, otherwise default path by SKU
          images: matchedImages.length > 0
            ? matchedImages
            : [`/images/products/${sku}_1.jpg`],
          variants: []
        });
      }

      // Each row becomes a variant
      const size   = row['size']   || row['sizes']  || 'One Size';
      const colour = row['colour'] || row['color']  || row['colours'] || '';
      const stock  = Number(row['quantity'] || 0);

      productMap.get(sku).variants.push({
        size,
        color: colour,
        stock,
        price_override: null
      });
    });

    // ── Insert ────────────────────────────────────────────────────────────────
    const results = { added: 0, skipped: 0, errors: [] };

    for (const [sku, productData] of productMap.entries()) {
      try {
        await ProductRepository.create(productData);
        results.added++;
      } catch (err) {
        const isDuplicate =
          err.code === 'ER_DUP_ENTRY' ||
          (err.message || '').toLowerCase().includes('unique') ||
          (err.message || '').toLowerCase().includes('duplicate');

        if (isDuplicate) {
          results.skipped++;
        } else {
          results.errors.push(`SKU ${sku}: ${err.message}`);
        }
      }
    }

    return res.json({
      success: true,
      message: `Import complete. ${results.added} product${results.added !== 1 ? 's' : ''} added, ${results.skipped} skipped (already exist).`,
      results
    });

  } catch (err) {
    logger.error('Bulk upload failed', { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: 'Import failed: ' + err.message });
  }
});

export default router;