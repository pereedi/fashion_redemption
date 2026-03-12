import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET search products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(10);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all products with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const { category, type, size, color, sort, q, page = 1, limit = 12 } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (size) query.sizes = size;
    if (color) query.colors = color;
    if (q) query.$text = { $search: q };

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { rating: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
