import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials (specifically Service Role key) in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.join(__dirname, '../public/images');

async function uploadFolder(localPath, remotePrefix) {
    if (!fs.existsSync(localPath)) return;
    const items = fs.readdirSync(localPath);
    for (const item of items) {
        const fullPath = path.join(localPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            await uploadFolder(fullPath, remotePrefix ? `${remotePrefix}/${item}` : item);
        } else if ((item.endsWith('.webp') || item.endsWith('.jpg') || item.endsWith('.png')) && item !== 'logo.webp') {
            const remotePath = remotePrefix ? `${remotePrefix}/${item}` : item;
            
            try {
                const fileBuffer = fs.readFileSync(fullPath);
                let mime = 'image/webp';
                if (item.endsWith('.jpg')) mime = 'image/jpeg';
                else if (item.endsWith('.png')) mime = 'image/png';
                console.log(`Uploading: ${remotePath} (${fileBuffer.length} bytes)...`);
                
                const { error } = await supabase
                    .storage
                    .from('portfolio-images')
                    .upload(`${remotePath}`, fileBuffer, {
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
    console.log(`Migrating all content in ${IMAGES_DIR}...`);
    await uploadFolder(IMAGES_DIR, "");
    console.log("Migration complete!");
}

migrate();
