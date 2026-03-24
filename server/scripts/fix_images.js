import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, '..', '..', 'public', 'images', 'products');
const sourceFile = path.join(targetDir, 'product_1.jpg');

async function fixImages() {
  if (!fs.existsSync(sourceFile)) {
    console.error(`Source file ${sourceFile} not found!`);
    return;
  }

  console.log(`Using ${sourceFile} as a fallback for the remaining images...`);

  for (let i = 5; i <= 12; i++) {
    const destFile = path.join(targetDir, `product_${i}.jpg`);
    if (!fs.existsSync(destFile)) {
      fs.copyFileSync(sourceFile, destFile);
      console.log(`Copied placeholder to ${destFile}`);
    } else {
      console.log(`File ${destFile} already exists, skipping.`);
    }
  }
  
  console.log('All remaining image slots filled successfully!');
}

fixImages().catch(console.error);
