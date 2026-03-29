import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/images/stories');
const OUTPUT_FILE = path.join(__dirname, '../public/data/image-registry.json');

const registry = {};

if (fs.existsSync(IMAGES_DIR)) {
    const stories = fs.readdirSync(IMAGES_DIR);
    for (const story of stories) {
        const storyPath = path.join(IMAGES_DIR, story);
        if (fs.statSync(storyPath).isDirectory()) {
            registry[story] = {
                hero: '',
                thumbnail: '',
                carousel: [],
                polaroids: []
            };

            const files = fs.readdirSync(storyPath);
            for (const file of files) {
                const filePath = path.join(storyPath, file);
                if (fs.statSync(filePath).isFile() && file.endsWith('.webp')) {
                    if (file.startsWith('hero.')) registry[story].hero = file;
                    else if (file.startsWith('thumbnail.')) registry[story].thumbnail = file;
                    else registry[story].polaroids.push(file);
                } else if (fs.statSync(filePath).isDirectory() && file === 'carousel') {
                    const carouselFiles = fs.readdirSync(filePath);
                    for (const cFile of carouselFiles) {
                        if (cFile.endsWith('.webp')) registry[story].carousel.push(cFile);
                    }
                }
            }
        }
    }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2));
console.log(`Generated image registry with ${Object.keys(registry).length} stories.`);
