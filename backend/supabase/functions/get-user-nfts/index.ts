import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const supabaseUrlForNFTs = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '';
const supabaseKeyForNFTs = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabaseForNFTs = createClient(supabaseUrlForNFTs, supabaseKeyForNFTs);

serve(async (req) => {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabaseForNFTs
      .from('nfts')
      .select('*')
      .eq('owner_id', user_id);

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
