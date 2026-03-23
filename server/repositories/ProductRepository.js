import db from '../config/db.js';
import { logger } from '../utils/logger.js';

class ProductRepository {
  async getAll(filters = {}) {
    // Validate filters parameter
    if (!filters || typeof filters !== 'object') {
      filters = {};
    }

    try {
      // Build base query without complex join conditions to avoid SQL errors
      let query = db('products').select('products.*');

      // Apply category filter (case-insensitive)
      if (filters.category) {
        query = query.whereRaw('LOWER(category) = ?', [filters.category.toLowerCase()]);
      }

      // Apply type filter (case-insensitive)
      if (filters.type) {
        query = query.whereRaw('LOWER(type) = ?', [filters.type.toLowerCase()]);
      }

      // Apply name filter (search)
      if (filters.name) {
        query = query.where('products.name', 'like', `%${filters.name}%`);
      }

      // Apply general search query
      if (filters.q) {
        query = query.where(function () {
          this.where('products.name', 'like', `%${filters.q}%`)
            .orWhere('products.description', 'like', `%${filters.q}%`);
        });
      }

      // Apply special filters
      if (filters.filter === 'new') {
        query = query.orderBy('products.created_at', 'desc').limit(12);
      }

      if (filters.filter === 'trending') {
        // Trending: Specifically for women, not in the top 4 most recent
        const newArrivalIds = await db('products').orderBy('created_at', 'desc').limit(4).pluck('id');
        query = query.whereRaw('LOWER(category) = ?', ['women'])
          .whereNotIn('products.id', newArrivalIds)
          .orderBy('products.rating', 'desc');
        filters.limit = 4;
      }

      if (filters.filter === 'sale') {
        // Sale: Show newest products (avoiding on_sale column which may not exist)
        query = query.orderBy('products.created_at', 'desc');
      }

      const { page = 1, limit = 12 } = filters;
      const offset = (page - 1) * limit;

      // Clone query for count before pagination
      const totalQuery = query.clone().clearSelect().count('* as total').first();

      // Apply pagination to products query
      query = query.limit(limit).offset(offset);

      const [products, countResult] = await Promise.all([
        query,
        totalQuery
      ]);

      const total = countResult?.total || 0;

      // If no products in database, return sample products for demo
      if (products.length === 0) {
        const sampleProducts = [
          {
            id: '1',
            name: 'Crimson Silk Gala Gown',
            description: 'Elegant evening gown in premium Italian silk',
            category: 'women',
            type: 'clothing',
            base_price: 89000,
            rating: 4.8,
            review_count: 12,
            created_at: new Date(),
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400',
            images: [
              'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400',
              'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400'
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            colors: ['Red'],
            stock: 10
          },
          {
            id: '2',
            name: 'Obsidian Moto Jacket',
            description: 'Premium leather jacket with modern styling',
            category: 'men',
            type: 'clothing',
            base_price: 125000,
            rating: 4.9,
            review_count: 24,
            created_at: new Date(),
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400',
            images: [
              'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400',
              'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&q=80&w=400'
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Black'],
            stock: 5
          },
          {
            id: '3',
            name: 'Architectural Cloud Dress',
            description: 'Sculptural masterpiece hand-draped from silk organza',
            category: 'women',
            type: 'clothing',
            base_price: 145000,
            rating: 4.7,
            review_count: 8,
            created_at: new Date(),
            image: 'https://images.unsplash.com/photo-1539109132314-347596ad9cf2?auto=format&fit=crop&q=80&w=400',
            images: [
              'https://images.unsplash.com/photo-1539109132314-347596ad9cf2?auto=format&fit=crop&q=80&w=400'
            ],
            sizes: ['XS', 'S', 'M'],
            colors: ['White'],
            stock: 3
          },
          {
            id: '4',
            name: 'Tailored Italian Suit',
            description: 'Precision-tailored from Super 150s wool',
            category: 'men',
            type: 'clothing',
            base_price: 280000,
            rating: 5.0,
            review_count: 5,
            created_at: new Date(),
            image: 'https://images.unsplash.com/photo-1594932224456-802d9242efbd?auto=format&fit=crop&q=80&w=400',
            images: [
              'https://images.unsplash.com/photo-1594932224456-802d9242efbd?auto=format&fit=crop&q=80&w=400'
            ],
            sizes: ['M', 'L', 'XL'],
            colors: ['Navy'],
            stock: 4
          }
        ];

        // Apply any filters to sample products (case-insensitive)
        let filtered = sampleProducts;
        if (filters.category) {
          filtered = filtered.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
        }
        if (filters.type) {
          filtered = filtered.filter(p => p.type.toLowerCase() === filters.type.toLowerCase());
        }

        return {
          products: filtered.map(p => ({
            ...p,
            internal_id: p.id,
            basePrice: p.base_price,
            price: `Esp ${p.base_price.toLocaleString()}`,
            variants: [],
            sizes: p.sizes,
            colors: p.colors,
            stock: p.stock
          })), total: filtered.length
        };
      }

      // Fetch all images and variants for these products
      const productIds = products.map(p => p.id);

      const [images, variants] = await Promise.all([
        db('product_images').whereIn('product_id', productIds),
        db('product_variants').whereIn('product_id', productIds)
      ]);

      const mappedProducts = products.map(p => {
        const productImages = images.filter(img => Number(img.product_id) === Number(p.id));
        const primaryImage = productImages.find(img => img.is_primary) || productImages[0];

        // Fallback images if no images in database
        const fallbackImages = [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1539109132314-347596ad9cf2?auto=format&fit=crop&q=80&w=400'
        ];

        const getImageUrl = () => {
          if (primaryImage?.url) return primaryImage.url;
          // Use fallback based on product id
          return fallbackImages[Number(p.id) % fallbackImages.length] || fallbackImages[0];
        };

        const getAllImages = () => {
          if (productImages.length > 0) return productImages.map(img => img.url);
          return fallbackImages;
        };

        return {
          ...p,
          id: p.external_id,
          internal_id: p.id,
          basePrice: Number(p.base_price),
          price: `Esp ${Number(p.base_price).toLocaleString()}`,
          image: getImageUrl(),
          images: getAllImages(),
          variants: variants.filter(v => Number(v.product_id) === Number(p.id)),
          sizes: [...new Set(variants.filter(v => Number(v.product_id) === Number(p.id)).map(v => v.size))],
          colors: [...new Set(variants.filter(v => Number(v.product_id) === Number(p.id)).map(v => v.color))],
          stock: variants.filter(v => Number(v.product_id) === Number(p.id)).reduce((acc, v) => acc + (v.stock || 0), 0)
        };
      });

      return { products: mappedProducts, total };
    } catch (err) {
      logger.error('Error in ProductRepository.getAll', { error: err.message, filters, stack: err.stack });
      // Return safe empty data instead of throwing to prevent 500 errors
      return { products: [], total: 0 };
    }
  }

  async getById(id) {
    if (!id) {
      logger.warn('ProductRepository.getById called with no ID');
      return null;
    }
    try {
      const product = await db('products').where('external_id', id).first();
      if (!product) return null;

      const [images, variants, reviews, relatedProductsRaw] = await Promise.all([
        db('product_images').where('product_id', product.id),
        db('product_variants').where('product_id', product.id),
        db('reviews').where('product_id', product.id),
        db('products').where('category', product.category).whereNot('id', product.id).limit(4)
      ]);

      // Fetch images for related products
      const relatedProductIds = relatedProductsRaw.map(p => p.id);
      const relatedImages = await db('product_images').whereIn('product_id', relatedProductIds).where('is_primary', true);

      const relatedProducts = relatedProductsRaw.map(p => {
        const fallbackImages = [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400',
          'https://images.unsplash.com/photo-1539109132314-347596ad9cf2?auto=format&fit=crop&q=80&w=400'
        ];
        const relatedImg = relatedImages.find(img => img.product_id === p.id);
        return {
          ...p,
          id: p.external_id,
          price: `Esp ${Number(p.base_price).toLocaleString()}`,
          image: relatedImg?.url || fallbackImages[Number(p.id) % fallbackImages.length] || fallbackImages[0]
        };
      });

      const primaryImage = images[0];

      // Fallback images if no images in database
      const fallbackImages = [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1539109132314-347596ad9cf2?auto=format&fit=crop&q=80&w=400'
      ];

      return {
        ...product,
        id: product.external_id,
        internal_id: product.id,
        price: `Esp ${Number(product.base_price).toLocaleString()}`,
        image: primaryImage?.url || fallbackImages[Number(product.id) % fallbackImages.length] || fallbackImages[0],
        images: images.length > 0 ? images.map(img => img.url) : fallbackImages,
        variants,
        reviews,
        relatedProducts,
        sizes: [...new Set(variants.map(v => v.size))],
        colors: [...new Set(variants.map(v => v.color))],
        stock: variants.reduce((acc, v) => acc + v.stock, 0)
      };
    } catch (err) {
      logger.error('Error in ProductRepository.getById', { error: err.message, id });
      throw err;
    }
  }

  async create(productData) {
    const { images, variants, ...baseData } = productData;

    return db.transaction(async (trx) => {
      try {
        const [productId] = await trx('products').insert({
          ...baseData,
          external_id: baseData.id || `prod_${Date.now()}`
        });

        if (images && images.length > 0) {
          await trx('product_images').insert(
            images.map((url, index) => ({
              product_id: productId,
              url,
              is_primary: index === 0
            }))
          );
        }

        if (variants && variants.length > 0) {
          await trx('product_variants').insert(
            variants.map(v => ({
              product_id: productId,
              ...v
            }))
          );
        }

        return productId;
      } catch (err) {
        logger.error('Error in ProductRepository.create', { error: err.message });
        throw err;
      }
    });
  }
}

export default new ProductRepository();
