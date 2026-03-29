import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const githubToken = process.env.VITE_GITHUB_TOKEN;

async function verify() {
    console.log("--- Connectivity Check ---");
    
    // Supabase check
    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Supabase credentials missing in .env.local");
    } else {
        try {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data, error } = await supabase.storage.from('portfolio-images').list('', { limit: 5 });
            if (error) {
                console.error("❌ Supabase Storage error:", error.message);
            } else {
                console.log("✅ Supabase Storage CONNECTED. Found", data ? data.length : 0, "items.");
            }
        } catch (err) {
            console.error("❌ Supabase Exception:", err.message);
        }
    }

    // GitHub check
    if (!githubToken) {
        console.error("❌ GitHub Token missing in env (VITE_GITHUB_TOKEN)");
    } else {
        try {
            const res = await fetch('https://api.github.com/user', {
                headers: { 'Authorization': `token ${githubToken}` }
            });
            if (res.ok) {
                const user = await res.json();
                console.log("✅ GitHub API CONNECTED. Authenticated as:", user.login);
            } else {
                console.error("❌ GitHub API error:", res.status, res.statusText);
            }
        } catch (err) {
            console.error("❌ GitHub Exception:", err.message);
        }
    }
}

verify();
