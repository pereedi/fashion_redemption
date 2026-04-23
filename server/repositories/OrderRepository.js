import db from '../config/db.js';
import { logger } from '../utils/logger.js';

class OrderRepository {
  async getAll() {
    try {
      const orders = await db('orders').orderBy('created_at', 'desc');
      return orders;
    } catch (err) {
      logger.error('Error in OrderRepository.getAll', { error: err.message });
      throw err;
    }
  }

  async getById(id) {
    try {
      const order = await db('orders').where('id', id).first();
      if (!order) return null;

      const items = await db('order_items').where('order_id', id);
      return { ...order, items };
    } catch (err) {
      logger.error('Error in OrderRepository.getById', { error: err.message, id });
      throw err;
    }
  }

  async getByUserId(userId) {
    try {
      const orders = await db('orders').where('user_id', userId).orderBy('created_at', 'desc');
      return orders;
    } catch (err) {
      logger.error('Error in OrderRepository.getByUserId', { error: err.message, userId });
      throw err;
    }
  }

  async create(orderData) {
    const { items, ...headerData } = orderData;
    
    return db.transaction(async (trx) => {
      try {
        // 1. Create order header
        const [orderId] = await trx('orders').insert({
          user_id: headerData.user_id,
          status: headerData.status || 'pending',
          payment_ref: headerData.payment_ref || null,
          subtotal: headerData.totals.subtotal,
          tax: headerData.totals.tax,
          discount: headerData.totals.discount,
          total: headerData.totals.total,
          shipping_method: headerData.shipping.method,
          shipping_price: headerData.shipping.price,
          payment_method: headerData.payment.method,
          customer_name: headerData.customer.fullName,
          customer_email: headerData.customer.email,
          customer_address: headerData.customer.address,
          customer_city: headerData.customer.city,
          customer_postal_code: headerData.customer.postalCode
        });

        // 2. Create order items
        if (items && items.length > 0) {
          const itemsToInsert = await Promise.all(items.map(async (item) => {
            if (!item.id) {
              logger.error('Order item missing ID', { item });
              throw new Error(`Order item "${item.name}" is missing a product ID.`);
            }
            const product = await trx('products').where('external_id', item.id).first();
            
            // 3. Inventory management (atomic update)
            if (product) {
              const updated = await trx('product_variants')
                .where({ product_id: product.id, size: item.size })
                .andWhere('stock', '>=', item.quantity)
                .decrement('stock', item.quantity);
              
              if (!updated && item.quantity > 0) {
                throw new Error(`Insufficient stock for product ${item.name} (${item.size})`);
              }
            }

            return {
              order_id: orderId,
              product_id: product ? product.id : null,
              name: item.name,
              price: item.price !== undefined ? String(item.price).replace(/[^0-9.]/g, '') : '0.00',
              quantity: item.quantity,
              size: item.size,
              image: item.image
            };
          }));

          await trx('order_items').insert(itemsToInsert);
        }

        return orderId;
      } catch (err) {
        logger.error('Order Transaction Failed', { error: err.message });
        throw err; // Rollback
      }
    });
  }

  async updateStatus(id, status) {
    try {
      const updateData = { status };
      if (status === 'paid') {
        updateData.paid_at = db.fn.now();
      }
      const updated = await db('orders').where('id', id).update(updateData);
      if (!updated) return null;
      return this.getById(id);
    } catch (err) {
      logger.error('Error in OrderRepository.updateStatus', { error: err.message, id, status });
      throw err;
    }
  }

  async getByPaymentRef(paymentRef) {
    try {
      const order = await db('orders').where('payment_ref', paymentRef).first();
      if (!order) return null;
      return this.getById(order.id);
    } catch (err) {
      logger.error('Error in OrderRepository.getByPaymentRef', { error: err.message, paymentRef });
      throw err;
    }
  }

  async deleteAndRestoreStock(orderId) {
    return db.transaction(async (trx) => {
      try {
        // 1. Get all items for the order
        const items = await trx('order_items').where('order_id', orderId);
        
        // 2. Restore stock for each item
        for (const item of items) {
          if (item.product_id && item.size) {
            await trx('product_variants')
              .where({ product_id: item.product_id, size: item.size })
              .increment('stock', item.quantity);
          }
        }
        
        // 3. Delete order items and order
        await trx('order_items').where('order_id', orderId).del();
        await trx('orders').where('id', orderId).del();
        
        logger.info('Order deleted and stock restored after failure', { orderId });
      } catch (err) {
        logger.error('Failed to restore stock during order deletion', { orderId, error: err.message });
        throw err;
      }
    });
  }
}

export default new OrderRepository();
