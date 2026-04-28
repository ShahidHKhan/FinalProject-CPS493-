import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

export function connect() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || '';
    return createClient(supabaseUrl, supabaseKey)
}

// Helper: convert snake_case keys to camelCase for a plain object (shallow)
export function toCamelCase<T = any>(row: Record<string, any>): T {
    if (!row || typeof row !== 'object') return row as unknown as T
    const out: Record<string, any> = {}
    for (const key of Object.keys(row)) {
        const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
        out[camel] = row[key]
    }
    return out as unknown as T
}

// Helper: convert camelCase keys to snake_case for a plain object (shallow)
export function toSnakeCase<T = any>(obj: Record<string, any>): T {
    if (!obj || typeof obj !== 'object') return obj as unknown as T
    const out: Record<string, any> = {}
    for (const key of Object.keys(obj)) {
        const snake = key.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`)
        out[snake] = obj[key]
    }
    return out as unknown as T
}

// Helper: filter an object to only allowed keys
export function filterKeys<T = any>(obj: Record<string, any>, keys: string[]): Partial<T> {
    const out: Record<string, any> = {}
    for (const k of keys) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            out[k] = obj[k]
        }
    }
    return out as Partial<T>
}