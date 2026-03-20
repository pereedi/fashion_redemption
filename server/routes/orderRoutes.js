import express from 'express';
import OrderRepository from '../repositories/OrderRepository.js';
import { protect } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Optional: Attach user if logged in
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'redemption-secret');
      orderData.user_id = decoded.id;
    }

    const orderId = await OrderRepository.create(orderData);
    const savedOrder = await OrderRepository.getById(orderId);
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders/my-orders - Get logged in user's orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await OrderRepository.getByUserId(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders - Get all orders (for admin)
router.get('/', async (req, res) => {
  try {
    const orders = await OrderRepository.getAll();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
