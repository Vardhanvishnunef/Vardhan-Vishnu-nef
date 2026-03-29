import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Using Service Role Key to bypass RLS

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials (specifically Service Role key) in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.join(__dirname, '../public/images/stories');

async function uploadFolder(localPath, remotePrefix) {
    const items = fs.readdirSync(localPath);
    for (const item of items) {
        const fullPath = path.join(localPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            await uploadFolder(fullPath, `${remotePrefix}/${item}`);
        } else if (item.endsWith('.webp') || item.endsWith('.jpg') || item.endsWith('.png')) {
            const remotePath = `${remotePrefix}/${item}`;
            
            try {
                const fileBuffer = fs.readFileSync(fullPath);
                // Simple mime mapping
                let mime = 'image/webp';
                if (item.endsWith('.jpg')) mime = 'image/jpeg';
                else if (item.endsWith('.png')) mime = 'image/png';

                console.log(`Uploading: ${remotePath}...`);
                
                const { error } = await supabase
                    .storage
                    .from('portfolio-images')
                    .upload(`stories/${remotePath}`, fileBuffer, {
                        contentType: mime,
                        upsert: true
                    });
                    
                if (error) {
                    console.error(`Error uploading ${item}:`, error.message);
                } else {
                    console.log(`Success: ${item}`);
                }
            } catch (err) {
                console.error(`Failed to process ${fullPath}:`, err.message);
            }
        }
    }
}

async function migrate() {
    console.log(`Searching for stories in ${IMAGES_DIR}...`);
    if (!fs.existsSync(IMAGES_DIR)) return console.log("No images found.");
    
    const stories = fs.readdirSync(IMAGES_DIR);
    for (const story of stories) {
        const storyPath = path.join(IMAGES_DIR, story);
        if (fs.statSync(storyPath).isDirectory()) {
             await uploadFolder(storyPath, story);
        }
    }
    console.log("Migration complete!");
}

migrate();
