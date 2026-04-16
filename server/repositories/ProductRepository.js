import db from '../config/db.js';
import { logger } from '../utils/logger.js';
import { productsToSeed } from '../utils/mockProducts.js';

class ProductRepository {

  getSampleProducts(filters = {}) {
    const sampleProducts = productsToSeed.map((p, index) => {
      const sanitizedName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return {
        id: `bulk_${index + 1}`,
        internal_id: `bulk_${index + 1}`,
        external_id: `bulk_${index + 1}`,
        name: p.name,
        description: p.description,
        category: p.category.toLowerCase(), // frontend expects lowercase Usually
        type: p.type.toLowerCase(),
        base_price: p.base_price,
        basePrice: p.base_price,
        price: `Esp ${p.base_price.toLocaleString()}`,
        rating: p.rating,
        review_count: p.review_count,
        created_at: new Date(Date.now() - index * 10000), // give them slight logical ordering
        image: `/images/products/${sanitizedName}_1.jpg`,
        images: p.images.map((img, i) => `/images/products/${sanitizedName}_${i + 1}.jpg`),
        sizes: p.variants ? [...new Set(p.variants.map(v => v.size))] : [],
        colors: p.variants ? [...new Set(p.variants.map(v => v.color))] : [],
        stock: p.variants ? p.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : 0,
        variants: p.variants || [],
        reviews: [],
        relatedProducts: []
      };
    });

    // Add back the exactly requested Men's products pointing to the original remaining images
    sampleProducts.push({
      id: 'bulk_99',
      internal_id: 'bulk_99',
      external_id: 'bulk_99',
      name: 'Obsidian Moto Jacket',
      description: 'Premium leather jacket with modern styling',
      category: 'men',
      type: 'clothing',
      basePrice: 125000,
      base_price: 125000,
      price: 'Esp 125,000',
      rating: 4.9,
      review_count: 24,
      created_at: new Date(Date.now() - 5000000),
      image: '/images/products/product_3.jpg',
      images: ['/images/products/product_3.jpg', '/images/products/product_4.jpg'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black'],
      stock: 5,
      variants: [],
      reviews: [],
      relatedProducts: []
    }, {
      id: 'bulk_100',
      internal_id: 'bulk_100',
      external_id: 'bulk_100',
      name: 'Tailored Italian Suit',
      description: 'Precision-tailored from Super 150s wool',
      category: 'men',
      type: 'clothing',
      basePrice: 280000,
      base_price: 280000,
      price: 'Esp 280,000',
      rating: 5.0,
      review_count: 5,
      created_at: new Date(Date.now() - 6000000),
      image: '/images/products/product_6.jpg',
      images: ['/images/products/product_6.jpg'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Navy'],
      stock: 4,
      variants: [],
      reviews: [],
      relatedProducts: []
    });

    let filtered = sampleProducts;
    if (filters.category && filters.category !== 'undefined') {
      filtered = filtered.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.type && filters.type !== 'undefined' && filters.type !== '') {
      filtered = filtered.filter(p => p.type.toLowerCase() === filters.type.toLowerCase());
    }

    // Special filters
    if (filters.filter === 'new') {
      filtered = filtered.sort((a, b) => b.created_at - a.created_at).slice(0, 12);
    }
    if (filters.filter === 'trending') {
      filtered = filtered.filter(p => p.category === 'women')
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);
    }

    return {
      products: filtered,
      total: filtered.length
    };
  }

  getFallbackImages() {
    return [
      '/images/products/product_1.jpg',
      '/images/products/product_2.jpg',
      '/images/products/product_3.jpg',
      '/images/products/product_5.jpg'
    ];
  }

  async getAll(filters = {}) {
    // Validate filters parameter
    if (!filters || typeof filters !== 'object') {
      filters = {};
    }

    try {
      // Build base query without complex join conditions to avoid SQL errors
      let query = db('products').select('products.*');

      // Apply category filter (case-insensitive)
      if (filters.category && filters.category !== 'undefined') {
        query = query.whereRaw('LOWER(category) = ?', [filters.category.toLowerCase()]);
      }

      // Apply type filter (case-insensitive)
      if (filters.type && filters.type !== 'undefined' && filters.type !== '') {
        query = query.whereRaw('LOWER(type) = ?', [filters.type.toLowerCase()]);
      }

      // Apply name filter (search)
      if (filters.name) {
        query = query.where('products.name', 'like', `%${filters.name}%`);
      }

      // Apply general search query
      if (filters.q && filters.q !== 'undefined') {
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
        query = query.orderBy('products.created_at', 'desc');
      }

      const { page = 1, limit = 12 } = filters;
      const offset = (page - 1) * limit;

      const totalQuery = query.clone().clearSelect().count('* as total').first();

      query = query.limit(limit).offset(offset);

      const [products, countResult] = await Promise.all([
        query,
        totalQuery
      ]);

      const total = countResult?.total || 0;

      // If no products in database, return sample products for demo
      if (products.length === 0) {
        return this.getSampleProducts(filters);
      }

      // Fetch all images and variants for these products
      const productIds = products.map(p => p.id);

      const [images, variants] = await Promise.all([
        db('product_images').whereIn('product_id', productIds),
        db('product_variants').whereIn('product_id', productIds)
      ]);

      const fallbackImages = this.getFallbackImages();

      const mappedProducts = products.map(p => {
        const productImages = images.filter(img => Number(img.product_id) === Number(p.id));
        const primaryImage = productImages.find(img => img.is_primary) || productImages[0];

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
      // Return bulk products fallback data when database offline (e.g. Render)
      return this.getSampleProducts(filters);
    }
  }

  async getById(id) {
    if (!id) {
      logger.warn('ProductRepository.getById called with no ID');
      return null;
    }
    const fallbackImages = this.getFallbackImages();
    try {
      const product = await db('products').where('external_id', id).first();
      if (!product) {
          const samples = this.getSampleProducts().products;
          const fallbackProd = samples.find(s => s.id === id || s.internal_id === id);
          if (fallbackProd) return fallbackProd;
          return null;
      }

      const [images, variants, reviews, relatedProductsRaw] = await Promise.all([
        db('product_images').where('product_id', product.id),
        db('product_variants').where('product_id', product.id),
        db('reviews').where('product_id', product.id),
        db('products').where('category', product.category).whereNot('id', product.id).limit(4)
      ]);

      const relatedProductIds = relatedProductsRaw.map(p => p.id);
      const relatedImages = await db('product_images').whereIn('product_id', relatedProductIds).where('is_primary', true);

      const relatedProducts = relatedProductsRaw.map(p => {
        const relatedImg = relatedImages.find(img => img.product_id === p.id);
        return {
          ...p,
          id: p.external_id,
          price: `Esp ${Number(p.base_price).toLocaleString()}`,
          image: relatedImg?.url || fallbackImages[Number(p.id) % fallbackImages.length] || fallbackImages[0]
        };
      });

      const primaryImage = images[0];

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
      const samples = this.getSampleProducts().products;
      const fallbackProd = samples.find(s => s.id === id || s.internal_id === id);
      if (fallbackProd) return fallbackProd;
      throw err;
    }
  }

  async create(productData) {
    const { images, variants, ...baseData } = productData;
    
    // Map basePrice to base_price if needed
    if (baseData.basePrice !== undefined) {
      baseData.base_price = baseData.basePrice;
      delete baseData.basePrice;
    }

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

  async update(id, data) {
    const { images, variants, ...baseData } = data;
    
    // Map basePrice to base_price if needed
    if (baseData.basePrice !== undefined) {
      baseData.base_price = baseData.basePrice;
      delete baseData.basePrice;
    }
    
    return db.transaction(async (trx) => {
      try {
        // 1. Update base product
        const updated = await trx('products').where('external_id', id).update(baseData);
        if (!updated) {
          // Try by id if external_id not found (for safety)
          await trx('products').where('id', id).update(baseData);
        }

        const product = await trx('products').where('external_id', id).first() || await trx('products').where('id', id).first();
        if (!product) return null;

        // 2. Update images (simple approach: replace all)
        if (images) {
          await trx('product_images').where('product_id', product.id).del();
          if (images.length > 0) {
            await trx('product_images').insert(
              images.map((url, index) => ({
                product_id: product.id,
                url,
                is_primary: index === 0
              }))
            );
          }
        }

        // 3. Update variants (simple approach: replace all)
        if (variants) {
          await trx('product_variants').where('product_id', product.id).del();
          if (variants.length > 0) {
            await trx('product_variants').insert(
              variants.map(v => ({
                product_id: product.id,
                ...v
              }))
            );
          }
        }

        return this.getById(id);
      } catch (err) {
        logger.error('Error in ProductRepository.update', { error: err.message, id });
        throw err;
      }
    });
  }

  async delete(id) {
    try {
      const product = await db('products').where('external_id', id).first() || await db('products').where('id', id).first();
      if (!product) return false;

      // Knex handles cascading if migrations are set up, but let's be explicit if needed
      // Actually, let's just delete the product and let MySQL handles foreign keys if set to CASCADE
      const deleted = await db('products').where('id', product.id).del();
      return !!deleted;
    } catch (err) {
      logger.error('Error in ProductRepository.delete', { error: err.message, id });
      throw err;
    }
  }
}

export default new ProductRepository();
