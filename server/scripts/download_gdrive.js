import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { productsToSeed } from '../utils/mockProducts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.join(__dirname, '..', '..', 'public', 'images', 'products');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Helper to convert drive links to direct links
const convertGoogleDriveLink = (url) => {
  if (!url || !url.includes('drive.google.com')) return url;
  let fileId = '';
  if (url.includes('/file/d/')) {
    fileId = url.split('/file/d/')[1].split('/')[0];
  } else if (url.includes('id=')) {
    fileId = url.split('id=')[1].split('&')[0];
  }
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
};

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadImage(res.headers.location, filename));
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filename);
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', (err) => {
        // unlink the file if error happened
        fs.unlink(filename, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading Google Drive images...');
  
  for (let i = 0; i < productsToSeed.length; i++) {
    const product = productsToSeed[i];
    
    // Create safe filenames based on product name
    const sanitizedName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    for (let j = 0; j < product.images.length; j++) {
      const originalUrl = product.images[j];
      const directUrl = convertGoogleDriveLink(originalUrl);
      
      const filename = path.join(targetDir, `${sanitizedName}_${j+1}.jpg`);
      
      if (fs.existsSync(filename) && fs.statSync(filename).size > 1000) {
        console.log(`Already downloaded: ${filename}`);
        continue;
      }
      
      let success = false;
      let attempts = 0;
      while (!success && attempts < 3) {
        try {
          attempts++;
          await downloadImage(directUrl, filename);
          console.log(`Downloaded ${product.name} image ${j+1} to ${filename}`);
          success = true;
        } catch (err) {
          console.error(`Attempt ${attempts} failed for ${product.name}:`, err.message);
          if (attempts === 3) {
             console.error("Giving up on this image.");
          } else {
             await new Promise(r => setTimeout(r, 2000));
          }
        }
      }
    }
  }
  console.log('All configured Google Drive images downloaded successfully!');
}

run().catch(console.error);
