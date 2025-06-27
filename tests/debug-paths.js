import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('__dirname:', __dirname);
console.log('Parent dir:', path.join(__dirname, '..'));
console.log('Data dir:', path.join(__dirname, '..', 'data'));

const DATA_DIR = path.join(__dirname, '..', 'data');
console.log('Looking for items.json at:', path.join(DATA_DIR, 'items.json'));

try {
  const exists = fs.existsSync(path.join(DATA_DIR, 'items.json'));
  console.log('Items.json exists:', exists);
  
  if (exists) {
    const items = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'items.json'), 'utf8'));
    console.log('Successfully loaded', items.length, 'items');
  }
} catch (error) {
  console.error('Error:', error.message);
}
