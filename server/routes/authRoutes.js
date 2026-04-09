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
      const missing = [];
      if (!name) missing.push('name');
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      
      console.log('Registration failed: Missing fields', missing);
      return res.status(400).json({ 
        message: `Please provide all required fields. Missing: ${missing.join(', ')}` 
      });
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

    if (!userId) {
      throw new Error('Failed to create user account.');
    }

    const newUser = await UserRepository.findById(userId);
    if (!newUser) {
      console.error('User created but findById returned null:', userId);
      throw new Error('User account created but could not be retrieved. Please try logging in.');
    }

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
          wishlist: newUser.wishlist || []
        }
      }
    });
  } catch (err) {
    console.error('Registration error detailed:', err);
    
    // Check if it is a database connection/configuration error
    const dbErrKeywords = ['ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ENOTFOUND'];
    const isDbError = (err.code && (err.code.startsWith('ER_') || dbErrKeywords.includes(err.code))) || 
                     dbErrKeywords.some(kw => err.message?.includes(kw)) ||
                     err.name === 'AggregateError';
    
    let message = err.message;
    let statusCode = 400;

    if (err.code === 'ER_DUP_ENTRY') {
      message = 'An account with this email already exists.';
    } else if (isDbError) {
      statusCode = 500;
      message = 'Database unreachable. Please ensure your database service is running and correctly configured.';
    }

    res.status(statusCode).json({ message });
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
    const fallbackEmail = process.env.FALLBACK_ADMIN_EMAIL || 'admin@redemption.com';

    try {
      user = await UserRepository.findByEmail(email);
      // Check if returned user is the fallback user (has id 999)
      if (user && user.id === 999) {
        isFallbackUser = true;
      }
    } catch (dbError) {
      // Database unavailable - check for fallback credentials
      console.log('Database unavailable, checking fallback credentials');
      if (email === fallbackEmail && password === FALLBACK_ADMIN.password) {
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

    // Check password for non-fallback users (skip if user has no password - fallback user)
    if (!isFallbackUser && user.password) {
      const isValidPassword = await UserRepository.comparePassword(password, user.password);
      if (!isValidPassword) {
        console.log('Invalid credentials for:', email);
        return res.status(401).json({ message: 'Incorrect email or password' });
      }
    } else if (!isFallbackUser && !user.password) {
      // User exists but has no password - reject
      console.log('User has no password:', email);
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    const token = signToken(user.id);
    console.log('User logged in:', user.id);

    // Skip findById for fallback user to avoid DB call
    const fullUser = isFallbackUser ? user : await UserRepository.findById(user.id);
    
    if (!fullUser) {
      console.error('Login: user.id exists but findById returned null:', user.id);
      return res.status(401).json({ message: 'User account no longer exists or is inaccessible.' });
    }

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
    
    // Check if it is a database connection/configuration error
    const dbErrKeywords = ['ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ENOTFOUND'];
    const isDbError = (err.code && (err.code.startsWith('ER_') || dbErrKeywords.includes(err.code))) || 
                     dbErrKeywords.some(kw => err.message?.includes(kw)) ||
                     err.name === 'AggregateError';
    
    let message = err.message;
    let statusCode = 400;
    
    if (isDbError) {
      statusCode = 500;
      message = 'Database unreachable. Please check your database connection.';
    }
    
    res.status(statusCode).json({ message });
  }
});

export default router;
