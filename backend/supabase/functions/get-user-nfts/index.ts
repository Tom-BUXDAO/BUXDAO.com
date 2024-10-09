// Type declarations to avoid import issues
declare function serve(handler: (req: Request) => Promise<Response>): void;
declare function createClient(url: string, key: string): any;

// Type declaration for Deno.env to avoid the "Cannot find name 'Deno'" error
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

// Use a different name for the URL to avoid conflicts
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
