import db from '../config/db.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

// Fallback admin user when database is unavailable
const FALLBACK_USER = {
  id: 999,
  email: process.env.FALLBACK_ADMIN_EMAIL || 'admin@redemption.com',
  name: 'Admin User',
  role: 'admin',
  wishlist: []
};

class UserRepository {
  async comparePassword(candidatePassword, hashedPassword) {
    if (!hashedPassword) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
  async findByEmail(email) {
    try {
      return await db('users').where('email', email).first();
    } catch (err) {
      logger.error('Error in UserRepository.findByEmail', { error: err.message, email });
      // Check if this is a fallback user
      const fallbackEmail = process.env.FALLBACK_ADMIN_EMAIL || 'admin@redemption.com';
      if (email === fallbackEmail) {
        return FALLBACK_USER;
      }
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
      // Return fallback user if database unavailable and id matches fallback
      if (id === 999) {
        return FALLBACK_USER;
      }
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

  async getAll() {
    try {
      const users = await db('users').select('id', 'name', 'email', 'role', 'created_at').orderBy('created_at', 'desc');
      return users;
    } catch (err) {
      logger.error('Error in UserRepository.getAll', { error: err.message });
      throw err;
    }
  }

  async updateRole(id, role) {
    try {
      const updated = await db('users').where('id', id).update({ role });
      if (!updated) return null;
      return this.findById(id);
    } catch (err) {
      logger.error('Error in UserRepository.updateRole', { error: err.message, id, role });
      throw err;
    }
  }

  async delete(id) {
    try {
      const deleted = await db('users').where('id', id).del();
      return !!deleted;
    } catch (err) {
      logger.error('Error in UserRepository.delete', { error: err.message, id });
      throw err;
    }
  }
}

export default new UserRepository();
