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
const productsToSeed = [
  /* 
  EXAMPLE PRODUCT FORMAT:
  {
    name: "Luxury Silk Scarf",
    description: "Hand-crafted premium silk with intricate patterns.",
    category: "WOMEN",
    type: "ACCESSORIES",
    base_price: 150.00,
    rating: 4.8,
    review_count: 12,
    images: ["GOOGLE_DRIVE_LINK_HERE"],
    variants: [
      { size: "ONE SIZE", color: "RED", stock: 50 },
      { size: "ONE SIZE", color: "BLUE", stock: 30 }
    ]
  }
  */
  {
  name: "Girls Bow Detail Tiered Dress",
  description: "Soft lightweight white tiered dress designed for young girls, featuring puff sleeves and elegant black bow accents for a stylish and comfortable everyday look.",
  category: "KIDS",
  type: "DRESSES",
  base_price: 65.00,
  rating: 4.6,
  review_count: 8,
  images: ["https://drive.google.com/file/d/1lteZMTt51_lcfF6vOv2mcwbxJFApghkE/view?usp=sharing"],
  variants: [
    { size: "S", color: "WHITE", stock: 40 },
    { size: "SM", color: "WHITE", stock: 35 },
    { size: "SL", color: "WHITE", stock: 25 }
  ]
},
{
  name: "Girls Floral Halter Neck Dress",
  description: "Elegant sleeveless halter neck dress for girls featuring a soft white base with vibrant pink floral prints. Designed with a lightweight flowing silhouette for comfort and style, making it perfect for casual outings and special occasions.",
  category: "KIDS",
  type: "DRESSES",
  base_price: 72.00,
  rating: 4.7,
  review_count: 11,
  images: ["https://drive.google.com/file/d/11k6Cvz3w6jSW9g7YrTOUR04XSO_QTpBZ/view?usp=sharing"],
  variants: [
    { size: "XS", color: "WHITE FLORAL", stock: 45 },
    { size: "S", color: "WHITE FLORAL", stock: 40 },
    { size: "M", color: "WHITE FLORAL", stock: 35 },
    { size: "L", color: "WHITE FLORAL", stock: 28 },
    { size: "XL", color: "WHITE FLORAL", stock: 20 }
  ]
},
{
  name: "Boys Ribbed Knit Hoodie Sweater",
  description: "Stylish navy blue ribbed knit hoodie sweater for boys designed with a soft textured finish, drawstring hood and long sleeves for warmth and everyday comfort. Perfect for casual outings and layered looks.",
  category: "KIDS",
  type: "TOPS",
  base_price: 68.00,
  rating: 4.5,
  review_count: 9,
  images: ["https://drive.google.com/file/d/1JgD-_69_KuTN0CQC_lgwFDSMNT6fGACI/view?usp=sharing"],
  variants: [
    { size: "XS", color: "NAVY BLUE", stock: 50 },
    { size: "S", color: "NAVY BLUE", stock: 45 },
    { size: "M", color: "NAVY BLUE", stock: 38 },
    { size: "L", color: "NAVY BLUE", stock: 30 },
    { size: "XL", color: "NAVY BLUE", stock: 22 }
  ]
},
{
  name: "Boys Denim Smock Coverall",
  description: "Modern denim smock style coverall designed for boys featuring a relaxed silhouette with exposed sleeves for comfort and mobility. Durable lightweight jean fabric makes it perfect for casual wear and playful activities.",
  category: "KIDS",
  type: "OUTERWEAR",
  base_price: 75.00,
  rating: 4.6,
  review_count: 10,
  images: ["https://drive.google.com/file/d/15E7TbC5nWad0Gyt15PqjrCagsPOatnDc/view?usp=sharing"],
  variants: [
    { size: "XS", color: "DENIM BLUE", stock: 40 },
    { size: "S", color: "DENIM BLUE", stock: 35 },
    { size: "M", color: "DENIM BLUE", stock: 30 },
    { size: "L", color: "DENIM BLUE", stock: 25 },
    { size: "XL", color: "DENIM BLUE", stock: 20 }
  ]
},
{
  name: "Girls Classic Casual Day Gown",
  description: "Comfortable everyday gown for girls crafted with soft breathable fabric and a simple elegant silhouette. Designed for school events, outings and relaxed daily wear.",
  category: "KIDS",
  type: "DRESSES",
  base_price: 60.00,
  rating: 4.4,
  review_count: 7,
  images: ["https://drive.google.com/file/d/1zWw83JCZw485aQ_xkI8W6GtI76Ym3fvf/view?usp=sharing"],
  variants: [
    { size: "XS", color: "PASTEL PINK", stock: 45 },
    { size: "S", color: "PASTEL PINK", stock: 40 },
    { size: "M", color: "PASTEL PINK", stock: 35 },
    { size: "L", color: "PASTEL PINK", stock: 28 },
    { size: "XL", color: "PASTEL PINK", stock: 22 }
  ]
},
{
  name: "Girls Spaghetti Strap Flow Dress",
  description: "Stylish lightweight spaghetti strap gown designed for girls featuring a flowing silhouette and minimal elegant detailing. Ideal for summer outings, birthdays and special occasions.",
  category: "KIDS",
  type: "DRESSES",
  base_price: 70.00,
  rating: 4.7,
  review_count: 12,
  images: ["https://drive.google.com/file/d/1_zx7wPebwuSQMiGnVYTgfzwOkuNkP6ys/view?usp=sharing"],
  variants: [
    { size: "XS", color: "LAVENDER", stock: 42 },
    { size: "S", color: "LAVENDER", stock: 38 },
    { size: "M", color: "LAVENDER", stock: 34 },
    { size: "L", color: "LAVENDER", stock: 26 },
    { size: "XL", color: "LAVENDER", stock: 18 }
  ]
},
// Women category
{
  name: "Women Elegant Pleated Midi Dress",
  description: "Sophisticated pleated midi dress designed with a flattering waistline and flowing silhouette, perfect for office wear and formal occasions.",
  category: "WOMEN",
  type: "DRESSES",
  base_price: 120.00,
  rating: 4.8,
  review_count: 21,
  images: ["https://drive.google.com/file/d/1DlFFbHMxvWbg0coUbDoiQaCZGPtUT3JX/view?usp=sharing"],
  variants: [
    { size: "XS", color: "EMERALD GREEN", stock: 30 },
    { size: "S", color: "EMERALD GREEN", stock: 28 },
    { size: "M", color: "EMERALD GREEN", stock: 25 },
    { size: "L", color: "EMERALD GREEN", stock: 20 },
    { size: "XL", color: "EMERALD GREEN", stock: 15 }
  ]
},
{
  name: "Women Tailored Structured Blazer",
  description: "Premium tailored blazer featuring clean lines and a sharp silhouette, ideal for power dressing and formal layering.",
  category: "WOMEN",
  type: "OUTERWEAR",
  base_price: 140.00,
  rating: 4.7,
  review_count: 19,
  images: ["https://drive.google.com/file/d/1yRHS2f8ipOXyOjAyI7U7c6rgBQwbHT4Z/view?usp=sharing"],
  variants: [
    { size: "XS", color: "BLACK", stock: 25 },
    { size: "S", color: "BLACK", stock: 23 },
    { size: "M", color: "BLACK", stock: 20 },
    { size: "L", color: "BLACK", stock: 17 },
    { size: "XL", color: "BLACK", stock: 12 }
  ]
},
{
  name: "Women Ribbed Knit Bodycon Dress",
  description: "Figure-hugging ribbed knit bodycon dress crafted for modern elegance and versatile day-to-night styling.",
  category: "WOMEN",
  type: "DRESSES",
  base_price: 95.00,
  rating: 4.6,
  review_count: 13,
  images: ["https://drive.google.com/file/d/1SVx-VZZMUHJ478ZAMge0Qpo5ZaWY9Ny_/view?usp=sharing"],
  variants: [
    { size: "XS", color: "BURGUNDY", stock: 28 },
    { size: "S", color: "BURGUNDY", stock: 26 },
    { size: "M", color: "BURGUNDY", stock: 23 },
    { size: "L", color: "BURGUNDY", stock: 18 },
    { size: "XL", color: "BURGUNDY", stock: 14 }
  ]
},
{
  name: "Women Cropped Denim Jacket",
  description: "Trendy cropped denim jacket designed with classic stitching details and a contemporary silhouette for effortless layering.",
  category: "WOMEN",
  type: "OUTERWEAR",
  base_price: 110.00,
  rating: 4.5,
  review_count: 16,
  images: ["https://drive.google.com/file/d/1s0Muk2at3mWYm2Kj2crBPkv-_oj0R2C1/view?usp=sharing"],
  variants: [
    { size: "XS", color: "DENIM BLUE", stock: 30 },
    { size: "S", color: "DENIM BLUE", stock: 27 },
    { size: "M", color: "DENIM BLUE", stock: 24 },
    { size: "L", color: "DENIM BLUE", stock: 20 },
    { size: "XL", color: "DENIM BLUE", stock: 15 }
  ]
},
{
  name: "Women Tailored Power Suit",
  description: "Professional two-piece tailored suit designed with a structured blazer and slim-fit trousers for a confident and sophisticated look.",
  category: "WOMEN",
  type: "SUITS",
  base_price: 220.00,
  rating: 4.8,
  review_count: 20,
  images: ["https://drive.google.com/file/d/18dW8ucNXWorE-EwN_1wus0asl6NMeKLh/view?usp=sharing"],
  variants: [
    { size: "XS", color: "CHARCOAL GREY", stock: 20 },
    { size: "S", color: "CHARCOAL GREY", stock: 18 },
    { size: "M", color: "CHARCOAL GREY", stock: 16 },
    { size: "L", color: "CHARCOAL GREY", stock: 14 },
    { size: "XL", color: "CHARCOAL GREY", stock: 10 }
  ]
},
{
  name: "Women Relaxed Linen Suit",
  description: "Lightweight breathable linen suit set designed with a relaxed blazer and wide leg pants for modern summer elegance.",
  category: "WOMEN",
  type: "SUITS",
  base_price: 165.00,
  rating: 4.6,
  review_count: 15,
  images: ["https://drive.google.com/file/d/1sCMANDxl2kgxgqZAr7ZSeYG1kCS8U9Ql/view?usp=sharing"],
  variants: [
    { size: "XS", color: "SAND BEIGE", stock: 26 },
    { size: "S", color: "SAND BEIGE", stock: 24 },
    { size: "M", color: "SAND BEIGE", stock: 21 },
    { size: "L", color: "SAND BEIGE", stock: 17 },
    { size: "XL", color: "SAND BEIGE", stock: 12 }
  ]
}

];

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

export { productsToSeed };
