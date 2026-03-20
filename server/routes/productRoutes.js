import express from 'express';
import ProductRepository from '../repositories/ProductRepository.js';

const router = express.Router();

// GET search products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }


    const { products } = await ProductRepository.getAll({ q });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all products with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const { category, type, sort, q, page = 1, limit = 12, filter } = req.query;
    
    // Using ProductRepository for centralized logic
    const { products, total } = await ProductRepository.getAll({
        category, 
        type, 
        q, 
        sort, 
        page: parseInt(page), 
        limit: parseInt(limit),
        filter
    });

    res.json({
      products,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await ProductRepository.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
