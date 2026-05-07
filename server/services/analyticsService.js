import duckdb from 'duckdb';
import db from '../config/db.js';
import path from 'path';
import { logger } from '../utils/logger.js';

const dbPath = path.join(process.cwd(), 'data', 'analytics.duckdb');
const duck = new duckdb.Database(dbPath);

class AnalyticsService {
  constructor() {
    this.con = duck.connect();
    this.init();
  }

  init() {
    this.con.run(`
      CREATE TABLE IF NOT EXISTS sales_data (
        order_id INTEGER,
        category VARCHAR,
        total DECIMAL(18,2),
        created_at TIMESTAMP
      )
    `);
  }

  async syncFromMySQL() {
    try {
      logger.info('Starting Analytics Sync (MySQL -> DuckDB)...');
      
      const sales = await db('orders')
        .select('orders.id', 'products.category', 'orders.total', 'orders.created_at')
        .join('order_items', 'orders.id', 'order_items.order_id')
        .join('products', 'order_items.product_id', 'products.id');

      // Clear existing duckdb data
      this.con.run('DELETE FROM sales_data');

      const stmt = this.con.prepare('INSERT INTO sales_data VALUES (?, ?, ?, ?)');
      for (const row of sales) {
        const createdAt = row.created_at ? (row.created_at instanceof Date ? row.created_at : new Date(row.created_at)) : new Date();
        stmt.run(row.id, row.category, row.total, createdAt.toISOString());
      }
      stmt.finalize();

      logger.info('Analytics Sync Completed.');
    } catch (err) {
      logger.error('Analytics Sync Failed', { error: err.message });
    }
  }

  async getSalesReport(timeframe = 'daily') {
    let groupBy = "strftime('%Y-%m-%d', created_at)";
    let orderBy = "1 ASC";

    if (timeframe === 'weekly') {
      groupBy = "strftime('%Y-W%W', created_at)";
    } else if (timeframe === 'monthly') {
      groupBy = "strftime('%Y-%m', created_at)";
    } else if (timeframe === 'annual') {
      groupBy = "strftime('%Y', created_at)";
    }

    return new Promise((resolve, reject) => {
      this.con.all(`
        SELECT ${groupBy} as label, SUM(total) as revenue, COUNT(DISTINCT order_id) as orders 
        FROM sales_data 
        GROUP BY 1 
        ORDER BY ${orderBy}
      `, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }

  async getCategoryReport() {
    return new Promise((resolve, reject) => {
      this.con.all('SELECT category, SUM(total) as revenue, COUNT(DISTINCT order_id) as orders FROM sales_data GROUP BY 1 ORDER BY 2 DESC', (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }
}

export default new AnalyticsService();
