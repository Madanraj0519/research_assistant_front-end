/**
 * Asset Copy Script for Chrome Extension Build
 *
 * Copies necessary assets to the dist folder after Vite build
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const publicDir = join(rootDir, 'public');

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Files to copy from root
const rootFiles = [
  'manifest.json',
  'background.js',
];

// Copy root files
rootFiles.forEach(file => {
  const src = join(rootDir, file);
  const dest = join(distDir, file);

  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`Copied: ${file}`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

// Copy public directory files (icons, etc.)
if (existsSync(publicDir)) {
  const publicFiles = readdirSync(publicDir);

  publicFiles.forEach(file => {
    const src = join(publicDir, file);
    const dest = join(distDir, file);

    try {
      copyFileSync(src, dest);
      console.log(`Copied: public/${file}`);
    } catch (error) {
      console.warn(`Warning: Could not copy ${file}:`, error.message);
    }
  });
}

console.log('\nBuild assets copied successfully!');
console.log(`\nTo load the extension in Chrome:`);
console.log('1. Open chrome://extensions');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log(`4. Select the "${distDir}" folder`);
