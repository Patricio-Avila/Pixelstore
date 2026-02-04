export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            product_types: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                }
            }
            suppliers: {
                Row: {
                    id: string
                    name: string
                    contact_name: string | null
                    phone: string | null
                    email: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    contact_name?: string | null
                    phone?: string | null
                    email?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    contact_name?: string | null
                    phone?: string | null
                    email?: string | null
                    notes?: string | null
                    created_at?: string
                }
            }
            promotions: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    type: 'percentage' | 'fixed'
                    value: number
                    starts_at: string | null
                    ends_at: string | null
                    active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    type: 'percentage' | 'fixed'
                    value: number
                    starts_at?: string | null
                    ends_at?: string | null
                    active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    type?: 'percentage' | 'fixed'
                    value?: number
                    starts_at?: string | null
                    ends_at?: string | null
                    active?: boolean
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    sku: string
                    name: string
                    brand: string | null
                    producer: string | null
                    product_type_id: string | null
                    description: string | null
                    cost: number
                    price: number
                    promotion_id: string | null
                    stock: number
                    allow_preorder: boolean
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    sku: string
                    name: string
                    brand?: string | null
                    producer?: string | null
                    product_type_id?: string | null
                    description?: string | null
                    cost: number
                    price: number
                    promotion_id?: string | null
                    stock?: number
                    allow_preorder?: boolean
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    sku?: string
                    name?: string
                    brand?: string | null
                    producer?: string | null
                    product_type_id?: string | null
                    description?: string | null
                    cost?: number
                    price?: number
                    promotion_id?: string | null
                    stock?: number
                    allow_preorder?: boolean
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            product_images: {
                Row: {
                    id: string
                    product_id: string | null
                    url: string
                    alt: string | null
                    order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    product_id?: string | null
                    url: string
                    alt?: string | null
                    order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string | null
                    url?: string
                    alt?: string | null
                    order?: number
                    created_at?: string
                }
            }
            customers: {
                Row: {
                    id: string
                    full_name: string
                    email: string | null
                    phone: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    full_name: string
                    email?: string | null
                    phone?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    email?: string | null
                    phone?: string | null
                    created_at?: string
                }
            }
            sales: {
                Row: {
                    id: string
                    external_number: string
                    customer_id: string | null
                    sale_date: string
                    total: number
                    payment_method: string
                    cash_session_id: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    external_number: string
                    customer_id?: string | null
                    sale_date?: string
                    total: number
                    payment_method?: string
                    cash_session_id?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    external_number?: string
                    customer_id?: string | null
                    sale_date?: string
                    total?: number
                    payment_method?: string
                    cash_session_id?: string | null
                    notes?: string | null
                    created_at?: string
                }
            }
            sale_items: {
                Row: {
                    id: string
                    sale_id: string | null
                    product_id: string | null
                    product_name: string
                    sku: string | null
                    quantity: number
                    unit_price: number
                    unit_cost: number
                    discount: number
                    total_line: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    sale_id?: string | null
                    product_id?: string | null
                    product_name: string
                    sku?: string | null
                    quantity: number
                    unit_price: number
                    unit_cost: number
                    discount?: number
                    total_line: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    sale_id?: string | null
                    product_id?: string | null
                    product_name?: string
                    sku?: string | null
                    quantity?: number
                    unit_price?: number
                    unit_cost?: number
                    discount?: number
                    total_line?: number
                    created_at?: string
                }
            }
        }
    }
}
