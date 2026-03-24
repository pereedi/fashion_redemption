import ProductRepository from '../repositories/ProductRepository.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * HELPER: Converts Google Drive share links to direct download links
 * Works for both /file/d/ID/view and ?id=ID formats
 */
const convertGoogleDriveLink = (url) => {
  if (!url || !url.includes('drive.google.com')) return url;
  
  let fileId = '';
  if (url.includes('/file/d/')) {
    fileId = url.split('/file/d/')[1].split('/')[0];
  } else if (url.includes('id=')) {
    fileId = url.split('id=')[1].split('&')[0];
  }
  
  // Use the correct Google Drive direct link format
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
};

/**
 * BULK ADD PRODUCTS SCRIPT
 */
import { productsToSeed } from '../utils/mockProducts.js';

async function seed() {
  if (productsToSeed.length === 0) {
    logger.info('No products found in productsToSeed array. Please add products and run again.');
    process.exit(0);
  }

  logger.info(`Starting bulk seed of ${productsToSeed.length} products...`);

  for (const product of productsToSeed) {
    try {
      // 0. Check for existing product by name (skip if DB not available)
      try {
        const existing = await ProductRepository.getAll({ name: product.name });
        if (existing.products && existing.products.length > 0) {
          logger.info(`Product already exists: ${product.name}. Skipping...`);
          continue;
        }
      } catch (dbErr) {
        logger.warn(`Database not available, adding product without duplicate check: ${product.name}`);
      }

      // 1. Process Google Drive links
      const directImages = product.images.map(convertGoogleDriveLink);
      
      // 2. Prepare payload
      const payload = {
        ...product,
        images: directImages
      };

      // 3. Create via Repository (skip if DB not available)
      try {
        const productId = await ProductRepository.create(payload);
        logger.info(`Successfully added product: ${product.name} (ID: ${productId})`);
      } catch (createErr) {
        logger.warn(`Could not create product in DB, skipping: ${product.name}`);
      }
    } catch (err) {
      logger.error(`Failed to add product: ${product.name}`, { error: err.message });
    }
  }

  logger.info('Bulk seeding completed.');
  process.exit(0);
}

seed();

