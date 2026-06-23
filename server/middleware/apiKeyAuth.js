import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// The API key to check against. In production, this should be set in Render environment variables.
const VALID_API_KEY = process.env.REDEMPTION_API_KEY;

if (!VALID_API_KEY) {
  logger.error('CRITICAL SECURITY WARNING: REDEMPTION_API_KEY environment variable is not defined!');
}


export const apiKeyAuth = (req, res, next) => {
  // Allow health check, docs, image routes, and OPTIONS preflight requests to bypass API key
  if (
    req.method === 'OPTIONS' || 
    req.path === '/health' || 
    req.path.startsWith('/docs') || 
    req.path.startsWith('/images') || 
    req.originalUrl.startsWith('/api/images')
  ) {
    return next();
  }

  // Get the API key from headers or query parameters
  const apiKey = req.header('x-api-key') || req.query.api_key;

  if (!apiKey) {
    logger.warn(`API key missing on request to ${req.path}`);
    return res.status(401).json({ success: false, message: 'Unauthorized: API key is missing. Please provide x-api-key header.' });
  }

  if (apiKey !== VALID_API_KEY) {
    logger.warn(`Invalid API key provided: ${apiKey}`);
    return res.status(403).json({ success: false, message: 'Forbidden: Invalid API key.' });
  }

  next();
};
