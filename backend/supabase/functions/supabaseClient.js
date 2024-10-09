import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
import { config } from 'https://deno.land/x/dotenv@v3.2.2/mod.ts';

// Load environment variables
config();

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
