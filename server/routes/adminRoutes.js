import express from 'express';
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
    const { products } = await ProductRepository.getAll({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const productId = await ProductRepository.create(req.body);
    const createdProduct = await ProductRepository.getById(req.body.id || productId);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    // using findOneAndUpdate because id could be string ID or object ID. Let's do object id or string id carefully.
    // Assuming params.id is the unique string `id` or `_id`
    let product = await Product.findById(req.params.id);
    if (!product) {
       product = await Product.findOne({ id: req.params.id });
    }

    if (product) {
      Object.assign(product, req.body);
      const updatedProduct = await product.save();
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
    let product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      // Also try string id
      product = await Product.findOneAndDelete({ id: req.params.id });
    }
    
    if (product) {
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
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status;
      const updatedOrder = await order.save();
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
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = req.body.role || user.role;
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
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
    const [products, orders, users] = await Promise.all([
      ProductRepository.getAll({ limit: 10000 }),
      OrderRepository.getAll(),
      UserRepository.findById(1) // Dummy for count, we need a count all method
    ]);

    // For presentation, use DuckDB for some of these
    const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? parseFloat(o.total) : 0), 0);
    
    // Recent orders snippet (already handled by repo sorting)
    const recentOrders = orders.slice(0, 5);

    // Low stock snippet
    const lowStockProducts = products.products.filter(p => p.stock <= 5).slice(0, 5);

    res.json({ 
      totalProducts: products.total, 
      totalOrders: orders.length, 
      totalUsers: 10, // Placeholder for now 
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
