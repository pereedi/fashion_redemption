import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesToDownload = [
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1539109132314-347596ad9cf2?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1594932224456-802d9242efbd?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=2000',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=2000',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=2000',
  'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&q=80&w=2000',
  'https://images.unsplash.com/photo-1539109132314-347596ad9cf2?auto=format&fit=crop&q=80&w=2000',
  'https://images.unsplash.com/photo-1594932224456-802d9242efbd?auto=format&fit=crop&q=80&w=2000'
];

const targetDir = path.join(__dirname, '..', '..', 'public', 'images', 'products');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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
        fs.unlink(filename, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading images...');
  for (let i = 0; i < imagesToDownload.length; i++) {
    const url = imagesToDownload[i];
    const filename = path.join(targetDir, `product_${i + 1}.jpg`);
    
    // Skip if already downloaded completely (has size)
    if (fs.existsSync(filename) && fs.statSync(filename).size > 1000) {
      console.log(`Already downloaded: ${filename}`);
      continue;
    }

    let success = false;
    let attempts = 0;
    while (!success && attempts < 3) {
      try {
        attempts++;
        await downloadImage(url, filename);
        console.log(`Downloaded ${url} to ${filename}`);
        success = true;
      } catch (err) {
        console.error(`Attempt ${attempts} failed for ${filename}:`, err.message);
        if (attempts === 3) throw err;
        await new Promise(r => setTimeout(r, 2000)); // wait 2 seconds before retry
      }
    }
  }
  console.log('All images downloaded locally!');
}

run().catch(console.error);
