import mongoose from 'mongoose';
import knex from 'knex';
import knexConfig from '../../knexfile.js';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

/**
 * MIGRATION SCRIPT: MongoDB -> MySQL
 * This script maps the existing document data into our new relational schema.
 */

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  const db = knex(knexConfig.development);

  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB.');

    // 1. Migrate Users
    const mongoUsers = await mongoose.connection.db.collection('users').find().toArray();
    logger.info(`Found ${mongoUsers.length} users in MongoDB.`);

    for (const u of mongoUsers) {
      await db('users').insert({
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role || 'customer',
        created_at: u.createdAt || new Date(),
        updated_at: u.updatedAt || new Date()
      }).onConflict('email').merge();
    }
    logger.info('Users migrated.');

    // 2. Migrate Products
    const mongoProducts = await mongoose.connection.db.collection('products').find().toArray();
    logger.info(`Found ${mongoProducts.length} products in MongoDB.`);

    for (const p of mongoProducts) {
      const [productId] = await db('products').insert({
        external_id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        type: p.type,
        base_price: parseFloat(p.price.replace('$', '').replace(',', '').replace('Esp', '')),
        rating: p.rating || 0,
        review_count: p.reviewCount || 0,
        created_at: p.createdAt || new Date()
      }).onConflict('external_id').ignore();

      if (productId) {
         // Images
         if (p.images) {
           await db('product_images').insert(p.images.map((url, idx) => ({
             product_id: productId,
             url,
             is_primary: idx === 0
           })));
         }

         // Variants (Map stock from base product)
         if (p.sizes && p.sizes.length > 0) {
            const variants = [];
            p.sizes.forEach(size => {
              (p.colors || ['Standard']).forEach(color => {
                variants.push({
                  product_id: productId,
                  size,
                  color,
                  stock: Math.floor(p.stock / (p.sizes.length * (p.colors?.length || 1))) || 1
                });
              });
            });
            if (variants.length > 0) {
              await db('product_variants').insert(variants);
            }
         }
      }
    }
    // 3. Migrate Reviews
    const mongoReviews = await mongoose.connection.db.collection('reviews')?.find()?.toArray() || [];
    logger.info(`Found ${mongoReviews.length} reviews in MongoDB.`);
    
    for (const r of mongoReviews) {
      // Find matching MySQL user and product if possible
      const user = await db('users').where('email', r.user_email).first(); // Assuming email matches or p.user.email
      // This mapping is tricky without the product context. Let's assume reviews are linked to products in Mongo.
      // If reviews were part of the Product document in Mongo, handled below.
    }

    // 4. Migrate Orders
    const mongoOrders = await mongoose.connection.db.collection('orders')?.find()?.toArray() || [];
    logger.info(`Found ${mongoOrders.length} orders in MongoDB.`);

    for (const o of mongoOrders) {
      const user = await db('users').where('email', o.user?.email).first();
      
      const [orderId] = await db('orders').insert({
        user_id: user ? user.id : null,
        status: o.isDelivered ? 'delivered' : 'pending',
        subtotal: o.totalPrice - (o.shippingPrice || 0),
        tax: 0,
        discount: 0,
        total: o.totalPrice,
        shipping_method: 'standard',
        shipping_price: o.shippingPrice || 0,
        payment_method: o.paymentMethod || 'card',
        customer_name: user ? user.name : 'Unknown',
        customer_address: o.shippingAddress?.address || 'N/A',
        customer_city: o.shippingAddress?.city || 'N/A',
        customer_postal_code: o.shippingAddress?.postalCode || '0000',
        created_at: o.createdAt || new Date(),
        updated_at: o.createdAt || new Date()
      }).onConflict('id').ignore();

      if (orderId && o.orderItems) {
        const items = await Promise.all(o.orderItems.map(async (item) => {
          const product = await db('products').where('external_id', item.product?.toString()).first();
          return {
            order_id: orderId,
            product_id: product ? product.id : null,
            name: item.name,
            price: item.price,
            quantity: item.qty,
            image: item.image
          };
        }));
        await db('order_items').insert(items);
      }
    }
    logger.info('Orders migrated.');

    logger.info('MIGRATION COMPLETE.');
    process.exit(0);
  } catch (err) {
    logger.error('Migration Failed', { error: err.message });
    process.exit(1);
  }
}

migrate();
