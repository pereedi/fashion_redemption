/**
 * fix_existing_images.js
 *
 * One-time migration script that upgrades all existing image URLs stored in
 * the `product_images` table:
 *
 *  1. Google Drive / lh3.googleusercontent.com URLs → appends =s0 for full resolution.
 *  2. Base64 data URIs → optionally uploads to Cloudinary and replaces with CDN URL.
 *
 * Run once:  node server/scripts/fix_existing_images.js
 */

import dotenv from 'dotenv';
dotenv.config();

import db from '../config/db.js';
import { logger } from '../utils/logger.js';
import { uploadImage, isCloudinaryUrl } from '../services/cloudinaryService.js';

/**
 * Appends =s0 to a googleusercontent / lh3.googleusercontent.com URL
 * so Google serves the original full-resolution image.
 */
const toFullResGDrive = (url) => {
  if (!url.includes('googleusercontent.com')) return url;
  // Strip any existing =s… or =w… suffix
  const stripped = url.replace(/=[sw]\d+$/, '');
  return `${stripped}=s0`;
};

async function run() {
  logger.info('[fix_existing_images] Starting image URL migration...');

  let updated = 0;
  let uploaded = 0;
  let skipped = 0;

  try {
    const rows = await db('product_images').select('id', 'url');
    logger.info(`[fix_existing_images] Found ${rows.length} image record(s) to process.`);

    for (const row of rows) {
      const { id, url } = row;

      if (!url) { skipped++; continue; }

      // Already a Cloudinary URL — nothing to do
      if (isCloudinaryUrl(url)) { skipped++; continue; }

      // Base64 → upload to Cloudinary
      if (url.startsWith('data:image/')) {
        const cloudUrl = await uploadImage(url);
        if (cloudUrl) {
          await db('product_images').where('id', id).update({ url: cloudUrl });
          uploaded++;
          logger.info(`[fix_existing_images] ✅ Uploaded Base64 image (id=${id}) → ${cloudUrl}`);
        } else {
          logger.warn(`[fix_existing_images] ⚠️  Cloudinary not configured – skipped Base64 image (id=${id})`);
          skipped++;
        }
        continue;
      }

      // Google Drive / googleusercontent → bump to full resolution
      if (url.includes('googleusercontent.com')) {
        const newUrl = toFullResGDrive(url);
        if (newUrl !== url) {
          await db('product_images').where('id', id).update({ url: newUrl });
          updated++;
          logger.info(`[fix_existing_images] ✅ Updated GDrive URL (id=${id})\n   from: ${url}\n   to:   ${newUrl}`);
        } else {
          skipped++;
        }
        continue;
      }

      // Anything else (Unsplash, local paths, etc.) → leave alone
      skipped++;
    }

    logger.info(`[fix_existing_images] Done.  Updated: ${updated}  Uploaded to Cloudinary: ${uploaded}  Skipped: ${skipped}`);
  } catch (err) {
    logger.error('[fix_existing_images] Error:', { error: err.message, stack: err.stack });
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

run();
