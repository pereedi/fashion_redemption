/**
 * imageHelper.ts
 *
 * Centralised image URL optimiser.
 * - Cloudinary URLs  → inserts dynamic transformation segments for the given context.
 * - Google Drive / googleusercontent URLs → appends size parameters.
 * - Everything else  → returned unchanged (local paths, Base64, etc.).
 */

type ImageContext = 'card' | 'thumbnail' | 'main' | 'zoom';

/**
 * Cloudinary transformation strings per context.
 *  card      → good quality crop for product listing cards (w 600, h 800)
 *  thumbnail → tiny, fast previews for the gallery strip (w 200, h 200)
 *  main      → high-resolution main view (w 1600, best quality)
 *  zoom      → original full resolution (no resize, best quality)
 */
const CLOUDINARY_TRANSFORMS: Record<ImageContext, string> = {
  card:      'w_600,h_800,c_fill,q_auto,f_auto',
  thumbnail: 'w_200,h_200,c_fill,q_auto,f_auto',
  main:      'w_1600,q_auto,f_auto',
  zoom:      'q_auto:best,f_auto',
};

/**
 * Google Drive / lh3.googleusercontent.com size params per context.
 */
const GDRIVE_SIZE: Record<ImageContext, string> = {
  card:      'w600',
  thumbnail: 'w200',
  main:      'w1600',
  zoom:      's0',   // s0 = original full resolution
};

/**
 * Insert Cloudinary transformations into a Cloudinary URL.
 *
 * Cloudinary URLs look like:
 *   https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{version}/{public_id}
 *
 * We insert transformations right after /upload/
 */
const applyCloudinaryTransform = (url: string, context: ImageContext): string => {
  const transform = CLOUDINARY_TRANSFORMS[context];
  // Avoid double-inserting if a transformation is already present
  if (url.includes(`/upload/${transform}/`) || url.includes(`/upload/${transform}`)) {
    return url;
  }
  return url.replace('/upload/', `/upload/${transform}/`);
};

/**
 * Apply size parameter to a Google Drive / googleusercontent URL.
 * Strips any existing =s… / =w… suffix first, then appends the desired one.
 */
const applyGDriveSize = (url: string, context: ImageContext): string => {
  const size = GDRIVE_SIZE[context];
  // Remove any existing size suffix (=s123, =w456, =s0, etc.)
  const stripped = url.replace(/=[sw]\d+$/, '');
  return `${stripped}=${size}`;
};

/**
 * Main export — call this in every component that renders a product image.
 *
 * @param url     The raw image URL from the database / API.
 * @param context Where the image will be displayed (affects optimisation level).
 * @returns       An optimised URL appropriate for the given context.
 */
export const getCleanImageUrl = (url: string | undefined | null, context: ImageContext = 'main'): string => {
  if (!url) return '';

  // Base64 images → return as-is (can't be transformed remotely)
  if (url.startsWith('data:image/')) return url;

  // Cloudinary-hosted image
  if (url.includes('res.cloudinary.com')) {
    return applyCloudinaryTransform(url, context);
  }

  // Google Drive / googleusercontent (lh3.googleusercontent.com/d/…)
  if (url.includes('googleusercontent.com')) {
    return applyGDriveSize(url, context);
  }

  // Everything else (local paths, Unsplash, etc.) → unchanged
  return url;
};

export default getCleanImageUrl;
