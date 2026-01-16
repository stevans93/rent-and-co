import sharp from 'sharp';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/images/hero');

// Slike za svaku kategoriju - kvalitetne royalty-free slike
const categoryImages = {
  tourism: [
    { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', name: 'tourism-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80', name: 'tourism-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80', name: 'tourism-3.jpg' },
    { url: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&q=80', name: 'tourism-4.jpg' },
    { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80', name: 'tourism-5.jpg' },
  ],
  hospitality: [
    { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', name: 'hospitality-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', name: 'hospitality-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80', name: 'hospitality-3.jpg' },
    { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80', name: 'hospitality-4.jpg' },
    { url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80', name: 'hospitality-5.jpg' },
  ],
  vehicles: [
    { url: 'https://images.unsplash.com/photo-1449130176618-69d8c8423a95?w=600&q=80', name: 'vehicles-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', name: 'vehicles-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=600&q=80', name: 'vehicles-3.jpg' },
    { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80', name: 'vehicles-4.jpg' },
    { url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', name: 'vehicles-5.jpg' },
  ],
  services: [
    { url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80', name: 'services-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&q=80', name: 'services-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80', name: 'services-3.jpg' },
    { url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80', name: 'services-4.jpg' },
    { url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&q=80', name: 'services-5.jpg' },
  ],
  exchange: [
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', name: 'exchange-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', name: 'exchange-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1491553895911-0055uj8d?w=600&q=80', name: 'exchange-3.jpg' },
    { url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80', name: 'exchange-4.jpg' },
    { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', name: 'exchange-5.jpg' },
  ],
  misc: [
    { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80', name: 'misc-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80', name: 'misc-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80', name: 'misc-3.jpg' },
    { url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80', name: 'misc-4.jpg' },
    { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', name: 'misc-5.jpg' },
  ],
};

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function processImage(buffer, outputPath) {
  try {
    await sharp(buffer)
      .resize(600, 400, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 75,
        progressive: true
      })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    console.log(`✅ Saved: ${path.basename(outputPath)} (${Math.round(stats.size / 1024)}KB)`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${outputPath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting hero images download and optimization...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [category, images] of Object.entries(categoryImages)) {
    console.log(`\n📁 Processing ${category}...`);
    
    for (const img of images) {
      const outputPath = path.join(OUTPUT_DIR, img.name);
      
      // Skip if already exists
      if (fs.existsSync(outputPath)) {
        console.log(`⏭️  Skipping ${img.name} (already exists)`);
        successCount++;
        continue;
      }
      
      try {
        console.log(`⬇️  Downloading ${img.name}...`);
        const buffer = await downloadImage(img.url, outputPath);
        await processImage(buffer, outputPath);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed ${img.name}: ${error.message}`);
        failCount++;
      }
      
      // Small delay between requests
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  console.log(`\n✨ Done! Success: ${successCount}, Failed: ${failCount}`);
}

main().catch(console.error);
