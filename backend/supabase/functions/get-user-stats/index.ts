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
const supabaseUrlForStats = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '';
const supabaseKeyForStats = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabaseForStats = createClient(supabaseUrlForStats, supabaseKeyForStats);

serve(async (req) => {
  try {
    // Extract user ID from the request, e.g., from a query parameter or JWT token
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Fetch user stats from your database
    const { data, error } = await supabaseForStats
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
