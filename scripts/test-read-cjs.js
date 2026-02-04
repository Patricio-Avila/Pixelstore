
// CommonJS format for immediate execution
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

if (!process.env.SUPABASE_URL) {
    console.log("Please set SUPABASE_URL and SUPABASE_KEY environment variables to run this script.");
    process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRead() {
    console.log('--- DIAGNÓSTICO DE CONEXIÓN ---');
    console.log(`URL: ${SUPABASE_URL}`);
    console.log(`Key (first 10 chars): ${SUPABASE_KEY.substring(0, 10)}...`);

    try {
        // Intentar leer la tabla 'products'
        console.log('1. Intentando leer tabla "products"...');
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ ERROR AL LEER:', error.message);
            console.error('Code:', error.code);
            console.error('Hint:', error.hint);
            console.error('Details:', error.details);
        } else {
            console.log('✅ LECTURA EXITOSA');
            console.log(`Registros encontrados: ${data.length}`);
            if (data.length > 0) console.log('Ejemplo:', data[0].name);
        }

    } catch (err) {
        console.error('❌ EXCEPCIÓN:', err);
    }
}

testRead();
