import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET all products (optional, for listing page)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}, { name: 1, price: 1, category: 1, images: 1, id: 1 });
    res.json(products);
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
