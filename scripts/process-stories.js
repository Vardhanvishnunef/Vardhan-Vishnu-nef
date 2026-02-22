
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import exifReader from 'exif-reader';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORIES_DIR = path.join(__dirname, '../public/images/stories');

const DESCRIPTIONS_FILE = path.join(__dirname, '../public/data/descriptions.json');

// Disable sharp cache to prevent file locking on Windows
sharp.cache(false);

// Ensure directories exist
if (!fs.existsSync(STORIES_DIR)) {
    console.error(`Stories directory not found: ${STORIES_DIR}`);
    process.exit(1);
}

// Helper to get metadata from image
async function getImageMetadata(filePath) {
    try {
        const metadata = await sharp(filePath, { limitInputPixels: false }).metadata();
        let exifData = {};
        if (metadata.exif) {
            try {
                exifData = exifReader(metadata.exif);
            } catch (e) {
                // If exif-reader fails, ignore
            }
        }
        return {
            width: metadata.width,
            height: metadata.height,
            date: exifData.exif?.DateTimeOriginal || exifData.image?.ModifyDate || null,
            camera: exifData.image?.Model || null,
            lens: exifData.exif?.LensModel || null,
            iso: exifData.exif?.ISO || null,
            fNumber: exifData.exif?.FNumber || null,
            exposureTime: exifData.exif?.ExposureTime || null,
        };
    } catch (error) {
        console.warn(`Failed to read metadata for ${filePath}:`, error.message);
        return {};
    }
}

// Format date for display
function formatDate(date) {
    if (!date) return '2024';
    try {
        // EXIF date format is usually "YYYY:MM:DD HH:MM:SS"
        if (date instanceof Date) return date.getFullYear().toString();
        const parts = date.toString().split(/[: ]/);
        if (parts.length >= 3) {
            return parts[0]; // Year
        }
        return new Date(date).getFullYear().toString();
    } catch {
        return '2024';
    }
}

function fullDateFormat(date) {
    if (!date) return '';
    try {
        // EXIF date format is usually "YYYY:MM:DD HH:MM:SS"
        if (date instanceof Date) return date.toDateString();
        const parts = date.toString().split(/[: ]/);
        if (parts.length >= 3) {
            const d = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        return '';
    } catch {
        return '';
    }
}


async function processFolder(folderName) {
    console.log(`Processing folder: ${folderName}`);
    const folderPath = path.join(STORIES_DIR, folderName);

    // Load existing metadata first
    const metadataPath = path.join(folderPath, 'metadata.json');
    let metadata = {};
    if (fs.existsSync(metadataPath)) {
        try {
            metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        } catch (e) {
            console.warn(`Invalid metadata.json in ${folderName}, starting fresh.`);
        }
    }

    // 1. Get all image files
    const files = fs.readdirSync(folderPath).filter(file =>
        /\.(jpg|jpeg|png|webp)$/i.test(file) &&
        !file.startsWith('hero') &&
        !file.startsWith('thumbnail')
    );

    if (files.length === 0 && !fs.existsSync(path.join(folderPath, 'hero.webp'))) {
        console.warn(`No images found in ${folderName}`);
        return;
    }

    // 2. Sort images by date taken (if possible) or name
    const imageMetaMap = [];
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const meta = await getImageMetadata(filePath);
        imageMetaMap.push({ file, filePath, meta });
    }

    imageMetaMap.sort((a, b) => {
        const dateA = a.meta.date ? new Date(a.meta.date.toString().replace(/:/g, '/').substring(0, 10)) : new Date(0);
        const dateB = b.meta.date ? new Date(b.meta.date.toString().replace(/:/g, '/').substring(0, 10)) : new Date(0);
        return dateA - dateB || a.file.localeCompare(b.file);
    });

    // 3. Rename and Convert to WebP
    let descriptions = {};
    if (fs.existsSync(DESCRIPTIONS_FILE)) {
        descriptions = JSON.parse(fs.readFileSync(DESCRIPTIONS_FILE, 'utf-8'));
    }

    // Start index for renaming
    let index = 1;
    let earliestDate = null;
    let cameraModel = null;

    // Temporary rename to avoid collisions
    for (const item of imageMetaMap) {
        const tempName = `temp-${Date.now()}-${item.file}`;
        const tempPath = path.join(folderPath, tempName);
        fs.renameSync(item.filePath, tempPath);
        item.tempPath = tempPath;
    }

    for (const item of imageMetaMap) {
        const newFilename = `gallery-${index}.webp`;
        const newFilePath = path.join(folderPath, newFilename);

        // Convert to WebP
        try {
            await sharp(item.tempPath, { limitInputPixels: false })
                .webp({ quality: 80 })
                .toFile(newFilePath);
        } catch (err) {
            console.error(`Error converting ${item.tempPath}:`, err);
            continue;
        }

        // Remove temp file with retry strategy
        let attempts = 0;
        const maxAttempts = 5;
        while (attempts < maxAttempts) {
            try {
                fs.unlinkSync(item.tempPath);
                break;
            } catch (e) {
                if (e.code === 'EBUSY' || e.code === 'EPERM') {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 200 * attempts));
                } else {
                    console.warn(`Failed to delete temp file ${item.tempPath}:`, e.message);
                    break;
                }
            }
        }

        // Track metadata
        if (!earliestDate && item.meta.date) earliestDate = item.meta.date;
        if (!earliestDate && item.meta.date) earliestDate = item.meta.date;
        if (!cameraModel && item.meta.camera) cameraModel = item.meta.camera;

        // Generate description
        const descKey = `images/stories/${folderName}/${newFilename}`;
        const dateStr = fullDateFormat(item.meta.date);
        let desc = "";

        if (dateStr) desc += `Captured on ${dateStr}. `;
        if (item.meta.camera) desc += `Shot with ${item.meta.camera}. `;
        if (item.meta.lens) desc += `${item.meta.lens}. `;
        if (item.meta.iso) desc += `ISO ${item.meta.iso}. `;

        if (desc) {
            descriptions[descKey] = desc.trim();
        } else {
            // Fallback to generic description
            const fallbackDate = metadata.date || formatDate(earliestDate);
            descriptions[descKey] = `${metadata.client || folderName} • ${fallbackDate}`;
        }

        index++;
    }

    // 4. Handle Hero and Thumbnail
    // If hero.webp doesn't exist, use the first gallery image (copy it)
    const heroPath = path.join(folderPath, 'hero.webp');
    if (!fs.existsSync(heroPath) && index > 1) {
        fs.copyFileSync(path.join(folderPath, 'gallery-1.webp'), heroPath);
    }

    // If thumbnail.webp doesn't exist, use the first gallery image (resize it)
    const thumbPath = path.join(folderPath, 'thumbnail.webp');
    if (!fs.existsSync(thumbPath) && index > 1) {
        await sharp(path.join(folderPath, 'gallery-1.webp'))
            .resize(400)
            .toFile(thumbPath);
    }

    // 5. Update metadata.json

    // Default values
    if (!metadata.id) metadata.id = Math.floor(Math.random() * 10000).toString();
    if (!metadata.client) metadata.client = folderName.replace(/([A-Z])/g, ' $1').trim(); // Title Case-ish
    if (!metadata.location) metadata.location = 'Unknown Location';
    if (!metadata.date) metadata.date = formatDate(earliestDate);
    if (!metadata.slug) metadata.slug = folderName;
    if (!metadata.description) metadata.description = `A visual story of ${metadata.client}.`;

    // Ensure image paths are correct
    metadata.heroImage = `images/stories/${folderName}/hero.webp`;
    metadata.thumbnailUrl = `images/stories/${folderName}/thumbnail.webp`;

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 4));

    // Save descriptions
    fs.writeFileSync(DESCRIPTIONS_FILE, JSON.stringify(descriptions, null, 4));

    console.log(`Completed ${folderName}`);
}

async function main() {
    const folders = fs.readdirSync(STORIES_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const folder of folders) {
        await processFolder(folder);
    }
    console.log("All stories processed.");
}

main().catch(console.error);
