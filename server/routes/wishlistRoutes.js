import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/wishlist
router.get('/', protect, async (req, res) => {
  try {
    res.json(req.user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/wishlist/toggle
router.post('/toggle', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/wishlist/sync
router.post('/sync', protect, async (req, res) => {
  try {
    const { guestWishlist } = req.body; // Array of product IDs
    const user = req.user;

    // Merge guest wishlist with user wishlist, removing duplicates
    const combined = [...new Set([...user.wishlist, ...guestWishlist])];
    user.wishlist = combined;

    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
