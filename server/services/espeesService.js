import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

class EspeesService {
  constructor() {
    this.apiKey = process.env.ESPEES_API_KEY;
    this.merchantWallet = process.env.ESPEES_MERCHANT_WALLET;
    this.baseUrl = 'https://api.espees.org';
    this.paymentUrl = 'https://payment.espees.org/pay';
    
    if (!this.apiKey) {
      logger.error('ESPEES_API_KEY is missing in environment!');
    } else {
      logger.info('EspeesService initialized successfully');
    }
  }

  /**
   * Initialize a payment by creating a product in the Espees system
   * @param {Object} orderData 
   * @returns {Promise<string>} payment_ref
   */
  async initiatePayment(orderData) {
    try {
      const { orderId, total, items, customer } = orderData;
      
      const payload = {
        product_sku: `ORD-${orderId}`,
        narration: `Payment for Order #${orderId} at Fashion Redemption`,
        price: parseFloat(total),
        merchant_wallet: this.merchantWallet,
        success_url: `${process.env.BASE_URL}/payment/verify?orderId=${orderId}`,
        fail_url: `${process.env.BASE_URL}/payment/verify?orderId=${orderId}&status=failed`,
        user_data: {
          orderId,
          customerName: customer.fullName,
          email: customer.email // Assuming we have email
        }
      };

      logger.info('Initiating Espees payment', { orderId, total });

      const response = await fetch(`${this.baseUrl}/payment/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.statusCode !== 200) {
        logger.error('Espees payment initiation failed', { 
          statusCode: data.statusCode,
          message: data.message,
          fullResponse: data 
        });
        throw new Error(data.message || 'Failed to initialize Espees payment');
      }

      return {
        paymentRef: data.productid,
        redirectUrl: `${this.paymentUrl}/${data.productid}`
      };
    } catch (err) {
      logger.error('Espees Initiation Error', { error: err.message });
      throw err;
    }
  }

  /**
   * Verify a transaction status
   * @param {string} paymentRef 
   * @returns {Promise<Object>} transactionDetails
   */
  async verifyPayment(paymentRef) {
    try {
      const response = await fetch(`${this.baseUrl}/payment/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({ product_id: paymentRef })
      });

      const data = await response.json();
      return data;
    } catch (err) {
      logger.error('Espees Verification Error', { error: err.message, paymentRef });
      throw err;
    }
  }
}

export default new EspeesService();
