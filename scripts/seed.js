
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

if (!process.env.SUPABASE_URL) {
    console.log("Please set SUPABASE_URL and SUPABASE_KEY environment variables to run this script.");
    process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SAMPLE_TYPES = [
    { name: 'Consolas', description: 'Consolas de videojuegos de última generación' },
    { name: 'Videojuegos', description: 'Juegos físicos para diversas plataformas' },
    { name: 'Accesorios', description: 'Controles, cables y más' }
];

const SAMPLE_PRODUCTS = [
    {
        sku: 'PS5-DIGITAL',
        name: 'PlayStation 5 Edición Digital',
        brand: 'Sony',
        description: 'Consola PS5 sin lector de discos.',
        cost: 399.99,
        price: 499.99,
        stock: 10,
        status: 'available',
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000',
        type: 'Consolas'
    },
    {
        sku: 'NSW-OLED-WHT',
        name: 'Nintendo Switch OLED Modelo Blanco',
        brand: 'Nintendo',
        description: 'Pantalla OLED de 7 pulgadas.',
        cost: 280.00,
        price: 349.99,
        stock: 15,
        status: 'available',
        image: 'https://images.unsplash.com/photo-1629814498308-4122d2f78864?auto=format&fit=crop&q=80&w=1000',
        type: 'Consolas'
    },
    {
        sku: 'GAME-ELDEN-PS5',
        name: 'Elden Ring (PS5)',
        brand: 'Bandai Namco',
        description: 'GOTY 2022. RPG de acción.',
        cost: 40.00,
        price: 59.99,
        stock: 50,
        status: 'available',
        image: 'https://images.unsplash.com/photo-1678761405026-6816c4c924bc?auto=format&fit=crop&q=80&w=1000',
        type: 'Videojuegos'
    },
    {
        sku: 'ACC-PS5-CTRL',
        name: 'DualSense Wireless Controller',
        brand: 'Sony',
        description: 'Control oficial para PS5 color blanco.',
        cost: 45.00,
        price: 69.99,
        stock: 25,
        status: 'available',
        image: 'https://images.unsplash.com/photo-1593305841991-05c297bb45ec?auto=format&fit=crop&q=80&w=1000',
        type: 'Accesorios'
    }
];

async function runSeed() {
    console.log('🌱 Iniciando seed...');

    try {
        // 1. Types
        const typeMap = {};
        for (const type of SAMPLE_TYPES) {
            const { data } = await supabase.from('product_types').select('id').eq('name', type.name).single();
            if (data) {
                typeMap[type.name] = data.id;
            } else {
                const { data: newType, error } = await supabase.from('product_types').insert(type).select().single();
                if (error) throw error;
                typeMap[type.name] = newType.id;
            }
        }

        // 2. Products
        for (const prod of SAMPLE_PRODUCTS) {
            const productData = {
                sku: prod.sku,
                name: prod.name,
                brand: prod.brand,
                description: prod.description,
                cost: prod.cost,
                price: prod.price,
                stock: prod.stock,
                status: prod.status,
                product_type_id: typeMap[prod.type]
            };

            const { data: existing } = await supabase.from('products').select('id').eq('sku', prod.sku).single();
            let productId;

            if (existing) {
                productId = existing.id;
            } else {
                const { data: newProd, error } = await supabase.from('products').insert(productData).select().single();
                if (error) throw error;
                productId = newProd.id;
                console.log(`Creado: ${prod.name}`);
            }

            // Image
            const { count } = await supabase.from('product_images').select('*', { count: 'exact', head: true }).eq('product_id', productId);
            if (count === 0) {
                await supabase.from('product_images').insert({ product_id: productId, url: prod.image });
            }
        }

        console.log('✅ Base de datos poblada exitosamente.');
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
}

runSeed();
