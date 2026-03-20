import express from 'express';
import UserRepository from '../repositories/UserRepository.js';
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

    const hasProduct = user.wishlist.includes(productId);
    if (hasProduct) {
      await UserRepository.removeFromWishlist(user.id, productId);
    } else {
      await UserRepository.addToWishlist(user.id, productId);
    }

    const updatedUser = await UserRepository.findById(user.id);
    res.json(updatedUser.wishlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/wishlist/sync
router.post('/sync', protect, async (req, res) => {
  try {
    const { guestWishlist } = req.body; // Array of product IDs
    const user = req.user;

    for (const pid of guestWishlist) {
      await UserRepository.addToWishlist(user.id, pid);
    }

    const updatedUser = await UserRepository.findById(user.id);
    res.json(updatedUser.wishlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
