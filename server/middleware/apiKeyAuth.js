import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// The API key to check against. In production, this should be set in Render environment variables.
const VALID_API_KEY = process.env.REDEMPTION_API_KEY;

if (!VALID_API_KEY) {
  logger.error('CRITICAL SECURITY WARNING: REDEMPTION_API_KEY environment variable is not defined!');
}


export const apiKeyAuth = (req, res, next) => {
  if (
    req.method === 'OPTIONS' ||
    req.path === '/health' ||
    req.path.startsWith('/docs') ||
    req.path.startsWith('/images') ||
    req.originalUrl.startsWith('/api/images')
  ) {
    return next();
  }

  const apiKey = req.header('x-api-key') || req.query.api_key;

  if (!apiKey) {
    logger.warn(`API key missing — ${req.method} ${req.path} from ${req.headers['origin'] || 'unknown origin'}`);
    return res.status(401).json({ success: false, message: 'Unauthorized: API key is missing. Please provide x-api-key header.' });
  }

  if (apiKey !== VALID_API_KEY) {
    logger.warn(`Invalid API key attempt — ${req.method} ${req.path} from ${req.headers['origin'] || 'unknown origin'}`);
    return res.status(403).json({ success: false, message: 'Forbidden: Invalid API key.' });
  }

  // ← ADD: log successful external calls for monitoring
  const origin = req.headers['origin'] || 'direct';
  if (!['https://fashion-redemption.vercel.app', 'http://localhost:5173'].includes(origin)) {
    logger.info(`External API access — ${req.method} ${req.path} from ${origin}`);
  }

  next();
};
