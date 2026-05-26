import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';

const FOLDER = process.env.CLOUDINARY_FOLDER || 'redemption/products';

/**
 * Uploads a single image (Base64 data URI or external URL) to Cloudinary.
 * Returns the secure Cloudinary URL on success.
 * Returns null if Cloudinary is not configured or the upload fails.
 */
export const uploadImage = async (fileStrOrUrl) => {
  if (!isCloudinaryConfigured) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(fileStrOrUrl, {
      folder: FOLDER,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:best', fetch_format: 'auto' }
      ],
    });

    logger.info(`[Cloudinary] Uploaded image: ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    logger.error('[Cloudinary] Upload failed:', { error: err.message });
    return null;
  }
};

/**
 * Processes an array of image strings (Base64 or external URLs).
 * Uploads any Base64 images to Cloudinary, returns the resulting URLs.
 * External URLs are uploaded to Cloudinary for CDN optimization.
 * Falls back to original value if upload fails or Cloudinary is not configured.
 */
export const processImages = async (images = []) => {
  if (!isCloudinaryConfigured || !images.length) {
    return images;
  }

  const processed = await Promise.all(
    images.map(async (img) => {
      if (!img) return img;

      // Only upload Base64 images and external URLs (not already Cloudinary URLs)
      const isBase64 = img.startsWith('data:image/');
      const isExternalNonCloudinary = img.startsWith('http') && !img.includes('res.cloudinary.com');

      if (isBase64 || isExternalNonCloudinary) {
        const cloudUrl = await uploadImage(img);
        return cloudUrl || img; // Fall back to original if upload fails
      }

      return img; // Already a Cloudinary URL, return as-is
    })
  );

  return processed;
};

/**
 * Checks if a URL is a Cloudinary URL.
 */
export const isCloudinaryUrl = (url) => {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
};

export default { uploadImage, processImages, isCloudinaryUrl };
