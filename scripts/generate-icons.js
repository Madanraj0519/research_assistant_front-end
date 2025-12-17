/**
 * Icon Generator Script
 *
 * This script generates PNG icons from SVG files.
 * Run with: node scripts/generate-icons.js
 *
 * Requirements:
 * - Node.js
 * - sharp package (npm install sharp --save-dev)
 *
 * Or use online tools like:
 * - https://cloudconvert.com/svg-to-png
 * - https://svgtopng.com/
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const distDir = join(__dirname, '..', 'dist');

// Ensure directories exist
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

async function generateIcons() {
  try {
    // Try to use sharp if available
    const sharp = await import('sharp').catch(() => null);

    if (sharp) {
      const sizes = [16, 48, 128];

      for (const size of sizes) {
        const svgPath = join(publicDir, `icon${size}.svg`);
        const pngPath = join(publicDir, `icon${size}.png`);

        if (existsSync(svgPath)) {
          await sharp.default(svgPath)
            .resize(size, size)
            .png()
            .toFile(pngPath);

          console.log(`Generated: icon${size}.png`);
        }
      }

      console.log('All icons generated successfully!');
    } else {
      console.log('Sharp not installed. Please install with: npm install sharp --save-dev');
      console.log('Or manually convert SVG files to PNG using online tools.');
      console.log('\nSVG files are located in:', publicDir);
    }
  } catch (error) {
    console.error('Error generating icons:', error);
    console.log('\nPlease manually convert SVG to PNG using online tools like:');
    console.log('- https://cloudconvert.com/svg-to-png');
    console.log('- https://svgtopng.com/');
  }
}

generateIcons();
