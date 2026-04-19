import express from 'express';
import db from '../config/db.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import ProductRepository from '../repositories/ProductRepository.js';
import OrderRepository from '../repositories/OrderRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import AnalyticsService from '../services/analyticsService.js';

const router = express.Router();

// All routes here are protected and require admin role
router.use(protect);
router.use(admin);

// --- PRODUCTS ---
router.get('/products', async (req, res) => {
  try {
    const { products } = await ProductRepository.getAll({ limit: 1000 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const bodySize = JSON.stringify(req.body).length;
    console.log(`[DEBUG] Creating product. Payload size: ${(bodySize / 1024).toFixed(2)} KB`);
    
    // Quick validation
    if (!req.body.name || req.body.basePrice === undefined) {
      console.error('[DEBUG] Validation failed: Missing name or basePrice');
      return res.status(400).json({ message: 'Product Name and Price are required.' });
    }

    const productId = await ProductRepository.create(req.body);
    const createdProduct = await ProductRepository.getById(productId);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await ProductRepository.update(req.params.id, req.body);
    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const success = await ProductRepository.delete(req.params.id);
    if (success) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- ORDERS ---
router.get('/orders', async (req, res) => {
  try {
    const orders = await OrderRepository.getAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const updatedOrder = await OrderRepository.updateStatus(req.params.id, req.body.status);
    if (updatedOrder) {
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- USERS ---
router.get('/users', async (req, res) => {
  try {
    const users = await UserRepository.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const updatedUser = await UserRepository.updateRole(req.params.id, req.body.role);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const success = await UserRepository.delete(req.params.id);
    if (success) {
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- DASHBOARD ANALYTICS PREVIEW ---
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [productsResult, orders, userCount] = await Promise.all([
      ProductRepository.getAll({ limit: 10000 }),
      OrderRepository.getAll(),
      db('users').count('id as count').first()
    ]);

    const products = productsResult.products || [];
    const totalProducts = productsResult.total || 0;

    // For presentation, use DuckDB for some of these
    const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? parseFloat(o.total) : 0), 0);
    
    // Recent orders snippet (already handled by repo sorting)
    const recentOrders = orders.slice(0, 5);

    // Low stock snippet
    const lowStockProducts = products.filter(p => p.stock <= 5).slice(0, 5);

    res.json({ 
      totalProducts, 
      totalOrders: orders.length, 
      totalUsers: userCount?.count || 0, 
      totalRevenue, 
      recentOrders, 
      lowStockProducts 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- ANALYTICS ---
router.get('/analytics', async (req, res) => {
  try {
    // 1. Trigger DuckDB Sync
    await AnalyticsService.syncFromMySQL();
    
    // 2. Query DuckDB
    const revenueByDay = await AnalyticsService.getSalesReport();

    res.json({ revenueByDay });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
