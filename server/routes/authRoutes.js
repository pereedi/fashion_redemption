import express from 'express';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'redemption-secret', {
    expiresIn: '30d'
  });
};

// Fallback admin credentials when database is unavailable
const FALLBACK_ADMIN = {
  email: process.env.FALLBACK_ADMIN_EMAIL || 'admin@redemption.com',
  password: process.env.FALLBACK_ADMIN_PASSWORD || 'admin123',
  name: 'Admin User',
  role: 'admin'
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt body:', req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log('Missing registration fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await UserRepository.create({ 
      name, 
      email, 
      password: hashedPassword 
    });
    
    const newUser = await UserRepository.findById(userId);
    console.log('User created successfully:', userId);
    const token = signToken(userId);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: userId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          wishlist: newUser.wishlist
        }
      }
    });
  } catch (err) {
    console.error('Registration error detailed:', err);
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing login fields:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    let user = null;
    let isFallbackUser = false;

    try {
      user = await UserRepository.findByEmail(email);
    } catch (dbError) {
      // Database unavailable - check for fallback credentials
      console.log('Database unavailable, checking fallback credentials');
      if (email === FALLBACK_ADMIN.email && password === FALLBACK_ADMIN.password) {
        user = {
          id: 999,
          email: FALLBACK_ADMIN.email,
          name: FALLBACK_ADMIN.name,
          role: FALLBACK_ADMIN.role,
          wishlist: []
        };
        isFallbackUser = true;
        console.log('Authenticated via fallback admin credentials');
      }
    }

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Check password for non-fallback users
    if (!isFallbackUser && !(await UserRepository.comparePassword(password, user.password))) {
      console.log('Invalid credentials for:', email);
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    const token = signToken(user.id);
    console.log('User logged in:', user.id);

    // Skip findById for fallback user to avoid DB call
    const fullUser = isFallbackUser ? user : await UserRepository.findById(user.id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: fullUser.id,
          name: fullUser.name,
          email: fullUser.email,
          role: fullUser.role,
          wishlist: fullUser.wishlist || []
        }
      }
    });
  } catch (err) {
    console.error('Login error detailed:', err);
    res.status(400).json({ message: err.message });
  }
});

export default router;
