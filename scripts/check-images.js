
import { createClient } from '@supabase/supabase-js';

// Credentials should be loaded from environment variables in a real scenario.
// For this local debug script, we assume the user has configured their environment or will provide keys securely.
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
    console.log("Fetching products with images...");
    if (!process.env.SUPABASE_URL) {
        console.log("Skipping actual fetch because credentials are not set in process.env");
        return;
    }

    const { data, error } = await supabase
        .from('products')
        .select(`
            name,
            product_images ( url )
        `)
        .limit(5);

    if (error) {
        console.error("Error fetching data:", error);
    } else {
        console.log("Data received. Checking first image...");
        if (data.length > 0 && data[0].product_images && data[0].product_images.length > 0) {
            const url = data[0].product_images[0].url;
            console.log("Testing URL:", url);
            try {
                const res = await fetch(url);
                console.log("Fetch Status:", res.status);
                console.log("Content-Type:", res.headers.get('content-type'));
            } catch (err) {
                console.error("Fetch failed:", err.message);
            }
        }
    }
}

checkImages();
