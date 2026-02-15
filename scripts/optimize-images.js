
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const PUBLIC_DIR = path.resolve('public/images');

// Configuration
const MAX_WIDTH = 1920; // Full HD max width
const QUALITY = 80;     // WebP quality

async function processImages() {
    console.log('🔍 Scanning for images...');

    // Find all images
    const files = await glob('**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
        cwd: PUBLIC_DIR,
        absolute: true
    });

    console.log(`found ${files.length} images.`);

    for (const file of files) {
        const dir = path.dirname(file);
        const ext = path.extname(file);
        const name = path.basename(file, ext);

        // Target: lowercase name + .webp
        // Note: We rename existing files to lowercase if they aren't, 
        // AND we create a webp version. 
        // For simplicity and to fix the "broken images" issue which is often extension casing:
        // We will CONVERT everything to WebP and standard lowercase names.

        const newName = name.toLowerCase();
        const newPath = path.join(dir, `${newName}.webp`); // Convert all to webp

        // Skip if already optimized (checks if current file IS the optimized webp file)
        if (file === newPath && ext === '.webp') {
            // Check if we want to re-compress? For now assume valid if it matches our standard.
            continue;
        }

        try {
            console.log(`Processing: ${path.relative(PUBLIC_DIR, file)} -> ${path.relative(PUBLIC_DIR, newPath)}`);

            const image = sharp(file);
            const metadata = await image.metadata();

            if (metadata.width && metadata.width > MAX_WIDTH) {
                image.resize(MAX_WIDTH);
            }

            await image
                .webp({ quality: QUALITY })
                .toFile(newPath);

            // If the original file was different (e.g. .jpg or uppercase), delete it to clean up
            if (file !== newPath) {
                fs.unlinkSync(file);
            }

        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }

    console.log('✅ Optimization complete.');
}

processImages().catch(console.error);
