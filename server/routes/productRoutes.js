import express from 'express';
import ProductRepository from '../repositories/ProductRepository.js';

const router = express.Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extract simple filter keywords from a natural language chatbot message.
 * Supports colour, category, and price intent detection.
 */
function parseMessage(message = '') {
  const text = message.toLowerCase();
  const filters = {};

  // Category detection
  if (text.includes('women') || text.includes('woman') || text.includes('female')) {
    filters.category = 'WOMEN';
  } else if (text.includes('men') || text.includes('man') || text.includes('male') || text.includes('guy')) {
    filters.category = 'MEN';
  } else if (text.includes('kid') || text.includes('child') || text.includes('boy') || text.includes('girl')) {
    filters.category = 'KIDS';
  }

  // Color detection
  const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'brown', 'grey', 'gray', 'navy', 'gold', 'silver', 'beige', 'cream'];
  for (const color of colors) {
    if (text.includes(color)) {
      filters.color = color.toUpperCase();
      break;
    }
  }

  // Price cap detection  (e.g. "under 200", "below 150 esp")
  const priceMatch = text.match(/(?:under|below|less than|max|maximum)\s*[\$£€]?\s*(\d+)/i);
  if (priceMatch) {
    filters.maxPrice = parseFloat(priceMatch[1]);
  }

  // Minimum price detection (e.g. "over 100")
  const minPriceMatch = text.match(/(?:over|above|more than|min|minimum)\s*[\$£€]?\s*(\d+)/i);
  if (minPriceMatch) {
    filters.minPrice = parseFloat(minPriceMatch[1]);
  }

  // New / trending / sale intent
  if (text.includes('new') || text.includes('latest') || text.includes('arrival')) {
    filters.filter = 'new';
  } else if (text.includes('trending') || text.includes('popular')) {
    filters.filter = 'trending';
  } else if (text.includes('sale') || text.includes('discount') || text.includes('deal')) {
    filters.filter = 'sale';
  }

  // General keyword query — use the full message but strip filler words
  const stopWords = ['show', 'me', 'find', 'get', 'i', 'want', 'looking', 'for', 'some', 'a', 'an', 'the', 'please', 'can', 'you'];
  const tokens = text.split(/\s+/).filter(t => !stopWords.includes(t) && t.length > 2);
  if (tokens.length > 0) {
    filters.q = tokens.join(' ');
  }

  return filters;
}

/**
 * Shape a raw product record into the integration-safe response object.
 */
function toPublicProduct(p, detail = false) {
  const base = {
    id: p.id || p.external_id,
    name: p.name,
    price: p.basePrice ?? p.base_price ?? null,
    currency: 'ESP',
    image: p.image || (Array.isArray(p.images) ? p.images[0] : null),
    availability: (p.stock ?? 0) > 0
  };

  if (detail) {
    return {
      ...base,
      description: p.description || '',
      images: p.images || [],
    };
  }

  return base;
}

// ─── GET /search ─────────────────────────────────────────────────────────────

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const { products } = await ProductRepository.getAll({ q });

    res.json({
      success: true,
      data: products.map(p => toPublicProduct(p))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET / ────────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const {
      category, type, sort, q, filter,
      color, minPrice, maxPrice,
      page = 1, limit = 12
    } = req.query;

    const { products, total } = await ProductRepository.getAll({
      category, type, q, sort, filter,
      color, minPrice, maxPrice,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: products.map(p => toPublicProduct(p)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products'
    });
  }
});

// ─── POST /chatbot/query ──────────────────────────────────────────────────────

router.post('/chatbot/query', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A "message" string is required in the request body.'
      });
    }

    const filters = parseMessage(message);
    const { products } = await ProductRepository.getAll({ ...filters, limit: 10 });

    res.json({
      success: true,
      message: products.length
        ? 'Products retrieved successfully'
        : 'No products matched your request. Try broadening your search.',
      data: products.map(p => toPublicProduct(p))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Chatbot query failed.' });
  }
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const product = await ProductRepository.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      data: toPublicProduct(product, true)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
