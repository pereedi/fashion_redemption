import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import db from './config/db.js';
import analyticsService from './services/analyticsService.js';
import ProductRepository from './repositories/ProductRepository.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parsing Error:', err.message);
    return res.status(400).json({ message: 'Invalid JSON payload received' });
  }
  next();
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Fashion Redemption Server is running' });
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Fashion Redemption Server is running' });
});

// Seed endpoint (call once to add products with Google Drive images)
app.post('/api/seed-products', async (req, res) => {
  try {
    // Check if products already exist
    const existing = await ProductRepository.getAll({});
    if (existing.products && existing.products.length > 0) {
      return res.json({ status: 'Products already exist in database', count: existing.total });
    }

    // Import products from bulkAddProducts
    const module = await import('./scripts/bulkAddProducts.js');
    const { productsToSeed } = module;

    // Add each product
    let added = 0;
    for (const product of productsToSeed) {
      try {
        // Convert Google Drive links
        let imageUrl = product.images[0];
        if (imageUrl && imageUrl.includes('drive.google.com')) {
          let fileId = '';
          if (imageUrl.includes('/file/d/')) {
            fileId = imageUrl.split('/file/d/')[1].split('/')[0];
          } else if (imageUrl.includes('id=')) {
            fileId = imageUrl.split('id=')[1].split('&')[0];
          }
          imageUrl = fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : imageUrl;
        }

        await ProductRepository.create({
          ...product,
          images: [imageUrl]
        });
        added++;
      } catch (err) {
        logger.error(`Failed to add product: ${product.name}`, { error: err.message });
      }
    }

    res.json({ status: 'Seeding completed', added });
  } catch (err) {
    logger.error('Seed endpoint failed', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Using MySQL (Transactional) and DuckDB (Analytics)');
  
  // Run Migrations in Production
  if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
    try {
      console.log('--- PRODUCTION DATABASE SYNC ---');
      console.log('Checking for pending migrations...');
      const [batchNo, appliedMigrations] = await db.migrate.latest();
      if (appliedMigrations.length > 0) {
        console.log(`Success: Applied ${appliedMigrations.length} migrations in batch ${batchNo}`);
        console.log('Updated tables:', appliedMigrations);
      } else {
        console.log('Database is already up to date.');
      }
      console.log('-------------------------------');
    } catch (err) {
      console.error('CRITICAL: Database migration failed on startup!');
      console.error('Error details:', err.message);
      // Don't kill the server, but log heavily so user sees it in Render logs
    }
  }

  // Initialize Analytics
  try {
    await analyticsService.syncFromMySQL();
  } catch (err) {
    console.error('Analytics initialization failed:', err.message);
  }
});

