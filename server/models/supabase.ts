import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

export function connect() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || '';
    return createClient(supabaseUrl, supabaseKey)
}