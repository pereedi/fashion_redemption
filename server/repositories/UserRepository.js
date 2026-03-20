import db from '../config/db.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

class UserRepository {
  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
  async findByEmail(email) {
    try {
      return await db('users').where('email', email).first();
    } catch (err) {
      logger.error('Error in UserRepository.findByEmail', { error: err.message, email });
      throw err;
    }
  }

  async findById(id) {
    try {
      const user = await db('users').where('id', id).first();
      if (!user) return null;
      
      const wishlist = await db('wishlist')
        .select('products.external_id as product_id')
        .join('products', 'wishlist.product_id', 'products.id')
        .where('wishlist.user_id', id);

      return {
        ...user,
        wishlist: wishlist.map(w => w.product_id)
      };
    } catch (err) {
      logger.error('Error in UserRepository.findById', { error: err.message, id });
      throw err;
    }
  }

  async create(userData) {
    try {
      const [id] = await db('users').insert(userData);
      return id;
    } catch (err) {
      logger.error('Error in UserRepository.create', { error: err.message });
      throw err;
    }
  }

  async addToWishlist(userId, productId) {
    try {
      const product = await db('products').where('external_id', productId).first();
      if (!product) throw new Error('Product not found');
      
      await db('wishlist').insert({
        user_id: userId,
        product_id: product.id
      }).onConflict(['user_id', 'product_id']).ignore();
    } catch (err) {
      logger.error('Error in UserRepository.addToWishlist', { error: err.message, userId, productId });
      throw err;
    }
  }

  async removeFromWishlist(userId, productId) {
    try {
      const product = await db('products').where('external_id', productId).first();
      if (!product) throw new Error('Product not found');

      await db('wishlist')
        .where({ user_id: userId, product_id: product.id })
        .del();
    } catch (err) {
      logger.error('Error in UserRepository.removeFromWishlist', { error: err.message, userId, productId });
      throw err;
    }
  }
}

export default new UserRepository();
