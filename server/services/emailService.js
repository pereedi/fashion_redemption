import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Send order confirmation email to customer
   * @param {Object} order 
   */
  async sendOrderConfirmation(order) {
    try {
      const { id, customer_name, customer_address, customer_city, total, items, shipping_method } = order;
      
      const itemsHtml = items.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <div style="font-weight: bold;">${item.name}</div>
            <div style="font-size: 12px; color: #666;">Size: ${item.size} | Qty: ${item.quantity}</div>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            Esp ${Number(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `).join('');

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: order.customer_email || order.user_email || 'customer@example.com',
        subject: `Your Redemption is Secured - Order #${String(id).padStart(6, '0')}`,
        html: `
          <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #000;">
            <div style="text-align: center; padding: 40px 0;">
              <h1 style="text-transform: uppercase; letter-spacing: 5px; font-weight: normal;">Redemption</h1>
              <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 2px; color: #999;">Order Confirmation</p>
            </div>
            
            <div style="padding: 20px; border: 1px solid #000;">
              <h2 style="font-weight: normal; margin-top: 0;">Thank you for your order, ${customer_name}.</h2>
              <p>We are preparing your items for shipment. Below are your order details.</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <thead>
                  <tr style="text-align: left; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">
                    <th style="padding: 10px; border-bottom: 2px solid #000;">Item</th>
                    <th style="padding: 10px; border-bottom: 2px solid #000; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td style="padding: 20px 10px 10px; font-weight: bold; text-transform: uppercase; font-size: 10px;">Total Paid</td>
                    <td style="padding: 20px 10px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #C41E3A;">
                      Esp ${Number(total).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
              
              <div style="background: #f9f9f9; padding: 20px; margin-top: 20px;">
                <h3 style="text-transform: uppercase; font-size: 10px; letter-spacing: 1px; margin-top: 0;">Shipping Address</h3>
                <p style="font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                  ${customer_name}<br>
                  ${customer_address}<br>
                  ${customer_city}<br>
                  ${shipping_method}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 40px 0; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
              <p>&copy; ${new Date().getFullYear()} Redemption Luxury. All Rights Reserved.</p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { messageId: info.messageId, orderId: id });
      
      // If using Ethereal, log the preview URL
      if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
        logger.info('Preview URL: ' + nodemailer.getTestMessageUrl(info));
      }
      
      return info;
    } catch (err) {
      logger.error('Error sending email', { error: err.message, orderId: order.id });
      throw err;
    }
  }
}

export default new EmailService();
