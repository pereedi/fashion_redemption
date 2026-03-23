import db from '../config/db.js';
import { logger } from '../utils/logger.js';

class ProductRepository {
  async getAll(filters = {}) {
    try {
      let query = db('products')
        .select('products.*')
        .leftJoin('product_images', 'products.id', 'product_images.product_id')
        .where(function() {
          this.where('product_images.is_primary', true)
              .orWhereNull('product_images.url');
        });

      if (filters.category) {
        query = query.where('category', filters.category);
      }
      if (filters.type) {
        query = query.where('type', filters.type);
      }
      if (filters.name) {
        query.where('products.name', 'like', `%${filters.name}%`);
      }
      if (filters.q) {
        query.where(function() {
          this.where('products.name', 'like', `%${filters.q}%`)
              .orWhere('products.description', 'like', `%${filters.q}%`);
        });
      }
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
        // Sale: Products with discounted prices (on_sale = true or sale_price < base_price)
        query = query.where('products.on_sale', true)
                     .orderBy('products.created_at', 'desc');
      }

      const { page = 1, limit = 12 } = filters;
      const offset = (page - 1) * limit;

      // Clone query for count
      const totalQuery = query.clone().clearSelect().count('* as total').first();
      
      // Apply pagination to products query
      query = query.limit(limit).offset(offset);

      const [products, countResult] = await Promise.all([
        query,
        totalQuery
      ]);

      const total = countResult?.total || 0;
      
      if (products.length === 0) return { products: [], total: 0 };
      
      // Fetch all images and variants for these products
      const productIds = products.map(p => p.id);
      
      const [images, variants] = await Promise.all([
        db('product_images').whereIn('product_id', productIds),
        db('product_variants').whereIn('product_id', productIds)
      ]);

      const mappedProducts = products.map(p => {
        const productImages = images.filter(img => Number(img.product_id) === Number(p.id));
        const primaryImage = productImages.find(img => img.is_primary) || productImages[0];
        
        return {
          ...p,
          id: p.external_id,
          internal_id: p.id,
          basePrice: Number(p.base_price),
          price: `Esp ${Number(p.base_price).toLocaleString()}`,
          image: primaryImage?.url || 'https://via.placeholder.com/400x500',
          images: productImages.map(img => img.url),
          variants: variants.filter(v => Number(v.product_id) === Number(p.id)),
          sizes: [...new Set(variants.filter(v => Number(v.product_id) === Number(p.id)).map(v => v.size))],
          colors: [...new Set(variants.filter(v => Number(v.product_id) === Number(p.id)).map(v => v.color))],
          stock: variants.filter(v => Number(v.product_id) === Number(p.id)).reduce((acc, v) => acc + (v.stock || 0), 0)
        };
      });

      return { products: mappedProducts, total };
    } catch (err) {
      logger.error('Error in ProductRepository.getAll', { error: err.message, filters });
      throw err;
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

      const relatedProducts = relatedProductsRaw.map(p => ({
        ...p,
        id: p.external_id,
        price: `Esp ${Number(p.base_price).toLocaleString()}`,
        image: relatedImages.find(img => img.product_id === p.id)?.url || 'https://via.placeholder.com/400x500'
      }));

      return {
        ...product,
        id: product.external_id,
        internal_id: product.id,
        price: `Esp ${Number(product.base_price).toLocaleString()}`,
        image: images[0]?.url || 'https://via.placeholder.com/400x500',
        images: images.map(img => img.url),
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
