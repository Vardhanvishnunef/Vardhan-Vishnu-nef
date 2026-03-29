
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const PUBLIC_DIR = path.join(__dirname, '../public');
const DATA_DIR = path.join(PUBLIC_DIR, 'data');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

// Configure multer for memory uploads (files are kept in RAM until processed)
const storage = multer.memoryStorage();

const upload = multer({ storage });

// API Endpoints

// 1. Save site-config.json
app.post('/api/save-config', (req, res) => {
    try {
        const filePath = path.join(DATA_DIR, 'site-config.json');
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 4));
        console.log('Saved site-config.json');
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Save descriptions.json
app.post('/api/save-descriptions', (req, res) => {
    try {
        const filePath = path.join(DATA_DIR, 'descriptions.json');
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 4));
        console.log('Saved descriptions.json');
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving descriptions:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Create New Story
app.post('/api/create-story', (req, res) => {
    try {
        const { client, location, date, slug } = req.body;
        const storyDir = path.join(IMAGES_DIR, 'stories', slug);

        if (fs.existsSync(storyDir)) {
            return res.status(400).json({ error: 'Story with this slug already exists' });
        }

        fs.mkdirSync(storyDir, { recursive: true });

        const metadata = {
            id: `story-${Date.now()}`,
            client,
            location,
            date,
            description: `A new cinematic story from ${location}`,
            slug,
            thumbnailUrl: `images/stories/${slug}/thumbnail.webp`,
            heroUrl: `images/stories/${slug}/hero.webp`
        };

        fs.writeFileSync(path.join(storyDir, 'metadata.json'), JSON.stringify(metadata, null, 4));
        res.json({ success: true, story: metadata });
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Save story metadata.json
app.post('/api/save-metadata', (req, res) => {
    try {
        const { slug, metadata } = req.body;
        const filePath = path.join(IMAGES_DIR, 'stories', slug, 'metadata.json');
        fs.writeFileSync(filePath, JSON.stringify(metadata, null, 4));
        console.log(`Saved metadata.json for ${slug}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving metadata:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. Upload images with Pipeline
app.post('/api/upload', upload.array('images'), async (req, res) => {
    try {
        const { folder } = req.body; // e.g., 'stories/my-story'
        if (!folder) {
            return res.status(400).json({ error: 'Folder path is required' });
        }

        const dest = path.join(IMAGES_DIR, folder);
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const processedFiles = [];

        // Process each uploaded file
        for (const file of req.files) {
            const baseName = path.parse(file.originalname).name;
            const finalFilename = `${baseName}.webp`; // Always convert to WebP
            const finalPath = path.join(dest, finalFilename);

            // Our High-Quality Compression Pipeline
            await sharp(file.buffer)
                .resize({
                    width: 2560,             // Cap width to 2560px for great 4K display loading fast
                    withoutEnlargement: true // Never scale up a small image natively (keeps it sharp)
                })
                .webp({ quality: 85 })       // High quality compression, invisible to naked eye vs 100
                .toFile(finalPath);
            
            processedFiles.push(finalFilename);
        }

        console.log(`Uploaded and processed ${processedFiles.length} images to ${folder}.`);
        res.json({ success: true, files: processedFiles });
    } catch (error) {
        console.error('Error processing/uploading images:', error);
        res.status(500).json({ error: error.message });
    }
});

import { exec } from 'child_process';

// Toggle between carousel and main story folder
app.post('/api/toggle-carousel', (req, res) => {
    const { slug, imagePath, isCarousel } = req.body;
    const fileName = path.basename(imagePath);
    const sourcePath = path.join(process.cwd(), imagePath);

    let targetDir;
    if (isCarousel) {
        targetDir = path.join(process.cwd(), 'public/images/stories', slug, 'carousel');
    } else {
        targetDir = path.join(process.cwd(), 'public/images/stories', slug);
    }

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, fileName);

    try {
        fs.renameSync(sourcePath, targetPath);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to move file' });
    }
});

// Deploy to Production
app.post('/api/deploy', (req, res) => {
    console.log('Starting deployment...');

    // First, check if there are any changes to commit
    exec('git status --porcelain', (statusError, stdout) => {
        if (statusError) {
            console.error(`Status check error: ${statusError}`);
            return res.status(500).json({ error: 'Failed to check git status' });
        }

        const hasChanges = stdout.trim().length > 0;

        let command = 'npm run deploy';
        if (hasChanges) {
            console.log('Changes detected, committing...');
            command = 'git add . && git commit -m "Admin updates" && npm run deploy';
        } else {
            console.log('No changes to commit, proceeding with deployment...');
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Deployment error: ${error}`);
                console.error(`stderr: ${stderr}`);
                return res.status(500).json({
                    error: 'Deploy failed',
                    details: stderr || error.message,
                    log: stdout
                });
            }
            console.log(`stdout: ${stdout}`);
            res.json({ success: true, log: stdout });
        });
    });
});

app.listen(port, () => {
    console.log(`Admin server running at http://localhost:${port}`);
});
