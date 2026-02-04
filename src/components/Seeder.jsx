import { useState } from 'react';
import { supabase } from '../lib/supabase';

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
        image: '/images/ps5_console.png',
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
        image: '/images/switch_oled.png',
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
        image: '/images/elden_ring.png',
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
        image: '/images/dualsense_controller.png',
        type: 'Accesorios'
    }
];

export default function Seeder() {
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [log, setLog] = useState([]);

    const addLog = (msg) => setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const runSeed = async () => {
        setStatus('loading');
        setLog([]);
        addLog('Iniciando carga de datos...');

        try {
            // 1. Insert Product Types
            addLog('Verificando tipos de productos...');
            const typeMap = {};

            for (const type of SAMPLE_TYPES) {
                // Upsert based on name
                const { data, error } = await supabase
                    .from('product_types')
                    .select('id')
                    .eq('name', type.name)
                    .single();

                let typeId;
                if (data) {
                    typeId = data.id;
                    addLog(`Tipo existente encontrado: ${type.name}`);
                } else {
                    const { data: newType, error: insertError } = await supabase
                        .from('product_types')
                        .insert(type)
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    typeId = newType.id;
                    addLog(`Nuevo tipo creado: ${type.name}`);
                }
                typeMap[type.name] = typeId;
            }

            // 2. Insert Products
            addLog('Insertando productos...');
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

                const { data: existingProd } = await supabase
                    .from('products').select('id').eq('sku', prod.sku).single();

                let productId;
                if (existingProd) {
                    productId = existingProd.id;
                    addLog(`Producto ya existe (SKU: ${prod.sku}), saltando...`);
                } else {
                    const { data: newProd, error: prodError } = await supabase
                        .from('products')
                        .insert(productData)
                        .select()
                        .single();

                    if (prodError) throw prodError;
                    productId = newProd.id;
                    addLog(`Producto creado: ${prod.name}`);
                }

                // 3. Insert Image
                const { count } = await supabase.from('product_images').select('*', { count: 'exact', head: true }).eq('product_id', productId);

                if (count === 0) {
                    const { error: imgError } = await supabase
                        .from('product_images')
                        .insert({
                            product_id: productId,
                            url: prod.image,
                            alt: prod.name,
                            order: 1
                        });
                    if (imgError) throw imgError;
                    addLog(`Imagen asignada a: ${prod.name}`);
                }
            }

            addLog('¡Carga de datos completada con éxito!');
            setStatus('success');
        } catch (err) {
            console.error(err);
            addLog(`ERROR: ${err.message}`);
            setStatus('error');
        }
    };

    return (
        <div style={{ padding: '2rem', background: '#1e293b', borderRadius: '12px', color: 'white' }}>
            <h2>🌱 Database Seeder</h2>
            <p>Este componente insertará datos de prueba (Juegos, Consolas).</p>

            <button
                onClick={runSeed}
                disabled={status === 'loading'}
                className="btn btn-primary"
                style={{ marginTop: '1rem', backgroundColor: status === 'error' ? '#ef4444' : '#22c55e' }}
            >
                {status === 'loading' ? 'Insertando...' : 'Insertar Datos de Prueba'}
            </button>

            <div style={{ marginTop: '1rem', background: '#0f172a', padding: '1rem', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace' }}>
                {log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
        </div>
    );
}
