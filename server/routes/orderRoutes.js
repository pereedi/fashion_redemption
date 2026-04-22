import express from 'express';
import OrderRepository from '../repositories/OrderRepository.js';
import { protect } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

import espeesService from '../services/espeesService.js';

import emailService from '../services/emailService.js';

const router = express.Router();

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Optional: Attach user if logged in
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'redemption-secret');
        orderData.user_id = decoded.id;
      } catch (jwtErr) {
        console.warn('Invalid token provided, proceeding as guest');
      }
    }

    // If payment method is Espees, we handle it differently
    if (orderData.payment.method === 'espees') {
      // 1. Create order as pending
      const orderId = await OrderRepository.create({
        ...orderData,
        status: 'pending'
      });

      // 2. Initiate Espees Payment
      const espeesData = await espeesService.initiatePayment({
        orderId,
        total: orderData.totals.total,
        items: orderData.items,
        customer: orderData.customer
      });

      // 3. Update order with payment_ref
      await OrderRepository.updateStatus(orderId, 'pending'); // Ensure it's pending
      // We need to store return the ref
      const savedOrder = await OrderRepository.getById(orderId);
      
      // Update with ref
      await db('orders').where('id', orderId).update({ payment_ref: espeesData.paymentRef });

      return res.status(201).json({
        ...savedOrder,
        paymentRef: espeesData.paymentRef,
        redirectUrl: espeesData.redirectUrl
      });
    }

    const orderId = await OrderRepository.create(orderData);
    const savedOrder = await OrderRepository.getById(orderId);
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(400).json({ 
      message: 'Failed to create order', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
});

// GET /api/orders/verify-espees/:paymentRef - Verify Espees payment
router.get('/verify-espees/:paymentRef', async (req, res) => {
  const { paymentRef } = req.params;
  try {
    const verification = await espeesService.verifyPayment(paymentRef);
    const order = await OrderRepository.getByPaymentRef(paymentRef);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (verification.transaction_status === 'APPROVED') {
      await OrderRepository.updateStatus(order.id, 'paid');
      
      // Send Email Confirmation
      try { 
        // Get full order details with items for email
        const fullOrder = await OrderRepository.getById(order.id);
        await emailService.sendOrderConfirmation(fullOrder); 
      } catch (e) { 
        console.error('Email failed', e); 
      }

      return res.json({ status: 'success', orderId: order.id });
    } else {
      return res.json({ status: 'failed', message: verification.status_details });
    }
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ message: err.message });
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

// GET /api/orders/verify-order/:orderId - Verify order payment by order ID
router.get('/verify-order/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await OrderRepository.getById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'paid') {
      return res.json({ status: 'success', orderId: order.id });
    }

    if (!order.payment_ref) {
      return res.json({ status: 'failed', message: 'No payment initiated' });
    }

    const verification = await espeesService.verifyPayment(order.payment_ref);

    if (verification.transaction_status === 'APPROVED') {
      await OrderRepository.updateStatus(order.id, 'paid');
      
      // Send Email Confirmation
      try { 
        const fullOrder = await OrderRepository.getById(order.id);
        await emailService.sendOrderConfirmation(fullOrder); 
      } catch (e) { 
        console.error('Email failed', e); 
      }

      return res.json({ status: 'success', orderId: order.id });
    } else {
      return res.json({ status: 'failed', message: verification.transaction_status === 'FAILED' ? (verification.status_details || 'Payment failed') : 'Payment pending' });
    }
  } catch (err) {
    console.error('Error verifying order:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
