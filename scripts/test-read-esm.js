
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

if (!process.env.SUPABASE_URL) {
    console.log("Please set SUPABASE_URL and SUPABASE_KEY environment variables to run this script.");
} else {

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    async function testRead() {
        console.log('--- DIAGNÓSTICO DE CONEXIÓN ---');
        console.log(`URL: ${SUPABASE_URL}`);
        console.log(`Key (first 10 chars): ${SUPABASE_KEY.substring(0, 10)}...`);

        try {
            console.log('1. Intentando leer tabla "products"...');
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .limit(1);

            if (error) {
                console.error('❌ ERROR AL LEER:', error.message);
                console.error('Full Error:', JSON.stringify(error, null, 2));
            } else {
                console.log('✅ LECTURA EXITOSA');
                console.log(`Registros encontrados: ${data.length}`);
            }

        } catch (err) {
            console.error('❌ EXCEPCIÓN:', err);
        }
    }

    testRead();
}
