import express from 'express';
import db from '../config/db.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch image from database
    const imageRecord = await db('product_images').where('id', id).first();
    
    if (!imageRecord || !imageRecord.url) {
      return res.status(404).send('Image not found');
    }

    const { url } = imageRecord;

    // Check if it's a base64 image
    if (url.startsWith('data:image/')) {
      // Extract the mime type and the base64 data
      const matches = url.match(/^data:(image\/\w+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        return res.status(400).send('Invalid base64 string');
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      
      // Convert base64 to binary buffer
      const imgBuffer = Buffer.from(base64Data, 'base64');
      
      res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': imgBuffer.length
      });
      res.end(imgBuffer);
    } else {
      // If it's a standard URL, we redirect to it
      res.redirect(url);
    }
  } catch (err) {
    logger.error('Error fetching image', { error: err.message, id: req.params.id });
    res.status(500).send('Server Error');
  }
});

export default router;
