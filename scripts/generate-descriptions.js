import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import exifReader from 'exif-reader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const DESCRIPTIONS_FILE = path.join(__dirname, '../public/data/descriptions.json');

// Helper to get metadata
async function getImageMetadata(filePath) {
    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();
        let exifData = {};

        if (metadata.exif) {
            try {
                exifData = exifReader(metadata.exif);
            } catch (e) {
                // Ignore exif parsing errors
            }
        }

        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            date: exifData.exif?.DateTimeOriginal || exifData.image?.ModifyDate || null,
            cameraMake: exifData.image?.Make || null,
            cameraModel: exifData.image?.Model || null,
            lens: exifData.exif?.LensModel || null,
            iso: exifData.exif?.ISO || null,
            fNumber: exifData.exif?.FNumber || null,
            exposureTime: exifData.exif?.ExposureTime || null,
            focalLength: exifData.exif?.FocalLength || null,
        };
    } catch (error) {
        // console.warn(`Failed to read metadata for ${filePath}:`, error.message);
        return null;
    }
}

function formatDate(date) {
    if (!date) return '';
    try {
        if (date instanceof Date) return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        // Handle "YYYY:MM:DD HH:MM:SS" string from EXIF
        const parts = date.toString().split(/[: ]/);
        if (parts.length >= 3) {
            const d = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
            return parts[0]; // Just return year if date parsing fails
        }
        return '';
    } catch {
        return '';
    }
}

function cleanString(str) {
    if (!str) return '';
    // Remove null bytes or weird chars
    return str.replace(/\0/g, '').trim();
}

async function main() {
    console.log("Starting Local Image Analysis...");

    // 1. Load existing descriptions? 
    // Actually, we want to OVERWRITE or UPDATE them based on file data.
    // But let's keep existing structure.
    let descriptions = {};
    if (fs.existsSync(DESCRIPTIONS_FILE)) {
        try {
            descriptions = JSON.parse(fs.readFileSync(DESCRIPTIONS_FILE, 'utf-8'));
        } catch (e) {
            descriptions = {};
        }
    }

    // 2. Find all images
    const images = await glob('images/**/*.{jpg,jpeg,png,webp}', {
        cwd: PUBLIC_DIR,
        absolute: false
    });

    console.log(`Found ${images.length} images.`);
    let updatedCount = 0;

    for (const imageRelPath of images) {
        const fullPath = path.join(PUBLIC_DIR, imageRelPath);
        const jsonKey = imageRelPath.replace(/\\/g, '/');

        // Extract folder name as "Collection" or "Context"
        const pathParts = jsonKey.split('/');
        // e.g. images/stories/Wedding/gallery-1.webp -> "Wedding"
        // e.g. images/home/insta-1.webp -> "Home"
        let context = '';
        if (pathParts.length > 2) {
            context = pathParts[pathParts.length - 2];
        } else {
            context = 'Portfolio';
        }

        // Clean up context name (e.g. "Aakash & vishnavi Engagement" -> "Aakash & Vishnavi Engagement")
        context = context
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

        // Analyze Image
        const meta = await getImageMetadata(fullPath);

        if (!meta) continue;

        // Construct Description Parts
        const parts = [];

        // 1. Camera Gear
        const camera = cleanString(meta.cameraModel);
        const lens = cleanString(meta.lens);

        if (camera) {
            parts.push(`Shot on ${camera}`);
        }

        // 2. Settings (Technical)
        const settings = [];
        if (meta.focalLength) settings.push(`${meta.focalLength}mm`);
        if (meta.fNumber) settings.push(`f/${meta.fNumber}`);
        if (meta.iso) settings.push(`ISO ${meta.iso}`);

        if (settings.length > 0) {
            // parts.push(settings.join(' • '));
        }

        // 3. Date
        const dateStr = formatDate(meta.date);

        // 4. Orientation
        const orientation = meta.width > meta.height ? 'Landscape' : 'Portrait';

        // COMBINE INTO FINAL TEXT
        // Format: "Title • Subtitle"
        // Title = Context (e.g. "Jodhpur Suite")
        // Subtitle = "Portrait • 2024" or "Sony A7III • 85mm"

        // Actually, the Stack card expects: 
        // Title (Large)
        // Subtitle (Small uppercase)
        // Body (Paragraph)

        // For descriptions.json, we assign a string.
        // The Stack component splits it by " • " if present.
        // So we should format it as: "Title • Subtitle"
        // And maybe the body text is not easily passed safely in this single string format without changing Stack.tsx parsing.
        // Wait, Stack.tsx does:
        // const [title, subtitle] = description.includes('•') 
        //   ? description.split('•') 
        //   : ['Untitled', description];
        //   ...
        //  <p className="text-sm leading-relaxed text-muted mb-6">
        //     {description}
        //   </p>
        // If we split by "•", title is part 0, subtitle is part 1.
        // But the *Body* uses the FULL `description` string.
        // So if description is "Title • Subtitle", the body will be "Title • Subtitle".
        // This is a bit redundant but acceptable for now.

        // Let's make it: "Collection Name • Date | Camera Info"
        // e.g. "Wedding • Oct 2023 | Sony A7III"

        let subtitle = dateStr || '2024';
        if (camera) subtitle += ` | ${camera}`;

        const finalDescription = `${context} • ${subtitle}`;

        if (descriptions[jsonKey] !== finalDescription) {
            descriptions[jsonKey] = finalDescription;
            updatedCount++;
        }
    }

    fs.writeFileSync(DESCRIPTIONS_FILE, JSON.stringify(descriptions, null, 4));
    console.log(`Done. Updated ${updatedCount} descriptions.`);
}

main().catch(console.error);
