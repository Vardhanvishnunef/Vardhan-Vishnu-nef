import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.join(__dirname, '../public/images/stories');

function shrinkFiles(dir) {
    const items = fs.readdirSync(dir);
    let count = 0;
    for (const item of items) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) count += shrinkFiles(full);
        else if (item.endsWith('.webp') || item.endsWith('.jpg') || item.endsWith('.png')) {
            fs.writeFileSync(full, "");
            count++;
        }
    }
    return count;
}
const total = shrinkFiles(IMAGES_DIR);
console.log(`Shrunk ${total} images to 0-bytes.`);
